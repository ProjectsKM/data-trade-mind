import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { z } from "zod";
import { CORS_HEADERS, jsonResponse } from "@/lib/cors";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

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
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      POST: async ({ request }: { request: Request }) => {
        let body: z.infer<typeof Body>;
        try { body = Body.parse(await request.json()); } catch { return jsonResponse({ ok: false, error: "Dados inválidos." }, 400); }
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) return jsonResponse({ ok: false, error: "API key não configurada no servidor." }, 500);
        if (body.imageBase64.length > 7_000_000) return jsonResponse({ ok: false, error: "Imagem muito grande (máx ~5 MB)." }, 413);

        const prompt = buildPrompt(body.durationMin, new Date());
        try {
          const r = await fetch(ANTHROPIC_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
            body: JSON.stringify({
              model: MODEL,
              max_tokens: 1000,
              messages: [{
                role: "user",
                content: [
                  { type: "image", source: { type: "base64", media_type: body.mediaType, data: body.imageBase64 } },
                  { type: "text", text: prompt.text },
                ],
              }],
            }),
          });
          if (!r.ok) {
            const txt = await r.text();
            console.error("Anthropic error", r.status, txt);
            if (r.status === 429) return jsonResponse({ ok: false, error: "Limite de requisições. Aguarde um momento." }, 429);
            if (r.status === 401) return jsonResponse({ ok: false, error: "API key inválida." }, 500);
            return jsonResponse({ ok: false, error: "Falha ao consultar a IA." }, 502);
          }
          const data = (await r.json()) as { content?: Array<{ type: string; text?: string }> };
          const txt = data.content?.find((b) => b.type === "text")?.text ?? "";
          let parsed: Record<string, unknown> | null = null;
          try { parsed = JSON.parse(txt.replace(/```json|```/g, "").trim()); } catch { parsed = null; }
          if (!parsed) return jsonResponse({ ok: false, error: "Não foi possível interpretar a resposta. Tente uma imagem mais nítida." }, 200);
          parsed.entrada = prompt.entrada;
          parsed.protecao1 = prompt.prot1;
          parsed.protecao2 = prompt.prot2;
          return jsonResponse({ ok: true, result: parsed });
        } catch (e) {
          console.error("ai-scan failed", e);
          return jsonResponse({ ok: false, error: "Erro de conexão com a IA." }, 502);
        }
      },
    },
  },
});
