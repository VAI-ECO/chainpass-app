# RULINGS-CP-04 — THE RESPONSE LEVEL

**Owner ruling, 25 August 2026. ChainPass returns one of three response shapes, chosen per
platform in admin. This amends eleven places across five files.**

⚠️⚠️ **THE OWNER'S SPOKEN INSTRUCTION OUTRANKS EVERY DOCUMENT BELOW. WHERE A CANON
DISAGREES WITH THIS FILE, THE CANON IS STALE AND IS AMENDED, NOT THIS FILE.**

---

# 1 — THE RULING

⚠️⚠️ **CHAINPASS OFFERS EACH PLATFORM A RESPONSE LEVEL. THE PLATFORM CHOOSES ONE.**

| Level | The platform receives |
|---|---|
| **1** | ⚠️ **A yes or a no** |
| **2** | ⚠️ **A colour** |
| **3** | ⚠️ **A colour and a percentage** |

| # | |
|---|---|
| 1 | ⚠️⚠️ **CHAINPASS COMPUTES IDENTICALLY IN ALL THREE CASES. ONLY WHAT IT RETURNS DIFFERS.** |
| 2 | ⚠️⚠️ **THE PLATFORM BUILDS NOTHING. IT CHANGES ITS LEVEL IN ITS DASHBOARD, OR IT TELLS CHAINPASS.** |
| 3 | ⚠️ **The level is a setting on the platform row.** Admin-adjustable, never a constant, never a code change on either side. |
| 4 | ⚠️ **The band cut-offs remain global and remain ChainPass's.** A platform chooses what it is told, never where the lines fall. |

---

# 2 — THE ELEVEN AMENDMENTS

## 2.1 — CHAINPASS CANON

| # | File · section | Change | Verify |
|---|---|---|---|
| **1** | `CANON-CP-01` §7.3 | ⚠️⚠️ **DELETE "THE PERCENTAGE NEVER LEAVES CHAINPASS."** Replace: the percentage leaves when the platform's response level permits it. Cut-offs stay global and ChainPass's. | `grep -c "never leaves ChainPass" CANON-CP-01*` → 0 |
| **2** | `CANON-CP-01` §15 item 12 · line ~1041 · line ~1329 | ⚠️⚠️ **REMOVE "A PERCENTAGE" FROM THE NEVER-LIST IN ALL THREE PLACES.** ⚠️ **THE LEGAL NAME, THE DOCUMENT AND THE BASELINE STAY ON IT, UNCHANGED.** | the three lists name three items, not four |
| **3** | `CANON-CP-01` §16.2 | **`platforms` gains `response_level`.** Three values. Settings-backed, admin-adjustable. ⚠️⚠️ **DEFAULTS TO LEVEL 1, THE NARROWEST.** | the column exists; a new platform row reads 1 |
| **4** | `CANON-CP-01` §14.6 | **The verify surface documents ONE request shape and THREE response shapes.** ⚠️⚠️ **THE SECTION MUST CARRY THIS SENTENCE: CHAINPASS COMPUTES IDENTICALLY IN ALL THREE; ONLY WHAT IT RETURNS DIFFERS.** | the sentence is present verbatim |
| **5** | `CANON-CP-01` §7.2 | **The three bands extend from VAI-CHECK to LOGIN.** Login was pass or fail; a no now carries which no it is. | §7.2 names login |
| **6** | `CANON-CP-01` §14.7 | **The master dashboard gains the per-platform response-level control.** ⚠️ **A PLATFORM CHANGES ITS OWN LEVEL THERE OR ASKS CHAINPASS. NO PLATFORM WRITES CODE FOR THIS.** | changing it in the UI changes the response |

## 2.2 — VAIRIFY CANON

| # | File · section | Change | Verify |
|---|---|---|---|
| **7** | `CANON-MI-22` §11 · §12 | ⚠️⚠️ **VAIRIFY MAY NOW RECEIVE A PERCENTAGE. VAIRIFY STILL NEVER COMPUTES ONE, NEVER SETS A THRESHOLD, AND NEVER STORES ONE.** ⚠️⚠️ **RECEIVING IS NOT HOLDING. WRITE THAT DISTINCTION EXPLICITLY OR THE DELETED 512-VECTOR COLUMN AND THE LOCAL-THRESHOLD LOGIC RETURN THROUGH THE SAME DOOR.** | no threshold constant, no stored score, no vector column |
| **8** | `CANON-MI-22` §12 item 8 · `CANON-SA-01` §17 | **The `{ match, confidence }` versus `{ result }` failure was a FIELD-NAME MISMATCH, not proof that confidence should not exist.** ⚠️ **The adapter — `CANON-CP-01` §14.4 item 4 — normalises all three response shapes and is the ONLY place any of them is read.** | one fixture per shape produces one internal result |
| **9** | `CANON-00` §5 | ⚠️ **UNCHANGED, AND CONFIRMED: NO FACE, NO VECTOR, NO PHOTOGRAPH ON VAIRIFY.** A percentage is none of those. | §5 diff empty |

## 2.3 — DERIVED DOCUMENTS

| # | File · section | Change | Verify |
|---|---|---|---|
| **10** | `SPEC-FLOW-01` §3 | **The what-never-crosses table loses the percentage row.** | the row is gone |
| **11** | The three diagrams | **Remove "a match - never a score" and "a band - never a number."** | `grep -c "never a score\|never a number" docs/diagrams/` → 0 |

---

# 3 — ⚠️ ONE FLAG. NOT AN ARGUMENT AGAINST THE RULING.

⚠️⚠️ **A PLATFORM ON LEVEL 3 THAT STORES WHAT IT RECEIVES IS HOLDING A BIOMETRIC-DERIVED
SCORE PER PERSON PER LOGIN.**

| # | |
|---|---|
| 1 | ⚠️ **That is an MA-05 question in several jurisdictions, and it lands on the PLATFORM, not on ChainPass.** |
| 2 | ⚠️ **Which may be exactly the point — but it belongs in the platform agreement rather than arriving as a surprise.** |
| 3 | ⚠️ **`CANON-CP-01` §2.8 item 4 already puts terms on that agreement. It has somewhere to go.** |
| 4 | ⚠️⚠️ **VAIRIFY'S OWN LEVEL IS A SEPARATE RULING AND IS NOT MADE HERE.** |

---

# 4 — ⬜ OPEN

| # | | Whose |
|---|---|---|
| 1 | **Which level Vairify runs on.** | Owner |
| 2 | **Whether a level change is retroactive to answers already given, or applies from the change forward.** | Owner |
| 3 | **The band cut-offs themselves — measured in the pilot, against the INT8 model.** | Pilot |

---

# CHANGELOG

| Date | # | Change | Reasoning |
|---|---|---|---|
| **25 Aug** | 1 | Filed. Three response levels, chosen per platform in admin. | ⚠️⚠️ **THE PLATFORM DECIDES WHAT IT IS TOLD AND BUILDS NOTHING TO DO IT. ONE COMPUTATION, THREE OUTPUTS, ONE SETTING.** |
| **25 Aug** | 2 | The percentage comes off the never-list; the legal name, document and baseline stay on it. | ⚠️ **The wall was never about arithmetic. It is about identity. A score reveals nothing about who someone is.** |
| **25 Aug** | 3 | §2.2 item 7 — receiving is not holding, stated explicitly. | ⚠️⚠️ **THE DELETED VECTOR COLUMN AND THE LOCAL THRESHOLD BOTH ENTERED THROUGH "VAIRIFY NEEDS THE NUMBER." THE DISTINCTION HAS TO BE IN WRITING OR THEY COME BACK.** |
| **25 Aug** | 4 | §3 flags the platform-side retention exposure without opposing the ruling. | ⚠️ **A risk that lands on someone else is still a risk worth naming in the agreement that creates it.** |

---

⚠️⚠️ **THIS FILE COUNTS ONLY ONCE THE OWNER UPLOADS IT TO PROJECT KNOWLEDGE AND DEPOSITS IT
TO `chainpass-app/docs/canon/` AND `vairify-app/docs/canon/`.**

**Filed 25 August 2026.**
