# CANON-CP-04 — TRIAL MODE

**Owner ruling, 25 August 2026. The trial cohort walks the whole product with nothing
verified behind it. This file exists so the question is never asked again.**

⚠️⚠️ **THE POINT OF THE TRIAL IS FOR PEOPLE TO USE THE SITE AND UNDERSTAND HOW IT WORKS.
NOBODY IS BEING VERIFIED. EVERYTHING APPROVES.**

---

# 1 — WHAT TRIAL MODE IS

| # | |
|---|---|
| 1 | ⚠️⚠️ **CHAINPASS TAKES THE PHOTO ITSELF. NO DOCUMENT. NO PROVIDER. NO BACKGROUND CHECK.** |
| 2 | ⚠️⚠️ **EVERY RESULT APPROVES.** |
| 3 | ⚠️ **The flow is the real flow. Same screens, same order, same handoff.** ⚠️⚠️ **THE MUSCLE MEMORY HAS TO TRANSFER.** |
| 4 | ⚠️⚠️ **THE VIEWER IS A DIFFERENT SCREEN AND MUST LOOK DIFFERENT** — §4. |
| 5 | ⚠️ **The photo is used for the match. ChainPass runs it against itself.** ⚠️⚠️ **NOTHING BEHIND IT IS ANCHORED TO AN IDENTITY.** |

---

# 2 — ⚠️⚠️ THE RESULT IS ITS OWN STATE

⚠️⚠️ **`trial_approved`. NEVER `match`. NEVER `green`. NEVER `pass`.**

| # | |
|---|---|
| 1 | ⚠️⚠️ **A TRIAL RESULT MUST NEVER BE MISTAKEN FOR A REAL ONE IN A RESPONSE BODY, A LOG, A LEDGER ROW, OR A SCREEN.** |
| 2 | ⚠️ **No band. No percentage. No cut-off.** ⚠️⚠️ **NOTHING IS BEING MEASURED, SO NOTHING IS REPORTED.** |
| 3 | ⚠️ **`RULINGS-CP-04`'s three response levels do not apply.** Trial returns one state at every level. |
| 4 | ⚠️⚠️ **A PLATFORM CANNOT CONFIGURE ITS WAY INTO RECEIVING A TRIAL RESULT THAT LOOKS REAL.** |

---

# 3 — ⚠️⚠️ EVERY TRIAL BASELINE IS MARKED AT THE MOMENT IT IS WRITTEN

⚠️⚠️ **A COLUMN ON THE BASELINE ROW. SET AT INSERT, NEVER AFTERWARDS, NEVER REMOVABLE.**

| # | |
|---|---|
| 1 | ⚠️⚠️ **A TRIAL BASELINE CAN NEVER SILENTLY BECOME A REAL ONE. IT WAS NEVER ANCHORED TO A DOCUMENT AND NO LATER EVENT CHANGES THAT.** |
| 2 | ⚠️ **Baselines are append-only. A real enrolment appends a new baseline; the trial one stays marked, forever, underneath it.** |
| 3 | ⚠️⚠️ **IF THIS MARK IS NOT WRITTEN AT INSERT, THERE IS NO WAY TO TELL A TRIAL CREDENTIAL FROM A REAL ONE ONCE VERIFICATION IS LIVE. BUILD IT BEFORE THE FIRST TRIAL USER.** |
| 4 | ⬜ **Whether a trial user re-enrols properly when verification comes on, or the trial baseline carries forward.** ⚠️ **UNRULED. The mark makes either answer possible; not marking makes both impossible.** |

---

# 4 — THE TRIAL VIEWER

⚠️ **`SN-86`. A separate screen from `SN-25`–`SN-32`.**

| # | |
|---|---|
| 1 | ⚠️ **Same layout and same flow as the everyday viewer, so what a member learns in the trial still holds afterwards.** |
| 2 | ⚠️⚠️ **DIFFERENT CHROME, SO NOBODY CONFUSES THE TWO AT A GLANCE.** |
| 3 | ⚠️⚠️ **A STANDING BANNER ON EVERY STATE: TRIAL — NOT VERIFIED. NEVER DISMISSIBLE. NEVER A TOAST. NEVER BELOW THE FOLD.** |
| 4 | ⚠️ **It shows the trial photo, the V.A.I., and an approved result.** ❌ **No band, no number, no confidence.** |
| 5 | ⚠️⚠️ **THE WHOLE RISK OF THE TRIAL IS A PROVIDER TREATING A TRIAL APPROVAL AS A VERIFICATION AT A DOOR. THE VIEWER IS THE ONLY THING STANDING BETWEEN THAT PERSON AND THAT MISTAKE.** |
| 6 | ⚠️ **The copy states plainly that nothing was checked.** ❌ **Never softened, never "for now", never a reassurance.** |

---

# 5 — THE SWITCH

| # | |
|---|---|
| 1 | ⚠️⚠️ **ONE SETTING ON THE PLATFORM ROW. ADMIN-FLIPPED. NEVER A DEPLOY.** |
| 2 | ⚠️ **The day it flips, the viewer becomes the real one and results start rejecting.** |
| 3 | ⚠️⚠️ **MEMBERS ARE TOLD BEFORE THAT DAY, NOT ON IT.** ⚠️ **Someone who has been approved for weeks and is suddenly refused at a door, with no warning, loses trust in the product and not in the change.** |
| 4 | ⚠️ **The switch is per platform.** One platform may go live while another is still in trial. |
| 5 | ⚠️⚠️ **NO NUMBER, NO DATE AND NO DURATION IS WRITTEN IN CANON OR IN CODE. THE SWITCH IS A SETTING AND THE DATE IS THE OWNER'S.** |

---

# 6 — WHAT TRIAL MODE DOES NOT CHANGE

| # | |
|---|---|
| 1 | ⚠️⚠️ **THE COURIER RULE. NO LEGAL NAME REACHES A PLATFORM, TRIAL OR NOT** — there is simply no legal name to reach one. |
| 2 | ⚠️⚠️ **SAFETY FEATURES ARE FREE AND UNCAPPED. TRIAL MODE NEVER GATES ONE.** |
| 3 | ⚠️ **Agreements signed in trial are real agreements** — `SPEC-CP-02`. **They are recorded, they are immutable, and they point at a trial credential.** ⬜ **What that means legally is MA-05's.** |
| 4 | ⚠️ **The pronoun rule** — `CANON-MI-36` §0. **User, provider, client.** |
| 5 | ⚠️ **The session key, the handoff and the deletion all run exactly as in `CANON-CP-02` §1.** |

---

# 7 — ⬜ OPEN

| # | | Whose |
|---|---|---|
| 1 | ⚠️⚠️ **DO TRIAL USERS RE-ENROL WHEN VERIFICATION COMES ON, OR DOES THE TRIAL BASELINE CARRY FORWARD?** ⚠️ **§3 makes either buildable. Answer before the switch, not after.** | Owner |
| 2 | ⬜ **The legal standing of an agreement signed against a trial credential.** | MA-05 |
| 3 | ⬜ **Whether trial agreements are re-signed at go-live.** | Owner + MA-05 |

---

# 8 — WHAT THIS CHANGES AT SOURCE

| # | Target | Change |
|---|---|---|
| 1 | `CANON-CP-01` §16.2 | **`baselines` gains a trial mark, set at insert, never removable.** ⚠️ **`platforms` gains the trial switch.** |
| 2 | `CANON-CP-01` §7.2 | ⚠️ **`trial_approved` is a state alongside the bands, and is not one of them.** |
| 3 | `RULINGS-CP-04` | ⚠️ **The three response levels do not apply in trial. One state at every level.** |
| 4 | `SCREEN-REGISTER-CHAINPASS` | ⚠️ **`SN-86` — the trial viewer.** |
| 5 | `RULINGS-CP-06` §2 | ⚠️ **A requested re-baseline in trial has no provider to run.** ⚠️⚠️ **IN TRIAL IT IS A NEW TRIAL PHOTO, MARKED, AND §2'S PROVIDER RULE APPLIES FROM GO-LIVE ONWARD.** |

---

# CHANGELOG

| Date | # | Change | Reasoning |
|---|---|---|---|
| **25 Aug** | 1 | Filed. | The trial was being re-explained every session because nothing held it. |
| **25 Aug** | 2 | §2 — `trial_approved` is its own state. | ⚠️⚠️ **IF IT RETURNS `match`, A TRIAL PASS IS INDISTINGUISHABLE FROM A REAL ONE IN EVERY LOG AND EVERY RESPONSE, FOREVER.** |
| **25 Aug** | 3 | §3 — the mark is written at insert. | ⚠️⚠️ **NOT MARKING MAKES BOTH ANSWERS TO §7 ITEM 1 IMPOSSIBLE. MARKING MAKES EITHER ONE AVAILABLE. IT COSTS ONE COLUMN.** |
| **25 Aug** | 4 | §4 — the viewer looks different and the banner never dismisses. | ⚠️⚠️ **THE RISK IS A PROVIDER TREATING A TRIAL APPROVAL AS A VERIFICATION AT A DOOR.** |
| **25 Aug** | 5 | §5 item 3 — members told before the switch. | ⚠️ **Approved for weeks then refused with no warning loses trust in the product rather than in the change.** |

---

⚠️⚠️ **THIS FILE COUNTS ONLY ONCE THE OWNER UPLOADS IT TO PROJECT KNOWLEDGE AND DEPOSITS IT
TO `chainpass-app/docs/canon/`.**

**Filed 25 August 2026.**

---

# ⚠️ NUMBERING NOTE

⚠️⚠️ **THIS FILE WAS FILED AS `CANON-CP-03` ON 25 AUGUST AND RENUMBERED THE SAME DAY.
`CP-03` WAS A RETIRED NUMBER — FOLDED INTO `CANON-CP-01` v2 AND DELETED — AND A RETIRED
NUMBER IS NEVER REUSED, `OPERATIONS` §9 ITEM 2. NOTHING BUT THE NUMBER CHANGED.**
