import { Activity, Boxes, GitMerge, Trophy, Users, Zap } from 'lucide-react'
import { useAnalytics } from '@/hooks/useAdmin'
import { Panel } from '@/components/ui/Panel'
import { Metric } from '@/components/ui/Stat'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import {
  ContributionsOverTime,
  DifficultyDistribution,
  ProjectActivity,
  XpDistribution,
} from '@/components/charts/AnalyticsCharts'

export default function AdminOverview() {
  const { data, isLoading, isError, refetch } = useAnalytics()

  if (isError) {
    return <ErrorState title="Unable to load analytics" onRetry={() => void refetch()} />
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-[14px]" />)
        ) : data ? (
          <>
            <Metric label="Total participants" value={data.totalParticipants.toLocaleString('en-US')} delta="+18 today" icon={<Users className="size-4" />} />
            <Metric label="Active contributors" value={data.activeContributors.toLocaleString('en-US')} delta="last 7 days" icon={<Activity className="size-4" />} />
            <Metric label="Total projects" value={data.totalProjects} delta="registry" icon={<Boxes className="size-4" />} />
            <Metric label="Open issues" value={data.openIssues} delta="awaiting PRs" icon={<Zap className="size-4" />} />
            <Metric label="PRs submitted" value={data.pullRequestsSubmitted} delta="all repositories" icon={<Activity className="size-4" />} />
            <Metric label="PRs merged" value={data.pullRequestsMerged} delta={`${Math.round((data.pullRequestsMerged / Math.max(1, data.pullRequestsSubmitted)) * 100)}% merge rate`} icon={<GitMerge className="size-4" />} />
            <Metric label="Total XP awarded" value={data.totalXpAwarded.toLocaleString('en-US')} delta="this festival" icon={<Trophy className="size-4" />} />
            <Metric label="Avg XP / contributor" value={Math.round(data.totalXpAwarded / Math.max(1, data.activeContributors))} delta="across active users" icon={<Zap className="size-4" />} />
          </>
        ) : null}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">Contributions over time</h2>
            <span className="font-mono text-[11px] text-dim">merged PRs · XP</span>
          </div>
          {isLoading || !data ? <Skeleton className="h-64" /> : <ContributionsOverTime data={data.contributionsOverTime} />}
        </Panel>

        <Panel className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">Difficulty distribution</h2>
            <span className="font-mono text-[11px] text-dim">classified contributions</span>
          </div>
          {isLoading || !data ? <Skeleton className="h-64" /> : <DifficultyDistribution data={data.difficultyDistribution} />}
        </Panel>

        <Panel className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">Project activity</h2>
            <span className="font-mono text-[11px] text-dim">contributions per repository</span>
          </div>
          {isLoading || !data ? <Skeleton className="h-64" /> : <ProjectActivity data={data.projectActivity} />}
        </Panel>

        <Panel className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-ink">XP distribution</h2>
            <span className="font-mono text-[11px] text-dim">participants per band</span>
          </div>
          {isLoading || !data ? <Skeleton className="h-64" /> : <XpDistribution data={data.xpDistribution} />}
        </Panel>
      </div>

      <Panel className="p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">integration status</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'GitHub App', value: 'mock mode', tone: 'text-amber' },
            { label: 'Webhook receiver', value: 'not connected', tone: 'text-amber' },
            { label: 'Scoring engine', value: 'config v1.4', tone: 'text-mint' },
            { label: 'API base', value: 'mock data layer', tone: 'text-mint' },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-line bg-white/[0.03] p-3">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">{item.label}</p>
              <p className={`mt-1.5 font-mono text-sm ${item.tone}`}>{item.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 font-mono text-[11px] text-dim">
          // TODO: Connect admin analytics API · GET /admin/analytics
        </p>
      </Panel>
    </div>
  )
}
