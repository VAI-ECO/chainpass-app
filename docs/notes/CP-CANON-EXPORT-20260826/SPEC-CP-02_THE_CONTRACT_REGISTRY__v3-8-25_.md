# SPEC-CP-02 — THE CONTRACT REGISTRY AND THE AGREEMENT RECORD

**Platform documentation and ChainPass architecture. Owner ruling, 25 August 2026.**

⚠️⚠️ **THE AGREEMENT RUNS INSIDE CHAINPASS. THE PLATFORM SENDS A CONTRACT NUMBER AND TWO
V.A.I. NUMBERS AND RECEIVES AN AGREEMENT NUMBER. NOTHING ELSE CROSSES.**

⚠️⚠️ **CHAINPASS IS LIABLE FOR WHAT IT HOLDS HERE. THIS RECORD IS BUILT TO BE PRODUCED IN
COURT YEARS AFTER THE FACT, AGAINST A PARTY WHO DISPUTES WHAT WAS SIGNED.**

⚠️ **Number collision: `vairify-app/docs/SPEC-CP-02_CREDENTIAL_AND_PLATFORM_MODEL.md` is a
different, older document. This file is the contract registry. Do not merge them.**

---

# 1 — THE RULING

| # | |
|---|---|
| 1 | ⚠️⚠️ **A CONTRACT ON FILE NEVER CHANGES. NOT A WORD, NOT A COMMA, NOT EVER.** |
| 2 | ⚠️⚠️ **CHAINPASS HOLDS IT FOREVER.** ⚠️ **Retiring it stops it being served. It does not stop it existing.** |
| 3 | ⚠️ **A platform may hold many contracts.** ⚠️⚠️ **EACH ONE IS IDENTIFIED SEPARATELY.** |
| 4 | ⚠️⚠️ **EVERY AGREEMENT CARRIES ITS OWN NUMBER, A TIME AND DATE STAMP, AND IS ATTACHED TO EVERY V.A.I. THAT SIGNED IT.** |
| 5 | ⚠️⚠️ **THE RECORD IS SEARCHABLE BY AGREEMENT NUMBER AND BY V.A.I. NUMBER. BOTH. INDEXED.** |

---

# 2 — ⚠️⚠️ WHERE IT HAPPENS

```
THE PLATFORM                 ⚠️⚠️ CHAINPASS ⚠️⚠️                 THE PLATFORM
                                                              
contract number   ──────→    serves the bytes                 
two V.A.I. numbers           shows them to both parties        
                             takes both answers        ──────→   agreement number
                             writes the record                   and nothing else
                             stamps every step                   
```

| # | |
|---|---|
| 1 | ⚠️⚠️ **THE PLATFORM DOES NOT DISPLAY THE AGREEMENT. CHAINPASS DOES.** |
| 2 | ⚠️⚠️ **THE PLATFORM DOES NOT REPORT THE ANSWERS. CHAINPASS TOOK THEM AND KNOWS THEM FIRSTHAND.** |
| 3 | ⚠️ **The platform never holds the text, the answers, the timestamps, or the proof.** ⚠️⚠️ **IT HOLDS A NUMBER.** |
| 4 | ⚠️⚠️ **THERE IS NO ROUTE THAT SERVES AN UNREGISTERED CONTRACT.** |

⚠️ **This closes the question of a platform recording an answer nobody gave. A platform that
never asserts an answer cannot assert a false one.**

---

# 3 — HOW A CONTRACT IS ENTERED

## 3.1 — THE IDENTIFIER

```
CP-<PLATFORM>-<NNNN>-v<N>

CP-VAIRIFY-0007-v2        registered, live
CP-VAIRIFY-0007-v1        registered, retired, on file forever
CP-PANAYLOVE-0001-v1      a different platform, its own sequence
```

| Part | Rule |
|---|---|
| `CP` | ⚠️ Fixed. Marks a registry object |
| `<PLATFORM>` | ⚠️ Assigned by ChainPass at agreement. **Never chosen by the platform** |
| `<NNNN>` | ⚠️⚠️ **MONOTONIC PER PLATFORM. NEVER REUSED, EVEN AFTER RETIREMENT** |
| `v<N>` | ⚠️⚠️ **A NEW VERSION IS A NEW REGISTRATION, NEVER AN EDIT** |

## 3.2 — THE ONE-WAY DOOR

```
draft  ──→  live  ──→  retired
              ⚠️⚠️ NO ROUTE BACK. NO EDIT. NO DELETE.
```

| # | |
|---|---|
| 1 | ⚠️ **`draft` may be edited or discarded.** ⚠️⚠️ **IT MAY NEVER BE SERVED.** |
| 2 | ⚠️⚠️ **THE MOMENT A CONTRACT GOES LIVE IT IS FROZEN.** |
| 3 | ⚠️ **Changing terms means registering `v2` and retiring `v1`.** ⚠️⚠️ **AGREEMENTS AGAINST `v1` STILL POINT AT `v1`, AND `v1` IS STILL THERE TO READ.** |
| 4 | ⚠️⚠️ **RETIREMENT IS NOT DELETION.** |

## 3.3 — LANGUAGE

⚠️ **Two languages are two contracts in one family, each with its own hash.** ⚠️⚠️ **A
TRANSLATION IS NOT A COPY. IT IS ITS OWN REGISTERED CONTRACT.**

---

# 4 — THE SCHEMA

⚠️⚠️ **WRITE-ONCE IS ENFORCED BY DATABASE CONSTRAINT AND BY REVOKED PRIVILEGE. NEVER BY
APPLICATION CODE. AN APPLICATION RULE IS A RULE UNTIL SOMEONE OPENS A CONSOLE.**

## 4.1 — `contracts`

| Field | | |
|---|---|---|
| `contract_id` | PK · `CP-VAIRIFY-0007-v2` | immutable |
| `platform_id` · `family` · `version` | | immutable |
| `body` | ⚠️⚠️ **THE EXACT BYTES** | immutable |
| `content_hash` | ⚠️⚠️ **SHA-256 OF `body`** | immutable |
| `language` · `parties` | BCP-47 · `1` or `2` | immutable |
| `registered_at` · `registered_by` | | immutable |
| `status` | `draft` · `live` · `retired` | ⚠️ **the only mutable field** |
| `retired_at` | ⚠️ **set once, never unset** | |
| `supersedes` | previous `contract_id` or null | immutable |

## 4.2 — `agreements`

| Field | |
|---|---|
| `agreement_id` | ⚠️⚠️ **PK. `AG-<26 chars>`, sortable by time, never reused** |
| `contract_id` | ⚠️ **the exact version served** |
| `content_hash` | ⚠️⚠️ **COPIED ONTO THE AGREEMENT.** ⚠️ **It carries its own proof of what it was and does not depend on the contract row staying honest** |
| `platform_id` | |
| `outcome` | `agreed` · `declined` · `expired` |
| `created_at` · `closed_at` | ⚠️ **§4.6** |

⚠️⚠️ **APPEND-ONLY. NO FIELD IS EVER UPDATED. A CHANGED MIND IS A NEW AGREEMENT.**

## 4.3 — `agreement_parties`

⚠️⚠️ **ONE ROW PER V.A.I. PER AGREEMENT. THIS TABLE IS WHY SEARCH BY V.A.I. WORKS.**

| Field | |
|---|---|
| `agreement_id` · `vai` | ⚠️⚠️ **`vai` INDEXED** |
| `party_order` | `1` or `2` |
| `answer` | ⚠️⚠️ **CHAINPASS'S OWN OBSERVATION. TAKEN ON A CHAINPASS SCREEN, NEVER REPORTED BY A PLATFORM** |
| `answered_at` | ⚠️ **§4.6** |
| `match_ref` | ⚠️ **the ChainPass face match behind the answer** |

⚠️ **Two columns on one row would have hidden the second party from an index. A party table
also makes a one-party enrolment document the same object as a two-party agreement.**

## 4.4 — `serve_events`

⚠️⚠️ **CHAINPASS SERVES AND DISPLAYS THE BYTES ITSELF, SO PROOF OF DISPLAY IS OUR OWN
FIRST-HAND RECORD AND NEVER A PLATFORM'S ASSERTION.**

| Field | |
|---|---|
| `serve_id` · `agreement_id` · `contract_id` · `content_hash` | |
| `vai` · `served_at` · `delivery` | |

## 4.5 — `record_ledger`

⚠️⚠️ **EVERY WRITE TO THE FOUR TABLES ABOVE APPENDS ONE LEDGER ENTRY. EACH ENTRY CARRIES
THE HASH OF THE ENTRY BEFORE IT.**

| Field | |
|---|---|
| `seq` · `table_name` · `row_key` · `row_hash` | |
| `prev_hash` · `entry_hash` | ⚠️⚠️ **THE CHAIN** |
| `written_at` | |

| # | |
|---|---|
| 1 | ⚠️⚠️ **A ROW HASH ALONE PROVES NOTHING — ANYONE WHO CAN EDIT THE ROW CAN RECOMPUTE ITS HASH. THE CHAIN MAKES A RETROACTIVE EDIT DETECTABLE, BECAUSE EVERY LATER ENTRY WOULD HAVE TO BE REWRITTEN TOO.** |
| 2 | ⚠️⚠️ **THE CHAIN HEAD IS RECORDED AND SIGNED DAILY, AND KEPT WHERE THE DATABASE ROLE CANNOT REACH.** |
| 3 | ⚠️ **A chained hash on an append-only log. Standard database integrity.** ⚠️⚠️ **THE WORD FOR THE OTHER THING IS BANNED PROJECT-WIDE AND IS NOT USED.** |

## 4.6 — ⚠️⚠️ TIME AND DATE

| # | |
|---|---|
| 1 | ⚠️⚠️ **CHAINPASS'S CLOCK. ALWAYS.** ⚠️ **A platform-supplied time is a number we were handed. `answered_at` is when ChainPass took the answer on its own screen.** |
| 2 | ⚠️⚠️ **UTC, STORED WITH THE LOCAL OFFSET.** ⚠️ **"Signed at 11pm local" is a materially different fact from "signed at 04:00 UTC", and the offset is the only way to recover it years later.** |
| 3 | ⚠️ **Millisecond precision.** |
| 4 | ⚠️⚠️ **THE LEDGER'S `written_at` IS THE AUTHORITATIVE STAMP. A ROW'S OWN TIME CAN BE ARGUED WITH. A CHAINED ONE CANNOT BE MOVED WITHOUT BREAKING EVERY ENTRY AFTER IT.** |

---

# 5 — SEARCH

⚠️⚠️ **BOTH PARAMETERS. BOTH INDEXED. BOTH FIRST-CLASS.**

| Query | Path |
|---|---|
| ⚠️⚠️ **BY AGREEMENT NUMBER** | `agreements` PK → parties → contract → the bytes |
| ⚠️⚠️ **BY V.A.I. NUMBER** | `agreement_parties.vai` index → every agreement that V.A.I. ever signed |
| **By contract** | ⚠️ **every agreement signed under that contract, grouped** |
| **By platform and window** | for a disclosure request scoped to a date range |

⚠️ **A V.A.I. search returns declined and expired agreements too.** ⚠️⚠️ **A RECORD THAT
SHOWS ONLY AGREEMENT IS A SELECTION, AND A SELECTION IS WHAT THE OTHER SIDE ATTACKS.**

---

# 6 — THE SEQUENCE

```
1  ⚠️ THE PLATFORM ASKS              contract_id + the V.A.I. numbers
        ↓
2  ⚠️⚠️ CHAINPASS CHECKS             on file · live · belongs to this platform
        ↓                            · parties matches the count sent
3  ⚠️ CHAINPASS OPENS THE AGREEMENT  mints AG-… · returns it to the platform
        ↓
4  ⚠️⚠️ CHAINPASS DISPLAYS THE BYTES to each party · writes a serve_event each time
        ↓
5  ⚠️⚠️ CHAINPASS TAKES EACH ANSWER  on its own screen · stamps it · binds the match
        ↓
6  ⚠️⚠️ CHAINPASS WRITES THE RECORD  append-only · ledger entry · never edited
        ↓
7  ⚠️ THE PLATFORM HOLDS             the agreement number. Nothing else.
```

| # | |
|---|---|
| 1 | ⚠️ **A retired contract is refused at step 2 and the refusal says why** — the platform's own configuration, not a member's business. |
| 2 | ⚠️⚠️ **A NO IS RECORDED AS FAITHFULLY AS A YES.** |
| 3 | ⚠️ **A contract served before retirement completes.** The check is at step 2. |

---

# 7 — ACCESS

⚠️⚠️ **THE RECORD ATTACHES AGREEMENTS TO V.A.I. NUMBERS, AND CHAINPASS ALSO HOLDS THE
LEGAL NAME BEHIND EACH ONE. THAT PAIRING IS EXACTLY WHAT MAKES THE RECORD USEFUL IN COURT
AND EXACTLY WHAT MAKES IT DANGEROUS.**

| Who | May read |
|---|---|
| ⚠️ **A platform** | ⚠️ **Its own agreements only.** ⬜ **At what grain — MA-05** |
| ⚠️ **A member** | ⚠️ **Their own, by V.A.I.** |
| ⚠️ **ChainPass operations** | ⚠️ **The record. Not the identity behind it** |
| ⚠️⚠️ **THE V.A.I. TO LEGAL NAME JOIN** | ⚠️⚠️ **A SEPARATE NAMED AUTHORITY. NOT HELD BY DEFAULT. EVERY EXECUTION LOGGED WITH WHO, WHEN AND UNDER WHAT AUTHORITY, AND THAT LOG IS ITSELF APPEND-ONLY.** |

⚠️⚠️ **AN UNLOGGED JOIN IS THE FAILURE MODE THAT ENDS THE COMPANY. BUILD THE LOG BEFORE
THE JOIN.**

---

# 8 — THE EVIDENCE PACKAGE

⚠️ **One command, so that producing it is never an improvised export under deadline.**

| # | |
|---|---|
| 1 | The agreement row and every party row |
| 2 | The contract bytes, exactly as registered |
| 3 | ⚠️ **Both hashes, shown to match** |
| 4 | Every serve event |
| 5 | ⚠️⚠️ **THE LEDGER SEGMENT AND THE SIGNED DAILY HEADS EITHER SIDE OF IT** |
| 6 | A statement of method — how the hashes were computed and how the chain verifies |

⚠️ **Signed at export. The export is itself logged.**

---

# 9 — RETENTION

| # | |
|---|---|
| 1 | ⚠️⚠️ **FOREVER. NO EXPIRY, NO ARCHIVE-AND-PURGE, NO TIDY-UP JOB.** |
| 2 | ⚠️ **A lapsed credential does not remove an agreement.** |
| 3 | ⚠️ **A re-baseline does not disturb one — same V.A.I., same history.** ⚠️⚠️ **DO NOT BUILD AN INVALIDATION PATH.** |
| 4 | ⚠️ **A terminated platform's contracts retire.** ⚠️⚠️ **ITS AGREEMENTS STAY.** |
| 5 | ⬜ **Erasure requests against this record — MA-05.** |

---

# 10 — WHAT A PLATFORM BUILDS. THREE THINGS.

| # | |
|---|---|
| 1 | **Register each contract once and record the `contract_id` it gets back.** ⚠️ **An operations step, not running code.** |
| 2 | **At the moment of agreement, send the `contract_id` and the V.A.I. numbers.** |
| 3 | **Store the agreement number that comes back.** |

⚠️⚠️ **THE PLATFORM DOES NOT RENDER THE CONTRACT, DOES NOT COLLECT THE ANSWERS, DOES NOT
STAMP THE TIME, AND DOES NOT KEEP THE RECORD.**

---

# 11 — ⬜ RAISED, NOT RESOLVED

| # | | Whose |
|---|---|---|
| 1 | ⚠️ **Single-party and two-party run one machinery.** The enrolment signature agreement and law enforcement disclosure are `parties = 1` on this registry. | Owner |
| 2 | ⬜ **What a platform may read of its own agreement records.** | Owner + MA-05 |
| 3 | ⬜ **Erasure and records-of-obligation — §9 item 5.** | MA-05 |
| 4 | ⬜ **A member reading their own agreements is a screen that exists in no canon.** ⚠️ **Not blocking. Recorded so it is not invented later.** | Owner |

---

# 12 — WHAT THIS CHANGES AT SOURCE

| # | Target | Change |
|---|---|---|
| 1 | `CANON-CP-01` §14.2 | **The agreement machinery becomes the contract registry.** The identifier standard, the hash, the chain and the one-way door are new. |
| 2 | `CANON-CP-01` §14.6 | **Gains a registry surface** — register · fetch · retire · open · display · record · search. |
| 3 | `CANON-CP-01` §16.2 | **Five tables.** ⚠️⚠️ **WRITE-ONCE BY CONSTRAINT AND REVOKED PRIVILEGE.** |
| 4 | `CANON-CP-01` §14.7 | **The master dashboard gains search by agreement number and by V.A.I.** |
| 5 | `CANON-SA-01` §2 | ⚠️⚠️ **THE MUTUAL CONSENT CONTRACT IS A `parties = 2` REGISTERED CONTRACT, DISPLAYED BY CHAINPASS.** ⚠️ **Vairify recording the version and proof of display is superseded — that moves.** |
| 6 | `DESIGN-BRIEF-CP-01` CP-07 | ⚠️ **The machinery is defined.** ⚠️⚠️ **WHICH DOCUMENT THE SIGNATURE AGREEMENT IS REMAINS UNRULED AND STILL BLOCKS THAT SCREEN.** |

---

# CHANGELOG

| Date | # | Change | Reasoning |
|---|---|---|---|
| **25 Aug** | 1 | Filed. | A platform sends a contract number and the V.A.I. numbers. |
| **25 Aug** | 2 | §2 — serve by reference, never by value. | ⚠️⚠️ **IF THE PLATFORM SUPPLIES THE WORDS AT SERVE TIME, IMMUTABILITY DESCRIBES A ROW NOBODY READS.** |
| **25 Aug** | 3 | §4.3 — a party table rather than two columns. | ⚠️⚠️ **TWO COLUMNS ON ONE ROW HIDE THE SECOND PARTY FROM AN INDEX. SEARCH BY V.A.I. WAS THE REQUIREMENT.** |
| **25 Aug** | 4 | §4.5 — a chained append-only ledger with signed daily heads. | ⚠️⚠️ **A ROW HASH PROVES NOTHING AGAINST SOMEONE WHO CAN EDIT THE ROW.** |
| **25 Aug** | 5 | §4.6 — ChainPass's clock, UTC with offset, and the ledger stamp authoritative. | ⚠️ **Timestamps are the first thing attacked in a dispute. A chained one cannot be moved.** |
| **25 Aug** | 6 | §7 — the legal-name join is a named authority and every execution is logged. | ⚠️⚠️ **THE RECORD IS USEFUL BECAUSE IT RESOLVES TO A PERSON. THAT IS THE SAME REASON IT IS DANGEROUS.** |
| **25 Aug** | 7 | ⚠️⚠️ **v3 — THE WHOLE AGREEMENT RUNS INSIDE CHAINPASS.** The platform no longer displays the contract or reports the answers. §2, §4.3, §6 and §10 rewritten. | ⚠️⚠️ **OWNER RULING. IT ALSO CLOSES THE ONE OPEN RISK IN v2 — A PLATFORM THAT NEVER ASSERTS AN ANSWER CANNOT ASSERT A FALSE ONE, AND EVERY ANSWER BECOMES CHAINPASS'S OWN FIRST-HAND OBSERVATION RATHER THAN A REPORT.** |

---

**Deposited 25 August 2026 to `chainpass-app/docs/`.** Supersedes v1 and v2 of the same number.
