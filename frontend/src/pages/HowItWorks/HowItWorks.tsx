import { CheckCircle2, Circle } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container, Panel } from '@/components/ui/Panel'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { HowItWorks as HowItWorksSection } from '@/components/home/HowItWorks'
import { GithubIntegration } from '@/components/home/GithubIntegration'
import { CommunityCta } from '@/components/home/CommunityCta'
import { ButtonLink } from '@/components/ui/Button'
import { cn } from '@/utils/cn'

const LIFECYCLE = [
  { label: 'Participant selects a project', detail: 'Registry filters by stack, difficulty and slots' },
  { label: 'Opens the GitHub issue', detail: 'Problem statement defines scope and acceptance criteria' },
  { label: 'Forks the repository', detail: 'Work happens on a feature branch' },
  { label: 'Creates the branch and commits', detail: 'Conventional commits referencing the issue' },
  { label: 'Opens a pull request', detail: 'PR template links back to the problem statement' },
  { label: 'GitHub App detects the PR', detail: 'Webhook fires to the Express backend' },
  { label: 'Backend analyses the contribution', detail: 'Diff size, files touched, issue link, tests' },
  { label: 'Maintainer reviews', detail: 'Approve, request changes, or close' },
  { label: 'Pull request merged', detail: 'Only merged work becomes eligible' },
  { label: 'Contribution classified', detail: 'Type + difficulty assigned by scoring rules' },
  { label: 'XP awarded', detail: 'Tier range × quality multiplier' },
  { label: 'Leaderboard and badges update', detail: 'Ranks, streaks and unlocks refresh instantly' },
]

const QUALITY = [
  {
    title: 'Link the issue',
    text: 'Every PR description references the problem statement number so review context is one click away.',
  },
  {
    title: 'Ship tests with behaviour changes',
    text: 'A fix without a regression test tends to regress again — reviewers score coverage accordingly.',
  },
  {
    title: 'Keep the diff readable',
    text: 'Split unrelated changes. Reviewers move faster on focused pull requests and grade them higher.',
  },
  {
    title: 'Respond to review quickly',
    text: 'Stale pull requests lose their slot. Reply, push, and re-request the review the same day.',
  },
]

export default function HowItWorksPage() {
  useDocumentTitle('How It Works')

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-pitch/60 py-14 sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative">
          <SectionHeading
            eyebrow="Guide"
            title={
              <>
                From issue to <span className="text-brand-bright">XP</span>, end to end
              </>
            }
            description="A walkthrough of the exact path a contribution takes — what you do, what the platform does, and where points come from."
            actions={
              <ButtonLink to="/projects" variant="secondary">
                Start with a project
              </ButtonLink>
            }
          />
        </Container>
      </section>

      <HowItWorksSection />

      <section className="border-t border-line bg-pitch/50 py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Lifecycle"
            title="What happens after you push"
            description="The same twelve steps run for every contribution, whether it is a one-line docs fix or a major feature."
          />

          <ol className="grid gap-x-8 gap-y-0 md:grid-cols-2">
            {LIFECYCLE.map((step, index) => (
              <li key={step.label} className="flex gap-4 border-b border-line py-4 last:border-0">
                <span className="mt-0.5 shrink-0">
                  {index < 8 ? (
                    <CheckCircle2 className="size-4.5 text-brand-bright" aria-hidden />
                  ) : (
                    <Circle className="size-4.5 text-line-strong" aria-hidden />
                  )}
                </span>
                <span>
                  <span className="flex items-baseline gap-2">
                    <span className="font-mono text-[11px] text-brand-bright">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-sm font-semibold text-ink">{step.label}</span>
                  </span>
                  <span className="mt-1 block text-sm text-muted">{step.detail}</span>
                </span>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="py-20 sm:py-24">
        <Container>
          <SectionHeading
            eyebrow="Craft"
            title="What a scoring pull request looks like"
            description="None of this is ceremony — each habit directly improves the review outcome and the XP band you land in."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {QUALITY.map((item, index) => (
              <Panel key={item.title} hover className={cn('p-6')}>
                <span className="font-mono text-[11px] text-brand-bright">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-2 text-base font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{item.text}</p>
              </Panel>
            ))}
          </div>
        </Container>
      </section>

      <GithubIntegration />
      <CommunityCta />
    </>
  )
}
