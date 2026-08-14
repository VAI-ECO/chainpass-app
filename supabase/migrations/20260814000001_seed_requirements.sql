-- Seed requirements and platform_requirements for two-tier system
-- Identity tier: kyc + signature_agreement
-- Adult tier:    Identity tier + le_declaration + background_check
--
-- Tier is DERIVED from completed requirements, never stored.
-- Payment is NOT a requirement — it is credential state (credentials.state = 'expired' if lapsed).

-- Step 1: Seed ecosystem requirements
-- ecosystem_wide = TRUE means signed once, valid everywhere (ChainPass facts)
-- ecosystem_wide = FALSE means platform-specific (must complete per platform)

INSERT INTO requirements (key, display_name, kind, ecosystem_wide) VALUES
  ('kyc', 'Identity Verification', 'check', true),
  ('signature_agreement', 'Signature Agreement', 'agreement', true),
  ('le_declaration', 'Law Enforcement Declaration', 'declaration', false),
  ('background_check', 'Background Check', 'check', false)
ON CONFLICT (key) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  kind = EXCLUDED.kind,
  ecosystem_wide = EXCLUDED.ecosystem_wide;

-- Step 2: Seed platform requirements
-- Vairify requires Adult tier (4 requirements)
-- avchexx requires Identity tier (2 requirements)

-- Vairify platform (Adult tier)
INSERT INTO platform_requirements (platform_id, requirement_key, effective_from, sort_order) VALUES
  ('vairify', 'kyc', '2025-01-01', 1),
  ('vairify', 'signature_agreement', '2025-01-01', 2),
  ('vairify', 'le_declaration', '2025-01-01', 3),
  ('vairify', 'background_check', '2025-01-01', 4)
ON CONFLICT (platform_id, requirement_key) DO NOTHING;

-- avchexx platform (Identity tier)
INSERT INTO platform_requirements (platform_id, requirement_key, effective_from, sort_order) VALUES
  ('avchexx', 'kyc', '2025-01-01', 1),
  ('avchexx', 'signature_agreement', '2025-01-01', 2)
ON CONFLICT (platform_id, requirement_key) DO NOTHING;

-- Step 3: Comments documenting the tier model
COMMENT ON TABLE requirements IS 'Ecosystem requirements. Tier is DERIVED from which requirements a credential has completed, never stored as a field. Payment is NOT a requirement — it is credential state checked via payments table and credentials.next_renewal_date.';
COMMENT ON COLUMN requirements.ecosystem_wide IS 'TRUE = ChainPass facts, signed once, valid everywhere (kyc, signature_agreement). FALSE = platform-specific, must complete per platform (le_declaration, background_check).';
COMMENT ON TABLE platform_requirements IS 'Links platforms to their required credential requirements. Identity tier = kyc + signature. Adult tier = Identity + LE declaration + background check. Payment is NOT included — it is credential state, not a requirement.';

-- Step 4: Validation queries (run manually to verify upgrade flow)

-- Check ecosystem-wide requirements:
-- SELECT key, ecosystem_wide FROM requirements WHERE ecosystem_wide = true;
-- Should return: kyc, signature_agreement

-- Check what Vairify requires (Adult tier):
-- SELECT requirement_key FROM platform_requirements WHERE platform_id = 'vairify' ORDER BY sort_order;
-- Should return: kyc, signature_agreement, le_declaration, background_check

-- Check what avchexx requires (Identity tier):
-- SELECT requirement_key FROM platform_requirements WHERE platform_id = 'avchexx' ORDER BY sort_order;
-- Should return: kyc, signature_agreement

-- Simulate upgrade: avchexx user (Identity tier) accessing Vairify (Adult tier)
-- Assume requirement_completions has these rows for V.A.I. ABC1234:
--   (vai='ABC1234', requirement_key='kyc', platform_id=NULL, signed_version='1.0')
--   (vai='ABC1234', requirement_key='signature_agreement', platform_id=NULL, signed_version='1.0')
--
-- Query to check what Vairify would ask for:
-- WITH vairify_requirements AS (
--   SELECT requirement_key FROM platform_requirements WHERE platform_id = 'vairify'
-- ),
-- completed_for_vairify AS (
--   SELECT requirement_key FROM requirement_completions
--   WHERE vai = 'ABC1234'
--     AND (platform_id = 'vairify' OR platform_id IS NULL)
-- )
-- SELECT vr.requirement_key
-- FROM vairify_requirements vr
-- WHERE vr.requirement_key NOT IN (SELECT requirement_key FROM completed_for_vairify);
--
-- Expected result: le_declaration, background_check
-- (kyc and signature_agreement are ecosystem-wide and already completed)
-- (payment is NOT checked here — it is credential state via credentials.state and payments table)
