import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  LineChart,
  BrainCircuit,
  ClipboardList,
  Calculator,
  Newspaper,
  Bitcoin,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Check,
  Crown,
  Activity,
  Menu,
  X,
  Star,
  Quote,
  Mic,
  Zap,
  Target,
  Cloud,
  type LucideIcon,
} from "lucide-react";
import { useUser, type User } from "@/lib/store";
import { useReveal } from "@/lib/useReveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OrionHub — Plataforma de Trading Inteligente com IA" },
      {
        name: "description",
        content:
          "OrionHub analisa gráficos de qualquer broker com IA em menos de 2 segundos. Mentor IA 24/7, planilha automática e calendário econômico. A plataforma do trader Gabriel Dutra — Orion Capital.",
      },
      { property: "og:title", content: "OrionHub — Trading Inteligente com IA" },
      {
        property: "og:description",
        content:
          "Análise de gráficos por IA em 2s, planilha automática, mentor IA 24/7 e radar cripto. A plataforma completa do trader Gabriel Dutra.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://orionmindhub.projetoskm0.workers.dev/" },
    ],
  }),
  component: LandingPage,
});

function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  );
}

function LandingPage() {
  const { user } = useUser();
  return (
    <div
      id="main-content"
      tabIndex={-1}
      className="min-h-screen overflow-x-hidden bg-background text-foreground outline-none"
    >
      <Nav user={user} />
      <Hero user={user} />
      <LogoMarquee />
      <Reveal>
        <ScanShowcase />
      </Reveal>
      <Reveal>
        <FeaturesBento />
      </Reveal>
      <Reveal>
        <StatsBand />
      </Reveal>
      <Reveal>
        <MentorSection />
      </Reveal>
      <Reveal>
        <HowSection />
      </Reveal>
      <Reveal>
        <TestimonialsSection />
      </Reveal>
      <Reveal>
        <PricingSection user={user} />
      </Reveal>
      <Reveal>
        <FaqSection />
      </Reveal>
      <Reveal>
        <CtaSection user={user} />
      </Reveal>
      <Footer />
    </div>
  );
}

// ─── Brand mark ─────────────────────────────────────────────────────────────

function Wordmark({ className = "text-lg" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-2 font-display font-bold tracking-tight ${className}`}
    >
      <span
        className="inline-flex h-7 w-7 items-center justify-center rounded-[9px]"
        style={{
          background: "linear-gradient(135deg, var(--accent), var(--electric))",
          boxShadow: "0 6px 18px -8px color-mix(in oklab, var(--accent) 70%, transparent)",
        }}
      >
        <Activity className="h-4 w-4 text-white" strokeWidth={2.5} />
      </span>
      Orion<span style={{ color: "var(--electric)" }}>Hub</span>
    </span>
  );
}

// ─── Nav ──────────────────────────────────────────────────────────────────

function Nav({ user }: { user: User | null }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const links: Array<[string, string]> = [
    ["#produto", "Produto"],
    ["#recursos", "Recursos"],
    ["#como", "Como funciona"],
    ["#planos", "Planos"],
    ["#faq", "FAQ"],
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className="fixed inset-x-0 top-0 z-50 fade-down"
      style={{
        background: scrolled
          ? "color-mix(in oklab, var(--background) 88%, transparent)"
          : "transparent",
        borderBottom: scrolled
          ? "1px solid color-mix(in oklab, var(--foreground) 8%, transparent)"
          : "1px solid transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        transition: "background .3s, border-color .3s, backdrop-filter .3s",
      }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 sm:px-6">
        <Link to="/" className="smooth hover:opacity-90">
          <Wordmark className="text-[19px]" />
        </Link>
        <div className="hidden items-center gap-1 md:flex">
          {links.map(([h, l]) => (
            <a
              key={h}
              href={h}
              className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground smooth hover:bg-[color:var(--surface-2)] hover:text-foreground"
            >
              {l}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {user ? (
            <Link
              to="/dashboard"
              viewTransition
              preload="intent"
              className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-sm font-semibold text-white smooth press hover:-translate-y-px"
              style={{ background: "var(--accent)" }}
            >
              Abrir app
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                viewTransition
                preload="intent"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground smooth hover:text-foreground sm:inline-flex"
              >
                Entrar
              </Link>
              <Link
                to="/signup"
                viewTransition
                preload="intent"
                className="hidden rounded-full px-5 py-2.5 text-sm font-semibold text-white smooth press hover:-translate-y-px sm:inline-flex"
                style={{
                  background: "var(--accent)",
                  boxShadow: "0 8px 24px -10px color-mix(in oklab, var(--accent) 70%, transparent)",
                }}
              >
                Começar
              </Link>
            </>
          )}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            className="flex h-10 w-10 items-center justify-center rounded-lg border text-foreground smooth md:hidden"
            style={{ borderColor: "var(--border-strong)", background: "var(--surface)" }}
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="mx-3 rounded-2xl border p-3 backdrop-blur-xl fade-down md:hidden"
          style={{
            background: "color-mix(in oklab, var(--surface) 97%, transparent)",
            borderColor: "var(--border-strong)",
            boxShadow: "0 30px 60px -24px rgba(0,0,0,.6)",
          }}
          onClick={() => setOpen(false)}
        >
          <div className="flex flex-col gap-0.5">
            {links.map(([h, l]) => (
              <a
                key={h}
                href={h}
                className="rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground smooth hover:bg-[color:var(--surface-2)] hover:text-foreground"
              >
                {l}
              </a>
            ))}
            <div
              className="mt-2 flex flex-col gap-2 border-t pt-3"
              style={{ borderColor: "var(--border)" }}
            >
              {user ? (
                <Link
                  to="/dashboard"
                  viewTransition
                  preload="intent"
                  className="rounded-full px-5 py-2.5 text-center text-sm font-semibold text-white"
                  style={{ background: "var(--accent)" }}
                >
                  Abrir app →
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
                    className="rounded-full px-5 py-2.5 text-center text-sm font-semibold text-white"
                    style={{ background: "var(--accent)" }}
                  >
                    Começar
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

// ─── Background atmosphere (shared, subtle) ─────────────────────────────────

function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Signature mesh glow at top */}
      <div
        className="absolute left-1/2 top-[-10%] h-[640px] w-[1100px] max-w-[140vw] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--accent) 22%, transparent), transparent 70%)",
          filter: "blur(8px)",
        }}
      />
      <div
        className="absolute right-[-8%] top-[18%] h-[420px] w-[420px]"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--electric) 16%, transparent), transparent 70%)",
        }}
      />
      {/* Faint grid, masked to fade out */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in oklab, var(--foreground) 4%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--foreground) 4%, transparent) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 90% 60% at 50% 25%, black 20%, transparent 80%)",
        }}
      />
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────

function Hero({ user }: { user: User | null }) {
  return (
    <section className="relative overflow-hidden px-5 pb-20 pt-28 sm:px-6 sm:pt-36">
      <HeroBackdrop />
      <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        {/* Copy column */}
        <div className="text-center lg:text-left">
          <div
            className="fade-down inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-medium"
            style={{
              background: "color-mix(in oklab, var(--accent) 8%, transparent)",
              borderColor: "color-mix(in oklab, var(--accent) 24%, transparent)",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full blink-dot"
              style={{ background: "var(--electric)" }}
            />
            <span className="text-muted-foreground">
              Metodologia <span className="font-semibold text-foreground">Gabriel Dutra</span> ·
              Orion Capital
            </span>
          </div>

          <h1
            className="fade-up mt-6 font-display text-[clamp(38px,5.6vw,68px)] font-bold leading-[1.04] tracking-[-0.02em]"
            style={{ animationDelay: "40ms" }}
          >
            Leia qualquer gráfico
            <br className="hidden sm:block" /> com <span className="gradient-text">IA</span> em{" "}
            <span className="font-mono tabular" style={{ color: "var(--electric)" }}>
              2s
            </span>
            .
          </h1>

          <p
            className="fade-up mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-muted-foreground sm:text-[17px] lg:mx-0"
            style={{ animationDelay: "100ms" }}
          >
            Envie o print de qualquer broker e receba direção, suporte/resistência e horário de
            entrada. Mais mentor IA 24/7, planilha automática e calendário econômico — num só lugar.
          </p>

          <div
            className="fade-up mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start"
            style={{ animationDelay: "160ms" }}
          >
            <Link
              to={user ? "/dashboard" : "/signup"}
              viewTransition
              preload="intent"
              className="group inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-[15px] font-semibold text-white smooth press hover:-translate-y-0.5"
              style={{
                background: "var(--accent)",
                boxShadow: "0 14px 40px -14px color-mix(in oklab, var(--accent) 75%, transparent)",
              }}
            >
              {user ? "Abrir app" : "Começar agora"}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#produto"
              className="inline-flex items-center gap-2 rounded-full border px-6 py-3.5 text-[15px] font-medium text-muted-foreground smooth hover:border-[color:var(--accent)] hover:text-foreground"
              style={{ borderColor: "var(--border-strong)" }}
            >
              Ver o produto
            </a>
          </div>

          <div
            className="fade-up mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-muted-foreground lg:justify-start"
            style={{ animationDelay: "220ms" }}
          >
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" style={{ color: "var(--green)" }} />
              Garantia de 7 dias
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" style={{ color: "var(--green)" }} />
              Pagamento único
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5" style={{ color: "var(--green)" }} />
              Funciona em qualquer broker
            </span>
          </div>
        </div>

        {/* Product column */}
        <div className="fade-up relative" style={{ animationDelay: "200ms" }}>
          <ProductPanel />
        </div>
      </div>
    </section>
  );
}

// Painel de produto: o OrionMind registrando uma operação (o "momento produto").
function ProductPanel() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      {/* glow base */}
      <div
        className="absolute -inset-6 -z-10"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--accent) 20%, transparent), transparent 75%)",
        }}
        aria-hidden
      />
      <div
        className="overflow-hidden rounded-2xl border"
        style={{
          background: "color-mix(in oklab, var(--surface) 94%, transparent)",
          borderColor: "var(--border-strong)",
          boxShadow: "0 40px 100px -32px rgba(0,0,0,.7)",
        }}
      >
        <div
          className="flex items-center gap-2 border-b px-4 py-3"
          style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
        >
          <BrainCircuit className="h-4 w-4" style={{ color: "var(--accent)" }} />
          <span className="font-mono text-[11px] text-muted-foreground">OrionMind</span>
          <span
            className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "var(--green)" }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full blink-dot"
              style={{ background: "var(--green)" }}
            />
            online
          </span>
        </div>

        <div className="space-y-3 p-4 sm:p-5">
          <ChatBubble who="user">Win em BTC, $50 de entrada, payout 86%, compra.</ChatBubble>
          <ChatBubble who="ai">
            Registrado. Você está com <strong className="text-foreground">4 wins seguidos</strong>{" "}
            hoje — mantenha a gestão.
          </ChatBubble>

          {/* Card de operação */}
          <div
            className="chat-in rounded-xl border p-3.5"
            style={{
              background:
                "linear-gradient(160deg, color-mix(in oklab, var(--green) 12%, var(--surface)), var(--surface))",
              borderColor: "color-mix(in oklab, var(--green) 34%, transparent)",
              animationDelay: "140ms",
            }}
          >
            <div className="mb-2.5 flex items-center justify-between">
              <span
                className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "var(--green)" }}
              >
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
                  className="rounded-lg border px-2 py-1.5 text-center"
                  style={{
                    background: "color-mix(in oklab, var(--surface-2) 70%, transparent)",
                    borderColor: "var(--border)",
                  }}
                >
                  <div className="text-[8px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {l}
                  </div>
                  <div className="mt-0.5 font-mono text-[12px] font-bold tabular">{v}</div>
                </div>
              ))}
            </div>
            <div
              className="mt-2.5 flex items-center justify-between rounded-lg border px-3 py-2"
              style={{
                background: "color-mix(in oklab, var(--green) 14%, transparent)",
                borderColor: "color-mix(in oklab, var(--green) 36%, transparent)",
              }}
            >
              <span
                className="text-[10px] font-bold uppercase tracking-widest"
                style={{ color: "var(--green)" }}
              >
                Win
              </span>
              <span
                className="font-mono text-base font-black tabular"
                style={{ color: "var(--green)" }}
              >
                +$43.00
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ who, children }: { who: "user" | "ai"; children: React.ReactNode }) {
  const isUser = who === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className="flex h-7 w-7 flex-none items-center justify-center rounded-lg text-[10px] font-bold"
        style={
          isUser
            ? { background: "var(--surface-2)", color: "var(--text-muted)" }
            : {
                background: "color-mix(in oklab, var(--accent) 14%, transparent)",
                color: "var(--accent)",
              }
        }
      >
        {isUser ? "EU" : <BrainCircuit className="h-3.5 w-3.5" strokeWidth={2} />}
      </div>
      <div
        className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-relaxed ${isUser ? "rounded-br-sm" : "rounded-bl-sm"}`}
        style={
          isUser
            ? {
                background: "color-mix(in oklab, var(--accent) 16%, transparent)",
                color: "var(--foreground)",
              }
            : { background: "var(--surface-2)", color: "var(--text-muted)" }
        }
      >
        {children}
      </div>
    </div>
  );
}

// ─── Logo marquee ───────────────────────────────────────────────────────────

function LogoMarquee() {
  const brokers = [
    "TradingView",
    "IQ Option",
    "Quotex",
    "MetaTrader 5",
    "Binance",
    "Bybit",
    "Pocket Option",
    "Olymp Trade",
    "Exnova",
    "Avalon",
  ];
  const loop = [...brokers, ...brokers];
  return (
    <section
      className="border-y py-7"
      style={{
        borderColor: "color-mix(in oklab, var(--foreground) 7%, transparent)",
        background: "color-mix(in oklab, var(--surface) 35%, transparent)",
      }}
    >
      <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
        Funciona com o gráfico de qualquer broker
      </p>
      <div className="marquee-container overflow-hidden">
        <div className="marquee-track whitespace-nowrap">
          {loop.map((b, i) => (
            <span
              key={`${b}-${i}`}
              className="font-display text-base font-semibold smooth"
              style={{ color: "color-mix(in oklab, var(--text-muted) 80%, transparent)" }}
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Scan showcase (flagship product moment) ────────────────────────────────

function ScanShowcase() {
  return (
    <section id="produto" className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="order-2 lg:order-1">
          <Eyebrow>OrionScan</Eyebrow>
          <h2 className="mt-4 font-display text-[clamp(26px,3.4vw,42px)] font-bold leading-[1.08] tracking-tight">
            Do print ao sinal,
            <br className="hidden sm:block" /> em menos de 2 segundos.
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            A IA lê o gráfico visualmente — identifica tendência, zonas de suporte e resistência,
            padrões de candle e calcula o horário de entrada com as duas proteções da gestão Orion.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Direção + nível de confiança",
              "Suporte, resistência e padrões marcados",
              "Entrada e proteções no horário certo",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3 text-[15px]">
                <span
                  className="flex h-5 w-5 flex-none items-center justify-center rounded-full"
                  style={{
                    background: "color-mix(in oklab, var(--green) 18%, transparent)",
                    color: "var(--green)",
                  }}
                >
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {t}
              </li>
            ))}
          </ul>
          <Link
            to="/signup"
            viewTransition
            preload="intent"
            className="group mt-8 inline-flex items-center gap-2 text-[15px] font-semibold smooth"
            style={{ color: "var(--electric)" }}
          >
            Analisar meu primeiro gráfico
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="order-1 lg:order-2">
          <ScanMockup />
        </div>
      </div>
    </section>
  );
}

function ScanMockup() {
  return (
    <div
      className="overflow-hidden rounded-2xl border"
      style={{
        background: "var(--surface)",
        borderColor: "var(--border-strong)",
        boxShadow: "0 40px 100px -36px rgba(0,0,0,.65)",
      }}
    >
      <div
        className="flex items-center gap-2 border-b px-4 py-3"
        style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
      >
        <LineChart className="h-4 w-4" style={{ color: "var(--accent)" }} />
        <span className="font-mono text-[11px] text-muted-foreground">BTC/USD · M5</span>
        <span
          className="ml-auto inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
          style={{
            background: "color-mix(in oklab, var(--accent) 16%, transparent)",
            color: "var(--accent)",
          }}
        >
          IA
        </span>
      </div>
      <div className="grid gap-3 p-4 sm:grid-cols-[1fr_180px] sm:p-5">
        <div
          className="relative overflow-hidden rounded-xl border"
          style={{ background: "var(--surface-2)", borderColor: "var(--border)", minHeight: 180 }}
        >
          <CandleChart />
        </div>
        <div className="space-y-2.5">
          <div
            className="rounded-xl border p-3"
            style={{
              background: "color-mix(in oklab, var(--green) 10%, transparent)",
              borderColor: "color-mix(in oklab, var(--green) 30%, transparent)",
            }}
          >
            <div className="flex items-center justify-between">
              <span
                className="rounded-full px-2 py-0.5 text-[10px] font-extrabold"
                style={{
                  background: "color-mix(in oklab, var(--green) 22%, transparent)",
                  color: "var(--green)",
                }}
              >
                ▲ CALL
              </span>
              <span
                className="font-mono text-sm font-extrabold"
                style={{ color: "var(--electric)" }}
              >
                87%
              </span>
            </div>
          </div>
          {[
            ["Tendência", "Alta", "var(--green)"],
            ["Suporte", "63.180", "var(--gold)"],
            ["Resistência", "63.580", "var(--gold)"],
            ["Entrada", "14:35", "var(--foreground)"],
          ].map(([l, v, c]) => (
            <div
              key={l}
              className="flex items-center justify-between rounded-lg border px-2.5 py-1.5"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
            >
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {l}
              </span>
              <span
                className="font-mono text-[12px] font-bold tabular"
                style={{ color: c as string }}
              >
                {v}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CandleChart() {
  const candles = Array.from({ length: 22 }).map((_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const r1 = (seed % 100) / 100;
    const r2 = ((seed * 7) % 100) / 100;
    const trend = i * 1.1;
    const mid = 132 - trend + (r1 - 0.5) * 18;
    const open = mid - 7 + (r2 - 0.5) * 6;
    const close = mid + 7 + (r1 - 0.5) * 6;
    const isGreen = close < open;
    return {
      x: 12 + i * 15,
      open,
      close,
      high: Math.min(open, close) - 7,
      low: Math.max(open, close) + 7,
      isGreen,
    };
  });
  return (
    <svg viewBox="0 0 350 180" className="h-full w-full" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="cg-up" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.72 0.15 155)" />
          <stop offset="100%" stopColor="oklch(0.55 0.18 155)" />
        </linearGradient>
        <linearGradient id="cg-dn" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.7 0.18 22)" />
          <stop offset="100%" stopColor="oklch(0.5 0.2 22)" />
        </linearGradient>
      </defs>
      {[45, 90, 135].map((y) => (
        <line key={y} x1="0" y1={y} x2="350" y2={y} stroke="currentColor" strokeOpacity="0.06" />
      ))}
      <line
        x1="0"
        y1="52"
        x2="350"
        y2="52"
        stroke="oklch(0.78 0.13 80)"
        strokeOpacity="0.45"
        strokeDasharray="4 4"
      />
      <line
        x1="0"
        y1="128"
        x2="350"
        y2="128"
        stroke="oklch(0.78 0.13 80)"
        strokeOpacity="0.45"
        strokeDasharray="4 4"
      />
      {candles.map((c, i) => (
        <g key={i}>
          <line
            x1={c.x + 5}
            y1={c.high}
            x2={c.x + 5}
            y2={c.low}
            stroke={c.isGreen ? "url(#cg-up)" : "url(#cg-dn)"}
            strokeWidth="1.2"
          />
          <rect
            x={c.x}
            y={Math.min(c.open, c.close)}
            width="10"
            height={Math.max(2, Math.abs(c.close - c.open))}
            fill={c.isGreen ? "url(#cg-up)" : "url(#cg-dn)"}
            rx="1"
          />
        </g>
      ))}
      <circle cx="326" cy="58" r="5" fill="oklch(0.72 0.13 235)" opacity="0.35">
        <animate attributeName="r" values="5;9;5" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <circle cx="326" cy="58" r="2.5" fill="oklch(0.72 0.13 235)" />
    </svg>
  );
}

// ─── Features bento ─────────────────────────────────────────────────────────

function FeaturesBento() {
  return (
    <section id="recursos" className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28">
      <div className="mb-12 text-center">
        <Eyebrow center>Plataforma completa</Eyebrow>
        <h2 className="mx-auto mt-4 max-w-2xl font-display text-[clamp(26px,3.4vw,42px)] font-bold leading-[1.1] tracking-tight">
          Seis ferramentas integradas. Uma assinatura.
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <BentoCard
          Icon={LineChart}
          tone="var(--accent)"
          title="OrionScan"
          desc="IA visual analisa qualquer gráfico em menos de 2 segundos: padrões, S/R, entrada e proteções."
          tags={["Vision IA", "Qualquer broker"]}
          className="md:col-span-2"
        />
        <BentoCard
          Icon={Calculator}
          tone="var(--gold)"
          title="Calculadora"
          desc="Gestão padrão Orion: 1% por entrada, 2 proteções, stop diário."
          tags={["Banca", "Martingale"]}
        />
        <BentoCard
          Icon={ClipboardList}
          tone="var(--green)"
          title="Planilha & Relatórios"
          desc="Win-rate, lucro, melhor ativo e drawdown — em tempo real, com exportação em PDF."
          tags={["PDF", "Cloud sync"]}
        />
        <BentoCard
          Icon={BrainCircuit}
          tone="var(--electric)"
          title="OrionMind — Mentor IA"
          desc="Conversa sobre estratégia, gestão e psicologia. Registra operações por voz e gera relatórios."
          tags={["Voz", "Cards visuais", "Memória"]}
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
          desc="Radar visual do mercado cripto, integrado."
          tags={["Live"]}
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
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className={`bento-glow group relative overflow-hidden rounded-2xl border p-6 smooth hover:-translate-y-0.5 ${className}`}
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
        style={{
          background: `color-mix(in oklab, ${tone} 12%, transparent)`,
          border: `1px solid color-mix(in oklab, ${tone} 24%, transparent)`,
          color: tone,
        }}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </div>
      <h3 className="font-display text-lg font-bold tracking-tight">{title}</h3>
      <p className="mt-1.5 text-[14px] leading-relaxed text-muted-foreground">{desc}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <span
            key={t}
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
            style={{
              background: `color-mix(in oklab, ${tone} 8%, transparent)`,
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

// ─── Stats band (numbers-forward) ───────────────────────────────────────────

function StatsBand() {
  return (
    <section className="mx-auto max-w-6xl px-5 py-12 sm:px-6">
      <div
        className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border sm:grid-cols-4"
        style={{ borderColor: "var(--border)", background: "var(--border)" }}
      >
        <AnimatedStat value={92} suffix="%" label="Precisão da IA" hint="em backtests internos" />
        <AnimatedStat
          value={2}
          prefix="<"
          suffix="s"
          label="Por análise"
          hint="do print ao sinal"
        />
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
            const dur = 900;
            const start = performance.now();
            const tick = (t: number) => {
              const p = Math.min(1, (t - start) / dur);
              setShown(Math.round(value * (1 - Math.pow(1 - p, 3))));
              if (p < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        }
      },
      { threshold: 0.4 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);
  return (
    <div ref={ref} className="p-6 text-center sm:p-7" style={{ background: "var(--surface)" }}>
      <div
        className="font-display text-[clamp(30px,4.5vw,46px)] font-black leading-none tracking-tight"
        style={{ color: "var(--electric)" }}
      >
        {prefix}
        {shown}
        {suffix}
      </div>
      <div className="mt-2 text-sm font-semibold">{label}</div>
      <div className="text-[11px] text-muted-foreground">{hint}</div>
    </div>
  );
}

// ─── Mentor ───────────────────────────────────────────────────────────────

function MentorSection() {
  return (
    <section className="mx-auto max-w-5xl px-5 py-20 sm:px-6 sm:py-28">
      <div
        className="grid items-center gap-8 rounded-3xl border p-7 sm:p-10 md:grid-cols-[auto_1fr] md:gap-10"
        style={{
          background:
            "linear-gradient(150deg, color-mix(in oklab, var(--accent) 7%, var(--surface)), var(--surface))",
          borderColor: "var(--border-strong)",
        }}
      >
        <div className="flex flex-col items-center text-center md:items-start md:text-left">
          <div
            className="flex h-28 w-28 items-center justify-center rounded-3xl"
            style={{
              background:
                "linear-gradient(150deg, color-mix(in oklab, var(--accent) 20%, var(--surface)), color-mix(in oklab, var(--electric) 12%, var(--surface)))",
              border: "1px solid color-mix(in oklab, var(--accent) 38%, transparent)",
              boxShadow: "0 24px 60px -24px color-mix(in oklab, var(--accent) 50%, transparent)",
            }}
          >
            <span className="font-display text-4xl font-black gradient-text">GD</span>
          </div>
          <div className="mt-3">
            <div className="font-display text-base font-bold">Gabriel Dutra</div>
            <div className="text-xs text-muted-foreground">Trader oficial · Orion Capital</div>
          </div>
        </div>
        <div>
          <Eyebrow>O mentor por trás</Eyebrow>
          <blockquote className="mt-4 font-display text-[clamp(19px,2.4vw,28px)] font-semibold leading-snug tracking-tight">
            “O OrionHub é a tradução prática do método que ensino na Orion Capital — agora com IA
            pra acelerar a leitura do gráfico e a gestão da banca.”
          </blockquote>
          <p className="mt-4 text-[14px] leading-relaxed text-muted-foreground">
            Cada regra, indicador e fluxo da plataforma traduz a metodologia de price action, gestão
            profissional de banca e disciplina que o Gabriel ensina aos alunos diariamente.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── How ──────────────────────────────────────────────────────────────────

function HowSection() {
  const steps = [
    ["01", "Adquira seu acesso", "Pagamento único, 12 meses, garantia de 7 dias."],
    ["02", "Carregue o gráfico", "Print, arrastar ou Ctrl+V. Qualquer broker."],
    ["03", "A IA analisa", "Padrões, contexto e horário — em segundos."],
    ["04", "Opere com clareza", "Sinal, proteções e gestão recomendada."],
  ];
  return (
    <section id="como" className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28">
      <div className="mb-12 text-center">
        <Eyebrow center>Como funciona</Eyebrow>
        <h2 className="mt-4 font-display text-[clamp(26px,3.4vw,42px)] font-bold tracking-tight">
          Da imagem ao sinal em 4 passos
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map(([n, t, d], i) => (
          <div
            key={n}
            className="relative rounded-2xl border p-6 smooth hover:-translate-y-0.5"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <div
              className="font-display text-3xl font-black tabular"
              style={{ color: "color-mix(in oklab, var(--electric) 55%, transparent)" }}
            >
              {n}
            </div>
            <div className="mt-3 text-[15px] font-bold">{t}</div>
            <div className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{d}</div>
            {i < steps.length - 1 && (
              <ArrowRight
                className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 lg:block"
                style={{ color: "var(--border-strong)" }}
                aria-hidden
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── Testimonials ───────────────────────────────────────────────────────────

function TestimonialsSection() {
  const items = [
    {
      name: "Rafael M.",
      role: "Trader · Forex",
      quote:
        "Colo o print no OrionScan e em 2s tenho o setup pronto. Parei de perder tempo abrindo 3 plataformas pra checar suporte e resistência.",
    },
    {
      name: "Camila S.",
      role: "Iniciante · Opções",
      quote:
        "O OrionMind me explica os erros da semana e o que ajustar. É como ter um mentor à disposição 24h sem julgamento.",
    },
    {
      name: "João P.",
      role: "Trader · Cripto",
      quote:
        "A planilha automática e os relatórios mensais me deram uma clareza que eu nunca tive operando sozinho.",
    },
  ];
  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28">
      <div className="mb-12 text-center">
        <Eyebrow center>Quem usa</Eyebrow>
        <h2 className="mt-4 font-display text-[clamp(26px,3.4vw,42px)] font-bold tracking-tight">
          Traders operando com mais clareza
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {items.map((it) => (
          <figure
            key={it.name}
            className="relative flex flex-col rounded-2xl border p-6 smooth hover:-translate-y-0.5"
            style={{ background: "var(--surface)", borderColor: "var(--border)" }}
          >
            <Quote
              className="absolute right-5 top-5 h-7 w-7 opacity-[0.08]"
              style={{ color: "var(--accent)" }}
            />
            <div className="mb-3 flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className="h-3.5 w-3.5"
                  style={{ color: "var(--gold)", fill: "var(--gold)" }}
                />
              ))}
            </div>
            <blockquote className="flex-1 text-[14px] leading-relaxed text-muted-foreground">
              “{it.quote}”
            </blockquote>
            <figcaption
              className="mt-5 flex items-center gap-3 border-t pt-4"
              style={{ borderColor: "var(--border)" }}
            >
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full font-display text-xs font-black"
                style={{
                  background: "color-mix(in oklab, var(--accent) 14%, transparent)",
                  color: "var(--accent)",
                }}
              >
                {it.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")}
              </span>
              <span>
                <span className="block text-sm font-bold">{it.name}</span>
                <span className="block text-[11px] text-muted-foreground">{it.role}</span>
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}

// ─── Pricing (corrigido) ─────────────────────────────────────────────────────

function PricingSection({ user }: { user: User | null }) {
  const features = [
    { label: "Análises com OrionScan", trial: "5 totais", anual: "Ilimitadas" },
    { label: "OrionMind (mentor IA)", trial: "Limitado", anual: "Ilimitado" },
    { label: "Planilha + relatórios PDF", trial: "Básico", anual: "Completo" },
    { label: "Calculadora de banca", trial: true, anual: true },
    { label: "Notícias & Calendário", trial: false, anual: true },
    { label: "CryptoBubbles", trial: false, anual: true },
    { label: "Voz no OrionMind", trial: false, anual: true },
    { label: "Suporte prioritário", trial: false, anual: true },
  ];
  return (
    <section id="planos" className="mx-auto max-w-6xl px-5 py-20 sm:px-6 sm:py-28">
      <div className="mb-12 text-center">
        <Eyebrow center>Acesso anual</Eyebrow>
        <h2 className="mt-4 font-display text-[clamp(26px,3.4vw,42px)] font-bold tracking-tight">
          Um pagamento. 12 meses completos.
        </h2>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          Sem mensalidade, sem renovação automática. Garantia de 7 dias com devolução total.
        </p>
      </div>

      <div className="grid items-stretch gap-5 lg:grid-cols-[1fr_1.15fr]">
        {/* Price card */}
        <div
          className="relative flex flex-col rounded-3xl border p-8"
          style={{
            background:
              "linear-gradient(160deg, color-mix(in oklab, var(--accent) 10%, var(--surface)), var(--surface))",
            borderColor: "color-mix(in oklab, var(--accent) 38%, transparent)",
            boxShadow: "0 40px 90px -36px color-mix(in oklab, var(--accent) 50%, transparent)",
          }}
        >
          <div
            className="inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white"
            style={{ background: "var(--accent)" }}
          >
            <Crown className="h-3 w-3" /> Acesso Anual
          </div>

          {/* Preço: parcelado em destaque, à vista como referência */}
          <div className="mt-6">
            <div className="flex items-baseline gap-1.5">
              <span className="font-display text-2xl font-bold text-muted-foreground">12×</span>
              <span className="font-display text-6xl font-black tracking-tight gradient-text">
                R$&nbsp;208
              </span>
            </div>
            <div className="mt-2 text-sm text-muted-foreground">
              no cartão · ou <span className="font-semibold text-foreground">R$ 2.500</span> à vista
            </div>
          </div>

          <Link
            to={user ? "/dashboard" : "/signup"}
            viewTransition
            preload="intent"
            className="group mt-7 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-[15px] font-semibold text-white smooth press hover:-translate-y-0.5"
            style={{
              background: "var(--accent)",
              boxShadow: "0 16px 44px -16px color-mix(in oklab, var(--accent) 80%, transparent)",
            }}
          >
            {user ? "Abrir app" : "Garantir meu acesso"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <div className="mt-6 space-y-3 border-t pt-6" style={{ borderColor: "var(--border)" }}>
            {[
              [ShieldCheck, "Garantia de 7 dias", "Devolução de 100% do valor"],
              [Zap, "Acesso imediato", "Liberado em poucos minutos"],
              [Target, "Pagamento único", "Sem renovação automática"],
            ].map(([Icon, label, desc]) => {
              const I = Icon as LucideIcon;
              return (
                <div key={label as string} className="flex items-center gap-3">
                  <span
                    className="flex h-8 w-8 flex-none items-center justify-center rounded-lg"
                    style={{
                      background: "color-mix(in oklab, var(--green) 14%, transparent)",
                      color: "var(--green)",
                    }}
                  >
                    <I className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <span>
                    <span className="block text-[13px] font-semibold">{label as string}</span>
                    <span className="block text-[11px] text-muted-foreground">
                      {desc as string}
                    </span>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature matrix */}
        <div
          className="overflow-hidden rounded-3xl border"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <div
            className="grid grid-cols-[1fr_72px_72px] items-center gap-2 border-b px-5 py-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground sm:grid-cols-[1fr_110px_110px]"
            style={{ borderColor: "var(--border)" }}
          >
            <span>Recurso</span>
            <span className="text-center">Trial</span>
            <span className="text-center" style={{ color: "var(--accent)" }}>
              Anual
            </span>
          </div>
          {features.map((f) => (
            <div
              key={f.label}
              className="grid grid-cols-[1fr_72px_72px] items-center gap-2 border-b px-5 py-3 text-sm transition-colors last:border-b-0 hover:bg-[color:var(--surface-2)] sm:grid-cols-[1fr_110px_110px]"
              style={{ borderColor: "var(--border)" }}
            >
              <span className="min-w-0 font-medium">{f.label}</span>
              <span className="text-center text-[12px] text-muted-foreground">
                {typeof f.trial === "boolean" ? (
                  f.trial ? (
                    <Check className="mx-auto h-4 w-4" style={{ color: "var(--text-muted)" }} />
                  ) : (
                    <span style={{ color: "var(--text-dim)" }}>—</span>
                  )
                ) : (
                  f.trial
                )}
              </span>
              <span
                className="text-center text-[12px] font-semibold"
                style={{ color: "var(--accent)" }}
              >
                {typeof f.anual === "boolean" ? (
                  f.anual ? (
                    <Check className="mx-auto h-4 w-4" />
                  ) : (
                    "—"
                  )
                ) : (
                  f.anual
                )}
              </span>
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
    [
      "A IA funciona com qualquer broker?",
      "Sim. A análise é feita visualmente sobre a imagem do gráfico — basta um print de qualquer plataforma (IQ Option, Quotex, MT5, TradingView, etc).",
    ],
    [
      "Funciona em opções binárias e forex?",
      "Sim. A análise é sobre o gráfico, então funciona para qualquer ativo: forex, índices, ações, cripto e commodities.",
    ],
    [
      "Vocês garantem lucros?",
      "Não. Nenhuma ferramenta séria garante lucros em trading. O OrionHub é um copiloto que entrega análise objetiva — a decisão e o gerenciamento são sempre seus.",
    ],
    [
      "Tenho garantia se não gostar?",
      "Sim. Você tem 7 dias após a compra como garantia de devolução. Se não gostou, devolvemos 100% do valor, sem perguntas.",
    ],
    [
      "O acesso renova automaticamente?",
      "Não. É um pagamento único que libera 12 meses de acesso completo. Você decide se quer renovar depois desse período.",
    ],
    [
      "Posso usar no celular?",
      "Sim. O OrionHub é totalmente responsivo: suba prints da galeria, converse com o mentor por voz e veja os relatórios no mobile.",
    ],
    [
      "Quem é Gabriel Dutra?",
      "Trader oficial e mentor da Orion Capital. Toda a metodologia embarcada no OrionHub (price action, gestão padrão Orion, regras de proteção) vem do que ele ensina aos alunos.",
    ],
    [
      "Como recebo o acesso após o pagamento?",
      "Em poucos minutos após a confirmação, liberamos o acesso no e-mail cadastrado. Em horário comercial, geralmente em até 30 minutos.",
    ],
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-5 py-20 sm:px-6 sm:py-28">
      <div className="mb-10 text-center">
        <Eyebrow center>FAQ</Eyebrow>
        <h2 className="mt-4 font-display text-[clamp(26px,3.4vw,42px)] font-bold tracking-tight">
          Perguntas frequentes
        </h2>
      </div>
      <div
        className="overflow-hidden rounded-2xl border"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        {items.map(([q, a], i) => {
          const active = open === i;
          return (
            <div
              key={q}
              className="border-b last:border-b-0"
              style={{ borderColor: "var(--border)" }}
            >
              <button
                onClick={() => setOpen(active ? null : i)}
                aria-expanded={active}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-semibold smooth hover:text-[color:var(--electric)]"
              >
                <span>{q}</span>
                <span
                  className="flex h-6 w-6 flex-none items-center justify-center rounded-full border text-base smooth"
                  style={{
                    borderColor: active
                      ? "color-mix(in oklab, var(--electric) 40%, transparent)"
                      : "var(--border-strong)",
                    background: active
                      ? "color-mix(in oklab, var(--electric) 12%, transparent)"
                      : "transparent",
                    color: active ? "var(--electric)" : "var(--text-muted)",
                    transform: active ? "rotate(45deg)" : "none",
                  }}
                >
                  +
                </span>
              </button>
              {active && (
                <div className="faq-open px-5 pb-4 text-[14px] leading-relaxed text-muted-foreground">
                  {a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ─── CTA ──────────────────────────────────────────────────────────────────

function CtaSection({ user }: { user: User | null }) {
  return (
    <section className="px-5 pb-24 pt-4 sm:px-6">
      <div
        className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border px-6 py-16 text-center sm:py-20"
        style={{
          background:
            "linear-gradient(160deg, color-mix(in oklab, var(--accent) 14%, var(--surface)), var(--surface))",
          borderColor: "color-mix(in oklab, var(--accent) 30%, transparent)",
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(color-mix(in oklab, var(--foreground) 5%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--foreground) 5%, transparent) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          }}
          aria-hidden
        />
        <div className="relative z-10">
          <div
            className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium"
            style={{
              background: "color-mix(in oklab, var(--green) 10%, transparent)",
              borderColor: "color-mix(in oklab, var(--green) 26%, transparent)",
              color: "var(--green)",
            }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full blink-dot"
              style={{ background: "var(--green)" }}
            />
            Garantia de 7 dias · 100% do valor
          </div>
          <h2 className="mx-auto mt-6 max-w-2xl font-display text-[clamp(28px,4.5vw,56px)] font-bold leading-[1.04] tracking-tight">
            Comece a operar com <span className="gradient-text">clareza</span> hoje.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
            12× de R$ 208 no cartão, ou R$ 2.500 à vista. Sem mensalidade, sem renovação.
          </p>
          <Link
            to={user ? "/dashboard" : "/signup"}
            viewTransition
            preload="intent"
            className="group mt-8 inline-flex items-center gap-2 rounded-full px-9 py-4 text-[15px] font-semibold text-white smooth press hover:-translate-y-0.5"
            style={{
              background: "var(--accent)",
              boxShadow: "0 18px 50px -16px color-mix(in oklab, var(--accent) 80%, transparent)",
            }}
          >
            {user ? "Abrir app" : "Quero meu acesso"}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Cloud className="h-3.5 w-3.5" /> Sincroniza entre dispositivos
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Mic className="h-3.5 w-3.5" /> Registro por voz
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer
      className="border-t px-5 py-12 sm:px-6"
      style={{
        borderColor: "var(--border)",
        background: "color-mix(in oklab, var(--surface) 30%, transparent)",
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-5 text-center">
        <Link to="/" className="smooth hover:opacity-90">
          <Wordmark className="text-[20px]" />
        </Link>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[13px] text-muted-foreground">
          <a href="#" className="smooth hover:text-foreground">
            Termos
          </a>
          <a href="#" className="smooth hover:text-foreground">
            Privacidade
          </a>
          <a
            href="https://t.me/suporte_orioncapital"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 smooth hover:text-foreground"
          >
            Suporte <ArrowUpRight className="h-3 w-3" />
          </a>
        </div>
        <p className="max-w-xl text-[11px] leading-relaxed text-muted-foreground/80">
          O OrionHub é uma ferramenta de apoio ao trader. Não constitui aconselhamento financeiro.
          Operações em ativos envolvem risco — resultados passados não garantem performance futura.
        </p>
        <div className="text-xs" style={{ color: "var(--text-dim)" }}>
          © {new Date().getFullYear()} OrionHub · Trading com inteligência
        </div>
      </div>
    </footer>
  );
}

// ─── Shared eyebrow ─────────────────────────────────────────────────────────

function Eyebrow({ children, center = false }: { children: React.ReactNode; center?: boolean }) {
  return (
    <div
      className={`inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] ${center ? "" : ""}`}
      style={{ color: "var(--electric)" }}
    >
      <span className="h-1 w-1 rounded-full" style={{ background: "var(--electric)" }} />
      {children}
    </div>
  );
}
