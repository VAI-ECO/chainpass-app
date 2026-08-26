# RULINGS-CP-01 — THE SIX DASHBOARD RULINGS

**Owner rulings, 21 August 2026. Each amends `CANON-CP-01` where cited. Append-only; a
changed ruling is a new row, never an edit. Everything adjustable lives in settings —
never a constant (§15 item 12).**

---

## RULING 1 — DASHBOARD AUTHORITY ✅ RULED 21 AUG

**§14.6 rule 3 amended.** The dashboard's ruled identity is the V.A.I. that signed the
platform agreement. That signatory is the **authority of record** — whoever signs up holds
it, because nothing else is controllable.

1. **Login is the face** — a face check against the authority's V.A.I. No passwords, no
email auth. ChainPass authenticates its dashboards with the thing ChainPass sells.
2. **Reassignment, always available**: the current authority designates a successor; the
successor signs; a new proof row lands. Append-only — the chain of who held authority is
permanent.
3. **Staff seats**: the authority grants and revokes seats, each seat a V.A.I., each grant
and revocation a ledger row.
4. **Lost authority** falls back to the §2.4b principle: someone shows up live, the company
proves itself, a new authority signs. Never a lookup, never a support override.
5. **Every parameter is a setting**: whether staff seats exist, their maximum count, whether
reassignment requires a waiting period, whether the master dashboard mirrors the same
mechanism. All admin-changeable, zero constants.

### 1a — FACE IS OPTIONAL, PRICED · PASSWORDS ARE THE FREE DEFAULT ✅ RULED 21 AUG

Every platform gets the choice: activate facial recognition for dashboard access by putting
staff through the V.A.I. process, or keep traditional passwords. Passwords cost nothing and
remain available always.

**Seat pricing for face activation — values live in settings, keys only here:**

| Seats | Key | Ruled value |
|---|---|---|
| One | `settings:dash_face_seat_1` | — |
| `settings:dash_face_seat_pack` | `settings:dash_face_seat_10` | — |
| Each seat past `settings:dash_face_seat_pack` | `settings:dash_face_seat_over_10` | — |

⬜ **One clarification owed:** the earlier "`settings:dash_face_unlimited` for the whole business" — superseded by the
tiers, or surviving as an unlimited-seats cap (`settings:dash_face_unlimited`)? One word.

**Nothing about this touches member-credential pricing (§1.1a: `settings:price_vai` / `settings:price_vai_pro`) or the still-open
VAI Go price (Ruling 2). The `settings:dash_face_seat_1` figure coincidentally matches marketing's old working
VAI Go number — they are different products and must never share a surface.**

**Screens affected on ruling: SN-30/31/32 (viewer set flag 9), SN-33–41 (client dashboard),
SN-42–50 (master). A login screen gets drawn; CD09/MD09 flag plates shrink by one line.**

---

## RULING 2 — THE VAI GO PRICE ✅ CLOSED 21 AUG (POSTURE)
Value lives at `settings:price_access`, set at launch, held internally until announced —
"give them the deal, inform later." No figure on any surface or in any document until then.
`MKT-CP-01` v2 changelog #3 records the $19 working number deleted.

## RULING 3 — BLOCK PRICING ✅ CLOSED 21 AUG (POSTURE)
Structure already ruled in canon: `consumption_block_size` per agreement, "verification
block pricing" in the §15 settings list. Launch values set in settings at deployment, held
internally until announced. Same posture as Ruling 2.

## RULING 4 — PAYOUT CADENCE ✅ CLOSED 21 AUG (POSTURE)
Ledger already carries `accrued | payable | settled` (§16.2); the accrued→payable trigger is
`settings:payout_cadence`, set at deployment, changeable always. Nothing in canon or code
carries a cadence constant.

## RULING 5 — LEVEL 2'S PUBLIC NAME ✅ CLOSED 21 AUG
Canon had already ruled it: §14.1 vocabulary map — **1 VAI Go · 2 VAI Access · 3 VAI Pro**. The
contradiction lived in `MKT-CP-01` and is deleted in its v2 (changelog #2). Public name is
**V.A.I.**; bare "Plus" never appears on a ChainPass surface.

## RULING 6 — THE REVIEWER'S OUTCOME ⬜ THE ONE GENUINE OPEN
Canon rules the mechanics (§16.5: obvious fraud only, never a score; the photograph is
served; the two orders exist) and names the gap itself: "FRAUD FOUND HAS NOWHERE TO GO."
Where it goes — suspend, red-count, platform notification — remains the owner's. The flag
plates on SN-45/SN-31 stand until it lands. Nothing blocks on it.

---

---

# CHANGELOG
| Date | # | Change | Reasoning |
|---|---|---|---|
| **26 Aug** | 3 | ⚠️⚠️ **Level-1 Access copy deleted. Access is level 2. `settings:price_access` not renamed.** | `RULINGS-CP-07_AMENDMENT-1` §1 item 4 |
| **22 Aug** | 2 | ⚠️⚠️ **SEAT PACK LABEL → `settings:dash_face_seat_pack`.** | CANON-00 §16. |
| **22 Aug** | 1 | ⚠️⚠️ **REAL FIGURES STRIPPED FROM SEAT TABLE (KEYS ONLY). `settings:dash_face_seat_pack`, `settings:dash_face_unlimited`, `settings:price_vai`, `settings:price_vai_pro`. DELETED $19 ACCESS RECORD LEFT. ALREADY-POINTER ROWS LEFT.** | CANON-00 §16. |
| **21 Aug** | 1 | Ruling 1 + 1a filed: authority of record, face optional/priced, passwords free. | Owner rulings in session. |
| **21 Aug** | 2 | Rulings 2, 3, 4 closed as POSTURE: values in settings, held internally until announced. | Owner, "give them the deal, inform later." Structures were already ruled in canon; only values remained, and values are launch decisions, not document contents. |
| **21 Aug** | 3 | Ruling 5 closed from canon itself: §14.1 already named level 2 "V.A.I." | The open was a contradiction in `MKT-CP-01`, now deleted in its v2. No owner input was needed — the answer was in the KB. |
| **21 Aug** | 4 | Ruling 6 marked the sole genuine open. | Canon names the gap in its own text; inventing the answer is forbidden. |

**Filed 21 August 2026. Upload to the KB and deposit to `chainpass-app/docs/canon/`.**
