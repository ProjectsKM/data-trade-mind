import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { login, useUser } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Entrar — OrionHub" }, { name: "description", content: "Acesse sua conta OrionHub." }] }),
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

  if (ready && user) return <Navigate to="/scan" />;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      await login(email, pw);
      nav({ to: "/scan" });
    } catch (ex: unknown) {
      setErr(ex instanceof Error ? ex.message : "Erro ao entrar.");
      setLoading(false);
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 fade-in"
      style={{ background: "radial-gradient(ellipse at 30% 60%, color-mix(in oklab, var(--accent) 10%, transparent) 0%, var(--background) 55%)" }}>
      <div className={`w-full max-w-sm rounded-3xl border p-9 scale-in ${shake ? "shake" : ""}`} style={{ background: "var(--surface)", borderColor: "var(--border-strong)" }}>
        <Link to="/" className="block text-center text-2xl font-black tracking-tight smooth hover:opacity-80">
          Orion<span style={{ color: "var(--electric)" }}>Hub</span>
        </Link>
        <p className="mb-7 mt-1 text-center text-xs text-muted-foreground">Acesse sua conta para continuar</p>
        <form onSubmit={submit} className="space-y-3">
          <Field label="EMAIL" type="email" value={email} onChange={setEmail} placeholder="seu@email.com" required />
          <Field label="SENHA" type="password" value={pw} onChange={setPw} placeholder="••••••••" required />
          {err && <div className="rounded-xl px-3 py-2 text-xs fade-in" style={{ background: "color-mix(in oklab, var(--red) 10%, transparent)", color: "var(--red)", border: "1px solid color-mix(in oklab, var(--red) 25%, transparent)" }}>{err}</div>}
          <button type="submit" disabled={loading}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white smooth press disabled:opacity-60 hover:-translate-y-0.5"
            style={{ background: "var(--accent)", boxShadow: "0 0 30px color-mix(in oklab, var(--accent) 30%, transparent)" }}>
            {loading && <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white spin-slow" />}
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Ainda não tem conta? <Link to="/signup" className="font-semibold smooth hover:opacity-80" style={{ color: "var(--electric)" }}>Criar conta</Link>
        </p>
        <p className="mt-2 text-center text-xs"><Link to="/" className="text-muted-foreground smooth hover:text-foreground">← Voltar</Link></p>
      </div>
    </div>
  );
}

function Field({ label, type, value, onChange, placeholder, required }: { label: string; type: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1.5 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required}
        className="w-full rounded-xl border bg-[color:var(--surface-2)] px-3.5 py-3 text-[13px] outline-none transition-all focus:border-[color:var(--accent)] focus:shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent)_15%,transparent)]"
        style={{ borderColor: "var(--border-strong)" }} />
    </div>
  );
}
