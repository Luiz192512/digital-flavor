-- Modelo v3, passo 2/4: escopo de cantina em products e orders.
-- Aditivo primeiro (coluna nullable), backfill para a Cantina Central,
-- e so entao a restricao (NOT NULL) — a sequencia sobrevive a um banco
-- com dados. inventory herda a cantina via products (relacao 1:1).

alter table public.products
  add column if not exists canteen_id uuid references public.canteens(id) on delete restrict;

update public.products
set canteen_id = '00000000-0000-0000-0000-0000000c0001'
where canteen_id is null;

alter table public.products
  alter column canteen_id set not null;

create index if not exists products_canteen_idx
on public.products(canteen_id);

alter table public.orders
  add column if not exists canteen_id uuid references public.canteens(id) on delete restrict;

update public.orders
set canteen_id = '00000000-0000-0000-0000-0000000c0001'
where canteen_id is null;

alter table public.orders
  alter column canteen_id set not null;

create index if not exists orders_canteen_status_created_idx
on public.orders(canteen_id, status, created_at);
