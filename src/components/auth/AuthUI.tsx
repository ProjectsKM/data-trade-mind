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
  CheckCircle2,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";

/* ───────────────────── Curva de capital (assinatura) ─────────────────────
   viewBox com a MESMA proporção (~3.6:1) do container renderizado: assim o
   preserveAspectRatio="none" quase não distorce, o ponto fica redondo e a
   linha não estica. A espessura é fixada via vector-effect (não escala). */
const CURVE =
  "M6,114 C54,108 82,110 122,99 C162,88 188,92 226,77 C264,62 292,70 330,57 C368,44 396,50 430,36 C444,30 452,32 460,26";

function EquityCurve({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 132"
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
          <stop offset="0%" stopColor="color-mix(in oklab, var(--accent) 38%, transparent)" />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      {/* área sob a curva */}
      <path className="auth-area" d={`${CURVE} L460,132 L6,132 Z`} fill="url(#auth-fill)" />
      {/* linha que se desenha */}
      <path
        className="auth-draw"
        d={CURVE}
        pathLength={1}
        stroke="url(#auth-stroke)"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        style={{
          filter: "drop-shadow(0 0 7px color-mix(in oklab, var(--electric) 82%, transparent))",
        }}
      />
      {/* ponto líder pulsante */}
      <circle
        cx={460}
        cy={26}
        r={6}
        fill="color-mix(in oklab, var(--electric) 36%, transparent)"
        className="auth-dot"
      />
      <circle cx={460} cy={26} r={2.6} fill="var(--electric)" />
    </svg>
  );
}

/* ───────────────────────── Cenário (background da página) ───────────────── */

function AuthScene() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 90% 60% at 50% -8%, color-mix(in oklab, var(--accent) 14%, transparent), transparent 60%)," +
            "radial-gradient(ellipse 70% 60% at 100% 100%, color-mix(in oklab, var(--electric) 10%, transparent), transparent 58%)",
        }}
      />
      <div
        className="absolute -left-24 top-1/4 h-96 w-96 rounded-full opacity-25 blur-[130px] float-y"
        style={{ background: "var(--accent)" }}
      />
      <div
        className="absolute -right-24 bottom-1/4 h-96 w-96 rounded-full opacity-[0.18] blur-[130px]"
        style={{ background: "var(--electric)", animation: "float 8s ease-in-out infinite 1.4s" }}
      />
    </div>
  );
}

/* ─────────────────────── Painel de marca (gradiente, esquerda) ─────────── */

const HIGHLIGHTS: { Icon: LucideIcon; t: string; d: string }[] = [
  { Icon: LineChart, t: "OrionScan", d: "Leitura de gráfico por IA em segundos" },
  { Icon: Brain, t: "OrionMind", d: "Mentor IA 24/7 com memória da sua banca" },
  { Icon: ClipboardList, t: "Gestão & Notícias", d: "Banca, proteções e calendário num só lugar" },
];

function BrandPanel({ mode }: { mode: AuthMode }) {
  return (
    <div
      className="relative hidden flex-col justify-center gap-10 overflow-hidden p-9 lg:flex xl:p-11"
      style={{
        // bloom azul vívido sobre navy profundo (eco do exemplo, na paleta do site)
        background:
          "radial-gradient(120% 95% at 50% 4%, color-mix(in oklab, var(--electric) 74%, transparent), transparent 58%)," +
          "radial-gradient(115% 85% at 50% 46%, color-mix(in oklab, var(--accent) 60%, transparent), transparent 62%)," +
          "radial-gradient(100% 80% at 50% 108%, color-mix(in oklab, var(--accent) 26%, transparent), transparent 64%)," +
          "oklch(0.115 0.035 265)",
      }}
    >
      {/* grid sutil */}
      <div className="absolute inset-0 auth-grid opacity-[0.5]" />
      {/* vinheta escurecendo as bordas — concentra o bloom no centro */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(135% 125% at 50% 36%, transparent 46%, color-mix(in oklab, #03050b 60%, transparent))",
        }}
      />
      {/* highlight de vidro no topo */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, color-mix(in oklab, white 40%, transparent), transparent)",
        }}
      />

      {/* topo: logo */}
      <div className="relative z-10">
        <Link
          to="/"
          viewTransition
          preload="intent"
          className="inline-flex items-center gap-2.5 font-display text-2xl font-black tracking-tight text-white smooth hover:opacity-90"
        >
          <span
            className="grid h-9 w-9 place-items-center rounded-xl"
            style={{
              background: "var(--gradient-primary)",
              boxShadow: "0 10px 28px -10px color-mix(in oklab, var(--electric) 85%, transparent)",
            }}
          >
            <TrendingUp className="h-5 w-5 text-white" strokeWidth={2.5} />
          </span>
          Orion<span style={{ color: "color-mix(in oklab, var(--electric) 90%, white)" }}>Hub</span>
        </Link>
      </div>

      {/* centro: badge + headline + curva */}
      <div className="relative z-10 max-w-md">
        {mode === "signup" && (
          <div
            className="mb-5 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-sm"
            style={{
              background: "color-mix(in oklab, white 14%, transparent)",
              borderColor: "color-mix(in oklab, white 26%, transparent)",
            }}
          >
            <Sparkles className="h-3 w-3" /> 12× R$ 208 · acesso anual
          </div>
        )}

        <h1 className="font-display text-[2.4rem] font-black leading-[1.06] tracking-tight text-white">
          {mode === "login" ? (
            <>
              Bem-vindo de volta
              <br />
              ao{" "}
              <span style={{ color: "color-mix(in oklab, var(--electric) 70%, white)" }}>
                OrionHub
              </span>
              .
            </>
          ) : (
            <>
              Sua mente de trader,
              <br />
              <span style={{ color: "color-mix(in oklab, var(--electric) 70%, white)" }}>
                amplificada por IA
              </span>
              .
            </>
          )}
        </h1>
        <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-white/80">
          {mode === "login"
            ? "Entre para continuar de onde parou — suas análises, banca e mentor IA esperam por você."
            : "Crie sua conta e tenha um terminal completo de trading com inteligência artificial."}
        </p>

        {/* curva de capital — assinatura viva */}
        <div
          className="relative mt-7 overflow-hidden rounded-2xl border p-4 backdrop-blur-md"
          style={{
            background: "color-mix(in oklab, #060912 42%, transparent)",
            borderColor: "color-mix(in oklab, white 16%, transparent)",
          }}
        >
          <div className="mb-2.5 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-white/75">
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
          <EquityCurve className="h-24 w-full" />
        </div>
      </div>

      {/* base: destaques do produto — o primeiro card vem em destaque (eco do exemplo) */}
      <div className="relative z-10 flex flex-col gap-2.5">
        {HIGHLIGHTS.map(({ Icon, t, d }, i) => {
          const featured = i === 0;
          return (
            <div
              key={t}
              className="flex items-center gap-3.5 rounded-xl border px-3.5 py-3 smooth"
              style={
                featured
                  ? {
                      background: "color-mix(in oklab, white 94%, transparent)",
                      borderColor: "transparent",
                      boxShadow: "0 20px 48px -18px rgba(0,0,0,.7)",
                    }
                  : {
                      background: "color-mix(in oklab, white 11%, transparent)",
                      borderColor: "color-mix(in oklab, white 17%, transparent)",
                    }
              }
            >
              <span
                className="grid h-9 w-9 flex-none place-items-center rounded-lg"
                style={
                  featured
                    ? { background: "var(--gradient-primary)", color: "white" }
                    : {
                        background: "color-mix(in oklab, white 10%, transparent)",
                        color: "color-mix(in oklab, var(--electric) 55%, white)",
                      }
                }
              >
                <Icon className="h-4 w-4" strokeWidth={2} />
              </span>
              <div className="leading-tight">
                <div
                  className="text-sm font-semibold"
                  style={{ color: featured ? "oklch(0.2 0.03 265)" : "white" }}
                >
                  {t}
                </div>
                <div
                  className="text-[12px]"
                  style={{ color: featured ? "oklch(0.45 0.03 265)" : "rgba(255,255,255,0.66)" }}
                >
                  {d}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────── Switch (Entrar/Criar) ──────────────────────── */

function AuthSwitch({ mode }: { mode: AuthMode }) {
  const base = "relative z-10 flex-1 rounded-lg py-2 text-center text-[13px] font-bold smooth";
  const activeStyle = {
    background: "var(--gradient-primary)",
    color: "var(--accent-foreground)",
    boxShadow: "0 8px 22px -12px color-mix(in oklab, var(--accent) 75%, transparent)",
  };
  return (
    <nav
      aria-label="Modo de autenticação"
      className="grid grid-cols-2 gap-1 rounded-xl border p-1"
      style={{ background: "var(--surface-2)", borderColor: "var(--border-strong)" }}
    >
      <Link
        to="/login"
        viewTransition
        preload="intent"
        aria-current={mode === "login" ? "page" : undefined}
        className={base}
        style={mode === "login" ? activeStyle : { color: "var(--text-muted)" }}
      >
        Entrar
      </Link>
      <Link
        to="/signup"
        viewTransition
        preload="intent"
        aria-current={mode === "signup" ? "page" : undefined}
        className={base}
        style={mode === "signup" ? activeStyle : { color: "var(--text-muted)" }}
      >
        Criar conta
      </Link>
    </nav>
  );
}

/* ─────────────────────────────── Campo ───────────────────────────────────── */

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
          className="peer h-[3.4rem] w-full rounded-xl border bg-[var(--surface-2)] pl-10 pr-10 pt-5 pb-1 text-base text-foreground outline-none transition-all placeholder:text-transparent focus:border-[color:var(--accent)] focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_14%,transparent)] sm:text-sm"
          style={{ borderColor: "var(--border-strong)" }}
        />
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-10 top-1/2 -translate-y-1/2 text-[14px] text-muted-foreground transition-all duration-200 peer-focus:top-[0.9rem] peer-focus:translate-y-0 peer-focus:text-[10px] peer-focus:font-semibold peer-focus:uppercase peer-focus:tracking-wider peer-focus:text-[color:var(--accent)] peer-[:not(:placeholder-shown)]:top-[0.9rem] peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-[10px] peer-[:not(:placeholder-shown)]:font-semibold peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-wider"
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

/* ──────────────────────── Medidor de força de senha ──────────────────────── */

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

/* ────────────────────────────── Botão submit ─────────────────────────────── */

export function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="group relative mt-1 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl py-3.5 text-sm font-bold smooth press disabled:opacity-60 hover:-translate-y-0.5"
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

/* ────────────────────────────── Erro inline ──────────────────────────────── */

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

/* ─────────────────────────────── Layout ──────────────────────────────────── */

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
    <div
      className="relative flex min-h-dvh items-center justify-center px-4 py-8 sm:px-6"
      style={{ background: "var(--background)" }}
    >
      <AuthScene />

      <div className={`relative z-10 w-full max-w-[1040px] fade-up ${shake ? "shake" : ""}`}>
        {/* borda em gradiente (1px) — moldura premium do card */}
        <div
          className="rounded-[28px] p-px"
          style={{
            background:
              "linear-gradient(150deg, color-mix(in oklab, var(--electric) 55%, transparent), color-mix(in oklab, var(--border-strong) 60%, transparent) 32%, color-mix(in oklab, var(--border) 80%, transparent) 66%, color-mix(in oklab, var(--accent) 45%, transparent))",
            boxShadow:
              "0 50px 110px -42px rgba(0,0,0,.8), 0 0 90px -40px color-mix(in oklab, var(--accent) 45%, transparent)",
          }}
        >
          <div
            className="grid grid-cols-1 overflow-hidden rounded-[27px] lg:grid-cols-[1.04fr_1fr]"
            style={{ background: "var(--surface)" }}
          >
            {/* metade esquerda: marca (some no mobile) */}
            <BrandPanel mode={mode} />

            {/* metade direita: formulário */}
            <div className="relative flex flex-col justify-center px-6 py-9 sm:px-10 sm:py-11 lg:px-12">
              {/* logo no mobile (o painel de marca some abaixo de lg) */}
              <div className="mb-7 flex items-center justify-center gap-2.5 lg:hidden">
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
              </div>

              <div className="mx-auto w-full max-w-[380px] lg:max-w-[412px]">
                <AuthSwitch mode={mode} />

                <h2 className="mt-7 font-display text-[1.7rem] font-black tracking-tight">
                  {title}
                </h2>
                <p className="mt-1.5 text-[13px] text-muted-foreground">{subtitle}</p>

                {children}

                {/* selos de confiança */}
                <div className="mt-7 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/60">
                  <span className="inline-flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" style={{ color: "var(--green)" }} />
                    Dados criptografados
                  </span>
                  <span className="opacity-30">·</span>
                  <span className="inline-flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" style={{ color: "var(--green)" }} />
                    {mode === "signup" ? "Garantia 7 dias" : "Suporte humano"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
