import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CornerDownLeft, FileText, Search, Trophy, User, Boxes } from 'lucide-react'
import { useProjects } from '@/hooks/useProjects'
import { useParticipants } from '@/hooks/useLeaderboard'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/utils/cn'

interface ResultItem {
  id: string
  label: string
  sublabel: string
  href: string
  kind: 'project' | 'participant' | 'page' | 'statement'
}

const STATIC_RESULTS: ResultItem[] = [
  { id: 'nav-projects', label: 'Projects', sublabel: 'Browse the problem-statement registry', href: '/projects', kind: 'page' },
  { id: 'nav-leaderboard', label: 'Leaderboard', sublabel: 'Overall and weekly standings', href: '/leaderboard', kind: 'page' },
  { id: 'nav-rules', label: 'Point Rules', sublabel: 'How XP is calculated', href: '/rules', kind: 'page' },
  { id: 'nav-badges', label: 'Badges', sublabel: 'Achievement catalogue', href: '/badges', kind: 'page' },
  { id: 'nav-dashboard', label: 'My Dashboard', sublabel: 'Progress, streaks and contributions', href: '/dashboard', kind: 'page' },
  { id: 'nav-progress', label: 'Progress Tracker', sublabel: 'Issue → fork → PR → points', href: '/progress', kind: 'page' },
  { id: 'nav-admin', label: 'Admin Panel', sublabel: 'Projects, problem statements, scoring', href: '/admin', kind: 'page' },
]

const KIND_ICON = {
  project: Boxes,
  participant: User,
  page: FileText,
  statement: Trophy,
}

/**
 * Global command palette (Ctrl/Cmd + K).
 * TODO: Switch to a single /search endpoint once the backend ships full-text search.
 */
export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const debounced = useDebounce(query, 200)
  const navigate = useNavigate()

  const { data: projects, isFetching: fetchingProjects } = useProjects(
    { search: debounced, pageSize: 6 },
    open && debounced.length > 0,
  )
  const { data: participants, isFetching: fetchingUsers } = useParticipants()

  const close = () => {
    setQuery('')
    onClose()
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }
    if (open) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const results = useMemo<ResultItem[]>(() => {
    const q = debounced.trim().toLowerCase()

    const projectItems: ResultItem[] = (projects?.items ?? []).map((project) => ({
      id: project.id,
      label: project.name,
      sublabel: project.tagline,
      href: `/projects/${project.slug}`,
      kind: 'project' as const,
    }))

    const userItems: ResultItem[] = (participants ?? [])
      .filter((user) => q && (user.username.toLowerCase().includes(q) || user.name.toLowerCase().includes(q)))
      .slice(0, 5)
      .map((user) => ({
        id: user.id,
        label: `@${user.username}`,
        sublabel: `${user.name} · ${user.totalXp} XP · rank #${user.rank}`,
        href: `/profile/${user.username}`,
        kind: 'participant' as const,
      }))

    const staticItems = STATIC_RESULTS.filter(
      (item) => !q || item.label.toLowerCase().includes(q) || item.sublabel.toLowerCase().includes(q),
    )

    return [...projectItems, ...userItems, ...staticItems].slice(0, 10)
  }, [debounced, projects, participants])

  // Only show the skeleton while there is nothing to render yet — otherwise
  // background refetches would blank out results mid-typing.
  const loading =
    (fetchingProjects && !projects) || (Boolean(debounced) && fetchingUsers && !participants)

  const go = (href: string) => {
    navigate(href)
    close()
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-void/85 px-4 pt-[12vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close()
          }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            initial={{ opacity: 0, y: -14, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-line-strong bg-coal shadow-[0_40px_90px_-50px_rgb(34_197_94_/_0.6)]"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="size-4 shrink-0 text-brand-bright" aria-hidden />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && results[0]) go(results[0].href)
                }}
                placeholder="Search projects, participants, problem statements..."
                aria-label="Search"
                className="h-13 w-full bg-transparent py-4 text-sm text-ink placeholder:text-dim outline-none"
              />
              <kbd className="hidden rounded border border-line bg-white/[0.04] px-1.5 py-px font-mono text-[10px] text-dim sm:block">
                ESC
              </kbd>
            </div>

            <div className="max-h-[52vh] overflow-y-auto p-2">
              {loading ? (
                <div className="space-y-1.5 p-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="h-11 animate-pulse rounded-lg bg-white/[0.05]" />
                  ))}
                </div>
              ) : results.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-muted">
                  No matches for <span className="font-mono text-mint">&quot;{query}&quot;</span>
                </p>
              ) : (
                results.map((item) => {
                  const Icon = KIND_ICON[item.kind]
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => go(item.href)}
                      className="group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-brand/10"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-md border border-line bg-white/[0.03] text-muted group-hover:border-brand/40 group-hover:text-mint">
                        <Icon className="size-4" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-ink">{item.label}</span>
                        <span className="block truncate text-xs text-muted">{item.sublabel}</span>
                      </span>
                      <CornerDownLeft className="size-3.5 shrink-0 text-dim opacity-0 transition group-hover:opacity-100" aria-hidden />
                    </button>
                  )
                })
              )}
            </div>

            <div className="flex items-center justify-between border-t border-line px-4 py-2.5 font-mono text-[10.5px] text-dim">
              <span>↑↓ navigate · ⏎ open</span>
              <span className={cn('text-brand-bright/70')}>gfg-hacktober://search</span>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
