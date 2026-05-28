import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  Check,
  X,
  Crown,
  BrainCircuit,
  LineChart,
  Newspaper,
  Bitcoin,
  Calculator,
  ClipboardList,
  Infinity as InfinityIcon,
  ShieldCheck,
  Zap,
  Gem,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useReveal } from "@/lib/useReveal";

export const Route = createFileRoute("/ofertalancamento")({
  head: () => ({
    meta: [
      { title: "Oferta de Lançamento — OrionHub" },
      {
        name: "description",
        content:
          "Acesso anual ao OrionHub: OrionScan IA, OrionMind, calendário econômico, CryptoBubbles e mais. Preço de lançamento.",
      },
      { property: "og:title", content: "OrionHub — Oferta de Lançamento" },
      {
        property: "og:description",
        content:
          "Garanta 12 meses de acesso completo à plataforma de trading com IA do mentor Gabriel Dutra.",
      },
      { property: "og:type", content: "website" },
    ],
  }),
  component: OfertaPage,
});

const TELEGRAM_URL = "https://t.me/suporte_orioncapital";
const OFFER_DEADLINE_KEY = "orion.offer.deadline";
const OFFER_DURATION_MS = 1000 * 60 * 60 * 24 * 3; // 3 days

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function OfertaPage() {
  return (
    <div
      className="min-h-dvh"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      <BgFx />
      <ExpiringBar />
      <Hero />
      <Reveal>
        <Compare />
      </Reveal>
      <Reveal>
        <Modules />
      </Reveal>
      <Reveal>
        <Mentor />
      </Reveal>
      <Reveal>
        <Pricing />
      </Reveal>
      <Reveal>
        <Faq />
      </Reveal>
      <Reveal>
        <FinalCta />
      </Reveal>
      <Footer />
    </div>
  );
}

function BgFx() {
  return (
    <div className="bg-fx" aria-hidden>
      <div className="aurora" />
      <div className="orb a" />
      <div className="orb b" />
      <div className="grid" />
    </div>
  );
}

function ExpiringBar() {
  const targetRef = useRef<number | null>(null);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(OFFER_DEADLINE_KEY);
      const target = saved ? Number(saved) : Date.now() + OFFER_DURATION_MS;
      if (!saved || Number.isNaN(target)) {
        window.localStorage.setItem(OFFER_DEADLINE_KEY, String(target));
      }
      targetRef.current = target;
    } else {
      targetRef.current = Date.now() + OFFER_DURATION_MS;
    }
    setNow(Date.now());
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const diff = now && targetRef.current ? Math.max(0, targetRef.current - now) : OFFER_DURATION_MS;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    <div
      className="sticky top-0 z-30 w-full border-b backdrop-blur"
      style={{
        background:
          "linear-gradient(90deg, color-mix(in oklab, var(--accent) 22%, var(--background)), color-mix(in oklab, var(--electric) 22%, var(--background)))",
        borderColor: "color-mix(in oklab, var(--accent) 35%, transparent)",
      }}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-3 px-4 py-2.5 text-center text-xs md:text-sm">
        <Zap className="h-4 w-4" style={{ color: "var(--electric)" }} />
        <span className="font-semibold uppercase tracking-wider">
          Oferta de lançamento expira em
        </span>
        <span
          className="tabular font-display text-base font-black md:text-lg"
          style={{ color: "var(--accent)" }}
        >
          {pad(d)}d : {pad(h)}h : {pad(m)}m : {pad(s)}s
        </span>
        <span className="hidden text-muted-foreground md:inline">· vagas limitadas</span>
      </div>
    </div>
  );
}

function Countdown() {
  const targetRef = useRef<number | null>(null);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem(OFFER_DEADLINE_KEY);
      const target = saved ? Number(saved) : Date.now() + OFFER_DURATION_MS;
      if (!saved || Number.isNaN(target)) {
        window.localStorage.setItem(OFFER_DEADLINE_KEY, String(target));
      }
      targetRef.current = target;
    } else {
      targetRef.current = Date.now() + OFFER_DURATION_MS;
    }
    setNow(Date.now());
    const i = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);
  const diff = now && targetRef.current ? Math.max(0, targetRef.current - now) : OFFER_DURATION_MS;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  const cell = (n: number, label: string) => (
    <div
      className="rounded-xl border px-3 py-2 text-center tabular"
      style={{ background: "var(--surface)", borderColor: "var(--border-strong)" }}
    >
      <div className="font-display text-xl font-black">{String(n).padStart(2, "0")}</div>
      <div className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
    </div>
  );
  return (
    <div className="flex items-center gap-2">
      {cell(d, "dias")}
      {cell(h, "h")}
      {cell(m, "min")}
      {cell(s, "seg")}
    </div>
  );
}

function Hero() {
  return (
    <section className="relative z-10 px-6 pt-10 pb-14 md:px-12 md:pt-16 md:pb-20">
      <div className="mx-auto max-w-5xl text-center">
        <div
          className="mb-5 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest fade-down"
          style={{
            background: "color-mix(in oklab, var(--electric) 10%, transparent)",
            borderColor: "color-mix(in oklab, var(--electric) 30%, transparent)",
            color: "var(--electric)",
          }}
        >
          <Sparkles className="h-3 w-3" /> Lote de Lançamento · Vagas limitadas
        </div>
        <h1 className="font-display text-4xl font-black leading-[1.05] tracking-tight md:text-6xl fade-up">
          A plataforma de <span className="gradient-text">trading inteligente</span>
          <br className="hidden md:block" />
          do mentor <span style={{ color: "var(--electric)" }}>Gabriel Dutra</span>
        </h1>
        <p
          className="mx-auto mt-5 max-w-2xl text-base text-muted-foreground md:text-lg fade-up"
          style={{ animationDelay: ".15s" }}
        >
          Pare de operar no escuro. O OrionHub junta{" "}
          <strong className="text-foreground">análise gráfica com IA</strong>,
          <strong className="text-foreground"> mentor virtual 24/7</strong>, calendário econômico em
          tempo real e radar cripto — tudo numa única plataforma criada com a metodologia do Gabriel
          Dutra para você
          <strong className="text-foreground">
            {" "}
            entrar melhor, sair melhor e gerir sua banca com disciplina
          </strong>
          .
        </p>
        <p
          className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground fade-up"
          style={{ animationDelay: ".2s" }}
        >
          Pagamento único · 12 meses de acesso completo · Garantia de 7 dias.
        </p>
        <div
          className="mt-7 flex flex-col items-center gap-4 fade-up"
          style={{ animationDelay: ".25s" }}
        >
          <Countdown />
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 rounded-full px-7 py-4 text-sm font-bold smooth press hover:-translate-y-0.5 pulse-glow"
            style={{
              background: "var(--gradient-primary)",
              color: "var(--accent-foreground)",
              boxShadow: "0 20px 60px -20px color-mix(in oklab, var(--accent) 60%, transparent)",
            }}
          >
            Garantir meu acesso anual
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </a>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Você será redirecionado ao Telegram oficial
          </div>
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Pagamento único · Sem renovação automática · Suporte humano
          </div>
        </div>
      </div>
    </section>
  );
}

const COMPARE_ROWS: Array<{ label: string; free: boolean | string; pro: boolean | string }> = [
  { label: "Análises de gráfico (OrionScan IA)", free: false, pro: "Ilimitadas" },
  { label: "Mentor IA OrionMind", free: false, pro: "Sem restrição" },
  { label: "Histórico de scans com thumbnail", free: false, pro: true },
  { label: "Calendário econômico (Notícias)", free: false, pro: true },
  { label: "Radar CryptoBubbles", free: false, pro: true },
  { label: "Calculadora de banca avançada", free: false, pro: true },
  { label: "Gestão de trades & métricas", free: false, pro: "Completo + export" },
  { label: "Prioridade no processamento", free: false, pro: true },
  { label: "Acesso antecipado a novidades", free: false, pro: true },
  { label: "Suporte prioritário", free: false, pro: true },
];

function Cell({ v }: { v: boolean | string }) {
  if (typeof v === "string") return <span className="text-sm font-medium">{v}</span>;
  return v ? (
    <Check className="h-5 w-5" style={{ color: "var(--green)" }} />
  ) : (
    <X className="h-5 w-5 text-muted-foreground opacity-50" />
  );
}

function Compare() {
  return (
    <section className="relative z-10 px-6 py-16 md:px-12">
      <div className="mx-auto max-w-5xl">
        <h2 className="text-center font-display text-3xl font-black tracking-tight md:text-4xl">
          Sem acesso vs <span className="gradient-text">PRO Anual</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground">
          Compare lado a lado o que você desbloqueia ao adquirir o OrionHub completo.
        </p>
        <div
          className="mt-8 overflow-hidden rounded-3xl border"
          style={{ background: "var(--surface)", borderColor: "var(--border-strong)" }}
        >
          <div
            className="grid grid-cols-12 border-b px-5 py-4 text-[11px] font-bold uppercase tracking-wider"
            style={{ borderColor: "var(--border)" }}
          >
            <div className="col-span-6 text-muted-foreground">Recurso</div>
            <div className="col-span-3 text-center text-muted-foreground">Sem acesso</div>
            <div className="col-span-3 text-center" style={{ color: "var(--accent)" }}>
              PRO Anual
            </div>
          </div>
          {COMPARE_ROWS.map((r) => (
            <div
              key={r.label}
              className="grid grid-cols-12 items-center border-b px-5 py-3.5 smooth hover:bg-[color:var(--surface-2)]"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="col-span-6 text-sm">{r.label}</div>
              <div className="col-span-3 flex justify-center">
                <Cell v={r.free} />
              </div>
              <div className="col-span-3 flex justify-center">
                <Cell v={r.pro} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const MODULES = [
  {
    Icon: LineChart,
    name: "OrionScan IA",
    desc: "Envie o gráfico, receba direção, suporte/resistência, padrões e horário de entrada calculado.",
  },
  {
    Icon: BrainCircuit,
    name: "OrionMind",
    desc: "Mentor IA 24/7 com memória estendida, treinado nos princípios do Gabriel Dutra.",
  },
  {
    Icon: Newspaper,
    name: "Notícias & Calendário",
    desc: "Eventos macro do dia separados por impacto (alto, médio, baixo).",
  },
  {
    Icon: Bitcoin,
    name: "CryptoBubbles",
    desc: "Radar do mercado cripto em tempo real direto na plataforma.",
  },
  {
    Icon: Calculator,
    name: "Calculadora de Banca",
    desc: "Gerencie risco por operação, payout, sequência e meta diária.",
  },
  {
    Icon: ClipboardList,
    name: "Gestão de Trades",
    desc: "Planilha completa com métricas de win rate, profit factor e drawdown.",
  },
];

function Modules() {
  return (
    <section className="relative z-10 px-6 py-16 md:px-12">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center font-display text-3xl font-black tracking-tight md:text-4xl">
          Tudo que você desbloqueia
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-muted-foreground">
          Seis módulos integrados em uma única assinatura.
        </p>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
          {MODULES.map(({ Icon, name, desc }) => (
            <div
              key={name}
              className="group rounded-2xl border p-5 card-glow hover-lift"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <div
                className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl smooth group-hover:scale-110"
                style={{
                  background: "color-mix(in oklab, var(--accent) 14%, transparent)",
                  color: "var(--accent)",
                }}
              >
                <Icon className="h-5 w-5" strokeWidth={1.6} />
              </div>
              <div className="font-display text-base font-bold">{name}</div>
              <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing() {
  return (
    <section className="relative z-10 px-6 py-16 md:px-12">
      <div className="mx-auto max-w-2xl">
        <div
          className="rounded-3xl border p-8 text-center card-glow"
          style={{
            background:
              "linear-gradient(160deg, color-mix(in oklab, var(--accent) 14%, var(--surface)), var(--surface))",
            borderColor: "color-mix(in oklab, var(--accent) 38%, transparent)",
            boxShadow: "0 30px 80px -30px color-mix(in oklab, var(--accent) 50%, transparent)",
          }}
        >
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
            style={{
              background: "color-mix(in oklab, var(--accent) 22%, transparent)",
              color: "var(--accent)",
            }}
          >
            <Crown className="h-3 w-3" /> Acesso PRO Anual
          </div>
          <h3 className="mt-4 font-display text-2xl font-extrabold tracking-tight">
            12 meses, pagamento único
          </h3>
          <div className="mt-5 flex items-end justify-center gap-3">
            <span className="font-display text-6xl font-black gradient-text">R$ 2.500</span>
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            à vista · ou parcelado em até 12x no cartão
          </div>
          <div
            className="mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[11px] font-bold"
            style={{
              background: "color-mix(in oklab, var(--green) 18%, transparent)",
              color: "var(--green)",
            }}
          >
            12 meses de acesso completo
          </div>

          <ul className="mt-6 grid gap-2 text-left text-sm">
            {[
              "Acesso por 12 meses a todos os módulos",
              "Análises ilimitadas no OrionScan IA",
              "OrionMind sem restrição de uso",
              "Bônus: aulas e materiais exclusivos do Gabriel Dutra",
              "Suporte humano prioritário",
            ].map((b) => (
              <li key={b} className="flex items-start gap-2">
                <Check className="mt-0.5 h-4 w-4 flex-none" style={{ color: "var(--green)" }} /> {b}
              </li>
            ))}
          </ul>

          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-bold smooth press hover:-translate-y-0.5"
            style={{ background: "var(--gradient-primary)", color: "var(--accent-foreground)" }}
          >
            Quero garantir meu acesso <ArrowRight className="h-4 w-4" />
          </a>
          <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
            <ShieldCheck className="h-3 w-3" /> Garantia incondicional de 7 dias
          </div>
        </div>
      </div>
    </section>
  );
}

function Mentor() {
  return (
    <section className="relative z-10 px-6 py-16 md:px-12">
      <div
        className="mx-auto grid max-w-5xl items-center gap-8 rounded-3xl border p-8 md:grid-cols-[1fr_2fr]"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="flex items-center justify-center">
          <div
            className="flex h-32 w-32 items-center justify-center rounded-full ring-gradient"
            style={{ background: "var(--surface-2)" }}
          >
            <span className="font-display text-4xl font-black gradient-text">GD</span>
          </div>
        </div>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            O Mentor
          </div>
          <h3 className="mt-1 font-display text-2xl font-extrabold tracking-tight">
            Gabriel Dutra
          </h3>
          <p className="mt-1 text-sm" style={{ color: "var(--accent)" }}>
            Trader e professor do grupo Orion Capital
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Após anos formando traders consistentes, Gabriel reuniu sua metodologia em uma
            plataforma única. O OrionHub é a tradução prática do que ele ensina dentro do Orion
            Capital — agora com IA para acelerar suas leituras e gestão.
          </p>
        </div>
      </div>
    </section>
  );
}

const FAQS = [
  [
    "O acesso é vitalício?",
    "Não. É um pagamento único que libera 12 meses de acesso completo. Sem renovação automática.",
  ],
  [
    "Tenho garantia?",
    "Sim. Você tem 7 dias para testar a plataforma. Não gostou, devolvemos 100% do valor.",
  ],
  [
    "Funciona em qualquer corretora?",
    "A plataforma é independente da corretora. Você analisa o gráfico de qualquer ativo e executa onde preferir.",
  ],
  [
    "Preciso de conhecimento prévio?",
    "Não. O OrionMind te orienta passo a passo, e o OrionScan entrega análises prontas para iniciantes e avançados.",
  ],
  [
    "Como recebo o acesso?",
    "Após a compra, liberamos seu acesso anual em até alguns minutos no e-mail cadastrado.",
  ],
];

function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="relative z-10 px-6 py-16 md:px-12">
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center font-display text-3xl font-black tracking-tight">
          Perguntas frequentes
        </h2>
        <div className="mt-8 space-y-2">
          {FAQS.map(([q, a], i) => (
            <div
              key={q}
              className="overflow-hidden rounded-2xl border smooth"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
                aria-controls={`oferta-faq-${i}`}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold smooth hover:text-[color:var(--accent)]"
              >
                <span>{q}</span>
                <span className="text-xl text-muted-foreground" aria-hidden>
                  {open === i ? "−" : "+"}
                </span>
              </button>
              {open === i && (
                <div
                  id={`oferta-faq-${i}`}
                  role="region"
                  className="px-5 pb-5 text-sm text-muted-foreground faq-open"
                >
                  {a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="relative z-10 px-6 py-20 md:px-12">
      <div
        className="mx-auto max-w-3xl rounded-3xl border p-10 text-center card-glow"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--accent) 18%, var(--surface)), color-mix(in oklab, var(--electric) 10%, var(--surface)))",
          borderColor: "color-mix(in oklab, var(--accent) 40%, transparent)",
        }}
      >
        <Zap className="mx-auto h-8 w-8" style={{ color: "var(--electric)" }} />
        <h3 className="mt-3 font-display text-3xl font-black tracking-tight">
          Pronto para entrar no OrionHub?
        </h3>
        <p className="mx-auto mt-2 max-w-lg text-sm text-muted-foreground">
          O lote de lançamento tem vagas limitadas. Garanta seu acesso anual agora.
        </p>
        <a
          href={TELEGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-full px-8 py-4 text-sm font-bold smooth press hover:-translate-y-0.5"
          style={{ background: "var(--gradient-primary)", color: "var(--accent-foreground)" }}
        >
          Garantir acesso por R$ 2.500 <ArrowRight className="h-4 w-4" />
        </a>
        <div className="mt-3 text-[10px] uppercase tracking-wider text-muted-foreground">
          Você será redirecionado ao Telegram oficial
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer
      className="relative z-10 border-t px-6 py-8 text-center text-xs text-muted-foreground"
      style={{ borderColor: "var(--border)" }}
    >
      © {new Date().getFullYear()} OrionHub · Todos os direitos reservados.
      <span className="mx-2">·</span>
      <Link to="/" className="hover:text-[color:var(--accent)]">
        Voltar ao site
      </Link>
    </footer>
  );
}

// silence unused
void InfinityIcon;
void Gem;
