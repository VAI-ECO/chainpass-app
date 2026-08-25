-- SN-44 — operator settings surface.
-- public.settings is already key·value (not the old platform_settings singleton).
-- This migration: (1) audit log for every change, (2) seed named-but-missing keys as UNSET.
-- Never invent a figure. UNSET means admin must set it before a live read that needs a number.

CREATE TABLE IF NOT EXISTS public.settings_audit (
  id bigserial PRIMARY KEY,
  setting_key text NOT NULL,
  old_value text,
  new_value text NOT NULL,
  actor text NOT NULL DEFAULT 'master',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.settings_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role manages settings_audit" ON public.settings_audit;
CREATE POLICY "Service role manages settings_audit"
  ON public.settings_audit
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

COMMENT ON TABLE public.settings_audit IS
  'SN-44 · §14.7 — every settings.save writes actor, timestamp, before and after. Never retroactive.';

-- Named in canon / wires; not yet seeded. Values UNSET until the market or owner sets them.
INSERT INTO public.settings (key, value) VALUES
  ('renewal_window', 'UNSET'),
  ('reds_threshold', 'UNSET'),
  ('blocks_alert_threshold', 'UNSET'),
  ('security_question_count', 'UNSET'),
  ('recovery_code_count', 'UNSET'),
  ('deferral_suspend_after', 'UNSET'),
  ('appeal_panel_size', 'UNSET'),
  ('platform_document_pack', 'UNSET'),
  ('handoff_poll_window', 'UNSET'),
  ('handback_nonce_ttl', 'UNSET'),
  ('payout_cadence', 'UNSET'),
  ('price_access', 'UNSET'),
  ('provider_active', 'UNSET'),
  ('dash_face_seat_1', 'UNSET'),
  ('dash_face_seat_pack', 'UNSET'),
  ('dash_face_seat_10', 'UNSET'),
  ('dash_face_seat_over_10', 'UNSET')
ON CONFLICT (key) DO NOTHING;
