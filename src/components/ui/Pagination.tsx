import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

interface PaginationProps {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  className?: string
}

/** Accessible pagination with a compact page window. */
export function Pagination({ page, pageSize, total, onPageChange, className }: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))
  if (pageCount <= 1) return null

  const window = 1
  const pages: (number | 'gap')[] = []
  for (let i = 1; i <= pageCount; i += 1) {
    if (i === 1 || i === pageCount || Math.abs(i - page) <= window) pages.push(i)
    else if (pages[pages.length - 1] !== 'gap') pages.push('gap')
  }

  const from = (page - 1) * pageSize + 1
  const to = Math.min(total, page * pageSize)

  return (
    <nav aria-label="Pagination" className={cn('flex flex-col items-center gap-3 sm:flex-row sm:justify-between', className)}>
      <p className="font-mono text-xs tabular text-muted">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          aria-label="Previous page"
          className="grid size-8 place-items-center rounded-lg border border-line text-muted transition hover:border-brand/50 hover:text-mint disabled:opacity-40 disabled:hover:border-line disabled:hover:text-muted"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        {pages.map((item, index) =>
          item === 'gap' ? (
            <span key={`gap-${index}`} className="px-1 text-dim" aria-hidden>
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={item === page ? 'page' : undefined}
              className={cn(
                'min-w-8 rounded-lg border px-2 font-mono text-xs tabular transition',
                item === page
                  ? 'border-brand bg-brand text-void font-bold'
                  : 'border-line text-muted hover:border-brand/50 hover:text-mint',
              )}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === pageCount}
          aria-label="Next page"
          className="grid size-8 place-items-center rounded-lg border border-line text-muted transition hover:border-brand/50 hover:text-mint disabled:opacity-40 disabled:hover:border-line disabled:hover:text-muted"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </nav>
  )
}
