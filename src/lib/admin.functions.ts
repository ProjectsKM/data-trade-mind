import { createServerFn, createMiddleware } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";
import { z } from "zod";
import { createHmac, timingSafeEqual } from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const COOKIE_NAME = "orion_admin";
const MAX_AGE = 60 * 60 * 12; // 12h

function secret() {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "lovable-orion-admin-fallback-secret";
}
function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}
function makeToken() {
  const payload = `${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}
function verifyToken(token: string | undefined) {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  try {
    const a = Buffer.from(sig, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length) return false;
    if (!timingSafeEqual(a, b)) return false;
  } catch {
    return false;
  }
  const ts = Number(payload);
  if (!Number.isFinite(ts)) return false;
  if (Date.now() - ts > MAX_AGE * 1000) return false;
  return true;
}
function isAuthed() {
  return verifyToken(getCookie(COOKIE_NAME));
}

const requireAdminSession = createMiddleware({ type: "function" }).server(async ({ next }) => {
  if (!isAuthed()) {
    throw new Response("Unauthorized", { status: 401 });
  }
  return next({ context: { admin: true as const } });
});

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ password: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const expected = process.env.ADMIN_PASSWORD;
    if (!expected) return { ok: false as const, error: "ADMIN_PASSWORD não configurado." };
    if (data.password !== expected) return { ok: false as const, error: "Senha incorreta." };
    setCookie(COOKIE_NAME, makeToken(), {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: MAX_AGE,
    });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  deleteCookie(COOKIE_NAME, { path: "/" });
  return { ok: true as const };
});

export const adminCheck = createServerFn({ method: "GET" }).handler(async () => {
  return { authed: isAuthed() };
});

export type AdminUserRow = {
  user_id: string;
  email: string | null;
  name: string | null;
  country: string | null;
  created_at: string;
  is_pro: boolean;
  analyses_left: number;
  trial_days_left: number;
  trial_started_at: string | null;
};

type AdminListUsersResult = { users: AdminUserRow[]; error?: string };

export const listUsers = createServerFn({ method: "GET" })
  .middleware([requireAdminSession])
  .handler(async (): Promise<AdminListUsersResult> => {
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });
      if (authError) return { users: [], error: authError.message };

      const authUsers = authData.users ?? [];
      const userIds = authUsers.map((u) => u.id);
      if (userIds.length === 0) return { users: [] };

      const { data: profiles, error: e1 } = await supabaseAdmin
        .from("profiles")
        .select("user_id, email, name, country, created_at")
        .in("user_id", userIds);
      if (e1) return { users: [], error: e1.message };

      const { data: plans, error: e2 } = await supabaseAdmin
        .from("user_plans")
        .select("user_id, is_pro, analyses_left, trial_days_left, trial_started_at")
        .in("user_id", userIds);
      if (e2) return { users: [], error: e2.message };

      const profileMap = new Map((profiles ?? []).map((p) => [p.user_id, p]));
      const planMap = new Map((plans ?? []).map((p) => [p.user_id, p]));
      const rows: AdminUserRow[] = authUsers.map((u) => {
        const pr = profileMap.get(u.id);
        const pl = planMap.get(u.id);
        return {
          user_id: u.id,
          email: pr?.email ?? u.email ?? null,
          name: pr?.name ?? (typeof u.user_metadata?.name === "string" ? u.user_metadata.name : null),
          country: pr?.country ?? (typeof u.user_metadata?.country === "string" ? u.user_metadata.country : null),
          created_at: pr?.created_at ?? u.created_at,
          is_pro: pl?.is_pro ?? false,
          analyses_left: pl?.analyses_left ?? 5,
          trial_days_left: pl?.trial_days_left ?? 7,
          trial_started_at: pl?.trial_started_at ?? null,
        };
      }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      return { users: rows };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha ao carregar usuários.";
      return { users: [], error: message };
    }
  });

export const promoteUser = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((d) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("user_plans")
      .update({
        is_pro: true,
        analyses_left: 9999,
        trial_days_left: 365,
        trial_started_at: new Date().toISOString(),
      })
      .eq("user_id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const demoteUser = createServerFn({ method: "POST" })
  .middleware([requireAdminSession])
  .inputValidator((d) => z.object({ userId: z.string().uuid() }).parse(d))
  .handler(async ({ data }) => {
    const { error } = await supabaseAdmin
      .from("user_plans")
      .update({
        is_pro: false,
        analyses_left: 5,
        trial_days_left: 7,
        trial_started_at: new Date().toISOString(),
      })
      .eq("user_id", data.userId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });