-- PENDING. Do not apply until platforms contains vairify and avchexx.
-- Split from 20260814000001: those inserts fail FK while platforms is empty.
-- No migration in this set INSERTs platform rows.

INSERT INTO platform_requirements (platform_id, requirement_key, effective_from, sort_order) VALUES
  ('vairify', 'kyc', '2025-01-01', 1),
  ('vairify', 'signature_agreement', '2025-01-01', 2),
  ('vairify', 'le_declaration', '2025-01-01', 3),
  ('vairify', 'background_check', '2025-01-01', 4)
ON CONFLICT (platform_id, requirement_key) DO NOTHING;

INSERT INTO platform_requirements (platform_id, requirement_key, effective_from, sort_order) VALUES
  ('avchexx', 'kyc', '2025-01-01', 1),
  ('avchexx', 'signature_agreement', '2025-01-01', 2)
ON CONFLICT (platform_id, requirement_key) DO NOTHING;
