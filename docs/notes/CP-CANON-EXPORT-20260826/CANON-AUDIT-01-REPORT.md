# CANON-AUDIT-01 — CHAINPASS

```
BEFORE
HEAD    8e680d058081410346cf0e228f0b864b0dfdaaf5
origin  https://github.com/VAI-ECO/chainpass-app.git (fetch/push)
branch  chainpass-fixes
status  (empty at first capture this run; later dirty only this export)
```

No canon file was edited, moved, renamed, or deleted. No missing canon was written. No conflict was resolved. Production was not queried. The other repository was not opened for this product's units.

---

# 1. THE LIST — UNIT 1

## 1.1 `docs/canon/` — 14 files

Commands: `ls -la docs/canon` · `wc -l docs/canon/*` · per-file `git log -1 --format=%ci`.

`wc -l` total: **3653**. `ls -1 docs/canon | wc -l`: **14**.

| File | Bytes | Lines | Last commit (`%ci`) |
|---|---:|---:|---|
| CANON-CP-01_CHAINPASS__v3-8-20_.md | 93362 | 1548 | 2026-08-26 05:22:02 +0700 |
| CANON-CP-02_THE_THREE_ENROLMENT_FLOWS__v2-8-25_.md | 10634 | 153 | 2026-08-25 16:13:23 +0700 |
| CANON-CP-04_TRIAL_MODE__v1-8-25_.md | 7344 | 133 | 2026-08-25 20:56:10 +0700 |
| CANON-MI-36_THE_RECOVERY_PATHS__v1-8-25_.md | 7581 | 153 | 2026-08-25 16:13:23 +0700 |
| FLAG-VAIRIFY-RULINGS-CP-03__2026-08-22_.md | 5070 | 84 | 2026-08-26 10:42:00 +0700 |
| MKT-CP-01_THE_THREE_LEVELS__v2-8-21_.md | 6380 | 118 | 2026-08-25 08:22:17 +0700 |
| OPERATIONS.md | 19347 | 356 | 2026-08-26 10:42:00 +0700 |
| RULINGS-CP-01__v1-8-21_.md | 5675 | 94 | 2026-08-22 10:40:00 +0700 |
| RULINGS-CP-02__2026-08-22_.md | 11133 | 193 | 2026-08-26 10:42:00 +0700 |
| RULINGS-CP-03__2026-08-22_.md | 5881 | 135 | 2026-08-25 12:16:52 +0700 |
| RULINGS-CP-04_THE_RESPONSE_LEVEL__2026-08-25_.md | 6316 | 98 | 2026-08-25 16:13:07 +0700 |
| RULINGS-CP-05_THE_SERVICE_STATE_CONTROL__v1-8-25_.md | 7361 | 147 | 2026-08-26 05:22:02 +0700 |
| RULINGS-CP-06_THE_RE-BASELINE_REQUEST__v1-8-25_.md | 7991 | 135 | 2026-08-25 16:13:23 +0700 |
| SPEC-FLOW-01_THE_ONLINE_FLOWS_AND_THE_STACK.md | 18854 | 306 | 2026-08-25 16:13:07 +0700 |

**There is no `00-CANON-INDEX.md`.** `find . -iname '*CANON-INDEX*'` (excluding `.git`) returned empty.

One-line subjects (from each file’s own §0 or §1) are in `MANIFEST.md`.

## 1.2 Inside version / amendment date vs last-commit date

Disagree (inside date older than `%ci`):

| File | Inside | `%ci` |
|---|---|---|
| CANON-CP-01 | Header L10 / footer L1548: Amended 20 August 2026. v3 | 2026-08-26 05:22:02 +0700 |
| OPERATIONS.md | Footer L356: Amended 20 August 2026 | 2026-08-26 10:42:00 +0700 |
| MKT-CP-01 | Footer: **20 August 2026.** | 2026-08-25 08:22:17 +0700 |
| FLAG-VAIRIFY-RULINGS-CP-03 | L76: **22 August 2026.** | 2026-08-26 10:42:00 +0700 |
| RULINGS-CP-02 | L185: Ruled 22 August 2026 | 2026-08-26 10:42:00 +0700 |
| RULINGS-CP-03 | L135 area: **22 August 2026.** | 2026-08-25 12:16:52 +0700 |
| RULINGS-CP-05 | Footer: Deposited 25 August 2026 (changelog has 26 Aug #6) | 2026-08-26 05:22:02 +0700 |

## 1.3 Canon-class files **outside** `docs/canon/`

Command: `find . \( -path ./.git -o -path ./node_modules \) -prune -o \( -iname 'CANON-*' -o -iname 'RULINGS-*' -o -iname 'SPEC-*' -o -iname 'REF-*' -o -iname 'PLAN-*' -o -iname 'FLAG-*' -o -iname 'BOOT-*' -o -iname '*OPERATIONS*' \) -print`

Outside `docs/canon/`, excluding this export’s copies and screen HTML named CANON-*:

| Path | Bytes | Lines | `%ci` |
|---|---:|---:|---|
| `docs/SPEC-CP-02_THE_CONTRACT_REGISTRY__v3-8-25_.md` | 15069 | 317 | 2026-08-25 16:13:23 +0700 |
| `docs/notes/REF-CP-01_CHAINPASS_CANON_AND_FEATURES.md` | (notes; not opened end to end) | | |
| `docs/screens/CANON-CP-01-WIRE__2026-08-21.md` | screen wire, not canon | | |
| `docs/BUILD-PASS-CP-01_PLAN__2026-08-25.md` | PLAN-class | | |
| `docs/notes/CP-RUN-01-BUILD-EXPORT/` copies of OPERATIONS / RULINGS / FLAG | notes | | |

No `BOOT-*`. `FLAG-*` lives **inside** `docs/canon/`.

These outside files were listed, not copied into the zip (UNIT 4.1 names `docs/canon/`, the index, `docs/screens/`, and this report).

## 1.4 `docs/screens/` and `design/`

```
find docs/screens -type f | wc -l
     166
ls docs/screens | wc -l
       9
ls design
ls: design: No such file or directory
```

`design/` count: **0**. Top-level screen names (9): `00-SCREEN-REGISTER.md`, `CANON-CP-01-WIRE__2026-08-21.md`, `CP-01-CLIENT-DASHBOARD__2026-08-22`, `CP-01-MASTER-DASHBOARD__2026-08-22`, `CP-01-SEPARATED-SIZES__2026-08-21`, `CP-01-SN Verification Viewer.dc.html`, `CP-01-SN-27-35_ChainPass_Client_Dashboard__20Aug.html`, `CP-01-SN-36-44_ChainPass_Master_Dashboard__20Aug.html`, `CP-01-SN_ChainPass_Enrolment_App__26_screens__20Aug.html`.

---

# 2. MISSING AND UNINDEXED — UNIT 2 items 1–2

## 2.1 Index vs listing

**`00-CANON-INDEX` is absent.** Indexed-but-absent against that file: the index itself. Present-but-unindexed against that file: all 14.

`OPERATIONS.md` §2 L124 lists the 14 files on disk. Against that list: indexed-but-absent **none**. Present-but-unindexed **none**.

Unindexed as canon (outside `docs/canon/`): `docs/SPEC-CP-02_THE_CONTRACT_REGISTRY__v3-8-25_.md`.

## 2.2 Citations whose target file or section does not exist in this repo

| Citation | From | Target |
|---|---|---|
| `00-CANON-INDEX` | UNIT 2.1 required | **no file** |
| `CANON-00` | CP-01 changelog #20; MI-36 §0; SPEC-FLOW-01; OPERATIONS; MKT; RULINGS-CP-01 | **no file** in this repo |
| `SPEC-CP-01` | `src/pages/EnrolHandoff.tsx` L86, L145; `src/pages/EnrolEntry.tsx` L132 | `find` `*SPEC-CP-01*` empty |
| `SPEC-DS-01` | `src/pages/UnruledPlate.tsx` L25; screens register | `find` `*SPEC-DS-01*` empty |
| `DESIGN-BRIEF-CP-01` | CP-02 §5 L136; SPEC-FLOW-01 L285; MI-36 L25 | **no file** |
| `BRIEF-CP-01` | CP-01 L94; SPEC-FLOW-01 L282 | **no file** |
| `REF-TIERS-01` | CP-01 L92 | **no file** |
| `CANON-CP-03` | CP-01 L10 “folded and deleted”; CP-04 numbering note | **no file** (stated deleted) |
| `CANON-MI-22`, `CANON-MI-33`, `CANON-MI-34`, `CANON-MI-35`, `CANON-SA-01`, `CANON-SA-07`, `RULINGS-VA-05`, `RULINGS-VA-03` | SPEC-FLOW-01, CP-01, FLAG, RULINGS-CP-02 L181 | **no file** in this repo |
| `CANON-MI-25` | FLAG entire | **no file** in this repo |
| `SCREEN-REGISTER-CHAINPASS` | CP-04 §6 L105 | **no file** |
| `SPEC-CP-02` §14.6 | CP-01 §14.6 L1125 | File exists at `docs/SPEC-CP-02_…` not `docs/canon/`. Section **§14.6** is a CP-01 heading, not a SPEC-CP-02 heading (SPEC-CP-02 was not read whole this run). |
| `CANON-CP-02` §2.4 as the 32-char address | CP-02 changelog L149 | Live 32-char line is CP-01 **§3 L417**, not §2.4 |
| `BLOCKER-ENROLMENT-TERMS` | CP-01 §14.3 L1068 | File exists: `docs/BLOCKER-ENROLMENT-TERMS__2026-08-22.md` (outside canon; not opened end to end) |
| `GATE-LAUNCH-01` / `docs/GATE-LAUNCH-01_TERMS_DRAFT.md` | CP-01 changelog #21; OPERATIONS §11 | File exists: `docs/GATE-LAUNCH-01_TERMS_DRAFT.md` (not opened end to end) |

Src/supabase comments whose canon **file exists**: `CANON-CP-04` (`VerifyTrial.tsx`), `RULINGS-CP-04` (`MasterPlatforms.tsx`), `CANON-CP-02` (`EnrolFinal.tsx`, enrol functions), `RULINGS-CP-05`, `RULINGS-CP-06`, `CANON-CP-01`. Missing from comments: **SPEC-CP-01**, **SPEC-DS-01** (listed above).

---

# 3. NO CHANGELOG / STALE CHANGELOG — UNIT 2 items 3–4

All 14 files have a `# CHANGELOG` heading (`rg -l '# CHANGELOG' docs/canon` returned 13 markdown names; RULINGS-CP-03 uses `# 11 — CHANGELOG`). None have zero changelog section.

Changelog has no row dated as late as last commit:

| File | Newest CL date | `%ci` |
|---|---|---|
| CANON-CP-01 | 25 Aug | 2026-08-26 05:22:02 +0700 |
| FLAG-VAIRIFY-RULINGS-CP-03 | 22 Aug 2026 | 2026-08-26 10:42:00 +0700 |
| RULINGS-CP-02 | 22 Aug 2026 | 2026-08-26 10:42:00 +0700 |
| RULINGS-CP-03 | 22 Aug | 2026-08-25 12:16:52 +0700 |
| MKT-CP-01 | 22 Aug | 2026-08-25 08:22:17 +0700 |

OPERATIONS newest CL **26 Aug**. RULINGS-CP-05 newest CL **26 Aug**. Those two match their git day.

---

# 4. EVERY UNRULED MARKER — UNIT 2 item 5

Full list in `OPEN.md`. Markers include ⬜, UNRULED, OPEN, STILL OPEN, FLAGGED, Pending owner confirm, Designed not built.

---

# 5. THE CONFLICT REGISTER — UNIT 3, whole

See `CONFLICTS.md`. The register (no RESOLUTION column):

| # | Subject | Address A + quote | Address B + quote | Which is newer | What it blocks |
|---|---|---|---|---|---|
| 1 | Session key length | CP-01 §3 L417 THIRTY-TWO | CP-01 L419 and CP-02 §1 L32 THIRTY | CP-01 git 26 Aug still holds both | Session mint / handoff |
| 2 | Enrolment step numbers | CP-01 §2 ASCII contact=8 sign=9 | CP-02 §1 contact=9 docs+match=10 | CP-01 git newer; CP-02 claims to win | Step-bound functions |
| 3 | One flow vs three | RULINGS-CP-02 §2 ONE FLOW | CP-02 §0 THREE FLOWS | CP-02 25 Aug vs rulings 22/26 | Screen count |
| 4 | Retrieval brand | RULINGS-CP-02 §5 DEFAULT CHAINPASS | CP-02 §0 VAIRIFY-branded / platform-branded | 25 Aug CP-02 | Skin |
| 5 | Terms placement | RULINGS-CP-02 §1 body AT REGISTER | RULINGS-CP-03 §1 ACCEPTANCE PAGE | CP-03 supersedes; CP-02 body still live | Register screen |
| 6 | Level names | CP-01 §14.1 ACCESS · V.A.I. · PRO | CP-02 PASS; CP-01 §16.1 V.A.I. PLUS | Flagged 25 Aug, not renamed | Copy and doors |
| 7 | Dashboard identity | RULINGS-CP-01 face / V.A.I. | CP-01 §14.6 API key | Rulings 21 Aug; parent 26 Aug unchanged | Dashboard login |
| 8 | Account-security step | RULINGS-CP-03 / FLAG step 12 | CP-02 retrieval 11 / handoff 12 | 25 Aug spine vs 22 Aug ruling | Recovery collection |
| 9 | Trial state in parent | CP-04 `trial_approved` | CP-01 no `trial_approved` | CP-04 25 Aug; CP-01 26 Aug omit | Gate / schema |
| 10 | `settings:price_access` | RULINGS-CP-01 / MKT-CP-01 | CP-01 §1.1a omits it | Parent newer, still omits | Access product |

Duplicates, self-contradictions, stale supersession, rulings-not-in-parent, vocabulary greps: `CONFLICTS.md` UNIT 3.2–3.9.

---

# 6. CANON AGAINST LIVE — UNIT 3 item 6

See `CONFLICTS.md` UNIT 3.6. `types.ts` does not list `credentials`, `baselines`, `platforms`, `service_state`, or the recovery tables named in CP-01 §2.10. Migrations name some of those tables. `POST /v1/photo-match` and `POST /v1/verify` have no matching function directories. Production was not queried.

---

# 7. OTHER-PRODUCT CONTENT — UNIT 3 items 8–9

See `CONFLICTS.md` UNIT 3.8–3.9. Named, not moved: FLAG entire file (header: Repo vairify-app); CANON-MI-36 entire; OPERATIONS §8 Free/Plus/Premium; CP-01 §16.1 PACKAGE row; CP-02 §4 WHAT VAIRIFY DOES; SPEC-FLOW-01 Vairify flows. No `price_plus` / `price_premium` / `$19.99` in the 14.

---

# 8. THE ZIP

Export directory built by COPY (not move):

```
mkdir -p docs/notes/CP-CANON-EXPORT-20260826/docs/canon docs/notes/CP-CANON-EXPORT-20260826/docs/screens
cp -R docs/canon/. docs/notes/CP-CANON-EXPORT-20260826/docs/canon/
cp -R docs/screens/. docs/notes/CP-CANON-EXPORT-20260826/docs/screens/
```

Counts before zip:

```
ls -1 docs/notes/CP-CANON-EXPORT-20260826/docs/canon | wc -l
      14
find docs/notes/CP-CANON-EXPORT-20260826/docs/screens -type f | wc -l
     166
```

Audit artifacts in the export root: `CANON-AUDIT-01-REPORT.md`, `MANIFEST.md`, `CONFLICTS.md`, `OPEN.md`.

UNIT 1 canon count: **14**.
Expected zip file count: **14 + 166 + 4 = 184**.
**THEY DO NOT MATCH UNIT 1.** Difference: **+166** (`docs/screens/` copies, UNIT 4.1) **+4** audit artifacts. No canon file omitted. `design/` is absent and was not copied. `docs/SPEC-CP-02` was not copied (outside `docs/canon/`). Other-product **canon files that already sit in this repo** (FLAG, MI-36) were copied because UNIT 4.9 forbids omitting them.

SHA-256 of the packed zip is reported in the owner-facing after-block (writing it into this file would change the hash of the next zip).

Export directory: `/Users/bmac/vai-workspaces/chainpass-app/docs/notes/CP-CANON-EXPORT-20260826/`
Zip path: `/Users/bmac/vai-workspaces/chainpass-app/docs/notes/CP-CANON-EXPORT-20260826.zip`

---

# 9. WHAT YOU DID NOT OPEN

**Opened end to end (14/14 `docs/canon/` files).** CANON-CP-01 lines 1–1548 entire.

**Counted, not read end to end:**
- `docs/screens/` — 166 files
- `design/` — absent
- `docs/SPEC-CP-02_THE_CONTRACT_REGISTRY__v3-8-25_.md` — not whole (outside canon)
- `docs/notes/REF-CP-01_CHAINPASS_CANON_AND_FEATURES.md`
- `docs/GATE-LAUNCH-01_TERMS_DRAFT.md`, `docs/BLOCKER-ENROLMENT-TERMS__2026-08-22.md`
- `docs/BUILD-PASS-CP-01_PLAN__2026-08-25.md`
- prior `docs/notes/CP-RUN-01-*` and the previous export tree
- `src/` and `supabase/` except grep hits named in this report

An empty subsection here would have meant every file in the repo was read. It does not.
