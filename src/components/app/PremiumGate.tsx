import { Link } from "@tanstack/react-router";
import { Lock, Sparkles, LineChart, Brain, ClipboardList, Newspaper, CircleDot, LayoutDashboard, Calculator, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export type GateKey = "scan" | "mind" | "gestao" | "noticias" | "cryptobubbles" | "dashboard" | "calculadora";

const COPY: Record<GateKey, { title: string; tagline: string; description: string; Icon: LucideIcon; perks: string[] }> = {
  scan: {
    title: "OrionScan IA",
    tagline: "Análise de gráficos com IA",
    description: "Envie o print do gráfico e receba direção, suporte, resistência, padrões e horário de entrada calculado.",
    Icon: LineChart,
    perks: ["Análises ilimitadas", "Leitura de candles e padrões", "Horário de entrada e proteções"],
  },
  mind: {
    title: "OrionMind",
    tagline: "Mentor IA 24/7",
    description: "Converse com o mentor IA da Orion Capital, registre operações por voz e receba orientação estratégica em tempo real.",
    Icon: Brain,
    perks: ["Memória estendida da sua banca", "Registro de trades por chat", "Tutor de price action e gestão"],
  },
  gestao: {
    title: "Gestão de Trades",
    tagline: "Planilha + métricas profissionais",
    description: "Acompanhe banca, payout, sequência, drawdown e exporte relatórios completos das suas operações.",
    Icon: ClipboardList,
    perks: ["Histórico ilimitado de trades", "Métricas avançadas e gráficos", "Exportação em PNG e PDF"],
  },
  noticias: {
    title: "Notícias & Calendário",
    tagline: "Calendário econômico em tempo real",
    description: "Eventos macro classificados por impacto (alto, médio e baixo) para você operar sem ser pego de surpresa.",
    Icon: Newspaper,
    perks: ["Eventos da semana atualizados", "Filtro por impacto no mercado", "Horários e previsões"],
  },
  cryptobubbles: {
    title: "CryptoBubbles",
    tagline: "Radar do mercado cripto",
    description: "Visualize em tempo real as maiores altas, quedas e volume do mercado cripto, integrado direto na plataforma.",
    Icon: CircleDot,
    perks: ["Bubbles atualizados ao vivo", "Top altas e quedas", "Foco rápido em oportunidades"],
  },
  dashboard: {
    title: "Dashboard OrionHub",
    tagline: "Sua visão geral de operações",
    description: "Acompanhe sua banca, performance, métricas-chave e o panorama completo das suas operações num único lugar.",
    Icon: LayoutDashboard,
    perks: ["Visão consolidada da banca", "Indicadores em tempo real", "Painéis personalizáveis"],
  },
  calculadora: {
    title: "Calculadora Orion",
    tagline: "Gestão de banca profissional",
    description: "Calcule entradas, proteções, payouts e stop loss/win usando a metodologia padrão Orion para preservar sua banca.",
    Icon: Calculator,
    perks: ["Cálculo automático de proteções", "Padrão Orion configurado", "Simulação por payout e ativo"],
  },
};

export function PremiumGate({ children, feature }: { children: ReactNode; feature: GateKey }) {
  const copy = COPY[feature];
  const { Icon } = copy;
  return (
    <div className="relative h-full min-h-0">
      <div
        aria-hidden
        className="pointer-events-none h-full w-full overflow-hidden select-none"
        style={{ filter: "blur(12px) saturate(0.65)", opacity: 0.45 }}
      >
        {children}
      </div>
      <div
        className="absolute inset-0 z-10 flex items-center justify-center overflow-y-auto p-6"
        style={{ background: "color-mix(in oklab, var(--background) 62%, transparent)", backdropFilter: "blur(3px)" }}
      >
        <div
          className="flex max-w-md flex-col items-center rounded-2xl border px-7 py-8 text-center shadow-2xl fade-up"
          style={{
            background: "color-mix(in oklab, var(--surface) 92%, transparent)",
            borderColor: "color-mix(in oklab, var(--accent) 40%, var(--border-strong))",
            boxShadow: "0 30px 80px -20px color-mix(in oklab, var(--accent) 40%, transparent)",
          }}
        >
          <div
            className="relative mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border"
            style={{
              background: "color-mix(in oklab, var(--accent) 16%, transparent)",
              borderColor: "color-mix(in oklab, var(--accent) 45%, transparent)",
              color: "var(--accent)",
            }}
          >
            <Icon className="h-6 w-6" strokeWidth={1.75} />
            <span
              className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border"
              style={{ background: "var(--surface)", borderColor: "color-mix(in oklab, var(--accent) 50%, transparent)", color: "var(--accent)" }}
            >
              <Lock className="h-2.5 w-2.5" strokeWidth={2.25} />
            </span>
          </div>
          <div className="font-display text-xs font-semibold uppercase tracking-[0.3em]" style={{ color: "var(--accent)" }}>
            {copy.tagline}
          </div>
          <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight">
            {copy.title} é exclusivo do Premium Anual
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {copy.description}
          </p>
          <ul className="mt-5 grid w-full gap-2 text-left text-[13px]">
            {copy.perks.map((p) => (
              <li key={p} className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 flex-none" style={{ color: "var(--accent)" }} strokeWidth={2} />
                <span className="text-muted-foreground">{p}</span>
              </li>
            ))}
          </ul>
          <Link
            to="/upgrade"
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold smooth press hover:-translate-y-0.5"
            style={{
              background: "var(--gradient-primary)",
              color: "var(--accent-foreground)",
              boxShadow: "0 10px 30px -10px color-mix(in oklab, var(--accent) 70%, transparent)",
            }}
          >
            <Sparkles className="h-4 w-4" strokeWidth={2} />
            Ver acesso anual · R$ 2.500
          </Link>
          <div className="mt-3 text-[11px] text-muted-foreground">
            Pagamento único · 12 meses de acesso · Garantia de 7 dias
          </div>
        </div>
      </div>
    </div>
  );
}