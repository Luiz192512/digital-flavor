-- Teste de isolamento entre cantinas (RLS por vinculo).
-- Ator: staff.central (employee da Cantina Central, SEM vinculo com a B).
-- Expectativas marcadas em cada bloco; updates em linha de outra cantina
-- devem afetar 0 linhas, selects nao devem retornar linhas da outra cantina.

set role authenticated;
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000a0003","role":"authenticated"}';

-- 1. Staff da Central NAO ve pedidos da Cantina B (esperado: 0 linhas)
select 'T1_staff_ve_pedidos_da_B' as teste, count(*) as linhas_esperado_0
from public.orders
where canteen_id = '00000000-0000-0000-0000-0000000c0002';

-- 2. Staff da Central VE pedidos da propria cantina (esperado: >= 1 apos checkout)
select 'T2_staff_ve_pedidos_da_central' as teste, count(*) as linhas_esperado_1_ou_mais
from public.orders
where canteen_id = '00000000-0000-0000-0000-0000000c0001';

-- 3. Staff da Central NAO altera pedido da B (esperado: UPDATE 0)
update public.orders
set status = 'preparing', updated_at = now()
where id = '00000000-0000-0000-0000-0000000e0001';

-- 4. Cliente nao escala privilegio: cliente1 tenta virar staff/alterar
--    produto de qualquer cantina (esperado: UPDATE 0 e INSERT falha)
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000a0001","role":"authenticated"}';

update public.products
set price_cents = 1, updated_at = now()
where id = '00000000-0000-0000-0000-0000000d0001';

insert into public.canteen_staff (canteen_id, profile_id, role)
values ('00000000-0000-0000-0000-0000000c0001', '00000000-0000-0000-0000-0000000a0001', 'manager');
