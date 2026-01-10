# Folder/File Duplication Analysis

## 1. Project Folders: CRITICAL DUPLICATION

### `capy-checkpoint/` (Vite + React)
- **Tech:** React + TypeScript + Vite
- **Purpose:** Original implementation (legacy)
- **README:** Generic Vite template boilerplate
- **Status:** Modified files (package.json, postcss.config.js, PhaserGame.tsx, index.css)

### `capy-checkpoint-next/` (Next.js)
- **Tech:** Next.js 16 + React 19 + Phaser 3.90
- **Purpose:** Active production app
- **README:** Comprehensive project documentation (447 questions, 21 badges, 18 cosmetics)
- **Deploy:** Vercel (mathie18.vercel.app, mathie.ai4u.now)
- **Features:** 11 Zustand stores, Firebase, PWA, Gemini AI, full test coverage

**VERDICT:** `capy-checkpoint-next/` is active. `capy-checkpoint/` is abandoned Vite prototype.

**RECOMMEND:** **DELETE** `capy-checkpoint/` entirely. Zero production value. Next.js fork superseded it.

---

## 2. README Files: 3 DUPLICATES

### Root `README.md`
- **Lines:** 122
- **Content:** Production-ready overview, deployment URLs, full tech stack, metrics
- **Audience:** External developers/stakeholders
- **Quality:** High - comprehensive

### `capy-checkpoint/README.md`
- **Lines:** 74
- **Content:** Generic Vite template instructions (ESLint, React Compiler, SWC vs Babel)
- **Audience:** Vite developers
- **Quality:** Low - boilerplate, no project context

### `capy-checkpoint-next/README.md`
- **Lines:** 76
- **Content:** User-focused game documentation, emoji-rich, play instructions
- **Audience:** End users/contributors
- **Quality:** Medium - friendly but less technical

**VERDICT:** Root README is canonical. `capy-checkpoint/` README is template junk.

**RECOMMEND:**
- **KEEP:** Root README.md (canonical)
- **DELETE:** `capy-checkpoint/README.md` (will vanish with folder deletion)
- **MERGE/DELETE:** `capy-checkpoint-next/README.md` - merge unique game mechanics into root, delete

---

## 3. HTML Files: 3 STATIC MOCKUPS

### Root Level
- `level1-forest.html` (8KB)
- `level2-garden.html` (6.8KB)
- `level3-sky.html` (7KB)

**Purpose:** Design-phase static mockups (kawaii/cottagecore aesthetic)
**Status:** Obsolete - Phaser game now implements levels dynamically
**References:** CLAUDE.md mentions them as "Static mockups (design phase)"

**VERDICT:** Historical artifacts. No runtime value.

**RECOMMEND:**
- **OPTION A:** DELETE all 3 (cleanest)
- **OPTION B:** Move to `materials/mockups/` for archival (if design team needs reference)

---

## 4. Configuration Files: 2 SETS

### `capy-checkpoint/`
- `package.json` - Vite dependencies
- `tsconfig.json` - Vite TypeScript config
- `postcss.config.js` - Modified (git status shows M)

### `capy-checkpoint-next/`
- `package.json` - Next.js dependencies (React 19, Serwist, Zustand)
- `tsconfig.json` - Next.js TypeScript config
- `postcss.config.js` - Tailwind 4 config

**VERDICT:** No conflict. Each belongs to its project. Vite configs become irrelevant when folder deleted.

**RECOMMEND:** No action needed (auto-resolved by folder deletion).

---

## 5. Other Duplications

### `.git/` Folders
- Root `.git/` - main repo
- `capy-checkpoint-next/.git/` - **NESTED GIT REPO** (submodule or mistake)

**VERDICT:** Dangerous. Nested Git repos cause sync issues.

**RECOMMEND:** **DELETE** `capy-checkpoint-next/.git/` - use root repo only.

### Node Modules
- `capy-checkpoint/node_modules/` - Vite deps (~500MB waste)
- `capy-checkpoint-next/node_modules/` - Next.js deps (needed)

**RECOMMEND:** Auto-deleted with folder. No separate action.

---

## Summary: Cleanup Actions

| Item | Action | Rationale |
|------|--------|-----------|
| `capy-checkpoint/` folder | **DELETE** | Abandoned Vite prototype, 100% obsolete |
| Root `README.md` | **KEEP** | Canonical documentation |
| `capy-checkpoint-next/README.md` | **MERGE → DELETE** | Extract game mechanics, merge to root |
| `level*.html` (3 files) | **DELETE** | Static mockups, replaced by Phaser |
| `capy-checkpoint-next/.git/` | **DELETE** | Nested repo conflict |

**Est. cleanup:** ~600MB disk space, 50% folder clutter reduction

---

## Unresolved Questions

1. Does design team need `level*.html` preserved for reference?
2. Are there uncommitted changes in `capy-checkpoint-next/.git/` that need salvage?
3. Should `materials/` folder be audited next for duplicate PDFs?
