import { useMemo, useState } from 'react'
import { Lock, Sparkles } from 'lucide-react'
import { useBadges, useUserBadges } from '@/hooks/useContributions'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Container, Panel } from '@/components/ui/Panel'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { SegmentedControl } from '@/components/ui/Tabs'
import { BadgeCard } from '@/components/badges/BadgeCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Skeleton } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { BADGE_RARITY_ORDER } from '@/data/mock/badges'
import type { BadgeRarity } from '@/types'
import { cn } from '@/utils/cn'

type Filter = 'all' | 'unlocked' | 'locked' | BadgeRarity

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unlocked', label: 'Unlocked' },
  { id: 'locked', label: 'Locked' },
  { id: 'common', label: 'Common' },
  { id: 'rare', label: 'Rare' },
  { id: 'epic', label: 'Epic' },
  { id: 'legendary', label: 'Legendary' },
]

export default function Badges() {
  useDocumentTitle('Badges')

  const [filter, setFilter] = useState<Filter>('all')
  const { data: badges = [], isLoading, isError, refetch } = useBadges()
  const { data: me } = useCurrentUser()
  const { data: userBadges } = useUserBadges(me?.id)

  const unlockedCount = (userBadges ?? badges).filter((badge) => badge.unlocked).length
  const totalXpLocked = badges.filter((badge) => !badge.unlocked).reduce((sum, badge) => sum + badge.xpReward, 0)

  const visible = useMemo(() => {
    const source = badges
    if (filter === 'all') return source
    if (filter === 'unlocked') return source.filter((badge) => badge.unlocked)
    if (filter === 'locked') return source.filter((badge) => !badge.unlocked)
    return source.filter((badge) => badge.rarity === filter)
  }, [badges, filter])

  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-pitch/60 py-14 sm:py-16">
        <div className="pointer-events-none absolute inset-0 bg-dots opacity-50" aria-hidden />
        <Container className="relative">
          <SectionHeading
            eyebrow="Achievements"
            title={
              <>
                Badges for <span className="text-brand-bright">verified work</span>
              </>
            }
            description="Unlocking a badge always maps to merged, reviewed contributions — no participation trophies."
            actions={
              <span className="inline-flex items-center gap-2 rounded-lg border border-brand/40 bg-brand/12 px-3 py-2 font-mono text-xs text-mint">
                <Sparkles className="size-3.5" aria-hidden />
                {unlockedCount}/{badges.length} unlocked
              </span>
            }
          />

          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <SegmentedControl
                  ariaLabel="Filter badges"
                  items={FILTERS}
                  value={filter}
                  onChange={(id) => setFilter(id as Filter)}
                />
                <p className="font-mono text-xs tabular text-dim" aria-live="polite">
                  {visible.length} badge{visible.length === 1 ? '' : 's'}
                </p>
              </div>

              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-52 rounded-[14px]" />
                  ))}
                </div>
              ) : isError ? (
                <ErrorState title="Unable to load badges" onRetry={() => void refetch()} />
              ) : visible.length === 0 ? (
                <EmptyState
                  title="Nothing in this filter yet."
                  description="Contributions unlock badges — merge a pull request and check back."
                  action={{ label: 'Browse projects', to: '/projects' }}
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {visible.map((badge) => (
                    <BadgeCard key={badge.id} badge={badge} />
                  ))}
                </div>
              )}
            </div>

            <aside className="space-y-5">
              <Panel className="p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">collection progress</p>
                <p className="mt-3 font-mono text-4xl font-extrabold tabular text-ink">
                  {unlockedCount}
                  <span className="text-lg text-dim">/{badges.length}</span>
                </p>
                <ProgressBar className="mt-4" value={unlockedCount} max={badges.length || 1} size="md" />
                <p className="mt-3 text-sm text-muted">
                  <span className="font-mono text-mint">{totalXpLocked}</span> XP still sitting in locked badges.
                </p>
              </Panel>

              <Panel className="p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">rarity ladder</p>
                <ul className="mt-3 space-y-2.5">
                  {BADGE_RARITY_ORDER.map((rarity) => {
                    const count = badges.filter((badge) => badge.rarity === rarity).length
                    const unlocked = badges.filter((badge) => badge.rarity === rarity && badge.unlocked).length
                    return (
                      <li key={rarity} className="flex items-center justify-between gap-3 text-sm">
                        <span className="inline-flex items-center gap-2 text-muted">
                          <Lock className={cn('size-3', unlocked > 0 && 'text-brand-bright')} aria-hidden />
                          <span className="capitalize">{rarity}</span>
                        </span>
                        <span className="font-mono text-xs tabular text-dim">
                          {unlocked}/{count}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </Panel>

              <Panel className="p-5">
                <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">how it works</p>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">
                  The backend evaluates merged pull requests, awards XP and unlocks badges automatically — artwork and
                  requirements are supplied through the badge API.
                </p>
                <p className="mt-3 font-mono text-[11px] text-dim">// TODO: Connect badge API</p>
              </Panel>
            </aside>
          </div>
        </Container>
      </section>
    </>
  )
}
