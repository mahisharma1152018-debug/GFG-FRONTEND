import { AlertTriangle, BookOpen, Bug, Gauge, GitMerge, Layers, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { useScoringConfig } from '@/hooks/useContributions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container, Panel } from '@/components/ui/Panel'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { PointsCalculator } from '@/components/rules/PointsCalculator'
import { Skeleton } from '@/components/ui/Skeleton'
import { CONTRIBUTION_TYPE_LABEL, DIFFICULTY_LABEL } from '@/utils/format'
import type { ContributionType, Difficulty } from '@/types'
import { cn } from '@/utils/cn'

const CATEGORY_TONE: Record<Difficulty, string> = {
  easy: 'border-brand/35 text-mint',
  medium: 'border-amber/35 text-amber',
  hard: 'border-rose/35 text-rose',
}

const CATEGORIES: { id: ContributionType; example: string; note: string }[] = [
  { id: 'bug-fix', example: 'Fix a functional defect', note: 'Reproduction + test expected' },
  { id: 'feature', example: 'Ship a scoped feature', note: 'Merged and documented' },
  { id: 'ui-ux', example: 'Improve interface or a11y', note: 'Screenshots required' },
  { id: 'documentation', example: 'Docs, README, examples', note: 'Reviewed for accuracy' },
  { id: 'performance', example: 'Latency, bundle, memory', note: 'Benchmark evidence' },
  { id: 'testing', example: 'Coverage and fixtures', note: 'Meaningful assertions only' },
  { id: 'refactor', example: 'Structural improvement', note: 'Behaviour must not change' },
  { id: 'integration', example: 'Wire services together', note: 'Error paths handled' },
]

const POLICIES = [
  {
    id: 'merged-pr',
    icon: GitMerge,
    title: 'Merged PR requirement',
    text: 'XP is credited only after a maintainer merges the pull request into the base branch.',
    tone: 'text-mint',
  },
  {
    id: 'review',
    icon: ShieldCheck,
    title: 'Code review',
    text: 'An approving review is mandatory. Changes-requested PRs earn nothing until they land.',
    tone: 'text-mint',
  },
  {
    id: 'duplicate',
    icon: Layers,
    title: 'Duplicates',
    text: 'An issue awards XP once. Parallel PRs on the same issue: first merged wins, the rest become collaborative credit.',
    tone: 'text-amber',
  },
  {
    id: 'spam',
    icon: AlertTriangle,
    title: 'Spam & gaming',
    text: 'Whitespace-only edits, auto-generated churn, self-merged PRs and reverted changes score zero and may remove entry.',
    tone: 'text-rose',
  },
]

export default function Rules() {
  useDocumentTitle('Point Rules')
  const { data: config, isLoading } = useScoringConfig()

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-pitch/60 py-14 sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative">
          <SectionHeading
            eyebrow="Scoring"
            title={
              <>
                Impact decides <span className="text-brand-bright">the score</span>
              </>
            }
            description="Points are awarded for effective, reviewed, merged contributions — never for commit volume. These values are configurable by the organisers."
          />
        </Container>
      </section>

      <Container className="py-12">
        {/* tier visual */}
        <section aria-labelledby="tiers-heading">
          <h2 id="tiers-heading" className="font-mono text-[11px] uppercase tracking-[0.28em] text-dim">
            contribution xp
          </h2>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {isLoading || !config
              ? Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-72 rounded-[14px]" />)
              : config.tiers.map((tier, index) => (
                  <article
                    key={tier.difficulty}
                    className={cn(
                      'relative overflow-hidden rounded-[14px] border bg-coal/80 p-6',
                      CATEGORY_TONE[tier.difficulty],
                    )}
                  >
                    <div className="flex items-baseline justify-between">
                      <h3 className="text-xl font-extrabold uppercase tracking-wide">
                        {DIFFICULTY_LABEL[tier.difficulty]}
                      </h3>
                      <span className="font-mono text-[11px] text-dim">
                        tier {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    <p className="mt-4 font-mono text-4xl font-bold tabular text-ink">
                      {tier.minXp}–{tier.maxXp}
                      <span className="ml-1 text-base text-brand-bright">XP</span>
                    </p>

                    <div className="mt-3 font-mono text-xs text-dim">↓ typical work</div>

                    <ul className="mt-3 space-y-1.5 text-sm text-muted">
                      {tier.examples.slice(0, 5).map((example) => (
                        <li key={example} className="flex gap-2">
                          <span className="mt-2 size-1 shrink-0 rounded-full bg-current" aria-hidden />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </article>
                ))}
          </div>
        </section>

        {/* calculator */}
        <section className="mt-14" aria-labelledby="calculator-heading">
          <h2 id="calculator-heading" className="mb-5 font-mono text-[11px] uppercase tracking-[0.28em] text-dim">
            estimate your reward
          </h2>
          <PointsCalculator />
        </section>

        {/* multipliers */}
        <section className="mt-14 grid gap-5 lg:grid-cols-2" aria-labelledby="multipliers-heading">
          <Panel className="p-6">
            <h2 id="multipliers-heading" className="flex items-center gap-2 text-lg font-bold text-ink">
              <Gauge className="size-4 text-brand-bright" aria-hidden />
              Quality multipliers
            </h2>
            <p className="mt-2 text-sm text-muted">
              Applied by the maintainer when the contribution is classified.
            </p>
            <ul className="mt-5 divide-y divide-line">
              {(config?.multipliers ?? []).map((multiplier) => (
                <li key={multiplier.id} className="flex items-start justify-between gap-4 py-3.5">
                  <div>
                    <p className="text-sm font-semibold text-ink">{multiplier.label}</p>
                    <p className="mt-1 text-sm text-muted">{multiplier.description}</p>
                  </div>
                  <span
                    className={cn(
                      'shrink-0 rounded-md border px-2 py-0.5 font-mono text-xs font-bold tabular',
                      multiplier.factor >= 1
                        ? 'border-brand/40 bg-brand/12 text-mint'
                        : 'border-rose/40 bg-rose/12 text-rose',
                    )}
                  >
                    ×{multiplier.factor}
                  </span>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel className="p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
              <ShieldCheck className="size-4 text-brand-bright" aria-hidden />
              Requirements before XP
            </h2>
            <ul className="mt-5 space-y-3.5">
              {(config?.requirements ?? []).map((requirement) => (
                <li key={requirement.id} className="flex items-start gap-3">
                  <span
                    className={cn(
                      'mt-0.5 rounded border px-1.5 py-px font-mono text-[10px] font-bold uppercase tracking-wider',
                      requirement.mandatory
                        ? 'border-brand/45 bg-brand/12 text-mint'
                        : 'border-line bg-white/[0.04] text-dim',
                    )}
                  >
                    {requirement.mandatory ? 'must' : 'nice'}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{requirement.label}</p>
                    <p className="mt-0.5 text-sm text-muted">{requirement.description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </section>

        {/* categories */}
        <section className="mt-14" aria-labelledby="categories-heading">
          <h2 id="categories-heading" className="mb-5 font-mono text-[11px] uppercase tracking-[0.28em] text-dim">
            contribution categories
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((category) => (
              <Panel key={category.id} hover className="p-4">
                <div className="flex items-center gap-2">
                  <Bug className="size-3.5 text-brand-bright" aria-hidden />
                  <h3 className="text-sm font-bold text-ink">{CONTRIBUTION_TYPE_LABEL[category.id]}</h3>
                </div>
                <p className="mt-2 text-sm text-muted">{category.example}</p>
                <p className="mt-3 border-t border-line pt-3 font-mono text-[11px] text-dim">{category.note}</p>
              </Panel>
            ))}
          </div>
        </section>

        {/* policies */}
        <section className="mt-14" aria-labelledby="policies-heading">
          <h2 id="policies-heading" className="mb-5 font-mono text-[11px] uppercase tracking-[0.28em] text-dim">
            integrity rules
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {POLICIES.map((policy) => (
              <Panel key={policy.id} className="flex gap-4 p-5">
                <span className={cn('mt-0.5 shrink-0', policy.tone)}>
                  <policy.icon className="size-5" aria-hidden />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-ink">{policy.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{policy.text}</p>
                </div>
              </Panel>
            ))}
          </div>
        </section>

        {/* documentation contribution note */}
        <section className="mt-14 grid gap-4 md:grid-cols-3">
          <Panel className="p-5">
            <BookOpen className="size-5 text-brand-bright" aria-hidden />
            <h3 className="mt-3 text-sm font-bold text-ink">Documentation counts</h3>
            <p className="mt-1.5 text-sm text-muted">
              Docs, examples and guides follow the same tier table — impact is judged on how much confusion they remove.
            </p>
          </Panel>
          <Panel className="p-5">
            <Bug className="size-5 text-brand-bright" aria-hidden />
            <h3 className="mt-3 text-sm font-bold text-ink">Bug fixes need proof</h3>
            <p className="mt-1.5 text-sm text-muted">
              Include a failing test or reproduction. Fixes without evidence land at the lower end of the band.
            </p>
          </Panel>
          <Panel className="p-5">
            <Sparkles className="size-5 text-brand-bright" aria-hidden />
            <h3 className="mt-3 text-sm font-bold text-ink">Features need scope</h3>
            <p className="mt-1.5 text-sm text-muted">
              Split large work into reviewable pull requests. One focused PR outperforms a 3,000-line monster.
            </p>
          </Panel>
        </section>

        <section className="mt-14 rounded-[14px] border border-brand/30 bg-brand/[0.07] p-6 text-center">
          <Zap className="mx-auto size-5 text-brand-bright" aria-hidden />
          <p className="mt-3 text-lg font-semibold text-ink">Every PR counts.</p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Rules live in the scoring configuration — organisers can tune tiers and multipliers without touching the
            interface.
          </p>
          <p className="mt-4 font-mono text-[11px] text-dim">
            config {config?.version ?? '—'} · last updated{' '}
            {config ? new Date(config.updatedAt).toLocaleDateString() : '—'}
          </p>
        </section>
      </Container>
    </>
  )
}
