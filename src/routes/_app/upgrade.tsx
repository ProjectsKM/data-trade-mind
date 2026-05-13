import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAppState } from "@/lib/store";

export const Route = createFileRoute("/_app/upgrade")({
  head: () => ({ meta: [{ title: "Acesso Anual — OrionHub" }] }),
  component: UpgradePage,
});

const BENEFITS = [
  ["♾️", "Análises ilimitadas", "Sem limite no TraderScan — analise quantos gráficos quiser."],
  ["🧠", "OrionMind sem restrição", "Mentor IA disponível 24/7, com memória estendida."],
  ["📊", "Relatórios avançados", "Exportação de gráficos em PNG/PDF e métricas pro."],
  ["📰", "Notícias & Calendário", "Eventos econômicos por impacto, em tempo real."],
  ["🟣", "CryptoBubbles", "Acompanhe o mercado cripto em tempo real."],
  ["⚡", "Prioridade de processamento", "Suas análises rodam primeiro, mesmo em horário de pico."],
  ["💎", "Acesso antecipado", "Novas ferramentas e estratégias antes de todos."],
  ["🛡️", "Suporte prioritário", "Atendimento dedicado por chat."],
];

function UpgradePage() {
  const { state, update } = useAppState();
  const nav = useNavigate();
  function activate() {
    update({ isPro: true, analysesLeft: 9999, trialDaysLeft: 999 });
    setTimeout(() => nav({ to: "/scan" }), 300);
  }
  function deactivate() {
    update({ isPro: false, analysesLeft: 5, trialDaysLeft: 7, trialStartedAt: new Date().toISOString() });
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10">
      <div className="mb-8 text-center">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest"
          style={{ background: "color-mix(in oklab, var(--electric) 8%, transparent)", borderColor: "color-mix(in oklab, var(--electric) 22%, transparent)", color: "var(--electric)" }}>
          ✨ Acesso Anual Único
        </div>
        <h1 className="text-3xl font-black tracking-tight md:text-4xl">
          Desbloqueie o <span style={{ color: "var(--electric)" }}>OrionHub</span> por 1 ano
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-muted-foreground">
          Pagamento único. 12 meses de acesso completo. Sem mensalidade, sem renovação automática.
        </p>
      </div>

      {state.isPro ? (
        <div className="mb-6 rounded-3xl border p-6 text-center"
          style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--green) 12%, transparent), color-mix(in oklab, var(--electric) 6%, transparent))", borderColor: "color-mix(in oklab, var(--green) 30%, transparent)" }}>
          <div className="text-2xl">🎉</div>
          <div className="mt-1 text-lg font-extrabold" style={{ color: "var(--green)" }}>Acesso Anual ativo!</div>
          <div className="mt-1 text-sm text-muted-foreground">Aproveite todos os recursos sem limites por 12 meses.</div>
          <button onClick={deactivate} className="mt-4 rounded-lg border px-4 py-2 text-xs text-muted-foreground hover:text-[color:var(--red)]" style={{ borderColor: "var(--border)" }}>Desativar (demo)</button>
        </div>
      ) : (
        <div className="mb-6 rounded-3xl border p-6"
          style={{ background: "linear-gradient(135deg, color-mix(in oklab, var(--accent) 12%, transparent), color-mix(in oklab, var(--electric) 6%, transparent))", borderColor: "color-mix(in oklab, var(--accent) 30%, transparent)" }}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-xs font-mono tracking-wider text-muted-foreground">ACESSO ANUAL</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-4xl font-black">R$ 497</span>
                <span className="text-sm text-muted-foreground">/ano · pagamento único</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">Equivale a R$ 41/mês — sem renovação automática.</div>
            </div>
            <button onClick={activate} className="rounded-2xl px-7 py-3.5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
              style={{ background: "var(--accent)", boxShadow: "0 0 30px color-mix(in oklab, var(--accent) 30%, transparent)" }}>
              Ativar acesso anual →
            </button>
          </div>
          <div className="mt-3 text-[11px] text-muted-foreground">
            Status atual: <span className="font-bold">TRIAL</span> · {state.analysesLeft} análises restantes
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {BENEFITS.map(([icon, title, desc]) => (
          <div key={title} className="rounded-2xl border p-4" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            <div className="mb-2 text-2xl">{icon}</div>
            <div className="text-sm font-bold">{title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
