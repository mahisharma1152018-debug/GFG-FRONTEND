import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { useDebounce } from '@/hooks/useDebounce'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { Container, Panel } from '@/components/ui/Panel'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Input, Select } from '@/components/ui/Field'
import { Pagination } from '@/components/ui/Pagination'
import { SkeletonGrid } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { PROJECT_CATEGORIES, TECHNOLOGIES } from '@/data/mock/projects'
import { CONTRIBUTION_TYPE_LABEL, DIFFICULTY_LABEL } from '@/utils/format'
import type { ContributionType, Difficulty, ProjectCategory } from '@/types'

const DIFFICULTIES: (Difficulty | 'all')[] = ['all', 'easy', 'medium', 'hard']
const CONTRIBUTION_TYPES: (ContributionType | 'all')[] = [
  'all',
  'bug-fix',
  'feature',
  'ui-ux',
  'documentation',
  'performance',
  'testing',
  'refactor',
  'integration',
]

const SORTS = [
  { id: 'trending', label: 'Trending' },
  { id: 'points', label: 'Highest XP' },
  { id: 'open-issues', label: 'Most issues' },
  { id: 'difficulty', label: 'Hardest first' },
  { id: 'newest', label: 'Newest' },
] as const

type SortId = (typeof SORTS)[number]['id']

interface FilterState {
  category: ProjectCategory | 'all'
  difficulty: Difficulty | 'all'
  technology: string
  contributionType: ContributionType | 'all'
  availability: 'all' | 'slots'
  sort: SortId
  page: number
}

const INITIAL_FILTERS: FilterState = {
  category: 'all',
  difficulty: 'all',
  technology: '',
  contributionType: 'all',
  availability: 'all',
  sort: 'trending',
  page: 1,
}

/**
 * Project / problem-statement registry.
 * Filters live in the URL-ready filter object that the API accepts verbatim.
 */
export default function Projects() {
  useDocumentTitle('Projects')

  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS)
  const [searchInput, setSearchInput] = useState('')

  const debouncedSearch = useDebounce(searchInput, 300)

  /** Every filter change returns to page 1. */
  const update = (patch: Partial<FilterState>) =>
    setFilters((previous) => ({ ...previous, ...patch, page: 1 }))

  const query = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      category: filters.category,
      difficulty: filters.difficulty,
      technology: filters.technology || undefined,
      contributionType: filters.contributionType,
      availability: filters.availability,
      sort: filters.sort,
      page: filters.page,
      pageSize: 9,
    }),
    [debouncedSearch, filters],
  )

  const { data, isLoading, isError, refetch, isFetching } = useProjects(query)

  const activeFilters =
    (filters.category !== 'all' ? 1 : 0) +
    (filters.difficulty !== 'all' ? 1 : 0) +
    (filters.technology ? 1 : 0) +
    (filters.contributionType !== 'all' ? 1 : 0) +
    (filters.availability !== 'all' ? 1 : 0) +
    (debouncedSearch ? 1 : 0)

  const reset = () => {
    setSearchInput('')
    setFilters(INITIAL_FILTERS)
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-pitch/60 py-14 sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden />
        <Container className="relative">
          <SectionHeading
            eyebrow="Registry"
            title={
              <>
                Pick a repository. <span className="text-brand-bright">Take an issue.</span>
              </>
            }
            description="Twelve active repositories, every problem statement scoped with difficulty, expected impact and a suggested XP band."
          />
        </Container>
      </section>

      <Container className="py-10">
        <Panel className="mb-8 p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1.6fr_repeat(3,minmax(0,1fr))]">
            <label className="relative block">
              <span className="sr-only">Search projects</span>
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dim" aria-hidden />
              <Input
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value)
                  setFilters((previous) => ({ ...previous, page: 1 }))
                }}
                placeholder="Search projects, stacks, tags..."
                className="pl-9"
              />
            </label>

            <Select aria-label="Category" value={filters.category} onChange={(event) => update({ category: event.target.value as ProjectCategory | 'all' })}>
              <option value="all">All categories</option>
              {PROJECT_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>

            <Select aria-label="Difficulty" value={filters.difficulty} onChange={(event) => update({ difficulty: event.target.value as Difficulty | 'all' })}>
              {DIFFICULTIES.map((item) => (
                <option key={item} value={item}>
                  {item === 'all' ? 'Any difficulty' : DIFFICULTY_LABEL[item]}
                </option>
              ))}
            </Select>

            <Select aria-label="Technology" value={filters.technology} onChange={(event) => update({ technology: event.target.value })}>
              <option value="">Any technology</option>
              {TECHNOLOGIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
            <SlidersHorizontal className="size-3.5 text-dim" aria-hidden />
            <Select
              aria-label="Contribution type"
              className="h-9 w-auto py-1 text-xs"
              value={filters.contributionType}
              onChange={(event) => update({ contributionType: event.target.value as ContributionType | 'all' })}
            >
              {CONTRIBUTION_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item === 'all' ? 'All contribution types' : CONTRIBUTION_TYPE_LABEL[item]}
                </option>
              ))}
            </Select>

            <Select
              aria-label="Availability"
              className="h-9 w-auto py-1 text-xs"
              value={filters.availability}
              onChange={(event) => update({ availability: event.target.value as 'all' | 'slots' })}
            >
              <option value="all">Any availability</option>
              <option value="slots">Slots open</option>
            </Select>

            <Select
              aria-label="Sort"
              className="h-9 w-auto py-1 text-xs"
              value={filters.sort}
              onChange={(event) => update({ sort: event.target.value as SortId })}
            >
              {SORTS.map((item) => (
                <option key={item.id} value={item.id}>
                  Sort: {item.label}
                </option>
              ))}
            </Select>

            <span className="ml-auto flex items-center gap-3">
              {activeFilters > 0 ? (
                <button
                  type="button"
                  onClick={reset}
                  className="inline-flex items-center gap-1 rounded-md border border-line px-2 py-1 text-xs text-muted transition hover:border-rose/45 hover:text-rose"
                >
                  <X className="size-3" aria-hidden />
                  Clear {activeFilters} filter{activeFilters > 1 ? 's' : ''}
                </button>
              ) : null}
              <span className="font-mono text-xs tabular text-dim" aria-live="polite">
                {data ? `${data.total} project${data.total === 1 ? '' : 's'}` : 'loading…'}
              </span>
            </span>
          </div>
        </Panel>

        {isLoading ? (
          <SkeletonGrid count={6} />
        ) : isError ? (
          <ErrorState title="Unable to load projects" description="The registry did not respond." onRetry={() => void refetch()} />
        ) : !data?.items.length ? (
          <EmptyState
            title="No projects match these filters."
            description="Try widening the difficulty or technology filters — new problem statements are published daily."
            action={{ label: 'Reset filters', to: '/projects' }}
          />
        ) : (
          <>
            <div className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${isFetching ? 'opacity-60' : ''} transition-opacity`}>
              {data.items.map((project, index) => (
                <ProjectCard key={project.id} project={project} index={index} />
              ))}
            </div>
            <Pagination
              className="mt-8"
              page={data.page}
              pageSize={data.pageSize}
              total={data.total}
              onPageChange={(page) => setFilters((previous) => ({ ...previous, page }))}
            />
          </>
        )}
      </Container>
    </>
  )
}
