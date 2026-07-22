-- BUG-06: a edge function customer-preferences trocava os metodos de pagamento
-- com DELETE seguido de INSERT em statements separados; se o INSERT falhasse
-- (ex.: violacao do indice de preferido unico), o usuario ficava sem nenhum
-- metodo. Esta RPC faz a substituicao numa unica transacao (a funcao inteira),
-- entao delete e insert sao tudo-ou-nada. SECURITY INVOKER: roda com o papel
-- do chamador, respeitando as policies de dono de customer_payment_methods.

create or replace function public.save_payment_methods(p_methods jsonb)
returns void
language plpgsql
security invoker
set search_path = public
as $$
declare
  v_profile uuid := (select auth.uid());
begin
  if v_profile is null then
    raise exception 'not_authenticated' using errcode = '28000';
  end if;

  if jsonb_array_length(coalesce(p_methods, '[]'::jsonb)) > 20 then
    raise exception 'too_many_methods' using errcode = '22023';
  end if;

  delete from public.customer_payment_methods where profile_id = v_profile;

  insert into public.customer_payment_methods
    (profile_id, method, label, detail, preferred, active, updated_at)
  select
    v_profile,
    (method_row ->> 'method')::public.payment_method,
    method_row ->> 'label',
    method_row ->> 'detail',
    coalesce((method_row ->> 'preferred')::boolean, false),
    true,
    now()
  from jsonb_array_elements(coalesce(p_methods, '[]'::jsonb)) as method_row
  where method_row ->> 'method' is not null
    and method_row ->> 'label' is not null
    and method_row ->> 'detail' is not null;
end;
$$;

revoke all on function public.save_payment_methods(jsonb) from public, anon;
grant execute on function public.save_payment_methods(jsonb) to authenticated;
