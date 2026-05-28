import { createFileRoute } from "@tanstack/react-router";
import { corsHeaders } from "@/lib/cors";
import { verifySupabaseUser } from "@/lib/verify-supabase-jwt.server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/calendar")({
  server: {
    handlers: {
      OPTIONS: async ({ request }: { request: Request }) =>
        new Response(null, { status: 204, headers: corsHeaders(request) }),
      GET: async ({ request }: { request: Request }) => {
        const CORS = corsHeaders(request);
        const userId = await verifySupabaseUser(request);
        if (!userId) {
          return new Response(JSON.stringify({ ok: false, error: "Não autorizado." }), {
            status: 401,
            headers: { "Content-Type": "application/json", ...CORS },
          });
        }
        const { data: plan } = await supabaseAdmin
          .from("user_plans")
          .select("is_pro")
          .eq("user_id", userId)
          .maybeSingle();
        if (!plan?.is_pro) {
          return new Response(
            JSON.stringify({ ok: false, error: "Recurso exclusivo do Premium Anual." }),
            {
              status: 402,
              headers: { "Content-Type": "application/json", ...CORS },
            },
          );
        }
        // Tenta uma lista de upstreams (faireconomy às vezes rate-limita
        // ou seu subdomínio nfs.* fica fora do ar). Cache server-side via
        // Cloudflare Cache API pra aliviar a frequência de chamadas.
        const UPSTREAMS = [
          "https://nfs.faireconomy.media/ff_calendar_thisweek.json",
          "https://cdn-nfs.faireconomy.media/ff_calendar_thisweek.json",
        ];

        const cacheKey = new Request("https://orionhub.internal/calendar/v1");
        // @ts-expect-error caches.default existe em Cloudflare Workers
        const cache: Cache | undefined = typeof caches !== "undefined" ? caches.default : undefined;

        if (cache) {
          const hit = await cache.match(cacheKey);
          if (hit) {
            const body = await hit.text();
            return new Response(body, {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=600, s-maxage=600",
                "X-Cache": "HIT",
                ...CORS,
              },
            });
          }
        }

        let lastUpstreamErr = "";
        for (const url of UPSTREAMS) {
          try {
            const r = await fetch(url, {
              headers: { Accept: "application/json", "User-Agent": "OrionHub/1.0" },
            });
            if (!r.ok) {
              lastUpstreamErr = `HTTP ${r.status}`;
              continue;
            }
            const ctype = r.headers.get("Content-Type") || "";
            const body = await r.text();
            // Valida que é JSON array — quando o upstream rate-limita ele
            // devolve uma página HTML "Rate Limited" com status 200, que
            // antes era passada cega pro frontend (=> "Resposta inválida").
            if (!ctype.includes("json") && !body.trimStart().startsWith("[")) {
              lastUpstreamErr = "Conteúdo não-JSON";
              continue;
            }
            let parsed: unknown;
            try {
              parsed = JSON.parse(body);
            } catch {
              lastUpstreamErr = "JSON inválido";
              continue;
            }
            if (!Array.isArray(parsed)) {
              lastUpstreamErr = "Não é array";
              continue;
            }

            const resp = new Response(body, {
              status: 200,
              headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=600, s-maxage=600",
                "X-Cache": "MISS",
                ...CORS,
              },
            });
            // Cache no edge por 10min — limita rate-limit do upstream.
            if (cache) await cache.put(cacheKey, resp.clone());
            return resp;
          } catch (e) {
            lastUpstreamErr = (e as Error).message || "fetch failed";
            continue;
          }
        }
        console.error("calendar all upstreams failed:", lastUpstreamErr);
        return new Response(
          JSON.stringify({
            ok: false,
            error:
              "O calendário econômico está temporariamente indisponível. Tente novamente em alguns minutos.",
          }),
          {
            status: 502,
            headers: { "Content-Type": "application/json", ...CORS },
          },
        );
      },
    },
  },
});
