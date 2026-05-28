import { createFileRoute } from "@tanstack/react-router";
import { memo, useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  Brain,
  Send,
  Trash2,
  Plus,
  MessageSquare,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  ArrowDown,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { toast } from "sonner";
import { useUser, type ChatMsg } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { VoiceRecorder } from "@/components/app/VoiceRecorder";
import { getBanca } from "@/lib/assets";
import { MindCardRenderer } from "@/components/app/MindCards";
import { CARD_PREFIX, parseCard, serializeCard, type MindCard } from "@/lib/mind-cards";
import { useVirtualKeyboard } from "@/hooks/use-virtual-keyboard";

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
  const [streaming, setStreaming] = useState(false);
  const [autoFollow, setAutoFollow] = useState(true);
  const [openSidebar, setOpenSidebar] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem("orion.mind.sidebarCollapsed") === "1";
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);
  const autoFollowRef = useRef(true);
  useEffect(() => {
    autoFollowRef.current = autoFollow;
  }, [autoFollow]);
  const kbHeight = useVirtualKeyboard();
  const kbOpen = kbHeight > 0;

  // rAF-throttled batching para updates de stream — evita 60+ re-renders/s
  // do React + reparse do markdown a cada delta.
  const rafIdRef = useRef<number | null>(null);
  const pendingReplyRef = useRef("");
  const flushReply = useCallback(() => {
    if (rafIdRef.current !== null) return;
    rafIdRef.current = requestAnimationFrame(() => {
      rafIdRef.current = null;
      const text = pendingReplyRef.current;
      if (!text) return;
      setMessages((m) => {
        const copy = m.slice();
        for (let i = copy.length - 1; i >= 0; i--) {
          const it = copy[i];
          if (it.role === "assistant" && !it.content.startsWith(CARD_PREFIX)) {
            copy[i] = { ...it, content: text };
            return copy;
          }
        }
        copy.push({ role: "assistant", content: text, ts: new Date().toISOString() });
        return copy;
      });
    });
  }, []);
  useEffect(
    () => () => {
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
    },
    [],
  );
  // Threads created locally in this session — skip the DB reload effect for them
  // (it would race with the streaming assistant message and wipe local state).
  const skipLoadRef = useRef<Set<string>>(new Set());

  // Persist collapsed
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem("orion.mind.sidebarCollapsed", collapsed ? "1" : "0");
  }, [collapsed]);

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

  useEffect(() => {
    void refreshThreads();
  }, [refreshThreads]);

  // Restore last active thread after threads load
  useEffect(() => {
    if (activeId || threads.length === 0 || typeof window === "undefined") return;
    const last = window.localStorage.getItem("orion.mind.activeThreadId");
    if (last && threads.some((t) => t.id === last)) setActiveId(last);
  }, [threads, activeId]);

  // Persist active thread
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (activeId) window.localStorage.setItem("orion.mind.activeThreadId", activeId);
    else window.localStorage.removeItem("orion.mind.activeThreadId");
  }, [activeId]);

  // Load messages for active thread
  useEffect(() => {
    if (!activeId) {
      setMessages([]);
      return;
    }
    if (skipLoadRef.current.has(activeId)) {
      skipLoadRef.current.delete(activeId);
      return;
    }
    let cancel = false;
    supabase
      .from("mind_messages")
      .select("id,role,content,created_at")
      .eq("thread_id", activeId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (cancel) return;
        setMessages(
          (data ?? []).map((m) => ({
            id: m.id,
            role: m.role as ChatMsg["role"],
            content: m.content,
            ts: m.created_at,
          })),
        );
      });
    return () => {
      cancel = true;
    };
  }, [activeId]);

  // Smart auto-scroll: only follow when user is already near the bottom.
  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => {
      const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
      setAutoFollow(nearBottom);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // Scroll to bottom when switching threads / first load.
  useEffect(() => {
    scrollToBottom(false);
    setAutoFollow(true);
  }, [activeId, scrollToBottom]);

  // While streaming, follow only if user hasn't scrolled away.
  useEffect(() => {
    if (autoFollow) scrollToBottom(true);
  }, [messages, autoFollow, scrollToBottom]);

  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 160) + "px";
  }, [input]);

  const display = useMemo<ChatMsg[]>(
    () => (messages.length === 0 ? [STARTER] : messages),
    [messages],
  );

  function newChat() {
    if (typeof window !== "undefined") window.localStorage.removeItem("orion.mind.activeThreadId");
    setActiveId(null);
    setMessages([]);
    setInput("");
    setOpenSidebar(false);
    setTimeout(() => taRef.current?.focus(), 50);
  }

  async function deleteThread(id: string) {
    if (!user) return;
    const { error } = await supabase.from("mind_threads").delete().eq("id", id);
    if (error) {
      toast.error("Não foi possível excluir a conversa.");
      return;
    }
    setThreads((t) => t.filter((x) => x.id !== id));
    if (activeId === id) newChat();
    toast.success("Conversa excluída.");
  }

  async function send(text?: string) {
    const t = (text ?? input).trim();
    if (!t || busy || !user) return;
    setInput("");
    // Reset do buffer do throttle pra evitar stale text de envios anteriores.
    pendingReplyRef.current = "";

    let threadId = activeId;

    // Create thread on first message
    if (!threadId) {
      const title = t.slice(0, 60);
      const { data, error } = await supabase
        .from("mind_threads")
        .insert({ user_id: user.id, title })
        .select("id,title,updated_at")
        .single();
      if (error || !data) {
        toast.error("Erro ao criar conversa.");
        return;
      }
      threadId = data.id;
      skipLoadRef.current.add(threadId);
      setActiveId(threadId);
      setThreads([data, ...threads]);
    }

    const userMsg: ChatMsg = { role: "user", content: t, ts: new Date().toISOString() };
    setMessages((m) => [...m, userMsg]);
    await supabase
      .from("mind_messages")
      .insert({ user_id: user.id, role: "user", content: t, thread_id: threadId } as never);

    setBusy(true);
    setAutoFollow(true);
    autoFollowRef.current = true;
    try {
      const history = [...(messages.length ? messages : []), userMsg]
        .filter((m) => !m.content.startsWith(CARD_PREFIX))
        .map((m) => ({ role: m.role, content: m.content }));
      // SEMPRE faz refresh antes de enviar — garante token fresh mesmo após
      // longo tempo na mesma sessão de chat (JWT expira em ~1h).
      async function getFreshToken(): Promise<string | null> {
        const { data: refreshed } = await supabase.auth.refreshSession();
        if (refreshed.session?.access_token) return refreshed.session.access_token;
        const { data: sess } = await supabase.auth.getSession();
        return sess.session?.access_token ?? null;
      }

      let token = await getFreshToken();
      if (!token) {
        toast.error("Sessão expirada. Faça login novamente.");
        setBusy(false);
        return;
      }

      const { data: recentRows } = await supabase
        .from("trades")
        .select("id,ativo,data,dir,valor,payout,res,lucro,obs")
        .eq("user_id", user.id)
        .order("data", { ascending: false })
        .limit(15);
      const banca = getBanca();

      const doFetch = (tk: string) =>
        fetch("/api/ai-mind", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tk}`,
          },
          body: JSON.stringify({ messages: history, banca, recentTrades: recentRows ?? [] }),
        });

      let r = await doFetch(token);
      // Retry uma vez se 401 (token pode ter expirado entre refresh e fetch)
      if (r.status === 401) {
        token = await getFreshToken();
        if (!token) {
          toast.error("Sessão expirada. Faça login novamente.");
          setBusy(false);
          return;
        }
        r = await doFetch(token);
      }
      if (r.status === 401) {
        toast.error("Sessão expirada. Faça login novamente.");
        setBusy(false);
        return;
      }
      const ctype = r.headers.get("content-type") || "";
      let replyText = "";
      let errored = false;
      const receivedCards: MindCard[] = [];
      if (ctype.includes("text/event-stream") && r.body) {
        // Add placeholder assistant message we will fill incrementally.
        setMessages((m) => [
          ...m,
          { role: "assistant", content: "", ts: new Date().toISOString() },
        ]);
        setStreaming(true);
        const reader = r.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";
        outer: while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const parts = buf.split("\n\n");
          buf = parts.pop() ?? "";
          for (const p of parts) {
            const line = p.split("\n").find((l) => l.startsWith("data:"));
            if (!line) continue;
            const payload = line.slice(5).trim();
            if (payload === "[DONE]") break outer;
            try {
              const j = JSON.parse(payload);
              if (typeof j.delta === "string") {
                replyText += j.delta;
                pendingReplyRef.current = replyText;
                flushReply();
              } else if (j.card) {
                const card = j.card as MindCard;
                receivedCards.push(card);
                const serialized = serializeCard(card);
                // Adiciona o card como uma nova mensagem assistant separada
                // (vai aparecer ANTES do parágrafo final de comentário da IA).
                setMessages((m) => [
                  ...m,
                  { role: "assistant", content: serialized, ts: new Date().toISOString() },
                ]);
                // Persiste no Supabase imediatamente — o card é o evento real,
                // o texto final é só comentário da IA e será salvo abaixo.
                if (user) {
                  void supabase
                    .from("mind_messages")
                    .insert({
                      user_id: user.id,
                      role: "assistant",
                      content: serialized,
                      thread_id: threadId,
                    } as never);
                }
              } else if (j.error) {
                errored = true;
                toast.error(j.error);
              }
            } catch {
              /* ignore */
            }
          }
        }
        setStreaming(false);
        // Flush final pra garantir que o último delta apareceu antes
        // de qualquer lógica de persistência ou fallback abaixo.
        if (rafIdRef.current !== null) {
          cancelAnimationFrame(rafIdRef.current);
          rafIdRef.current = null;
        }
        if (replyText && pendingReplyRef.current === replyText) {
          setMessages((m) => {
            const copy = m.slice();
            for (let i = copy.length - 1; i >= 0; i--) {
              const it = copy[i];
              if (it.role === "assistant" && !it.content.startsWith(CARD_PREFIX)) {
                if (it.content !== replyText) copy[i] = { ...it, content: replyText };
                return copy;
              }
            }
            copy.push({ role: "assistant", content: replyText, ts: new Date().toISOString() });
            return copy;
          });
        }
      } else {
        const data = (await r.json()) as { ok: boolean; reply?: string; error?: string };
        if (!data.ok) {
          errored = true;
          toast.error(data.error || "Erro na resposta da IA.");
        }
        replyText = data.ok
          ? data.reply || "Não recebi resposta. Tente reformular ou enviar novamente."
          : `⚠️ ${data.error || "Erro."}`;
        setMessages((m) => [
          ...m,
          { role: "assistant", content: replyText, ts: new Date().toISOString() },
        ]);
      }
      if (!replyText && receivedCards.length === 0) {
        replyText = errored
          ? "⚠️ Não consegui responder agora. Tente de novo em alguns segundos."
          : "Não recebi resposta. Tente reformular ou enviar novamente.";
        setMessages((m) => {
          const copy = m.slice();
          for (let i = copy.length - 1; i >= 0; i--) {
            const it = copy[i];
            if (it.role === "assistant" && it.content === "") {
              copy[i] = { ...it, content: replyText };
              return copy;
            }
          }
          copy.push({ role: "assistant", content: replyText, ts: new Date().toISOString() });
          return copy;
        });
      } else if (!replyText && receivedCards.length > 0) {
        // Tivemos card(s) mas a IA não comentou nada — remove o placeholder vazio.
        setMessages((m) => m.filter((it) => !(it.role === "assistant" && it.content === "")));
      }
      // Persiste o texto final apenas se houver algo
      if (replyText) {
        await supabase
          .from("mind_messages")
          .insert({
            user_id: user.id,
            role: "assistant",
            content: replyText,
            thread_id: threadId,
          } as never);
      }
      await supabase
        .from("mind_threads")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", threadId);
      void refreshThreads();
    } catch {
      toast.error("Erro de conexão. Tente novamente.");
      const reply: ChatMsg = {
        role: "assistant",
        content: "⚠️ Erro de conexão. Tente novamente.",
        ts: new Date().toISOString(),
      };
      setMessages((m) => [...m, reply]);
    } finally {
      setBusy(false);
      setStreaming(false);
    }
  }

  const initials = user?.email.slice(0, 2).toUpperCase() ?? "EU";
  const empty = messages.length === 0;

  return (
    <section className="flex h-full max-h-full min-h-0 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`absolute inset-y-0 left-0 z-30 flex flex-col border-r p-3 transition-all sm:relative sm:translate-x-0 ${openSidebar ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "sm:hidden" : "w-72"}`}
        style={{
          background: "color-mix(in oklab, var(--surface) 92%, transparent)",
          borderColor: "var(--border)",
          backdropFilter: "blur(14px)",
        }}
      >
        <div className="flex items-center justify-between gap-2 pb-2">
          <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Conversas
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCollapsed(true)}
              title="Recolher"
              className="hidden sm:inline-flex text-muted-foreground hover:text-[color:var(--accent)]"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
            <button
              onClick={() => setOpenSidebar(false)}
              className="sm:hidden text-muted-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
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
            <div className="px-2 py-6 text-center text-xs text-muted-foreground">
              Nenhuma conversa ainda.
            </div>
          )}
          {threads.map((t) => {
            const active = t.id === activeId;
            return (
              <div
                key={t.id}
                className="group mb-0.5 flex items-center gap-2 rounded-md px-2 py-2 text-sm smooth"
                style={
                  active
                    ? {
                        background: "color-mix(in oklab, var(--accent) 14%, var(--surface-2))",
                        color: "var(--foreground)",
                      }
                    : { color: "var(--text-muted)" }
                }
              >
                <button
                  onClick={() => {
                    setActiveId(t.id);
                    setOpenSidebar(false);
                  }}
                  className="flex flex-1 items-center gap-2 truncate text-left"
                >
                  <MessageSquare
                    className="h-3.5 w-3.5 flex-none"
                    style={{ color: active ? "var(--accent)" : "var(--text-dim)" }}
                  />
                  <span className="truncate">{t.title}</span>
                </button>
                <button
                  onClick={() => void deleteThread(t.id)}
                  className="text-muted-foreground transition-opacity hover:text-[color:var(--red)] sm:opacity-0 sm:group-hover:opacity-100"
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
        <div
          className="fixed inset-0 z-20 bg-black/40 sm:hidden"
          onClick={() => setOpenSidebar(false)}
        />
      )}

      {/* Chat area */}
      <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header
          className="flex flex-none items-center gap-3 border-b px-5 py-3"
          style={{ borderColor: "var(--border)" }}
        >
          <button onClick={() => setOpenSidebar(true)} className="sm:hidden text-muted-foreground">
            <Menu className="h-5 w-5" />
          </button>
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              title="Mostrar conversas"
              className="hidden sm:inline-flex h-8 w-8 items-center justify-center rounded-md border text-muted-foreground hover:text-[color:var(--accent)] hover:border-[color:var(--accent)]"
              style={{ borderColor: "var(--border)" }}
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          )}
          <div
            className="flex h-9 w-9 items-center justify-center rounded-lg border"
            style={{
              background: "color-mix(in oklab, var(--accent) 10%, transparent)",
              borderColor: "color-mix(in oklab, var(--accent) 28%, transparent)",
              color: "var(--accent)",
            }}
          >
            <Brain className="h-4 w-4" strokeWidth={1.75} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-sm font-semibold tracking-tight truncate">
              {threads.find((t) => t.id === activeId)?.title || "Nova conversa"}
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span
                className="h-1.5 w-1.5 rounded-full blink-dot"
                style={{ background: "var(--green)" }}
              />
              <span style={{ color: "var(--green)" }}>OrionMind online</span>
            </div>
          </div>
        </header>

        <div
          ref={scrollRef}
          className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 pb-20 sm:px-5"
        >
          <div className="mx-auto flex max-w-3xl flex-col gap-4">
            {display.map((m, i) => {
              const isLast = i === display.length - 1;
              const isStreamingBubble =
                streaming &&
                isLast &&
                m.role === "assistant" &&
                !m.content.startsWith(CARD_PREFIX);
              return (
                <Bubble
                  key={i}
                  m={m}
                  initials={initials}
                  isStreaming={isStreamingBubble}
                />
              );
            })}
            {busy && !streaming && (
              <div className="flex items-end gap-2.5 fade-in">
                <Avatar isAssistant />
                <ThinkingBubble />
              </div>
            )}
            {empty && !busy && (
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
        </div>

        {!autoFollow && (
          <button
            onClick={() => {
              setAutoFollow(true);
              scrollToBottom(true);
            }}
            className="pointer-events-auto absolute bottom-28 left-1/2 z-10 -translate-x-1/2 rounded-full border px-3 py-1.5 text-xs shadow-md smooth hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            style={{
              background: "var(--surface-2)",
              borderColor: "var(--border-strong)",
              color: "var(--text-muted)",
            }}
          >
            <span className="inline-flex items-center gap-1.5">
              <ArrowDown className="h-3 w-3" /> Rolar para o final
            </span>
          </button>
        )}

        <div
          className="flex-none border-t px-4 py-3 sm:px-5"
          style={{
            borderColor: "var(--border)",
            background: "color-mix(in oklab, var(--background) 92%, transparent)",
            backdropFilter: "blur(14px)",
            paddingBottom: kbOpen ? "0.75rem" : "calc(0.75rem + env(safe-area-inset-bottom, 0px))",
          }}
        >
          <div className="mx-auto max-w-3xl">
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
                    void send();
                  }
                }}
                onFocus={() => {
                  // iOS Safari: garante que o input fica visível após o teclado abrir.
                  // Só roda em mobile (coarse pointer) — em desktop causa jump desnecessário.
                  if (typeof window === "undefined") return;
                  if (!window.matchMedia?.("(pointer: coarse)").matches) return;
                  setTimeout(
                    () => taRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }),
                    300,
                  );
                }}
                placeholder="Pergunte ao OrionMind…"
                rows={1}
                className="flex-1 resize-none bg-transparent px-2 py-2 text-sm outline-none placeholder:text-[color:var(--text-dim)]"
              />
              <VoiceRecorder
                disabled={busy}
                onTranscript={(t) => setInput((cur) => (cur ? cur + " " : "") + t)}
              />
              <Button
                onClick={() => void send()}
                disabled={busy || !input.trim()}
                size="icon"
                className="h-9 w-9 flex-none"
              >
                <Send className="h-4 w-4" strokeWidth={1.75} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
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
        <Brain className="h-3.5 w-3.5" strokeWidth={1.75} />
      </div>
    );
  }
  return (
    <div
      className="flex h-7 w-7 flex-none items-center justify-center rounded-md border text-[10px] font-semibold"
      style={{
        background: "var(--surface-2)",
        borderColor: "var(--border-strong)",
        color: "var(--text-muted)",
      }}
    >
      {initials}
    </div>
  );
}

function ThinkingBubble() {
  return (
    <div
      className="rounded-xl rounded-bl-sm border px-4 py-3"
      style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
    >
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
        <span className="thinking-text">Pensando</span>
        <span className="thinking-dots inline-flex gap-1">
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--accent)" }} />
        </span>
      </span>
    </div>
  );
}

const Bubble = memo(function Bubble({
  m,
  initials,
  isStreaming,
}: {
  m: ChatMsg;
  initials: string;
  isStreaming: boolean;
}) {
  const isUser = m.role === "user";

  // Mensagem do tipo card: renderiza o componente visual sem bubble wrapper.
  if (!isUser && m.content.startsWith(CARD_PREFIX)) {
    const card = parseCard(m.content);
    if (card) {
      return (
        <div className="flex items-end gap-2.5 fade-up">
          <Avatar isAssistant initials={initials} />
          <MindCardRenderer card={card} />
        </div>
      );
    }
  }

  return (
    <div className={`flex items-end gap-2.5 fade-in ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar isAssistant={!isUser} initials={initials} />
      <div
        className={`max-w-[82%] rounded-xl border px-4 py-2.5 text-sm leading-relaxed ${isUser ? "rounded-br-sm" : "rounded-bl-sm"}`}
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
        {isUser ? (
          <span style={{ whiteSpace: "pre-wrap" }}>{m.content}</span>
        ) : isStreaming ? (
          // Durante o stream, render texto puro (sem markdown) +
          // cursor pulsante. Evita re-parse do markdown a cada frame
          // (que era a maior causa de lag percebido).
          <span style={{ whiteSpace: "pre-wrap" }}>
            {m.content}
            <span className="stream-cursor" aria-hidden="true" />
          </span>
        ) : (
          <MarkdownContent text={m.content} />
        )}
      </div>
    </div>
  );
});

const MarkdownContent = memo(function MarkdownContent({ text }: { text: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h2
              className="font-display mt-3 mb-2 text-base font-semibold tracking-tight first:mt-0"
              style={{ color: "var(--foreground)" }}
            >
              {children}
            </h2>
          ),
          h2: ({ children }) => (
            <h3
              className="font-display mt-3 mb-1.5 text-[15px] font-semibold tracking-tight first:mt-0"
              style={{ color: "var(--foreground)" }}
            >
              {children}
            </h3>
          ),
          h3: ({ children }) => (
            <h4
              className="font-display mt-2.5 mb-1 text-sm font-semibold tracking-tight first:mt-0"
              style={{ color: "var(--accent)" }}
            >
              {children}
            </h4>
          ),
          h4: ({ children }) => (
            <h5
              className="font-display mt-2 mb-1 text-[13px] font-semibold uppercase tracking-wider first:mt-0"
              style={{ color: "var(--text-muted)" }}
            >
              {children}
            </h5>
          ),
          p: ({ children }) => (
            <p className="my-1.5 first:mt-0 last:mb-0" style={{ whiteSpace: "pre-wrap" }}>
              {children}
            </p>
          ),
          ul: ({ children }) => <ul className="my-1.5 list-disc space-y-0.5 pl-5">{children}</ul>,
          ol: ({ children }) => (
            <ol className="my-1.5 list-decimal space-y-0.5 pl-5">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong style={{ color: "var(--foreground)" }}>{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children }) => (
            <code
              className="rounded px-1 py-0.5 font-mono text-[12px]"
              style={{ background: "var(--surface-3, var(--surface))", color: "var(--accent)" }}
            >
              {children}
            </code>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className="my-2 border-l-2 pl-3 italic"
              style={{ borderColor: "var(--accent)", color: "var(--text-muted)" }}
            >
              {children}
            </blockquote>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="underline"
              style={{ color: "var(--accent)" }}
            >
              {children}
            </a>
          ),
          hr: () => <hr className="my-3" style={{ borderColor: "var(--border)" }} />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
});
