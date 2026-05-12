import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useAppState, useUser, type ChatMsg } from "@/lib/store";

export const Route = createFileRoute("/_app/mind")({
  head: () => ({ meta: [{ title: "OrionMind — OrionHub" }] }),
  component: MindPage,
});

const STARTER: ChatMsg = {
  role: "assistant",
  content: "Olá! Sou o **OrionMind**, seu mentor de trade. Pergunte sobre estratégias, padrões, gestão de risco ou peça para analisar suas operações. Como posso ajudar?",
  ts: new Date().toISOString(),
};

function MindPage() {
  const { state, update } = useAppState();
  const { user } = useUser();
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const messages = state.mindMessages.length ? state.mindMessages : [STARTER];

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [state.mindMessages.length, busy]);

  async function send(text?: string) {
    const t = (text ?? input).trim();
    if (!t || busy) return;
    setInput("");
    const next: ChatMsg[] = [...(state.mindMessages.length ? state.mindMessages : [STARTER]), { role: "user", content: t, ts: new Date().toISOString() }];
    update({ mindMessages: next });
    setBusy(true);
    try {
      const payload = next.filter((m) => m.role === "user" || m.role === "assistant").map((m) => ({ role: m.role, content: m.content }));
      const r = await fetch("/api/ai-mind", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: payload }) });
      const data = (await r.json()) as { ok: boolean; reply?: string; error?: string };
      const reply: ChatMsg = { role: "assistant", content: data.ok ? data.reply || "Sem resposta." : `⚠️ ${data.error || "Erro de conexão."}`, ts: new Date().toISOString() };
      update({ mindMessages: [...next, reply] });
    } catch { update({ mindMessages: [...next, { role: "assistant", content: "⚠️ Erro de conexão. Tente novamente.", ts: new Date().toISOString() }] }); }
    finally { setBusy(false); }
  }

  function clear() { update({ mindMessages: [] }); }
  const initials = user?.email.slice(0, 2).toUpperCase() ?? "EU";

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col px-5 py-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full text-xl"
          style={{ background: "linear-gradient(135deg, var(--accent), var(--electric))", boxShadow: "0 0 30px color-mix(in oklab, var(--accent) 30%, transparent)" }}>🧠</div>
        <div className="flex-1">
          <div className="text-base font-extrabold">OrionMind</div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full blink-dot" style={{ background: "var(--green)" }} />
            <span style={{ color: "var(--green)" }}>online</span> · seu mentor IA
          </div>
        </div>
        <button onClick={clear} className="rounded-lg border px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground" style={{ borderColor: "var(--border)" }}>Limpar</button>
      </div>
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pb-4">
        {messages.map((m, i) => <Bubble key={i} m={m} initials={initials} />)}
        {busy && (
          <div className="flex items-end gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full text-sm" style={{ background: "linear-gradient(135deg, var(--accent), var(--electric))" }}>🧠</div>
            <div className="rounded-2xl rounded-bl-md border px-4 py-2.5 text-sm text-muted-foreground" style={{ background: "var(--surface-2)", borderColor: "var(--border-strong)" }}>
              <span className="inline-flex gap-1">
                <span className="h-1.5 w-1.5 rounded-full blink-dot" style={{ background: "var(--text-muted)", animationDelay: "0ms" }} />
                <span className="h-1.5 w-1.5 rounded-full blink-dot" style={{ background: "var(--text-muted)", animationDelay: "200ms" }} />
                <span className="h-1.5 w-1.5 rounded-full blink-dot" style={{ background: "var(--text-muted)", animationDelay: "400ms" }} />
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="flex items-end gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-2xl border px-4 py-2.5 transition-colors focus-within:border-[color:var(--accent)]" style={{ background: "var(--surface)", borderColor: "var(--border-strong)" }}>
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Pergunte ao OrionMind…" rows={1}
            className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-[color:var(--text-dim)]" />
        </div>
        <button onClick={() => send()} disabled={busy || !input.trim()} className="rounded-2xl px-5 py-3 text-sm font-bold text-white transition-all disabled:opacity-50" style={{ background: "var(--accent)" }}>
          Enviar
        </button>
      </div>
    </div>
  );
}

function Bubble({ m, initials }: { m: ChatMsg; initials: string }) {
  const isUser = m.role === "user";
  return (
    <div className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      <div className="flex h-7 w-7 flex-none items-center justify-center rounded-full text-[10px] font-bold"
        style={isUser
          ? { background: "var(--surface-2)", color: "var(--text-muted)", border: "1px solid var(--border-strong)" }
          : { background: "linear-gradient(135deg, var(--accent), var(--electric))", color: "#fff", fontSize: "14px" }}>
        {isUser ? initials : "🧠"}
      </div>
      <div className={`max-w-[80%] rounded-2xl border px-4 py-2.5 text-sm leading-relaxed ${isUser ? "rounded-br-md text-white" : "rounded-bl-md"}`}
        style={isUser
          ? { background: "var(--accent)", border: "1px solid var(--accent)" }
          : { background: "var(--surface-2)", borderColor: "var(--border-strong)" }}>
        {renderMarkdown(m.content)}
      </div>
    </div>
  );
}

function renderMarkdown(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (<>{parts.map((p, i) => p.startsWith("**") && p.endsWith("**") ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i} style={{ whiteSpace: "pre-wrap" }}>{p}</span>)}</>);
}
