import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowDown, GitBranch, GitMerge, GitPullRequestArrow, Rocket, Search, Trophy } from 'lucide-react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Container, Panel } from '@/components/ui/Panel'
import { ButtonLink } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const STEPS = [
  {
    id: '01',
    title: 'Choose a Project',
    description: 'Browse the registry, filter by stack and difficulty, and pick a repository you actually want to improve.',
    icon: Search,
    command: '$ gfg projects list --featured',
  },
  {
    id: '02',
    title: 'Pick an Issue',
    description: 'Every problem statement ships with scope, expected impact and a suggested XP band.',
    icon: GitBranch,
    command: '$ gfg issues claim ps-041',
  },
  {
    id: '03',
    title: 'Fork & Contribute',
    description: 'Fork the repository, create a branch and do the work — code, docs, tests, UI or performance.',
    icon: GitPullRequestArrow,
    command: '$ git push origin fix/webhook-retry',
  },
  {
    id: '04',
    title: 'Submit / Merge',
    description: 'Open the pull request, link the issue and respond to review until a maintainer merges it.',
    icon: GitMerge,
    command: '$ gh pr create --fill',
  },
  {
    id: '05',
    title: 'Earn Points',
    description: 'The backend classifies the merged PR, applies the scoring rules and updates rank, XP and badges.',
    icon: Trophy,
    command: '+++ XP AWARDED: +45 +++',
  },
]

const FLOW = [
  'Repository',
  'Issue',
  'Fork',
  'Branch',
  'Code',
  'Pull Request',
  'Review',
  'Merged',
  'Points',
]

/** Landing-page version: interactive step selector + linear GitHub flow. */
export function HowItWorks() {
  const [active, setActive] = useState(0)
  const step = STEPS[active]
  const Icon = step.icon

  return (
    <section id="how-it-works" className="relative py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="The workflow"
          title={
            <>
              Find an issue. Fix it. <span className="text-brand-bright">Ship it.</span>
            </>
          }
          description="The same loop you already know from open source — with visible scoring attached to every merged pull request."
          actions={
            <ButtonLink to="/how-it-works" variant="outline" size="sm">
              Full contribution guide
            </ButtonLink>
          }
        />

        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <ol className="flex flex-col gap-2">
            {STEPS.map((item, index) => {
              const isActive = index === active
              const StepIcon = item.icon
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setActive(index)}
                    aria-current={isActive}
                    className={cn(
                      'group flex w-full items-start gap-4 rounded-xl border px-4 py-4 text-left transition',
                      isActive
                        ? 'border-brand/45 bg-brand/[0.08]'
                        : 'border-line bg-coal/60 hover:border-line-strong hover:bg-coal',
                    )}
                  >
                    <span
                      className={cn(
                        'mt-0.5 grid size-9 shrink-0 place-items-center rounded-lg border font-mono text-xs font-bold transition',
                        isActive ? 'border-brand/50 bg-brand/15 text-mint' : 'border-line text-dim',
                      )}
                    >
                      {item.id}
                    </span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <StepIcon className={cn('size-4', isActive ? 'text-brand-bright' : 'text-dim')} aria-hidden />
                        <span className={cn('text-base font-semibold', isActive ? 'text-ink' : 'text-muted')}>
                          {item.title}
                        </span>
                      </span>
                      <AnimatePresence initial={false}>
                        {isActive ? (
                          <motion.span
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="block overflow-hidden"
                          >
                            <span className="mt-2 block text-sm leading-relaxed text-muted">
                              {item.description}
                            </span>
                          </motion.span>
                        ) : null}
                      </AnimatePresence>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>

          <Panel className="flex flex-col justify-between overflow-hidden p-6 sm:p-8">
            <div>
              <div className="flex items-center gap-3">
                <span className="grid size-11 place-items-center rounded-xl border border-brand/40 bg-brand/12 text-brand-bright">
                  <Icon className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-dim">
                    step {step.id} of 05
                  </p>
                  <p className="text-xl font-bold text-ink">{step.title}</p>
                </div>
              </div>

              <p className="mt-5 text-base leading-relaxed text-muted">{step.description}</p>

              <pre className="mt-6 overflow-x-auto rounded-lg border border-line bg-void/70 px-4 py-3 font-mono text-[12.5px] text-mint">
                <span className="mr-2 text-brand-bright">❯</span>
                {step.command.replace(/^\$ /, '')}
              </pre>
            </div>

            {/* linear GitHub flow */}
            <div className="mt-8 border-t border-line pt-6">
              <p className="mb-4 font-mono text-[11px] uppercase tracking-[0.22em] text-dim">
                contribution pipeline
              </p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
                {FLOW.map((node, index) => (
                  <span key={node} className="flex items-center gap-2">
                    <motion.span
                      initial={{ opacity: 0.45 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.08 }}
                      className={cn(
                        'rounded-md border px-2.5 py-1 font-mono text-[11px] transition',
                        index === FLOW.length - 1
                          ? 'border-brand/50 bg-brand/15 text-mint'
                          : 'border-line bg-white/[0.03] text-muted',
                      )}
                    >
                      {node}
                    </motion.span>
                    {index < FLOW.length - 1 ? (
                      <ArrowDown className="size-3 rotate-[-90deg] text-dim" aria-hidden />
                    ) : null}
                  </span>
                ))}
              </div>

              <p className="mt-5 flex items-center gap-2 font-mono text-[11.5px] text-brand-bright">
                <Rocket className="size-3.5" aria-hidden />
                Every PR counts — merged work is what scores.
              </p>
            </div>
          </Panel>
        </div>
      </Container>
    </section>
  )
}
