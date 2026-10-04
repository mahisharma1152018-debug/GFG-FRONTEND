/**
 * Deterministic contribution-activity generator.
 *
 * Produces a GitHub-style grid of daily contribution counts so the dashboard,
 * profile and progress pages all render believable activity without a backend.
 * TODO: Replace with GET /users/:id/activity from GitHub webhook data.
 */

export interface ActivityDay {
  /** ISO date (yyyy-mm-dd) */
  date: string
  count: number
  /** 0 = none, 1..4 = intensity buckets */
  level: 0 | 1 | 2 | 3 | 4
}

/** mulberry32 — small deterministic PRNG so data is stable between renders. */
function seeded(seed: number): () => number {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function levelFor(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  if (count <= 9) return 3
  return 4
}

/**
 * Builds `weeks` columns of 7 days ending today.
 * `intensity` scales the overall density (0..1).
 */
export function buildActivity(seed: number, weeks = 26, intensity = 0.55): ActivityDay[] {
  const rand = seeded(seed)
  const days: ActivityDay[] = []
  const end = new Date()
  end.setHours(12, 0, 0, 0)

  const total = weeks * 7
  const start = new Date(end)
  start.setDate(end.getDate() - (total - 1))

  for (let i = 0; i < total; i += 1) {
    const date = new Date(start)
    date.setDate(start.getDate() + i)
    const weekday = date.getDay()
    const isWeekend = weekday === 0 || weekday === 6
    // Ramp: activity grows as the festival progresses.
    const ramp = 0.55 + (i / total) * 0.9
    const chance = intensity * ramp * (isWeekend ? 0.5 : 1.15)
    const roll = rand()
    let count = 0
    if (roll < chance) {
      count = 1 + Math.floor(rand() * (rand() > 0.82 ? 11 : 5))
    }
    days.push({
      date: date.toISOString().slice(0, 10),
      count,
      level: levelFor(count),
    })
  }
  return days
}

/** Splits a flat day list into calendar weeks (columns) for rendering. */
export function toWeeks(days: ActivityDay[]): ActivityDay[][] {
  const weeks: ActivityDay[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  return weeks
}

export function totalFor(days: ActivityDay[]): number {
  return days.reduce((sum, d) => sum + d.count, 0)
}
