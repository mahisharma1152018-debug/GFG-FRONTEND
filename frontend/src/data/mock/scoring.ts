import type { ScoringConfig } from '@/types'

/**
 * Scoring configuration.
 * TODO: Replace with GET /scoring (public) and PUT /admin/scoring (admin).
 * The UI never hardcodes XP math — it reads this structure through
 * src/services/contribution.service.ts so backend tuning requires no UI change.
 */

export const MOCK_SCORING_CONFIG: ScoringConfig = {
  version: 'v1.4',
  updatedAt: '2026-10-12T09:00:00.000Z',
  tiers: [
    {
      difficulty: 'easy',
      label: 'Easy',
      minXp: 5,
      maxXp: 15,
      examples: [
        'Minor README improvement',
        'Documentation correction',
        'Typo or broken link fix',
        'Small CSS or copy change',
        'Simple bug fix with tests',
      ],
    },
    {
      difficulty: 'medium',
      label: 'Medium',
      minXp: 20,
      maxXp: 50,
      examples: [
        'Functional bug fix in application code',
        'New UI component with tests',
        'API integration with error handling',
        'Database or query improvement',
        'Moderate refactor with coverage',
        'Small end-to-end feature',
      ],
    },
    {
      difficulty: 'hard',
      label: 'Hard',
      minXp: 60,
      maxXp: 150,
      examples: [
        'Major feature spanning front end and API',
        'Authentication or authorisation system',
        'Significant performance improvement',
        'Architectural change with migration',
        'Complex algorithm or data structure work',
        'Infrastructure or build pipeline overhaul',
      ],
    },
  ],
  multipliers: [
    {
      id: 'baseline',
      label: 'Standard review',
      factor: 1,
      description: 'Merged PR that satisfies the issue requirements.',
    },
    {
      id: 'quality',
      label: 'High-quality delivery',
      factor: 1.15,
      description: 'Clean tests, clear description, well-scoped diff and responsive review.',
    },
    {
      id: 'impact',
      label: 'High community impact',
      factor: 1.3,
      description: 'Improves experience for every user — a11y, performance, docs or DX.',
    },
    {
      id: 'duplicate',
      label: 'Duplicate or trivial change',
      factor: 0.5,
      description: 'Overlaps an existing contribution or touches only whitespace/formatting.',
    },
  ],
  requirements: [
    {
      id: 'merged-pr',
      label: 'Merged pull request',
      description: 'XP is credited only after the maintainer merges the PR into the base branch.',
      mandatory: true,
    },
    {
      id: 'issue-link',
      label: 'Linked issue',
      description: 'The PR must reference the problem statement issue it resolves.',
      mandatory: true,
    },
    {
      id: 'review-pass',
      label: 'Code review passed',
      description: 'Approving review from the project admin or a designated reviewer.',
      mandatory: true,
    },
    {
      id: 'no-spam',
      label: 'No spam or gaming',
      description: 'Whitespace-only commits, reverted changes and self-merged PRs award zero XP.',
      mandatory: true,
    },
    {
      id: 'one-credit',
      label: 'One credit per issue',
      description: 'An issue awards XP once; follow-up fixes on the same issue are collaborative credit.',
      mandatory: true,
    },
    {
      id: 'tests',
      label: 'Tests for behavioural changes',
      description: 'Code that changes behaviour should ship with coverage.',
      mandatory: false,
    },
  ],
}
