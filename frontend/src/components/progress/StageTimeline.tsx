import { motion } from 'framer-motion'
import type { ContributionProgress } from '@/types'
import { ALL_STAGES, STAGE_LABELS } from '@/data/mock/contributions'
import { formatShortDate } from '@/utils/format'
import { cn } from '@/utils/cn'

/**
 * Linear contribution lifecycle:
 * Issue Selected → Forked → Development → PR Submitted → Review → Merged → Points
 * The stage data comes from the progress service (eventually GitHub webhooks).
 */
export function StageTimeline({ progress }: { progress: ContributionProgress }) {
  const currentIndex = ALL_STAGES.indexOf(progress.currentStage)

  return (
    <ol className="space-y-0">
      {ALL_STAGES.map((stage, index) => {
        const record = progress.stages.find((item) => item.stage === stage)
        const done = Boolean(record?.completedAt)
        const current = stage === progress.currentStage
        const last = index === ALL_STAGES.length - 1

        return (
          <li key={stage} className="relative flex gap-4">
            <div className="flex flex-col items-center">
              <motion.span
                initial={{ scale: 0.6, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.3 }}
                className={cn(
                  'mt-1 grid size-6 shrink-0 place-items-center rounded-full border-2',
                  done
                    ? 'border-brand bg-brand text-void'
                    : current
                      ? 'border-brand-bright bg-void text-brand-bright'
                      : 'border-line bg-void text-dim',
                )}
                aria-hidden
              >
                {done ? (
                  <svg viewBox="0 0 12 12" className="size-3" fill="none" stroke="currentColor" strokeWidth="2.4">
                    <path d="M2.5 6.2 5 8.7l4.5-5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  <span className="size-1.5 rounded-full bg-current" />
                )}
              </motion.span>

              {!last ? (
                <span
                  className={cn('w-px flex-1 min-h-8', done ? 'bg-brand/50' : 'bg-line')}
                  aria-hidden
                />
              ) : null}
            </div>

            <div className={cn('pb-5', last && 'pb-0')}>
              <p
                className={cn(
                  'text-sm font-semibold',
                  current ? 'text-brand-bright' : done ? 'text-ink' : 'text-dim',
                )}
              >
                {STAGE_LABELS[stage]}
                {current ? (
                  <span className="ml-2 rounded border border-brand/40 bg-brand/12 px-1.5 py-px font-mono text-[9.5px] uppercase tracking-wider text-mint">
                    in progress
                  </span>
                ) : null}
              </p>
              <p className="mt-0.5 font-mono text-[11.5px] text-dim">
                {record?.completedAt ? formatShortDate(record.completedAt) : 'awaiting'}
                {index <= currentIndex ? '' : ''}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
