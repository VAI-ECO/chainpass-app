-- Seed ecosystem requirements only.
-- Identity tier: kyc + signature_agreement
-- Adult tier:    Identity tier + le_declaration + background_check
--
-- Tier is DERIVED from completed requirements, never stored.
-- Payment is NOT a requirement — it is credential state (credentials.state = 'expired' if lapsed).
--
-- platform_requirements for vairify/avchexx live in
-- 20260822000006_pending_platform_requirements.sql and must not run
-- until those platform rows exist.

INSERT INTO requirements (key, display_name, kind, ecosystem_wide) VALUES
  ('kyc', 'Identity Verification', 'check', true),
  ('signature_agreement', 'Signature Agreement', 'agreement', true),
  ('le_declaration', 'Law Enforcement Declaration', 'declaration', false),
  ('background_check', 'Background Check', 'check', false)
ON CONFLICT (key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  kind = EXCLUDED.kind,
  ecosystem_wide = EXCLUDED.ecosystem_wide;

COMMENT ON TABLE requirements IS 'Ecosystem requirements. Tier is DERIVED from which requirements a credential has completed, never stored as a field. Payment is NOT a requirement — it is credential state checked via payments table and credentials.next_renewal_date.';
COMMENT ON COLUMN requirements.ecosystem_wide IS 'TRUE = ChainPass facts, signed once, valid everywhere (kyc, signature_agreement). FALSE = platform-specific, must complete per platform (le_declaration, background_check).';
COMMENT ON TABLE platform_requirements IS 'Links platforms to their required credential requirements. Identity tier = kyc + signature. Adult tier = Identity + LE declaration + background check. Payment is NOT included — it is credential state, not a requirement.';
