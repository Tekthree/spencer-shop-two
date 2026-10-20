-- Add durable operational error reporting and database-backed admin login throttling.

CREATE TABLE IF NOT EXISTS public.operational_events (
  id BIGSERIAL PRIMARY KEY,
  severity TEXT NOT NULL DEFAULT 'error' CHECK (severity IN ('warning', 'error', 'critical')),
  event_key TEXT UNIQUE,
  source TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_operational_events_unresolved
  ON public.operational_events (created_at DESC)
  WHERE resolved_at IS NULL;

CREATE TABLE IF NOT EXISTS public.admin_login_attempts (
  identifier_hash TEXT PRIMARY KEY,
  attempts INTEGER NOT NULL DEFAULT 0,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  blocked_until TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.check_admin_login_rate_limit(p_identifier_hash TEXT)
RETURNS TABLE(allowed BOOLEAN, retry_after_seconds INTEGER)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_attempt public.admin_login_attempts%ROWTYPE;
BEGIN
  DELETE FROM public.admin_login_attempts WHERE updated_at < now() - INTERVAL '24 hours';

  SELECT * INTO v_attempt
  FROM public.admin_login_attempts
  WHERE identifier_hash = p_identifier_hash;

  IF NOT FOUND OR v_attempt.window_started_at < now() - INTERVAL '15 minutes' THEN
    allowed := TRUE;
    retry_after_seconds := 0;
  ELSIF v_attempt.blocked_until IS NOT NULL AND v_attempt.blocked_until > now() THEN
    allowed := FALSE;
    retry_after_seconds := GREATEST(CEIL(EXTRACT(EPOCH FROM (v_attempt.blocked_until - now())))::INTEGER, 1);
  ELSE
    allowed := TRUE;
    retry_after_seconds := 0;
  END IF;

  RETURN NEXT;
END;
$$;

CREATE OR REPLACE FUNCTION public.record_admin_login_failure(p_identifier_hash TEXT)
RETURNS VOID
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.admin_login_attempts (
    identifier_hash, attempts, window_started_at, blocked_until, updated_at
  ) VALUES (
    p_identifier_hash, 1, now(), NULL, now()
  )
  ON CONFLICT (identifier_hash) DO UPDATE SET
    attempts = CASE
      WHEN admin_login_attempts.window_started_at < now() - INTERVAL '15 minutes' THEN 1
      ELSE admin_login_attempts.attempts + 1
    END,
    window_started_at = CASE
      WHEN admin_login_attempts.window_started_at < now() - INTERVAL '15 minutes' THEN now()
      ELSE admin_login_attempts.window_started_at
    END,
    blocked_until = CASE
      WHEN admin_login_attempts.window_started_at < now() - INTERVAL '15 minutes' THEN NULL
      WHEN admin_login_attempts.attempts + 1 >= 8 THEN now() + INTERVAL '15 minutes'
      ELSE admin_login_attempts.blocked_until
    END,
    updated_at = now();
END;
$$;

CREATE OR REPLACE FUNCTION public.clear_admin_login_failures(p_identifier_hash TEXT)
RETURNS VOID
LANGUAGE sql
SET search_path = public, pg_temp
AS $$
  DELETE FROM public.admin_login_attempts WHERE identifier_hash = p_identifier_hash;
$$;

REVOKE ALL ON TABLE public.operational_events FROM PUBLIC;
REVOKE ALL ON TABLE public.admin_login_attempts FROM PUBLIC;
REVOKE ALL ON SEQUENCE public.operational_events_id_seq FROM PUBLIC;
REVOKE ALL ON FUNCTION public.check_admin_login_rate_limit(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_admin_login_failure(TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.clear_admin_login_failures(TEXT) FROM PUBLIC;
