create table public.customer_preferences (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  phone text not null default '',
  classroom text not null default '',
  shift text not null default 'manha' check (shift in ('manha', 'tarde', 'noite')),
  quick_pickup boolean not null default true,
  order_updates boolean not null default true,
  receipt_email boolean not null default true,
  default_pickup_time time not null default '10:30',
  updated_at timestamptz not null default now()
);

create table public.customer_payment_methods (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  method public.payment_method not null,
  label text not null,
  detail text not null,
  preferred boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index customer_payment_methods_single_preferred_idx
on public.customer_payment_methods(profile_id)
where preferred = true and active = true;

create index customer_payment_methods_profile_idx
on public.customer_payment_methods(profile_id);

alter table public.customer_preferences enable row level security;
alter table public.customer_payment_methods enable row level security;

create policy "customer_preferences_select_own"
on public.customer_preferences
for select
to authenticated
using (profile_id = (select auth.uid()));

create policy "customer_preferences_insert_own"
on public.customer_preferences
for insert
to authenticated
with check (profile_id = (select auth.uid()));

create policy "customer_preferences_update_own"
on public.customer_preferences
for update
to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy "customer_payment_methods_select_own"
on public.customer_payment_methods
for select
to authenticated
using (profile_id = (select auth.uid()));

create policy "customer_payment_methods_insert_own"
on public.customer_payment_methods
for insert
to authenticated
with check (profile_id = (select auth.uid()));

create policy "customer_payment_methods_update_own"
on public.customer_payment_methods
for update
to authenticated
using (profile_id = (select auth.uid()))
with check (profile_id = (select auth.uid()));

create policy "customer_payment_methods_delete_own"
on public.customer_payment_methods
for delete
to authenticated
using (profile_id = (select auth.uid()));

update public.products
set
  name = 'Combo intervalo',
  description = 'Sanduiche, fruta e suco com desconto para pedido antecipado.',
  updated_at = now()
where id = '00000000-0000-0000-0000-000000000004';

update public.products
set
  description = 'Pao integral, frango, cenoura e alface. Ideal para retirada rapida.',
  updated_at = now()
where id = '00000000-0000-0000-0000-000000000001';

update public.products
set
  description = 'Suco de laranja sem acucar, gelado e pronto para o intervalo.',
  updated_at = now()
where id = '00000000-0000-0000-0000-000000000002';

update public.products
set
  description = 'Frutas selecionadas do dia em porcao individual.',
  updated_at = now()
where id = '00000000-0000-0000-0000-000000000003';

update public.products
set
  description = 'Porcao assada e pronta para retirada no intervalo.',
  updated_at = now()
where id = '00000000-0000-0000-0000-000000000005';
