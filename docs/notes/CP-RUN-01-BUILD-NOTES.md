# CP-RUN-01-BUILD-NOTES — 26 Aug 2026

Role: Cursor WRITES. Never decides.

## L-0 Item 0
Created this file. ATTACH: CP RUN #1 REPORT (26 Aug) found as `docs/notes/CP-PASS-SUMMARY-01.md` (and committed copy `docs/notes/CP-RUN-01-EXPORT/CP-PASS-SUMMARY-01.md`). ATTACH: `SESSION-LOG-CP__2026-08-22-24` — `find` in this repo, `~/vai-workspaces`, `~/Downloads`, `~/Documents`, Cursor project dir → 0 files. Missing log reported, not reconstructed. Figures from the 26 Aug notes/summary are records, not canon.

## L-BEFORE
- HEAD at start: `edc7da64918af1e6ade7c50c78d2a0c7cbdffc3c`
- remote origin: `https://github.com/VAI-ECO/chainpass-app.git` (fetch + push). One remote. chainpass-app only.
- porcelain at start: `?? docs/notes/CP-RUN-01-EXPORT/`

---

## UNIT 1 — PUSH

### L-U1-01
`git remote -v`:
```
origin	https://github.com/VAI-ECO/chainpass-app.git (fetch)
origin	https://github.com/VAI-ECO/chainpass-app.git (push)
```
`git ls-remote --heads origin`:
```
3911e0854db65376bd482b2701e53ca3c349cd2a	refs/heads/dev
69981aabad9ca28d424bd71db76e2e3e7e4a8b88	refs/heads/main
```
No `refs/heads/chainpass-fixes`. No `origin/chainpass-fixes`.

### L-U1-02
Classified `docs/notes/CP-RUN-01-EXPORT/`: untracked copies of already-committed 26 Aug deliverables (`CP-RUN-01-NOTES.md`, `CP-PASS-SUMMARY-01.md`, `REF-CP-01_CHAINPASS_CANON_AND_FEATURES.md`). Not new canon. Not deleted. Committed with this notes file as `d36a4ce`. `git status --porcelain` after commit → empty.

### L-U1-03
`git push -u origin chainpass-fixes`:
```
To https://github.com/VAI-ECO/chainpass-app.git
 * [new branch]      chainpass-fixes -> chainpass-fixes
branch 'chainpass-fixes' set up to track 'origin/chainpass-fixes'.
```
`git log --oneline origin/chainpass-fixes..HEAD` → empty.

### L-U1-04
Push did not fail. Item skipped.

### L-U1-05
`git branch -avv`:
```
* chainpass-fixes                d36a4ce [origin/chainpass-fixes] Commit the 26 Aug export copies and start the CP RUN #1 build notes.
  dev                            3911e08 [origin/dev] Remove embedded inspect repo from tracking
  main                           69981aa [origin/main] ChainPass Pilot - Lovable build
  remotes/origin/HEAD            -> origin/main
  remotes/origin/chainpass-fixes d36a4ce Commit the 26 Aug export copies and start the CP RUN #1 build notes.
  remotes/origin/dev             3911e08 Remove embedded inspect repo from tracking
  remotes/origin/main            69981aa ChainPass Pilot - Lovable build
```
`git status -sb`: `## chainpass-fixes...origin/chainpass-fixes`

---

## UNIT 2 — IS THE BUILD TELLING THE TRUTH

### L-U2-01
Every `tsconfig*.json` (6 files). Root three:

`tsconfig.json`:
```
{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "noImplicitAny": false,
    "noUnusedParameters": false,
    "skipLibCheck": true,
    "allowJs": true,
    "noUnusedLocals": false,
    "strictNullChecks": false
  }
}
```

`tsconfig.app.json`:
```
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitAny": false,
    "noFallthroughCasesInSwitch": false,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

`tsconfig.node.json`:
```
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

`chainpass-app-inspect/tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` are byte-identical copies of the three root files (same `"files": []` + references on inspect root).

### L-U2-02
Root `tsconfig.json` has `"files": []` AND `references` only (same lie pattern as Vairify). `package.json` scripts before this unit:
```
"dev": "vite",
"build": "vite build",
"build:dev": "vite build --mode development",
"lint": "eslint .",
"preview": "vite preview",
"test": "vitest run --config ./vitest.config.ts",
"test:watch": "vitest --config ./vitest.config.ts"
```
`build` did not run a bare `tsc`. It ran `vite build` only. Bare `npx tsc --noEmit` (no `-p`) exit 0, `grep -c "error TS"` = 0, because `"files": []`.

### L-U2-03
`npm ci`: added 955 packages, audited 956 in 12s. 7 vulnerabilities (1 low, 4 moderate, 1 high, 1 critical).
`npm run build` BEFORE script fix (vite only): PASS. Exit 0.
```
vite v5.4.21 building for production...
✓ 6130 modules transformed.
dist/assets/index-CxYhj-AL.js  3,801.69 kB │ gzip: 1,055.49 kB
✓ built in 6.14s
PWA v1.3.0 generateSW precache 24 entries
```

### L-U2-04
`npx tsc --noEmit -p tsconfig.app.json 2>&1 | grep -c "error TS"` → **16**. Exit 2.
`uniq -c` by code:
```
   5 error TS2345
   4 error TS2304
   3 error TS2322
   2 error TS2769
   2 error TS2353
```
Per-file:
```
   3 src/services/accountService.ts
   3 src/pages/EnrolSecurity.tsx
   3 src/pages/BusinessVerificationStart.tsx
   3 src/components/BusinessSelection.tsx
   1 src/pages/VaiSuccess.tsx
   1 src/pages/ContractSignature.tsx
   1 src/components/docs/GraphQLSupport.tsx
   1 src/components/contracts/FacialVerification.tsx
```
Two numbers: vite `build` PASS (0 type errors checked) vs app tsc **16**. Root bare tsc **0**. They differ.

### L-U2-05
Fixed `package.json` `build` to `tsc --noEmit -p tsconfig.app.json && vite build`. No flags added. No files excluded. Errors not silenced.
`npm run build` AFTER: FAIL. Exit 2. Same 16 `error TS` lines. Vite did not run. Build now reflects the app typecheck.

### L-U2-06
`npx eslint .` → `✖ 427 problems (350 errors, 77 warnings)`. Exit 1. (Includes `chainpass-app-inspect/` and `supabase/functions/`.)

### L-U2-07
Command: `npm test` → `vitest run --config ./vitest.config.ts`
```
 Test Files  2 passed (2)
      Tests  4 passed (4)
   Duration  1.02s
```
Files: `src/pages/__tests__/VaiEntryCheck.test.tsx` and `chainpass-app-inspect/src/pages/__tests__/VaiEntryCheck.test.tsx`.

### L-U2-08
Did not fix the 16 type errors this unit. UNIT 3 removes them at the source if they are live-schema mismatches.

---

## UNIT 3 — DOES THE CODE MATCH LIVE

### L-U3-01
`grep -rhoE "from\(['\"][a-z_]+['\"]" src/ supabase/` (closed quote; prefix match without close-quote falsely added `baseline` / `verification`). Unique names: 81. Full list in L-U3-03 complement.

### L-U3-02
Live public tables, exact `count(*)` on `pguwhjearlqqfworantq` (43):
agreement_parties 2 · agreement_proofs 1 · agreement_versions 2 · agreements 2 · baselines 4 · blocks 2 · commission_ledger 2 · contracts 4 · credential_events 0 · credential_keys 0 · credential_platforms 0 · credentials 4 · enrolment_agreements 1 · facial_signature_attempts 0 · facial_verification_attempts 0 · identity_join_log 1 · lookup_log 0 · payments 0 · platform_agreements 2 · platform_coupon_redemptions 0 · platform_coupons 0 · platform_requirements 0 · platform_services 0 · platform_visits 1 · platforms 2 · record_ledger 6 · recovery_codes 3 · requirement_completions 0 · requirement_versions 0 · requirements 4 · security_question_attempts 0 · security_question_lockouts 0 · security_question_options 6 · security_questions 3 · serve_events 2 · service_registry 5 · service_state 2 · service_state_log 0 · sessions 9 · settings 46 · settings_audit 11 · verification_ledger 13 · verification_records 0.
RECORD vs LIVE: 26 Aug notes said verification_ledger 12; live now 13.

### L-U3-03
Code names absent from live (41). None renamed. CREATE NOTHING.
admin_activity_logs · admin_badges · admin_earned_badges · admin_performance_scores · alert_history · alert_settings · anomaly_detection_settings · api_usage_logs · archived_activity_logs · business_configurations · business_partners · business_records · composite_vai_records · coupon_usage · coupons · detected_anomalies · email_digest_history · email_digest_recipients · email_digest_settings · email_notifications · employee_coupons · error_logs · leo_retrieval_audit · person_identity_signatures · person_profiles · pricing_config · profiles · recovery_requests · retention_policies · sandbox_test_scenarios · user_preferences · user_roles · vai_assignments · vai_audit_log · vai_records · vai_status_updates · vairify_webhook_events · verification_sessions · webhook_delivery_queue · webhook_replay_history · webhook_test_history
Live not queried via from(): payments · security_question_attempts · service_state_log.

### L-U3-04
`.select()` columns on the eight named tables vs live `information_schema.columns`: **none missing**.
credentials: vai, state, document_expiry, next_complycube_date, next_renewal_date, originating_platform_id, verified_at, deferral_expires_at, deferral_used, credential_level, reds_count, rebaseline_count (+ `*`)
sessions: id, platform_id, vai, enrolment_step, held_capture, held_capture_voided_at, acceptance_capture, acceptance_capture_voided_at, requirements_signed_at, terms_accepted_at, required_credential_level, kyc_match_percent, paid_at, otp_verified_at, contact_email, contact_phone, background_check_at, document_expiry, issuing_country, issuing_province, payment_choice, session_key, username, provider_session_key, biometric_consent_at, warning_acked_at, complycube_session_id, expires_at, return_url, state (+ `*`)
platforms: id, display_name, response_level, service_level, status, trial_mode, webhook_url, webhook_secret, webhook_state, api_key_hash, base_price_cents, brand, contact_spec, collection_fields
blocks: id, platform_id, size, consumed
agreements: agreement_id, contract_id, content_hash, platform_id, outcome, created_at, created_at_offset, closed_at, closed_at_offset (+ `*`)
agreement_versions: id, platform_id, body, subtype, version, notice, created_at, effective_from
agreement_proofs: id, vai, verified_at, engine_used, agreement_version_id
verification_ledger: id, call_type, result, billed_against_block

### L-U3-05
Each of the 41: table that was never created on this live project. Not an obvious rename of a live table (coupons ≠ platform_coupons; profiles ≠ any live row; business_partners ≠ platforms; vai_records ≠ credentials; verification_sessions ≠ sessions). No rename applied. The 16 TS errors are generated-types vs missing tables (`business_configurations`, `profiles`, `verification_records.vai_number`) plus local identifier bugs (`written`/`setWritten`, `exampleMutations`, Helmet `title`) — not live-column renames.

### L-U3-06
`npx tsc --noEmit -p tsconfig.app.json 2>&1 | grep -c "error TS"` still **16**. No rename this unit.

### L-U3-07
`src` `functions.invoke` string names vs live 86 slugs. All live callers are deployed. `track-referral` appears only as a comment in `src/services/accountService.ts:136`. Not deployed. No other missing invoke.

### L-U3-08
`grep -rnE "https://" src/lib/` → 0.
Silent fallbacks: `src/lib/enrol.ts` `restHostFromEnv` returns `""` if `VITE_SUPABASE_URL` missing. `src/integrations/supabase/client.ts` `VITE_SUPABASE_URL || ''` and `VITE_SUPABASE_ANON_KEY || ''`. `src/components/contracts/FacialVerification.tsx` placeholder `referencePhotoUrl = "stored_photo_url"`.

---

## UNIT 4 — THE THREE SECURITY FINDINGS

### L-U4-01
`grep -rn "enrol_otp_accept"`:
- `supabase/migrations/20260821000011_enrol_otp_setting.sql` seeds `'000000'`
- `supabase/functions/enrol-otp/index.ts` compares `otp_code` to `settings.value`
- `supabase/functions/master-settings/index.ts` maps the key to group `"Recovery"`
Blast radius: any caller of `enrol-otp` who posts `otp_code=000000` can set `sessions.otp_verified_at` and advance enrolment_step to 9, skipping a real OTP. No SMS send exists in this function.

### L-U4-02
Before this unit: gated on **nothing**. No `trial_mode` read. No environment check.

### L-U4-03
Canon does not name `enrol_otp_accept`. Item 3 instructs the gate. `enrol-otp` now loads `platforms.trial_mode` via `sessions.platform_id`. If `trial_mode !== true`, returns `otp_invalid` 401 before reading the setting. Value of the setting unchanged.

### L-U4-04
BEFORE: `generate-api-key/index.ts` `.update({ api_key: apiKey, ...})` with `apiKey = crypto.randomUUID() + '-' + crypto.randomUUID()`.
AFTER: `apiKeyHash = await sha256Hex(apiKey)` then `.update({ api_key: apiKeyHash, ...})`. Response JSON still returns the one-time plaintext. Existing rows not nulled. Table has no `api_key_hash` column in types; hash is written into `api_key`.

### L-U4-05
Same defect. BEFORE: `.update({ api_key: newApiKey })`. AFTER: `.update({ api_key: newApiKeyHash })` with `sha256Hex`.

### L-U4-06
`to_regclass` public/auth/storage/realtime/offbox/extensions/graphql/vault → all NULL. No `business_partners` table in any schema. Plaintext-key row count: **0** (table absent). `pg_class` `%partner%` / `%api_key%` → empty.

### L-U4-07
`SELECT id, platform_id, size, consumed, purchased_at FROM blocks`:
id=1 cp03walk size=100 consumed=6 purchased_at=2026-08-22 11:23:24.733305+00
id=2 vairify size=100 consumed=7 purchased_at=2026-08-25 23:00:47.775019+00
RECORD vs LIVE: 26 Aug notes both consumed=6; vairify now 7. This run did not call verify. Test traffic vs production cannot be split (no source column).

