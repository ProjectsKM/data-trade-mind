import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { z } from "zod";
import { corsHeaders, jsonResponse } from "@/lib/cors";
import { verifySupabaseUser } from "@/lib/verify-supabase-jwt.server";

const OPENAI_URL = "https://api.openai.com/v1/responses";
const MODEL = "gpt-4o-mini";

const SYSTEM = `Você é o **OrionMind**, mentor digital oficial da **Orion Capital**. Responda SEMPRE em português brasileiro, de forma clara, simples, objetiva, humana, acolhedora, educativa e estratégica. Use **negrito** para termos importantes. Nunca seja robótico. Nunca prometa lucro garantido. Sempre reforce gerenciamento de risco, disciplina, leitura de contexto e controle emocional.

## IDENTIDADE
- Função: Mentor digital da Orion Capital. Tira dúvidas, orienta traders, explica operacional, apoia mentalidade, reforça gerenciamento e reduz erros emocionais.
- Bordão: "NÃO É SORTE, É MÉTODO!"
- Regra final: "Nunca afastar o trader do processo. Sempre aproximar ele da evolução."

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

Você tem memória de toda a conversa e pode referenciar mensagens anteriores.`;

const Body = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(8000) })).min(1).max(40),
});

export const Route = createFileRoute("/api/ai-mind")({
  server: {
    handlers: {
      OPTIONS: async ({ request }: { request: Request }) =>
        new Response(null, { status: 204, headers: corsHeaders(request) }),
      POST: async ({ request }: { request: Request }) => {
        const userId = await verifySupabaseUser(request);
        if (!userId) return jsonResponse({ ok: false, error: "Não autorizado." }, 401, request);

        let body: z.infer<typeof Body>;
        try { body = Body.parse(await request.json()); } catch { return jsonResponse({ ok: false, error: "Mensagens inválidas." }, 400, request); }
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) return jsonResponse({ ok: false, error: "API key não configurada." }, 500, request);
        try {
          const input = [
            { role: "system" as const, content: SYSTEM },
            ...body.messages.map((m) => ({ role: m.role, content: m.content })),
          ];
          const r = await fetch(OPENAI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({ model: MODEL, input, max_output_tokens: 1500, stream: true }),
          });
          if (!r.ok || !r.body) {
            const txt = await r.text().catch(() => "");
            console.error("ai-mind error", r.status, txt);
            if (r.status === 429) return jsonResponse({ ok: false, error: "Muitas mensagens em sequência. Aguarde." }, 429, request);
            return jsonResponse({ ok: false, error: "Falha ao consultar a IA." }, 502, request);
          }
          // Proxy SSE stream and re-emit only delta text as simple "data: <chunk>" lines.
          const reader = r.body.getReader();
          const decoder = new TextDecoder();
          const encoder = new TextEncoder();
          const stream = new ReadableStream<Uint8Array>({
            async start(controller) {
              let buffer = "";
              try {
                while (true) {
                  const { value, done } = await reader.read();
                  if (done) break;
                  buffer += decoder.decode(value, { stream: true });
                  const events = buffer.split("\n\n");
                  buffer = events.pop() ?? "";
                  for (const evt of events) {
                    const line = evt.split("\n").find((l) => l.startsWith("data:"));
                    if (!line) continue;
                    const payload = line.slice(5).trim();
                    if (!payload || payload === "[DONE]") continue;
                    try {
                      const j = JSON.parse(payload);
                      if (j.type === "response.output_text.delta" && typeof j.delta === "string") {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ delta: j.delta })}\n\n`));
                      } else if (j.type === "response.error") {
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: j.error?.message || "Erro" })}\n\n`));
                      }
                    } catch { /* ignore */ }
                  }
                }
                controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
              } catch (e) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Erro de stream." })}\n\n`));
              } finally {
                controller.close();
              }
            },
          });
          return new Response(stream, {
            status: 200,
            headers: {
              ...corsHeaders(request),
              "Content-Type": "text/event-stream; charset=utf-8",
              "Cache-Control": "no-cache, no-transform",
              "Connection": "keep-alive",
            },
          });
        } catch (e) {
          console.error("ai-mind exception", e);
          return jsonResponse({ ok: false, error: "Erro de conexão com a IA." }, 502, request);
        }
      },
    },
  },
});
