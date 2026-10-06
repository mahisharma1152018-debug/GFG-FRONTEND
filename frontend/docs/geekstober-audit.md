# GEEKTOBER — Current Audit

**Date:** 2026-10-06

## Event source of truth

- Event: **GEEKTOBER**
- Organizer: **GeeksforGeeks RBU Chapter**
- Participation: **individual only**
- Event window: **11 October 2026 through 17 October 2026**, inclusive
- Timezone for event boundaries: **Asia/Kolkata**
- Official GitHub organization: `https://github.com/gfg-rbu`

## Routes

The existing React Router structure includes public pages for Home, Projects, Leaderboard, How It Works, Rules, Badges, About, project details and profiles, plus authenticated participant and admin routes. A wildcard route renders the existing 404 page.

## Key repairs

1. Centralized the event start/end boundaries in `src/config/site.ts` and derived the display date range, seven-day duration and event status from that configuration.
2. Removed event team-registration/formation language and team data from visible participant/leaderboard mock UI.
3. Reworked the About timeline into a connected responsive timeline using only the confirmed Oct 11 and Oct 17 milestones.
4. Replaced outdated community URLs with the supplied official Discord, LinkedIn, Instagram and GitHub URLs. WhatsApp remains conditional on `VITE_WHATSAPP_URL`.
5. Removed the hero-area GitHub organization button while retaining legitimate GitHub destination links elsewhere.
6. Restyled the global search dialog with a restrained dark backdrop/dialog and removed the green glow. Added arrow-key/Home/End navigation, Enter-to-open, Escape-to-close and focus restoration behavior.
7. Hardened backend route validation for GitHub owner/repository/PR parameters and request data.
8. Fixed GitHub repository discovery for the configured `gfg-rbu` organization by supporting an explicit `GITHUB_OWNER_TYPE=organization` mode and avoiding an organization 404 being silently treated as a personal-account success.
9. Added bounded JSON-file caching with TTL, entry/size limits, atomic replacement, malformed-cache recovery, serialized writes and mutation invalidation. Session-cookie requests are never served from the public cache.
10. Added a live `GET /api/stats` endpoint for homepage counters, with mock statistics clearly treated as a development-only fallback.
11. Fixed OAuth success redirection for split frontend/backend deployments and rejected cross-origin redirect targets.

## Verification limitations

- Backend JavaScript syntax checks pass for every `src/**/*.js` file.
- Full backend Jest tests could not run because backend dependencies were not installed and dependency installation timed out in the execution environment.
- The frontend build could not complete for the same dependency-installation limitation; the available TypeScript compiler reached the project configuration but reported missing `vite/client` and Node type definitions from the incomplete local dependency tree.
- GitHub endpoint construction was directly exercised with a mocked `fetch` and confirmed to request `/orgs/gfg-rbu/repos?...` in organization mode.

No real credentials were added to the project.
