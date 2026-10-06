import { useState } from 'react'
import { ExternalLink, GitFork, RefreshCw, Star, Webhook } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getContributionStatus, getRepositories } from '@/services/github.service'
import { INTEGRATION_PIPELINE } from '@/data/mock/github'
import { Panel } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Field'
import { Skeleton, SkeletonList } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'
import { SITE_CONFIG } from '@/config/site'
import { formatCompact, relativeTime } from '@/utils/format'
import { cn } from '@/utils/cn'

const DEMO_PR = 419

export default function AdminGithub() {
  const [prNumber, setPrNumber] = useState(String(DEMO_PR))

  const { data: repos = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'github', 'repos'],
    queryFn: getRepositories,
  })

  const { data: verification, isFetching } = useQuery({
    queryKey: ['admin', 'github', 'verification', prNumber],
    queryFn: () => getContributionStatus(Number(prNumber)),
    enabled: prNumber.length > 0,
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-ink">
            <Webhook className="size-5 text-brand-bright" aria-hidden />
            GitHub Integration
          </h1>
          <p className="mt-1 font-mono text-xs text-dim">
            App → webhook → analysis → classification → XP · currently in mock mode
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          icon={<RefreshCw className="size-4" aria-hidden />}
          onClick={() => {
            void refetch()
            toast.success('Repository metadata refreshed')
          }}
        >
          Sync repositories
        </Button>
      </div>

      <Panel className="border-amber/30 p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-amber">connection status</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            { label: 'Webhook endpoint', value: `${SITE_CONFIG.shortName} webhook: not connected`, tone: 'text-amber' },
            { label: 'App installation', value: '0 repositories authorised', tone: 'text-amber' },
            { label: 'Event processing', value: 'simulated from mock payloads', tone: 'text-mint' },
          ].map((item) => (
            <div key={item.label} className="rounded-lg border border-line bg-white/[0.03] p-3">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-dim">{item.label}</p>
              <p className={cn('mt-1.5 font-mono text-[12.5px]', item.tone)}>{item.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 font-mono text-[11px] leading-relaxed text-dim">
          // TODO: Connect GitHub webhook data — POST /api/github/webhook receives pull_request events,
          // analyses the diff and updates contribution verification.
        </p>
      </Panel>

      <section aria-labelledby="pipeline-heading">
        <h2 id="pipeline-heading" className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-dim">
          processing pipeline
        </h2>
        <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {INTEGRATION_PIPELINE.map((stage, index) => (
            <li key={stage.id} className="rounded-xl border border-line bg-coal/70 p-4">
              <span className="font-mono text-[11px] text-brand-bright">{String(index + 1).padStart(2, '0')}</span>
              <p className="mt-1.5 text-sm font-semibold text-ink">{stage.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-muted">{stage.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
        <section aria-labelledby="repos-heading">
          <h2 id="repos-heading" className="mb-3 font-mono text-[11px] uppercase tracking-[0.24em] text-dim">
            watched repositories
          </h2>

          {isLoading ? (
            <SkeletonList count={4} />
          ) : isError ? (
            <ErrorState title="Unable to load repositories" onRetry={() => void refetch()} />
          ) : (
            <Panel className="overflow-hidden">
              <ul>
                {repos.map((repo) => (
                  <li
                    key={repo.id}
                    className="grid gap-3 border-b border-line px-4 py-4 transition last:border-0 hover:bg-white/[0.02] sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <a
                        href={repo.htmlUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink hover:text-mint"
                      >
                        {repo.fullName}
                        <ExternalLink className="size-3" aria-hidden />
                      </a>
                      <p className="mt-1 line-clamp-1 text-xs text-muted">{repo.description}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 font-mono text-[11px] text-dim">
                        <span className="inline-flex items-center gap-1">
                          <Star className="size-3 text-amber" aria-hidden />
                          {formatCompact(repo.stargazersCount)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <GitFork className="size-3 text-sky" aria-hidden />
                          {formatCompact(repo.forksCount)}
                        </span>
                        <span>{repo.openIssuesCount} open issues</span>
                        <span>{repo.language}</span>
                        <span>pushed {relativeTime(repo.pushedAt)}</span>
                      </div>
                    </div>

                    <span className="justify-self-start rounded-md border border-brand/40 bg-brand/12 px-2 py-0.5 font-mono text-[10.5px] uppercase tracking-wider text-mint sm:justify-self-end">
                      watching
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </section>

        <aside className="space-y-5">
          <Panel className="p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">verification lookup</p>
            <p className="mt-2 text-sm text-muted">
              Inspect how the backend would classify a pull request before scoring it.
            </p>

            <form
              className="mt-4 flex gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                toast.success(`Re-analysed PR #${prNumber}`)
              }}
            >
              <label className="flex-1">
                <span className="sr-only">Pull request number</span>
                <Input
                  value={prNumber}
                  onChange={(event) => setPrNumber(event.target.value.replace(/\D/g, ''))}
                  inputMode="numeric"
                  placeholder="419"
                  className="font-mono"
                />
              </label>
              <Button type="submit" size="md" loading={isFetching}>
                Analyse
              </Button>
            </form>

            {verification ? (
              <div className="mt-4 space-y-2 rounded-lg border border-line bg-white/[0.03] p-3 font-mono text-[12px]">
                <p className="flex justify-between gap-3">
                  <span className="text-dim">status</span>
                  <span
                    className={
                      verification.status === 'verified'
                        ? 'text-mint'
                        : verification.status === 'review-pending'
                          ? 'text-amber'
                          : 'text-muted'
                    }
                  >
                    {verification.status}
                  </span>
                </p>
                <p className="flex justify-between gap-3">
                  <span className="text-dim">classification</span>
                  <span className="text-muted">{verification.classification ?? '—'}</span>
                </p>
                <p className="flex justify-between gap-3">
                  <span className="text-dim">suggested xp</span>
                  <span className="text-mint">{verification.suggestedXp ?? '—'}</span>
                </p>
                <p className="flex justify-between gap-3">
                  <span className="text-dim">updated</span>
                  <span className="text-muted">{relativeTime(verification.updatedAt)}</span>
                </p>
                {verification.notes ? (
                  <p className="border-t border-line pt-2 text-muted">{verification.notes}</p>
                ) : null}
              </div>
            ) : (
              <Skeleton className="mt-4 h-24" />
            )}
          </Panel>

          <Panel className="p-5">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">event payload preview</p>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-line bg-void/70 p-3 font-mono text-[11.5px] leading-relaxed text-muted">
{`{
  "action": "closed",
  "pull_request": {
    "number": ${prNumber || '419'},
    "merged": true,
    "user": "dev_kiran"
  },
  "repository": "codeflow"
}`}
            </pre>
            <p className="mt-3 font-mono text-[11px] text-dim">// TODO: Connect GitHub webhook data</p>
          </Panel>
        </aside>
      </div>
    </div>
  )
}
