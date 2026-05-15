import { createFileRoute } from "@tanstack/react-router";
import { corsHeaders } from "@/lib/cors";

export const Route = createFileRoute("/api/calendar")({
  server: {
    handlers: {
      OPTIONS: async ({ request }: { request: Request }) =>
        new Response(null, { status: 204, headers: corsHeaders(request) }),
      GET: async ({ request }: { request: Request }) => {
        const CORS = corsHeaders(request);
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
