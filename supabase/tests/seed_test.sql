-- Massa de teste para os cenarios do modelo v3 (rodar apos supabase db reset,
-- em ambiente LOCAL apenas — insere direto em auth.users).
-- Cria: 2ª cantina, usuarios (2 clientes + 1 staff da Central), produto de
-- "ultimo item" na Central e produto na Cantina B.

-- 2ª cantina para os testes de isolamento
insert into public.canteens (id, slug, name, location, prep_minutes, active)
values ('00000000-0000-0000-0000-0000000c0002', 'cantina-b', 'Cantina B', 'Bloco 2', 10, true)
on conflict (id) do nothing;

-- Usuarios (o trigger on_auth_user_created cria os profiles)
insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-0000000a0001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'cliente1@teste.dev', '{"full_name":"Cliente Um"}', now(), now()),
  ('00000000-0000-0000-0000-0000000a0002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'cliente2@teste.dev', '{"full_name":"Cliente Dois"}', now(), now()),
  ('00000000-0000-0000-0000-0000000a0003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'staff.central@teste.dev', '{"full_name":"Staff Central"}', now(), now())
on conflict (id) do nothing;

-- Vinculo de staff: funcionario da Cantina Central (nenhum vinculo com a B)
insert into public.canteen_staff (canteen_id, profile_id, role)
values ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000a0003', 'employee')
on conflict do nothing;

-- Produto "ultimo item" na Central (estoque 1)
insert into public.products (id, name, description, category, price_cents, canteen_id, active)
values ('00000000-0000-0000-0000-0000000d0001', 'Ultimo pastel', 'Item de teste de concorrencia.', 'lanche', 1000, '00000000-0000-0000-0000-0000000c0001', true)
on conflict (id) do nothing;

insert into public.inventory (product_id, quantity, reserved, reorder_point)
values ('00000000-0000-0000-0000-0000000d0001', 1, 0, 0)
on conflict (product_id) do update set quantity = 1, reserved = 0;

-- Produto e pedido na Cantina B (alvo dos testes de isolamento)
insert into public.products (id, name, description, category, price_cents, canteen_id, active)
values ('00000000-0000-0000-0000-0000000d0002', 'Suco da B', 'Produto da outra cantina.', 'bebida', 500, '00000000-0000-0000-0000-0000000c0002', true)
on conflict (id) do nothing;

insert into public.orders (id, customer_id, customer_name, status, pickup_time, pickup_code, total_cents, payment_method, payment_status, canteen_id)
values ('00000000-0000-0000-0000-0000000e0001', '00000000-0000-0000-0000-0000000a0002', 'Cliente Dois', 'queued', '10:30', 'TESTEB', 500, 'pix', 'pending', '00000000-0000-0000-0000-0000000c0002')
on conflict (id) do nothing;
