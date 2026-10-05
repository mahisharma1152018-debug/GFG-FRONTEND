import { cn } from '@/utils/cn'
import { initials } from '@/utils/format'
import { GitFork } from 'lucide-react'

const TONES = [
  'from-brand/35 to-brand/10 text-mint',
  'from-sky/30 to-sky/10 text-sky',
  'from-amber/30 to-amber/10 text-amber',
  'from-rose/30 to-rose/10 text-rose',
  'from-mint/30 to-mint/10 text-mint',
]

/**
 * Initial-based avatar. No stock human photography anywhere in the product —
 * a GitHub avatar URL can be supplied later through the API and will render
 * instead of the initials.
 */
export function Avatar({
  name,
  username,
  size = 'md',
  className,
}: {
  name: string
  username?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const seed = [...(username ?? name)].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const sizes = {
    sm: 'size-8 text-[11px]',
    md: 'size-10 text-xs',
    lg: 'size-14 text-sm',
    xl: 'size-20 text-lg',
  }

  return (
    <span
      aria-hidden
      className={cn(
        'grid shrink-0 place-items-center rounded-lg bg-gradient-to-br font-bold tracking-tight',
        TONES[seed % TONES.length],
        sizes[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}

/** Abstract "developer" glyph used where an identity is not person-shaped. */
export function RepoGlyph({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'grid size-10 place-items-center rounded-lg border border-line bg-white/[0.03] text-brand-bright',
        className,
      )}
    >
      <GitFork className="size-4" />
    </span>
  )
}
