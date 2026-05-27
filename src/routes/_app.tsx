import { createFileRoute, Outlet, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LineChart,
  ClipboardList,
  Calculator,
  LogOut,
  Loader2,
  LayoutDashboard,
  Brain,
  Newspaper,
  CircleDot,
} from "lucide-react";
import { logout, useAppState, useUser } from "@/lib/store";
import { PremiumGate, type GateKey } from "@/components/app/PremiumGate";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

function BgFx() {
  return (
    <div className="bg-fx" aria-hidden>
      <div className="aurora" />
      <div className="orb a" />
      <div className="orb b" />
      <div className="grid" />
    </div>
  );
}

function AppLayout() {
  const nav = useNavigate();
  const { user, ready } = useUser();
  const { state } = useAppState();
  const loc = useLocation();

  useEffect(() => {
    if (ready && !user) nav({ to: "/login" });
  }, [ready, user, nav]);

  if (!ready || !user) {
    return (
      <div className="relative flex min-h-screen items-center justify-center fade-in" style={{ background: "var(--background)" }}>
        <BgFx />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--accent)" }} />
          <span className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Carregando</span>
        </div>
      </div>
    );
  }

  const tabs = [
    { to: "/dashboard", Icon: LayoutDashboard, label: "Início", desc: "Visão geral" },
    { to: "/scan", Icon: LineChart, label: "Scan", desc: "Análise" },
    { to: "/mind", Icon: Brain, label: "Mind", desc: "Mentor" },
    { to: "/gestao", Icon: ClipboardList, label: "Gestão", desc: "Trades & métricas" },
    { to: "/calculadora", Icon: Calculator, label: "Calc", desc: "Banca" },
    { to: "/noticias", Icon: Newspaper, label: "Notícias", desc: "Calendário" },
    { to: "/cryptobubbles", Icon: CircleDot, label: "Bubbles", desc: "Cripto" },
  ] as const;

  const isFullHeightRoute =
    loc.pathname.startsWith("/mind") || loc.pathname.startsWith("/cryptobubbles");

  const GATED: Record<string, GateKey> = {
    "/dashboard": "dashboard",
    "/scan": "scan",
    "/mind": "mind",
    "/gestao": "gestao",
    "/calculadora": "calculadora",
    "/noticias": "noticias",
    "/cryptobubbles": "cryptobubbles",
  };
  const gatedFeature = Object.keys(GATED).find((p) => loc.pathname.startsWith(p));
  const isGated = !!gatedFeature && !state.isPro;

  return (
    <div data-orion-app-shell="true" className="relative flex h-dvh overflow-hidden flex-col" style={{ background: "var(--background)" }}>
      <BgFx />

      <header
        className="sticky top-0 z-50 flex h-14 flex-none items-center justify-between border-b px-5 backdrop-blur-xl fade-down"
        style={{ background: "color-mix(in oklab, var(--background) 78%, transparent)", borderColor: "var(--border-strong)" }}
      >
        <Link to="/dashboard" className="font-display text-lg font-semibold tracking-tight smooth hover:opacity-90">
          Orion<span style={{ color: "var(--accent)" }}>Hub</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/upgrade"
            className="rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider smooth press hover:-translate-y-px"
            style={
              state.isPro
                ? {
                    background: "color-mix(in oklab, var(--accent) 14%, transparent)",
                    color: "var(--accent)",
                    borderColor: "color-mix(in oklab, var(--accent) 40%, transparent)",
                    boxShadow: "0 0 18px color-mix(in oklab, var(--accent) 30%, transparent)",
                  }
                : { background: "var(--surface)", color: "var(--text-muted)", borderColor: "var(--border-strong)" }
            }
          >
            {state.isPro ? "Acesso Anual" : "Comprar acesso"}
          </Link>
          <button
            onClick={() => { logout(); nav({ to: "/" }); }}
            aria-label="Sair"
            className="hidden h-8 w-8 items-center justify-center rounded-md border text-muted-foreground smooth hover:border-[color:var(--red)] hover:text-[color:var(--red)] sm:inline-flex"
            style={{ borderColor: "var(--border)" }}
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
          <Link
            to="/perfil"
            aria-label="Perfil"
            className="flex h-8 w-8 items-center justify-center rounded-md border text-[11px] font-semibold smooth hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            style={{ background: "var(--surface-2)", borderColor: "var(--border-strong)", color: "var(--foreground)" }}
          >
            {user.email.slice(0, 2).toUpperCase()}
          </Link>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        <nav
          className="hidden w-56 flex-none flex-col gap-0.5 border-r p-3 sm:flex slide-in-left"
          style={{ background: "color-mix(in oklab, var(--surface) 78%, transparent)", borderColor: "var(--border)", backdropFilter: "blur(14px)" }}
        >
          <div className="px-2 pb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Workspace</div>
          {tabs.map(({ to, Icon, label, desc }) => {
            const active = loc.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                preload="intent"
                viewTransition
                className="group relative flex items-center gap-3 overflow-hidden rounded-md px-3 py-2 text-sm smooth press hover:translate-x-0.5"
                style={
                  active
                    ? {
                        background: "color-mix(in oklab, var(--accent) 14%, var(--surface-2))",
                        color: "var(--foreground)",
                        boxShadow: "0 0 24px -10px color-mix(in oklab, var(--accent) 70%, transparent)",
                      }
                    : { color: "var(--text-muted)" }
                }
              >
                {active && (
                  <span
                    className="absolute inset-y-1 left-0 w-0.5 rounded-r"
                    style={{ background: "var(--gradient-primary)", boxShadow: "0 0 10px var(--accent)" }}
                  />
                )}
                <Icon
                  className="h-4 w-4 flex-none"
                  strokeWidth={1.75}
                  style={{
                    color: active ? "var(--accent)" : "var(--text-dim)",
                    filter: active ? "drop-shadow(0 0 6px color-mix(in oklab, var(--accent) 70%, transparent))" : "none",
                  }}
                />
                <div className="flex flex-col leading-tight">
                  <span className="font-medium">{label}</span>
                  <span className="text-[10px] text-muted-foreground">{desc}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <nav
          className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t py-2 backdrop-blur-xl sm:hidden fade-up"
          style={{ background: "color-mix(in oklab, var(--surface) 88%, transparent)", borderColor: "var(--border)" }}
        >
          {tabs
            .filter(({ to }) => ["/dashboard", "/scan", "/mind", "/gestao", "/noticias"].includes(to))
            .map(({ to, Icon, label }) => {
              const active = loc.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  preload="intent"
                  viewTransition
                  className="flex min-w-[56px] flex-col items-center gap-1 px-3 py-2 text-[11px] font-medium smooth press"
                  style={{
                    color: active ? "var(--accent)" : "var(--text-dim)",
                    filter: active ? "drop-shadow(0 0 6px color-mix(in oklab, var(--accent) 60%, transparent))" : "none",
                  }}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                  <span>{label}</span>
                </Link>
              );
            })}
        </nav>

        <main
          className={`relative min-h-0 flex-1 pb-16 sm:pb-0 ${isFullHeightRoute ? "overflow-hidden" : "overflow-y-auto"}`}
        >
          {isGated ? (
            <PremiumGate feature={GATED[gatedFeature!]}>
              <Outlet />
            </PremiumGate>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}
