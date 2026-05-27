import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { Calculator, DollarSign, TrendingUp, TrendingDown, Target, AlertTriangle } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { Input } from "@/components/ui/input";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

export const Route = createFileRoute("/_app/calculadora")({
  head: () => ({ meta: [{ title: "Calculadora — OrionHub" }] }),
  component: CalcPage,
});

function CalcPage() {
  const [banca, setBanca] = useState(1000);
  const [risco, setRisco] = useState(2);
  const [payout, setPayout] = useState(85);
  const [meta, setMeta] = useState(5);
  const [ops, setOps] = useState(10);
  const [winrate, setWinrate] = useState(60);

  const calc = useMemo(() => {
    const valor = +(banca * (risco / 100)).toFixed(2);
    const lucroWin = +(valor * (payout / 100)).toFixed(2);
    const prejLoss = -valor;
    // Proteção padrão Orion: entrada (1x), 1ª proteção (2x da entrada), 2ª proteção (2x da 1ª = 4x).
    const protecao = [valor, +(valor * 2).toFixed(2), +(valor * 4).toFixed(2)];
    const protecaoTotal = protecao.reduce((a, b) => a + b, 0);
    const metaValor = +(banca * (meta / 100)).toFixed(2);
    let bancaSim = banca;
    const progressao = Array.from({ length: ops }, (_, i) => {
      const win = Math.random() < winrate / 100;
      const delta = win ? bancaSim * (risco / 100) * (payout / 100) : -(bancaSim * (risco / 100));
      bancaSim = +(bancaSim + delta).toFixed(2);
      return { op: i + 1, win, banca: bancaSim };
    });
    return { valor, lucroWin, prejLoss, protecao, protecaoTotal, metaValor, progressao };
  }, [banca, risco, payout, meta, ops, winrate]);

  const accentRgb = "98, 142, 230";
  const lineData = {
    labels: calc.progressao.map((p) => `Op ${p.op}`),
    datasets: [
      {
        label: "Banca",
        data: calc.progressao.map((p) => p.banca),
        borderColor: `rgb(${accentRgb})`,
        backgroundColor: `rgba(${accentRgb}, 0.12)`,
        fill: true,
        tension: 0.3,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };
  const lineOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        ticks: { color: "rgb(140, 150, 170)", font: { size: 9 } },
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

  const protecaoPct = (calc.protecaoTotal / banca) * 100;

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-8">
      <PageHeader
        title="Calculadora de Banca"
        description="Dimensione risco, defina metas e simule cenários antes de operar."
        icon={<Calculator className="h-5 w-5" strokeWidth={1.75} />}
      />

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        {/* Parâmetros */}
        <div
          className="space-y-3 rounded-xl border p-5"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Parâmetros</div>
          <Field label="Banca inicial ($)" value={banca} onChange={setBanca} />
          <Field label="Risco por operação (%)" value={risco} onChange={setRisco} step={0.5} />
          <Field label="Payout (%)" value={payout} onChange={setPayout} />
          <Field label="Meta diária (%)" value={meta} onChange={setMeta} step={0.5} />
          <Field label="Nº de operações (simulação)" value={ops} onChange={setOps} />
          <Field label="Win rate estimado (%)" value={winrate} onChange={setWinrate} />
        </div>

        {/* Resultados */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard
              label="Valor por entrada"
              value={`$${calc.valor.toFixed(2)}`}
              icon={<DollarSign className="h-4 w-4" strokeWidth={1.75} />}
              tone="accent"
            />
            <StatCard
              label="Lucro por win"
              value={`+$${calc.lucroWin.toFixed(2)}`}
              icon={<TrendingUp className="h-4 w-4" strokeWidth={1.75} />}
              tone="success"
            />
            <StatCard
              label="Prejuízo por loss"
              value={`$${calc.prejLoss.toFixed(2)}`}
              icon={<TrendingDown className="h-4 w-4" strokeWidth={1.75} />}
              tone="danger"
            />
            <StatCard
              label="Meta diária"
              value={`$${calc.metaValor.toFixed(2)}`}
              hint={`${Math.ceil(calc.metaValor / Math.max(calc.lucroWin, 0.01))} wins necessários`}
              icon={<Target className="h-4 w-4" strokeWidth={1.75} />}
            />
          </div>

          <div
            className="rounded-xl border p-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Proteção (padrão Orion)
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <AlertTriangle className="h-3 w-3" strokeWidth={1.75} style={{ color: "var(--gold)" }} />
                Risco total{" "}
                <span className="font-mono font-semibold tabular" style={{ color: "var(--red)" }}>
                  ${calc.protecaoTotal.toFixed(2)} ({protecaoPct.toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {calc.protecao.map((m, i) => {
                const labels = ["Entrada", "1ª Proteção", "2ª Proteção"] as const;
                return (
                  <div
                    key={i}
                    className="rounded-md border p-3 text-center"
                    style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
                  >
                    <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{labels[i]}</div>
                    <div className="mt-1 font-mono text-lg font-semibold tabular" style={{ color: "var(--gold)" }}>
                      ${m.toFixed(2)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
              Padrão Orion: <strong className="text-foreground">máximo 2 proteções</strong>, cada uma <strong className="text-foreground">2× a anterior</strong>. Stop loss diário: máximo 2 loss completos.
            </div>
          </div>

          <div
            className="rounded-xl border p-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Simulação · {ops} operações @ {winrate}% WR
              </div>
              <div className="font-mono text-sm font-semibold tabular">
                Final:{" "}
                <span
                  style={{
                    color:
                      calc.progressao[calc.progressao.length - 1]?.banca >= banca
                        ? "var(--green)"
                        : "var(--red)",
                  }}
                >
                  ${calc.progressao[calc.progressao.length - 1]?.banca.toFixed(2) ?? banca.toFixed(2)}
                </span>
              </div>
            </div>
            <div style={{ height: 220 }}>
              <Line data={lineData} options={lineOpts} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <Input
        type="number"
        inputMode="decimal"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="font-mono tabular"
      />
    </label>
  );
}