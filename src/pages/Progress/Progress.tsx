import { useState } from 'react'
import { Webhook, GitPullRequestArrow, Layers, Trophy } from 'lucide-react'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useContributions, useProgress, useUserBadges } from '@/hooks/useContributions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getLevelInfo } from '@/services/user.service'
import { Container, Panel } from '@/components/ui/Panel'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Metric } from '@/components/ui/Stat'
import { StageTimeline } from '@/components/progress/StageTimeline'
import { SkeletonList } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/States'
import { STAGE_LABELS } from '@/data/mock/contributions'
import { formatXp } from '@/utils/format'
import { cn } from '@/utils/cn'

export default function Progress() {
  useDocumentTitle('Progress Tracker')

  const { data: user } = useCurrentUser()
  const { data: tracker = [], isLoading } = useProgress(user?.id)
  const { data: contributions = [] } = useContributions({ userId: user?.id })
  const { data: badges = [] } = useUserBadges(user?.id)

  const [expanded, setExpanded] = useState<string | null>(tracker[0]?.contributionId ?? null)

  const level = user ? getLevelInfo(user) : null
  const merged = contributions.filter((item) => item.prStatus === 'merged')

  return (
    <Container className="py-10">
      <SectionHeading
        eyebrow="Tracker"
        title={
          <>
            Every stage, <span className="text-brand-bright">visible</span>
          </>
        }
        description="Issue selected → fork → development → pull request → review → merge → points. Tracking will be driven by GitHub webhooks once the backend is connected."
      />

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <Metric label="Projects started" value={new Set(contributions.map((c) => c.projectId)).size} />
        <Metric label="Issues attempted" value={contributions.length} />
        <Metric label="PRs submitted" value={contributions.length} />
        <Metric label="PRs merged" value={merged.length} />
        <Metric label="Points earned" value={merged.reduce((sum, c) => sum + (c.xpAwarded ?? 0), 0)} />
        <Metric label="Badges" value={`${badges.filter((b) => b.unlocked).length}`} />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <section aria-labelledby="tracker-heading">
          <h2 id="tracker-heading" className="mb-4 flex items-center gap-2 text-lg font-bold text-ink">
            <GitPullRequestArrow className="size-4 text-brand-bright" aria-hidden />
            Contribution pipeline
          </h2>

          {isLoading ? (
            <SkeletonList count={3} />
          ) : tracker.length === 0 ? (
            <EmptyState
              title="Nothing in flight."
              description="Claim a problem statement and your pipeline will appear here."
              action={{ label: 'Find a problem statement', to: '/projects' }}
            />
          ) : (
            <ul className="space-y-4">
              {tracker.map((item) => {
                const open = expanded === item.contributionId
                return (
                  <li key={item.contributionId} className="overflow-hidden rounded-[14px] border border-line bg-coal/80">
                    <button
                      type="button"
                      onClick={() => setExpanded(open ? null : item.contributionId)}
                      aria-expanded={open}
                      className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-left transition hover:bg-white/[0.03]"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink">{item.title}</span>
                        <span className="mt-1 block font-mono text-[11.5px] text-dim">{item.projectName}</span>
                      </span>
                      <span
                        className={cn(
                          'shrink-0 rounded-md border px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-[0.14em]',
                          item.currentStage === 'points-awarded'
                            ? 'border-brand/45 bg-brand/12 text-mint'
                            : 'border-amber/40 bg-amber/12 text-amber',
                        )}
                      >
                        {STAGE_LABELS[item.currentStage]}
                      </span>
                    </button>

                    <div
                      className={cn(
                        'grid transition-all duration-300',
                        open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                      )}
                    >
                      <div className="overflow-hidden">
                        <div className="border-t border-line px-5 py-5">
                          <StageTimeline progress={item} />
                        </div>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>

        <aside className="space-y-5">
          <Panel className="p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">current level</p>
            <p className="mt-3 font-mono text-5xl font-extrabold tabular text-ink">
              {level ? String(level.level).padStart(2, '0') : '--'}
            </p>
            <p className="mt-1 text-sm text-muted">{level?.title ?? '—'}</p>
            <div className="mt-4 border-t border-line pt-4 font-mono text-xs text-muted">
              <p>{user ? formatXp(user.totalXp) : '—'} earned</p>
              <p className="mt-1 text-dim">
                {level?.nextLevelAt ? `${level.remaining} XP to level ${level.level + 1}` : 'max level reached'}
              </p>
            </div>
          </Panel>

          <Panel className="p-5">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
              <Layers className="size-3.5" aria-hidden />
              how tracking works
            </p>
            <ol className="mt-3 space-y-2 text-sm text-muted">
              {(['issue-selected', 'pr-submitted', 'review', 'merged', 'points-awarded'] as const).map(
                (stage, index) => (
                  <li key={stage} className="flex gap-2">
                    <span className="font-mono text-xs text-brand-bright">{String(index + 1).padStart(2, '0')}</span>
                    {STAGE_LABELS[stage]}
                  </li>
                ),
              )}
            </ol>
          </Panel>

          <Panel className="border-brand/25 p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-mint">
              <Webhook className="size-4" aria-hidden />
              Backend integration
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Stage transitions will be pushed by the GitHub App through webhooks. The UI already reads a single
              progress payload, so no component changes are needed.
            </p>
            <p className="mt-3 font-mono text-[11px] leading-relaxed text-dim">
              // TODO: Connect GitHub webhook data
              <br />
              // TODO: Connect contribution verification API
            </p>
          </Panel>

          <Panel className="p-5">
            <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
              <Trophy className="size-3.5 text-brand-bright" aria-hidden />
              badge unlocks
            </p>
            <ul className="mt-3 space-y-2">
              {badges
                .filter((badge) => badge.unlocked)
                .slice(0, 4)
                .map((badge) => (
                  <li key={badge.id} className="flex items-center justify-between gap-3 text-sm">
                    <span className="truncate text-muted">{badge.name}</span>
                    <span className="shrink-0 font-mono text-[11px] text-mint">+{badge.xpReward} XP</span>
                  </li>
                ))}
              {badges.filter((badge) => badge.unlocked).length === 0 ? (
                <li className="text-sm text-dim">No badges unlocked yet.</li>
              ) : null}
            </ul>
          </Panel>
        </aside>
      </div>
    </Container>
  )
}
