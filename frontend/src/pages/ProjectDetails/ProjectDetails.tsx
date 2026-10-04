import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarClock,
  ExternalLink,
  GitFork,
  GitPullRequestArrow,
  Star,
  Users,
} from 'lucide-react'
import { useProject, useProblemStatements } from '@/hooks/useProjects'
import { useContributions } from '@/hooks/useContributions'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container, Panel } from '@/components/ui/Panel'
import { Tabs } from '@/components/ui/Tabs'
import { ButtonLink } from '@/components/ui/Button'
import { DifficultyPill, StatusPill, Tag, TypePill } from '@/components/ui/Pills'
import { Skeleton, SkeletonList } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { IssueRow } from '@/pages/ProjectDetails/IssueRow'
import { formatCompact, formatDate, range } from '@/utils/format'
import type { Contribution, ProblemStatement } from '@/types'

type TabId = 'overview' | 'issues' | 'guidelines' | 'activity'

export default function ProjectDetails() {
  const { projectSlug } = useParams()
  const [tab, setTab] = useState<TabId>('overview')

  const { data: project, isLoading, isError, refetch } = useProject(projectSlug)
  const { data: statements = [], isLoading: loadingStatements } = useProblemStatements(project?.id, Boolean(project))
  const { data: contributions = [], isLoading: loadingActivity } = useContributions(
    project ? { projectId: project.id } : undefined,
  )

  useDocumentTitle(project?.name)

  const tabs = useMemo(
    () => [
      { id: 'overview', label: 'Overview' },
      { id: 'issues', label: 'Available Issues', count: statements.length },
      { id: 'guidelines', label: 'Guidelines' },
      { id: 'activity', label: 'Contribution History', count: contributions.length },
    ],
    [statements.length, contributions.length],
  )

  if (isLoading) {
    return (
      <Container className="py-12">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-6 h-10 w-2/3 max-w-lg" />
        <Skeleton className="mt-4 h-5 w-1/2 max-w-md" />
        <Skeleton className="mt-8 h-64 w-full rounded-[14px]" />
      </Container>
    )
  }

  if (isError || !project) {
    return (
      <Container className="py-20">
        <ErrorState
          title="Project not found"
          description="This repository may have been archived or the link is incorrect."
          onRetry={() => void refetch()}
        />
        <div className="mt-6 text-center">
          <ButtonLink to="/projects" variant="outline" icon={<ArrowLeft className="size-4" aria-hidden />}>
            Back to registry
          </ButtonLink>
        </div>
      </Container>
    )
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-pitch/60 py-10 sm:py-12">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-50" aria-hidden />
        <Container className="relative">
          <Link
            to="/projects"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-muted transition hover:text-mint"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            all projects
          </Link>

          <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-dim">
                  {project.category}
                </span>
                <StatusPill status={project.status} />
                <DifficultyPill difficulty={project.difficulty} />
              </div>
              <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                {project.name}
              </h1>
              <p className="mt-3 text-lg text-mint">{project.tagline}</p>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
                {project.description}
              </p>
            </div>

            <div className="flex shrink-0 flex-wrap gap-2">
              <ButtonLink to={`/leaderboard?project=${project.id}`} variant="secondary" size="sm" icon={<GitPullRequestArrow className="size-4" aria-hidden />}>
                Project leaderboard
              </ButtonLink>
              <ButtonLink href={project.repositoryUrl} target="_blank" icon={<ExternalLink className="size-4" aria-hidden />}>
                GitHub Repository
              </ButtonLink>
            </div>
          </div>

          <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-line pt-6 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: 'Stars', value: formatCompact(project.stars), icon: Star },
              { label: 'Forks', value: formatCompact(project.forks), icon: GitFork },
              { label: 'Open issues', value: String(project.openIssues), icon: GitPullRequestArrow },
              { label: 'Slots left', value: `${project.slotsAvailable}/${project.slotsTotal}`, icon: Users },
              { label: 'Potential XP', value: range(project.potentialXpMin, project.potentialXpMax), icon: null },
              { label: 'Added', value: formatDate(project.createdAt), icon: CalendarClock },
            ].map((item) => (
              <div key={item.label}>
                <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-dim">{item.label}</dt>
                <dd className="mt-1.5 font-mono text-base font-bold tabular text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <Container className="py-10">
        <Tabs items={tabs} value={tab} onChange={(id) => setTab(id as TabId)} ariaLabel="Project sections" />

        <div className="mt-8">
          {tab === 'overview' ? <OverviewTab project={project} statements={statements} /> : null}

          {tab === 'issues' ? (
            loadingStatements ? (
              <SkeletonList count={4} />
            ) : statements.length === 0 ? (
              <EmptyState
                title="No open problem statements."
                description="This repository has no published issues right now — check back soon."
                action={{ label: 'Browse other projects', to: '/projects' }}
              />
            ) : (
              <ul className="space-y-4">
                {statements.map((statement) => (
                  <IssueRow key={statement.id} statement={statement} repositoryUrl={project.repositoryUrl} />
                ))}
              </ul>
            )
          ) : null}

          {tab === 'guidelines' ? <GuidelinesTab project={project} /> : null}

          {tab === 'activity' ? (
            loadingActivity ? (
              <SkeletonList count={4} />
            ) : contributions.length === 0 ? (
              <EmptyState
                title="No contributions yet."
                description="Be the first to land a pull request in this repository."
                action={{ label: 'Open the first issue', href: project.repositoryUrl }}
              />
            ) : (
              <ActivityList contributions={contributions} />
            )
          ) : null}
        </div>
      </Container>
    </>
  )
}

function OverviewTab({
  project,
  statements,
}: {
  project: NonNullable<ReturnType<typeof useProject>['data']>
  statements: ProblemStatement[]
}) {
  const byDifficulty = statements.reduce(
    (acc, item) => {
      acc[item.difficulty] = (acc[item.difficulty] ?? 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  return (
    <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
      <Panel className="p-6">
        <h2 className="text-lg font-bold text-ink">About this repository</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted">{project.description}</p>

        <div className="mt-6">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">Requirements</h3>
          <ul className="mt-3 space-y-2">
            {project.requirements.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand-bright" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 border-t border-line pt-5">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">Tech stack</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <Tag key={tech} className="text-mint">
                {tech}
              </Tag>
            ))}
            {project.tags.map((tag) => (
              <Tag key={tag}>#{tag}</Tag>
            ))}
          </div>
        </div>
      </Panel>

      <div className="flex flex-col gap-5">
        <Panel className="p-5">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">Project admin</h3>
          <div className="mt-3 flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg border border-brand/40 bg-brand/12 font-mono text-xs font-bold text-mint">
              {project.admin.name.slice(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink">{project.admin.name}</p>
              <a
                href={project.admin.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs text-mint hover:underline"
              >
                @{project.admin.username}
              </a>
            </div>
          </div>
        </Panel>

        <Panel className="p-5">
          <h3 className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">Issue mix</h3>
          <ul className="mt-3 space-y-3">
            {(['easy', 'medium', 'hard'] as const).map((level) => (
              <li key={level} className="flex items-center justify-between gap-3">
                <DifficultyPill difficulty={level} />
                <span className="font-mono text-sm tabular text-muted">{byDifficulty[level] ?? 0} open</span>
              </li>
            ))}
          </ul>
          <div className="mt-5 border-t border-line pt-4">
            <p className="text-xs leading-relaxed text-dim">
              Scoring follows the global rules — see the point calculator for estimates.
            </p>
            <ButtonLink to="/rules" variant="ghost" size="sm" className="mt-2 px-0">
              View point rules →
            </ButtonLink>
          </div>
        </Panel>
      </div>
    </div>
  )
}

function GuidelinesTab({ project }: { project: NonNullable<ReturnType<typeof useProject>['data']> }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <Panel className="p-6">
        <h2 className="text-lg font-bold text-ink">Contribution guidelines</h2>
        <ol className="mt-4 space-y-3">
          {project.guidelines.map((item, index) => (
            <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted">
              <span className="font-mono text-xs font-bold text-brand-bright">
                {String(index + 1).padStart(2, '0')}
              </span>
              {item}
            </li>
          ))}
        </ol>
      </Panel>

      <Panel className="p-6">
        <h2 className="text-lg font-bold text-ink">Repository</h2>
        <p className="mt-3 font-mono text-sm break-all text-mint">{project.repositoryUrl.replace('https://', '')}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          <ButtonLink href={project.repositoryUrl} target="_blank" size="sm">
            Open repository
          </ButtonLink>
          {project.homepageUrl ? (
            <ButtonLink href={project.homepageUrl} target="_blank" variant="outline" size="sm">
              Live demo
            </ButtonLink>
          ) : null}
        </div>
        <div className="mt-6 border-t border-line pt-5 font-mono text-xs leading-relaxed text-dim">
          <p>$ git clone {project.repositoryUrl}.git</p>
          <p>$ git checkout -b fix/your-issue-number</p>
          <p className="text-mint">$ gh pr create --fill</p>
        </div>
      </Panel>
    </div>
  )
}

function ActivityList({ contributions }: { contributions: Contribution[] }) {
  return (
    <ul className="space-y-3">
      {contributions.map((contribution) => (
        <li
          key={contribution.id}
          className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-coal/70 px-4 py-3.5"
        >
          <div className="min-w-0">
            <a
              href={contribution.pullRequestUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-sm font-semibold text-ink hover:text-mint"
            >
              PR #{contribution.pullRequestNumber} · {contribution.title}
            </a>
            <p className="mt-1 font-mono text-[11.5px] text-dim">
              @{contribution.author.username} · {formatDate(contribution.submittedAt)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <TypePill type={contribution.contributionType} />
            <DifficultyPill difficulty={contribution.difficulty} />
            <StatusPill status={contribution.prStatus} />
            <span className="font-mono text-sm font-bold text-mint">
              {contribution.xpAwarded ? `+${contribution.xpAwarded} XP` : 'pending'}
            </span>
          </div>
        </li>
      ))}
    </ul>
  )
}
