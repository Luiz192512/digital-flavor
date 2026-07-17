-- Modelo v3, passo 4/4: RPC de checkout atomica + realtime.
-- Preco, disponibilidade e cantina sao decididos exclusivamente aqui; o
-- cliente envia apenas product_id + quantity. Anti-oversell: checagem e
-- decremento na MESMA instrucao (UPDATE condicional) sob lock de linha,
-- na mesma transacao que cria o pedido — duas compras concorrentes do
-- ultimo item serializam e a segunda recebe insufficient_stock.

create or replace function public.checkout(
  p_items jsonb,
  p_pickup_time time,
  p_payment_method public.payment_method
)
returns table (order_id uuid, pickup_code text, total_cents integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer uuid := (select auth.uid());
  v_customer_name text;
  v_canteen uuid;
  v_order_id uuid;
  v_pickup_code text;
  v_total integer := 0;
  v_item record;
  v_unit integer;
  v_name text;
  v_active boolean;
  v_item_canteen uuid;
  v_updated integer;
begin
  if v_customer is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  select full_name into v_customer_name
  from public.profiles
  where id = v_customer;

  if v_customer_name is null then
    raise exception 'profile_not_found' using errcode = 'P0002';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'empty_cart' using errcode = '22023';
  end if;

  v_pickup_code := upper(substr(md5(gen_random_uuid()::text), 1, 6));

  -- Itens repetidos sao agregados por produto antes da baixa.
  for v_item in
    select
      (element ->> 'product_id')::uuid as pid,
      sum((element ->> 'quantity')::integer) as qty
    from jsonb_array_elements(p_items) element
    group by 1
  loop
    if v_item.qty is null or v_item.qty <= 0 then
      raise exception 'invalid_quantity' using errcode = '22023';
    end if;

    select price_cents, name, active, canteen_id
      into v_unit, v_name, v_active, v_item_canteen
      from public.products
     where id = v_item.pid;

    if v_unit is null then
      raise exception 'product_not_found:%', v_item.pid using errcode = 'P0002';
    end if;

    if not v_active then
      raise exception 'product_inactive:%', v_item.pid using errcode = '22023';
    end if;

    -- Um pedido pertence a UMA cantina (regra de marketplace).
    if v_canteen is null then
      v_canteen := v_item_canteen;

      if not exists (
        select 1 from public.canteens
        where id = v_canteen and active = true
      ) then
        raise exception 'canteen_inactive:%', v_canteen using errcode = '22023';
      end if;

      insert into public.orders
        (customer_id, customer_name, status, pickup_time, pickup_code,
         total_cents, payment_method, payment_status, canteen_id)
      values
        (v_customer, v_customer_name, 'queued', p_pickup_time, v_pickup_code,
         0, p_payment_method, 'pending', v_canteen)
      returning id into v_order_id;
    elsif v_item_canteen <> v_canteen then
      raise exception 'mixed_canteens' using errcode = '22023';
    end if;

    -- Guarda anti-oversell: checa e decrementa numa unica instrucao atomica.
    update public.inventory
       set quantity = quantity - v_item.qty,
           updated_at = now()
     where product_id = v_item.pid
       and (quantity - reserved) >= v_item.qty;
    get diagnostics v_updated = row_count;

    if v_updated = 0 then
      raise exception 'insufficient_stock:%', v_item.pid using errcode = 'P0001';
    end if;

    insert into public.order_items
      (order_id, product_id, product_name, unit_price_cents, quantity, total_cents)
    values
      (v_order_id, v_item.pid, v_name, v_unit, v_item.qty, v_unit * v_item.qty);

    insert into public.stock_movements
      (product_id, actor_id, movement_type, units, reason)
    values
      (v_item.pid, v_customer, 'consume', v_item.qty, 'checkout ' || v_order_id::text);

    v_total := v_total + v_unit * v_item.qty;
  end loop;

  update public.orders set total_cents = v_total where id = v_order_id;

  insert into public.payments (order_id, method, status, amount_cents)
  values (v_order_id, p_payment_method, 'pending', v_total);

  return query select v_order_id, v_pickup_code, v_total;
end;
$$;

revoke all on function public.checkout(jsonb, time, public.payment_method) from public, anon;
grant execute on function public.checkout(jsonb, time, public.payment_method) to authenticated;

-- Tempo real do estoque e da fila de pedidos.
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public' and tablename = 'inventory'
    ) then
      alter publication supabase_realtime add table public.inventory;
    end if;

    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public' and tablename = 'orders'
    ) then
      alter publication supabase_realtime add table public.orders;
    end if;
  end if;
end $$;
