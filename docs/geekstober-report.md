# GEEKTOBER — Repair Report

**Date:** 2026-10-06

## Scope

The existing frontend/backend architecture was retained. The repair focuses on the requested event consistency, solo participation messaging, community links, search UI, route safety, JSON cache behavior, GitHub synchronization and OAuth redirect behavior.

## Event

The application now treats GEEKTOBER as an individual open-source contribution event running from **October 11 through October 17, 2026**. The frontend stores the event boundary once and derives the seven-day duration and upcoming/live/ended status.

## Social links

The community configuration now uses the supplied official Discord, LinkedIn, Instagram and `gfg-rbu` GitHub organization URLs. WhatsApp is displayed only when `VITE_WHATSAPP_URL` is explicitly configured.

## Timeline and solo participation

The About timeline is a connected responsive vertical timeline with only the confirmed event start and end milestones. Team formation/registration language was removed from participant-facing event UI.

## Backend

- `GITHUB_OWNER=gfg-rbu` and `GITHUB_OWNER_TYPE=organization` are the documented defaults.
- Organization repository discovery uses the GitHub `/orgs/:org/repos` endpoint.
- GitHub sync route parameters are validated before reaching the sync layer.
- Request query/body structures are checked for dangerous prototype-pollution keys and excessive nesting.
- Added `GET /api/stats` so repository, open-issue, participant and active-badge counters come from MongoDB when the backend is configured.
- The JSON cache is TTL-based, bounded, atomic, resilient to malformed files and invalidated after mutations.
- OAuth redirects are resolved against the configured frontend origin and cross-origin redirect targets are rejected.

## Tests/checks actually executed

- `node --check` over every backend JavaScript source file: **PASS**.
- Direct mocked GitHub repository-list request in organization mode: **PASS**; constructed URL targets `https://api.github.com/orgs/gfg-rbu/repos?...`.
- Frontend `npm run build`: **BLOCKED** because dependency installation timed out and the local dependency tree is incomplete (`vite/client` and Node type definitions unavailable).
- Backend Jest suite: **BLOCKED** because backend dependencies are unavailable; no test result is being claimed.

## Remaining input

The only required deployment-time inputs are the real MongoDB URI, GitHub token/webhook secret, sync secret and (when using GitHub OAuth) GitHub OAuth credentials plus the correct frontend/backend origins. No credentials are included in the ZIP.
