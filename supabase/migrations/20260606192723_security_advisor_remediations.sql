do $$
begin
  if exists (
    select 1
    from pg_proc proc
    join pg_namespace namespace on namespace.oid = proc.pronamespace
    where namespace.nspname = 'public'
      and proc.proname = 'rls_auto_enable'
      and pg_get_function_identity_arguments(proc.oid) = ''
  ) then
    revoke execute on function public.rls_auto_enable() from anon, authenticated, public;
  end if;
end $$;

drop policy if exists "products_write_management" on public.products;

create policy "products_insert_management"
on public.products
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles staff_profile
    where staff_profile.id = (select auth.uid())
      and staff_profile.role in ('manager', 'admin')
  )
);

create policy "products_update_management"
on public.products
for update
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

create policy "products_delete_management"
on public.products
for delete
to authenticated
using (
  exists (
    select 1 from public.profiles staff_profile
    where staff_profile.id = (select auth.uid())
      and staff_profile.role in ('manager', 'admin')
  )
);

drop policy if exists "inventory_write_management" on public.inventory;

create policy "inventory_insert_management"
on public.inventory
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles staff_profile
    where staff_profile.id = (select auth.uid())
      and staff_profile.role in ('manager', 'admin')
  )
);

create policy "inventory_update_management"
on public.inventory
for update
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

create policy "inventory_delete_management"
on public.inventory
for delete
to authenticated
using (
  exists (
    select 1 from public.profiles staff_profile
    where staff_profile.id = (select auth.uid())
      and staff_profile.role in ('manager', 'admin')
  )
);
