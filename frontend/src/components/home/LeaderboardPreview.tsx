import { Link } from 'react-router-dom'
import { ArrowRight, Crown } from 'lucide-react'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Container } from '@/components/ui/Panel'
import { ButtonLink } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { SkeletonRow } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { formatCompact } from '@/utils/format'
import { cn } from '@/utils/cn'

/** Top-of-table teaser for the leaderboard page. */
export function LeaderboardPreview() {
  const { data, isLoading, isError, refetch } = useLeaderboard({ scope: 'overall' })
  const top = data?.slice(0, 5) ?? []

  return (
    <section className="relative py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Live standings"
          title={
            <>
              Climb the board with <span className="text-brand-bright">merged work</span>
            </>
          }
          description="Rank is a function of effective contributions — reviewed, classified and awarded by maintainers."
          actions={
            <ButtonLink to="/leaderboard" variant="outline" trailing={<ArrowRight className="size-4" aria-hidden />}>
              Full leaderboard
            </ButtonLink>
          }
        />

        <div className="overflow-hidden rounded-[14px] border border-line bg-coal/80">
          <div className="hidden grid-cols-[64px_1fr_120px_100px_110px] gap-4 border-b border-line px-5 py-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-dim md:grid">
            <span>Rank</span>
            <span>Contributor</span>
            <span className="text-right">XP</span>
            <span className="text-right">Merged</span>
            <span className="text-right">Projects</span>
          </div>

          {isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 5 }).map((_, index) => (
                <SkeletonRow key={index} />
              ))}
            </div>
          ) : isError ? (
            <ErrorState title="Unable to load leaderboard" onRetry={() => void refetch()} className="m-4" />
          ) : (
            <ul>
              {top.map((entry, index) => (
                <li key={entry.user.id}>
                  <Link
                    to={`/profile/${entry.user.username}`}
                    className="grid grid-cols-[46px_1fr_auto] items-center gap-4 border-b border-line px-4 py-3.5 transition last:border-0 hover:bg-brand/[0.06] md:grid-cols-[64px_1fr_120px_100px_110px] md:px-5"
                  >
                    <span
                      className={cn(
                        'flex items-center gap-1 font-mono text-sm font-bold tabular',
                        index === 0 ? 'text-amber' : index === 1 ? 'text-mint' : index === 2 ? 'text-brand-bright' : 'text-muted',
                      )}
                    >
                      {index === 0 ? <Crown className="size-3.5" aria-hidden /> : null}
                      #{String(entry.rank).padStart(2, '0')}
                    </span>

                    <span className="flex min-w-0 items-center gap-3">
                      <Avatar name={entry.user.name} username={entry.user.username} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink">
                          {entry.user.name}
                        </span>
                        <span className="block truncate font-mono text-[11.5px] text-dim">
                          @{entry.user.username}
                          {entry.user.college ? ` · ${entry.user.college}` : ''}
                        </span>
                      </span>
                    </span>

                    <span className="text-right font-mono text-sm font-bold tabular text-mint">
                      {formatCompact(entry.xp)}
                      <span className="ml-1 text-[10px] text-dim">XP</span>
                    </span>

                    <span className="hidden text-right font-mono text-sm tabular text-muted md:block">
                      {entry.mergedPullRequests}
                    </span>
                    <span className="hidden text-right font-mono text-sm tabular text-muted md:block">
                      {entry.projectsContributed}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>
    </section>
  )
}
