-- Rate limiting / cost control for AI endpoints (ai-mind, ai-scan, transcribe).
-- Accessed exclusively by the service role from server routes (bypasses RLS).

CREATE TABLE IF NOT EXISTS public.ai_call_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ai_call_log_user_endpoint_time
  ON public.ai_call_log (user_id, endpoint, created_at DESC);

ALTER TABLE public.ai_call_log ENABLE ROW LEVEL SECURITY;
-- No policies on purpose: only the service role (which bypasses RLS) may read/write.

-- Atomically check per-minute and per-day limits for a user+endpoint and, when
-- under the limits, log the call. Returns true if the call is allowed.
-- A per-(user,endpoint) advisory lock serializes concurrent calls so two
-- simultaneous requests cannot both slip past the limit.
CREATE OR REPLACE FUNCTION public.check_ai_rate_limit(
  p_user_id uuid,
  p_endpoint text,
  p_max_per_min integer DEFAULT 12,
  p_max_per_day integer DEFAULT 300
) RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _per_min integer;
  _per_day integer;
BEGIN
  PERFORM pg_advisory_xact_lock(hashtext(p_user_id::text || ':' || p_endpoint));

  SELECT count(*) INTO _per_min
  FROM public.ai_call_log
  WHERE user_id = p_user_id
    AND endpoint = p_endpoint
    AND created_at > now() - interval '1 minute';
  IF _per_min >= p_max_per_min THEN
    RETURN false;
  END IF;

  SELECT count(*) INTO _per_day
  FROM public.ai_call_log
  WHERE user_id = p_user_id
    AND endpoint = p_endpoint
    AND created_at > now() - interval '1 day';
  IF _per_day >= p_max_per_day THEN
    RETURN false;
  END IF;

  INSERT INTO public.ai_call_log (user_id, endpoint) VALUES (p_user_id, p_endpoint);

  -- Opportunistic cleanup: drop rows older than 2 days for this user/endpoint.
  DELETE FROM public.ai_call_log
  WHERE user_id = p_user_id
    AND endpoint = p_endpoint
    AND created_at < now() - interval '2 days';

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.check_ai_rate_limit(uuid, text, integer, integer) FROM anon, authenticated;

-- ---------------------------------------------------------------------------
-- Admin login brute-force protection (lockout by IP).
-- Accessed exclusively by the service role from the admin server function.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
  ip text PRIMARY KEY,
  fails integer NOT NULL DEFAULT 0,
  locked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;
-- No policies: service role only.

-- Returns true when the IP is currently allowed to attempt a login.
CREATE OR REPLACE FUNCTION public.admin_login_check(p_ip text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _locked timestamptz;
BEGIN
  SELECT locked_until INTO _locked FROM public.admin_login_attempts WHERE ip = p_ip;
  RETURN _locked IS NULL OR _locked <= now();
END;
$$;

-- Records a login attempt. On success resets the counter; on failure increments
-- it and locks the IP for 15 minutes after 5 consecutive failures.
CREATE OR REPLACE FUNCTION public.admin_login_record(p_ip text, p_success boolean)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _fails integer;
BEGIN
  IF p_success THEN
    DELETE FROM public.admin_login_attempts WHERE ip = p_ip;
    RETURN;
  END IF;
  INSERT INTO public.admin_login_attempts (ip, fails, updated_at)
  VALUES (p_ip, 1, now())
  ON CONFLICT (ip) DO UPDATE
    SET fails = public.admin_login_attempts.fails + 1, updated_at = now()
  RETURNING fails INTO _fails;
  IF _fails >= 5 THEN
    UPDATE public.admin_login_attempts
    SET locked_until = now() + interval '15 minutes'
    WHERE ip = p_ip;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_login_check(text) FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.admin_login_record(text, boolean) FROM anon, authenticated;
