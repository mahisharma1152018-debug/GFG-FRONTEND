import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ExternalLink, ListChecks } from 'lucide-react'
import type { ProblemStatement } from '@/types'
import { DifficultyPill, StatusPill, TypePill } from '@/components/ui/Pills'
import { range } from '@/utils/format'
import { cn } from '@/utils/cn'

/**
 * Single problem statement row: scope, expected impact, XP band and the
 * CTA that sends the participant to the real GitHub issue.
 */
export function IssueRow({
  statement,
  repositoryUrl,
}: {
  statement: ProblemStatement
  repositoryUrl: string
}) {
  const [open, setOpen] = useState(false)

  return (
    <li className="overflow-hidden rounded-xl border border-line bg-coal/70 transition hover:border-brand/35">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <DifficultyPill difficulty={statement.difficulty} />
            <TypePill type={statement.contributionType} />
            <StatusPill status={statement.status} />
          </div>
          <h3 className="mt-2.5 text-base font-semibold text-ink sm:text-lg">{statement.title}</h3>
          <p className="mt-1.5 font-mono text-[11.5px] text-dim">
            {statement.technology} · expected{' '}
            <span className="text-mint">{range(statement.expectedXpMin, statement.expectedXpMax)}</span>
            {statement.deadline ? ` · due ${new Date(statement.deadline).toLocaleDateString()}` : ''}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            className={cn(
              'inline-flex h-9 items-center gap-1.5 rounded-lg border border-line px-3 text-[13px] font-semibold text-muted transition hover:border-line-strong hover:text-ink',
              open && 'border-brand/40 text-mint',
            )}
          >
            Details
            <ChevronDown className={cn('size-3.5 transition-transform', open && 'rotate-180')} aria-hidden />
          </button>
          <a
            href={statement.githubIssueUrl || repositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-brand px-3.5 text-[13px] font-semibold text-void transition hover:bg-brand-bright"
          >
            Open GitHub Issue
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-line bg-white/[0.02]"
          >
            <div className="p-4 sm:p-5">
              <p className="text-sm leading-relaxed text-muted">{statement.description}</p>

              <div className="mt-4">
                <p className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-dim">
                  <ListChecks className="size-3.5" aria-hidden />
                  acceptance criteria
                </p>
                <ul className="mt-2 space-y-1.5">
                  {statement.requirements.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-muted">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-bright" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </li>
  )
}
