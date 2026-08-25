# RULINGS-CP-05 — THE SERVICE STATE CONTROL

**Owner ruling, 25 August 2026. ChainPass declares its own outages from the master
dashboard. `CANON-MI-36` §2 step 1 requires a declaration and nothing existed to make one.**

⚠️⚠️ **AMENDS `CANON-CP-01` §14.7 AND §SUPPLIER OBLIGATIONS.**

---

# 1 — THE CONTROL

⚠️⚠️ **ONE CONTROL PER SUBSYSTEM. THEY SHIP SEPARATELY, SO THEY FAIL SEPARATELY —
`CANON-MI-36` §2.2.**

| Subsystem | |
|---|---|
| **THE MATCHER** | comparisons |
| **THE IMAGE SERVE** | serving a stored photograph to a screen |

⚠️ **Each carries its own state. Both down is two declarations, not one.**

---

# 2 — THREE STATES

| State | | |
|---|---|---|
| ⚠️⚠️ **AUTO** | ⚠️⚠️ **THE DEFAULT** | ChainPass's own probe drives the signal |
| **DECLARED DOWN** | operator sets it | ⚠️ Regardless of what the probe says |
| **DECLARED UP** | operator overrides a probe | ⚠️⚠️ **REASON MANDATORY. EXPIRY MANDATORY.** |

## 2.1 — AUTO

| # | |
|---|---|
| 1 | ⚠️ **The probe is ChainPass's own `/health` — `models_loaded` for the matcher, a real fetch for the image serve.** |
| 2 | ⚠️⚠️ **THIS IS NOT INFERENCE. CHAINPASS READING ITS OWN HEALTH IS A SUPPLIER KNOWING ITS OWN STATE. `CANON-MI-36` §2.1 FORBIDS A *PLATFORM* INFERRING FROM SYMPTOMS, AND THAT STANDS.** |
| 3 | ⚠️⚠️ **HYSTERESIS BOTH WAYS. N CONSECUTIVE FAILURES TO DECLARE DOWN. M CONSECUTIVE SUCCESSES TO CLEAR. BOTH ARE SETTINGS.** ⚠️ **A signal that flaps is worse than one that is late — every flap moves every platform's door.** |
| 4 | ⚠️ **Probe interval is a setting.** |

## 2.2 — DECLARED DOWN

| # | |
|---|---|
| 1 | ⚠️ **For planned maintenance, a known-bad model, or a fault the probe cannot see.** |
| 2 | ⚠️ **A scheduled window is a declared-down with a start time.** |
| 3 | ⚠️ **Clearing it returns the control to AUTO, never straight to up.** |

## 2.3 — ⚠️⚠️ DECLARED UP — THE DANGEROUS ONE

| # | |
|---|---|
| 1 | ⚠️ **For a broken probe against a working service.** |
| 2 | ⚠️⚠️ **A REASON IS MANDATORY AND IS STORED.** |
| 3 | ⚠️⚠️ **AN EXPIRY IS MANDATORY. IT CANNOT BE SET TO NEVER. ON EXPIRY THE CONTROL RETURNS TO AUTO WITHOUT ANYONE ACTING.** |
| 4 | ⚠️⚠️ **AN OVERRIDE LEFT ON FOREVER IS HOW A DEAD MATCHER STAYS "UP" AND EVERY FACE FAILS WITH NO EXPLANATION.** |

---

# 3 — ⚠️⚠️ THE DEFAULT, AND WHAT UNKNOWN MEANS

⚠️⚠️ **THE CONTROL BOOTS IN AUTO. IT IS NEVER DEPLOYED IN A DECLARED STATE.**

⚠️⚠️ **BEFORE THE FIRST PROBE ANSWERS, THE STATE IS UNKNOWN, AND UNKNOWN IS SERVED AS
DOWN.**

| # | Why |
|---|---|
| 1 | ⚠️ **Serving unknown as up means every face fails with no explanation and no alternate door.** |
| 2 | ⚠️ **Serving unknown as down opens the V.A.I.-plus-question door. The user gets in. It costs one extra step.** |
| 3 | ⚠️⚠️ **THE EXPENSIVE FAILURE IS A LOCKED-OUT USER. THE CHEAP ONE IS AN EXTRA QUESTION. FAIL TOWARDS THE CHEAP ONE.** |
| 4 | ⚠️ **The window is seconds. The probe answers at boot.** |

---

# 4 — WHO MAY FLIP IT

| # | |
|---|---|
| 1 | ⚠️⚠️ **SUPER ONLY. A NAMED AUTHORITY, NOT A ROLE HELD BY DEFAULT.** |
| 2 | ⚠️⚠️ **NO PLATFORM MAY DECLARE CHAINPASS DOWN. NOT ITS OWN DASHBOARD, NOT BY API, NOT BY ANY ROUTE.** |
| 3 | ⚠️⚠️ **EVERY CHANGE IS LOGGED APPEND-ONLY: WHO, WHEN, FROM WHAT STATE, TO WHAT STATE, AND WHY.** ⚠️ **Same discipline as the legal-name join — `SPEC-CP-02` §7.** |
| 4 | ⚠️ **The log is readable in the dashboard. An outage nobody can reconstruct afterwards is an outage that will happen again.** |

---

# 5 — THE SIGNAL

⚠️ **One endpoint. One answer. Named subsystems.**

| # | |
|---|---|
| 1 | ⚠️⚠️ **THE ANSWER NAMES WHICH SUBSYSTEM IS DOWN — THE MATCHER, THE IMAGE SERVE, OR BOTH.** ⚠️ **A platform words its notice differently depending on which.** |
| 2 | ⚠️ **A short cache TTL, set by a setting.** ⚠️⚠️ **LONG ENOUGH TO SURVIVE TRAFFIC, SHORT ENOUGH THAT A DECLARATION REACHES EVERY PLATFORM IN UNDER A MINUTE.** |
| 3 | ⚠️⚠️ **THE SIGNAL NEVER SAYS WHY. NOT THE CAUSE, NOT THE MODEL, NOT THE HOST.** ⚠️ **A platform tells its members what ChainPass states and never improvises** — `CANON-CP-01` §SUPPLIER OBLIGATIONS item 3. |
| 4 | ⚠️ **The signal is public to platforms and requires no credential to read** — a platform that cannot authenticate still needs to know the door has moved. |

---

# 6 — THE DASHBOARD

⚠️ **`CANON-CP-01` §14.7 gains one panel.**

| # | |
|---|---|
| 1 | **Two controls, one per subsystem, each showing the live state and what is driving it — probe or declaration.** |
| 2 | **The probe's last result and its timestamp, so an operator can see whether AUTO is working before overriding it.** |
| 3 | ⚠️ **A declared-up override shows its expiry as a countdown.** |
| 4 | **The change log, most recent first.** |
| 5 | ⚠️⚠️ **NO NUMBER ON THIS PANEL IS A CONSTANT. THE HYSTERESIS COUNTS, THE PROBE INTERVAL AND THE CACHE TTL ARE ALL SETTINGS WITH ADMIN FIELDS.** |

---

# 7 — ⬜ OPEN

| # | | Whose |
|---|---|---|
| 1 | **The hysteresis counts and the probe interval — the actual numbers.** ⚠️ **Measured, not guessed. They stay UNSET until the pilot.** | Pilot |
| 2 | ⬜ **Does a declared outage notify platforms, or do they poll?** ⚠️ **Polling is simpler and needs nothing built platform-side. A push reaches them faster.** | Owner |
| 3 | ⬜ **Whether a scheduled maintenance window is announced to members in advance, and by whom.** | Owner + MA-02 |

---

# 8 — WHAT THIS CHANGES AT SOURCE

| # | Target | Change |
|---|---|---|
| 1 | `CANON-CP-01` §14.7 | **The master dashboard gains the service state panel.** |
| 2 | `CANON-CP-01` §SUPPLIER OBLIGATIONS | **The health signal now has a control that sets it.** ⚠️ **It described an output nothing produced.** |
| 3 | `CANON-CP-01` §16.2 | **`service_state` and `service_state_log`.** ⚠️ **The log append-only by constraint.** |
| 4 | `CANON-MI-36` §2 step 1 | ⚠️ **"ChainPass declares it" is now buildable.** |

---

# CHANGELOG

| Date | # | Change | Reasoning |
|---|---|---|---|
| **25 Aug** | 1 | Filed. | `CANON-MI-36` §2 requires a declaration and nothing in the product could make one. The signal was an output with no input. |
| **25 Aug** | 2 | §2 — three states, AUTO the default. | ⚠️ **Manual-only means an outage lasts until someone notices. Automatic-only means a flapping probe moves every platform's door. AUTO with hysteresis, and a human who can override in both directions.** |
| **25 Aug** | 3 | §2.3 — a declared-up override must carry a reason and an expiry, and cannot be set to never. | ⚠️⚠️ **AN OVERRIDE LEFT ON IS HOW A DEAD MATCHER STAYS "UP" AND EVERY FACE FAILS SILENTLY.** |
| **25 Aug** | 4 | §3 — unknown is served as down. | ⚠️⚠️ **THE EXPENSIVE FAILURE IS A LOCKED-OUT USER. THE CHEAP ONE IS AN EXTRA QUESTION.** |
| **25 Aug** | 5 | §5 item 4 — the signal needs no credential. | ⚠️ **A platform that cannot authenticate still needs to know the door has moved.** |

---

**Deposited 25 August 2026 to `chainpass-app/docs/canon/`.**
