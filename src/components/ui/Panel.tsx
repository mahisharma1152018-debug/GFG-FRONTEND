import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

/** Standard surface used across the site. */
export function Panel({
  children,
  className,
  hover = false,
  as: Tag = 'div',
}: {
  children: ReactNode
  className?: string
  hover?: boolean
  as?: 'div' | 'article' | 'section' | 'li'
}) {
  return (
    <Tag
      className={cn(
        'relative rounded-[14px] bg-coal/80 border border-line',
        hover && 'card-hover',
        className,
      )}
    >
      {children}
    </Tag>
  )
}

/** Section wrapper that keeps page rhythm consistent. */
export function Container({
  children,
  className,
  size = 'default',
}: {
  children: ReactNode
  className?: string
  size?: 'default' | 'wide' | 'narrow'
}) {
  const sizes = {
    default: 'max-w-6xl',
    wide: 'max-w-7xl',
    narrow: 'max-w-3xl',
  }
  return <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', sizes[size], className)}>{children}</div>
}
