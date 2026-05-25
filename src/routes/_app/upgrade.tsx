import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  Infinity as InfinityIcon, BrainCircuit, LineChart, Newspaper, Bitcoin, Zap, Gem,
  ShieldCheck, Crown, Check, Sparkles, ArrowRight, PartyPopper,
} from "lucide-react";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/_app/upgrade")({
  head: () => ({ meta: [{ title: "Acesso Anual — OrionHub" }] }),
  component: UpgradePage,
});

const BENEFITS = [
  { Icon: InfinityIcon, title: "Análises ilimitadas", desc: "Sem limite no OrionScan — analise quantos gráficos quiser por dia." },
  { Icon: BrainCircuit, title: "OrionMind sem restrição", desc: "Mentor IA 24/7 com memória estendida das suas operações." },
  { Icon: LineChart, title: "Relatórios avançados", desc: "Métricas profissionais e exportação de gráficos em PNG e PDF." },
  { Icon: Newspaper, title: "Notícias & Calendário", desc: "Eventos econômicos por impacto (alto, médio, baixo) em tempo real." },
  { Icon: Bitcoin, title: "CryptoBubbles", desc: "Radar do mercado cripto integrado direto na plataforma." },
  { Icon: Zap, title: "Prioridade de processamento", desc: "Suas análises rodam primeiro, mesmo nos horários de pico." },
  { Icon: Gem, title: "Acesso antecipado", desc: "Novos módulos e estratégias liberados antes de todos." },
  { Icon: ShieldCheck, title: "Suporte prioritário", desc: "Atendimento humano direto, com resposta em horas e não dias." },
];

const HIGHLIGHTS = [
  { Icon: LineChart, title: "OrionScan IA", desc: "Envie o gráfico, receba direção, suporte/resistência, padrões e horário de entrada calculado." },
  { Icon: BrainCircuit, title: "OrionMind", desc: "Converse com o mentor IA treinado nos princípios do Gabriel Dutra." },
  { Icon: Newspaper, title: "Notícias + CryptoBubbles", desc: "Calendário macro e radar cripto, lado a lado com sua análise." },
];

const FAQS: Array<[string, string]> = [
  ["O acesso é vitalício?", "Não. É um pagamento único que libera 12 meses de acesso completo. Sem renovação automática — você decide se quer renovar."],
  ["Tenho garantia?", "Sim. Você tem 7 dias para testar a plataforma. Não gostou, devolvemos 100% do valor."],
  ["Como funciona o suporte?", "Suporte humano por chat com prioridade na fila. Respostas tipicamente em poucas horas."],
  ["Preciso de conhecimento prévio?", "Não. O OrionMind te orienta passo a passo e o OrionScan entrega análises prontas para iniciantes e avançados."],
  ["Quais formas de pagamento?", "Cartão (até 12x), Pix à vista e boleto. Acesso liberado em poucos minutos após confirmação."],
];

function UpgradePage() {
  const { state, update } = useAppState();
  const nav = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  function activate() {
    update({ isPro: true, analysesLeft: 9999, trialDaysLeft: 999 });
    setTimeout(() => nav({ to: "/scan" }), 300);
  }
  function deactivate() {
    update({ isPro: false, analysesLeft: 5, trialDaysLeft: 7, trialStartedAt: new Date().toISOString() });
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-10 pb-28">
      {/* Hero */}
      <div className="mb-10 text-center fade-up">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest"
          style={{ background: "color-mix(in oklab, var(--electric) 10%, transparent)", borderColor: "color-mix(in oklab, var(--electric) 30%, transparent)", color: "var(--electric)" }}>
          <Sparkles className="h-3 w-3" /> Acesso Anual · Lote de Lançamento
        </div>
        <h1 className="font-display text-4xl font-black leading-[1.05] tracking-tight md:text-5xl">
          Desbloqueie o <span className="gradient-text">OrionHub completo</span><br className="hidden md:block" />
          por 12 meses
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-sm text-muted-foreground md:text-base">
          Pagamento único. Sem mensalidade. Sem renovação automática. Tudo o que você precisa para operar com inteligência.
        </p>
      </div>

      {/* Status / Pricing card */}
      {state.isPro ? (
        <div className="mb-10 rounded-3xl border p-7 text-center scale-in card-glow"
          style={{
            background: "linear-gradient(160deg, color-mix(in oklab, var(--green) 14%, var(--surface)), color-mix(in oklab, var(--electric) 8%, var(--surface)))",
            borderColor: "color-mix(in oklab, var(--green) 36%, transparent)",
            boxShadow: "0 30px 80px -30px color-mix(in oklab, var(--green) 40%, transparent)",
          }}>
          <PartyPopper className="mx-auto h-9 w-9" style={{ color: "var(--green)" }} />
          <div className="mt-2 font-display text-2xl font-extrabold" style={{ color: "var(--green)" }}>Acesso Anual ativo!</div>
          <div className="mt-1 text-sm text-muted-foreground">Aproveite todos os recursos sem limites por 12 meses.</div>
          <button onClick={deactivate} className="mt-5 rounded-lg border px-4 py-2 text-xs text-muted-foreground smooth hover:text-[color:var(--red)] hover:border-[color:var(--red)]" style={{ borderColor: "var(--border)" }}>
            Desativar (demo)
          </button>
        </div>
      ) : (
        <div className="mb-10 rounded-3xl border p-7 fade-up card-glow"
          style={{
            background: "linear-gradient(160deg, color-mix(in oklab, var(--accent) 16%, var(--surface)), var(--surface))",
            borderColor: "color-mix(in oklab, var(--accent) 40%, transparent)",
            boxShadow: "0 30px 80px -30px color-mix(in oklab, var(--accent) 50%, transparent)",
          }}>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
                style={{ background: "color-mix(in oklab, var(--accent) 22%, transparent)", color: "var(--accent)" }}>
                <Crown className="h-3 w-3" /> Acesso PRO Anual
              </div>
              <div className="mt-3 flex items-end gap-3">
                <span className="text-base text-muted-foreground line-through">R$ 997</span>
                <span className="font-display text-5xl font-black gradient-text">R$ 497</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">/ano · pagamento único · ou 12x no cartão</div>
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                style={{ background: "color-mix(in oklab, var(--green) 18%, transparent)", color: "var(--green)" }}>
                economize 50%
              </div>
            </div>
            <button onClick={activate}
              className="group inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-sm font-bold smooth press hover:-translate-y-0.5 pulse-glow"
              style={{ background: "var(--gradient-primary)", color: "var(--accent-foreground)" }}>
              Ativar acesso anual
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> Garantia de 7 dias</span>
            <span>·</span>
            <span>Status atual: <span className="font-bold text-foreground">TRIAL</span> · {state.analysesLeft} análises restantes</span>
          </div>
        </div>
      )}

      {/* Highlights */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight">O que você desbloqueia agora</h2>
        <div className="grid gap-3 sm:grid-cols-3 stagger">
          {HIGHLIGHTS.map(({ Icon, title, desc }) => (
            <div key={title} className="group rounded-2xl border p-5 card-glow hover-lift"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl smooth group-hover:scale-110"
                style={{ background: "color-mix(in oklab, var(--accent) 14%, transparent)", color: "var(--accent)" }}>
                <Icon className="h-5 w-5" strokeWidth={1.6} />
              </div>
              <div className="font-display text-base font-bold">{title}</div>
              <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight">Tudo que vem incluso</h2>
        <div className="grid gap-3 sm:grid-cols-2 stagger">
          {BENEFITS.map(({ Icon, title, desc }) => (
            <div key={title} className="group flex gap-3 rounded-2xl border p-4 card-glow hover-lift"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg smooth group-hover:scale-110"
                style={{ background: "color-mix(in oklab, var(--electric) 14%, transparent)", color: "var(--electric)" }}>
                <Icon className="h-5 w-5" strokeWidth={1.6} />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold">{title}</div>
                <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promise */}
      <div className="mb-10 rounded-3xl border p-6 text-center fade-up"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl"
          style={{ background: "color-mix(in oklab, var(--accent) 14%, transparent)", color: "var(--accent)" }}>
          <BrainCircuit className="h-6 w-6" strokeWidth={1.6} />
        </div>
        <p className="mx-auto mt-4 max-w-xl text-sm italic text-muted-foreground">
          “O OrionHub é a tradução prática da metodologia que ensino dentro do Orion Capital — agora com IA
          para acelerar a leitura do gráfico e a sua gestão de banca.”
        </p>
        <div className="mt-3 text-xs font-bold" style={{ color: "var(--accent)" }}>
          Gabriel Dutra · Trader Orion Capital
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-10">
        <h2 className="mb-4 font-display text-xl font-bold tracking-tight">Perguntas frequentes</h2>
        <div className="space-y-2">
          {FAQS.map(([q, a], i) => (
            <div key={q} className="overflow-hidden rounded-2xl border smooth"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-sm font-semibold smooth hover:text-[color:var(--accent)]">
                <span>{q}</span>
                <span className="text-xl text-muted-foreground">{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-sm text-muted-foreground faq-open">{a}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mobile floating CTA */}
      {!state.isPro && (
        <div className="fixed inset-x-3 bottom-20 z-30 sm:hidden">
          <button onClick={activate}
            className="flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-bold smooth press pulse-glow"
            style={{ background: "var(--gradient-primary)", color: "var(--accent-foreground)" }}>
            <Check className="h-4 w-4" /> Ativar acesso anual · R$ 497
          </button>
        </div>
      )}
    </div>
  );
}
