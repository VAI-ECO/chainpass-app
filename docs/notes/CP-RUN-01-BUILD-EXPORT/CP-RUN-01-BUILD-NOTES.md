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
Functions `enrol-otp`, `generate-api-key`, `regenerate-api-key` deployed to `pguwhjearlqqfworantq`. Output: `Deployed Functions.`

---

## UNIT 5 — FIVE CLOSED FINDINGS, RE-PROVEN

### L-U5-01
Delete statement in `enrol-handoff/index.ts`:
```
.from("credential_keys").update({ session_key: null, superseded_at: new Date().toISOString() }).eq("vai", session.vai.trim())
```
Also nulls `sessions.session_key`. Live `SELECT` from `credential_keys` → empty (0 rows). No superseded row to show the key null. Code nulls the key; live cannot prove a row. ATTACH SESSION-LOG missing, not reconstructed.

### L-U5-02
```
INSERT INTO public.security_question_lockouts (vai, cleared_by) VALUES ('7YC4PHE', 'admin');
```
ERROR 23514: `new row for relation "security_question_lockouts" violates check constraint "security_question_lockouts_cleared_by_check"`. Rejected. A success would be a fail. Constraint: `cleared_by IS NULL OR cleared_by = 'chainpass_reverification'`.

### L-U5-03
`drain-queue` still ACTIVE on live (slug `drain-queue`). Callers: none in `src/` `functions.invoke`. Function exists; comment: silent provider reopen removed. Returns `reopened: 0`. `complycube-verification-callback` still takes `clientId` for a live camera fetch. DO NOT DELETE.

### L-U5-04
Most recent credential `7YC4PHE` created_at=2026-08-23 09:08:23.290161+00:
document_expiry=2029-04-01 · issuing_country=CA · issuing_province=ON · next_complycube_date=2029-08-23 (fourth mint column on the reveal insert).
Older rows WALK001, WALK003, 42N87QA: expiry/country/province NULL.

### L-U5-05
`supabase/functions/_shared/enrol-background.ts` request body: `{ firstName, lastName }` plus optional `dob`. `grep -rniE "first_name|last_name" supabase/migrations/` → **0**.

---

## UNIT 6 — THE BLOCK SIZE

### L-U6-01
`SELECT key, value FROM settings WHERE key='consumption_block_size'` → `1000`.
`settings_audit` columns are `setting_key` not `key`. `SELECT ... WHERE setting_key='consumption_block_size'` → empty.

### L-U6-02
See L-U4-07. Both size=100. vairify consumed=7.

### L-U6-03
Read site: `supabase/functions/_shared/consumption.ts` `resolveBlockSize` — first `platform_agreements.consumption_block_size`, then `settings.consumption_block_size`. Live agreement rows: both `consumption_block_size` NULL, so the settings key 1000 would apply on a new purchase. Existing blocks are 100.

### L-U6-04
Address A: settings key **1000**, no audit row. Address B: both block rows **size 100**. Did not resize. Did not change the key.

---

## UNIT 7 — THE THIRTEEN STEPS

### L-U7-01
`CANON-CP-02` §1 (governs; `CANON-CP-01` §2 says CP-02 wins):
1 land — CP-02 §1 · 1a optional info — §1 · 2 PAY — §1 · 3 session key — §1 · 4 KYC company — §1 · 5 ChainPass camera baseline — §1 · 5a outside-the-walls — §1 / §0 · 6 KYC completes — §1 · 7 image/result/key return — §1 · 8 V.A.I. minted — §1 · 9 confirmation+contact+OTP — §1 · 10 OTP+documents+face match — §1 · 11 retrieval — §1 · 11a remember-on-device — §1.1 · 12 handoff — §1 · 13 delete session key — §1.

### L-U7-02
`grep path="/enrol" src/App.tsx`:
1 routed+coded `/enrol` EnrolEntry · `enrol/index.ts`
1a routed+coded `/enrol/keep` EnrolKeep
2 routed+coded `/enrol/pay` · `enrol-pay` (consent `/enrol/consent` before pay)
3 coded `enrol-pay` sets session_key. No own route.
4 routed+coded `/enrol/capture` · `enrol-capture` open_provider. ComplyCube.
5 routed+coded capture + `/enrol/baseline` · `enrol-baseline`
5a coded `enrol-background` (no App route). Offenders.io.
6 coded `enrol-capture` KYC complete
7 coded `enrol-capture` enrolment_step 7
8 routed+coded `/enrol/reveal` · `enrol-reveal`
9 routed+coded `/enrol/register` `/enrol/otp`
10 routed+coded `/enrol/accept` `/enrol/requirements` `/enrol/declaration` `/enrol/sign` `/enrol/baseline`
11 routed+coded `/enrol/complete` `/enrol/security`
11a routed+coded `/enrol/final`
12 routed+coded `/enrol/handoff`
13 coded `enrol-handoff` nulls session_key, step 13

### L-U7-03
ComplyCube: 4, 6, 7. Functions: create-complycube-session, complycube-callback, complycube-verification-callback, generate-complycube-token, enrol-capture.
Offenders.io: 5a `enrol-background`.

### L-U7-04
Test-data today: trial_mode platform; `enrol_otp_accept` gated this run; `face-stub` / FACE_SERVICE; 0-DRAFT terms. Stub returns 512-vector `{model:face-stub, model_version:1, score:1}`. Did not call ComplyCube or Offenders.io.

### L-U7-05
Thirteen: `CANON-CP-02` §1 (table rows 1–13 plus 1a, 5a, 11a). Eleven: `CANON-CP-02` §5 item 1 “Eleven steps superseded”; `SPEC-FLOW-01` line 273 “Enrolment sequence in any prompt that still says eleven steps is stale”; historical `CANON-CP-01` §2. DO NOT RECONCILE.

### L-U7-06
Issuance: `enrol-reveal` `generateVAI` → `credentials` insert `state=active` → `sessions.vai` + optional `credential_keys.session_key`.

### L-U7-07
Did not open a ComplyCube session or Offenders.io. Sequence stops at step 4 (`enrol-capture` `open_provider`) and 5a (`OFFENDERS_IO_URL` must land). `enrol-baseline` with a posted `vector` returns 400 without a vendor call (L-U9-08).

---

## UNIT 8 — THREE LEVELS AND TRIAL MODE

### L-U8-01
`RULINGS-CP-04` §1: level 1 yes/no · level 2 a colour · level 3 a colour and a percentage.
`response-level.ts` shapes: `{match}` · `{band}` · `{band,percentage}`.
`CANON-CP-04` §2 item 3: trial one state at every level: `trial_approved`.

### L-U8-02
Did not run live verify. `verify/index.ts` `recordGateConsumption` on trial_approved. Would increment `blocks.consumed`.

### L-U8-03
Not re-run. 26 Aug record: all three levels `{"status":"trial_approved"}`. Code still collapses via `if (platform.trial_mode)`.

### L-U8-04
`POST /functions/v1/rebaseline-request` body `{"vai":"WALK001"}` with anon Bearer → HTTP 403 `{"error":"refused"}`. Catch-all also maps lookup failure to refused.

### L-U8-05
Did not fetch live verify bodies this run (would burn). Re-baseline body has no legal-name keys. `grep` of `trialApprovedBody` / `publicGateBody` — status/band/percentage only.

### L-U8-06
Set: `supabase/functions/verify/index.ts` and `gate/index.ts` when `platform.trial_mode`. Ledger column `verification_ledger.result='trial_approved'`. Baseline mark: `enrol-baseline/index.ts` inserts `baselines.is_trial` from `platforms.trial_mode` (`20260825000006_trial_mark.sql`). Frozen by trigger.

### L-U8-07
UNRULED.

---

## UNIT 9 — THE FACE STACK

### L-U9-01
Secret **names** only: `FACE_SERVICE_URL` updated_at=2026-08-24T21:34:16.815Z · `FACE_SERVICE_KEY` updated_at=2026-08-22T12:22:17.839Z. Values not written. OPERATIONS changelog 25 Aug claims live `vec.chainpass.io/embed`. Callers still post JPEG (below).

### L-U9-02
`supabase/functions/_shared/face-client.ts` exists. `grep -rn "face-client" supabase/` → **0 imports**. Unwired from `enrol-baseline.ts` (uses `_shared/enrol-baseline.ts`), `band-compare.ts`, `verify-vai-facial`.

### L-U9-03
Mismatch stands. `verify-vai-facial`, `band-compare`, `frame-b-handler`, `generate-baseline`, `complycube-callback`, `enroll-in-house`, `verify-facial-signature`: `Content-Type: image/jpeg`, body = raw bytes. Live service wants JSON `{image:base64}` per `face-client.ts` comment. `_shared/enrol-baseline.ts` sends JSON only when URL is not a functions gateway.

### L-U9-04
`engine_attempt_last` **is read** in `_shared/attempt-engine.ts`, called from `verify-vai-facial/index.ts:163`. Value is stamped `facial_verification_attempts.engine_used` only. `callFaceService` does not take the engine. No routing layer. `engine_attempt_default` also stamps agreements/accept/baseline.

### L-U9-05
`src/pages/VerifyLastAttempt.tsx` lines 17–19: “This attempt runs on settings:engine_attempt_last, and a selfie is taken.” Not rewritten.

### L-U9-06
`dig +short vec.chainpass.io` → `2.28.18.138`. status NOERROR. Not NXDOMAIN.

### L-U9-07
`grep -rniE "liveness|antispoof|minifasnet"` is not 0. Hits: `SPEC-FLOW-01` (provider liveness), `create-complycube-session` `liveness: true`, `VerificationTransition.tsx` copy, docs. **minifasnet / antispoof: 0.** No MiniFASNet path.

### L-U9-08
`deno test --allow-read --allow-env --allow-net supabase/functions/enrol/two_frame_compare_test.ts` → 4 passed.
Same bytes → cosine 1 / band green. Different bytes → not the same vector / not green. Live `POST enrol-baseline` `{"session_id":"...","vector":[0]}` → HTTP 400 `{"error":"client_vector_rejected — matcher is FACE_SERVICE, not a stub"}`.

---

## UNIT 10 — THE SCREENS

### L-U10-01
`ls docs/screens/` → 9. Recursive files: 166. SN numbers 01–50 present as sized HTML under SEPARATED-SIZES / CLIENT / MASTER folders. Register lists SN-01–SN-50 plus SN-51, SN-52.

### L-U10-02
Address A (26 Aug CP-PASS-SUMMARY / this prompt): 50 delivered and accepted. Address B (session log claim in the prompt): 52 coded, SN-51 and SN-52 undrawn, every Verified ⬜. File count: 50 SN ids in sized trees; register has 52 coded rows (51–52 Coded ✅, drawings ⬜). DO NOT RESOLVE.

### L-U10-03
`grep -rn "SN-5[3-6]"` docs/ src/ supabase/ → empty (first-party). Retired table uses CP12/CP15, not SN-53–56.

### L-U10-04
Live-endpoint enrolment: `/enrol*` pages via `invokeEnrol` / `enrol-*` functions. Plates: `VerifyLastAttempt.tsx` (static copy + navigate). Client/master dashboard components query tables absent on live (admin_*, business_*). SN-24, SN-41, SN-50 labelled unruled plates in the register.

### L-U10-05
Main register Verified column: SN-01–SN-07 ✅ (7). SN-08–SN-52 ⬜ (45). Not every cell ⬜. RECORD vs prompt/session-log “every Verified ⬜”.

---

## UNIT 11 — CANON

### L-U11-01
See `git log -1 --format=%ci` table run this unit (sizes/dates in command output). 14 files in `docs/canon/`.

### L-U11-02
Indexed under CHAINPASS in OPERATIONS §2 this run. Changelog row 26 Aug #8 same commit `8974fd1`.

### L-U11-03
Empty changelogs added: FLAG-VAIRIFY filing 22 Aug 2026 only; RULINGS-CP-02 filing 22 Aug 2026 only. Commit `a18cc24`. No invented history.

### L-U11-04
OPERATIONS §2: ChainPass canons moved off the VAIRIFY heading. Screens line no longer “NO CHAINPASS SCREENS”. `ls docs/screens/ | wc -l` → **9**.

### L-U11-05
Unmerged: CANON-CP-01 §2 vs CANON-CP-02 §1 (CP-02 wins). RULINGS-CP-03 vs FLAG-VAIRIFY-RULINGS-CP-03. SPEC-CP-02 (`docs/SPEC-CP-02_...`) vs CANON-CP-01 §14.2. Not merged.

### L-U11-06
Citations to files not in this repo (section therefore absent here): `CANON-MI-35` §0, `RULINGS-VA-05` §1a, `CANON-SA-07`, `CANON-00` §5/§14.1, `CANON-MI-22` §11–12, `CANON-SA-01` §17, `DESIGN-BRIEF-CP-01` §4. `CANON-CP-01` §4A.2 exists. `CANON-CP-02` §4.1 exists.

### L-U11-07
`chainpass.id` → 0. `TrueRevu` → 0 (`TruRevu` in OPERATIONS banned-words). `blockchain` → 0 in canon/src. Gendered pronouns in `docs/canon/` → 0.

---

## UNIT 12 — VAIRIFY CONTENT IN THIS REPO

### L-U12-01
`CANON-CP-01`: Golden Rose ~line 27; Council appeal ~677–684; VAI-CHECK bands ~735; Founding Council ~1317. Deleted nothing.

### L-U12-02
`RULINGS-CP-04` §2.2 heading: `## 2.2 — VAIRIFY CANON`. Rules Vairify (`CANON-MI-22`, `CANON-00`, `CANON-SA-01`).

### L-U12-03
SPEC-FLOW-01: DateGuard ~100, 103, 134; VAI-CHECK ~115, 190; Telnyx/VAIPULSE via stack. OPERATIONS: VAI-CHECK, VAIPULSE, DATEGUARD, TruRevu ~238–307.

### L-U12-04
`PaymentWarningModal.tsx:93` shipping UI copy (rendered). `LeoDeclaration.tsx:290` shipping UI copy (“VAI-CHECK verifications”).

### L-U12-05
`$99` CANON-CP-01:94, :1531; PLATFORM-COMPLIANCE-API.md:146; VAI-FLOW-PAYMENT-TO-SUCCESS.md; VERIFICATION-FLOW-COMPLETE-CODE-AUDIT.md; CHAINPASS-GAP-ANALYSIS.md:285.
`$24.95` VAI-ECOSYSTEM-OVERVIEW.md:58,140,265.
`$0.15` CANON-CP-01:432 (background check cost, ChainPass setting).

### L-U12-06
`ls supabase/migrations-quarantine` → 33 files. `comm -12` vs `supabase/migrations` basenames → **empty**.

### L-U12-07
`chainpass-app-inspect/` is a nested snapshot of an older ChainPass/VAI tree (own `.git`, dated 11 Aug 2026 files, includes `chainpass-vai-main-20251121.zip`). Not the live app.

---

## UNIT 13 — EXPORT AND STATE

### L-U13-01
`docs/notes/CP-RUN-01-BUILD-EXPORT/` created and committed.

### L-U13-02
Notes + canon files touched this run copied in.

### L-U13-03
Final push: `git log --oneline origin/chainpass-fixes..HEAD` empty after push.

### L-U13-04
State table in the report.


