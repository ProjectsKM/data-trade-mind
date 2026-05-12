import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { BarChart3, DollarSign, Percent, Target, Flame } from "lucide-react";
import { useAppState } from "@/lib/store";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

export const Route = createFileRoute("/_app/relatorio")({
  head: () => ({ meta: [{ title: "Relatório — OrionHub" }] }),
  component: RelatorioPage,
});

const PERIODS: Array<[7 | 30 | 90 | 0, string]> = [
  [7, "7 dias"],
  [30, "30 dias"],
  [90, "90 dias"],
  [0, "Tudo"],
];

function RelatorioPage() {
  const { state } = useAppState();
  const [period, setPeriod] = useState<7 | 30 | 90 | 0>(0);

  const trades = useMemo(() => {
    if (period === 0) return state.tradeList;
    const cutoff = Date.now() - period * 86400000;
    return state.tradeList.filter((t) => new Date(t.data).getTime() >= cutoff);
  }, [state.tradeList, period]);

  const sorted = [...trades].sort((a, b) => +new Date(a.data) - +new Date(b.data));

  const kpis = useMemo(() => {
    const closed = trades.filter((t) => t.res !== "OPEN");
    const wins = closed.filter((t) => t.res === "WIN").length;
    const losses = closed.filter((t) => t.res === "LOSS").length;
    const totalOperado = trades.reduce((a, t) => a + t.valor, 0);
    const payoutMed = trades.length ? Math.round(trades.reduce((a, t) => a + t.payout, 0) / trades.length) : 0;
    let streak = 0;
    let streakType: "WIN" | "LOSS" | "" = "";
    for (let i = sorted.length - 1; i >= 0; i--) {
      const r = sorted[i].res;
      if (r === "OPEN") continue;
      if (!streakType) {
        streakType = r;
        streak = 1;
      } else if (r === streakType) streak++;
      else break;
    }
    return { wins, losses, open: trades.length - closed.length, totalOperado, payoutMed, streak, streakType };
  }, [trades, sorted]);

  const accentRgb = "98, 142, 230"; // approximate of accent oklch
  const lineData = useMemo(() => {
    let acc = 0;
    return {
      labels: sorted.map((t) =>
        new Date(t.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
      ),
      datasets: [
        {
          label: "Lucro acumulado",
          data: sorted.map((t) => (acc += t.lucro)),
          borderColor: `rgb(${accentRgb})`,
          backgroundColor: `rgba(${accentRgb}, 0.12)`,
          fill: true,
          tension: 0.32,
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 4,
        },
      ],
    };
  }, [sorted]);

  const barData = useMemo(() => {
    const map = new Map<string, number>();
    trades.forEach((t) => map.set(t.ativo, (map.get(t.ativo) || 0) + t.lucro));
    const entries = [...map.entries()].sort((a, b) => b[1] - a[1]);
    return {
      labels: entries.map((e) => e[0]),
      datasets: [
        {
          label: "Lucro por ativo",
          data: entries.map((e) => e[1]),
          backgroundColor: entries.map((e) => (e[1] >= 0 ? "rgba(110, 200, 140, 0.85)" : "rgba(220, 110, 110, 0.85)")),
          borderRadius: 4,
        },
      ],
    };
  }, [trades]);

  const doughnutData = {
    labels: ["Win", "Loss", "Aberta"],
    datasets: [
      {
        data: [kpis.wins, kpis.losses, kpis.open],
        backgroundColor: ["rgb(110, 200, 140)", "rgb(220, 110, 110)", "rgb(120, 130, 150)"],
        borderWidth: 0,
      },
    ],
  };

  const baseOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "rgb(170, 178, 195)", font: { size: 11 } } },
      tooltip: {
        backgroundColor: "rgba(20, 24, 32, 0.95)",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        padding: 10,
        titleFont: { size: 11 },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: {
        ticks: { color: "rgb(140, 150, 170)", font: { size: 10 } },
        grid: { color: "rgba(255,255,255,0.04)" },
        border: { display: false },
      },
      y: {
        ticks: { color: "rgb(140, 150, 170)", font: { size: 10 } },
        grid: { color: "rgba(255,255,255,0.04)" },
        border: { display: false },
      },
    },
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8">
      <PageHeader
        title="Relatório"
        description="Visualize a evolução das suas operações com métricas e gráficos."
        icon={<BarChart3 className="h-5 w-5" strokeWidth={1.75} />}
        actions={
          <div
            className="flex gap-1 rounded-md border p-1"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            {PERIODS.map(([v, l]) => (
              <button
                key={l}
                onClick={() => setPeriod(v)}
                className="rounded-sm px-3 py-1 text-xs font-medium smooth"
                style={
                  period === v
                    ? { background: "var(--surface-2)", color: "var(--foreground)" }
                    : { color: "var(--text-dim)" }
                }
              >
                {l}
              </button>
            ))}
          </div>
        }
      />

      {trades.length === 0 ? (
        <EmptyState
          icon={<BarChart3 className="h-5 w-5" strokeWidth={1.5} />}
          title="Nenhum trade no período"
          description="Adicione operações para começar a visualizar gráficos e métricas."
          action={
            <Link to="/gestao">
              <Button>Ir para Gestão</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard
              label="Total operado"
              value={`$${kpis.totalOperado.toFixed(2)}`}
              icon={<DollarSign className="h-4 w-4" strokeWidth={1.75} />}
            />
            <StatCard
              label="Payout médio"
              value={`${kpis.payoutMed}%`}
              icon={<Percent className="h-4 w-4" strokeWidth={1.75} />}
            />
            <StatCard
              label="Wins / Losses"
              value={`${kpis.wins} / ${kpis.losses}`}
              icon={<Target className="h-4 w-4" strokeWidth={1.75} />}
            />
            <StatCard
              label="Sequência"
              value={kpis.streak ? `${kpis.streak} ${kpis.streakType}` : "—"}
              icon={<Flame className="h-4 w-4" strokeWidth={1.75} />}
              tone={kpis.streakType === "WIN" ? "success" : kpis.streakType === "LOSS" ? "danger" : "neutral"}
            />
          </div>
          <div className="space-y-4">
            <ChartCard title="Evolução do lucro">
              <div style={{ height: 280 }}>
                <Line data={lineData} options={baseOpts} />
              </div>
            </ChartCard>
            <div className="grid gap-4 md:grid-cols-2">
              <ChartCard title="Lucro por ativo">
                <div style={{ height: 240 }}>
                  <Bar data={barData} options={baseOpts} />
                </div>
              </ChartCard>
              <ChartCard title="Distribuição de resultados">
                <div style={{ height: 240 }}>
                  <Doughnut
                    data={doughnutData}
                    options={{
                      ...baseOpts,
                      scales: undefined,
                      cutout: "68%",
                      plugins: { ...baseOpts.plugins, legend: { ...baseOpts.plugins.legend, position: "right" as const } },
                    }}
                  />
                </div>
              </ChartCard>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}