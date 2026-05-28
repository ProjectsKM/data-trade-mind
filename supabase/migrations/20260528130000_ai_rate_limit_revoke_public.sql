-- Corrige o REVOKE da migration 20260528120000_ai_rate_limit.sql.
-- PostgreSQL dá EXECUTE pra PUBLIC por padrão em novas funções. Revogar só
-- de anon/authenticated não impede chamadas via /rest/v1/rpc — o PostgREST
-- usa o role anon/authenticated mas a permissão herdada do PUBLIC ainda
-- autoriza. Precisa REVOKE FROM PUBLIC.
--
-- Antes deste fix, qualquer usuário não-autenticado podia chamar:
--   - admin_login_record('algumIP', true) → zerava o contador de tentativas
--     de login admin de qualquer IP, anulando o lockout de brute-force.
--   - check_ai_rate_limit(uuidVitima, 'ai-mind') → inflar ai_call_log de
--     outro usuário pra bloqueá-lo do rate limit.

REVOKE EXECUTE ON FUNCTION public.check_ai_rate_limit(uuid, text, integer, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_login_check(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.admin_login_record(text, boolean) FROM PUBLIC;

-- service_role bypassa as policies/grants no Supabase por padrão; não precisa
-- GRANT explícito.
