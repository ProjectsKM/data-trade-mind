import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { useAppState, type Trade } from "@/lib/store";

export const Route = createFileRoute("/_app/gestao")({
  head: () => ({ meta: [{ title: "Gestão — OrionHub" }] }),
  component: GestaoPage,
});

type Form = { ativo: string; valor: string; payout: string; dir: "COMPRA" | "VENDA"; res: "WIN" | "LOSS" | "OPEN"; obs: string; };
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
  const trades = state.tradeList;
  const stats = useMemo(() => {
    const closed = trades.filter((t) => t.res !== "OPEN");
    const wins = closed.filter((t) => t.res === "WIN").length;
    const lucro = trades.reduce((a, t) => a + t.lucro, 0);
    const best = trades.reduce((a, t) => (t.lucro > a ? t.lucro : a), 0);
    const worst = trades.reduce((a, t) => (t.lucro < a ? t.lucro : a), 0);
    return { total: trades.length, winrate: closed.length ? Math.round((wins / closed.length) * 100) : 0, lucro, best, worst };
  }, [trades]);

  async function submitTrade(e: React.FormEvent) {
    e.preventDefault();
    const valor = parseFloat(form.valor); const payout = parseFloat(form.payout);
    if (!form.ativo.trim() || isNaN(valor) || isNaN(payout)) return;
    await addTrade({ ativo: form.ativo.trim().toUpperCase(), data: new Date().toISOString(), dir: form.dir, valor, payout, res: form.res, lucro: calcLucro(valor, payout, form.res), obs: form.obs.trim() || undefined });
    setForm(emptyForm);
  }
  function setRes(id: string, res: Trade["res"]) {
    const t = trades.find((x) => x.id === id);
    if (!t) return;
    void updateTrade(id, { res, lucro: calcLucro(t.valor, t.payout, res) });
  }
  function del(id: string) { void deleteTrade(id); }
  function exportCSV() {
    const head = "id,ativo,data,dir,valor,payout,res,lucro,obs";
    const lines = trades.map((t) => [t.id, t.ativo, t.data, t.dir, t.valor, t.payout, t.res, t.lucro, (t.obs || "").replace(/[\n,]/g, " ")].join(","));
    const blob = new Blob([head + "\n" + lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `orionhub-trades-${Date.now()}.csv`; a.click(); URL.revokeObjectURL(url);
  }
  function importCSV(file: File) {
    const r = new FileReader();
    r.onload = () => {
      const text = String(r.result);
      const rows = text.split(/\r?\n/).slice(1).filter(Boolean);
      for (const row of rows) {
        const [, ativo, data, dir, valor, payout, res, lucro, obs] = row.split(",");
        void addTrade({
          ativo: ativo || "?", data: data || new Date().toISOString(),
          dir: (dir as Trade["dir"]) || "COMPRA",
          valor: Number(valor) || 0, payout: Number(payout) || 0,
          res: (res as Trade["res"]) || "OPEN",
          lucro: Number(lucro) || 0, obs: obs || undefined,
        });
      }
    };
    r.readAsText(file);
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-7">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-extrabold tracking-tight">Gestão de Trades</h1>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="rounded-lg border px-3 py-1.5 text-xs font-bold hover:border-[color:var(--accent)]" style={{ borderColor: "var(--border-strong)", background: "var(--surface)" }}>⬇ Exportar CSV</button>
          <button onClick={() => fileRef.current?.click()} className="rounded-lg border px-3 py-1.5 text-xs font-bold hover:border-[color:var(--accent)]" style={{ borderColor: "var(--border-strong)", background: "var(--surface)" }}>⬆ Importar CSV</button>
          <input ref={fileRef} type="file" accept=".csv" hidden onChange={(e) => e.target.files?.[0] && importCSV(e.target.files[0])} />
        </div>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ["Trades", String(stats.total)],
          ["Win rate", `${stats.winrate}%`],
          ["Lucro líq.", `$${stats.lucro.toFixed(2)}`, stats.lucro >= 0 ? "var(--green)" : "var(--red)"],
          ["Melhor / Pior", `+$${stats.best.toFixed(0)} / $${stats.worst.toFixed(0)}`],
        ].map(([l, v, c]) => (
          <div key={l} className="rounded-2xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="font-mono text-[9px] tracking-wider text-muted-foreground">{l.toUpperCase()}</div>
            <div className="mt-1 text-lg font-extrabold" style={{ color: c || "var(--foreground)" }}>{v}</div>
          </div>
        ))}
      </div>
      <form onSubmit={submitTrade} className="mb-5 grid grid-cols-2 gap-3 rounded-2xl border p-4 md:grid-cols-7" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <input className="col-span-2 rounded-lg border bg-transparent px-3 py-2 text-sm md:col-span-1" placeholder="Ativo" style={{ borderColor: "var(--border-strong)" }} value={form.ativo} onChange={(e) => setForm({ ...form, ativo: e.target.value })} />
        <input className="rounded-lg border bg-transparent px-3 py-2 text-sm" type="number" step="0.01" placeholder="Valor" style={{ borderColor: "var(--border-strong)" }} value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
        <input className="rounded-lg border bg-transparent px-3 py-2 text-sm" type="number" placeholder="Payout %" style={{ borderColor: "var(--border-strong)" }} value={form.payout} onChange={(e) => setForm({ ...form, payout: e.target.value })} />
        <select className="rounded-lg border bg-[var(--surface)] px-3 py-2 text-sm" style={{ borderColor: "var(--border-strong)" }} value={form.dir} onChange={(e) => setForm({ ...form, dir: e.target.value as Form["dir"] })}>
          <option value="COMPRA">COMPRA</option><option value="VENDA">VENDA</option>
        </select>
        <select className="rounded-lg border bg-[var(--surface)] px-3 py-2 text-sm" style={{ borderColor: "var(--border-strong)" }} value={form.res} onChange={(e) => setForm({ ...form, res: e.target.value as Form["res"] })}>
          <option value="WIN">WIN</option><option value="LOSS">LOSS</option><option value="OPEN">OPEN</option>
        </select>
        <input className="col-span-2 rounded-lg border bg-transparent px-3 py-2 text-sm md:col-span-1" placeholder="Obs (opcional)" style={{ borderColor: "var(--border-strong)" }} value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })} />
        <button type="submit" className="col-span-2 rounded-lg px-4 py-2 text-sm font-bold text-white md:col-span-1" style={{ background: "var(--accent)" }}>Adicionar</button>
      </form>
      <div className="overflow-x-auto rounded-2xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left font-mono text-[9px] tracking-wider text-muted-foreground">
              {["ATIVO", "DATA", "DIR", "VALOR", "PAY", "RES", "LUCRO", "AÇÕES"].map((h) => <th key={h} className="px-3 py-2.5">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {trades.length === 0 && (<tr><td colSpan={8} className="px-3 py-10 text-center text-muted-foreground">Nenhum trade ainda. Adicione o primeiro acima.</td></tr>)}
            {trades.map((t) => (
              <tr key={t.id} className="border-t" style={{ borderColor: "var(--border)" }}>
                <td className="px-3 py-2 font-bold">{t.ativo}</td>
                <td className="px-3 py-2 text-xs text-muted-foreground">{new Date(t.data).toLocaleDateString("pt-BR")}</td>
                <td className="px-3 py-2"><span className="text-xs font-bold" style={{ color: t.dir === "COMPRA" ? "var(--green)" : "var(--red)" }}>{t.dir}</span></td>
                <td className="px-3 py-2">${t.valor.toFixed(2)}</td>
                <td className="px-3 py-2 text-muted-foreground">{t.payout}%</td>
                <td className="px-3 py-2"><span className="rounded-full px-2 py-0.5 text-[10px] font-bold" style={{
                  background: t.res === "WIN" ? "color-mix(in oklab, var(--green) 18%, transparent)" : t.res === "LOSS" ? "color-mix(in oklab, var(--red) 18%, transparent)" : "color-mix(in oklab, var(--text-muted) 12%, transparent)",
                  color: t.res === "WIN" ? "var(--green)" : t.res === "LOSS" ? "var(--red)" : "var(--text-muted)",
                }}>{t.res}</span></td>
                <td className="px-3 py-2 font-bold" style={{ color: t.lucro > 0 ? "var(--green)" : t.lucro < 0 ? "var(--red)" : "var(--text-muted)" }}>{t.lucro >= 0 ? "+" : ""}${t.lucro.toFixed(2)}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    <button onClick={() => setRes(t.id, "WIN")} className="rounded px-2 py-0.5 text-[10px] hover:opacity-80" style={{ background: "color-mix(in oklab, var(--green) 18%, transparent)", color: "var(--green)" }}>W</button>
                    <button onClick={() => setRes(t.id, "LOSS")} className="rounded px-2 py-0.5 text-[10px] hover:opacity-80" style={{ background: "color-mix(in oklab, var(--red) 18%, transparent)", color: "var(--red)" }}>L</button>
                    <button onClick={() => del(t.id)} className="rounded px-2 py-0.5 text-[10px] text-muted-foreground hover:text-[color:var(--red)]">✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
