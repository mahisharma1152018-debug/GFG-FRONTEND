import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
import type { LeaderboardEntry } from '@/types'
import { Avatar } from '@/components/ui/Avatar'
import { formatCompact } from '@/utils/format'
import { cn } from '@/utils/cn'

const HEIGHTS = { 1: 'h-32 sm:h-40', 2: 'h-24 sm:h-32', 3: 'h-20 sm:h-24' } as const

/**
 * Visual podium for the top three contributors.
 * No profile photography — initials-based avatars keep it on-brand.
 */
export function Podium({ entries }: { entries: LeaderboardEntry[] }) {
  const top3 = entries.slice(0, 3)
  if (top3.length < 3) return null

  const ordered = [top3[1], top3[0], top3[2]] as const

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6" aria-label="Top three contributors">
      {ordered.map((entry, index) => {
        const place = index === 1 ? 1 : index === 0 ? 2 : 3
        const tone =
          place === 1
            ? { ring: 'border-amber/50 bg-amber/10', text: 'text-amber', bar: 'from-amber/70 to-amber' }
            : place === 2
              ? { ring: 'border-muted/40 bg-white/[0.05]', text: 'text-muted', bar: 'from-white/30 to-white/60' }
              : { ring: 'border-brand/40 bg-brand/[0.08]', text: 'text-brand-bright', bar: 'from-brand/60 to-brand-bright' }

        return (
          <motion.div
            key={entry.user.id}
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex min-w-0 flex-1 max-w-[220px] flex-col items-center"
          >
            <div
              className={cn(
                'relative w-full rounded-xl border px-2 py-3 text-center backdrop-blur-sm transition hover:-translate-y-1 sm:px-3 sm:py-4',
              )}
            >
              {place === 1 ? (
                <Crown className="absolute -top-3 left-1/2 size-5 -translate-x-1/2 text-amber" aria-hidden />
              ) : null}
              <Avatar name={entry.user.name} username={entry.user.username} size={place === 1 ? 'lg' : 'md'} className="mx-auto" />
              <p className="mt-2.5 truncate text-sm font-bold text-ink">{entry.user.name}</p>
              <p className="truncate font-mono text-[11px] text-dim">@{entry.user.username}</p>
              <p className={cn('mt-2 font-mono text-lg font-bold tabular', tone.text)}>
                {formatCompact(entry.xp)}
                <span className="ml-1 text-[10px] text-dim">XP</span>
              </p>
              <p className="font-mono text-[9px] text-dim sm:text-[10.5px]">
                {entry.mergedPullRequests} PRs · {entry.projectsContributed} projects
              </p>
            </div>

            <div className={cn('mt-2 w-full rounded-t-lg border border-b-0 border-line bg-gradient-to-t', HEIGHTS[place], tone.bar, 'opacity-90')}>
              <div className="flex h-full items-start justify-center pt-2 font-mono text-xl font-extrabold text-void/80">
                #{place}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
