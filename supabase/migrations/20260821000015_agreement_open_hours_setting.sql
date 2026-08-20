-- Open agreement expiry timer — settings, never a constant.
INSERT INTO public.settings (key, value) VALUES
  ('agreement_open_hours', '72')
ON CONFLICT (key) DO NOTHING;
