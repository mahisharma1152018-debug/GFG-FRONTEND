import { useEffect, useMemo, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Search, Trophy } from 'lucide-react'
import { COLLEGES } from '@/data/mock/users'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useDebounce } from '@/hooks/useDebounce'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import { Container, Panel } from '@/components/ui/Panel'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Input, Select } from '@/components/ui/Field'
import { SegmentedControl } from '@/components/ui/Tabs'
import { Podium } from '@/components/leaderboard/Podium'
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable'
import { SkeletonList, Skeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { useProjects } from '@/hooks/useProjects'
import { CONTRIBUTION_TYPE_LABEL } from '@/utils/format'
import type { ContributionType, LeaderboardScope } from '@/types'

const SCOPES = [
  { id: 'overall', label: 'Overall' },
  { id: 'weekly', label: 'This Week' },
  { id: 'project', label: 'By Project' },
]

const TYPES: (ContributionType | 'all')[] = [
  'all',
  'bug-fix',
  'feature',
  'documentation',
  'performance',
  'testing',
]

export default function Leaderboard() {
  useDocumentTitle('Leaderboard')

  const [params, setParams] = useSearchParams()
  const [scope, setScope] = useState<LeaderboardScope>(
    (params.get('scope') as LeaderboardScope) ?? 'overall',
  )
  const [projectId, setProjectId] = useState(params.get('project') ?? '')
  const [search, setSearch] = useState('')
  const [college, setCollege] = useState('all')
  const [contributionType, setContributionType] = useState<ContributionType | 'all'>('all')

  const debounced = useDebounce(search, 250)
  const { data: projects } = useProjects({ pageSize: 50 }, scope === 'project')
  const { data: me } = useCurrentUser()

  const query = useMemo(
    () => ({ scope, search: debounced || undefined, projectId: projectId || undefined, college, contributionType }),
    [scope, debounced, projectId, college, contributionType],
  )

  const { data = [], isLoading, isError, refetch } = useLeaderboard(query)

  useEffect(() => {
    const next = new URLSearchParams(params)
    next.set('scope', scope)
    if (projectId) next.set('project', projectId)
    else next.delete('project')
    setParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scope, projectId])

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-pitch/60 py-14 sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative">
          <SectionHeading
            eyebrow="Standings"
            title={
              <>
                The board rewards <span className="text-brand-bright">shipped work</span>
              </>
            }
            description="Ranks update when maintainers merge and classify pull requests — weekly standings reset every Monday."
          />
        </Container>
      </section>

      <Container className="py-10">
        <Panel className="mb-8 flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between sm:p-5">
          <div className="flex flex-wrap items-center gap-3">
            <SegmentedControl
              ariaLabel="Leaderboard scope"
              items={SCOPES}
              value={scope}
              onChange={(id) => setScope(id as LeaderboardScope)}
            />

            {scope === 'project' ? (
              <Select
                aria-label="Project"
                className="h-9 w-auto py-1 text-xs"
                value={projectId}
                onChange={(event) => setProjectId(event.target.value)}
              >
                <option value="">Choose a project</option>
                {(projects?.items ?? []).map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </Select>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <label className="relative block flex-1 sm:min-w-56">
              <span className="sr-only">Search participants</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dim" aria-hidden />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search participant..."
                className="h-9 pl-9 text-xs sm:text-sm"
              />
            </label>

            <Select
              aria-label="College"
              className="h-9 w-auto py-1 text-xs"
              value={college}
              onChange={(event) => setCollege(event.target.value)}
            >
              <option value="all">All colleges</option>
              {COLLEGES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>

            <Select
              aria-label="Contribution type"
              className="h-9 w-auto py-1 text-xs"
              value={contributionType}
              onChange={(event) => setContributionType(event.target.value as ContributionType | 'all')}
            >
              {TYPES.map((item) => (
                <option key={item} value={item}>
                  {item === 'all' ? 'All types' : CONTRIBUTION_TYPE_LABEL[item]}
                </option>
              ))}
            </Select>
          </div>
        </Panel>

        {isLoading ? (
          <>
            <div className="mb-8 grid gap-4 sm:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <Skeleton key={index} className="h-52 rounded-[14px]" />
              ))}
            </div>
            <SkeletonList count={6} />
          </>
        ) : isError ? (
          <ErrorState title="Unable to load leaderboard" description="Standings service did not respond." onRetry={() => void refetch()} />
        ) : data.length === 0 ? (
          <EmptyState
            title="No participants match this view."
            description="Try clearing the search or switching back to the overall scope."
            action={{ label: 'View overall standings', to: '/leaderboard' }}
          />
        ) : (
          <>
            {data.length >= 3 ? <div className="mb-10"><Podium entries={data} /></div> : null}
            <LeaderboardTable entries={data} highlightUserId={me?.id} />
          </>
        )}

        <Panel className="mt-8 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-brand/40 bg-brand/12 text-brand-bright">
              <Trophy className="size-4" aria-hidden />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">Rank is earned, never assigned</p>
              <p className="mt-1 text-sm text-muted">
                Points come from reviewed, merged pull requests. Spam, duplicates and trivial edits score zero.
              </p>
            </div>
          </div>
          <Link to="/rules" className="shrink-0 font-mono text-sm text-mint hover:underline">
            Read the point rules →
          </Link>
        </Panel>
      </Container>
    </>
  )
}
