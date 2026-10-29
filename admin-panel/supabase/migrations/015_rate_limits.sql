-- ============================================================
-- 015_rate_limits.sql
-- Jednoduchý rate limit (počítadlo požadavků v časovém okně) pro veřejné
-- endpointy: AI chatbot (edge funkce nano-assistant) a odesílání poptávek
-- (API routa /api/inquiry ve new-frontend). Volat ho smí jen service role.
-- ============================================================

CREATE TABLE IF NOT EXISTS public.rate_limits (
  key          TEXT        NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count        INTEGER     NOT NULL DEFAULT 0,
  PRIMARY KEY (key, window_start)
);

CREATE INDEX IF NOT EXISTS rate_limits_window_start_idx ON public.rate_limits (window_start);

-- RLS bez politik = tabulka je nepřístupná pro anon i authenticated
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Vrátí true, pokud je požadavek v limitu (a započítá ho), jinak false.
CREATE OR REPLACE FUNCTION public.check_rate_limit(p_key TEXT, p_limit INTEGER, p_window_seconds INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_window TIMESTAMPTZ := to_timestamp(floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds);
  v_count  INTEGER;
BEGIN
  INSERT INTO public.rate_limits (key, window_start, count)
  VALUES (p_key, v_window, 1)
  ON CONFLICT (key, window_start) DO UPDATE SET count = public.rate_limits.count + 1
  RETURNING count INTO v_count;

  -- úklid starých oken (levné díky indexu)
  DELETE FROM public.rate_limits WHERE window_start < now() - INTERVAL '1 day';

  RETURN v_count <= p_limit;
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;
