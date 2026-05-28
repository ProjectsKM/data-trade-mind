import { createFileRoute } from "@tanstack/react-router";
import "@tanstack/react-start";
import { corsHeaders, jsonResponse } from "@/lib/cors";
import { verifySupabaseUser } from "@/lib/verify-supabase-jwt.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { enforceAiRateLimit } from "@/lib/rate-limit.server";

const OPENAI_URL = "https://api.openai.com/v1/audio/transcriptions";
const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      OPTIONS: async ({ request }: { request: Request }) =>
        new Response(null, { status: 204, headers: corsHeaders(request) }),
      POST: async ({ request }: { request: Request }) => {
        const userId = await verifySupabaseUser(request);
        if (!userId) return jsonResponse({ ok: false, error: "Não autorizado." }, 401, request);

        // Premium Anual obrigatório (mesma regra de ai-mind / ai-scan).
        const { data: plan, error: planErr } = await supabaseAdmin
          .from("user_plans")
          .select("is_pro")
          .eq("user_id", userId)
          .maybeSingle();
        if (planErr)
          return jsonResponse({ ok: false, error: "Falha ao validar plano." }, 500, request);
        if (!plan?.is_pro)
          return jsonResponse(
            { ok: false, error: "Recurso exclusivo do Premium Anual." },
            402,
            request,
          );

        // Controle de custo: limita transcrições por usuário.
        if (!(await enforceAiRateLimit(userId, "transcribe", { maxPerMin: 8, maxPerDay: 200 }))) {
          return jsonResponse(
            { ok: false, error: "Você atingiu o limite de uso. Aguarde um momento." },
            429,
            request,
          );
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey)
          return jsonResponse({ ok: false, error: "API key não configurada." }, 500, request);

        let inForm: FormData;
        try {
          inForm = await request.formData();
        } catch {
          return jsonResponse({ ok: false, error: "Áudio inválido." }, 400, request);
        }
        const audio = inForm.get("audio");
        if (!(audio instanceof Blob)) {
          return jsonResponse({ ok: false, error: "Áudio ausente." }, 400, request);
        }
        if (audio.size === 0)
          return jsonResponse({ ok: false, error: "Áudio vazio." }, 400, request);
        if (audio.size > MAX_BYTES)
          return jsonResponse({ ok: false, error: "Áudio muito grande (máx 25MB)." }, 413, request);

        const out = new FormData();
        const filename = (audio as File).name || "audio.webm";
        out.append("file", audio, filename);
        out.append("model", "gpt-4o-mini-transcribe");
        out.append("language", "pt");
        out.append("response_format", "json");

        try {
          const r = await fetch(OPENAI_URL, {
            method: "POST",
            headers: { Authorization: `Bearer ${apiKey}` },
            body: out,
          });
          if (!r.ok) {
            const txt = await r.text().catch(() => "");
            console.error("transcribe error", r.status, txt);
            return jsonResponse(
              { ok: false, error: "Falha ao transcrever o áudio." },
              502,
              request,
            );
          }
          const data = (await r.json()) as { text?: string };
          return jsonResponse({ ok: true, text: (data.text || "").trim() }, 200, request);
        } catch (e) {
          console.error("transcribe exception", e);
          return jsonResponse({ ok: false, error: "Erro de conexão." }, 502, request);
        }
      },
    },
  },
});
