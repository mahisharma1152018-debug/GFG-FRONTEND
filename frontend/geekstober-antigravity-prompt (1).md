# GEEKSTOBER: Visual Redesign of an Existing Project

You are working on an **existing repository**. This is a visual and branding transformation, not a rebuild.

**Repository:** https://github.com/Vansh-Maindiratta/GFG-Hacktober-Fest (already in this workspace; the workspace copy is the source of truth)
**Reference image:** the screenshot attached to this message, referred to below as `Main_UI.png` (a 1768 × 889 image of the target homepage). Study it carefully before you start and keep it in view throughout. If you cannot see an attached image, stop and ask for it before doing anything else.

## 0. Ground rules

1. **The landing page (`/`) must match `Main_UI.png` as exactly as possible**: layout, composition, proportions, colors, typography, copy, spacing, and pixel-art scene.
2. **Every other page must adopt the same visual world** (dark navy night, pixel-art accents, mint green, chunky pixel headings, readable modern UI).
3. **Do not change what the app does.** The repo's features, routes, data models, API/service layer, authentication, admin functionality, scoring configuration, and state logic all stay as they are. You are changing presentation: styles, theme tokens, layout markup, visual assets, branding strings, and decorative components.
4. If you find something that is broken, or a feature that needs a non-visual change to support the design, **do not silently change it**. List it in the final report under "Needs your decision" and keep going.
5. Do not add libraries unless the existing stack cannot do the job (for example, a font package). Reuse existing components; do not create duplicates of pages or components.
6. Work on a new git branch `geekstober-redesign` and commit after each phase.

## 1. Phase 0: Audit before editing

Do not modify any file until this is done. Inspect `package.json`, the folder structure, routes, pages, components, hooks, services and data layer, auth, admin, styling and theme setup (Tailwind config or CSS), assets, and responsive behavior. Run the project and open every page.

Write the findings to `/docs/geekstober-audit.md`:
- Routes and pages that exist, and which nav items in the screenshot (Home, Projects, Leaderboard, How It Works, Rules, Badges, About, My Progress) map to which existing route.
- Where the stats, XP values, participant data, and scoring config live.
- How authentication and the current user are exposed (needed for the navbar avatar and "My Progress").
- What is working, what is broken, and what is purely visual.
- A short plan of the files you intend to touch.

If a nav item in the screenshot has no matching route, link it to the closest existing page or homepage section. Only if neither exists, add a minimal static content page, and mention it in the report.

## 2. Design system

Define everything as theme tokens (Tailwind config and/or CSS variables), then reuse them. Sample the exact colors from `Main_UI.png` and adjust these starting points to match.

| Token | Starting value |
|---|---|
| Background deep navy | `#050B14` |
| Panel / navbar surface | `#0A141F` to `#0D1B26` (slightly translucent) |
| Border | subtle teal-blue, around `rgba(45, 212, 191, 0.18)`, 1px |
| Mint accent (buttons, "CONTRIBUTE.", active states) | `#2EE59D` |
| Teal secondary | `#14B8A6` |
| Text / muted text | `#FFFFFF` / `#9FB0C3` (blue-gray) |

**Typography**
- Hero headline: a bold, chunky pixel font. Evaluate Pixelify Sans, Silkscreen, and Press Start 2P (or a similar one) against the screenshot, pick the closest, and self-host or load it via the existing font setup. Tight line height, three lines, very large.
- Small labels (event pill, panel heading, nav-adjacent text, code-like text): a monospace such as JetBrains Mono or Space Mono, letter-spaced and uppercase where the screenshot shows it.
- Body, navigation, forms, tables, and data: a clean readable sans (keep the repo's current UI font if it already suits).
- Pixel styling is for branding, headlines, badges, and decoration. Dense data screens (tables, admin, forms) stay clean and readable.

**Shape language:** chunky 1px borders, moderate radii on the navbar, panels, and buttons (as in the screenshot), occasional stepped or pixel-notched details on badges and labels. Glow is used sparingly (the lamp, the active nav underline, unlocked badges). No gradients on cards, no blur-heavy glassmorphism, no particle effects.

## 3. Landing page: match `Main_UI.png` exactly

Build at a 1768 px wide viewport first and compare directly with the screenshot. Layout reference (at 1768 px): the navbar and content container sit about 120 px from each side; the right panel is about 500 px wide; the left column is about 565 px wide.

### 3.1 Navbar (floating, rounded, dark, thin border, sits over the scene)
- Left: pixel-cat mascot logo, then "GEEKSTOBER" (bold, white) with "GFG STUDENT CHAPTER RBU" (small caps, muted) beneath it.
- Center links: **Home** (active: mint text with a mint underline), Projects, Leaderboard, How It Works, Rules, Badges, About.
- Right: a search field with a magnifier and a `Ctrl K` hint (keep any existing search behavior; if none exists, make the field open the existing project search or leave it as a styled link to `/projects`), a square GitHub icon button linking to the repository or event org, a solid mint **My Progress** button with a user icon (routes to the existing progress page), and a rounded avatar chip with the user's initials.
- The avatar chip shows the real signed-in user's GitHub avatar or initials. "KS" in the screenshot is a placeholder, never hard-coded. When signed out, show the existing sign-in entry point in the same style instead.
- Mobile: collapses to a hamburger drawer with the same links.

### 3.2 Hero (full-bleed pixel-art night scene)
**Left column**
1. Event pill: outlined mint, monospace, a filled green dot, text `GEEKSTOBER · OCT 01 - OCT 31`.
2. Headline on three lines in the pixel font: `CODE.` (white), `CONTRIBUTE.` (mint), `COMPETE.` (white).
3. Subheading in mint: **Turn open-source contributions into achievements.**
4. Body in muted off-white: "Explore real repositories, fix issues, ship features, improve documentation — every merged pull request earns XP and moves you up the leaderboard."
5. Two buttons: solid mint **[GitHub icon] Explore Projects →**, and outlined mint **[Play icon] Start Contributing →**. Both stay functional, using the existing routes and flows (Start Contributing goes to the existing sign-in or contribution entry point).

**Right panel: "YOUR OPEN SOURCE JOURNEY"** (replace the earlier idea of a Git terminal here; the screenshot is the target)
- A dark bordered panel with a monospace, letter-spaced heading `YOUR OPEN SOURCE JOURNEY`.
- A vertical timeline of six rows with green nodes joined by a vertical mint line. Each row is a bordered dark card with an outline icon on the left (Lucide equivalents: BookOpen, MousePointer2, Code2, GitMerge, Trophy, BarChart3), a title, and a muted subtitle:
  1. Explore Projects: Find repositories and good first issues
  2. Claim an Issue: Pick an issue based on your interest
  3. Code & Open PR: Write code and submit a pull request
  4. Get Merged: Earn XP when your PR is merged
  5. Unlock Badges: Showcase your achievements
  6. Climb Leaderboard: Compete with other contributors
- Below the timeline, four equal stat tiles with an icon, a large value, and a label: **Repositories**, **Open Issues**, **Participants**, **Achievement Badges**.
- **Values must come from the repo's existing data layer.** The screenshot's numbers (1.3k+, 450+, 800+, 50+) are design placeholders, not facts. Use a formatter (1,300 → "1.3k+") only if the real value warrants it. If a count does not exist in the data, show the real count the app has, and add it to "Needs your decision" if a new data source is required.
- Bottom strip: overlapping participant avatars (real participants where available, otherwise pixel-art placeholders) and the text "Join {n} developers contributing this month" with an arrow, linking to the leaderboard or sign-in. Use the real participant count; do not claim "hundreds" if it is not true.
- If the screenshot's circular road-sign arrow at the right edge is a carousel control, include it only if there is something to scroll; otherwise omit it.

**Pixel-art scene (background layers, back to front)**
1. Deep navy sky with scattered pixel stars, a pixel crescent moon (upper center), and a thin blue shooting star streak.
2. Stepped pixel clouds and distant dark mountains.
3. A city skyline at the lower center-right with small warm and cool lit windows.
4. Utility poles with sagging wires crossing the scene, and a street lamp with a green light cone, left of the panel.
5. A building on the far left with lit windows and three tilted neon-green signs reading `OPEN SOURCE`, `BUILDS BETTER`, `DEVELOPERS`, plus foliage at the bottom left.
6. Foreground: a developer seen from behind in a hoodie marked `GFG`, working at a laptop at a desk, a black cat silhouette beside the laptop, a mug, and a backpack with a GitHub logo and stickers. (No campfire; the screenshot has none.)

How to build it:
- First check the workspace for a clean version of this artwork without any UI. If one exists, use it as the hero background (`image-rendering: pixelated`, `object-fit: cover`).
- If only the screenshot exists, do not crop the screenshot, because it has the UI baked in. Recreate the scene as layered assets (inline SVG with `shape-rendering: crispEdges`, canvas, or generated PNG sprites) in the same palette and composition, and keep the layers separate so they can be positioned and animated.
- Keep the text legible: the left column sits over darker areas of the scene, and a subtle dark overlay is allowed.
- Motion: very subtle star twinkle and an occasional shooting-star streak, plus a faint lamp glow. All of it must stop under `prefers-reduced-motion`. No parallax, no particle systems.

### 3.3 Below the hero
The screenshot only shows the first screen. Keep every existing homepage section (featured projects, how it works, badges, leaderboard preview, call to action, footer) and restyle them in the same theme. Do not delete sections to resemble the screenshot, and do not add placeholder sections that the repo has no data for. The footer is dark navy with the GEEKSTOBER / GFG Student Chapter RBU branding and the existing links.

## 4. Responsive behavior
- Desktop (about 1280 px and up): the layout described above. Verify at 1768 px, 1440 px, and 1280 px.
- Tablet: the panel moves below the hero text, full width; the stat tiles stay in a 4-column or 2×2 grid.
- Mobile: hamburger navbar; hero text first, then the journey panel, then the stats in a 2-column grid; the scene crops with the developer and laptop as the focal point; the headline scales down but stays pixel-styled.

## 5. Restyle the rest of the application (without changing behavior)
Bring every existing page into the same visual system. Reuse existing components and restyle them.
- **Projects and Project Details:** dark cards with 1px borders, tech tags, difficulty and XP chips, GitHub link. Search, filters, and sorting keep working.
- **Leaderboard:** clean dark table with a highlighted current-participant row, rank, participant, XP, contributions, merged PRs, and badges (only the columns the repo supports). Restrained effects.
- **My Progress and Participant Profile:** XP, rank, level, progress, issues, PRs, badges, recent activity, with meaningful progress bars driven by real data.
- **Badges:** pixel-style icons, clear locked (muted) and unlocked (a controlled glow) states, requirement and progress text. Do not make badges glow constantly.
- **How It Works and Rules:** use the same journey language as the hero panel; preserve all existing content and steps.
- **Login:** the same night-scene world and "Continue with GitHub". Preserve the existing OAuth setup exactly. Do not add a fake or demo login and do not expose secrets.
- **Admin (repositories, participants, contributions, stats, badges, settings):** same colors and typography, kept plain and functional with no decorative scenes. "Remove" still means removing from Geekstober's registry only.
- Update empty, loading, and error states to the theme.

## 6. Branding
- The primary event name is **GEEKSTOBER**, with **GFG STUDENT CHAPTER RBU** as the secondary line. Replace visible uses of "Hacktober", "Hacktober Fest", and "GFG Hacktober Fest" in UI text, page titles, meta tags, and footer.
- Do **not** rename the repository, package name, route paths, environment variables, or code identifiers.
- Show a small note in the footer: "Student-led event platform. Not an official GeeksforGeeks product." (Add only if no equivalent already exists.)

## 7. Scoring and data
- Keep the existing centralized scoring config and use the repo's current values. The intended base scoring is Easy = 10 XP, Medium = 30 XP, Difficult = 50 XP. If the repo's values differ, **do not change them**; list the difference under "Needs your decision".
- Never hard-code XP values, stats, or progress in components. Presentational components receive values via props from the existing data layer.
- Do not present mock or placeholder GitHub data as live.

## 8. Accessibility and performance
- Semantic landmarks, visible focus states, keyboard-navigable navbar and drawer, `aria-label`s on icon-only buttons, AA contrast for text on the dark scene, and decorative scene layers marked `aria-hidden`.
- Do not rely on color alone for status (use text or icons too).
- Optimize scene assets (small PNG/SVG, lazy-load non-critical layers) so the hero loads quickly.

## 9. Verification (use the browser)
1. Run the dev server. Open `/` at 1768 × 889 and compare it side by side with `Main_UI.png`. Iterate until the navbar, hero text, panel, scene composition, colors, and spacing are visually near-identical. Capture a screenshot of your result.
2. Check 1440, 1280, tablet, and mobile widths.
3. Click through every page and confirm the existing features still work: browse and filter projects, project details, leaderboard search and sort, My Progress, badges, sign-in flow, and the admin pages. Compare against the audit.
4. `npm run build` and lint pass, with no new console errors or warnings.

## 10. Final report
End with a short report in `/docs/geekstober-report.md`:
- What changed (files and the visual system).
- A side-by-side check of the landing page against `Main_UI.png` and any remaining differences.
- Confirmation that no feature, route, data model, scoring value, or auth flow was altered.
- "Needs your decision": any bugs found, scoring mismatches, missing data for the stat tiles, nav items without routes, and anything that would need a non-visual change.
