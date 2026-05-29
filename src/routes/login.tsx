import { createFileRoute, Link, Navigate, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Lock } from "lucide-react";
import { login, useUser } from "@/lib/store";
import { AuthLayout, Field, SubmitButton, AuthError } from "@/components/auth/AuthUI";

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
    <AuthLayout
      mode="login"
      title="Bem-vindo de volta"
      subtitle="Entre com sua conta para continuar"
      shake={shake}
    >
      <form onSubmit={submit} className="mt-7 space-y-4">
        <Field
          id="login-email"
          icon={<Mail className="h-4 w-4" />}
          label="Email"
          type="email"
          value={email}
          onChange={setEmail}
          required
          autoComplete="email"
        />
        <Field
          id="login-senha"
          icon={<Lock className="h-4 w-4" />}
          label="Senha"
          value={pw}
          onChange={setPw}
          required
          autoComplete="current-password"
          isPassword
        />

        <AuthError message={err} />

        <SubmitButton loading={loading}>Entrar</SubmitButton>
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
    </AuthLayout>
  );
}
