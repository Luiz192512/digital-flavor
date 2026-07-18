-- Tamanho da fila por cantina para a home de descoberta.
-- SECURITY DEFINER de proposito: a RLS de orders so deixa o cliente ver os
-- proprios pedidos, mas o TAMANHO agregado da fila e informacao publica do
-- marketplace (nenhum dado de pedido individual e exposto).

create or replace function public.canteen_queue_sizes()
returns table (canteen_id uuid, queue_size integer)
language sql
stable
security definer
set search_path = public
as $$
  select c.id, count(o.id) filter (where o.status in ('queued', 'preparing'))::integer
  from public.canteens c
  left join public.orders o on o.canteen_id = c.id
  where c.active = true
  group by c.id;
$$;

revoke all on function public.canteen_queue_sizes() from public, anon;
grant execute on function public.canteen_queue_sizes() to authenticated;
