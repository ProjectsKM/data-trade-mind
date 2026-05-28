import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  LineChart,
  Sparkles,
  ClipboardList,
  BarChart3,
  Calculator,
  Brain,
  TrendingUp,
  MessageSquare,
  ArrowRight,
  Plus,
  Crown,
  Activity,
} from "lucide-react";
import { useAppState, useUser } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — OrionHub" }] }),
  component: DashboardPage,
});

type Thread = { id: string; title: string; updated_at: string };

function DashboardPage() {
  const { user } = useUser();
  const { state } = useAppState();
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("mind_threads")
      .select("id,title,updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setThreads(data ?? []));
  }, [user?.id]);

  const winTrades = state.tradeList.filter((t) => t.res === "WIN").length;
  const closedTrades = state.tradeList.filter((t) => t.res !== "OPEN").length;
  const winRate = closedTrades ? Math.round((winTrades / closedTrades) * 100) : 0;
  const totalLucro = state.tradeList.reduce((s, t) => s + Number(t.lucro || 0), 0);
  const lastScans = state.history.slice(0, 3);
  const lastTrades = state.tradeList.slice(0, 3);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Bom dia";
    if (h < 18) return "Boa tarde";
    return "Boa noite";
  })();
  const name = user?.name?.trim() || user?.email?.split("@")[0] || "trader";

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <PageHeader
        title={`${greeting}, ${name}`}
        description="Visão geral da sua operação."
        icon={<Activity className="h-5 w-5" />}
      />

      {/* Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 stagger">
        <StatCard
          label="Análises"
          value={state.isPro ? "∞" : state.analysesLeft}
          hint={state.isPro ? "PRO" : "restantes"}
          icon={<Sparkles className="h-4 w-4" />}
          tone="accent"
        />
        <StatCard
          label="Trades"
          value={state.tradeList.length}
          hint={`${closedTrades} fechados`}
          icon={<ClipboardList className="h-4 w-4" />}
        />
        <StatCard
          label="Win-rate"
          value={`${winRate}%`}
          hint={`${winTrades} vitórias`}
          icon={<TrendingUp className="h-4 w-4" />}
          tone={winRate >= 55 ? "success" : winRate >= 45 ? "warning" : "danger"}
        />
        <StatCard
          label="Resultado"
          value={`${totalLucro < 0 ? "-" : ""}$${Math.abs(totalLucro).toFixed(2)}`}
          hint="acumulado"
          icon={<BarChart3 className="h-4 w-4" />}
          tone={totalLucro >= 0 ? "success" : "danger"}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Quick access */}
        <Section title="Acesso rápido" className="lg:col-span-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <QuickLink to="/scan" Icon={LineChart} label="Scan" desc="Analisar gráfico com IA" />
            <QuickLink to="/mind" Icon={Brain} label="OrionMind" desc="Mentor de trade" />
            <QuickLink to="/gestao" Icon={ClipboardList} label="Gestão" desc="Registrar trades" />
            <QuickLink
              to="/gestao"
              Icon={BarChart3}
              label="Relatório"
              desc="Métricas e histórico"
            />
            <QuickLink
              to="/calculadora"
              Icon={Calculator}
              label="Calculadora"
              desc="Gestão de banca"
            />
            {!state.isPro && (
              <QuickLink
                to="/upgrade"
                Icon={Crown}
                label="Upgrade PRO"
                desc="Análises ilimitadas"
                highlight
              />
            )}
          </div>
        </Section>

        {/* Recent conversations */}
        <Section
          title="Últimas conversas"
          action={
            <Link
              to="/mind"
              className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-[color:var(--accent)]"
            >
              <Plus className="h-3 w-3" /> Nova
            </Link>
          }
        >
          {threads.length === 0 ? (
            <Empty
              text="Nenhuma conversa ainda."
              cta={
                <Link to="/mind" className="text-[color:var(--accent)] hover:underline">
                  Iniciar com o OrionMind →
                </Link>
              }
            />
          ) : (
            <div className="space-y-1.5">
              {threads.map((t) => (
                <Link
                  key={t.id}
                  to="/mind"
                  className="group flex items-center gap-2 rounded-md border px-3 py-2 text-sm smooth hover:border-[color:var(--accent)]"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
                >
                  <MessageSquare
                    className="h-3.5 w-3.5 flex-none"
                    style={{ color: "var(--accent)" }}
                  />
                  <span className="truncate flex-1">{t.title}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {relativeTime(t.updated_at)}
                  </span>
                </Link>
              ))}
              <Link
                to="/mind"
                className="mt-1 flex items-center justify-center gap-1 text-[11px] text-muted-foreground hover:text-[color:var(--accent)]"
              >
                Ver todas <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </Section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {/* Recent scans */}
        <Section
          title="Últimas análises"
          action={
            <Link
              to="/scan"
              className="text-[11px] text-muted-foreground hover:text-[color:var(--accent)]"
            >
              Ver todas →
            </Link>
          }
        >
          {lastScans.length === 0 ? (
            <Empty text="Nenhuma análise registrada." />
          ) : (
            <div className="space-y-1.5">
              {lastScans.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
                >
                  <span className="font-mono text-xs">{s.ativo || "—"}</span>
                  <span className="text-[10px] text-muted-foreground">{s.timeframe}</span>
                  <span
                    className="ml-auto rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                    style={{
                      background:
                        s.direcao === "COMPRA"
                          ? "color-mix(in oklab, var(--green) 18%, transparent)"
                          : "color-mix(in oklab, var(--red) 18%, transparent)",
                      color: s.direcao === "COMPRA" ? "var(--green)" : "var(--red)",
                    }}
                  >
                    {s.direcao}
                  </span>
                  {s.confianca !== undefined && (
                    <span className="text-[10px] text-muted-foreground">{s.confianca}%</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Recent trades */}
        <Section
          title="Últimos trades"
          action={
            <Link
              to="/gestao"
              className="text-[11px] text-muted-foreground hover:text-[color:var(--accent)]"
            >
              Gestão →
            </Link>
          }
        >
          {lastTrades.length === 0 ? (
            <Empty text="Nenhum trade registrado." />
          ) : (
            <div className="space-y-1.5">
              {lastTrades.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
                >
                  <span className="font-mono text-xs">{t.ativo}</span>
                  <span
                    className="rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase"
                    style={{
                      background:
                        t.dir === "COMPRA"
                          ? "color-mix(in oklab, var(--green) 18%, transparent)"
                          : "color-mix(in oklab, var(--red) 18%, transparent)",
                      color: t.dir === "COMPRA" ? "var(--green)" : "var(--red)",
                    }}
                  >
                    {t.dir}
                  </span>
                  <span
                    className="ml-auto text-xs font-semibold"
                    style={{
                      color:
                        t.res === "WIN"
                          ? "var(--green)"
                          : t.res === "LOSS"
                            ? "var(--red)"
                            : "var(--text-muted)",
                    }}
                  >
                    {t.res === "OPEN"
                      ? "Em aberto"
                      : `${Number(t.lucro) < 0 ? "-" : ""}$${Math.abs(Number(t.lucro)).toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  action,
  children,
  className = "",
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-xl border p-5 fade-up ${className}`}
      style={{
        background: "color-mix(in oklab, var(--surface) 80%, transparent)",
        borderColor: "var(--border)",
      }}
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-sm font-semibold tracking-tight">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function QuickLink({
  to,
  Icon,
  label,
  desc,
  highlight,
}: {
  to: string;
  Icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  label: string;
  desc: string;
  highlight?: boolean;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-lg border px-3 py-3 smooth press hover:border-[color:var(--accent)] hover:-translate-y-px"
      style={{
        background: highlight
          ? "color-mix(in oklab, var(--accent) 12%, var(--surface-2))"
          : "var(--surface-2)",
        borderColor: highlight
          ? "color-mix(in oklab, var(--accent) 35%, transparent)"
          : "var(--border)",
      }}
    >
      <div
        className="flex h-9 w-9 flex-none items-center justify-center rounded-md border"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border)",
          color: "var(--accent)",
        }}
      >
        <Icon className="h-4 w-4" strokeWidth={1.75} />
      </div>
      <div className="flex flex-col leading-tight">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-[11px] text-muted-foreground">{desc}</span>
      </div>
      <ArrowRight className="ml-auto h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function Empty({ text, cta }: { text: string; cta?: React.ReactNode }) {
  return (
    <div
      className="rounded-md border border-dashed px-3 py-6 text-center text-xs text-muted-foreground"
      style={{ borderColor: "var(--border)" }}
    >
      {text}
      {cta && <div className="mt-2">{cta}</div>}
    </div>
  );
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}
