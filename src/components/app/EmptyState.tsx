import type { ReactNode } from "react";

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div
      className="flex flex-col items-center rounded-xl border px-6 py-14 text-center fade-in"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      {icon && (
        <div
          className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border"
          style={{
            background: "var(--surface-2)",
            borderColor: "var(--border)",
            color: "var(--text-muted)",
          }}
        >
          {icon}
        </div>
      )}
      <div className="font-display text-base font-semibold">{title}</div>
      {description && (
        <div className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</div>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
