import { Crown, PieChart as PieIcon } from "lucide-react";
import { PieChart, Pie, Cell as PieCell, ResponsiveContainer } from "recharts";
import type { MonthlyReportData, ReportByCategory } from "@/lib/mind-cards";
import { CardShell, BigStat, CATEGORY_LABEL, fmtUSD } from "./MindCards";

// Componente separado em arquivo próprio pra permitir lazy-load — puxa
// `recharts` (~800KB) que só precisa carregar quando a IA gera um
// relatório mensal (raro), não em cards triviais de trade add/update.

function PieDonutLabel({ cx, cy, totalOps }: { cx?: number; cy?: number; totalOps: number }) {
  return (
    <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle">
      <tspan
        x={cx}
        dy="-5"
        fontSize="15"
        fontWeight="800"
        fill="var(--foreground)"
        fontFamily="var(--font-display)"
      >
        {totalOps}
      </tspan>
      <tspan
        x={cx}
        dy="13"
        fontSize="8"
        fontWeight="600"
        fill="var(--text-muted)"
        letterSpacing="0.08em"
      >
        OPS
      </tspan>
    </text>
  );
}

const VIVID_COLORS: Record<ReportByCategory["categoria"], string> = {
  CRIPTO: "oklch(0.68 0.22 245)",
  FOREX: "oklch(0.76 0.18 200)",
  ACOES: "oklch(0.82 0.16 80)",
  OUTROS: "oklch(0.65 0.20 295)",
};

function MonthlyReportCard({ report }: { report: MonthlyReportData }) {
  const positivo = report.lucroTotal >= 0;

  const vividPieData = report.byCategory
    .filter((c) => c.count > 0)
    .map((c) => ({
      name: CATEGORY_LABEL[c.categoria],
      value: c.count,
      fill: VIVID_COLORS[c.categoria],
      cat: c.categoria,
    }));

  return (
    <CardShell
      accentVar="var(--accent)"
      variant="report"
      icon={<PieIcon className="h-5 w-5" strokeWidth={1.75} />}
      tag="Relatório mensal"
      title={report.label}
      subtitle={`${report.totalOps} operações no período`}
    >
      <div className="mb-3 grid grid-cols-3 gap-2">
        <BigStat
          label="Win-rate"
          value={`${report.winRate}%`}
          accent={
            report.winRate >= 55
              ? "var(--green)"
              : report.winRate >= 45
                ? "var(--gold)"
                : "var(--red)"
          }
        />
        <BigStat label="Wins" value={String(report.wins)} accent="var(--green)" />
        <BigStat label="Losses" value={String(report.losses)} accent="var(--red)" />
      </div>

      <div
        className="mb-3 flex items-center justify-between rounded-xl border px-3 py-2.5"
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
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: positivo ? "var(--green)" : "var(--red)" }}
        >
          {positivo ? "Resultado positivo" : "Resultado negativo"}
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

      {vividPieData.length > 0 ? (
        <div
          className="rounded-xl border p-3"
          style={{
            background: "color-mix(in oklab, var(--surface-2) 60%, transparent)",
            borderColor: "var(--border)",
          }}
        >
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">
              Operações por categoria
            </span>
            {report.melhorAtivo ? (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-bold"
                style={{ color: "var(--gold)" }}
              >
                <Crown className="h-3 w-3" aria-hidden="true" /> {report.melhorAtivo}
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative h-[100px] w-[100px] flex-none">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={vividPieData}
                    dataKey="value"
                    innerRadius={30}
                    outerRadius={46}
                    paddingAngle={3}
                    stroke="none"
                    labelLine={false}
                    label={<PieDonutLabel totalOps={report.totalOps} />}
                    isAnimationActive={true}
                    animationBegin={200}
                    animationDuration={700}
                  >
                    {vividPieData.map((entry, i) => (
                      <PieCell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="flex-1 min-w-0 space-y-1.5">
              {report.byCategory
                .filter((c) => c.count > 0)
                .map((c) => {
                  const wr = c.count ? Math.round((c.wins / c.count) * 100) : 0;
                  return (
                    <li key={c.categoria} className="flex items-center gap-2 text-[11px] min-w-0">
                      <span
                        className="h-2 w-2 flex-none rounded-full"
                        style={{ background: VIVID_COLORS[c.categoria] }}
                      />
                      <span className="flex-1 truncate font-semibold">
                        {CATEGORY_LABEL[c.categoria]}
                      </span>
                      <span className="tabular text-muted-foreground whitespace-nowrap">
                        {c.count} · {wr}%
                      </span>
                    </li>
                  );
                })}
            </ul>
          </div>
        </div>
      ) : (
        <div
          className="rounded-xl border px-4 py-3 text-center text-[12px] text-muted-foreground"
          style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
        >
          Sem operações registradas neste período.
        </div>
      )}
    </CardShell>
  );
}

export default MonthlyReportCard;
