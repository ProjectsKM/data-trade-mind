import { lazy, Suspense } from "react";
import {
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Pencil,
  Trash2,
  Trophy,
  Calendar,
  Activity,
  Flame,
  Shield,
} from "lucide-react";
import type { MindCard, TradeCardData, WinReportData, ReportByCategory } from "@/lib/mind-cards";

// MonthlyReportCard puxa `recharts` (~800KB). É lazy aqui pra não pesar
// na primeira renderização de um trade_added/win_report.
const MonthlyReportCard = lazy(() => import("./MonthlyReportCard"));

// ─── Helpers ──────────────────────────────────────────────────────────────

export function fmtUSD(n: number, withSign = false) {
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

export const CATEGORY_LABEL: Record<ReportByCategory["categoria"], string> = {
  CRIPTO: "Cripto",
  FOREX: "Forex",
  ACOES: "Ações",
  OUTROS: "Outros",
};

// ─── Wrapper visual compartilhado ─────────────────────────────────────────

export function CardShell({
  accentVar,
  icon,
  tag,
  title,
  subtitle,
  children,
  variant = "default",
}: {
  accentVar: string;
  icon: React.ReactNode;
  tag: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  variant?: "win" | "loss" | "delete" | "report" | "default";
}) {
  const entryClass = {
    win: "card-enter-win",
    loss: "card-enter-loss",
    delete: "card-enter-delete",
    report: "card-enter-report",
    default: "card-reveal",
  }[variant];

  return (
    <div
      className={`orion-mind-card ${entryClass} card-glow w-full max-w-[min(28rem,calc(100vw-5rem))] overflow-hidden rounded-2xl border`}
      style={
        {
          "--card-accent": accentVar,
          background: `linear-gradient(160deg, color-mix(in oklab, ${accentVar} 14%, var(--surface)), var(--surface))`,
          borderColor: `color-mix(in oklab, ${accentVar} 38%, var(--border-strong))`,
          boxShadow: `0 24px 60px -28px color-mix(in oklab, ${accentVar} 60%, transparent), 0 0 1px color-mix(in oklab, ${accentVar} 40%, transparent)`,
        } as React.CSSProperties
      }
    >
      {/* Stripe animado com shimmer na entrada */}
      <div
        aria-hidden
        className="stripe-shimmer h-[3px] w-full"
        style={{
          background: `linear-gradient(90deg, transparent 0%, ${accentVar} 30%, color-mix(in oklab, white 60%, ${accentVar}) 50%, ${accentVar} 70%, transparent 100%)`,
        }}
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
            <div
              className="text-[10px] font-bold uppercase tracking-[0.25em]"
              style={{ color: accentVar }}
            >
              {tag}
            </div>
            <h3 className="mt-0.5 font-display text-[15px] font-extrabold leading-tight tracking-tight min-w-0 truncate">
              {title}
            </h3>
            {subtitle ? (
              <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </div>

        <div>{children}</div>
      </div>
    </div>
  );
}

// ─── Trade Added / Updated ────────────────────────────────────────────────

/* ── Animated WIN checkmark (SVG CSS) ─── */
function WinIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      style={{ color: "var(--green)", flexShrink: 0 }}
    >
      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <polyline
        className="check-draw"
        points="5,9.5 7.8,12.2 13,6.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ── Animated LOSS X (SVG CSS) ─── */
function LossIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      style={{ color: "var(--red)", flexShrink: 0 }}
    >
      <circle cx="9" cy="9" r="8" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <line
        className="x-draw-1"
        x1="6"
        y1="6"
        x2="12"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        className="x-draw-2"
        x1="12"
        y1="6"
        x2="6"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TradeBody({ trade }: { trade: TradeCardData }) {
  const isWin = trade.res === "WIN";
  const isCompra = trade.dir === "COMPRA";
  return (
    <>
      <div className="mb-3 grid grid-cols-2 gap-2">
        <Cell label="Ativo" value={trade.ativo} icon={<Activity className="h-3 w-3" />} />
        <Cell
          label="Direção"
          value={trade.dir}
          accentColor={isCompra ? "var(--green)" : "var(--red)"}
          icon={
            isCompra ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
          }
        />
        <Cell label="Valor" value={fmtUSD(trade.valor)} />
        <Cell label="Payout" value={`${trade.payout}%`} />
      </div>

      <div
        className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${isWin ? "win-glow-pulse" : "loss-shake"}`}
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
          {isWin ? <WinIcon /> : <LossIcon />}
          <span
            className="text-[10px] font-bold uppercase tracking-widest"
            style={{ color: isWin ? "var(--green)" : "var(--red)" }}
          >
            {isWin ? "Win" : "Loss"}
          </span>
        </div>
        <span
          className="value-pop font-mono text-lg font-black tabular tracking-tight"
          style={{ color: isWin ? "var(--green)" : "var(--red)" }}
        >
          {fmtUSD(trade.lucro, true)}
        </span>
      </div>

      {trade.obs ? (
        <p className="mt-2 text-[11px] italic leading-relaxed text-muted-foreground line-clamp-2">
          "{trade.obs}"
        </p>
      ) : null}
    </>
  );
}

function TradeAddedCard({ trade }: { trade: TradeCardData }) {
  return (
    <CardShell
      accentVar="var(--green)"
      variant={trade.res === "WIN" ? "win" : "loss"}
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
      accentVar={trade.res === "WIN" ? "var(--green)" : "var(--red)"}
      variant={trade.res === "WIN" ? "win" : "loss"}
      icon={<Pencil className="h-5 w-5" strokeWidth={1.75} />}
      tag="Operação atualizada"
      title={`${trade.ativo} · ${trade.dir}`}
      subtitle="Dados revistos na planilha"
    >
      <TradeBody trade={trade} />
    </CardShell>
  );
}

function TradeDeletedCard({
  ativo,
  valor,
  lucro,
  res,
}: {
  ativo: string;
  valor: number;
  lucro: number;
  res: "WIN" | "LOSS";
}) {
  return (
    <CardShell
      accentVar="var(--red)"
      variant="delete"
      icon={<Trash2 className="h-5 w-5" strokeWidth={1.75} />}
      tag="Operação removida"
      title={ativo}
      subtitle={`Excluída da planilha · ${res === "WIN" ? "era uma win" : "era uma loss"}`}
    >
      <div className="grid grid-cols-2 gap-2">
        <Cell label="Valor" value={fmtUSD(valor)} />
        <Cell
          label="Resultado"
          value={`${res} (${fmtUSD(lucro, true)})`}
          accentColor={res === "WIN" ? "var(--green)" : "var(--red)"}
        />
      </div>
      <div
        className="mt-3 flex items-center gap-2 rounded-lg border px-3 py-2"
        style={{
          background: "color-mix(in oklab, var(--red) 10%, transparent)",
          borderColor: "color-mix(in oklab, var(--red) 30%, transparent)",
        }}
      >
        <Trash2 className="h-3.5 w-3.5 flex-none" style={{ color: "var(--red)" }} />
        <span
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: "var(--red)" }}
        >
          Removida permanentemente
        </span>
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
      className="rounded-lg border px-2.5 py-2 min-w-0"
      style={{
        background: "color-mix(in oklab, var(--surface-2) 70%, transparent)",
        borderColor: "var(--border)",
      }}
    >
      <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground truncate">
        {icon && <span className="flex-none">{icon}</span>}
        <span className="truncate">{label}</span>
      </div>
      <div
        className="mt-0.5 font-display text-[13px] font-bold tabular leading-tight break-words"
        style={{ color: accentColor ?? "var(--foreground)" }}
      >
        {value}
      </div>
    </div>
  );
}

// ─── Win Report ───────────────────────────────────────────────────────────

function WinReportCard({ report }: { report: WinReportData }) {
  const positivo = report.lucroTotal >= 0;
  const wrColor =
    report.winRate >= 55 ? "var(--green)" : report.winRate >= 45 ? "var(--gold)" : "var(--red)";
  const barColor =
    report.winRate >= 55
      ? "color-mix(in oklab, var(--green) 85%, transparent)"
      : report.winRate >= 45
        ? "color-mix(in oklab, var(--gold) 85%, transparent)"
        : "color-mix(in oklab, var(--red) 85%, transparent)";
  const barGlow =
    report.winRate >= 55
      ? "0 0 10px color-mix(in oklab, var(--green) 55%, transparent)"
      : report.winRate >= 45
        ? "0 0 10px color-mix(in oklab, var(--gold) 50%, transparent)"
        : "0 0 10px color-mix(in oklab, var(--red) 50%, transparent)";

  return (
    <CardShell
      accentVar="var(--gold)"
      variant="report"
      icon={<Trophy className="h-5 w-5" strokeWidth={1.75} />}
      tag="Balanço de operações"
      title={report.label}
      subtitle={`${report.totalOps} operações registradas`}
    >
      {report.totalOps === 0 ? (
        <div
          className="rounded-xl border px-4 py-3 text-center text-[12px] text-muted-foreground"
          style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
        >
          Sem operações no período. Registre uma trade no chat para começar.
        </div>
      ) : (
        <>
          {/* Win/loss bar animada */}
          <div className="mb-3">
            <div className="mb-1.5 flex items-center justify-between text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
              <span>Win-rate</span>
              <span
                className="value-pop font-display text-base font-black"
                style={{ color: wrColor }}
              >
                {report.winRate}%
              </span>
            </div>
            <div
              className="relative h-2.5 overflow-hidden rounded-full"
              style={{ background: "color-mix(in oklab, var(--surface-3) 80%, var(--red) 20%)" }}
            >
              <div
                className="win-rate-bar-anim absolute left-0 top-0 h-full rounded-full"
                style={
                  {
                    "--bar-target": `${report.winRate}%`,
                    background: barColor,
                    boxShadow: barGlow,
                  } as React.CSSProperties
                }
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground tabular">
              <span>
                <span style={{ color: "var(--green)" }}>{report.wins}</span> wins
              </span>
              <span>
                <span style={{ color: "var(--red)" }}>{report.losses}</span> losses
              </span>
            </div>
          </div>

          <div className="mb-3 grid grid-cols-2 gap-2">
            <Cell
              label="Melhor sequência"
              value={`${report.bestStreak} ${report.bestStreak === 1 ? "win" : "wins"}`}
              icon={<Flame className="h-3 w-3" />}
              accentColor="var(--green)"
            />
            <Cell
              label="Pior sequência"
              value={`${report.worstStreak} ${report.worstStreak === 1 ? "loss" : "losses"}`}
              icon={<Shield className="h-3 w-3" />}
              accentColor="var(--red)"
            />
          </div>

          <div
            className="flex items-center justify-between rounded-xl border px-3 py-2.5"
            style={{
              background: positivo
                ? "color-mix(in oklab, var(--green) 12%, transparent)"
                : "color-mix(in oklab, var(--red) 12%, transparent)",
              borderColor: positivo
                ? "color-mix(in oklab, var(--green) 36%, transparent)"
                : "color-mix(in oklab, var(--red) 36%, transparent)",
            }}
          >
            <span
              className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest"
              style={{ color: positivo ? "var(--green)" : "var(--red)" }}
            >
              <Calendar className="h-3 w-3" aria-hidden="true" />
              Resultado do período
            </span>
            <span
              className="num-reveal font-mono text-lg font-black tabular tracking-tight"
              style={
                {
                  color: positivo ? "var(--green)" : "var(--red)",
                  "--num-glow-color": positivo ? "var(--green)" : "var(--red)",
                } as React.CSSProperties
              }
            >
              {fmtUSD(report.lucroTotal, true)}
            </span>
          </div>

          {/* Lista das operações do período */}
          {report.trades && report.trades.length > 0 && (
            <div className="mt-3">
              <div className="mb-1.5 text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
                Operações ({report.trades.length})
              </div>
              <div
                className="max-h-56 space-y-1 overflow-y-auto rounded-xl border p-1.5"
                style={{
                  background: "color-mix(in oklab, var(--surface-2) 50%, transparent)",
                  borderColor: "var(--border)",
                }}
              >
                {report.trades.map((t, i) => {
                  const win = t.res === "WIN";
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2 rounded-lg px-2 py-1.5"
                      style={{ background: "color-mix(in oklab, var(--surface) 70%, transparent)" }}
                    >
                      <span className="min-w-0 flex-1 truncate font-mono text-[11px] font-semibold">
                        {t.ativo}
                      </span>
                      <span
                        className="flex-none rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                        style={{
                          background:
                            t.dir === "COMPRA"
                              ? "color-mix(in oklab, var(--green) 16%, transparent)"
                              : "color-mix(in oklab, var(--red) 16%, transparent)",
                          color: t.dir === "COMPRA" ? "var(--green)" : "var(--red)",
                        }}
                      >
                        {t.dir}
                      </span>
                      <span className="flex-none font-mono text-[10px] tabular text-muted-foreground">
                        {fmtUSD(t.valor)}
                      </span>
                      <span
                        className="w-16 flex-none text-right font-mono text-[11px] font-bold tabular"
                        style={{ color: win ? "var(--green)" : "var(--red)" }}
                      >
                        {fmtUSD(t.lucro, true)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </CardShell>
  );
}

// ─── Big stat (relatórios) ────────────────────────────────────────────────

export function BigStat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div
      className="rounded-xl border px-3 py-3 text-center"
      style={{
        background: "color-mix(in oklab, var(--surface-2) 60%, transparent)",
        borderColor: "var(--border)",
      }}
    >
      <div className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div
        className="mt-1 font-display text-xl font-black tabular leading-none"
        style={{ color: accent ?? "var(--foreground)" }}
      >
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
      return (
        <TradeDeletedCard ativo={card.ativo} valor={card.valor} lucro={card.lucro} res={card.res} />
      );
    case "monthly_report":
      return (
        <Suspense fallback={null}>
          <MonthlyReportCard report={card.report} />
        </Suspense>
      );
    case "win_report":
      return <WinReportCard report={card.report} />;
    default:
      return null;
  }
}
