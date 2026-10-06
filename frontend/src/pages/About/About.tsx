import { GithubIcon } from '@/components/ui/BrandIcons'
import { Code2, GitPullRequestArrow, Users, Zap } from 'lucide-react'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container, Panel } from '@/components/ui/Panel'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ButtonLink } from '@/components/ui/Button'
import { TerminalWindow } from '@/components/github/TerminalWindow'
import { EVENT_CONFIG, SITE_CONFIG } from '@/config/site'
import { CommunityCta } from '@/components/home/CommunityCta'

const VALUES = [
  {
    icon: GitPullRequestArrow,
    title: 'Contribution over commits',
    text: 'A merged pull request that changes behaviour beats a hundred noise commits. We score outcomes.',
  },
  {
    icon: Users,
    title: 'Community without teams',
    text: 'Reviews, mentorship and documentation help individual contributors ship stronger open-source work.',
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
  { date: EVENT_CONFIG.startDateLabel, label: 'Event begins', detail: 'The seven-day individual contribution window opens' },
  { date: EVENT_CONFIG.endDateLabel, label: 'Contributions close', detail: 'The individual contribution window ends' },
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
              title="about · geektober"
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
            event timeline
          </h2>
          <ol className="relative mt-7 ml-3 border-l border-brand/25 md:ml-6">
            {MILESTONES.map((milestone, index) => (
              <li key={milestone.label} className="relative pb-8 pl-8 last:pb-0 sm:pl-10">
                <span
                  className="absolute -left-[13px] top-0 grid size-6 place-items-center rounded-full border border-brand/50 bg-void font-mono text-[9px] font-bold text-brand-bright shadow-[0_0_0_4px_rgba(5,11,20,0.95)] transition-transform duration-200 hover:scale-110"
                  aria-hidden
                >
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div className="group rounded-xl border border-transparent px-3 py-1 transition-colors duration-200 hover:border-line hover:bg-white/[0.02] sm:px-4">
                  <p className="font-mono text-xs font-bold uppercase tracking-[0.12em] text-brand-bright">{milestone.date}</p>
                  <p className="mt-1.5 text-sm font-semibold text-ink">{milestone.label}</p>
                  <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-dim">{milestone.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </Container>

      <CommunityCta />
    </>
  )
}
