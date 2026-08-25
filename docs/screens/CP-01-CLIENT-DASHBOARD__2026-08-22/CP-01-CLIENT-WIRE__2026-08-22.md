# CANON-CP-01 · CLIENT DASHBOARD — WIRE SHEET

**SN-33 to SN-41. Wiring for `CP-01-SN-SIZES/`. Source: CANON-CP-01 §14.6, §14.7, §14.8 and the 17 August rulings.**

---

## 1 — INVENTORY

| File | Verdict | Failing line · § |
|---|---|---|
| `CP-01-SN-27-35_ChainPass_Client_Dashboard__20Aug.html` | **REMOVE — the numbering is dead** | A 20 August bundle under the old numbering. **The register numbering governs: the client set is SN-33 to SN-41, not 27–35.** One inlined file, no per-size split, no four-state stack. **The old name is dead and no screen in this delivery cites it.** |
| `OPERATIONS.md` screens line | **CORRECT AT SOURCE — owner's** | It records `CP-01-SN-01…44 — enrolment 01–26, client dashboard 27–35, master 36–44`. **That is the dead numbering, and the live set ends at SN-50.** Only the owner can correct it; until then a reader checking a screen against operations finds the screen wrong and the document right. |
| `RULINGS-CP-01` | **ABSENT from the knowledge base** | Ruling 6 is named in the commission and its substance is confirmed in CANON-CP-01's own 17 August section — *fraud found has nowhere to go*, the reviewer's outcome unruled. **Drawn from the canon; the rulings file itself was not readable here.** |
| `DESIGN-BRIEF-CP-01` enrolment screens | **KEEP** | Enrolment is SN-01 to SN-26 and is not this delivery. Nav only. |

## 2 — WHAT IS NOT DRAWN, AND WHY

| # | Not drawn | Ruling |
|---|---|---|
| 1 | **A session-key endpoint, or any way to read one** | **§14.6 rule 2 — not an endpoint and never will be. It leaves once at the handoff and the copy is deleted.** SN-33 and SN-40 state the absence rather than omitting it: not withheld, we do not have it. |
| 2 | **A legal name, a document, a baseline or a percentage** | **§14.7 never-list 2 — never anywhere a platform can read.** Stated on SN-36 and SN-37, where someone would look for one. |
| 3 | **Another platform's data, at any depth** | **§14.6 rule 1 — every endpoint is scoped to the key.** A scope, not a permission. |
| 4 | **Any private dashboard capability** | **§14.7 — no private endpoints; nothing it can do that the API cannot.** |
| 5 | **Editing a published agreement version** | **§14.7 never-list 1 — immutability is the storage, not a permission**, and it holds against the provider's own admin. |
| 6 | **Client staff accounts, roles or delegation** | **§14.6 rule 3 — client staff identity is the platform's problem. The API key is the identity the provider knows.** |
| 7 | **A credential price** | The credential is the provider's product and it states its own price. Purchase leaves this surface. |
| 8 | **A figure in copy** | Every value is an endpoint or settings read. |

## 3 — WIRING

**Pointer: `settings:blocks_alert_threshold`. RED — the settings table is a singleton with one field, OPERATIONS §11 item 7.**

| SN | Reads | Writes | Nav | Gate |
|---|---|---|---|---|
| **33** | `traffic.verifications` · `traffic.passes` · `traffic.fails` · `traffic.originated` · `traffic.series` · `api.key_scope` | — | → SN-38 | — |
| **34** | `blocks.remaining` · `blocks.burn_rate` · `blocks.projection` · `blocks.low` · `blocks.exhausted` · `blocks.ledger` · `settings:blocks_alert_threshold` **(RED)** | `blocks.purchase` | → the provider's purchase flow | — |
| **35** | `agreements.documents` · `agreements.versions` · `agreements.signatures` · `agreements.shortfall` | — | — | — |
| **36** | `proofs.credential` · `proofs.version` · `proofs.signed_at` · `proofs.display` · `proofs.error` | `proofs.query` · `proofs.pull` · `proofs.export` | — | — |
| **37** | `commission.accrued` · `commission.scheduled` · `commission.paid` · `commission.ledger` · `commission.rail` | — | — | — |
| **38** | `config.summary` · `config.collection_spec` | `config.deferral` · `config.edit` **(inert — agreement terms)** | — | — |
| **39** | `health.signal` · `health.history` | `health.retry` | — | — |
| **40** | `keys.list` · `keys.new` · `keys.revoked` | `keys.issue` · `keys.rotate` · `keys.revoke` | — | — |
| **41** | — | — | — | **CD09 unruled — nothing wired** |

**Every row is RED.** §14.6 is a specification, not a built API — the canon's §14.8 records the reverse channel as not existing and the API build as ongoing. **No endpoint here was confirmed against a running service.**

## 4 — Gates

| # | Gate | Screen | State |
|---|---|---|---|
| 1 | **CD09 — the ninth client surface is numbered and unnamed.** §14.6 lists eight. Owner. | SN-41 | **Open.** Stub. The reverse channel is named as the strongest candidate and explicitly **not** assigned. |
| 2 | **The reverse channel does not exist** — §14.8 and the 17 August rulings. Two orders and fraud-found cannot be sent. | SN-41 | **Open.** Part of the API build, not an afterthought to it. |

## 5 — RED flags

| # | |
|---|---|
| 1 | **The dead numbering is still live in `OPERATIONS.md`** — client dashboard recorded as 27–35, the set ending at SN-44. **The live set ends at SN-50.** Owner's correction; no delivery can make it. |
| 2 | **`RULINGS-CP-01` is not in the knowledge base.** Ruling 6 is drawn from the canon's own statement of it. Anything further in the rulings file was not readable here. |
| 3 | **No endpoint is confirmed.** Every Reads row is a build target. |
| 4 | **Purchase crosses the company boundary.** SN-34 opens the provider's flow; no price is drawn on either side. |
| 5 | **The settings table cannot hold `settings:blocks_alert_threshold`** — OPERATIONS §11 item 7. |
| 6 | **Immutability must be storage-level.** §14.7 never-list 1 holds against the provider's own admin; a permission check is not enough, and SN-35 states the guarantee as fact. |

**22 August 2026. Nothing written to any repository.**
