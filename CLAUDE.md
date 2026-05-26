# data-trade-mind

Projeto bootstrapped pela **Lovable**, agora desenvolvido localmente por dois devs em call alternando turnos.

## Stack

- **Framework**: TanStack Start (React 19, SSR) com roteamento por arquivo em `src/routes/`
- **Bundler**: Vite 7 + plugin `@lovable.dev/vite-tanstack-config` (já inclui tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare, etc — **não adicionar manualmente em `vite.config.ts` ou quebra**)
- **UI**: shadcn/ui (style `new-york`, base `slate`, ícones `lucide-react`), Radix UI primitives, Tailwind v4
- **Estado/dados**: TanStack Query, React Hook Form + Zod
- **Backend**: Supabase (`src/integrations/supabase/`, migrations em `supabase/migrations/`)
- **Deploy**: Cloudflare Workers (`wrangler.jsonc`, entry SSR em `src/server.ts`)
- **Package manager**: Bun (existe `bun.lock` — use `bun install` em vez de `npm install`)

## Comandos

```bash
bun install          # instalar dependências
bun run dev          # dev server (Vite)
bun run build        # build de produção
bun run build:dev    # build modo development
bun run preview      # preview do build
bun run lint         # ESLint
bun run format       # Prettier (escreve)
```

## Estrutura

```
src/
├── routes/              # rotas file-based do TanStack (cada arquivo = rota)
│   ├── __root.tsx       # layout raiz
│   ├── _app/            # rotas dentro do app autenticado
│   ├── api/             # rotas de API server-side
│   ├── index.tsx        # /
│   ├── login.tsx        # /login
│   ├── signup.tsx       # /signup
│   ├── admin.tsx        # /admin
│   └── ofertalancamento.tsx
├── components/          # componentes reutilizáveis (incl. ui/ do shadcn)
├── hooks/
├── integrations/supabase/   # cliente Supabase, tipos gerados
├── lib/                 # utils (@/lib/utils)
├── routeTree.gen.ts     # GERADO — nunca editar manualmente
├── router.tsx
├── server.ts            # entry SSR para Cloudflare
├── start.ts
└── styles.css           # Tailwind v4 entry
```

Path alias: `@/*` → `src/*`

## Fluxo de trabalho (importante)

Trabalhamos os dois em **call alternando turnos**, sem branches. Por isso:

1. **Antes de começar seu turno**: `git pull origin main`
2. **Após terminar seu turno**: `git add -A && git commit -m "..." && git push origin main`
3. **Nunca codar simultaneamente** — só um por vez para evitar conflito
4. **Se der conflito no pull**: pare, alinhe no call quem mantém o quê, e resolva antes de continuar

Como não usamos branches/PR, o cuidado precisa ser maior:
- Commits pequenos e frequentes (facilita reverter se quebrar algo)
- Testar localmente (`bun run dev`) antes do push
- Mensagens de commit descritivas

## Convenções

- **TypeScript estrito** — sempre tipado, sem `any` salvo casos extremos
- **shadcn/ui**: para adicionar componente novo, use `npx shadcn@latest add <nome>` — ele respeita os aliases de `components.json`
- **Componentes UI** ficam em `src/components/ui/` (não editar diretamente, são gerados pelo shadcn)
- **Formulários**: React Hook Form + Zod resolver
- **Fetching**: TanStack Query — não usar `fetch` direto em componente
- **Estilos**: Tailwind utility-first; `cn()` de `@/lib/utils` para combinar classes
- **Prettier**: rodar `bun run format` antes de commitar arquivos editados manualmente

## Supabase

- Cliente em `src/integrations/supabase/client.ts`
- Tipos do banco em `src/integrations/supabase/types.ts` (geralmente gerados — não editar à mão)
- Migrations versionadas em `supabase/migrations/`
- As env vars `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` são públicas por design (anon key vai pro browser)

## ⚠️ Segurança — `.env`

O arquivo `.env` está **commitado no repo** (legado da Lovable). As chaves atuais são apenas a `anon`/publishable do Supabase, que já são públicas por design (prefixo `VITE_` expõe ao browser). **Mas**:

- **Nunca** colocar `SERVICE_ROLE_KEY` ou qualquer secret real no `.env` enquanto ele estiver tracked
- Secrets reais devem ir em `.dev.vars` (já está no `.gitignore`) para Cloudflare Workers, ou como secrets do Supabase Edge Functions
- Vale planejar uma limpeza: adicionar `.env` ao `.gitignore`, remover do tracking (`git rm --cached .env`) e usar `.env.example` como template

## Coisas que NÃO fazer

- Não editar `src/routeTree.gen.ts` (gerado)
- Não adicionar manualmente plugins ao `vite.config.ts` que `@lovable.dev/vite-tanstack-config` já inclui (lista no comentário do arquivo)
- Não commitar `node_modules`, `.output`, `.wrangler`, `dist` (já no `.gitignore`)
- Não rodar `npm install` — o lockfile é `bun.lock`; misturar gestores quebra resoluções
- Não usar branches sem combinar antes — o fluxo combinado é direto no `main`
