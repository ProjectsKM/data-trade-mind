import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ClipboardList,
  Download,
  Upload,
  Plus,
  Check,
  X,
  Trash2,
  TrendingUp,
  TrendingDown,
  Wallet,
  Trophy,
  Percent,
  BarChart3,
  DollarSign,
  Target,
  Flame,
} from "lucide-react";
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
import { useAppState, type Trade } from "@/lib/store";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

export const Route = createFileRoute("/_app/gestao")({
  head: () => ({ meta: [{ title: "Gestão & Relatório — OrionHub" }] }),
  component: GestaoPage,
});

type Form = {
  ativo: string;
  valor: string;
  payout: string;
  dir: "COMPRA" | "VENDA";
  res: "WIN" | "LOSS" | "OPEN";
  obs: string;
};
const emptyForm: Form = { ativo: "", valor: "", payout: "85", dir: "COMPRA", res: "WIN", obs: "" };

function calcLucro(valor: number, payout: number, res: Trade["res"]) {
  if (res === "WIN") return +(valor * (payout / 100)).toFixed(2);
  if (res === "LOSS") return -valor;
  return 0;
}

function GestaoPage() {
  const { state, addTrade, updateTrade, deleteTrade } = useAppState();
  const [form, setForm] = useState<Form>(emptyForm);
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"ops" | "report">("ops");
  const trades = state.tradeList;

  const stats = useMemo(() => {
    const closed = trades.filter((t) => t.res !== "OPEN");
    const wins = closed.filter((t) => t.res === "WIN").length;
    const lucro = trades.reduce((a, t) => a + t.lucro, 0);
    const best = trades.reduce((a, t) => (t.lucro > a ? t.lucro : a), 0);
    const worst = trades.reduce((a, t) => (t.lucro < a ? t.lucro : a), 0);
    return {
      total: trades.length,
      winrate: closed.length ? Math.round((wins / closed.length) * 100) : 0,
      lucro,
      best,
      worst,
    };
  }, [trades]);

  async function submitTrade(e: React.FormEvent) {
    e.preventDefault();
    const valor = parseFloat(form.valor);
    const payout = parseFloat(form.payout);
    if (!form.ativo.trim() || isNaN(valor) || isNaN(payout)) {
      toast.error("Preencha ativo, valor e payout para registrar.");
      return;
    }
    try {
      await addTrade({
        ativo: form.ativo.trim().toUpperCase(),
        data: new Date().toISOString(),
        dir: form.dir,
        valor,
        payout,
        res: form.res,
        lucro: calcLucro(valor, payout, form.res),
        obs: form.obs.trim() || undefined,
      });
      setForm(emptyForm);
      toast.success(`Trade ${form.ativo.toUpperCase()} adicionado.`);
    } catch {
      toast.error("Não foi possível salvar o trade.");
    }
  }

  function setRes(id: string, res: Trade["res"]) {
    const t = trades.find((x) => x.id === id);
    if (!t) return;
    void updateTrade(id, { res, lucro: calcLucro(t.valor, t.payout, res) }).then(() =>
      toast.success(`Marcado como ${res === "WIN" ? "Win" : res === "LOSS" ? "Loss" : "Aberto"}.`),
    );
  }

  function removeTrade(id: string) {
    void deleteTrade(id).then(() => toast.success("Trade removido."));
  }

  function exportCSV() {
    const head = "id,ativo,data,dir,valor,payout,res,lucro,obs";
    const lines = trades.map((t) =>
      [t.id, t.ativo, t.data, t.dir, t.valor, t.payout, t.res, t.lucro, (t.obs || "").replace(/[\n,]/g, " ")].join(","),
    );
    const blob = new Blob([head + "\n" + lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orionhub-trades-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado.");
  }

  function importCSV(file: File) {
    const r = new FileReader();
    r.onload = () => {
      const text = String(r.result);
      const rows = text.split(/\r?\n/).slice(1).filter(Boolean);
      for (const row of rows) {
        const [, ativo, data, dir, valor, payout, res, lucro, obs] = row.split(",");
        void addTrade({
          ativo: ativo || "?",
          data: data || new Date().toISOString(),
          dir: (dir as Trade["dir"]) || "COMPRA",
          valor: Number(valor) || 0,
          payout: Number(payout) || 0,
          res: (res as Trade["res"]) || "OPEN",
          lucro: Number(lucro) || 0,
          obs: obs || undefined,
        });
      }
      toast.success(`${rows.length} trade(s) importado(s).`);
    };
    r.readAsText(file);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8">
      <PageHeader
        title="Gestão & Relatório"
        description="Registre operações e analise sua performance em um só lugar."
        icon={<ClipboardList className="h-5 w-5" strokeWidth={1.75} />}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-1.5">
              <Download className="h-3.5 w-3.5" strokeWidth={1.75} />
              Exportar
            </Button>
            <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()} className="gap-1.5">
              <Upload className="h-3.5 w-3.5" strokeWidth={1.75} />
              Importar
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              hidden
              onChange={(e) => e.target.files?.[0] && importCSV(e.target.files[0])}
            />
          </>
        }
      />

      <div
        className="mb-5 inline-flex gap-1 rounded-lg border p-1"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {([
          ["ops", "Operações", ClipboardList],
          ["report", "Relatório", BarChart3],
        ] as const).map(([k, l, Icon]) => {
          const active = tab === k;
          return (
            <button
              key={k}
              onClick={() => setTab(k)}
              className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium smooth"
              style={
                active
                  ? { background: "var(--surface-2)", color: "var(--foreground)" }
                  : { color: "var(--text-dim)" }
              }
            >
              <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
              {l}
            </button>
          );
        })}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard
          label="Trades"
          value={stats.total}
          icon={<ClipboardList className="h-4 w-4" strokeWidth={1.75} />}
        />
        <StatCard
          label="Win rate"
          value={`${stats.winrate}%`}
          icon={<Percent className="h-4 w-4" strokeWidth={1.75} />}
          tone={stats.winrate >= 60 ? "success" : stats.winrate >= 40 ? "warning" : "danger"}
        />
        <StatCard
          label="Lucro líquido"
          value={`$${stats.lucro.toFixed(2)}`}
          icon={<Wallet className="h-4 w-4" strokeWidth={1.75} />}
          tone={stats.lucro >= 0 ? "success" : "danger"}
        />
        <StatCard
          label="Melhor / Pior"
          value={`+$${stats.best.toFixed(0)} / $${stats.worst.toFixed(0)}`}
          icon={<Trophy className="h-4 w-4" strokeWidth={1.75} />}
        />
      </div>

      {tab === "ops" ? (
        <OpsTab
          form={form}
          setForm={setForm}
          submitTrade={submitTrade}
          trades={trades}
          setRes={setRes}
          deleteTrade={removeTrade}
        />
      ) : (
        <ReportTab trades={trades} />
      )}
    </div>
  );
}

function OpsTab({
  form,
  setForm,
  submitTrade,
  trades,
  setRes,
  deleteTrade,
}: {
  form: Form;
  setForm: (f: Form) => void;
  submitTrade: (e: React.FormEvent) => void;
  trades: Trade[];
  setRes: (id: string, res: Trade["res"]) => void;
  deleteTrade: (id: string) => void;
}) {
  return (
    <>
      <form
        onSubmit={submitTrade}
        className="mb-6 rounded-xl border p-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Nova operação
        </div>
        <div className="grid gap-2.5 md:grid-cols-7">
          <Input
            placeholder="Ativo (ex: EURUSD)"
            value={form.ativo}
            onChange={(e) => setForm({ ...form, ativo: e.target.value })}
            className="md:col-span-2"
          />
          <Input
            type="number"
            step="0.01"
            placeholder="Valor"
            value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
          />
          <Input
            type="number"
            placeholder="Payout %"
            value={form.payout}
            onChange={(e) => setForm({ ...form, payout: e.target.value })}
          />
          <select
            className="flex h-9 rounded-md border bg-transparent px-3 text-sm shadow-sm"
            style={{ borderColor: "var(--border-strong)", background: "var(--surface)" }}
            value={form.dir}
            onChange={(e) => setForm({ ...form, dir: e.target.value as Form["dir"] })}
          >
            <option value="COMPRA">Compra</option>
            <option value="VENDA">Venda</option>
          </select>
          <select
            className="flex h-9 rounded-md border bg-transparent px-3 text-sm shadow-sm"
            style={{ borderColor: "var(--border-strong)", background: "var(--surface)" }}
            value={form.res}
            onChange={(e) => setForm({ ...form, res: e.target.value as Form["res"] })}
          >
            <option value="WIN">Win</option>
            <option value="LOSS">Loss</option>
            <option value="OPEN">Aberta</option>
          </select>
          <Button type="submit" className="gap-1.5">
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            Adicionar
          </Button>
        </div>
        <Input
          placeholder="Observação (opcional)"
          value={form.obs}
          onChange={(e) => setForm({ ...form, obs: e.target.value })}
          className="mt-2.5"
        />
      </form>

      {trades.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-5 w-5" strokeWidth={1.5} />}
          title="Nenhum trade ainda"
          description="Adicione sua primeira operação no formulário acima para começar a acompanhar sua performance."
        />
      ) : (
        <div
          className="overflow-x-auto rounded-xl border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <table className="w-full text-sm">
            <thead style={{ background: "var(--surface-2)" }}>
              <tr className="text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {["Ativo", "Data", "Direção", "Valor", "Payout", "Resultado", "Lucro", ""].map((h) => (
                  <th key={h} className="px-4 py-2.5">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades.map((t) => (
                <tr
                  key={t.id}
                  className="border-t smooth hover:bg-[var(--surface-2)]"
                  style={{ borderColor: "var(--border)" }}
                >
                  <td className="px-4 py-2.5 font-mono text-xs font-semibold tabular">{t.ativo}</td>
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {new Date(t.data).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-2.5">
                    <span
                      className="inline-flex items-center gap-1 text-xs font-medium"
                      style={{ color: t.dir === "COMPRA" ? "var(--green)" : "var(--red)" }}
                    >
                      {t.dir === "COMPRA" ? (
                        <TrendingUp className="h-3 w-3" strokeWidth={2} />
                      ) : (
                        <TrendingDown className="h-3 w-3" strokeWidth={2} />
                      )}
                      {t.dir === "COMPRA" ? "Compra" : "Venda"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 font-mono tabular">${t.valor.toFixed(2)}</td>
                  <td className="px-4 py-2.5 font-mono text-xs tabular text-muted-foreground">{t.payout}%</td>
                  <td className="px-4 py-2.5">
                    <span
                      className="inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium"
                      style={{
                        background:
                          t.res === "WIN"
                            ? "color-mix(in oklab, var(--green) 12%, transparent)"
                            : t.res === "LOSS"
                              ? "color-mix(in oklab, var(--red) 12%, transparent)"
                              : "var(--surface-2)",
                        borderColor:
                          t.res === "WIN"
                            ? "color-mix(in oklab, var(--green) 28%, transparent)"
                            : t.res === "LOSS"
                              ? "color-mix(in oklab, var(--red) 28%, transparent)"
                              : "var(--border)",
                        color:
                          t.res === "WIN"
                            ? "var(--green)"
                            : t.res === "LOSS"
                              ? "var(--red)"
                              : "var(--text-muted)",
                      }}
                    >
                      {t.res === "WIN" ? "Win" : t.res === "LOSS" ? "Loss" : "Aberta"}
                    </span>
                  </td>
                  <td
                    className="px-4 py-2.5 font-mono text-sm font-semibold tabular"
                    style={{
                      color:
                        t.lucro > 0 ? "var(--green)" : t.lucro < 0 ? "var(--red)" : "var(--text-muted)",
                    }}
                  >
                    {t.lucro >= 0 ? "+" : ""}${t.lucro.toFixed(2)}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => setRes(t.id, "WIN")}
                        title="Marcar como Win"
                        className="flex h-7 w-7 items-center justify-center rounded-md border smooth hover:border-[color:var(--green)] hover:text-[color:var(--green)]"
                        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                      >
                        <Check className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => setRes(t.id, "LOSS")}
                        title="Marcar como Loss"
                        className="flex h-7 w-7 items-center justify-center rounded-md border smooth hover:border-[color:var(--red)] hover:text-[color:var(--red)]"
                        style={{ borderColor: "var(--border)", color: "var(--text-muted)" }}
                      >
                        <X className="h-3.5 w-3.5" strokeWidth={2} />
                      </button>
                      <button
                        onClick={() => deleteTrade(t.id)}
                        title="Excluir"
                        className="flex h-7 w-7 items-center justify-center rounded-md border smooth hover:border-[color:var(--red)] hover:text-[color:var(--red)]"
                        style={{ borderColor: "var(--border)", color: "var(--text-dim)" }}
                      >
                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function ReportTab({ trades }: { trades: Trade[] }) {
  const sorted = [...trades].sort((a, b) => +new Date(a.data) - +new Date(b.data));
  const closed = trades.filter((t) => t.res !== "OPEN");
  const wins = closed.filter((t) => t.res === "WIN").length;
  const losses = closed.filter((t) => t.res === "LOSS").length;
  const open = trades.length - closed.length;
  const totalOperado = trades.reduce((a, t) => a + t.valor, 0);
  const payoutMed = trades.length ? Math.round(trades.reduce((a, t) => a + t.payout, 0) / trades.length) : 0;
  let streak = 0;
  let streakType: "WIN" | "LOSS" | "" = "";
  for (let i = sorted.length - 1; i >= 0; i--) {
    const r = sorted[i].res;
    if (r === "OPEN") continue;
    if (!streakType) { streakType = r; streak = 1; }
    else if (r === streakType) streak++;
    else break;
  }

  if (trades.length === 0) {
    return (
      <EmptyState
        icon={<BarChart3 className="h-5 w-5" strokeWidth={1.5} />}
        title="Sem dados para o relatório"
        description="Adicione operações na aba Operações para visualizar gráficos e métricas."
      />
    );
  }

  const accent = "98, 142, 230";
  let acc = 0;
  const lineData = {
    labels: sorted.map((t) => new Date(t.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })),
    datasets: [{
      label: "Lucro acumulado",
      data: sorted.map((t) => (acc += t.lucro)),
      borderColor: `rgb(${accent})`,
      backgroundColor: `rgba(${accent}, 0.12)`,
      fill: true, tension: 0.32, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4,
    }],
  };
  const map = new Map<string, number>();
  trades.forEach((t) => map.set(t.ativo, (map.get(t.ativo) || 0) + t.lucro));
  const entries = [...map.entries()].sort((a, b) => b[1] - a[1]);
  const barData = {
    labels: entries.map((e) => e[0]),
    datasets: [{
      label: "Lucro por ativo",
      data: entries.map((e) => e[1]),
      backgroundColor: entries.map((e) => (e[1] >= 0 ? "rgba(110, 200, 140, 0.85)" : "rgba(220, 110, 110, 0.85)")),
      borderRadius: 4,
    }],
  };
  const doughnutData = {
    labels: ["Win", "Loss", "Aberta"],
    datasets: [{ data: [wins, losses, open], backgroundColor: ["rgb(110, 200, 140)", "rgb(220, 110, 110)", "rgb(120, 130, 150)"], borderWidth: 0 }],
  };
  const baseOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: "rgb(170, 178, 195)", font: { size: 11 } } },
      tooltip: { backgroundColor: "rgba(20, 24, 32, 0.95)", borderColor: "rgba(255,255,255,0.08)", borderWidth: 1, padding: 10, titleFont: { size: 11 }, bodyFont: { size: 12 } },
    },
    scales: {
      x: { ticks: { color: "rgb(140, 150, 170)", font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.04)" }, border: { display: false } },
      y: { ticks: { color: "rgb(140, 150, 170)", font: { size: 10 } }, grid: { color: "rgba(255,255,255,0.04)" }, border: { display: false } },
    },
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Total operado" value={`$${totalOperado.toFixed(2)}`} icon={<DollarSign className="h-4 w-4" strokeWidth={1.75} />} />
        <StatCard label="Payout médio" value={`${payoutMed}%`} icon={<Percent className="h-4 w-4" strokeWidth={1.75} />} />
        <StatCard label="Wins / Losses" value={`${wins} / ${losses}`} icon={<Target className="h-4 w-4" strokeWidth={1.75} />} />
        <StatCard
          label="Sequência"
          value={streak ? `${streak} ${streakType}` : "—"}
          icon={<Flame className="h-4 w-4" strokeWidth={1.75} />}
          tone={streakType === "WIN" ? "success" : streakType === "LOSS" ? "danger" : "neutral"}
        />
      </div>
      <ChartCard title="Evolução do lucro">
        <div style={{ height: 280 }}><Line data={lineData} options={baseOpts} /></div>
      </ChartCard>
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="Lucro por ativo">
          <div style={{ height: 240 }}><Bar data={barData} options={baseOpts} /></div>
        </ChartCard>
        <ChartCard title="Distribuição de resultados">
          <div style={{ height: 240 }}>
            <Doughnut
              data={doughnutData}
              options={{
                ...baseOpts, scales: undefined, cutout: "68%",
                plugins: { ...baseOpts.plugins, legend: { ...baseOpts.plugins.legend, position: "right" as const } },
              }}
            />
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{title}</div>
      {children}
    </div>
  );
}