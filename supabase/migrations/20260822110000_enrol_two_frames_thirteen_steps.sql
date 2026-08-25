-- RULINGS-CP-03 — 13-step enrolment, two frames, terms on acceptance.
-- service_role DML on sessions (hosted previously had REFERENCES/TRIGGER/TRUNCATE only).

ALTER TABLE public.sessions
  DROP CONSTRAINT IF EXISTS sessions_enrolment_step_check;

ALTER TABLE public.sessions
  ADD CONSTRAINT sessions_enrolment_step_check
  CHECK (enrolment_step >= 1 AND enrolment_step <= 13);

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS kyc_match_percent numeric;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS acceptance_capture text;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS acceptance_capture_voided_at timestamptz;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS terms_accepted_at timestamptz;

COMMENT ON COLUMN public.sessions.held_capture IS
  'Frame one at step 6. Provider match percentage is kyc_match_percent. Not the committed baseline.';
COMMENT ON COLUMN public.sessions.kyc_match_percent IS
  'Provider match percentage recorded at step 6. Never returned from a public API.';
COMMENT ON COLUMN public.sessions.acceptance_capture IS
  'Frame two at step 8. Taken only after the terms checkbox. Voided on camera-session break.';
COMMENT ON COLUMN public.sessions.terms_accepted_at IS
  'Terms checkbox at the acceptance page. No timestamp, no second capture, no baseline.';

GRANT SELECT, INSERT, UPDATE ON public.sessions TO service_role;
