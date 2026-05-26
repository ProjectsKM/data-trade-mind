import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Verifies the Supabase JWT from a Request's Authorization header.
 * Returns the user id on success, null on failure.
 * Server-only — never import from client code.
 *
 * Uses supabaseAdmin.auth.getUser() so that the JWT is validated
 * server-side by Supabase (cryptographically secure, no extra env
 * vars needed beyond SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).
 */
export async function verifySupabaseUser(request: Request): Promise<string | null> {
  const auth = request.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const token = auth.slice("Bearer ".length).trim();
  if (!token) return null;

  try {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(token);
    if (error || !user?.id) return null;
    return user.id;
  } catch {
    return null;
  }
}
