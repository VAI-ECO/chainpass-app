-- Named dials that were still hardcoded as product windows.
INSERT INTO public.settings (key, value) VALUES
  ('enrol_session_hours', 'UNSET'),
  ('facial_attempt_window_minutes', 'UNSET'),
  ('facial_signature_window_minutes', 'UNSET')
ON CONFLICT (key) DO NOTHING;
