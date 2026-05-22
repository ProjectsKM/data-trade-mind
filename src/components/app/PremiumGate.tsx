import { Link } from "@tanstack/react-router";
import { Lock, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

export function PremiumGate({ children, feature }: { children: ReactNode; feature: string }) {
  return (
    <div className="relative h-full min-h-0">
      <div
        aria-hidden
        className="pointer-events-none h-full w-full overflow-hidden select-none"
        style={{ filter: "blur(10px) saturate(0.7)", opacity: 0.55 }}
      >
        {children}
      </div>
      <div
        className="absolute inset-0 z-10 flex items-center justify-center p-6"
        style={{ background: "color-mix(in oklab, var(--background) 55%, transparent)", backdropFilter: "blur(2px)" }}
      >
        <div
          className="flex max-w-md flex-col items-center rounded-2xl border px-8 py-10 text-center shadow-2xl fade-up"
          style={{
            background: "color-mix(in oklab, var(--surface) 92%, transparent)",
            borderColor: "color-mix(in oklab, var(--accent) 40%, var(--border-strong))",
            boxShadow: "0 30px 80px -20px color-mix(in oklab, var(--accent) 40%, transparent)",
          }}
        >
          <div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border"
            style={{
              background: "color-mix(in oklab, var(--accent) 16%, transparent)",
              borderColor: "color-mix(in oklab, var(--accent) 45%, transparent)",
              color: "var(--accent)",
            }}
          >
            <Lock className="h-6 w-6" strokeWidth={1.75} />
          </div>
          <div className="font-display text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "var(--accent)" }}>
            Recurso Premium
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
            {feature} é exclusivo do plano anual
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Desbloqueie {feature} e todas as ferramentas avançadas do OrionHub assinando o plano Premium Anual.
          </p>
          <Link
            to="/upgrade"
            className="mt-6 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold smooth press hover:-translate-y-0.5"
            style={{
              background: "var(--gradient-primary)",
              color: "var(--background)",
              boxShadow: "0 10px 30px -10px color-mix(in oklab, var(--accent) 70%, transparent)",
            }}
          >
            <Sparkles className="h-4 w-4" strokeWidth={2} />
            Ativar Premium Anual
          </Link>
        </div>
      </div>
    </div>
  );
}