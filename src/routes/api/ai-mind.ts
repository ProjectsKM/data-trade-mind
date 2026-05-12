import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { z } from "zod";
import { CORS_HEADERS, jsonResponse } from "@/lib/cors";

const OPENAI_URL = "https://api.openai.com/v1/responses";
const MODEL = "gpt-4o-mini";

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
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) return jsonResponse({ ok: false, error: "API key não configurada." }, 500);
        try {
          const input = [
            { role: "system" as const, content: SYSTEM },
            ...body.messages.map((m) => ({ role: m.role, content: m.content })),
          ];
          const r = await fetch(OPENAI_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({ model: MODEL, input, max_output_tokens: 800 }),
          });
          if (!r.ok) {
            const txt = await r.text();
            console.error("ai-mind error", r.status, txt);
            if (r.status === 429) return jsonResponse({ ok: false, error: "Muitas mensagens em sequência. Aguarde." }, 429);
            return jsonResponse({ ok: false, error: "Falha ao consultar a IA." }, 502);
          }
          const data = (await r.json()) as {
            output_text?: string;
            output?: Array<{ content?: Array<{ type: string; text?: string }> }>;
          };
          const reply =
            data.output_text ||
            data.output?.flatMap((o) => o.content || []).find((c) => c.type === "output_text")?.text ||
            "Não consegui processar. Tente novamente.";
          return jsonResponse({ ok: true, reply });
        } catch (e) {
          console.error("ai-mind exception", e);
          return jsonResponse({ ok: false, error: "Erro de conexão com a IA." }, 502);
        }
      },
    },
  },
});
