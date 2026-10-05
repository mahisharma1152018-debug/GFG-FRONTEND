import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export interface TabItem {
  id: string
  label: string
  count?: number
  icon?: ReactNode
}

interface TabsProps {
  items: TabItem[]
  value: string
  onChange: (id: string) => void
  className?: string
  ariaLabel?: string
}

/** Underline tabs with proper tablist semantics and arrow-key navigation. */
export function Tabs({ items, value, onChange, className, ariaLabel = 'sections' }: TabsProps) {
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const index = items.findIndex((item) => item.id === value)
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      onChange(items[(index + 1) % items.length].id)
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      onChange(items[(index - 1 + items.length) % items.length].id)
    }
    if (event.key === 'Home') {
      event.preventDefault()
      onChange(items[0].id)
    }
    if (event.key === 'End') {
      event.preventDefault()
      onChange(items[items.length - 1].id)
    }
  }

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn(
        'no-scrollbar flex items-center gap-1 overflow-x-auto border-b border-line',
        className,
      )}
    >
      {items.map((item) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(item.id)}
            className={cn(
              'relative -mb-px flex items-center gap-2 whitespace-nowrap px-3.5 py-2.5 text-sm font-semibold transition',
              active ? 'text-mint' : 'text-muted hover:text-ink',
            )}
          >
            {item.icon}
            {item.label}
            {typeof item.count === 'number' ? (
              <span
                className={cn(
                  'rounded-md border px-1.5 py-px font-mono text-[10px] tabular',
                  active ? 'border-brand/40 bg-brand/15 text-mint' : 'border-line text-dim',
                )}
              >
                {item.count}
              </span>
            ) : null}
            {active ? (
              <span aria-hidden className="absolute inset-x-0 -bottom-px h-0.5 bg-brand-bright" />
            ) : null}
          </button>
        )
      })}
    </div>
  )
}

/** Pill-style segmented control used for scopes (overall / weekly / project). */
export function SegmentedControl({
  items,
  value,
  onChange,
  ariaLabel,
  className,
}: TabsProps) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel ?? 'options'}
      className={cn('inline-flex flex-wrap gap-1 rounded-lg border border-line bg-coal p-1', className)}
    >
      {items.map((item) => {
        const active = item.id === value
        return (
          <button
            key={item.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.id)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-semibold transition sm:text-sm',
              active ? 'bg-brand text-void shadow-[0_6px_18px_-10px_rgb(34_197_94_/_0.9)]' : 'text-muted hover:text-ink',
            )}
          >
            {item.label}
          </button>
        )
      })}
    </div>
  )
}
