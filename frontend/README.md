# GFG Hacktober Fest — Competition Platform

An **open-source contribution competition** portal: participants pick a repository, claim a problem
statement, ship a pull request on GitHub, and earn XP, badges and leaderboard rank for effective,
reviewed, merged work.

> Code. Contribute. Compete.

---

## Stack

| Layer     | Choice                                             |
| --------- | -------------------------------------------------- |
| UI        | React 19 + TypeScript (strict) + Vite              |
| Styling   | Tailwind CSS v4 (design tokens in `src/index.css`) |
| Routing   | React Router (lazy-loaded routes)                  |
| Data      | TanStack Query                                     |
| Forms     | React Hook Form + Zod                              |
| Charts    | Recharts                                           |
| Animation | Framer Motion                                      |
| Toasts    | Sonner                                             |
| Icons     | Lucide React                                       |
| Backend   | MongoDB + Express (separate service)               |

## Getting started

```bash
npm install
cp .env.example .env      # optional — the app runs fully on mock data without it
npm run dev               # http://localhost:5173
```

Scripts: `npm run dev` · `npm run build` (typecheck + bundle) · `npm run lint` · `npm run preview`

## Routes

| Route                          | Purpose                                            |
| ------------------------------ | -------------------------------------------------- |
| `/`                            | Landing page: hero, stats, workflow, showcase      |
| `/projects`                    | Project / problem-statement registry with filters  |
| `/projects/:slug`              | Project detail: issues, guidelines, history        |
| `/leaderboard`                 | Overall / weekly / project standings + podium      |
| `/rules`                       | Point rules + interactive XP calculator            |
| `/badges`                      | Achievement catalogue                              |
| `/how-it-works`                | Contribution lifecycle and verification flow       |
| `/about`                       | Event, values, timeline                            |
| `/profile/:username`           | Public participant profile                         |
| `/dashboard`                   | Participant workspace (auth-gated)                 |
| `/progress`                    | Stage tracker: issue → fork → PR → points          |
| `/admin`                       | Admin console (admin-gated)                        |
| `/admin/projects`              | Project CRUD                                       |
| `/admin/problem-statements`    | Problem statement CRUD (Zod-validated)             |
| `/admin/participants`          | Participant table                                  |
| `/admin/contributions`         | Review / classification queue                      |
| `/admin/scoring`               | Scoring configuration editor                       |
| `/admin/github`                | GitHub App / webhook integration status            |
| `/admin/settings`              | Event configuration                                |

## Architecture

```
src/
├── components/   ui, layout, navigation, hero, home, projects, leaderboard,
│                 contributions, badges, progress, github, charts, search, rules
├── pages/        route components (Admin/ holds the console screens)
├── routes/       AppRoutes + RequireAuth guard
├── services/     api.ts (HTTP gateway) + one module per domain
├── hooks/        TanStack Query hooks and UI helpers
├── contexts/     AuthContext (mock session, OAuth-ready)
├── data/mock/    projects, users, contributions, badges, scoring, analytics, github
├── types/        the API contract (interfaces only — no `any`)
├── config/       site-wide configuration (nav, stats, levels)
└── utils/        formatting, class names, activity grid generation
```

### Backend integration

Every request goes through `src/services/api.ts`; UI components never call `fetch` directly.
Each service exposes both branches:

```ts
export async function getProjects(filters: ProjectFilters) {
  if (isBackendConfigured()) return api.get<Paginated<Project>>('/projects', { ...filters })
  // mock branch — same contract, local data + filtering
}
```

Set `VITE_API_BASE_URL=http://localhost:5000/api` in `.env` and the same components start calling
the Express API with no other changes.

Integration points are marked in the source:

```ts
// TODO: Connect authentication (GitHub OAuth)
// TODO: Connect leaderboard API
// TODO: Connect GitHub webhook data
// TODO: Connect admin CRUD API
// TODO: Connect badge API
```

### Scoring

XP ranges, quality multipliers and award requirements live in `src/data/mock/scoring.ts` and are
consumed through `contribution.service.ts` (`getScoringConfig`, `estimateXp`). No component hardcodes
a score — the admin panel edits the same structure, so backend tuning never requires a UI change.
