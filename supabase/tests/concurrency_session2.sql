-- Sessao 2 do teste de concorrencia: tenta comprar o MESMO ultimo item
-- enquanto a sessao 1 segura o lock. Resultado esperado: bloqueia ate o
-- commit da sessao 1 e entao falha com insufficient_stock.
set role authenticated;
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000a0002","role":"authenticated"}';
select 'SESSao2_CHECKOUT' as etapa, * from public.checkout(
  '[{"product_id":"00000000-0000-0000-0000-0000000d0001","quantity":1}]'::jsonb,
  '10:30'::time,
  'pix'::public.payment_method
);
