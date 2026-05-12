## Objetivo

Redesenhar todo o app interno mantendo a landing page intacta. Foco em estética **clean, profissional e financeira**, alinhada com a temática de trading: precisão, dados, calma. Substituir emojis por ícones, harmonizar fontes, refinar paleta e reorganizar a hierarquia de cada tela.

## Linguagem visual nova

**Tipografia**
- Fonte de display/heading: **Space Grotesk** (geométrica, técnica, moderna — usada por Stripe, Linear, plataformas fintech). Substitui `Michroma`, que é decorativa demais para uso prolongado.
- Fonte de corpo/UI: **Inter** (padrão de SaaS profissional, legível em densidades altas). Substitui `Outfit`.
- Fonte mono/dados: **JetBrains Mono** (números financeiros tabulares com `font-feature-settings: 'tnum'`). Substitui `DM Mono`.
- Tracking dos títulos passa a ser neutro (não mais `-0.02em` agressivo); labels uppercase reduzem para `tracking-wide`.

**Paleta refinada (oklch, em `src/styles.css`)**
- Background mais profundo e neutro (menos azulado): `oklch(0.14 0.012 250)`.
- Surfaces em escala mais sutil (3 níveis), bordas com menos saturação para reduzir ruído.
- Accent principal vira **azul-aço sóbrio** (`oklch(0.62 0.16 245)`) em vez do roxo-elétrico atual; remove a vibe "neon gamer".
- `--electric` vira ciano discreto, usado só para destaques pontuais.
- Estados semânticos (green/red/gold) dessaturados para parecerem terminal financeiro, não dashboard de jogo.
- Remove gradientes coloridos do header/avatares — substitui por superfícies sólidas com borda sutil.

**Ícones**
- Substituir todos os emojis (📊 🧠 📋 📈 🧮 ▲ ▼ ✨ ⚠️ ⬇ ⬆ 📁 📋 ✕) por **Lucide icons** consistentes:
  - Scan → `LineChart`, Mind → `Sparkles`/`Brain`, Gestão → `ClipboardList`, Relatório → `BarChart3`, Calc → `Calculator`.
  - Upload `Upload`, Paste `ClipboardPaste`, Loading `Loader2`, Erro `AlertTriangle`, Success `TrendingUp/Down`, Delete `X`, Export `Download`, Import `Upload`.
  - Tamanhos padronizados (16/18/20px), `strokeWidth={1.75}`.

**Componentes base**
- Migrar inputs/botões/cards inline para os componentes shadcn já presentes (`Button`, `Input`, `Textarea`, `Card`, `Tabs`, `Select`, `Badge`, `Separator`) com variantes refinadas. Reduz CSS inline e cria consistência.
- Densidade um pouco maior (paddings ligeiramente menores, raios `rounded-xl` em vez de `rounded-3xl`) para parecer terminal pro, não app casual.

## Layout das páginas

**Shell `_app.tsx`**
- Header fica mais discreto: logotipo em peso médio, badge PRO/FREE em estilo `outline` sóbrio, avatar circular sólido sem gradiente, botão de logout com ícone `LogOut`.
- Sidebar desktop: aumenta para `w-56`, mostra ícone + label legível (não mais texto 7px). Item ativo: barra lateral fina + bg sutil (sem glow neon). Mantém `collapsible` opcional via `useState` com botão.
- Bottom nav mobile: ícones Lucide + label menor, sem emoji.

**/scan — TraderScan**
- Header da página com título + subtítulo descritivo + badge de plano à direita (em vez de banner separado).
- Dropzone: redesign mais técnico — borda tracejada fina, ícone `Upload` grande, copy hierárquica clara, atalhos (Drop / Ctrl+V / Browse) em uma única faixa de ações abaixo.
- Stage `duration`: preview do gráfico com aspect ratio fixo, seletor de timeframe vira `Tabs` ou `ToggleGroup` segmentado, botão primário "Analisar" explícito (não dispara só pelo clique no número).
- Stage `analyzing`: spinner Lucide `Loader2` + mensagens em sequência (skeleton mais sóbrio).
- Resultado: card de veredito com layout em 2 colunas (direção+confiança | preços-chave), seção de contexto (tendência/viés/SR) em grid 2x2, padrões/indicadores como `Badge` shadcn, riscos em lista com ícone `AlertCircle`.

**/mind — OrionMind**
- Layout chat estilo "console" pro: header com ícone `Sparkles`, status "online", botão `Trash2` discreto.
- Bolhas: assistente em `surface-2` com borda sutil, usuário em `accent` sóbrio (não roxo neon), avatar circular sólido (iniciais ou ícone).
- Renderização markdown ampliada (negrito, listas, code inline, blocos `code`).
- Input vira `Textarea` shadcn auto-grow, botão `Send` com ícone, atalho `⌘/Ctrl + Enter` indicado em hint.
- Sugestões iniciais (chips) quando não há mensagens: "Análise de padrão", "Gestão de risco", "Revisar minhas trades".

**/gestao — Gestão de Trades**
- KPIs no topo em 4 cards consistentes (Total / Win rate / Lucro líquido / Melhor‑Pior) com ícones e cor semântica.
- Formulário "Nova operação" reorganizado em `Card` com grid limpo, usando `Input`, `Select` shadcn; botões `WIN/LOSS/OPEN` viram `ToggleGroup`; ações Export/Import movem para o header com `DropdownMenu`.
- Tabela: usar `Table` shadcn, colunas com tipografia mono nos números, linhas com hover, badge de status colorido sutil, ações (W/L/Delete) com ícones Lucide em vez de letras/×.
- Empty state com ilustração leve e CTA.

**/relatorio — Relatório**
- Filtro de período como `Tabs` segmentado.
- KPIs em 4 cards mais "fintech" (label + valor mono + delta).
- Charts: cores alinhadas à nova paleta (variáveis CSS), grid lines mais discretas, tooltips estilizados; line chart com gradient sutil; doughnut com `cutout: 70%` e legenda lateral.
- Adicionar 1 chart pequeno extra: distribuição WIN/LOSS por dia da semana (heatmap simples com divs) — opcional se couber sem inflar escopo.

**/calculadora — Calculadora**
- Reorganizar em 2 colunas com `Card` shadcn: à esquerda parâmetros (sliders + inputs), à direita resultados em grid de KPIs.
- Substituir simulação por chart real (Line) usando os mesmos estilos do /relatorio.
- Martingale como tabela compacta com risco acumulado e %.

## Implementação técnica

1. **`src/styles.css`**: trocar tokens (`--background`, `--surface`, `--accent`, `--electric`, semânticos), trocar `@import` de fontes Google (Space Grotesk + Inter + JetBrains Mono), atualizar `--font-display`/`--font-sans`/`--font-mono`, simplificar animações (manter fade-up/in, remover float/pulseGlow agressivos).
2. **`src/routes/__root.tsx`**: ajustar `<link>` das novas fontes do Google.
3. **Componentizar**: criar `src/components/app/PageHeader.tsx`, `StatCard.tsx`, `EmptyState.tsx` para reutilização entre /scan, /gestao, /relatorio, /calculadora.
4. Reescrever cada rota (`scan.tsx`, `mind.tsx`, `gestao.tsx`, `relatorio.tsx`, `calculadora.tsx`) usando shadcn + Lucide + nova paleta.
5. Atualizar `_app.tsx` (header + sidebar + bottom nav) sem mexer em rotas, store ou backend.
6. **Não tocar** em: `/` (landing), `/login`, `/signup`, `/upgrade`, `src/lib/store.ts`, `src/routes/api/*`, migrations.

## Fora do escopo
- Lógica de negócio, persistência, autenticação, integrações IA.
- Landing page e fluxos de auth.
- Mudanças no backend ou banco.

## Entregável
App interno com identidade visual coesa, profissional e clean — alinhada com plataformas fintech sérias (estilo Linear/Stripe/TradingView pro), substituindo a estética atual mais "neon gamer" por algo sóbrio e focado em dados.
