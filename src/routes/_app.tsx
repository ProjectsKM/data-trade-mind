import { createFileRoute, Outlet, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  LineChart,
  Sparkles,
  ClipboardList,
  BarChart3,
  Calculator,
  LogOut,
  Loader2,
} from "lucide-react";
import { logout, useAppState, useUser } from "@/lib/store";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

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
      <div className="flex min-h-screen items-center justify-center gap-2.5 text-sm text-muted-foreground fade-in">
        <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--accent)" }} />
        Carregando…
      </div>
    );
  }

  const tabs = [
    { to: "/scan", Icon: LineChart, label: "Scan", desc: "Análise" },
    { to: "/mind", Icon: Sparkles, label: "Mind", desc: "Mentor" },
    { to: "/gestao", Icon: ClipboardList, label: "Gestão", desc: "Trades" },
    { to: "/relatorio", Icon: BarChart3, label: "Relatório", desc: "Métricas" },
    { to: "/calculadora", Icon: Calculator, label: "Calc", desc: "Banca" },
  ] as const;

  return (
    <div className="flex min-h-screen flex-col" style={{ background: "var(--background)" }}>
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b px-5 backdrop-blur-xl fade-down"
        style={{ background: "color-mix(in oklab, var(--background) 92%, transparent)", borderColor: "var(--border-strong)" }}>
        <Link to="/scan" className="font-display text-lg font-semibold tracking-tight smooth hover:opacity-80">
          Orion<span style={{ color: "var(--accent)" }}>Hub</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            to="/upgrade"
            className="rounded-md border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider smooth press hover:-translate-y-px"
            style={
              state.isPro
                ? { background: "color-mix(in oklab, var(--accent) 10%, transparent)", color: "var(--accent)", borderColor: "color-mix(in oklab, var(--accent) 28%, transparent)" }
                : { background: "var(--surface)", color: "var(--text-muted)", borderColor: "var(--border-strong)" }
            }
          >
            {state.isPro ? "PRO" : `Free · ${state.analysesLeft} · Upgrade`}
          </Link>
          <button
            onClick={() => { logout(); nav({ to: "/" }); }}
            aria-label="Sair"
            className="hidden h-8 w-8 items-center justify-center rounded-md border text-muted-foreground smooth hover:border-[color:var(--red)] hover:text-[color:var(--red)] sm:inline-flex"
            style={{ borderColor: "var(--border)" }}
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-md border text-[11px] font-semibold"
            style={{ background: "var(--surface-2)", borderColor: "var(--border-strong)", color: "var(--foreground)" }}
          >
            {user.email.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
        <nav
          className="hidden w-56 flex-none flex-col gap-0.5 border-r p-3 sm:flex slide-in-left"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="px-2 pb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Workspace
          </div>
          {tabs.map(({ to, Icon, label, desc }) => {
            const active = loc.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className="group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm smooth press"
                style={
                  active
                    ? { background: "var(--surface-2)", color: "var(--foreground)" }
                    : { color: "var(--text-muted)" }
                }
              >
                {active && (
                  <span
                    className="absolute inset-y-1 left-0 w-0.5 rounded-r"
                    style={{ background: "var(--accent)" }}
                  />
                )}
                <Icon
                  className="h-4 w-4 flex-none"
                  strokeWidth={1.75}
                  style={{ color: active ? "var(--accent)" : "var(--text-dim)" }}
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
          style={{ background: "color-mix(in oklab, var(--surface) 94%, transparent)", borderColor: "var(--border)" }}
        >
          {tabs.map(({ to, Icon, label }) => {
            const active = loc.pathname.startsWith(to);
            return (
              <Link
                key={to}
                to={to}
                className="flex flex-col items-center gap-1 px-3 py-1 text-[10px] font-medium smooth press"
                style={{ color: active ? "var(--accent)" : "var(--text-dim)" }}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <main key={loc.pathname} className="flex-1 overflow-y-auto pb-16 route-anim sm:pb-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
