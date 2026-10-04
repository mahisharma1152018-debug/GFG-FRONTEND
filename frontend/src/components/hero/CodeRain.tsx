import { useMemo } from 'react'
import { motion } from 'framer-motion'

const FRAGMENTS = [
  '$ git push origin feature/new-feature',
  '> contribution.accepted()',
  'OPEN_SOURCE_MODE: ON',
  '+++ CONTRIBUTION DETECTED +++',
  'STATUS: BUILDING',
  '$ git commit -m "fix: resolve #412"',
  'review → approved',
  'xp.award(50)',
  'pr.merge() → leaderboard.update()',
  'class Hero extends Component {}',
]

/**
 * Very low-contrast drifting code fragments behind the hero.
 * Deliberately dim so it reads as texture, never as content.
 */
export function CodeRain({ className }: { className?: string }) {
  const rows = useMemo(
    () =>
      Array.from({ length: 7 }).map((_, index) => ({
        id: index,
        text: Array.from({ length: 3 })
          .map((__, piece) => FRAGMENTS[(index * 3 + piece) % FRAGMENTS.length])
          .join('        '),
        left: (index * 13) % 40,
        duration: 46 + index * 7,
        delay: index * 3,
      })),
    [],
  )

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ''}`} aria-hidden>
      <div className="absolute inset-0 bg-grid opacity-70" />
      <div className="absolute -top-32 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-brand/12 blur-[130px]" />

      {rows.map((row) => (
        <motion.div
          key={row.id}
          className="absolute whitespace-nowrap font-mono text-[12px] text-brand-bright/[0.07]"
          style={{ top: `${6 + row.id * 13}%`, left: `${row.left}%` }}
          initial={{ x: 0, opacity: 0 }}
          animate={{ x: [0, -60, 0], opacity: [0.35, 0.7, 0.35] }}
          transition={{
            duration: row.duration,
            delay: row.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {row.text}
        </motion.div>
      ))}
    </div>
  )
}
