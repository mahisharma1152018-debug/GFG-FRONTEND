import { ArrowRight, Flame, GitMerge, GitPullRequestArrow, Sparkles, Target, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useActivity } from '@/hooks/useLeaderboard'
import { useContributions, useUserBadges } from '@/hooks/useContributions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getLevelInfo } from '@/services/user.service'
import { Container, Panel } from '@/components/ui/Panel'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Metric } from '@/components/ui/Stat'
import { ContributionGraph } from '@/components/github/ContributionGraph'
import { ContributionCard } from '@/components/contributions/ContributionCard'
import { BadgeCard } from '@/components/badges/BadgeCard'
import { ButtonLink } from '@/components/ui/Button'
import { Skeleton, SkeletonList } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { formatXp } from '@/utils/format'

export default function Dashboard() {
  useDocumentTitle('Dashboard')

  const { data: user, isLoading } = useCurrentUser()
  const { data: days = [] } = useActivity(user?.id)
  const { data: contributions = [], isLoading: loadingContributions, isError, refetch } = useContributions(
    { userId: user?.id },
  )
  const { data: badges = [] } = useUserBadges(user?.id)

  const level = user ? getLevelInfo(user) : null
  const unlocked = badges.filter((badge) => badge.unlocked)
  const recent = contributions.slice(0, 4)

  return (
    <Container className="py-10">
      {/* header */}
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-brand-bright/80">
            // participant workspace
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            {isLoading || !user ? 'Loading workspace…' : (
              <>
                Welcome back, <span className="text-mint">@{user.username}</span>
              </>
            )}
          </h1>
          {user && level ? (
            <p className="mt-2 text-sm text-muted">
              Level {String(level.level).padStart(2, '0')} · {level.title} ·{' '}
              <span className="font-mono text-mint">{formatXp(user.totalXp)}</span>
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <ButtonLink to="/progress" variant="outline" size="sm" trailing={<ArrowRight className="size-4" aria-hidden />}>
            Progress tracker
          </ButtonLink>
          <ButtonLink to="/projects" size="sm">
            Find an issue
          </ButtonLink>
        </div>
      </div>

      {/* metrics */}
      {isLoading || !user ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-28 rounded-[14px]" />
          ))}
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Metric label="Rank" value={`#${user.rank}`} delta={`top ${Math.max(1, 100 - user.rank * 3)}%`} icon={<Target className="size-4" />} />
          <Metric label="Total XP" value={user.totalXp.toLocaleString('en-US')} delta="+45 this week" icon={<Sparkles className="size-4" />} />
          <Metric label="Merged PRs" value={user.mergedPullRequests} delta={`${user.projectsContributed} repositories`} icon={<GitMerge className="size-4" />} />
          <Metric label="Streak" value={`${user.streakDays}d`} delta="days with activity" icon={<Flame className="size-4" />} />
          <Metric label="Badges" value={`${unlocked.length}/${badges.length || 12}`} delta="unlocked" icon={<Trophy className="size-4" />} />
        </div>
      )}

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        {/* level progress */}
        <Panel className="p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">level progress</p>
              <p className="mt-2 font-mono text-3xl font-extrabold tabular text-ink">
                {user && level ? String(level.level).padStart(2, '0') : '--'}
              </p>
            </div>
            <span className="rounded-lg border border-brand/40 bg-brand/12 px-3 py-1.5 font-mono text-xs font-bold uppercase tracking-[0.16em] text-mint">
              {level?.title ?? '—'}
            </span>
          </div>

          <ProgressBar
            className="mt-5"
            size="lg"
            value={user && level ? user.totalXp - level.previousLevelAt : 0}
            max={user && level ? Math.max(1, (level.nextLevelAt ?? user.totalXp) - level.previousLevelAt) : 100}
            caption={
              user && level
                ? level.nextLevelAt
                  ? `${user.totalXp} / ${level.nextLevelAt} XP · ${level.remaining} to next level`
                  : 'max level reached'
                : ''
            }
          />

          <div className="mt-6 grid grid-cols-3 gap-3 border-t border-line pt-5">
            {[
              { label: 'Submitted', value: contributions.length },
              { label: 'Merged', value: contributions.filter((c) => c.prStatus === 'merged').length },
              { label: 'In review', value: contributions.filter((c) => c.prStatus === 'in-review').length },
            ].map((item) => (
              <div key={item.label} className="rounded-lg border border-line bg-white/[0.03] p-3 text-center">
                <p className="font-mono text-xl font-bold tabular text-ink">{item.value}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-dim">{item.label}</p>
              </div>
            ))}
          </div>
        </Panel>

        <ContributionGraph days={days} title="Your activity" />
      </div>

      {/* recent contributions */}
      <section className="mt-10" aria-labelledby="recent-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="recent-heading" className="flex items-center gap-2 text-lg font-bold text-ink">
            <GitPullRequestArrow className="size-4 text-brand-bright" aria-hidden />
            Recent contributions
          </h2>
          <Link to="/progress" className="font-mono text-xs text-mint hover:underline">
            view all →
          </Link>
        </div>

        {loadingContributions ? (
          <SkeletonList count={3} />
        ) : isError ? (
          <ErrorState title="Unable to load contributions" onRetry={() => void refetch()} />
        ) : recent.length === 0 ? (
          <EmptyState
            title="No contributions yet."
            description="Claim your first issue and open a pull request — merged work appears here."
            action={{ label: 'Browse problem statements', to: '/projects' }}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {recent.map((contribution) => (
              <ContributionCard key={contribution.id} contribution={contribution} />
            ))}
          </div>
        )}
      </section>

      {/* badges */}
      <section className="mt-10" aria-labelledby="badges-heading">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="badges-heading" className="flex items-center gap-2 text-lg font-bold text-ink">
            <Trophy className="size-4 text-brand-bright" aria-hidden />
            Badges
          </h2>
          <Link to="/badges" className="font-mono text-xs text-mint hover:underline">
            all badges →
          </Link>
        </div>

        {badges.length === 0 ? (
          <Skeleton className="h-32 rounded-[14px]" />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {badges.slice(0, 4).map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        )}
      </section>
    </Container>
  )
}
