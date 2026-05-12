import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "danger" | "accent" | "warning";

const toneColor: Record<Tone, string> = {
  neutral: "var(--foreground)",
  success: "var(--green)",
  danger: "var(--red)",
  accent: "var(--accent)",
  warning: "var(--gold)",
};

export function StatCard({
  label,
  value,
  hint,
  icon,
  tone = "neutral",
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  icon?: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      className={cn("card-glow rounded-xl border p-4", className)}
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
        {icon && <span style={{ color: toneColor[tone], filter: `drop-shadow(0 0 6px color-mix(in oklab, ${toneColor[tone]} 50%, transparent))` }}>{icon}</span>}
      </div>
      <div
        className="mt-2 font-display text-2xl font-semibold tabular tracking-tight"
        style={{ color: toneColor[tone] }}
      >
        {value}
      </div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}