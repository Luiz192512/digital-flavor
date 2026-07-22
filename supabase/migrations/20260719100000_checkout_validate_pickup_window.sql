-- BUG-14: a RPC checkout aceitava qualquer pickup_time. Agora valida contra a
-- janela de funcionamento da cantina (open_from/open_until). Quando a cantina
-- não define horário (colunas nulas), a validação é no-op — comportamento
-- inalterado para a Cantina Central do piloto.

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
  v_open_from time;
  v_open_until time;
begin
  if v_customer is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  if p_pickup_time is null then
    raise exception 'pickup_time_required' using errcode = '22023';
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

    if v_canteen is null then
      v_canteen := v_item_canteen;

      select active, open_from, open_until
        into v_active, v_open_from, v_open_until
        from public.canteens
       where id = v_canteen;

      if v_active is null or not v_active then
        raise exception 'canteen_inactive:%', v_canteen using errcode = '22023';
      end if;

      -- Janela de retirada: só valida quando a cantina define horário.
      if v_open_from is not null and v_open_until is not null
         and (p_pickup_time < v_open_from or p_pickup_time > v_open_until) then
        raise exception 'pickup_outside_hours' using errcode = '22023';
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
