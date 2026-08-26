# CONFLICTS.md — ChainPass · CANON-AUDIT-01

No winner. No resolution column. Both addresses, both quotes.

HEAD at audit: `8e680d058081410346cf0e228f0b864b0dfdaaf5`.

---

# UNIT 3.1 — Same subject, different ruling

| # | Subject | Address A + quote | Address B + quote | Which is newer | What it blocks |
|---|---|---|---|---|---|
| 1 | Session key length | `CANON-CP-01` §3 L417: "THIRTY-TWO CHARACTERS. ALPHANUMERIC. Owner ruling, 25 August." Changelog #28 (25 Aug): "SESSION KEY LENGTH IS 32 CHARACTERS." | `CANON-CP-01` §3 L419: "Length is not open. Length is 30 — CANON-CP-02 §1 step 3. The earlier 32-character line is superseded." `CANON-CP-02` §1 L32: "ChainPass creates a 30-character alphanumeric session key." Changelog #33 (25 Aug): "SESSION KEY LENGTH 30." Live migration `supabase/migrations/20260825000004_session_key_30.sql` comments 30. | Same calendar day in CP-01. CP-02 deposited 25 Aug 16:13. CP-01 last commit 26 Aug 05:22 still carries both lengths. | Enrolment session mint, vault, handoff payload, any check that counts characters. |
| 2 | Enrolment step numbers (same spine, different numbering) | `CANON-CP-01` §2 L127–156 ASCII: step 8 CONTACT AND OTP; step 9 SIGN; step 10 FACE MATCH; step 11 RETRIEVAL. | `CANON-CP-02` §1 L28–44: step 9 contact+OTP; step 10 documents THEN face match; step 11 retrieval. CP-01 §14.3 L1061: "TERMS ARE ACCEPTED ON THE ACCEPTANCE PAGE — STEP 8 — WITH THE SECOND CAPTURE." | CP-01 last commit 26 Aug is newer than CP-02 (25 Aug 16:13). CP-02 header L3: "Where CANON-CP-01 §2 disagrees, THIS FILE WINS." | Function comments, wires, and tests that bind a step number to a surface. |
| 3 | One enrolment flow vs three flows | `RULINGS-CP-02` §2 L38–46: "ONE ENROLMENT FLOW. ONE CREDENTIAL. THE LEVEL DOES NOT CHANGE HOW THE MEMBER ENROLS." "DO NOT BUILD SEPARATE FLOWS FOR ACCESS, V.A.I. AND PRO." | `CANON-CP-02` title and §0 L11–19: "THE THREE ENROLMENT FLOWS." "Every level walks the same spine. The flows differ in exactly three places." Three columns: VAIRIFY FLOW · V.A.I. PRO · V.A.I. PASS + ACCESS. | CP-02 25 Aug vs RULINGS-CP-02 filed 22 Aug (git 26 Aug). | Whether a builder draws one walk or three. |
| 4 | Retrieval-page brand | `RULINGS-CP-02` §5 L86–89: "DEFAULT IS CHAINPASS. EVERY SCREEN, EVERY LEVEL." "ACCESS AND V.A.I. STAY CHAINPASS-BRANDED." | `CANON-CP-02` §0 L19: "Retrieval page brand \| VAIRIFY-branded \| platform-branded \| platform-branded." `CANON-CP-01` §2.10 L381: "THE RETRIEVAL PAGE IS A CHAINPASS PAGE, PLATFORM-BRANDED" and "VAIRIFY-branded for Vairify." | CP-02 / CP-01 §2.10 25 Aug vs RULINGS-CP-02 22 Aug. | Screen skin at step 11. |
| 5 | Terms placement | `RULINGS-CP-02` §1 L14–21 (body still live): "TERMS ACCEPTANCE IS ADMINISTERED BY CHAINPASS, AT REGISTER." "TERMS ACCEPTANCE MOVES TO THE REGISTER STEP." Header L5: "§1 IS SUPERSEDED BY RULINGS-CP-03 §1." | `RULINGS-CP-03` §1 L12–22: "TERMS ACCEPTANCE LEAVES REGISTER. IT RUNS ON THE ACCEPTANCE PAGE." `CANON-CP-01` §14.3 L1061: acceptance page. | CP-03 filed 22 Aug; git 25 Aug. CP-02 git 26 Aug still carries superseded §1 body. | Register vs acceptance screen. |
| 6 | Level names | `CANON-CP-01` §14.1 L942–944: "1 ACCESS · 2 V.A.I. · 3 PRO." `RULINGS-CP-01` Ruling 5 L69–72: "Public name is V.A.I.; bare Plus never appears." | `CANON-CP-02` §0 L15: third column "V.A.I. PASS + ACCESS." `CANON-CP-01` §16.1 L1320: "LEVEL 2 IS WRITTEN V.A.I. PLUS ALWAYS IN FULL WHERE THAT NAME IS USED." `RULINGS-CP-02` §2 L41: "A PLUS-ONLY PLATFORM REJECTS AN ACCESS HOLDER." | CP-02 25 Aug flags PASS at §5 item 6. §16.1 still says V.A.I. PLUS. | Marketing copy, doors, settings keys. |
| 7 | Dashboard identity | `RULINGS-CP-01` Ruling 1 L11–16: "The dashboard's ruled identity is the V.A.I. that signed the platform agreement." "Login is the face." Ruling 1a L30–32: "Passwords cost nothing and remain available always." | `CANON-CP-01` §14.6 L1135: "Client staff identity is the platform's problem. The API key is the identity ChainPass knows." | RULINGS-CP-01 21–22 Aug. CP-01 last commit 26 Aug still has rule 3. | Dashboard login. |
| 8 | Account-security step number | `RULINGS-CP-03` §7 L83: "Collected at enrolment step 12 (account security)." `FLAG-VAIRIFY-RULINGS-CP-03` L7: "Collected at enrolment step 12." | `CANON-CP-02` §1 L41–43: retrieval is step 11; handoff is 12. `CANON-CP-01` §2.10 L379: "STEP 11 IS THE RETRIEVAL PAGE." | CP-02 25 Aug vs FLAG/CP-03 22 Aug (FLAG git 26 Aug). | Where questions are collected. |
| 9 | Trial mode in parent canon | `CANON-CP-04` §2 L25: "`trial_approved`. NEVER `match`. NEVER `green`. NEVER `pass`." §6 L102: parent `CANON-CP-01` §16.2 "baselines gains a trial mark"; §7.2 "`trial_approved` is a state alongside the bands." | `CANON-CP-01` (1548 lines): `rg trial_approved` in this file returns no matches. | CP-04 filed 25 Aug 20:56. CP-01 last commit 26 Aug 05:22 does not carry the mark. | Gate response, viewer, schema. |
| 10 | Access price key | `RULINGS-CP-01` Ruling 2 L54–56: "Value lives at `settings:price_access`." `MKT-CP-01` §1 L16: "Priced at launch from `settings:price_access`." | `CANON-CP-01` §1.1a L58–61 names only `settings:price_vai` and `settings:price_vai_pro`. `rg price_access CANON-CP-01` returns none. | RULINGS-CP-01 / MKT git older than CP-01 26 Aug, which still omits the key. | Access product row. |

---

# UNIT 3.2 — Duplicate coverage (same subject, same way). DO NOT MERGE.

| # | Subject | Address A | Address B |
|---|---|---|---|
| 1 | Recovery tables live on ChainPass | `RULINGS-CP-03` §7 L81 | `CANON-CP-01` §2.10 L372–374 · `FLAG-VAIRIFY-RULINGS-CP-03` L5–7 |
| 2 | Terms on the acceptance page | `RULINGS-CP-03` §1 L16 | `CANON-CP-01` §14.3 L1061 |
| 3 | Three service levels Access · V.A.I. · Pro | `CANON-CP-01` §14.1 L940–944 | `MKT-CP-01` whole file · `CANON-CP-01` §16.1 L1318 |
| 4 | Response level 1/2/3 | `RULINGS-CP-04` §1 | `CANON-CP-01` §16.2 L1328–1329 · changelog #32 |
| 5 | Session key 30 (the closed length, ignoring the live 32 line) | `CANON-CP-02` §1 L32 | `CANON-CP-02` §3 L83 · changelog #5 L149 |
| 6 | Pronoun ban | `CANON-MI-36` §0 L13 | `OPERATIONS.md` naming table (implicit via banned list) |

---

# UNIT 3.3 — One file contradicting itself

| # | File | Address A + quote | Address B + quote |
|---|---|---|---|
| 1 | `CANON-CP-01` | §3 L417: THIRTY-TWO CHARACTERS | §3 L419: Length is 30 |
| 2 | `CANON-CP-01` | Changelog #28 (25 Aug) L1527: LENGTH IS 32 | Changelog #33 (25 Aug) L1512: LENGTH 30 |
| 3 | `CANON-CP-01` | §2 ASCII L143: step 8 CONTACT AND OTP | §14.3 L1061: terms on acceptance page STEP 8 |
| 4 | `CANON-CP-01` | §14.1 L943: level 2 public name **V.A.I.** | §16.1 L1320: LEVEL 2 IS WRITTEN "V.A.I. PLUS" |
| 5 | `CANON-CP-01` | Header L10: AMENDED 20 AUGUST 2026. Footer L1548: Amended 20 August 2026. v3 | Changelog rows through 25 Aug; git `%ci` 2026-08-26 05:22:02 +0700 |
| 6 | `RULINGS-CP-02` | Header L5: §1 SUPERSEDED BY RULINGS-CP-03 §1 | Body §1 L14–28 still rules terms at register |
| 7 | `RULINGS-CP-05` | Changelog #3 L141 (25 Aug): "a declared-up override must carry a reason and an expiry" | Changelog #6 L139 (26 Aug): "expiry deleted. Override is persistent." Both rows remain. |
| 8 | `OPERATIONS.md` | Footer L356: Amended 20 August 2026 | Changelog L335: 26 Aug row 8. Git 2026-08-26 10:42:00 +0700 |
| 9 | `CANON-CP-02` | Header L3: this file wins where CP-01 §2 disagrees | Changelog L149: "wins over the earlier 32-character line in CANON-CP-01 §2.4" — live 32-character line is §3 L417, not §2.4 |

---

# UNIT 3.4 — Stated version/date older than a file it supersedes

| File that claims to supersede | Its stated / git date | File it supersedes | That file's git date |
|---|---|---|---|
| `CANON-CP-02` ("THIS FILE WINS" vs CP-01 §2) | Deposited 25 Aug 2026 · git 2026-08-25 16:13:23 +0700 | `CANON-CP-01` §2 | git 2026-08-26 05:22:02 +0700 (newer than the file that claims to win) |
| `RULINGS-CP-03` §1 (supersedes RULINGS-CP-02 §1) | Stated 22 August 2026 · git 2026-08-25 12:16:52 +0700 | `RULINGS-CP-02` | git 2026-08-26 10:42:00 +0700 (newer than the superseding file) |
| `SPEC-FLOW-01` §0.1 (superseded same day by CP-02 §5 item 3) | Deposited 25 Aug · git 2026-08-25 16:13:07 +0700 | `CANON-CP-02` | git 2026-08-25 16:13:23 +0700 — SPEC-FLOW is slightly older than the file it says closed the other way |

---

# UNIT 3.5 — Ruling in a RULINGS-* file its parent canon does not carry

| Ruling | Address | Parent | What parent carries instead |
|---|---|---|---|
| Access price pointer `settings:price_access` | `RULINGS-CP-01` Ruling 2 L54–56 | `CANON-CP-01` §1.1a | Only `price_vai` / `price_vai_pro` |
| Face login as dashboard identity; passwords free default | `RULINGS-CP-01` Ruling 1 + 1a L11–32 | `CANON-CP-01` §14.6 rule 3 L1135 | "The API key is the identity ChainPass knows." |
| Trial mark / `trial_approved` | `CANON-CP-04` (not a RULINGS file; parent fold listed at §6) | `CANON-CP-01` | No `trial_approved` string in the file |
| Recovery collected at step 12 | `RULINGS-CP-03` §7 L83 | `CANON-CP-01` §2.10 L379 | Step 11 is the retrieval page |

---

# UNIT 3.6 — Canon vs live (repo schema / routes / functions). CHANGE NOTHING.

Live project named in OPERATIONS: `pguwhjearlqqfworantq`. This audit did not query production.

Command: `rg -n "^      [a-z_]+: \{$" src/integrations/supabase/types.ts`

`types.ts` tables: `admin_activity_logs`, `admin_badges`, `admin_earned_badges`, `admin_performance_scores`, `alert_history`, `alert_settings`, `anomaly_detection_settings`, `api_usage_logs`, `archived_activity_logs`, `business_partners`, `coupon_usage`, `coupons`, `detected_anomalies`, `email_digest_*`, `email_notifications`, `error_logs`, `legal_agreements`, `payments`, `pricing_config`, `profiles`, `retention_policies`, `sandbox_test_scenarios`, `signature_attempts`, `signed_contracts`, `user_preferences`, `user_roles`, `vai_assignments`, `vai_status_updates`, `vairify_webhook_events`, `verification_records`, `webhook_*`, `has_role`.

`rg credentials|baselines|platforms|service_state src/integrations/supabase/types.ts` → empty.

| Canon address | Names | Live address | Finding |
|---|---|---|---|
| `CANON-CP-01` §16.2 L1327+ | `platforms`, `platform_agreements`, `credentials`, `baselines`, `service_state` (via RULINGS-CP-05) | `src/integrations/supabase/types.ts` | Those names are absent from generated types. Migrations in `supabase/migrations/` do mention `baselines`, `platforms`, `service_state` (e.g. `20260825000006_trial_mark.sql`, `20260825000008_service_state.sql`). types.ts does not match those migrations. |
| `CANON-CP-01` §2.10 L372–374 | `security_questions`, `security_question_lockouts`, `security_question_attempts`, `security_question_options`, `recovery_codes` | `types.ts` | Absent from types.ts table list. |
| `CANON-CP-01` L1450 | `POST /v1/photo-match` | `ls supabase/functions` | No `photo-match` function directory. |
| `CANON-CP-01` L1449 | `POST /v1/verify` | `ls supabase/functions` | No `verify` directory. Enrol/gate functions exist (`enrol-*`, `gate`, `service-state`, `rebaseline-request`). |

---

# UNIT 3.7 — Vocabulary greps (output pasted)

**blockchain** — none in `docs/canon/*.md` (`rg -n -i blockchain docs/canon`).

**groundbreaking / revolutionary / innovative** — ban tables only:

```
docs/canon/MKT-CP-01_THE_THREE_LEVELS__v2-8-21_.md:93:| 3 | ⚠️ **The banned list applies: no groundbreaking, innovative, "matters."** |
docs/canon/OPERATIONS.md:260:⚠️ **Banned: groundbreaking · innovative · "matters."**
```

**matters** (non-ban uses):

```
docs/canon/CANON-CP-01_CHAINPASS__v3-8-20_.md:726:## 7.1 — ⚠️ The distinction that matters
docs/canon/RULINGS-CP-02__2026-08-22_.md:122:| 6 | … which matters here because the member is mid-enrolment …
```

**affiliate / discount**:

```
docs/canon/CANON-CP-01_CHAINPASS__v3-8-20_.md:94:… "$99 every holder, no tiers and no discounts" IS STALE.
docs/canon/CANON-CP-01_CHAINPASS__v3-8-20_.md:637:| 1 | ⚠️ **The member states whether the member is affiliated with law enforcement.** |
docs/canon/OPERATIONS.md:256:| ⚠️ **Revenue sharing** | ⚠️⚠️ **AFFILIATE — BANNED PROJECT-WIDE** |
```

**TrueRevu** — OPERATIONS L253 ban row only: `| **TruRevu** | **wrong-capital product name** |`

**chainpass.id** — OPERATIONS L254 ban row: `| **chainpass.io** | **the .id domain — lost, unrecoverable** |`

**PACKAGE · TIER · LEVEL** — `CANON-CP-01` §16.1 L1316–1318 assigns PACKAGE to Vairify and LEVEL to ChainPass. `OPERATIONS.md` §8 L264 heading "THE THREE TIER LINES" then FREE · PLUS · PREMIUM (Vairify packages). `RULINGS-CP-02` uses LEVEL for ChainPass gates. `CANON-CP-01` §4C.1 L540: "PRO IS A PLATFORM TIER, NOT A CONSUMER UPGRADE" — TIER used for a ChainPass level.

**Gendered** (`rg` word-boundary he/she empty). Named nouns:

```
docs/canon/CANON-CP-01_CHAINPASS__v3-8-20_.md:449:… we don't want that guy to not get verified
docs/canon/CANON-CP-01_CHAINPASS__v3-8-20_.md:511–513: Guy beats up a girl. … The member goes to see another girl.
docs/canon/CANON-CP-01_CHAINPASS__v3-8-20_.md:657: A man with a history
docs/canon/CANON-CP-01_CHAINPASS__v3-8-20_.md:1529: THE SISTER CASE. (changelog #4)
docs/canon/RULINGS-CP-02__2026-08-22_.md:94–95: THE POLICEMAN COULD CLAIM
```

---

# UNIT 3.8 — Other-product (Vairify) content in this repo's canon. MOVE NOTHING.

| File | Lines | What sits here |
|---|---|---|
| `FLAG-VAIRIFY-RULINGS-CP-03__2026-08-22_.md` | 1–84 entire | Header L3: "Repo: vairify-app · do not edit from chainpass-app." Quotes `CANON-MI-25` and `CANON-MI-33`. |
| `CANON-MI-36_THE_RECOVERY_PATHS__v1-8-25_.md` | 1–153 entire | Vairify-numbered file deposited in ChainPass canon. |
| `OPERATIONS.md` | 264–272 | §8 THE THREE TIER LINES: FREE / PLUS / PREMIUM. |
| `OPERATIONS.md` | 156 | `grep -c "SPLIT IS BY ACT" ~/vai-workspaces/vairify-app/docs/canon/CANON-00_GENERAL_RULES.md` |
| `CANON-CP-01` | 1316–1321 | §16.1 PACKAGE \| Vairify \| Free · Plus · Premium |
| `CANON-CP-02` | 99–108 | §4 WHAT VAIRIFY DOES |
| `SPEC-FLOW-01` | 35–40, 100, 169–174 | Disguise icons; DateGuard / `CANON-00` §14.1; package page `MI-34`; `CANON-MI-22/33/34/35` |
| `RULINGS-CP-04` | 49, 70 | §2.2 / item 4 Vairify's level; `CANON-00` §5 no face on Vairify |
| `CANON-CP-01` | 0–34 | GRT as ChainPass service; Vairify is one customer — `RULINGS-VA-03` |

---

# UNIT 3.9 — Other-product price figures

`rg price_plus|price_premium|\$19\.99 docs/canon` → none.

`$19` appears as a **deleted** Access working number (`MKT-CP-01` L114; `RULINGS-CP-01` L57). That is a ChainPass Access figure, not a Vairify package key.

`$99` in `CANON-CP-01` L94: labelled stale `BRIEF-CP-01` "every holder" — ChainPass credential, marked stale.

No Vairify `price_plus` / `price_premium` figures in these 14 files.

---

# THE CONFLICT REGISTER

Same rows as UNIT 3.1. No RESOLUTION column.

| # | Subject | Address A + quote | Address B + quote | Which is newer | What it blocks |
|---|---|---|---|---|---|
| 1 | Session key length | CP-01 §3 L417 THIRTY-TWO | CP-01 L419 and CP-02 §1 L32 THIRTY | CP-01 git 26 Aug still holds both | Session mint / handoff |
| 2 | Enrolment step numbers | CP-01 §2 ASCII contact=8 sign=9 | CP-02 §1 contact=9 docs+match=10 | CP-01 git newer; CP-02 claims to win | Step-bound functions |
| 3 | One flow vs three | RULINGS-CP-02 §2 ONE FLOW | CP-02 §0 THREE FLOWS | CP-02 25 Aug vs CP-02-rulings 22/26 | Screen count |
| 4 | Retrieval brand | RULINGS-CP-02 §5 DEFAULT CHAINPASS | CP-02 §0 VAIRIFY-branded / platform-branded | 25 Aug CP-02 | Skin |
| 5 | Terms at register vs acceptance | RULINGS-CP-02 §1 body AT REGISTER | RULINGS-CP-03 §1 ACCEPTANCE PAGE | CP-03 supersedes; CP-02 body still live | Register screen |
| 6 | Level names PASS / PLUS / V.A.I. | CP-01 §14.1 ACCESS · V.A.I. · PRO | CP-02 §0 V.A.I. PASS + ACCESS; CP-01 §16.1 V.A.I. PLUS | Flagged 25 Aug, not renamed | Copy and doors |
| 7 | Dashboard identity | RULINGS-CP-01 face / V.A.I. | CP-01 §14.6 API key | Rulings 21 Aug; parent 26 Aug unchanged | Dashboard login |
| 8 | Account-security step | RULINGS-CP-03 / FLAG step 12 | CP-02 retrieval 11 / handoff 12 | 25 Aug spine vs 22 Aug ruling | Recovery collection |
| 9 | Trial state in parent | CP-04 `trial_approved` | CP-01 no `trial_approved` | CP-04 25 Aug; CP-01 26 Aug omit | Gate / schema |
| 10 | `settings:price_access` | RULINGS-CP-01 / MKT-CP-01 | CP-01 §1.1a omits it | Parent newer, still omits | Access product |
