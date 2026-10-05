import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface ProgressBarProps {
  value: number
  max?: number
  label?: string
  caption?: string
  className?: string
  tone?: 'brand' | 'amber' | 'sky'
  size?: 'sm' | 'md' | 'lg'
}

const TONES = {
  brand: 'from-brand to-brand-bright',
  amber: 'from-amber/70 to-amber',
  sky: 'from-sky/70 to-sky',
}

export function ProgressBar({
  value,
  max = 100,
  label,
  caption,
  className,
  tone = 'brand',
  size = 'md',
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-3.5' }

  return (
    <div className={cn('w-full', className)}>
      {label || caption ? (
        <div className="mb-2 flex items-end justify-between gap-3">
          {label ? <span className="text-sm font-semibold text-ink">{label}</span> : <span />}
          {caption ? <span className="font-mono text-xs tabular text-muted">{caption}</span> : null}
        </div>
      ) : null}
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? 'progress'}
        className={cn(
          'w-full overflow-hidden rounded-full border border-line bg-white/[0.04]',
          heights[size],
        )}
      >
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${pct}%` }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className={cn('h-full rounded-full bg-gradient-to-r', TONES[tone])}
        />
      </div>
    </div>
  )
}
