# CP-RUN-01-BUILD-NOTES — 26 Aug 2026

Role: Cursor WRITES. Never decides.

## L-0 Item 0
Created this file. ATTACH: CP RUN #1 REPORT (26 Aug) found as `docs/notes/CP-PASS-SUMMARY-01.md` (and committed copy `docs/notes/CP-RUN-01-EXPORT/CP-PASS-SUMMARY-01.md`). ATTACH: `SESSION-LOG-CP__2026-08-22-24` — `find` in this repo, `~/vai-workspaces`, `~/Downloads`, `~/Documents`, Cursor project dir → 0 files. Missing log reported, not reconstructed. Figures from the 26 Aug notes/summary are records, not canon.

## L-BEFORE
- HEAD at start: `edc7da64918af1e6ade7c50c78d2a0c7cbdffc3c`
- remote origin: `https://github.com/VAI-ECO/chainpass-app.git` (fetch + push). One remote. chainpass-app only.
- porcelain at start: `?? docs/notes/CP-RUN-01-EXPORT/`

---

## UNIT 1 — PUSH

### L-U1-01
`git remote -v`:
```
origin	https://github.com/VAI-ECO/chainpass-app.git (fetch)
origin	https://github.com/VAI-ECO/chainpass-app.git (push)
```
`git ls-remote --heads origin`:
```
3911e0854db65376bd482b2701e53ca3c349cd2a	refs/heads/dev
69981aabad9ca28d424bd71db76e2e3e7e4a8b88	refs/heads/main
```
No `refs/heads/chainpass-fixes`. No `origin/chainpass-fixes`.

### L-U1-02
Classified `docs/notes/CP-RUN-01-EXPORT/`: untracked copies of already-committed 26 Aug deliverables (`CP-RUN-01-NOTES.md`, `CP-PASS-SUMMARY-01.md`, `REF-CP-01_CHAINPASS_CANON_AND_FEATURES.md`). Not new canon. Not deleted. Committed with this notes file as `d36a4ce`. `git status --porcelain` after commit → empty.

### L-U1-03
`git push -u origin chainpass-fixes`:
```
To https://github.com/VAI-ECO/chainpass-app.git
 * [new branch]      chainpass-fixes -> chainpass-fixes
branch 'chainpass-fixes' set up to track 'origin/chainpass-fixes'.
```
`git log --oneline origin/chainpass-fixes..HEAD` → empty.

### L-U1-04
Push did not fail. Item skipped.

### L-U1-05
`git branch -avv`:
```
* chainpass-fixes                d36a4ce [origin/chainpass-fixes] Commit the 26 Aug export copies and start the CP RUN #1 build notes.
  dev                            3911e08 [origin/dev] Remove embedded inspect repo from tracking
  main                           69981aa [origin/main] ChainPass Pilot - Lovable build
  remotes/origin/HEAD            -> origin/main
  remotes/origin/chainpass-fixes d36a4ce Commit the 26 Aug export copies and start the CP RUN #1 build notes.
  remotes/origin/dev             3911e08 Remove embedded inspect repo from tracking
  remotes/origin/main            69981aa ChainPass Pilot - Lovable build
```
`git status -sb`: `## chainpass-fixes...origin/chainpass-fixes`

---

## UNIT 2 — IS THE BUILD TELLING THE TRUTH

### L-U2-01
Every `tsconfig*.json` (6 files). Root three:

`tsconfig.json`:
```
{
  "files": [],
  "references": [{ "path": "./tsconfig.app.json" }, { "path": "./tsconfig.node.json" }],
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "noImplicitAny": false,
    "noUnusedParameters": false,
    "skipLibCheck": true,
    "allowJs": true,
    "noUnusedLocals": false,
    "strictNullChecks": false
  }
}
```

`tsconfig.app.json`:
```
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": false,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noImplicitAny": false,
    "noFallthroughCasesInSwitch": false,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"]
}
```

`tsconfig.node.json`:
```
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2023"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["vite.config.ts"]
}
```

`chainpass-app-inspect/tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json` are byte-identical copies of the three root files (same `"files": []` + references on inspect root).

### L-U2-02
Root `tsconfig.json` has `"files": []` AND `references` only (same lie pattern as Vairify). `package.json` scripts before this unit:
```
"dev": "vite",
"build": "vite build",
"build:dev": "vite build --mode development",
"lint": "eslint .",
"preview": "vite preview",
"test": "vitest run --config ./vitest.config.ts",
"test:watch": "vitest --config ./vitest.config.ts"
```
`build` did not run a bare `tsc`. It ran `vite build` only. Bare `npx tsc --noEmit` (no `-p`) exit 0, `grep -c "error TS"` = 0, because `"files": []`.

### L-U2-03
`npm ci`: added 955 packages, audited 956 in 12s. 7 vulnerabilities (1 low, 4 moderate, 1 high, 1 critical).
`npm run build` BEFORE script fix (vite only): PASS. Exit 0.
```
vite v5.4.21 building for production...
✓ 6130 modules transformed.
dist/assets/index-CxYhj-AL.js  3,801.69 kB │ gzip: 1,055.49 kB
✓ built in 6.14s
PWA v1.3.0 generateSW precache 24 entries
```

### L-U2-04
`npx tsc --noEmit -p tsconfig.app.json 2>&1 | grep -c "error TS"` → **16**. Exit 2.
`uniq -c` by code:
```
   5 error TS2345
   4 error TS2304
   3 error TS2322
   2 error TS2769
   2 error TS2353
```
Per-file:
```
   3 src/services/accountService.ts
   3 src/pages/EnrolSecurity.tsx
   3 src/pages/BusinessVerificationStart.tsx
   3 src/components/BusinessSelection.tsx
   1 src/pages/VaiSuccess.tsx
   1 src/pages/ContractSignature.tsx
   1 src/components/docs/GraphQLSupport.tsx
   1 src/components/contracts/FacialVerification.tsx
```
Two numbers: vite `build` PASS (0 type errors checked) vs app tsc **16**. Root bare tsc **0**. They differ.

### L-U2-05
Fixed `package.json` `build` to `tsc --noEmit -p tsconfig.app.json && vite build`. No flags added. No files excluded. Errors not silenced.
`npm run build` AFTER: FAIL. Exit 2. Same 16 `error TS` lines. Vite did not run. Build now reflects the app typecheck.

### L-U2-06
`npx eslint .` → `✖ 427 problems (350 errors, 77 warnings)`. Exit 1. (Includes `chainpass-app-inspect/` and `supabase/functions/`.)

### L-U2-07
Command: `npm test` → `vitest run --config ./vitest.config.ts`
```
 Test Files  2 passed (2)
      Tests  4 passed (4)
   Duration  1.02s
```
Files: `src/pages/__tests__/VaiEntryCheck.test.tsx` and `chainpass-app-inspect/src/pages/__tests__/VaiEntryCheck.test.tsx`.

### L-U2-08
Did not fix the 16 type errors this unit. UNIT 3 removes them at the source if they are live-schema mismatches.
