import { useMemo, useState } from 'react'
import { toWeeks, totalFor } from '@/utils/activity'
import type { ActivityDay } from '@/utils/activity'
import { cn } from '@/utils/cn'

const LEVEL_CLASSES = [
  'bg-white/[0.05] border-white/[0.04]',
  'bg-brand/25 border-brand/20',
  'bg-brand/45 border-brand/30',
  'bg-brand/70 border-brand/50',
  'bg-brand-bright border-brand-bright/60',
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', '']

interface ContributionGraphProps {
  days: ActivityDay[]
  title?: string
  className?: string
}

/**
 * GitHub-style contribution heatmap built from the activity service.
 * Cells expose accessible labels and a hover/focus tooltip.
 */
export function ContributionGraph({ days, title = 'Contribution activity', className }: ContributionGraphProps) {
  const weeks = useMemo(() => toWeeks(days), [days])
  const total = useMemo(() => totalFor(days), [days])
  const [hovered, setHovered] = useState<ActivityDay | null>(null)

  const monthLabels = useMemo(() => {
    const labels: { week: number; label: string }[] = []
    let last = -1
    weeks.forEach((week, index) => {
      const month = new Date(week[0]?.date ?? '').getMonth()
      if (month !== last) {
        labels.push({ week: index, label: MONTHS[month] ?? '' })
        last = month
      }
    })
    return labels
  }, [weeks])

  return (
    <figure className={cn('rounded-[14px] border border-line bg-coal/80 p-4 sm:p-5', className)}>
      <figcaption className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="mt-0.5 font-mono text-xs text-muted">
            <span className="text-mint">{total}</span> contributions in the last {weeks.length} weeks
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-dim">
          <span>Less</span>
          {LEVEL_CLASSES.map((level) => (
            <span key={level} className={cn('size-2.5 rounded-[3px] border', level)} />
          ))}
          <span>More</span>
        </div>
      </figcaption>

      <div className="overflow-x-auto no-scrollbar">
        <div className="min-w-[640px]">
          <div className="relative mb-1 h-3 pl-[34px]">
            {monthLabels.map(({ week, label }) => (
              <span
                key={`${week}-${label}`}
                className="absolute top-0 font-mono text-[10px] text-dim"
                style={{ left: 34 + week * 14 }}
              >
                {label}
              </span>
            ))}
          </div>

          <div className="flex gap-2.5">
            <div className="flex w-6 flex-col gap-1 pt-0.5">
              {DAY_LABELS.map((label, index) => (
                <span key={index} className="h-2.5 font-mono text-[9px] leading-none text-dim">
                  {label}
                </span>
              ))}
            </div>

            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="flex flex-col gap-1">
                  {week.map((day) => (
                    <button
                      key={day.date}
                      type="button"
                      className="size-2.5 rounded-[3px] border transition-transform hover:scale-125"
                      onMouseEnter={() => setHovered(day)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={() => setHovered(day)}
                      onBlur={() => setHovered(null)}
                      aria-label={`${day.count} contributions on ${day.date}`}
                    >
                      <span className="sr-only">
                        {day.count} contributions on {day.date}
                      </span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 min-h-5 font-mono text-[11px] text-muted" aria-live="polite">
        {hovered ? (
          <span>
            <span className="text-mint">{hovered.count}</span> commits · {hovered.date}
          </span>
        ) : null}
      </div>
    </figure>
  )
}
