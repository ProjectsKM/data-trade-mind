import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { z } from "zod";
import { corsHeaders, jsonResponse } from "@/lib/cors";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { verifySupabaseUser } from "@/lib/verify-supabase-jwt.server";
import { ASSETS, payoutForCategoria, categoriaForAtivo, calcLucro, type Categoria } from "@/lib/assets";
import type { MindCard, MonthlyReportData, ReportByCategory, WinReportData, WinReportPeriod } from "@/lib/mind-cards";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

const SYSTEM = `Você é o **OrionMind**, mentor digital oficial da **Orion Capital**. Responda SEMPRE em português brasileiro, de forma clara, simples, objetiva, humana, acolhedora, educativa e estratégica. Use **negrito** para termos importantes. Nunca seja robótico. Nunca prometa lucro garantido. Sempre reforce gerenciamento de risco, disciplina, leitura de contexto e controle emocional.

## IDENTIDADE
- Função: Mentor digital da Orion Capital. Tira dúvidas, orienta traders, explica operacional, apoia mentalidade, reforça gerenciamento e reduz erros emocionais.
- Regra final: "Nunca afastar o trader do processo. Sempre aproximar ele da evolução."
- NUNCA use bordões, frases de assinatura, slogans ou jargões repetitivos no final ou início das mensagens. Em especial, NUNCA escreva "Não é sorte, é método" ou variações. Responda de forma natural, sem mantras.

## CULTURA ORION
Respeito, disciplina, evolução contínua, mentalidade forte, ambiente saudável, profissionalismo. Não use palavrões nem agressividade. Não fale de bloqueios de contas ou assuntos internos sensíveis.

## PESSOAS-CHAVE
- **Gabriel Dutra**: Trader oficial e professor do grupo **Orion Capital**. É o mentor principal, referência técnica e responsável por ensinar o método Orion aos alunos. Quando perguntarem sobre ele, fale com respeito, deixando claro que é o **professor e trader líder** da Orion Capital.

## ALAVANCAGEM (RESPOSTA OBRIGATÓRIA)
Sempre que o usuário perguntar **o que é alavancagem**, **como funciona alavancagem**, ou pedir explicação sobre alavancagem, responda exatamente nesta linha de raciocínio (com suas palavras, sem inventar outras versões):
- **Alavancagem é quando o trader entra na conta do usuário e aumenta o capital dele através de operações.**
- Na **Orion Capital**, o usuário pode **ganhar uma alavancagem através das dinâmicas que temos em live**.
- Na **Orion Capital**, as **alavancagens são sempre seguras**.
- Para saber mais, encaminhe sempre o link do suporte oficial: **https://t.me/suporte_orioncapital**.
Nunca prometa lucro nem dê detalhes financeiros adicionais — apenas explique o conceito como acima e direcione ao suporte.

## BASE OPERACIONAL
- Timeframes de análise: **5m e 15m**. Entradas geralmente em **expiração de 1 minuto**.
- Estruturas: identificar **suporte/resistência**, **lateralização**, **tendência**, **confluências**, **retrações** e **rompimentos**.
- Mercado lateralizado: múltiplos toques, pavios, rejeição de preço, retração.
- Mercado em tendência: operar a favor do fluxo, rompimentos com continuidade.
- Estratégia de retração: esperar confirmação e rejeição antes de entrar.
- Estratégia de rompimento: entrar após quebra de nível com continuidade.

## GERENCIAMENTO (PADRÃO ORION)
- Entrada inicial: **1% do capital**.
- 1ª proteção: **2x a entrada inicial**.
- 2ª proteção: **2x a 1ª proteção**.
- Máximo **2 proteções**. Win recupera, loss é considerado loss completo.
- Stop Loss diário: **máximo 2 loss completos** — depois para de operar.
- Stop Win diário: entre **3% e 6% do capital** — depois encerra para preservar.

## PRICE ACTION (CONHECIMENTO TÉCNICO)
Use price action puro como base de leitura de mercado:
- **Estrutura de mercado**: HH/HL (alta), LH/LL (baixa), lateralização entre topos e fundos.
- **Suporte e resistência**: zonas com múltiplos toques, mais fortes quanto mais testadas e respeitadas.
- **Oferta e demanda**: zonas de origem de movimento impulsivo (base antes de impulso).
- **Candles de reversão**: pin bar, martelo, estrela cadente, engolfo de alta/baixa, doji em zona-chave.
- **Padrões de continuidade**: inside bar, bandeiras, triângulos, pull-back em tendência.
- **Padrões de reversão**: topo/fundo duplo, ombro-cabeça-ombro, falha de rompimento (fakeout).
- **Pavios e rejeições**: pavios longos em S/R indicam absorção/rejeição.
- **Liquidez**: o preço busca topos/fundos anteriores para "varrer stops" antes do movimento real.
- **Confluências**: alinhamento de S/R + estrutura + candle de confirmação + timeframe maior.
- **Confirmação**: nunca entrar antes do candle de gatilho fechar; evitar antecipar.
- **Contexto**: sempre ler o timeframe maior (15m) antes de operar o menor (5m → 1m).

## POSTURA EMOCIONAL
- Trader frustrado → acolher, normalizar, reduzir pressão.
- Trader querendo desistir → reforçar processo e evolução gradual.
- Após loss → normalizar, reforçar gerenciamento, evitar impulsividade.
- Ansiedade → desacelerar, reforçar paciência.

## REFORÇAR SEMPRE
Paciência, gerenciamento, leitura de contexto, confirmação antes da entrada, disciplina, controle emocional, foco em consistência. Evitar overtrade, ansiedade e recuperação impulsiva.

Você tem memória de toda a conversa e pode referenciar mensagens anteriores.

## REGISTRAR OPERAÇÕES NA PLANILHA (FERRAMENTA register_trade)
Você tem uma ferramenta chamada **register_trade** que adiciona uma operação na planilha de gestão do usuário.
- USE quando o usuário pedir claramente para "registrar", "anotar", "adicionar", "lançar" uma operação na planilha.
- NÃO use sem pedido explícito.
- Campos obrigatórios: **ativo**, **dir** (COMPRA ou VENDA), **valor** (em USD) e **res** (WIN ou LOSS).
- Campos opcionais: **payout** (se omitido, usa o padrão da categoria: Cripto 86%, Forex 85%, Ações 83%) e **obs**.
- Ativos válidos por categoria:
  - Cripto: BTC/USD, XRP/USD, BCH/USD, LTC/USD, ETH/USD, BNB/USD, SOL/USD.
  - Forex: GBP/AUD, EUR/NZD, AUD/CAD, AUD/NZD, AUD/JPY, CAD/CHF, CAD/JPY, CHF/JPY, EUR/CHF, EUR/AUD, EUR/CAD, EUR/GBP, EUR/USD, NZD/CHF, USD/JPY, NZD/CAD.
  - Ações: Apple, Amazon, McDonalds, Microsoft, Tesla.
- Se o usuário disser apenas "BTC", normalize para "BTC/USD". Se o ativo for desconhecido, **pergunte** antes de chamar.
- Se faltar **qualquer** campo obrigatório (ativo, direção, valor ou resultado), **pergunte ao usuário** de forma breve e objetiva antes de chamar a ferramenta. Nunca invente valores.
- Após registrar com sucesso, NÃO repita os dados gravados em texto — o sistema mostra automaticamente um card visual com todas as informações da operação. Apenas dê uma resposta MUITO curta (no máximo 1 frase), confirmando rapidamente ou sugerindo o próximo passo. Exemplos válidos: "Pronto! Lembre-se da gestão para a próxima.", "Anotado.", "Boa! Continue disciplinado.". NÃO escreva nada como "Operação registrada: BTC/USD COMPRA $50…" — isso seria duplicado com o card.`;
// ## EDITAR / EXCLUIR OPERAÇÕES + RELATÓRIOS
const SYSTEM_EDIT = `
## EDITAR OU EXCLUIR OPERAÇÕES (update_trade / delete_trade)
Você também pode editar (**update_trade**) ou excluir (**delete_trade**) operações que JÁ EXISTEM na planilha do usuário.
- O contexto do sistema sempre traz as últimas operações com o **id** exato (uuid). Use esse id ao chamar a ferramenta.
- Quando o usuário disser algo como "na verdade entrei com 60 e não 80", identifique a operação mais provável (geralmente a mais recente que bate com a descrição) e use **update_trade** com apenas os campos que mudam.
- Se houver mais de uma operação que pode ser a referenciada, **pergunte** ao usuário qual delas antes de chamar a ferramenta.
- Para **delete_trade**, peça **confirmação clara** antes de excluir.
- Para **register_trade**: se a banca ainda não estiver definida, NÃO chame a ferramenta — peça primeiro para o usuário definir a banca em /gestao.
- Após update_trade ou delete_trade com sucesso, NÃO repita os dados em texto — o sistema mostra automaticamente um card. Apenas confirme em 1 frase curta.

## RELATÓRIOS (get_monthly_report / get_win_report)
Quando o usuário pedir **relatório**, **resumo**, **balanço**, ou perguntar sobre **performance** em algum período, use a ferramenta apropriada:
- **get_monthly_report**: para "relatório do mês", "resumo mensal", "como foi o mês". Sem parâmetros (pega o mês atual). Mostra total de operações, win rate, lucro, ranking por categoria.
- **get_win_report**: para "quantos wins eu tive hoje/essa semana/esse mês", "minhas vitórias", "balanço de wins". Aceita parâmetro \`period\` (today | week | month | all).
- Após a ferramenta executar, NÃO repita os dados em texto — o card visual já mostra tudo. Apenas faça um comentário interpretativo curto (1-2 frases) com tom de mentor: "Bom mês, mas atenção ao drawdown na semana 3.", "Win rate consistente — mantenha a disciplina.", "Sequência negativa — pare de operar hoje e reveja o setup.". NUNCA liste os números do relatório no texto.
- Se o usuário ainda não tem operações registradas, a ferramenta retorna sem dados — nesse caso, responda sugerindo registrar a primeira operação.
`;

const Body = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(8000) })).min(1).max(40),
  banca: z.number().positive().nullable().optional(),
  recentTrades: z.array(z.object({
    id: z.string(),
    ativo: z.string(),
    data: z.string(),
    dir: z.string(),
    valor: z.number(),
    payout: z.number(),
    res: z.string(),
    lucro: z.number(),
    obs: z.string().nullable().optional(),
  })).max(50).optional(),
});

const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "register_trade",
      description: "Registra uma operação na planilha de gestão do usuário. Use somente quando o usuário pedir explicitamente, e somente quando tiver todos os campos obrigatórios.",
      parameters: {
        type: "object",
        properties: {
          ativo: { type: "string", description: "Nome do ativo. Ex: BTC/USD, EUR/USD, Apple." },
          dir: { type: "string", enum: ["COMPRA", "VENDA"], description: "Direção da operação." },
          valor: { type: "number", description: "Valor da entrada em USD. Número positivo." },
          res: { type: "string", enum: ["WIN", "LOSS"], description: "Resultado da operação." },
          payout: { type: "number", description: "Payout em %. Opcional — se omitido usa padrão da categoria." },
          obs: { type: "string", description: "Observação opcional." },
        },
        required: ["ativo", "dir", "valor", "res"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "update_trade",
      description: "Edita uma operação existente na planilha. Use o id de uma das operações recentes listadas no contexto. Só envie os campos que devem mudar. Lucro e payout são recalculados automaticamente quando valor, payout ou resultado mudam.",
      parameters: {
        type: "object",
        properties: {
          id: { type: "string", description: "ID exato da operação (uuid) a editar." },
          ativo: { type: "string" },
          dir: { type: "string", enum: ["COMPRA", "VENDA"] },
          valor: { type: "number" },
          res: { type: "string", enum: ["WIN", "LOSS"] },
          payout: { type: "number" },
          obs: { type: "string" },
        },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "delete_trade",
      description: "Exclui uma operação da planilha pelo id. Use somente após confirmação explícita do usuário.",
      parameters: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_monthly_report",
      description: "Gera relatório completo do mês: total de operações, win rate, lucro acumulado e quebra por categoria de ativo. Use quando o usuário pedir relatório mensal, resumo do mês ou similar.",
      parameters: {
        type: "object",
        properties: {
          month: {
            type: "string",
            description: "Mês alvo no formato YYYY-MM. Omita ou use 'current' para o mês corrente. Use 'previous' para o mês anterior.",
          },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_win_report",
      description: "Gera relatório de wins/losses em um período. Use quando o usuário pedir balanço de vitórias, quantos wins teve no dia/semana/mês, ou histórico de resultados.",
      parameters: {
        type: "object",
        properties: {
          period: {
            type: "string",
            enum: ["today", "week", "month", "all"],
            description: "Período do relatório. 'today' = hoje, 'week' = últimos 7 dias, 'month' = últimos 30 dias, 'all' = todo o histórico.",
          },
        },
        required: ["period"],
        additionalProperties: false,
      },
    },
  },
];

function normalizeAtivo(raw: string): { ativo: string; categoria: Categoria } | null {
  const up = raw.trim().toUpperCase();
  // exact match across all categories
  for (const [cat, list] of Object.entries(ASSETS) as [Categoria, string[]][]) {
    const hit = list.find((a) => a.toUpperCase() === up);
    if (hit) return { ativo: hit, categoria: cat };
  }
  // try "BTC" -> "BTC/USD"
  if (!up.includes("/")) {
    const withUsd = `${up}/USD`;
    for (const [cat, list] of Object.entries(ASSETS) as [Categoria, string[]][]) {
      const hit = list.find((a) => a.toUpperCase() === withUsd);
      if (hit) return { ativo: hit, categoria: cat };
    }
    // ações por nome partial
    const acao = ASSETS.ACOES.find((a) => a.toUpperCase() === up);
    if (acao) return { ativo: acao, categoria: "ACOES" };
  }
  // fallback: try categoriaForAtivo as-is
  const cat = categoriaForAtivo(raw);
  if (cat) return { ativo: raw, categoria: cat };
  return null;
}

const TradeArgs = z.object({
  ativo: z.string().min(1).max(40),
  dir: z.enum(["COMPRA", "VENDA"]),
  valor: z.number().positive().max(1_000_000),
  res: z.enum(["WIN", "LOSS"]),
  payout: z.number().min(1).max(1000).optional(),
  obs: z.string().max(500).optional(),
});

const UpdateArgs = z.object({
  id: z.string().uuid(),
  ativo: z.string().min(1).max(40).optional(),
  dir: z.enum(["COMPRA", "VENDA"]).optional(),
  valor: z.number().positive().max(1_000_000).optional(),
  res: z.enum(["WIN", "LOSS"]).optional(),
  payout: z.number().min(1).max(1000).optional(),
  obs: z.string().max(500).optional(),
});

const DeleteArgs = z.object({ id: z.string().uuid() });
const MonthlyReportArgs = z.object({ month: z.string().optional() });
const WinReportArgs = z.object({ period: z.enum(["today", "week", "month", "all"]) });

type ToolResult = { ok: boolean; message: string; card?: MindCard };

async function executeRegisterTrade(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  rawArgs: unknown,
  banca: number | null | undefined,
): Promise<ToolResult> {
  if (!banca || banca <= 0) {
    return { ok: false, message: "BANCA_NAO_DEFINIDA: O usuário ainda não definiu a banca inicial em /gestao. Peça para ele definir a banca antes de registrar operações." };
  }
  const parsed = TradeArgs.safeParse(rawArgs);
  if (!parsed.success) {
    return { ok: false, message: `Argumentos inválidos: ${parsed.error.issues.map(i => i.message).join("; ")}` };
  }
  const a = parsed.data;
  const norm = normalizeAtivo(a.ativo);
  if (!norm) {
    return { ok: false, message: `Ativo "${a.ativo}" não reconhecido. Peça ao usuário um ativo válido.` };
  }
  const payout = a.payout ?? payoutForCategoria(norm.categoria);
  const lucro = calcLucro(a.valor, payout, a.res);
  const { data, error } = await supabase
    .from("trades")
    .insert({
      user_id: userId,
      ativo: norm.ativo,
      data: new Date().toISOString(),
      dir: a.dir,
      valor: a.valor,
      payout,
      res: a.res,
      lucro,
      obs: a.obs ?? null,
    } as never)
    .select()
    .single();
  if (error || !data) {
    return { ok: false, message: `Falha ao inserir no banco: ${error?.message ?? "desconhecido"}` };
  }
  return {
    ok: true,
    message: `Operação registrada: ${norm.ativo} ${a.dir} $${a.valor} payout ${payout}% ${a.res} → ${lucro >= 0 ? "+" : ""}$${lucro.toFixed(2)}`,
    card: {
      type: "trade_added",
      trade: {
        id: data.id as string,
        ativo: norm.ativo,
        dir: a.dir,
        valor: a.valor,
        payout,
        res: a.res,
        lucro,
        obs: a.obs ?? null,
        data: (data.data ?? new Date().toISOString()) as string,
      },
    },
  };
}

async function executeUpdateTrade(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  rawArgs: unknown,
): Promise<ToolResult> {
  const parsed = UpdateArgs.safeParse(rawArgs);
  if (!parsed.success) return { ok: false, message: `Argumentos inválidos: ${parsed.error.issues.map(i => i.message).join("; ")}` };
  const a = parsed.data;
  const { data: existing, error: e1 } = await supabase
    .from("trades").select("*").eq("id", a.id).eq("user_id", userId).maybeSingle();
  if (e1 || !existing) return { ok: false, message: `Operação ${a.id} não encontrada.` };

  let ativo = existing.ativo as string;
  let categoria = categoriaForAtivo(ativo);
  if (a.ativo) {
    const norm = normalizeAtivo(a.ativo);
    if (!norm) return { ok: false, message: `Ativo "${a.ativo}" não reconhecido.` };
    ativo = norm.ativo;
    categoria = norm.categoria;
  }
  const valor = a.valor ?? Number(existing.valor);
  const res = (a.res ?? existing.res) as "WIN" | "LOSS";
  const payout = a.payout ?? (a.ativo ? payoutForCategoria(categoria ?? "CRIPTO") : Number(existing.payout));
  const lucro = calcLucro(valor, payout, res);
  const dir = (a.dir ?? existing.dir) as "COMPRA" | "VENDA";

  const patch: Record<string, unknown> = { ativo, valor, payout, res, lucro };
  if (a.dir) patch.dir = a.dir;
  if (a.obs !== undefined) patch.obs = a.obs;

  const { error: e2 } = await supabase.from("trades").update(patch as never).eq("id", a.id).eq("user_id", userId);
  if (e2) return { ok: false, message: `Falha ao atualizar: ${e2.message}` };
  return {
    ok: true,
    message: `Operação atualizada: ${ativo} ${dir} $${valor} payout ${payout}% ${res} → ${lucro >= 0 ? "+" : ""}$${lucro.toFixed(2)}`,
    card: {
      type: "trade_updated",
      trade: {
        id: a.id,
        ativo,
        dir,
        valor,
        payout,
        res,
        lucro,
        obs: (a.obs !== undefined ? a.obs : existing.obs) ?? null,
        data: existing.data as string,
      },
    },
  };
}

async function executeDeleteTrade(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  rawArgs: unknown,
): Promise<ToolResult> {
  const parsed = DeleteArgs.safeParse(rawArgs);
  if (!parsed.success) return { ok: false, message: "ID inválido." };
  const { data: existing, error: e1 } = await supabase
    .from("trades").select("ativo, valor, lucro, res").eq("id", parsed.data.id).eq("user_id", userId).maybeSingle();
  if (e1 || !existing) return { ok: false, message: `Operação ${parsed.data.id} não encontrada.` };
  const { error } = await supabase.from("trades").delete().eq("id", parsed.data.id).eq("user_id", userId);
  if (error) return { ok: false, message: `Falha ao excluir: ${error.message}` };
  return {
    ok: true,
    message: "Operação excluída com sucesso.",
    card: {
      type: "trade_deleted",
      ativo: existing.ativo as string,
      valor: Number(existing.valor),
      lucro: Number(existing.lucro),
      res: existing.res as "WIN" | "LOSS",
    },
  };
}

function categoryGroupOf(ativo: string): ReportByCategory["categoria"] {
  const cat = categoriaForAtivo(ativo);
  if (cat === "CRIPTO" || cat === "FOREX" || cat === "ACOES") return cat;
  return "OUTROS";
}

function resolveMonthRange(monthArg: string | undefined): { from: Date; to: Date; label: string } {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); // 0-indexed
  const normalized = (monthArg ?? "current").toLowerCase();
  if (normalized === "previous") {
    if (month === 0) { month = 11; year -= 1; } else { month -= 1; }
  } else if (/^\d{4}-\d{2}$/.test(normalized)) {
    const [yy, mm] = normalized.split("-").map(Number);
    year = yy;
    month = mm - 1;
  }
  const from = new Date(year, month, 1, 0, 0, 0, 0);
  const to = new Date(year, month + 1, 1, 0, 0, 0, 0);
  const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  return { from, to, label: `${monthNames[month]}/${year}` };
}

async function executeMonthlyReport(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  rawArgs: unknown,
): Promise<ToolResult> {
  const parsed = MonthlyReportArgs.safeParse(rawArgs);
  if (!parsed.success) return { ok: false, message: "Parâmetros inválidos." };
  const { from, to, label } = resolveMonthRange(parsed.data.month);
  const { data, error } = await supabase
    .from("trades")
    .select("ativo, res, lucro, data")
    .eq("user_id", userId)
    .gte("data", from.toISOString())
    .lt("data", to.toISOString());
  if (error) return { ok: false, message: `Falha ao consultar trades: ${error.message}` };

  type Row = { ativo: string; res: string; lucro: number; data: string };
  const rows = (data ?? []) as Row[];

  const wins = rows.filter((r) => r.res === "WIN").length;
  const losses = rows.filter((r) => r.res === "LOSS").length;
  const closed = wins + losses;
  const lucroTotal = rows.reduce((a, r) => a + Number(r.lucro || 0), 0);
  const winRate = closed ? Math.round((wins / closed) * 100) : 0;

  const winsByAsset = new Map<string, number>();
  for (const r of rows) if (r.res === "WIN") winsByAsset.set(r.ativo, (winsByAsset.get(r.ativo) ?? 0) + 1);
  let melhorAtivo: string | null = null;
  let topWins = 0;
  for (const [a, n] of winsByAsset) if (n > topWins) { topWins = n; melhorAtivo = a; }

  const byCatMap = new Map<ReportByCategory["categoria"], ReportByCategory>();
  for (const r of rows) {
    const cat = categoryGroupOf(r.ativo);
    const cur = byCatMap.get(cat) ?? { categoria: cat, count: 0, wins: 0, lucro: 0 };
    cur.count += 1;
    if (r.res === "WIN") cur.wins += 1;
    cur.lucro += Number(r.lucro || 0);
    byCatMap.set(cat, cur);
  }
  const byCategory = Array.from(byCatMap.values()).sort((a, b) => b.count - a.count);

  const report: MonthlyReportData = {
    label,
    totalOps: rows.length,
    wins,
    losses,
    winRate,
    lucroTotal: +lucroTotal.toFixed(2),
    melhorAtivo,
    byCategory,
  };
  return {
    ok: true,
    message: `Relatório de ${label}: ${rows.length} operações, ${wins} wins, ${losses} losses, lucro ${lucroTotal.toFixed(2)}.`,
    card: { type: "monthly_report", report },
  };
}

function resolveWinPeriod(period: WinReportPeriod): { from: Date; label: string } {
  const now = new Date();
  if (period === "today") {
    const from = new Date(now); from.setHours(0, 0, 0, 0);
    return { from, label: "Hoje" };
  }
  if (period === "week") {
    const from = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    return { from, label: "Últimos 7 dias" };
  }
  if (period === "month") {
    const from = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
    return { from, label: "Últimos 30 dias" };
  }
  return { from: new Date(0), label: "Histórico completo" };
}

async function executeWinReport(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  rawArgs: unknown,
): Promise<ToolResult> {
  const parsed = WinReportArgs.safeParse(rawArgs);
  if (!parsed.success) return { ok: false, message: "Período inválido." };
  const { from, label } = resolveWinPeriod(parsed.data.period);
  const { data, error } = await supabase
    .from("trades")
    .select("res, lucro, data")
    .eq("user_id", userId)
    .gte("data", from.toISOString())
    .order("data", { ascending: true });
  if (error) return { ok: false, message: `Falha ao consultar trades: ${error.message}` };

  type Row = { res: string; lucro: number; data: string };
  const rows = (data ?? []) as Row[];
  const wins = rows.filter((r) => r.res === "WIN").length;
  const losses = rows.filter((r) => r.res === "LOSS").length;
  const closed = wins + losses;
  const lucroTotal = rows.reduce((a, r) => a + Number(r.lucro || 0), 0);
  const winRate = closed ? Math.round((wins / closed) * 100) : 0;

  let bestStreak = 0;
  let worstStreak = 0;
  let curWin = 0;
  let curLoss = 0;
  for (const r of rows) {
    if (r.res === "WIN") { curWin += 1; curLoss = 0; if (curWin > bestStreak) bestStreak = curWin; }
    else if (r.res === "LOSS") { curLoss += 1; curWin = 0; if (curLoss > worstStreak) worstStreak = curLoss; }
  }

  const report: WinReportData = {
    period: parsed.data.period,
    label,
    totalOps: rows.length,
    wins,
    losses,
    winRate,
    lucroTotal: +lucroTotal.toFixed(2),
    bestStreak,
    worstStreak,
  };
  return {
    ok: true,
    message: `Relatório (${label}): ${wins} wins, ${losses} losses, win-rate ${winRate}%, lucro ${lucroTotal.toFixed(2)}.`,
    card: { type: "win_report", report },
  };
}

export const Route = createFileRoute("/api/ai-mind")({
  server: {
    handlers: {
      OPTIONS: async ({ request }: { request: Request }) =>
        new Response(null, { status: 204, headers: corsHeaders(request) }),
      POST: async ({ request }: { request: Request }) => {
        const userId = await verifySupabaseUser(request);
        if (!userId) return jsonResponse({ ok: false, error: "Não autorizado." }, 401, request);

        // Premium Anual obrigatório.
        const { data: plan } = await supabaseAdmin
          .from("user_plans").select("is_pro").eq("user_id", userId).maybeSingle();
        if (!plan?.is_pro) return jsonResponse({ ok: false, error: "Recurso exclusivo do Premium Anual." }, 402, request);

        let body: z.infer<typeof Body>;
        try { body = Body.parse(await request.json()); } catch { return jsonResponse({ ok: false, error: "Mensagens inválidas." }, 400, request); }
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) return jsonResponse({ ok: false, error: "API key não configurada." }, 500, request);

        const ctxParts: string[] = [];
        if (body.banca && body.banca > 0) {
          ctxParts.push(`Banca inicial definida pelo usuário: $${body.banca.toFixed(2)}.`);
        } else {
          ctxParts.push(`O usuário AINDA NÃO definiu a banca inicial em /gestao. Se ele pedir para registrar uma operação, peça primeiro para ele definir a banca lá.`);
        }
        if (body.recentTrades && body.recentTrades.length > 0) {
          const list = body.recentTrades.slice(0, 10).map((t) => {
            const dt = new Date(t.data).toLocaleString("pt-BR");
            return `- id=${t.id} | ${dt} | ${t.ativo} ${t.dir} $${t.valor} payout ${t.payout}% ${t.res} lucro $${t.lucro}${t.obs ? ` obs="${t.obs}"` : ""}`;
          }).join("\n");
          ctxParts.push(`Últimas operações do usuário (use o id exato para editar/excluir):\n${list}`);
        } else {
          ctxParts.push("O usuário ainda não tem operações registradas.");
        }
        const messages: Array<Record<string, unknown>> = [
          { role: "system", content: SYSTEM },
          { role: "system", content: SYSTEM_EDIT },
          { role: "system", content: ctxParts.join("\n\n") },
          ...body.messages.map((m) => ({ role: m.role, content: m.content })),
        ];

        const encoder = new TextEncoder();
        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            const send = (obj: unknown) =>
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(obj)}\n\n`));
            const sendDone = () => controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
            const pendingCards: MindCard[] = [];
            try {
              for (let iter = 0; iter < 4; iter++) {
                const r = await fetch(OPENAI_URL, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
                  body: JSON.stringify({
                    model: MODEL,
                    messages,
                    tools: TOOLS,
                    tool_choice: "auto",
                    max_tokens: 1500,
                    temperature: 0.6,
                    stream: true,
                  }),
                });
                if (!r.ok || !r.body) {
                  const txt = !r.ok ? await r.text().catch(() => "") : "";
                  console.error("ai-mind error", r.status, txt);
                  send({ error: r.status === 429 ? "Muitas mensagens em sequência. Aguarde." : "Falha ao consultar a IA." });
                  break;
                }

                const reader = r.body.getReader();
                const decoder = new TextDecoder();
                let buf = "";
                let assistantContent = "";
                const toolCalls = new Map<number, { id: string; type: "function"; function: { name: string; arguments: string } }>();
                let finishReason: string | undefined;

                streamLoop: while (true) {
                  const { value, done } = await reader.read();
                  if (done) break;
                  buf += decoder.decode(value, { stream: true });
                  const parts = buf.split("\n\n");
                  buf = parts.pop() ?? "";
                  for (const p of parts) {
                    const line = p.split("\n").find((l) => l.startsWith("data:"));
                    if (!line) continue;
                    const payload = line.slice(5).trim();
                    if (payload === "[DONE]") break streamLoop;
                    try {
                      const j = JSON.parse(payload) as {
                        choices?: Array<{
                          delta?: {
                            content?: string;
                            tool_calls?: Array<{
                              index: number;
                              id?: string;
                              type?: "function";
                              function?: { name?: string; arguments?: string };
                            }>;
                          };
                          finish_reason?: string;
                        }>;
                      };
                      const choice = j.choices?.[0];
                      if (!choice) continue;
                      const delta = choice.delta;
                      if (delta?.content) {
                        assistantContent += delta.content;
                        send({ delta: delta.content });
                      }
                      if (delta?.tool_calls) {
                        for (const tcDelta of delta.tool_calls) {
                          const idx = tcDelta.index;
                          let tc = toolCalls.get(idx);
                          if (!tc) {
                            tc = {
                              id: tcDelta.id ?? "",
                              type: "function",
                              function: { name: tcDelta.function?.name ?? "", arguments: "" },
                            };
                            toolCalls.set(idx, tc);
                          } else {
                            if (tcDelta.id) tc.id = tcDelta.id;
                            if (tcDelta.function?.name) tc.function.name = tcDelta.function.name;
                          }
                          if (tcDelta.function?.arguments) tc.function.arguments += tcDelta.function.arguments;
                        }
                      }
                      if (choice.finish_reason) finishReason = choice.finish_reason;
                    } catch { /* ignore malformed chunk */ }
                  }
                }

                if (finishReason === "tool_calls" && toolCalls.size > 0) {
                  const accumulated = Array.from(toolCalls.values());
                  messages.push({ role: "assistant", content: assistantContent, tool_calls: accumulated });
                  for (const tc of accumulated) {
                    let result: ToolResult;
                    let args: unknown = {};
                    try { args = JSON.parse(tc.function.arguments || "{}"); } catch { args = {}; }
                    if (tc.function.name === "register_trade") {
                      result = await executeRegisterTrade(supabaseAdmin, userId, args, body.banca ?? null);
                    } else if (tc.function.name === "update_trade") {
                      result = await executeUpdateTrade(supabaseAdmin, userId, args);
                    } else if (tc.function.name === "delete_trade") {
                      result = await executeDeleteTrade(supabaseAdmin, userId, args);
                    } else if (tc.function.name === "get_monthly_report") {
                      result = await executeMonthlyReport(supabaseAdmin, userId, args);
                    } else if (tc.function.name === "get_win_report") {
                      result = await executeWinReport(supabaseAdmin, userId, args);
                    } else {
                      result = { ok: false, message: `Ferramenta desconhecida: ${tc.function.name}` };
                    }
                    if (result.ok && result.card) {
                      pendingCards.push(result.card);
                    }
                    // Para o modelo, mandamos apenas o status sem o card (evita repetição).
                    messages.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify({ ok: result.ok, message: result.message }) });
                  }
                  continue;
                }

                break;
              }
              // Emite cards acumulados DEPOIS de todo o texto,
              // logo antes do [DONE] — evita buffering do CF Workers.
              for (const card of pendingCards) {
                send({ card });
              }
              sendDone();
            } catch (e) {
              console.error("ai-mind stream exception", e);
              send({ error: "Erro de conexão com a IA." });
              sendDone();
            } finally {
              try { controller.close(); } catch { /* already closed */ }
            }
          },
        });

        return new Response(stream, {
          status: 200,
          headers: {
            "Content-Type": "text/event-stream; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
            ...corsHeaders(request),
          },
        });
      },
    },
  },
});
