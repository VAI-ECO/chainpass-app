-- Track applied SQL on this database. Backfill is only versions whose
-- objects are provably live (not the 202501/202511 pilot set, which was
-- never applied here — vai_assignments is absent).

CREATE SCHEMA IF NOT EXISTS supabase_migrations;

CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (
  version text PRIMARY KEY,
  name text,
  statements text[]
);

INSERT INTO supabase_migrations.schema_migrations (version, name) VALUES
  ('20260811000001', 'chainpass_core'),
  ('20260811000002', 'coupons'),
  ('20260811000003', 'facial_verification_attempts'),
  ('20260811000005', 'facial_signature_attempts'),
  ('20260811000006', 'add_affirmation_version'),
  ('20260812000001', 'in_house_enrollment'),
  ('20260814000001', 'seed_requirements'),
  ('20260821000001', 'settings'),
  ('20260821000002', 'credentials_verified_at'),
  ('20260821000003', 'complycube_client_id_nullable'),
  ('20260821000004', 'null_complycube_client_ids'),
  ('20260821000005', 'drop_complycube_client_id'),
  ('20260821000006', 'schema_16_2_additions'),
  ('20260821000007', 'originating_platform_immutable'),
  ('20260821000008', 'rls_all_public_tables'),
  ('20260821000009', 'requirement_completions_append_only'),
  ('20260821000010', 'enrolment_session_columns'),
  ('20260821000011', 'enrol_otp_setting'),
  ('20260821000012', 'consumption_block_size_setting'),
  ('20260821000013', 'agreement_versions_immutable'),
  ('20260821000014', 'platform_agreements_terms_not_null'),
  ('20260821000015', 'agreement_open_hours_setting'),
  ('20260821000016', 'commission_settings_trolley'),
  ('20260821000017', 'credential_year_length_setting'),
  ('20260821000018', 'service_registry_seed'),
  ('20260821000019', 'enrol_pay_settings'),
  ('20260821000020', 'enrol_steps_8_10'),
  ('20260822000001', 'credential_keys_session_key_nullable'),
  ('20260822000002', 'verification_records'),
  ('20260822000003', 'schema_migrations_log')
ON CONFLICT (version) DO NOTHING;
