import { motion } from 'framer-motion'
import { GitBranch, GitMerge, Star, Users } from 'lucide-react'
import { formatCompact } from '@/utils/format'

/**
 * Compact repository tile used inside the hero and GitHub sections.
 * Renders structured data — never raw HTML from the API.
 */
export function RepoChip({
  name,
  stars,
  forks,
  language,
  className,
  delay = 0,
  float = true,
}: {
  name: string
  stars: number
  forks: number
  language: string
  className?: string
  delay?: number
  float?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      <motion.div
        animate={float ? { y: [0, -8, 0] } : undefined}
        transition={float ? { duration: 6 + delay, repeat: Infinity, ease: 'easeInOut' } : undefined}
        className="rounded-xl border border-line bg-coal/90 px-3.5 py-3 backdrop-blur-sm shadow-[0_20px_45px_-30px_rgb(0_0_0_/_0.95)] transition hover:border-brand/45"
      >
        <div className="flex items-center gap-2">
          <GitBranch className="size-3.5 shrink-0 text-brand-bright" aria-hidden />
          <span className="truncate font-mono text-[12.5px] font-semibold text-ink">{name}</span>
        </div>
        <div className="mt-2.5 flex items-center gap-3 font-mono text-[11px] text-muted">
          <span className="inline-flex items-center gap-1">
            <Star className="size-3 text-amber" aria-hidden />
            {formatCompact(stars)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Users className="size-3 text-sky" aria-hidden />
            {formatCompact(forks)}
          </span>
          <span className="inline-flex items-center gap-1 text-mint">
            <GitMerge className="size-3" aria-hidden />
            {language}
          </span>
        </div>
      </motion.div>
    </motion.div>
  )
}
