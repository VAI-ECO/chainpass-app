# CANON-CP-01 — CHAINPASS

⚠️⚠️ **THIS IS WHAT CHAINPASS DOES. THE OWNER SAID IT. IT IS THE STANDARD.**

> ⚠️⚠️ **THE CODE IS MEASURED AGAINST THIS DOCUMENT. IF THE CODE DOES NOT DO THIS, THE CODE
> IS WRONG.**

**16 August 2026. Written from the owner's own description. NOT derived from code.**

⚠️⚠️ **AMENDED 20 AUGUST 2026. THIS IS THE ONLY CHAINPASS CANON. `CANON-CP-03` IS FOLDED
INTO IT AND IS DELETED — TWO FILES COVERING THE SAME GROUND IS THE CONFLICT THIS PROJECT
SPENT A DAY ELIMINATING.**

⚠️⚠️ **CHAINPASS IS AN INFRASTRUCTURE COMPANY. AN AGE AND IDENTITY VERIFICATION COMPANY. IT
IS NOT ASSOCIATED WITH ANY INDUSTRY ITS PLATFORMS SERVE.**


# 0 — ⚠️⚠️ THE GRT — GOLDEN ROSE TOKEN. RULED 23 AUGUST 2026.

⚠️⚠️ **THE GRT IS A CHAINPASS SERVICE. TOKEN ISSUANCE AS A SERVICE. VAIRIFY IS ONE CUSTOMER.**

| # | |
|---|---|
| 1 | ⚠️⚠️ **CHAINPASS PROCESSES THE PURCHASE AND REMITS 95% TO THE PLATFORM THAT DELIVERED THE VALUE. THE 5% IS THE FEE, TAKEN AT SPEND.** |
| 2 | ⚠️⚠️ **REMITTANCE IS AT SPEND, NOT AT PURCHASE.** |
| 3 | ⚠️⚠️ **CHAINPASS NEVER HOLDS THE BALANCE AS ITS OWN. THE MONEY IS THE PLATFORM'S. CHAINPASS IS THE PROCESSOR OF RECORD.** |
| 4 | ⚠️ **Standard tokens — the Golden Rose — spend across every platform that accepts the standard. Custom tokens are one platform only.** |
| 5 | ⚠️⚠️ **THE PEG IS ONE ROSE, ONE DOLLAR, EVERYWHERE. WHAT VARIES IS WHAT A PLATFORM CHARGES IN TOKENS FOR ITS OWN GOODS.** |

⚠️ **Adult platforms struggle to obtain payment processing. ChainPass is an identity company and is not associated with any industry its platforms serve** — §0 of this canon. **It can hold a processor relationship the platforms cannot.**

⚠️⚠️ **THE MEMBER ALREADY GAVE CHAINPASS THE MEMBER VERIFIED IDENTITY. GIVING CHAINPASS A CARD REVEALS NOTHING NEW. GIVING IT TO THE PLATFORM LINKS THE MEMBER CARD TO AN ADULT PLATFORM.**

Source: `RULINGS-VA-03` §3 · §6.

---

---
---

# PART ONE — V.A.I. CREATION

---

# 1 — ⚠️⚠️ TWO ENTRY PATHS

| | From | ⚠️ What they see |
|---|---|---|
| **1** | ⚠️ **A PLATFORM** | ⚠️⚠️ **NO CHOICE. The platform's requirements and price are already set.** |
| **2** | ⚠️ **DIRECT TO CHAINPASS** | ⚠️ **They choose.** |

## 1.1 — Arriving from a platform

⚠️⚠️ **THE PLATFORM HAS ALREADY DECIDED. THERE IS NOTHING TO PICK.**

## 1.1a — ⚠️⚠️ THE PRICE — RULED

| Product | Price | |
|---|---|---|
| ⚠️ **V.A.I.** | ⚠️⚠️ **`settings:price_vai`** | **Admin-changeable** |
| ⚠️ **V.A.I. PRO** | ⚠️⚠️ **`settings:price_vai_pro`** | **Admin-changeable** |

### ⚠️⚠️ EVERY PRICE IS ADMIN-ADJUSTABLE. NO PRICE IS EVER A CONSTANT.

⚠️⚠️ **THIS COVERS EVERY FIGURE CHAINPASS CHARGES OR PAYS — CREDENTIAL PRICES AT EVERY
LEVEL, THE UPGRADE DIFFERENCE, VERIFICATION BLOCK PRICING, COMMISSION RATES AND CAPS,
COUPON VALUES, AND ANYTHING PRICED LATER THAT DOES NOT EXIST YET.**

| # | |
|---|---|
| 1 | ⚠️⚠️ **A PRICE LIVES IN A ROW AND IS CHANGED IN THE MASTER DASHBOARD. NEVER IN CODE, NEVER IN A CONFIG FILE, NEVER IN A DEPLOY** — §14.7. |
| 2 | ⚠️⚠️ **A PRICE CHANGE NEVER REACHES BACKWARDS. WHAT SOMEONE PAID IS WHAT THEY PAID, AND AN ACCRUED COMMISSION IS ACCRUED AT THE RATE THAT WAS LIVE WHEN IT WAS EARNED.** |
| 3 | ⚠️ **Commission rules live on the platform agreement, so two platforms may carry different rates at the same moment** — §2.8 item 4. |
| 4 | ⚠️ **The same rule already binds every other operational figure: band thresholds, the attempt count, the deferral window, retention.** ⚠️⚠️ **NOBODY KNOWS THE RIGHT NUMBER UNTIL THE PILOT MEASURES IT.** |

⚠️ **The upsell difference is the difference between them. It is a placeholder, not a stored
figure.**

### ⚠️⚠️ WHO SETS THE PRICE — RULED 20 AUGUST

| | |
|---|---|
| ⚠️ **THE PLATFORM SETS THE REQUIREMENT** | **Which level. Which documents. Which services.** ⚠️ **Vairify requires Pro, the signature agreement, the law enforcement declaration and a background check.** |
| ⚠️⚠️ **CHAINPASS SETS THE PRICE** | ⚠️⚠️ **ALWAYS. A PLATFORM CANNOT CHANGE IT.** ⚠️ **A platform that wants someone in for less issues a COUPON and absorbs the difference** — `CANON-MI-27`. |

❌ ⚠️⚠️ **NO CHAINPASS SURFACE MAY SAY A CREDENTIAL PRICE IS "SET BY THE PLATFORM". THAT
SENTENCE SAYS THE TWO COMPANIES ARE ONE OPERATION.**

✅ **Correct: "Vairify requires Pro. The price is ChainPass's."**

⚠️ **The reverse rule binds the platform: a Vairify surface may publish what VAIRIFY PAYS
toward a credential, never ChainPass's price list** — `REF-TIERS-01` §9.1.

⚠️⚠️ **`BRIEF-CP-01`'s "$99 every holder, no tiers and no discounts" IS STALE.**

⚠️ **At launch there is one platform: Vairify. And Vairify Pro.**

### ⚠️⚠️ ONE ENROLMENT FLOW. THE LEVEL IS A GATE — RULED 22 AUGUST

⚠️⚠️ **ONE ENROLMENT FLOW. ONE CREDENTIAL. THE LEVEL DOES NOT CHANGE HOW THE MEMBER ENROLS.** ⚠️
**Common to every level: register · contact · KYC capture · reveal · acceptance (terms and
second capture). Pro adds the platform's own requirements on top — nothing else differs.**

| # | |
|---|---|
| 1 | ⚠️⚠️ **DO NOT BUILD SEPARATE FLOWS FOR ACCESS, V.A.I. AND PRO. THERE IS ONE FLOW.** |
| 2 | ⚠️⚠️ **THE PLATFORM SETS THE GATE. A PLATFORM THAT REQUIRES V.A.I. REJECTS AN ACCESS HOLDER AT ITS DOOR.** |
| 3 | ⚠️ **Rejection at a platform door is a platform switch, not a ChainPass build.** |
| 4 | ⚠️ **The value of a higher level is what a platform lets the member do inside, not a different enrolment.** |
| 5 | ⚠️⚠️ **ACCESS AND V.A.I. PLATFORMS: UP TO THREE PLATFORM REQUIREMENTS AT THEIR DOOR. PRO: UNCAPPED — §4C · `RULINGS-CP-03` §3.** |

## 1.2 — ⚠️ The upsell

> ⚠️ **"We should basically try to upsell them at that point."**

**At the pay screen: what Pro is · which other platforms are on Pro · what the credential
opens beyond the one door they came through.**

⚠️ **"For now, we can leave it."** ⬜ **Designed, not built first.**

---

# 2 — ⚠️⚠️ THE SEQUENCE — ⚠️⚠️ AMENDED 25 AUGUST · `CANON-CP-02` §1 GOVERNS

⚠️⚠️ **THIS BLOCK IS `CANON-CP-02` §1. IT REPLACES THE EARLIER SEQUENCE IN THIS FILE.
THE CODE IS MEASURED AGAINST THIS BLOCK.**

```
1  ⚠️ LANDING                          the platform's client lands — signed token — §2.5
        ↓
2  ⚠️⚠️ PAY                            first after landing — `CANON-CP-02` §1
        ↓                              ⚠️ the platform's deferral offer — §4A
3  ⚠️ SESSION KEY                      created here — `CANON-CP-02` §1
        ↓
4  ⚠️ THE KYC PROVIDER                 outside the walls — document + live face check
        ↓
5  ⚠️ BASELINE PHOTO                   ChainPass owns the camera
        ↓
6  ⚠️ BACKGROUND / CUSTOM CHECKS       real details checked outside — §4
        ↓
7  ⚠️⚠️ THE V.A.I. IS CREATED          7 characters — no name in it — §2.3a
        ↓
8  ⚠️ CONTACT AND OTP                  collection spec — never a legal name — §2.3
        ↓
9  ⚠️ SIGN                             law enforcement · signature · terms — §4C · §4D · §14.3
        ↓
10 ⚠️ FACE MATCH                       one match — confirms it is the same person
        ↓
11 ⚠️ RETRIEVAL PAGE                   questions + backup codes — platform-branded — §2.10
        ↓
11a ⚠️ FINAL V.A.I. PAGE               shown once more · remember on this device? — `CANON-CP-02` §1.1
        ↓
12 ⚠️ THE HANDOFF                      V.A.I. + session key
        ↓
13 ⚠️ KEY DELETED                      ChainPass deletes its copy — §2.4
```

## 2.1 — ⚠️⚠️ THE WARNING COMES BEFORE THE MEMBER PAYS

> ⚠️ **"I don't want them to pay and then tell them we're going to plaster law enforcement
> all over the place."**

⚠️⚠️ **A DISCLOSURE THE MEMBER LEARNS ABOUT AFTER THE MONEY IS SPENT IS NOT A CHOICE. THE MEMBER CANNOT WALK
AWAY WITHOUT LOSING THE FEE.**

**Screen 2 states, plainly:**

| # | |
|---|---|
| 1 | ⚠️ **A background check will run.** |
| 2 | ⚠️ **The member will be asked to declare law enforcement affiliation.** |
| 3 | ⚠️⚠️ **NEITHER EXCLUDES THE MEMBER.** |
| 4 | ⚠️ **A result may show on the platform, and the member will be shown exactly what that looks like before the member answers** — §7 |

> ⚠️ **"If they choose to do it anyway, they already know. So our danger is not showing, and
> somebody getting arrested."**

⚠️⚠️ **SHOWING IT IS THE DEFENCE. HIDING IT IS THE EXPOSURE.**

## 2.2 — ⚠️ The provider is EMBEDDED, not a redirect

⚠️⚠️ **THE MEMBER NEVER LEAVES CHAINPASS.** **The provider's flow runs in a frame.**

⚠️ **The pilot proved this and it converts better than a redirect out and back.**

⚠️ **The frame is theirs. ChainPass does not design what is inside it.**

## 2.3 — ⚠️⚠️ REGISTRATION HAPPENS AT CHAINPASS, BEFORE THE HANDOFF

⚠️⚠️ **THIS CLOSES A REAL HOLE.** **Without it the member leaves with a seven-character number on a
screen and nothing anywhere** — no account, no email, and one person one V.A.I. means the member
cannot get another.

| # | |
|---|---|
| 1 | ⚠️ **CONTACT — AND WHATEVER THE PLATFORM'S COLLECTION SPEC ADDS. MINIMUM: A CONTACT PLUS TERMS ACCEPTED BEFORE BASELINE — TERMS AT THE ACCEPTANCE PAGE — §14.3.** ❌ ⚠️⚠️ **NEVER A LEGAL NAME.** ⚠️ **Username only when the platform's collection spec includes it — not a ChainPass requirement.** |
| 1b | ⚠️⚠️ **THE COLLECTION SPEC LIVES ON THE PLATFORM AGREEMENT AND SUPPORTS "AT LEAST ONE OF" GROUPS. IT IS NOT A FLAT LIST.** ⚠️ **Vairify's group is {email, phone}. Another platform picks differently. A Standard age-gate platform may collect nothing at all.** |
| 2 | ⚠️ **The member chooses which receives the OTP.** |
| 3 | ⚠️⚠️ **THE NUMBER SCREEN COMES AFTER THE OTP, SO THERE IS SOMEWHERE TO SEND IT.** |
| 4 | ⚠️⚠️ **THE PLATFORM HAS NO REGISTRATION FORM FOR IDENTITY OR SECURITY. CHAINPASS COLLECTS CONTACT HERE; TERMS AT STEP 8; THE THREE SECURITY QUESTIONS AND RECOVERY CONTACT AT STEP 12 — §2.10.** ⚠️ **One custodian, one record, no copy in a platform's database.** |

### ⚠️⚠️ WHY THE LEGAL NAME NEVER LEAVES — §2.9

⚠️⚠️ **CHAINPASS VERIFIED THE LEGAL NAME AT THE PROVIDER AND KEEPS IT. HANDING IT TO A
PLATFORM IS NOT A COURIER DELIVERING. IT IS CHAINPASS DISCLOSING.** ⚠️ **The anonymity is
the product.**

## 2.3a — ⚠️⚠️ ISSUED AT REVEAL. ACTIVATION IS SEPARATE — RULED 22 AUGUST

⚠️⚠️ **THE NUMBER IS THE MEMBER'S THE MOMENT IDENTITY IS PROVEN AT STEP 7, WHETHER THE MEMBER GOES FURTHER OR
NOT.** ⚠️ **The reveal is not the member ID — it is the reveal of the member V.A.I. number.**

| # | |
|---|---|
| 1 | ⚠️ **In substance the screen says: ChainPass has identified you. This number is yours. Complete registration and terms to activate it.** |
| 2 | ⚠️⚠️ **AN ISSUED-BUT-UNACTIVATED CREDENTIAL IS A REAL STATE ON THE CREDENTIAL ROW AND NEEDS A SCREEN THAT PLAINLY STATES WHAT THE MEMBER HAS AND WHAT IS MISSING.** |
| 3 | ⚠️ **Nothing downstream may assume the number appears later than step 7.** |

## 2.4 — ⚠️⚠️ THE SESSION KEY IS DELETED AT THE HANDOFF, NOT AT ISSUANCE

⚠️ **Between coming back from the provider and being handed off, ChainPass still holds its
copy.**

⚠️⚠️ **SO A POWER CUT, A DEAD PHONE OR A CRASHED BROWSER IS RECOVERABLE.** **The member re-runs the
provider, the provider sees a duplicate and returns the same session key, ChainPass matches
it, and the member lands back where the member was.**

⚠️ **The deletion is still commercially irrational and still happens. Only the trigger is
precise.**

⚠️⚠️ **§12 ITEM 6 IS THE OPEN THAT MATTERS HERE. CHAINPASS STILL HOLDS
`credentials.complycube_client_id`, NOT NULL, READ AFTER ENROLMENT BY FOUR FUNCTIONS. THAT
IS THE KEY IT MUST DELETE. UNTIL IT DOES, THE PATENT GATE IS UNMET AND THIS SECTION
DESCRIBES AN INTENTION, NOT A BUILD.**

## 2.4a — ⚠️⚠️ HOW THE SESSION KEY IS DELIVERED — RULED 20 AUGUST

⚠️⚠️ **IT RIDES IN THE HANDOFF PAYLOAD ITSELF — THE SAME SERVER-TO-SERVER RESPONSE THAT
CARRIES THE V.A.I. AND THE COLLECTED FIELDS. DELIVERED ONCE, TO THE PLATFORM WHOSE SIGNED
TOKEN OPENED THE ENROLMENT.**

| # | |
|---|---|
| 1 | ❌ ⚠️⚠️ **NOT A SEPARATE ENDPOINT. NOT PULLABLE LATER. NOT RE-SENDABLE.** |
| 2 | ⚠️⚠️ **A RE-SEND IS IMPOSSIBLE BY CONSTRUCTION — CHAINPASS DELETED ITS COPY AT THE HANDOFF. THE API RETURNING "NO LONGER HELD" IS THE PATENT CLAIM BEHAVING.** |
| 3 | ⚠️ **No read path exists even during the enrolment window. The handoff push is the only delivery.** |

## 2.4b — ⚠️⚠️ LOST-KEY RECOVERY RUNS THROUGH THE PERSON — RULED 20 AUGUST

> ⚠️⚠️ **"IF THE INDIVIDUAL GETS BACK TO THE PROVIDER, THAT SESSION KEY STILL LIVES WITH
> THE PROVIDER."**

⚠️⚠️ **THE SESSION KEY WAS NEVER THE ONLY COPY OF ANYTHING. IT IS A POINTER, AND WHAT IT
POINTS TO STILL EXISTS AT THE PROVIDER FOR ITS RETENTION WINDOW.**

```
the platform lost its keys
        ↓
⚠️ THE MEMBER SHOWS UP, LIVE, AT A CAMERA
        ↓
the member runs the provider flow
        ↓
⚠️ THE PROVIDER'S DUPLICATE DETECTION FIRES · returns the same session key
        ↓
ChainPass matches the V.A.I.
        ↓
⚠️⚠️ THE PLATFORM RECEIVES ITS KEY AGAIN — A HANDOFF, NOT A LOOKUP
```

| # | |
|---|---|
| 1 | ⚠️⚠️ **RECOVERY, NEVER RETRIEVAL. NO ENDPOINT RETURNS KEYS** — §14.6. ⚠️⚠️ **RECOVERY REQUIRES THE MEMBER, LIVE. A LOST DATABASE COMES BACK ONE PERSON AT A TIME AS THEY SHOW UP.** ⚠️ **That punishes the platform's negligence without punishing the member.** |
| 2 | ⚠️ **Nothing is re-issued from storage because nothing is stored. The key is re-derived from the member face and the member document, which is strictly better than a backup.** |
| 3 | ⚠️ **This is §2.4's recovery mechanism generalised: the same duplicate-detection path that saves a crashed enrolment saves a platform's lost database.** |
| 4 | ⚠️⚠️ **ONE PROVIDER TODAY, SO RECOVERY IS UNAMBIGUOUS.** ⬜ ⚠️⚠️ **AT TWO OR MORE PROVIDERS THIS BREAKS: THE PROVIDER IS ENCODED ONLY IN THE KEY, WHICH IS THE THING THAT IS LOST. THE DERIVATION MUST BE SOLVED BEFORE A SECOND PROVIDER IS ADDED — §3'S OPEN SPEC, NOW LOAD-BEARING.** |

## 2.4c — ⚠️⚠️ THE VAULT MODULE — RULED 20 AUGUST

> ⚠️⚠️ **"WE'RE NOT REALLY PREVENTING ACCESS. WE'RE PREVENTING LOSS."**

⚠️⚠️ **CHAINPASS SHIPS A VAULT MODULE. THEIR SIDE, OUR DESIGN, DISASSOCIATED BY
CONSTRUCTION. OFFERED TO EVERY PLATFORM AT ONBOARDING — THEY SET IT UP ON THEIR OWN.**

| # | |
|---|---|
| 1 | ⚠️⚠️ **A SIDECAR, NOT A TABLE. SESSION KEYS NEVER SIT IN THE PLATFORM'S MAIN DATABASE AS A COLUMN BESIDE THE V.A.I.** ⚠️ **The module is its own encrypted store, deployed separately. The app asks it "session key for this V.A.I."; it answers. Breach the main database and you hold V.A.I. numbers and no keys.** |
| 2 | ⚠️⚠️ **DISASSOCIATED MEANS THE JOIN IS COMPUTED, NEVER STORED.** ⚠️ **Keys are indexed by a blind tag — `HMAC(platform_secret, VAI)` — and the secret lives in their runtime, not in the vault file.** ⚠️⚠️ **A HACKER WHO STEALS THE VAULT FILE HOLDS CIPHERTEXT UNDER KEYS THE MEMBER DOESN'T HAVE, INDEXED BY TAGS THE MEMBER CANNOT COMPUTE. THE FILE ALONE IS NOISE.** |
| 3 | ⚠️⚠️ **LOSS-PROOFING IS THE MODULE'S JOB.** **Automatic encrypted replication to a second location of theirs, and optionally a sealed copy lodged at ChainPass.** ⚠️ **Loss requires losing the vault, the replica and the runtime secret simultaneously.** |
| 4 | ⚠️⚠️ **THE SEALED COPY AT CHAINPASS IS OPAQUE TO CHAINPASS. IT IS UNDER THEIR VAULT KEY — WE STORE NOISE AS A FAVOUR.** ⚠️ **The vault key is generated on their machine at install. We never see it.** ⚠️⚠️ **THE DELETION STORY HOLDS: WE HOLD NO SESSION KEY AND NO READABLE ANYTHING.** |
| 5 | ⚠️ **Recovery is "restore the replica." No ceremony, no member participation.** ⚠️ **§2.4b — recovery through the person — remains the path of last resort when everything is gone.** |
| 6 | ⚠️⚠️ **OFFERED, NEVER REQUIRED. EACH PLATFORM ELECTS IT AT ONBOARDING AND RUNS ITS OWN SETUP** — §14.2b. ⚠️ **A platform that declines and later loses its keys has §2.4b and nothing else.** |

⬜ ⚠️ **MA-05: confirm §2.4's deletion language accommodates custody of opaque,
platform-keyed blobs.**

## 2.5 — ⚠️⚠️ THE PLATFORM ID RIDES IN A SIGNED TOKEN — RULED 20 AUGUST

⚠️⚠️ **NEVER A QUERY PARAMETER. A URL IS A BROWSER HISTORY, A SERVER LOG AND A
SCREENSHOT.**

## 2.6 — ⚠️⚠️ THE BIOMETRIC CONSENT — RULED 20 AUGUST

⚠️⚠️ **CHAINPASS'S OWN AGREEMENT WITH THE MEMBER, SIGNED AT STEP 2, BEFORE ANY CAPTURE. IT IS THE
ONE SIGNING IN THE WHOLE SYSTEM THAT CAN NEVER BE WAIVED.**

| # | |
|---|---|
| 1 | ⚠️⚠️ **CONSENT OBTAINED AFTER A CAPTURE IS NOT CONSENT.** ⚠️ **BIPA and GDPR both require it before collection.** |
| 2 | ⚠️ **It is distinct from the signature agreement (§4C.2), which is the platform's, and from the platform's own terms, which the member accepts at the acceptance page — §14.3.** |
| 3 | ⚠️⚠️ **THREE CONSENT LAYERS EXIST AND ALL THREE ARE MANDATORY: CHAINPASS↔PLATFORM AT ONBOARDING · CHAINPASS↔HOLDER AT ENROLMENT · PLATFORM↔HOLDER TERMS AT ACCEPTANCE (CHAINPASS-ADMINISTERED) AND ON FIRST VISIT TO ANY OTHER PLATFORM.** |

## 2.7 — ⚠️⚠️ THE BASELINE IS THE ROOT OF TRUST — RULED 20 AUGUST · 22 AUGUST

> ⚠️⚠️ **"WE SET THE BASELINE. IT'S TRUE. BUT I HAND THE PHONE TO MY SISTER. DO WE STILL
> KEEP IT AT 100%?"**

⚠️⚠️ **VERIFYING THE DOCUMENT AGAINST PERSON A AND THEN BASELINING PERSON B PRODUCES A
CREDENTIAL THAT WORKS PERFECTLY AND BELONGS TO THE WRONG HUMAN. NOTHING DOWNSTREAM CAN
EVER DETECT IT.**

### ⚠️⚠️ TWO FRAMES BUILD THE BASELINE — `RULINGS-CP-03` §2

```
one camera session opens at step 6
   ├─ THE PROVIDER captures · runs the document-to-face check · percentage recorded
   └─ ⚠️⚠️ FRAME ONE — CHAINPASS CAPTURE FROM THE SAME LIVE FEED
        ↓
   the provider returns its verdict
   ├─ PASS → proceed to reveal and acceptance
   └─ FAIL → both frames discarded. Nothing was ever committed.
        ↓
step 8 — acceptance page
   ├─ the member checks the platform terms box (required — the member need not read them)
   └─ ⚠️⚠️ FRAME TWO — second capture runs only after the box is checked
        ↓
step 10 — both frames commit to the baseline
   ├─ ACCESS / V.A.I. — immediately after step 8
   └─ PRO — after every required document is signed at step 9
```

| # | Ruling |
|---|---|
| 1 | ⚠️⚠️ **FRAME ONE AT STEP 6. THE PROVIDER MATCH PERCENTAGE IS RECORDED WITH IT.** |
| 2 | ⚠️⚠️ **FRAME TWO AT STEP 8. NO TERMS ACCEPTED, NO SECOND CAPTURE, NO BASELINE — `RULINGS-CP-03` §8.** |
| 3 | ⚠️⚠️ **BOTH FRAMES BUILD THE BASELINE. NOT ONE HELD FRAME COMMITTED LATER.** |
| 4 | ⚠️ **ChainPass owns native-resolution frames it captured itself.** ⚠️⚠️ **NO DEPENDENCY ON THE PROVIDER RETURNING AN IMAGE. THE VERDICT AND THE PERCENTAGE ARE WHAT THE PROVIDER OWES.** |
| 5 | ⚠️⚠️ **EACH CAPTURE MUST COME FROM AN UNBROKEN CAMERA SESSION AT ITS STEP. NO EXIT, NO BACKGROUNDING, NO RESUME BETWEEN PROVIDER AND FRAME ONE, OR BETWEEN TERMS CHECK AND FRAME TWO.** |
| 5a | ⚠️⚠️ **A BREAK VOIDS THE CAPTURE AT THAT STEP, NOT THE ENROLMENT — RULED 20 AUGUST.** ⚠️ **The member resubmits at the broken step.** ⚠️⚠️ **THE PROVIDER DOES NOT CHARGE FOR A RESUBMIT. IF ONE EVER DOES, CHAINPASS EATS THE COST.** |
| 6 | ⚠️⚠️ **THE LAW ENFORCEMENT DECLARATION IS ITS OWN AFFIRMATION — NOT BUNDLED BEHIND THE TERMS CHECKBOX. ONE FACE CAPTURE MAY COVER BOTH — `RULINGS-CP-03` §9.** |

⚠️ **This is consistent with the facial stack ruling of 17 August: the enrolment captures are
ChainPass's, end to end.**

## 2.8 — ⚠️⚠️ ORIGINATION — RULED 20 AUGUST

⚠️⚠️ **ORIGINATION = THE PLATFORM WHOSE API KEY WAS ON THE ENROLMENT CALL. WRITTEN AT
ISSUE. IMMUTABLE.**

| # | |
|---|---|
| 1 | ⚠️⚠️ **IMMUTABILITY IS A DATABASE TRIGGER FORBIDDING UPDATE ON THE COLUMN. NEVER APPLICATION CODE.** |
| 2 | ⚠️⚠️ **FIRST-VISIT IS NOT ORIGINATION. A PLATFORM A HOLDER MERELY ARRIVES AT ORIGINATED NOTHING AND IS OWED NOTHING.** |
| 3 | ⚠️⚠️ **DIRECT SIGNUPS AT CHAINPASS.IO: ORIGINATION IS NULL. HOUSE ACCOUNT. NO COMMISSION EVER.** ⚠️ **Explicit in schema, or the first platform to notice starts claiming walk-ins.** |
| 4 | ⚠️ **The commission rules live on the platform agreement, never on the credential and never on the product.** ⚠️⚠️ **THE INFRASTRUCTURE READS RULES AND NEVER KNOWS THE NUMBER.** |
| 5 | ⚠️ **Payouts do not run on Stripe. The schema carries a payment-method field that assumes no processor.** |

⚠️ **This closes §13 item 4 — origination and revenue share.**

## 2.10 — ⚠️⚠️ ACCOUNT SECURITY — CHAINPASS'S, LAST — RULED 22 AUGUST

⚠️⚠️ **THE THREE SECURITY QUESTIONS, THE ONE-TIME PASSWORDS AND THE RECOVERY CONTACT ARE
COLLECTED AND HELD BY CHAINPASS — NOT BY ANY PLATFORM.** ⚠️ **Tables:
`security_questions` · `security_question_lockouts` · `security_question_attempts` ·
`security_question_options` · `recovery_codes` — `RULINGS-CP-03` §7.**

| # | |
|---|---|
| 1 | ⚠️ **Because ChainPass recovers the account. One custodian, one record, no copy in a platform's database.** |
| 2 | ⚠️⚠️ **STEP 11 IS THE RETRIEVAL PAGE — QUESTIONS AND BACKUP CODES — BEFORE THE FINAL V.A.I. PAGE AND THE HANDOFF.** |
| 3 | ⚠️ **OTP autofill on mobile: iOS one-time-code field; Android app-specific hash on the SMS send template — `RULINGS-CP-02` §6. Manual entry stays underneath. Email magic link ⬜ unruled.** |
| 4 | ⚠️⚠️ **THE RETRIEVAL PAGE IS A CHAINPASS PAGE, PLATFORM-BRANDED — `CANON-CP-02` §5 item 3.** **VAIRIFY-branded for Vairify.** **Branding is a value on the platform row (`platforms.brand`). Never a per-customer build. One template.** |

## 2.9 — ⚠️⚠️ THE HANDOFF AND THE COURIER RULE — RULED 20 AUGUST

⚠️⚠️ **CHAINPASS ONLY EVER HANDS BACK DATA IT COLLECTED ON THAT PLATFORM'S BEHALF. IT NEVER
HANDS BACK ITS OWN VERIFIED DATA.**

| Whose | What | Handed back |
|---|---|---|
| ⚠️ **THE PLATFORM'S** | **Username · email · phone** | ⚠️⚠️ **YES. THEY WERE ALWAYS THE PLATFORM'S. CHAINPASS WAS A COURIER.** |
| ⚠️⚠️ **CHAINPASS'S** | **The legal name · the document · the baseline** | ❌ ⚠️⚠️ **NEVER. DISCLOSING THEM IS THE ONE THING THE PRODUCT CANNOT DO.** |

⚠️ **The test is what each company needs to do its job. ChainPass verifies identity forever
without ever knowing an email address. A platform needs to reach the member, bill the member and display
a handle, and has no use for a document.**

⚠️⚠️ **THIS IS WHAT MAKES THE ARRANGEMENT INFRASTRUCTURE RATHER THAN A VAIRIFY FAVOUR. IT
HOLDS FOR EVERY PLATFORM.**

---

# 3 — ⚠️⚠️ THE SESSION KEY

**Minted at arrival. Bound to the session. Travels to the provider with the client.**

> ⚠️⚠️ **"IN THAT SESSION KEY MUST BE HIDDEN WHICH PROVIDER THE SESSION CAME FROM. IT MUST BE
> ENCODED IN THE ACTUAL SESSION KEY ITSELF."**

⚠️⚠️ **THREE OR FOUR PROVIDERS. CHAINPASS HOLDS NO RECORD OF WHICH ONE A SESSION WENT TO.**
**A key coming back years later must tell ChainPass which provider to ask, from the key
alone.**

| # | Constraint |
|---|---|
| 1 | ⚠️⚠️ **ENCODED, NOT IN THE CLEAR.** **A readable prefix tells whoever holds the key which provider verified that person. That is information about the person.** |
| 2 | ⚠️⚠️ **IT MUST SURVIVE YEARS IN A PLATFORM'S DATABASE.** **It cannot depend on anything ChainPass keeps.** |
| 3 | ⚠️⚠️ **THIRTY-TWO CHARACTERS. ALPHANUMERIC.** **Owner ruling, 25 August.** |

⬜ ⚠️ **ENCODING STILL OPEN.** **How a provider is derived · what happens when a provider is added or removed.**

---

# 4 — ⚠️⚠️ THE PICKER

> ⚠️ **"Takes the real identity and sends it to Offenders.io OUTSIDE OF OUR WALLS. We receive
> a simple yes/no: they're good, or they have a violent crime history."**

| # | |
|---|---|
| 1 | ⚠️⚠️ **OUTSIDE OUR WALLS.** |
| 2 | ⚠️ **BINARY. Clear, or something on file.** ⚠️⚠️ **NO DETAIL. NO RECORD. NO SCORE.** |
| 2a | ⚠️⚠️ **THE REQUIREMENT IS CALLED A BACKGROUND CHECK.** ⚠️ **Today it queries the sex offender registry at about $0.15 a check. More checks plug in under the same name.** ⚠️⚠️ **NEVER CLAIM A CHECK THAT DID NOT RUN — A BADGE SAYING CRIMINAL HISTORY ON A REGISTRY LOOKUP IS A CLAIM THE DATA DOES NOT SUPPORT.** |
| 3 | **Runs while the session is open, before the V.A.I. is minted.** |

## 4.1 — ⚠️⚠️ A HIT IS NOT A FLAG

> ⚠️ **"It's not flagged. It's handled on the other side with Vairify, where they can
> explain."**

⚠️⚠️ **CHAINPASS DOES NOT JUDGE CONDUCT. IT VERIFIES AND PROVIDES TRANSPARENCY.** **The
platform decides what a hit means. The person explains THERE.**

⚠️ **NO REFUND. "There is no giving back money."** **The work was done.**

---

# 4A — ⚠️⚠️ DEFERRED PAYMENT

> ⚠️ **"If a provider says 'I want you verified,' we don't want that guy to not get verified
> because the member doesn't have the money. There's no excuse."**

## 4A.1 — ⚠️ Why it exists — and it is for the platform, not for the member

⚠️⚠️ **THE FEATURE STARTS FROM A PLATFORM NEED.** **The platform asks for verification and the answer
cannot be "I could not afford it."**

> ⚠️⚠️ **"IN A WAY, IT'S FREE, IT'S SECURE, AND THERE'S NO EXCUSE. IF THEY SAY NO, THAT IN
> ITSELF IS A SHIELD."**

⚠️ **A refusal is now information.** **The member had a way through and did not take it.**

## 4A.2 — The terms

| # | |
|---|---|
| 1 | ⚠️⚠️ **ONCE. EVER. PER PERSON.** **Not per platform. Not per year.** ⚠️ **The credential is the person, so it cannot be reset by joining somewhere else.** |
| 2 | ⚠️ **Negotiated with the platform.** ⚠️ **Vairify's window is `settings:deferral_window_hours`.** |
| 3 | ⚠️⚠️ **THE CLOCK STARTS AT VERIFICATION, NOT AT PAYMENT.** **Deferring buys `settings:deferral_window_hours` of use and costs `settings:deferral_window_hours` of the term.** ⚠️ **There is no free look.** |
| 3a | ⚠️⚠️ **BOTH STAND — 25 AUGUST.** **Payment is first (§2 step 2). The clock still starts at verification (item 3).** ⚠️ **The pay-versus-clock collision is closed. Neither rule yields.** |
| 4 | ⚠️ **A MODAL states the terms at the moment of choosing.** ⚠️ **The member clicks that the member does not want to pay — and the member is told this is the only time.** |
| 5 | ⚠️ **"The next time there is no grace period."** |

## 4A.3 — ⚠️⚠️ AT `settings:deferral_suspend_after`

| # | |
|---|---|
| 1 | ⚠️⚠️ **PRIVILEGES ARE SUSPENDED. IT JUST DOES NOT WORK.** |
| 2 | ⚠️ **The next attempt to use it ANYWHERE routes to payment.** |
| 3 | ⚠️ **NOT deleted. NOT banned.** ⚠️⚠️ **THE KYC PROVIDER WAS ALREADY PAID. THE IDENTITY WORK IS DONE. ONLY USE IS WITHHELD.** |

## 4A.4 — ⚠️ Both sides are told

> ⚠️ **"We will let them know. Both sides."**

⚠️ **The platform needs to know the member is inside a deferral, and after `settings:deferral_suspend_after` that the member chose not to
complete it.** ⚠️⚠️ **DEFERRAL IS A STATE ON THE CREDENTIAL, VISIBLE TO BOTH PARTIES.**

## 4A.5 — ⬜ Owed

⬜ ⚠️ **The owner said: "there needs to be an address thing there if they choose deferral."**
**NOT YET EXPLAINED. NOT INVENTED HERE.**

---

# 4B — ⚠️⚠️ NOT ACTIVE

## 4B.1 — ⚠️ One word, and it never sorts

⚠️⚠️ **A CREDENTIAL THAT IS NOT WORKING READS AS `NOT ACTIVE`. NOTHING ELSE.**

| ❌ Rejected | Why |
|---|---|
| **"Invalid"** | ⚠️ **A claim about the NUMBER — reads as a typo or a fake, something that never existed** |
| **"Expired"** | ⚠️ **A claim about the member's CONDUCT, and it sorts the lapse for the platform** |
| ✅ **"Not active"** | ⚠️⚠️ **A FACT ABOUT A CREDENTIAL. VAIRIFY SAYS NOTHING ABOUT THE MEMBER.** |

⚠️ **It covers deferral lapsed · expired · suspended · banned — in one word, unsorted.**

## 4B.2 — ⚠️⚠️ WHY THIS IS A SAFETY MECHANISM, NOT AN ERROR STATE

> ⚠️ **"Guy beats up a girl. Doesn't get a V.A.I. But leaves a trace. The member goes to see another
> girl. The member's V.A.I. has expired. The member says 'oh, I had it, my V.A.I. is expired.' That tells you
> something's wrong."**

| # | |
|---|---|
| 1 | ⚠️⚠️ **AN INACTIVE CREDENTIAL IS NOT A NEUTRAL STATE. IT IS A PERSON WHO STOPPED PAYING TO BE ACCOUNTABLE.** |
| 2 | ⚠️ **Someone with nothing to hide renews.** |
| 3 | ⚠️⚠️ **THE HISTORY EXISTS AND IS UNREACHABLE. A CREDENTIAL MUST BE ACTIVE TO HAVE A HISTORY.** |
| 4 | ⚠️⚠️ **AND IT CANNOT BE ESCAPED BY LAPSING. COMING BACK MEANS THE SAME V.A.I. ONE PERSON, ONE V.A.I., FOR LIFE.** |

## 4B.3 — ⚠️ What the member sees, and what the member does not

| ✅ The member sees | ❌ The member never sees |
|---|---|
| ⚠️ **`Not active`** | **Which kind of lapse it was** |
| | **Anything behind it. The trace stays sealed.** |

⚠️⚠️ **THE SIGNAL IS THE STATE, NOT THE CONTENTS. THAT IS WHAT MAKES IT SURVIVE LEGALLY —
VAIRIFY SAYS NOTHING ABOUT THE MEMBER, ONLY THAT THE CREDENTIAL IS NOT ACTIVE.**

⚠️ **This is Vairify's rendering. ChainPass supplies the state.**

---

# 4C — ⚠️⚠️ STANDARD AND PRO

> ⚠️⚠️ **STANDARD PROVES A PERSON. PRO LETS A PLATFORM DO THINGS WITH THAT PROOF.**

## 4C.1 — ⚠️⚠️ PRO IS A PLATFORM LEVEL, NOT A CONSUMER UPGRADE

⚠️ **The price a person pays is decided by what the platform they are joining requires.**

| | | |
|---|---|---|
| ⚠️ **STANDARD — `settings:price_vai`** | **The credential. A verified person.** | **A platform that needs to know someone is real and of age** |
| ⚠️ **PRO — `settings:price_vai_pro`** | ⚠️⚠️ **THE SIGNATURE AGREEMENT PLUS AS MANY CUSTOM REQUIREMENTS AS THE PLATFORM ELECTS — UNCAPPED** | **A platform that needs to administer real actions** |

⚠️⚠️ **A PORN SITE NEEDING ONLY AGE VERIFICATION IS A STANDARD CREDENTIAL. VAIRIFY IS A PRO
ONE.**

⚠️ **Someone arriving at Vairify holding a Standard credential is short. They are told what
is missing and routed to complete it.** — §11

## 4C.2 — ⚠️⚠️ THE SIGNATURE AGREEMENT IS THE MECHANISM

⚠️ **It comes standard with every Pro platform.**

> ⚠️⚠️ **THE SIGNATURE AGREEMENT IS THE STANDING CONSENT THAT ANY DOCUMENT CHAINPASS
> ADMINISTERS IS LEGALLY SIGNED.**

| ❌ Without it | ✅ With it |
|---|---|
| **A platform holds a checkbox** | ⚠️⚠️ **A PLATFORM HOLDS A SIGNATURE WITNESSED AGAINST A VERIFIED IDENTITY** |

⚠️ **A person does not have to sign anything.** ⚠️⚠️ **BUT ANYTHING THEY DO SIGN, THEY HAVE
AGREED IN ADVANCE IS LEGAL.**

## 4C.3 — ⚠️ ACCESS AND V.A.I. ARE CAPPED AT THREE. PRO IS UNCAPPED — RULED 22 AUGUST

⚠️⚠️ **ACCESS AND V.A.I. PLATFORMS MAY REQUIRE UP TO THREE PLATFORM REQUIREMENTS AT THEIR
DOOR. PRO PLATFORMS ARE UNCAPPED — `RULINGS-CP-03` §3.**

⚠️⚠️ **THIS IS WHY REQUIREMENTS ARE ROWS AND NOT CODE. A NEW PLATFORM IS A ROW AND
`settings:platform_document_pack` DOCUMENTS, NOT A BUILD.**

### ⚠️ Vairify

| # | |
|---|---|
| 1 | **Signature agreement** — standard with Pro |
| 2 | ⚠️ **Law enforcement disclosure** |
| 3 | ⚠️ **Background check** |

⚠️ **Vairify sets these. ChainPass administers them.** ⚠️⚠️ **THEY CARRY NO CHARGE TO THE
MEMBER — CHAINPASS WOULD NOT HAVE ASKED FOR THEM UNLESS VAIRIFY SAID SO.**

### ⚠️ AV Chexx — the same technology, a different use

**AV Chexx confirms adult performers are of age.**

```
⚠️ THE MEMBER WALKS INTO A STUDIO
        ↓
⚠️ THE MEMBER GIVES THEM THE MEMBER V.A.I. NUMBER
        ↓
⚠️ THEY TYPE IT IN
        ↓
⚠️ THE MEMBER SCANS THE MEMBER FACE
        ↓
⚠️⚠️ THE MEMBER IS LEGAL — AND THEY NEVER LEARN THE MEMBER NAME
```

⚠️ **They want ChainPass to keep those records.**

⚠️⚠️ **THEY DO NOT ASK FOR A LAW ENFORCEMENT DISCLOSURE. THEY ASK FOR A RELEASE ALLOWING
THEM TO GIVE THE MEMBER INFORMATION TO REGULATING AUTHORITIES.**

⚠️ **Same credential. Same face. Same signature agreement. A different document.**

## 4C.4 — ⚠️ What this makes possible

⚠️ **A platform on Pro can administer anything a person can sign** — mutual consent
contracts · disclosures · releases · background checks · declarations · health documents.

⚠️⚠️ **THE LIST IS NOT FIXED AND MUST NOT BE. THAT IS THE PRODUCT.**

---

# 4D — ⚠️⚠️ THE LAW ENFORCEMENT DECLARATION AND THE TWO COLOURS

## 4D.0 — ⚠️⚠️ ALWAYS CHAINPASS-BRANDED — RULED 22 AUGUST

⚠️⚠️ **THE LAW ENFORCEMENT DECLARATION IS ALWAYS CHAINPASS-BRANDED, WHATEVER SKIN THE
PLATFORM ELECTED FOR ENROLMENT** — `RULINGS-CP-02` §5.1 · `CANON-SA-07` *(vairify-app)*.

| # | |
|---|---|
| 1 | ⚠️⚠️ **THE MEMBER IS DECLARING TO CHAINPASS — A NEUTRAL IDENTITY PROVIDER — NEVER TO THE PLATFORM.** |
| 2 | ⚠️⚠️ **A PLATFORM-BRANDED DECLARATION LETS AN OFFICER ARGUE THE MEMBER DECLARED TO THE PLATFORM. IN A JURISDICTION WHERE THE WORK IS ILLEGAL, THAT IS THE GAP THE MEMBER NEEDS.** |
| 3 | ⚠️ **This must be legible on the page and in the record, not only in the schema.** |

## 4D.1 — ⚠️ It is the member's statement, not a check

| # | |
|---|---|
| 1 | ⚠️ **The member states whether the member is affiliated with law enforcement.** |
| 2 | ⚠️⚠️ **NOTHING VERIFIES IT. THE COPY MUST NOT IMPLY ANYTHING DOES.** |
| 3 | ⚠️ **Signed under penalty of perjury.** ⚠️⚠️ **STATE THE DOCUMENTED FACT, NEVER A PROMISED OUTCOME.** ❌ **"Would stand up in court" is cut and stays cut.** |
| 4 | ⚠️ **Nobody is excluded. Law enforcement may hold a V.A.I. and use any platform.** |
| 5 | ⚠️⚠️ **THE MEMBER IS SHOWN BOTH OUTCOMES SIDE BY SIDE BEFORE THE MEMBER ANSWERS.** **A civilian profile and a declared one, as they will actually look.** ⚠️ **Rendered, not described.** |
| 6 | ⚠️⚠️ **ITS OWN AFFIRMATION — NOT BUNDLED BEHIND THE TERMS CHECKBOX AT STEP 8. ONE FACE CAPTURE MAY COVER BOTH — `RULINGS-CP-03` §9.** |

## 4D.2 — ⚠️⚠️ THE TWO COLOURS

⚠️⚠️ **NO BADGE. NO LABEL. NO WORDS. THE COLOUR IS THE WHOLE SIGNAL.**

| State | Colour |
|---|---|
| ⚠️⚠️ **LAW ENFORCEMENT DECLARED** | ⚠️ **`#F94E00`** |
| ⚠️ **BACKGROUND CHECK — SOMETHING ON FILE** | ⚠️ **`#FBBF24`** |

### ⚠️⚠️ WHY LAW ENFORCEMENT IS THE LOUDER OF THE TWO

> ⚠️⚠️ **"LAW ENFORCEMENT IS MORE DANGEROUS THAN VIOLENT CRIME."**

⚠️ **An undeclared officer is an arrest, a charge and a record.** ⚠️ **A man with a history
is a risk the member can assess and decline.**

⚠️⚠️ **ONE ENDS THE MEMBER LIVELIHOOD. THE OTHER IS A DECISION THE MEMBER MAKES AT A DOOR.**

### ⚠️ No badge, no label

⚠️⚠️ **VAIRIFY NEVER CHARACTERISES THE MEMBER. THE ONLY WORDS ON THE PAGE ARE THE MEMBER'S OWN.**

| # | |
|---|---|
| 1 | ⚠️ **The profile carries the colour.** |
| 2 | ⚠️ **There is a place for the member to explain, in the member's words.** |
| 3 | ⚠️ **If the member writes nothing, the colour stands alone.** ⚠️ **That is worse for the member than any label, which is the incentive.** |

⬜ ⚠️ **A first-time member needs one line explaining what a coloured profile means. WHERE IT
LIVES IS UNRULED.**

### ⚠️⚠️ APPEAL GOES TO THE COUNCIL

> ⚠️ **"They can appeal to the Council to have it removed. That is a decision I do not want
> to make."**

⚠️ **`settings:appeal_panel_size` members, drawn at random, majority wins.** ⚠️⚠️ **ADMIN NEVER JUDGES. THE PLATFORM
DOES NOT DECIDE WHETHER A MAN'S RECORD IS VISIBLE.**

⚠️⚠️ **A GRANTED RULING PERSISTS THROUGH RENEWAL.** **The check returns the same answer next
year. A system that honours a ruling once and quietly overturns it makes the Council
decorative.**

⬜ ⚠️ **What the panel sees: the fact of a hit and the member's explanation.** ⚠️⚠️ **NOT THE OFFENCE —
THAT DETAIL IS THE THING CHAINPASS DELIBERATELY NEVER RECEIVES.**

---

# 5 — ⚠️ ADMIN — KYC PROVIDERS

⚠️ **Providers are ROWS. Adding or removing one is an admin action, not a deploy.**

⚠️⚠️ **REMOVING A PROVIDER MUST NOT BREAK KEYS ALREADY ISSUED AGAINST IT.** **Those keys
still encode it, and identities still sit there.**

---
---

# PART TWO — VERIFICATION

---

# 6 — ⚠️⚠️ THE OPERATIONAL CALL

> ⚠️ **"Platforms, when they need an answer, will make a call to ChainPass with their client
> and an open screen. They will compare their face to the stored image in ChainPass and
> receive a yes/no."**

```
The platform opens a screen
        ↓
The face is captured and sent to ChainPass
        ↓
⚠️ CHAINPASS COMPARES IT TO THE BASELINE IT HOLDS
        ↓
⚠️⚠️ GREEN · YELLOW · RED
```

---

# 7 — ⚠️⚠️ THREE BANDS. WHAT LEAVES IS THE RESPONSE LEVEL.

## 7.1 — ⚠️ The distinction that matters

⚠️⚠️ **CHAINPASS JUDGES IDENTITY. THAT IS ITS JOB.** **The platform does not.**

⚠️⚠️ **THE ARITHMETIC IS COMPUTED AT CHAINPASS IN EVERY CASE.** **What the platform is told
is `platforms.response_level` — `RULINGS-CP-04`.**

## 7.2 — The bands

⚠️⚠️ **THE THREE BANDS EXTEND FROM VAI-CHECK TO LOGIN.** **Login was pass or fail; a no now
carries which no it is — yellow or red.**

| Band | Meaning |
|---|---|
| ⚠️ **GREEN** | **Match** |
| ⚠️ **YELLOW** | **Below green. Close, not confident.** |
| ⚠️⚠️ **RED** | **Not this person.** ⚠️ **RED IS WHAT TRIGGERS THE MANUAL PATH.** |

## 7.3 — ⚠️ The thresholds

| # | |
|---|---|
| 1 | ⚠️⚠️ **BOTH CUT-OFFS ARE PERCENTAGES SET IN CHAINPASS ADMIN.** |
| 2 | ⚠️⚠️ **GLOBAL. SET BY CHAINPASS. NOT PER PLATFORM.** |
| 3 | ⚠️ **Adjustable without a deploy.** |

⚠️⚠️ **THE PERCENTAGE LEAVES WHEN THE PLATFORM'S RESPONSE LEVEL PERMITS IT.** **Cut-offs stay
global and ChainPass's. A platform chooses what it is told, never where the lines fall.**
 — `RULINGS-CP-04`.

---

# 8 — ⚠️ MANUAL IS A PRO FEATURE

| # | |
|---|---|
| 1 | ⚠️⚠️ **MANUAL IS NOT UNIVERSAL. IT IS A FEATURE OF PRO.** |
| 2 | ⚠️ **ChainPass sets it.** |
| 3 | ⚠️ **A platform opts in BY API and builds its own end.** |
| 4 | ⚠️ **Triggered by YELLOW or RED.** — `RULINGS-VA-05` §7 |

---
---

# PART THREE — RETURN, RESET AND RE-VERIFICATION

---

# 9 — ⚠️⚠️ WHAT IS CHAINPASS'S, AND WHAT IS NOT

> ⚠️ **"We just need to make the APIs, and they can make whatever they want."**

## 9.1 — ⚠️ ChainPass owns four things, and a fifth trigger

| # | |
|---|---|
| 1 | ⚠️ **The band on every face check** — §7 |
| 2 | ⚠️⚠️ **COUNTING REDS PER CREDENTIAL OVER TIME.** **Past a threshold, the next failure returns a FOURTH state — re-baseline required — instead of another red.** |
| 3 | ⚠️⚠️ **RUNNING THE FRESH KYC VERIFICATION WHEN THAT HAPPENS.** ⚠️ **THE COST IS ON US.** Forced re-baseline uses the two-date test — §10.2. |
| 4 | ⚠️⚠️ **RECOVERY.** **Questions, one-time passwords, lock state — ChainPass, not the platform.** — §2.10 · §14.6 surface 9 |
| 5 | ⚠️⚠️ **A USER-REQUESTED RE-BASELINE.** Always a fresh provider run. The two-date test does not apply. — `RULINGS-CP-06`. ⬜ Whether the user pays is unruled. |

---

# 10 — ⚠️⚠️ RENEWAL — `settings:credential_year_length_years`

> ⚠️ **"It always goes by a calendar year from when you sign up."**

## 10.1 — ⚠️ Two dates, and the first to expire governs

| # | Date | |
|---|---|---|
| 1 | ⚠️ **THE PROVIDER'S RETENTION WINDOW** | ⚠️ **The KYC provider holds the identity and prevents duplicates for a set time.** ⚠️⚠️ **THIS MUST BE HELD IN THE DATABASE.** |
| 2 | ⚠️ **THE DOCUMENT'S EXPIRY** | The ID used to verify |

> ⚠️⚠️ **"WHICHEVER EXPIRES FIRST DURING A CALENDAR YEAR MUST BE VERIFIED AT TIME OF
> RE-UP."**

⚠️⚠️ **CONFIRMED 20 AUGUST. THIS TWO-DATE TEST GOVERNS. ANY EARLIER STATEMENT OF A FIXED
THREE-YEAR WINDOW IS SUPERSEDED — THE PROVIDER'S RETENTION WINDOW IS WHATEVER THAT PROVIDER
SETS, NOT A CONSTANT CHAINPASS PICKS.**

## 10.2 — ⚠️ The two outcomes — FORCED RE-BASELINE ONLY

⚠️⚠️ **THE TWO-DATE TEST APPLIES TO THE FORCED RE-BASELINE AT THE RED THRESHOLD.** A
user-requested re-baseline is always the provider — `RULINGS-CP-06` §2. The two triggers
are different and run differently.

| Condition | What runs |
|---|---|
| ⚠️ **Both still live** | ⚠️⚠️ **IN-HOUSE. FRAME B. Face checked against the held baseline.** ⚠️ **This is what the trial uses.** |
| ⚠️ **Either has lapsed** | ⚠️ **A FRESH KYC VERIFICATION** |

## 10.3 — ⚠️⚠️ SCHEMA REQUIREMENT

⚠️⚠️ **THE PROVIDER'S RETENTION EXPIRY IS ITS OWN COLUMN.** **Separate from
`document_expiry`. Separate from `next_renewal_date`.** ⬜ **Confirm whether it exists.**

## 10.4 — ⚠️ In-house is permanent

> ⚠️ **"We're going to re-verify in-house using the exact same method that we are going to be
> testing with. The only difference is we're actually gonna be taking the initial photo,
> whereas ComplyCube will take the initial photo once they come online."**

⚠️⚠️ **IN-HOUSE RE-VERIFICATION IS NOT A STOPGAP. IT IS THE PERMANENT MECHANISM.** **This is
the margin profile.**

⚠️⚠️ **AND IT IS WHAT MAKES DEFERRED PAYMENT AND ANY RECURRING ORIGINATION COMMISSION
SURVIVABLE. YEAR ONE COSTS A PROVIDER CALL. RENEWAL YEARS INSIDE BOTH WINDOWS COST A FACE
COMPARISON ON OUR OWN ENGINE. THE TWO-DATE TEST IS NOT A CONVENIENCE FEATURE — IT IS THE
MARGIN.**

---
---

# PART FOUR — REQUIREMENTS

---

# 11 — ⚠️⚠️ THE PREREQUISITE CHECK

> ⚠️ **"Any time a new registration occurs on any site, a V.A.I. number is entered on that
> site. That is a prerequisite."**

⚠️ **ChainPass compares the credential's completed requirements against what that platform
requires.**

## 11.1 — ⚠️ Three situations, one check

| # | |
|---|---|
| 1 | **A new registration on any site** |
| 2 | ⚠️ **Two credential holders meeting** |
| 3 | **Arriving at any V.A.I. site** |

## 11.2 — ⚠️⚠️ A SHORTFALL IS NEVER A REJECTION

> ⚠️ **"They will be notified of what they need to do and be transported to complete that
> task."**

⚠️⚠️ **THE ANSWER IS A LIST AND A DESTINATION.**

| Case | |
|---|---|
| **They hold V.A.I. and need Pro** | ⚠️ **Told so, and told the cost — the difference between `settings:price_vai` and `settings:price_vai_pro`** |
| **They hold Pro but lack a platform-specific requirement** | ⚠️ **Told which, and routed to complete it** |

⚠️ **Both the client AND the platform are notified.**

## 11.3 — ⚠️⚠️ WHEN TWO PEOPLE MEET, NEITHER LEARNS WHAT THE OTHER LACKS

> ⚠️ **"The member is just notified that all the requirements have not been met, and the other person
> has been notified."**

| Who | What they learn |
|---|---|
| ⚠️ **The asking party** | ⚠️⚠️ **ONLY THAT THE REQUIREMENTS ARE NOT MET. NEVER WHICH ONE.** |
| ⚠️ **The party who is short** | ⚠️ **Exactly what is missing, and where to complete it** |

⚠️⚠️ **NAMING THE MISSING REQUIREMENT WOULD TELL THE ASKING PARTY SOMETHING ABOUT THAT
PERSON.**

## 11.4 — ⚠️⚠️ EVERY PLATFORM SERVES ITS TERMS AT CHAINPASS — RULED 22 AUGUST

| # | |
|---|---|
| 1 | ⚠️⚠️ **EVERY NEW PLATFORM UPLOADS TERMS AT ONBOARDING. CHAINPASS ADMINISTERS ACCEPTANCE — AT ENROLMENT ON THE ACCEPTANCE PAGE FOR THE ORIGINATING PLATFORM, ON FIRST VISIT FOR ANY OTHER — §14.3.** |
| 2 | ⚠️⚠️ **A MISSING REQUIREMENT IS ALWAYS A SHORTFALL AND A ROUTE — §11.2. NEVER A REJECTION AT CHAINPASS.** |

---
---

# PART FIVE — OPEN

---

# 12 — ⬜ RULINGS OWED

| # | | Whose |
|---|---|---|
| 1 | ⚠️ **The "address thing" at deferral** — §4A.5 | **Owner** |
| 2 | **The session key format and provider encoding** — §3 | **Owner + build** |
| 2a | ⚠️⚠️ **PROVIDER DERIVATION WHEN THE KEY IS LOST — MUST BE SOLVED BEFORE A SECOND PROVIDER IS ADDED** — §2.4b item 4 | **Owner + build** |
| 3 | ⚠️ **How many reds in what window triggers re-baseline** — §9.1 item 2 | **Owner** |
| 4 | **Does the upsell ship at launch, or later?** — §1.2 | **Owner** |
| 5 | **Does the provider retention column exist?** — §10.3 | **Check the schema** |
| 6 | ⚠️⚠️ **R11 — ChainPass holds `credentials.complycube_client_id`, `not null`, read after enrolment by `revalidate:156,189`, `renew-credential:96`, `drain-queue:57,64,73`. THAT IS THE KEY IT MUST DELETE AT STEP 15. THE PATENT GATE IS UNMET.** | **Owner** |
| 7 | ⚠️⚠️ **NO-PLATFORM ENROLMENT — WHOSE TERMS?** — `RULINGS-CP-02` §8 item 1 | **Owner** |
| 8 | ✅ ⚠️ **REGISTER-STEP TERMS ACCEPTANCE — RESOLVED: ACCEPTANCE PAGE, STEP 8 — `RULINGS-CP-03` §1 · §8.** | — |
| 9 | ⚠️ **SKINNED PAGE DISCLOSURE — WHAT MUST THE MEMBER BE TOLD ABOUT CHAINPASS HOLDING THE DATA?** — `RULINGS-CP-02` §8 item 3 | **Owner · MA-05** |
| 10 | ⚠️ **EMAIL MAGIC LINK AS OTP ALTERNATIVE MID-ENROLMENT** — `RULINGS-CP-02` §6 item 6 | **Owner** |
| 11 | ✅ ⚠️ **`CANON-MI-25` / `CANON-MI-33` — CUSTODY AT CHAINPASS — `RULINGS-CP-03` §7 · `FLAG-VAIRIFY-RULINGS-CP-03`. VAIRIFY CANON FLAGGED, NOT EDITED FROM HERE.** | — |

---

# 13 — ⚠️ NOT YET WRITTEN DOWN — ⚠️ UPDATED 20 AUGUST

| # | | Status |
|---|---|---|
| 1 | **Suspension, lockout, ban** | ⬜ **Still open.** ⚠️ **All read as `Not active` to a platform — §4B — but the internal states and who sets them are unwritten.** |
| 2 | **Disclosure — the key coming back** | ⬜ **Still open.** |
| 3 | **Coupons** | ⚠️ **Written — `CANON-MI-27`. The mechanism is: the platform issues, ChainPass redeems, the price never changes.** |
| 4 | **Origination and revenue share** | ✅ ⚠️ **WRITTEN 20 AUGUST — §2.8 and §14.** |
| 5 | **V.A.I. Pro, in full** | ✅ ⚠️ **WRITTEN — §4C, §14. The service levels, the agreement API and the proof record.** |

---

# 14 — ⚠️⚠️ THE PLATFORM API — RULED 19–20 AUGUST

⚠️⚠️ **THIS SECTION IS WHAT §13 ITEM 5 OWED. IT DESCRIBES WHAT A PLATFORM BUYS AND WHAT IT
MAY ASK.**

## 14.1 — ⚠️⚠️ THREE SERVICE LEVELS. EACH CONTAINS EVERYTHING BELOW IT.

| Level | | What the platform may ask |
|---|---|---|
| **1** | ⚠️ **VAI GO** | ⚠️ **The door. One question at the gate: is this person real and of age.** ⚠️⚠️ **THIS IS THE STANDARD CREDENTIAL AT WORK — §4C.1.** |
| **2** | ⚠️ **VAI ACCESS** | **The door plus inside. Repeated yes/no while the member is in — live re-verification, a static photo-match, a gated room.** ❌ **No documents.** ⚠️ **Up to three platform requirements at the door — §4C.3.** |
| **3** | ⚠️ **VAI PRO** | ⚠️⚠️ **EVERYTHING. PLUS THE SIGNATURE AGREEMENT AND AS MANY CUSTOM REQUIREMENTS AS THE PLATFORM ELECTS — UNCAPPED — §4C.2, §4C.3.** |

⚠️⚠️ **ENDPOINTS CHECK `agreement level ≥ endpoint's required level` AND NOTHING ELSE. ONE
INTEGER COMPARISON.**

⚠️⚠️ **THE LEVEL IS ON BOTH SIDES — RULED 20 AUGUST. THE CREDENTIAL CARRIES
`credential_level` (WHAT THE PERSON BOUGHT — §4C.1, §11.2) AND THE PLATFORM'S AGREEMENT
CARRIES `service_level` (WHAT ITS DOOR REQUIRES). ENTRY IS ONE COMPARISON:
`credential_level ≥ required_level`** — §16.3 step 3. ⚠️ **An upgrade is the price
difference, same V.A.I., nothing re-done** — §11.2. **Levels answer down.**

### ⚠️⚠️ ONE FLOW. THE LEVEL IS A GATE — RULED 22 AUGUST

⚠️⚠️ **THE SERVICE LEVEL DESCRIBES WHAT A PLATFORM MAY ASK AT ITS DOOR AND INSIDE — NOT A
DIFFERENT ENROLMENT BUILD.** ⚠️ **One enrolment flow for every level. Pro adds requirements
on top at step 9 — §4C.3 · `RULINGS-CP-03` §1.**

## 14.2 — ⚠️⚠️ THE CONTRACT REGISTRY — `SPEC-CP-02` v3

⚠️⚠️ **THE AGREEMENT RUNS INSIDE CHAINPASS.** The platform sends a `contract_id` and V.A.I.
numbers and receives an agreement number. Nothing else crosses. ChainPass displays the
bytes, takes both answers on its own screens, and writes the record.

⚠️ **Identifier, one-way door (`draft` → `live` → `retired`), five tables, chained ledger,
ChainPass clock with UTC offset — `SPEC-CP-02`.** ⚠️⚠️ **WRITE-ONCE BY CONSTRAINT AND
REVOKED PRIVILEGE. NEVER APPLICATION CODE.**

⚠️⚠️ **THIS REVERSES THE BLANK-ENVELOPE RULE. CHAINPASS NO LONGER HOLDS A REFERENCE. IT
HOLDS THE DOCUMENT ITSELF, IMMUTABLE, VERSIONED, AND STAMPED TO EVERY V.A.I. THAT SIGNED
IT.**

> ⚠️⚠️ **"SOMETHING CRAZY HAPPENS. THE CHAINPASS CLIENT TRIES TO PROTECT THEMSELVES AND
> CHANGES THE WORDING OF THE AGREEMENT. NO DICE. WHATEVER WAS THERE AT THE TIME IS RECORDED
> AND IMMUTABLE."**

| # | |
|---|---|
| 1 | ⚠️ **Two types: one V.A.I. and a platform · two V.A.I.s and a platform.** ⚠️ **The second is what a mutual consent contract runs on.** |
| 2 | ⚠️⚠️ **THE PLATFORM UPLOADS THE DOCUMENT TO CHAINPASS FROM ITS DASHBOARD. CHAINPASS STORES THE CONTENT, NOT A POINTER AT IT.** |
| 3 | ⚠️⚠️ **STORED IMMUTABLE. A VERSION IS NEVER EDITED AND NEVER OVERWRITTEN. UPLOADING NEW WORDING CREATES A NEW VERSION AND THE OLD ONE STAYS EXACTLY AS IT WAS.** |
| 4 | ⚠️⚠️ **EVERY V.A.I. THAT SIGNS IS STAMPED TO THE EXACT VERSION IT SAW. NOT TO THE DOCUMENT — TO THE VERSION.** |
| 5 | ⚠️⚠️ **A PLATFORM CANNOT REACH BACKWARDS. NOTHING IT DOES TODAY CHANGES WHAT SOMEONE AGREED TO LAST YEAR.** |
| 6 | ⚠️ **The version history reads as a changelog — every version, its hash, when it went live, when it was superseded, and how many V.A.I.s are bound to it.** |
| 7 | ⚠️⚠️ **AN OPEN AGREEMENT EXPIRES ON A TIMER. ONE PROOF ON AN EXPIRED TWO-PARTY AGREEMENT IS VOID. NOBODY HALF-SIGNS A CONTRACT.** |
| 8 | ⚠️⚠️ **TERMS SIGNING RUNS ON THIS SAME MACHINERY — SUBTYPE `terms`. AT ENROLMENT ON THE ACCEPTANCE PAGE FOR THE ORIGINATING PLATFORM — §2 · §14.3. AT FIRST VISIT FOR ANY OTHER PLATFORM THE MEMBER ENTERS LATER. ONE PROOF SYSTEM. NEVER A SECOND SUBSYSTEM.** |

⚠️ **This is §4C.2 expressed as an interface. The signature agreement is the standing
consent that anything administered here is legally signed; this is the thing administered.**

### ⚠️⚠️ WHY THE DOCUMENT MOVED TO CHAINPASS

⚠️⚠️ **A PROOF THAT SAYS "THESE TWO PEOPLE AGREED TO DOCUMENT X" IS WORTH NOTHING IF THE
PLATFORM HOLDS DOCUMENT X AND CAN REWRITE IT.** ⚠️ **The certification of the persons was
always sound. The content was the hole.**

⚠️ **It is also what makes the record survive the platform. A platform that closes, loses
its database or refuses to produce a document does not take the agreement with it.**

## 14.2a — ⚠️⚠️ NO HANDOFF. THE RECORD STAYS AT CHAINPASS.

> ⚠️⚠️ **"THAT DOESN'T HAVE TO HAPPEN. WE NEED TO KEEP IT ALL. INSTEAD, IT NEEDS TO BE IN
> THE DASHBOARD."**

⚠️⚠️ **THE PROOF IS NOT PUSHED TO THE PLATFORM. IT LIVES AT CHAINPASS AND THE PLATFORM
READS IT FROM ITS DASHBOARD AND BY API.**

| # | |
|---|---|
| 1 | ⚠️⚠️ **CHAINPASS KEEPS EVERYTHING — THE DOCUMENT, EVERY VERSION, EVERY SIGNATURE, EVERY TIMESTAMP.** |
| 2 | ⚠️ **The platform sees its own agreements in the dashboard: documents, versions, who signed which version and when.** |
| 3 | ⚠️⚠️ **A PLATFORM SEES ONLY ITS OWN. NEVER ANOTHER PLATFORM'S DOCUMENTS AND NEVER ANOTHER PLATFORM'S SIGNATURES.** |
| 4 | ⚠️ **Pullable by API at any time, forever.** ⚠️⚠️ **A PLATFORM'S STORAGE FAILURE LOSES NOTHING, BECAUSE THE PLATFORM WAS NEVER THE CUSTODIAN.** |

⚠️ **The member sees the member own signed agreements too — which document, which version, when,
and the document as it read at that moment.**

## 14.2b — ⚠️⚠️ PLATFORM ONBOARDING UPLOADS — RULED 20 AUGUST

⚠️⚠️ **THE UPLOADS ARE PART OF ONBOARDING, NOT AN AFTERTHOUGHT. A PLATFORM DECLARES ITS
DOCUMENTS WHEN IT DECLARES EVERYTHING ELSE.**

| # | At onboarding the platform elects | |
|---|---|---|
| 1 | ⚠️⚠️ **ITS AGREEMENTS — UPLOADED, IMMUTABLE FROM THAT MOMENT** | §14.2 |
| 2 | ⚠️⚠️ **ITS TERMS AND CONDITIONS — UPLOADED. ACCEPTED AT ENROLMENT ON THE ACCEPTANCE PAGE — §2 · §14.3** | ⚠️ **Also re-signed on first visit to any other platform, or when the version changes** |
| 3 | **Its collection spec, requirements, service level, elected services** | §2.3, §4C.3, §14.4 |
| 4 | ⚠️ **The vault module — elected or declined, set up on their own** | §2.4c |
| 5 | ⚠️ **The enrolment skin — opt-in, default off. Pro only. One screen set, never a design fork** | `RULINGS-CP-02` §5 · §14.2b skin |

## 14.2c — ⚠️⚠️ THE VERSION NOTICE — RULED 20 AUGUST

> ⚠️⚠️ **"WHEN THEY UPLOAD A NEW AGREEMENT, BE ABLE TO TYPE A WARNING IN OR A
> NOTIFICATION."**

⚠️⚠️ **UPLOADING A NEW VERSION OPENS A NOTICE FIELD. THE PLATFORM TYPES WHAT CHANGED AND
WHY, IN ITS OWN WORDS.**

| # | |
|---|---|
| 1 | ⚠️ **The notice is shown to every member the next time the agreement is administered to them — before they sign the new version.** |
| 2 | ⚠️⚠️ **THE NOTICE IS STAMPED TO THE VERSION AND IS AS IMMUTABLE AS THE DOCUMENT. IT IS PART OF THE CHANGELOG ROW** — §14.2 item 6. |
| 3 | ⚠️ **Optional on upload. A version with no notice simply shows none.** |
| 4 | ⚠️⚠️ **THE NOTICE IS THE PLATFORM'S WORDS. CHAINPASS NEVER SUMMARISES A DOCUMENT CHANGE ON A PLATFORM'S BEHALF — CHARACTERISING A LEGAL CHANGE IS A CLAIM, AND IT IS NOT OURS TO MAKE.** |

## 14.3 — ⚠️⚠️ TERMS ACCEPTANCE — AT ACCEPTANCE AND ON EVERY PLATFORM — RULED 20 AUGUST · 22 AUGUST

> ⚠️⚠️ **"CHAINPASS IS THE GATEKEEPER MAKING SURE EVERYONE IS COMPLIANT. THAT WOULD BE ITS
> JOB."** — owner, 22 August

⚠️⚠️ **EVERY PLATFORM SUPPLIES ITS TERMS AT ONBOARDING. VERSIONED. REQUIRED FIELD — NO
TERMS, NO AGREEMENT, NO API KEY. NO PLATFORM MAY OPT OUT.**

| # | |
|---|---|
| 1 | ⚠️ **A platform with no terms of its own takes ChainPass's minimum standard terms as the default.** |
| 2 | ⚠️⚠️ **AT ENROLMENT, TERMS ARE ACCEPTED ON THE ACCEPTANCE PAGE — STEP 8 — WITH THE SECOND CAPTURE. CHAINPASS DISPLAYS THE TEXT, COLLECTS THE CHECKBOX, AND HOLDS THE RECORD. NO LEVEL EXEMPT. THE MEMBER NEED NOT READ THEM; THE BOX MUST BE CHECKED — `RULINGS-CP-03` §8.** |
| 3 | ⚠️⚠️ **THE MEMBER V.A.I. IS GOOD EVERYWHERE. THE MEMBER CANNOT ENTER A GIVEN PLATFORM WITHOUT HAVING ACCEPTED THAT PLATFORM'S TERMS — AT ENROLMENT FOR THE ORIGINATING PLATFORM, ON FIRST VISIT FOR ANY OTHER.** |
| 4 | ⚠️⚠️ **A TERMS UPDATE RE-FIRES THE SIGNING ON NEXT VISIT. A CHANGED AGREEMENT IS A NEW AGREEMENT.** |
| 5 | ⚠️ **Compliance is ChainPass's function. A platform does not administer its own terms acceptance.** |
| 6 | ⚠️ **The proof is versioned, timestamped and retrievable forever.** |
| 7 | ⚠️⚠️ **THE TERMS MUST DISCLOSE WHAT THAT PLATFORM REQUIRES CHAINPASS TO COLLECT AND WHAT CHAINPASS DOES WITH IT — `RULINGS-CP-03` §6.** |

⚠️ **See `BLOCKER-ENROLMENT-TERMS` and `GATE-LAUNCH-01` for the standing launch gate on real terms text.**

## 14.4 — ⚠️⚠️ THE INBOUND BANK

⚠️ **The KYC providers (§5) · the matcher and the premium engine (the facial stack ruling) ·
the picker's supplier (§4) · whatever comes next.**

| # | |
|---|---|
| 1 | ⚠️ **Every external service is an adapter behind one interface, registered as a row.** ⚠️⚠️ **PROVIDERS ARE ROWS — §5. THIS GENERALISES THAT RULE TO EVERY SUPPLIER.** |
| 2 | ⚠️⚠️ **AN INTEGRATION BELONGS TO CHAINPASS, NOT TO ANY PLATFORM. A CUSTOMER CLOSING DOES NOT TEAR AN API UP. IT STAYS IN THE BANK.** |
| 3 | ⚠️ **Platforms elect services at onboarding — Access and V.A.I. up to three requirements; Pro uncapped — §4C.3.** |
| 4 | ⚠️⚠️ **THE ADAPTER NORMALISES EVERY ENGINE'S OUTPUT INTO ONE INTERNAL SHAPE, AND THE PUBLIC API RETURNS ONE OF THREE DOCUMENTED SHAPES — `platforms.response_level`.** ⚠️ **The `{ match, confidence }` versus `{ result }` class of bug dies here, in one place, permanently. The adapter is the only place any of the three response shapes is read.** |

## 14.5 — ⚠️ THE THREE RAILS. NEVER MIXED.

| Rail | |
|---|---|
| ⚠️ **THE CREDENTIAL** | **The person pays for it** — §1.1a |
| ⚠️ **CONSUMPTION** | **The platform pays for verifications on its own gate. Blocks.** |
| ⚠️ **ORIGINATION COMMISSION** | **ChainPass pays the originating platform, per its agreement** — §2.8 |

⚠️⚠️ **A CREDENTIAL HOLDER ARRIVING AT A NEW PLATFORM COSTS THAT PLATFORM CONSUMPTION AND
EARNS IT NOTHING. THE ORIGINATOR KEEPS EARNING WHEREVER THE ORIGINATOR GOES.**

## 14.5a — ⚠️⚠️ COMMISSIONS PAY THROUGH TROLLEY — RULED 20 AUGUST

> ⚠️⚠️ **"WE'RE GONNA BE PAYING COMMISSIONS, AND WE DON'T WANT TO KNOW WHO THEY ARE."**

| # | |
|---|---|
| 1 | ⚠️⚠️ **ONE LEDGER. A BUSINESS AND AN INDIVIDUAL ARE THE SAME SHAPE — AN ORIGINATING ENTITY, ACCRUED ROWS, A SCHEDULE, A RAIL.** ⚠️ **The differences live on the agreement** — §2.8. |
| 2 | ⚠️⚠️ **THE RAIL IS TROLLEY. PAYEE ONBOARDING, TAX FORMS, PAYMENT-PURPOSE KYC AND THE PAYOUT RAILS ALL LIVE AT TROLLEY.** |
| 3 | ⚠️⚠️ **CHAINPASS HOLDS ONLY A `trolley_recipient_id` AGAINST THE PLATFORM ID OR THE V.A.I. THE NAME, THE BANK ACCOUNT, THE TAX FORM — TROLLEY'S, NEVER OURS.** |
| 4 | ⚠️⚠️ **CHAINPASS NEVER JOINS A V.A.I. TO A LEGAL IDENTITY. FOR AN INDIVIDUAL EARNER THE LINK EXISTS AT TROLLEY, UNDER TROLLEY'S COMPLIANCE OBLIGATIONS, AND NEVER CROSSES BACK.** |
| 5 | ⚠️ **This resolves the no-Stripe ruling: the payment-method field carries Trolley's recipient reference.** |
| 6 | ⚠️ **Trolley is a row in the inbound bank** — §14.4. ⚠️⚠️ **IF THE RAIL EVER CHANGES, THE LEDGER DOES NOT.** |

## 14.6 — ⚠️⚠️ THE CLIENT API IS THE PRODUCT — RULED 20 AUGUST

> ⚠️⚠️ **"LET'S DISPLAY EVERYTHING AND JUST MAKE AN API FOR IT AND LET THEM BUILD THEIR OWN
> DASHBOARD."**

⚠️⚠️ **EVERYTHING A PLATFORM MAY SEE IS AN ENDPOINT. THE SOURCE OF TRUTH STAYS AT
CHAINPASS. HOW THEY DISPLAY IT IS THEIR BUILD, THEIR SECURITY, THEIR DELEGATION.**

| # | Surface |
|---|---|
| 1 | **Traffic — verifications run, gate passes and fails, enrolments originated, active V.A.I.s through their door** |
| 2 | **Blocks — remaining, burn rate, purchase** |
| 3 | **Agreements — documents, versions, who signed which version and when** — §14.2 |
| 4 | **Proofs — any signature record, pullable forever** — §14.2a |
| 5 | **Commission ledger — accrued, scheduled, paid** — §14.5a |
| 6 | **Configuration — collection spec, requirements, service level, elected services, deferral, response level** |
| 7 | **The health signal — read-only** |
| 8 | **Key management — issue, rotate, revoke** |
| 9 | **Recovery — set questions, verify an answer, burn a one-time password, read lock state** |
| 10 | **Registry — register · fetch · retire · open · display · record · search** — `SPEC-CP-02` §14.6. A draft is never served. A retired contract is refused at open. |
| 11 | **Re-baseline request — open a session, and nothing else** — `RULINGS-CP-06`. The call does not perform the act. |

⚠️ **Verify is one request shape and three response shapes, chosen by `platforms.response_level`.**
⚠️⚠️ **CHAINPASS COMPUTES IDENTICALLY IN ALL THREE; ONLY WHAT IT RETURNS DIFFERS.**

| # | Rule |
|---|---|
| 1 | ⚠️⚠️ **A PLATFORM READS ONLY ITS OWN. EVERY ENDPOINT IS SCOPED TO THE KEY.** |
| 2 | ⚠️⚠️ **THE SESSION KEY IS NOT AN ENDPOINT AND NEVER WILL BE. IT LEAVES ONCE, AT THE HANDOFF, AND CHAINPASS DELETES ITS COPY. THERE IS NOTHING TO READ — WE DO NOT HAVE IT.** |
| 3 | ⚠️ **Client staff identity is the platform's problem. The API key is the identity ChainPass knows.** |

## 14.7 — ⚠️⚠️ ONE API, TWO CONSUMERS — RULED 20 AUGUST

⚠️⚠️ **CHAINPASS BUILDS THE API, AND TWO DASHBOARDS THAT ARE BOTH CLIENTS OF IT. NOTHING
IS BUILT TWICE.**

| | | |
|---|---|---|
| ⚠️ **THE CLIENT DASHBOARD** | **ChainPass-hosted, optional.** ⚠️ **The default front door on §14.6 for the platform that will never build its own.** | ⚠️⚠️ **NO PRIVATE ENDPOINTS. NOTHING IT CAN DO THAT THE API CANNOT.** |
| ⚠️⚠️ **THE MASTER DASHBOARD** | ⚠️⚠️ **CHAINPASS ONLY.** **Platforms as rows · the per-platform response-level control · providers as rows · every setting (bands, attempts, prices, windows, retention, re-baseline cap) · the failures column with the side-by-side · credentials by state · revenue by platform · the service-state panel (matcher and image serve, each AUTO / declared-down / declared-up) — `RULINGS-CP-05` · search by agreement number and by V.A.I. — `SPEC-CP-02` · a log of requested re-baselines — `RULINGS-CP-06` · the reds counter · an immutable audit log of every admin action.** | ⚠️ **A platform changes its response level here or asks ChainPass. No platform writes code for this — `RULINGS-CP-04`. No platform may declare ChainPass down — `RULINGS-CP-05` §4.** |

⚠️⚠️ **TWO PIECES ARE CHAINPASS-HOSTED REGARDLESS OF WHAT A PLATFORM BUILDS: THE AGREEMENT
UPLOAD WITH ITS VERSION CHANGELOG — IMMUTABILITY NEVER DEPENDS ON A CLIENT CHOOSING TO
BUILD A VIEWER — AND THE MASTER DASHBOARD.**

| # | ❌ Never, on any dashboard or endpoint |
|---|---|
| 1 | ⚠️⚠️ **ALTERING A SIGNED AGREEMENT VERSION — INCLUDING CHAINPASS'S OWN ADMIN. IMMUTABILITY IS THE STORAGE, NOT A PERMISSION.** |
| 2 | ⚠️⚠️ **A LEGAL NAME, A DOCUMENT, A BASELINE ANYWHERE A PLATFORM CAN READ** |

## 14.8 — ⚠️⚠️ THE VAIRIFY SEAM — WHAT RUNS BETWEEN THE TWO COMPANIES

⚠️⚠️ **VAIRIFY IS A CLIENT. THE BIGGEST ONE, THE FIRST ONE, THE OWNER'S OTHER COMPANY —
AND STILL A CLIENT. EVERYTHING IT USES IS THE SAME API EVERY PLATFORM GETS.**

| # | Interaction | Where ruled |
|---|---|---|
| 1 | **Enrolment redirect in, handoff out — V.A.I. + username + email/phone** | §2, §2.9 |
| 2 | **The face check — capture sent, response shaped by `platforms.response_level`** | §6, §7 · `RULINGS-CP-04` |
| 3 | **The third-attempt selfie — platform sends, ChainPass files it under failures** | 17 Aug |
| 4 | **The two orders — serve a manual verification · re-scan through the provider** | 17 Aug |
| 5 | **The prerequisite check — shortfall is a list and a destination, the other party learns nothing** | §11 |
| 6 | **Credential state — `active` or `Not active`, one word, never why** | §4B |
| 7 | **Deferral — offered per Vairify's agreement, both sides told** | §4A |
| 8 | **Agreements — Vairify's three requirements administered, proofs read back** | §4C.3, §14.2a |
| 9 | **The health signal — Vairify reads it, never infers it** | 17 Aug |
| 10 | **Origination commission on every credential Vairify originates** | §2.8, §14.5a |

⚠️⚠️ **THE REVERSE CHANNEL — THE TWO ORDERS AND FRAUD-FOUND — DOES NOT EXIST YET. IT IS
NAMED IN THE 17 AUGUST RULINGS AND IS PART OF THE API BUILD, NOT AN AFTERTHOUGHT TO IT.**

❌ ⚠️⚠️ **NOTHING VAIRIFY-SPECIFIC EXISTS IN CHAINPASS CODE. A VAIRIFY-SHAPED ENDPOINT IS A
SECOND PLATFORM AWAY FROM BEING A BUG.**

---

**16 August 2026.**

---

# ⚠️⚠️ THE THIRD-ATTEMPT SELFIE — RULED 17 AUGUST 2026

⚠️ **Vairify's rule is `CANON-MI-22`. What ChainPass receives:**

| # | |
|---|---|
| 1 | ⚠️⚠️ **ON A THIRD FAILED FACE ATTEMPT, THE PLATFORM SENDS A LIVE SELFIE TO CHAINPASS.** |
| 2 | ⚠️ **If the third attempt PASSES, the selfie is discarded and nothing reaches ChainPass.** |
| 3 | ⚠️⚠️ **CHAINPASS HOLDS FACES. THE PLATFORM NEVER DOES.** |
| 4 | ⚠️ **The third attempt runs on the PREMIUM PROVIDER where one is in place.** ⚠️⚠️ **THE ENGINE IS A SETTING PER ATTEMPT, NEVER A CONSTANT.** |

## ⚠️ TWO ORDERS THE PLATFORM ISSUES

| Order | |
|---|---|
| ⚠️ **SERVE A MANUAL VERIFICATION** | **ChainPass serves the enrolment photograph to the member's screen** |
| ⚠️ **RE-SCAN THROUGH COMPLYCUBE** | **A fresh KYC and a new baseline.** ⚠️ **The cost is on us** — §9.1 item 3. |

⚠️⚠️ **THE REVERSE CHANNEL DOES NOT EXIST YET. NEITHER ORDER CAN BE SENT.**

## ⚠️⚠️ THE FAILURES COLUMN — RULED 17 AUGUST

> ⚠️⚠️ **"IN CHAINPASS ADMIN, FAILURES WILL BE UNDER A COLUMN. FOR REVIEW, WHERE THEY WILL
> DO THE MANUAL REVIEW THEMSELVES TO SEE IF IT'S OBVIOUS FRAUD."**

| # | |
|---|---|
| 1 | ⚠️ **A third-attempt selfie lands in ChainPass admin under a FAILURES column.** |
| 2 | ⚠️⚠️ **THE SCREEN IS A SIDE-BY-SIDE. THE BASELINE AND THE SELFIE, TOGETHER, AT SIZE.** |
| 3 | ⚠️ **ChainPass staff review it themselves.** |
| 4 | ⚠️⚠️ **WHAT THEY ARE LOOKING FOR IS OBVIOUS FRAUD. NOT A SCORE, NOT A SECOND OPINION ON THE MATCH.** |
| 5 | ⚠️⚠️ **THE MEMBER NEVER WAITS ON IT.** **The member has already gone past the scanner with a one-time number or an OTP, or the member is locked and heading to re-verification.** |
| 6 | ⚠️ **It is ChainPass's own record, not a gate.** |

### ⚠️⚠️ FRAUD FOUND HAS NOWHERE TO GO

⚠️ **`CANON-SA-01` §16 — the API runs one direction only.**

⚠️⚠️ **CHAINPASS CAN SEE OBVIOUS FRAUD AND HAS NO WAY TO TELL THE PLATFORM. THAT IS A NINTH
THING THE SEAM NEEDS** — `SPEC-SEAM-01` §5.

⬜ ⚠️ **What the reviewer's outcome does — nothing, a flag, an order to re-baseline, or a
credential state — is UNRULED.**

**Ruled 17 August 2026.**

---

# ⚠️⚠️ CHAINPASS OWNS THE WHOLE FACIAL STACK — RULED 17 AUGUST 2026

> ⚠️⚠️ **"CHAINPASS OWNS ALL THE FACIAL SOFTWARE. THEY HAVE TO HAVE ALL THE STIPS, DECLARE
> IT DOWN AND PROVIDE A SOLUTION, OR I WOULD NOT GO WITH THEM."**

⚠️ **Face screening is a wholly owned enterprise on the ChainPass side.**

| ⚠️ **CHAINPASS OWNS, END TO END** |
|---|
| **The enrolment capture** |
| **The baselines** |
| **The matcher** |
| **The image serve** |
| **The engines, standard and premium** |
| **The thresholds** |

⚠️⚠️ **THE PLATFORM OWNS NONE OF IT AND HOLDS NONE OF IT.**

---

## ⚠️⚠️ THREE SUPPLIER OBLIGATIONS

⚠️ **These are ChainPass's to provide. A platform cannot build around their absence.**

### 1 — ⚠️⚠️ CHAINPASS DECLARES THE OUTAGE

⚠️ **The control that sets the signal is `RULINGS-CP-05`.** AUTO is the default. Unknown
is served as down. Super only. The signal needs no credential to read.

| # | |
|---|---|
| 1 | ⚠️⚠️ **A HEALTH SIGNAL. ONE ENDPOINT, ONE ANSWER.** |
| 2 | ⚠️ **The platform READS it. The platform never decides it.** |
| 3 | ⚠️⚠️ **THE PLATFORM MUST NEVER INFER AN OUTAGE FROM CONSECUTIVE FAILURES.** ⚠️ **That is the failure mode that masked 400s as 503s and let a field-name bug survive for weeks.** |
| 4 | ⚠️ **It carries WHICH subsystem is down — the matcher, the image serve, or both.** |

### 2 — ⚠️⚠️ A DEGRADED MODE THAT STILL SERVES PHOTOGRAPHS

⚠️⚠️ **THE IMAGE SERVE IS DEPLOYED SEPARATELY FROM THE MATCHER.**

| # | |
|---|---|
| 1 | ⚠️ **A comparison needs an engine. Serving a file does not.** |
| 2 | ⚠️⚠️ **IF THEY SHIP TOGETHER, THE MATCHER GOING DOWN TAKES THE PHOTOGRAPH WITH IT — AND THE MANUAL FALLBACK DIES WITH THE THING IT IS A FALLBACK FOR.** |
| 3 | ⚠️ **Separated, the platform's outage mode works** — `CANON-MI-36` §2. **Both parties agree, each sees the other's photograph, and nothing has been matched by anyone.** |

### 3 — ⚠️ A STATED RECOVERY PATH

⚠️ **ChainPass says what happens and when. The platform tells the member.**

❌ **Never a platform improvising an explanation for a supplier's outage.**

---

## ⚠️⚠️ THE FAILURE COUNT IS A SETTING

> ⚠️ **"The number of failures needs to be flexible, because we have to find out when the
> path is bad. One, two, three — setting."**

| # | |
|---|---|
| 1 | ⚠️⚠️ **ONE, TWO OR THREE. ADMIN-ADJUSTABLE. NEVER A CONSTANT.** |
| 2 | ⚠️⚠️ **NOBODY KNOWS THE RIGHT NUMBER UNTIL THE PILOT MEASURES IT.** |
| 3 | ⚠️ **Every screen reads it.** ⚠️⚠️ **"ATTEMPT 1 OF N", NEVER "1 OF 3" IN COPY.** |
| 4 | ⚠️ **The premium engine runs on the LAST attempt, whatever N is.** |
| 5 | ⚠️ **The selfie is taken on the LAST attempt, whatever N is.** |
| 6 | ⚠️ **Separate from the lifetime red count** — §9.1 item 2. **Two counters, never conflated.** |

**Ruled 17 August 2026.**

---

# 16 — ⚠️⚠️ THE TECHNICAL LAYER — FOLDED FROM `CANON-CP-03`, 20 AUGUST

⚠️⚠️ **THIS SECTION COMPLETES THE FOLD. `CANON-CP-03` IS DELETED AND NOTHING IT HELD IS
LOST.** ⚠️ **The enrolment order it carried is superseded by §2 of this file — `CANON-CP-02` §1
governs: PAY at step 2; `CP-03` §8.2 had neither, which is why §2 governs.**

## 16.1 — ⚠️ THE VOCABULARY, ONE ADDRESS

| Word | Belongs to | Values |
|---|---|---|
| **PACKAGE** | **Vairify** | Free · Plus · Premium |
| **GROUP** | **Vairify launch cohorts** | Founding Council · First Movers · Early Access |
| ⚠️⚠️ **LEVEL** | **CHAINPASS** | **1 VAI Go · 2 VAI Access · 3 VAI Pro** |

⚠️⚠️ **BARE "PLUS" IS VAIRIFY'S PACKAGE AND NEVER CHAINPASS'S.** Closed by §14.1 and `RULINGS-CP-01`
Ruling 5.

## 16.2 — ⚠️⚠️ THE SCHEMA

```
platforms            id · name · api_key_hash · service_level (1|2|3) · status · created_at
                     response_level (1|2|3) ⚠️⚠️ DEFAULT 1. Admin-adjustable on the platform
                     row. 1 yes/no · 2 colour · 3 colour and percentage — `RULINGS-CP-04`.

platform_agreements  platform_id · commission_rules (jsonb) · payment_method
                     collection_fields (jsonb) · terms_doc_ref · terms_version
                     required_credential_level · consumption_block_size
                     settlement_schedule · signed_at · version

credentials          vai (7 chars, PK) · credential_level (1|2|3) · status
                     originating_platform_id (nullable, ⚠️⚠️ UPDATE FORBIDDEN BY TRIGGER)
                     document_expires_at · verified_at · created_at
                     year_starts_at · year_ends_at
                     ⚠️⚠️ THE YEAR RUNS FROM VERIFICATION. PAYMENT NEVER MOVES IT.
                     deferral_used (bool) ⚠️⚠️ ONCE EVER. NEVER RESET.
                     deferral_expires_at · paid_at
                     ⚠️⚠️ THE VAI IS NEVER DELETED, NEVER REISSUED, NEVER REASSIGNED.

credential_keys      vai · session_key · superseded_at          ← exists. append-only.

baselines            vai · embedding_ref · engine · created_at  ← ⚠️⚠️ APPEND-ONLY. NEVER DELETED.

platform_visits      vai · platform_id · agreement_id · terms_version · signed_at
                     UNIQUE (vai, platform_id)

agreements           id · platform_id · type (single|dual) · subtype (terms|contract)
                     vai_1 · vai_2 (nullable) · status (open|party1_verified|complete|expired|void)
                     content_ref → ⚠️⚠️ SUPERSEDED BY `SPEC-CP-02`: the five-table registry
                       below replaces this shape. Do not add columns here.
                     opened_at · closed_at · expires_at

agreement_proofs     agreement_id · vai · verified_at · engine_used   ← one row per face pass

verification_ledger  platform_id · vai · call_type · result · billed_against_block · at

commission_ledger    platform_id · vai · event (origination|renewal) · amount · period
                     status (accrued|payable|settled)
                     ⚠️ §14.5a: the payee reference is a trolley_recipient_id; an
                       individual earner is the same shape as a platform.

blocks               platform_id · size · consumed · purchased_at

service_registry     service_id · name · adapter · status        ← the inbound bank — §14.4
platform_services    platform_id · service_id                    ← elected at onboarding

settings             key · value    ← ⚠️⚠️ EVERY NUMBER THE OWNER MIGHT ADJUST — §1.1a.
                                       ❌ NO CONSTANTS IN CODE.

contracts            contract_id (CP-<PLATFORM>-<NNNN>-v<N>) · platform_id · family · version
                     body · content_hash · language · parties (1|2)
                     registered_at · registered_by · status (draft|live|retired)
                     retired_at (set once) · supersedes
                     ⚠️ status is the only mutable field. WRITE-ONCE by constraint + revoked
                        privilege — `SPEC-CP-02` §4.1. Index agreements.contract_id.

agreements           agreement_id (AG-<26 chars>, PK) · contract_id · content_hash
                     platform_id · outcome (agreed|declined|expired)
                     created_at · closed_at   ← ChainPass clock, UTC + local offset, ms
                     ⚠️⚠️ APPEND-ONLY. NO FIELD IS EVER UPDATED. — `SPEC-CP-02` §4.2

agreement_parties    agreement_id · vai (INDEXED) · party_order · answer · answered_at
                     match_ref
                     ⚠️ one row per V.A.I. per agreement — `SPEC-CP-02` §4.3

serve_events         serve_id · agreement_id · contract_id · content_hash · vai
                     served_at · delivery     ← ChainPass displayed the bytes

record_ledger        seq · table_name · row_key · row_hash · prev_hash · entry_hash
                     written_at (authoritative stamp)
                     ⚠️ every write to the four tables appends. Daily signed head stored
                        where the database role cannot reach — `SPEC-CP-02` §4.5

service_state        subsystem (matcher|image_serve) · mode (auto|declared_down|declared_up)
                     override_reason
                     ⚠️ boots AUTO. unknown served as down. — `RULINGS-CP-05`

service_state_log    who · when · from_state · to_state · why
                     ⚠️ APPEND-ONLY BY CONSTRAINT.

identity_join_log    who · when · authority · vai
                     ⚠️ the V.A.I. to legal-name join. Named authority. Every execution
                        logged. Build the log before the join — `SPEC-CP-02` §7
```

⚠️⚠️ **KNOWN BLOCKERS CARRY OVER: THE COMPLETION PRIMARY KEY BLOCKS APPEND-ONLY RENEWALS,
AND RLS IS ON 2 TABLES OF 16** — `OPERATIONS` §11 item 8. ⬜ **§10.3's provider-retention
column is absent from this schema and must be added** — audit item 4.

## 16.3 — ⚠️ THE GATE

```
1  POST /v1/gate                     platform key + V.A.I.
2  key → platform → level check     every endpoint's first check. one integer.
3  credential: exists · active · credential_level ≥ required_level
        ├─ does not exist → ⚠️ respond enroll_required + signed enrolment token
        └─ exists ↓
4  platform_visits (vai, platform_id)
        ├─ miss → ⚠️⚠️ respond terms_required → platform displays its terms →
        │         POST /v1/gate/sign → camera → match vs. baseline →
        │         agreement row (single, terms) + proof + visit row → granted
        └─ hit  → face comparison → granted | no_match
5  ⚠️ every call: verification_ledger row + block decrement
```

## 16.4 — ⚠️ RENEWAL, AS A FLOW

```
on the member renewal payment:
   document_expires_at > now()  AND  the provider retention window still live — §10.1
        ├─ ⚠️⚠️ YES → IN-HOUSE. face vs. stored baseline. verified_at updated. cost ≈ 0.
        └─ NO  → a fresh provider run. new document · new expiry · new baseline APPENDED.
                 ⚠️ the provider's dedup returns the same session key — §2.4b.
both paths → commission_ledger: event renewal, for the originator
```

⚠️⚠️ **BOTH WINDOWS ARE SETTINGS AND COLUMNS, NEVER CONSTANTS — §10.1 SUPERSEDED THE FIXED
THREE-YEAR NUMBER.**

## 16.5 — ⚠️ THE IN-SESSION AND AGREEMENT ENDPOINTS

| Endpoint | Level | |
|---|---|---|
| `POST /v1/verify` | ≥ 2 | Live capture vs. baseline. Repeatable, any time the member is inside. |
| `POST /v1/photo-match` | ≥ 2 | ⚠️ Static uploaded image vs. baseline. ⬜ **Pending owner confirm.** |
| `POST /v1/agreements` | 3 | type · vai_1 · vai_2? · the document per §14.2 → agreement_id |
| `POST /v1/agreements/{id}/verify` | 3 | face capture per party → proof row on match. Single closes on one proof, dual on two. |
| `GET /v1/agreements/{id}/proof` | 3 | pullable forever — §14.2a |

⚠️⚠️ **OPEN AGREEMENTS EXPIRE ON A TIMER. ONE PROOF ON AN EXPIRED DUAL IS VOID** — §14.2
item 7. **All in-session calls billed against the block and ledgered.**

## 16.6 — ⚠️ BUILD ORDER

| # | | Why this order |
|---|---|---|
| 1 | **Schema + the origination trigger + RLS on every table** | Everything hangs off it. |
| 2 | **The settings table, seeded** | ⚠️ No constant ever enters the code if the setting exists first. |
| 3 | **The gate endpoint** | The smallest sellable thing. |
| 4 | **Enrolment with origination + the three consent layers** | The credential factory. |
| 5 | **Verification ledger + blocks** | The consumption rail. |
| 6 | **The agreement API** | Terms signing rides on it. |
| 7 | **Commission ledger + settlement job** | Accrual first; Trolley is the rail — §14.5a. |
| 8 | **The renewal job** | ⚠️ Nothing renews in month one. |
| 9 | **The bank registry** | Adapters exist from step 4; the registry formalises them. |

⚠️⚠️ **CHAINPASS BUILDS FIRST. VAIRIFY'S INTEGRATION POINTS ARE REBUILT AGAINST THIS API AS
CUSTOMER ZERO, NOT AS A SPECIAL CASE.**

---

# 15 — ⚠️ WHAT MUST NEVER HAPPEN

| # | ❌ |
|---|---|
| 1 | ⚠️⚠️ **A PLATFORM RECEIVING A LEGAL NAME, A DOCUMENT, A BASELINE** |
| 2 | ⚠️⚠️ **A BASELINE COMMITTED BEFORE EVERY REQUIRED DOCUMENT IS SIGNED** |
| 3 | ⚠️⚠️ **A BASELINE BUILT FROM FEWER THAN TWO FRAMES, OR WITHOUT THE TERMS CHECKBOX AT STEP 8** |
| 4 | ⚠️⚠️ **AN ENROLMENT SESSION THAT CAN BE EXITED, RESUMED OR BACKGROUNDED BETWEEN THE PROVIDER AND THE BASELINE** |
| 5 | ⚠️⚠️ **AN ORIGINATION FIELD THAT CAN BE UPDATED** |
| 6 | ⚠️⚠️ **A SECOND DEFERRAL FOR ANYONE, ON ANY PLATFORM** |
| 7 | ⚠️⚠️ **A TERM THAT STARTS AT PAYMENT RATHER THAN AT VERIFICATION** |
| 8 | ⚠️⚠️ **A DELETED, REISSUED OR REASSIGNED V.A.I. — ONE PERSON, ONE V.A.I., FOR LIFE** |
| 9 | ⚠️⚠️ **A PLATFORM TOLD WHY A CREDENTIAL IS NOT ACTIVE, OR WHICH REQUIREMENT IS SHORT** |
| 10 | ⚠️⚠️ **A CHAINPASS SURFACE SAYING A CREDENTIAL PRICE IS SET BY A PLATFORM** |
| 11 | ⚠️ **A gate without the first-visit terms signing** |
| 12 | ⚠️⚠️ **ANY PRICE, RATE, CAP, BAND THRESHOLD, WINDOW OR ATTEMPT COUNT AS A CONSTANT IN CODE. EVERY ONE IS A ROW, CHANGED IN THE MASTER DASHBOARD.** |
| 12a | ⚠️⚠️ **A PRICE CHANGE APPLIED RETROACTIVELY TO WHAT SOMEONE ALREADY PAID OR ALREADY EARNED** |
| 13 | ⚠️ **A document signed before the V.A.I. is live — there is nothing to attach it to** |
| 14 | ⚠️ **A platform identity in a query parameter** |
| 15 | ⚠️ **A second proof subsystem — terms and contracts share one machinery** |
| 15a | ⚠️⚠️ **AN AGREEMENT VERSION EDITED, OVERWRITTEN OR DELETED AFTER ANYONE HAS SIGNED IT** |
| 15b | ⚠️⚠️ **A SIGNATURE STAMPED TO A DOCUMENT RATHER THAN TO THE EXACT VERSION SIGNED** |
| 15c | ⚠️⚠️ **A PLATFORM HOLDING THE ONLY COPY OF SOMETHING CHAINPASS CERTIFIED** |
| 15d | ⚠️ **A platform seeing another platform's documents or signatures** |
| 16 | ⚠️ **An enrolment without the biometric consent** |
| 17 | ⚠️ **Collection at any moment other than origination enrolment** |
| 18 | ⚠️ **The platform inferring an outage from consecutive failures** |

---

# CHANGELOG

| Date | # | Change | Reasoning |
|---|---|---|---|
| **26 Aug** | 40 | ⚠️⚠️ **§3 — deleted the losing length line. 32 stands. Encoding remains open.** | Owner ruling 25 Aug; UNIT 3 item 2 |
| **26 Aug** | 39 | ⚠️⚠️ **§14.1 — Pass-as-level-name flag deleted. Closed by `RULINGS-CP-07`.** | `RULINGS-CP-07` §3 item 9 |
| **26 Aug** | 38 | ⚠️⚠️ **§4C.1 — TIER replaced with LEVEL. TIER belongs to Vairify launch cohorts.** | `RULINGS-CP-07` §3 item 6 |
| **26 Aug** | 37 | ⚠️⚠️ **§14.1 — three service levels renamed VAI Go · VAI Access · VAI Pro. Integers 1, 2, 3 do not move.** | `RULINGS-CP-07` §3 item 4 |
| **26 Aug** | 36 | ⚠️⚠️ **§16.1 — deleted "LEVEL 2 IS WRITTEN 'V.A.I. PLUS'".** | `RULINGS-CP-07` §3 item 2 |
| **26 Aug** | 35 | ⚠️⚠️ **§16.1 LEVEL VALUES → VAI Go · VAI Access · VAI Pro. Integers 1, 2, 3 do not move.** | `RULINGS-CP-07` §3 item 1 |
| **25 Aug** | 34 | ⚠️⚠️ **§7.2 GREEN BAND RENAMED FROM PASS TO MATCH.** | Owner: the green band is Match. |
| **25 Aug** | 33 | ⚠️⚠️ **`CANON-CP-02` DEPOSITED — THIRTEEN-STEP SPINE GOVERNS §2. SESSION KEY LENGTH 30. `SPEC-CP-02` v3 — CONTRACT REGISTRY FIVE TABLES, WRITE-ONCE, AGREEMENT RUNS INSIDE CHAINPASS. `CANON-MI-36` TWO RECOVERY PATHS. `RULINGS-CP-05` SERVICE STATE CONTROL. `RULINGS-CP-06` USER-REQUESTED RE-BASELINE ALWAYS THE PROVIDER. `SPEC-FLOW-01` §0.1 SUPERSEDED: RETRIEVAL IS A CHAINPASS PAGE. "PASS" AS A LEVEL NAME FLAGGED AGAINST §14.1.** | Owner filings 25 Aug. |
| **25 Aug** | 32 | ⚠️⚠️ **`RULINGS-CP-04` FOLDED IN — THREE RESPONSE LEVELS ON THE PLATFORM ROW. §7.3 PERCENTAGE LEAVES WHEN THE LEVEL PERMITS. NEVER-LIST DROPS THE PERCENTAGE; LEGAL NAME, DOCUMENT AND BASELINE STAY. §14.6 ONE REQUEST, THREE RESPONSES. §7.2 BANDS AT LOGIN. §14.7 MASTER CONTROL. §16.2 `response_level` DEFAULT 1.** | Owner ruling 25 Aug. |
| **25 Aug** | 31 | ⚠️⚠️ **§16.1 — LEVEL 2'S NAME IS CLOSED. §14.1 AND `RULINGS-CP-01` RULING 5 GOVERN.** | Item 10 of the 25 Aug CP-02 enrolment prompt. |
| **25 Aug** | 30 | ⚠️⚠️ **§8 item 4 — MANUAL TRIGGERED BY YELLOW OR RED. `RULINGS-VA-05` §7.** | Item 9 of the 25 Aug CP-02 enrolment prompt. |
| **25 Aug** | 29 | ⚠️⚠️ **§2.10 — RETRIEVAL PAGE AT STEP 11 IS A CHAINPASS PAGE, PLATFORM-BRANDED. Brand is `platforms.brand`. One template. `CANON-CP-02` §5 item 3.** | Item 8 of the 25 Aug CP-02 enrolment prompt. |
| **25 Aug** | 28 | ⚠️⚠️ **§3 — SESSION KEY LENGTH IS 32 CHARACTERS, ALPHANUMERIC. Owner ruling. Encoding remains open.** | Item 3 of the 25 Aug CP-02 enrolment prompt. |
| **25 Aug** | 27 | ⚠️⚠️ **§2 SEQUENCE REPLACED WITH `CANON-CP-02` §1. THIRTEEN STEPS PLUS 11a. PAY AT STEP 2. SESSION KEY AT STEP 3. FACE MATCH AT STEP 10. RETRIEVAL PAGE AT 11. FINAL V.A.I. PAGE AT 11a. HANDOFF 12. KEY DELETED 13. SUPERSEDED STEPS DELETED, NOT MARKED. §2.0 DELETED.** | Owner: `CANON-CP-02` governs enrolment and supersedes `CANON-CP-01` §2. |
| **23 Aug** | 26 | ⚠️⚠️ **§0 ADDED — THE GRT AS A CHAINPASS SERVICE. 95% remitted at spend. ChainPass never holds the balance as its own. Peg is one Rose, one dollar.** | `RULINGS-VA-03` §3, §6. |
| **23 Aug** | 25 | **One name per control.** `credential_term` → `credential_year_length_years`. `deferral_window` → `deferral_window_hours`. Term stays one year as a field. Face attempts read `attempt_count_n`. The hardcoded 365, +1 year, and 5 are deleted. | RULINGS-VA-02 §6 · §8 · §9. Two names is how the mint and the copy drift. |
| **23 Aug** | 24 | **"four minutes" deleted from the §2 sequence block.** A canon step is not a stopwatch. | RULINGS-VA-02 §10. |
| **22 Aug** | 23 | ⚠️⚠️ **`RULINGS-CP-03` FOLDED IN — TERMS TO ACCEPTANCE PAGE (§2 · §14.3); TWO-FRAME BASELINE (§2.7); CONTACT-PLUS-TERMS MINIMUM, USERNAME NOT CHAINPASS (§2.3); ACCESS/V.A.I. THREE-REQUIREMENT CAP, PRO UNCAPPED (§1.1a · §4C · §14.1); PLATFORM TERMS DISCLOSURE (§14.3); SHORTFALL NEVER REJECTION (§11.4); BASELINE GATED ON TERMS CHECKBOX; LE SEPARATE AFFIRMATION (§4D); RECOVERY TABLES ON CHAINPASS (§2.10). §2.3 ITEM 1a DELETED. HELD-FRAME SIMULTANEITY LANGUAGE DELETED.** | Owner's spoken word, 22 Aug. |
| **22 Aug** | 22 | ⚠️⚠️ **`RULINGS-CP-02` FOLDED IN — TERMS AT REGISTER (§2 · §14.3); ONE ENROLMENT FLOW / LEVEL IS A GATE (§1.1a · §14.1); ISSUED VS ACTIVATED AT REVEAL (§2.3a); ACCOUNT SECURITY AT CHAINPASS STEP 11 (§2.10); SKIN ON PLATFORM AGREEMENT (§14.2b); LE DECLARATION ALWAYS CHAINPASS-BRANDED (§4D.0). WRONG §2.3 ITEM 4 DELETED.** | Owner's spoken word, 22 Aug. |
| **22 Aug** | 21 | ⬜ **GATE-LAUNCH-01 OPEN — `agreement_versions` `0-DRAFT` on `vairify` is a build-test marker inserted 22 Aug; real legal terms (owner · counsel) must replace it as a new immutable row and re-point `platform_agreements` before any real member enrols. Recorded: `docs/GATE-LAUNCH-01_TERMS_DRAFT.md` · `OPERATIONS.md` §11 row 0.** | `BLOCKER-ENROLMENT-TERMS` §7 · owner approved draft unblock |
| **22 Aug** | 20 | ⚠️⚠️ **REAL FIGURES REPLACED WITH SETTINGS POINTERS — `settings:price_vai`, `settings:price_vai_pro`, `settings:credential_term`, `settings:deferral_window`, `settings:deferral_suspend_after`, `settings:pro_custom_requirement_cap`, `settings:platform_document_pack`, `settings:appeal_panel_size`. ILLUSTRATIVE LEFT AS WRITTEN. FLAGGED UNCHANGED: seven-character V.A.I. length (issued format); ONCE.EVER. deferral (schema boolean); owner-quote calendar-year lines (record of what was said).** | CANON-00 §16. |
| **16 Aug** | 1 | **Filed from the owner's description.** | |
| **17 Aug** | 2 | **Third-attempt selfie and the facial stack appended.** | |
| **20 Aug** | 3 | ⚠️⚠️ **§2 THE SEQUENCE REWRITTEN. ELEVEN STEPS. REGISTER AND OTP MOVED AHEAD OF THE PROVIDER; THE V.A.I. REVEALED BEFORE THE REQUIREMENTS; THE BASELINE COMMITTED LAST.** §2.0 records every change. | ⚠️⚠️ **A SIGNED DOCUMENT WITH NOTHING TO ATTACH TO IS NOT A RECORD. AND NOTHING BECOMES THE ROOT OF TRUST UNTIL THE SIGNINGS ARE DONE.** ⚠️ **A provider call costs money and should not run before control is proven.** |
| **20 Aug** | 4 | ⚠️⚠️ **THE SEPARATE "SCAN YOUR FACE" SCREEN IS DELETED. §2.7 ADDED — SIMULTANEOUS CAPTURE.** | ⚠️⚠️ **THE SISTER CASE. HAND THE PHONE OVER AFTER THE DOCUMENT CHECK AND THE CREDENTIAL IS PERMANENTLY WRONG WITH NOTHING DOWNSTREAM ABLE TO DETECT IT.** ⚠️ **A threshold measures the gap; simultaneity removes it.** |
| **20 Aug** | 5 | ⚠️⚠️ **§2.3 — "NAME" IS A USERNAME. §2.9 ADDED — THE COURIER RULE.** | ⚠️⚠️ **THE LEGAL NAME IS CHAINPASS'S OWN VERIFIED DATA. HANDING IT OVER IS DISCLOSURE, NOT DELIVERY.** |
| **20 Aug** | 6 | ⚠️ **§1.1a — price authority added.** | ⚠️ **The enrolment app said "$99, set by Vairify and not by you" on one screen and listed ChainPass's own price rows on another.** ⚠️⚠️ **A PLATFORM SETS THE REQUIREMENT. CHAINPASS SETS THE PRICE.** |
| **20 Aug** | 7 | ⚠️ **§2.5, §2.6, §2.8 added — signed token, biometric consent, origination.** | ⚠️ **Consent after a capture is not consent.** ⚠️ **Origination closes §13 item 4.** |
| **20 Aug** | 8 | ⚠️ **§10.1 — the two-date test confirmed as governing.** | ⚠️⚠️ **AN EARLIER STATEMENT OF A FIXED THREE-YEAR WINDOW IS SUPERSEDED. THE PROVIDER'S RETENTION WINDOW IS THE PROVIDER'S, NOT A CONSTANT CHAINPASS PICKS.** |
| **20 Aug** | 9 | ⚠️⚠️ **§14 ADDED — THE PLATFORM API. SERVICE LEVELS, THE AGREEMENT API, UNIVERSAL FIRST-VISIT TERMS, THE INBOUND BANK, THE THREE RAILS.** | ⚠️ **§13 item 5 owed "V.A.I. Pro, in full". This is it.** ⚠️⚠️ **`CANON-CP-03` IS FOLDED IN HERE AND DELETED.** |
| **20 Aug** | 10 | **§15 added — eighteen never-happens.** | **Each is the inverse of a ruling above.** |
| **20 Aug** | 19 | ⚠️⚠️ **§16 ADDED — THE TECHNICAL LAYER: VOCABULARY, SCHEMA, GATE, RENEWAL, ENDPOINTS, BUILD ORDER, FOLDED VERBATIM FROM `CANON-CP-03`. §14.1 CORRECTED — THE LEVEL IS ON BOTH THE CREDENTIAL AND THE PLATFORM; ENTRY IS `credential_level ≥ required_level`.** | ⚠️⚠️ **AUDIT-02 ITEMS 1 AND 3. THE EARLIER FOLD TOOK THE API AND LEFT THE SCHEMA AND BUILD ORDER BEHIND — DELETING `CP-03` WOULD HAVE DELETED THE ONLY SCHEMA THE PROJECT HAD. AND §14.1'S "IDENTICAL AT EVERY LEVEL" CONTRADICTED §4C.1 IN THE SAME FILE.** |
| **20 Aug** | 18 | ⚠️⚠️ **§1.1a — EVERY PRICE IS ADMIN-ADJUSTABLE, STATED AS A GENERAL RULE.** Covers credential prices, upgrade differences, block pricing, commission rates and caps, coupon values, and anything priced later. Never retroactive. | ⚠️⚠️ **THE TABLE MARKED TWO PRICES "ADMIN-CHANGEABLE" AND SAID NOTHING ABOUT THE REST. A RULE THAT LIVES ONLY BESIDE TWO ROWS GETS BUILT AS TWO EXCEPTIONS.** |
| **20 Aug** | 17 | ⚠️⚠️ **§2.4c ADDED — THE VAULT MODULE. A DISASSOCIATED SIDECAR CHAINPASS SHIPS AND EVERY PLATFORM MAY ELECT AT ONBOARDING.** | ⚠️⚠️ **THE PROBLEM WAS NEVER ACCESS — IT WAS LOSS. BLIND-TAGGED, PLATFORM-KEYED, AUTO-REPLICATED: THE STOLEN FILE IS NOISE AND NEGLIGENCE HAS TO DEFEAT THREE COPIES AT ONCE.** ⚠️ **The sealed copy at ChainPass is opaque to ChainPass — the deletion story holds.** |
| **20 Aug** | 16 | ⚠️⚠️ **§2.4a–b ADDED — SESSION KEY DELIVERY AND LOST-KEY RECOVERY.** Delivered once in the handoff payload; never an endpoint; recovery runs through the person via provider duplicate detection. | ⚠️⚠️ **A RE-SEND IS IMPOSSIBLE BY CONSTRUCTION — WE DELETED OUR COPY. AND THE KEY WAS ALWAYS A POINTER: WHAT IT POINTS TO SURVIVES AT THE PROVIDER, SO THE MEMBER THE USER IS THE BACKUP.** ⚠️ **Multi-provider derivation flagged as blocking a second provider.** |
| **20 Aug** | 15 | ⚠️⚠️ **§14.2b–c ADDED — ONBOARDING UPLOADS AND THE VERSION NOTICE.** Agreements and terms are uploaded at onboarding; terms may be elected for signing at registration; a new version carries the platform's own typed notice, stamped and immutable. | ⚠️ **The documents are configuration, declared with everything else.** ⚠️⚠️ **THE NOTICE IS THE PLATFORM'S WORDS — CHAINPASS NEVER CHARACTERISES A LEGAL CHANGE ON ANYONE'S BEHALF.** |
| **20 Aug** | 14 | ⚠️⚠️ **§14.5a–§14.8 ADDED — TROLLEY, THE CLIENT API, ONE-API-TWO-DASHBOARDS, AND THE VAIRIFY SEAM.** | ⚠️⚠️ **COMMISSIONS PAY THROUGH TROLLEY SO CHAINPASS NEVER KNOWS WHO IT PAYS. THE API IS THE PRODUCT AND BOTH DASHBOARDS ARE CLIENTS OF IT. THE SESSION KEY IS NEVER AN ENDPOINT. VAIRIFY IS A CLIENT LIKE ANY OTHER — NOTHING VAIRIFY-SHAPED IN CHAINPASS CODE.** |
| **20 Aug** | 12 | ⚠️⚠️ **§14.2 REVERSED — CHAINPASS HOLDS THE DOCUMENT ITSELF, IMMUTABLE AND VERSIONED. EVERY V.A.I. IS STAMPED TO THE EXACT VERSION IT SIGNED. §14.2a ADDED — NO HANDOFF; THE RECORD STAYS AT CHAINPASS AND THE PLATFORM READS IT FROM ITS DASHBOARD.** | ⚠️⚠️ **A PROOF THAT SAYS "THESE TWO AGREED TO DOCUMENT X" IS WORTH NOTHING IF THE PLATFORM HOLDS X AND CAN REWRITE IT. THE BLANK-ENVELOPE RULE CERTIFIED THE PEOPLE AND LEFT THE CONTENT EXPOSED.** ⚠️ **It also survives a platform closing, losing its database, or refusing to produce a document.** |
| **20 Aug** | 13 | ⚠️⚠️ **§2.7 ITEM 5 SPLIT. THE LOCK BINDS THE CAPTURE TO THE PROVIDER'S CHECK. A BREAK VOIDS THE CAPTURE, NOT THE ENROLMENT — THE MEMBER RESUBMITS.** | ⚠️⚠️ **§2.7 SAID A BREAK VOIDS EVERYTHING AND §2.4 SAID AN INTERRUPTION IS RECOVERABLE. BOTH WERE IN THE CANON AND DESIGN DREW BOTH.** ⚠️ **The provider does not charge for a resubmit; if one does, ChainPass eats it.** |
| **20 Aug** | 11 | ⚠️⚠️ **§2.4 — THE PATENT GATE FLAGGED AGAINST §12 ITEM 6.** | ⚠️⚠️ **CHAINPASS STILL HOLDS `complycube_client_id`, NOT NULL, READ BY FOUR FUNCTIONS AFTER ENROLMENT. THE SECTION DESCRIBES AN INTENTION, NOT A BUILD.** |

---

**16 August 2026. Amended 20 August 2026. v3 — §16 the technical layer.**
