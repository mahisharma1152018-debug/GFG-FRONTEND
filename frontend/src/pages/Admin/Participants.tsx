import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users } from 'lucide-react'
import { useAdminParticipants } from '@/hooks/useAdmin'
import { useDebounce } from '@/hooks/useDebounce'
import { Panel } from '@/components/ui/Panel'
import { Avatar } from '@/components/ui/Avatar'
import { Input, Select } from '@/components/ui/Field'
import { SkeletonList } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { COLLEGES } from '@/data/mock/users'
import { getLevelInfo } from '@/services/user.service'
import { formatXp } from '@/utils/format'

export default function AdminParticipants() {
  const [search, setSearch] = useState('')
  const [college, setCollege] = useState('all')
  const debounced = useDebounce(search, 250)

  const { data: participants = [], isLoading, isError, refetch } = useAdminParticipants()

  const visible = useMemo(() => {
    const query = debounced.trim().toLowerCase()
    return participants.filter((participant) => {
      const matchesSearch =
        !query ||
        participant.username.toLowerCase().includes(query) ||
        participant.name.toLowerCase().includes(query)
      const matchesCollege = college === 'all' || participant.college === college
      return matchesSearch && matchesCollege
    })
  }, [participants, debounced, college])

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Participants</h1>
          <p className="mt-1 font-mono text-xs text-dim">
            {participants.length} registered · {visible.length} shown
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <label className="relative block">
            <span className="sr-only">Search participants</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-dim" aria-hidden />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name or handle..."
              className="h-9 w-56 pl-9 text-sm"
            />
          </label>
          <Select aria-label="Filter by college" className="h-9 w-auto py-1 text-xs" value={college} onChange={(event) => setCollege(event.target.value)}>
            <option value="all">All colleges</option>
            {COLLEGES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading ? (
        <SkeletonList count={6} />
      ) : isError ? (
        <ErrorState title="Unable to load participants" onRetry={() => void refetch()} />
      ) : visible.length === 0 ? (
        <EmptyState title="No participants match." description="Adjust the search or college filter." />
      ) : (
        <Panel className="overflow-hidden">
          <div className="hidden grid-cols-[1.5fr_1fr_110px_110px_100px_90px_120px] gap-4 border-b border-line px-5 py-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim lg:grid">
            <span>Participant</span>
            <span>College / Team</span>
            <span className="text-right">Level</span>
            <span className="text-right">XP</span>
            <span className="text-right">Merged</span>
            <span className="text-right">Rank</span>
            <span className="text-right">Profile</span>
          </div>

          <ul>
            {visible.map((participant) => {
              const level = getLevelInfo(participant)
              return (
                <li
                  key={participant.id}
                  className="grid gap-3 border-b border-line px-4 py-3.5 transition last:border-0 hover:bg-white/[0.02] lg:grid-cols-[1.5fr_1fr_110px_110px_100px_90px_120px] lg:items-center lg:gap-4 lg:px-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={participant.name} username={participant.username} size="sm" />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-ink">{participant.name}</span>
                      <span className="block truncate font-mono text-[11.5px] text-dim">@{participant.username}</span>
                    </span>
                  </div>

                  <span className="truncate text-xs text-muted">
                    {participant.college ?? '—'}
                    {participant.team ? ` · ${participant.team}` : ''}
                  </span>

                  <span className="font-mono text-xs text-muted lg:text-right">
                    L{String(level.level).padStart(2, '0')}
                  </span>
                  <span className="font-mono text-sm tabular text-mint lg:text-right">{formatXp(participant.totalXp)}</span>
                  <span className="font-mono text-sm tabular text-muted lg:text-right">{participant.mergedPullRequests}</span>
                  <span className="font-mono text-sm tabular text-muted lg:text-right">#{participant.rank}</span>

                  <span className="lg:text-right">
                    <Link
                      to={`/profile/${participant.username}`}
                      className="inline-flex items-center gap-1 font-mono text-xs text-mint hover:underline"
                    >
                      <Users className="size-3" aria-hidden />
                      view profile
                    </Link>
                  </span>
                </li>
              )
            })}
          </ul>
        </Panel>
      )}
    </div>
  )
}
