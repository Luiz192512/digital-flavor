-- Modelo v3, passo 3/4: reescrita das policies de staff para escopo por
-- cantina. Toda checagem de staff passa a exigir vinculo em canteen_staff
-- com a cantina DA LINHA (nao apenas "ser staff de alguma cantina");
-- private.is_platform_admin() preserva o acesso do dono da plataforma.
-- Policies de cliente (insert/select proprios) permanecem intocadas.

-- profiles: staff global deixa de ver todos os perfis; o nome do cliente
-- que a equipe precisa ja esta denormalizado em orders.customer_name.
drop policy if exists "profiles_select_own_or_management" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or private.is_platform_admin()
);

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin"
on public.profiles
for update
to authenticated
using (
  id = (select auth.uid())
  or private.is_platform_admin()
)
with check (
  id = (select auth.uid())
  or private.is_platform_admin()
);

-- products
drop policy if exists "products_select_authenticated" on public.products;
create policy "products_select_authenticated"
on public.products
for select
to authenticated
using (
  active = true
  or private.is_canteen_staff(canteen_id)
  or private.is_platform_admin()
);

drop policy if exists "products_insert_management" on public.products;
create policy "products_insert_management"
on public.products
for insert
to authenticated
with check (
  private.is_canteen_manager(canteen_id)
  or private.is_platform_admin()
);

drop policy if exists "products_update_management" on public.products;
create policy "products_update_management"
on public.products
for update
to authenticated
using (
  private.is_canteen_manager(canteen_id)
  or private.is_platform_admin()
)
with check (
  private.is_canteen_manager(canteen_id)
  or private.is_platform_admin()
);

drop policy if exists "products_delete_management" on public.products;
create policy "products_delete_management"
on public.products
for delete
to authenticated
using (
  private.is_canteen_manager(canteen_id)
  or private.is_platform_admin()
);

-- inventory: leitura segue aberta a autenticados (quantidade de estoque nao
-- e dado sensivel e alimenta o cardapio); escrita vira gerente da cantina
-- do produto correspondente.
drop policy if exists "inventory_insert_management" on public.inventory;
create policy "inventory_insert_management"
on public.inventory
for insert
to authenticated
with check (
  exists (
    select 1 from public.products product_of_row
    where product_of_row.id = inventory.product_id
      and private.is_canteen_manager(product_of_row.canteen_id)
  )
  or private.is_platform_admin()
);

drop policy if exists "inventory_update_management" on public.inventory;
create policy "inventory_update_management"
on public.inventory
for update
to authenticated
using (
  exists (
    select 1 from public.products product_of_row
    where product_of_row.id = inventory.product_id
      and private.is_canteen_manager(product_of_row.canteen_id)
  )
  or private.is_platform_admin()
)
with check (
  exists (
    select 1 from public.products product_of_row
    where product_of_row.id = inventory.product_id
      and private.is_canteen_manager(product_of_row.canteen_id)
  )
  or private.is_platform_admin()
);

drop policy if exists "inventory_delete_management" on public.inventory;
create policy "inventory_delete_management"
on public.inventory
for delete
to authenticated
using (
  exists (
    select 1 from public.products product_of_row
    where product_of_row.id = inventory.product_id
      and private.is_canteen_manager(product_of_row.canteen_id)
  )
  or private.is_platform_admin()
);

-- orders
drop policy if exists "orders_select_owner_or_staff" on public.orders;
create policy "orders_select_owner_or_staff"
on public.orders
for select
to authenticated
using (
  customer_id = (select auth.uid())
  or private.is_canteen_staff(canteen_id)
  or private.is_platform_admin()
);

drop policy if exists "orders_update_staff" on public.orders;
create policy "orders_update_staff"
on public.orders
for update
to authenticated
using (
  private.is_canteen_staff(canteen_id)
  or private.is_platform_admin()
)
with check (
  private.is_canteen_staff(canteen_id)
  or private.is_platform_admin()
);

-- order_items: escopo herdado do pedido.
drop policy if exists "order_items_select_owner_or_staff" on public.order_items;
create policy "order_items_select_owner_or_staff"
on public.order_items
for select
to authenticated
using (
  exists (
    select 1 from public.orders order_of_item
    where order_of_item.id = order_items.order_id
      and (
        order_of_item.customer_id = (select auth.uid())
        or private.is_canteen_staff(order_of_item.canteen_id)
      )
  )
  or private.is_platform_admin()
);

-- payments: escopo herdado do pedido.
drop policy if exists "payments_select_owner_or_staff" on public.payments;
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
        or private.is_canteen_staff(payment_order.canteen_id)
      )
  )
  or private.is_platform_admin()
);

drop policy if exists "payments_update_staff" on public.payments;
create policy "payments_update_staff"
on public.payments
for update
to authenticated
using (
  exists (
    select 1 from public.orders payment_order
    where payment_order.id = payments.order_id
      and private.is_canteen_staff(payment_order.canteen_id)
  )
  or private.is_platform_admin()
)
with check (
  exists (
    select 1 from public.orders payment_order
    where payment_order.id = payments.order_id
      and private.is_canteen_staff(payment_order.canteen_id)
  )
  or private.is_platform_admin()
);

-- stock_movements: escopo herdado do produto.
drop policy if exists "stock_movements_select_staff" on public.stock_movements;
create policy "stock_movements_select_staff"
on public.stock_movements
for select
to authenticated
using (
  exists (
    select 1 from public.products product_of_movement
    where product_of_movement.id = stock_movements.product_id
      and private.is_canteen_staff(product_of_movement.canteen_id)
  )
  or private.is_platform_admin()
);

drop policy if exists "stock_movements_insert_staff" on public.stock_movements;
create policy "stock_movements_insert_staff"
on public.stock_movements
for insert
to authenticated
with check (
  exists (
    select 1 from public.products product_of_movement
    where product_of_movement.id = stock_movements.product_id
      and private.is_canteen_staff(product_of_movement.canteen_id)
  )
  or private.is_platform_admin()
);
