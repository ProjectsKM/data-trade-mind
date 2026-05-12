import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement,
  Tooltip, Legend, Filler,
} from "chart.js";
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { useAppState } from "@/lib/store";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

export const Route = createFileRoute("/_app/relatorio")({
  head: () => ({ meta: [{ title: "Relatório — OrionHub" }] }),
  component: RelatorioPage,
});

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
    let streak = 0; let streakType: "WIN" | "LOSS" | "" = "";
    for (let i = sorted.length - 1; i >= 0; i--) {
      const r = sorted[i].res;
      if (r === "OPEN") continue;
      if (!streakType) { streakType = r; streak = 1; }
      else if (r === streakType) streak++;
      else break;
    }
    return { wins, losses, open: trades.length - closed.length, totalOperado, payoutMed, streak, streakType };
  }, [trades, sorted]);

  const lineData = useMemo(() => {
    let acc = 0;
    return {
      labels: sorted.map((t) => new Date(t.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })),
      datasets: [{ label: "Lucro acumulado", data: sorted.map((t) => (acc += t.lucro)), borderColor: "#00aaff", backgroundColor: "rgba(0,170,255,0.15)", fill: true, tension: 0.3 }],
    };
  }, [sorted]);

  const barData = useMemo(() => {
    const map = new Map<string, number>();
    trades.forEach((t) => map.set(t.ativo, (map.get(t.ativo) || 0) + t.lucro));
    const entries = [...map.entries()].sort((a, b) => b[1] - a[1]);
    return {
      labels: entries.map((e) => e[0]),
      datasets: [{ label: "Lucro por ativo", data: entries.map((e) => e[1]), backgroundColor: entries.map((e) => (e[1] >= 0 ? "#22c55e" : "#ef4444")) }],
    };
  }, [trades]);

  const doughnutData = {
    labels: ["WIN", "LOSS", "OPEN"],
    datasets: [{ data: [kpis.wins, kpis.losses, kpis.open], backgroundColor: ["#22c55e", "#ef4444", "#64748b"], borderWidth: 0 }],
  };

  const opts = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: "#cbd5e1" } } }, scales: { x: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } }, y: { ticks: { color: "#94a3b8" }, grid: { color: "rgba(255,255,255,0.05)" } } } };

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold tracking-tight">Relatório</h1>
        <div className="flex gap-1 rounded-lg border p-1" style={{ borderColor: "var(--border-strong)", background: "var(--surface)" }}>
          {[[7, "7d"], [30, "30d"], [90, "90d"], [0, "Tudo"]].map(([v, l]) => (
            <button key={l as string} onClick={() => setPeriod(v as 7 | 30 | 90 | 0)} className="rounded px-3 py-1 text-xs font-bold transition-colors"
              style={period === v ? { background: "var(--accent)", color: "#fff" } : { color: "var(--text-dim)" }}>{l}</button>
          ))}
        </div>
      </div>
      {trades.length === 0 ? (
        <div className="rounded-3xl border p-12 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="mb-3 text-3xl">📊</div>
          <div className="text-base font-bold">Nenhum trade no período</div>
          <div className="mt-1 text-sm text-muted-foreground">Adicione operações em <Link to="/gestao" className="underline" style={{ color: "var(--electric)" }}>Gestão</Link> para ver gráficos.</div>
        </div>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              ["Total operado", `$${kpis.totalOperado.toFixed(2)}`],
              ["Payout médio", `${kpis.payoutMed}%`],
              ["Wins / Losses", `${kpis.wins} / ${kpis.losses}`],
              ["Sequência", kpis.streak ? `${kpis.streak} ${kpis.streakType}` : "—", kpis.streakType === "WIN" ? "var(--green)" : kpis.streakType === "LOSS" ? "var(--red)" : ""],
            ].map(([l, v, c]) => (
              <div key={l} className="rounded-2xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <div className="font-mono text-[9px] tracking-wider text-muted-foreground">{l.toUpperCase()}</div>
                <div className="mt-1 text-lg font-extrabold" style={{ color: c || "var(--foreground)" }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="mb-3 font-mono text-[10px] tracking-wider text-muted-foreground">EVOLUÇÃO DO LUCRO</div>
              <div style={{ height: 260 }}><Line data={lineData} options={opts} /></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <div className="mb-3 font-mono text-[10px] tracking-wider text-muted-foreground">LUCRO POR ATIVO</div>
                <div style={{ height: 240 }}><Bar data={barData} options={opts} /></div>
              </div>
              <div className="rounded-2xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                <div className="mb-3 font-mono text-[10px] tracking-wider text-muted-foreground">DISTRIBUIÇÃO</div>
                <div style={{ height: 240 }}><Doughnut data={doughnutData} options={{ ...opts, scales: undefined }} /></div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
