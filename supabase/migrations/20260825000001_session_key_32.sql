-- Owner ruling 25 August: session key is 32 characters, alphanumeric.
-- Minted at §2 step 3 (after PAY). Held on the session until credential_keys.

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS session_key text;

COMMENT ON COLUMN public.sessions.session_key IS
  '32-character alphanumeric. Minted at enrolment step 3 after payment. Deleted at handoff.';

ALTER TABLE public.sessions
  DROP CONSTRAINT IF EXISTS sessions_session_key_len;

ALTER TABLE public.sessions
  ADD CONSTRAINT sessions_session_key_len
  CHECK (session_key IS NULL OR char_length(session_key) = 32);
