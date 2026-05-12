import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useUser, type User } from "@/lib/store";
import { useReveal } from "@/lib/useReveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "OrionHub — Plataforma de Trading Inteligente com IA" },
      { name: "description", content: "Analise gráficos com IA, gerencie trades, converse com o OrionMind. Sua plataforma completa para opções binárias." },
      { property: "og:title", content: "OrionHub — Trading Inteligente com IA" },
      { property: "og:description", content: "Análise de gráficos por IA, planilha de trades e mentor IA em um só lugar." },
      { property: "og:type", content: "website" },
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
      <Reveal><MockupSection /></Reveal>
      <Reveal><ToolsSection /></Reveal>
      <Reveal><FeaturesSection /></Reveal>
      <Reveal><HowSection /></Reveal>
      <Reveal><PricingSection /></Reveal>
      <Reveal><FaqSection /></Reveal>
      <Reveal><CtaSection /></Reveal>
      <Footer />
    </div>
  );
}

function Nav({ user }: { user: User | null }) {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl fade-down md:px-12"
      style={{ background: "color-mix(in oklab, var(--background) 85%, transparent)", borderBottom: "1px solid color-mix(in oklab, var(--accent) 8%, transparent)" }}>
      <Link to="/" className="text-[22px] font-black tracking-tight smooth hover:opacity-80">
        Orion<span style={{ color: "var(--electric)" }}>Hub</span>
      </Link>
      <div className="hidden items-center gap-8 md:flex">
        {[["#tools","Ferramentas"],["#how","Como funciona"],["#pricing","Planos"],["#faq","FAQ"]].map(([h,l]) => (
          <a key={h} href={h} className="text-sm font-medium text-muted-foreground smooth hover:text-foreground hover:-translate-y-0.5 inline-block">{l}</a>
        ))}
      </div>
      <div className="flex items-center gap-3">
        {user ? (
          <Link to="/scan" className="rounded-full px-5 py-2.5 text-sm font-bold text-white smooth press hover:-translate-y-0.5 pulse-glow" style={{ background: "var(--accent)" }}>
            Abrir App →
          </Link>
        ) : (
          <>
            <Link to="/login" className="text-sm font-medium text-muted-foreground smooth hover:text-foreground">Entrar</Link>
            <Link to="/signup" className="rounded-full px-5 py-2.5 text-sm font-bold text-white smooth press hover:-translate-y-0.5"
              style={{ background: "var(--accent)", boxShadow: "0 0 30px color-mix(in oklab, var(--accent) 25%, transparent)" }}>
              Criar Conta
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

function Hero({ user }: { user: User | null }) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 pb-20 pt-32 text-center">
      <div className="absolute inset-0 float-y" style={{ background: "radial-gradient(ellipse 80% 60% at 50% 30%, color-mix(in oklab, var(--accent) 8%, transparent) 0%, transparent 65%)" }} />
      <div className="absolute inset-0 opacity-50"
        style={{
          backgroundImage: "linear-gradient(color-mix(in oklab, var(--accent) 4%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--accent) 4%, transparent) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }} />
      <div className="relative z-10 flex flex-col items-center stagger">
        <div className="mb-7 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider"
          style={{ background: "color-mix(in oklab, var(--accent) 7%, transparent)", border: "1px solid color-mix(in oklab, var(--accent) 18%, transparent)", color: "var(--electric)" }}>
          <span className="h-1.5 w-1.5 rounded-full blink-dot" style={{ background: "var(--electric)" }} />
          IA · Trading · Tempo Real
        </div>
        <h1 className="max-w-4xl text-[clamp(40px,6.5vw,84px)] font-black leading-[1.0] tracking-tighter">
          Sua mente de trader,<br />
          <span style={{ color: "var(--electric)" }}>amplificada</span> por IA.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[clamp(15px,2vw,19px)] leading-relaxed text-muted-foreground">
          Analise gráficos, gerencie sua planilha, converse com seu mentor IA e descubra padrões. Tudo em um só lugar.
        </p>
        <div className="mt-11 flex flex-wrap items-center justify-center gap-3.5">
          <Link to={user ? "/scan" : "/signup"}
            className="rounded-full px-9 py-4 text-base font-bold text-white smooth press hover:-translate-y-0.5 pulse-glow"
            style={{ background: "var(--accent)" }}>
            {user ? "Abrir App →" : "Começar grátis"}
          </Link>
          <a href="#tools" className="rounded-full border px-8 py-4 text-base font-semibold text-muted-foreground smooth hover:text-foreground hover:-translate-y-0.5"
            style={{ borderColor: "var(--border-strong)" }}>
            Ver ferramentas
          </a>
        </div>
        <div className="mt-16 flex flex-wrap justify-center gap-12">
          <Stat num="92%" label="Precisão da IA" />
          <Stat num="<2s" label="Tempo de análise" />
          <Stat num="24/7" label="Mentor disponível" />
        </div>
      </div>
    </section>
  );
}
function Stat({ num, label }: { num: string; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-black tracking-tight" style={{ color: "var(--electric)" }}>{num}</div>
      <div className="mt-1 text-xs font-medium text-muted-foreground">{label}</div>
    </div>
  );
}

function MockupSection() {
  return (
    <section className="mx-auto max-w-5xl px-6 pb-24">
      <div className="overflow-hidden rounded-3xl border" style={{ background: "var(--surface)", borderColor: "var(--border-strong)", boxShadow: "0 40px 100px rgba(0,0,0,.5)" }}>
        <div className="flex items-center gap-2 border-b px-5 py-3.5" style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
          <span className="h-3 w-3 rounded-full" style={{ background: "#ff5f57" }} />
          <span className="h-3 w-3 rounded-full" style={{ background: "#febc2e" }} />
          <span className="h-3 w-3 rounded-full" style={{ background: "#28c840" }} />
        </div>
        <div className="grid gap-0 p-8 md:grid-cols-[200px_1fr]" style={{ minHeight: 420 }}>
          <div className="border-r pr-5" style={{ borderColor: "var(--border)" }}>
            <div className="mb-5 text-[15px] font-black">Orion<span style={{ color: "var(--electric)" }}>Hub</span></div>
            {[
              ["1", "Carregue o gráfico", "Print, drag&drop ou Ctrl+V"],
              ["2", "IA analisa", "Padrões, indicadores, suporte/res."],
              ["3", "Receba o sinal", "Direção, confiança, horários."],
            ].map(([n, t, d]) => (
              <div key={n} className="mb-3.5 flex gap-2.5">
                <div className="flex h-5 w-5 flex-none items-center justify-center rounded-full text-[9px] font-bold text-white" style={{ background: "var(--accent)" }}>{n}</div>
                <div>
                  <div className="text-[11px] font-bold">{t}</div>
                  <div className="text-[9px] leading-snug text-muted-foreground">{d}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col gap-3.5 px-5">
            <div className="rounded-xl border p-3.5" style={{ background: "color-mix(in oklab, var(--accent) 8%, transparent)", borderColor: "color-mix(in oklab, var(--accent) 20%, transparent)" }}>
              <div className="mb-2.5 flex items-center gap-2.5">
                <span className="rounded-full px-2.5 py-0.5 text-[9px] font-extrabold" style={{ background: "color-mix(in oklab, var(--green) 18%, transparent)", color: "var(--green)" }}>▲ CALL</span>
                <span className="text-[11px] text-muted-foreground">EUR/USD · M5</span>
                <span className="ml-auto text-[13px] font-extrabold" style={{ color: "var(--electric)" }}>87%</span>
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[["Entrada", "14:35"], ["Proteção 1", "14:40"], ["Proteção 2", "14:45"]].map(([l, v]) => (
                  <div key={l} className="rounded-lg p-1.5 text-center" style={{ background: "rgba(255,255,255,.03)" }}>
                    <div className="text-[7px] text-muted-foreground">{l}</div>
                    <div className="text-[11px] font-bold">{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[["Tendência", "Alta"], ["Viés", "Bullish"]].map(([l, v]) => (
                <div key={l} className="rounded-lg p-2.5" style={{ background: "var(--surface-2)" }}>
                  <div className="text-[7px] text-muted-foreground">{l}</div>
                  <div className="text-xs font-bold">{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ToolsSection() {
  return (
    <section id="tools" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeader tag="FERRAMENTAS" title="Tudo que você precisa para operar com mais clareza" sub="Quatro módulos integrados, alimentados por IA." />
      <div className="grid grid-cols-1 gap-4 stagger md:grid-cols-2">
        <ToolCard tone="blue" icon="📈" title="TraderScan"
          desc="Cole ou arraste a print de qualquer gráfico. A IA identifica padrões, indicadores, suporte/resistência e devolve direção, confiança e horários de entrada e proteção."
          feats={["Vision Claude para análise visual", "Funciona em qualquer broker", "Saída estruturada (CALL/PUT)"]} />
        <ToolCard tone="cyan" icon="🧠" title="OrionMind"
          desc="Seu mentor IA 24/7. Conversa contextualizada sobre estratégias, gestão de risco, psicologia de trade. Pode diagnosticar sua planilha de operações."
          feats={["Memória da conversa", "Diagnóstico da sua planilha", "Português natural"]} />
        <ToolCard tone="purple" icon="📋" title="Planilha"
          desc="Registre cada operação. Win-rate, lucro acumulado, melhor ativo e horário. Tudo gerado automaticamente."
          feats={["Stats em tempo real", "Export CSV", "Filtros por período"]} />
        <ToolCard tone="gold" icon="🧮" title="Calculadora"
          desc="Quanto entrar em cada trade? Stop loss diário? Sequência de martingale? A calculadora resolve."
          feats={["Gestão por % da banca", "Martingale seguro", "Projeção de lucro"]} />
      </div>
    </section>
  );
}
function ToolCard({ tone, icon, title, desc, feats }: { tone: "blue" | "cyan" | "purple" | "gold"; icon: string; title: string; desc: string; feats: string[] }) {
  const tones: Record<string, string> = { blue: "var(--accent)", cyan: "var(--electric)", purple: "var(--purple)", gold: "var(--gold)" };
  return (
    <div className="group rounded-3xl border p-8 hover-lift hover-glow" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
        style={{ background: `color-mix(in oklab, ${tones[tone]} 8%, transparent)`, border: `1px solid color-mix(in oklab, ${tones[tone]} 18%, transparent)` }}>{icon}</div>
      <h3 className="mb-2.5 text-xl font-extrabold tracking-tight">{title}</h3>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{desc}</p>
      <ul className="flex flex-col gap-1.5">
        {feats.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span style={{ color: "var(--electric)" }}>→</span> {f}
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeader tag="POR QUE ORIONHUB" title="Pensado para o trader real" sub="Não é mais um indicador. É um copiloto." />
      <div className="grid grid-cols-1 gap-4 stagger md:grid-cols-3">
        {[
          { icon: "⚡", title: "Análise em < 2s", desc: "Cole o print e em segundos a IA devolve direção, confiança e padrões identificados." },
          { icon: "🔒", title: "Privacidade", desc: "Suas imagens não são armazenadas. Conversas e trades ficam só no seu navegador." },
          { icon: "🎯", title: "Sem ruído", desc: "Sinais objetivos, sem prometer milagres. Sempre com gestão de risco em primeiro lugar." },
          { icon: "📲", title: "Funciona no celular", desc: "Cole o print direto da corretora. Funciona em qualquer dispositivo." },
          { icon: "📊", title: "Dados que evoluem", desc: "Quanto mais você opera, melhor seu relatório. Diagnóstico real do que funciona." },
          { icon: "🇧🇷", title: "100% em português", desc: "IA treinada para responder de forma simples e direta, sem termos confusos." },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border p-7 hover-lift hover-glow" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-xl"
              style={{ background: "color-mix(in oklab, var(--accent) 7%, transparent)", border: "1px solid color-mix(in oklab, var(--accent) 15%, transparent)" }}>
              {f.icon}
            </div>
            <h3 className="mb-2 text-base font-bold">{f.title}</h3>
            <p className="text-[13px] leading-relaxed text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowSection() {
  const steps = [
    ["01", "Crie sua conta", "Grátis. Sem cartão. 7 dias de trial completo."],
    ["02", "Carregue seu gráfico", "Print, drag&drop ou Ctrl+V. Qualquer broker."],
    ["03", "IA analisa", "Padrões, indicadores e contexto, em segundos."],
    ["04", "Opere com clareza", "Sinal + horários + gestão recomendada."],
  ];
  return (
    <section id="how" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeader tag="COMO FUNCIONA" title="Em 4 passos simples" sub="Da imagem ao sinal em menos de 2 segundos." />
      <div className="relative grid grid-cols-2 gap-4 md:grid-cols-4">
        {steps.map(([n, t, d]) => (
          <div key={n} className="text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border text-xl font-black"
              style={{ background: "var(--surface-2)", borderColor: "var(--border-strong)", color: "var(--electric)" }}>{n}</div>
            <div className="text-[15px] font-bold">{t}</div>
            <div className="mt-1.5 text-[13px] leading-snug text-muted-foreground">{d}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="mx-auto max-w-6xl px-6 py-24">
      <SectionHeader tag="PLANOS" title="Comece grátis. Evolua quando quiser." sub="Sem fidelidade. Cancele quando precisar." />
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-4 md:grid-cols-3">
        <Plan name="Free" price="0" period="grátis para sempre" feats={["5 análises por mês", "OrionMind básico", "Planilha sem limites"]} cta="Começar" />
        <Plan name="Pro" price="49" period="por mês · cancelar quando quiser"
          feats={["Análises ilimitadas", "OrionMind ilimitado", "Diagnóstico completo", "Calculadora avançada", "Export CSV"]}
          cta="Assinar Pro" featured />
        <Plan name="Team" price="129" period="por mês · até 5 usuários" feats={["Tudo do Pro", "5 usuários", "Suporte prioritário"]} cta="Falar com vendas" />
      </div>
    </section>
  );
}
function Plan({ name, price, period, feats, cta, featured }: { name: string; price: string; period: string; feats: string[]; cta: string; featured?: boolean }) {
  return (
    <div className="rounded-3xl border p-8 hover-lift hover-glow"
      style={{
        background: featured ? "linear-gradient(180deg, color-mix(in oklab, var(--accent) 6%, transparent), var(--surface))" : "var(--surface)",
        borderColor: featured ? "color-mix(in oklab, var(--accent) 35%, transparent)" : "var(--border)",
      }}>
      {featured && (
        <div className="mb-4 inline-block rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white" style={{ background: "var(--accent)" }}>
          Mais popular
        </div>
      )}
      <div className="mb-2 text-sm font-bold text-muted-foreground">{name}</div>
      <div className="text-4xl font-black tracking-tight">
        <sup className="mr-1 align-top text-base font-bold">R$</sup>{price}
      </div>
      <div className="mb-6 mt-2 text-xs leading-snug text-muted-foreground">{period}</div>
      <ul className="mb-7 flex flex-col gap-2.5">
        {feats.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm">
            <span style={{ color: "var(--electric)" }}>✓</span> {f}
          </li>
        ))}
      </ul>
      <Link to="/signup" className="block w-full rounded-xl py-3 text-center text-sm font-bold transition-all"
        style={featured
          ? { background: "var(--accent)", color: "#fff", boxShadow: "0 0 40px color-mix(in oklab, var(--accent) 30%, transparent)" }
          : { background: "var(--surface-2)", border: "1px solid var(--border-strong)", color: "var(--foreground)" }
        }>
        {cta}
      </Link>
    </div>
  );
}

function FaqSection() {
  const items = [
    ["A IA realmente funciona com qualquer broker?", "Sim. Como a análise é feita visualmente sobre a imagem do gráfico, basta tirar um print de qualquer plataforma (IQ Option, Quotex, MT5, TradingView, etc)."],
    ["Vocês garantem lucros?", "Não. Nenhuma ferramenta séria garante lucros em trading. O OrionHub é um copiloto que entrega análise objetiva — a decisão e o gerenciamento são sempre seus."],
    ["Meus dados ficam armazenados?", "Trades, conversas e histórico ficam apenas no seu navegador (localStorage). Imagens enviadas para análise não são salvas no servidor."],
    ["Posso cancelar a qualquer momento?", "Sim, sem fidelidade. Cancele direto pela aba de assinatura."],
    ["Funciona em opções binárias e em forex?", "Sim. A análise é sobre o gráfico — funciona para qualquer ativo: forex, índices, ações, cripto, commodities."],
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="mx-auto max-w-3xl px-6 py-24">
      <SectionHeader tag="FAQ" title="Perguntas frequentes" sub="" />
      <div>
        {items.map(([q, a], i) => (
          <div key={q} className="border-b py-2" style={{ borderColor: "var(--border)" }}>
            <button onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between py-4 text-left text-[15px] font-semibold hover:text-[color:var(--electric)]">
              {q}
              <span className="text-xl text-muted-foreground transition-transform" style={{ transform: open === i ? "rotate(45deg)" : "none", color: open === i ? "var(--electric)" : undefined }}>+</span>
            </button>
            {open === i && <div className="pb-4 text-sm leading-relaxed text-muted-foreground">{a}</div>}
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="relative overflow-hidden px-6 py-32 text-center">
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 70% 50% at 50% 50%, color-mix(in oklab, var(--accent) 8%, transparent) 0%, transparent 70%)" }} />
      <div className="relative z-10 mx-auto inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
        style={{ background: "color-mix(in oklab, var(--green) 7%, transparent)", border: "1px solid color-mix(in oklab, var(--green) 18%, transparent)", color: "var(--green)" }}>
        ● 7 dias grátis · sem cartão
      </div>
      <h2 className="relative z-10 mt-6 text-[clamp(32px,5vw,60px)] font-black leading-tight tracking-tighter">
        Comece a operar com<br />
        <span style={{ color: "var(--electric)" }}>clareza</span> hoje.
      </h2>
      <p className="relative z-10 mx-auto mt-4 max-w-md text-base text-muted-foreground">Crie sua conta em 30 segundos e teste tudo sem custo.</p>
      <Link to="/signup" className="relative z-10 mt-9 inline-block rounded-full px-10 py-4 text-base font-bold text-white smooth press hover:-translate-y-0.5 pulse-glow"
        style={{ background: "var(--accent)", boxShadow: "0 0 80px color-mix(in oklab, var(--accent) 35%, transparent)" }}>
        Criar conta grátis
      </Link>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t px-6 py-12 text-center" style={{ borderColor: "var(--border)" }}>
      <Link to="/" className="text-[22px] font-black tracking-tight">Orion<span style={{ color: "var(--electric)" }}>Hub</span></Link>
      <div className="mt-4 flex flex-wrap justify-center gap-7">
        {["Termos", "Privacidade", "Contato"].map((l) => (
          <a key={l} href="#" className="text-[13px] text-muted-foreground hover:text-foreground">{l}</a>
        ))}
      </div>
      <div className="mt-4 text-xs" style={{ color: "var(--text-dim)" }}>© {new Date().getFullYear()} OrionHub · Trading com inteligência</div>
    </footer>
  );
}

function SectionHeader({ tag, title, sub }: { tag: string; title: string; sub?: string }) {
  return (
    <div className="mb-14 text-center">
      <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.25em]" style={{ color: "var(--electric)" }}>{tag}</div>
      <h2 className="text-[clamp(28px,4vw,48px)] font-black leading-tight tracking-tight">{title}</h2>
      {sub && <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">{sub}</p>}
    </div>
  );
}
