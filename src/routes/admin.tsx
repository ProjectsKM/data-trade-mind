import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import {
  Lock,
  LogOut,
  Search,
  ShieldCheck,
  Crown,
  RefreshCw,
  Users,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  adminLogin,
  adminLogout,
  adminCheck,
  listUsers,
  promoteUser,
  demoteUser,
  type AdminUserRow,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [{ title: "Admin — OrionHub" }, { name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const check = useServerFn(adminCheck);

  useEffect(() => {
    let cancelled = false;
    check()
      .then((r) => {
        if (!cancelled) setAuthed(r.authed);
      })
      .catch(() => {
        if (!cancelled) setAuthed(false);
      });
    return () => {
      cancelled = true;
    };
  }, [check]);

  if (authed === null) {
    return (
      <div
        className="flex min-h-dvh items-center justify-center"
        style={{ background: "var(--background)" }}
      >
        <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Carregando…</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-dvh"
      style={{ background: "var(--background)", color: "var(--foreground)" }}
    >
      {authed ? (
        <Panel onLogout={() => setAuthed(false)} />
      ) : (
        <LoginCard onAuthed={() => setAuthed(true)} />
      )}
    </div>
  );
}

function LoginCard({ onAuthed }: { onAuthed: () => void }) {
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useServerFn(adminLogin);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pw || loading) return;
    setLoading(true);
    try {
      const r = await login({ data: { password: pw } });
      if (r.ok) {
        toast.success("Acesso liberado.");
        onAuthed();
      } else {
        toast.error(r.error || "Falha ao entrar.");
      }
    } catch {
      toast.error("Erro ao validar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-3xl border p-7 fade-up"
        style={{
          background: "var(--surface)",
          borderColor: "var(--border-strong)",
          boxShadow: "0 30px 80px -40px color-mix(in oklab, var(--accent) 50%, transparent)",
        }}
      >
        <div className="mb-5 flex items-center justify-center">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              background: "color-mix(in oklab, var(--accent) 14%, transparent)",
              color: "var(--accent)",
            }}
          >
            <ShieldCheck className="h-6 w-6" strokeWidth={1.6} />
          </div>
        </div>
        <div className="text-center">
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Painel Admin</h1>
          <p className="mt-1 text-xs text-muted-foreground">Acesso restrito · OrionHub</p>
        </div>
        <label className="mt-6 block text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Senha de acesso
        </label>
        <div
          className="mt-2 flex items-center gap-2 rounded-xl border px-3 smooth focus-within:border-[color:var(--accent)]"
          style={{ background: "var(--surface-2)", borderColor: "var(--border-strong)" }}
        >
          <Lock className="h-4 w-4 text-muted-foreground" />
          <input
            type="password"
            autoFocus
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            className="flex-1 bg-transparent py-2.5 text-sm outline-none"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !pw}
          className="mt-5 w-full rounded-xl px-4 py-3 text-sm font-bold smooth press disabled:opacity-50"
          style={{ background: "var(--gradient-primary)", color: "var(--accent-foreground)" }}
        >
          {loading ? "Validando…" : "Entrar"}
        </button>
        <p className="mt-4 text-center text-[10px] text-muted-foreground">
          Esta página não é indexada e exige senha única.
        </p>
      </form>
    </div>
  );
}

function Panel({ onLogout }: { onLogout: () => void }) {
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "free" | "pro">("all");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchUsers = useServerFn(listUsers);
  const promote = useServerFn(promoteUser);
  const demote = useServerFn(demoteUser);
  const logout = useServerFn(adminLogout);

  async function refresh() {
    setLoading(true);
    try {
      const r = await fetchUsers();
      if (r?.error) {
        toast.error(r.error);
      }
      setRows(Array.isArray(r?.users) ? r.users : []);
    } catch {
      setRows([]);
      toast.error("Falha ao carregar usuários. Verifique a secret SUPABASE_SERVICE_ROLE_KEY.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, []);

  const stats = useMemo(() => {
    const total = rows.length;
    const pro = rows.filter((r) => r.is_pro).length;
    const free = total - pro;
    const week = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = rows.filter((r) => new Date(r.created_at).getTime() > week).length;
    return { total, pro, free, recent };
  }, [rows]);

  const filtered = useMemo(() => {
    const ql = q.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter === "pro" && !r.is_pro) return false;
      if (filter === "free" && r.is_pro) return false;
      if (!ql) return true;
      return (
        (r.email || "").toLowerCase().includes(ql) || (r.name || "").toLowerCase().includes(ql)
      );
    });
  }, [rows, filter, q]);

  async function doPromote(id: string) {
    setBusy(id);
    try {
      await promote({ data: { userId: id } });
      setRows((rs) =>
        rs.map((r) =>
          r.user_id === id ? { ...r, is_pro: true, analyses_left: 9999, trial_days_left: 365 } : r,
        ),
      );
      toast.success("Promovido para PRO Anual.");
    } catch {
      toast.error("Falha ao promover.");
    } finally {
      setBusy(null);
    }
  }
  async function doDemote(id: string) {
    setBusy(id);
    try {
      await demote({ data: { userId: id } });
      setRows((rs) =>
        rs.map((r) =>
          r.user_id === id ? { ...r, is_pro: false, analyses_left: 5, trial_days_left: 7 } : r,
        ),
      );
      toast.success("Acesso revertido para Free.");
    } catch {
      toast.error("Falha ao despromover.");
    } finally {
      setBusy(null);
    }
  }
  async function doLogout() {
    try {
      await logout();
    } catch {
      /* ignore */
    }
    toast.success("Sessão encerrada.");
    onLogout();
  }
  async function copyEmail(email: string | null) {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(email);
      setCopied(email);
      setTimeout(() => setCopied(null), 1200);
    } catch {
      toast.error("Não consegui copiar.");
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-8">
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            OrionHub
          </div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight">Painel Admin</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refresh}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium smooth press hover:border-[color:var(--accent)] hover:text-[color:var(--accent)]"
            style={{ borderColor: "var(--border-strong)", background: "var(--surface)" }}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} /> Atualizar
          </button>
          <button
            onClick={doLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium smooth press hover:border-[color:var(--red)] hover:text-[color:var(--red)]"
            style={{ borderColor: "var(--border-strong)", background: "var(--surface)" }}
          >
            <LogOut className="h-3.5 w-3.5" /> Sair
          </button>
        </div>
      </header>

      <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 stagger">
        <Stat label="Usuários" value={stats.total} icon={<Users className="h-4 w-4" />} />
        <Stat label="PRO Anual" value={stats.pro} icon={<Crown className="h-4 w-4" />} accent />
        <Stat label="Free" value={stats.free} icon={<Users className="h-4 w-4" />} />
        <Stat label="Novos (7d)" value={stats.recent} icon={<Users className="h-4 w-4" />} />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div
          className="flex items-center gap-1 rounded-lg border p-1"
          style={{ borderColor: "var(--border)", background: "var(--surface)" }}
        >
          {(["all", "free", "pro"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setFilter(k)}
              className="rounded-md px-3 py-1.5 text-xs font-semibold smooth"
              style={
                filter === k
                  ? {
                      background: "color-mix(in oklab, var(--accent) 18%, var(--surface-2))",
                      color: "var(--foreground)",
                    }
                  : { color: "var(--text-muted)" }
              }
            >
              {k === "all" ? "Todos" : k === "free" ? "Free" : "PRO Anual"}
            </button>
          ))}
        </div>
        <div
          className="flex flex-1 min-w-[220px] items-center gap-2 rounded-lg border px-3"
          style={{ background: "var(--surface)", borderColor: "var(--border)" }}
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por email ou nome…"
            className="w-full bg-transparent py-2 text-sm outline-none"
          />
        </div>
      </div>

      <div
        className="overflow-hidden rounded-2xl border"
        style={{ borderColor: "var(--border)", background: "var(--surface)" }}
      >
        <div
          className="grid grid-cols-12 gap-3 border-b px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
          style={{ borderColor: "var(--border)" }}
        >
          <div className="col-span-5">Usuário</div>
          <div className="col-span-3">Plano</div>
          <div className="col-span-4 text-right">Ações</div>
        </div>
        {loading && (
          <div className="px-4 py-10 text-center text-xs text-muted-foreground">
            Carregando usuários…
          </div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="px-4 py-10 text-center text-xs text-muted-foreground">
            Nenhum usuário encontrado. Se há usuários no Supabase Auth, confira a secret
            SUPABASE_SERVICE_ROLE_KEY.
          </div>
        )}
        {!loading &&
          filtered.map((r) => (
            <div
              key={r.user_id}
              className="grid grid-cols-12 items-center gap-3 border-b px-4 py-3 text-sm smooth hover:bg-[color:var(--surface-2)]"
              style={{ borderColor: "var(--border)" }}
            >
              <div className="col-span-5 min-w-0">
                <div className="flex items-center gap-2 truncate font-medium">{r.name || "—"}</div>
                <button
                  onClick={() => copyEmail(r.email)}
                  className="mt-0.5 inline-flex items-center gap-1.5 truncate text-[11px] text-muted-foreground hover:text-[color:var(--accent)]"
                >
                  {copied === r.email ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                  <span className="truncate">{r.email || "(sem email)"}</span>
                </button>
              </div>
              <div className="col-span-3">
                {r.is_pro ? (
                  <span
                    className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: "color-mix(in oklab, var(--accent) 18%, transparent)",
                      color: "var(--accent)",
                    }}
                  >
                    <Crown className="h-3 w-3" /> PRO Anual
                  </span>
                ) : (
                  <span
                    className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground"
                    style={{ background: "var(--surface-2)" }}
                  >
                    Free
                  </span>
                )}
              </div>
              <div className="col-span-4 flex justify-end gap-2">
                {r.is_pro ? (
                  <button
                    disabled={busy === r.user_id}
                    onClick={() => doDemote(r.user_id)}
                    className="rounded-md border px-2.5 py-1 text-[11px] font-semibold smooth press hover:border-[color:var(--red)] hover:text-[color:var(--red)] disabled:opacity-50"
                    style={{ borderColor: "var(--border-strong)", background: "var(--surface-2)" }}
                  >
                    Despromover
                  </button>
                ) : (
                  <button
                    disabled={busy === r.user_id}
                    onClick={() => doPromote(r.user_id)}
                    className="rounded-md px-2.5 py-1 text-[11px] font-bold smooth press disabled:opacity-50"
                    style={{
                      background: "var(--gradient-primary)",
                      color: "var(--accent-foreground)",
                    }}
                  >
                    Promover PRO Anual
                  </button>
                )}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className="rounded-2xl border p-4 card-glow"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        <span>{label}</span>
        <span style={{ color: accent ? "var(--accent)" : "var(--text-dim)" }}>{icon}</span>
      </div>
      <div
        className="mt-1 font-display text-3xl font-black tabular"
        style={{ color: accent ? "var(--accent)" : "var(--foreground)" }}
      >
        {value}
      </div>
    </div>
  );
}
