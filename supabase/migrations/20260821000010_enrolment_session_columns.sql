-- §2.5 / §16.6 step 4 — enrolment progress on sessions.
-- Platform ID arrives only via signed token at open; never via query string.

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS enrolment_step smallint NOT NULL DEFAULT 1
    CHECK (enrolment_step >= 1 AND enrolment_step <= 11);

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS biometric_consent_at timestamptz;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS username text;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS contact_email text;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS contact_phone text;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS otp_verified_at timestamptz;

-- Held capture from step 6 — NOT the committed baseline (§2.7).
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS held_capture text;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS held_capture_voided_at timestamptz;

-- Provider session key held until handoff, then deleted (§2.4 / §2.4a).
ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS provider_session_key text;

COMMENT ON COLUMN public.sessions.held_capture IS
  'Step-6 simultaneous frame. Held until step 9; voided on camera-session break (§2.7 5a).';
COMMENT ON COLUMN public.sessions.provider_session_key IS
  'Deleted at handoff. ChainPass must not retain after delivery (§2.4a).';
