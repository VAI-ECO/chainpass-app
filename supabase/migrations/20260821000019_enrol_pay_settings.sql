-- §1.1a / §2 step 3 PAY — credential prices and pay-session columns.
-- Every figure is a settings or agreement row; never a constant in code.

INSERT INTO public.settings (key, value) VALUES
  ('price_vai_standard', '29'),
  ('price_vai_pro', '99')
ON CONFLICT (key) DO NOTHING;

-- Platform elects deferral on its agreement (§4A — offered, never invented in code).
ALTER TABLE public.platform_agreements
  ADD COLUMN IF NOT EXISTS deferral_offered boolean NOT NULL DEFAULT false;

ALTER TABLE public.platform_agreements
  ADD COLUMN IF NOT EXISTS deferral_window_hours integer;

COMMENT ON COLUMN public.platform_agreements.deferral_offered IS
  '§4A — if true, pay screen may offer deferral; window from deferral_window_hours or settings.deferral_window_hours.';

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS warning_acked_at timestamptz;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS payment_choice text
    CHECK (payment_choice IS NULL OR payment_choice IN ('pay', 'defer'));

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS price_charged text;

ALTER TABLE public.sessions
  ADD COLUMN IF NOT EXISTS required_credential_level smallint
    CHECK (required_credential_level IS NULL OR required_credential_level IN (1, 2, 3));
