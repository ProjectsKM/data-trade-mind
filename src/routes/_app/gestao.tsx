import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ClipboardList,
  Download,
  Upload,
  Plus,
  Check,
  X,
  Trash2,
  Pencil,
  TrendingUp,
  TrendingDown,
  Wallet,
  Trophy,
  Percent,
  BarChart3,
  DollarSign,
  Target,
  Flame,
  FileImage,
  FileText,
  AlertTriangle,
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
import jsPDF from "jspdf";
import { useAppState, type Trade } from "@/lib/store";
import {
  ASSETS,
  CATEGORIA_LABEL,
  type Categoria,
  payoutForCategoria,
  categoriaForAtivo,
  getBanca,
  setBanca as persistBanca,
  getValorMode,
  setValorMode as persistValorMode,
  calcLucro as calcLucroShared,
} from "@/lib/assets";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { EmptyState } from "@/components/app/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend, Filler);

export const Route = createFileRoute("/_app/gestao")({
  head: () => ({ meta: [{ title: "Gestão & Relatório — OrionHub" }] }),
  component: GestaoPage,
});

type Form = {
  categoria: Categoria;
  ativo: string;
  valor: string;
  valorMode: "VALOR" | "PCT";
  payout: string;
  dir: "COMPRA" | "VENDA";
  res: "WIN" | "LOSS";
  obs: string;
};
const makeEmptyForm = (): Form => ({
  categoria: "CRIPTO",
  ativo: ASSETS.CRIPTO[0],
  valor: "",
  valorMode: typeof window !== "undefined" ? getValorMode() : "VALOR",
  payout: String(payoutForCategoria("CRIPTO")),
  dir: "COMPRA",
  res: "WIN",
  obs: "",
});

const calcLucro = calcLucroShared;

type ParsedRow = {
  line: number;
  raw: string;
  trade?: Omit<Trade, "id">;
  errors: string[];
};

// Parse a CSV row honoring "quoted, fields" with embedded commas and "" escapes.
function parseCSVRow(line: string, delimiter = ","): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQuotes) {
      if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else cur += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === delimiter) { out.push(cur); cur = ""; }
      else cur += c;
    }
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

// Accept "1,5", "1.5", "$ 1.234,56", "1 234.56" → number
function parseNumber(raw: string | undefined): number {
  if (raw == null) return NaN;
  let s = String(raw).trim().replace(/[\s$R€]/gi, "");
  if (!s) return NaN;
  const neg = s.startsWith("-") || (s.startsWith("(") && s.endsWith(")"));
  s = s.replace(/^[-(]/, "").replace(/\)$/, "");
  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  if (lastComma > lastDot) {
    // comma is decimal separator (pt-BR): remove thousand dots, swap comma → dot
    s = s.replace(/\./g, "").replace(",", ".");
  } else {
    // dot is decimal separator: remove thousand commas
    s = s.replace(/,/g, "");
  }
  const n = Number(s);
  return neg ? -n : n;
}

const HEADER_KEYS = ["id", "ativo", "data", "dir", "valor", "payout", "res", "lucro", "obs"];

function validateCSV(text: string): ParsedRow[] {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((r) => r.trim().length > 0);
  if (lines.length === 0) return [];

  // Detect delimiter (comma or semicolon — semicolon is common in pt-BR exports)
  const first = lines[0];
  const delim = (first.match(/;/g)?.length ?? 0) > (first.match(/,/g)?.length ?? 0) ? ";" : ",";

  const firstCols = parseCSVRow(first, delim).map((c) => c.toLowerCase());
  const hasHeader = firstCols.some((c) => HEADER_KEYS.includes(c));

  // Build column index map. Default positional layout: id,ativo,data,dir,valor,payout,res,lucro,obs
  const idx: Record<string, number> = {};
  if (hasHeader) {
    HEADER_KEYS.forEach((k) => { const i = firstCols.indexOf(k); if (i >= 0) idx[k] = i; });
  } else {
    HEADER_KEYS.forEach((k, i) => { idx[k] = i; });
  }

  const dataLines = hasHeader ? lines.slice(1) : lines;
  const out: ParsedRow[] = [];

  dataLines.forEach((row, i) => {
    const cols = parseCSVRow(row, delim);
    const get = (k: string) => (idx[k] != null ? cols[idx[k]] : undefined);
    const errors: string[] = [];

    const ativo = (get("ativo") || "").trim();
    if (!ativo) errors.push("Ativo vazio.");

    const rawData = (get("data") || "").trim();
    let dt: Date | null = null;
    if (rawData) {
      // Try ISO first, then dd/mm/yyyy[ hh:mm]
      const iso = new Date(rawData);
      if (!isNaN(+iso)) dt = iso;
      else {
        const m = rawData.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})(?:[ T](\d{1,2}):(\d{2}))?/);
        if (m) {
          const [, dd, mm, yy, hh = "0", mi = "0"] = m;
          const yr = yy.length === 2 ? 2000 + Number(yy) : Number(yy);
          dt = new Date(yr, Number(mm) - 1, Number(dd), Number(hh), Number(mi));
        }
      }
    } else {
      dt = new Date();
    }
    if (!dt || isNaN(+dt)) errors.push(`Data inválida ("${rawData}").`);

    const dirRaw = (get("dir") || "").trim().toUpperCase();
    const dirMap: Record<string, "COMPRA" | "VENDA"> = {
      COMPRA: "COMPRA", BUY: "COMPRA", LONG: "COMPRA", CALL: "COMPRA",
      VENDA: "VENDA", SELL: "VENDA", SHORT: "VENDA", PUT: "VENDA",
    };
    const dirN = dirMap[dirRaw];
    if (!dirN) errors.push(`Direção inválida ("${get("dir")}").`);

    const v = parseNumber(get("valor"));
    if (!isFinite(v) || v <= 0) errors.push(`Valor inválido ("${get("valor")}").`);

    const pRaw = (get("payout") || "").replace(/%/g, "");
    const p = parseNumber(pRaw);
    if (!isFinite(p) || p < 0 || p > 1000) errors.push(`Payout fora do intervalo ("${get("payout")}").`);

    const resRaw = (get("res") || "").trim().toUpperCase();
    const resMap: Record<string, "WIN" | "LOSS" | "OPEN"> = {
      WIN: "WIN", W: "WIN", GAIN: "WIN", VITORIA: "WIN", VITÓRIA: "WIN",
      LOSS: "LOSS", L: "LOSS", LOSE: "LOSS", PERDA: "LOSS", DERROTA: "LOSS",
      OPEN: "OPEN", ABERTA: "OPEN", ABERTO: "OPEN",
    };
    const resN = resMap[resRaw];
    if (!resN) errors.push(`Resultado inválido ("${get("res")}").`);

    const lucroRaw = get("lucro");
    const l = parseNumber(lucroRaw);
    const obs = (get("obs") || "").trim();

    out.push({
      line: i + (hasHeader ? 2 : 1),
      raw: row,
      errors,
      trade: errors.length === 0 && dt && dirN && resN ? {
        ativo: ativo.toUpperCase(),
        data: dt.toISOString(),
        dir: dirN,
        valor: v,
        payout: p,
        res: resN,
        lucro: isFinite(l) ? l : calcLucro(v, p, resN),
        obs: obs || undefined,
      } : undefined,
    });
  });

  return out;
}

function GestaoPage() {
  const { state, addTrade, updateTrade, deleteTrade } = useAppState();
  const [form, setForm] = useState<Form>(() => makeEmptyForm());
  const [banca, setBancaState] = useState<number | null>(null);
  const [bancaInput, setBancaInput] = useState<string>("");
  useEffect(() => { setBancaState(getBanca()); }, []);
  const fileRef = useRef<HTMLInputElement>(null);
  const [tab, setTab] = useState<"ops" | "report">("ops");
  const [importPreview, setImportPreview] = useState<ParsedRow[] | null>(null);
  const [importing, setImporting] = useState(false);
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
    const rawValor = parseFloat(form.valor);
    const payout = parseFloat(form.payout);
    if (!form.ativo.trim() || isNaN(rawValor) || isNaN(payout)) {
      toast.error("Preencha ativo, valor e payout para registrar.");
      return;
    }
    let valor = rawValor;
    if (form.valorMode === "PCT") {
      if (!banca || banca <= 0) {
        toast.error("Defina a banca inicial antes de operar em %.");
        return;
      }
      valor = +(banca * (rawValor / 100)).toFixed(2);
    }
    if (valor <= 0) {
      toast.error("Valor precisa ser maior que zero.");
      return;
    }
    try {
      await addTrade({
        ativo: form.ativo.trim(),
        data: new Date().toISOString(),
        dir: form.dir,
        valor,
        payout,
        res: form.res,
        lucro: calcLucro(valor, payout, form.res),
        obs: form.obs.trim() || undefined,
      });
      setForm((f) => ({ ...makeEmptyForm(), categoria: f.categoria, ativo: f.ativo, payout: f.payout, valorMode: f.valorMode }));
      toast.success(`Trade ${form.ativo} adicionado.`);
    } catch {
      toast.error("Não foi possível salvar o trade.");
    }
  }

  function saveBanca() {
    const n = parseFloat(bancaInput);
    if (!isFinite(n) || n <= 0) {
      toast.error("Informe uma banca válida.");
      return;
    }
    persistBanca(n);
    setBancaState(n);
    setBancaInput("");
    toast.success(`Banca definida: $${n.toFixed(2)}.`);
  }

  function setRes(id: string, res: "WIN" | "LOSS") {
    const t = trades.find((x) => x.id === id);
    if (!t) return;
    void updateTrade(id, { res, lucro: calcLucro(t.valor, t.payout, res) }).then(() =>
      toast.success(`Marcado como ${res === "WIN" ? "Win" : "Loss"}.`),
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
      const parsed = validateCSV(String(r.result));
      if (parsed.length === 0) {
        toast.error("Arquivo CSV vazio.");
        return;
      }
      setImportPreview(parsed);
    };
    r.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function confirmImport() {
    if (!importPreview) return;
    const valid = importPreview.filter((r) => r.trade);
    if (valid.length === 0) {
      toast.error("Nenhuma linha válida para importar.");
      return;
    }
    setImporting(true);
    try {
      for (const row of valid) {
        await addTrade(row.trade!);
      }
      toast.success(`${valid.length} trade(s) importado(s).`);
      setImportPreview(null);
    } catch {
      toast.error("Erro ao importar trades.");
    } finally {
      setImporting(false);
    }
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
          banca={banca}
          bancaInput={bancaInput}
          setBancaInput={setBancaInput}
          saveBanca={saveBanca}
          clearBanca={() => { persistBanca(0); setBancaState(null); }}
        />
      ) : (
        <ReportTab trades={trades} />
      )}

      <Dialog open={!!importPreview} onOpenChange={(o) => !o && setImportPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pré-visualização da importação</DialogTitle>
          </DialogHeader>
          {importPreview && (() => {
            const valid = importPreview.filter((r) => r.trade).length;
            const invalid = importPreview.length - valid;
            return (
              <>
                <div className="mb-3 flex gap-3 text-sm">
                  <span className="rounded-md border px-2 py-1" style={{ borderColor: "color-mix(in oklab, var(--green) 30%, transparent)", color: "var(--green)" }}>
                    {valid} válida(s)
                  </span>
                  <span className="rounded-md border px-2 py-1" style={{ borderColor: "color-mix(in oklab, var(--red) 30%, transparent)", color: "var(--red)" }}>
                    {invalid} com erro
                  </span>
                </div>
                <div className="max-h-72 overflow-y-auto rounded-md border" style={{ borderColor: "var(--border)" }}>
                  <table className="w-full text-xs">
                    <thead className="sticky top-0" style={{ background: "var(--surface-2)" }}>
                      <tr className="text-left text-muted-foreground">
                        <th className="px-3 py-1.5">Linha</th>
                        <th className="px-3 py-1.5">Status</th>
                        <th className="px-3 py-1.5">Detalhes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.map((r) => (
                        <tr key={r.line} className="border-t" style={{ borderColor: "var(--border)" }}>
                          <td className="px-3 py-1.5 font-mono">{r.line}</td>
                          <td className="px-3 py-1.5">
                            {r.errors.length === 0 ? (
                              <span className="inline-flex items-center gap-1" style={{ color: "var(--green)" }}>
                                <Check className="h-3 w-3" /> OK
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1" style={{ color: "var(--red)" }}>
                                <AlertTriangle className="h-3 w-3" /> Erro
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-1.5 text-muted-foreground">
                            {r.errors.length === 0
                              ? `${r.trade?.ativo} · ${r.trade?.dir} · $${r.trade?.valor}`
                              : r.errors.join(" ")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            );
          })()}
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportPreview(null)} disabled={importing}>Cancelar</Button>
            <Button onClick={() => void confirmImport()} disabled={importing || !importPreview?.some((r) => r.trade)}>
              {importing ? "Importando..." : "Importar válidos"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  banca,
  bancaInput,
  setBancaInput,
  saveBanca,
  clearBanca,
}: {
  form: Form;
  setForm: React.Dispatch<React.SetStateAction<Form>>;
  submitTrade: (e: React.FormEvent) => void;
  trades: Trade[];
  setRes: (id: string, res: "WIN" | "LOSS") => void;
  deleteTrade: (id: string) => void;
  banca: number | null;
  bancaInput: string;
  setBancaInput: (s: string) => void;
  saveBanca: () => void;
  clearBanca: () => void;
}) {
  const [obsOpen, setObsOpen] = useState<{ text: string; ativo: string } | null>(null);

  if (banca === null || banca <= 0) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border p-6 fade-up" style={{ background: "var(--surface)", borderColor: "var(--border-strong)" }}>
        <div className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          <Wallet className="h-3.5 w-3.5" /> Banca inicial
        </div>
        <h2 className="font-display text-xl font-bold tracking-tight">Defina sua banca</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Antes de registrar operações, informe o valor da sua banca em USD. Você poderá ajustar depois.
        </p>
        <div className="mt-4 flex gap-2">
          <Input
            type="number"
            step="0.01"
            placeholder="Ex: 200"
            value={bancaInput}
            onChange={(e) => setBancaInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") saveBanca(); }}
          />
          <Button onClick={saveBanca}>Salvar</Button>
        </div>
      </div>
    );
  }

  const ativos = ASSETS[form.categoria];

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="inline-flex items-center gap-2 rounded-lg border px-3 py-1.5" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <Wallet className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
          <span className="text-muted-foreground">Banca:</span>
          <span className="font-mono font-semibold tabular">${banca.toFixed(2)}</span>
        </div>
        <Button variant="outline" size="sm" onClick={clearBanca} className="text-xs">Editar banca</Button>
      </div>

      <form
        onSubmit={submitTrade}
        className="mb-6 rounded-xl border p-4"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Nova operação
        </div>
        <div className="grid gap-2.5 md:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Categoria</label>
            <Select
              value={form.categoria}
              onValueChange={(v) => {
                const cat = v as Categoria;
                const list = ASSETS[cat];
                setForm((f) => ({ ...f, categoria: cat, ativo: list[0], payout: String(payoutForCategoria(cat)) }));
              }}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {(Object.keys(ASSETS) as Categoria[]).map((c) => (
                  <SelectItem key={c} value={c}>{CATEGORIA_LABEL[c]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Ativo</label>
            <Select value={form.ativo} onValueChange={(v) => setForm((f) => ({ ...f, ativo: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ativos.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
              Valor {form.valorMode === "PCT" ? "(% da banca)" : "(USD)"}
            </label>
            <div className="flex gap-1.5">
              <Input
                type="number"
                step="0.01"
                placeholder={form.valorMode === "PCT" ? "Ex: 2" : "Ex: 5.00"}
                value={form.valor}
                onChange={(e) => setForm((f) => ({ ...f, valor: e.target.value }))}
              />
              <div className="inline-flex rounded-md border p-0.5" style={{ borderColor: "var(--border-strong)", background: "var(--surface-2)" }}>
                {(["VALOR", "PCT"] as const).map((m) => {
                  const active = form.valorMode === m;
                  return (
                    <button
                      key={m}
                      type="button"
                      onClick={() => { setForm((f) => ({ ...f, valorMode: m })); persistValorMode(m); }}
                      className="rounded px-2 text-[11px] font-semibold smooth"
                      style={active ? { background: "var(--accent)", color: "var(--accent-foreground)" } : { color: "var(--text-muted)" }}
                    >
                      {m === "VALOR" ? "$" : "%"}
                    </button>
                  );
                })}
              </div>
            </div>
            {form.valorMode === "PCT" && form.valor && isFinite(parseFloat(form.valor)) && (
              <div className="mt-1 font-mono text-[10px] text-[color:var(--text-dim)]">
                = ${(banca * (parseFloat(form.valor) / 100)).toFixed(2)}
              </div>
            )}
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Payout %</label>
            <Input
              type="number"
              placeholder="Payout %"
              value={form.payout}
              onChange={(e) => setForm((f) => ({ ...f, payout: e.target.value }))}
            />
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Direção</label>
            <Select value={form.dir} onValueChange={(v) => setForm((f) => ({ ...f, dir: v as Form["dir"] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="COMPRA">Compra</SelectItem>
                <SelectItem value="VENDA">Venda</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">Resultado</label>
            <Select value={form.res} onValueChange={(v) => setForm((f) => ({ ...f, res: v as Form["res"] }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="WIN">Win</SelectItem>
                <SelectItem value="LOSS">Loss</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <Input
          placeholder="Observação (opcional)"
          value={form.obs}
          onChange={(e) => setForm((f) => ({ ...f, obs: e.target.value }))}
          className="mt-2.5"
        />
        <div className="mt-3 flex justify-end">
          <Button type="submit" className="gap-1.5">
            <Plus className="h-4 w-4" strokeWidth={1.75} />
            Adicionar operação
          </Button>
        </div>
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
                {["Ativo", "Data", "Direção", "Valor", "Payout", "Resultado", "Lucro", "Obs", ""].map((h) => (
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
                  <td className="px-4 py-2.5 text-xs text-muted-foreground">
                    {t.obs ? (
                      <button
                        type="button"
                        title={t.obs}
                        onClick={() => setObsOpen({ text: t.obs!, ativo: t.ativo })}
                        className="inline-flex max-w-[180px] items-center gap-1 truncate text-left hover:text-[color:var(--accent)]"
                      >
                        <span className="truncate">{t.obs}</span>
                      </button>
                    ) : (
                      <span className="text-[color:var(--text-dim)]">—</span>
                    )}
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

      <Dialog open={!!obsOpen} onOpenChange={(o) => !o && setObsOpen(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Observação · {obsOpen?.ativo}</DialogTitle>
          </DialogHeader>
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">{obsOpen?.text}</p>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ReportTab({ trades }: { trades: Trade[] }) {
  const lineRef = useRef<ChartJS<"line"> | null>(null);
  const barRef = useRef<ChartJS<"bar"> | null>(null);
  const doughnutRef = useRef<ChartJS<"doughnut"> | null>(null);

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

  // Render a chart canvas onto an opaque background and return base64 PNG + intrinsic size.
  function snapshotChart(chart: ChartJS | null): { url: string; w: number; h: number } | null {
    if (!chart) return null;
    const src = chart.canvas;
    if (!src || !src.width || !src.height) return null;
    const out = document.createElement("canvas");
    out.width = src.width;
    out.height = src.height;
    const ctx = out.getContext("2d");
    if (!ctx) return null;
    // Solid background to avoid transparent PNG looking broken on white viewers.
    ctx.fillStyle = "#0F141C";
    ctx.fillRect(0, 0, out.width, out.height);
    ctx.drawImage(src, 0, 0);
    return { url: out.toDataURL("image/png"), w: out.width, h: out.height };
  }

  async function waitForCharts() {
    // Give Chart.js one animation frame so canvases are drawn.
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  }

  async function exportPNG() {
    await waitForCharts();
    const charts = [
      { ref: lineRef.current, name: "evolucao-lucro" },
      { ref: barRef.current, name: "lucro-por-ativo" },
      { ref: doughnutRef.current, name: "distribuicao" },
    ];
    let count = 0;
    let skipped = 0;
    for (const { ref, name } of charts) {
      const snap = snapshotChart(ref);
      if (!snap) { skipped++; continue; }
      const a = document.createElement("a");
      a.href = snap.url;
      a.download = `orionhub-${name}-${Date.now()}.png`;
      a.click();
      count++;
    }
    if (count === 0) { toast.error("Aguarde os gráficos renderizarem e tente novamente."); return; }
    toast.success(`${count} gráfico(s) exportado(s)${skipped ? ` (${skipped} pulado por não ter renderizado)` : ""}.`);
  }

  async function exportPDF() {
    await waitForCharts();
    const items = [
      { ref: lineRef.current, title: "Evolução do lucro" },
      { ref: barRef.current, title: "Lucro por ativo" },
      { ref: doughnutRef.current, title: "Distribuição de resultados" },
    ];
    const snaps = items
      .map((c) => ({ title: c.title, snap: snapshotChart(c.ref) }))
      .filter((c): c is { title: string; snap: { url: string; w: number; h: number } } => !!c.snap);
    if (snaps.length === 0) {
      toast.error("Aguarde os gráficos renderizarem e tente novamente.");
      return;
    }
    const pdf = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const margin = 40;
    const maxW = pageW - margin * 2;

    pdf.setFontSize(16);
    pdf.text("OrionHub — Relatório", margin, margin);
    pdf.setFontSize(10);
    pdf.setTextColor(120);
    pdf.text(new Date().toLocaleString("pt-BR"), margin, margin + 16);
    pdf.setTextColor(0);

    let y = margin + 50;
    snaps.forEach(({ title, snap }) => {
      // Preserve aspect ratio, cap height
      const aspect = snap.h / snap.w;
      const w = maxW;
      const h = Math.min(w * aspect, 280);
      const titleH = 22;
      if (y + h + titleH > pageH - margin) { pdf.addPage(); y = margin; }
      pdf.setFontSize(12);
      pdf.text(title, margin, y + 12);
      pdf.addImage(snap.url, "PNG", margin, y + titleH, w, h, undefined, "FAST");
      y += h + titleH + 24;
    });
    pdf.save(`orionhub-relatorio-${Date.now()}.pdf`);
    toast.success("PDF do relatório exportado.");
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
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="outline" size="sm" onClick={() => void exportPNG()} className="gap-1.5">
          <FileImage className="h-3.5 w-3.5" strokeWidth={1.75} />
          Exportar PNG
        </Button>
        <Button variant="outline" size="sm" onClick={() => void exportPDF()} className="gap-1.5">
          <FileText className="h-3.5 w-3.5" strokeWidth={1.75} />
          Exportar PDF
        </Button>
      </div>
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
        <div style={{ height: 280 }}><Line ref={lineRef} data={lineData} options={baseOpts} /></div>
      </ChartCard>
      <div className="grid gap-4 md:grid-cols-2">
        <ChartCard title="Lucro por ativo">
          <div style={{ height: 240 }}><Bar ref={barRef} data={barData} options={baseOpts} /></div>
        </ChartCard>
        <ChartCard title="Distribuição de resultados">
          <div style={{ height: 240 }}>
            <Doughnut
              ref={doughnutRef}
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