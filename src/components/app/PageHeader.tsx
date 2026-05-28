import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  icon,
  actions,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-start justify-between gap-4 fade-up">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        {icon && (
          <div
            className="flex h-10 w-10 flex-none items-center justify-center rounded-lg border"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
              color: "var(--accent)",
            }}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-semibold tracking-tight text-foreground break-words sm:text-2xl">
            {title}
          </h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
