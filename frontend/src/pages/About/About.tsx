import { GithubIcon } from '@/components/ui/BrandIcons'
import { Code2, GitPullRequestArrow, Users, Zap } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container, Panel } from '@/components/ui/Panel'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ButtonLink } from '@/components/ui/Button'
import { TerminalWindow } from '@/components/github/TerminalWindow'
import { SITE_CONFIG } from '@/config/site'
import { CommunityCta } from '@/components/home/CommunityCta'

const VALUES = [
  {
    icon: GitPullRequestArrow,
    title: 'Contribution over commits',
    text: 'A merged pull request that changes behaviour beats a hundred noise commits. We score outcomes.',
  },
  {
    icon: Users,
    title: 'Community over solo runs',
    text: 'Reviews, mentorship and documentation carry weight — open source is a team sport.',
  },
  {
    icon: Code2,
    title: 'Craft over speed',
    text: 'Readable diffs, tests and clear descriptions are part of the deliverable.',
  },
  {
    icon: Zap,
    title: 'Impact over volume',
    text: 'The scoring model rewards the difficulty and reach of the change, not the number of files touched.',
  },
]

const MILESTONES = [
  { date: 'Sep 15', label: 'Registrations open', detail: 'GitHub sign-in and team formation' },
  { date: 'Oct 01', label: 'Repositories published', detail: '12 repositories, 277 open issues' },
  { date: 'Oct 15', label: 'Mid-festival check', detail: 'First leaderboard cut and mentor office hours' },
  { date: 'Oct 28', label: 'Contributions close', detail: 'PRs must be merged by 23:59' },
  { date: 'Oct 31', label: 'Results and awards', detail: 'Final ranks, badges and closing ceremony' },
]

const STACK = ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Node.js', 'Express', 'MongoDB', 'GitHub API']

export default function About() {
  useDocumentTitle('About')

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-pitch/60 py-14 sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative">
          <SectionHeading
            eyebrow="About"
            title={
              <>
                A serious <span className="text-brand-bright">open-source</span> competition
              </>
            }
            description={`${SITE_CONFIG.name} is an open-source contribution competition run by our club: real repositories, real reviews, real portfolio work — with a leaderboard on top.`}
            actions={
              <ButtonLink href={SITE_CONFIG.githubUrl} target="_blank" icon={<GithubIcon className="size-4" />}>
                Follow the organisation
              </ButtonLink>
            }
          />
        </Container>
      </section>

      <Container className="py-14">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Panel className="p-6 sm:p-8">
            <h2 className="text-xl font-bold text-ink">Why this exists</h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted sm:text-base">
              <p>
                Most students meet open source once, badly — a fork that never becomes a pull request. This festival
                removes the friction: curated repositories, scoped problem statements, visible difficulty and a scoring
                model that mirrors how maintainers actually review work.
              </p>
              <p>
                Participants choose an issue, contribute on GitHub and get evaluated on effective impact. The platform
                handles the bookkeeping — pull request analysis, classification, XP, badges and standings — so everyone
                spends their time writing code that matters.
              </p>
              <p className="text-mint">
                Open source isn&apos;t just about code. It&apos;s about contribution.
              </p>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {VALUES.map((value) => (
                <div key={value.title} className="rounded-xl border border-line bg-white/[0.02] p-4">
                  <value.icon className="size-4 text-brand-bright" aria-hidden />
                  <h3 className="mt-2.5 text-sm font-bold text-ink">{value.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">{value.text}</p>
                </div>
              ))}
            </div>
          </Panel>

          <div className="space-y-6">
            <TerminalWindow
              typed={false}
              title="about · geekstober"
              lines={[
                { kind: 'command', text: 'cat manifest.md' },
                { kind: 'output', text: `event: ${SITE_CONFIG.name}` },
                { kind: 'output', text: `window: ${SITE_CONFIG.dates}` },
                { kind: 'output', text: 'format: open-source contribution competition' },
                { kind: 'accent', text: 'scoring: impact × difficulty × review quality' },
                { kind: 'success', text: 'status: ACCEPTING CONTRIBUTIONS' },
              ]}
            />

            <Panel className="p-5">
              <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">built with</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {STACK.map((item) => (
                  <span
                    key={item}
                    className="rounded-md border border-line bg-white/[0.03] px-2.5 py-1 font-mono text-[11.5px] text-muted"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </Panel>
          </div>
        </div>

        <section className="mt-14" aria-labelledby="timeline-heading">
          <h2 id="timeline-heading" className="font-mono text-[11px] uppercase tracking-[0.28em] text-dim">
            festival timeline
          </h2>
          <ol className="mt-5 grid gap-4 md:grid-cols-5">
            {MILESTONES.map((milestone, index) => (
              <Panel key={milestone.label} hover className="p-4">
                <span className="font-mono text-[11px] text-brand-bright">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <p className="mt-1.5 font-mono text-sm font-bold text-ink">{milestone.date}</p>
                <p className="mt-1 text-sm font-semibold text-muted">{milestone.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-dim">{milestone.detail}</p>
              </Panel>
            ))}
          </ol>
        </section>
      </Container>

      <CommunityCta />
    </>
  )
}
