# CP-RUN-01-NOTES — 26 Aug 2026

Role: Cursor WRITES. Never decides.

## L-0 Item 0
Created this file. THE ONE-PROMPT METHOD v2 was ATTACH'd; `find` in this repo and `~/vai-workspaces` → no file. Missing file reported, not reconstructed.

## L-BEFORE
- HEAD at start: `5576d5ceab81c8478efb728fdc296dab99a234c6`
- remote origin: `https://github.com/VAI-ECO/chainpass-app.git` (fetch + push). One remote. chainpass-app only.
- porcelain at start: ` M docs/NOTES-THIS-PASS-02.md`

## L-ACCESS
No credential, role, or API-key rotation this run. Existing platform key used for UNIT 7 verify/rebaseline only. Verify burns `blocks.consumed` (live write of a counter, not a key).

---

## UNIT 1 — THE TREE

### L-U1-01
`git status --porcelain=v2 --branch` after item 2 commit:
```
# branch.oid 959200469bdd5004c9a0b2ea608be933460ffc29
# branch.head chainpass-fixes
? docs/notes/
```
No `branch.upstream`. `chainpass-fixes` does not track origin.

### L-U1-02
Committed `docs/NOTES-THIS-PASS-02.md` as `9592004`. `git status --porcelain -- docs/NOTES-THIS-PASS-02.md` → empty.

### L-U1-03
`git branch -avv`:
```
* chainpass-fixes     9592004 Record the VAIRIFY platform key issuance and trial verify outcomes from the last pass.
  dev                 3911e08 [origin/dev] Remove embedded inspect repo from tracking
  main                69981aa [origin/main] ChainPass Pilot - Lovable build
  remotes/origin/HEAD -> origin/main
  remotes/origin/dev  3911e08 Remove embedded inspect repo from tracking
  remotes/origin/main 69981aa ChainPass Pilot - Lovable build
```
No `origin/chainpass-fixes`.

### L-U1-04
`git remote -v`:
```
origin	https://github.com/VAI-ECO/chainpass-app.git (fetch)
origin	https://github.com/VAI-ECO/chainpass-app.git (push)
```
`git remote -v | grep -i vairify` → 0 (exit 1).

### L-U1-05
`git branch -a | grep -i vairify` → 0.
`git log --all --oneline | grep -i vairify` (commit messages containing the word, not a Vairify branch):
```
9592004 Record the VAIRIFY platform key issuance and trial verify outcomes from the last pass.
f46af97 Fold RULINGS-CP-03 into CANON-CP-01 and flag Vairify canon gaps.
50838c0 Split 20260814000001 to seed requirements only; park vairify/avchexx platform_requirements as pending until those platforms exist.
bf4e383 Phase 1: quarantine 32 DEAD/VAIRIFY/MIXED migrations from the apply path.
6f62b6e docs: delete stale canon set. Vairify canons do not live in this repo.
53e7a72 3. receive-vairify-webhook: constant-time signature comparison
646b007 2. receive-vairify-webhook: fail closed on missing secret or header
```

### L-U1-06
FAILED: `git log --oneline origin/chainpass-fixes..HEAD` → `fatal: ambiguous argument 'origin/chainpass-fixes..HEAD': unknown revision`. No remote-tracking branch. `git status -sb` → `## chainpass-fixes`. vs `origin/dev`: 50+ local commits (first: `9592004`). vs `origin/main`: 150 commits.

### L-U1-07
`git stash list` → empty (0). `git worktree list` → `/Users/bmac/vai-workspaces/chainpass-app  9592004 [chainpass-fixes]`. `.gitmodules` ABSENT.

### L-U1-08
`git ls-files | grep -E '\.env|\.pem|key'`:
```
.env.example
supabase/functions/_shared/enrolment_rekey_test.ts
supabase/functions/_shared/platform-key.ts
supabase/functions/_shared/session-key.ts
supabase/functions/enrol/session_key_length_test.ts
supabase/functions/generate-api-key/index.ts
supabase/functions/regenerate-api-key/index.ts
supabase/migrations/20260822000001_credential_keys_session_key_nullable.sql
supabase/migrations/20260824100000_settings_audit_and_named_keys.sql
supabase/migrations/20260825000001_session_key_32.sql
supabase/migrations/20260825000004_session_key_30.sql
```
No `.pem`. `.env` not tracked (example only). No plaintext key file tracked.

### L-U1-09
`git status --porcelain | grep "^??"` → `?? docs/notes/` named file `docs/notes/CP-RUN-01-NOTES.md`.

### L-U1-10
Left uncommitted during the run: this notes file (still being appended). Not deleted. Classified: this run's notes.

---

## UNIT 2 — CROSS-CONTAMINATION

### L-U2-01
`find . -iname '*AD-01*'` → empty. CANON-AD-01 is not in this repo as a file.

### L-U2-02
`find . -iname '*CM-01*'` → empty. CANON-CM-01 is not in this repo as a file.

### L-U2-03
Exact `grep -rilE 'council|upvote|golden rose|dateguard|vai-check|vaipulse|trurevu' . --exclude-dir=.git` hit `node_modules/` and `dist/` (hundreds of false-positive files). First-party matches:
- `docs/canon/CANON-CP-01_CHAINPASS__v3-8-20_.md`
- `docs/canon/SPEC-FLOW-01_THE_ONLINE_FLOWS_AND_THE_STACK.md`
- `docs/canon/RULINGS-CP-04_THE_RESPONSE_LEVEL__2026-08-25_.md`
- `docs/canon/OPERATIONS.md`
- `docs/screens/CP-01-SN_ChainPass_Enrolment_App__26_screens__20Aug.html`
- `supabase/migrations-quarantine/README.md`
- `supabase/migrations-quarantine/00000000000000_pilot_schema.sql`
- `src/components/PaymentWarningModal.tsx`
- `src/pages/LeoDeclaration.tsx`
- `chainpass-app-inspect/supabase/migrations/00000000000000_pilot_schema.sql`
- `chainpass-app-inspect/src/pages/LeoDeclaration.tsx`
- `chainpass-app-inspect/src/components/PaymentWarningModal.tsx`

No upvote hits in first-party md/ts. No CANON-AD-01 / CANON-CM-01 filenames.

### L-U2-04
REPORT ONLY. Deleted nothing.
- `docs/canon/CANON-CP-01_CHAINPASS__v3-8-20_.md` — Golden Rose Token §0; Council appeal; VAI-CHECK; Founding Council.
- `docs/canon/SPEC-FLOW-01_THE_ONLINE_FLOWS_AND_THE_STACK.md` — DateGuard; VAI-CHECK; VaiPulse via stack; Vairify project ref.
- `docs/canon/RULINGS-CP-04_THE_RESPONSE_LEVEL__2026-08-25_.md` — VAI-CHECK; §2.2 Vairify canon amendments.
- `docs/canon/OPERATIONS.md` — Council; VAI-CHECK; VAIPULSE; DateGuard; TruRevu (as banned capitalisation); Vairify brand table.
- `docs/screens/CP-01-SN_ChainPass_Enrolment_App__26_screens__20Aug.html` — grep hit (enrolment HTML dump).
- `supabase/migrations-quarantine/README.md` — DateGuard.
- `supabase/migrations-quarantine/00000000000000_pilot_schema.sql` — dateguard_sessions.
- `src/components/PaymentWarningModal.tsx` — DateGuard, V.A.I. Check.
- `src/pages/LeoDeclaration.tsx` — VAI-CHECK verifications.
- `chainpass-app-inspect/` copies of LeoDeclaration, PaymentWarningModal, pilot_schema.
- `docs/canon/FLAG-VAIRIFY-RULINGS-CP-03__2026-08-22_.md` — Vairify custody flag (filename FLAG-VAIRIFY; not in the grep pattern).

### L-U2-05
`grep -rnE '\$[0-9]' docs/ src/` (md/ts/tsx; HTML dumps also match). Vairify-attributed or stale figures:
- `docs/canon/CANON-CP-01_CHAINPASS__v3-8-20_.md:94` `$99` stale BRIEF-CP-01; `:1531` `$99, set by Vairify`.
- `docs/VAI-ECOSYSTEM-OVERVIEW.md:58,140,265` `$24.95` annual.
- `docs/VAI-FLOW-PAYMENT-TO-SUCCESS.md` `$99` `$49.50` `$79.20`.
- `docs/VERIFICATION-FLOW-COMPLETE-CODE-AUDIT.md` `$99`.
- `docs/PLATFORM-COMPLIANCE-API.md:146` `$99/year`.
- `docs/CHAINPASS-GAP-ANALYSIS.md:285` `$99/year`.
ChainPass-internal / changelog (not Vairify product price): `$0.15` background check; `$19` deleted access working number in MKT-CP-01 / RULINGS-CP-01; `src/components/docs/UsageAnalytics.tsx` `$1,284.50` `$127` `$900.00` dummy dashboard.

---

## UNIT 3 — THE CANON

### L-U3-01
`ls -la docs/canon/` plus `git log -1 --format=%ci`:
| size | last-commit | file |
|---:|---|---|
| 93362 | 2026-08-26 05:22:02 +0700 | CANON-CP-01_CHAINPASS__v3-8-20_.md |
| 10634 | 2026-08-25 16:13:23 +0700 | CANON-CP-02_THE_THREE_ENROLMENT_FLOWS__v2-8-25_.md |
| 7344 | 2026-08-25 20:56:10 +0700 | CANON-CP-04_TRIAL_MODE__v1-8-25_.md |
| 7581 | 2026-08-25 16:13:23 +0700 | CANON-MI-36_THE_RECOVERY_PATHS__v1-8-25_.md |
| 4964 | 2026-08-25 12:16:52 +0700 | FLAG-VAIRIFY-RULINGS-CP-03__2026-08-22_.md |
| 6380 | 2026-08-25 08:22:17 +0700 | MKT-CP-01_THE_THREE_LEVELS__v2-8-21_.md |
| 18699 | 2026-08-25 12:16:52 +0700 | OPERATIONS.md |
| 5675 | 2026-08-22 10:40:00 +0700 | RULINGS-CP-01__v1-8-21_.md |
| 11027 | 2026-08-25 12:16:52 +0700 | RULINGS-CP-02__2026-08-22_.md |
| 5881 | 2026-08-25 12:16:52 +0700 | RULINGS-CP-03__2026-08-22_.md |
| 6316 | 2026-08-25 16:13:07 +0700 | RULINGS-CP-04_THE_RESPONSE_LEVEL__2026-08-25_.md |
| 7361 | 2026-08-26 05:22:02 +0700 | RULINGS-CP-05_THE_SERVICE_STATE_CONTROL__v1-8-25_.md |
| 7991 | 2026-08-25 16:13:23 +0700 | RULINGS-CP-06_THE_RE-BASELINE_REQUEST__v1-8-25_.md |
| 18854 | 2026-08-25 16:13:07 +0700 | SPEC-FLOW-01_THE_ONLINE_FLOWS_AND_THE_STACK.md |

### L-U3-02
Index used: `OPERATIONS.md` §2 line listing `CANON-CP-01 · RULINGS-CP-01 · RULINGS-CP-02 · RULINGS-CP-03 · OPERATIONS · MKT-CP-01` (listed under the VAIRIFY block, not the CHAINPASS block). CHAINPASS block has no canon list.
Indexed-but-missing: none of those six filenames.
Present-but-unindexed: CANON-CP-02, CANON-CP-04, CANON-MI-36, FLAG-VAIRIFY-RULINGS-CP-03, RULINGS-CP-04, RULINGS-CP-05, RULINGS-CP-06, SPEC-FLOW-01. Also `docs/SPEC-CP-02_THE_CONTRACT_REGISTRY__v3-8-25_.md` lives outside `docs/canon/`.

### L-U3-03
No `# CHANGELOG` section: `FLAG-VAIRIFY-RULINGS-CP-03__2026-08-22_.md`; `RULINGS-CP-02__2026-08-22_.md` (has "Filed", no changelog heading).

### L-U3-04
DO NOT MERGE.
- Enrolment spine: `docs/canon/CANON-CP-01_CHAINPASS__v3-8-20_.md` §2 vs `docs/canon/CANON-CP-02_THE_THREE_ENROLMENT_FLOWS__v2-8-25_.md` §1 (CP-02 says it wins).
- CP-03 recovery custody: `docs/canon/RULINGS-CP-03__2026-08-22_.md` vs `docs/canon/FLAG-VAIRIFY-RULINGS-CP-03__2026-08-22_.md`.
- Registry: `docs/SPEC-CP-02_THE_CONTRACT_REGISTRY__v3-8-25_.md` vs mention in CANON-CP-01 §14.2.

### L-U3-05
`grep -rn "chainpass.id" . --exclude-dir=.git --exclude-dir=node_modules --exclude-dir=dist` → 0.

### L-U3-06
`grep -rn "TrueRevu"` → 0. (`TruRevu` appears once: OPERATIONS.md:251 as banned form.)

### L-U3-07
`grep -rni "blockchain"` → 0.

### L-U3-08
`grep -rniE '\b(she|her|hers|he|him|his)\b' docs/canon/` → 0. Same pattern on `docs/screens/*.md` → 0.

---

## UNIT 4 — LIVE

### L-U4-01
Public tables on `pguwhjearlqqfworantq`, exact `count(*)`:
agreement_parties 2 · agreement_proofs 1 · agreement_versions 2 · agreements 2 · baselines 4 · blocks 2 · commission_ledger 2 · contracts 4 · credential_events 0 · credential_keys 0 · credential_platforms 0 · credentials 4 · enrolment_agreements 1 · facial_signature_attempts 0 · facial_verification_attempts 0 · identity_join_log 1 · lookup_log 0 · payments 0 · platform_agreements 2 · platform_coupon_redemptions 0 · platform_coupons 0 · platform_requirements 0 · platform_services 0 · platform_visits 1 · platforms 2 · record_ledger 6 · recovery_codes 3 · requirement_completions 0 · requirement_versions 0 · requirements 4 · security_question_attempts 0 · security_question_lockouts 0 · security_question_options 6 · security_questions 3 · serve_events 2 · service_registry 5 · service_state 2 · service_state_log 0 · sessions 9 · settings 46 · settings_audit 11 · verification_ledger 12 · verification_records 0.

### L-U4-02
All 43 public tables: RLS on. anon/authenticated DML GRANT: none. Only SELECT on `settings` to anon+authenticated. service_role has INSERT/UPDATE/DELETE on most; write-once tables have INSERT only: agreement_parties, agreements, baselines, identity_join_log, record_ledger, serve_events, service_state_log. First SQL (DISTINCT ORDER BY) failed 42P10; second query succeeded.

### L-U4-03
Settings raw values:
agreement_open_hours=72 · appeal_panel_size=UNSET · attempt_count_n=3 · background_check_cost=0.15 · band_green_min=0.80 · band_yellow_min=0.65 · blocks_alert_threshold=UNSET · blocks_burn_window_hours=24 · commission_cap=50 · commission_origination_rate=5 · commission_renewal_rate=2 · consumption_block_size=1000 · credential_year_length_years=1 · dash_face_seat_1=UNSET · dash_face_seat_10=UNSET · dash_face_seat_over_10=UNSET · dash_face_seat_pack=UNSET · deferral_suspend_after=48 · deferral_window_hours=48 · engine_attempt_default=standard · engine_attempt_last=premium · enrol_otp_accept=000000 · enrol_session_hours=24 · facial_attempt_window_minutes=10 · facial_signature_max_recent=10 · facial_signature_window_minutes=5 · handback_nonce_ttl=60 · handoff_poll_window=15 · payout_cadence=UNSET · platform_document_pack=UNSET · price_access=UNSET · price_vai=29 · price_vai_pro=99 · provider_active=UNSET · provider_retention_years=3 · rebaseline_cap_per_period=UNSET · rebaseline_price=UNSET · recovery_code_count=3 · recovery_otp_max_attempts=5 · reds_threshold=UNSET · renewal_window=30 · security_question_count=3 · service_state_cache_ttl_seconds=UNSET · service_state_hysteresis_m=UNSET · service_state_hysteresis_n=UNSET · service_state_probe_interval_seconds=UNSET.
UNSET: appeal_panel_size, blocks_alert_threshold, dash_face_seat_1, dash_face_seat_10, dash_face_seat_over_10, dash_face_seat_pack, payout_cadence, platform_document_pack, price_access, provider_active, rebaseline_cap_per_period, rebaseline_price, reds_threshold, service_state_cache_ttl_seconds, service_state_hysteresis_m, service_state_hysteresis_n, service_state_probe_interval_seconds.

### L-U4-04
`schema_migrations` 62 versions `20260811000001`–`20260826000003`. Local `supabase/migrations/` 62 files, same versions. Either-side-only: none.

### L-U4-05
Live functions: 86 ACTIVE. Local dirs (excl `_shared`): 87. LIVE-ONLY: none. LOCAL-ONLY: `verify-complycube-biometric`. DELETE NOTHING.

### L-U4-06
`grep -n 'send-to-vairify\|verify-complycube-biometric' supabase/config.toml` → 0. Neither is in config. `send-to-vairify` dir: absent. `verify-complycube-biometric` dir: empty (no `index.ts`). WRITE NEITHER.

### L-U4-07
platforms (hash truncated):
- id=cp03walk display_name=CP-03 walk brand=CP-03 WALK hash_prefix=f929a4cc len=64 service_level=3 response_level=1 trial_mode=false status=active contact_spec={} collection_fields={} created_at=2026-08-22 11:23:24.733305+00
- id=vairify display_name=VAIRIFY brand=VAIRIFY hash_prefix=36dc38d4 len=64 service_level=3 response_level=3 trial_mode=true status=active contact_spec={"required":["email"]} collection_fields={"required":["email"]} created_at=2026-08-22 05:30:57.652812+00

### L-U4-08
vairify: response_level=3 trial_mode=true contact_spec={"required":["email"]} status=active created_at=2026-08-22 05:30:57.652812+00. Key not pasted.

### L-U4-09
No api-key issue-date column. Two hashes on `platforms`: prefix f929a4cc (cp03walk, platform created_at 2026-08-22 11:23:24+00) · prefix 36dc38d4 (vairify, platform created_at 2026-08-22; hash written 2026-08-25 per prior pass notes, not a column). PLAINTEXT not in report.

---

## UNIT 5 — BLOCK SIZE

### L-U5-01
`blocks` (no source column):
id=1 platform_id=cp03walk size=100 consumed=6 purchased_at=2026-08-22 11:23:24.733305+00
id=2 platform_id=vairify size=100 consumed=6 purchased_at=2026-08-25 23:00:47.775019+00

### L-U5-02
Both rows size=100. `consumption_block_size` live value is 1000 (`20260821000012` seeded `'1000'`). Neither row matches the setting. No ruling supplies 100. Named: id=1 cp03walk; id=2 vairify.

### L-U5-03
CONTRADICTS the prompt premise. `SELECT key,value FROM settings WHERE key='consumption_block_size'` → value=`1000`, not `UNSET`. DO NOT SET. `settings_audit` has zero rows for this key.

### L-U5-04
Did not delete or resize any block.

### L-U5-05
vairify block id=2 size=100 was copied from cp03walk id=1 (prior pass notes), not from the setting 1000. No other live copy-from-row found this run.

---

## UNIT 6 — THIRTEEN-STEP ORDER (report only)

### L-U6-01
File: `docs/canon/CANON-CP-02_THE_THREE_ENROLMENT_FLOWS__v2-8-25_.md` §1.
1 land · 1a optional information · 2 PAY · 3 session key · 4 KYC company · 5 ChainPass camera baseline · 5a outside-the-walls · 6 KYC completes · 7 image/result/key return · 8 V.A.I. minted · 9 confirmation+contact+OTP · 10 OTP+documents+face match · 11 retrieval page · 11a remember-on-device · 12 handoff · 13 delete session key.

### L-U6-02
Command: `grep -n 'path="/enrol' src/App.tsx` plus function `enrolment_step` greps.
1 routed+coded — `/enrol` EnrolEntry · `enrol/index.ts` enrolment_step 1.
1a routed+coded — `/enrol/keep` EnrolKeep stepLabel Step 1a (What we keep). Canon: optional, sells nothing.
2 routed+coded — `/enrol/pay` · `enrol-pay`.
3 coded — `enrol-pay` sets enrolment_step 3 (session key). No own route.
4 routed+coded — `/enrol/capture` · `enrol-capture` step 4. Depends on ComplyCube.
5 routed+coded — capture + `/enrol/baseline` · `enrol-baseline`.
5a coded — `enrol-background` (no own App route). Depends on Offenders.io.
6 coded — `enrol-capture` KYC complete path.
7 coded — `enrol-capture` enrolment_step 7.
8 routed+coded — `/enrol/reveal` · `enrol-reveal` mints V.A.I.
9 routed+coded — `/enrol/register` `/enrol/otp`.
10 routed+coded — `/enrol/accept` `/enrol/requirements` `/enrol/declaration` `/enrol/sign` `/enrol/baseline`.
11 routed+coded — `/enrol/complete` `/enrol/security`.
11a routed+coded — `/enrol/final`.
12 routed+coded — `/enrol/handoff`.
13 coded — `enrol-handoff` nulls session_key, enrolment_step 13.

### L-U6-03
ComplyCube: steps 4, 6 (and 7 return). Functions: create-complycube-session, complycube-callback, complycube-verification-callback, generate-complycube-token. Offenders.io: step 5a `enrol-background` service_id offenders_io.

### L-U6-04
Test-data today: trial_mode platform (every verify approves); `enrol_otp_accept=000000`; `face-stub`; dummy capture `dGVzdA==` used on UNIT 7; 0-DRAFT terms block real enrolment. Image/verification run on test data. Vendors not wired this run.

### L-U6-05
Issuance: function `enrol-reveal` (`generateVAI`) → table `credentials` insert `state=active` → `sessions.vai` + `credential_keys.session_key`.

---

## UNIT 7 — THREE LEVELS (report only)

### L-U7-01
`RULINGS-CP-04` §1: level 1 yes/no · level 2 a colour · level 3 a colour and a percentage. Code shapes (`response-level.ts`): `{match}` · `{band}` · `{band,percentage}`. `CANON-CP-04` §2 item 3: trial returns one state at every level: `trial_approved`.

### L-U7-02
This run: no `response_level` UPDATE (report only). Live row is level 3, trial_mode true. `POST verify` → `{"status":"trial_approved"}`. Same-day prior walk (levels 1, 2, 3 with temporary UPDATEs, restored to 3): all three `{"status":"trial_approved"}`.

### L-U7-03
CONFIRM. Canon one shape. Live: `{"status":"trial_approved"}` at 1, 2, and 3.

### L-U7-04
`POST rebaseline-request {"vai":"WALK001"}` → HTTP 403 `{"error":"refused"}`.

### L-U7-05
Bodies contain no legal-name keys. Scan of verify and rebaseline bodies: none. Courier rule holds on these responses.

---

## UNIT 8 — EXPORT

### L-U8-01
No canon file touched this run (report/clean only).
### L-U8-02
`/mnt/user-data/outputs` ABSENT. `mkdir /mnt/user-data/outputs` → `/mnt: Read-only file system`. Export written to `docs/notes/CP-RUN-01-EXPORT/` instead. Not reconstructed as /mnt.
### L-U8-03
`CP-PASS-SUMMARY-01.md` in that export dir.
### L-U8-04
`REF-CP-01_CHAINPASS_CANON_AND_FEATURES.md` written after the report, same export dir.

---

## FOUND

### L-SEC
- Live `enrol_otp_accept=000000` (test OTP on production settings).
- `generate-api-key` writes plaintext `api_key` onto `business_partners` (that table not in public list on live).
- UNIT 7 verify increments `blocks.consumed` on live.

### L-OTHER
- `origin/chainpass-fixes` does not exist; branch never pushed.
- `consumption_block_size` is `1000` not UNSET; both block rows are size 100.
- RULINGS-CP-04 §2.2 is Vairify canon sitting in this repo.
- OPERATIONS.md §2 indexes ChainPass canons under the VAIRIFY path and says no ChainPass screens exist (screens do exist under `docs/screens/`).
