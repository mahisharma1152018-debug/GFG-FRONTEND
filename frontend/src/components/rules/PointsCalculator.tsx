import { useMemo, useState } from 'react'
import { Calculator, Info } from 'lucide-react'
import { useScoringConfig, useXpEstimate } from '@/hooks/useContributions'
import { Panel } from '@/components/ui/Panel'
import { Field, Select } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Skeleton'
import { CONTRIBUTION_TYPE_LABEL, DIFFICULTY_LABEL } from '@/utils/format'
import type { CalculatorInput, ContributionType, Difficulty } from '@/types'

const TYPES: ContributionType[] = [
  'bug-fix',
  'feature',
  'ui-ux',
  'documentation',
  'performance',
  'testing',
  'refactor',
  'integration',
]

/**
 * Interactive points calculator.
 * Calls the scoring service so the estimate always mirrors backend config —
 * and is explicitly labelled as an estimate.
 */
export function PointsCalculator() {
  const [contributionType, setContributionType] = useState<ContributionType>('bug-fix')
  const [difficulty, setDifficulty] = useState<Difficulty>('medium')
  const [impact, setImpact] = useState<CalculatorInput['impact']>('moderate')
  const [quality, setQuality] = useState('quality')

  const { data: config, isLoading: loadingConfig } = useScoringConfig()

  const input = useMemo<CalculatorInput>(
    () => ({ contributionType, difficulty, impact, quality }),
    [contributionType, difficulty, impact, quality],
  )

  const { data: estimate, isLoading: estimating } = useXpEstimate(input, true)

  return (
    <Panel className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-line px-5 py-4 sm:px-6">
        <span className="grid size-9 place-items-center rounded-lg border border-brand/40 bg-brand/12 text-brand-bright">
          <Calculator className="size-4" aria-hidden />
        </span>
        <div>
          <h3 className="text-base font-bold text-ink">Points calculator</h3>
          <p className="font-mono text-[11px] text-dim">estimate only · final XP is assigned on merge</p>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Contribution type" htmlFor="calc-type">
            <Select
              id="calc-type"
              value={contributionType}
              onChange={(event) => setContributionType(event.target.value as ContributionType)}
            >
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {CONTRIBUTION_TYPE_LABEL[type]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Difficulty" htmlFor="calc-difficulty">
            <Select
              id="calc-difficulty"
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as Difficulty)}
            >
              {(['easy', 'medium', 'hard'] as const).map((level) => (
                <option key={level} value={level}>
                  {DIFFICULTY_LABEL[level]}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Community impact" htmlFor="calc-impact" hint="How many users benefit?">
            <Select
              id="calc-impact"
              value={impact}
              onChange={(event) => setImpact(event.target.value as CalculatorInput['impact'])}
            >
              <option value="low">Limited — affects one area</option>
              <option value="moderate">Moderate — noticeable improvement</option>
              <option value="high">Broad — affects every user</option>
            </Select>
          </Field>

          <Field label="Delivery quality" htmlFor="calc-quality" hint="Review outcome and craft.">
            <Select id="calc-quality" value={quality} onChange={(event) => setQuality(event.target.value)}>
              {(config?.multipliers ?? []).map((multiplier) => (
                <option key={multiplier.id} value={multiplier.id}>
                  {multiplier.label} (×{multiplier.factor})
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="rounded-xl border border-brand/30 bg-brand/[0.07] p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">estimated reward</p>

          {loadingConfig || !estimate || estimating ? (
            <Skeleton className="mt-4 h-16 w-full" />
          ) : (
            <>
              <p className="mt-3 font-mono text-5xl font-extrabold tabular leading-none text-mint">
                {estimate.estimate}
                <span className="ml-1 text-lg font-bold text-brand-bright">XP</span>
              </p>
              <p className="mt-2 font-mono text-xs tabular text-muted">
                range {estimate.minXp}–{estimate.maxXp} XP · multiplier ×{estimate.multiplierApplied.toFixed(2)}
              </p>

              <div className="mt-4 border-t border-brand/25 pt-4">
                <p className="flex items-start gap-2 text-[11.5px] leading-relaxed text-muted">
                  <Info className="mt-0.5 size-3.5 shrink-0 text-brand-bright" aria-hidden />
                  {estimate.disclaimer}
                </p>
              </div>

              <p className="mt-3 font-mono text-[10.5px] text-dim">
                config {config?.version} · updated {config ? new Date(config.updatedAt).toLocaleDateString() : '—'}
              </p>
            </>
          )}
        </div>
      </div>
    </Panel>
  )
}
