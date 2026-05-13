import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Upload,
  ClipboardPaste,
  FileImage,
  Loader2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Image as ImageIcon,
  RefreshCw,
  Sparkles,
  Info,
  AlertCircle,
  LineChart,
  Clock,
  History,
  Trash2,
} from "lucide-react";
import { useAppState, type ScanResult } from "@/lib/store";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  loadScanHistory,
  addScanHistory,
  removeScanHistory,
  makeThumb,
  type ScanHistoryItem,
} from "@/lib/scanHistory";

export const Route = createFileRoute("/_app/scan")({
  head: () => ({ meta: [{ title: "TraderScan — OrionHub" }] }),
  component: ScanPage,
});

type Stage = "upload" | "duration" | "analyzing" | "result" | "error";
const DURATIONS = [1, 5, 15, 30, 60] as const;
const EXPIRATIONS = [1, 5] as const;

function fmtHHMM(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}
function computeTimes(expiracao: 1 | 5) {
  const entry = new Date();
  entry.setSeconds(0, 0);
  entry.setMinutes(entry.getMinutes() + expiracao);
  const p1 = new Date(entry); p1.setMinutes(p1.getMinutes() + 1);
  const p2 = new Date(p1); p2.setMinutes(p2.getMinutes() + 1);
  return { entrada: fmtHHMM(entry), protecao1: fmtHHMM(p1), protecao2: fmtHHMM(p2) };
}

function ScanPage() {
  const { state, update } = useAppState();
  const [stage, setStage] = useState<Stage>("upload");
  const [imgData, setImgData] = useState<string>("");
  const [duration, setDuration] = useState<(typeof DURATIONS)[number]>(5);
  const [expiracao, setExpiracao] = useState<(typeof EXPIRATIONS)[number]>(5);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [resultThumb, setResultThumb] = useState<string>("");
  const [err, setErr] = useState<string>("");
  const [drag, setDrag] = useState(false);
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { setHistory(loadScanHistory()); }, []);

  useEffect(() => {
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const it of items) {
        if (it.type.startsWith("image/")) {
          const f = it.getAsFile();
          if (f) loadFile(f);
          break;
        }
      }
    }
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, []);

  function loadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setErr("Arquivo precisa ser uma imagem.");
      setStage("error");
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      setImgData(String(r.result));
      setStage("duration");
    };
    r.readAsDataURL(file);
  }

  async function pasteFromClipboard() {
    try {
      const items = await navigator.clipboard.read();
      for (const it of items) {
        for (const t of it.types) {
          if (t.startsWith("image/")) {
            const blob = await it.getType(t);
            loadFile(new File([blob], "paste.png", { type: t }));
            return;
          }
        }
      }
      setErr("Nenhuma imagem na área de transferência.");
      setStage("error");
    } catch {
      setErr("Use Ctrl+V com uma imagem copiada.");
      setStage("error");
    }
  }

  async function startAnalysis() {
    if (!state.isPro && state.analysesLeft <= 0) {
      const msg = "Você usou suas análises do trial. Ative o acesso anual para continuar.";
      setErr(msg);
      toast.error(msg);
      setStage("error");
      return;
    }
    setStage("analyzing");
    setErr("");
    toast.info("Analisando o gráfico…");
    try {
      const [, b64] = imgData.split(",");
      const mediaType = (imgData.split(";")[0].split(":")[1] || "image/png") as
        | "image/png"
        | "image/jpeg"
        | "image/webp"
        | "image/gif";
      const r = await fetch("/api/ai-scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: b64, mediaType, durationMin: duration }),
      });
      const data = (await r.json()) as { ok: boolean; result?: ScanResult; error?: string };
      if (!data.ok || !data.result) {
        const msg = data.error || "Não foi possível analisar a imagem.";
        setErr(msg);
        toast.error(msg);
        setStage("error");
        return;
      }
      const times = computeTimes(expiracao);
      const res: ScanResult = {
        ...data.result,
        ...times,
        createdAt: new Date().toISOString(),
      };
      setResult(res);
      const thumb = await makeThumb(imgData);
      setResultThumb(thumb);
      const item: ScanHistoryItem = {
        id: crypto.randomUUID(),
        thumb,
        result: res,
        expiracaoMin: expiracao,
        createdAt: res.createdAt!,
      };
      setHistory(addScanHistory(item));
      if (!state.isPro) update({ analysesLeft: Math.max(0, state.analysesLeft - 1) });
      setStage("result");
      toast.success(`Análise concluída — ${res.direcao} ${res.confianca}%`);
    } catch {
      const msg = "Erro de conexão. Tente novamente.";
      setErr(msg);
      toast.error(msg);
      setStage("error");
    }
  }

  function reset() {
    setStage("upload");
    setImgData("");
    setResult(null);
    setResultThumb("");
    setErr("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function openHistoryItem(item: ScanHistoryItem) {
    setResult(item.result);
    setResultThumb(item.thumb);
    setExpiracao(item.expiracaoMin);
    setImgData(item.thumb);
    setStage("result");
  }
  function deleteHistoryItem(id: string) {
    setHistory(removeScanHistory(id));
  }

  const planBadge = state.isPro ? (
    <Badge variant="outline" className="border-[color:var(--accent)]/30 bg-[color:var(--accent)]/10 text-[color:var(--accent)]">
      Acesso Anual
    </Badge>
  ) : (
    <Link to="/upgrade" className="smooth hover:opacity-80">
      <Badge variant="outline" className="gap-1.5 font-mono text-[10px] tracking-wide">
        <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--gold)" }} />
        {state.analysesLeft} análises no trial
      </Badge>
    </Link>
  );

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-8">
      <PageHeader
        title="TraderScan"
        description="Envie um print do gráfico para análise técnica assistida por IA."
        icon={<LineChart className="h-5 w-5" strokeWidth={1.75} />}
        actions={planBadge}
      />

      {stage === "upload" && (
        <div className="space-y-4 fade-up">
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDrag(true);
            }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDrag(false);
              const f = e.dataTransfer.files[0];
              if (f) loadFile(f);
            }}
            className="cursor-pointer rounded-xl border border-dashed p-12 text-center smooth hover:border-[color:var(--accent)]"
            style={{
              borderColor: drag ? "var(--accent)" : "var(--border-strong)",
              background: drag ? "color-mix(in oklab, var(--accent) 5%, transparent)" : "var(--surface)",
            }}
          >
            <div
              className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg border"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--accent)" }}
            >
              <Upload className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="font-display text-base font-semibold">Solte ou clique para enviar o gráfico</div>
            <div className="mt-1 text-sm text-muted-foreground">PNG, JPG ou WEBP · até 5 MB</div>
            <div className="mt-3 font-mono text-[10px] uppercase tracking-wider text-[color:var(--text-dim)]">
              ou pressione Ctrl + V
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ActionTile
              icon={<ClipboardPaste className="h-4 w-4" strokeWidth={1.75} />}
              title="Colar print"
              desc="Da área de transferência"
              onClick={pasteFromClipboard}
            />
            <ActionTile
              icon={<FileImage className="h-4 w-4" strokeWidth={1.75} />}
              title="Escolher arquivo"
              desc="Upload do dispositivo"
              onClick={() => fileRef.current?.click()}
            />
          </div>
          <div
            className="flex items-start gap-2.5 rounded-lg border p-3 text-xs text-muted-foreground"
            style={{
              background: "color-mix(in oklab, var(--accent) 4%, transparent)",
              borderColor: "color-mix(in oklab, var(--accent) 14%, transparent)",
            }}
          >
            <Info className="mt-0.5 h-3.5 w-3.5 flex-none" strokeWidth={1.75} style={{ color: "var(--accent)" }} />
            <span>Garanta que velas, indicadores e horário estejam visíveis no print para uma análise mais precisa.</span>
          </div>

          {history.length > 0 && (
            <div className="rounded-xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                  <History className="h-3.5 w-3.5" strokeWidth={1.75} />
                  Histórico de análises
                </div>
                <span className="font-mono text-[10px] text-[color:var(--text-dim)]">{history.length}</span>
              </div>
              <div className="grid gap-2 px-3 pb-3 sm:grid-cols-2">
                {history.slice(0, 8).map((h) => {
                  const compra = h.result.direcao === "COMPRA";
                  return (
                    <div key={h.id} className="group relative flex gap-3 rounded-lg border p-2 smooth hover:border-[color:var(--accent)]"
                      style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
                      <button onClick={() => openHistoryItem(h)} className="flex flex-1 gap-3 text-left">
                        <img src={h.thumb} alt="" className="h-14 w-20 flex-none rounded object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-semibold" style={{ color: compra ? "var(--green)" : "var(--red)" }}>
                              {compra ? "Compra" : "Venda"}
                            </span>
                            <span className="font-mono text-[10px] text-muted-foreground">{h.result.confianca}%</span>
                          </div>
                          <div className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                            Entrada {h.result.entrada} · M{h.expiracaoMin}
                          </div>
                          <div className="font-mono text-[10px] text-[color:var(--text-dim)]">
                            {new Date(h.createdAt).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </button>
                      <button onClick={() => deleteHistoryItem(h.id)} className="absolute right-1.5 top-1.5 hidden text-muted-foreground hover:text-[color:var(--red)] group-hover:block">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {stage === "duration" && imgData && (
        <div className="space-y-4 fade-up">
          <div
            className="overflow-hidden rounded-xl border"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <img src={imgData} alt="preview" className="mx-auto max-h-[360px] w-full object-contain" />
          </div>
          <div
            className="rounded-xl border p-5"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Timeframe do gráfico
            </div>
            <div className="grid grid-cols-5 gap-2">
              {DURATIONS.map((d) => {
                const active = d === duration;
                return (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className="rounded-md border py-2.5 text-sm font-medium font-mono smooth press"
                    style={
                      active
                        ? { background: "color-mix(in oklab, var(--accent) 14%, transparent)", color: "var(--accent)", borderColor: "color-mix(in oklab, var(--accent) 35%, transparent)" }
                        : { background: "var(--surface-2)", color: "var(--text-muted)", borderColor: "var(--border-strong)" }
                    }
                  >
                    {d < 60 ? `M${d}` : "H1"}
                  </button>
                );
              })}
            </div>

            <div className="mt-5 mb-3 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              Tempo da entrada
            </div>
            <div className="grid grid-cols-2 gap-2">
              {EXPIRATIONS.map((d) => {
                const active = d === expiracao;
                return (
                  <button
                    key={d}
                    onClick={() => setExpiracao(d)}
                    className="rounded-md border py-2.5 text-sm font-medium font-mono smooth press"
                    style={
                      active
                        ? { background: "color-mix(in oklab, var(--accent) 14%, transparent)", color: "var(--accent)", borderColor: "color-mix(in oklab, var(--accent) 35%, transparent)" }
                        : { background: "var(--surface-2)", color: "var(--text-muted)", borderColor: "var(--border-strong)" }
                    }
                  >
                    {d} min
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex items-center gap-1.5 text-[10px] text-[color:var(--text-dim)]">
              <Clock className="h-3 w-3" /> Entrada será {expiracao} min após o scan; proteções a cada 1 min depois.
            </div>

            <div className="mt-5 flex gap-2">
              <Button variant="outline" onClick={reset} className="flex-1">
                Trocar imagem
              </Button>
              <Button onClick={startAnalysis} className="flex-1 gap-2">
                <Sparkles className="h-4 w-4" strokeWidth={1.75} />
                Analisar
              </Button>
            </div>
          </div>
        </div>
      )}

      {stage === "analyzing" && (
        <div
          className="flex flex-col items-center rounded-xl border px-6 py-16 text-center fade-in"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <Loader2 className="mb-4 h-8 w-8 animate-spin" style={{ color: "var(--accent)" }} strokeWidth={1.5} />
          <div className="font-display text-base font-semibold">Analisando o gráfico</div>
          <div className="mt-1 text-sm text-muted-foreground">A IA está identificando padrões e tendências…</div>
        </div>
      )}

      {stage === "error" && (
        <div
          className="rounded-xl border p-5 fade-in"
          style={{
            background: "color-mix(in oklab, var(--red) 6%, transparent)",
            borderColor: "color-mix(in oklab, var(--red) 22%, transparent)",
          }}
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" strokeWidth={1.75} style={{ color: "var(--red)" }} />
            <div className="text-sm font-medium" style={{ color: "var(--red)" }}>{err}</div>
          </div>
          <Button variant="outline" onClick={reset} className="mt-4 gap-2">
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.75} />
            Tentar novamente
          </Button>
        </div>
      )}

      {stage === "result" && result && <ResultView r={result} thumb={resultThumb} onReset={reset} />}
    </div>
  );
}

function ActionTile({
  icon,
  title,
  desc,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-3 rounded-xl border p-4 text-left smooth hover:border-[color:var(--accent)]"
      style={{ background: "var(--surface)", borderColor: "var(--border-strong)" }}
    >
      <span
        className="flex h-9 w-9 flex-none items-center justify-center rounded-md border smooth group-hover:text-[color:var(--accent)]"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--text-muted)" }}
      >
        {icon}
      </span>
      <span>
        <span className="block text-sm font-semibold">{title}</span>
        <span className="block text-xs text-muted-foreground">{desc}</span>
      </span>
    </button>
  );
}

function ResultView({ r, thumb, onReset }: { r: ScanResult; thumb: string; onReset: () => void }) {
  const isCall = r.direcao === "COMPRA";
  const conf = Math.min(100, Math.max(0, Number(r.confianca) || 50));
  const confColor = conf >= 75 ? "var(--green)" : conf >= 50 ? "var(--gold)" : "var(--red)";

  return (
    <div className="space-y-4 fade-up">
      {thumb && (
        <div className="overflow-hidden rounded-xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <img src={thumb} alt="gráfico analisado" className="mx-auto max-h-[260px] w-full object-contain" />
        </div>
      )}

      {/* Verdict card */}
      <div
        className="rounded-xl border p-5"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div className="flex items-center gap-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-xl border"
              style={{
                background: isCall
                  ? "color-mix(in oklab, var(--green) 14%, transparent)"
                  : "color-mix(in oklab, var(--red) 14%, transparent)",
                borderColor: isCall
                  ? "color-mix(in oklab, var(--green) 30%, transparent)"
                  : "color-mix(in oklab, var(--red) 30%, transparent)",
                color: isCall ? "var(--green)" : "var(--red)",
              }}
            >
              {isCall ? (
                <TrendingUp className="h-6 w-6" strokeWidth={1.75} />
              ) : (
                <TrendingDown className="h-6 w-6" strokeWidth={1.75} />
              )}
            </div>
            <div>
              <div
                className="font-display text-2xl font-semibold tracking-tight"
                style={{ color: isCall ? "var(--green)" : "var(--red)" }}
              >
                {isCall ? "Compra" : "Venda"}
              </div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                {r.ativo || "Ativo"} · {r.timeframe || "—"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 md:flex-col md:items-end">
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Confiança</div>
            <div className="font-display text-3xl font-semibold tabular" style={{ color: confColor }}>
              {conf}%
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2">
          {[
            ["Entrada", r.entrada],
            ["Proteção 1", r.protecao1],
            ["Proteção 2", r.protecao2],
          ].map(([l, v]) => (
            <div
              key={l}
              className="rounded-md border p-3 text-center"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
            >
              <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{l}</div>
              <div className="mt-1 font-mono text-sm font-semibold tabular">{v || "—"}</div>
            </div>
          ))}
        </div>
      </div>

      {(r.justificativa || r.assertividade) && (
        <div
          className="rounded-xl border p-4 text-sm leading-relaxed text-muted-foreground"
          style={{ background: "var(--surface)", borderColor: "var(--border)", borderLeft: "2px solid var(--accent)" }}
        >
          {r.justificativa || r.assertividade}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {[
          ["Tendência", r.tendencia],
          ["Viés", r.vies],
          ["Suporte", r.suporte],
          ["Resistência", r.resistencia],
        ].map(([l, v]) => (
          <div
            key={l}
            className="rounded-xl border p-3"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{l}</div>
            <div className="mt-1 text-sm font-semibold">{v || "—"}</div>
          </div>
        ))}
      </div>

      {r.padroes && r.padroes.length > 0 && (
        <ChipSection label="Padrões identificados">
          {r.padroes.map((p) => (
            <Badge
              key={p}
              variant="outline"
              className="border-[color:var(--accent)]/25 bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
            >
              {p}
            </Badge>
          ))}
        </ChipSection>
      )}

      {r.indicadores && r.indicadores.length > 0 && (
        <ChipSection label="Indicadores">
          {r.indicadores.map((p) => (
            <Badge
              key={p}
              variant="outline"
              className="border-[color:var(--accent)]/25 bg-[color:var(--accent)]/10 text-[color:var(--accent)]"
            >
              {p}
            </Badge>
          ))}
        </ChipSection>
      )}

      {r.riscos && r.riscos.length > 0 && (
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            Riscos a monitorar
          </div>
          <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
            {r.riscos.map((p) => (
              <li key={p} className="flex items-start gap-2 py-2 text-xs text-muted-foreground first:pt-0">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-none" strokeWidth={1.75} style={{ color: "var(--gold)" }} />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-2">
        <Button variant="outline" onClick={onReset} className="flex-1 gap-2">
          <ImageIcon className="h-4 w-4" strokeWidth={1.75} />
          Nova análise
        </Button>
      </div>
    </div>
  );
}

function ChipSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-xl border p-4"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="mb-2.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}