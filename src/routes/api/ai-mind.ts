import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { z } from "zod";
import { CORS_HEADERS, jsonResponse } from "@/lib/cors";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const MODEL = "claude-sonnet-4-20250514";

const SYSTEM = `Você é o OrionMind, um mentor especializado em opções binárias e trading. Responda sempre em português brasileiro, de forma clara, didática e motivadora. Use **negrito** para termos importantes. Seja objetivo mas completo. Foque em gestão de risco, psicologia e análise técnica. Nunca garanta lucros — sempre enfatize responsabilidade e gerenciamento de risco. Você tem memória de toda a conversa e pode referenciar mensagens anteriores.`;

const Body = z.object({
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(8000) })).min(1).max(40),
});

export const Route = createFileRoute("/api/ai-mind")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS_HEADERS }),
      POST: async ({ request }: { request: Request }) => {
        let body: z.infer<typeof Body>;
        try { body = Body.parse(await request.json()); } catch { return jsonResponse({ ok: false, error: "Mensagens inválidas." }, 400); }
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) return jsonResponse({ ok: false, error: "API key não configurada." }, 500);
        try {
          const r = await fetch(ANTHROPIC_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
            body: JSON.stringify({ model: MODEL, max_tokens: 700, system: SYSTEM, messages: body.messages }),
          });
          if (!r.ok) {
            const txt = await r.text();
            console.error("ai-mind error", r.status, txt);
            if (r.status === 429) return jsonResponse({ ok: false, error: "Muitas mensagens em sequência. Aguarde." }, 429);
            return jsonResponse({ ok: false, error: "Falha ao consultar a IA." }, 502);
          }
          const data = (await r.json()) as { content?: Array<{ type: string; text?: string }> };
          const reply = data.content?.find((b) => b.type === "text")?.text || "Não consegui processar. Tente novamente.";
          return jsonResponse({ ok: true, reply });
        } catch (e) {
          console.error("ai-mind exception", e);
          return jsonResponse({ ok: false, error: "Erro de conexão com a IA." }, 502);
        }
      },
    },
  },
});
