import { useEffect, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'framer-motion'
import { LogOut, Menu, Search, ShieldCheck, User, X } from 'lucide-react'
import { GithubIcon } from '@/components/ui/BrandIcons'
import { NAV_ITEMS, SITE_CONFIG } from '@/config/site'
import { useAuth } from '@/contexts/AuthContext'
import { Logo } from '@/components/ui/Logo'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/utils/cn'

/**
 * Floating global navigation bar.
 * Desktop: pill-shaped floating bar with rounded corners over the scene.
 * Mobile: animated sheet drawer.
 */
export function Navbar({ onSearchOpen }: { onSearchOpen: () => void }) {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()
  const { isAuthenticated, user, role, logout } = useAuth()

  useMotionValueEvent(scrollY, 'change', (latest) => {
    const previous = scrollY.getPrevious() ?? 0
    setScrolled(latest > 12)
    setHidden(latest > 320 && latest > previous && !mobileOpen)
  })

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        onSearchOpen()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onSearchOpen])

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        hidden && '-translate-y-full',
      )}
    >
      {/* Floating nav container */}
      <div className="mx-auto mt-3 flex h-14 w-[94%] max-w-[1560px] items-center gap-2 rounded-xl px-2.5 sm:gap-3 sm:px-5"
        style={{
          background: scrolled
            ? 'rgba(10,20,31,0.92)'
            : 'rgba(10,20,31,0.82)',
          border: '1px solid rgba(45,212,191,0.18)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <Logo />

        <nav aria-label="Primary" className="ml-2 hidden items-center gap-0 xl:flex">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'relative px-3 py-2 text-[13px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[#2EE59D]/50 focus-visible:rounded-md',
                  isActive
                    ? 'text-[#2EE59D]'
                    : 'text-[#9FB0C3] hover:text-white',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive ? (
                    <motion.span
                      layoutId="nav-active"
                      aria-hidden
                      className="absolute inset-x-3 -bottom-0.5 h-px"
                      style={{ background: '#2EE59D' }}
                    />
                  ) : null}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {/* Search */}
          <button
            type="button"
            onClick={onSearchOpen}
            className="hidden h-8 items-center gap-2 rounded-lg px-3 text-sm transition hover:text-white md:flex"
            style={{
              background: 'rgba(13,27,38,0.7)',
              border: '1px solid rgba(45,212,191,0.15)',
              color: '#9FB0C3',
            }}
            aria-label="Open search"
          >
            <Search className="size-3.5" aria-hidden />
            <span>Search</span>
            <kbd
              className="ml-1 rounded px-1.5 py-px font-mono text-[10px]"
              style={{
                border: '1px solid rgba(45,212,191,0.2)',
                background: 'rgba(255,255,255,0.04)',
                color: '#5A7083',
              }}
            >
              Ctrl K
            </kbd>
          </button>

          {/* GitHub */}
          <a
            href={SITE_CONFIG.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub organization"
            className="grid size-8 place-items-center rounded-lg transition hover:text-[#2EE59D]"
            style={{
              border: '1px solid rgba(45,212,191,0.2)',
              background: 'rgba(13,27,38,0.5)',
              color: '#9FB0C3',
            }}
          >
            <GithubIcon className="size-4" />
          </a>

          {isAuthenticated && user ? (
            <>
              <Link
                to={role === 'admin' ? '/admin' : '/dashboard'}
                className="hidden h-8 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition sm:flex"
                style={{
                  background: '#2EE59D',
                  color: '#050B14',
                }}
              >
                {role === 'admin' ? (
                  <ShieldCheck className="size-3.5" aria-hidden />
                ) : (
                  <User className="size-3.5" aria-hidden />
                )}
                {role === 'admin' ? 'Admin' : 'My Progress'}
              </Link>
              <div className="group relative hidden sm:block">
                <button
                  type="button"
                  className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 transition"
                  style={{
                    border: '1px solid rgba(45,212,191,0.2)',
                    background: 'rgba(13,27,38,0.5)',
                  }}
                  aria-label={`Account menu for ${user.username}`}
                >
                  <Avatar name={user.name} username={user.username} size="sm" />
                  <span className="hidden font-mono text-xs text-[#9FB0C3] 2xl:inline">
                    @{user.username}
                  </span>
                </button>
                <div
                  className="invisible absolute right-0 top-full w-52 translate-y-1 rounded-xl p-1.5 opacity-0 shadow-2xl transition group-hover:visible group-hover:translate-y-1 group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100"
                  style={{
                    background: '#0A141F',
                    border: '1px solid rgba(45,212,191,0.18)',
                  }}
                >
                  <Link
                    to={`/profile/${user.username}`}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#9FB0C3] transition hover:bg-white/5 hover:text-white"
                  >
                    <User className="size-4" aria-hidden /> Profile
                  </Link>
                  <Link
                    to={role === 'admin' ? '/admin' : '/dashboard'}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#9FB0C3] transition hover:bg-white/5 hover:text-white"
                  >
                    <ShieldCheck className="size-4" aria-hidden />
                    {role === 'admin' ? 'Admin panel' : 'Dashboard'}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      void logout()
                      navigate('/')
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#9FB0C3] transition hover:bg-white/5 hover:text-rose"
                  >
                    <LogOut className="size-4" aria-hidden /> Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="hidden h-8 items-center gap-2 rounded-lg px-3.5 text-sm font-semibold transition sm:flex"
              style={{
                background: '#2EE59D',
                color: '#050B14',
              }}
            >
              <User className="size-3.5" aria-hidden />
              My Progress
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="grid size-8 place-items-center rounded-lg transition xl:hidden"
            style={{
              border: '1px solid rgba(45,212,191,0.2)',
              color: 'white',
            }}
          >
            {mobileOpen ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden xl:hidden"
            style={{
              background: 'rgba(10,20,31,0.97)',
              borderBottom: '1px solid rgba(45,212,191,0.15)',
              backdropFilter: 'blur(16px)',
            }}
          >
            <nav aria-label="Mobile" className="flex flex-col gap-1 px-4 py-4 sm:px-6">
              {NAV_ITEMS.map((item, index) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 * index, duration: 0.25 }}
                >
                  <NavLink
                    to={item.to}
                    end={item.to === '/'}
                    onClick={() => setMobileOpen(false)}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between rounded-lg px-3 py-3 text-base font-medium transition',
                        isActive
                          ? 'text-[#2EE59D]'
                          : 'text-[#9FB0C3] hover:text-white',
                      )
                    }
                    style={({ isActive }) =>
                      isActive
                        ? { background: 'rgba(46,229,157,0.1)' }
                        : {}
                    }
                  >
                    {item.label}
                    <span className="font-mono text-[10px] text-[#5A7083]">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </NavLink>
                </motion.div>
              ))}

              <div className="mt-3 flex flex-col gap-2 border-t pt-4" style={{ borderColor: 'rgba(45,212,191,0.15)' }}>
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false)
                    onSearchOpen()
                  }}
                  className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-[#9FB0C3]"
                  style={{ border: '1px solid rgba(45,212,191,0.15)' }}
                >
                  Search anything
                  <kbd
                    className="rounded px-1.5 py-px font-mono text-[10px]"
                    style={{
                      border: '1px solid rgba(45,212,191,0.2)',
                      background: 'rgba(255,255,255,0.04)',
                      color: '#5A7083',
                    }}
                  >
                    Ctrl K
                  </kbd>
                </button>
                <Link
                  to={isAuthenticated && role === 'admin' ? '/admin' : '/dashboard'}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-center text-sm font-semibold"
                  style={{ background: '#2EE59D', color: '#050B14' }}
                >
                  {isAuthenticated && role === 'admin' ? 'Admin Panel' : 'My Progress'}
                </Link>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  )
}
