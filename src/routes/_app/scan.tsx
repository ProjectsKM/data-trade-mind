import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import { useAppState, type ScanResult } from "@/lib/store";

export const Route = createFileRoute("/_app/scan")({
  head: () => ({ meta: [{ title: "TraderScan — OrionHub" }] }),
  component: ScanPage,
});

type Stage = "upload" | "duration" | "analyzing" | "result" | "error";
const DURATIONS = [1, 5, 15, 30, 60] as const;

function ScanPage() {
  const { state, update } = useAppState();
  const [stage, setStage] = useState<Stage>("upload");
  const [imgData, setImgData] = useState<string>("");
  const [result, setResult] = useState<ScanResult | null>(null);
  const [err, setErr] = useState<string>("");
  const [drag, setDrag] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
    if (!file.type.startsWith("image/")) { setErr("Arquivo precisa ser uma imagem."); setStage("error"); return; }
    const r = new FileReader();
    r.onload = () => { setImgData(String(r.result)); setStage("duration"); };
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
      setErr("Nenhuma imagem na área de transferência."); setStage("error");
    } catch { setErr("Use Ctrl+V com uma imagem copiada."); setStage("error"); }
  }

  async function startAnalysis(durationMin: number) {
    if (!state.isPro && state.analysesLeft <= 0) {
      setErr("Você usou suas 5 análises grátis. Faça upgrade para continuar."); setStage("error"); return;
    }
    setStage("analyzing"); setErr("");
    try {
      const [, b64] = imgData.split(",");
      const mediaType = (imgData.split(";")[0].split(":")[1] || "image/png") as "image/png" | "image/jpeg" | "image/webp" | "image/gif";
      const r = await fetch("/api/ai-scan", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: b64, mediaType, durationMin }) });
      const data = (await r.json()) as { ok: boolean; result?: ScanResult; error?: string };
      if (!data.ok || !data.result) { setErr(data.error || "Não foi possível analisar a imagem."); setStage("error"); return; }
      const res: ScanResult = { ...data.result, createdAt: new Date().toISOString() };
      setResult(res);
      update((s) => ({ ...s, analysesLeft: s.isPro ? s.analysesLeft : Math.max(0, s.analysesLeft - 1), history: [res, ...s.history].slice(0, 50) }));
      setStage("result");
    } catch { setErr("Erro de conexão. Tente novamente."); setStage("error"); }
  }

  function reset() { setStage("upload"); setImgData(""); setResult(null); setErr(""); if (fileRef.current) fileRef.current.value = ""; }

  return (
    <div className="mx-auto w-full max-w-2xl px-5 py-7">
      <h1 className="mb-5 text-xl font-extrabold tracking-tight">TraderScan</h1>
      {!state.isPro && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border p-4"
          style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--accent) 8%, transparent), color-mix(in oklab, var(--electric) 5%, transparent))", borderColor: "color-mix(in oklab, var(--accent) 22%, transparent)" }}>
          <div>
            <div className="text-sm font-bold">Plano Free · {state.analysesLeft} análises restantes</div>
            <div className="text-xs text-muted-foreground">{state.trialDaysLeft} dias de trial PRO</div>
          </div>
        </div>
      )}
      {stage === "upload" && (
        <>
          <div onClick={() => fileRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) loadFile(f); }}
            className="cursor-pointer rounded-3xl border-2 border-dashed p-12 text-center transition-all"
            style={{ borderColor: drag ? "var(--accent)" : "var(--border-strong)", background: drag ? "color-mix(in oklab, var(--accent) 4%, transparent)" : "var(--surface)" }}>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full text-2xl"
              style={{ background: "color-mix(in oklab, var(--accent) 8%, transparent)", border: "1px solid color-mix(in oklab, var(--accent) 18%, transparent)" }}>📊</div>
            <div className="text-lg font-bold">Solte ou clique para enviar o gráfico</div>
            <div className="mt-1 text-sm text-muted-foreground">PNG, JPG ou WEBP · até 5MB</div>
            <div className="mt-3 font-mono text-[10px] tracking-widest" style={{ color: "var(--text-dim)" }}>OU PRESSIONE CTRL+V</div>
            <input ref={fileRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && loadFile(e.target.files[0])} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button onClick={pasteFromClipboard} className="rounded-2xl border p-4 text-left transition-colors hover:border-[color:var(--accent)]" style={{ background: "var(--surface)", borderColor: "var(--border-strong)" }}>
              <div className="text-base font-bold">📋 Colar print</div>
              <div className="text-xs text-muted-foreground">Direto da área de transferência</div>
            </button>
            <button onClick={() => fileRef.current?.click()} className="rounded-2xl border p-4 text-left transition-colors hover:border-[color:var(--accent)]" style={{ background: "var(--surface)", borderColor: "var(--border-strong)" }}>
              <div className="text-base font-bold">📁 Escolher arquivo</div>
              <div className="text-xs text-muted-foreground">Upload do dispositivo</div>
            </button>
          </div>
          <div className="mt-4 rounded-xl border p-3 text-xs leading-relaxed text-muted-foreground"
            style={{ background: "color-mix(in oklab, var(--accent) 4%, transparent)", borderColor: "color-mix(in oklab, var(--accent) 12%, transparent)" }}>
            💡 Dica: certifique-se que velas, indicadores e horário estão visíveis na imagem.
          </div>
        </>
      )}
      {stage === "duration" && imgData && (
        <div className="rounded-3xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <img src={imgData} alt="preview" className="mx-auto max-h-80 rounded-xl object-contain" />
          <div className="mt-5">
            <div className="mb-2 text-sm font-semibold">Tempo da operação</div>
            <div className="grid grid-cols-5 gap-2">
              {DURATIONS.map((d) => (
                <button key={d} onClick={() => startAnalysis(d)}
                  className="rounded-xl border py-3 text-sm font-bold transition-all hover:border-[color:var(--accent)] hover:text-[color:var(--electric)]"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border-strong)" }}>
                  {d < 60 ? `M${d}` : "H1"}
                </button>
              ))}
            </div>
          </div>
          <button onClick={reset} className="mt-4 w-full rounded-xl border py-3 text-sm text-muted-foreground hover:text-foreground" style={{ borderColor: "var(--border)" }}>Trocar imagem</button>
        </div>
      )}
      {stage === "analyzing" && (
        <div className="rounded-3xl border p-12 text-center" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="mx-auto mb-5 h-16 w-16 rounded-full border-2 spin-slow" style={{ borderColor: "var(--border-strong)", borderTopColor: "var(--electric)" }} />
          <div className="text-base font-bold">Analisando o gráfico…</div>
          <div className="mt-1 text-xs text-muted-foreground">A IA está identificando padrões e tendências</div>
        </div>
      )}
      {stage === "error" && (
        <div className="rounded-2xl border p-6" style={{ background: "color-mix(in oklab, var(--red) 7%, transparent)", borderColor: "color-mix(in oklab, var(--red) 20%, transparent)" }}>
          <div className="text-sm font-bold" style={{ color: "var(--red)" }}>⚠️ {err}</div>
          <button onClick={reset} className="mt-4 rounded-xl px-5 py-2.5 text-sm font-bold text-white" style={{ background: "var(--accent)" }}>Tentar novamente</button>
        </div>
      )}
      {stage === "result" && result && <ResultView r={result} onReset={reset} />}
    </div>
  );
}

function ResultView({ r, onReset }: { r: ScanResult; onReset: () => void }) {
  const isCall = r.direcao === "COMPRA";
  const conf = Math.min(100, Math.max(0, Number(r.confianca) || 50));
  const confColor = conf >= 75 ? "var(--green)" : conf >= 50 ? "var(--gold)" : "var(--red)";
  return (
    <div className="space-y-3 fade-up">
      <div className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-wider"
        style={{ background: "color-mix(in oklab, var(--electric) 7%, transparent)", borderColor: "color-mix(in oklab, var(--electric) 18%, transparent)", color: "var(--electric)" }}>
        ✨ Análise OrionHub
      </div>
      <div className="rounded-3xl border p-5"
        style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--accent) 10%, transparent), color-mix(in oklab, var(--electric) 4%, transparent))", borderColor: "color-mix(in oklab, var(--accent) 25%, transparent)" }}>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="rounded-full border px-3.5 py-1.5 text-[11px] font-extrabold tracking-widest"
            style={isCall
              ? { background: "color-mix(in oklab, var(--green) 18%, transparent)", color: "var(--green)", borderColor: "color-mix(in oklab, var(--green) 28%, transparent)" }
              : { background: "color-mix(in oklab, var(--red) 18%, transparent)", color: "var(--red)", borderColor: "color-mix(in oklab, var(--red) 28%, transparent)" }
            }>
            {isCall ? "▲ CALL" : "▼ PUT"}
          </span>
          <span className="text-sm font-bold text-muted-foreground">{r.ativo || "Ativo"} · {r.timeframe || "—"}</span>
          <span className="ml-auto text-2xl font-extrabold" style={{ color: confColor }}>{conf}%</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[["ENTRADA", r.entrada], ["PROTEÇÃO 1", r.protecao1], ["PROTEÇÃO 2", r.protecao2]].map(([l, v]) => (
            <div key={l} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,.025)" }}>
              <div className="font-mono text-[9px] tracking-wider text-muted-foreground">{l}</div>
              <div className="text-sm font-bold">{v || "—"}</div>
            </div>
          ))}
        </div>
      </div>
      {(r.assertividade || r.justificativa) && (
        <div className="rounded-2xl border p-4 text-sm leading-relaxed text-muted-foreground" style={{ background: "var(--surface-2)", borderColor: "var(--border)", borderLeft: "2px solid var(--accent)" }}>
          {r.justificativa || r.assertividade}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {[["TENDÊNCIA", r.tendencia], ["VIÉS", r.vies], ["SUPORTE", r.suporte], ["RESISTÊNCIA", r.resistencia]].map(([l, v]) => (
          <div key={l} className="rounded-2xl border p-3" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="font-mono text-[9px] tracking-wider text-muted-foreground">{l}</div>
            <div className="mt-1 text-sm font-bold">{v || "—"}</div>
          </div>
        ))}
      </div>
      {r.padroes && r.padroes.length > 0 && (
        <Section label="PADRÕES IDENTIFICADOS">
          {r.padroes.map((p) => (
            <span key={p} className="rounded-full border px-3 py-1 text-xs font-semibold"
              style={{ background: "color-mix(in oklab, var(--purple) 10%, transparent)", color: "var(--purple)", borderColor: "color-mix(in oklab, var(--purple) 22%, transparent)" }}>{p}</span>
          ))}
        </Section>
      )}
      {r.indicadores && r.indicadores.length > 0 && (
        <Section label="INDICADORES">
          {r.indicadores.map((p) => (
            <span key={p} className="rounded-full border px-3 py-1 text-xs font-semibold"
              style={{ background: "color-mix(in oklab, var(--electric) 10%, transparent)", color: "var(--electric)", borderColor: "color-mix(in oklab, var(--electric) 22%, transparent)" }}>{p}</span>
          ))}
        </Section>
      )}
      {r.riscos && r.riscos.length > 0 && (
        <div className="rounded-2xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <div className="mb-2 font-mono text-[9px] tracking-wider text-muted-foreground">RISCOS A MONITORAR</div>
          {r.riscos.map((p) => (
            <div key={p} className="flex items-start gap-2 border-t py-2 text-xs text-muted-foreground first:border-t-0" style={{ borderColor: "var(--border)" }}>
              <span className="mt-1.5 h-1.5 w-1.5 rounded-full" style={{ background: "var(--gold)" }} />{p}
            </div>
          ))}
        </div>
      )}
      <button onClick={onReset} className="w-full rounded-xl border py-3 text-sm font-bold transition-colors hover:border-[color:var(--accent)] hover:text-[color:var(--electric)]"
        style={{ background: "var(--surface)", borderColor: "var(--border-strong)" }}>Nova análise</button>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="mb-2.5 font-mono text-[9px] tracking-wider text-muted-foreground">{label}</div>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  );
}
