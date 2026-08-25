-- Lifetime reds per credential (wire: credential.reds_count). Threshold is settings:reds_threshold.
-- recovery_otp_max_attempts: named dial for verify-recovery-otp (was a hardcoded 5).

ALTER TABLE public.credentials
  ADD COLUMN IF NOT EXISTS reds_count integer NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.credentials.reds_count IS
  'SN-17 / SN-29 · lifetime red failures per credential. Compared to settings:reds_threshold.';

INSERT INTO public.settings (key, value) VALUES
  ('recovery_otp_max_attempts', 'UNSET')
ON CONFLICT (key) DO NOTHING;
