-- §16.6 step 5 — default consumption block size lives in settings, never in code.
INSERT INTO public.settings (key, value) VALUES
  ('consumption_block_size', '1000')
ON CONFLICT (key) DO NOTHING;
