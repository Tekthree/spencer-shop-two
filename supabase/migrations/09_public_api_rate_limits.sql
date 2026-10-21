-- Durable per-client throttling for expensive public API routes.

CREATE TABLE IF NOT EXISTS public.api_rate_limits (
  scope TEXT NOT NULL,
  identifier_hash TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 0,
  window_started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (scope, identifier_hash)
);

CREATE INDEX IF NOT EXISTS idx_api_rate_limits_updated_at
  ON public.api_rate_limits (updated_at);

CREATE OR REPLACE FUNCTION public.consume_api_rate_limit(
  p_scope TEXT,
  p_identifier_hash TEXT,
  p_max_requests INTEGER,
  p_window_seconds INTEGER
)
RETURNS TABLE(allowed BOOLEAN, retry_after_seconds INTEGER)
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  v_limit public.api_rate_limits%ROWTYPE;
  v_window INTERVAL := make_interval(secs => p_window_seconds);
BEGIN
  IF p_max_requests < 1 OR p_window_seconds < 1 THEN
    RAISE EXCEPTION 'Invalid rate-limit configuration';
  END IF;

  -- Amortized cleanup prevents abandoned client hashes from accumulating.
  IF random() < 0.01 THEN
    DELETE FROM public.api_rate_limits WHERE updated_at < now() - INTERVAL '24 hours';
  END IF;

  INSERT INTO public.api_rate_limits (
    scope, identifier_hash, request_count, window_started_at, updated_at
  ) VALUES (
    p_scope, p_identifier_hash, 1, now(), now()
  )
  ON CONFLICT (scope, identifier_hash) DO UPDATE SET
    request_count = CASE
      WHEN api_rate_limits.window_started_at < now() - v_window THEN 1
      ELSE api_rate_limits.request_count + 1
    END,
    window_started_at = CASE
      WHEN api_rate_limits.window_started_at < now() - v_window THEN now()
      ELSE api_rate_limits.window_started_at
    END,
    updated_at = now()
  RETURNING * INTO v_limit;

  allowed := v_limit.request_count <= p_max_requests;
  retry_after_seconds := CASE
    WHEN allowed THEN 0
    ELSE GREATEST(
      CEIL(EXTRACT(EPOCH FROM ((v_limit.window_started_at + v_window) - now())))::INTEGER,
      1
    )
  END;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON TABLE public.api_rate_limits FROM PUBLIC;
REVOKE ALL ON FUNCTION public.consume_api_rate_limit(TEXT, TEXT, INTEGER, INTEGER) FROM PUBLIC;
