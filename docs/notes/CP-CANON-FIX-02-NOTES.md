# CP-CANON-FIX-02-NOTES — 26 Aug 2026

Role: Cursor WRITES. Never decides. Installing Amendment 1 to RULINGS-CP-07.

## L-0 Item 0
Created this file. ATTACH not found on disk under `RULINGS-CP-07_AMENDMENT-1.md`. Source is the attached body in the prompt. Deposited as written there. Commit `303eb3a`.

## L-BEFORE
- HEAD: `92bc7ea7ddfb21f83f01d2605753d4e51aead94c` (required 92bc7ea or descendant).
- `git status --porcelain`: empty
- Remote: `https://github.com/VAI-ECO/chainpass-app.git` only
- `grep -n "GREEN" docs/canon/CANON-CP-01*` before UNIT 2 item 4:
  - 714: `⚠️⚠️ GREEN · YELLOW · RED`
  - 735: `| ⚠️ **GREEN** | **Match** |`
  - 1505: `| **25 Aug** | 34 | ⚠️⚠️ **§7.2 GREEN BAND RENAMED FROM PASS TO MATCH.** | Owner: the green band is Match. |`

## L-U1-01
Deposited `docs/canon/RULINGS-CP-07_AMENDMENT-1__2026-08-26_.md` from the prompt body. `cmp` silent. `wc -l` → 106. File not edited after deposit. Commit `bddaf45`.

## L-U1-02
OPERATIONS §2 Canon row now includes `RULINGS-CP-07_AMENDMENT-1` beside `RULINGS-CP-07`. Changelog #10. Commit `2b792c3`.

## L-U2-01
Parent §1 item 4: open marker / "NOT RULED BY THIS FILE" deleted. Mapping ruled 1 VAI GO · 2 VAI ACCESS · 3 VAI PRO. `grep -c "NOT RULED BY THIS FILE" docs/canon/RULINGS-CP-07*` → 0. Commit `03629d5`. Changelog #5.

## L-U2-02
Parent §2 last line deleted ("Match rename is not taken"). Rest of §2 stands. Parent `grep -c "is not taken"` → 0. Amendment file still quotes the phrase (not edited). Commit `0735465`. Changelog #6.

## L-U2-03
Parent §4 item 1: integers ruled and confirmed in place. Commit `5928d25`. Changelog #7.
BEFORE: `DOES NOT MOVE ANY INTEGER. service_level VALUES…`
AFTER: `DOES NOT MOVE ANY INTEGER. THE MAPPING 1 VAI GO · 2 VAI ACCESS · 3 VAI PRO IS RULED AND CONFIRMED IN PLACE.`

## L-U2-04
`grep -n "GREEN"` §7.2 lines 714 and 735 unchanged. Changelog #34 text unchanged; line number 1505 → 1510 because later changelog rows were inserted above it. §7.2 not edited.

## L-U3-01
§4C heading → VAI ACCESS AND VAI PRO. `grep -c "STANDARD AND PRO" docs/canon/CANON-CP-01*` → 0. Commit `1380e20`. Changelog #43.

## L-U3-02
§4C table: STANDARD → VAI ACCESS (`settings:price_vai`); PRO → VAI PRO (`settings:price_vai_pro`). Commit `539210c`. Changelog #44.

## L-U3-03
Opening line → VAI ACCESS PROVES A PERSON. VAI PRO LETS A PLATFORM DO THINGS WITH THAT PROOF. Commit `f5969af`. Changelog #45.

## L-U3-04
Report only. §4C table has no `$29` / `$99`. Keys `settings:price_vai` and `settings:price_vai_pro`. Neither changed.

## L-U4-01 / L-U4-02
Access grep across docs/, src/, supabase/: 255 hits (161 live + 94 export snapshots). Level-1 copy deleted in canon, wires, SN-04 labels, gate-shortfall display_name, comments. Integers 1/2/3 unmoved. Function name `assertAccessVaiRequirementCap` and migration filename left. Commit `c8bd6c4`. Changelog CP-01 #46.

## L-U4-03 / L-U4-04
Standard-as-level-name deleted in CP-01 §2.3 1b, §4C.1 prose, §14.1 Go-row phrase, SN-02 notes. Ordinary prose left. `price_standard` / `priceStandard` in enrol-pay.ts STOPPED (API field; rename not ruled). Commit `1c340ce`. Changelog CP-01 #47.

## L-U4-05
`settings:price_access` left at MKT-CP-01, RULINGS-CP-01 Ruling 2, SN-04 HTML, EnrolPay.tsx. Not renamed.

## L-U4-06
§16.1 LEVEL: `1 VAI Go · 2 VAI Access · 3 VAI Pro`. §14.1 table: 1 VAI GO · 2 VAI ACCESS · 3 VAI PRO.

## L-U5
No integer moved: migration CHECK `(1, 2, 3)` identical to 92bc7ea. Live `platforms.service_level`: cp03walk=3, vairify=3. Live `credentials.credential_level`: 1×3 rows, 3×1 row. No UPDATE issued.
No figure changed: `$19` unchanged in history; `$29`/`$99` appear only as quotes inside the deposited amendment. §4C table has neither.
Zip v3. Canon file count 16.
