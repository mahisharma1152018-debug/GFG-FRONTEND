import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowDown, ArrowUp, Minus } from 'lucide-react'
import type { LeaderboardEntry } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { formatCompact } from '@/utils/format'
import { cn } from '@/utils/cn'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  highlightUserId?: string
}

function RankDelta({ current, previous }: { current: number; previous?: number }) {
  if (previous === undefined || previous === current) {
    return <Minus className="size-3 text-dim" aria-label="No change" />
  }
  const up = previous > current
  return (
    <span
      className={cn('inline-flex items-center gap-0.5', up ? 'text-mint' : 'text-rose')}
      aria-label={up ? `Up ${previous - current} places` : `Down ${current - previous} places`}
    >
      {up ? <ArrowUp className="size-3" aria-hidden /> : <ArrowDown className="size-3" aria-hidden />}
      <span className="font-mono text-[10px]">{Math.abs(previous - current)}</span>
    </span>
  )
}

/**
 * Leaderboard rows. Desktop renders as a table-like grid, mobile as cards —
 * no horizontal scrolling on small screens.
 */
export function LeaderboardTable({ entries, highlightUserId }: LeaderboardTableProps) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-line bg-coal/80">
      <div className="hidden grid-cols-[76px_1fr_120px_110px_100px_84px] gap-4 border-b border-line px-5 py-3 font-mono text-[10.5px] uppercase tracking-[0.18em] text-dim lg:grid">
        <span>Rank</span>
        <span>Contributor</span>
        <span className="text-right">XP</span>
        <span className="text-right">Merged PRs</span>
        <span className="text-right">Projects</span>
        <span className="text-right">Badges</span>
      </div>

      <ul>
        {entries.map((entry, index) => {
          const highlighted = entry.user.id === highlightUserId
          return (
            <motion.li
              key={entry.user.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: Math.min(index, 10) * 0.025 }}
            >
              <Link
                to={`/profile/${entry.user.username}`}
                className={cn(
  'grid grid-cols-[46px_minmax(0,1fr)_auto] items-center gap-2 border-b border-line px-3 py-3.5 transition last:border-0 hover:bg-brand/[0.06] sm:grid-cols-[52px_minmax(0,1fr)_auto] sm:gap-3 sm:px-4 lg:grid-cols-[76px_1fr_120px_110px_100px_84px] lg:gap-4 lg:px-5',
                  highlighted && 'bg-brand/[0.09] ring-1 ring-inset ring-brand/35',
                )}
              >
                <span className="flex items-center gap-1.5">
                  <span
                    className={cn(
                      'font-mono text-sm font-bold tabular',
                      entry.rank === 1
                        ? 'text-amber'
                        : entry.rank === 2
                          ? 'text-muted'
                          : entry.rank === 3
                            ? 'text-brand-bright'
                            : 'text-muted',
                    )}
                  >
                    #{String(entry.rank).padStart(2, '0')}
                  </span>
                  <RankDelta current={entry.rank} previous={entry.previousRank} />
                </span>

                <span className="flex min-w-0 items-center gap-3">
                  <Avatar name={entry.user.name} username={entry.user.username} size="sm" />
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-ink">{entry.user.name}</span>
                      {highlighted ? (
                        <span className="rounded border border-brand/45 bg-brand/15 px-1.5 py-px font-mono text-[9.5px] uppercase tracking-wider text-mint">
                          you
                        </span>
                      ) : null}
                    </span>
            <span className="block truncate font-mono text-[11.5px] text-dim">
  @{entry.user.username}
  <span className="hidden sm:inline">
    {entry.user.team ? ` · ${entry.user.team}` : ''}
  </span>
</span>
                  </span>
                </span>

                <span className="text-right font-mono text-sm font-bold tabular text-mint">
                  {entry.xp.toLocaleString('en-US')}
                  <span className="ml-1 text-[10px] text-dim">XP</span>
                </span>

                <span className="hidden text-right font-mono text-sm tabular text-muted lg:block">
                  {entry.mergedPullRequests}
                </span>
                <span className="hidden text-right font-mono text-sm tabular text-muted lg:block">
                  {entry.projectsContributed}
                </span>
                <span className="hidden text-right font-mono text-sm tabular text-muted lg:block">
                  {formatCompact(entry.badges.length)}
                </span>
              </Link>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}
