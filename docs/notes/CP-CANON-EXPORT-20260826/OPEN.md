# OPEN.md — CANON-AUDIT-01 · chainpass-app · 26 August 2026

Unruled markers (UNIT 2 item 5) and missing files (UNIT 2 item 1). Nothing resolved.

## Missing files — UNIT 2 item 1

**`00-CANON-INDEX`:** ABSENT. `find . \( -path './.git' -o -path './node_modules' \) -prune -o -iname '*CANON-INDEX*' -print` → empty.

Against that absent index, every file in `docs/canon/` is **present-but-unindexed**. Indexed-but-absent against `00-CANON-INDEX`: none (the index does not exist to name anything).

De facto listing used in this repo: `OPERATIONS.md` §2 CHAINPASS line (amended 26 Aug, commit `8974fd1`). That line names the 14 files in `docs/canon/`. All 14 are present.

**Present-but-unindexed against OPERATIONS.md §2:**

- `docs/SPEC-CP-02_THE_CONTRACT_REGISTRY__v3-8-25_.md`
- `docs/notes/REF-CP-01_CHAINPASS_CANON_AND_FEATURES.md`

**Indexed-but-absent against OPERATIONS.md §2:** none.

---

## Every unruled marker — UNIT 2 item 5

File, line, sentence. Markers: ⬜, TBD, TODO, UNRULED, "not ruled", and section titles that are an OPEN list. Changelog ⬜ rows included. `UNSET` in a changelog description of a past seed is listed only where it is an open marker, not a historical fact.

### CANON-CP-01_CHAINPASS__v3-8-20_.md

| Line | Sentence |
|---|---|
| 119 | ⚠️ **"For now, we can leave it."** ⬜ **Designed, not built first.** |
| 275 | ⬜ ⚠️⚠️ **AT TWO OR MORE PROVIDERS THIS BREAKS: THE PROVIDER IS ENCODED ONLY IN THE KEY, WHICH IS THE THING THAT IS LOST. THE DERIVATION MUST BE SOLVED BEFORE A SECOND PROVIDER IS ADDED — §3'S OPEN SPEC, NOW LOAD-BEARING.** |
| 293–294 | ⬜ ⚠️ **MA-05: confirm §2.4's deletion language accommodates custody of opaque, platform-keyed blobs.** |
| 380 | Email magic link ⬜ unruled. |
| 419 | ⬜ ⚠️ **ENCODING STILL OPEN.** **How a provider is derived · what happens when a provider is added or removed.** |
| 488 | ## 4A.5 — ⬜ Owed |
| 490 | ⬜ ⚠️ **The owner said: "there needs to be an address thing there if they choose deferral."** **NOT YET EXPLAINED. NOT INVENTED HERE.** |
| 672–673 | ⬜ ⚠️ **A first-time member needs one line explaining what a coloured profile means. WHERE IT LIVES IS UNRULED.** |
| 687 | ⬜ ⚠️ **What the panel sees: the fact of a hit and the member's explanation.** |
| 786 | ⬜ Whether the user pays is unruled. |
| 822 | ⬜ **Confirm whether it exists.** (provider retention column) |
| 902 | # 12 — ⬜ RULINGS OWED |
| 906–910 | §12 items 1–5: address thing; session-key encoding; reds window; upsell at launch; provider retention column. |
| 913–916 | §12 items 7, 9, 10: no-platform terms; skinned-page disclosure; email magic link. |
| 925 | **Suspension, lockout, ban** \| ⬜ **Still open.** |
| 926 | **Disclosure — the key coming back** \| ⬜ **Still open.** |
| 946 | ⬜ ⚠️⚠️ **`CANON-CP-02` §0 NAMES "V.A.I. PASS + ACCESS". THE REGISTER HERE LISTS ACCESS · V.A.I. · PRO.** |
| 1227–1228 | ⬜ ⚠️ **What the reviewer's outcome does — nothing, a flag, an order to re-baseline, or a credential state — is UNRULED.** |
| 1412–1413 | ⬜ **§10.3's provider-retention column is absent from this schema and must be added** |
| 1450 | ⬜ **Pending owner confirm.** (`POST /v1/photo-match`) |
| 1524 | Changelog #21: ⬜ **GATE-LAUNCH-01 OPEN** — `agreement_versions` `0-DRAFT` |

### CANON-CP-02_THE_THREE_ENROLMENT_FLOWS__v2-8-25_.md

| Line | Sentence |
|---|---|
| 21 | ⬜ **§5 item 6 — "PASS" is a level name the register does not have.** Flagged, not renamed. |
| 137 | ⬜ **"PASS" IS A LEVEL NAME THE REGISTER DOES NOT HAVE** — it lists Access · V.A.I. · Pro. **Rename, fourth level, or the Access pair? FLAGGED.** |

### CANON-CP-04_TRIAL_MODE__v1-8-25_.md

| Line | Sentence |
|---|---|
| 45 | ⬜ **Whether a trial user re-enrols properly when verification comes on, or the trial baseline carries forward.** ⚠️ **UNRULED.** |
| 82 | ⬜ **What that means legally is MA-05's.** |
| 88 | # 7 — ⬜ OPEN |
| 92 | ⚠️⚠️ **DO TRIAL USERS RE-ENROL WHEN VERIFICATION COMES ON, OR DOES THE TRIAL BASELINE CARRY FORWARD?** |
| 93 | ⬜ **The legal standing of an agreement signed against a trial credential.** |
| 94 | ⬜ **Whether trial agreements are re-signed at go-live.** |

### RULINGS-CP-01__v1-8-21_.md

| Line | Sentence |
|---|---|
| 42 | ⬜ **One clarification owed:** the earlier "`settings:dash_face_unlimited` for the whole business" — superseded by the tiers, or surviving as an unlimited-seats cap? |
| 74 | ## RULING 6 — THE REVIEWER'S OUTCOME ⬜ THE ONE GENUINE OPEN |

### RULINGS-CP-02__2026-08-22_.md

| Line | Sentence |
|---|---|
| 122 | ⬜ **Unruled.** (email magic-link alternative) |
| 153 | **Drawn ✅, coded ⬜.** (CP-01-SN-19) |
| 160 | # 8 — ⬜ OPEN, CREATED BY THESE RULINGS |
| 164–168 | No-platform terms; where terms acceptance is recorded; skinned-page disclosure; email magic link; whether MI-25/MI-33 screens move. |

### RULINGS-CP-03__2026-08-22_.md

| Line | Sentence |
|---|---|
| 110 | # 10 — ⬜ OPEN |
| 114 | Exact baseline merge algorithm from two frames and recorded KYC percentage |
| 115 | Access/V.A.I. acceptance page wire — one screen drawing |
| 116 | Vairify-side reads after table migration — API contract for lockout pending/cleared |

### RULINGS-CP-04_THE_RESPONSE_LEVEL__2026-08-25_.md

| Line | Sentence |
|---|---|
| 74 | # 4 — ⬜ OPEN |
| 78 | **Which level Vairify runs on.** |
| 79 | **Whether a level change is retroactive to answers already given, or applies from the change forward.** |
| 80 | **The band cut-offs themselves — measured in the pilot, against the INT8 model.** |

### RULINGS-CP-05_THE_SERVICE_STATE_CONTROL__v1-8-25_.md

| Line | Sentence |
|---|---|
| 113 | # 7 — ⬜ OPEN |
| 117 | **The hysteresis counts and the probe interval — the actual numbers.** They stay UNSET until the pilot. |
| 118 | ⬜ **Does a declared outage notify platforms, or do they poll?** |
| 119 | ⬜ **Whether a scheduled maintenance window is announced to members in advance, and by whom.** |

### RULINGS-CP-06_THE_RE-BASELINE_REQUEST__v1-8-25_.md

| Line | Sentence |
|---|---|
| 80 | ⬜ **Whether the user pays.** ⚠️ **A requested one is not ruled. UNRULED, NOT INVENTED.** |
| 112 | # 7 — ⬜ OPEN |
| 116 | ⚠️⚠️ **DOES THE USER PAY FOR A REQUESTED RE-BASELINE?** |
| 117 | **The cap and the period — the actual numbers.** Settings. UNSET until measured. |
| 118 | ⬜ **Does the platform learn the re-baseline completed, or only see the credential work again?** |

### SPEC-FLOW-01_THE_ONLINE_FLOWS_AND_THE_STACK.md

| Line | Sentence |
|---|---|
| 116 | ⬜ **UNRULED** (login, alone on a phone — no presentation-attack cover) |
| 118–119 | ⬜ ⚠️⚠️ **OWNER + MA-03: DOES LOGIN NEED A PRESENTATION-ATTACK MODEL, OR IS THE CONSEQUENCE OF A DEFEATED LOGIN SMALL ENOUGH TO ACCEPT?** |
| 263 | ⬜ ⚠️ **PRESENTATION-ATTACK DETECTION AT LOGIN — UNRULED.** |
| 277 | # 12 — ⬜ STILL OWED BY THE OWNER |
| 281–288 | PAD at login; integration money direction; which rail funds the per-enrolment fee; renewal attribution; which document the signature agreement is; band cut-offs; "PASS" as a level name; does the user pay for a requested re-baseline. |

### SPEC-CP-02_THE_CONTRACT_REGISTRY__v3-8-25_.md (outside `docs/canon/`)

| Line | Sentence |
|---|---|
| 227 | ⬜ **At what grain — MA-05** |
| 262 | ⬜ **Erasure requests against this record — MA-05.** |
| 279 | # 11 — ⬜ RAISED, NOT RESOLVED |
| 284 | ⬜ **What a platform may read of its own agreement records.** |
| 285 | ⬜ **Erasure and records-of-obligation — §9 item 5.** |
| 286 | ⬜ **A member reading their own agreements is a screen that exists in no canon.** |
| 299 | ⚠️⚠️ **WHICH DOCUMENT THE SIGNATURE AGREEMENT IS REMAINS UNRULED AND STILL BLOCKS THAT SCREEN.** |

### MKT-CP-01_THE_THREE_LEVELS__v2-8-21_.md

| Line | Sentence |
|---|---|
| 98 | # 5 — ⬜ OPEN |
| 102 | **No opens. Both closed 21 Aug — see changelog.** |

### CANON-MI-36, FLAG-VAIRIFY, OPERATIONS, RULINGS-CP-05 body except §7

No additional ⬜ / UNRULED / TBD / TODO body markers beyond those listed. OPERATIONS changelog mentions `UNSET` as a historical seed fact (line 339), not an open plate.

### 00-SCREEN-REGISTER.md (canon-adjacent; opened)

Flags 2–8, 13, 15 ⬜ unruled (lines 182–190). Flag 1 and 14 are 🔴 not ⬜. SN Verified column is ⬜ for most rows.

### CANON-CP-01-WIRE__2026-08-21.md (opened)

⬜ Abandonment, OTP parameters, deferral visibility, dashboard authentication, branding, handoff signature/poll; ⚠ reviewer's outcome UNRULED on SN-31.
