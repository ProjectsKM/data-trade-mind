import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { User, Mail, Lock, Globe } from "lucide-react";
import { signup, useUser } from "@/lib/store";
import {
  AuthLayout,
  Field,
  SubmitButton,
  AuthError,
  PasswordStrength,
} from "@/components/auth/AuthUI";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Criar conta — OrionHub" },
      {
        name: "description",
        content: "Crie sua conta OrionHub. Acesso anual com garantia de 7 dias.",
      },
    ],
  }),
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
      setShake(true);
      setTimeout(() => setShake(false), 400);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      mode="signup"
      title="Crie sua conta"
      subtitle="Garantia de 7 dias · 100% do valor de volta"
      shake={shake}
    >
      <form onSubmit={submit} className="mt-6 space-y-4">
        <Field
          id="signup-nome"
          icon={<User className="h-4 w-4" />}
          label="Como gostaria de ser chamado?"
          value={name}
          onChange={setName}
          required
          autoComplete="name"
        />
        <Field
          id="signup-email"
          icon={<Mail className="h-4 w-4" />}
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
          autoComplete="email"
        />
        <div>
          <Field
            id="signup-senha"
            icon={<Lock className="h-4 w-4" />}
            label="Senha (mínimo 6 caracteres)"
            value={pw}
            onChange={setPw}
            required
            autoComplete="new-password"
            isPassword
          />
          <PasswordStrength value={pw} />
        </div>

        <div className="group/field relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within/field:text-[color:var(--accent)]">
            <Globe className="h-4 w-4" />
          </span>
          <label
            htmlFor="signup-pais"
            className="pointer-events-none absolute left-10 top-[0.85rem] z-10 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
          >
            País
          </label>
          <select
            id="signup-pais"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            autoComplete="country-name"
            className="h-[3.4rem] w-full appearance-none rounded-xl border bg-[var(--surface-2)] pl-10 pr-10 pb-1 pt-5 text-sm text-foreground outline-none transition-all focus:border-[color:var(--accent)] focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_14%,transparent)]"
            style={{ borderColor: "var(--border-strong)" }}
          >
            {["Brasil", "Portugal", "Angola", "Moçambique", "Outro"].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
            ▾
          </span>
        </div>

        <AuthError message={err} />

        <SubmitButton loading={loading}>Criar conta</SubmitButton>
      </form>

      <div className="mt-6 flex flex-col items-center gap-3 text-[13px]">
        <p className="text-muted-foreground">
          Já tem conta?{" "}
          <Link
            to="/login"
            viewTransition
            preload="intent"
            className="font-semibold smooth hover:opacity-80"
            style={{ color: "var(--electric)" }}
          >
            Entrar
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
    </AuthLayout>
  );
}
