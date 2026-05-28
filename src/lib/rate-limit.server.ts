import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Server-only rate limiter for AI endpoints. Backed by the `check_ai_rate_limit`
 * Postgres function (see migration 20260528120000_ai_rate_limit.sql), which
 * enforces per-minute and per-day caps per user+endpoint atomically.
 *
 * Returns true when the call is allowed (and has been logged), false when the
 * user is over the limit. On an unexpected DB error it fails OPEN (returns true)
 * so a transient DB hiccup never blocks paying users — the limit is a cost guard,
 * not a security boundary.
 */
export async function enforceAiRateLimit(
  userId: string,
  endpoint: string,
  opts?: { maxPerMin?: number; maxPerDay?: number },
): Promise<boolean> {
  try {
    const { data, error } = await supabaseAdmin.rpc("check_ai_rate_limit", {
      p_user_id: userId,
      p_endpoint: endpoint,
      p_max_per_min: opts?.maxPerMin ?? 12,
      p_max_per_day: opts?.maxPerDay ?? 300,
    });
    if (error) {
      console.error("rate-limit rpc error", error);
      return true;
    }
    return data !== false;
  } catch (e) {
    console.error("rate-limit exception", e);
    return true;
  }
}
