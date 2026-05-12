import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { Sparkles, Send, Trash2, Loader2, Plus, MessageSquare, Menu, X } from "lucide-react";
import { useUser, type ChatMsg } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/mind")({
  head: () => ({ meta: [{ title: "OrionMind — OrionHub" }] }),
  component: MindPage,
});

type Thread = { id: string; title: string; updated_at: string };

const STARTER: ChatMsg = {
  role: "assistant",
  content:
    "Olá! Sou o **OrionMind**, seu mentor de trade. Pergunte sobre estratégias, padrões, gestão de risco ou peça para analisar suas operações.",
};

const SUGGESTIONS = [
  "Como identificar um topo duplo?",
  "Plano de gestão de risco para banca pequena",
  "Diferença entre suporte/resistência e oferta/demanda",
  "Análise de price action em M5",
];

function MindPage() {
  const { user } = useUser();
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [openSidebar, setOpenSidebar] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  // Load threads
  const refreshThreads = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("mind_threads")
      .select("id,title,updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    setThreads(data ?? []);
    return data ?? [];
  }, [user?.id]);

  useEffect(() => { void refreshThreads(); }, [refreshThreads]);

  // Load messages for active thread
  useEffect(() => {
    if (!activeId) { setMessages([]); return; }
    let cancel = false;
    supabase
      .from("mind_messages")
      .select("id,role,content,created_at")
      .eq("thread_id", activeId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (cancel) return;
        setMessages((data ?? []).map((m) => ({ id: m.id, role: m.role as ChatMsg["role"], content: m.content, ts: m.created_at })));
      });
    return () => { cancel = true; };
  }, [activeId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, busy]);

  useEffect(() => {
    const ta = taRef.current; if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [input]);

  const display = useMemo<ChatMsg[]>(() => (messages.length === 0 ? [STARTER] : messages), [messages]);

  function newChat() {
    setActiveId(null);
    setMessages([]);
    setInput("");
    setOpenSidebar(false);
    setTimeout(() => taRef.current?.focus(), 50);
  }

  async function deleteThread(id: string) {
    if (!user) return;
    await supabase.from("mind_threads").delete().eq("id", id);
    setThreads((t) => t.filter((x) => x.id !== id));
    if (activeId === id) newChat();
  }

  async function send(text?: string) {
    const t = (text ?? input).trim();
    if (!t || busy || !user) return;
    setInput("");

    let threadId = activeId;
    let threadsList = threads;

    // Create thread on first message
    if (!threadId) {
      const title = t.slice(0, 60);
      const { data, error } = await supabase
        .from("mind_threads")
        .insert({ user_id: user.id, title })
        .select("id,title,updated_at")
        .single();
      if (error || !data) { console.error(error); return; }
      threadId = data.id;
      setActiveId(threadId);
      threadsList = [data, ...threads];
      setThreads(threadsList);
    }

    const userMsg: ChatMsg = { role: "user", content: t, ts: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    await supabase.from("mind_messages").insert({ user_id: user.id, role: "user", content: t, thread_id: threadId } as never);

    setBusy(true);
    try {
      const history = [...(messages.length ? messages : []), userMsg].map((m) => ({ role: m.role, content: m.content }));
      const r = await fetch("/api/ai-mind", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      const data = (await r.json()) as { ok: boolean; reply?: string; error?: string };
      const replyText = data.ok ? data.reply || "Sem resposta." : `⚠️ ${data.error || "Erro."}`;
      const reply: ChatMsg = { role: "assistant", content: replyText, ts: new Date().toISOString() };
      setMessages((m) => [...m, reply]);
      await supabase.from("mind_messages").insert({ user_id: user.id, role: "assistant", content: replyText, thread_id: threadId } as never);
      await supabase.from("mind_threads").update({ updated_at: new Date().toISOString() }).eq("id", threadId);
      void refreshThreads();
    } catch {
      const reply: ChatMsg = { role: "assistant", content: "⚠️ Erro de conexão. Tente novamente.", ts: new Date().toISOString() };
      setMessages((m) => [...m, reply]);
    } finally {
      setBusy(false);
    }
  }

  const initials = user?.email.slice(0, 2).toUpperCase() ?? "EU";
  const empty = messages.length === 0;

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <aside
        className={`absolute inset-y-0 left-0 z-30 flex w-72 flex-col border-r p-3 transition-transform sm:relative sm:translate-x-0 ${openSidebar ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "color-mix(in oklab, var(--surface) 92%, transparent)", borderColor: "var(--border)", backdropFilter: "blur(14px)" }}
      >
        <div className="flex items-center justify-between gap-2 pb-2">
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Conversas</div>
          <button onClick={() => setOpenSidebar(false)} className="sm:hidden text-muted-foreground"><X className="h-4 w-4" /></button>
        </div>
        <button
          onClick={newChat}
          className="mb-2 inline-flex items-center justify-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium smooth press hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
          style={{ borderColor: "var(--border-strong)", background: "var(--surface-2)" }}
        >
          <Plus className="h-4 w-4" /> Nova conversa
        </button>
        <div className="flex-1 overflow-y-auto pr-1">
          {threads.length === 0 && (
            <div className="px-2 py-6 text-center text-xs text-muted-foreground">Nenhuma conversa ainda.</div>
          )}
          {threads.map((t) => {
            const active = t.id === activeId;
            return (
              <div
                key={t.id}
                className="group mb-0.5 flex items-center gap-2 rounded-md px-2 py-2 text-sm smooth"
                style={
                  active
                    ? { background: "color-mix(in oklab, var(--accent) 14%, var(--surface-2))", color: "var(--foreground)" }
                    : { color: "var(--text-muted)" }
                }
              >
                <button
                  onClick={() => { setActiveId(t.id); setOpenSidebar(false); }}
                  className="flex flex-1 items-center gap-2 truncate text-left"
                >
                  <MessageSquare className="h-3.5 w-3.5 flex-none" style={{ color: active ? "var(--accent)" : "var(--text-dim)" }} />
                  <span className="truncate">{t.title}</span>
                </button>
                <button
                  onClick={() => void deleteThread(t.id)}
                  className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-[color:var(--red)]"
                  aria-label="Excluir"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </aside>

      {openSidebar && (
        <div className="fixed inset-0 z-20 bg-black/40 sm:hidden" onClick={() => setOpenSidebar(false)} />
      )}

      {/* Chat area */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center gap-3 border-b px-5 py-3" style={{ borderColor: "var(--border)" }}>
          <button onClick={() => setOpenSidebar(true)} className="sm:hidden text-muted-foreground"><Menu className="h-5 w-5" /></button>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border"
            style={{ background: "color-mix(in oklab, var(--accent) 10%, transparent)", borderColor: "color-mix(in oklab, var(--accent) 28%, transparent)", color: "var(--accent)" }}>
            <Sparkles className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-sm font-semibold tracking-tight truncate">
              {threads.find((t) => t.id === activeId)?.title || "Nova conversa"}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full blink-dot" style={{ background: "var(--green)" }} />
              <span style={{ color: "var(--green)" }}>OrionMind online</span>
            </div>
          </div>
        </header>

        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6">
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {display.map((m, i) => <Bubble key={i} m={m} initials={initials} />)}
            {busy && (
              <div className="flex items-end gap-2.5 fade-in">
                <Avatar isAssistant />
                <div className="rounded-xl rounded-bl-sm border px-4 py-3" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            {empty && !busy && (
              <div className="grid gap-2 pt-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)}
                    className="rounded-lg border px-3 py-2.5 text-left text-xs text-muted-foreground smooth hover:border-[color:var(--accent)] hover:text-foreground"
                    style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="border-t px-5 py-3" style={{ borderColor: "var(--border)" }}>
          <div className="mx-auto max-w-3xl">
            <div className="flex items-end gap-2 rounded-xl border p-2 smooth focus-within:border-[color:var(--accent)]"
              style={{ background: "var(--surface)", borderColor: "var(--border-strong)" }}>
              <textarea ref={taRef} value={input} onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }}
                placeholder="Pergunte ao OrionMind…" rows={1}
                className="flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-[color:var(--text-dim)]" />
              <Button onClick={() => void send()} disabled={busy || !input.trim()} size="icon" className="h-9 w-9 flex-none">
                <Send className="h-4 w-4" strokeWidth={1.75} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Avatar({ isAssistant, initials }: { isAssistant?: boolean; initials?: string }) {
  if (isAssistant) {
    return (
      <div className="flex h-7 w-7 flex-none items-center justify-center rounded-md border"
        style={{ background: "color-mix(in oklab, var(--accent) 12%, transparent)", borderColor: "color-mix(in oklab, var(--accent) 30%, transparent)", color: "var(--accent)" }}>
        <Sparkles className="h-3.5 w-3.5" strokeWidth={1.75} />
      </div>
    );
  }
  return (
    <div className="flex h-7 w-7 flex-none items-center justify-center rounded-md border text-[10px] font-semibold"
      style={{ background: "var(--surface-2)", borderColor: "var(--border-strong)", color: "var(--text-muted)" }}>
      {initials}
    </div>
  );
}

function Bubble({ m, initials }: { m: ChatMsg; initials: string }) {
  const isUser = m.role === "user";
  return (
    <div className={`flex items-end gap-2.5 fade-in ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar isAssistant={!isUser} initials={initials} />
      <div className={`max-w-[82%] rounded-xl border px-4 py-2.5 text-sm leading-relaxed ${isUser ? "rounded-br-sm" : "rounded-bl-sm"}`}
        style={isUser
          ? { background: "color-mix(in oklab, var(--accent) 14%, transparent)", borderColor: "color-mix(in oklab, var(--accent) 32%, transparent)", color: "var(--foreground)" }
          : { background: "var(--surface-2)", borderColor: "var(--border)" }}>
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
          return <code key={i} className="rounded px-1 py-0.5 font-mono text-[12px]" style={{ background: "var(--surface-3)", color: "var(--accent)" }}>{p.slice(1, -1)}</code>;
        return <span key={i} style={{ whiteSpace: "pre-wrap" }}>{p}</span>;
      })}
    </>
  );
}
