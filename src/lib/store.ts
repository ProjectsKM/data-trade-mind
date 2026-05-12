// LocalStorage-backed auth + per-user app state.
import { useEffect, useState, useCallback } from "react";

export type User = {
  name: string;
  email: string;
  country?: string;
  createdAt: string;
};

export type Trade = {
  id: number;
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

export type ChatMsg = { role: "user" | "assistant"; content: string; ts?: string };

export type AppState = {
  isPro: boolean;
  trialDaysLeft: number;
  analysesLeft: number;
  trialStartedAt: string;
  tradeList: Trade[];
  history: ScanResult[];
  mindMessages: ChatMsg[];
};

const KEY_USER = "orion:user";
const KEY_USERS = "orion:users";
const stateKey = (email: string) => `orion:state:${email}`;

const isBrowser = () => typeof window !== "undefined";

const defaultState = (): AppState => ({
  isPro: false,
  trialDaysLeft: 7,
  analysesLeft: 5,
  trialStartedAt: new Date().toISOString(),
  tradeList: [],
  history: [],
  mindMessages: [],
});

function readJSON<T>(k: string, fallback: T): T {
  if (!isBrowser()) return fallback;
  try {
    const raw = localStorage.getItem(k);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(k: string, v: unknown) {
  if (!isBrowser()) return;
  localStorage.setItem(k, JSON.stringify(v));
}

function hash(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return String(h);
}

type Account = { email: string; name: string; country?: string; pw: string };

export function getCurrentUser(): User | null {
  return readJSON<User | null>(KEY_USER, null);
}

export function signup(input: { name: string; email: string; password: string; country?: string }): User {
  const accounts = readJSON<Account[]>(KEY_USERS, []);
  const email = input.email.trim().toLowerCase();
  if (accounts.find((a) => a.email === email)) {
    throw new Error("Já existe uma conta com esse email.");
  }
  if (input.password.length < 6) throw new Error("Senha precisa de pelo menos 6 caracteres.");
  const acc: Account = {
    email,
    name: input.name.trim() || email.split("@")[0],
    country: input.country,
    pw: hash(input.password),
  };
  accounts.push(acc);
  writeJSON(KEY_USERS, accounts);
  const user: User = { name: acc.name, email: acc.email, country: acc.country, createdAt: new Date().toISOString() };
  writeJSON(KEY_USER, user);
  if (!localStorage.getItem(stateKey(email))) writeJSON(stateKey(email), defaultState());
  window.dispatchEvent(new Event("orion:auth"));
  return user;
}

export function login(emailRaw: string, password: string): User {
  const accounts = readJSON<Account[]>(KEY_USERS, []);
  const email = emailRaw.trim().toLowerCase();
  const acc = accounts.find((a) => a.email === email);
  if (!acc || acc.pw !== hash(password)) throw new Error("Email ou senha incorretos.");
  const user: User = { name: acc.name, email: acc.email, country: acc.country, createdAt: new Date().toISOString() };
  writeJSON(KEY_USER, user);
  if (!localStorage.getItem(stateKey(email))) writeJSON(stateKey(email), defaultState());
  window.dispatchEvent(new Event("orion:auth"));
  return user;
}

export function logout() {
  if (!isBrowser()) return;
  localStorage.removeItem(KEY_USER);
  window.dispatchEvent(new Event("orion:auth"));
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setUser(getCurrentUser());
    setReady(true);
    const h = () => setUser(getCurrentUser());
    window.addEventListener("orion:auth", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("orion:auth", h);
      window.removeEventListener("storage", h);
    };
  }, []);
  return { user, ready };
}

export function useAppState() {
  const { user } = useUser();
  const [state, setState] = useState<AppState>(() => defaultState());

  useEffect(() => {
    if (!user) return;
    const s = readJSON<AppState>(stateKey(user.email), defaultState());
    const start = new Date(s.trialStartedAt || new Date().toISOString());
    const days = Math.max(0, 7 - Math.floor((Date.now() - start.getTime()) / 86400000));
    s.trialDaysLeft = s.isPro ? 999 : days;
    setState(s);
  }, [user?.email]);

  const update = useCallback(
    (patch: Partial<AppState> | ((s: AppState) => AppState)) => {
      if (!user) return;
      setState((prev) => {
        const next = typeof patch === "function" ? patch(prev) : { ...prev, ...patch };
        writeJSON(stateKey(user.email), next);
        return next;
      });
    },
    [user?.email]
  );

  return { state, update };
}
