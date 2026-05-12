import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Sparkles, Send, Trash2, Loader2 } from "lucide-react";
import { useAppState, useUser, type ChatMsg } from "@/lib/store";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/mind")({
  head: () => ({ meta: [{ title: "OrionMind — OrionHub" }] }),
  component: MindPage,
});

const STARTER: ChatMsg = {
  role: "assistant",
  content:
    "Olá! Sou o **OrionMind**, seu mentor de trade. Pergunte sobre estratégias, padrões, gestão de risco ou peça para analisar suas operações.",
  ts: new Date().toISOString(),
};

const SUGGESTIONS = [
  "Como identificar um topo duplo?",
  "Plano de gestão de risco para banca pequena",
  "Diferença entre suporte/resistência e oferta/demanda",
  "Análise de price action em M5",
];

function MindPage() {
  const { state, addMindMessages, clearMind } = useAppState();
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  const empty = state.mindMessages.length === 0;
  const messages = empty ? [STARTER] : state.mindMessages;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [state.mindMessages.length, busy]);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [input]);

  async function send(text?: string) {
    const t = (text ?? input).trim();
    if (!t || busy) return;
    setInput("");
    const userMsg: ChatMsg = { role: "user", content: t, ts: new Date().toISOString() };
    await addMindMessages([userMsg]);
    const history: ChatMsg[] = [...(empty ? [STARTER] : state.mindMessages), userMsg];
    setBusy(true);
    try {
      const payload = history.map((m) => ({ role: m.role, content: m.content }));
      const r = await fetch("/api/ai-mind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: payload }),
      });
      const data = (await r.json()) as { ok: boolean; reply?: string; error?: string };
      const reply: ChatMsg = {
        role: "assistant",
        content: data.ok ? data.reply || "Sem resposta." : `⚠️ ${data.error || "Erro de conexão."}`,
        ts: new Date().toISOString(),
      };
      await addMindMessages([reply]);
    } catch {
      await addMindMessages([
        { role: "assistant", content: "⚠️ Erro de conexão. Tente novamente.", ts: new Date().toISOString() },
      ]);
    } finally {
      setBusy(false);
    }
  }

  const initials = user?.email.slice(0, 2).toUpperCase() ?? "EU";

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-5 py-6">
      <header className="mb-5 flex items-center gap-3 fade-down">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg border"
          style={{
            background: "color-mix(in oklab, var(--accent) 10%, transparent)",
            borderColor: "color-mix(in oklab, var(--accent) 28%, transparent)",
            color: "var(--accent)",
          }}
        >
          <Sparkles className="h-5 w-5" strokeWidth={1.75} />
        </div>
        <div className="flex-1">
          <div className="font-display text-base font-semibold tracking-tight">OrionMind</div>
          <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full blink-dot" style={{ background: "var(--green)" }} />
            <span style={{ color: "var(--green)" }}>online</span>
            <span className="opacity-60">· seu mentor IA</span>
          </div>
        </div>
        {!empty && (
          <Button variant="ghost" size="sm" onClick={() => void clearMind()} className="gap-1.5 text-muted-foreground">
            <Trash2 className="h-3.5 w-3.5" strokeWidth={1.75} />
            Limpar
          </Button>
        )}
      </header>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.map((m, i) => (
          <Bubble key={i} m={m} initials={initials} />
        ))}
        {busy && (
          <div className="flex items-end gap-2.5 fade-in">
            <Avatar isAssistant />
            <div
              className="rounded-xl rounded-bl-sm border px-4 py-3"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
        {empty && (
          <div className="grid gap-2 pt-2 sm:grid-cols-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => send(s)}
                className="rounded-lg border px-3 py-2.5 text-left text-xs text-muted-foreground smooth hover:border-[color:var(--accent)] hover:text-foreground"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        className="flex items-end gap-2 rounded-xl border p-2 smooth focus-within:border-[color:var(--accent)]"
        style={{ background: "var(--surface)", borderColor: "var(--border-strong)" }}
      >
        <textarea
          ref={taRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          placeholder="Pergunte ao OrionMind…"
          rows={1}
          className="flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-[color:var(--text-dim)]"
        />
        <Button onClick={() => send()} disabled={busy || !input.trim()} size="icon" className="h-9 w-9 flex-none">
          <Send className="h-4 w-4" strokeWidth={1.75} />
        </Button>
      </div>
      <div className="mt-1.5 px-1 text-[10px] text-muted-foreground">
        Pressione <kbd className="rounded border px-1 py-px font-mono text-[9px]" style={{ borderColor: "var(--border)" }}>Enter</kbd> para enviar ·{" "}
        <kbd className="rounded border px-1 py-px font-mono text-[9px]" style={{ borderColor: "var(--border)" }}>Shift + Enter</kbd> para nova linha
      </div>
    </div>
  );
}

function Avatar({ isAssistant, initials }: { isAssistant?: boolean; initials?: string }) {
  if (isAssistant) {
    return (
      <div
        className="flex h-7 w-7 flex-none items-center justify-center rounded-md border"
        style={{
          background: "color-mix(in oklab, var(--accent) 12%, transparent)",
          borderColor: "color-mix(in oklab, var(--accent) 30%, transparent)",
          color: "var(--accent)",
        }}
      >
        <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
      </div>
    );
  }
  return (
    <div
      className="flex h-7 w-7 flex-none items-center justify-center rounded-md border text-[10px] font-semibold"
      style={{ background: "var(--surface-2)", borderColor: "var(--border-strong)", color: "var(--text-muted)" }}
    >
      {initials}
    </div>
  );
}

function Bubble({ m, initials }: { m: ChatMsg; initials: string }) {
  const isUser = m.role === "user";
  return (
    <div className={`flex items-end gap-2.5 fade-in ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar isAssistant={!isUser} initials={initials} />
      <div
        className={`max-w-[82%] rounded-xl border px-4 py-2.5 text-sm leading-relaxed ${
          isUser ? "rounded-br-sm" : "rounded-bl-sm"
        }`}
        style={
          isUser
            ? {
                background: "color-mix(in oklab, var(--accent) 14%, transparent)",
                borderColor: "color-mix(in oklab, var(--accent) 32%, transparent)",
                color: "var(--foreground)",
              }
            : { background: "var(--surface-2)", borderColor: "var(--border)" }
        }
      >
        {renderMarkdown(m.content)}
      </div>
    </div>
  );
}

function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p.startsWith("**") && p.endsWith("**")) return <strong key={i}>{p.slice(2, -2)}</strong>;
        if (p.startsWith("`") && p.endsWith("`"))
          return (
            <code
              key={i}
              className="rounded px-1 py-0.5 font-mono text-[12px]"
              style={{ background: "var(--surface-3)", color: "var(--electric)" }}
            >
              {p.slice(1, -1)}
            </code>
          );
        return (
          <span key={i} style={{ whiteSpace: "pre-wrap" }}>
            {p}
          </span>
        );
      })}
    </>
  );
}