import { GitPullRequestArrow, CircleDot, CheckCircle2, XCircle, Clock } from 'lucide-react'
import type { Contribution } from '@/types'
import { DifficultyPill, StatusPill, TypePill } from '@/components/ui/Pills'
import { formatDate } from '@/utils/format'
import { cn } from '@/utils/cn'

const REVIEW_TONE: Record<string, string> = {
  approved: 'text-mint',
  pending: 'text-amber',
  'changes-requested': 'text-amber',
  rejected: 'text-rose',
}

/**
 * Reusable contribution card — project, title, type, difficulty, PR status,
 * review status, XP and date. Used by dashboard, profile and admin views.
 */
export function ContributionCard({ contribution, className }: { contribution: Contribution; className?: string }) {
  const merged = contribution.prStatus === 'merged'
  const ReviewIcon =
    contribution.reviewStatus === 'approved'
      ? CheckCircle2
      : contribution.reviewStatus === 'rejected'
        ? XCircle
        : contribution.reviewStatus === 'changes-requested'
          ? CircleDot
          : Clock

  return (
    <article
      className={cn(
        'group rounded-[14px] border border-line bg-coal/80 p-4 transition hover:border-brand/40 sm:p-5',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-dim">
            {contribution.projectName}
          </p>
          <h3 className="mt-1.5 text-[15px] font-semibold leading-snug text-ink">
            <a
              href={contribution.pullRequestUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-mint"
            >
              {contribution.title}
            </a>
          </h3>
        </div>

        <span
          className={cn(
            'shrink-0 rounded-lg border px-2.5 py-1 font-mono text-sm font-bold tabular',
            merged ? 'border-brand/45 bg-brand/12 text-mint' : 'border-line bg-white/[0.03] text-muted',
          )}
        >
          {contribution.xpAwarded !== null ? `+${contribution.xpAwarded} XP` : 'pending'}
        </span>
      </div>

      <p className="mt-2 line-clamp-2 text-sm text-muted">{contribution.summary}</p>

      <div className="mt-3.5 flex flex-wrap items-center gap-2">
        <TypePill type={contribution.contributionType} />
        <DifficultyPill difficulty={contribution.difficulty} />
        <StatusPill status={contribution.prStatus} />
        <span
          className={cn(
            'inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider',
            REVIEW_TONE[contribution.reviewStatus],
          )}
        >
          <ReviewIcon className="size-3" aria-hidden />
          {contribution.reviewStatus.replace('-', ' ')}
        </span>
      </div>

      <div className="mt-3.5 flex items-center justify-between border-t border-line pt-3 font-mono text-[11px] text-dim">
        <span className="inline-flex items-center gap-1.5">
          <GitPullRequestArrow className="size-3" aria-hidden />
          PR #{contribution.pullRequestNumber}
        </span>
        <span>{formatDate(contribution.mergedAt ?? contribution.submittedAt)}</span>
      </div>
    </article>
  )
}
