import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Newspaper, RefreshCw, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/app/PageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  if (i === "High") return { bg: "color-mix(in oklab, var(--red) 14%, transparent)", color: "var(--red)", border: "color-mix(in oklab, var(--red) 32%, transparent)" };
  if (i === "Medium") return { bg: "color-mix(in oklab, var(--gold) 14%, transparent)", color: "var(--gold)", border: "color-mix(in oklab, var(--gold) 32%, transparent)" };
  if (i === "Low") return { bg: "color-mix(in oklab, var(--green) 12%, transparent)", color: "var(--green)", border: "color-mix(in oklab, var(--green) 28%, transparent)" };
  return { bg: "var(--surface-2)", color: "var(--text-muted)", border: "var(--border)" };
}

function NoticiasPage() {
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [filter, setFilter] = useState<"all" | "High" | "Medium" | "Low">("all");

  async function load() {
    setLoading(true);
    setErr("");
    try {
      const r = await fetch("/api/calendar", { cache: "no-store" });
      const data = await r.json();
      if (!Array.isArray(data)) throw new Error("Resposta inválida");
      setItems(data as CalendarItem[]);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  const grouped = useMemo(() => {
    const list = items.filter((it) => filter === "all" || it.impact === filter);
    const map = new Map<string, CalendarItem[]>();
    for (const it of list) {
      const key = new Date(it.date).toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
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
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading} className="gap-1.5">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Atualizar
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "High", "Medium", "Low"] as const).map((f) => {
          const active = filter === f;
          const label = f === "all" ? "Todos" : IMPACT_LABEL[f];
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="rounded-full border px-3 py-1 text-xs font-medium smooth"
              style={
                active
                  ? { background: "color-mix(in oklab, var(--accent) 14%, transparent)", color: "var(--accent)", borderColor: "color-mix(in oklab, var(--accent) 35%, transparent)" }
                  : { background: "var(--surface)", color: "var(--text-muted)", borderColor: "var(--border-strong)" }
              }
            >
              {label}
            </button>
          );
        })}
      </div>

      {loading && (
        <div className="rounded-xl border p-10 text-center fade-in" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
          <Loader2 className="mx-auto h-6 w-6 animate-spin" style={{ color: "var(--accent)" }} />
          <div className="mt-3 text-sm text-muted-foreground">Carregando calendário…</div>
        </div>
      )}

      {err && !loading && (
        <div className="rounded-xl border p-5 text-sm" style={{ background: "color-mix(in oklab, var(--red) 6%, transparent)", borderColor: "color-mix(in oklab, var(--red) 22%, transparent)", color: "var(--red)" }}>
          Erro ao carregar notícias: {err}
        </div>
      )}

      {!loading && !err && grouped.map(([day, evs]) => (
        <div key={day} className="mb-6">
          <div className="mb-2 px-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{day}</div>
          <div className="overflow-hidden rounded-xl border" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
            {evs.map((ev, i) => {
              const s = impactStyle(ev.impact);
              return (
                <div key={i} className="flex items-center gap-3 border-b px-4 py-3 last:border-b-0" style={{ borderColor: "var(--border)" }}>
                  <div className="w-12 flex-none font-mono text-xs tabular text-muted-foreground">
                    {new Date(ev.date).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                  </div>
                  <Badge variant="outline" className="min-w-14 justify-center" style={{ background: s.bg, color: s.color, borderColor: s.border }}>
                    {IMPACT_LABEL[ev.impact]}
                  </Badge>
                  <div className="w-12 flex-none font-mono text-[11px] uppercase text-muted-foreground">{ev.country}</div>
                  <div className="min-w-0 flex-1 truncate text-sm font-medium">{ev.title}</div>
                  <div className="hidden gap-3 font-mono text-[10px] text-muted-foreground sm:flex">
                    <span>P: {ev.previous || "—"}</span>
                    <span>F: {ev.forecast || "—"}</span>
                    <span style={{ color: ev.actual ? "var(--foreground)" : undefined }}>A: {ev.actual || "—"}</span>
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
