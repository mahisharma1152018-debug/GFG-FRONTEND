import { motion } from 'framer-motion'
import { EVENT_STATS } from '@/config/site'
import { Container } from '@/components/ui/Panel'
import { Stat } from '@/components/ui/Stat'

/**
 * Event statistics. Numbers come from SITE_CONFIG so the backend can later
 * drive them without touching this component.
 */
export function EventStats() {
  return (
    <section aria-label="Event statistics" className="relative border-y border-line bg-pitch/60">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" aria-hidden />
      <Container className="relative py-12 sm:py-14">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {EVENT_STATS.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Stat value={stat.value} suffix={stat.suffix} label={stat.label} hint={stat.hint} align="center" />
            </motion.div>
          ))}
        </div>

        <p className="mt-10 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-dim">
          STATUS: <span className="text-brand-bright">ACCEPTING CONTRIBUTIONS</span> · OPEN_SOURCE_MODE: ON
        </p>
      </Container>
    </section>
  )
}
