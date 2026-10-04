import {
  Blocks,
  BookOpen,
  Bug,
  Compass,
  Flame,
  GitPullRequestArrow,
  GitMerge,
  Lock,
  MessagesSquare,
  Mountain,
  Rocket,
  ShieldCheck,
  Trophy,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { Badge } from '@/types'
import { RarityPill } from '@/components/ui/Pills'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { formatDate, formatXp } from '@/utils/format'
import { cn } from '@/utils/cn'

/** Maps the backend badge `icon` key to a Lucide glyph. */
const ICONS: Record<string, LucideIcon> = {
  'git-pull-request-arrow': GitPullRequestArrow,
  bug: Bug,
  blocks: Blocks,
  'shield-check': ShieldCheck,
  rocket: Rocket,
  flame: Flame,
  compass: Compass,
  'book-open': BookOpen,
  trophy: Trophy,
  mountain: Mountain,
  'messages-square': MessagesSquare,
  'git-merge': GitMerge,
}

const RING: Record<string, string> = {
  common: 'border-line-strong text-muted',
  rare: 'border-sky/45 text-sky',
  epic: 'border-brand/50 text-mint',
  legendary: 'border-amber/50 text-amber',
}

/**
 * Reusable badge tile. Fully data-driven: when the backend ships artwork via
 * `badge.image` it renders instead of the glyph, without layout changes.
 */
export function BadgeCard({ badge, className }: { badge: Badge; className?: string }) {
  const Icon = ICONS[badge.icon] ?? Trophy

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-[14px] border bg-coal/80 p-5 transition-all duration-200',
        badge.unlocked
          ? 'border-brand/35 hover:-translate-y-1 hover:border-brand/60'
          : 'border-line opacity-80 hover:border-line-strong',
        className,
      )}
    >
      {badge.unlocked ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-brand/12 blur-2xl transition group-hover:bg-brand/20"
        />
      ) : null}

      <div className="relative flex items-start justify-between gap-3">
        <span
          className={cn(
            'grid size-12 shrink-0 place-items-center rounded-xl border bg-white/[0.03]',
            badge.unlocked ? RING[badge.rarity] : 'border-line text-dim',
          )}
        >
          {badge.unlocked ? <Icon className="size-5" aria-hidden /> : <Lock className="size-4" aria-hidden />}
        </span>
        <RarityPill rarity={badge.rarity} />
      </div>

      <h3 className="relative mt-4 text-base font-bold text-ink">{badge.name}</h3>
      <p className="relative mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted">{badge.description}</p>

      <div className="relative mt-auto pt-4">
        {badge.unlocked ? (
          <p className="font-mono text-[11.5px] text-mint">
            unlocked{badge.unlockedAt ? ` · ${formatDate(badge.unlockedAt)}` : ''}
          </p>
        ) : badge.progress ? (
          <ProgressBar
            value={badge.progress.current}
            max={badge.progress.target}
            caption={`${badge.progress.current}/${badge.progress.target}`}
            size="sm"
          />
        ) : (
          <p className="font-mono text-[11.5px] text-dim">requirement: {badge.requirement}</p>
        )}

        <div className="mt-3 flex items-center justify-between border-t border-line pt-3 font-mono text-[11px] text-dim">
          <span>{badge.requirement}</span>
          <span className="text-brand-bright/80">+{formatXp(badge.xpReward)}</span>
        </div>
      </div>
    </article>
  )
}
