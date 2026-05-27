import { CheckCircle2, XCircle, TrendingUp, TrendingDown, Pencil, Trash2, PieChart as PieIcon, Trophy, Calendar, Activity, Crown, Flame, Shield } from "lucide-react";
import { PieChart, Pie, Cell as PieCell, ResponsiveContainer } from "recharts";
import type { MindCard, TradeCardData, MonthlyReportData, WinReportData, ReportByCategory } from "@/lib/mind-cards";

// ─── Helpers ──────────────────────────────────────────────────────────────

function fmtUSD(n: number, withSign = false) {
  const v = Math.abs(n).toFixed(2);
  if (withSign) return `${n >= 0 ? "+" : "-"}$${v}`;
  return `$${v}`;
}

const CATEGORY_COLOR: Record<ReportByCategory["categoria"], string> = {
  CRIPTO: "var(--accent)",
  FOREX: "var(--electric)",
  ACOES: "var(--gold)",
  OUTROS: "var(--purple)",
};

const CATEGORY_LABEL: Record<ReportByCategory["categoria"], string> = {
  CRIPTO: "Cripto",
  FOREX: "Forex",
  ACOES: "Ações",
  OUTROS: "Outros",
};

// ─── Wrapper visual compartilhado ─────────────────────────────────────────

function CardShell({
  accentVar,
  icon,
  tag,
  title,
  subtitle,
  children,
}: {
  accentVar: string;
  icon: React.ReactNode;
  tag: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="orion-mind-card scale-in card-glow w-full max-w-md overflow-hidden rounded-2xl border"
      style={{
        background: `linear-gradient(160deg, color-mix(in oklab, ${accentVar} 14%, var(--surface)), var(--surface))`,
        borderColor: `color-mix(in oklab, ${accentVar} 38%, var(--border-strong))`,
        boxShadow: `0 24px 60px -28px color-mix(in oklab, ${accentVar} 60%, transparent), 0 0 1px color-mix(in oklab, ${accentVar} 40%, transparent)`,
      }}
    >
      {/* Glow stripe no topo */}
      <div
        aria-hidden
        className="h-[3px] w-full"
        style={{ background: `linear-gradient(90deg, transparent, ${accentVar}, transparent)` }}
      />

      <div className="p-4 sm:p-5">
        <div className="mb-3 flex items-start gap-3">
          <div
            className="flex h-10 w-10 flex-none items-center justify-center rounded-xl"
            style={{
              background: `color-mix(in oklab, ${accentVar} 18%, transparent)`,
              color: accentVar,
              border: `1px solid color-mix(in oklab, ${accentVar} 35%, transparent)`,
            }}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{ color: accentVar }}>
              {tag}
            </div>
            <h3 className="mt-0.5 font-display text-base font-extrabold leading-tight tracking-tight">{title}</h3>
            {subtitle ? <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p> : null}
          </div>
        </div>

        <div className="stagger">{children}</div>
      </div>
    </div>
  );
}

// ─── Trade Added / Updated ────────────────────────────────────────────────

function TradeBody({ trade }: { trade: TradeCardData }) {
  const isWin = trade.res === "WIN";
  const isCompra = trade.dir === "COMPRA";
  return (
    <>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <Cell
          label="Ativo"
          value={trade.ativo}
          icon={<Activity className="h-3 w-3" />}
        />
        <Cell
          label="Direção"
          value={trade.dir}
          accentColor={isCompra ? "var(--green)" : "var(--red)"}
          icon={isCompra ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        />
        <Cell label="Valor" value={fmtUSD(trade.valor)} />
        <Cell label="Payout" value={`${trade.payout}%`} />
      </div>

      <div
        className="flex items-center justify-between rounded-xl border px-3.5 py-3"
        style={{
          background: isWin
            ? "color-mix(in oklab, var(--green) 14%, transparent)"
            : "color-mix(in oklab, var(--red) 14%, transparent)",
          borderColor: isWin
            ? "color-mix(in oklab, var(--green) 40%, transparent)"
            : "color-mix(in oklab, var(--red) 40%, transparent)",
        }}
      >
        <div className="flex items-center gap-2">
          {isWin ? (
            <CheckCircle2 className="h-4 w-4" style={{ color: "var(--green)" }} />
          ) : (
            <XCircle className="h-4 w-4" style={{ color: "var(--red)" }} />
          )}
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: isWin ? "var(--green)" : "var(--red)" }}>
            {isWin ? "Win" : "Loss"}
          </span>
        </div>
        <div
          className="font-mono text-lg font-black tabular tracking-tight"
          style={{ color: isWin ? "var(--green)" : "var(--red)" }}
        >
          {fmtUSD(trade.lucro, true)}
        </div>
      </div>

      {trade.obs ? (
        <p className="mt-2 text-[11px] italic leading-relaxed text-muted-foreground line-clamp-2">"{trade.obs}"</p>
      ) : null}
    </>
  );
}

function TradeAddedCard({ trade }: { trade: TradeCardData }) {
  return (
    <CardShell
      accentVar="var(--green)"
      icon={<CheckCircle2 className="h-5 w-5" strokeWidth={1.75} />}
      tag="Operação registrada"
      title={`${trade.ativo} · ${trade.dir}`}
      subtitle="Adicionada à sua planilha"
    >
      <TradeBody trade={trade} />
    </CardShell>
  );
}

function TradeUpdatedCard({ trade }: { trade: TradeCardData }) {
  return (
    <CardShell
      accentVar="var(--accent)"
      icon={<Pencil className="h-5 w-5" strokeWidth={1.75} />}
      tag="Operação atualizada"
      title={`${trade.ativo} · ${trade.dir}`}
      subtitle="Dados revistos na planilha"
    >
      <TradeBody trade={trade} />
    </CardShell>
  );
}

function TradeDeletedCard({ ativo, valor, lucro, res }: { ativo: string; valor: number; lucro: number; res: "WIN" | "LOSS" }) {
  return (
    <CardShell
      accentVar="var(--red)"
      icon={<Trash2 className="h-5 w-5" strokeWidth={1.75} />}
      tag="Operação removida"
      title={ativo}
      subtitle="Excluída da sua planilha"
    >
      <div className="grid grid-cols-2 gap-2">
        <Cell label="Valor" value={fmtUSD(valor)} />
        <Cell
          label="Resultado"
          value={`${res} (${fmtUSD(lucro, true)})`}
          accentColor={res === "WIN" ? "var(--green)" : "var(--red)"}
        />
      </div>
    </CardShell>
  );
}

// ─── Cell helper ──────────────────────────────────────────────────────────

function Cell({
  label,
  value,
  icon,
  accentColor,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  accentColor?: string;
}) {
  return (
    <div
      className="rounded-lg border px-3 py-2"
      style={{ background: "color-mix(in oklab, var(--surface-2) 70%, transparent)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <div
        className="mt-0.5 font-display text-[14px] font-bold tabular leading-tight"
        style={{ color: accentColor ?? "var(--foreground)" }}
      >
        {value}
      </div>
    </div>
  );
}

// ─── Monthly Report ───────────────────────────────────────────────────────

function MonthlyReportCard({ report }: { report: MonthlyReportData }) {
  const positivo = report.lucroTotal >= 0;
  const pieData = report.byCategory.filter((c) => c.count > 0).map((c) => ({
    name: CATEGORY_LABEL[c.categoria],
    value: c.count,
    fill: CATEGORY_COLOR[c.categoria],
    cat: c.categoria,
  }));

  return (
    <CardShell
      accentVar="var(--accent)"
      icon={<PieIcon className="h-5 w-5" strokeWidth={1.75} />}
      tag="Relatório mensal"
      title={report.label}
      subtitle={`${report.totalOps} operações no período`}
    >
      <div className="mb-4 grid grid-cols-3 gap-2">
        <BigStat label="Win-rate" value={`${report.winRate}%`} accent={report.winRate >= 55 ? "var(--green)" : report.winRate >= 45 ? "var(--gold)" : "var(--red)"} />
        <BigStat label="Wins" value={String(report.wins)} accent="var(--green)" />
        <BigStat label="Losses" value={String(report.losses)} accent="var(--red)" />
      </div>

      <div
        className="mb-4 flex items-center justify-between rounded-xl border px-3.5 py-3"
        style={{
          background: positivo
            ? "color-mix(in oklab, var(--green) 12%, transparent)"
            : "color-mix(in oklab, var(--red) 12%, transparent)",
          borderColor: positivo
            ? "color-mix(in oklab, var(--green) 36%, transparent)"
            : "color-mix(in oklab, var(--red) 36%, transparent)",
        }}
      >
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: positivo ? "var(--green)" : "var(--red)" }}>
          {positivo ? "Resultado positivo" : "Resultado negativo"}
        </span>
        <span className="font-mono text-lg font-black tabular" style={{ color: positivo ? "var(--green)" : "var(--red)" }}>
          {fmtUSD(report.lucroTotal, true)}
        </span>
      </div>

      {pieData.length > 0 ? (
        <div className="rounded-xl border p-3" style={{ background: "color-mix(in oklab, var(--surface-2) 60%, transparent)", borderColor: "var(--border)" }}>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Operações por categoria</span>
            {report.melhorAtivo ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold" style={{ color: "var(--gold)" }}>
                <Crown className="h-3 w-3" /> {report.melhorAtivo}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-4">
            <div className="h-[110px] w-[110px] flex-none">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" innerRadius={32} outerRadius={50} paddingAngle={2} stroke="none">
                    {pieData.map((entry, i) => (
                      <PieCell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 space-y-1.5">
              {report.byCategory.filter((c) => c.count > 0).map((c) => {
                const wr = c.count ? Math.round((c.wins / c.count) * 100) : 0;
                return (
                  <li key={c.categoria} className="flex items-center gap-2 text-[11px]">
                    <span
                      className="h-2 w-2 flex-none rounded-full"
                      style={{ background: CATEGORY_COLOR[c.categoria] }}
                    />
                    <span className="flex-1 font-semibold">{CATEGORY_LABEL[c.categoria]}</span>
                    <span className="text-muted-foreground tabular">{c.count} · WR {wr}%</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border px-4 py-3 text-center text-[12px] text-muted-foreground"
          style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
          Sem operações registradas neste período.
        </div>
      )}
    </CardShell>
  );
}

// ─── Win Report ───────────────────────────────────────────────────────────

function WinReportCard({ report }: { report: WinReportData }) {
  const positivo = report.lucroTotal >= 0;
  const wrColor = report.winRate >= 55 ? "var(--green)" : report.winRate >= 45 ? "var(--gold)" : "var(--red)";
  return (
    <CardShell
      accentVar="var(--gold)"
      icon={<Trophy className="h-5 w-5" strokeWidth={1.75} />}
      tag="Balanço de operações"
      title={report.label}
      subtitle={`${report.totalOps} operações registradas`}
    >
      {report.totalOps === 0 ? (
        <div className="rounded-xl border px-4 py-3 text-center text-[12px] text-muted-foreground"
          style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}>
          Sem operações no período. Registre uma trade no chat para começar.
        </div>
      ) : (
        <>
          {/* Win/loss bar */}
          <div className="mb-3">
            <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <span>Win-rate</span>
              <span className="font-display text-base font-black" style={{ color: wrColor }}>{report.winRate}%</span>
            </div>
            <div className="relative h-2.5 overflow-hidden rounded-full" style={{ background: "color-mix(in oklab, var(--red) 22%, var(--surface-2))" }}>
              <div
                className="absolute left-0 top-0 h-full smooth"
                style={{
                  width: `${report.winRate}%`,
                  background: "color-mix(in oklab, var(--green) 80%, transparent)",
                  boxShadow: "0 0 12px color-mix(in oklab, var(--green) 60%, transparent)",
                }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground tabular">
              <span><span style={{ color: "var(--green)" }}>{report.wins}</span> wins</span>
              <span><span style={{ color: "var(--red)" }}>{report.losses}</span> losses</span>
            </div>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2">
            <Cell
              label="Maior sequência ✓"
              value={`${report.bestStreak} ${report.bestStreak === 1 ? "win" : "wins"}`}
              icon={<Flame className="h-3 w-3" />}
              accentColor="var(--green)"
            />
            <Cell
              label="Maior sequência ✗"
              value={`${report.worstStreak} ${report.worstStreak === 1 ? "loss" : "losses"}`}
              icon={<Shield className="h-3 w-3" />}
              accentColor="var(--red)"
            />
          </div>

          <div
            className="flex items-center justify-between rounded-xl border px-3.5 py-3"
            style={{
              background: positivo
                ? "color-mix(in oklab, var(--green) 12%, transparent)"
                : "color-mix(in oklab, var(--red) 12%, transparent)",
              borderColor: positivo
                ? "color-mix(in oklab, var(--green) 36%, transparent)"
                : "color-mix(in oklab, var(--red) 36%, transparent)",
            }}
          >
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: positivo ? "var(--green)" : "var(--red)" }}>
              <Calendar className="h-3 w-3" />
              Resultado do período
            </span>
            <span className="font-mono text-lg font-black tabular" style={{ color: positivo ? "var(--green)" : "var(--red)" }}>
              {fmtUSD(report.lucroTotal, true)}
            </span>
          </div>
        </>
      )}
    </CardShell>
  );
}

// ─── Big stat (relatórios) ────────────────────────────────────────────────

function BigStat({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div
      className="rounded-xl border px-3 py-3 text-center"
      style={{ background: "color-mix(in oklab, var(--surface-2) 60%, transparent)", borderColor: "var(--border)" }}
    >
      <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-display text-xl font-black tabular leading-none" style={{ color: accent ?? "var(--foreground)" }}>
        {value}
      </div>
    </div>
  );
}

// ─── Router ───────────────────────────────────────────────────────────────

export function MindCardRenderer({ card }: { card: MindCard }) {
  switch (card.type) {
    case "trade_added":
      return <TradeAddedCard trade={card.trade} />;
    case "trade_updated":
      return <TradeUpdatedCard trade={card.trade} />;
    case "trade_deleted":
      return <TradeDeletedCard ativo={card.ativo} valor={card.valor} lucro={card.lucro} res={card.res} />;
    case "monthly_report":
      return <MonthlyReportCard report={card.report} />;
    case "win_report":
      return <WinReportCard report={card.report} />;
    default:
      return null;
  }
}
