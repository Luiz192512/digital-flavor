-- RPC de ajuste de estoque do painel de gestao.
-- SECURITY INVOKER de proposito: o UPDATE em inventory passa pela RLS
-- (somente gerente da cantina do produto ou admin da plataforma), e o
-- incremento e atomico no servidor (nunca read-modify-write no cliente).
-- A guarda `quantity + p_units >= reserved` impede baixar estoque abaixo
-- do reservado, na mesma instrucao.

create or replace function public.adjust_stock(
  p_product_id uuid,
  p_units integer,
  p_reason text default 'ajuste manual'
)
returns table (quantity integer, reserved integer)
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_updated integer;
begin
  if p_units is null or p_units = 0 then
    raise exception 'invalid_units' using errcode = '22023';
  end if;

  update public.inventory inv
     set quantity = inv.quantity + p_units,
         updated_at = now()
   where inv.product_id = p_product_id
     and inv.quantity + p_units >= inv.reserved;
  get diagnostics v_updated = row_count;

  -- 0 linhas = sem permissao (RLS de gerente) OU ajuste abaixo do reservado.
  if v_updated = 0 then
    raise exception 'stock_adjust_denied_or_insufficient' using errcode = 'P0001';
  end if;

  insert into public.stock_movements (product_id, actor_id, movement_type, units, reason)
  values (
    p_product_id,
    (select auth.uid()),
    case when p_units > 0 then 'restock' else 'adjust' end,
    abs(p_units),
    p_reason
  );

  return query
    select inv.quantity, inv.reserved
    from public.inventory inv
    where inv.product_id = p_product_id;
end;
$$;

revoke all on function public.adjust_stock(uuid, integer, text) from public, anon;
grant execute on function public.adjust_stock(uuid, integer, text) to authenticated;
