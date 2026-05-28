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
      className={cn("card-glow min-w-0 overflow-hidden rounded-xl border p-4", className)}
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between gap-2 text-muted-foreground">
        <span className="min-w-0 truncate text-[11px] font-medium uppercase tracking-wide">{label}</span>
        {icon && (
          <span
            className="flex-none"
            style={{
              color: toneColor[tone],
              filter: `drop-shadow(0 0 3px color-mix(in oklab, ${toneColor[tone]} 28%, transparent))`,
            }}
          >
            {icon}
          </span>
        )}
      </div>
      <div
        className="mt-2 font-display text-xl font-semibold tabular tracking-tight truncate sm:text-2xl"
        style={{ color: toneColor[tone] }}
      >
        {value}
      </div>
      {hint && <div className="mt-1 truncate text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}