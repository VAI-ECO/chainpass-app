INSERT INTO public.settings (key, value) VALUES
  ('blocks_burn_window_hours', 'UNSET')
ON CONFLICT (key) DO NOTHING;
