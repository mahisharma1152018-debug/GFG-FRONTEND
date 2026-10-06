import { motion } from 'framer-motion'
import { ArrowRight, Webhook } from 'lucide-react'
import { GithubIcon } from '@/components/ui/BrandIcons'
import { INTEGRATION_PIPELINE } from '@/data/mock/github'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Container, Panel } from '@/components/ui/Panel'
import { TerminalWindow } from '@/components/github/TerminalWindow'
import { ButtonLink } from '@/components/ui/Button'
import { SITE_CONFIG } from '@/config/site'

const PIPELINE_LINES = [
  { kind: 'output', text: '[github-app] webhook received: pull_request.closed' },
  { kind: 'output', text: '[analysis] diff 612+/240- · 4 files · linked issue #247' },
  { kind: 'output', text: '[verification] maintainer review: approved' },
  { kind: 'accent', text: '[scoring] classification=performance tier=hard' },
  { kind: 'success', text: '[leaderboard] @dev_kiran +120 XP → rank #01' },
] as const

/** Explains the future GitHub App → webhook → scoring pipeline. */
export function GithubIntegration() {
  return (
    <section className="relative overflow-hidden border-y border-line bg-pitch/70 py-20 sm:py-24">
      <div className="pointer-events-none absolute inset-0 bg-dots opacity-40" aria-hidden />
      <Container className="relative">
        <SectionHeading
          eyebrow="GitHub integration"
          title={
            <>
              The platform listens to <span className="text-brand-bright">your merges</span>
            </>
          }
          description="A GitHub App watches the competition repositories. Every pull request flows through analysis, review and classification before XP lands on the board."
          actions={
            <ButtonLink
              href={SITE_CONFIG.githubUrl}
              target="_blank"
              variant="outline"
              icon={<GithubIcon className="size-4" />}
            >
              View on GitHub
            </ButtonLink>
          }
        />

        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <ol className="grid gap-3 sm:grid-cols-2">
            {INTEGRATION_PIPELINE.map((stage, index) => (
              <motion.li
                key={stage.id}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.07 }}
                className="group flex items-center gap-3 rounded-xl border border-line bg-coal/70 px-4 py-3.5 transition hover:border-brand/40"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-line bg-white/[0.03] font-mono text-[11px] font-bold text-brand-bright transition group-hover:border-brand/45 group-hover:bg-brand/12">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold text-ink">{stage.label}</span>
                  <span className="block truncate text-xs text-muted">{stage.detail}</span>
                </span>
                {index < INTEGRATION_PIPELINE.length - 1 ? (
                  <ArrowRight className="size-3.5 shrink-0 text-dim transition group-hover:text-mint" aria-hidden />
                ) : null}
              </motion.li>
            ))}
          </ol>

          <div className="flex flex-col gap-5">
            <TerminalWindow lines={[...PIPELINE_LINES]} typed={false} title="backend · webhook log" />
            <Panel className="p-5">
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-brand/40 bg-brand/12 text-brand-bright">
                  <Webhook className="size-4" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">Live verification, not self-reporting</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted">
                    Contributions are credited from merged pull requests — no screenshots, no manual
                    point claims, no duplicate credit.
                  </p>
                  <p className="mt-3 font-mono text-[11px] text-dim">
                    // TODO: Connect GitHub webhook data
                  </p>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </Container>
    </section>
  )
}
