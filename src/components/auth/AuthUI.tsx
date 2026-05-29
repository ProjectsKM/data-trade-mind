import { Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Brain,
  LineChart,
  ClipboardList,
  Zap,
  Clock,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

/* ───────────────────────── Cenário (background) ───────────────────────── */

function AuthScene() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* aurora em camadas — dá cor e profundidade ao fundo */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 110% 80% at 50% -12%, color-mix(in oklab, var(--accent) 16%, transparent), transparent 58%)," +
            "radial-gradient(ellipse 90% 70% at 102% 105%, color-mix(in oklab, var(--electric) 14%, transparent), transparent 55%)," +
            "radial-gradient(ellipse 80% 65% at -5% 92%, color-mix(in oklab, var(--accent) 9%, transparent), transparent 60%)",
        }}
      />
      {/* halos que flutuam suavemente */}
      <div
        className="absolute left-[6%] top-[10%] h-80 w-80 rounded-full opacity-30 blur-[120px] float-y"
        style={{ background: "var(--accent)" }}
      />
      <div
        className="absolute right-[4%] bottom-[8%] h-72 w-72 rounded-full opacity-25 blur-[120px]"
        style={{ background: "var(--electric)", animation: "float 7s ease-in-out infinite 1.2s" }}
      />
      {/* grid sutil com máscara radial */}
      <div className="absolute inset-0 auth-grid opacity-55" />
      {/* vinheta — foca o centro */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 75% 65% at 50% 42%, transparent 38%, color-mix(in oklab, var(--background) 72%, transparent))",
        }}
      />
    </div>
  );
}

/* ──────────────────── Curva de capital (assinatura) ──────────────────── */

const CURVE =
  "M0,200 C40,184 62,188 98,168 C134,148 152,156 188,126 C224,96 242,120 274,104 C306,88 326,98 358,70 C390,42 410,58 436,40 C442,36 446,30 450,24";

function EquityCurve({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 460 230"
      className={className}
      fill="none"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id="auth-stroke" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="var(--electric)" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>
        <linearGradient id="auth-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="color-mix(in oklab, var(--accent) 32%, transparent)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      {/* área sob a curva */}
      <path className="auth-area" d={`${CURVE} L450,230 L0,230 Z`} fill="url(#auth-fill)" />
      {/* linha que se desenha */}
      <path
        className="auth-draw"
        d={CURVE}
        pathLength={1}
        stroke="url(#auth-stroke)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          filter: "drop-shadow(0 0 6px color-mix(in oklab, var(--accent) 55%, transparent))",
        }}
      />
      {/* ponto líder pulsante */}
      <circle
        cx={450}
        cy={24}
        r={9}
        fill="color-mix(in oklab, var(--accent) 22%, transparent)"
        className="auth-dot"
      />
      <circle cx={450} cy={24} r={3.5} fill="var(--accent)" />
    </svg>
  );
}

/* ───────────────────────── Painel de marca (aside) ───────────────────── */

const LOGIN_FEATURES = [
  { Icon: LineChart, t: "OrionScan", d: "Leitura de gráfico em segundos" },
  { Icon: Brain, t: "OrionMind", d: "Mentor IA 24/7 com memória" },
  { Icon: ClipboardList, t: "Gestão", d: "Banca e proteções calculadas" },
] as const;

const LOGIN_STATS = [
  { Icon: Zap, v: "< 2s", l: "por análise" },
  { Icon: Clock, v: "24/7", l: "mentor IA" },
  { Icon: Layers, v: "7", l: "ferramentas" },
] as const;

const SIGNUP_PERKS = [
  "OrionScan: análise de gráficos por IA",
  "OrionMind: mentor 24/7 com memória da sua banca",
  "Gestão completa, notícias e CryptoBubbles",
  "Garantia de 7 dias · 100% do valor de volta",
] as const;

function BrandAside({ mode }: { mode: AuthMode }) {
  return (
    <div
      className="relative hidden flex-1 flex-col justify-between overflow-hidden border-r p-12 xl:p-16 lg:flex"
      style={{ borderColor: "var(--border)" }}
    >
      <AuthScene />

      {/* topo: logo */}
      <div className="relative z-10">
        <Link
          to="/"
          viewTransition
          preload="intent"
          className="inline-flex items-center gap-2 font-display text-2xl font-black tracking-tight smooth hover:opacity-80"
        >
          <span
            className="grid h-9 w-9 place-items-center rounded-xl"
            style={{
              background: "var(--gradient-primary)",
              boxShadow: "0 8px 24px -10px color-mix(in oklab, var(--accent) 70%, transparent)",
            }}
          >
            <TrendingUp className="h-5 w-5 text-white" strokeWidth={2.5} />
          </span>
          Orion<span style={{ color: "var(--electric)" }}>Hub</span>
        </Link>
      </div>

      {/* centro: curva + headline */}
      <div className="relative z-10 max-w-md stagger">
        <div
          className="relative mb-9 overflow-hidden rounded-2xl border p-5"
          style={{
            background: "color-mix(in oklab, var(--surface) 55%, transparent)",
            borderColor: "color-mix(in oklab, var(--accent) 18%, var(--border))",
            backdropFilter: "blur(8px)",
          }}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              <span
                className="h-1.5 w-1.5 rounded-full blink-dot"
                style={{ background: "var(--green)" }}
              />
              Curva de capital
            </span>
            <span
              className="font-mono text-xs font-semibold tabular"
              style={{ color: "var(--green)" }}
            >
              +18,4%
            </span>
          </div>
          <EquityCurve className="h-28 w-full" />
        </div>

        {mode === "signup" && (
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em]"
            style={{
              background: "color-mix(in oklab, var(--accent) 12%, transparent)",
              borderColor: "color-mix(in oklab, var(--accent) 32%, transparent)",
              color: "var(--accent)",
            }}
          >
            <Sparkles className="h-3 w-3" /> 12× R$ 208 · acesso anual
          </div>
        )}

        <h1 className="font-display text-[2.6rem] font-black leading-[1.05] tracking-tight">
          {mode === "login" ? (
            <>
              Sua mente de trader,
              <br />
              <span className="gradient-text">amplificada por IA</span>.
            </>
          ) : (
            <>
              Opere com a clareza
              <br />
              de quem tem um <span className="gradient-text">mentor IA</span>.
            </>
          )}
        </h1>

        {mode === "login" ? (
          <div className="mt-8 flex flex-col gap-2.5">
            {LOGIN_FEATURES.map(({ Icon, t, d }) => (
              <div
                key={t}
                className="flex items-center gap-3 rounded-xl border px-3.5 py-2.5 smooth hover-glow"
                style={{
                  background: "color-mix(in oklab, var(--surface) 50%, transparent)",
                  borderColor: "var(--border)",
                }}
              >
                <span
                  className="grid h-9 w-9 flex-none place-items-center rounded-lg"
                  style={{
                    background: "color-mix(in oklab, var(--accent) 14%, transparent)",
                    color: "var(--accent)",
                    border: "1px solid color-mix(in oklab, var(--accent) 26%, transparent)",
                  }}
                >
                  <Icon className="h-4 w-4" strokeWidth={1.9} />
                </span>
                <div className="leading-tight">
                  <div className="text-sm font-semibold">{t}</div>
                  <div className="text-[12px] text-muted-foreground">{d}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ul className="mt-8 flex flex-col gap-2.5">
            {SIGNUP_PERKS.map((p) => (
              <li key={p} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2
                  className="mt-0.5 h-4 w-4 flex-none"
                  style={{ color: "var(--green)" }}
                />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* base: stats (login) ou citação (signup) */}
      {mode === "login" ? (
        <div className="relative z-10 grid max-w-md grid-cols-3 gap-3">
          {LOGIN_STATS.map(({ Icon, v, l }) => (
            <div
              key={l}
              className="rounded-xl border p-3.5"
              style={{
                background: "color-mix(in oklab, var(--surface) 50%, transparent)",
                borderColor: "var(--border)",
              }}
            >
              <Icon
                className="mb-1.5 h-4 w-4"
                style={{ color: "var(--accent)" }}
                strokeWidth={1.9}
              />
              <div className="font-display text-xl font-black tracking-tight">{v}</div>
              <div className="text-[11px] text-muted-foreground">{l}</div>
            </div>
          ))}
        </div>
      ) : (
        <blockquote
          className="relative z-10 max-w-md rounded-2xl border p-5 text-sm italic leading-relaxed text-muted-foreground"
          style={{
            background: "color-mix(in oklab, var(--surface) 55%, transparent)",
            borderColor: "var(--border)",
          }}
        >
          "O OrionHub é a tradução prática da metodologia que ensino na Orion Capital."
          <div
            className="mt-2 not-italic text-[11px] font-bold uppercase tracking-wider"
            style={{ color: "var(--accent)" }}
          >
            — Gabriel Dutra · Trader Orion Capital
          </div>
        </blockquote>
      )}
    </div>
  );
}

/* ──────────────────────────── Switch (Entrar/Criar) ──────────────────── */

function AuthSwitch({ mode }: { mode: AuthMode }) {
  const base = "relative z-10 flex-1 rounded-lg py-2 text-center text-[13px] font-bold smooth";
  return (
    <div
      className="mb-7 grid grid-cols-2 gap-1 rounded-xl border p-1"
      style={{ background: "var(--surface-2)", borderColor: "var(--border)" }}
    >
      <Link
        to="/login"
        viewTransition
        preload="intent"
        className={base}
        style={
          mode === "login"
            ? {
                background: "var(--gradient-primary)",
                color: "var(--accent-foreground)",
                boxShadow: "0 8px 22px -12px color-mix(in oklab, var(--accent) 75%, transparent)",
              }
            : { color: "var(--text-muted)" }
        }
      >
        Entrar
      </Link>
      <Link
        to="/signup"
        viewTransition
        preload="intent"
        className={base}
        style={
          mode === "signup"
            ? {
                background: "var(--gradient-primary)",
                color: "var(--accent-foreground)",
                boxShadow: "0 8px 22px -12px color-mix(in oklab, var(--accent) 75%, transparent)",
              }
            : { color: "var(--text-muted)" }
        }
      >
        Criar conta
      </Link>
    </div>
  );
}

/* ─────────────────────────────── Campo ───────────────────────────────── */

export function Field({
  id,
  icon,
  label,
  type = "text",
  value,
  onChange,
  placeholder = " ",
  required,
  autoComplete,
  isPassword,
}: {
  id: string;
  icon: ReactNode;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  isPassword?: boolean;
}) {
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const inputType = isPassword ? (show ? "text" : "password") : type;

  return (
    <div>
      <div className="group/field relative">
        <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within/field:text-[color:var(--accent)]">
          {icon}
        </span>
        <input
          id={id}
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyUp={
            isPassword
              ? (e) =>
                  setCaps(
                    typeof e.getModifierState === "function" && e.getModifierState("CapsLock"),
                  )
              : undefined
          }
          onBlur={isPassword ? () => setCaps(false) : undefined}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="peer h-[3.6rem] w-full rounded-xl border bg-[var(--surface-2)] pl-10 pr-10 pt-5 pb-1 text-base text-foreground outline-none transition-all placeholder:text-transparent focus:border-[color:var(--accent)] focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_14%,transparent)] sm:text-sm"
          style={{ borderColor: "var(--border-strong)" }}
        />
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-[14px] text-muted-foreground transition-all duration-200 peer-focus:top-[0.95rem] peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-[color:var(--accent)] peer-[:not(:placeholder-shown)]:top-[0.95rem] peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wider"
        >
          {label}
        </label>
        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "Ocultar senha" : "Mostrar senha"}
            className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground smooth hover:text-foreground"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>
      {isPassword && caps && (
        <div
          className="mt-1.5 flex items-center gap-1.5 text-[11px] fade-in"
          style={{ color: "var(--gold)" }}
        >
          <AlertTriangle className="h-3 w-3" /> Caps Lock ativado
        </div>
      )}
    </div>
  );
}

/* ──────────────────────── Medidor de força de senha ──────────────────── */

export function PasswordStrength({ value }: { value: string }) {
  const { score, label, color } = useMemo(() => {
    let s = 0;
    if (value.length >= 6) s++;
    if (value.length >= 10) s++;
    if (/[0-9]/.test(value) && /[a-zA-Z]/.test(value)) s++;
    if (/[^a-zA-Z0-9]/.test(value)) s++;
    s = Math.min(4, s);
    const map = [
      { label: "", color: "var(--border-strong)" },
      { label: "Fraca", color: "var(--red)" },
      { label: "Razoável", color: "var(--gold)" },
      { label: "Forte", color: "var(--electric)" },
      { label: "Excelente", color: "var(--green)" },
    ];
    return { score: s, label: map[s].label, color: map[s].color };
  }, [value]);

  if (!value) return null;
  return (
    <div className="mt-2 fade-in">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ background: i < score ? color : "var(--surface-3)" }}
          />
        ))}
      </div>
      {label && (
        <div className="mt-1 text-right text-[11px] font-medium" style={{ color }}>
          {label}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────── Botão submit ─────────────────────────── */

export function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group relative mt-2 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3.5 text-sm font-bold smooth press disabled:opacity-60 hover:-translate-y-0.5"
      style={{
        background: "var(--gradient-primary)",
        color: "var(--accent-foreground)",
        boxShadow: "0 14px 34px -14px color-mix(in oklab, var(--accent) 75%, transparent)",
      }}
    >
      <span className="btn-sheen" aria-hidden />
      {loading ? (
        <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white spin-slow" />
      ) : (
        <>
          {children}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </>
      )}
    </button>
  );
}

/* ────────────────────────────── Erro inline ──────────────────────────── */

export function AuthError({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div
      className="flex items-start gap-2 rounded-xl border px-3.5 py-2.5 text-[13px] fade-in"
      style={{
        background: "color-mix(in oklab, var(--red) 10%, transparent)",
        color: "var(--red)",
        borderColor: "color-mix(in oklab, var(--red) 28%, transparent)",
      }}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 flex-none" />
      <span>{message}</span>
    </div>
  );
}

/* ─────────────────────────────── Layout ──────────────────────────────── */

export type AuthMode = "login" | "signup";

export function AuthLayout({
  mode,
  title,
  subtitle,
  shake,
  children,
}: {
  mode: AuthMode;
  title: string;
  subtitle: string;
  shake?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh" style={{ background: "var(--background)" }}>
      <BrandAside mode={mode} />

      {/* coluna do formulário */}
      <div className="relative flex flex-1 items-start justify-center overflow-y-auto px-5 pt-10 pb-12 lg:w-[520px] lg:flex-none lg:items-center lg:pt-12">
        {/* fundo só no mobile (no desktop o aside já tem o cenário) */}
        <div className="lg:hidden">
          <AuthScene />
        </div>

        <div className={`relative z-10 w-full max-w-[400px] fade-up ${shake ? "shake" : ""}`}>
          {/* logo mobile */}
          <div className="mb-7 flex flex-col items-center gap-3 lg:hidden">
            <Link
              to="/"
              viewTransition
              preload="intent"
              className="inline-flex items-center gap-2 font-display text-2xl font-black tracking-tight"
            >
              <span
                className="grid h-8 w-8 place-items-center rounded-lg"
                style={{ background: "var(--gradient-primary)" }}
              >
                <TrendingUp className="h-4 w-4 text-white" strokeWidth={2.5} />
              </span>
              Orion<span style={{ color: "var(--electric)" }}>Hub</span>
            </Link>
            <div className="h-12 w-44 opacity-90">
              <EquityCurve className="h-full w-full" />
            </div>
          </div>

          {/* borda em gradiente ESTÁTICA (1px) — nada girando */}
          <div
            className="rounded-[26px] p-px"
            style={{
              background:
                "linear-gradient(155deg, color-mix(in oklab, var(--accent) 55%, transparent), color-mix(in oklab, var(--border-strong) 70%, transparent) 36%, color-mix(in oklab, var(--border) 80%, transparent) 64%, color-mix(in oklab, var(--electric) 38%, transparent))",
              boxShadow:
                "0 42px 90px -34px rgba(0,0,0,.75), 0 0 70px -28px color-mix(in oklab, var(--accent) 38%, transparent)",
            }}
          >
            <div
              className="relative overflow-hidden rounded-[25px] p-7 backdrop-blur-2xl sm:p-8"
              style={{ background: "color-mix(in oklab, var(--surface) 93%, transparent)" }}
            >
              {/* brilho superior interno (highlight de vidro) */}
              <div
                className="pointer-events-none absolute inset-x-8 top-0 h-px"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, color-mix(in oklab, var(--foreground) 45%, transparent), transparent)",
                }}
              />
              {/* glow accent difuso no topo */}
              <div
                className="pointer-events-none absolute -top-20 left-1/2 h-40 w-3/4 -translate-x-1/2 rounded-full opacity-40 blur-[60px]"
                style={{ background: "var(--accent)" }}
              />

              <div className="relative">
                <AuthSwitch mode={mode} />

                <h2 className="font-display text-[1.6rem] font-black tracking-tight">{title}</h2>
                <p className="mt-1 text-[13px] text-muted-foreground">{subtitle}</p>

                {children}
              </div>
            </div>
          </div>

          {/* selos de confiança */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground/60">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" style={{ color: "var(--green)" }} />
              Dados criptografados
            </span>
            <span className="opacity-30">·</span>
            <span>{mode === "signup" ? "Garantia 7 dias" : "Suporte humano"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
