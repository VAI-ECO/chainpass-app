# CP-CANON-FIX-01-NOTES — 26 Aug 2026

Role: Cursor WRITES. Never decides. Installing rulings that already exist.

## L-0 Item 0
Created this file. ATTACH: `RULINGS-CP-07_THE_LEVEL_NAMES.md` found as `/Users/bmac/Downloads/RULINGS-CP-07_THE_LEVEL_NAMES.md` (duplicate `(1).md`, same SHA-256 `149cccc328613bc73581183a0b932387486ff5a6e39fdeed456a24608486c631`). Commit `befc5ec`.

## L-BEFORE
- HEAD at start: `03e2c8a98447ba637db39082d3f1aabeb19eeec4`
- `git status --porcelain`: empty
- `ls docs/canon/`: 14 files (no CP-07 yet). No `00-CANON-INDEX`.
- `grep -c "Match" docs/canon/CANON-CP-01*` before UNIT 2 item 10: **2** (GREEN band meaning; changelog #34). Must stay 2.
- `grep -c "public name is still open"`: **0** already. UNIT 2 item 3 has nothing to delete.

## L-U1-01
Deposited byte-for-byte. `cmp` silent (identical). `ls docs/canon/ | grep CP-07` → `RULINGS-CP-07_THE_LEVEL_NAMES__2026-08-26_.md`. `wc -l` → 83. File not edited. Commit `8124622`.

## L-U1-02
OPERATIONS §2 CHAINPASS Canon line now includes `RULINGS-CP-07`. Changelog #9. Index row:
`Canon     docs/canon/                 CANON-CP-01 · CANON-CP-02 · CANON-CP-04 · CANON-MI-36 · FLAG-VAIRIFY-RULINGS-CP-03 · MKT-CP-01 · OPERATIONS · RULINGS-CP-01 · RULINGS-CP-02 · RULINGS-CP-03 · RULINGS-CP-04 · RULINGS-CP-05 · RULINGS-CP-06 · RULINGS-CP-07 · SPEC-FLOW-01`
Commit `c693a2e`.

## L-U2-01
§16.1 LEVEL row BEFORE: `1 Access · 2 V.A.I. · 3 Pro` (integers 1, 2, 3). AFTER: `1 VAI Go · 2 VAI Access · 3 VAI Pro`. Integers did not move. Commit `867366b`. Changelog #35.

## L-U2-02
Deleted "LEVEL 2 IS WRITTEN 'V.A.I. PLUS'…". `grep -c "V.A.I. PLUS" docs/canon/CANON-CP-01*` → 0. Commit `8b12d9a`. Changelog #36.

## L-U2-03
STOPPED — nothing to delete. `grep -c "public name is still open"` was already 0.

## L-U2-04
§14.1 table: 1 VAI GO · 2 VAI ACCESS · 3 VAI PRO. Integers stay. Commit `5928dc9`. Changelog #37.

## L-U2-05
STOPPED. §4C heading remains `STANDARD AND PRO`. RULINGS-CP-07 names three levels and does not say which name replaces "Standard" as the pair-heading against Pro (old Standard covered door+face at `price_vai`).

## L-U2-06
§4C.1 heading AFTER: `PRO IS A PLATFORM LEVEL, NOT A CONSUMER UPGRADE`. Commit `d3915a1`. Changelog #38.

## L-U2-07
MKT-CP-01 old level names replaced. 21 Aug public-name changelog row deleted. Follow-up removed the phrase from the new changelog so `grep -c "PUBLIC NAME CLOSED"` → 0. Commits `ee05d59` · `1afdac0`.

## L-U2-08
CP-02 §0 column `V.A.I. PASS + ACCESS` → `VAI GO + VAI ACCESS`. `V.A.I. PRO` → `VAI PRO`. `grep -c "V.A.I. PASS"` on CP-02 → 0. Remaining live hit is only inside `RULINGS-CP-07` (not edited). Commits `0e30530` · `c72bff3`.

## L-U2-09
Pass-as-level-name flags deleted: CP-02 §0 flag and §5 item 6; CP-01 §14.1 flag; SPEC-FLOW-01 §12 item 7. Screens: no Pass-as-level-name (CHAIN/PASS wordmark kept). GREEN band untouched. Commit `ddb7010`.

## L-U2-10
`grep -c "Match" docs/canon/CANON-CP-01*` after UNIT 2: **2**. Unchanged. No commit.

## L-U3-01
Security layer step 12 → 11 in `RULINGS-CP-03` §7 item 3 and `FLAG-VAIRIFY-RULINGS-CP-03`. `grep -rn "step 12" docs/canon/` empty. Commit `ba42615`.

## L-U3-02
CP-01 §3 losing "Length is 30" line deleted. 32 stands. CP-02 §1 step 3 and §3 item 3 now 32. Commit `e6e9202`.
STOPPED: `supabase/functions/_shared/session-key.ts` and `supabase/migrations/20260825000004_session_key_30.sql` still say 30. Changing the CHECK is a schema change. `docs/notes/REF-CP-01_CHAINPASS_CANON_AND_FEATURES.md` still says 30-character (notes, not canon).

## L-U3-03
WIRE SN-27 Canon field BEFORE: `§7.2 · §7.1 · §7.3 (band only, never a percentage)`. AFTER: `§7.2 · §7.1 · §7.3`. Commit `3fed7a3`.

## L-U3-04
§16.2 never listed `complycube_client_id` (not present). §12 item 6 closed. §2.4 patent-gate-unmet paragraph deleted. Column already dropped by `20260821000005`. No schema change this run. Commit `0184040`. Changelog #41.

## L-U4-01
§16.2 old `agreements` block (`content_ref` · `vai_1`/`vai_2`) deleted. SPEC-CP-02 shape remains. `agreement_proofs` left. Commit `20f47f7`. Changelog #42.

## L-U4-02
List of SUPERSEDED/marked hits in `docs/canon/` at sweep, then losing lines deleted:
- SPEC-FLOW-01 §0.1 marker + Was column (Vairify screens) — deleted; current rule unmarked.
- RULINGS-CP-02 header "§1 IS SUPERSEDED" + §1 item 1 terms-at-register + pay-step paragraph + §9 register-fold row — deleted.
Left as not-losing: changelog history; `superseded_at` column; MI-36 supremacy clause; RULINGS-CP-01 dash_face_unlimited open; RULINGS-CP-07 instructions; RULINGS-CP-05 #3 vs §2.3 (UNIT 5, not decided here); CP-03 process rule "SUPERSEDED LINES ARE DELETED".
Commit `30123ff`.

## L-U5-01
`price_pro` vs `price_vai_pro` — see report UNIT 5. Live query (linked `pguwhjearlqqfworantq`): keys present `price_access`, `price_vai`, `price_vai_pro`. No `price_pro` row. Code reads `price_vai_pro`.

## L-U5-02
RULINGS-CP-05 changelog #3 vs §2.3 quoted in the report. CP-01 §16.2 `baselines` APPEND-ONLY NEVER DELETED does not settle declared-up override (different object). Same file changelog #6 already says owner ruled expiry out.

## L-U6
Re-check after units 1–4. 15 canon files. Zip `docs/notes/CP-CANON-EXPORT-20260826-v2.zip`. Match count still 2.
