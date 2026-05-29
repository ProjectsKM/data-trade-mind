import { createFileRoute, Outlet, useNavigate, Link, useLocation } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  MoreHorizontal,
  X,
} from "lucide-react";
import { logout, useAppState, useUser } from "@/lib/store";
import { PremiumGate, type GateKey } from "@/components/app/PremiumGate";
import { useVirtualKeyboard } from "@/hooks/use-virtual-keyboard";
import { hydrateBancaFromCloud } from "@/lib/banca-sync";
import { supabase } from "@/integrations/supabase/client";

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
  const kbHeight = useVirtualKeyboard();
  const kbOpen = kbHeight > 0;
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    if (!ready || user) return;
    // Antes redirecionava direto pra /login quando user ficasse null.
    // Agora tenta um refresh ativo primeiro — se o refresh token ainda for
    // válido, recupera a sessão sem forçar o usuário a relogar.
    let cancelled = false;
    void (async () => {
      try {
        const { data } = await supabase.auth.refreshSession();
        if (cancelled) return;
        if (!data.session?.user) nav({ to: "/login" });
        // Se houve sucesso, o onAuthStateChange atualiza o user no hook.
      } catch {
        if (!cancelled) nav({ to: "/login" });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, user, nav]);

  // Sincroniza banca da cloud (user_metadata) pro localStorage logo após
  // login — garante que /mind, /scan etc enxerguem a banca mesmo se foi
  // definida em outro device/browser.
  useEffect(() => {
    if (ready && user) void hydrateBancaFromCloud();
  }, [ready, user?.id]);

  if (!ready || !user) {
    return (
      <div
        className="relative flex min-h-screen items-center justify-center fade-in"
        style={{ background: "var(--background)" }}
      >
        <BgFx />
        <div className="relative z-10 flex flex-col items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--accent)" }} />
          <span className="font-display text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Carregando
          </span>
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
  // Só decide o gate DEPOIS que o plano carregou (state.hydrated). Antes,
  // isPro começava false e o PremiumGate "piscava" pra quem já é Anual.
  const checkingPlan = !!gatedFeature && !state.hydrated;
  const isGated = !!gatedFeature && state.hydrated && !state.isPro;

  return (
    <div
      data-orion-app-shell="true"
      className="relative flex h-dvh overflow-hidden flex-col"
      style={{ background: "var(--background)" }}
    >
      <BgFx />

      <header
        className="sticky top-0 z-50 flex h-14 flex-none items-center justify-between border-b px-5 backdrop-blur-xl fade-down"
        style={{
          background: "color-mix(in oklab, var(--background) 78%, transparent)",
          borderColor: "var(--border-strong)",
        }}
      >
        <Link
          to="/dashboard"
          className="font-display text-lg font-semibold tracking-tight smooth hover:opacity-90"
        >
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
                : {
                    background: "var(--surface)",
                    color: "var(--text-muted)",
                    borderColor: "var(--border-strong)",
                  }
            }
          >
            {state.isPro ? "Acesso Anual" : "Comprar acesso"}
          </Link>
          <button
            onClick={() => {
              void logout().finally(() => nav({ to: "/" }));
            }}
            aria-label="Sair"
            className="hidden h-8 w-8 items-center justify-center rounded-md border text-muted-foreground smooth hover:border-[color:var(--red)] hover:text-[color:var(--red)] sm:inline-flex"
            style={{ borderColor: "var(--border)" }}
          >
            <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
          </button>
          <Link
            to="/perfil"
            aria-label="Perfil"
            className="flex h-10 w-10 sm:h-8 sm:w-8 items-center justify-center rounded-md border text-[11px] font-semibold smooth hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border-strong)",
              color: "var(--foreground)",
            }}
          >
            {user.email.slice(0, 2).toUpperCase()}
          </Link>
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 overflow-hidden">
        <nav
          className="hidden w-56 flex-none flex-col gap-0.5 border-r p-3 sm:flex slide-in-left"
          style={{
            background: "color-mix(in oklab, var(--surface) 78%, transparent)",
            borderColor: "var(--border)",
            backdropFilter: "blur(14px)",
          }}
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
                preload="intent"
                viewTransition
                aria-current={active ? "page" : undefined}
                className="group relative flex items-center gap-3 overflow-hidden rounded-md px-3 py-2 text-sm smooth press hover:translate-x-0.5"
                style={
                  active
                    ? {
                        background: "color-mix(in oklab, var(--accent) 14%, var(--surface-2))",
                        color: "var(--foreground)",
                        boxShadow:
                          "0 0 24px -10px color-mix(in oklab, var(--accent) 70%, transparent)",
                      }
                    : { color: "var(--text-muted)" }
                }
              >
                {active && (
                  <span
                    className="absolute inset-y-1 left-0 w-0.5 rounded-r"
                    style={{
                      background: "var(--gradient-primary)",
                      boxShadow: "0 0 10px var(--accent)",
                    }}
                  />
                )}
                <Icon
                  className="h-4 w-4 flex-none"
                  strokeWidth={1.75}
                  style={{
                    color: active ? "var(--accent)" : "var(--text-dim)",
                    filter: active
                      ? "drop-shadow(0 0 6px color-mix(in oklab, var(--accent) 70%, transparent))"
                      : "none",
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

        {/* Primary bottom nav: 4 tabs principais + botão "Mais" que abre
            sheet com Calc, Notícias e CryptoBubbles. Antes excluía
            cryptobubbles da nav inteira; agora todas as features são
            acessíveis no mobile. */}
        <nav
          aria-hidden={kbOpen}
          className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t py-2 backdrop-blur-xl sm:hidden fade-up"
          style={{
            background: "color-mix(in oklab, var(--surface) 88%, transparent)",
            borderColor: "var(--border)",
            paddingBottom: "calc(0.5rem + env(safe-area-inset-bottom, 0px))",
            transform: kbOpen ? "translateY(100%)" : undefined,
            transition: "transform 180ms ease",
            pointerEvents: kbOpen ? "none" : undefined,
          }}
        >
          {tabs
            .filter(({ to }) =>
              ["/dashboard", "/scan", "/mind", "/gestao"].includes(to),
            )
            .map(({ to, Icon, label }) => {
              const active = loc.pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  preload="intent"
                  viewTransition
                  aria-current={active ? "page" : undefined}
                  className="flex flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium smooth press"
                  style={{
                    color: active ? "var(--accent)" : "var(--text-dim)",
                    filter: active
                      ? "drop-shadow(0 0 6px color-mix(in oklab, var(--accent) 60%, transparent))"
                      : "none",
                  }}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                  <span>{label}</span>
                </Link>
              );
            })}
          {(() => {
            const moreItems = tabs.filter(({ to }) =>
              ["/calculadora", "/noticias", "/cryptobubbles"].includes(to),
            );
            const activeInMore = moreItems.some(({ to }) => loc.pathname.startsWith(to));
            return (
              <button
                type="button"
                onClick={() => setMoreOpen(true)}
                className="flex flex-1 flex-col items-center gap-0.5 px-1 py-2 text-[10px] font-medium smooth press"
                aria-label="Mais opções"
                style={{
                  color: activeInMore ? "var(--accent)" : "var(--text-dim)",
                  filter: activeInMore
                    ? "drop-shadow(0 0 6px color-mix(in oklab, var(--accent) 60%, transparent))"
                    : "none",
                }}
              >
                <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
                <span>Mais</span>
              </button>
            );
          })()}
        </nav>

        {/* "Mais" sheet: bottom-up modal com tabs secundárias */}
        {moreOpen && (
          <div
            className="fixed inset-0 z-50 sm:hidden"
            onClick={() => setMoreOpen(false)}
          >
            <div
              className="absolute inset-0 fade-in"
              style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
            />
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-x-0 bottom-0 rounded-t-2xl border-t p-4 fade-up"
              style={{
                background: "color-mix(in oklab, var(--surface) 96%, transparent)",
                borderColor: "var(--border-strong)",
                paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))",
                boxShadow: "0 -24px 60px -20px rgba(0,0,0,0.6)",
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Mais opções
                </span>
                <button
                  type="button"
                  onClick={() => setMoreOpen(false)}
                  aria-label="Fechar"
                  className="flex h-8 w-8 items-center justify-center rounded-md border smooth press"
                  style={{
                    borderColor: "var(--border-strong)",
                    background: "var(--surface-2)",
                  }}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {tabs
                  .filter(({ to }) =>
                    ["/calculadora", "/noticias", "/cryptobubbles"].includes(to),
                  )
                  .map(({ to, Icon, label, desc }) => {
                    const active = loc.pathname.startsWith(to);
                    return (
                      <Link
                        key={to}
                        to={to}
                        preload="intent"
                        viewTransition
                        onClick={() => setMoreOpen(false)}
                        className="flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center smooth press"
                        style={
                          active
                            ? {
                                background: "color-mix(in oklab, var(--accent) 14%, var(--surface-2))",
                                borderColor: "color-mix(in oklab, var(--accent) 40%, transparent)",
                                color: "var(--accent)",
                              }
                            : {
                                background: "var(--surface-2)",
                                borderColor: "var(--border)",
                                color: "var(--foreground)",
                              }
                        }
                      >
                        <Icon className="h-5 w-5" strokeWidth={1.75} />
                        <span className="text-xs font-semibold">{label}</span>
                        <span className="text-[10px] leading-tight text-muted-foreground">
                          {desc}
                        </span>
                      </Link>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        <main
          id="main-content"
          tabIndex={-1}
          className={`relative min-h-0 flex-1 outline-none sm:!pb-0 ${isFullHeightRoute ? "overflow-hidden" : "overflow-y-auto"}`}
          style={{
            paddingBottom: kbOpen
              ? `${kbHeight}px`
              : "calc(4.5rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          {checkingPlan ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--accent)" }} />
            </div>
          ) : isGated ? (
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
