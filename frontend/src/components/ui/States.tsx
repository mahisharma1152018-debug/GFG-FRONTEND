import type { ReactNode } from 'react'
import { AlertTriangle, Inbox } from 'lucide-react'
import { ButtonLink } from './Button'
import { cn } from '@/utils/cn'

interface StateProps {
  title: string
  description?: string
  action?: { label: string; to?: string; href?: string }
  className?: string
  icon?: ReactNode
}

/** Empty state — "No projects available." */
export function EmptyState({ title, description, action, className, icon }: StateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-[14px] border border-dashed border-line-strong bg-coal/60 px-6 py-14 text-center',
        className,
      )}
    >
      <div className="mb-4 grid size-12 place-items-center rounded-xl border border-line bg-white/[0.03] text-brand-bright">
        {icon ?? <Inbox className="size-5" aria-hidden />}
      </div>
      <p className="text-lg font-semibold text-ink">{title}</p>
      {description ? <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</p> : null}
      {action ? (
        <div className="mt-6">
          <ButtonLink to={action.to} href={action.href} variant="secondary" size="sm">
            {action.label}
          </ButtonLink>
        </div>
      ) : null}
    </div>
  )
}

/** Error state — "Unable to load leaderboard." */
export function ErrorState({
  title = 'Something went wrong',
  description = 'The request failed. Please try again in a moment.',
  onRetry,
  className,
}: {
  title?: string
  description?: string
  onRetry?: () => void
  className?: string
}) {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center justify-center rounded-[14px] border border-rose/35 bg-rose/[0.06] px-6 py-12 text-center',
        className,
      )}
    >
      <div className="mb-4 grid size-11 place-items-center rounded-xl border border-rose/40 bg-rose/10 text-rose">
        <AlertTriangle className="size-5" aria-hidden />
      </div>
      <p className="text-lg font-semibold text-ink">{title}</p>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">{description}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 rounded-lg border border-rose/40 px-4 py-2 text-sm font-semibold text-rose transition hover:bg-rose/15"
        >
          Retry
        </button>
      ) : null}
    </div>
  )
}
