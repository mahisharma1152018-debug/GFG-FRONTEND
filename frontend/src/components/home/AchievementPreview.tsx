import { Flame, GitPullRequestArrow, Sparkles, Target } from 'lucide-react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useActivity } from '@/hooks/useLeaderboard'
import { useContributions } from '@/hooks/useContributions'
import { getLevelInfo } from '@/services/user.service'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Container, Panel } from '@/components/ui/Panel'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ContributionGraph } from '@/components/github/ContributionGraph'
import { ButtonLink } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatXp, range } from '@/utils/format'
import { LEVEL_THRESHOLDS } from '@/config/site'

/** Landing preview of the personal dashboard: level, streak, recent merges. */
export function AchievementPreview() {
  const { data: user, isLoading } = useCurrentUser()
  const { data: days = [] } = useActivity(user?.id)
  const { data: contributions = [] } = useContributions({ userId: user?.id, status: 'merged' })

  const level = user ? getLevelInfo(user) : null
  const recent = contributions.slice(0, 3)

  return (
    <section className="relative overflow-hidden border-y border-line bg-pitch/70 py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" aria-hidden />
      <Container className="relative">
        <SectionHeading
          eyebrow="Progress"
          title={
            <>
              Your code. Your contribution. <span className="text-brand-bright">Your impact.</span>
            </>
          }
          description="Levels, streaks and a contribution graph that reads exactly like the one on your GitHub profile."
          actions={
            <ButtonLink to="/dashboard" variant="secondary">
              Open my dashboard
            </ButtonLink>
          }
        />

        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
          <Panel className="p-6 sm:p-7">
            {isLoading || !user || !level ? (
              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-24 w-full rounded-xl" />
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-dim">
                      welcome back
                    </p>
                    <p className="mt-1 text-xl font-bold text-ink">@{user.username}</p>
                  </div>
                  <span className="rounded-lg border border-brand/40 bg-brand/12 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.16em] text-mint">
                    Level {String(level.level).padStart(2, '0')} · {level.title}
                  </span>
                </div>

                <div className="mt-6">
                  <ProgressBar
                    value={user.totalXp - level.previousLevelAt}
                    max={Math.max(1, (level.nextLevelAt ?? user.totalXp) - level.previousLevelAt)}
                    label={`Level ${String(level.level).padStart(2, '0')} progress`}
                    caption={
                      level.nextLevelAt
                        ? `${user.totalXp} / ${level.nextLevelAt} XP · ${level.remaining} to go`
                        : 'Max level reached'
                    }
                    size="lg"
                  />
                </div>

                <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { label: 'Total XP', value: formatXp(user.totalXp), icon: Sparkles },
                    { label: 'Rank', value: `#${user.rank}`, icon: Target },
                    { label: 'Merged PRs', value: String(user.mergedPullRequests), icon: GitPullRequestArrow },
                    { label: 'Streak', value: `${user.streakDays}d`, icon: Flame },
                  ].map((item) => (
                    <div key={item.label} className="rounded-lg border border-line bg-white/[0.03] p-3">
                      <dt className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-dim">
                        <item.icon className="size-3" aria-hidden />
                        {item.label}
                      </dt>
                      <dd className="mt-1.5 font-mono text-lg font-bold tabular text-ink">{item.value}</dd>
                    </div>
                  ))}
                </dl>

                <div className="mt-6 border-t border-line pt-5">
                  <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
                    recent merges
                  </p>
                  <ul className="space-y-2.5">
                    {recent.map((contribution) => (
                      <li
                        key={contribution.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-white/[0.02] px-3.5 py-2.5"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-ink">
                            {contribution.title}
                          </span>
                          <span className="block truncate font-mono text-[11px] text-dim">
                            {contribution.projectName} · PR #{contribution.pullRequestNumber}
                          </span>
                        </span>
                        <span className="shrink-0 font-mono text-sm font-bold text-mint">
                          +{contribution.xpAwarded ?? 0} XP
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </Panel>

          <div className="flex flex-col gap-5">
            <ContributionGraph days={days} title="Activity graph" className="flex-1" />

            <Panel className="p-5">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">next milestones</p>
              <ul className="mt-3 space-y-3">
                {LEVEL_THRESHOLDS.slice(0, 3).map((threshold) => (
                  <li key={threshold.level} className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted">
                      <span className="font-mono text-mint">L{threshold.level}</span> · {threshold.title}
                    </span>
                    <span className="font-mono text-xs tabular text-dim">{range(threshold.minXp, threshold.minXp)}</span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      </Container>
    </section>
  )
}
