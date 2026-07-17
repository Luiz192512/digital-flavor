-- Modelo v3 (marketplace multi-cantina), passo 1/4: entidades de cantina.
-- Cria canteens e canteen_staff, helpers de autorizacao sem recursao de RLS,
-- e migra o staff global (profiles.role employee/manager) para vinculo por
-- cantina. A partir daqui profiles.role significa apenas customer | admin
-- (admin = dono da plataforma); os valores employee/manager permanecem no
-- enum app_role por compatibilidade, mas deixam de ser usados.

create table public.canteens (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  location text not null default '',
  open_from time,
  open_until time,
  prep_minutes integer not null default 10 check (prep_minutes >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.canteens (id, slug, name, location, prep_minutes, active)
values (
  '00000000-0000-0000-0000-0000000c0001',
  'cantina-central',
  'Cantina Central',
  'Bloco 7',
  8,
  true
)
on conflict (id) do nothing;

create table public.canteen_staff (
  canteen_id uuid not null references public.canteens(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('employee', 'manager')),
  created_at timestamptz not null default now(),
  primary key (canteen_id, profile_id)
);

create index canteen_staff_profile_idx on public.canteen_staff(profile_id);

-- Helpers security definer: policies que consultam outras tabelas protegidas
-- por RLS (ou a propria tabela) causam recursao/custo por linha; as funcoes
-- abaixo leem com row_security desligado e sao estaveis por consulta.
create schema if not exists private;

create or replace function private.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

create or replace function private.is_canteen_staff(target_canteen uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.canteen_staff
    where profile_id = (select auth.uid())
      and canteen_id = target_canteen
  );
$$;

create or replace function private.is_canteen_manager(target_canteen uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.canteen_staff
    where profile_id = (select auth.uid())
      and canteen_id = target_canteen
      and role = 'manager'
  );
$$;

revoke all on function private.is_platform_admin() from public, anon;
revoke all on function private.is_canteen_staff(uuid) from public, anon;
revoke all on function private.is_canteen_manager(uuid) from public, anon;
grant execute on function private.is_platform_admin() to authenticated;
grant execute on function private.is_canteen_staff(uuid) to authenticated;
grant execute on function private.is_canteen_manager(uuid) to authenticated;

alter table public.canteens enable row level security;
alter table public.canteen_staff enable row level security;

create policy "canteens_select_active_or_staff"
on public.canteens
for select
to authenticated
using (
  active = true
  or private.is_canteen_staff(id)
  or private.is_platform_admin()
);

create policy "canteens_insert_admin"
on public.canteens
for insert
to authenticated
with check (private.is_platform_admin());

create policy "canteens_update_admin"
on public.canteens
for update
to authenticated
using (private.is_platform_admin())
with check (private.is_platform_admin());

create policy "canteens_delete_admin"
on public.canteens
for delete
to authenticated
using (private.is_platform_admin());

create policy "canteen_staff_select_own_or_management"
on public.canteen_staff
for select
to authenticated
using (
  profile_id = (select auth.uid())
  or private.is_canteen_manager(canteen_id)
  or private.is_platform_admin()
);

create policy "canteen_staff_insert_admin"
on public.canteen_staff
for insert
to authenticated
with check (private.is_platform_admin());

create policy "canteen_staff_update_admin"
on public.canteen_staff
for update
to authenticated
using (private.is_platform_admin())
with check (private.is_platform_admin());

create policy "canteen_staff_delete_admin"
on public.canteen_staff
for delete
to authenticated
using (private.is_platform_admin());

-- Migra o staff global existente para a Cantina Central e rebaixa o papel
-- global para customer (admin da plataforma permanece admin).
insert into public.canteen_staff (canteen_id, profile_id, role)
select
  '00000000-0000-0000-0000-0000000c0001',
  id,
  case when role = 'manager' then 'manager' else 'employee' end
from public.profiles
where role in ('employee', 'manager')
on conflict (canteen_id, profile_id) do nothing;

update public.profiles
set role = 'customer', updated_at = now()
where role in ('employee', 'manager');
