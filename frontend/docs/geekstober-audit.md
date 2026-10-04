# GEEKSTOBER — Phase 0 Audit

**Date:** 2026-10-03  
**Branch:** `geekstober-redesign`

---

## 1. Routes & Page Mapping

| Screenshot nav item | Route | Status |
|---|---|---|
| Home | `/` → `pages/Home/Home.tsx` | ✅ Exists |
| Projects | `/projects` → `pages/Projects/Projects.tsx` | ✅ Exists |
| Leaderboard | `/leaderboard` → `pages/Leaderboard/Leaderboard.tsx` | ✅ Exists |
| How It Works | `/how-it-works` → `pages/HowItWorks/HowItWorks.tsx` | ✅ Exists |
| Rules | `/rules` → `pages/Rules/Rules.tsx` | ✅ Exists |
| Badges | `/badges` → `pages/Badges/Badges.tsx` | ✅ Exists |
| About | `/about` → `pages/About/About.tsx` | ✅ Exists |
| My Progress | `/dashboard` (auth-gated) | ✅ Exists |

All nav items have corresponding routes. No new static pages needed.

---

## 2. Data Layer

| Data | Source | Notes |
|---|---|---|
| Projects list | `src/data/mock/projects.ts` → `project.service.ts` | 12 projects in registry |
| Leaderboard / users | `src/data/mock/users.ts` → `leaderboard.service.ts` | 20 participants |
| Badges | `src/data/mock/badges.ts` → `badge.service.ts` | Various badges |
| Analytics/Stats | `src/data/mock/analytics.ts` | Summary stats |
| Scoring config | `src/data/mock/scoring.ts` | Centralized |
| Event-level stats | `src/config/site.ts` → `EVENT_STATS` | 12 repos, 250 participants, 500 issues |

**Stats for stat tiles (from real data):**
- Repositories: 12 (from MOCK_PROJECTS.length)
- Participants: 20 mock users (config says 250+)
- Open Issues: computed from mock projects' openIssues field
- Badges: from mock badges data

---

## 3. Authentication

- `AuthContext.tsx` exposes `{ user, isAuthenticated, role, login, logout }`.
- `user.name`, `user.username` available for avatar chip.
- Auth is currently mock (`auth.service.ts` — no real OAuth yet).
- Avatar chip: shows initials from `user.name` (no avatarUrl in mock User type).
- "My Progress" button routes to `/dashboard` when authenticated.

---

## 4. Scoring

- Scoring config is in `src/data/mock/scoring.ts`.
- Intended base: Easy=10, Medium=30, Difficult=50 XP.
- **Needs your decision:** Verify actual values in `scoring.ts` match intended values.

---

## 5. What Is Working / Visual / Broken

### Working
- All routes render their pages.
- Auth context with mock sign-in/sign-out.
- Leaderboard search and sort.
- Project listing, filters, project details.
- Admin panel (all sub-routes).
- Command palette search (Ctrl+K).
- Responsive mobile drawer.

### Visual Only (to be changed by this redesign)
- Color palette: currently dark green (`#050805`, `#22c55e`). Needs to become deep navy + mint.
- Hero: currently shows a GitBranch + Terminal visual. Needs pixel-art night scene.
- Logo: currently "GFG HACKTOBERFER FEST". Needs to become "GEEKSTOBER / GFG STUDENT CHAPTER RBU".
- Branding: "GFG Hacktober Fest" appears in `site.ts`, meta tags, footer, and page titles.
- Font: no pixel font currently. Needs Pixelify Sans / Silkscreen for headings.
- Background: plain dark green void. Needs deep navy night scene.

### Broken / Missing
- No real GitHub OAuth (mock only) — existing setup preserved.
- No backend — all data is mock — preserved.
- `favicon.svg` is a generic icon.

---

## 6. Files to Touch

### Phase 1 — Design tokens & fonts
- `src/index.css` — color tokens, new navy palette, add pixel font
- `index.html` — Google Fonts import, meta tags

### Phase 2 — Branding
- `src/config/site.ts` — SITE_CONFIG.name, tagline
- `src/components/ui/Logo.tsx` — GEEKSTOBER logo with pixel-cat mascot
- `src/components/navigation/Footer.tsx` — branding, disclaimer note

### Phase 3 — Hero (major)
- `src/components/hero/Hero.tsx` — replace terminal/git visual with pixel-art scene + journey panel
- `src/components/hero/PixelScene.tsx` — new: SVG pixel-art background layers
- `src/components/hero/JourneyPanel.tsx` — new: "Your Open Source Journey" right panel

### Phase 4 — Navbar
- `src/components/navigation/Navbar.tsx` — floating rounded navbar style

### Phase 5 — Home page sections
- `src/components/home/*.tsx` — restyle in navy theme

### Phase 6 — Other pages
- Pages in `src/pages/` — consistent dark navy theme

---

## 7. Needs Your Decision

1. **Scoring values:** Verify `src/data/mock/scoring.ts` matches Easy=10, Medium=30, Difficult=50 XP intended.
2. **Real stat tile data:** The stat tiles should pull from real data layer; currently `EVENT_STATS` in `site.ts` has hardcoded numbers (12 repos, 250 participants, 500 issues). The mock data has 20 participants and 12 projects with varying open issues. A backend stat endpoint would resolve this.
3. **GitHub OAuth:** Auth is fully mock. The login page shows "Continue with GitHub" but the flow is simulated. Any real OAuth setup would be a non-visual change.
4. **Participant avatars:** `User` type has optional `avatarUrl`; mock data does not populate it. The bottom strip of the hero would use initials/pixel placeholders.
5. **"About" page:** Route exists (`/about`) but content is minimal. No non-visual changes made.
