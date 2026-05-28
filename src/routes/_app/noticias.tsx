import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Newspaper, RefreshCw, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_app/noticias")({
  head: () => ({ meta: [{ title: "Notícias — OrionHub" }] }),
  component: NoticiasPage,
});

type Impact = "High" | "Medium" | "Low" | "Holiday" | "None";
type CalendarItem = {
  title: string;
  country: string;
  date: string;
  impact: Impact;
  forecast?: string;
  previous?: string;
  actual?: string;
};

const IMPACT_LABEL: Record<Impact, string> = {
  High: "Alto",
  Medium: "Médio",
  Low: "Baixo",
  Holiday: "Feriado",
  None: "—",
};

function impactStyle(i: Impact) {
  if (i === "High")
    return {
      bg: "color-mix(in oklab, var(--red) 14%, transparent)",
      color: "var(--red)",
      border: "color-mix(in oklab, var(--red) 32%, transparent)",
    };
  if (i === "Medium")
    return {
      bg: "color-mix(in oklab, var(--gold) 14%, transparent)",
      color: "var(--gold)",
      border: "color-mix(in oklab, var(--gold) 32%, transparent)",
    };
  if (i === "Low")
    return {
      bg: "color-mix(in oklab, var(--green) 12%, transparent)",
      color: "var(--green)",
      border: "color-mix(in oklab, var(--green) 28%, transparent)",
    };
  return { bg: "var(--surface-2)", color: "var(--text-muted)", border: "var(--border)" };
}

function NoticiasPage() {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState<"all" | "High" | "Medium" | "Low">("all");
  const abortRef = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    // Cancela uma requisição anterior em andamento (cliques repetidos em "Atualizar").
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setErr("");
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess.session?.access_token;
      const r = await fetch("/api/calendar", {
        cache: "no-store",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        signal: controller.signal,
      });
      const data = await r.json();
      if (!Array.isArray(data)) throw new Error("Não foi possível carregar o calendário.");
      if (!controller.signal.aborted) setItems(data as CalendarItem[]);
    } catch (e) {
      if ((e as Error)?.name === "AbortError" || controller.signal.aborted) return;
      setErr((e as Error).message);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    return () => abortRef.current?.abort();
  }, [load]);

  const grouped = useMemo(() => {
    const list = items.filter((it) => filter === "all" || it.impact === filter);
    const map = new Map<string, CalendarItem[]>();
    for (const it of list) {
      const key = new Date(it.date).toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "long",
      });
      const arr = map.get(key) ?? [];
      arr.push(it);
      map.set(key, arr);
    }
    return Array.from(map.entries());
  }, [items, filter]);

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8">
      <PageHeader
        title="Notícias & Calendário"
        description="Eventos econômicos da semana classificados por impacto no mercado."
        icon={<Newspaper className="h-5 w-5" strokeWidth={1.75} />}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => void load()}
            disabled={loading}
            className="gap-1.5"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Atualizar
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2 fade-in">
        {(["all", "High", "Medium", "Low"] as const).map((f) => {
          const active = filter === f;
          const label = f === "all" ? "Todos" : IMPACT_LABEL[f];
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="rounded-full border px-3 py-1 text-xs font-medium smooth press hover:-translate-y-px"
              style={
                active
                  ? {
                      background: "color-mix(in oklab, var(--accent) 14%, transparent)",
                      color: "var(--accent)",
                      borderColor: "color-mix(in oklab, var(--accent) 35%, transparent)",
                      boxShadow:
                        "0 6px 18px -10px color-mix(in oklab, var(--accent) 60%, transparent)",
                    }
                  : {
                      background: "var(--surface)",
                      color: "var(--text-muted)",
                      borderColor: "var(--border-strong)",
                    }
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="space-y-6">
          {[0, 1].map((g) => (
            <div key={g} className="fade-in" style={{ animationDelay: `${g * 80}ms` }}>
              <div
                className="skeleton-shimmer mb-2 ml-1 h-2.5 w-32 rounded-full"
                style={{
                  background: "color-mix(in oklab, var(--text-dim) 25%, transparent)",
                  animationDelay: `${g * 100}ms`,
                }}
              />
              <div
                className="overflow-hidden rounded-xl border"
                style={{ background: "var(--surface)", borderColor: "var(--border)" }}
              >
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="skeleton-shimmer flex items-center gap-3 border-b px-4 py-3 last:border-b-0"
                    style={{
                      borderColor: "var(--border)",
                      animationDelay: `${(g * 3 + i) * 60}ms`,
                    }}
                  >
                    <div
                      className="h-2.5 w-12 flex-none rounded-full"
                      style={{
                        background: "color-mix(in oklab, var(--text-dim) 25%, transparent)",
                      }}
                    />
                    <div
                      className="h-5 w-14 flex-none rounded-full"
                      style={{
                        background: "color-mix(in oklab, var(--text-dim) 20%, transparent)",
                      }}
                    />
                    <div
                      className="h-2.5 w-8 flex-none rounded-full"
                      style={{
                        background: "color-mix(in oklab, var(--text-dim) 22%, transparent)",
                      }}
                    />
                    <div
                      className="h-2.5 flex-1 rounded-full"
                      style={{
                        background: "color-mix(in oklab, var(--text-dim) 28%, transparent)",
                        maxWidth: `${50 + i * 12}%`,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {err && !loading && (
        <div
          className="rounded-xl border p-5 text-sm fade-up"
          style={{
            background: "color-mix(in oklab, var(--red) 6%, transparent)",
            borderColor: "color-mix(in oklab, var(--red) 22%, transparent)",
            color: "var(--red)",
          }}
        >
          Erro ao carregar notícias: {err}
        </div>
      )}

      {!loading &&
        !err &&
        grouped.map(([day, evs], dayIdx) => (
          <div key={day} className="mb-6 fade-up" style={{ animationDelay: `${dayIdx * 60}ms` }}>
            <div className="mb-2 px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
              {day}
            </div>
            <div
              className="overflow-hidden rounded-xl border"
              style={{ background: "var(--surface)", borderColor: "var(--border)" }}
            >
              {evs.map((ev, i) => {
                const s = impactStyle(ev.impact);
                return (
                  <div
                    key={`${ev.date}-${ev.country}-${ev.title}-${i}`}
                    className="flex items-center gap-3 border-b px-4 py-3 transition-colors last:border-b-0 hover:bg-[color:var(--surface-2)]"
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="w-12 flex-none font-mono text-xs tabular text-muted-foreground">
                      {new Date(ev.date).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <Badge
                      variant="outline"
                      className="min-w-14 justify-center"
                      style={{ background: s.bg, color: s.color, borderColor: s.border }}
                    >
                      {IMPACT_LABEL[ev.impact]}
                    </Badge>
                    <div className="w-12 flex-none font-mono text-[11px] uppercase text-muted-foreground">
                      {ev.country}
                    </div>
                    <div className="min-w-0 flex-1 truncate text-sm font-medium">{ev.title}</div>
                    <div className="hidden gap-3 font-mono text-[10px] text-muted-foreground sm:flex">
                      <span>P: {ev.previous || "—"}</span>
                      <span>F: {ev.forecast || "—"}</span>
                      <span style={{ color: ev.actual ? "var(--foreground)" : undefined }}>
                        A: {ev.actual || "—"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
    </div>
  );
}
