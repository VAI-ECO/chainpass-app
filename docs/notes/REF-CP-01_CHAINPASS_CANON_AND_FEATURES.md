# REF-CP-01 — CHAINPASS CANON AND FEATURES

Built 26 Aug 2026 from CP FINAL RUN #1 report and `docs/notes/CP-RUN-01-NOTES.md`. Nothing here that is not in those two. Provenance: `[V]` live-verified this run · `[D]` document-sourced · `[?]` unverified.

No API key. No Vairify feature, Vairify canon, or Vairify price figure.

---

## 1 — EVERY CANON FILE

From UNIT 3 item 1. Indexed = named in `OPERATIONS.md` §2 listing.

| id | title | version (filename) | last-commit | indexed | P |
|---|---|---|---|---|---|
| CANON-CP-01 | ChainPass | v3-8-20 | 2026-08-26 05:22:02 +0700 | yes | [D] |
| CANON-CP-02 | The three enrolment flows | v2-8-25 | 2026-08-25 16:13:23 +0700 | no | [D] |
| CANON-CP-04 | Trial mode | v1-8-25 | 2026-08-25 20:56:10 +0700 | no | [D] |
| CANON-MI-36 | The recovery paths | v1-8-25 | 2026-08-25 16:13:23 +0700 | no | [D] |
| FLAG-VAIRIFY-RULINGS-CP-03 | Flag file in this repo | 2026-08-22 | 2026-08-25 12:16:52 +0700 | no | [D] |
| MKT-CP-01 | The three levels | v2-8-21 | 2026-08-25 08:22:17 +0700 | yes | [D] |
| OPERATIONS | Operations | — | 2026-08-25 12:16:52 +0700 | yes | [D] |
| RULINGS-CP-01 | Rulings CP-01 | v1-8-21 | 2026-08-22 10:40:00 +0700 | yes | [D] |
| RULINGS-CP-02 | Rulings CP-02 | 2026-08-22 | 2026-08-25 12:16:52 +0700 | yes | [D] |
| RULINGS-CP-03 | Terms, two-frame baseline, caps, recovery custody | 2026-08-22 | 2026-08-25 12:16:52 +0700 | yes | [D] |
| RULINGS-CP-04 | The response level | 2026-08-25 | 2026-08-25 16:13:07 +0700 | no | [D] |
| RULINGS-CP-05 | The service state control | v1-8-25 | 2026-08-26 05:22:02 +0700 | no | [D] |
| RULINGS-CP-06 | The re-baseline request | v1-8-25 | 2026-08-25 16:13:23 +0700 | no | [D] |
| SPEC-FLOW-01 | The online flows and the stack | — | 2026-08-25 16:13:07 +0700 | no | [D] |

---

## 2 — EVERY FEATURE

State from UNIT 6 and UNIT 7.

| name | canon | state | P |
|---|---|---|---|
| Enrolment land | CANON-CP-02 §1 step 1 | routed | [D] |
| Enrolment information 1a | CANON-CP-02 §1 step 1a | routed | [D] |
| Enrolment PAY | CANON-CP-02 §1 step 2 | routed | [D] |
| Session key | CANON-CP-02 §1 step 3 | coded | [D] |
| KYC handoff | CANON-CP-02 §1 step 4 | coded | [D] |
| Baseline camera | CANON-CP-02 §1 step 5 | routed | [D] |
| Outside-the-walls check | CANON-CP-02 §1 step 5a | coded | [D] |
| KYC complete | CANON-CP-02 §1 step 6 | coded | [D] |
| Image/result return | CANON-CP-02 §1 step 7 | coded | [D] |
| V.A.I. mint | CANON-CP-02 §1 step 8 | routed | [D] |
| Contact + OTP | CANON-CP-02 §1 step 9 | routed | [D] |
| Documents + face match | CANON-CP-02 §1 step 10 | routed | [D] |
| Retrieval page | CANON-CP-02 §1 step 11 | routed | [D] |
| Remember-on-device | CANON-CP-02 §1 step 11a | routed | [D] |
| Handoff | CANON-CP-02 §1 step 12 | routed | [D] |
| Session-key delete | CANON-CP-02 §1 step 13 | coded | [D] |
| Response level 1 yes/no | RULINGS-CP-04 §1 | coded | [D] |
| Response level 2 colour | RULINGS-CP-04 §1 | coded | [D] |
| Response level 3 colour+percentage | RULINGS-CP-04 §1 | coded | [D] |
| Trial one-shape verify | CANON-CP-04 §2 | coded | [V] |
| Scoped re-baseline request | RULINGS-CP-06 | coded | [V] |
| Contract registry | SPEC-CP-02 / CANON-CP-01 §14.2 | coded | [D] |

---

## 3 — THE THIRTEEN-STEP ORDER

From UNIT 6. CANON-CP-02 §1.

| # | step | state | P |
|---|---|---|---|
| 1 | Land in ChainPass | routed | [D] |
| 1a | Optional information page | routed | [D] |
| 2 | PAY | routed | [D] |
| 3 | 30-character session key | coded | [D] |
| 4 | Hand to KYC company | coded | [D] |
| 5 | ChainPass camera / baseline | routed | [D] |
| 5a | Outside-the-walls | coded | [D] |
| 6 | KYC verification completes | coded | [D] |
| 7 | Image, result, session key return | coded | [D] |
| 8 | V.A.I. minted | routed | [D] |
| 9 | Confirmation, contact, OTP | routed | [D] |
| 10 | OTP, documents, face match | routed | [D] |
| 11 | Retrieval page | routed | [D] |
| 11a | Final V.A.I. / remember-on-device | routed | [D] |
| 12 | Handoff | routed | [D] |
| 13 | Delete session key | coded | [D] |

---

## 4 — THE THREE LEVELS

From UNIT 7.

| level | canon return | live trial return | P |
|---|---|---|---|
| 1 | yes or a no — RULINGS-CP-04 §1 | `{"status":"trial_approved"}` | [V] |
| 2 | a colour — RULINGS-CP-04 §1 | `{"status":"trial_approved"}` | [V] |
| 3 | a colour and a percentage — RULINGS-CP-04 §1 | `{"status":"trial_approved"}` | [V] |

Trial: CANON-CP-04 §2 item 3, one state at every level. Live agreed. Scoped re-baseline: `{"error":"refused"}`. [V]

---

## 5 — TEST MODE

| # | what changes | where set | canon | live currently | P |
|---|---|---|---|---|---|
| 1 | All response levels return one trial body | `platforms.trial_mode` | CANON-CP-04 §2 | level 3 trial platform: `{"status":"trial_approved"}`; prior walk levels 1 and 2 same body | [V] |
| 2 | `trial_approved` is the result; no band, no percentage | function `verify` (`trialApprovedBody`); ledger result `trial_approved` | CANON-CP-04 §2 | `{"status":"trial_approved"}` | [V] |
| 3 | Trial mark on baseline at insert | column `baselines.is_trial`; set in `enrol-baseline` | CANON-CP-04 §3 | column exists; this run did not insert a baseline | [D] |
| 4 | Image not vendor-verified in trial | CANON-CP-04 §1 item 1 | CANON-CP-04 §1 | photo used; nothing anchored to an identity | [D] |
| 4b | Background not run as a real check in trial | CANON-CP-04 §1 item 1 | CANON-CP-04 §1 | Offenders.io hookup out of scope | [D] |
| 4c | Document not run as a real KYC in trial | CANON-CP-04 §1 item 1 | CANON-CP-04 §1 | ComplyCube hookup out of scope | [D] |
| 5 | Trial user at go-live | — | CANON-CP-04 §3 item 4 | UNRULED | [D] |
| 6 | `0-DRAFT` terms | `agreement_versions` / `platform_agreements` | GATE-LAUNCH-01 / OPERATIONS §11 row 0 | blocks real member enrolment until replaced | [D] |

---

## 6 — UNRULED

From report section 10.

- Where CANON-AD-01 and CANON-CM-01 belong (files absent here; subject text present). [D]
- `consumption_block_size` vs live blocks sized 100 (setting is 1000, not UNSET). [V]
- Blocks already sized 100 (ids 1 and 2). [V]
- ComplyCube go-live. [D]
- OFFENDERS_IO_URL and key. [D]
- `reds_threshold` and `blocks_alert_threshold` (both UNSET). [V]
- Real terms to replace `0-DRAFT`. [D]
- Whether trial users re-enrol at go-live. [D]
- Whether a user-requested re-baseline costs anything (`rebaseline_price` UNSET). [V]
- Which document the signature agreement is (SN-12). [D]
