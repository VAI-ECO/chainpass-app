-- §2 steps 8 + 10 session markers
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS requirements_signed_at timestamptz;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS congratulations_at timestamptz;

COMMENT ON COLUMN public.sessions.requirements_signed_at IS
  '§2 step 8 — platform requirements (signature agreement + elected docs) signed after V.A.I. live.';
COMMENT ON COLUMN public.sessions.congratulations_at IS
  '§2 step 10 — congratulations after baseline commit; precedes handoff.';
