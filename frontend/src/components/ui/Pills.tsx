import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'
import { CONTRIBUTION_TYPE_LABEL, DIFFICULTY_LABEL, STATUS_LABEL } from '@/utils/format'
import type { BadgeRarity, ContributionType, Difficulty } from '@/types'

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  easy: 'border-brand/35 bg-brand/12 text-mint',
  medium: 'border-amber/35 bg-amber/12 text-amber',
  hard: 'border-rose/35 bg-rose/12 text-rose',
}

export function DifficultyPill({ difficulty, className }: { difficulty: Difficulty; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em]',
        DIFFICULTY_STYLES[difficulty],
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {DIFFICULTY_LABEL[difficulty]}
    </span>
  )
}

const STATUS_STYLES: Record<string, string> = {
  active: 'border-brand/35 bg-brand/12 text-mint',
  open: 'border-brand/35 bg-brand/12 text-mint',
  merged: 'border-brand/50 bg-brand/20 text-mint',
  approved: 'border-brand/50 bg-brand/20 text-mint',
  resolved: 'border-brand/50 bg-brand/20 text-mint',
  upcoming: 'border-sky/35 bg-sky/12 text-sky',
  claimed: 'border-sky/35 bg-sky/12 text-sky',
  'in-review': 'border-amber/35 bg-amber/12 text-amber',
  review: 'border-amber/35 bg-amber/12 text-amber',
  'in-progress': 'border-amber/35 bg-amber/12 text-amber',
  pending: 'border-amber/35 bg-amber/12 text-amber',
  'changes-requested': 'border-amber/40 bg-amber/12 text-amber',
  completed: 'border-line-strong bg-white/5 text-muted',
  closed: 'border-line-strong bg-white/5 text-muted',
  archived: 'border-line-strong bg-white/5 text-dim',
  rejected: 'border-rose/40 bg-rose/12 text-rose',
}

export function StatusPill({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em]',
        STATUS_STYLES[status] ?? 'border-line-strong bg-white/5 text-muted',
        className,
      )}
    >
      {STATUS_LABEL[status] ?? status}
    </span>
  )
}

export function TypePill({ type, className }: { type: ContributionType; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border border-line-strong bg-white/[0.04] px-2 py-0.5 font-mono text-[11px] font-medium uppercase tracking-[0.12em] text-muted',
        className,
      )}
    >
      {CONTRIBUTION_TYPE_LABEL[type]}
    </span>
  )
}

export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-line bg-white/[0.03] px-2.5 py-0.5 text-xs text-muted',
        className,
      )}
    >
      {children}
    </span>
  )
}

const RARITY_STYLES: Record<BadgeRarity, string> = {
  common: 'border-line-strong text-muted',
  rare: 'border-sky/40 text-sky',
  epic: 'border-brand/45 text-mint',
  legendary: 'border-amber/45 text-amber',
}

export function RarityPill({ rarity }: { rarity: BadgeRarity }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-[0.18em]',
        RARITY_STYLES[rarity],
      )}
    >
      {rarity}
    </span>
  )
}
