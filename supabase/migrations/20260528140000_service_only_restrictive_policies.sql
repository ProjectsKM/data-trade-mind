-- Silencia o advisor "rls_enabled_no_policy" nas tabelas service-role-only.
-- Sem mudar comportamento — RLS habilitado sem policy já bloqueava
-- anon/authenticated, mas o advisor pede explícito.
--
-- RESTRICTIVE policy combinada com PERMISSIVE em AND lógico: como não há
-- nenhuma PERMISSIVE policy, a tabela continua bloqueada pra qualquer role
-- exceto service_role (que bypassa RLS por padrão no Supabase).

CREATE POLICY "Block all non-service access"
  ON public.ai_call_log
  AS RESTRICTIVE
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Block all non-service access"
  ON public.admin_login_attempts
  AS RESTRICTIVE
  FOR ALL
  TO public
  USING (false)
  WITH CHECK (false);
