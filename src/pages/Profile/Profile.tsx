import { ExternalLink, Flame, GitMerge, GitPullRequestArrow, Sparkles, Target } from 'lucide-react'
import { useParams } from 'react-router-dom'
import { useActivity, useProfile } from '@/hooks/useLeaderboard'
import { useContributions, useUserBadges } from '@/hooks/useContributions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { getLevelInfo } from '@/services/user.service'
import { Container, Panel } from '@/components/ui/Panel'
import { Avatar } from '@/components/ui/Avatar'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Metric } from '@/components/ui/Stat'
import { ContributionGraph } from '@/components/github/ContributionGraph'
import { ContributionCard } from '@/components/contributions/ContributionCard'
import { BadgeCard } from '@/components/badges/BadgeCard'
import { ButtonLink } from '@/components/ui/Button'
import { Skeleton, SkeletonList } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { formatXp } from '@/utils/format'

export default function Profile() {
  const { username } = useParams()
  const { data: user, isLoading, isError, refetch } = useProfile(username)
  const { data: days = [] } = useActivity(user?.id)
  const { data: contributions = [], isLoading: loadingContributions } = useContributions({ userId: user?.id })
  const { data: badges = [] } = useUserBadges(user?.id)

  useDocumentTitle(user ? `@${user.username}` : 'Profile')

  if (isLoading) {
    return (
      <Container className="py-12">
        <Skeleton className="h-24 w-full rounded-[14px]" />
        <div className="mt-6 grid gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 rounded-[14px]" />
          ))}
        </div>
      </Container>
    )
  }

  if (isError || !user) {
    return (
      <Container className="py-20">
        <ErrorState
          title="Participant not found"
          description={`No profile exists for @${username ?? ''}.`}
          onRetry={() => void refetch()}
        />
        <div className="mt-6 text-center">
          <ButtonLink to="/leaderboard" variant="outline">
            Back to leaderboard
          </ButtonLink>
        </div>
      </Container>
    )
  }

  const level = getLevelInfo(user)
  const merged = contributions.filter((item) => item.prStatus === 'merged')

  return (
    <>
      <section className="border-b border-line bg-pitch/60 py-10">
        <Container>
          <Panel className="p-6 sm:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <Avatar name={user.name} username={user.username} size="xl" />
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{user.name}</h1>
                    <span className="rounded-md border border-brand/40 bg-brand/12 px-2 py-0.5 font-mono text-[11px] font-bold text-mint">
                      #{String(user.rank).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="mt-1 font-mono text-sm text-muted">
                    @{user.username}
                    {user.college ? ` · ${user.college}` : ''}
                  </p>
                  {user.bio ? <p className="mt-2 max-w-xl text-sm text-muted">{user.bio}</p> : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-lg border border-line bg-white/[0.03] px-3 py-2 font-mono text-xs text-muted">
                  Level {String(level.level).padStart(2, '0')} · {level.title}
                </span>
                <ButtonLink href={user.githubUrl} target="_blank" variant="outline" size="sm" icon={<ExternalLink className="size-4" aria-hidden />}>
                  GitHub
                </ButtonLink>
              </div>
            </div>

            <div className="mt-6">
              <ProgressBar
                value={user.totalXp - level.previousLevelAt}
                max={Math.max(1, (level.nextLevelAt ?? user.totalXp) - level.previousLevelAt)}
                caption={
                  level.nextLevelAt
                    ? `${user.totalXp} / ${level.nextLevelAt} XP · ${level.remaining} to next level`
                    : 'max level reached'
                }
              />
            </div>
          </Panel>
        </Container>
      </section>

      <Container className="py-10">
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Metric label="Total XP" value={user.totalXp.toLocaleString('en-US')} icon={<Sparkles className="size-4" />} />
          <Metric label="Rank" value={`#${user.rank}`} icon={<Target className="size-4" />} />
          <Metric label="Merged PRs" value={user.mergedPullRequests} icon={<GitMerge className="size-4" />} />
          <Metric label="Projects" value={user.projectsContributed} icon={<GitPullRequestArrow className="size-4" />} />
          <Metric label="Streak" value={`${user.streakDays}d`} icon={<Flame className="size-4" />} />
          <Metric label="Badges" value={`${badges.filter((b) => b.unlocked).length}`} icon={<Sparkles className="size-4" />} />
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <ContributionGraph days={days} title={`Activity for @${user.username}`} />

          <Panel className="p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">badges</p>
            {badges.length === 0 ? (
              <Skeleton className="mt-4 h-32" />
            ) : (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {badges.slice(0, 4).map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            )}
          </Panel>
        </div>

        <section className="mt-10" aria-labelledby="history-heading">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="history-heading" className="text-lg font-bold text-ink">
              Contribution history
            </h2>
            <span className="font-mono text-xs tabular text-dim">
              {formatXp(merged.reduce((sum, item) => sum + (item.xpAwarded ?? 0), 0))} from merged work
            </span>
          </div>

          {loadingContributions ? (
            <SkeletonList count={4} />
          ) : contributions.length === 0 ? (
            <Panel className="p-8 text-center">
              <p className="text-sm text-muted">No contributions recorded yet.</p>
            </Panel>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {contributions.map((contribution) => (
                <ContributionCard key={contribution.id} contribution={contribution} />
              ))}
            </div>
          )}
        </section>
      </Container>
    </>
  )
}
