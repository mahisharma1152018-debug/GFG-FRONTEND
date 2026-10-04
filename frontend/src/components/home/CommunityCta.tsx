import { ArrowRight, Users } from 'lucide-react'
import { GithubIcon } from '@/components/ui/BrandIcons'
import { ButtonLink } from '@/components/ui/Button'
import { Container } from '@/components/ui/Panel'
import { SITE_CONFIG } from '@/config/site'
import { motion } from 'framer-motion'

/** Closing call to action before the footer. */
export function CommunityCta() {
  return (
    <section className="relative py-20 sm:py-24">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative overflow-hidden rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/[0.14] via-coal to-coal px-6 py-14 text-center sm:px-12 sm:py-16"
        >
          <div className="pointer-events-none absolute inset-0 bg-grid opacity-60" aria-hidden />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[560px] -translate-x-1/2 rounded-full bg-brand/20 blur-[100px]"
          />

          <div className="relative">
            <p className="font-mono text-[11px] uppercase tracking-[0.32em] text-brand-bright">
              open source • community • contribution
            </p>
            <h2 className="mx-auto mt-5 max-w-3xl text-balance text-3xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-4xl lg:text-5xl">
              Ready to make your first contribution?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted sm:text-lg">
              Open source isn&apos;t just about code — it&apos;s about contribution. Pick an issue this
              week, ship the fix, and watch it turn into XP, badges and rank.
            </p>

            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink
                to="/projects"
                size="lg"
                icon={<GithubIcon className="size-4" />}
                trailing={<ArrowRight className="size-4" aria-hidden />}
              >
                Find your project
              </ButtonLink>
              <ButtonLink href={SITE_CONFIG.discordUrl} target="_blank" size="lg" variant="outline" icon={<Users className="size-4" aria-hidden />}>
                Join the community
              </ButtonLink>
            </div>

            <p className="mt-8 font-mono text-[11.5px] text-dim">
              $ git commit -m <span className="text-mint">&quot;first contribution&quot;</span> →{' '}
              <span className="text-brand-bright">STATUS: BUILDING</span>
            </p>
          </div>
        </motion.div>
      </Container>
    </section>
  )
}
