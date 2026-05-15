## Auditoria de segurança — OrionHub

Rodei o scanner completo (Supabase linter + Lovable security scan) e encontrei **7 problemas**, sendo **4 críticos**. Abaixo o plano para corrigir tudo.

### 🔴 Críticos

**1. Escalada de privilégio em `user_plans`**
A política RLS atual permite que qualquer usuário autenticado faça UPDATE no próprio registro de `user_plans` — ou seja, qualquer um pode setar `is_pro = true`, zerar limites, virar PRO de graça.
- **Fix:** remover a policy `Users update own plan` da tabela `user_plans`. Promoção/rebaixamento continua funcionando porque é feito via `supabaseAdmin` em `admin.functions.ts` (service role bypassa RLS).

**2. Segredo hardcoded no admin (`src/lib/admin.functions.ts`)**
Se `SESSION_SECRET`/`ADMIN_PASSWORD` faltarem, o HMAC cai num literal público (`"lovable-orion-admin-fallback-secret"`). Qualquer um forja o cookie `orion_admin` e ganha acesso total ao painel admin (listar usuários, promover, rebaixar).
- **Fix:** remover o fallback. Lançar erro se `SESSION_SECRET` não estiver configurado. Exigir mínimo de 32 caracteres.

**3. Rotas `/api/ai-scan` e `/api/ai-mind` sem autenticação**
Qualquer pessoa na internet pode fazer POST nessas rotas e queimar sua quota da OpenAI. O limite `analysesLeft` só existe no cliente — totalmente burlável.
- **Fix:** validar JWT do Supabase no handler antes de chamar OpenAI; se inválido → 401. Decrementar `analyses_left` server-side via `supabaseAdmin` (atomico) antes de chamar OpenAI; se 0 e não-pro → 402.

**4. `attachSupabaseAuth` não registrado em `src/start.ts`**
O middleware existe mas nunca é montado, então **nenhum** server function protegido por `requireSupabaseAuth` recebe o bearer token — todas falham com 401 (ou pior, ficam quebradas silenciosamente).
- **Fix:** registrar `attachSupabaseAuth` em `functionMiddleware` no `createStart`.

### 🟡 Avisos

**5. Cookie admin com `SameSite=none`**
Permite CSRF de qualquer site. Trocar para `"lax"`.

**6. CORS wildcard em rotas que aceitam Authorization**
`Access-Control-Allow-Origin: *` em `src/lib/cors.ts` e `calendar.ts`. Trocar para allowlist com a origem de produção (e a origem `*-dev.lovable.app`/`*.lovable.app` em dev), refletindo o `Origin` apenas se bater.

**7. Proteção contra senhas vazadas desativada (Supabase Auth)**
Ação manual no painel Supabase — mostrarei o link.

---

### Detalhes técnicos

**Migração SQL:**
```sql
DROP POLICY "Users update own plan" ON public.user_plans;
```

**Arquivos a editar:**
- `src/start.ts` — registrar `attachSupabaseAuth`
- `src/lib/admin.functions.ts` — remover fallback do secret + `sameSite: "lax"`
- `src/routes/api/ai-scan.ts` — auth + decremento server-side de `analyses_left`
- `src/routes/api/ai-mind.ts` — auth obrigatória
- `src/lib/cors.ts` — allowlist de origens (produção + previews lovable)
- `src/routes/api/calendar.ts` — usar mesma allowlist

**Secrets necessários:**
- Garantir que `SESSION_SECRET` esteja setado (já existe na lista — só vou validar). Se não tiver 32+ chars, peço para regenerar.

**Ação manual do usuário (painel Supabase):**
- Ativar "Leaked Password Protection" em Auth → Policies.

Posso aplicar as correções?