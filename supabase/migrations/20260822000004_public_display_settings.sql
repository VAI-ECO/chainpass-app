-- Display-price and rate-limit figures live in settings. No constants in code.
INSERT INTO public.settings (key, value) VALUES
  ('facial_signature_max_recent', '10')
ON CONFLICT (key) DO NOTHING;

GRANT SELECT ON public.settings TO anon, authenticated;

DROP POLICY IF EXISTS "anon_read_display_settings" ON public.settings;
CREATE POLICY "anon_read_display_settings"
  ON public.settings
  FOR SELECT
  TO anon, authenticated
  USING (
    key IN (
      'price_vai',
      'price_vai_pro',
      'deferral_window_hours'
    )
  );
