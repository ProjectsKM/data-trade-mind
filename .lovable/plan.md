## 1. OrionMind — scroll e layout estilo ChatGPT

Hoje o `<main>` em `_app.tsx` tem `overflow-y-auto` e o `/mind` usa `flex h-full` — quando o conteúdo cresce a página inteira rola, levando o input para fora da viewport.

- Em `src/routes/_app.tsx`: quando a rota for `/mind` (ou criar uma classe utilitária), travar o `<main>` com `overflow-hidden` para que o filho controle seu próprio scroll. Manter `overflow-y-auto` para as outras rotas.
- Em `src/routes/_app/mind.tsx`:
  - Garantir que o container raiz use `h-full min-h-0` e que a coluna do chat seja `flex flex-col min-h-0`.
  - Apenas o `scrollRef` (área de mensagens) deve rolar (`flex-1 min-h-0 overflow-y-auto`).
  - Header e a barra do textarea ficam fixos como `flex-none`.
  - Ao abrir um thread ou enviar a primeira mensagem, fazer `scrollToBottom(false)` após o paint inicial (já existe — validar) e manter `autoFollow=true` durante streaming, com botão "Rolar para o final" reposicionado dentro do container do chat (não do layout).

## 2. Render de markdown + ícone do OrionMind

- Adicionar dependência `react-markdown` (+ `remark-gfm`) e renderizar `m.content` no `Bubble` com componentes mapeados:
  - `h1/h2/h3` → títulos com `font-display`, peso semibold, cor `--foreground`, espaçamento consistente.
  - `strong`, `ul/ol`, `code`, `blockquote` estilizados com tokens existentes.
- Trocar todos os `Sparkles` que representam o OrionMind pelo ícone `Brain` do `lucide-react`:
  - `src/routes/_app/mind.tsx` (header, avatar do assistente, sidebar tab em `_app.tsx`).
  - `src/routes/_app.tsx`: tab "Mind" usa `Brain` em vez de `Sparkles`.

## 3. TraderScan — horário de entrada, preview, simplificação e histórico local

Em `src/routes/_app/scan.tsx`:
- Adicionar segunda escolha na etapa `duration`: **Tempo de expiração da entrada** com opções `1 min` e `5 min` (separado do timeframe do gráfico). Renomear o atual seletor para "Timeframe do gráfico".
- Calcular no momento do `startAnalysis`:
  - `entryTime = now + expiracao` (arredondar para o início do minuto seguinte).
  - `protecao1 = entryTime + 1min`, `protecao2 = protecao1 + 1min`.
  - Formatar `HH:mm` e sobrescrever `result.entrada`, `result.protecao1`, `result.protecao2` retornados pela IA (a IA só fornece direção/análise; horários ficam determinísticos no cliente).
- No `ResultView`: substituir labels "CALL — Compra"/"PUT — Venda" por simplesmente **"Compra"** / **"Venda"** mantendo cores e ícones.
- Mostrar miniatura do gráfico enviado acima do veredito (`<img src={imgData}>` em card pequeno).
- Adicionar **histórico local** de scans:
  - Criar util em `src/lib/scanHistory.ts` que lê/escreve `localStorage` chave `orion.scan.history` (cap em ~30 itens, cada item contém thumbnail base64 reduzido, direção, horários, confiança, timestamp).
  - Substituir/duplicar o `addScan` para gravar no localStorage em vez do Supabase apenas para esta tela.
  - Renderizar lista colapsável "Histórico de análises" no estágio `upload` (cards clicáveis que reabrem o resultado).

## 4. Plano único anual

Buscar e atualizar referências a "mensal/Free/upgrade mensal" para refletir um único acesso anual:
- `src/routes/_app/upgrade.tsx`: remover toggles/cards mensais, manter apenas um card "Acesso anual".
- Textos em `src/routes/_app.tsx` (badge "Free · N · Upgrade"), `src/routes/index.tsx`, `signup.tsx`, `login.tsx` e quaisquer copy que mencionem "mensal/mês".
- Não tocar a lógica de `state.isPro` — apenas copy/UI.

## 5. Aba Notícias (calendário econômico)

- Criar rota `src/routes/_app/noticias.tsx`.
- Como o JSON da ForexFactory tem CORS restrito, criar server route `src/routes/api/calendar.ts` que faz `fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json")` e devolve JSON com `Cache-Control: public, max-age=600`.
- UI: lista agrupada por dia, com badges de impacto **Alto** (vermelho), **Médio** (gold) e **Baixo** (cinza), filtros por impacto, coluna com `country`, `title`, `time`, `forecast`, `previous`, `actual`.
- Adicionar tab "Notícias" no array `tabs` do `_app.tsx` (ícone `Newspaper`).

## 6. Aba CryptoBubbles

- Criar rota `src/routes/_app/cryptobubbles.tsx`.
- Render do `<iframe src="https://cryptobubbles.net/" className="w-full h-full border-0" loading="lazy" />` ocupando 100% do container, com header padrão `PageHeader` no topo.
- Para tema claro: aplicar wrapper com fundo da paleta clara do site (`background: var(--surface)`) e um leve `filter` opcional só se necessário (sem inverter cores — site externo já tem tema próprio).
- Adicionar tab "Bubbles" no array `tabs` (ícone `CircleDot` ou `Bubbles`).

## Detalhes técnicos

- Dependências novas: `react-markdown`, `remark-gfm` (instalar via `bun add` antes dos imports).
- Não tocar em `routeTree.gen.ts` — o plugin regenera ao adicionar `noticias.tsx` e `cryptobubbles.tsx`.
- Manter padrões de design tokens (`var(--accent)`, `var(--surface)` etc.) — sem cores hard-coded.
- Histórico de scans **somente** em localStorage para esta nova feature; não migrar nada do Supabase.
- O endpoint `/api/calendar` é leitura pública sem autenticação (sob `/api/` é ok pois apenas faz proxy de dado público); caso o ambiente exija `/api/public`, mover para lá.

## Fora do escopo

- Não mexer em `/relatorio` (já removido).
- Não alterar a lógica de IA/streaming — apenas a apresentação (markdown).
- Não alterar tabelas Supabase.
