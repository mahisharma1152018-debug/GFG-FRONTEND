# GEEKTOBER 2026

<p align="center">
  <strong>GEEKTOBER</strong>
  <br />
  An individual open-source contribution event organized by the GeeksforGeeks RBU Chapter.
</p>

<p align="center">
  <strong>October 11 – October 17, 2026</strong>
</p>

---

## 📖 About

**GEEKTOBER** is an open-source contribution event organized by the **GeeksforGeeks RBU Chapter**.

The event runs from **October 11 through October 17, 2026**, and participants take part individually by:

- Exploring open-source repositories
- Finding suitable GitHub issues
- Working on issues locally
- Creating pull requests
- Contributing to participating repositories
- Tracking their contributions
- Earning points, XP and badges
- Competing on the contribution leaderboard

The platform provides a web interface for discovering projects, viewing issues, tracking contributions and displaying event statistics.

> **GEEKTOBER is an individual participation event. It does not include team creation or team registration.**

---

# 📅 Event Information

| Detail | Information |
|---|---|
| Event | GEEKTOBER |
| Organizer | GeeksforGeeks RBU Chapter |
| Edition | 2026 |
| Participation | Individual |
| Start Date | October 11, 2026 |
| End Date | October 17, 2026 |
| Duration | 7 days |
| Timezone | Asia/Kolkata (IST) |
| GitHub Organization | `gfg-rbu` |

---

# ✨ Features

## Participant Features

- GEEKTOBER landing page
- Project discovery
- Repository browsing
- Issue discovery
- Project details
- Contribution tracking
- Participant profiles
- Leaderboard
- Contribution statistics
- XP/scoring system
- Badges and achievements
- Contribution history
- GitHub OAuth login
- Event rules
- Event timeline
- Search functionality
- Responsive UI

## GitHub Integration

The backend integrates with GitHub to retrieve and synchronize:

- Repositories
- Issues
- Pull requests
- Commits
- Pull request reviews
- Review comments
- Issue comments
- Labels
- Repository members
- Contribution activity

The platform supports:

- GitHub REST API
- GitHub OAuth
- GitHub Webhooks
- Scheduled synchronization
- Repository synchronization
- Pull request synchronization

## Admin Features

The backend/frontend also provide functionality for:

- Participant management
- Contribution management
- Leaderboard management
- Badge management
- GitHub synchronization
- Event statistics
- Event configuration

---

# 🏗️ Architecture

The project consists of two main applications:

```text
GEEKTOBER
│
├── frontend/
│   └── React + TypeScript + Vite
│
└── backend/
    └── Node.js + Express + MongoDB


.
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── config/
│   │   ├── contexts/
│   │   ├── data/
│   │   │   └── mock/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   ├── .env.example
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── scripts/
│   │   ├── test/
│   │   ├── utils/
│   │   ├── app.js
│   │   ├── server.js
│   │   └── seed.js
│   │
│   ├── .env.example
│   └── package.json
│
└── README.md



GET /api/data/commits
GET /api/data/commits/:id

GET /api/data/reviews
GET /api/data/reviews/:id

GET /api/data/review-comments
GET /api/data/review-comments/:id

GET /api/data/issue-comments
GET /api/data/issue-comments/:id

GET /api/data/issues
GET /api/data/issues/:id

GET /api/data/contributions