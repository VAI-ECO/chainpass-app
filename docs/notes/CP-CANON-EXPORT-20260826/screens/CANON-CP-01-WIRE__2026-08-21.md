# CANON-CP-01-WIRE__2026-08-21.md

**Canon:** CANON-CP-01 (amended 22 Aug 2026 · `RULINGS-CP-03`) · **contract:** SPEC-DS-01 §3 · **repo:** `chainpass-app`

⚠️ **Set 1 of 4 — the enrolment set (SN-01 … SN-24).** Viewer (SN-25…32), client dashboard
(SN-33…41) and master dashboard (SN-42…50) follow in the same file as each set lands.

⚠️ **Rules honoured here:** an element with no canon cite is flagged, never invented. A read
from a table no migration creates is flagged 🔴. Every price is a pointer
(`settings:price_vai`), never a figure — OPERATIONS §6 holds on drawings.

⚠️ **Gate column** cites SPEC-CP-01 §6 and the register's flag list. PLAN-VA-01 is not in this
window, so no Gate # is quoted — naming a number I cannot read would be an invention.

---

## CANON-CP-01-SN-01 — CP01 Landing

| Field | Value |
|---|---|
| Route | /enrol |
| Canon | §2 step 1 · §2.5 (no identifier on the URL) |
| Reads | none |
| Writes | POST /enrol/session → creates 🔴 `enrolment_sessions` — no migration creates this table (SPEC-CP-01 §6 item 4); sets `cp_enrol` cookie (httpOnly · Secure · SameSite=Lax · path /) per SPEC-CP-01 §2.1 |
| Settings used | — |
| Nav in | platform's own site, server-side redirect |
| Nav out | CP02 · error → CP01 error state |
| Gate | ⬜ Branding unruled — ChainPass mark or platform skin |
| Fixed-390 | no |

---

## CANON-CP-01-SN-02 — CP02 What we keep, and the warning

| Field | Value |
|---|---|
| Route | /enrol/keep |
| Canon | §2 step 2 · §2.1 |
| Reads | platform.collection_spec (what this platform declared at onboarding, §2.3) |
| Writes | none |
| Settings used | — |
| Nav in | CP01 |
| Nav out | SN-03 (CP23) · back → CP01 |
| Gate | — |
| Fixed-390 | no |

---

## CANON-CP-01-SN-03 — CP23 Biometric consent

| Field | Value |
|---|---|
| Route | /enrol/consent |
| Canon | §2 step 2 · §2.6 |
| Reads | none |
| Writes | POST /enrol/consent → consent record, timestamped |
| Settings used | — |
| Nav in | CP02 |
| Nav out | CP03 · decline → exit, no credential |
| Gate | ⬜ Abandonment unruled — what a decline leaves behind is not in the record |
| Fixed-390 | no |

---

## CANON-CP-01-SN-04 — CP03 Pay

| Field | Value |
|---|---|
| Route | /enrol/pay |
| Canon | §2 step 3 · §1.1a (every price admin-adjustable, never a constant) · §4C |
| Reads | `settings:price_vai` · `settings:price_pro` — **pointers, never figures** (OPERATIONS §6) |
| Writes | POST /enrol/payment |
| Settings used | `settings:price_vai` · `settings:price_pro` · `settings:deferral_enabled` |
| Nav in | CP23 |
| Nav out | CP07 · defer → SN-05 (CP04) · failure → error state |
| Gate | 🔴 Payment placement unruled — §2 puts PAY at step 3, §4A.2 starts the deferral clock at step 6. Drawn at 3 because that is where the sequence puts it. |
| Fixed-390 | no |

---

## CANON-CP-01-SN-05 — CP04 Deferred payment · modal

| Field | Value |
|---|---|
| Route | /enrol/pay#defer |
| Canon | §2 step 3 · §4A · §4A.2 (once ever, per person) · §4A.3 · §4A.4 |
| Reads | credential.deferral_used_ever (§4A.2 — per person, not per platform, not per year) |
| Writes | POST /enrol/defer → deferral record, clock starts at verification not payment (§4A.2) |
| Settings used | `settings:deferral_window` (48h — a setting, §15 item 12) |
| Nav in | CP03 |
| Nav out | CP07 · cancel → CP03 |
| Gate | ⬜ Deferral visibility unruled — §4A.4 makes it visible to both parties; §4B and §15 item 9 forbid telling a platform why |
| Fixed-390 | no |

---

## CANON-CP-01-SN-06 — CP07 Register · contact

| Field | Value |
|---|---|
| Route | /enrol/register |
| Canon | §2 step 4 · §2.3 (collection spec — username only if the spec includes it) · §2.9 (the courier rule — no field the platform did not send out) |
| Reads | platform.collection_spec |
| Writes | POST /enrol/register → contact; username only when the spec requires it |
| Settings used | — |
| Nav in | CP03 · CP04 |
| Nav out | CP08 |
| Gate | — |
| Fixed-390 | no |

---

## CANON-CP-01-SN-07 — CP08 OTP

| Field | Value |
|---|---|
| Route | /enrol/otp |
| Canon | §2 step 5 |
| Reads | none |
| Writes | POST /enrol/otp/verify |
| Settings used | ⬜ OTP length and expiry not ruled — flagged, not invented |
| Nav in | CP07 |
| Nav out | CP05 · resend → CP08 · fail → error state |
| Gate | ⬜ OTP parameters unruled |
| Fixed-390 | no |

---

## CANON-CP-01-SN-08 — CP05 The verification company, embedded

| Field | Value |
|---|---|
| Route | /enrol/verify |
| Canon | §2 step 6 · §2.2 · §2.7 (frame one · provider match percentage recorded, never returned) |
| Reads | provider adapter per §5 (registered row, not a build) |
| Writes | provider session open; frame one held; kyc_match_percent recorded on the session |
| Settings used | `settings:provider_active` |
| Nav in | CP08 |
| Nav out | CP06 on success · CP16 on last attempt · CP17 on re-baseline |
| Gate | — |
| Fixed-390 | no |

---

## CANON-CP-01-SN-09 — CP06 The V.A.I. is revealed

| Field | Value |
|---|---|
| Route | /enrol/vai |
| Canon | §2 step 7 · §2.8 (origination written at issue, locked by database trigger) |
| Reads | credential.vai (seven characters) |
| Writes | origination row — written at issue, never by application code (§2.8 item 3) |
| Settings used | — |
| Nav in | CP05 |
| Nav out | SN-51 (acceptance) |
| Gate | ⬜ Abandonment unruled — from here a live V.A.I. exists with unsigned documents and no baseline |
| Fixed-390 | no |

---

## CANON-CP-01-SN-10 — CP09 Both outcomes, rendered

| Field | Value |
|---|---|
| Route | /enrol/requirements |
| Canon | §2 step 9 · §4D.1 item 5 · §4D.2 · Pro only |
| Reads | platform.requirements (§4C.3) · credential.requirements_on_file |
| Writes | none |
| Settings used | — |
| Nav in | SN-51 |
| Nav out | CP10 · CP11 · CP24 when nothing is outstanding |
| Gate | — |
| Fixed-390 | no |

---

## CANON-CP-01-SN-11 — CP10 Law enforcement declaration

| Field | Value |
|---|---|
| Route | /enrol/declaration |
| Canon | §2 step 9 · §4D.1 · own affirmation, not the terms checkbox |
| Reads | document version, immutable and versioned (§14.2 items 2-3) |
| Writes | POST /enrol/sign → signature stamped to the exact version seen (§14.2 item 4) |
| Settings used | — |
| Nav in | CP09 |
| Nav out | CP11 |
| Gate | — |
| Fixed-390 | no |

---

## CANON-CP-01-SN-12 — CP11 Signature agreement

| Field | Value |
|---|---|
| Route | /enrol/agreement |
| Canon | §2 step 9 · §4C.2 (a user does not have to sign anything, but anything they do sign, they agreed in advance is binding) |
| Reads | document version |
| Writes | POST /enrol/sign → signature bound to the face, stamped to the version |
| Settings used | — |
| Nav in | CP10 |
| Nav out | CP24 |
| Gate | — |
| Fixed-390 | no |

---

## CANON-CP-01-SN-13 — CP24 The baseline is committed

| Field | Value |
|---|---|
| Route | /enrol/baseline |
| Canon | §2 step 10 · §2.7 · two frames · gated on terms checkbox |
| Reads | held_capture (frame one) · acceptance_capture (frame two) · terms_accepted_at |
| Writes | baseline committed at ChainPass from both frames. The platform never receives, stores or matches the biometric. |
| Settings used | — |
| Nav in | SN-51 (Access / V.A.I.) · CP11 (Pro) |
| Nav out | CP13 |
| Gate | — |
| Fixed-390 | no |

---

## CANON-CP-01-SN-14 — CP13 Congratulations

| Field | Value |
|---|---|
| Route | /enrol/done |
| Canon | §2 step 11 · §10 (`settings:credential_term`) |
| Reads | credential.expires |
| Writes | none |
| Settings used | `settings:term_length` |
| Nav in | CP24 |
| Nav out | SN-52 |
| Gate | — |
| Fixed-390 | no |

---

## CANON-CP-01-SN-15 — CP14 The handoff

| Field | Value |
|---|---|
| Route | /enrol/return — **one fixed URL, zero parameters** (SPEC-CP-01 §2.5) |
| Canon | §2 step 13 · §2.9 · §2.4 · §2.4a · SPEC-CP-01 §2.3-§2.6 |
| Reads | cookie `cp_enrol` → 🔴 `enrolment_sessions` — no migration creates this table (SPEC-CP-01 §6 item 4). **Never reads the credential off the return trip** (SPEC-CP-01 §0). |
| Writes | webhook side: verify signature, match correlation id, write fields, status `complete`, idempotent (SPEC-CP-01 §2.3). Session key → vault, blind-tagged, **never a column beside the V.A.I.** (§2.4c item 1) and **never to the browser** (SPEC-CP-01 §2.4). |
| Settings used | `settings:handoff_poll_window` (15s proposed) · `settings:handback_nonce_ttl` (60s proposed) — **both settings, never constants** (§15 item 12) |
| Nav in | SN-52 · ChainPass redirect · handback nonce on a lost cookie (SPEC-CP-01 §2.6) |
| Nav out | platform account · finishing state while the row is `pending` (**the redirect will sometimes beat the webhook — not an error**) · timeout leaves the row pending server-side |
| Gate | 🔴 Handoff payload has no published shape (SPEC-CP-01 §6 item 1) · ⬜ signature scheme unruled (item 2) · ⬜ poll/TTL unruled (item 3) |
| Fixed-390 | no |

---

## CANON-CP-01-SN-51 — CP27 Acceptance · terms and frame two

| Field | Value |
|---|---|
| Route | /enrol/accept |
| Canon | §2 step 8 · §14.3 · `RULINGS-CP-03` §1 · §8 |
| Reads | platform terms version at ChainPass |
| Writes | terms checkbox → `terms_accepted_at`; frame two → `acceptance_capture`. No box, no second capture, no baseline. |
| Settings used | — |
| Nav in | CP06 |
| Nav out | Access / V.A.I. → CP24 · Pro → CP09 |
| Gate | Design drawing owed. Built from canon text. |
| Fixed-390 | no |

---

## CANON-CP-01-SN-52 — CP28 Account security

| Field | Value |
|---|---|
| Route | /enrol/security |
| Canon | §2 step 12 · §2.10 · `RULINGS-CP-03` §7 |
| Reads | `security_question_options` |
| Writes | three hashed answers · three hashed recovery codes · recovery contact. Last ChainPass screen. |
| Settings used | `settings:recovery_code_count` · `settings:security_question_count` |
| Nav in | CP13 |
| Nav out | CP14 |
| Gate | Design drawing owed. Custody is ChainPass. |
| Fixed-390 | no |

---

## CANON-CP-01-SN-16 — CP16 Last attempt

| Field | Value |
|---|---|
| Route | /verify/last-attempt |
| Canon | 17 Aug items 4-5 — attempt count is a setting; last attempt runs on the premium engine and the selfie is taken there |
| Reads | verification.attempt_index |
| Writes | selfie captured on the last attempt, whatever N is |
| Settings used | `settings:attempt_count` (1, 2 or 3 — **never a constant**) |
| Nav in | CP05 |
| Nav out | CP17 · CP18 · retry → CP05 |
| Gate | — |
| Fixed-390 | no |

---

## CANON-CP-01-SN-17 — CP17 Re-baseline required

| Field | Value |
|---|---|
| Route | /verify/rebaseline |
| Canon | §9.1 items 2-3 — past the reds threshold the next failure returns a fourth state; the fresh verification is at ChainPass's cost |
| Reads | credential.reds_count (lifetime, per credential) |
| Writes | re-baseline request |
| Settings used | `settings:reds_threshold` |
| Nav in | CP16 · V05 |
| Nav out | CP05 |
| Gate | — |
| Fixed-390 | no |

---

## CANON-CP-01-SN-18 — CP18 Not active

| Field | Value |
|---|---|
| Route | /verify/not-active |
| Canon | §4B.1 · §4B.3 — one word, never why. Covers deferral lapsed, expired, suspended and banned, unsorted. |
| Reads | credential.state → **the state only, never the reason** (§15 item 9) |
| Writes | none |
| Settings used | — |
| Nav in | CP16 · any gate check |
| Nav out | CP20 when renewable · exit |
| Gate | ⬜ Deferral visibility unruled |
| Fixed-390 | no |

---

## CANON-CP-01-SN-19 — CP19 Requirements shortfall

| Field | Value |
|---|---|
| Route | /verify/shortfall |
| Canon | §11.2 · §11.3 — the asking party is told only that requirements are not met, never which one |
| Reads | platform.requirements vs credential.requirements_on_file → **a list and a destination, never which item was short** (§11.3) |
| Writes | none |
| Settings used | — |
| Nav in | CP09 · a Pro-to-Pro meeting |
| Nav out | CP10 · CP11 · the administering destination |
| Gate | — |
| Fixed-390 | no |

---

## CANON-CP-01-SN-20 — CP20 Renewal · the two-date test

| Field | Value |
|---|---|
| Route | /renew |
| Canon | §10.1 · §10.2 · §10.4 |
| Reads | credential.expires · credential.term_start |
| Writes | POST /renew |
| Settings used | `settings:renewal_window` · `settings:term_length` · `settings:price_vai` · `settings:price_pro` (**pointers**) |
| Nav in | CP18 · expiry webhook |
| Nav out | CP13 · CP03 |
| Gate | — |
| Fixed-390 | no |

---

## CANON-CP-01-SN-21 — CP21 A different platform · AVCHEXXX

| Field | Value |
|---|---|
| Route | /verify/cross-platform |
| Canon | §4C.3 — the platform sets its requirements, ChainPass administers them, no charge to the member for them |
| Reads | platform.requirements · credential.requirements_on_file (**agreements signed once are valid everywhere**, so only what is genuinely not on file is asked for) |
| Writes | none |
| Settings used | — |
| Nav in | a second platform's gate |
| Nav out | CP19 · CP10 · CP11 |
| Gate | — |
| Fixed-390 | no |

---

## CANON-CP-01-SN-22 — CP25 First visit · the platform's terms

| Field | Value |
|---|---|
| Route | /terms/first-visit |
| Canon | §14.3 (acceptance-era — originating platform at enrolment step 8; any other platform on first visit) · §14.2 · §14.2b item 2 · §14.2c item 4 |
| Reads | platform.terms current version — **the document itself, held at ChainPass, immutable and versioned** (§14.2 items 2-3) |
| Writes | POST /terms/sign → face-bound, versioned, timestamped, pullable forever (§14.3 item 3) |
| Settings used | — |
| Nav in | first visit · re-fires on next visit after a version update (§14.3 item 2) |
| Nav out | the platform · decline → no access |
| Gate | 🔴 **Screen body copy is stale.** CP25 still reads "we hold a reference, never the content" — reversed by §14.2 on 20 Aug. Correction owed on the screen and its rail note. |
| Fixed-390 | no |

---

## CANON-CP-01-SN-23 — CP22 Rows and thresholds

| Field | Value |
|---|---|
| Route | /admin/rows |
| Canon | §1.1a · §5 · §7.3 · §14.4 |
| Reads | settings sheet · provider rows |
| Writes | settings updates → every change lands in the audit log (MD08, §14.7) |
| Settings used | `settings:band_green` · `settings:band_yellow` · `settings:attempt_count` · all prices (**pointers**) |
| Nav in | ChainPass admin |
| Nav out | MD03 |
| Gate | ⬜ Dashboard authentication unruled — the API key is the only ruled identity (§14.6 rule 3) |
| Fixed-390 | no |

---

## CANON-CP-01-SN-24 — CP26 Unruled · not drawn

| Field | Value |
|---|---|
| Route | n/a — a flag plate, not a screen |
| Canon | — |
| Reads | none |
| Writes | none |
| Settings used | — |
| Nav in | n/a |
| Nav out | n/a |
| Gate | Carries the eight unruled items listed in the register |
| Fixed-390 | no |

---

# Red flags in this set

| # | Screen | Flag |
|---|---|---|
| 1 | SN-01 (CP01), SN-15 (CP14) | 🔴 `enrolment_sessions` — platform-side table, absent from the schema read 20 Aug. SPEC-CP-01 §6 item 4. |
| 2 | SN-15 (CP14) | 🔴 Handoff payload has no published shape. An integrator reading the 11 Aug API reference builds SPEC-CP-01 §2.5 wrong. §6 item 1. |
| 3 | SN-04 (CP03) | 🔴 Payment placement — §2 step 3 against §4A.2's clock at step 6. |
| 4 | SN-22 (CP25) | 🔴 Screen copy stale against the 20 Aug §14.2 reversal. |

# Unruled, flagged not invented

Deferral visibility · branding · abandonment · OTP length and expiry · dashboard
authentication · handoff signature scheme · poll window and nonce TTL.


---

# Wide-layout ruling per screen — correction 2, 21 Aug

**Which of the 24 get a bespoke tablet/desktop treatment, and which keep the contract
defaults deliberately.** SPEC-DS-01 §2: defaults for forms and flows; real two-pane / grid
for list, grid and review surfaces.

| SN | Screen | -T / -D treatment | Why |
|---|---|---|---|
| SN-01…SN-09 | CP01 → CP06 (landing through V.A.I.) | **default, deliberate** | Linear enrolment flow. A wide layout adds width, not information. |
| SN-10 | CP09 Both outcomes | **bespoke** | A requirements list. -T: two-column checklist. -D: requirements table with on-file status column. |
| SN-11, SN-12 | CP10, CP11 (declaration, agreement) | **bespoke -D only** | Document + signing rail. -D: document pane (readable measure) beside a sticky sign rail. -T stays default — the document wants the full column. |
| SN-13…SN-15 | CP24, CP13, CP14 | **default, deliberate** | Flow terminals. |
| SN-16…SN-18 | CP16, CP17, CP18 | **default, deliberate** | Single-verdict screens; §4B wants one word, not a dashboard. |
| SN-19 | CP19 Requirements shortfall | **bespoke** | A list and a destination. -T/-D: shortfall list beside the administering destination. |
| SN-20 | CP20 Renewal | **default, deliberate** | A form. |
| SN-21 | CP21 Cross-platform | **bespoke -D only** | On-file vs needed-here comparison reads as two columns at width. |
| SN-22 | CP25 First visit terms | **bespoke -D only** | Document + sign rail, same pattern as SN-11/12. |
| SN-23 | CP22 Rows and thresholds | **bespoke** | A settings sheet IS a grid/review surface. -T: two-column setting rows. -D: full settings table with audit-log column. |
| SN-24 | CP26 Unruled plate | **default, deliberate** | A text plate. |

**Count: 6 bespoke (SN-10, 11, 12, 19, 21, 22, 23 — SN-11/12/21/22 desktop-only), 17 default-deliberate.**

# States honesty — correction 4, 21 Aug

**States that are canon-ruled specific behaviours and must not be generic templates:**

| SN | State | Canon-ruled drawing |
|---|---|---|
| SN-04 (CP03) | error | **Payment-failed path**: card declined ≠ session lost. The deferral offer re-renders on the failure — §4A is exactly for the member who cannot pay now. |
| SN-05 (CP04) | empty | **Deferral already used** — drawn (§4A.2). Confirmed not generic. |
| SN-08 (CP05) | empty | **Provider-down path per the health signal**: the health switch (§14.6 s7, 17 Aug) declares the outage; the screen reads the declared state, never infers it from failures. |
| SN-08 (CP05) | error | **Session-lock recovery**: §2.4 — interruption recoverable up to the handoff; §2.7 item 5 locks the session. Error state must state the resume, not a generic retry. |
| SN-15 (CP14) | loading | **The finishing state** — the pending race, polls settings:handoff_poll_window. Drawn (SPEC-CP-01 §2.5). Confirmed not generic. |
| SN-15 (CP14) | empty | **Lost cookie → handback nonce** — drawn (SPEC-CP-01 §2.6). Confirmed not generic. |
| SN-17 (CP17) | error | Re-baseline session failure leaves the credential in the fourth state, not active-with-error — §9.1 item 2. |
| SN-18 (CP18) | error | **State-unreadable ≠ not-active**: "treat as not verified, never as not active" — drawn. Confirmed not generic. |
| SN-22 (CP25) | empty | **Minimum standard terms** — drawn (§14.2b item 2). Confirmed not generic. |

All other loading/empty/error states are legitimately generic and are declared generic here.


---

# Viewer set — SN-25 … SN-32 (delivered 21 Aug, not yet accepted)

## CANON-CP-01-SN-25 — V01 The operational call
| Field | Value |
|---|---|
| Route | /verify/call |
| Canon | §6 |
| Reads | settings:attempt_count |
| Writes | POST /v1/verifications — capture (and vai when entered) |
| Settings used | settings:attempt_count |
| Nav in | platform gate · SN-28 retry |
| Nav out | SN-26 · error state (attempt not counted) |
| Gate | — |
| Fixed-390 | no |

## CANON-CP-01-SN-26 — V02 Checking
| Field | Value |
|---|---|
| Route | /verify/checking |
| Canon | §6 |
| Reads | verification.status — poll until the band returns |
| Writes | none |
| Settings used | — |
| Nav in | SN-25 |
| Nav out | SN-27 · SN-28 · SN-29 · error → treat as not verified |
| Gate | — |
| Fixed-390 | no |

## CANON-CP-01-SN-27 — V03 Green
| Field | Value |
|---|---|
| Route | /verify/green |
| Canon | §7.2 · §7.1 · §7.3 (band only, never a percentage) |
| Reads | verification.result · credential.state |
| Writes | none |
| Settings used | — |
| Nav in | SN-26 |
| Nav out | the platform |
| Gate | — |
| Fixed-390 | no |

## CANON-CP-01-SN-28 — V04 Yellow and red
| Field | Value |
|---|---|
| Route | /verify/band |
| Canon | §7.2 · §8 |
| Reads | verification.result |
| Writes | POST /v1/verifications — capture (retry) |
| Settings used | settings:attempt_count |
| Nav in | SN-26 |
| Nav out | SN-25 retry · SN-16 on last attempt · manual path (flag) |
| Gate | ⚠ Manual path is Pro, platform-built (§8); the reviewer's outcome is unruled (register flag 13) |
| Fixed-390 | no |

## CANON-CP-01-SN-29 — V05 Re-baseline required · the fourth state
| Field | Value |
|---|---|
| Route | /verify/fourth-state |
| Canon | §9.1 items 2–3 |
| Reads | credential.reds_count vs settings:reds_threshold |
| Writes | re-baseline request |
| Settings used | settings:reds_threshold |
| Nav in | SN-26 |
| Nav out | CP17 re-baseline flow |
| Gate | — |
| Fixed-390 | no |

## CANON-CP-01-SN-30 — V06 The failures column
| Field | Value |
|---|---|
| Route | /review/failures |
| Canon | 17 Aug |
| Reads | failures queue — third-attempt selfies |
| Writes | none |
| Settings used | — |
| Nav in | ChainPass staff · MD04 |
| Nav out | SN-31 per row |
| Gate | ⚠ Dashboard authentication unruled (register flag 9). Bespoke wide at -T/-D: real table. |
| Fixed-390 | no |

## CANON-CP-01-SN-31 — V07 Side-by-side review
| Field | Value |
|---|---|
| Route | /review/side-by-side |
| Canon | 17 Aug |
| Reads | image serve — baseline + third-attempt selfie |
| Writes | ⚠ reviewer's outcome — UNRULED (17 Aug · §14.8, register flag 13). Button is a flag, not an invention. |
| Settings used | — |
| Nav in | SN-30 |
| Nav out | SN-30 |
| Gate | ⚠ Reviewer's outcome + reverse fraud-found channel unruled. Bespoke wide at -T/-D: two-pane at size. |
| Fixed-390 | no |

## CANON-CP-01-SN-32 — V08 Supplier obligations
| Field | Value |
|---|---|
| Route | /supplier/obligations |
| Canon | 17 Aug, facial stack · §5 · §14.4 · §2.4b |
| Reads | health switch (declared) · image serve deploy status |
| Writes | none — informational; flagged, not invented |
| Settings used | — |
| Nav in | ChainPass staff |
| Nav out | — |
| Gate | ⚠ Dashboard authentication unruled (register flag 9). Bespoke wide at -T/-D: two-column obligations. |
| Fixed-390 | no |

**21 August 2026.**
