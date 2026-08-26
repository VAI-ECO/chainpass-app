# RULINGS-CP-07 — AMENDMENT 1

**Owner ruling, 26 August 2026. The integers are ruled. The §4C heading follows from them. One error in the parent file is corrected.**

⚠️⚠️ **THIS AMENDS `RULINGS-CP-07_THE_LEVEL_NAMES__2026-08-26_.md`. IT DOES NOT REPLACE IT. THE PARENT'S §1 NAMES AND §2 REASONING STAND EXCEPT WHERE §3 BELOW CORRECTS THEM.**

---

# 1 — ⚠️⚠️ THE INTEGERS. RULED.

⚠️⚠️ **`RULINGS-CP-07` §1 ITEM 4 IS CLOSED. THE MAPPING IS RULED AND THE OPEN MARKER IS DELETED.**

| Level | Name | What it allows |
|---|---|---|
| **1** | ⚠️⚠️ **VAI GO** | ⚠️ **Entry through the front door.** |
| **2** | ⚠️⚠️ **VAI ACCESS** | ⚠️ **Entry through the front door, and verification inside.** |
| **3** | ⚠️⚠️ **VAI PRO** | ⚠️ **Everything.** |

| # | |
|---|---|
| 1 | ⚠️⚠️ **EACH LEVEL CONTAINS EVERYTHING BELOW IT.** — `CANON-CP-01` §14.1 |
| 2 | ⚠️⚠️ **THE INTEGERS DO NOT MOVE. 1, 2 AND 3 KEEP THE POSITIONS THEY ALREADY HELD.** ⚠️ **The old map was 1 Access · 2 V.A.I. · 3 Pro. The names change. Level 1 is renamed to Go, level 2 is renamed to Access, level 3 keeps Pro.** |
| 3 | ⚠️⚠️ **NO MIGRATION. NO SCHEMA CHANGE. `platforms.service_level` AND `credentials.credential_level` ARE UNTOUCHED AND EVERY GATE CHECK CONTINUES TO READ THE SAME INTEGER FOR THE SAME THING.** |
| 4 | ⚠️ **The word `Access` moves from level 1 to level 2.** ⚠️⚠️ **ANY COPY THAT CALLS LEVEL 1 "ACCESS" IS STALE AND IS DELETED. THE GREP FOR IT IS NOT OPTIONAL — THE SAME WORD NOW MEANS A DIFFERENT LEVEL.** |

---

# 2 — ⚠️⚠️ §4C. RESOLVED BY §1.

⚠️⚠️ **`CANON-CP-01` §4C IS HEADED "STANDARD AND PRO". ITS TWO ROWS ARE THE `settings:price_vai` ROW AGAINST THE `settings:price_vai_pro` ROW.**

⚠️ **`price_vai` is level 2's key. Level 2 is VAI Access.**

| | Was | Is |
|---|---|---|
| **Heading** | STANDARD AND PRO | ⚠️⚠️ **VAI ACCESS AND VAI PRO** |
| **Row 1** | STANDARD | ⚠️⚠️ **VAI ACCESS** |
| **Row 2** | PRO | ⚠️⚠️ **VAI PRO** |

⚠️⚠️ **"STANDARD" IS NOT A LEVEL NAME AND NEVER WAS ONE. EVERY OCCURRENCE OF IT AS A LEVEL NAME IS DELETED.**

⚠️ **The section's argument is unchanged: the credential level proves a person; Pro lets a platform do things with that proof.**

---

# 3 — ⚠️⚠️ CORRECTION TO THE PARENT FILE

⚠️⚠️ **`RULINGS-CP-07` §2 IS WRONG ON ONE POINT AND IS CORRECTED HERE.**

**It says:** the GREEN band keeps the meaning `Pass`, and the rename to `Match` "is not taken."

**The fact:** `CANON-CP-01` §7.2 already reads **GREEN | Match**, and changelog **#34** records the rename from PASS to MATCH. ⚠️ **The band was renamed before `RULINGS-CP-07` was written.**

| # | |
|---|---|
| 1 | ⚠️⚠️ **THE MATCH RENAME STANDS. §7.2 IS CORRECT AS IT IS AND IS NOT TOUCHED.** |
| 2 | ⚠️⚠️ **`RULINGS-CP-07` §2'S LAST LINE — "THE PROPOSAL TO RENAME THE BAND TO `MATCH` IS NOT TAKEN" — IS DELETED.** |
| 3 | ⚠️ **§2's reasoning is otherwise unchanged and correct: `Pass` was rejected as a level name because it collided with the band. Naming the level Go removed the collision. The band being called Match removes it twice over.** |
| 4 | ⚠️⚠️ **NOTHING IN §7.2 IS EDITED BY THIS AMENDMENT.** |

---

# 4 — ⚠️ WHAT THIS AMENDMENT DOES NOT DO

| # | |
|---|---|
| 1 | ⚠️⚠️ **DOES NOT MOVE AN INTEGER. NO MIGRATION.** |
| 2 | ⚠️⚠️ **DOES NOT CHANGE A PRICE, A FIGURE OR A SETTINGS KEY.** |
| 3 | ⚠️ **Does not touch Vairify's PACKAGE names — Free · Plus · Premium are unaffected.** |
| 4 | ⚠️ **Does not rule the session-key length. Canon says 32 at `CP-01` §3 item 3; the mint code and migration `20260825000004` say 30. That is code stale against a ruling, not a ruling owed.** |

---

# 5 — ⚠️ WHAT THIS CHANGES AT SOURCE

⚠️⚠️ **SUPERSEDED LINES ARE DELETED, NEVER MARKED. CHANGELOG IN THE SAME COMMIT AS EACH EDIT. ONE ITEM PER COMMIT.**

| # | Target | Change |
|---|---|---|
| 1 | `RULINGS-CP-07` §1 item 4 | Delete the ⬜ open marker. The mapping is ruled and stated in §1 above |
| 2 | `RULINGS-CP-07` §2 last line | Delete "The proposal to rename the band to `Match` is not taken. It is not needed once the level is Go." |
| 3 | `RULINGS-CP-07` §4 item 1 | Amend — the integers are ruled and confirmed in place, not left open |
| 4 | `CANON-CP-01` §4C | Heading becomes **VAI ACCESS AND VAI PRO** |
| 5 | `CANON-CP-01` §4C body | The STANDARD row becomes **VAI ACCESS**. ⚠️ **The figures in that table are a separate matter — see item 9** |
| 6 | `CANON-CP-01` §16.1 | Confirm the LEVEL row reads **1 VAI Go · 2 VAI Access · 3 VAI Pro**. Already installed |
| 7 | Every file | ⚠️⚠️ **GREP `STANDARD` USED AS A LEVEL NAME. DELETE EVERY ONE.** Do not touch "standard" used in ordinary prose |
| 8 | Every file | ⚠️⚠️ **GREP `ACCESS` USED FOR LEVEL 1. THE WORD NOW MEANS LEVEL 2. EVERY LEVEL-1 USE IS STALE** |
| 9 | ⬜ | ⚠️ **`CANON-CP-01` §4C prints `$29` and `$99` inline. Those are figures in canon against `settings:price_vai` and `settings:price_vai_pro`. REPORT BOTH ADDRESSES. CHANGE NEITHER. This amendment does not rule figures** |

---

# CHANGELOG

| Date | # | Change | Reasoning |
|---|---|---|---|
| **26 Aug** | 1 | **The integers are ruled: 1 VAI Go · 2 VAI Access · 3 VAI Pro. The open marker in `RULINGS-CP-07` §1 item 4 is deleted.** | ⚠️ **Owner ruling. Go is the front door. Access is the front door plus verification inside. Pro is everything** |
| **26 Aug** | 2 | ⚠️⚠️ **NO INTEGER MOVES. THE NAMES CHANGE IN PLACE.** | ⚠️ **`service_level` is read on every gate call. A rename is copy. A renumber is a migration and a breaking API change for every integration** |
| **26 Aug** | 3 | **§4C's heading resolves to VAI ACCESS AND VAI PRO without a separate ruling.** | ⚠️ **The STANDARD row's key is `price_vai`, which is level 2's key, and level 2 is Access. The answer followed from the integer ruling** |
| **26 Aug** | 4 | ⚠️⚠️ **`RULINGS-CP-07` §2'S "MATCH RENAME NOT TAKEN" LINE IS DELETED.** | ⚠️⚠️ **`CANON-CP-01` §7.2 ALREADY READ GREEN \| MATCH, RENAMED IN CHANGELOG #34 BEFORE `RULINGS-CP-07` WAS WRITTEN. THE PARENT FILE WAS WRITTEN FROM AN AUDIT QUOTE INSTEAD OF FROM THE SECTION. THE RENAME STANDS** |
| **26 Aug** | 5 | **The word `Access` moving from level 1 to level 2 is flagged as a grep requirement.** | ⚠️⚠️ **A RENAME THAT REUSES AN EXISTING WORD AT A DIFFERENT POSITION IS THE ONE CASE WHERE STALE COPY READS AS CORRECT. IT WILL NOT BE CAUGHT BY EYE** |

---

**Related:** `RULINGS-CP-07` · `CANON-CP-01` §4C · §7.2 · §14.1 · §16.1

**26 August 2026.**
