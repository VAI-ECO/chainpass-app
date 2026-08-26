# RULINGS-CP-07 — THE LEVEL NAMES

**Owner ruling, 26 August 2026. The three ChainPass levels are named. The `Pass` collision is closed.**

⚠️⚠️ **THE OWNER'S SPOKEN INSTRUCTION OUTRANKS EVERY DOCUMENT BELOW. WHERE A CANON DISAGREES WITH THIS FILE, THE CANON IS STALE AND IS AMENDED, NOT THIS FILE.**

---

# 1 — THE RULING

⚠️⚠️ **CHAINPASS IS THE COMPANY. IT IS NEVER A LEVEL NAME.**

| Level | Short name | Full name |
|---|---|---|
| | ⚠️⚠️ **VAI GO** | **ChainPass VAI Go** |
| | ⚠️⚠️ **VAI ACCESS** | **ChainPass VAI Access** |
| | ⚠️⚠️ **VAI PRO** | **ChainPass VAI Pro** |

| # | |
|---|---|
| 1 | ⚠️⚠️ **MARKETING USES THE SHORT FORM: VAI GO · VAI ACCESS · VAI PRO.** |
| 2 | ⚠️⚠️ **THE LEVEL IS ALWAYS WRITTEN IN FULL. BARE "GO", BARE "ACCESS" AND BARE "PRO" ARE NEVER A LEVEL NAME.** ⚠️ **Same rule that already forbids bare "Plus" for Vairify's package.** |
| 3 | ⚠️ **VAI is always capital, per `OPERATIONS` §7.1.** |
| 4 | ⚠️⚠️ **THE INTEGER MAPPING IS RULED: 1 VAI GO · 2 VAI ACCESS · 3 VAI PRO.** ⚠️ **`CANON-CP-01` §16.1 maps those names onto `platforms.service_level (1|2|3)` and every gate check reads those integers. THE NAMES ARE RULED. THE NUMBERS DO NOT MOVE.** |

---

# 2 — ⚠️⚠️ WHY "PASS" WAS NOT USED

⚠️⚠️ **`PASS` IS ALREADY THE MEANING OF THE GREEN BAND — `CANON-CP-01` §7.2.**

⚠️ **A level called Pass and a result called Pass are one word with two meanings on one product. "Pass failed" is not a sentence anyone can act on.**

⚠️⚠️ **THE BAND KEEPS ITS MEANING. THE LEVEL IS NAMED GO. NOTHING IS RENAMED IN §7.2.**

⚠️ **The proposal to rename the band to `Match` is not taken. It is not needed once the level is Go.**

---

# 3 — WHAT THIS CHANGES AT SOURCE

⚠️⚠️ **SUPERSEDED LINES ARE DELETED, NEVER MARKED. CHANGELOG IN THE SAME COMMIT AS EACH EDIT.**

| # | Target | Change |
|---|---|---|
| 1 | `CANON-CP-01` §16.1 | The LEVEL row's values become **VAI Go · VAI Access · VAI Pro**. The integer mapping is ruled: 1 VAI Go · 2 VAI Access · 3 VAI Pro |
| 2 | `CANON-CP-01` §16.1 | ⚠️⚠️ **DELETE** — "LEVEL 2 IS WRITTEN 'V.A.I. PLUS' ALWAYS IN FULL WHERE THAT NAME IS USED." The name is no longer V.A.I. Plus |
| 3 | `CANON-CP-01` §16.1 | ⚠️ **DELETE** the open marker "The public name is still open — `MKT-CP-01` §5 item 2." It is closed by this file |
| 4 | `CANON-CP-01` §14.1 | Three service levels renamed to match |
| 5 | `CANON-CP-01` §4C | "STANDARD AND PRO" — **Standard** is not a level name. Replace with the ruled name |
| 6 | `CANON-CP-01` §4C.1 | Heading reads "PRO IS A PLATFORM TIER". ⚠️⚠️ **TIER BELONGS TO VAIRIFY'S LAUNCH COHORTS — `CP-01` §16.1. THE WORD IS LEVEL** |
| 7 | `MKT-CP-01` | The 21 Aug changelog line "LEVEL 2'S PUBLIC NAME CLOSED: V.A.I." is superseded. Delete it and every use of the old names |
| 8 | `CANON-CP-02` §0 | "V.A.I. PASS + ACCESS" — superseded. Delete |
| 9 | Anywhere | ⚠️⚠️ **THE `PASS` LEVEL NAME NEVER SHIPPED. IF IT APPEARS IN ANY FILE, SCREEN OR STRING, IT IS DELETED** |
| 10 | ⬜ | ⚠️ **The settings key name for the Pro price — `price_pro` or `price_vai_pro` — is not ruled here. Two names are in circulation. Report both addresses; change neither** |

---

# 4 — ⚠️ WHAT THIS FILE DOES NOT DO

| # | |
|---|---|
| 1 | ⚠️⚠️ **DOES NOT MOVE ANY INTEGER. `service_level` VALUES AND EVERY GATE CHECK ARE UNTOUCHED** |
| 2 | ⚠️⚠️ **DOES NOT CHANGE A PRICE OR A SETTINGS KEY** |
| 3 | ⚠️ **Does not rename the GREEN band** |
| 4 | ⚠️ **Does not touch Vairify's PACKAGE names — Free · Plus · Premium are unaffected** |

---

# CHANGELOG

| Date | # | Change | Reasoning |
|---|---|---|---|
| **26 Aug** | 5 | ⚠️⚠️ **§1 item 4 — integer mapping ruled: 1 VAI Go · 2 VAI Access · 3 VAI Pro. Open marker deleted.** | `RULINGS-CP-07_AMENDMENT-1` §1 |
| **26 Aug** | 1 | **Filed. Levels named VAI Go · VAI Access · VAI Pro. ChainPass is the company, never a level.** | ⚠️ **Owner ruling. The prior names were unresolved across `CP-01` §16.1, §14.1 and `MKT-CP-01`, which produced a design flag** |
| **26 Aug** | 2 | ⚠️⚠️ **"PASS" REJECTED AS A LEVEL NAME.** | ⚠️ **It is already the meaning of the GREEN band in §7.2. One word, two meanings, one product** |
| **26 Aug** | 3 | **The band rename to `Match` is not taken.** | ⚠️ **Naming the level Go removes the collision. A second rename adds churn for nothing** |
| **26 Aug** | 4 | ⬜ **The integer mapping left open.** | ⚠️⚠️ **`service_level (1\|2\|3)` IS READ BY EVERY GATE CHECK. A NAME CHANGE IS COPY. A NUMBER CHANGE IS A MIGRATION AND A BREAKING API CHANGE. THEY ARE NOT THE SAME RULING** |

---

**Related:** `CANON-CP-01` §7.2 · §14.1 · §16.1 · §4C · `CANON-CP-02` §0 · `MKT-CP-01` · `OPERATIONS` §7.1

**26 August 2026.**
