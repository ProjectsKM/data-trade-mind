import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { z } from "zod";
import { corsHeaders, jsonResponse } from "@/lib/cors";
import { verifySupabaseUser } from "@/lib/verify-supabase-jwt.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

const Body = z.object({
  imageBase64: z.string().min(100),
  mediaType: z.enum(["image/png", "image/jpeg", "image/webp", "image/gif"]),
  durationMin: z.number().int().min(1).max(240),
});

function buildPrompt(durationMin: number, baseDate: Date) {
  const fmt = (off: number) => {
    const d = new Date(baseDate.getTime() + off * 60000);
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  const entrada = fmt(durationMin);
  const prot1 = fmt(durationMin * 2);
  const prot2 = fmt(durationMin * 3);
  return {
    text: `Você é um analista de opções binárias. Analise este gráfico e retorne SOMENTE JSON válido, sem markdown.

{"ativo":"nome do ativo ou Não identificado","timeframe":"M1, M5, M15, M30, H1, H4 ou D1","direcao":"COMPRA ou VENDA","confianca":número inteiro de 0 a 100,"assertividade":"frase curta e direta sobre o nível de confiança","tendencia":"Alta, Baixa ou Lateral","vies":"Bullish, Bearish ou Neutro","suporte":"nível de suporte principal","resistencia":"nível de resistência principal","padroes":["padrão 1","padrão 2"],"indicadores":["indicador 1 e sinal","indicador 2 e sinal"],"justificativa":"Em 3 a 4 frases simples e diretas, sem termos difíceis: diga por que o sinal é de compra ou venda, o que você viu no gráfico que aponta isso, e o que o trader deve observar durante a operação.","riscos":["risco 1","risco 2","risco 3"],"entrada":"${entrada}","protecao1":"${prot1}","protecao2":"${prot2}"}`,
    entrada, prot1, prot2,
  };
}

export const Route = createFileRoute("/api/ai-scan")({
  server: {
    handlers: {
      OPTIONS: async ({ request }: { request: Request }) =>
        new Response(null, { status: 204, headers: corsHeaders(request) }),
      POST: async ({ request }: { request: Request }) => {
        const userId = await verifySupabaseUser(request);
        if (!userId) return jsonResponse({ ok: false, error: "Não autorizado." }, 401, request);

        let body: z.infer<typeof Body>;
        try { body = Body.parse(await request.json()); } catch { return jsonResponse({ ok: false, error: "Dados inválidos." }, 400, request); }
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) return jsonResponse({ ok: false, error: "API key não configurada no servidor." }, 500, request);
        if (body.imageBase64.length > 7_000_000) return jsonResponse({ ok: false, error: "Imagem muito grande (máx ~5 MB)." }, 413, request);

        // Premium Anual obrigatório.
        const { data: plan, error: planErr } = await supabaseAdmin
          .from("user_plans").select("is_pro").eq("user_id", userId).maybeSingle();
        if (planErr) return jsonResponse({ ok: false, error: "Falha ao validar plano." }, 500, request);
        if (!plan?.is_pro) {
          return jsonResponse({ ok: false, error: "Recurso exclusivo do Premium Anual." }, 402, request);
        }

        const prompt = buildPrompt(body.durationMin, new Date());
        try {
          const dataUrl = `data:${body.mediaType};base64,${body.imageBase64}`;
          const r = await fetch(OPENAI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({
              model: MODEL,
              max_tokens: 1000,
              response_format: { type: "json_object" },
              messages: [{
                role: "user",
                content: [
                  { type: "image_url", image_url: { url: dataUrl, detail: "high" } },
                  { type: "text", text: prompt.text },
                ],
              }],
            }),
          });
          if (!r.ok) {
            const txt = await r.text();
            console.error("OpenAI error", r.status, txt);
            if (r.status === 429) return jsonResponse({ ok: false, error: "Limite de requisições. Aguarde um momento." }, 429, request);
            if (r.status === 401) return jsonResponse({ ok: false, error: "API key inválida." }, 500, request);
            return jsonResponse({ ok: false, error: "Falha ao consultar a IA." }, 502, request);
          }
          const data = (await r.json()) as { choices?: Array<{ message?: { content?: string } }> };
          const txt = data.choices?.[0]?.message?.content ?? "";
          let parsed: Record<string, unknown> | null = null;
          try { parsed = JSON.parse(txt.replace(/```json|```/g, "").trim()); } catch { parsed = null; }
          if (!parsed) return jsonResponse({ ok: false, error: "Não foi possível interpretar a resposta. Tente uma imagem mais nítida." }, 200, request);
          parsed.entrada = prompt.entrada;
          parsed.protecao1 = prompt.prot1;
          parsed.protecao2 = prompt.prot2;
          return jsonResponse({ ok: true, result: parsed }, 200, request);
        } catch (e) {
          console.error("ai-scan failed", e);
          return jsonResponse({ ok: false, error: "Erro de conexão com a IA." }, 502, request);
        }
      },
    },
  },
});
