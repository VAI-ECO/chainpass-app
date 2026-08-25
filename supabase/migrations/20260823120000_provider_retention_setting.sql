-- §10.3 — provider retention is credentials.next_complycube_date (already live).
-- The window is a settings row. Never a constant in enrol-reveal.

INSERT INTO public.settings (key, value) VALUES
  ('provider_retention_years', '3')
ON CONFLICT (key) DO NOTHING;

COMMENT ON COLUMN public.credentials.next_complycube_date IS
  '§10.3 provider retention expiry. Separate from document_expiry and from the term dates. Live name kept.';
