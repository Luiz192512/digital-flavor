create extension if not exists pgcrypto;

create type public.app_role as enum ('customer', 'employee', 'manager', 'admin');
create type public.product_category as enum ('lanche', 'bebida', 'fruta', 'combo');
create type public.order_status as enum (
  'draft',
  'submitted',
  'queued',
  'preparing',
  'ready',
  'completed',
  'cancelled'
);
create type public.payment_method as enum ('pix', 'card', 'cash');
create type public.payment_status as enum ('pending', 'approved', 'refused', 'refunded');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role public.app_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create schema if not exists private;

create or replace function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    'customer'
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function private.handle_new_auth_user();

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null,
  category public.product_category not null,
  price_cents integer not null check (price_cents >= 0),
  preparation_minutes integer not null default 5 check (preparation_minutes >= 0),
  sustainability_score integer not null default 75 check (sustainability_score between 0 and 100),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null unique references public.products(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  reserved integer not null default 0 check (reserved >= 0),
  reorder_point integer not null default 0 check (reorder_point >= 0),
  expires_at timestamptz,
  updated_at timestamptz not null default now(),
  constraint inventory_reserved_lte_quantity check (reserved <= quantity)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles(id) on delete restrict,
  customer_name text not null,
  status public.order_status not null default 'submitted',
  pickup_time time not null,
  pickup_code text not null,
  total_cents integer not null check (total_cents >= 0),
  payment_method public.payment_method not null,
  payment_status public.payment_status not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  unit_price_cents integer not null check (unit_price_cents >= 0),
  quantity integer not null check (quantity > 0),
  total_cents integer not null check (total_cents >= 0),
  created_at timestamptz not null default now()
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  method public.payment_method not null,
  status public.payment_status not null default 'pending',
  amount_cents integer not null check (amount_cents >= 0),
  provider_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  actor_id uuid references public.profiles(id) on delete set null,
  movement_type text not null check (movement_type in ('reserve', 'consume', 'release', 'restock', 'adjust')),
  units integer not null check (units > 0),
  reason text not null,
  created_at timestamptz not null default now()
);

create index profiles_role_idx on public.profiles(role);
create index products_category_idx on public.products(category);
create index inventory_product_idx on public.inventory(product_id);
create index orders_customer_idx on public.orders(customer_id);
create index orders_status_created_idx on public.orders(status, created_at);
create index order_items_order_idx on public.order_items(order_id);
create index stock_movements_product_created_idx on public.stock_movements(product_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.inventory enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.stock_movements enable row level security;

create policy "profiles_select_own_or_management"
on public.profiles
for select
to authenticated
using (
  (select auth.uid()) = id
  or exists (
    select 1 from public.profiles manager_profile
    where manager_profile.id = (select auth.uid())
      and manager_profile.role in ('employee', 'manager', 'admin')
  )
);

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy "profiles_update_own_or_admin"
on public.profiles
for update
to authenticated
using (
  (select auth.uid()) = id
  or exists (
    select 1 from public.profiles admin_profile
    where admin_profile.id = (select auth.uid())
      and admin_profile.role = 'admin'
  )
)
with check (
  (select auth.uid()) = id
  or exists (
    select 1 from public.profiles admin_profile
    where admin_profile.id = (select auth.uid())
      and admin_profile.role = 'admin'
  )
);

create policy "products_select_authenticated"
on public.products
for select
to authenticated
using (
  active = true
  or exists (
    select 1 from public.profiles staff_profile
    where staff_profile.id = (select auth.uid())
      and staff_profile.role in ('employee', 'manager', 'admin')
  )
);

create policy "products_write_management"
on public.products
for all
to authenticated
using (
  exists (
    select 1 from public.profiles staff_profile
    where staff_profile.id = (select auth.uid())
      and staff_profile.role in ('manager', 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles staff_profile
    where staff_profile.id = (select auth.uid())
      and staff_profile.role in ('manager', 'admin')
  )
);

create policy "inventory_select_authenticated"
on public.inventory
for select
to authenticated
using (true);

create policy "inventory_write_management"
on public.inventory
for all
to authenticated
using (
  exists (
    select 1 from public.profiles staff_profile
    where staff_profile.id = (select auth.uid())
      and staff_profile.role in ('manager', 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles staff_profile
    where staff_profile.id = (select auth.uid())
      and staff_profile.role in ('manager', 'admin')
  )
);

create policy "orders_select_owner_or_staff"
on public.orders
for select
to authenticated
using (
  customer_id = (select auth.uid())
  or exists (
    select 1 from public.profiles staff_profile
    where staff_profile.id = (select auth.uid())
      and staff_profile.role in ('employee', 'manager', 'admin')
  )
);

create policy "orders_insert_owner"
on public.orders
for insert
to authenticated
with check (customer_id = (select auth.uid()));

create policy "orders_update_staff"
on public.orders
for update
to authenticated
using (
  exists (
    select 1 from public.profiles staff_profile
    where staff_profile.id = (select auth.uid())
      and staff_profile.role in ('employee', 'manager', 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles staff_profile
    where staff_profile.id = (select auth.uid())
      and staff_profile.role in ('employee', 'manager', 'admin')
  )
);

create policy "order_items_select_owner_or_staff"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1 from public.orders orders_for_item
    where orders_for_item.id = order_items.order_id
      and (
        orders_for_item.customer_id = (select auth.uid())
        or exists (
          select 1 from public.profiles staff_profile
          where staff_profile.id = (select auth.uid())
            and staff_profile.role in ('employee', 'manager', 'admin')
        )
      )
  )
);

create policy "order_items_insert_owner"
on public.order_items
for insert
to authenticated
with check (
  exists (
    select 1 from public.orders orders_for_item
    where orders_for_item.id = order_items.order_id
      and orders_for_item.customer_id = (select auth.uid())
  )
);

create policy "payments_select_owner_or_staff"
on public.payments
for select
to authenticated
using (
  exists (
    select 1 from public.orders payment_order
    where payment_order.id = payments.order_id
      and (
        payment_order.customer_id = (select auth.uid())
        or exists (
          select 1 from public.profiles staff_profile
          where staff_profile.id = (select auth.uid())
            and staff_profile.role in ('employee', 'manager', 'admin')
        )
      )
  )
);

create policy "payments_insert_owner"
on public.payments
for insert
to authenticated
with check (
  exists (
    select 1 from public.orders payment_order
    where payment_order.id = payments.order_id
      and payment_order.customer_id = (select auth.uid())
  )
);

create policy "payments_update_staff"
on public.payments
for update
to authenticated
using (
  exists (
    select 1 from public.profiles staff_profile
    where staff_profile.id = (select auth.uid())
      and staff_profile.role in ('employee', 'manager', 'admin')
  )
)
with check (
  exists (
    select 1 from public.profiles staff_profile
    where staff_profile.id = (select auth.uid())
      and staff_profile.role in ('employee', 'manager', 'admin')
  )
);

create policy "stock_movements_select_staff"
on public.stock_movements
for select
to authenticated
using (
  exists (
    select 1 from public.profiles staff_profile
    where staff_profile.id = (select auth.uid())
      and staff_profile.role in ('employee', 'manager', 'admin')
  )
);

create policy "stock_movements_insert_staff"
on public.stock_movements
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles staff_profile
    where staff_profile.id = (select auth.uid())
      and staff_profile.role in ('employee', 'manager', 'admin')
  )
);

insert into public.products
  (id, name, description, category, price_cents, preparation_minutes, sustainability_score, active)
values
  ('00000000-0000-0000-0000-000000000001', 'Sanduiche natural', 'Pao integral, frango, cenoura e alface.', 'lanche', 1290, 8, 92, true),
  ('00000000-0000-0000-0000-000000000002', 'Suco integral', 'Suco de laranja sem acucar.', 'bebida', 690, 2, 78, true),
  ('00000000-0000-0000-0000-000000000003', 'Salada de frutas', 'Frutas do dia com controle de validade.', 'fruta', 890, 4, 96, true),
  ('00000000-0000-0000-0000-000000000004', 'Combo responsavel', 'Sanduiche, fruta e suco para pedido antecipado.', 'combo', 2190, 10, 94, true),
  ('00000000-0000-0000-0000-000000000005', 'Pao de queijo', 'Porcao assada em lotes pequenos.', 'lanche', 590, 6, 71, true);

insert into public.inventory
  (product_id, quantity, reserved, reorder_point, expires_at)
values
  ('00000000-0000-0000-0000-000000000001', 36, 8, 12, now() + interval '1 day'),
  ('00000000-0000-0000-0000-000000000002', 52, 11, 18, now() + interval '4 days'),
  ('00000000-0000-0000-0000-000000000003', 19, 5, 10, now() + interval '8 hours'),
  ('00000000-0000-0000-0000-000000000004', 22, 7, 8, now() + interval '1 day'),
  ('00000000-0000-0000-0000-000000000005', 8, 3, 14, now() + interval '6 hours');
