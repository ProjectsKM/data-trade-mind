# Plano de implementação

## 1. `/cryptobubbles` — filtrar ativos no iframe
**Arquivo:** `src/routes/_app/cryptobubbles.tsx`
- Trocar o `src` do `<iframe>` para `https://cryptobubbles.net/#currencies=1,1027,52,1831,2,5426,1839`.
- Manter todo o resto do design (PageHeader, container, classes). Sem outras mudanças.

## 2. `/mind` — remover bordão + microfone com transcrição

### 2a. Remover "NÃO É SORTE, É MÉTODO"
**Arquivo:** `src/routes/api/ai-mind.ts`
- Retirar a linha do bordão do system prompt e qualquer instrução que mande o bot encerrar com a frase. Reforçar no prompt: "não use bordões nem frases de assinatura ao final".

### 2b. Botão de microfone + Speech-to-text
**Arquivo:** `src/routes/_app/mind.tsx` + novo `src/routes/api/transcribe.ts`
- Novo server route `POST /api/transcribe`:
  - Autenticado via `verifySupabaseUser`.
  - Recebe `multipart/form-data` com `audio` (webm/opus do MediaRecorder).
  - Encaminha para OpenAI `https://api.openai.com/v1/audio/transcriptions` com `model=gpt-4o-mini-transcribe` (Whisper-class), idioma `pt`.
  - Retorna `{ ok, text }`.
- No input do chat (área já existente), adicionar:
  - Ícone de microfone (lucide `Mic` / `Square` / `Trash2`).
  - Ao clicar: pedir permissão, iniciar `MediaRecorder`.
  - Enquanto grava: barra animada estilo espectrograma (várias barras com altura aleatória via `requestAnimationFrame` lendo `AnalyserNode.getByteFrequencyData`), timer mm:ss, e dois botões:
    - **Pausar/Retomar** (`MediaRecorder.pause()` / `.resume()`).
    - **Descartar** (parar sem enviar, fechar stream).
    - **Enviar** (parar, montar `Blob`, enviar para `/api/transcribe`, e ao receber o texto, colocar em `setInput` para o usuário revisar e mandar — sem auto-envio).
  - Loading state enquanto transcreve.

## 3. `/gestao` — dropdowns de ativos, banca inicial, payout automático, % vs valor, observações visíveis, só Win/Loss

**Arquivo:** `src/routes/_app/gestao.tsx` (+ usar `Select` de `@/components/ui/select`)

### 3a. Banca inicial obrigatória
- Persistir em `localStorage` (`orion.gestao.banca`). Se não houver banca definida, ao abrir a aba **Operações** mostrar card centralizado com input "Defina sua banca inicial (USD)" e botão Salvar; só liberar o formulário depois.
- Botão pequeno "Editar banca" no topo da aba para alterar.

### 3b. Dropdown de ativo por categoria
- Novo state `categoria: "CRIPTO" | "FOREX" | "ACOES"` com `Select`.
- Listas:
  - Cripto: BTC/USD, XRP/USD, BCH/USD, LTC/USD, ETH/USD, BNB/USD, SOL/USD.
  - Forex (Opções): GBP/AUD, EUR/NZD, AUD/CAD, AUD/NZD, AUD/JPY, CAD/CHF, CAD/JPY, CHF/JPY, EUR/CHF, EUR/AUD, EUR/CAD, EUR/GBP, EUR/USD, NZD/CHF, USD/JPY, NZD/CAD.
  - Ações: Apple, Amazon, McDonalds, Microsoft, Tesla.
- Segundo `Select` com os ativos da categoria selecionada (substitui o `Input` de ativo livre).

### 3c. Payout automático por categoria
- Cripto → 86, Forex/Opções → 85, Ações → 83.
- Quando a categoria muda, atualizar `form.payout`. Campo Payout continua editável caso o usuário queira ajustar.

### 3d. Valor em $ ou %
- Toggle ($/%) ao lado do input valor. Quando `%`, o valor enviado é `banca * (pct/100)`.
- Persistir preferência em `localStorage`.

### 3e. Só Win/Loss
- Remover opção "Aberta" do select de resultado (default WIN). Remover botão de "marcar como aberto" da tabela. Tipos: importação CSV ainda aceita OPEN para retrocompatibilidade, mas formulário só oferece WIN/LOSS.

### 3f. Observação visível
- Na tabela de operações, adicionar nova coluna "Obs" mostrando `t.obs` truncado com `title` no hover (tooltip nativo). Em mobile, ícone de balão que abre um popover/`Dialog` simples com o texto completo.

## 4. `/scan` — botão "Registrar operação" no resultado

**Arquivo:** `src/routes/_app/scan.tsx`
- No `ResultView`, abaixo do botão "Nova análise", adicionar botão destacado **"Registrar operação"** (ícone `ClipboardList`, estilo `Button` primário com gradiente accent).
- Ao clicar: abre `Dialog` (shadcn) com mini-formulário pré-preenchido a partir do `ScanResult`:
  - Categoria (Cripto/Forex/Ações) + Ativo (dropdown da categoria — mesmas listas da Gestão; default tenta casar `r.ativo`).
  - Direção (Compra/Venda) — default `r.direcao`.
  - Valor com toggle $/% (usa banca de `localStorage`; se vazia, exibir aviso para definir na Gestão).
  - Payout (auto pela categoria, editável).
  - Resultado (Win/Loss).
  - Observação.
- Submit chama `addTrade(...)` do `useAppState` com `calcLucro` local; toast de sucesso; fecha dialog.

## Detalhes técnicos

- Extrair as listas de ativos e a função `payoutForCategoria` para `src/lib/assets.ts` (compartilhado entre Gestão e Scan).
- Extrair `calcLucro` para `src/lib/assets.ts` também, para evitar duplicação entre Gestão e o dialog do Scan.
- Banca: helper `getBanca()/setBanca()` em `src/lib/assets.ts` lendo `localStorage` com guards SSR.
- Transcrição: usar modelo `gpt-4o-mini-transcribe` da OpenAI (mesma API key já existente `OPENAI_API_KEY`). Limite de tamanho de áudio: 25 MB; validar no servidor.
- Não alterar schema do banco — `trades.obs` já existe e suporta observação.
- Manter o visual atual (tokens, surfaces, accents); apenas adicionar componentes coerentes.
