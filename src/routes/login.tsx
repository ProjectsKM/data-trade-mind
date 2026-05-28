import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock, ArrowRight, ShieldCheck, Brain, LineChart } from "lucide-react";
import { login, useUser } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Entrar — OrionHub" },
      { name: "description", content: "Acesse sua conta OrionHub." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const { user, ready } = useUser();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  if (ready && user) return <Navigate to="/dashboard" />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email, pw);
      nav({ to: "/dashboard" });
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : "Erro ao entrar.");
      setShake(true);
      setTimeout(() => setShake(false), 400);
    } finally {
      // Garante que o botão não fica travado em "carregando" se a navegação
      // não desmontar a tela (ex.: guard reprovou).
      setLoading(false);
    }
  }

  return (
    <div
      className="relative flex min-h-dvh overflow-hidden"
      style={{ background: "var(--background)" }}
    >
      {/* Background effects */}
      <div className="absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0 opacity-50"
          style={{
            backgroundImage:
              "linear-gradient(color-mix(in oklab, var(--accent) 4%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--accent) 4%, transparent) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div
          className="absolute left-1/4 top-1/3 h-96 w-96 rounded-full opacity-20 blur-[120px]"
          style={{ background: "var(--accent)" }}
        />
        <div
          className="absolute right-1/4 bottom-1/3 h-64 w-64 rounded-full opacity-15 blur-[100px]"
          style={{ background: "var(--electric)" }}
        />
      </div>

      {/* Left branding panel — desktop only */}
      <div className="relative hidden flex-1 flex-col justify-center px-16 lg:flex">
        <div className="max-w-md">
          <Link
            to="/"
            viewTransition
            preload="intent"
            className="mb-12 inline-block text-3xl font-black tracking-tight smooth hover:opacity-80"
          >
            Orion<span style={{ color: "var(--electric)" }}>Hub</span>
          </Link>
          <h1 className="font-display text-4xl font-black leading-tight tracking-tight">
            Sua mente de trader,
            <br />
            <span className="gradient-text">amplificada por IA</span>.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Análise de gráficos, mentor IA 24/7, gestão de banca e calendário econômico — tudo em
            uma plataforma.
          </p>
          <div className="mt-10 flex flex-col gap-4">
            {[
              { Icon: LineChart, text: "OrionScan: análise de gráficos em < 2s" },
              { Icon: Brain, text: "OrionMind: mentor IA treinado pelo Gabriel Dutra" },
              { Icon: ShieldCheck, text: "Gestão padrão Orion com proteções calculadas" },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-muted-foreground">
                <div
                  className="flex h-8 w-8 flex-none items-center justify-center rounded-lg"
                  style={{
                    background: "color-mix(in oklab, var(--accent) 12%, transparent)",
                    color: "var(--accent)",
                    border: "1px solid color-mix(in oklab, var(--accent) 25%, transparent)",
                  }}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.75} />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative flex flex-1 items-start justify-center overflow-y-auto px-6 pt-16 pb-12 lg:items-center lg:pt-12 lg:flex-none lg:w-[480px]">
        <div className={`w-full max-w-sm fade-up ${shake ? "shake" : ""}`}>
          {/* Mobile logo */}
          <div className="mb-8 text-center lg:hidden">
            <Link
              to="/"
              viewTransition
              preload="intent"
              className="text-2xl font-black tracking-tight"
            >
              Orion<span style={{ color: "var(--electric)" }}>Hub</span>
            </Link>
          </div>

          <div
            className="rounded-3xl border p-8 backdrop-blur-xl"
            style={{
              background: "color-mix(in oklab, var(--surface) 85%, transparent)",
              borderColor: "color-mix(in oklab, var(--accent) 15%, var(--border-strong))",
              boxShadow:
                "0 40px 80px -20px rgba(0,0,0,.4), 0 0 0 1px color-mix(in oklab, var(--accent) 8%, transparent)",
            }}
          >
            <h2 className="font-display text-xl font-extrabold tracking-tight">
              Bem-vindo de volta
            </h2>
            <p className="mt-1 text-[13px] text-muted-foreground">
              Entre com sua conta para continuar
            </p>

            <form onSubmit={submit} className="mt-7 space-y-4">
              <IconField
                icon={<Mail className="h-4 w-4" />}
                label="EMAIL"
                type="email"
                value={email}
                onChange={setEmail}
                placeholder="seu@email.com"
                required
                autoComplete="email"
              />
              <IconField
                icon={<Lock className="h-4 w-4" />}
                label="SENHA"
                type="password"
                value={pw}
                onChange={setPw}
                placeholder="Sua senha"
                required
                autoComplete="current-password"
              />

              {err && (
                <div
                  className="rounded-xl border px-3.5 py-2.5 text-[13px] fade-in"
                  style={{
                    background: "color-mix(in oklab, var(--red) 10%, transparent)",
                    color: "var(--red)",
                    borderColor: "color-mix(in oklab, var(--red) 25%, transparent)",
                  }}
                >
                  {err}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="group mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white smooth press disabled:opacity-60 hover:-translate-y-0.5 pulse-glow"
                style={{ background: "var(--gradient-primary)", color: "var(--accent-foreground)" }}
              >
                {loading ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white spin-slow" />
                ) : (
                  <>
                    Entrar
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-3 text-[13px]">
              <p className="text-muted-foreground">
                Ainda não tem conta?{" "}
                <Link
                  to="/signup"
                  viewTransition
                  preload="intent"
                  className="font-semibold smooth hover:opacity-80"
                  style={{ color: "var(--electric)" }}
                >
                  Criar conta
                </Link>
              </p>
              <Link
                to="/"
                viewTransition
                preload="intent"
                className="text-muted-foreground/70 smooth hover:text-foreground"
              >
                ← Voltar ao site
              </Link>
            </div>
          </div>

          {/* Trust */}
          <div className="mt-6 flex items-center justify-center gap-4 text-[10px] uppercase tracking-widest text-muted-foreground/60">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" style={{ color: "var(--green)" }} />
              Dados criptografados
            </span>
            <span className="opacity-30">·</span>
            <span>Suporte humano</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconField({
  icon,
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
}: {
  icon: React.ReactNode;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  const fieldId = `login-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div>
      <label
        htmlFor={fieldId}
        className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </label>
      <div
        className="flex items-center gap-2 rounded-xl border px-3.5 transition-all focus-within:border-[color:var(--accent)] focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent)_15%,transparent)]"
        style={{ background: "var(--surface-2)", borderColor: "var(--border-strong)" }}
      >
        <span className="flex-none text-muted-foreground">{icon}</span>
        <input
          id={fieldId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="flex-1 bg-transparent py-3.5 text-base outline-none placeholder:text-muted-foreground/50 sm:text-sm"
        />
      </div>
    </div>
  );
}
