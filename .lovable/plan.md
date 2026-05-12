## Objetivo

Trazer mais vida visual ao app, manter o usuário logado entre sessões e adicionar uma página `/perfil` com dados do usuário e plano.

## 1. Redesign — mais vida, glow e movimento

**Tokens (`src/styles.css`)**
- Aumentar saturação do `--primary` (steel-blue → azul elétrico vibrante em oklch ~0.65 0.22 250).
- Reintroduzir `--accent` vivo (ciano/violeta) e `--glow` para sombras coloridas.
- Adicionar variáveis: `--gradient-hero`, `--gradient-card`, `--shadow-glow`, `--shadow-elevated`.
- Novas keyframes globais: `float`, `pulse-glow`, `shimmer`, `gradient-shift`, `aurora`, `fade-in-up`, `slide-in`.
- Utilitários: `.glow-primary`, `.card-glow`, `.animated-border`, `.shimmer`, `.hover-lift`.

**Background animado (global no `_app.tsx`)**
- Camada fixa atrás de tudo com:
  - Aurora/grid sutil em SVG ou CSS conic-gradient com `animation: aurora 20s ease infinite`.
  - 2–3 “orbs” com blur grande e `animate-float` (sem custo de perf, puro CSS).
  - Grid pontilhado leve por cima para textura.
- Respeita `prefers-reduced-motion`.

**Header / Sidebar (`_app.tsx`)**
- Logo com gradient text + glow sutil pulsante.
- Itens da sidebar com indicador ativo glow + ícone com leve `animate-pulse` quando ativo.
- Hover: `translateX` + glow.
- Avatar com anel gradiente animado.

**Cards e KPIs (todas as páginas internas)**
- `StatCard` ganha borda gradiente animada opcional, hover-lift e ícone com glow.
- Botões primários com gradient + shadow-glow + shimmer no hover.
- Loaders trocam para spinner com glow.

**Páginas**
- `/scan`: dropzone com borda animada (shimmer) e ícone Upload pulsante.
- `/mind`: bolhas de chat com fade-in-up; input com focus-glow.
- `/gestao`, `/relatorio`, `/calculadora`: cards com hover-lift + entrada escalonada (`fade-in-up` com delays).
- Charts com cores mais vivas alinhadas ao novo `--primary` / `--accent`.

Landing (`/`) e auth (`/login`, `/signup`) **não** mudam de estrutura — só herdam novos tokens.

## 2. Sessão persistente (não pedir login de novo)

O Supabase já persiste sessão. O que falta é redirecionar quando já autenticado:
- `src/routes/index.tsx` (landing): se `useUser()` retornar usuário, redirecionar para `/scan` automaticamente (mantendo a landing visível para deslogados).
- `src/routes/login.tsx` e `src/routes/signup.tsx`: já têm guard parcial — garantir `Navigate to="/scan"` enquanto `ready && user`.
- `_app.tsx`: enquanto `ready === false`, mostrar splash com glow em vez de redirecionar para `/login` (evita “flash” de logout em refresh).
- Conferir `src/integrations/supabase/client.ts` para `persistSession: true` e `autoRefreshToken: true`.

Resultado: ao reabrir o site/aba, o usuário cai direto em `/scan`.

## 3. Página `/perfil`

Nova rota `src/routes/_app/perfil.tsx`:
- **Header** com avatar grande (anel gradiente animado), nome, email, país e badge do plano (FREE/PRO).
- **Card "Plano atual"**:
  - Plano (PRO/FREE), análises restantes, dias de trial restantes, data de início do trial.
  - Botão “Fazer upgrade” → `/upgrade` (se FREE).
- **Card "Conta"**:
  - Email, nome, país (somente leitura por enquanto; campo editável de nome com botão Salvar usando `update` em `profiles`).
  - Botão “Sair”.
- **Card "Estatísticas rápidas"**:
  - Nº de scans, nº de trades, win-rate (consulta agregada simples a `scan_history` e `trades`).
- Adicionar item "Perfil" na sidebar do `_app.tsx` com ícone `User`.

Dados vêm de tabelas existentes (`profiles`, `user_plans`, `scan_history`, `trades`) via client browser do Supabase — sem migrations necessárias.

## Arquivos afetados

- `src/styles.css` — tokens vivos, keyframes, utilitários.
- `src/routes/_app.tsx` — background animado, sidebar viva, item Perfil, splash de loading.
- `src/routes/index.tsx` — redirect se logado.
- `src/routes/login.tsx`, `src/routes/signup.tsx` — confirmar guard.
- `src/components/app/StatCard.tsx`, `PageHeader.tsx`, `EmptyState.tsx` — novos efeitos.
- `src/routes/_app/scan.tsx`, `mind.tsx`, `gestao.tsx`, `relatorio.tsx`, `calculadora.tsx` — animações de entrada e detalhes glow.
- `src/routes/_app/perfil.tsx` — **novo**.
- `src/integrations/supabase/client.ts` — checar flags de persistência (sem mudanças se já corretas).

Sem mudanças em backend, schema, secrets ou lógica de IA.