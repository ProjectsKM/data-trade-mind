import { createFileRoute, Outlet, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
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
      <div className="flex min-h-screen items-center justify-center gap-3 text-muted-foreground fade-in">
        <span className="h-5 w-5 rounded-full border-2 border-[color:var(--border-strong)] border-t-[color:var(--electric)] spin-slow" />
        Carregando…
      </div>
    );
  }

  const tabs = [
    { to: "/scan", icon: "📈", label: "Scan" },
    { to: "/mind", icon: "🧠", label: "Mind" },
    { to: "/gestao", icon: "📋", label: "Gestão" },
    { to: "/relatorio", icon: "📊", label: "Relatório" },
    { to: "/calculadora", icon: "🧮", label: "Calc" },
  ] as const;

  return (
    <div className="flex min-h-screen flex-col font-display" style={{ background: "var(--background)" }}>
      <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b px-5 backdrop-blur-xl fade-down"
        style={{ background: "color-mix(in oklab, var(--background) 92%, transparent)", borderColor: "var(--border-strong)" }}>
        <Link to="/scan" className="text-xl font-black tracking-tight smooth hover:opacity-80">
          Orion<span style={{ color: "var(--electric)" }}>Hub</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/upgrade" className="rounded-full px-2.5 py-1 text-[10px] font-bold tracking-wider smooth press hover:-translate-y-0.5"
            style={state.isPro
              ? { background: "color-mix(in oklab, var(--electric) 12%, transparent)", color: "var(--electric)", border: "1px solid color-mix(in oklab, var(--electric) 30%, transparent)" }
              : { background: "color-mix(in oklab, var(--accent) 14%, transparent)", color: "var(--accent)", border: "1px solid color-mix(in oklab, var(--accent) 30%, transparent)" }
            }>
            {state.isPro ? "PRO" : `FREE · ${state.analysesLeft} · UPGRADE`}
          </Link>
          <button onClick={() => { logout(); nav({ to: "/" }); }}
            className="hidden rounded-lg border px-3 py-1.5 text-[11px] text-muted-foreground smooth hover:border-[color:var(--red)] hover:text-[color:var(--red)] sm:block"
            style={{ borderColor: "var(--border)" }}>Sair</button>
          <div className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white smooth hover:scale-110"
            style={{ background: "linear-gradient(135deg, var(--accent), var(--electric))" }}>
            {user.email.slice(0, 2).toUpperCase()}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden" style={{ height: "calc(100vh - 56px)" }}>
        <nav className="hidden w-16 flex-none flex-col items-center gap-2 border-r py-4 sm:flex slide-in-left" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          {tabs.map((t) => {
            const active = loc.pathname.startsWith(t.to);
            return (
              <Link key={t.to} to={t.to}
                className="flex h-12 w-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[7px] font-bold tracking-wide smooth press hover:-translate-y-0.5"
                style={active
                  ? { background: "color-mix(in oklab, var(--electric) 10%, transparent)", color: "var(--electric)", border: "1px solid color-mix(in oklab, var(--electric) 18%, transparent)", boxShadow: "0 0 18px color-mix(in oklab, var(--electric) 18%, transparent)" }
                  : { color: "var(--text-dim)" }
                }>
                <span className="text-base">{t.icon}</span>
                <span>{t.label.toUpperCase()}</span>
              </Link>
            );
          })}
        </nav>

        <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t py-2 backdrop-blur-xl sm:hidden fade-up"
          style={{ background: "color-mix(in oklab, var(--surface) 92%, transparent)", borderColor: "var(--border)" }}>
          {tabs.map((t) => {
            const active = loc.pathname.startsWith(t.to);
            return (
              <Link key={t.to} to={t.to} className="flex flex-col items-center gap-0.5 px-3 py-1 text-[9px] font-bold smooth press"
                style={{ color: active ? "var(--electric)" : "var(--text-dim)" }}>
                <span className="text-base">{t.icon}</span>
                <span>{t.label.toUpperCase()}</span>
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
