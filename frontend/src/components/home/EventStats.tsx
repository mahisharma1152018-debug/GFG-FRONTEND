import { motion } from 'framer-motion'
import { getEventStatusLabel } from '@/config/site'
import { useEventStats } from '@/hooks/useEventStats'
import { isBackendConfigured } from '@/services/api'
import { Container } from '@/components/ui/Panel'
import { Stat } from '@/components/ui/Stat'

/**
 * Event statistics. Numbers come from SITE_CONFIG so the backend can later
 * drive them without touching this component.
 */
export function EventStats() {
  const { data = [], isLoading } = useEventStats()
  const backendConfigured = isBackendConfigured()
  const stats = data.length ? data : Array.from({ length: 4 }, (_, index) => ({ id: String(index), label: '—', value: 0, suffix: '', hint: '' }))

  return (
    <section aria-label="Event statistics" className="relative border-y border-line bg-pitch/60">
      <div className="pointer-events-none absolute inset-0 bg-grid opacity-40" aria-hidden />
      <Container className="relative py-12 sm:py-14">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
            >
              <Stat value={isLoading ? 0 : stat.value} suffix={isLoading ? "" : stat.suffix} label={isLoading ? "Loading" : stat.label} hint={isLoading ? "" : stat.hint} align="center" />
            </motion.div>
          ))}
        </div>

        <p className="mt-10 text-center font-mono text-[11px] uppercase tracking-[0.3em] text-dim">
          STATUS: <span className="text-brand-bright">{backendConfigured ? getEventStatusLabel() : 'DEMO SNAPSHOT'}</span> · INDIVIDUAL_MODE: ON
        </p>
      </Container>
    </section>
  )
}
