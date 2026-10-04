import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheck, Sparkles } from 'lucide-react'
import { GithubIcon } from '@/components/ui/BrandIcons'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { LogoMark } from '@/components/ui/Logo'

/**
 * Route guard / Sign-in Page.
 *
 * Compact 440px max-width card aligned to the 1560px container right edge.
 * Background artwork scaled ~115% anchored object-[25%_100%] showing developer + laptop + cat on lower-left.
 * Keeps all existing authentication & maintainer demo login logic intact.
 */
export function RequireAuth({
  children,
  role = 'participant',
}: {
  children: React.ReactNode
  role?: 'participant' | 'admin'
}) {
  const { isAuthenticated, role: sessionRole, login } = useAuth()
  const [pending, setPending] = useState<'participant' | 'admin' | null>(null)

  const authorized = isAuthenticated && (role === 'participant' || sessionRole === 'admin')

  if (!authorized) {
    return (
      <div
        className="relative w-full overflow-hidden bg-[#050B14]"
        style={{
          minHeight: '100svh',
          display: 'grid',
          placeItems: 'center',
          paddingTop: 'calc(var(--nav-top) + var(--nav-h) + 24px)',
          paddingBottom: '32px',
          paddingInline: '16px',
        }}
      >
        {/* ── Background Artwork anchored so developer+cat sit left of centered card ── */}
        <picture className="pointer-events-none absolute inset-0 block h-full w-full select-none">
          <source media="(max-width: 1280px)" srcSet="/hero-bg-mobile.webp" />
          <img
            src="/hero-bg.webp"
            alt=""
            aria-hidden="true"
            width={1812}
            height={868}
            className="h-full w-full object-cover [image-rendering:pixelated]"
            style={{ objectPosition: '20% 100%' }}
          />
        </picture>

        {/* ── Radial overlay: darker behind center card, lighter at edges ── */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(5,11,20,.75) 0%, rgba(5,11,20,.35) 55%, transparent 100%)',
          }}
        />
        {/* Top band under the navbar */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-[#050B14]/85 to-transparent" />

        {/* ── Card: 440px wide, centered ── */}
        <div
          className="relative z-10 w-full rounded-2xl border border-[rgba(45,212,191,0.28)] bg-[#08121C]/20 text-center backdrop-blur-xl shadow-[0_30px_90px_-30px_rgba(0,255,157,0.22)]"
          style={{
            maxWidth: '440px',
            padding: 'clamp(24px, 4vw, 28px)',
          }}
        >
          {/* Logo Mark Tile (~56px) */}
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-mint/40 bg-mint/10 p-3 shadow-[0_0_20px_-5px_rgba(0,255,157,0.3)]">
            <LogoMark size={32} />
          </div>

          {/* Eyebrow label */}
          <p className="mt-4 font-mono text-[10.5px] uppercase tracking-[0.24em] text-mint">
            // OPEN SOURCE CONTRIBUTION
          </p>

          {/* Pixel Title */}
          <h1 className="mt-1.5 font-pixel text-[28px] font-bold tracking-wider sm:text-[30px]">
            <span className="text-ink">GEEK</span>
            <span className="text-mint">STOBER</span>
          </h1>

          {/* Subheading */}
          <p className="mx-auto mt-2 max-w-xs text-[13px] leading-relaxed text-muted">
            {role === 'admin'
              ? 'The admin console manages projects, problem statements and scoring. Sign in with a maintainer session to enter.'
              : 'Sign in to claim issues, track merged PRs and climb the leaderboard.'}
          </p>

          {/* Action Buttons — 48px tall, 12px gaps */}
          <div className="mt-5 flex flex-col gap-3">
            <Button
              fullWidth
              size="md"
              className="h-12 text-sm font-semibold"
              icon={<GithubIcon className="size-4" />}
              loading={pending === 'participant'}
              onClick={async () => {
                setPending('participant')
                await login('participant')
                setPending(null)
              }}
            >
              Continue with GitHub
            </Button>

            <Button
              fullWidth
              size="md"
              variant="outline"
              className="h-12 text-sm font-semibold"
              icon={<ShieldCheck className="size-4" aria-hidden />}
              loading={pending === 'admin'}
              onClick={async () => {
                setPending('admin')
                await login('admin')
                setPending(null)
              }}
            >
              Sign in as maintainer (demo)
            </Button>

            <Link
              to="/"
              className="mt-0.5 font-mono text-xs text-muted transition hover:text-mint"
            >
              Continue as visitor
            </Link>
          </div>

          {/* Divider */}
          <div className="my-4 border-t border-line/60" />

          {/* Feature Bullets */}
          <div className="space-y-2.5 text-left">
            <div className="flex items-start gap-2.5 text-[13px] leading-relaxed text-muted">
              <Sparkles className="mt-0.5 size-3.5 shrink-0 text-mint" aria-hidden />
              <span>
                Earn XP for merged PRs — the official <strong className="font-semibold text-ink">Geekstober</strong> table
              </span>
            </div>
            <div className="flex items-start gap-2.5 text-[13px] leading-relaxed text-muted">
              <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-mint" aria-hidden />
              <span>Your dashboard, progress tracker and badge showcase</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
