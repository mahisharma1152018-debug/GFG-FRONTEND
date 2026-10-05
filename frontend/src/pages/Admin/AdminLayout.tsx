import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Boxes,
  FileText,
  Gauge,
  LayoutDashboard,
  ListChecks,
  Settings,
  Trophy,
  Users,
  Webhook,
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { Logo } from '@/components/ui/Logo'
import { cn } from '@/utils/cn'

const ADMIN_NAV = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/projects', label: 'Projects', icon: Boxes, end: false },
  { to: '/admin/problem-statements', label: 'Problem Statements', icon: FileText, end: false },
  { to: '/admin/participants', label: 'Participants', icon: Users, end: false },
  { to: '/admin/contributions', label: 'Contributions', icon: ListChecks, end: false },
  { to: '/admin/scoring', label: 'Scoring Rules', icon: Gauge, end: false },
  { to: '/admin/github', label: 'GitHub Integration', icon: Webhook, end: false },
  { to: '/admin/settings', label: 'Settings', icon: Settings, end: false },
]

/** Admin console shell: sticky sidebar on desktop, scrollable tabs on mobile. */
export default function AdminLayout() {
  useDocumentTitle('Admin')
  const { user } = useAuth()

  return (
    <div className="border-b border-line bg-pitch/50">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:gap-8 lg:px-8">
        {/* sidebar */}
        <aside className="lg:w-64 lg:shrink-0">
          <div className="hidden lg:block">
            <Logo />
            <p className="mt-4 rounded-lg border border-line bg-coal/70 px-3 py-2 font-mono text-[11px] leading-relaxed text-dim">
              signed in as
              <br />
              <span className="text-mint">@{user?.username ?? 'admin'}</span> · {user?.role ?? 'admin'}
            </p>
          </div>

          <nav
            aria-label="Admin sections"
            className="no-scrollbar -mx-4 mt-4 flex gap-1.5 overflow-x-auto px-4 lg:mx-0 lg:mt-6 lg:flex-col lg:overflow-visible lg:px-0"
          >
            {ADMIN_NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition',
                    isActive
                      ? 'border border-brand/40 bg-brand/12 text-mint'
                      : 'border border-transparent text-muted hover:bg-white/5 hover:text-ink',
                  )
                }
              >
                <item.icon className="size-4 shrink-0" aria-hidden />
                {item.label}
              </NavLink>
            ))}

            <NavLink
              to="/leaderboard"
              className="flex shrink-0 items-center gap-2.5 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-white/5 hover:text-ink lg:mt-4 lg:border-t lg:pt-4"
            >
              <Trophy className="size-4 shrink-0" aria-hidden />
              Public leaderboard
            </NavLink>
          </nav>
        </aside>

        {/* content */}
        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-brand-bright/80">
                // admin console
              </p>
              <p className="mt-1 text-xs text-dim">
                Projects, problem statements, scoring and moderation — all served through the admin API layer.
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 font-mono text-xs text-muted transition hover:border-brand/45 hover:text-mint"
            >
              <ArrowLeft className="size-3.5" aria-hidden />
              back to site
            </Link>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  )
}
