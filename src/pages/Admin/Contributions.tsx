import { useMemo, useState } from 'react'
import { CheckCircle2, ExternalLink, ListChecks, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { useAdminContributions } from '@/hooks/useAdmin'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Field'
import { SegmentedControl } from '@/components/ui/Tabs'
import { DifficultyPill, StatusPill, TypePill } from '@/components/ui/Pills'
import { SkeletonList } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { formatDate } from '@/utils/format'

const STATUSES: { id: string; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'in-review', label: 'In review' },
  { id: 'merged', label: 'Merged' },
  { id: 'closed', label: 'Closed' },
]

export default function AdminContributions() {
  const { data: contributions = [], isLoading, isError, refetch } = useAdminContributions()
  const [status, setStatus] = useState('all')
  const [projectId, setProjectId] = useState('all')

  const projects = useMemo(() => {
    const map = new Map<string, string>()
    contributions.forEach((item) => map.set(item.projectId, item.projectName))
    return Array.from(map.entries())
  }, [contributions])

  const visible = contributions.filter(
    (item) =>
      (status === 'all' || item.prStatus === status) && (projectId === 'all' || item.projectId === projectId),
  )

  const notify = (message: string) => toast.success(message)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-ink">
            <ListChecks className="size-5 text-brand-bright" aria-hidden />
            Contributions
          </h1>
          <p className="mt-1 font-mono text-xs text-dim">
            {visible.length} of {contributions.length} records · review and classification queue
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl ariaLabel="Filter by status" items={STATUSES} value={status} onChange={setStatus} />
          <Select
            aria-label="Filter by project"
            className="h-9 w-auto py-1 text-xs"
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
          >
            <option value="all">All projects</option>
            {projects.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading ? (
        <SkeletonList count={6} />
      ) : isError ? (
        <ErrorState title="Unable to load contributions" onRetry={() => void refetch()} />
      ) : visible.length === 0 ? (
        <EmptyState title="No contributions in this view." description="Change the filters to see other records." />
      ) : (
        <ul className="space-y-3">
          {visible.map((contribution) => (
            <li key={contribution.id} className="rounded-[14px] border border-line bg-coal/80 p-4 transition hover:border-brand/35 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-dim">
                      {contribution.projectName}
                    </span>
                    <TypePill type={contribution.contributionType} />
                    <DifficultyPill difficulty={contribution.difficulty} />
                    <StatusPill status={contribution.prStatus} />
                    <StatusPill status={contribution.reviewStatus} />
                  </div>

                  <h2 className="mt-2 text-[15px] font-semibold text-ink">
                    <a
                      href={contribution.pullRequestUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 hover:text-mint"
                    >
                      PR #{contribution.pullRequestNumber} · {contribution.title}
                      <ExternalLink className="size-3" aria-hidden />
                    </a>
                  </h2>

                  <p className="mt-1 line-clamp-2 text-sm text-muted">{contribution.summary}</p>

                  <p className="mt-2 font-mono text-[11.5px] text-dim">
                    @{contribution.author.username} · submitted {formatDate(contribution.submittedAt)}
                    {contribution.mergedAt ? ` · merged ${formatDate(contribution.mergedAt)}` : ''}
                  </p>
                </div>

                <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
                  <span className="font-mono text-lg font-bold tabular text-mint">
                    {contribution.xpAwarded !== null ? `+${contribution.xpAwarded} XP` : 'XP pending'}
                  </span>

                  {contribution.prStatus === 'merged' && contribution.xpAwarded === null ? (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        icon={<CheckCircle2 className="size-3.5" aria-hidden />}
                        onClick={() => notify(`Awarded XP for PR #${contribution.pullRequestNumber}`)}
                      >
                        Classify
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        icon={<XCircle className="size-3.5" aria-hidden />}
                        onClick={() => notify(`Rejected PR #${contribution.pullRequestNumber}`)}
                      >
                        Reject
                      </Button>
                    </div>
                  ) : (
                    <span className="font-mono text-[11px] text-dim">
                      review: {contribution.reviewStatus.replace('-', ' ')}
                    </span>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <p className="font-mono text-[11px] text-dim">
        // TODO: Connect admin CRUD API · PATCH /admin/contributions/:id/status
      </p>
    </div>
  )
}
