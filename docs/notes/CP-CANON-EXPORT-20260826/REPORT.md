# CANON-AUDIT-01 — chainpass-app · chainpass-fixes · 26 August 2026

THIS RUN CHANGED NO CANON. It listed, checked, reported, zipped. It resolved nothing.

```
BEFORE
HEAD     dac60ee516ddbbbfe807a20f6627a6e08535ca88
origin   https://github.com/VAI-ECO/chainpass-app.git (fetch + push)
branch   chainpass-fixes...origin/chainpass-fixes
porcelain (start)  empty
```

Product: ChainPass only. The other repository was not opened.

---

# 1 — THE LIST — UNIT 1, whole

## 1.1 — Every file in `docs/canon/`

Command: `ls -la docs/canon/` · `wc -l docs/canon/*` · per-file `git log -1 --format='%ci %h %s'`.

| bytes | lines | last-commit `%ci` | last commit | file |
|---:|---:|---|---|---|
| 93362 | 1548 | 2026-08-26 05:22:02 +0700 | `350ae7f` Delete the mandatory expiry from a declared-up override… | `CANON-CP-01_CHAINPASS__v3-8-20_.md` |
| 10634 | 153 | 2026-08-25 16:13:23 +0700 | `252956a` Date-stamp the 25 August filings… | `CANON-CP-02_THE_THREE_ENROLMENT_FLOWS__v2-8-25_.md` |
| 7344 | 133 | 2026-08-25 20:56:10 +0700 | `419accc` Deposit CANON-CP-04 under the corrected number… | `CANON-CP-04_TRIAL_MODE__v1-8-25_.md` |
| 7581 | 153 | 2026-08-25 16:13:23 +0700 | `252956a` | `CANON-MI-36_THE_RECOVERY_PATHS__v1-8-25_.md` |
| 5070 | 84 | 2026-08-26 10:42:00 +0700 | `a18cc24` Add empty changelogs… | `FLAG-VAIRIFY-RULINGS-CP-03__2026-08-22_.md` |
| 6380 | 118 | 2026-08-25 08:22:17 +0700 | `d62fc9c` Record the live face cut-over… | `MKT-CP-01_THE_THREE_LEVELS__v2-8-21_.md` |
| 19347 | 356 | 2026-08-26 10:42:00 +0700 | `8974fd1` Index ChainPass canons under the ChainPass heading… | `OPERATIONS.md` |
| 5675 | 94 | 2026-08-22 10:40:00 +0700 | `75e2bd6` 22 Aug: ten-task fix pass | `RULINGS-CP-01__v1-8-21_.md` |
| 11133 | 193 | 2026-08-26 10:42:00 +0700 | `a18cc24` | `RULINGS-CP-02__2026-08-22_.md` |
| 5881 | 135 | 2026-08-25 12:16:52 +0700 | `5975182` Copy sweep: no pronouns… | `RULINGS-CP-03__2026-08-22_.md` |
| 6316 | 98 | 2026-08-25 16:13:07 +0700 | `bfcb455` Deposit RULINGS-CP-04… | `RULINGS-CP-04_THE_RESPONSE_LEVEL__2026-08-25_.md` |
| 7361 | 147 | 2026-08-26 05:22:02 +0700 | `350ae7f` | `RULINGS-CP-05_THE_SERVICE_STATE_CONTROL__v1-8-25_.md` |
| 7991 | 135 | 2026-08-25 16:13:23 +0700 | `252956a` | `RULINGS-CP-06_THE_RE-BASELINE_REQUEST__v1-8-25_.md` |
| 18854 | 306 | 2026-08-25 16:13:07 +0700 | `bbb2a68` Deposit SPEC-FLOW-01… | `SPEC-FLOW-01_THE_ONLINE_FLOWS_AND_THE_STACK.md` |

**14 files. `00-CANON-INDEX` ABSENT** (`find … -iname '*CANON-INDEX*'` empty).

## 1.2 — Canon-class files outside `docs/canon/`

Command: `find . \( -path './.git' -o -path './node_modules' \) -prune -o \( -iname '*CANON-*' -o -iname '*RULINGS-*' -o -iname '*SPEC-*' -o -iname '*REF-*' -o -iname '*PLAN-*' -o -iname '*FLAG-*' -o -iname '*BOOT-*' -o -iname '*OPERATIONS*' \) -print` excluding `docs/canon/`.

**Originals (not prior-run copies):**

| bytes | lines | last-commit | file |
|---:|---:|---|---|
| 15069 | 317 | 2026-08-25 16:13:23 +0700 | `docs/SPEC-CP-02_THE_CONTRACT_REGISTRY__v3-8-25_.md` |
| 6504 | 130 | 2026-08-26 08:50:58 +0700 | `docs/notes/REF-CP-01_CHAINPASS_CANON_AND_FEATURES.md` |
| 22746 | 599 | 2026-08-25 08:22:02 +0700 | `docs/screens/CANON-CP-01-WIRE__2026-08-21.md` |

**Copies of canon (prior exports; not originals):** `docs/notes/CP-RUN-01-BUILD-EXPORT/{FLAG-…,OPERATIONS.md,RULINGS-CP-02…}` · `docs/notes/CP-RUN-01-EXPORT/REF-CP-01_…`.

**Filename match `CANON-*` inside screens HTML:** `docs/screens/CP-01-SEPARATED-SIZES__2026-08-21/CANON-CP-01-SN-*.html` (96 files). Counted under UNIT 1.3. **NOT OPENED** (HTML).

**PLAN-*, BOOT-*:** none outside the prune. `docs/GATE-LAUNCH-01_TERMS_DRAFT.md` and `docs/BLOCKER-ENROLMENT-TERMS__2026-08-22.md` exist but do not match the UNIT 1.2 `iname` list.

## 1.3 — `docs/screens/` and `design/`

```
ls docs/screens/          → 9 top-level
ls docs/screens/ | wc -l  → 9
find docs/screens -type f | wc -l → 166
ls design                 → No such file or directory
find design -type f       → 0
```

Top-level: `00-SCREEN-REGISTER.md` · `CANON-CP-01-WIRE__2026-08-21.md` · `CP-01-CLIENT-DASHBOARD__2026-08-22/` · `CP-01-MASTER-DASHBOARD__2026-08-22/` · `CP-01-SEPARATED-SIZES__2026-08-21/` · `CP-01-SN Verification Viewer.dc.html` · `CP-01-SN-27-35_ChainPass_Client_Dashboard__20Aug.html` · `CP-01-SN-36-44_ChainPass_Master_Dashboard__20Aug.html` · `CP-01-SN_ChainPass_Enrolment_App__26_screens__20Aug.html`.

## 1.4 — One line from each opened canon file’s §0 or §1 (not from the title)

| File | From §0 / §1 |
|---|---|
| CANON-CP-01 | §0: The GRT is a ChainPass service; token issuance as a service; Vairify is one customer; remittance at spend, 95% to the platform. |
| CANON-CP-02 | §0: Every level walks the same spine; the flows differ in exactly three places (outside the walls, documents signed, retrieval page brand). |
| CANON-CP-04 | §1: ChainPass takes the photo itself; no document, no provider, no background check; every result approves; the flow is the real flow. |
| CANON-MI-36 | §0: User. Provider. Client. Never a pronoun. |
| FLAG-VAIRIFY | Opening: `security_questions` · lockouts · attempts · options · `recovery_codes` are ChainPass’s; collected at enrolment step 12; Vairify reads lockout state and does not own the rows. |
| MKT-CP-01 | §1: Access priced at launch from `settings:price_access`; the value is held internally until announced; no figure on any surface until then. |
| OPERATIONS | §0: Guessing is not allowed; a plausible answer assembled from nothing is worse than no answer. |
| RULINGS-CP-01 | Opening: six dashboard rulings amending CANON-CP-01; append-only; everything adjustable lives in settings. |
| RULINGS-CP-02 | §1: Terms acceptance administered by ChainPass, at register, for everyone (header: superseded by RULINGS-CP-03 §1). |
| RULINGS-CP-03 | §1: Terms acceptance leaves register; it runs on the acceptance page — the page that carries the second capture. |
| RULINGS-CP-04 | §1: ChainPass offers each platform a response level; the platform chooses one (yes/no · colour · colour and percentage). |
| RULINGS-CP-05 | §1: One control per subsystem (matcher · image serve); they ship separately so they fail separately. |
| RULINGS-CP-06 | §1: A user whose face keeps failing may request a retake; it is a control the user holds. |
| SPEC-FLOW-01 | §0: Two decisions recorded so the flows can be written; §0.1 superseded 25 Aug — security layer is a ChainPass page before the handoff. |
| SPEC-CP-02 | §1: A contract on file never changes; ChainPass holds it forever; every agreement carries its own number, a stamp, and is attached to every V.A.I. that signed it. |
| REF-CP-01 | §1: Inventory of every canon file from a prior run; indexed = named in OPERATIONS.md §2. |
| 00-SCREEN-REGISTER | Opening: one canon in, one delivery out; SN column is SPEC-DS-01 §1; Screen column is the existing code, not reissued. |
| CANON-CP-01-WIRE | Opening: enrolment set SN-01…24; an element with no canon cite is flagged, never invented. |

## 1.5 — Version / amendment date inside vs last-commit date

Disagree (inside date or filename version older than last-commit, or footer older than changelog):

| File | Inside | Last-commit `%ci` |
|---|---|---|
| CANON-CP-01 | Filename `v3-8-20`. Footer: 16 August 2026. Amended 20 August 2026. v3. | 2026-08-26 05:22:02 +0700 |
| FLAG-VAIRIFY | **22 August 2026.** Changelog only 22 Aug. | 2026-08-26 10:42:00 +0700 |
| MKT-CP-01 | Footer **20 August 2026.** | 2026-08-25 08:22:17 +0700 |
| OPERATIONS | **17 August 2026.** Amended **20 August 2026.** | 2026-08-26 10:42:00 +0700 |
| RULINGS-CP-01 | **Filed 21 August 2026.** | 2026-08-22 10:40:00 +0700 |
| RULINGS-CP-02 | **Ruled 22 August 2026.** | 2026-08-26 10:42:00 +0700 |
| RULINGS-CP-03 | **22 August 2026.** | 2026-08-25 12:16:52 +0700 |
| RULINGS-CP-05 | **Deposited 25 August 2026.** | 2026-08-26 05:22:02 +0700 |

Agree (inside date on the same calendar day as last-commit): CANON-CP-02, CANON-CP-04, CANON-MI-36, RULINGS-CP-04, RULINGS-CP-06, SPEC-FLOW-01, SPEC-CP-02, REF-CP-01.

---

# 2 — MISSING AND UNINDEXED — UNIT 2 items 1–2

## 2.1 — Index vs listing

**`00-CANON-INDEX` ABSENT.** Indexed-but-absent against it: none. Present-but-unindexed against it: all 14 files in `docs/canon/` plus SPEC-CP-02 and REF-CP-01.

De facto index: `OPERATIONS.md` §2 CHAINPASS (commit `8974fd1`). Names the 14 `docs/canon/` files. **Indexed-but-absent: none. Present-but-unindexed: `docs/SPEC-CP-02_…` and `docs/notes/REF-CP-01_…`.**

## 2.2 — Citations whose target file or section does not exist in this repo

Verified: `find` for each name, prune `.git` `node_modules`. ABSENT in this repository:

| Citation (examples) | Target | Status |
|---|---|---|
| `CANON-00` (MI-36 §0, RULINGS-CP-04 §2.2 item 9, OPERATIONS naming) | file | ABSENT |
| `CANON-MI-22` `CANON-MI-24` `CANON-MI-25` `CANON-MI-27` `CANON-MI-33` `CANON-MI-34` `CANON-MI-35` | files | ABSENT |
| `CANON-SA-01` `CANON-SA-07` | files | ABSENT (`CANON-SA-07` cited as *(vairify-app)* / “Not in this repository”) |
| `CANON-CP-03` | file | ABSENT (folded; cited as deleted) |
| `RULINGS-VA-02` `RULINGS-VA-03` `RULINGS-VA-04` `RULINGS-VA-05` | files | ABSENT |
| `DESIGN-BRIEF-CP-01` `BRIEF-CP-01` | files | ABSENT |
| `REF-TIERS-01` | file | ABSENT |
| `SPEC-SEAM-01` | file | ABSENT |
| `SPEC-CP-01` | file | ABSENT (cited WIRE, screen register, `src/pages/EnrolEntry.tsx`, `EnrolHandoff.tsx`) |
| `SPEC-DS-01` | file | ABSENT (`src/pages/UnruledPlate.tsx`, register, WIRE) |
| `SCREEN-REGISTER-CHAINPASS` | file | ABSENT |
| `PLAN-DB-02` | file | ABSENT (OPERATIONS §11) |
| `RULES-02` | file | ABSENT (OPERATIONS §1) |
| `CANON-AD-01` `CANON-CM-01` | files | ABSENT (REF-CP-01 §6) |
| `docs/diagrams/` “the three diagrams” | RULINGS-CP-04 §2.3 item 11 | folder has **one** file: `FLOW-ONBOARDING.svg` |
| `CANON-CP-01` §2.4 as the 32-character line | CANON-CP-02 changelog #5 | 32-character line is **§3**, not §2.4 |
| `CANON-CP-01` §15 item 12 · line ~1041 · line ~1329 | RULINGS-CP-04 §2.1 item 2 | those line numbers no longer address the never-list (never-list is §15 ~1477; 1041 is version notice; 1329 is `response_level` schema) |
| `CANON-CP-01` §SUPPLIER OBLIGATIONS | cited as a section id | the block exists as **THREE SUPPLIER OBLIGATIONS** after the facial-stack ruling, not as `# SUPPLIER OBLIGATIONS` |

Present in this repo under other names: `BLOCKER-ENROLMENT-TERMS` → `docs/BLOCKER-ENROLMENT-TERMS__2026-08-22.md`. `GATE-LAUNCH-01` → `docs/GATE-LAUNCH-01_TERMS_DRAFT.md`.

---

# 3 — NO CHANGELOG / STALE CHANGELOG — UNIT 2 items 3–4

## 3.1 — Canon files with no changelog section

**none** of the 14 in `docs/canon/`. SPEC-CP-02 has `# CHANGELOG`. FLAG and RULINGS-CP-02 have a changelog with a filing-date row only (`a18cc24`).

## 3.2 — Changelog has no row for the most recent commit

| File | Last commit | Changelog last row |
|---|---|---|
| CANON-CP-01 | 26 Aug `350ae7f` expiry deleted | last content row **25 Aug** #34 |
| FLAG-VAIRIFY | 26 Aug `a18cc24` add empty changelog | **22 Aug 2026** #1 Filed |
| RULINGS-CP-02 | 26 Aug `a18cc24` | **22 Aug 2026** #1 Filed |
| MKT-CP-01 | 25 Aug `d62fc9c` live face cut-over / GATE flag / schema notes | last **22 Aug** |
| RULINGS-CP-03 | 25 Aug `5975182` copy sweep | **22 Aug** #1 Filed |
| CANON-CP-02, CANON-MI-36, RULINGS-CP-06 | 25 Aug `252956a` date-stamp filename | filing rows **25 Aug**, no row for the rename |
| CANON-CP-04 | 25 Aug `419accc` renumber from retired CP-03 | filing **25 Aug**; numbering note exists in body, not a changelog row for the commit |

Has a matching-date row: OPERATIONS (26 Aug #8), RULINGS-CP-05 (26 Aug #6), RULINGS-CP-01 (22 Aug), RULINGS-CP-04 / SPEC-FLOW-01 (25 Aug deposit).

---

# 4 — EVERY UNRULED MARKER — UNIT 2 item 5

Full list: `OPEN.md` in this export. Count of files with markers: CANON-CP-01, CP-02, CP-04, RULINGS-CP-01, CP-02, CP-03, CP-04, CP-05, CP-06, SPEC-FLOW-01, SPEC-CP-02, MKT-CP-01 (§5 OPEN table empty), 00-SCREEN-REGISTER, CANON-CP-01-WIRE.

---

# 5 — THE CONFLICT REGISTER — UNIT 3, whole

The register is `CONFLICTS.md` in this export, whole. No RESOLUTION column.

Summary counts: **20** different-ruling rows · **16** duplicate-coverage rows · **8** self-contradiction rows · **7** version-older-than-superseding · **7** rulings-not-in-parent · **6** canon-against-local-schema/route rows in the register (expanded in §6).

---

# 6 — CANON AGAINST LIVE — UNIT 3 item 6

Local schema and functions only. Nothing applied to hosted. `docs/chainpass-schema.sql` is an older dump (no `contracts` / `service_state` / recovery tables). Migrations under `supabase/migrations/` are the later local record.

| Canon names | Live / local | Evidence |
|---|---|---|
| `enrolment_sessions` (WIRE SN-01, SN-15; SPEC-CP-01 §6 item 4) | table does not exist | `grep enrolment_sessions supabase/migrations docs/chainpass-schema.sql` empty |
| `POST /v1/photo-match` (`CANON-CP-01` §16.5) | no function | `grep -rn photo-match src supabase --include='*.ts'` empty |
| three diagrams, drop “never a score” (`RULINGS-CP-04` §2.3 item 11) | one SVG | `ls docs/diagrams/` → `FLOW-ONBOARDING.svg` only; grep never-a-score → 0 |
| `SCREEN-REGISTER-CHAINPASS` / SN-86 (`CANON-CP-04` §4, §8) | file absent; register has no SN-86 | `find` name empty; `00-SCREEN-REGISTER.md` rows SN-01–52 |
| `credentials.complycube_client_id` NOT NULL (`CANON-CP-01` §12 item 6) | column dropped | `20260821000005_drop_complycube_client_id.sql` |
| provider-retention column absent (`CANON-CP-01` §16.2) | `credentials.next_complycube_date` claimed live | `20260823120000_provider_retention_setting.sql` |
| `platforms.response_level` (`RULINGS-CP-04` / CP-01 §16.2) | present | `20260825000003_response_level.sql` |
| `platforms.trial_mode` / `baselines.is_trial` (`CANON-CP-04`) | present | `20260825000006_trial_mark.sql` |
| `service_state` / `service_state_log` (`RULINGS-CP-05`) | present | `20260825000008_service_state.sql` |
| five registry tables (`SPEC-CP-02` §4) | present in migrations | `20260825000007_contract_registry.sql` |
| recovery five tables (`RULINGS-CP-03` §7) | present | `20260822100000_recovery_tables_chainpass.sql` |
| `identity_join_log` (`SPEC-CP-02` §7) | present | `20260825000010_identity_join_log.sql` |

Functions named in canon that exist as directories under `supabase/functions/`: `gate`, `service-state`, `rebaseline-request`, `registry`, `identity-join`, `evidence-package`, `verify` (and others). `get-business-config` exists in functions and is **not** named in `CANON-CP-01` §16.2.

---

# 7 — OTHER-PRODUCT CONTENT — UNIT 3 items 8–9

**Named. Moved nothing.** Content belonging to Vairify (or shared Vairify-subject text) sitting in this repo’s canon:

| File | Line range | What |
|---|---|---|
| OPERATIONS.md | §2 109–118 | VAIRIFY tree, `jejeywliehoxwhukphwk`, vairify schema path |
| OPERATIONS.md | §3 155–156 | `grep` into `~/vai-workspaces/vairify-app/docs/canon/` |
| OPERATIONS.md | §5.1 187–193 | typecheck command `cd ~/vai-workspaces/vairify-app` |
| OPERATIONS.md | §7 232–258 | VAIRIFY · VAIRIDATE · VAI-CHECK · VAIPULSE brand table; TruRevu; Connections retired |
| OPERATIONS.md | §8 264–274 | **THE THREE TIER LINES** FREE · PLUS · PREMIUM (Vairify packages) |
| OPERATIONS.md | §10 306–307 | canons SA-01 VAI-CHECK · SA-02 DATEGUARD · SA-04 VAIPULSE · MI-24 |
| OPERATIONS.md | §11 310–323 | GATE-LAUNCH on `vairify`; login broken; DateGuard field renames; `user_roles`; `platform_settings`; PLAN-DB-02 |
| SPEC-FLOW-01 | §0.2 36–44 | six disguise icons; `CANON-MI-24` §6.2; `RULINGS-VA-05` §15 |
| SPEC-FLOW-01 | §2.3 100 | Telnyx / DateGuard; `CANON-00` §14.1 |
| SPEC-FLOW-01 | §2.3 103–104 | Vairify Supabase `jejeywliehoxwhukphwk`; PWA `MI-35` |
| SPEC-FLOW-01 | §3 125–147 | seam diagram: DateGuard, events, feed on the Vairify side |
| SPEC-FLOW-01 | §5 167–177 | onboarding package page / install — Vairify `MI-34` `MI-35` |
| SPEC-FLOW-01 | §6–7 | `CANON-MI-22` login; `CANON-SA-01` VAI-CHECK |
| SPEC-FLOW-01 | §9 216–217 | PWA · `vairify.io` |
| SPEC-FLOW-01 | §10 items 5–7 | `settings:package_page_clock_start`; Vairify `public.settings` SELECT-only; `events` vs `vai_check_sessions` |
| SPEC-FLOW-01 | §12 items 2–3 | `BRIEF-CP-01`; `RULINGS-VA-04` §5 |
| CANON-CP-02 | §0 table, §4, §4.1 | VAIRIFY FLOW; **WHAT VAIRIFY DOES** / **NEVER DOES** |
| CANON-MI-36 | §2 steps 6–7 | Vairify renders the outage; stores nothing |
| FLAG-VAIRIFY entire 1–84 | Vairify canon MI-25 / MI-33 vs RULINGS-CP-03; Vairify migrations and pages | Header: **Repo: `vairify-app` · do not edit from `chainpass-app`.** |
| RULINGS-CP-04 | §2.2 | amendments to `CANON-MI-22` `CANON-SA-01` `CANON-00` |
| CANON-CP-01 | §0 | GRT; source `RULINGS-VA-03`; Vairify as customer |
| CANON-CP-01 | §4D appeal | **APPEAL GOES TO THE COUNCIL** (Council is Vairify’s in OPERATIONS §6 item 4) |
| REF-CP-01 | §6 | CANON-AD-01 / CANON-CM-01 belonging |

**UNIT 3 item 9 — price figures belonging to the other product**

`grep` `$[0-9]` / `price_plus` / `price_premium` / `package_` in `docs/canon`:

- No Vairify package dollar figure in `docs/canon/`.
- `CANON-CP-01` line 94: **`$99`** quoted from `BRIEF-CP-01` as **STALE** (ChainPass credential, not a Vairify package price).
- `CANON-CP-01` §4 item 2a: **about $0.15 a check** (Offenders.io / background check — ChainPass picker).
- `MKT-CP-01` changelog: **$19 working number deleted** (Access, ChainPass).
- `SPEC-FLOW-01` line 259: `settings:package_page_clock_start` — a Vairify **setting name**, not a price figure.
- `OPERATIONS.md` §6 item 1: **CHAINPASS AND VAIRIFY PRICE FIGURES NEVER APPEAR IN THE SAME FILE.** Item 2: Vairify package keys must never appear in this repo.

---

# 8 — THE ZIP

Directory: `docs/notes/CP-CANON-EXPORT-20260826/` (copy, not move). `ls` top: CONFLICTS.md · MANIFEST.md · OPEN.md · REF-CP-01_… · REPORT.md · SPEC-CP-02_… · canon/ · screens/.

`find …/canon -type f | wc -l` → **14**. `find …/screens -type f | wc -l` → **166**. `find … -type f | wc -l` → **186**.

Zip command: `cd docs/notes && zip -r CP-CANON-EXPORT-20260826.zip CP-CANON-EXPORT-20260826`

`unzip -l` footer: **196** entries (186 regular files + 10 directory records).

**UNIT 1 vs zip (THEY DO NOT MATCH):**

| Count | Number |
|---|---:|
| UNIT 1.1 `docs/canon/` | 14 |
| UNIT 1.3 `docs/screens/` files | 166 |
| UNIT 1.1 + 1.3 | **180** |
| Zip regular files | **186** |

Difference of **+6** named: `SPEC-CP-02_THE_CONTRACT_REGISTRY__v3-8-25_.md` (UNIT 1.2) · `REF-CP-01_CHAINPASS_CANON_AND_FEATURES.md` (UNIT 1.2) · `REPORT.md` · `MANIFEST.md` · `CONFLICTS.md` · `OPEN.md`.

Not in the zip: `00-CANON-INDEX` (ABSENT). Prior-run copies under `docs/notes/CP-RUN-01-*` omitted as duplicates, not as judgement that they are wrong.

SHA-256 of the zip on disk is taken after this report is packed (re-zip). Path: `/Users/bmac/vai-workspaces/chainpass-app/docs/notes/CP-CANON-EXPORT-20260826.zip`

---

# 9 — WHAT YOU DID NOT OPEN

Canon markdown in `docs/canon/` (14): opened end to end (CANON-CP-01 in four ranges covering lines 1–1548).

SPEC-CP-02: opened 1–317. REF-CP-01: opened 1–130. OPERATIONS included in the 14. 00-SCREEN-REGISTER: opened 1–210. CANON-CP-01-WIRE: opened 1–599.

**NOT OPENED — never described beyond path and count:**

- All `docs/screens/**/*.html` (including three dumps 351–459 KB and `CP-01-SN Verification Viewer.dc.html`)
- `docs/screens/CP-01-CLIENT-DASHBOARD__2026-08-22/CP-01-CLIENT-WIRE__2026-08-22.md`
- `docs/screens/CP-01-MASTER-DASHBOARD__2026-08-22/CP-01-MASTER-WIRE__2026-08-22.md`
- `docs/screens/CP-01-CLIENT-DASHBOARD__2026-08-22/REGISTER-ROWS.md`
- `docs/screens/CP-01-MASTER-DASHBOARD__2026-08-22/REGISTER-ROWS.md`
- `docs/screens/CP-01-SEPARATED-SIZES__2026-08-21/REGISTER-SIZE-ROWS.md`
- `docs/screens/CP-01-CLIENT-DASHBOARD__2026-08-22/CP-01-ASSETS/README.md`
- `docs/screens/CP-01-MASTER-DASHBOARD__2026-08-22/CP-01-ASSETS/README.md`
- `docs/diagrams/FLOW-ONBOARDING.svg`
- Prior-run copies under `docs/notes/CP-RUN-01-*`
- `src/` and `supabase/` except grep hits named above (not canon files)
- `docs/GATE-LAUNCH-01_TERMS_DRAFT.md` and `docs/BLOCKER-ENROLMENT-TERMS__2026-08-22.md` (cited; not opened this run)
- The other product’s repository

---

# UNIT 4 — copy / zip / hash (commands follow in the session log)
