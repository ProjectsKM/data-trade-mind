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
            status: 401, headers: { "Content-Type": "application/json", ...CORS },
          });
        }
        const { data: plan } = await supabaseAdmin
          .from("user_plans").select("is_pro").eq("user_id", userId).maybeSingle();
        if (!plan?.is_pro) {
          return new Response(JSON.stringify({ ok: false, error: "Recurso exclusivo do Premium Anual." }), {
            status: 402, headers: { "Content-Type": "application/json", ...CORS },
          });
        }
        try {
          const r = await fetch("https://nfs.faireconomy.media/ff_calendar_thisweek.json", {
            headers: { Accept: "application/json", "User-Agent": "OrionHub/1.0" },
          });
          if (!r.ok) {
            return new Response(JSON.stringify({ ok: false, error: `Upstream ${r.status}` }), {
              status: 502,
              headers: { "Content-Type": "application/json", ...CORS },
            });
          }
          const data = await r.text();
          return new Response(data, {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Cache-Control": "public, max-age=600, s-maxage=600",
              ...CORS,
            },
          });
        } catch (e) {
          return new Response(JSON.stringify({ ok: false, error: (e as Error).message }), {
            status: 500,
            headers: { "Content-Type": "application/json", ...CORS },
          });
        }
      },
    },
  },
});
