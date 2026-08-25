-- CANON-CP-02 §1 step 3: session key is 30 characters. Supersedes the 32-character check.

ALTER TABLE public.sessions
  DROP CONSTRAINT IF EXISTS sessions_session_key_len;

ALTER TABLE public.sessions
  ADD CONSTRAINT sessions_session_key_len
  CHECK (session_key IS NULL OR char_length(session_key) = 30);

COMMENT ON COLUMN public.sessions.session_key IS
  '30-character alphanumeric. Minted at enrolment step 3 after payment. Deleted at handoff. CANON-CP-02.';
