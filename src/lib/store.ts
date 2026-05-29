// Supabase-backed auth + per-user app state.
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { User as AuthUser } from "@supabase/supabase-js";

export type User = {
  id: string;
  name: string;
  email: string;
  country?: string;
  createdAt: string;
};

export type Trade = {
  id: string;
  ativo: string;
  data: string;
  dir: "COMPRA" | "VENDA";
  valor: number;
  res: "WIN" | "LOSS" | "OPEN";
  payout: number;
  lucro: number;
  obs?: string;
};

export type ScanResult = {
  id?: string;
  ativo?: string;
  timeframe?: string;
  direcao?: "COMPRA" | "VENDA";
  confianca?: number;
  assertividade?: string;
  tendencia?: string;
  vies?: string;
  suporte?: string;
  resistencia?: string;
  padroes?: string[];
  indicadores?: string[];
  justificativa?: string;
  riscos?: string[];
  entrada?: string;
  protecao1?: string;
  protecao2?: string;
  createdAt?: string;
};

export type ChatMsg = { id?: string; role: "user" | "assistant"; content: string; ts?: string };

export type AppState = {
  isPro: boolean;
  trialDaysLeft: number;
  analysesLeft: number;
  trialStartedAt: string;
  tradeList: Trade[];
  history: ScanResult[];
  mindMessages: ChatMsg[];
};

const defaultState = (): AppState => ({
  isPro: false,
  trialDaysLeft: 7,
  analysesLeft: 5,
  trialStartedAt: new Date().toISOString(),
  tradeList: [],
  history: [],
  mindMessages: [],
});

function toUser(
  u: AuthUser,
  profile?: { name?: string | null; country?: string | null } | null,
): User {
  return {
    id: u.id,
    email: u.email ?? "",
    name: profile?.name || (u.user_metadata?.name as string) || (u.email?.split("@")[0] ?? "user"),
    country: profile?.country || (u.user_metadata?.country as string) || undefined,
    createdAt: u.created_at,
  };
}

// ---------- Auth API ----------

export async function signup(input: {
  name: string;
  email: string;
  password: string;
  country?: string;
}): Promise<User> {
  if (input.password.length < 6) throw new Error("Senha precisa de pelo menos 6 caracteres.");
  const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/scan` : undefined;
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim().toLowerCase(),
    password: input.password,
    options: {
      data: { name: input.name.trim(), country: input.country },
      emailRedirectTo: redirectUrl,
    },
  });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error("Não foi possível criar a conta.");
  return toUser(data.user);
}

export async function login(emailRaw: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailRaw.trim().toLowerCase(),
    password,
  });
  if (error)
    throw new Error(
      error.message === "Invalid login credentials" ? "Email ou senha incorretos." : error.message,
    );
  if (!data.user) throw new Error("Falha no login.");
  return toUser(data.user);
}

export async function logout() {
  await supabase.auth.signOut();
}

// ---------- Hooks ----------

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      // Eventos que indicam mudança REAL de auth:
      //   SIGNED_OUT, USER_UPDATED — limpa/atualiza user
      //   SIGNED_IN, INITIAL_SESSION, TOKEN_REFRESHED — define user da sessão
      // NÃO derruba user em eventos transitórios (PASSWORD_RECOVERY, etc) —
      // antes era `setUser(session?.user ?? null)` sempre, e qualquer evento
      // sem sessão temporariamente derrubava o user e redirecionava pra /login.
      if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (
        event === "INITIAL_SESSION" ||
        event === "SIGNED_IN" ||
        event === "TOKEN_REFRESHED" ||
        event === "USER_UPDATED"
      ) {
        setUser(session?.user ? toUser(session.user) : null);
      }
      setReady(true);
    });
    // Tenta refresh primeiro: estende a sessão se ainda houver refresh token
    // válido, evitando logout em quem deixou a aba aberta por horas.
    supabase.auth
      .refreshSession()
      .then(({ data, error }) => {
        if (!error && data.session?.user) {
          setUser(toUser(data.session.user));
          setReady(true);
          return;
        }
        // Refresh falhou (sem refresh token ou expirado) — fallback pra
        // getSession (pode ter access token ainda válido).
        return supabase.auth.getSession().then(({ data: s }) => {
          setUser(s.session?.user ? toUser(s.session.user) : null);
          setReady(true);
        });
      })
      .catch(() => {
        // Erro de rede no refresh — não derruba, deixa user atual e marca ready.
        setReady(true);
      });
    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, ready };
}

export function useAppState() {
  const { user } = useUser();
  const [state, setState] = useState<AppState>(defaultState);
  const userIdRef = useRef<string | null>(null);

  // Load all data when user changes.
  useEffect(() => {
    if (!user) {
      userIdRef.current = null;
      setState(defaultState());
      return;
    }
    userIdRef.current = user.id;
    let cancelled = false;
    (async () => {
      const [planRes, tradesRes, scansRes, msgsRes] = await Promise.all([
        supabase.from("user_plans").select("*").eq("user_id", user.id).maybeSingle(),
        supabase
          .from("trades")
          .select("*")
          .eq("user_id", user.id)
          .order("data", { ascending: false }),
        supabase
          .from("scan_history")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("mind_messages")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true })
          .limit(200),
      ]);
      if (cancelled) return;
      const plan = planRes.data;
      const trialStart = plan?.trial_started_at ?? new Date().toISOString();
      const trialDaysLeft = plan?.is_pro ? 999 : (plan?.trial_days_left ?? 0);
      setState({
        isPro: plan?.is_pro ?? false,
        analysesLeft: plan?.analyses_left ?? 0,
        trialDaysLeft,
        trialStartedAt: trialStart,
        tradeList: (tradesRes.data ?? []).map((t) => ({
          id: t.id,
          ativo: t.ativo,
          data: t.data,
          dir: t.dir as Trade["dir"],
          valor: Number(t.valor),
          payout: Number(t.payout),
          res: t.res as Trade["res"],
          lucro: Number(t.lucro),
          obs: t.obs ?? undefined,
        })),
        history: (scansRes.data ?? []).map((s) => ({
          ...((s.result as object) ?? {}),
          id: s.id,
          ativo: s.ativo ?? undefined,
          timeframe: s.timeframe ?? undefined,
          direcao: (s.direcao as ScanResult["direcao"]) ?? undefined,
          confianca: s.confianca ?? undefined,
          createdAt: s.created_at,
        })),
        mindMessages: (msgsRes.data ?? []).map((m) => ({
          id: m.id,
          role: m.role as ChatMsg["role"],
          content: m.content,
          ts: m.created_at,
        })),
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Update plan fields (analysesLeft, trialDaysLeft, trialStartedAt). For arrays use helpers.
  // NÃO permite alterar `isPro` pelo client: promoção/rebaixamento de plano é
  // exclusivo do servidor (admin.functions.ts), nunca do browser.
  const update = useCallback(
    (patch: Partial<Pick<AppState, "analysesLeft" | "trialDaysLeft" | "trialStartedAt">>) => {
      const uid = userIdRef.current;
      if (!uid) return;
      setState((prev) => {
        const next = { ...prev, ...patch };
        const dbPatch: Record<string, unknown> = {};
        if (patch.analysesLeft !== undefined) dbPatch.analyses_left = patch.analysesLeft;
        if (patch.trialDaysLeft !== undefined) dbPatch.trial_days_left = patch.trialDaysLeft;
        if (patch.trialStartedAt !== undefined) dbPatch.trial_started_at = patch.trialStartedAt;
        if (Object.keys(dbPatch).length) {
          supabase
            .from("user_plans")
            .update(dbPatch as never)
            .eq("user_id", uid)
            .then(({ error }) => {
              if (error) console.error("update plan", error);
            });
        }
        return next;
      });
    },
    [],
  );

  const addTrade = useCallback(async (t: Omit<Trade, "id">) => {
    const uid = userIdRef.current;
    if (!uid) return;
    const { data, error } = await supabase
      .from("trades")
      .insert({
        user_id: uid,
        ativo: t.ativo,
        data: t.data,
        dir: t.dir,
        valor: t.valor,
        payout: t.payout,
        res: t.res,
        lucro: t.lucro,
        obs: t.obs ?? null,
      })
      .select()
      .single();
    if (error || !data) {
      console.error("addTrade", error);
      toast.error("Não foi possível registrar a operação. Tente novamente.");
      return;
    }
    const created: Trade = {
      id: data.id,
      ativo: data.ativo,
      data: data.data,
      dir: data.dir as Trade["dir"],
      valor: Number(data.valor),
      payout: Number(data.payout),
      res: data.res as Trade["res"],
      lucro: Number(data.lucro),
      obs: data.obs ?? undefined,
    };
    setState((s) => ({ ...s, tradeList: [created, ...s.tradeList] }));
  }, []);

  const updateTrade = useCallback(async (id: string, patch: Partial<Trade>) => {
    const uid = userIdRef.current;
    if (!uid) return;
    // Update otimista + rollback se o Supabase falhar. Antes era
    // fire-and-await sem checar erro: a UI mostrava a alteração mas o banco
    // não salvava, e o usuário não ficava sabendo (dado divergente até reload).
    let prevTrade: Trade | undefined;
    setState((s) => {
      prevTrade = s.tradeList.find((t) => t.id === id);
      return {
        ...s,
        tradeList: s.tradeList.map((t) => (t.id === id ? { ...t, ...patch } : t)),
      };
    });
    const { error } = await supabase
      .from("trades")
      .update({
        ...(patch.ativo !== undefined && { ativo: patch.ativo }),
        ...(patch.data !== undefined && { data: patch.data }),
        ...(patch.dir !== undefined && { dir: patch.dir }),
        ...(patch.valor !== undefined && { valor: patch.valor }),
        ...(patch.payout !== undefined && { payout: patch.payout }),
        ...(patch.res !== undefined && { res: patch.res }),
        ...(patch.lucro !== undefined && { lucro: patch.lucro }),
        ...(patch.obs !== undefined && { obs: patch.obs ?? null }),
      })
      .eq("id", id);
    if (error) {
      console.error("updateTrade", error);
      toast.error("Não foi possível salvar a alteração.");
      if (prevTrade) {
        const restored = prevTrade;
        setState((s) => ({
          ...s,
          tradeList: s.tradeList.map((t) => (t.id === id ? restored : t)),
        }));
      }
    }
  }, []);

  const deleteTrade = useCallback(async (id: string) => {
    // Remoção otimista + restauração se o Supabase falhar.
    let prevList: Trade[] | null = null;
    setState((s) => {
      prevList = s.tradeList;
      return { ...s, tradeList: s.tradeList.filter((t) => t.id !== id) };
    });
    const { error } = await supabase.from("trades").delete().eq("id", id);
    if (error) {
      console.error("deleteTrade", error);
      toast.error("Não foi possível excluir a operação.");
      if (prevList) {
        const restored = prevList;
        setState((s) => ({ ...s, tradeList: restored }));
      }
    }
  }, []);

  const addScan = useCallback(async (r: ScanResult) => {
    const uid = userIdRef.current;
    if (!uid) return;
    const { data, error } = await supabase
      .from("scan_history")
      .insert({
        user_id: uid,
        ativo: r.ativo ?? null,
        timeframe: r.timeframe ?? null,
        direcao: r.direcao ?? null,
        confianca: r.confianca ?? null,
        result: r as never,
      })
      .select()
      .single();
    if (error || !data) {
      console.error("addScan", error);
      return;
    }
    setState((s) => ({
      ...s,
      history: [{ ...r, id: data.id, createdAt: data.created_at }, ...s.history].slice(0, 50),
    }));
  }, []);

  const addMindMessages = useCallback(async (msgs: ChatMsg[]) => {
    const uid = userIdRef.current;
    if (!uid || msgs.length === 0) return;
    setState((s) => ({ ...s, mindMessages: [...s.mindMessages, ...msgs] }));
    await supabase
      .from("mind_messages")
      .insert(msgs.map((m) => ({ user_id: uid, role: m.role, content: m.content })));
  }, []);

  const clearMind = useCallback(async () => {
    const uid = userIdRef.current;
    if (!uid) return;
    setState((s) => ({ ...s, mindMessages: [] }));
    await supabase.from("mind_messages").delete().eq("user_id", uid);
  }, []);

  return { state, update, addTrade, updateTrade, deleteTrade, addScan, addMindMessages, clearMind };
}

// Synchronous getter no longer available — use useUser() hook.
export function getCurrentUser(): null {
  return null;
}
