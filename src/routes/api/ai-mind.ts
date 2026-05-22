import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { z } from "zod";
import { corsHeaders, jsonResponse } from "@/lib/cors";
import { createClient } from "@supabase/supabase-js";
import { ASSETS, payoutForCategoria, categoriaForAtivo, calcLucro, type Categoria } from "@/lib/assets";

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
- Após registrar com sucesso, confirme em uma frase curta com os dados gravados (ativo, direção, valor, resultado, lucro/prejuízo).`;

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

async function executeRegisterTrade(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  rawArgs: unknown,
  banca: number | null | undefined,
): Promise<{ ok: boolean; message: string }> {
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
  };
}

async function executeUpdateTrade(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  rawArgs: unknown,
): Promise<{ ok: boolean; message: string }> {
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

  const patch: Record<string, unknown> = { ativo, valor, payout, res, lucro };
  if (a.dir) patch.dir = a.dir;
  if (a.obs !== undefined) patch.obs = a.obs;

  const { error: e2 } = await supabase.from("trades").update(patch as never).eq("id", a.id).eq("user_id", userId);
  if (e2) return { ok: false, message: `Falha ao atualizar: ${e2.message}` };
  return { ok: true, message: `Operação atualizada: ${ativo} ${patch.dir ?? existing.dir} $${valor} payout ${payout}% ${res} → ${lucro >= 0 ? "+" : ""}$${lucro.toFixed(2)}` };
}

async function executeDeleteTrade(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  userId: string,
  rawArgs: unknown,
): Promise<{ ok: boolean; message: string }> {
  const parsed = DeleteArgs.safeParse(rawArgs);
  if (!parsed.success) return { ok: false, message: "ID inválido." };
  const { error } = await supabase.from("trades").delete().eq("id", parsed.data.id).eq("user_id", userId);
  if (error) return { ok: false, message: `Falha ao excluir: ${error.message}` };
  return { ok: true, message: "Operação excluída com sucesso." };
}

export const Route = createFileRoute("/api/ai-mind")({
  server: {
    handlers: {
      OPTIONS: async ({ request }: { request: Request }) =>
        new Response(null, { status: 204, headers: corsHeaders(request) }),
      POST: async ({ request }: { request: Request }) => {
        const authHeader = request.headers.get("authorization");
        const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;
        if (!token || !supabaseUrl || !supabaseKey) return jsonResponse({ ok: false, error: "Não autorizado." }, 401, request);
        const supabase = createClient(supabaseUrl, supabaseKey, {
          auth: { storage: undefined, persistSession: false, autoRefreshToken: false },
          global: { headers: { Authorization: `Bearer ${token}` } },
        });
        const { data: claims, error: claimsErr } = await supabase.auth.getClaims(token);
        const userId = claims?.claims?.sub as string | undefined;
        if (claimsErr || !userId) return jsonResponse({ ok: false, error: "Não autorizado." }, 401, request);

        let body: z.infer<typeof Body>;
        try { body = Body.parse(await request.json()); } catch { return jsonResponse({ ok: false, error: "Mensagens inválidas." }, 400, request); }
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) return jsonResponse({ ok: false, error: "API key não configurada." }, 500, request);
        try {
          // Chat Completions with tool calling. Loop until model returns plain text.
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
            { role: "system", content: ctxParts.join("\n\n") },
            ...body.messages.map((m) => ({ role: m.role, content: m.content })),
          ];
          let reply = "";
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
              }),
            });
            if (!r.ok) {
              const txt = await r.text().catch(() => "");
              console.error("ai-mind error", r.status, txt);
              if (r.status === 429) return jsonResponse({ ok: false, error: "Muitas mensagens em sequência. Aguarde." }, 429, request);
              return jsonResponse({ ok: false, error: "Falha ao consultar a IA." }, 502, request);
            }
            const j = (await r.json()) as {
              choices?: Array<{
                message?: {
                  role: string;
                  content?: string | null;
                  tool_calls?: Array<{ id: string; type: "function"; function: { name: string; arguments: string } }>;
                };
                finish_reason?: string;
              }>;
            };
            const msg = j.choices?.[0]?.message;
            if (!msg) return jsonResponse({ ok: false, error: "Resposta vazia da IA." }, 502, request);

            if (msg.tool_calls && msg.tool_calls.length > 0) {
              // Push assistant message with tool calls, then execute each tool.
              messages.push({
                role: "assistant",
                content: msg.content ?? "",
                tool_calls: msg.tool_calls,
              });
              for (const tc of msg.tool_calls) {
                let result: { ok: boolean; message: string };
                if (tc.function.name === "register_trade") {
                  let args: unknown = {};
                  try { args = JSON.parse(tc.function.arguments || "{}"); } catch { args = {}; }
                  result = await executeRegisterTrade(supabase, userId, args, body.banca ?? null);
                } else if (tc.function.name === "update_trade") {
                  let args: unknown = {};
                  try { args = JSON.parse(tc.function.arguments || "{}"); } catch { args = {}; }
                  result = await executeUpdateTrade(supabase, userId, args);
                } else if (tc.function.name === "delete_trade") {
                  let args: unknown = {};
                  try { args = JSON.parse(tc.function.arguments || "{}"); } catch { args = {}; }
                  result = await executeDeleteTrade(supabase, userId, args);
                } else {
                  result = { ok: false, message: `Ferramenta desconhecida: ${tc.function.name}` };
                }
                messages.push({
                  role: "tool",
                  tool_call_id: tc.id,
                  content: JSON.stringify(result),
                });
              }
              continue; // loop to let the model summarize the result
            }

            reply = (msg.content ?? "").trim() || "Sem resposta.";
            break;
          }
          if (!reply) reply = "Sem resposta.";
          return jsonResponse({ ok: true, reply }, 200, request);
        } catch (e) {
          console.error("ai-mind exception", e);
          return jsonResponse({ ok: false, error: "Erro de conexão com a IA." }, 502, request);
        }
      },
    },
  },
});
