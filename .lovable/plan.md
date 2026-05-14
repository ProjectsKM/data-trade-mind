## Objetivo

Adicionar área administrativa interna, criar página de oferta pública, deixar o /upgrade mais persuasivo, limpar pequenos ruídos do /mind e refinar as animações globais.

---

## 1. /admin — área interna protegida por senha única

**Acesso**
- Novo segredo runtime `ADMIN_PASSWORD` (via `add_secret`).
- Layout próprio fora do shell `_app` (sem sidebar OrionHub) — rota `src/routes/admin.tsx` (página de login) + `src/routes/admin/_panel.tsx` como layout pathless do painel + filhos `admin/_panel/index.tsx` (lista) e demais.
- Proteção: server function `adminLogin({ password })` valida contra `process.env.ADMIN_PASSWORD` e, se ok, seta cookie `admin_session` (httpOnly, signed via `useSession` com `SESSION_SECRET`). Toda server fn admin usa middleware `requireAdminSession` que lê o cookie.
- Se `SESSION_SECRET` não existir, adicionamos via `add_secret`.

**Painel (`/admin`)**
- Tabela de usuários puxando de `profiles` + `user_plans` via server fn `listUsers` (usa `supabaseAdmin`, bypass RLS).
- Filtros: todos / Free / PRO Anual. Busca por email/nome.
- Ações por linha:
  - **Promover para PRO Anual** → server fn `promoteUser({ userId })` faz update em `user_plans`: `is_pro=true`, `analyses_left=9999`, `trial_started_at=now()`, `trial_days_left=365`.
  - **Despromover** → reverte para Free (`is_pro=false`, `analyses_left=5`, `trial_days_left=7`).
  - **Copiar e-mail**.
- Cards no topo: total usuários, total Free, total PRO, novos nos últimos 7 dias.
- Botão **Sair** que limpa o cookie admin.

**Segurança**
- Nenhum link para /admin em nenhum lugar do site público.
- Toda mutação valida sessão admin no servidor (não confia no cliente).

---

## 2. /upgrade — repaginada

Reescrever `src/routes/_app/upgrade.tsx`:
- Hero com badge "ACESSO ANUAL · LANÇAMENTO", título grande com gradiente, subheadline curta.
- Card de preço destacado com **R$ 497/ano** + comparação riscada "R$ 997" + selo "economize 50%" + microcopy "pagamento único · 12 meses".
- Grid de 8 benefícios com ícones lucide (Infinity, BrainCircuit, LineChart, Newspaper, Bitcoin, Zap, Gem, ShieldCheck) em vez de emojis — cards com hover glow, gradiente sutil, animação stagger.
- Seção "O que você desbloqueia agora" com 3 destaques visuais (TraderScan, OrionMind, Notícias+CryptoBubbles).
- Bloco de prova social / promessa (sem inventar depoimentos — frase do mentor Gabriel Dutra).
- FAQ accordion (5 perguntas: renovação, garantia, suporte, requisitos, formas de pagamento).
- CTA fixo flutuante no mobile.
- Mantém botão demo de ativar/desativar.

---

## 3. /ofertalancamento — landing pública standalone

- Nova rota top-level `src/routes/ofertalancamento.tsx` (fora de `_app`, sem sidebar/header do app — apenas header próprio mínimo com logo).
- Estrutura:
  1. Hero com countdown visual de lançamento, headline "Acesso Anual ao OrionHub — Lote de Lançamento".
  2. Comparativo lado a lado: **Plano Free** vs **PRO Anual** (tabela de features com check/x).
  3. Seção "Tudo que você leva no PRO" — grid com os módulos (TraderScan, OrionMind, Notícias, CryptoBubbles, Calculadora, Gestão).
  4. Bloco de preço com R$ 497/ano + bônus de lançamento.
  5. Sobre o mentor Gabriel Dutra (Trader Orion Capital).
  6. FAQ.
  7. CTA principal: botão "Garantir meu acesso" → abre WhatsApp (link `https://wa.me/...` configurável via constante no topo do arquivo — placeholder que o usuário troca).
- Página totalmente responsiva, animações de scroll-reveal, sem dependência do shell autenticado.
- Meta tags próprias (`head()`) com og:title/description para compartilhamento.

---

## 4. /mind — remover toast de "nova conversa"

- Em `src/routes/_app/mind.tsx`, localizar `toast.success("Nova conversa criada")` (ou similar) na criação de thread e remover. Manter a criação silenciosa.

---

## 5. Animações globais mais fluidas

Em `src/styles.css`:
- Aumentar suavidade das transições padrão (`cubic-bezier(.22,.61,.36,1)`), durações entre 180–260ms.
- Refinar `card-glow`, `hover-lift`, `pulse-glow` (glow mais sutil e contínuo).
- Adicionar `.reveal-stagger` com `transition-delay` por índice usando `:nth-child`.
- Melhorar transição de rota (View Transitions) — cross-fade + leve translate-y de 4px, 200ms.
- Adicionar `.tap` (scale .98 com spring) e usar nos botões principais.
- Suavizar `thinking-dots` e cursor de digitação do OrionMind.
- Ajustar `@keyframes orbFloat` e `auroraShift` para ciclos mais longos (menos "movimento").
- Garantir `prefers-reduced-motion` continua respeitado.

Aplicar a classe `smooth` / `hover-lift` nos lugares óbvios (cards do dashboard, botões da sidebar, tabs) onde ainda não está.

---

## Detalhes técnicos

**Arquivos novos**
- `src/routes/admin.tsx` (login)
- `src/routes/admin/_panel.tsx` (layout protegido)
- `src/routes/admin/_panel/index.tsx` (dashboard usuários)
- `src/routes/ofertalancamento.tsx`
- `src/lib/admin.functions.ts` (server fns: adminLogin, adminLogout, listUsers, promoteUser, demoteUser + middleware requireAdminSession)

**Arquivos editados**
- `src/routes/_app/upgrade.tsx` (redesign completo)
- `src/routes/_app/mind.tsx` (remover toast)
- `src/styles.css` (animações)

**Segredos a adicionar**
- `ADMIN_PASSWORD`
- `SESSION_SECRET` (se ainda não existir)

**Não muda**
- Schema do banco (usa colunas existentes de `user_plans`).
- Lógica do TraderScan, Notícias, CryptoBubbles, autenticação dos usuários comuns.
