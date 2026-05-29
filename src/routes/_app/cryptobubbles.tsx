import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { CircleDot, Loader2, ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";

export const Route = createFileRoute("/_app/cryptobubbles")({
  head: () => ({ meta: [{ title: "CryptoBubbles — OrionHub" }] }),
  component: CryptoBubblesPage,
});

const BUBBLES_URL = "https://cryptobubbles.net/#currencies=1,1027,52,1831,2,5426,1839";

function CryptoBubblesPage() {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="px-5 pt-6 fade-down">
        <PageHeader
          title="CryptoBubbles"
          description="Mapa de bolhas das principais criptomoedas em tempo real."
          icon={<CircleDot className="h-5 w-5" strokeWidth={1.75} />}
        />
      </div>
      <div
        className="relative mx-5 mb-5 flex-1 overflow-hidden rounded-xl border fade-up smooth"
        style={{
          // Fundo escuro atrás do iframe: elimina o flash branco enquanto
          // o cryptobubbles.net carrega (ele não tem fundo dark configurável).
          background: "var(--surface)",
          borderColor: "var(--border)",
          boxShadow: "0 24px 60px -32px color-mix(in oklab, var(--accent) 25%, transparent)",
        }}
      >
        {/* Overlay de loading — some quando o iframe dispara onLoad */}
        {!loaded && !failed && (
          <div
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 fade-in"
            style={{ background: "var(--surface)" }}
          >
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: "var(--accent)" }} />
            <span className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              Carregando bolhas
            </span>
          </div>
        )}

        {/* Fallback se o iframe falhar (CSP/offline/bloqueio) */}
        {failed && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 px-6 text-center">
            <CircleDot className="h-7 w-7" style={{ color: "var(--text-dim)" }} />
            <div className="text-sm text-muted-foreground">
              Não foi possível carregar o mapa de bolhas aqui.
            </div>
            <a
              href={BUBBLES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-semibold smooth press hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
              style={{ borderColor: "var(--border-strong)", background: "var(--surface-2)" }}
            >
              Abrir no CryptoBubbles
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        )}

        <iframe
          src={BUBBLES_URL}
          title="CryptoBubbles — mapa de bolhas de criptomoedas"
          className="h-full w-full border-0"
          loading="lazy"
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      </div>
    </div>
  );
}
