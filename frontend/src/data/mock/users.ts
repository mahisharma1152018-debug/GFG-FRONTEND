import type { LeaderboardEntry, User } from '@/types'

/**
 * Mock participant directory.
 * TODO: Replace with GET /users + GET /leaderboard from the backend.
 */

const GITHUB = 'https://github.com'

const raw: Omit<User, 'rank' | 'level'>[] = [
  { id: 'u-01', username: 'dev_kiran', name: 'Kiran Sharma', role: 'participant', college: 'NIT Trichy', team: 'Team Null Pointers', githubUrl: `${GITHUB}/dev_kiran`, totalXp: 1480, mergedPullRequests: 21, projectsContributed: 7, streakDays: 12, badges: ['b-001', 'b-002', 'b-003', 'b-005', 'b-006', 'b-009'], joinedAt: '2026-09-18T09:00:00.000Z', bio: 'Full-stack developer who ships on weekends.' },
  { id: 'u-02', username: 'priya_codes', name: 'Priya Nair', role: 'participant', college: 'BITS Pilani', team: 'Team Merge Conflicts', githubUrl: `${GITHUB}/priya_codes`, totalXp: 1325, mergedPullRequests: 18, projectsContributed: 6, streakDays: 9, badges: ['b-001', 'b-002', 'b-005', 'b-006'], joinedAt: '2026-09-19T09:00:00.000Z', bio: 'TypeScript, design systems and too many keyboard shortcuts.' },
  { id: 'u-03', username: 'aryan_ops', name: 'Aryan Gupta', role: 'participant', college: 'IIIT Hyderabad', team: 'Team Green Threads', githubUrl: `${GITHUB}/aryan_ops`, totalXp: 1190, mergedPullRequests: 16, projectsContributed: 5, streakDays: 15, badges: ['b-001', 'b-005', 'b-007'], joinedAt: '2026-09-17T09:00:00.000Z', bio: 'Backend engineer chasing clean abstractions.' },
  { id: 'u-04', username: 'meera_dev', name: 'Meera Joshi', role: 'participant', college: 'VIT Vellore', team: 'Team Async Await', githubUrl: `${GITHUB}/meera_dev`, totalXp: 1040, mergedPullRequests: 14, projectsContributed: 5, streakDays: 6, badges: ['b-001', 'b-002', 'b-006'], joinedAt: '2026-09-21T09:00:00.000Z', bio: 'Accessibility advocate and React enthusiast.' },
  { id: 'u-05', username: 'rohit_js', name: 'Rohan Kulkarni', role: 'participant', college: 'COEP Pune', team: 'Team Null Pointers', githubUrl: `${GITHUB}/rohit_js`, totalXp: 965, mergedPullRequests: 13, projectsContributed: 4, streakDays: 4, badges: ['b-001', 'b-003'], joinedAt: '2026-09-22T09:00:00.000Z', bio: 'Front-end perf tinkerer.' },
  { id: 'u-06', username: 'sneha_r', name: 'Sneha Reddy', role: 'participant', college: 'Anna University', team: 'Team Blue Green', githubUrl: `${GITHUB}/sneha_r`, totalXp: 910, mergedPullRequests: 12, projectsContributed: 4, streakDays: 8, badges: ['b-001', 'b-005'], joinedAt: '2026-09-20T09:00:00.000Z', bio: 'Docs-first contributor.' },
  { id: 'u-07', username: 'kabir_builds', name: 'Kabir Malhotra', role: 'participant', college: 'DTU', team: 'Team Merge Conflicts', githubUrl: `${GITHUB}/kabir_builds`, totalXp: 875, mergedPullRequests: 11, projectsContributed: 4, streakDays: 3, badges: ['b-001', 'b-002'], joinedAt: '2026-09-23T09:00:00.000Z', bio: 'CLI tools and terminal UIs.' },
  { id: 'u-08', username: 'ananya_i', name: 'Ananya Iyer', role: 'participant', college: 'IIT Bombay', team: 'Team Green Threads', githubUrl: `${GITHUB}/ananya_i`, totalXp: 820, mergedPullRequests: 10, projectsContributed: 3, streakDays: 11, badges: ['b-001', 'b-007'], joinedAt: '2026-09-16T09:00:00.000Z', bio: 'Distributed systems and databases.' },
  { id: 'u-09', username: 'vikram_p', name: 'Vikram Pillai', role: 'participant', college: 'NIT Calicut', team: 'Team Seg Fault', githubUrl: `${GITHUB}/vikram_p`, totalXp: 760, mergedPullRequests: 10, projectsContributed: 3, streakDays: 2, badges: ['b-001'], joinedAt: '2026-09-24T09:00:00.000Z', bio: 'Bug hunter in the wild.' },
  { id: 'u-10', username: 'ishaan_t', name: 'Ishaan Tiwari', role: 'participant', college: 'IIIT Delhi', team: 'Team Async Await', githubUrl: `${GITHUB}/ishaan_t`, totalXp: 715, mergedPullRequests: 9, projectsContributed: 3, streakDays: 5, badges: ['b-001', 'b-004'], joinedAt: '2026-09-25T09:00:00.000Z', bio: 'Testing, coverage and CI pipelines.' },
  { id: 'u-11', username: 'riya_s', name: 'Riya Sharma', role: 'participant', college: 'Manipal Institute of Technology', team: 'Team Blue Green', githubUrl: `${GITHUB}/riya_s`, totalXp: 660, mergedPullRequests: 8, projectsContributed: 3, streakDays: 7, badges: ['b-001', 'b-006'], joinedAt: '2026-09-26T09:00:00.000Z', bio: 'UI engineer who loves a good empty state.' },
  { id: 'u-12', username: 'harsh_git', name: 'Harsh Agarwal', role: 'participant', college: 'Jadavpur University', team: 'Team Seg Fault', githubUrl: `${GITHUB}/harsh_git`, totalXp: 605, mergedPullRequests: 8, projectsContributed: 2, streakDays: 1, badges: ['b-001'], joinedAt: '2026-09-27T09:00:00.000Z', bio: 'Shell scripts and small patches.' },
  { id: 'u-13', username: 'nandini_b', name: 'Nandini Bose', role: 'participant', college: 'SRM Institute', team: 'Team Null Pointers', githubUrl: `${GITHUB}/nandini_b`, totalXp: 540, mergedPullRequests: 7, projectsContributed: 2, streakDays: 4, badges: ['b-001', 'b-004'], joinedAt: '2026-09-27T09:00:00.000Z', bio: 'First Hacktoberfest, already hooked.' },
  { id: 'u-14', username: 'rohan_f', name: 'Rohan Fernandes', role: 'participant', college: 'Christ University', team: 'Team Merge Conflicts', githubUrl: `${GITHUB}/rohan_f`, totalXp: 470, mergedPullRequests: 6, projectsContributed: 2, streakDays: 2, badges: ['b-001'], joinedAt: '2026-09-28T09:00:00.000Z', bio: 'Learning by fixing.' },
  { id: 'u-15', username: 'tanvi_m', name: 'Tanvi More', role: 'participant', college: 'Pune Institute of Computer Technology', team: 'Team Blue Green', githubUrl: `${GITHUB}/tanvi_m`, totalXp: 415, mergedPullRequests: 5, projectsContributed: 2, streakDays: 3, badges: ['b-001', 'b-002'], joinedAt: '2026-09-28T09:00:00.000Z', bio: 'Design tokens and CSS architecture.' },
  { id: 'u-16', username: 'aditya_k', name: 'Aditya Kulkarni', role: 'participant', college: 'NIT Warangal', team: 'Team Green Threads', githubUrl: `${GITHUB}/aditya_k`, totalXp: 360, mergedPullRequests: 5, projectsContributed: 2, streakDays: 1, badges: ['b-001'], joinedAt: '2026-09-29T09:00:00.000Z', bio: 'APIs, queues and boring reliable code.' },
  { id: 'u-17', username: 'zoya_a', name: 'Zoya Ahmed', role: 'participant', college: 'Aligarh Muslim University', team: 'Team Async Await', githubUrl: `${GITHUB}/zoya_a`, totalXp: 300, mergedPullRequests: 4, projectsContributed: 1, streakDays: 2, badges: ['b-001'], joinedAt: '2026-09-29T09:00:00.000Z', bio: 'Docs, examples and clearer errors.' },
  { id: 'u-18', username: 'dev_deep', name: 'Deepak Yadav', role: 'participant', college: 'Thapar Institute', team: 'Team Seg Fault', githubUrl: `${GITHUB}/dev_deep`, totalXp: 245, mergedPullRequests: 3, projectsContributed: 1, streakDays: 1, badges: ['b-001'], joinedAt: '2026-09-30T09:00:00.000Z', bio: 'Small fixes, steady progress.' },
  { id: 'u-19', username: 'lakshmi_v', name: 'Lakshmi Venkat', role: 'participant', college: 'PSG Tech', team: 'Team Blue Green', githubUrl: `${GITHUB}/lakshmi_v`, totalXp: 180, mergedPullRequests: 2, projectsContributed: 1, streakDays: 1, badges: ['b-001'], joinedAt: '2026-09-30T09:00:00.000Z', bio: 'Exploring open source one issue at a time.' },
  { id: 'u-20', username: 'om_prakash', name: 'Om Prakash', role: 'participant', college: 'NIT Rourkela', team: 'Team Null Pointers', githubUrl: `${GITHUB}/om_prakash`, totalXp: 95, mergedPullRequests: 1, projectsContributed: 1, streakDays: 1, badges: [], joinedAt: '2026-10-01T09:00:00.000Z', bio: 'Just claimed my first issue.' },
]

/** Admin accounts are separate from the leaderboard. */
export const MOCK_ADMINS: User[] = [
  {
    id: 'a-01',
    username: 'gfg_maintainer',
    name: 'Event Maintainer',
    role: 'admin',
    college: 'Host College',
    githubUrl: `${GITHUB}/gfg_maintainer`,
    totalXp: 0,
    rank: 0,
    mergedPullRequests: 0,
    projectsContributed: 0,
    streakDays: 0,
    level: 0,
    badges: [],
    joinedAt: '2026-08-01T09:00:00.000Z',
    bio: 'Maintains the GFG Hacktober Fest platform, scoring rules and project registry.',
  },
]

const withLevel = (u: Omit<User, 'rank' | 'level'>, rank: number): User => ({
  ...u,
  rank,
  level: levelForXp(u.totalXp),
})

export function levelForXp(xp: number): number {
  if (xp >= 2600) return 7
  if (xp >= 1800) return 6
  if (xp >= 1200) return 5
  if (xp >= 720) return 4
  if (xp >= 400) return 3
  if (xp >= 150) return 2
  return 1
}

export const MOCK_USERS: User[] = raw
  .map((u, i) => withLevel(u, i + 1))
  .sort((a, b) => b.totalXp - a.totalXp)
  .map((u, i) => ({ ...u, rank: i + 1 }))

/** The signed-in demo participant used by the dashboard / progress pages. */
export const CURRENT_USER_ID = 'u-01'

/** Weekly XP snapshot — recalculated by the backend in production. */
const WEEKLY_XP: Record<string, number> = {
  'u-01': 320,
  'u-03': 295,
  'u-02': 280,
  'u-08': 240,
  'u-04': 215,
  'u-06': 190,
  'u-05': 175,
  'u-10': 160,
}

export const MOCK_LEADERBOARD: LeaderboardEntry[] = MOCK_USERS.map((u, index) => ({
  rank: index + 1,
  previousRank: index === 0 ? 2 : index === 2 ? 1 : index + (index % 3 === 0 ? -1 : 1),
  user: {
    id: u.id,
    username: u.username,
    name: u.name,
    githubUrl: u.githubUrl,
    avatarUrl: u.avatarUrl,
    college: u.college,
    team: u.team,
  },
  xp: u.totalXp,
  mergedPullRequests: u.mergedPullRequests,
  projectsContributed: u.projectsContributed,
  badges: u.badges,
}))

export const MOCK_WEEKLY_LEADERBOARD: LeaderboardEntry[] = [...MOCK_LEADERBOARD]
  .map((e) => ({
    ...e,
    xp: WEEKLY_XP[e.user.id] ?? Math.round(e.xp / 12),
    previousRank: e.rank,
  }))
  .sort((a, b) => b.xp - a.xp)
  .map((e, i) => ({ ...e, rank: i + 1 }))

export const COLLEGES = Array.from(new Set(MOCK_USERS.map((u) => u.college).filter(Boolean))) as string[]
