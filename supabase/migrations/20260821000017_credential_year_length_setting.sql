-- Credential year length — settings, never a three-year / 1095 constant in code.
INSERT INTO public.settings (key, value) VALUES
  ('credential_year_length_years', '1')
ON CONFLICT (key) DO NOTHING;
