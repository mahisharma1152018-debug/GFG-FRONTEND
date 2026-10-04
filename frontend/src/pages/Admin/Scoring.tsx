import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Gauge, Plus, Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSaveScoringConfig, useScoringConfig } from '@/hooks/useContributions'
import { Panel } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { Field, Input, Textarea } from '@/components/ui/Field'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { cn } from '@/utils/cn'

/**
 * Scoring configuration editor.
 * Only the editable parts are modelled — version/updatedAt are managed
 * by the backend when the payload is saved.
 */
const scoringSchema = z.object({
  tiers: z
    .array(
      z.object({
        difficulty: z.enum(['easy', 'medium', 'hard']),
        label: z.string().min(1),
        minXp: z.number().int().min(0),
        maxXp: z.number().int().min(1),
        examples: z.array(z.string()),
      }),
    )
    .refine((tiers) => tiers.every((tier) => tier.maxXp >= tier.minXp), {
      message: 'Max XP must be >= min XP for every tier',
    }),
  multipliers: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      factor: z.number().min(0.1).max(5),
      description: z.string(),
    }),
  ),
  requirements: z.array(
    z.object({
      id: z.string().min(1),
      label: z.string().min(1),
      description: z.string(),
      mandatory: z.boolean(),
    }),
  ),
  version: z.string().min(1),
  updatedAt: z.string(),
})

type ScoringForm = z.infer<typeof scoringSchema>

const TIER_TONE = ['border-brand/40', 'border-amber/40', 'border-rose/40']

export default function AdminScoring() {
  const { data, isLoading, isError, refetch } = useScoringConfig()
  const save = useSaveScoringConfig()

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ScoringForm>({ resolver: zodResolver(scoringSchema) })

  const { fields: tierFields } = useFieldArray({ control, name: 'tiers' })
  const { fields: multiplierFields, remove: removeMultiplier, append: appendMultiplier } = useFieldArray({
    control,
    name: 'multipliers',
  })
  const { fields: requirementFields } = useFieldArray({ control, name: 'requirements' })

  useEffect(() => {
    if (data) reset(data)
  }, [data, reset])

  const onSubmit = handleSubmit(async (values) => {
    try {
      await save.mutateAsync(values)
      toast.success('Scoring configuration saved')
    } catch {
      toast.error('Could not save scoring rules')
    }
  })

  if (isError) return <ErrorState title="Unable to load scoring rules" onRetry={() => void refetch()} />
  if (isLoading || !data) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 rounded-[14px]" />
        <Skeleton className="h-40 rounded-[14px]" />
      </div>
    )
  }

  return (
    <form className="space-y-5" onSubmit={(event) => void onSubmit(event)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-ink">
            <Gauge className="size-5 text-brand-bright" aria-hidden />
            Scoring Rules
          </h1>
          <p className="mt-1 font-mono text-xs text-dim">
            version {data.version} · updated {new Date(data.updatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty ? (
            <span className="font-mono text-[11px] text-amber">unsaved changes</span>
          ) : null}
          <Button type="submit" loading={isSubmitting || save.isPending} icon={<Save className="size-4" aria-hidden />}>
            Save configuration
          </Button>
        </div>
      </div>

      {errors.tiers ? (
        <p role="alert" className="rounded-lg border border-rose/40 bg-rose/10 px-4 py-2 text-sm text-rose">
          {errors.tiers.message}
        </p>
      ) : null}

      {/* tiers */}
      <section aria-labelledby="tiers" className="space-y-4">
        <h2 id="tiers" className="font-mono text-[11px] uppercase tracking-[0.24em] text-dim">
          difficulty tiers
        </h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {tierFields.map((field, index) => (
            <Panel key={field.id} className={cn('p-5', TIER_TONE[index])}>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
                {String(index + 1).padStart(2, '0')} · {data.tiers[index]?.difficulty}
              </p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Field label="Min XP" htmlFor={`tier-${index}-min`}>
                  <Input id={`tier-${index}-min`} type="number" {...register(`tiers.${index}.minXp`, { valueAsNumber: true })} />
                </Field>
                <Field label="Max XP" htmlFor={`tier-${index}-max`}>
                  <Input id={`tier-${index}-max`} type="number" {...register(`tiers.${index}.maxXp`, { valueAsNumber: true })} />
                </Field>
              </div>

              <div className="mt-3">
                <Field label="Examples (JSON array)" htmlFor={`tier-${index}-examples`} hint="Shown on the public rules page">
                  <Textarea
                    id={`tier-${index}-examples`}
                    rows={4}
                    className="font-mono text-xs"
                    defaultValue={JSON.stringify(data.tiers[index]?.examples ?? [], null, 2)}
                    {...register(`tiers.${index}.examples`, {
                      setValueAs: (value: unknown) => {
                        if (Array.isArray(value)) return value as string[]
                        if (typeof value !== 'string') return []
                        try {
                          const parsed: unknown = JSON.parse(value)
                          return Array.isArray(parsed) ? (parsed as string[]) : []
                        } catch {
                          return []
                        }
                      },
                    })}
                  />
                </Field>
              </div>
            </Panel>
          ))}
        </div>
      </section>

      {/* multipliers */}
      <section aria-labelledby="multipliers" className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 id="multipliers" className="font-mono text-[11px] uppercase tracking-[0.24em] text-dim">
            quality multipliers
          </h2>
          <Button
            type="button"
            size="sm"
            variant="outline"
            icon={<Plus className="size-3.5" aria-hidden />}
            onClick={() => appendMultiplier({ id: `custom-${multiplierFields.length + 1}`, label: 'Custom rule', factor: 1, description: '' })}
          >
            Add multiplier
          </Button>
        </div>

        <Panel className="divide-y divide-line">
          {multiplierFields.map((field, index) => (
            <div key={field.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_120px_1.4fr_auto] sm:items-end">
              <Field label="Label" htmlFor={`mult-${index}-label`}>
                <Input id={`mult-${index}-label`} {...register(`multipliers.${index}.label`)} />
              </Field>
              <Field label="Factor" htmlFor={`mult-${index}-factor`}>
                <Input id={`mult-${index}-factor`} type="number" step="0.05" {...register(`multipliers.${index}.factor`, { valueAsNumber: true })} />
              </Field>
              <Field label="Description" htmlFor={`mult-${index}-desc`}>
                <Input id={`mult-${index}-desc`} {...register(`multipliers.${index}.description`)} />
              </Field>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                icon={<Trash2 className="size-4" aria-hidden />}
                aria-label={`Remove ${data.multipliers[index]?.label ?? 'multiplier'}`}
                onClick={() => removeMultiplier(index)}
              />
            </div>
          ))}
        </Panel>
      </section>

      {/* requirements */}
      <section aria-labelledby="requirements" className="space-y-4">
        <h2 id="requirements" className="font-mono text-[11px] uppercase tracking-[0.24em] text-dim">
          award requirements
        </h2>
        <Panel className="divide-y divide-line">
          {requirementFields.map((field, index) => (
            <div key={field.id} className="grid gap-3 p-4 sm:grid-cols-[180px_1fr_110px] sm:items-end">
              <Field label="Label" htmlFor={`req-${index}-label`}>
                <Input id={`req-${index}-label`} {...register(`requirements.${index}.label`)} />
              </Field>
              <Field label="Description" htmlFor={`req-${index}-desc`}>
                <Input id={`req-${index}-desc`} {...register(`requirements.${index}.description`)} />
              </Field>
              <Field label="Mandatory" htmlFor={`req-${index}-mandatory`}>
                <label className="flex h-10 items-center gap-2 rounded-lg border border-line bg-void/70 px-3 text-sm text-muted">
                  <input
                    id={`req-${index}-mandatory`}
                    type="checkbox"
                    className="size-4 accent-[#22C55E]"
                    {...register(`requirements.${index}.mandatory`)}
                  />
                  required
                </label>
              </Field>
            </div>
          ))}
        </Panel>
      </section>

      <p className="font-mono text-[11px] text-dim">
        // TODO: Connect admin CRUD API · PUT /admin/scoring — values are read by the public rules page and calculator
      </p>
    </form>
  )
}
