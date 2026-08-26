# CANON-CP-01 · MASTER DASHBOARD — WIRE SHEET

**SN-42 to SN-50. Wiring for `CP-01-SN-SIZES/`. Source: CANON-CP-01 §14.7, §14.8 and the 17 August rulings.**

---

## 1 — INVENTORY

| File | Verdict | Failing line · § |
|---|---|---|
| `CP-01-SN-36-44_ChainPass_Master_Dashboard__20Aug.html` | **REMOVE — the numbering is dead** | A 20 August bundle under the old numbering. **The register numbering governs: the master set is SN-42 to SN-50, not 36–44.** One inlined file, no per-size split, no four-state stack. **The old name is dead and no screen here cites it.** |
| `OPERATIONS.md` screens line | **CORRECT AT SOURCE — owner's** | Records the master dashboard as 36–44 and the set as ending at 44. Dead numbering; the live set ends at SN-50. |
| `RULINGS-CP-01` | **ABSENT from the knowledge base** | **Ruling 6 is drawn from CANON-CP-01's 17 August section, which states it in full: the provider can see obvious fraud and has no way to tell the platform, and what the reviewer's outcome does is unruled.** Ruling 6 names SN-45 and SN-31. |
| `VA-02-DELIVERY` and the MI-28/29 member surfaces | **KEEP** | The member-facing governance surface is not this delivery. Nav only. |

## 2 — WHAT IS NOT DRAWN, AND WHY

| # | Not drawn | Ruling |
|---|---|---|
| 1 | **Any outcome for a fraud finding** | **Ruling 6 — UNRULED: nothing, a flag, an order to re-baseline, or a credential state.** The report control on SN-45 is present and inert with the reason stated. **The reverse channel does not exist.** |
| 2 | **A score anywhere on the review screen** | **17 August item 4 — staff are looking for obvious fraud, not a score and not a second opinion on the match.** |
| 3 | **A queue the member waits on** | **Items 5–6 — the member never waits on it. It is the provider's own record, not a gate.** |
| 4 | **Altering an audit entry or a signed agreement version** | **§14.7 never-list 1 — including the provider's own admin. Immutability is the storage.** Both controls drawn inert. |
| 5 | **An operator unlock of a locked credential** | The cleared-by field accepts one value and the database refuses another. Drawn inert — a constraint, not a withheld permission. |
| 6 | **A reason for a credential state, exposed to a platform** | **§14.8 item 6 — one word, never why.** |
| 7 | **A percentage readable by a platform** | **§14.7 never-list 2.** The rate exists operator-side and never crosses. |
| 8 | **Anything platform-specific** | **§14.8 — a platform-shaped endpoint is a second platform away from being a bug.** |
| 9 | **A figure in copy** | Every value is a read. |

## 3 — WIRING

| SN | Reads | Writes | Gate |
|---|---|---|---|
| **42** | `master.platforms` · `platform.level` · `platform.collection_spec` · `platform.requirements` · `platform.keys` | `platform.suspend` · `platform.suspend_reason` → `audit.entry` | — |
| **43** | `master.providers` · `providers.per_attempt` · `providers.state` · `providers.cost` | — | — |
| **44** | `master.settings` · `settings.bands` | `settings.new_value` · `settings.save` → `audit.entry` | **The settings table is a singleton with one field** |
| **45** | `master.failures` · `failure.baseline` · `failure.selfie` | `failure.report_fraud` **(inert)** | **RULING 6 — the reviewer's outcome is unruled** |
| **46** | `master.credentials_by_state` · `credential.id` · `credential.state` · `credential.level` · `credential.cleared_by` | `credential.unlock` **(inert — a constraint)** | — |
| **47** | `master.revenue` · `master.commission_out` · `payout.rail` · `settings:commission_rate` **(RED)** | — | — |
| **48** | `health.affected` · `master.reds_counter` · `master.reds_series` | `health.switch` → `audit.entry` | — |
| **49** | `master.audit_log` · `audit.actor` · `audit.at` · `audit.action` · `audit.diff` | `audit.filter` · `audit.delete` **(inert)** | — |
| **50** | — | — | **MD09 unruled — nothing wired** |

**Every row is RED.** None was confirmed against a running service or a migration.

## 4 — Gates

| # | Gate | Screen | State |
|---|---|---|---|
| 1 | **RULING 6 — fraud found has nowhere to go, and the reviewer's outcome is unruled.** It names SN-45 and SN-31. Owner. | SN-45 | **Open.** The side-by-side is drawn, the finding is drawn, **and the outcome is not.** The report control is inert with the reason stated. |
| 2 | **MD09 — the ninth master surface is numbered and unnamed.** §14.7 lists eight. Owner. | SN-50 | **Open.** Stub. The reverse channel's operator side is named as a candidate and **not** assigned — Ruling 6 names SN-45 and SN-31, not this screen. |

## 5 — RED flags

| # | |
|---|---|
| 1 | **RULING 6 IS A HOLE IN THE PRODUCT, NOT A DESIGN GAP.** The provider can see obvious fraud and cannot tell the platform. **SN-45 draws the seeing and cannot draw the telling**, and no screen on either side can close it. |
| 2 | **SN-44 is where the standing blocker gets fixed.** Every settings pointer across every canon in this project reads a key with nowhere to live — the table is a singleton with one field. **This screen is the surface for it, and its `blocker` state says so on the screen.** |
| 3 | **The dead numbering is live in `OPERATIONS.md`** — master recorded as 36–44, the set ending at 44. Live set ends at SN-50. Owner's correction. |
| 4 | **`RULINGS-CP-01` was not readable.** Ruling 6 is drawn from the canon's own statement. |
| 5 | **The audit log must be append-only in storage** — §14.7, deletable by nobody including the highest tier. A permission model is not enough, and SN-49 states the guarantee as fact. |
| 6 | **The cleared-by constraint must exist in the database.** SN-46 draws the unlock as impossible; if it is only a hidden button, the claim is false. |
| 7 | **The tier separation on SN-48 is asserted, not verified.** The health switch is drawn inert at a reviewing tier and live above it; whether the role model supports that was not confirmed here. |

**22 August 2026. Nothing written to any repository.**
