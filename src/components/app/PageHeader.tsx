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
    // Mobile: stack vertical (title em cima, actions abaixo) pra evitar que
    // botões disputem espaço com title longo e o quebrem char-by-char.
    // Desktop: row horizontal com justify-between.
    <header className="mb-6 flex flex-col gap-3 fade-up sm:flex-row sm:flex-wrap sm:items-start sm:justify-between sm:gap-4">
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
          {/* leading-tight + sem break-words: deixa wrap em word-boundary
              natural, e min-w-0 do parent permite que o texto encolha. */}
          <h1 className="font-display text-xl font-semibold leading-tight tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex flex-wrap items-center gap-2 sm:flex-none">{actions}</div>
      )}
    </header>
  );
}
