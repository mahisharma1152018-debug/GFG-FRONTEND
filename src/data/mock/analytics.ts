import type { PlatformAnalytics } from '@/types'

/**
 * Mock platform analytics for the admin dashboard charts.
 * TODO: Replace with GET /admin/analytics from the backend.
 */

export const MOCK_ANALYTICS: PlatformAnalytics = {
  totalParticipants: 268,
  activeContributors: 184,
  totalProjects: 12,
  openIssues: 277,
  pullRequestsSubmitted: 742,
  pullRequestsMerged: 596,
  totalXpAwarded: 38420,
  contributionsOverTime: [
    { date: 'Oct 11', contributions: 18, xp: 640 },
    { date: 'Oct 12', contributions: 26, xp: 910 },
    { date: 'Oct 13', contributions: 31, xp: 1120 },
    { date: 'Oct 14', contributions: 44, xp: 1580 },
    { date: 'Oct 15', contributions: 57, xp: 2110 },
    { date: 'Oct 16', contributions: 73, xp: 2760 },
    { date: 'Oct 17', contributions: 92, xp: 3630 },
  ],
  difficultyDistribution: [
    { difficulty: 'easy', count: 268 },
    { difficulty: 'medium', count: 194 },
    { difficulty: 'hard', count: 76 },
  ],
  projectActivity: [
    { name: 'CodeFlow', contributions: 86, xp: 5420 },
    { name: 'PatchSense', contributions: 64, xp: 4980 },
    { name: 'PixelPilot', contributions: 72, xp: 4610 },
    { name: 'SnipVault', contributions: 94, xp: 3840 },
    { name: 'CampusConnect', contributions: 68, xp: 3510 },
    { name: 'ShelfLife', contributions: 51, xp: 3120 },
    { name: 'TaskTide', contributions: 57, xp: 2980 },
    { name: 'DocForge', contributions: 63, xp: 2740 },
  ],
  xpDistribution: [
    { range: '0–100', participants: 62 },
    { range: '101–300', participants: 71 },
    { range: '301–600', participants: 58 },
    { range: '601–1000', participants: 44 },
    { range: '1001–1500', participants: 24 },
    { range: '1500+', participants: 9 },
  ],
}
