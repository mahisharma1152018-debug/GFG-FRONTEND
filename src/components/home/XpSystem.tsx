import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { useScoringConfig } from '@/hooks/useContributions'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Container } from '@/components/ui/Panel'
import { ButtonLink } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { DIFFICULTY_LABEL } from '@/utils/format'
import type { Difficulty } from '@/types'
import { cn } from '@/utils/cn'

const TIER_TONE: Record<Difficulty, { border: string; text: string; glow: string; bar: string }> = {
  easy: { border: 'border-brand/35', text: 'text-mint', glow: 'from-brand/20', bar: 'bg-brand' },
  medium: { border: 'border-amber/35', text: 'text-amber', glow: 'from-amber/20', bar: 'bg-amber' },
  hard: { border: 'border-rose/35', text: 'text-rose', glow: 'from-rose/20', bar: 'bg-rose' },
}

/**
 * Contribution difficulty / XP system preview.
 * Ranges are read from the scoring service — never hardcoded in the UI.
 */
export function XpSystem() {
  const { data: config, isLoading } = useScoringConfig()

  return (
    <section className="relative overflow-hidden border-y border-line bg-pitch/70 py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" aria-hidden />
      <Container className="relative">
        <SectionHeading
          eyebrow="Contribution XP"
          title={
            <>
              Points follow <span className="text-brand-bright">impact</span>, not commit count
            </>
          }
          description="Difficulty is judged by the effective change a contribution makes — a merged feature is worth more than a typo fix, and the maintainers decide."
          align="center"
          actions={
            <ButtonLink to="/rules" variant="secondary" icon={<Zap className="size-4" aria-hidden />}>
              Point rules & calculator
            </ButtonLink>
          }
          className="items-center"
        />

        {isLoading || !config ? (
          <div className="grid gap-5 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-72 rounded-[14px]" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {config.tiers.map((tier, index) => {
              const tone = TIER_TONE[tier.difficulty]
              return (
                <motion.article
                  key={tier.difficulty}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={cn(
                    'relative overflow-hidden rounded-[14px] border bg-coal/85 p-6',
                    tone.border,
                  )}
                >
                  <div
                    aria-hidden
                    className={cn('pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b to-transparent blur-2xl', tone.glow)}
                  />

                  <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-dim">
                    tier {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className={cn('mt-2 text-2xl font-extrabold uppercase tracking-tight', tone.text)}>
                    {DIFFICULTY_LABEL[tier.difficulty]}
                  </h3>

                  <p className="mt-4 font-mono text-4xl font-bold tabular text-ink">
                    {tier.minXp}
                    <span className="text-dim">–</span>
                    {tier.maxXp}
                    <span className="ml-1 text-base font-semibold text-brand-bright">XP</span>
                  </p>

                  <div className={cn('mt-4 h-1 w-full overflow-hidden rounded-full bg-white/[0.05]')}>
                    <div
                      className={cn('h-full rounded-full', tone.bar)}
                      style={{ width: `${((index + 1) / 3) * 100}%` }}
                    />
                  </div>

                  <ul className="mt-5 space-y-2">
                    {tier.examples.map((example) => (
                      <li key={example} className="flex items-start gap-2 text-sm text-muted">
                        <span className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', tone.bar)} aria-hidden />
                        {example}
                      </li>
                    ))}
                  </ul>
                </motion.article>
              )
            })}
          </div>
        )}

        <p className="mx-auto mt-8 max-w-2xl text-center font-mono text-[11.5px] leading-relaxed text-dim">
          // ranges are configurable — scoring rules live in the backend, not in the components
        </p>
      </Container>
    </section>
  )
}
