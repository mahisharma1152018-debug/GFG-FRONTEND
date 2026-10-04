import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'

interface SectionHeadingProps {
  eyebrow?: string
  title: ReactNode
  description?: string
  align?: 'left' | 'center'
  className?: string
  actions?: ReactNode
}

/** Consistent section header: mono eyebrow + display title + support copy. */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'left',
  className,
  actions,
}: SectionHeadingProps) {
  const centered = align === 'center'

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        'mb-10 flex flex-col gap-4 md:mb-12',
        centered && 'items-center text-center',
        actions ? 'sm:flex-row sm:items-end sm:justify-between' : '',
        className,
      )}
    >
      <div className={cn('max-w-2xl', centered && 'mx-auto')}>
        {eyebrow ? (
          <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.32em] text-brand-bright/80">
            <span aria-hidden className="mr-2 text-brand/60">
              {'//'}
            </span>
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-pixel text-2xl sm:text-3xl lg:text-4xl leading-[1.18] tracking-wide text-ink">
          {title}
        </h2>
        {description ? (
          <p className="mt-4 text-balance text-base leading-relaxed text-muted sm:text-lg">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div> : null}
    </motion.div>
  )
}
