# CONFLICTS.md — THE CONFLICT REGISTER

CANON-AUDIT-01 · chainpass-app · chainpass-fixes · 26 August 2026.

No RESOLUTION column. Both addresses, both quotes, no winner.

HEAD at audit start: `dac60ee516ddbbbfe807a20f6627a6e08535ca88`.

---

## UNIT 3 item 1 — Two files ruling the same subject differently

| # | Subject | Address A + quote | Address B + quote | Which is newer | What it blocks |
|---|---|---|---|---|---|
| 1 | Session-key length | `CANON-CP-01` §3 line 417: **THIRTY-TWO CHARACTERS. ALPHANUMERIC.** **Owner ruling, 25 August.** | `CANON-CP-02` §1 step 3: **ChainPass creates a 30-character alphanumeric session key.** Changelog #5: Session key length is **30**. | B: deposited 25 Aug 16:13 (`252956a`). A last-commit 26 Aug 05:22 but the 32-character line is still in the body. Same-file A also says Length is 30 at line 419. | Enrolment mint, schema check `session_key_30`, any remaining 32-char copy. |
| 2 | Where terms are accepted | `RULINGS-CP-02` §1 item 1: **TERMS ACCEPTANCE MOVES TO THE REGISTER STEP — USERNAME · EMAIL AND/OR PHONE · TERMS. ONE PAGE.** | `RULINGS-CP-03` §1 item 1: **TERMS ACCEPTANCE LEAVES REGISTER. IT RUNS ON THE ACCEPTANCE PAGE — THE PAGE THAT CARRIES THE SECOND CAPTURE.** Header of A says §1 is superseded by B. The superseded ruling is still the body of A. | Same calendar day 22 Aug. B filed after A (A header: superseded by CP-03 §1). | Enrolment screen order; SN-06 vs SN-51. |
| 3 | One flow vs three flows | `RULINGS-CP-02` §2 item 1: **ONE ENROLMENT FLOW. ONE CREDENTIAL. THE LEVEL DOES NOT CHANGE HOW THE MEMBER ENROLS.** Item 6: **DO NOT BUILD SEPARATE FLOWS FOR ACCESS, V.A.I. AND PRO.** | `CANON-CP-02` §0: **Every level walks the same spine. The flows differ in exactly three places.** Table: VAIRIFY FLOW · V.A.I. PRO · V.A.I. PASS + ACCESS. | B 25 Aug. A 22 Aug (last commit 26 Aug is empty changelog only). | Whether outside-the-walls, documents, and retrieval brand are three builds or one spine with switches. |
| 4 | Enrolment branding | `RULINGS-CP-02` §5 item 1: **DEFAULT IS CHAINPASS. EVERY SCREEN, EVERY LEVEL.** Item 3: **ACCESS AND V.A.I. STAY CHAINPASS-BRANDED.** | `CANON-CP-02` §0 row 3: retrieval **VAIRIFY-branded** / **platform-branded**. §5 item 5: **BRANDING AT THE BOUNDARY IS CLOSED: PLATFORM-BRANDED CHAINPASS PAGES.** | B 25 Aug. | Skin setting, LE exception, SN-01 Gate "branding unruled". |
| 5 | Last ChainPass screen | `RULINGS-CP-02` §4 item 3: **THE RECOVERY-CONTACT SCREEN IS THE LAST CHAINPASS SCREEN. THE MEMBER CONTINUES, AND THE PLATFORM BEGINS.** | `CANON-CP-02` §1 steps 11, 11a, 12, 13: retrieval, remember-on-device, handoff, key delete all still ChainPass after security. | B 25 Aug. | SN-52 "Last ChainPass screen" (WIRE line 280) vs 11a. |
| 6 | Account-security step number | `RULINGS-CP-03` §7 item 3: **Collected at enrolment step 12 (account security).** `FLAG-VAIRIFY-RULINGS-CP-03` line 8: **Collected at enrolment step 12.** | `CANON-CP-02` §1 step 11: retrieval page. `CANON-CP-01` §2.10 item 2: **STEP 11 IS THE RETRIEVAL PAGE.** `CANON-CP-01` §2.3 item 4: questions **AT STEP 12 — §2.10** (same file, two step numbers). | CP-02 25 Aug vs CP-03/FLAG 22 Aug. CP-01 last-commit 26 Aug still carries both 11 and 12. | Handoff vs security order; FLAG vs CP-02. |
| 7 | Level names | `CANON-CP-01` §14.1: **1 Access · 2 V.A.I. · 3 Pro.** | `CANON-CP-02` §0 column **V.A.I. PASS + ACCESS**. Both files flag the clash; neither renames. | Both 25 Aug. | MKT copy, SN-50, vocabulary. |
| 8 | `vec.chainpass.io` | `SPEC-FLOW-01` §2.2: **NXDOMAIN AT FILING. TRAEFIK IS ALREADY LISTENING FOR THAT HOST.** | `OPERATIONS.md` changelog 25 Aug #5: **LIVE FACE SERVICE WIRED.** `vec.chainpass.io` serves `vai-face-embed` over HTTPS. `00-SCREEN-REGISTER` 22 Aug: vec does not resolve; 25 Aug: LIVE FACE CUT-OVER. | OPERATIONS/register 25 Aug later than SPEC-FLOW-01 filing the same day (SPEC-FLOW last-commit 16:13; OPERATIONS live-cutover changelog dated 25 Aug; OPERATIONS last-commit 26 Aug). | Treating NXDOMAIN as current. |
| 9 | Patent-gate column | `CANON-CP-01` §2.4 / §12 item 6: **CHAINPASS STILL HOLDS `credentials.complycube_client_id`, NOT NULL, READ AFTER ENROLMENT BY FOUR FUNCTIONS.** | `supabase/migrations/20260821000005_drop_complycube_client_id.sql`: **DROP COLUMN IF EXISTS complycube_client_id.** | Migration dated 21 Aug; canon line still present in 26 Aug file. | Whether the patent gate is unmet in prose or dropped in schema. |
| 10 | Provider-retention column | `CANON-CP-01` §16.2: ⬜ **§10.3's provider-retention column is absent from this schema and must be added.** | `supabase/migrations/20260823120000_provider_retention_setting.sql`: **§10.3 — provider retention is credentials.next_complycube_date (already live).** | Migration 23 Aug; canon 16.2 still says absent (file last-commit 26 Aug). | Renewal two-date test build. |
| 11 | PAY step number | `00-SCREEN-REGISTER.md` flag 5: **§2 puts PAY at step 3, §4A.2 starts the deferral clock at step 6.** WIRE SN-04: **§2 puts PAY at step 3.** | `CANON-CP-02` §1 step 2: **PAY.** `CANON-CP-01` §2 block step 2: **PAY.** | Canon 25 Aug. Register/WIRE 21–25 Aug still cite step 3. | Enrolment app order vs register flags. |
| 12 | Branding closed vs unruled | `00-SCREEN-REGISTER.md` flag 7: **Branding — ChainPass mark or skinned per platform** ⬜ unruled. | `CANON-CP-02` §5 item 5: branding at the boundary is **closed**. | CP-02 25 Aug. Register last-commit 25 Aug 12:14 (flags 9–12 deleted; flag 7 remains). | Design vs canon. |
| 13 | Percentage on the viewer | `CANON-CP-01-WIRE` SN-27: **§7.2 · §7.1 · §7.3 (band only, never a percentage).** | `RULINGS-CP-04` §1 level 3: **A colour and a percentage.** `CANON-CP-01` §7.3: **THE PERCENTAGE LEAVES WHEN THE PLATFORM'S RESPONSE LEVEL PERMITS IT.** | RULINGS-CP-04 25 Aug. WIRE 21 Aug (last-commit 25 Aug 08:22). | SN-27 / trial viewer vs response_level 3. |
| 14 | PLUS as a ChainPass gate | `RULINGS-CP-02` §2 item 4: **A PLUS-ONLY PLATFORM REJECTS AN ACCESS HOLDER AT ITS OWN DOOR — EVERY YES/NO FOR THAT PLATFORM IS SET TO PLUS.** | `CANON-CP-01` §16.1: **BARE "PLUS" IS VAIRIFY'S PACKAGE AND NEVER CHAINPASS'S.** `RULINGS-CP-01` Ruling 5: **bare "Plus" never appears on a ChainPass surface.** | Vocabulary map 20–21 Aug vs RULINGS-CP-02 22 Aug still using PLUS for a ChainPass door. | Copy and gate switches. |
| 15 | TIER vs LEVEL for Pro | `CANON-CP-01` §4C.1: **PRO IS A PLATFORM TIER, NOT A CONSUMER UPGRADE.** | `CANON-CP-01` §16.1: word **LEVEL** belongs to **CHAINPASS** (1 Access · 2 V.A.I. · 3 Pro). **PACKAGE** belongs to Vairify. TIER is not in the map. Same file. | §16 folded 20 Aug; §4C.1 heading still "TIER". | Vocabulary sweep. |
| 16 | Index of canons | `REF-CP-01` §1: CANON-CP-02, CP-04, MI-36, FLAG, RULINGS-CP-04/05/06, SPEC-FLOW-01 **indexed = no**. | `OPERATIONS.md` §2 CHAINPASS: those files **listed**. | OPERATIONS commit `8974fd1` 26 Aug 10:42. REF commit `edc7da6` 26 Aug 08:50. | Anyone using REF as the index. |
| 17 | Trial viewer screen id | `CANON-CP-04` §4: **`SN-86`. A separate screen from `SN-25`–`SN-32`.** §8 item 4: `SCREEN-REGISTER-CHAINPASS` gains SN-86. | `00-SCREEN-REGISTER.md`: no SN-86 row. File `SCREEN-REGISTER-CHAINPASS` ABSENT (`find` for that name empty). | CP-04 25 Aug 20:56. Register 25 Aug 12:14. | Trial chrome; SN numbering. |
| 18 | Price setting key on pay screen | WIRE SN-04: **`settings:price_vai` · `settings:price_pro`.** | `CANON-CP-01` §1.1a / `MKT-CP-01`: **`settings:price_vai_pro`.** | Canon 20–22 Aug. WIRE 21 Aug. | Pay screen read. |
| 19 | Agreements table shape | `CANON-CP-01` §16.2 first `agreements` block: **id · platform_id · type (single\|dual) · vai_1 · vai_2 · content_ref.** | Same section, second `agreements` block: **agreement_id (AG-<26 chars>) · contract_id · outcome (agreed\|declined\|expired)** per `SPEC-CP-02` §4.2. | SPEC-CP-02 v3 25 Aug. Both blocks still in CP-01. | Schema, registry functions. |
| 20 | RULINGS-CP-02 §9 still records terms at register as folded into canon | `RULINGS-CP-02` §9: `CANON-CP-01` §2, §14.3 **Terms acceptance at register, universal — ruling 1.** | `CANON-CP-01` §14.3 item 2: **AT ENROLMENT, TERMS ARE ACCEPTED ON THE ACCEPTANCE PAGE — STEP 8.** | CP-01 changelog #23 22 Aug folded CP-03 (acceptance). CP-02 §9 unamended. | Reading CP-02 §9 as current. |

---

## UNIT 3 item 2 — Duplicate coverage (same subject, same way). DO NOT MERGE.

| # | Subject | Address A | Address B |
|---|---|---|---|
| 1 | Thirteen-step spine | `CANON-CP-02` §1 | `CANON-CP-01` §2 block ("THIS BLOCK IS CANON-CP-02 §1") |
| 2 | Two-frame baseline | `RULINGS-CP-03` §2 | `CANON-CP-01` §2.7 |
| 3 | Recovery tables on ChainPass | `RULINGS-CP-03` §7 | `CANON-CP-01` §2.10 |
| 4 | Three response shapes | `RULINGS-CP-04` §1 | `CANON-CP-01` §7.1–§7.3 · §14.6 |
| 5 | Shortfall is a list and a route | `CANON-CP-01` §11.2 | `RULINGS-CP-03` §5 · `RULINGS-CP-02` §7 |
| 6 | Access/V.A.I. cap 3, Pro uncapped | `RULINGS-CP-03` §3 | `CANON-CP-01` §4C.3 · §1.1a item 5 |
| 7 | Courier rule | `CANON-CP-01` §2.9 | `SPEC-FLOW-01` §3 · `CANON-CP-04` §6 item 1 |
| 8 | Pronoun rule | `CANON-MI-36` §0 | `CANON-CP-04` §6 item 4 |
| 9 | Access price in settings, unpublished | `RULINGS-CP-01` Ruling 2 | `MKT-CP-01` §1 |
| 10 | Level 2 public name V.A.I. | `RULINGS-CP-01` Ruling 5 | `CANON-CP-01` §14.1 · §16.1 · `MKT-CP-01` §2 |
| 11 | User-requested re-baseline always provider | `RULINGS-CP-06` §2 | `CANON-CP-01` §9.1 item 5 · §10.2 |
| 12 | Service-state control | `RULINGS-CP-06` wait: `RULINGS-CP-05` | `CANON-CP-01` supplier obligation 1 · §16.2 `service_state` |
| 13 | Contract registry five tables | `SPEC-CP-02` §4 | `CANON-CP-01` §14.2 · §16.2 (second agreements block) |
| 14 | One enrolment flow / level is a gate | `RULINGS-CP-02` §2 | `CANON-CP-01` §1.1a · §14.1 |
| 15 | LE declaration always ChainPass-branded | `RULINGS-CP-02` §5.1 | `CANON-CP-01` §4D.0 |
| 16 | Trial `trial_approved` not a band | `CANON-CP-04` §2 | `SPEC-FLOW-01` trial notes in REF; `CANON-CP-01` §7.2 amendment named in CP-04 §8 |

---

## UNIT 3 item 3 — One file contradicting itself

| # | Subject | Address A + quote | Address B + quote | Which is newer | What it blocks |
|---|---|---|---|---|---|
| 1 | Session-key length inside CP-01 | §3 line 417: **THIRTY-TWO CHARACTERS.** | §3 line 419: **Length is not open. Length is 30.** Changelog #28: length is 32. Changelog #33: length 30. | #33 and line 419 are the later 25 Aug fold; line 417 and #28 remain. | Same as register row 1. |
| 2 | Two `agreements` schemas | §16.2 first `agreements` (vai_1 / vai_2 / content_ref) | §16.2 second `agreements` (SPEC-CP-02 shape) | Second block is the 25 Aug fold; first block not deleted. | Registry build. |
| 3 | Security step 11 vs 12 in CP-01 | §2.10 item 2: **STEP 11 IS THE RETRIEVAL PAGE.** | §2.3 item 4: questions **AT STEP 12 — §2.10.** | Both present after 25 Aug sequence replace. | Enrolment implementation. |
| 4 | RULINGS-CP-02 live ruling vs superseded stamp | Header: **§1 (TERMS AT REGISTER) IS SUPERSEDED BY RULINGS-CP-03 §1.** | §1 body still commands terms at register. §9 still says folded into canon at register. | Header and CP-03 are later the same day. | Anyone reading §1 without the header. |
| 5 | RULINGS-CP-05 expiry | Changelog 25 Aug #3: **a declared-up override must carry a reason and an expiry, and cannot be set to never.** | §2.3 (after 26 Aug #6): **Override is persistent. It clears when the probe agrees.** | 26 Aug commit `350ae7f`. Changelog #3 left in place as history. | Operators reading changelog #3 as current. |
| 6 | Screen register SN-06 name | Line 16: **CP07 Register · contact** | Line 103: **CP07 Register · username** | Same file 22 Aug SN-06 contact citation vs per-size row username. | Collection spec vs username mandate. |
| 7 | CP-01 footer vs changelog | Footer line 1548: **Amended 20 August 2026. v3.** Filename `v3-8-20`. | Changelog rows through **25 Aug** #34. | Changelog newer than footer/filename. | Version identity on deposit. |
| 8 | OPERATIONS footer vs changelog | Line 327: **17 August 2026.** Line 356: **Amended 20 August 2026.** | Changelog through **26 Aug** #8. | Changelog newer. | Same. |

---

## UNIT 3 item 4 — Stated version/date older than a file it supersedes

| File | Stated inside | Supersedes / is superseded by | Newer file date |
|---|---|---|---|
| `CANON-CP-01` filename `v3-8-20`, footer 20 Aug | `CANON-CP-02` deposited 25 Aug governs §2 | CP-02 is later; CP-01 filename/footer older than the file that supersedes its sequence. |
| `MKT-CP-01` footer **20 August 2026.** | Own changelog 22 Aug (banned words, settings pointers) | Footer older than own amendment. |
| `OPERATIONS.md` **Amended 20 August 2026.** | Own changelog 26 Aug §2 index | Footer older than own amendment. |
| `RULINGS-CP-02` **Ruled 22 August 2026.** | `RULINGS-CP-03` same day supersedes §1; `CANON-CP-02` 25 Aug supersedes enrolment branding/last-screen | Parent-body older than later folds. |
| `REF-CP-01` Built 26 Aug 08:50 | `OPERATIONS.md` §2 index 26 Aug 10:42 lists files REF still marks unindexed | REF older than the index it describes. |
| `RULINGS-CP-05` **Deposited 25 August 2026.** | Own changelog **26 Aug** #6 (expiry deleted) | Deposit line older than last amendment. |
| `FLAG-VAIRIFY` **22 August 2026.** | Last commit 26 Aug `a18cc24` (empty changelog) | Inside date older than last commit. |

---

## UNIT 3 item 5 — RULINGS line the parent canon does not carry

| Ruling | Address | Parent | What parent lacks |
|---|---|---|---|
| Dashboard passwords free / face optional and priced | `RULINGS-CP-01` Ruling 1a including `settings:dash_face_seat_1` / `_pack` / `_over_10` / `_unlimited` ⬜ | `CANON-CP-01` §14.6 rule 3: **Client staff identity is the platform's problem. The API key is the identity ChainPass knows.** No seat table. | Seat keys and password-default. |
| Reviewer outcome | `RULINGS-CP-01` Ruling 6 OPEN | `CANON-CP-01` failures column names the gap ("FRAUD FOUND HAS NOWHERE TO GO") but does not carry a destination. | Same open; ruling exists only in RULINGS. |
| OTP Android app-hash / email magic link | `RULINGS-CP-02` §6 items 2–6 | `CANON-CP-01` §2.10 item 3 one-line + ⬜ unruled | Android hash per build, email ⬜. |
| Baseline merge algorithm | `RULINGS-CP-03` §10 item 1 | `CANON-CP-01` §2.7 two frames, no merge algorithm | Algorithm. |
| Which response level Vairify runs | `RULINGS-CP-04` §4 item 1 | `CANON-CP-01` does not name Vairify's level | Owner ruling missing in parent. |
| Outage notify vs poll | `RULINGS-CP-05` §7 item 2 | `CANON-CP-01` supplier obligations: one endpoint, platform reads | Push vs poll. |
| User pays for requested re-baseline | `RULINGS-CP-06` §4 item 4 / §7 item 1 | `CANON-CP-01` §9.1 item 5 ⬜ only | Payment. |

---

## UNIT 3 item 6 — Canon against live (local schema/routes/functions). REPORT. CHANGE NOTHING.

See REPORT section 6. Register rows:

| # | Subject | Address A + quote | Address B + quote | Which is newer | What it blocks |
|---|---|---|---|---|---|
| L1 | `enrolment_sessions` | WIRE SN-01 / SN-15: creates 🔴 `enrolment_sessions` — no migration creates this table. | `grep enrolment_sessions supabase/migrations docs/chainpass-schema.sql` → empty. | WIRE 21 Aug; schema still absent. | Enrolment cookie recovery. |
| L2 | `POST /v1/photo-match` | `CANON-CP-01` §16.5: endpoint ≥ 2, static image vs baseline. ⬜ Pending owner confirm. | `grep -rn photo-match src supabase --include='*.ts'` → empty. | Canon 20 Aug; function never added. | In-session photo-match. |
| L3 | Three diagrams | `RULINGS-CP-04` §2.3 item 11: **The three diagrams** · `grep -c "never a score\|never a number" docs/diagrams/` → 0 | `ls docs/diagrams/` → only `FLOW-ONBOARDING.svg`. | Ruling 25 Aug; diagrams folder has one file. | Verify instruction. |
| L4 | `SCREEN-REGISTER-CHAINPASS` | `CANON-CP-04` §8 item 4 | `find` that name → ABSENT. Present: `docs/screens/00-SCREEN-REGISTER.md` | CP-04 25 Aug. | SN-86 filing. |
| L5 | `complycube_client_id` | Canon §12 item 6 still names the column NOT NULL | Migration `20260821000005_drop_complycube_client_id.sql` drops it | Schema 21 Aug vs canon text still in 26 Aug file. | Patent-gate status. |
| L6 | Provider retention | Canon §16.2 says column absent | Migration `20260823120000_provider_retention_setting.sql` says `credentials.next_complycube_date` already live | 23 Aug vs canon 16.2. | Two-date test. |

---

## UNIT 3 item 7 — Vocabulary greps (output pasted)

Commands run from repo root, `docs/canon` unless noted.

**blockchain** (`docs/canon` `src` `supabase`, exclude `.git` `node_modules` `dist`): count **0**.

**groundbreaking:**
```
docs/canon/OPERATIONS.md:260:⚠️ **Banned: groundbreaking · innovative · "matters."**
docs/canon/MKT-CP-01_THE_THREE_LEVELS__v2-8-21_.md:93:| 3 | ⚠️ **The banned list applies: no groundbreaking, innovative, "matters."** |
```

**revolutionary:** no matches in `docs/canon`.

**innovative:** same two lines as groundbreaking.

**matters:**
```
docs/canon/OPERATIONS.md:260:⚠️ **Banned: groundbreaking · innovative · "matters."**
docs/canon/RULINGS-CP-02__2026-08-22_.md:122:... which matters here because the member is mid-enrolment ...
docs/canon/CANON-CP-01_CHAINPASS__v3-8-20_.md:231:⚠️⚠️ **§12 ITEM 6 IS THE OPEN THAT MATTERS HERE. CHAINPASS STILL HOLDS
docs/canon/CANON-CP-01_CHAINPASS__v3-8-20_.md:726:## 7.1 — ⚠️ The distinction that matters
docs/canon/MKT-CP-01_THE_THREE_LEVELS__v2-8-21_.md:93:| 3 | ⚠️ **The banned list applies: no groundbreaking, innovative, "matters."** |
```

**affiliate:**
```
docs/canon/OPERATIONS.md:256:| ⚠️ **Revenue sharing** | ⚠️⚠️ **AFFILIATE — BANNED PROJECT-WIDE** |
docs/canon/CANON-CP-01_CHAINPASS__v3-8-20_.md:637:| 1 | ⚠️ **The member states whether the member is affiliated with law enforcement.** |
```

**discount:**
```
docs/canon/CANON-CP-01_CHAINPASS__v3-8-20_.md:94:⚠️⚠️ **`BRIEF-CP-01`'s "$99 every holder, no tiers and no discounts" IS STALE.**
```

**TrueRevu:** no matches in `docs/canon`.

**TruRevu:**
```
docs/canon/OPERATIONS.md:253:| **TruRevu** | **wrong-capital product name** |
```

**chainpass.id:** `grep -rn chainpass.id docs/canon src supabase` → empty.

**Gendered pronouns** `grep -rniE '\b(he|him|his|she|her|hers)\b' docs/canon --include='*.md'` → empty.

PACKAGE / TIER / LEVEL: see register rows 14–15. `OPERATIONS.md` §8 headings **THE THREE TIER LINES** with FREE / PLUS / PREMIUM (Vairify packages). `RULINGS-CP-04` uses **LEVEL** for response shapes (1/2/3), colliding with credential LEVEL 1/2/3.

---

## UNIT 3 items 8–9 — Other-product content and prices

Named, not moved. Line ranges in REPORT section 7.
