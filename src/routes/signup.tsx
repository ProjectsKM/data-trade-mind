import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { User, Mail, Lock, Globe, ArrowRight, ShieldCheck, Sparkles, Crown, CheckCircle2 } from "lucide-react";
import { signup, useUser } from "@/lib/store";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Criar conta — OrionHub" }, { name: "description", content: "Crie sua conta OrionHub. Acesso anual com garantia de 7 dias." }] }),
  component: SignupPage,
});

function SignupPage() {
  const nav = useNavigate();
  const { user, ready } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [country, setCountry] = useState("Brasil");
  const [err, setErr] = useState("");
  const [shake, setShake] = useState(false);
  const [loading, setLoading] = useState(false);

  if (ready && user) return <Navigate to="/dashboard" />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await signup({ name, email, password: pw, country });
      nav({ to: "/dashboard" });
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : "Erro ao criar conta.");
      setLoading(false);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  }

  return (
    <div className="relative flex min-h-dvh overflow-hidden" style={{ background: "var(--background)" }}>
      {/* Background effects */}
      <div className="absolute inset-0" aria-hidden>
        <div className="absolute inset-0 opacity-50"
          style={{
            backgroundImage: "linear-gradient(color-mix(in oklab, var(--accent) 4%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, var(--accent) 4%, transparent) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }} />
        <div className="absolute left-1/4 top-1/3 h-96 w-96 rounded-full opacity-20 blur-[120px]" style={{ background: "var(--accent)" }} />
        <div className="absolute right-1/4 bottom-1/3 h-64 w-64 rounded-full opacity-15 blur-[100px]" style={{ background: "var(--electric)" }} />
      </div>

      {/* Left branding panel — desktop only */}
      <div className="relative hidden flex-1 flex-col justify-center px-16 lg:flex">
        <div className="max-w-md">
          <Link to="/" className="mb-12 inline-block text-3xl font-black tracking-tight smooth hover:opacity-80">
            Orion<span style={{ color: "var(--electric)" }}>Hub</span>
          </Link>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest"
            style={{ background: "color-mix(in oklab, var(--accent) 10%, transparent)", borderColor: "color-mix(in oklab, var(--accent) 30%, transparent)", color: "var(--accent)" }}>
            <Sparkles className="h-3 w-3" /> Acesso anual · R$ 2.500
          </div>
          <h1 className="font-display text-4xl font-black leading-tight tracking-tight">
            Tudo que você precisa<br />
            para operar com <span className="gradient-text">inteligência</span>.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Crie sua conta e desbloqueie a plataforma completa com IA do mentor Gabriel Dutra.
          </p>

          <div className="mt-10 space-y-3">
            {[
              "OrionScan: análise de gráficos em segundos",
              "OrionMind: mentor IA 24/7 com memória",
              "Gestão completa de banca e trades",
              "Notícias, calendário e CryptoBubbles",
              "Suporte humano prioritário",
              "Garantia de 7 dias · 100% do valor",
            ].map((text) => (
              <div key={text} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 flex-none" style={{ color: "var(--green)" }} />
                <span>{text}</span>
              </div>
            ))}
          </div>

          <blockquote className="mt-10 rounded-2xl border p-5 text-sm italic leading-relaxed text-muted-foreground"
            style={{ background: "color-mix(in oklab, var(--surface) 60%, transparent)", borderColor: "var(--border)" }}>
            "O OrionHub é a tradução prática da metodologia que ensino na Orion Capital."
            <div className="mt-2 not-italic text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--accent)" }}>
              — Gabriel Dutra · Trader Orion Capital
            </div>
          </blockquote>
        </div>
      </div>

      {/* Right form panel */}
      <div className="relative flex flex-1 items-center justify-center px-6 py-12 lg:flex-none lg:w-[480px]">
        <div className={`w-full max-w-sm fade-up ${shake ? "shake" : ""}`}>
          {/* Mobile logo + badge */}
          <div className="mb-8 text-center lg:hidden">
            <Link to="/" className="text-2xl font-black tracking-tight">
              Orion<span style={{ color: "var(--electric)" }}>Hub</span>
            </Link>
            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
              style={{ background: "color-mix(in oklab, var(--accent) 10%, transparent)", borderColor: "color-mix(in oklab, var(--accent) 30%, transparent)", color: "var(--accent)" }}>
              <Crown className="h-3 w-3" /> Acesso anual
            </div>
          </div>

          <div className="rounded-3xl border p-8 backdrop-blur-xl"
            style={{
              background: "color-mix(in oklab, var(--surface) 85%, transparent)",
              borderColor: "color-mix(in oklab, var(--accent) 15%, var(--border-strong))",
              boxShadow: "0 40px 80px -20px rgba(0,0,0,.4), 0 0 0 1px color-mix(in oklab, var(--accent) 8%, transparent)",
            }}>
            <h2 className="font-display text-xl font-extrabold tracking-tight">Crie sua conta</h2>
            <p className="mt-1 text-[13px] text-muted-foreground">Garantia de 7 dias · 100% do valor</p>

            <form onSubmit={submit} className="mt-7 space-y-4">
              <IconField icon={<User className="h-4 w-4" />} label="COMO GOSTARIA DE SER CHAMADO?" value={name} onChange={setName} placeholder="Ex: João" required />
              <IconField icon={<Mail className="h-4 w-4" />} label="EMAIL" type="email" value={email} onChange={setEmail} placeholder="seu@email.com" required />
              <IconField icon={<Lock className="h-4 w-4" />} label="SENHA" type="password" value={pw} onChange={setPw} placeholder="Mínimo 6 caracteres" required />
              <div>
                <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">PAÍS</label>
                <div className="flex items-center gap-2 rounded-xl border px-3.5 transition-all focus-within:border-[color:var(--accent)] focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent)_15%,transparent)]"
                  style={{ background: "var(--surface-2)", borderColor: "var(--border-strong)" }}>
                  <Globe className="h-4 w-4 flex-none text-muted-foreground" />
                  <select value={country} onChange={(e) => setCountry(e.target.value)}
                    className="flex-1 bg-transparent py-3 text-[13px] outline-none">
                    {["Brasil", "Portugal", "Angola", "Moçambique", "Outro"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {err && (
                <div className="rounded-xl border px-3.5 py-2.5 text-[13px] fade-in"
                  style={{ background: "color-mix(in oklab, var(--red) 10%, transparent)", color: "var(--red)", borderColor: "color-mix(in oklab, var(--red) 25%, transparent)" }}>
                  {err}
                </div>
              )}

              <button type="submit" disabled={loading}
                className="group mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold smooth press disabled:opacity-60 hover:-translate-y-0.5 pulse-glow"
                style={{ background: "var(--gradient-primary)", color: "var(--accent-foreground)" }}>
                {loading ? (
                  <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white spin-slow" />
                ) : (
                  <>
                    Criar conta
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 flex flex-col items-center gap-3 text-[13px]">
              <p className="text-muted-foreground">
                Já tem conta?{" "}
                <Link to="/login" className="font-semibold smooth hover:opacity-80" style={{ color: "var(--electric)" }}>
                  Entrar
                </Link>
              </p>
              <Link to="/" className="text-muted-foreground/70 smooth hover:text-foreground">← Voltar ao site</Link>
            </div>
          </div>

          {/* Trust */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[10px] uppercase tracking-widest text-muted-foreground/60">
            <span className="inline-flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" style={{ color: "var(--green)" }} />
              Dados criptografados
            </span>
            <span className="opacity-30">·</span>
            <span>Garantia 7 dias</span>
            <span className="opacity-30">·</span>
            <span>Suporte humano</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconField({ icon, label, type = "text", value, onChange, placeholder, required }: {
  icon: React.ReactNode;
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="flex items-center gap-2 rounded-xl border px-3.5 transition-all focus-within:border-[color:var(--accent)] focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent)_15%,transparent)]"
        style={{ background: "var(--surface-2)", borderColor: "var(--border-strong)" }}>
        <span className="flex-none text-muted-foreground">{icon}</span>
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
          className="flex-1 bg-transparent py-3 text-[13px] outline-none placeholder:text-muted-foreground/50" />
      </div>
    </div>
  );
}
