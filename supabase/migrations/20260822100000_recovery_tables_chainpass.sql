-- RULINGS-CP-03 §7 — recovery custody at ChainPass.
-- Vairify must drop its copies after callers repoint here.
-- NOT APPLIED — review only until owner approves migration run.

-- ---------------------------------------------------------------------------
-- 1. Security question catalogue (ChainPass admin)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.security_question_options (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_text text NOT NULL,
  category      text,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.security_question_options IS
  'Catalogue of security questions a holder may pick. Owned by ChainPass admin.';
COMMENT ON COLUMN public.security_question_options.question_text IS
  'Question shown to the holder.';
COMMENT ON COLUMN public.security_question_options.category IS
  'Optional grouping.';
COMMENT ON COLUMN public.security_question_options.is_active IS
  'Soft-disable.';
COMMENT ON COLUMN public.security_question_options.created_at IS
  'Row creation time.';

-- ---------------------------------------------------------------------------
-- 2. Three security questions per credential
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.security_questions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vai             char(7) NOT NULL REFERENCES public.credentials(vai) ON DELETE CASCADE,
  slot_number     smallint NOT NULL CHECK (slot_number BETWEEN 1 AND 3),
  question_text   text NOT NULL,
  answer_hash     text NOT NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  replaced_at     timestamptz,
  UNIQUE (vai, slot_number)
);

COMMENT ON TABLE public.security_questions IS
  'Exactly three security questions per credential. Answers hashed. Set at enrolment step 12; replaced on use. ChainPass-owned recovery — platforms never see these.';
COMMENT ON COLUMN public.security_questions.vai IS
  'Credential that owns the questions.';
COMMENT ON COLUMN public.security_questions.slot_number IS
  '1, 2, or 3.';
COMMENT ON COLUMN public.security_questions.question_text IS
  'Question text as stored for this holder.';
COMMENT ON COLUMN public.security_questions.answer_hash IS
  'bcrypt (or equivalent) hash of the normalised answer. Never plaintext.';
COMMENT ON COLUMN public.security_questions.created_at IS
  'When this slot was set.';
COMMENT ON COLUMN public.security_questions.replaced_at IS
  'When this slot was last replaced after use.';

CREATE INDEX IF NOT EXISTS security_questions_vai_idx
  ON public.security_questions (vai);

-- ---------------------------------------------------------------------------
-- 3. Lockout state — cleared_by = chainpass_reverification only
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.security_question_lockouts (
  vai                         char(7) PRIMARY KEY REFERENCES public.credentials(vai) ON DELETE CASCADE,
  failed_attempts             integer NOT NULL DEFAULT 0,
  locked                      boolean NOT NULL DEFAULT false,
  locked_at                   timestamptz,
  locked_reason               text,
  reverification_started_at   timestamptz,
  reverification_expires_at   timestamptz,
  cleared_at                  timestamptz,
  cleared_by                  text CHECK (cleared_by IS NULL OR cleared_by = 'chainpass_reverification'),
  updated_at                  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.security_question_lockouts IS
  'Lockout state after failed security-question attempts. Cleared only by ChainPass in-person reverification.';
COMMENT ON COLUMN public.security_question_lockouts.vai IS
  'Locked credential.';
COMMENT ON COLUMN public.security_question_lockouts.failed_attempts IS
  'Consecutive failures. Lock after threshold.';
COMMENT ON COLUMN public.security_question_lockouts.locked IS
  'Whether the credential is currently locked for this recovery path.';
COMMENT ON COLUMN public.security_question_lockouts.locked_at IS
  'When lock engaged.';
COMMENT ON COLUMN public.security_question_lockouts.locked_reason IS
  'Why locked.';
COMMENT ON COLUMN public.security_question_lockouts.reverification_started_at IS
  'When the holder started the ChainPass reverification window.';
COMMENT ON COLUMN public.security_question_lockouts.reverification_expires_at IS
  'End of the reverification window.';
COMMENT ON COLUMN public.security_question_lockouts.cleared_at IS
  'When lock was cleared.';
COMMENT ON COLUMN public.security_question_lockouts.cleared_by IS
  'chainpass_reverification only. NULL while locked or never cleared. Admin cannot set this.';
COMMENT ON COLUMN public.security_question_lockouts.updated_at IS
  'Last change.';

-- ---------------------------------------------------------------------------
-- 4. Append-only attempt log
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.security_question_attempts (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vai                   char(7) NOT NULL REFERENCES public.credentials(vai) ON DELETE CASCADE,
  recovery_session_id   uuid,
  success               boolean NOT NULL,
  ip_address            text,
  user_agent            text,
  created_at            timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.security_question_attempts IS
  'Append-only attempt log for security-question recovery. Owned by ChainPass.';
COMMENT ON COLUMN public.security_question_attempts.vai IS
  'Credential being recovered.';
COMMENT ON COLUMN public.security_question_attempts.recovery_session_id IS
  'Optional correlation id for a recovery attempt.';
COMMENT ON COLUMN public.security_question_attempts.success IS
  'Whether the answer matched.';
COMMENT ON COLUMN public.security_question_attempts.ip_address IS
  'Caller IP if available.';
COMMENT ON COLUMN public.security_question_attempts.user_agent IS
  'Caller user agent if available.';
COMMENT ON COLUMN public.security_question_attempts.created_at IS
  'Attempt time.';

CREATE INDEX IF NOT EXISTS security_question_attempts_vai_idx
  ON public.security_question_attempts (vai, created_at DESC);

-- ---------------------------------------------------------------------------
-- 5. One-time recovery codes — hashed, shown once at issue
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.recovery_codes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vai             char(7) NOT NULL REFERENCES public.credentials(vai) ON DELETE CASCADE,
  code_hash       text NOT NULL,
  label_mask      text NOT NULL,
  spent_at        timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (vai, code_hash)
);

COMMENT ON TABLE public.recovery_codes IS
  'One-time recovery passwords. Values hashed; never re-readable. Issued at enrolment step 12; redeemed at recovery.';
COMMENT ON COLUMN public.recovery_codes.label_mask IS
  'Masked display for the ledger (e.g. ••••A3). Not the code.';
COMMENT ON COLUMN public.recovery_codes.spent_at IS
  'When redeemed. NULL = unused.';

CREATE INDEX IF NOT EXISTS recovery_codes_vai_idx
  ON public.recovery_codes (vai);

-- ---------------------------------------------------------------------------
-- 6. RLS — service role only (edge functions); no holder direct reads of hashes
-- ---------------------------------------------------------------------------
ALTER TABLE public.security_question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_question_lockouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_question_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS service_role_all_security_question_options ON public.security_question_options;
CREATE POLICY service_role_all_security_question_options ON public.security_question_options
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS service_role_all_security_questions ON public.security_questions;
CREATE POLICY service_role_all_security_questions ON public.security_questions
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS service_role_all_security_question_lockouts ON public.security_question_lockouts;
CREATE POLICY service_role_all_security_question_lockouts ON public.security_question_lockouts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS service_role_all_security_question_attempts ON public.security_question_attempts;
CREATE POLICY service_role_all_security_question_attempts ON public.security_question_attempts
  FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS service_role_all_recovery_codes ON public.recovery_codes;
CREATE POLICY service_role_all_recovery_codes ON public.recovery_codes
  FOR ALL TO service_role USING (true) WITH CHECK (true);
