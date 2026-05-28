import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  LineChart,
  BrainCircuit,
  ClipboardList,
  Calculator,
  Zap,
  ShieldCheck,
  Target,
  Languages,
  Menu,
  X,
  Newspaper,
  Bitcoin,
  Mic,
  Cloud,
  Trophy,
  Sparkles,
  Star,
  Quote,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Check,
  Crown,
  Activity,
  type LucideIcon,
} from "lucide-react";
import { useUser, type User } from "@/lib/store";
import { useReveal } from "@/lib/useReveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OrionHub — Plataforma de Trading Inteligente com IA" },
      { name: "description", content: "OrionHub usa IA para analisar gráficos de qualquer broker em menos de 2 segundos. Gerencie trades, converse com seu mentor IA e opere com mais clareza. Acesso anual por R$2.500." },
      { property: "og:title", content: "OrionHub — Trading Inteligente com IA" },
      { property: "og:description", content: "Análise de gráficos por IA em 2s, planilha de trades automática, mentor IA 24/7, calendário econômico e radar cripto. A plataforma completa do trader Gabriel Dutra — Orion Capital." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://orionmindhub.projetoskm0.workers.dev/" },
    ],
  }),
  component: LandingPage,
});

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal<HTMLDivElement>();
  return <div ref={ref} className={`reveal ${className}`}>{children}</div>;
}

function LandingPage() {
  const { user } = useUser();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav user={user} />
      <Hero user={user} />
      <BrokerMarquee />
      <Reveal><LiveDemoSection /></Reveal>
      <Reveal><BentoFeatures /></Reveal>
      <Reveal><StatsSection /></Reveal>
      <Reveal><MentorSection /></Reveal>
      <Reveal><HowSection /></Reveal>
      <Reveal><TestimonialsSection /></Reveal>
      <Reveal><PricingSection /></Reveal>
      <Reveal><FaqSection /></Reveal>
      <Reveal><CtaSection /></Reveal>
      <Footer />
    </div>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────

function Nav({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const links: Array<[string, string]> = [
    ["#demo", "Demo"],
    ["#tools", "Ferramentas"],
    ["#how", "Como funciona"],
    ["#pricing", "Planos"],
    ["#faq", "FAQ"],
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl fade-down smooth md:px-12"
      style={{
        background: scrolled
          ? "color-mix(in oklab, var(--background) 92%, transparent)"
          : "color-mix(in oklab, var(--background) 70%, transparent)",
        borderBottom: scrolled
          ? "1px solid color-mix(in oklab, var(--accent) 12%, transparent)"
          : "1px solid transparent",
        boxShadow: scrolled
          ? "0 8px 32px -16px color-mix(in oklab, var(--accent) 25%, transparent)"
          : "none",
      }}
    >
      <Link to="/" className="group inline-flex items-center gap-2 text-[22px] font-black tracking-tight smooth hover:opacity-90">
        <span
          className="relative inline-flex h-7 w-7 items-center justify-center rounded-lg transition-transform group-hover:rotate-[-6deg]"
          style={{
            background: "linear-gradient(135deg, var(--accent), var(--electric))",
            boxShadow: "0 6px 16px -8px color-mix(in oklab, var(--accent) 60%, transparent)",
          }}
        >
          <Activity className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </span>
        Orion<span style={{ color: "var(--electric)" }}>Hub</span>
      </Link>
      <div className="hidden items-center gap-7 md:flex">
        {links.map(([h, l]) => (
          <a
            key={h}
            href={h}
            className="group relative text-sm font-medium text-muted-foreground smooth hover:text-foreground"
          >
            {l}
            <span
              className="absolute -bottom-1 left-0 h-px w-0 smooth group-hover:w-full"
              style={{ background: "var(--electric)" }}
            />
          </a>
        ))}
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <Link
            to="/dashboard"
            viewTransition
            preload="intent"
            className="rounded-full px-5 py-2.5 text-sm font-bold text-white smooth press hover:-translate-y-0.5 pulse-glow"
            style={{ background: "var(--accent)" }}
          >
            Abrir App →
          </Link>
        ) : (
          <>
            <Link
              to="/login"
              viewTransition
              preload="intent"
              className="hidden text-sm font-medium text-muted-foreground smooth hover:text-foreground sm:inline"
            >
              Entrar
            </Link>
            <Link
              to="/signup"
              viewTransition
              preload="intent"
              className="hidden rounded-full px-5 py-2.5 text-sm font-bold text-white smooth press hover:-translate-y-0.5 sm:inline-flex"
              style={{
                background: "var(--accent)",
                boxShadow: "0 0 30px color-mix(in oklab, var(--accent) 25%, transparent)",
              }}
            >
              Comprar acesso
            </Link>
          </>
        )}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          className="flex h-11 w-11 items-center justify-center rounded-lg border smooth md:hidden"
          style={{ borderColor: "var(--border-strong)", background: "var(--surface)" }}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="absolute inset-x-3 top-[calc(100%+8px)] z-40 rounded-2xl border p-4 backdrop-blur-xl shadow-2xl md:hidden fade-down"
          style={{ background: "color-mix(in oklab, var(--surface) 96%, transparent)", borderColor: "var(--border-strong)" }}
        >
          <div className="flex flex-col gap-1">
            {links.map(([h, l]) => (
              <a
                key={h}
                href={h}
                className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground smooth hover:bg-[color:var(--surface-2)] hover:text-foreground"
              >
                {l}
              </a>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t pt-3" style={{ borderColor: "var(--border)" }}>
              {user ? (
                <Link
                  to="/dashboard"
                  viewTransition
                  preload="intent"
                  className="rounded-full px-5 py-2.5 text-center text-sm font-bold text-white"
                  style={{ background: "var(--accent)" }}
                >
                  Abrir App →
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    viewTransition
                    preload="intent"
                    className="rounded-lg px-4 py-2.5 text-center text-sm font-medium text-muted-foreground hover:text-foreground"
                  >
                    Entrar
                  </Link>
                  <Link
                    to="/signup"
                    viewTransition
                    preload="intent"
                    className="rounded-full px-5 py-2.5 text-center text-sm font-bold text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    Comprar acesso
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────

function Hero({ user }: { user: User | null }) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-24 pt-32 text-center">
      {/* Aurora background */}
      <div
        className="absolute inset-0 float-y"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 30%, color-mix(in oklab, var(--accent) 10%, transparent) 0%, transparent 65%)",
        }}
      />
      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in oklab, var(--accent) 4%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--accent) 4%, transparent) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      {/* Floating crypto symbols */}
      <FloatingSymbols />

      <div className="relative z-10 flex flex-col items-center">
        <div
          className="mb-7 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider fade-down"
          style={{
            background: "color-mix(in oklab, var(--accent) 8%, transparent)",
            border: "1px solid color-mix(in oklab, var(--accent) 22%, transparent)",
            color: "var(--electric)",
          }}
        >
          <span className="h-1.5 w-1.5 rounded-full blink-dot" style={{ background: "var(--electric)" }} />
          Metodologia{" "}
          <span className="font-bold tracking-normal normal-case" style={{ color: "var(--foreground)" }}>
            Gabriel Dutra
          </span>{" "}
          · Orion Capital
        </div>
        <h1 className="max-w-5xl text-[clamp(40px,7vw,90px)] font-black leading-[0.98] tracking-tighter fade-up">
          Sua mente de trader,<br />
          <span className="gradient-text">amplificada</span> por IA.
        </h1>
        <p
          className="mx-auto mt-6 max-w-xl text-[clamp(15px,2vw,19px)] leading-relaxed text-muted-foreground fade-up"
          style={{ animationDelay: "60ms" }}
        >
          Analise gráficos, gerencie sua planilha, converse com seu mentor IA e descubra padrões. Tudo em um só lugar.
        </p>
        <div className="mt-11 flex flex-wrap items-center justify-center gap-3.5 fade-up" style={{ animationDelay: "120ms" }}>
          <Link
            to={user ? "/dashboard" : "/signup"}
            viewTransition
            preload="intent"
            className="group inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold text-white smooth press hover:-translate-y-0.5 pulse-glow ring-2 ring-[color:var(--accent)]/30 sm:px-9 sm:py-4 sm:text-base"
            style={{ background: "var(--accent)" }}
          >
            {user ? "Abrir App" : "Quero acesso anual"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <a
            href="#demo"
            className="group inline-flex items-center gap-2 rounded-full border px-5 py-3.5 text-sm font-semibold text-muted-foreground/90 smooth hover:text-foreground hover:border-[color:var(--accent)] sm:px-8 sm:py-4 sm:text-base"
            style={{ borderColor: "var(--border-strong)" }}
          >
            Ver demonstração
            <span className="transition-transform group-hover:translate-x-0.5">→</span>
          </a>
        </div>
        <div
          className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] uppercase tracking-wider text-muted-foreground fade-up"
          style={{ animationDelay: "180ms" }}
        >
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3 w-3" style={{ color: "var(--green)" }} />
            Garantia 7 dias
          </span>
          <span className="opacity-40">·</span>
          <span>Pagamento único</span>
          <span className="opacity-40">·</span>
          <span>Sem renovação automática</span>
          <span className="opacity-40">·</span>
          <span>Suporte humano</span>
        </div>

        {/* Floating mockup teaser */}
        <div className="mt-14 w-full max-w-4xl fade-up" style={{ animationDelay: "240ms" }}>
          <FloatingChatTeaser />
        </div>
      </div>
    </section>
  );
}

function FloatingSymbols() {
  const symbols = [
    { label: "BTC", color: "var(--gold)", style: { top: "12%", left: "8%", animationDelay: "0s" } },
    { label: "ETH", color: "var(--electric)", style: { top: "22%", right: "10%", animationDelay: "-1.5s" } },
    { label: "EUR/USD", color: "var(--accent)", style: { top: "60%", left: "6%", animationDelay: "-3s" } },
    { label: "SOL", color: "var(--purple)", style: { top: "70%", right: "8%", animationDelay: "-2s" } },
    { label: "AAPL", color: "var(--green)", style: { top: "35%", left: "12%", animationDelay: "-4s" } },
    { label: "M5", color: "var(--gold)", style: { top: "82%", right: "16%", animationDelay: "-1s" } },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
      {symbols.map((s) => (
        <span
          key={s.label}
          className="float-xy absolute select-none font-mono text-[10px] font-bold uppercase tracking-widest"
          style={{
            ...s.style,
            color: s.color,
            opacity: 0.32,
            textShadow: `0 0 14px color-mix(in oklab, ${s.color} 40%, transparent)`,
          }}
        >
          {s.label}
        </span>
      ))}
    </div>
  );
}

function FloatingChatTeaser() {
  return (
    <div
      className="relative mx-auto overflow-hidden rounded-3xl border"
      style={{
        background: "color-mix(in oklab, var(--surface) 92%, transparent)",
        borderColor: "var(--border-strong)",
        boxShadow:
          "0 60px 140px -30px rgba(0,0,0,.6), 0 0 100px -20px color-mix(in oklab, var(--accent) 25%, transparent)",
      }}
    >
      {/* macOS-style chrome */}
      <div
        className="flex items-center gap-2 border-b px-5 py-3"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
      >
        <span className="h-3 w-3 rounded-full" style={{ background: "#ff5f57" }} />
        <span className="h-3 w-3 rounded-full" style={{ background: "#febc2e" }} />
        <span className="h-3 w-3 rounded-full" style={{ background: "#28c840" }} />
        <span className="ml-3 inline-flex items-center gap-1.5 font-mono text-[10px] text-muted-foreground">
          <BrainCircuit className="h-3 w-3" style={{ color: "var(--accent)" }} />
          OrionMind · sessão #4912
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--green)" }}>
          <span className="h-1.5 w-1.5 rounded-full blink-dot" style={{ background: "var(--green)" }} />
          online
        </span>
      </div>
      <ChatPreviewBody />
    </div>
  );
}

function ChatPreviewBody() {
  // Mensagens estáticas pra hero — sem animação JS pra não pesar
  return (
    <div className="grid gap-3 p-6 text-left sm:grid-cols-[1fr_280px] sm:p-7">
      <div className="space-y-3">
        <ChatBubble who="user">Peguei win em BTC com 50 dol de entrada, payout 86%, foi compra.</ChatBubble>
        <ChatBubble who="ai">
          Registrei a operação. Mantenha a disciplina — você tá com <strong>4 wins em sequência</strong> hoje.
        </ChatBubble>
        <div
          className="rounded-2xl border p-4 chat-in"
          style={{
            background:
              "linear-gradient(160deg, color-mix(in oklab, var(--green) 14%, var(--surface)), var(--surface))",
            borderColor: "color-mix(in oklab, var(--green) 38%, transparent)",
            animationDelay: "120ms",
          }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--green)" }}>
              <CheckCircle2 className="h-3.5 w-3.5" />
              Operação registrada
            </span>
            <span className="font-mono text-[11px] text-muted-foreground">BTC/USD</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["Direção", "COMPRA"],
              ["Valor", "$50"],
              ["Payout", "86%"],
            ].map(([l, v]) => (
              <div
                key={l}
                className="rounded-md border px-2 py-1.5 text-center"
                style={{ background: "color-mix(in oklab, var(--surface-2) 70%, transparent)", borderColor: "var(--border)" }}
              >
                <div className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">{l}</div>
                <div className="mt-0.5 text-[12px] font-bold tabular">{v}</div>
              </div>
            ))}
          </div>
          <div
            className="mt-2.5 flex items-center justify-between rounded-md border px-3 py-2"
            style={{
              background: "color-mix(in oklab, var(--green) 12%, transparent)",
              borderColor: "color-mix(in oklab, var(--green) 36%, transparent)",
            }}
          >
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--green)" }}>WIN</span>
            <span className="font-mono text-base font-black tabular" style={{ color: "var(--green)" }}>+$43.00</span>
          </div>
        </div>
      </div>

      {/* Sidebar: live stats */}
      <div className="hidden flex-col gap-2 sm:flex">
        <MiniStat label="Win-rate hoje" value="78%" tone="var(--green)" />
        <MiniStat label="Lucro do dia" value="+$182" tone="var(--electric)" />
        <MiniStat label="Sequência atual" value="4 wins" tone="var(--gold)" />
        <div
          className="mt-1 rounded-xl border p-3"
          style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
        >
          <div className="mb-1 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Próxima zona</div>
          <div className="font-mono text-xs font-semibold">63.420 → 63.580</div>
          <div className="mt-1 text-[10px] text-muted-foreground">Resistência principal · M5</div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ who, children }: { who: "user" | "ai"; children: React.ReactNode }) {
  const isUser = who === "user";
  return (
    <div className={`flex chat-in items-end gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className="flex h-7 w-7 flex-none items-center justify-center rounded-md border text-[10px] font-bold"
        style={
          isUser
            ? { background: "var(--surface-2)", color: "var(--text-muted)", borderColor: "var(--border-strong)" }
            : {
                background: "color-mix(in oklab, var(--accent) 12%, transparent)",
                color: "var(--accent)",
                borderColor: "color-mix(in oklab, var(--accent) 30%, transparent)",
              }
        }
      >
        {isUser ? "EU" : <BrainCircuit className="h-3.5 w-3.5" strokeWidth={2} />}
      </div>
      <div
        className={`max-w-[80%] rounded-2xl border px-3 py-2 text-[13px] leading-relaxed ${isUser ? "rounded-br-sm" : "rounded-bl-sm"}`}
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
        {children}
      </div>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div
      className="rounded-xl border p-3"
      style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
    >
      <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl font-black tabular" style={{ color: tone }}>{value}</div>
    </div>
  );
}

// ─── Broker Marquee ───────────────────────────────────────────────────────

function BrokerMarquee() {
  const brokers = [
    "TradingView",
    "IQ Option",
    "Quotex",
    "MT5",
    "Avalon",
    "Olymp Trade",
    "Binance",
    "Bybit",
    "Pocket Option",
    "Exnova",
  ];
  // duplica pra fazer loop sem cortes
  const loop = [...brokers, ...brokers];
  return (
    <section className="border-y py-6" style={{ borderColor: "var(--border)", background: "color-mix(in oklab, var(--surface) 40%, transparent)" }}>
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-3 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground">
          Funciona com qualquer broker
        </div>
        <div className="marquee-container overflow-hidden">
          <div className="marquee-track whitespace-nowrap">
            {loop.map((b, i) => (
              <span
                key={`${b}-${i}`}
                className="inline-flex items-center gap-2 font-display text-base font-bold smooth hover:text-foreground"
                style={{ color: "var(--text-muted)" }}
              >
                <span className="h-1 w-1 rounded-full" style={{ background: "var(--text-dim)" }} />
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Live Demo (Mockup carousel) ──────────────────────────────────────────

const DEMO_TABS = [
  { id: "scan", label: "OrionScan", Icon: LineChart, sub: "Análise de gráfico por IA" },
  { id: "mind", label: "OrionMind", Icon: BrainCircuit, sub: "Mentor IA com cards de operação" },
  { id: "gestao", label: "Planilha", Icon: ClipboardList, sub: "Stats em tempo real" },
  { id: "noticias", label: "Notícias", Icon: Newspaper, sub: "Calendário econômico" },
] as const;

function LiveDemoSection() {
  const [tab, setTab] = useState<(typeof DEMO_TABS)[number]["id"]>("scan");
  // auto-rotate quando user não está interagindo
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setTab((cur) => {
        const idx = DEMO_TABS.findIndex((t) => t.id === cur);
        return DEMO_TABS[(idx + 1) % DEMO_TABS.length].id;
      });
    }, 5500);
    return () => clearInterval(id);
  }, [paused]);

  return (
    <section id="demo" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeader
        tag="DEMO AO VIVO"
        title="Veja o OrionHub em ação"
        sub="Navegue entre as ferramentas. Auto-rotação a cada 5 segundos — ou clique nas abas."
      />

      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        className="mx-auto max-w-5xl"
      >
        {/* Tab strip */}
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {DEMO_TABS.map((t) => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => {
                  setTab(t.id);
                  setPaused(true);
                }}
                className="group relative overflow-hidden rounded-xl border p-3 text-left smooth press hover:-translate-y-px"
                style={
                  active
                    ? {
                        background: "color-mix(in oklab, var(--accent) 12%, var(--surface))",
                        borderColor: "color-mix(in oklab, var(--accent) 40%, transparent)",
                        boxShadow: "0 12px 32px -16px color-mix(in oklab, var(--accent) 55%, transparent)",
                      }
                    : { background: "var(--surface)", borderColor: "var(--border)" }
                }
              >
                <div className="flex items-center gap-2">
                  <t.Icon
                    className="h-4 w-4 smooth"
                    strokeWidth={1.75}
                    style={{ color: active ? "var(--accent)" : "var(--text-dim)" }}
                  />
                  <span className="text-sm font-bold" style={{ color: active ? "var(--foreground)" : "var(--text-muted)" }}>
                    {t.label}
                  </span>
                </div>
                <div className="mt-0.5 text-[10px] text-muted-foreground">{t.sub}</div>
                {active && (
                  <span
                    className="tab-indicator absolute inset-x-0 bottom-0 h-0.5"
                    style={{ background: "var(--gradient-primary)" }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Mockup body */}
        <div
          className="relative overflow-hidden rounded-3xl border"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border-strong)",
            boxShadow:
              "0 60px 140px -30px rgba(0,0,0,.55), 0 0 80px -20px color-mix(in oklab, var(--accent) 25%, transparent)",
          }}
        >
          <div
            className="flex items-center gap-2 border-b px-5 py-3"
            style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
          >
            <span className="h-3 w-3 rounded-full" style={{ background: "#ff5f57" }} />
            <span className="h-3 w-3 rounded-full" style={{ background: "#febc2e" }} />
            <span className="h-3 w-3 rounded-full" style={{ background: "#28c840" }} />
            <span className="ml-3 font-mono text-[10px] text-muted-foreground">
              orionmindhub.app · {DEMO_TABS.find((t) => t.id === tab)?.label.toLowerCase()}
            </span>
          </div>
          {tab === "scan" && <ScanMockup />}
          {tab === "mind" && <MindMockup />}
          {tab === "gestao" && <GestaoMockup />}
          {tab === "noticias" && <NoticiasMockup />}
        </div>
      </div>
    </section>
  );
}

function ScanMockup() {
  return (
    <div className="grid gap-5 p-5 fade-in sm:p-7 md:grid-cols-[1fr_300px]">
      <div
        className="relative flex h-[280px] items-center justify-center overflow-hidden rounded-2xl border md:h-[340px]"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
      >
        {/* Fake candle chart */}
        <CandleChartMock />
        <div
          className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-mono"
          style={{ background: "color-mix(in oklab, var(--surface) 80%, transparent)", borderColor: "var(--border)" }}
        >
          BTC/USD · M5
        </div>
        <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider" style={{ background: "color-mix(in oklab, var(--accent) 14%, transparent)", color: "var(--accent)" }}>
          <Sparkles className="h-3 w-3" /> IA analisando
        </div>
      </div>
      <div className="space-y-3">
        <div
          className="rounded-xl border p-4"
          style={{
            background: "color-mix(in oklab, var(--green) 10%, transparent)",
            borderColor: "color-mix(in oklab, var(--green) 30%, transparent)",
          }}
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-full px-2 py-0.5 text-[10px] font-extrabold" style={{ background: "color-mix(in oklab, var(--green) 22%, transparent)", color: "var(--green)" }}>▲ CALL</span>
            <span className="text-[11px] text-muted-foreground">expiração M1</span>
            <span className="ml-auto font-mono text-sm font-extrabold" style={{ color: "var(--electric)" }}>87%</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {[
              ["Entrada", "14:35"],
              ["Proteção 1", "14:40"],
              ["Proteção 2", "14:45"],
            ].map(([l, v]) => (
              <div key={l} className="rounded-lg p-2 text-center" style={{ background: "rgba(255,255,255,.04)" }}>
                <div className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">{l}</div>
                <div className="mt-0.5 font-mono text-[11px] font-bold">{v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            ["Tendência", "Alta", "var(--green)"],
            ["Viés", "Bullish", "var(--electric)"],
            ["Suporte", "63.180", "var(--gold)"],
            ["Resistência", "63.580", "var(--gold)"],
          ].map(([l, v, c]) => (
            <div key={l} className="rounded-lg p-2.5" style={{ background: "var(--surface-2)" }}>
              <div className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">{l}</div>
              <div className="mt-0.5 font-mono text-[12px] font-bold" style={{ color: c as string }}>{v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CandleChartMock() {
  // Renderiza candles fake usando SVG path
  const candles = Array.from({ length: 24 }).map((_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const r1 = (seed % 100) / 100;
    const r2 = ((seed * 7) % 100) / 100;
    const trend = i * 1.2;
    const mid = 140 - trend + (r1 - 0.5) * 20;
    const open = mid - 8 + (r2 - 0.5) * 6;
    const close = mid + 8 + (r1 - 0.5) * 6;
    const isGreen = close < open; // SVG y-axis is inverted
    return { x: 10 + i * 14, open, close, high: Math.min(open, close) - 8, low: Math.max(open, close) + 8, isGreen };
  });
  return (
    <svg viewBox="0 0 350 180" className="h-full w-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id="grad-up" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.72 0.15 155)" />
          <stop offset="100%" stopColor="oklch(0.55 0.18 155)" />
        </linearGradient>
        <linearGradient id="grad-down" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.7 0.18 22)" />
          <stop offset="100%" stopColor="oklch(0.5 0.2 22)" />
        </linearGradient>
      </defs>
      {/* grid */}
      {[40, 80, 120, 160].map((y) => (
        <line key={y} x1="0" y1={y} x2="350" y2={y} stroke="currentColor" strokeOpacity="0.06" strokeDasharray="2 4" />
      ))}
      {/* support/resistance */}
      <line x1="0" y1="50" x2="350" y2="50" stroke="oklch(0.78 0.13 80)" strokeOpacity="0.5" strokeDasharray="4 4" />
      <line x1="0" y1="130" x2="350" y2="130" stroke="oklch(0.78 0.13 80)" strokeOpacity="0.5" strokeDasharray="4 4" />
      {candles.map((c, i) => (
        <g key={i}>
          <line x1={c.x + 5} y1={c.high} x2={c.x + 5} y2={c.low} stroke={c.isGreen ? "url(#grad-up)" : "url(#grad-down)"} strokeWidth="1.2" />
          <rect
            x={c.x}
            y={Math.min(c.open, c.close)}
            width="10"
            height={Math.abs(c.close - c.open)}
            fill={c.isGreen ? "url(#grad-up)" : "url(#grad-down)"}
            rx="1"
          />
        </g>
      ))}
      {/* AI annotation arrow */}
      <g style={{ animation: "pulseGlow 3s ease-in-out infinite" }}>
        <circle cx="320" cy="60" r="6" fill="oklch(0.72 0.13 235)" opacity="0.3" />
        <circle cx="320" cy="60" r="3" fill="oklch(0.72 0.13 235)" />
      </g>
    </svg>
  );
}

function MindMockup() {
  return (
    <div className="grid gap-3 p-5 fade-in sm:p-7 sm:grid-cols-[1fr_280px]">
      <div className="space-y-3">
        <ChatBubble who="user">Quantos wins tive essa semana?</ChatBubble>
        <ChatBubble who="ai">
          Você teve <strong>14 wins</strong> nos últimos 7 dias. Win-rate de <strong>72%</strong>. Sequência atual: 4.
        </ChatBubble>
        <div
          className="rounded-2xl border p-4"
          style={{
            background:
              "linear-gradient(160deg, color-mix(in oklab, var(--gold) 12%, var(--surface)), var(--surface))",
            borderColor: "color-mix(in oklab, var(--gold) 30%, transparent)",
          }}
        >
          <div className="mb-2 flex items-center gap-2">
            <Trophy className="h-4 w-4" style={{ color: "var(--gold)" }} />
            <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--gold)" }}>
              Balanço de operações
            </span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">Últimos 7 dias</span>
          </div>
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              <span>Win-rate</span>
              <span className="font-display text-base font-black" style={{ color: "var(--green)" }}>72%</span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full" style={{ background: "color-mix(in oklab, var(--surface-3) 80%, var(--red) 20%)" }}>
              <div className="h-full rounded-full" style={{ width: "72%", background: "color-mix(in oklab, var(--green) 85%, transparent)", boxShadow: "0 0 10px color-mix(in oklab, var(--green) 55%, transparent)" }} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border p-2" style={{ background: "color-mix(in oklab, var(--surface-2) 70%, transparent)", borderColor: "var(--border)" }}>
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Wins</div>
              <div className="mt-0.5 font-mono text-sm font-bold" style={{ color: "var(--green)" }}>14</div>
            </div>
            <div className="rounded-lg border p-2" style={{ background: "color-mix(in oklab, var(--surface-2) 70%, transparent)", borderColor: "var(--border)" }}>
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Lucro</div>
              <div className="mt-0.5 font-mono text-sm font-bold" style={{ color: "var(--green)" }}>+$524</div>
            </div>
          </div>
        </div>
      </div>
      <div className="hidden flex-col gap-2 sm:flex">
        <MiniStat label="Sequência" value="4 wins" tone="var(--gold)" />
        <MiniStat label="Melhor ativo" value="BTC/USD" tone="var(--accent)" />
        <div className="rounded-xl border p-3" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
          <div className="mb-1.5 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
            <Mic className="h-3 w-3" style={{ color: "var(--accent)" }} /> Voz suportada
          </div>
          <div className="text-[11px] text-muted-foreground">Registre operações falando, sem digitar.</div>
        </div>
      </div>
    </div>
  );
}

function GestaoMockup() {
  return (
    <div className="grid gap-4 p-5 fade-in sm:p-7 md:grid-cols-[1fr_280px]">
      <div>
        <div className="mb-3 grid grid-cols-3 gap-2">
          {[
            ["Banca", "$2.840", "var(--electric)"],
            ["Win-rate", "68%", "var(--green)"],
            ["Resultado", "+$340", "var(--green)"],
          ].map(([l, v, c]) => (
            <div key={l} className="rounded-xl border p-3" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
              <div className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{l}</div>
              <div className="mt-1 font-display text-lg font-black tabular" style={{ color: c as string }}>{v}</div>
            </div>
          ))}
        </div>
        <div
          className="rounded-xl border p-4"
          style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Evolução da banca</span>
            <span className="font-mono text-[10px] text-muted-foreground">últimos 30 dias</span>
          </div>
          <BankLineMock />
        </div>
      </div>
      <div className="space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Últimos trades</div>
        {[
          { ativo: "BTC/USD", dir: "COMPRA", res: "WIN", v: "+$43" },
          { ativo: "EUR/USD", dir: "VENDA", res: "WIN", v: "+$25" },
          { ativo: "ETH/USD", dir: "COMPRA", res: "LOSS", v: "−$30" },
          { ativo: "SOL/USD", dir: "COMPRA", res: "WIN", v: "+$38" },
        ].map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-2 rounded-md border px-3 py-2 text-xs"
            style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
          >
            <span className="font-mono">{t.ativo}</span>
            <span
              className="rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
              style={{
                background: t.dir === "COMPRA" ? "color-mix(in oklab, var(--green) 18%, transparent)" : "color-mix(in oklab, var(--red) 18%, transparent)",
                color: t.dir === "COMPRA" ? "var(--green)" : "var(--red)",
              }}
            >
              {t.dir}
            </span>
            <span className="ml-auto font-mono font-bold" style={{ color: t.res === "WIN" ? "var(--green)" : "var(--red)" }}>{t.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BankLineMock() {
  const pts = Array.from({ length: 30 }).map((_, i) => {
    const trend = (i / 29) * 70;
    const noise = Math.sin(i * 0.6) * 8 + Math.cos(i * 0.3) * 5;
    return [i * (300 / 29), 100 - trend + noise] as const;
  });
  const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const area = `${d} L300,140 L0,140 Z`;
  return (
    <svg viewBox="0 0 300 140" className="h-[140px] w-full">
      <defs>
        <linearGradient id="bank-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.72 0.13 235)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="oklch(0.72 0.13 235)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[35, 70, 105].map((y) => (
        <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="currentColor" strokeOpacity="0.06" strokeDasharray="2 4" />
      ))}
      <path d={area} fill="url(#bank-grad)" />
      <path d={d} stroke="oklch(0.72 0.13 235)" strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {pts.filter((_, i) => i === pts.length - 1).map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="oklch(0.72 0.13 235)" stroke="var(--surface)" strokeWidth="2" />
      ))}
    </svg>
  );
}

function NoticiasMockup() {
  const events = [
    { time: "08:30", country: "US", impact: "High", title: "Non-Farm Payrolls", actual: "256K", forecast: "180K" },
    { time: "10:00", country: "EU", impact: "Medium", title: "ECB Interest Rate Decision", actual: "—", forecast: "4.25%" },
    { time: "14:30", country: "US", impact: "High", title: "CPI YoY", actual: "—", forecast: "3.1%" },
    { time: "21:00", country: "JP", impact: "Low", title: "Tankan Manufacturing Index", actual: "—", forecast: "12" },
  ];
  const impactStyle = (i: string) => {
    if (i === "High") return { bg: "color-mix(in oklab, var(--red) 14%, transparent)", color: "var(--red)" };
    if (i === "Medium") return { bg: "color-mix(in oklab, var(--gold) 14%, transparent)", color: "var(--gold)" };
    return { bg: "color-mix(in oklab, var(--green) 12%, transparent)", color: "var(--green)" };
  };
  return (
    <div className="p-5 fade-in sm:p-7">
      <div className="mb-2 px-1 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Hoje · Quinta-feira, 28 de maio</div>
      <div className="overflow-hidden rounded-xl border" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
        {events.map((ev, i) => {
          const s = impactStyle(ev.impact);
          return (
            <div
              key={i}
              className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="w-12 flex-none font-mono text-xs tabular text-muted-foreground">{ev.time}</div>
              <span className="inline-flex h-6 min-w-16 items-center justify-center rounded-md px-2 text-[10px] font-bold uppercase tracking-wider" style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}` }}>
                {ev.impact === "High" ? "Alto" : ev.impact === "Medium" ? "Médio" : "Baixo"}
              </span>
              <div className="w-10 flex-none font-mono text-[10px] uppercase text-muted-foreground">{ev.country}</div>
              <div className="min-w-0 flex-1 truncate text-sm font-medium">{ev.title}</div>
              <div className="hidden gap-3 font-mono text-[10px] text-muted-foreground sm:flex">
                <span>F: {ev.forecast}</span>
                <span style={{ color: ev.actual !== "—" ? "var(--green)" : undefined }}>A: {ev.actual}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Bento Features ───────────────────────────────────────────────────────

function BentoFeatures() {
  return (
    <section id="tools" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeader
        tag="FERRAMENTAS"
        title="6 módulos integrados. Uma assinatura."
        sub="Cada ferramenta foi pensada pra acelerar uma decisão diferente do trader profissional."
      />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 md:grid-rows-[auto_auto_auto]">
        <BentoCard
          Icon={LineChart}
          tone="var(--accent)"
          title="OrionScan"
          desc="IA visual analisa qualquer gráfico em menos de 2 segundos. Identifica padrões, suporte e resistência, calcula horário de entrada e proteções."
          tags={["Vision IA", "Qualquer broker", "Entrada + 2 proteções"]}
          className="md:col-span-2"
        />
        <BentoCard
          Icon={Calculator}
          tone="var(--gold)"
          title="Calculadora"
          desc="Padrão Orion configurado: 1% por entrada, 2 proteções, stop diário."
          tags={["Gestão %", "Martingale"]}
        />
        <BentoCard
          Icon={ClipboardList}
          tone="var(--green)"
          title="Planilha & Relatórios"
          desc="Win-rate, lucro acumulado, melhor ativo, drawdown — calculados em tempo real. Exporte gráficos em PDF."
          tags={["PDF", "CSV", "Filtros por período", "Cloud sync"]}
        />
        <BentoCard
          Icon={BrainCircuit}
          tone="var(--electric)"
          title="OrionMind · Mentor IA"
          desc="Conversa contextualizada sobre estratégia, gestão e psicologia. Registra operações por voz, gera relatórios e cards visuais."
          tags={["Voz", "Cards visuais", "Memória do histórico"]}
          className="md:col-span-2"
        />
        <BentoCard
          Icon={Newspaper}
          tone="var(--red)"
          title="Notícias & Calendário"
          desc="Eventos econômicos por impacto, em tempo real."
          tags={["Alto / Médio / Baixo"]}
        />
        <BentoCard
          Icon={Bitcoin}
          tone="var(--purple)"
          title="CryptoBubbles"
          desc="Radar visual do mercado cripto integrado."
          tags={["Top 100", "Live"]}
        />
      </div>
    </section>
  );
}

function BentoCard({
  Icon,
  tone,
  title,
  desc,
  tags,
  className = "",
}: {
  Icon: LucideIcon;
  tone: string;
  title: string;
  desc: string;
  tags: string[];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      onMouseMove={(e) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        el.style.setProperty("--my", `${e.clientY - rect.top}px`);
      }}
      className={`bento-glow group relative overflow-hidden rounded-3xl border p-7 smooth hover-lift ${className}`}
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div
        className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl transition-transform group-hover:scale-110 group-hover:rotate-[-6deg]"
        style={{
          background: `color-mix(in oklab, ${tone} 10%, transparent)`,
          border: `1px solid color-mix(in oklab, ${tone} 22%, transparent)`,
          color: tone,
        }}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <h3 className="mb-2 text-lg font-extrabold tracking-tight">{title}</h3>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{desc}</p>
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span
            key={t}
            className="rounded-full border px-2 py-0.5 text-[10px] font-semibold"
            style={{
              background: `color-mix(in oklab, ${tone} 7%, transparent)`,
              borderColor: `color-mix(in oklab, ${tone} 22%, transparent)`,
              color: tone,
            }}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Stats Section (animated counters) ────────────────────────────────────

function StatsSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div
        className="grid grid-cols-2 gap-4 rounded-3xl border p-6 sm:grid-cols-4 sm:p-10"
        style={{
          background:
            "linear-gradient(160deg, color-mix(in oklab, var(--accent) 7%, var(--surface)), var(--surface))",
          borderColor: "color-mix(in oklab, var(--accent) 18%, transparent)",
          boxShadow: "0 24px 80px -32px color-mix(in oklab, var(--accent) 35%, transparent)",
        }}
      >
        <AnimatedStat value={92} suffix="%" label="Precisão da IA" hint="em backtests internos" />
        <AnimatedStat value={2} suffix="s" prefix="<" label="Tempo de análise" hint="por gráfico" />
        <AnimatedStat value={24} suffix="/7" label="Mentor IA" hint="sempre disponível" />
        <AnimatedStat value={10} suffix="+" label="Brokers" hint="qualquer plataforma" />
      </div>
    </section>
  );
}

function AnimatedStat({
  value,
  suffix = "",
  prefix = "",
  label,
  hint,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
  hint: string;
}) {
  const [shown, setShown] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !started.current) {
            started.current = true;
            const duration = 900;
            const start = performance.now();
            const tick = (t: number) => {
              const p = Math.min(1, (t - start) / duration);
              const eased = 1 - Math.pow(1 - p, 3);
              setShown(Math.round(value * eased));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        }
      },
      { threshold: 0.3 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);
  return (
    <div ref={ref} className="text-center sm:text-left">
      <div className="counter-pop font-display text-[clamp(36px,6vw,64px)] font-black leading-none tracking-tighter" style={{ color: "var(--electric)" }}>
        {prefix}
        {shown}
        {suffix}
      </div>
      <div className="mt-2 text-sm font-bold">{label}</div>
      <div className="text-[11px] text-muted-foreground">{hint}</div>
    </div>
  );
}

// ─── Mentor Section ───────────────────────────────────────────────────────

function MentorSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-24">
      <div className="grid items-center gap-8 md:grid-cols-[1fr_1.2fr] md:gap-12">
        <div className="relative mx-auto md:mx-0">
          <div
            className="relative flex h-44 w-44 items-center justify-center rounded-3xl border transition-transform hover:scale-[1.02] md:h-56 md:w-56"
            style={{
              background:
                "linear-gradient(160deg, color-mix(in oklab, var(--accent) 16%, var(--surface)), color-mix(in oklab, var(--electric) 10%, var(--surface)))",
              borderColor: "color-mix(in oklab, var(--accent) 38%, transparent)",
              boxShadow: "0 30px 80px -20px color-mix(in oklab, var(--accent) 45%, transparent)",
            }}
          >
            <span className="font-display text-6xl font-black gradient-text">GD</span>
            <span
              className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-2xl border text-[10px] font-black"
              style={{
                background: "var(--surface)",
                borderColor: "color-mix(in oklab, var(--accent) 40%, transparent)",
                color: "var(--accent)",
              }}
            >
              ✓
            </span>
          </div>
          <div className="mt-4 text-center md:text-left">
            <div className="font-display text-lg font-extrabold">Gabriel Dutra</div>
            <div className="text-xs text-muted-foreground">Trader oficial · Orion Capital</div>
          </div>
        </div>

        <div>
          <div
            className="mb-3 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
            style={{
              background: "color-mix(in oklab, var(--accent) 10%, transparent)",
              borderColor: "color-mix(in oklab, var(--accent) 25%, transparent)",
              color: "var(--electric)",
            }}
          >
            O Mentor
          </div>
          <h2 className="font-display text-3xl font-black tracking-tight md:text-4xl">
            Construído com a metodologia de quem <span className="gradient-text">opera de verdade</span>.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
            Gabriel Dutra é o trader oficial e mentor responsável pela{" "}
            <strong className="text-foreground">Orion Capital</strong> — referência em price action, gestão profissional de banca
            e disciplina operacional. Cada regra, indicador e fluxo do OrionHub traduz a metodologia que ele ensina diariamente
            aos alunos.
          </p>
          <blockquote
            className="mt-6 rounded-2xl border p-5 text-sm italic leading-relaxed text-muted-foreground"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            “O OrionHub é a tradução prática do que ensino dentro da Orion Capital — agora com IA pra acelerar a leitura do
            gráfico e a gestão da banca.”
            <div className="mt-3 not-italic text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
              — Gabriel Dutra
            </div>
          </blockquote>
        </div>
      </div>
    </section>
  );
}

// ─── How Section ──────────────────────────────────────────────────────────

function HowSection() {
  const steps = [
    ["01", "Adquira seu acesso", "R$ 2.500 · 12 meses · garantia de 7 dias."],
    ["02", "Carregue seu gráfico", "Print, drag&drop ou Ctrl+V. Qualquer broker."],
    ["03", "IA analisa", "Padrões, indicadores e contexto, em segundos."],
    ["04", "Opere com clareza", "Sinal + horários + gestão recomendada."],
  ];
  return (
    <section id="how" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeader
        tag="COMO FUNCIONA"
        title="Em 4 passos simples"
        sub="Da imagem ao sinal em menos de 2 segundos."
      />
      <div className="relative grid grid-cols-1 gap-6 stagger sm:grid-cols-2 md:grid-cols-4">
        {steps.map(([n, t, d], i) => (
          <div key={n} className="relative text-center">
            <div
              className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border text-xl font-black transition-transform hover:scale-110 hover:rotate-[-6deg]"
              style={{
                background: "var(--surface-2)",
                borderColor: "color-mix(in oklab, var(--electric) 30%, transparent)",
                color: "var(--electric)",
                boxShadow: "0 8px 24px -12px color-mix(in oklab, var(--electric) 45%, transparent)",
              }}
            >
              {n}
            </div>
            {i < steps.length - 1 && (
              <div
                aria-hidden
                className="absolute left-[calc(50%+28px)] top-7 hidden h-px md:block"
                style={{
                  width: "calc(100% - 56px)",
                  background:
                    "linear-gradient(90deg, color-mix(in oklab, var(--electric) 50%, transparent), transparent)",
                }}
              />
            )}
            <div className="text-[15px] font-bold">{t}</div>
            <div className="mt-1.5 text-[13px] leading-snug text-muted-foreground">{d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────

function TestimonialsSection() {
  const items = [
    {
      name: "Rafael M.",
      role: "Trader 2 anos · Forex",
      quote: "Antes eu perdia tempo abrindo TradingView pra checar S/R. Hoje colo o print no OrionScan e em 2s tô com o setup pronto.",
      rating: 5,
    },
    {
      name: "Camila S.",
      role: "Iniciante · Opções binárias",
      quote: "O OrionMind me explica os erros da semana e sugere o que ajustar. É como ter um mentor à disposição 24h.",
      rating: 5,
    },
    {
      name: "João P.",
      role: "Trader 5 anos · Cripto",
      quote: "A planilha automatizada e os relatórios mensais me deram clareza que eu nunca tive operando solo. Vale cada centavo.",
      rating: 5,
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeader
        tag="DEPOIMENTOS"
        title="Quem usa, opera com mais clareza"
        sub="Traders reais usando o OrionHub no dia a dia."
      />
      <div className="grid grid-cols-1 gap-4 stagger md:grid-cols-3">
        {items.map((it) => (
          <div
            key={it.name}
            className="group relative rounded-2xl border p-6 hover-lift"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <Quote
              className="absolute right-5 top-5 h-8 w-8 opacity-10"
              style={{ color: "var(--accent)" }}
              strokeWidth={1.5}
            />
            <div className="mb-3 flex items-center gap-1">
              {Array.from({ length: it.rating }).map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5" style={{ color: "var(--gold)", fill: "var(--gold)" }} />
              ))}
            </div>
            <p className="mb-5 text-[14px] italic leading-relaxed text-muted-foreground">"{it.quote}"</p>
            <div className="flex items-center gap-3 border-t pt-3" style={{ borderColor: "var(--border)" }}>
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full font-display text-xs font-black"
                style={{
                  background: "color-mix(in oklab, var(--accent) 14%, transparent)",
                  color: "var(--accent)",
                }}
              >
                {it.name.split(" ").map((p) => p[0]).join("")}
              </div>
              <div>
                <div className="text-sm font-bold">{it.name}</div>
                <div className="text-[11px] text-muted-foreground">{it.role}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Pricing ──────────────────────────────────────────────────────────────

function PricingSection() {
  const features = [
    { label: "Análises com OrionScan", trial: "5 totais", anual: "Ilimitadas" },
    { label: "OrionMind (mentor IA)", trial: "Limitado", anual: "Ilimitado" },
    { label: "Planilha + relatórios", trial: "Básico", anual: "Completo + PDF" },
    { label: "Calculadora de banca", trial: "✓", anual: "✓" },
    { label: "Notícias & Calendário", trial: "—", anual: "✓" },
    { label: "CryptoBubbles", trial: "—", anual: "✓" },
    { label: "Voz no OrionMind", trial: "—", anual: "✓" },
    { label: "Suporte prioritário", trial: "—", anual: "✓" },
  ];
  const guarantees = [
    { Icon: ShieldCheck, label: "Garantia 7 dias", desc: "Devolução de 100%" },
    { Icon: Zap, label: "Acesso imediato", desc: "Liberado em minutos" },
    { Icon: Target, label: "Pagamento único", desc: "Sem renovação automática" },
  ];
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeader
        tag="ACESSO ANUAL"
        title="Um pagamento único. 12 meses completos."
        sub="Sem mensalidade, sem renovação automática. Garantia de 7 dias com devolução total."
      />

      <div className="grid items-start gap-5 md:grid-cols-[1fr_1.1fr]">
        {/* Pricing card */}
        <div
          className="ring-gradient relative rounded-3xl border p-8"
          style={{
            background:
              "linear-gradient(180deg, color-mix(in oklab, var(--accent) 8%, var(--surface)), var(--surface))",
            borderColor: "color-mix(in oklab, var(--accent) 38%, transparent)",
            boxShadow: "0 40px 100px -30px color-mix(in oklab, var(--accent) 45%, transparent)",
          }}
        >
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white" style={{ background: "var(--accent)" }}>
            <Crown className="h-3 w-3" /> Acesso Anual
          </div>
          <div className="flex items-end gap-3">
            <div className="font-display text-5xl font-black tracking-tight gradient-text">
              <sup className="mr-1 align-top text-base font-bold" style={{ color: "var(--electric)" }}>R$</sup>
              2.500
            </div>
            <div className="pb-2 text-[11px] text-muted-foreground">
              /ano · pagamento único<br />
              12 meses de acesso completo
            </div>
          </div>
          <Link
            to="/signup"
            viewTransition
            preload="intent"
            className="mt-6 group flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-bold text-white smooth press hover:-translate-y-0.5 pulse-glow"
            style={{ background: "var(--accent)", boxShadow: "0 0 50px color-mix(in oklab, var(--accent) 35%, transparent)" }}
          >
            Comprar acesso anual
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            {guarantees.map(({ Icon, label, desc }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-xl border px-3 py-2"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
              >
                <div
                  className="flex h-7 w-7 flex-none items-center justify-center rounded-md"
                  style={{ background: "color-mix(in oklab, var(--green) 14%, transparent)", color: "var(--green)" }}
                >
                  <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                </div>
                <div>
                  <div className="text-[11px] font-bold leading-tight">{label}</div>
                  <div className="text-[9px] leading-tight text-muted-foreground">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature matrix */}
        <div
          className="overflow-hidden rounded-3xl border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div className="grid grid-cols-[1fr_90px_90px] gap-2 border-b px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground sm:grid-cols-[1fr_120px_120px]" style={{ borderColor: "var(--border)" }}>
            <div>Recurso</div>
            <div className="text-center">Trial</div>
            <div className="text-center" style={{ color: "var(--accent)" }}>Anual</div>
          </div>
          {features.map((f, i) => (
            <div
              key={f.label}
              className="grid grid-cols-[1fr_90px_90px] items-center gap-2 border-b px-5 py-2.5 text-sm transition-colors hover:bg-[color:var(--surface-2)] last:border-b-0 sm:grid-cols-[1fr_120px_120px]"
              style={{ borderColor: "var(--border)", animationDelay: `${i * 30}ms` }}
            >
              <div className="font-medium">{f.label}</div>
              <div className="text-center text-xs text-muted-foreground">{f.trial}</div>
              <div className="text-center text-xs font-bold" style={{ color: "var(--accent)" }}>
                {f.anual === "✓" ? <Check className="mx-auto h-4 w-4" /> : f.anual}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── FAQ ──────────────────────────────────────────────────────────────────

function FaqSection() {
  const items: Array<[string, string]> = [
    ["Quem é Gabriel Dutra?", "Gabriel Dutra é o trader oficial e mentor da Orion Capital. Toda a metodologia (price action, gerenciamento padrão Orion, regras de proteção) embarcada no OrionHub foi construída a partir do que ele ensina aos alunos."],
    ["A IA realmente funciona com qualquer broker?", "Sim. Como a análise é feita visualmente sobre a imagem do gráfico, basta tirar um print de qualquer plataforma (IQ Option, Quotex, MT5, TradingView, etc)."],
    ["Vocês garantem lucros?", "Não. Nenhuma ferramenta séria garante lucros em trading. O OrionHub é um copiloto que entrega análise objetiva — a decisão e o gerenciamento são sempre seus."],
    ["Meus dados ficam armazenados?", "Suas operações e conversas com o OrionMind ficam guardadas com segurança na sua conta — sincronizadas entre dispositivos. As imagens enviadas para análise não são armazenadas após o processamento."],
    ["Funciona em opções binárias e em forex?", "Sim. A análise é sobre o gráfico — funciona para qualquer ativo: forex, índices, ações, cripto, commodities."],
    ["Posso usar no celular?", "Sim. O OrionHub é totalmente responsivo: você pode subir prints diretamente da galeria, conversar com o mentor por voz e visualizar os relatórios no mobile."],
    ["O acesso renova automaticamente?", "Não. É um pagamento único que libera 12 meses de acesso completo. Sem renovação automática — você decide se quer renovar depois desse período."],
    ["Tenho garantia se não gostar?", "Sim. Você tem 7 dias após a compra como garantia de devolução. Se não gostou, devolvemos 100% do valor pago, sem perguntas."],
    ["Como recebo o acesso após o pagamento?", "Em poucos minutos após a confirmação, liberamos seu acesso anual no e-mail cadastrado. Em horário comercial, geralmente em até 30 minutos."],
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <SectionHeader tag="FAQ" title="Perguntas frequentes" sub="" />
      <div>
        {items.map(([q, a], i) => (
          <div key={q} className="border-b py-1" style={{ borderColor: "var(--border)" }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="group flex w-full items-center justify-between py-4 text-left text-[15px] font-semibold smooth hover:text-[color:var(--electric)]"
            >
              <span>{q}</span>
              <span
                className="flex h-7 w-7 flex-none items-center justify-center rounded-full border text-base smooth"
                style={{
                  borderColor: open === i ? "color-mix(in oklab, var(--electric) 40%, transparent)" : "var(--border-strong)",
                  background: open === i ? "color-mix(in oklab, var(--electric) 12%, transparent)" : "transparent",
                  color: open === i ? "var(--electric)" : "var(--text-muted)",
                  transform: open === i ? "rotate(45deg)" : "none",
                }}
              >
                +
              </span>
            </button>
            {open === i && <div className="pb-4 text-sm leading-relaxed text-muted-foreground faq-open">{a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────

function CtaSection() {
  return (
    <section className="relative overflow-hidden px-6 py-32 text-center">
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, color-mix(in oklab, var(--accent) 12%, transparent) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in oklab, var(--accent) 5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--accent) 5%, transparent) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 75%)",
        }}
      />
      <div
        className="relative z-10 mx-auto inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-semibold"
        style={{
          background: "color-mix(in oklab, var(--green) 8%, transparent)",
          borderColor: "color-mix(in oklab, var(--green) 22%, transparent)",
          color: "var(--green)",
        }}
      >
        <span className="h-1.5 w-1.5 rounded-full blink-dot" style={{ background: "var(--green)" }} />
        Garantia de 7 dias · 100% do valor
      </div>
      <h2 className="relative z-10 mt-6 text-[clamp(32px,5.5vw,68px)] font-black leading-[0.98] tracking-tighter">
        Comece a operar com<br />
        <span className="gradient-text">clareza</span> hoje.
      </h2>
      <p className="relative z-10 mx-auto mt-5 max-w-md text-base text-muted-foreground">
        Acesso anual completo por R$ 2.500. Sem mensalidade. Sem renovação.
      </p>
      <Link
        to="/signup"
        viewTransition
        preload="intent"
        className="group relative z-10 mt-9 inline-flex items-center gap-2 rounded-full px-10 py-4 text-base font-bold text-white smooth press hover:-translate-y-0.5 pulse-glow ring-2 ring-[color:var(--accent)]/30"
        style={{
          background: "var(--accent)",
          boxShadow: "0 0 80px color-mix(in oklab, var(--accent) 40%, transparent)",
        }}
      >
        Quero meu acesso anual
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Link>
      <div className="relative z-10 mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] uppercase tracking-wider text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Cloud className="h-3 w-3" /> Sincronização entre dispositivos</span>
        <span className="opacity-40">·</span>
        <span className="inline-flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Atualizações constantes</span>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer
      className="border-t px-6 py-12"
      style={{ borderColor: "var(--border)", background: "color-mix(in oklab, var(--surface) 30%, transparent)" }}
    >
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 text-center">
        <Link to="/" className="inline-flex items-center gap-2 text-[22px] font-black tracking-tight">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg"
            style={{
              background: "linear-gradient(135deg, var(--accent), var(--electric))",
              boxShadow: "0 6px 16px -8px color-mix(in oklab, var(--accent) 60%, transparent)",
            }}
          >
            <Activity className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
          </span>
          Orion<span style={{ color: "var(--electric)" }}>Hub</span>
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-muted-foreground">
          {["Termos", "Privacidade", "Contato"].map((l) => (
            <a key={l} href="#" className="smooth hover:text-foreground">{l}</a>
          ))}
          <span className="opacity-30">·</span>
          <a href="https://t.me/suporte_orioncapital" target="_blank" rel="noreferrer" className="smooth hover:text-foreground">
            Suporte Telegram
          </a>
        </div>
        <p className="max-w-xl text-[11px] leading-relaxed text-muted-foreground/80">
          O OrionHub é uma ferramenta de apoio ao trader. Não constitui aconselhamento financeiro. Operações em ativos
          envolvem risco — resultados passados não garantem performance futura.
        </p>
        <div className="text-xs" style={{ color: "var(--text-dim)" }}>
          © {new Date().getFullYear()} OrionHub · Trading com inteligência
        </div>
      </div>
    </footer>
  );
}

// ─── Section header (compartilhado) ───────────────────────────────────────

function SectionHeader({ tag, title, sub }: { tag: string; title: string; sub?: string }) {
  return (
    <div className="mb-12 text-center">
      <div
        className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.3em]"
        style={{ color: "var(--electric)" }}
      >
        <span className="h-px w-6" style={{ background: "color-mix(in oklab, var(--electric) 40%, transparent)" }} />
        {tag}
        <span className="h-px w-6" style={{ background: "color-mix(in oklab, var(--electric) 40%, transparent)" }} />
      </div>
      <h2 className="text-[clamp(28px,4vw,48px)] font-black leading-tight tracking-tight">{title}</h2>
      {sub && (
        <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">{sub}</p>
      )}
    </div>
  );
}

// Re-export type for callers (compat with prior file)
export type { CSSProperties };
