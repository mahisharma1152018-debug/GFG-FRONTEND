import { useCountUp } from '@/hooks/useCountUp'
import { cn } from '@/utils/cn'
import type { ReactNode } from 'react'

interface StatProps {
  value: number
  suffix?: string
  label?: string
  hint?: string
  align?: 'left' | 'center'
  className?: string
  icon?: ReactNode
}

/** Animated counter used by the event statistics section. */
export function Stat({ value, suffix = '', label, hint, align = 'left', className, icon }: StatProps) {
  const { ref, value: current } = useCountUp(value)
  const centered = align === 'center'

  return (
    <div className={cn(centered && 'text-center', className)}>
      {icon ? <div className={cn('mb-3 text-brand-bright', centered && 'mx-auto')}>{icon}</div> : null}
      <p className={cn(
        'font-mono text-4xl font-bold tabular leading-none tracking-tight text-ink sm:text-5xl',
        centered && 'mx-auto',
      )}>
        <span ref={ref}>
          {current.toLocaleString('en-US')}
        </span>
        <span className="text-brand-bright">{suffix}</span>
      </p>
      {label ? <p className="mt-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted">{label}</p> : null}
      {hint ? <p className="mt-1.5 font-mono text-[11px] text-dim">{hint}</p> : null}
    </div>
  )
}

/** Compact metric tile for dashboards. */
export function Metric({
  label,
  value,
  delta,
  icon,
  className,
}: {
  label: string
  value: ReactNode
  delta?: string
  icon?: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-[14px] border border-line bg-coal/80 p-4 transition hover:border-brand/35 sm:p-5',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
        {icon ? <span className="text-brand-bright/80">{icon}</span> : null}
      </div>
      <p className="mt-3 font-mono text-3xl font-bold tabular leading-none text-ink">{value}</p>
      {delta ? <p className="mt-2 font-mono text-[11px] text-mint">{delta}</p> : null}
    </div>
  )
}
