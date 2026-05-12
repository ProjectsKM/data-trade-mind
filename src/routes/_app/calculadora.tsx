import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

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
    const martingale = [valor, +(valor * 2.2).toFixed(2), +(valor * 5).toFixed(2)];
    const martTotal = martingale.reduce((a, b) => a + b, 0);
    const metaValor = +(banca * (meta / 100)).toFixed(2);
    let bancaSim = banca;
    const progressao = Array.from({ length: ops }, (_, i) => {
      const win = Math.random() < winrate / 100;
      const delta = win ? bancaSim * (risco / 100) * (payout / 100) : -(bancaSim * (risco / 100));
      bancaSim = +(bancaSim + delta).toFixed(2);
      return { op: i + 1, win, banca: bancaSim };
    });
    return { valor, lucroWin, prejLoss, martingale, martTotal, metaValor, progressao };
  }, [banca, risco, payout, meta, ops, winrate]);

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-7">
      <h1 className="mb-5 text-xl font-extrabold tracking-tight">Calculadora de Banca</h1>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-3 rounded-2xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="mb-1 font-mono text-[10px] tracking-wider text-muted-foreground">PARÂMETROS</div>
          <Field label="Banca inicial ($)" value={banca} onChange={setBanca} />
          <Field label="Risco por operação (%)" value={risco} onChange={setRisco} step={0.5} />
          <Field label="Payout (%)" value={payout} onChange={setPayout} />
          <Field label="Meta diária (%)" value={meta} onChange={setMeta} step={0.5} />
          <Field label="Nº de operações (simulação)" value={ops} onChange={setOps} />
          <Field label="Win rate estimado (%)" value={winrate} onChange={setWinrate} />
        </div>
        <div className="space-y-3">
          <Card label="VALOR POR ENTRADA" value={`$${calc.valor.toFixed(2)}`} />
          <div className="grid grid-cols-2 gap-3">
            <Card label="LUCRO POR WIN" value={`+$${calc.lucroWin.toFixed(2)}`} color="var(--green)" />
            <Card label="PREJUÍZO POR LOSS" value={`$${calc.prejLoss.toFixed(2)}`} color="var(--red)" />
          </div>
          <Card label="META DIÁRIA" value={`$${calc.metaValor.toFixed(2)}`} sub={`${Math.ceil(calc.metaValor / calc.lucroWin)} wins necessários`} />
          <div className="rounded-2xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="mb-2 font-mono text-[10px] tracking-wider text-muted-foreground">MARTINGALE (3 NÍVEIS)</div>
            <div className="flex items-center gap-2 text-sm">
              {calc.martingale.map((m, i) => (
                <span key={i} className="rounded-lg px-2.5 py-1 font-bold" style={{ background: "color-mix(in oklab, var(--gold) 14%, transparent)", color: "var(--gold)" }}>${m.toFixed(2)}</span>
              ))}
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              Risco total: <span className="font-bold" style={{ color: "var(--red)" }}>${calc.martTotal.toFixed(2)}</span> ({((calc.martTotal / banca) * 100).toFixed(1)}% da banca)
            </div>
          </div>
        </div>
      </div>
      <div className="mt-5 rounded-2xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="mb-3 font-mono text-[10px] tracking-wider text-muted-foreground">SIMULAÇÃO ({ops} OPERAÇÕES @ {winrate}% WR)</div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left font-mono text-[9px] tracking-wider text-muted-foreground"><th className="px-2 py-1.5">OP</th><th className="px-2 py-1.5">RES</th><th className="px-2 py-1.5">BANCA</th></tr></thead>
            <tbody>
              {calc.progressao.map((p) => (
                <tr key={p.op} className="border-t" style={{ borderColor: "var(--border)" }}>
                  <td className="px-2 py-1">{p.op}</td>
                  <td className="px-2 py-1"><span className="text-xs font-bold" style={{ color: p.win ? "var(--green)" : "var(--red)" }}>{p.win ? "WIN" : "LOSS"}</span></td>
                  <td className="px-2 py-1 font-bold" style={{ color: p.banca >= banca ? "var(--green)" : "var(--red)" }}>${p.banca.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, step = 1 }: { label: string; value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-muted-foreground">{label}</span>
      <input type="number" step={step} value={value} onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm" style={{ borderColor: "var(--border-strong)" }} />
    </label>
  );
}

function Card({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="rounded-2xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="font-mono text-[10px] tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 text-2xl font-extrabold" style={{ color: color || "var(--foreground)" }}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
