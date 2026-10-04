import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { GithubIcon, InstagramIcon, LinkedinIcon } from '@/components/ui/BrandIcons'
import { NAV_ITEMS, SITE_CONFIG } from '@/config/site'
import { Logo } from '@/components/ui/Logo'
import { Container } from '@/components/ui/Panel'

const COMMUNITY = [
  { label: 'GitHub', href: SITE_CONFIG.githubUrl, icon: GithubIcon },
  { label: 'Discord', href: SITE_CONFIG.discordUrl, icon: MessageCircle },
  { label: 'Instagram', href: SITE_CONFIG.instagramUrl, icon: InstagramIcon },
  { label: 'LinkedIn', href: SITE_CONFIG.linkedinUrl, icon: LinkedinIcon },
]

export function Footer() {
  return (
    <footer
      className="relative mt-24"
      style={{
        background: '#050B14',
        borderTop: '1px solid rgba(45,212,191,0.12)',
      }}
    >
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-[0.25]" aria-hidden />
      <Container className="relative py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-4 text-sm leading-relaxed" style={{ color: '#9FB0C3' }}>
              An open-source contribution competition where every merged pull request becomes visible
              progress — XP, badges, rank and a real portfolio. {SITE_CONFIG.dates}.
            </p>
            <p
              className="mt-4 font-mono text-[11px] uppercase tracking-[0.2em]"
              style={{ color: 'rgba(46,229,157,0.6)' }}
            >
              Open Source • Community • Contribution
            </p>
          </div>

          <nav aria-label="Footer navigation">
            <h3
              className="font-mono text-[11px] uppercase tracking-[0.24em]"
              style={{ color: '#5A7083' }}
            >
              Navigate
            </h3>
            <ul className="mt-4 space-y-2.5">
              {NAV_ITEMS.map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    className="link-underline text-sm transition"
                    style={{ color: '#9FB0C3' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#2EE59D' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#9FB0C3' }}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  to="/dashboard"
                  className="link-underline text-sm transition"
                  style={{ color: '#9FB0C3' }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = '#2EE59D' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = '#9FB0C3' }}
                >
                  Dashboard
                </Link>
              </li>
            </ul>
          </nav>

          <div>
            <h3
              className="font-mono text-[11px] uppercase tracking-[0.24em]"
              style={{ color: '#5A7083' }}
            >
              Community
            </h3>
            <ul className="mt-4 space-y-2.5">
              {COMMUNITY.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline inline-flex items-center gap-2 text-sm transition"
                    style={{ color: '#9FB0C3' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = '#2EE59D' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = '#9FB0C3' }}
                  >
                    <item.icon className="size-3.5" aria-hidden />
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3
              className="font-mono text-[11px] uppercase tracking-[0.24em]"
              style={{ color: '#5A7083' }}
            >
              Event
            </h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt style={{ color: '#5A7083' }}>Window</dt>
                <dd className="font-mono" style={{ color: '#9FB0C3' }}>{SITE_CONFIG.dates}</dd>
              </div>
              <div>
                <dt style={{ color: '#5A7083' }}>Format</dt>
                <dd style={{ color: '#9FB0C3' }}>{SITE_CONFIG.venue}</dd>
              </div>
              <div>
                <dt style={{ color: '#5A7083' }}>Contact</dt>
                <dd>
                  <a
                    href={`mailto:${SITE_CONFIG.email}`}
                    className="font-mono text-xs hover:underline"
                    style={{ color: '#2EE59D' }}
                  >
                    {SITE_CONFIG.email}
                  </a>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Terminal footer decoration */}
        <div
          className="mt-12 overflow-hidden rounded-xl px-4 py-3 font-mono text-[11.5px] sm:text-xs"
          style={{
            background: 'rgba(5,11,20,0.7)',
            border: '1px solid rgba(45,212,191,0.12)',
            color: '#9FB0C3',
          }}
        >
          <p className="truncate">
            <span style={{ color: '#2EE59D' }}>❯</span> git commit -m{' '}
            <span style={{ color: '#2EE59D' }}>&quot;feat: {SITE_CONFIG.name.toLowerCase()} goes live&quot;</span>
            <span className="ml-3" style={{ color: '#5A7083' }}>1 file changed, 42 insertions(+)</span>
            <span
              className="ml-3 inline-block h-3 w-1.5 translate-y-0.5 animate-blink"
              style={{ background: '#2EE59D' }}
              aria-hidden
            />
          </p>
        </div>

        <div
          className="mt-8 flex flex-col items-start justify-between gap-3 border-t pt-6 sm:flex-row sm:items-center"
          style={{ borderColor: 'rgba(45,212,191,0.1)' }}
        >
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[11px]" style={{ color: '#5A7083' }}>
              © {new Date().getFullYear()} {SITE_CONFIG.name} · {SITE_CONFIG.chapter} · {SITE_CONFIG.edition}
            </p>
            <p className="font-mono text-[11px]" style={{ color: '#5A7083' }}>
              Student-led event platform. Not an official GeeksforGeeks product.
            </p>
          </div>
          <p className="font-mono text-[11px]" style={{ color: '#5A7083' }}>
            Built by the community, for the community{' '}
            <span style={{ color: '#2EE59D' }}>+++ CONTRIBUTION DETECTED +++</span>
          </p>
        </div>
      </Container>
    </footer>
  )
}
