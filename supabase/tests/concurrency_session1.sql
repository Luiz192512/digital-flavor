-- Sessao 1 do teste de concorrencia: compra o ultimo item e segura a
-- transacao aberta por 3s antes do commit, forcando a sessao 2 a esperar
-- no lock de linha do inventory.
set role authenticated;
set request.jwt.claims = '{"sub":"00000000-0000-0000-0000-0000000a0001","role":"authenticated"}';
begin;
select 'SESSao1_CHECKOUT' as etapa, * from public.checkout(
  '[{"product_id":"00000000-0000-0000-0000-0000000d0001","quantity":1}]'::jsonb,
  '10:30'::time,
  'pix'::public.payment_method
);
select pg_sleep(3);
commit;
select 'SESSao1_OK' as resultado;
