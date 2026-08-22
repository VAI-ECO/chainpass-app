# Migration quarantine

These 32 files were classified DEAD, VAIRIFY, or MIXED. They are the
cause of the `payments` and `verification_records` collisions.

Nothing here is applied. Nothing here is deleted. History follows via
`git mv`. The apply path is `supabase/migrations/` only — the 33
CHAINPASS files.

## MIXED — contains both products, or a name clash

| File | Reason |
|---|---|
| `20250121000003_create_platform_requirements.sql` | Same table name as ChainPass `platform_requirements`, different meaning |
| `20251111013104_36220942-b665-4645-a3d5-42302f1853fb.sql` | Defines `verification_records` and `payments` a second time; also `vai_assignments` |
| `20251118164702_5a8a8250-f5c7-4e95-b937-593056e952ee.sql` | `signed_contracts` is called by ChainPass `sign-contract`; table is not in the live 29 |

## VAIRIFY — belongs in vairify-app, or nowhere in this rebuild

| File | Reason |
|---|---|
| `00000000000000_pilot_schema.sql` | DateGuard, guardians, encounters, reviews, safety codes |
| `20250120000001_platform_compliance.sql` | Platform-requirement tracking for Vairify check |
| `20250121000004_update_profiles_table.sql` | Vairify `profiles` / existing-V.A.I. tracking |
| `20250122000001_create_leo_retrieval_audit.sql` | LEO retrieval — Vairify surface |
| `20250122000002_add_leo_status_to_vais.sql` | LEO columns on `vai_assignments` |
| `20251115042307_51dba9c0-1b42-42f5-90dd-399c2b3a76b6.sql` | `vairify_webhook_events` |
| `20251115043224_0e5589df-f08d-48da-9b71-d23537709ec4.sql` | Consumer `profiles` |

## DEAD — Lovable/pilot/admin; retire from this apply path

| File | Reason |
|---|---|
| `20250121000001_create_vais_table.sql` | View over `vai_assignments` — that table is not live |
| `20250121000002_create_vai_platform_completions.sql` | Extra completion table; live uses `requirement_completions` |
| `20250122000003_add_transaction_ttl.sql` | Alters the 202511 `verification_records` shape |
| `20251115042928_1cb97cd8-2fef-4597-b082-0c4e5c9ef233.sql` | `app_role` / `user_roles` dashboard |
| `20251115053441_1ed66a15-2515-4202-a1fd-354159359241.sql` | `admin_activity_logs` |
| `20251115054821_edafaf87-6223-4130-a7fd-05e1a3887a69.sql` | `retention_policies` / `archived_activity_logs` |
| `20251115055945_6681df23-1356-4567-a174-655694381db4.sql` | Anomaly detection tables |
| `20251115061134_03461c5d-028e-4b96-8aa4-8417b1b194eb.sql` | Email digest tables |
| `20251115062757_3afa4f7b-50fc-4a62-8c95-c033514ddd22.sql` | Admin badges / scores |
| `20251115063121_4a1dec7b-915d-435b-b4e4-eebd7b2ca2bc.sql` | Alert settings |
| `20251115182757_a0dbb3d8-ab4c-4e23-a82a-cb654eb240a4.sql` | `business_partners` registration |
| `20251116011845_ce7be979-b99a-4edc-9365-86c2160c7b25.sql` | `api_usage_logs` |
| `20251116012812_b550a61e-4add-4a9e-baca-a0dcbfdbd056.sql` | Realtime on `api_usage_logs` |
| `20251116013258_86efeb23-955d-4ce6-bed5-0cbe8323e2a8.sql` | `webhook_test_history` |
| `20251116041036_2ca5dd1f-826e-47ba-9757-363c62667d46.sql` | `webhook_delivery_queue` |
| `20251116123354_3d1c3fb5-9e7d-497f-b10a-145bc094904a.sql` | Sandbox / error_logs / user_preferences |
| `20251119014337_de5832d8-a242-4080-8870-8e4a2f1fb97e.sql` | Index on `complycube_client_id` — column is gone |
| `20251119025918_8afcb1fd-9880-43a0-8c56-57be04941002.sql` | Separate `coupons` / `pricing_config`; not `platform_coupons` |
| `20251119130158_935c4aa0-5289-453e-a02b-396e54432993.sql` | Extra columns on the 202511 `verification_records` |
| `20251119130237_96d15ffe-636a-4a63-98f5-b7852c322072.sql` | Creates orphan `update_updated_at_column()` |
| `20251120234123_create_business_configurations.sql` | Business-client config store |
| `20251126000000_vai_core_schema.sql` | `vai_records` / `verification_sessions` rebuild, not the 29 |
