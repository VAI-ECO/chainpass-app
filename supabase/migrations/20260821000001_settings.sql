-- §16.2 settings — key·value. Every adjustable number lives here. No constants in functions.
CREATE TABLE IF NOT EXISTS public.settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages settings" ON public.settings;
CREATE POLICY "Service role manages settings"
  ON public.settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Seeds: band cut-offs are similarity floors (§7.3 — admin-adjustable; pilot measures the right number).
-- attempt_count_n: ONE, TWO OR THREE (17 Aug facial stack).
-- deferral_window_hours: §4A.2 Vairify window (platform-negotiated default seed).
INSERT INTO public.settings (key, value) VALUES
  ('band_green_min', '0.80'),
  ('band_yellow_min', '0.65'),
  ('attempt_count_n', '3'),
  ('engine_attempt_default', 'standard'),
  ('engine_attempt_last', 'premium'),
  ('deferral_window_hours', '48')
ON CONFLICT (key) DO NOTHING;
