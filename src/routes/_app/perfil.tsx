import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Crown,
  Mail,
  Globe,
  Calendar,
  LogOut,
  Save,
  Sparkles,
  TrendingUp,
  ClipboardList,
  Loader2,
} from "lucide-react";
import { logout, useAppState, useUser } from "@/lib/store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";

export const Route = createFileRoute("/_app/perfil")({
  head: () => ({ meta: [{ title: "Perfil — OrionHub" }] }),
  component: PerfilPage,
});

type Profile = { name: string | null; email: string | null; country: string | null };

function PerfilPage() {
  const nav = useNavigate();
  const { user } = useUser();
  const { state } = useAppState();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    supabase
      .from("profiles")
      .select("name,email,country")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled || !data) return;
        setProfile(data);
        setName(data.name ?? "");
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  if (!user) return null;

  const initials = (profile?.name || user.email).slice(0, 2).toUpperCase();
  const winTrades = state.tradeList.filter((t) => t.res === "WIN").length;
  const closedTrades = state.tradeList.filter((t) => t.res !== "OPEN").length;
  const winRate = closedTrades ? Math.round((winTrades / closedTrades) * 100) : 0;

  async function save() {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({ name }).eq("user_id", user.id);
      if (error) throw error;
      setProfile((p) => (p ? { ...p, name } : p));
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 1600);
    } catch (e) {
      console.error("save profile", e);
      toast.error("Não foi possível salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-6 py-8">
      <PageHeader title="Perfil" description="Sua conta, plano e estatísticas." />

      <section
        className="mt-6 flex flex-col items-center gap-5 rounded-xl border p-6 transition-shadow sm:flex-row sm:items-center sm:gap-6 fade-up hover:shadow-[0_24px_60px_-32px_color-mix(in_oklab,var(--accent)_45%,transparent)]"
        style={{
          background: "color-mix(in oklab, var(--surface) 80%, transparent)",
          borderColor: "var(--border)",
        }}
      >
        <div
          className="flex h-16 w-16 items-center justify-center rounded-xl font-display text-xl font-semibold transition-transform hover:scale-105 hover:rotate-[-3deg]"
          style={{
            background: "color-mix(in oklab, var(--accent) 12%, var(--surface-2))",
            color: "var(--accent)",
            boxShadow: "inset 0 0 0 1px color-mix(in oklab, var(--accent) 22%, transparent)",
          }}
        >
          {initials}
        </div>
        <div className="flex-1 text-center sm:text-left">
          {profile === null ? (
            <>
              <div
                className="skeleton-shimmer mx-auto h-4 w-36 rounded-full sm:mx-0"
                style={{ background: "color-mix(in oklab, var(--text-dim) 25%, transparent)" }}
              />
              <div
                className="skeleton-shimmer mx-auto mt-2 h-2.5 w-48 rounded-full sm:mx-0"
                style={{
                  background: "color-mix(in oklab, var(--text-dim) 20%, transparent)",
                  animationDelay: "120ms",
                }}
              />
            </>
          ) : (
            <>
              <div className="font-display text-lg font-semibold tracking-tight">
                {profile?.name || user.email.split("@")[0]}
              </div>
              <div className="mt-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:justify-start">
                <span className="inline-flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  {user.email}
                </span>
                {profile?.country && (
                  <span className="inline-flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    {profile.country}
                  </span>
                )}
              </div>
            </>
          )}
        </div>
        <span
          className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider"
          style={
            state.isPro
              ? {
                  background: "color-mix(in oklab, var(--accent) 14%, transparent)",
                  color: "var(--accent)",
                  boxShadow: "0 0 18px -8px color-mix(in oklab, var(--accent) 60%, transparent)",
                }
              : { background: "var(--surface-2)", color: "var(--text-muted)" }
          }
        >
          <Crown className="h-3.5 w-3.5" />
          {state.isPro ? "ANUAL" : "TRIAL"}
        </span>
      </section>

      <div className="mt-5 grid gap-3 sm:grid-cols-3 stagger">
        <StatCard
          label="Análises"
          value={state.isPro ? "∞" : state.analysesLeft}
          hint={state.isPro ? "Anual ilimitado" : "restantes no trial"}
          icon={<Sparkles className="h-4 w-4" />}
          tone="accent"
        />
        <StatCard
          label="Trades"
          value={state.tradeList.length}
          hint={`${closedTrades} fechados`}
          icon={<ClipboardList className="h-4 w-4" />}
        />
        <StatCard
          label="Win-rate"
          value={`${winRate}%`}
          hint={`${winTrades}/${closedTrades || 0} vitórias`}
          icon={<TrendingUp className="h-4 w-4" />}
          tone={winRate >= 55 ? "success" : winRate >= 45 ? "warning" : "danger"}
        />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section
          className="rounded-xl border p-5 fade-up"
          style={{
            background: "color-mix(in oklab, var(--surface) 80%, transparent)",
            borderColor: "var(--border)",
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <Crown className="h-4 w-4" style={{ color: "var(--accent)" }} />
            <h2 className="font-display text-base font-semibold">Plano atual</h2>
          </div>
          <Row label="Plano" value={state.isPro ? "Acesso Anual" : "Trial"} />
          <Row
            label="Análises restantes"
            value={state.isPro ? "Ilimitado" : String(state.analysesLeft)}
          />
          <Row label="Dias de trial" value={state.isPro ? "—" : `${state.trialDaysLeft} dias`} />
          <Row
            label="Início do trial"
            value={new Date(state.trialStartedAt).toLocaleDateString("pt-BR")}
            icon={<Calendar className="h-3 w-3" />}
          />
          {!state.isPro && (
            <button
              onClick={() => nav({ to: "/upgrade" })}
              className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white press smooth hover:opacity-90"
              style={{ background: "var(--accent)" }}
            >
              <Crown className="h-4 w-4" />
              Ativar acesso anual
            </button>
          )}
        </section>

        <section
          className="rounded-xl border p-5 fade-up"
          style={{
            background: "color-mix(in oklab, var(--surface) 80%, transparent)",
            borderColor: "var(--border)",
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            <Mail className="h-4 w-4" style={{ color: "var(--accent)" }} />
            <h2 className="font-display text-base font-semibold">Conta</h2>
          </div>
          <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Nome
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
            className="w-full rounded-lg border bg-[color:var(--surface-2)] px-3 py-2 text-sm outline-none transition-colors focus:border-[color:var(--accent)] focus:shadow-[0_0_0_2px_color-mix(in_oklab,var(--accent)_12%,transparent)]"
            style={{ borderColor: "var(--border)" }}
          />
          <Row label="Email" value={user.email} className="mt-3" />
          {profile?.country && <Row label="País" value={profile.country} />}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={save}
              disabled={saving || name === (profile?.name ?? "")}
              className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white press disabled:opacity-50 smooth hover:opacity-90"
              style={{ background: "var(--accent)" }}
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {savedFlash ? "Salvo!" : "Salvar"}
            </button>
            <button
              onClick={() => {
                void logout().finally(() => nav({ to: "/" }));
              }}
              className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold smooth press hover:border-[color:var(--red)] hover:text-[color:var(--red)]"
              style={{ borderColor: "var(--border)" }}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  icon,
  className = "",
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center justify-between border-b py-2.5 text-sm last:border-0 ${className}`}
      style={{ borderColor: "var(--border)" }}
    >
      <span className="text-muted-foreground">{label}</span>
      <span className="inline-flex items-center gap-1.5 font-medium">
        {icon}
        {value}
      </span>
    </div>
  );
}
