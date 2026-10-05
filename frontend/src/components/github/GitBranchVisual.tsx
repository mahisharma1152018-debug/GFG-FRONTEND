import { motion } from 'framer-motion'
import type { Variants } from 'framer-motion'

/**
 * Animated git branch / commit graph.
 *
 * Three branches diverge, carry commits and merge back into main — the visual
 * metaphor for the whole competition. Pure SVG: no raster assets, no faces.
 */
export function GitBranchVisual({ className }: { className?: string }) {
  const mainCommits = [40, 120, 200, 280]
  const featureCommits = [90, 150, 210]
  const fixCommits = [130, 190]

  const draw: Variants = {
    hidden: { pathLength: 0, opacity: 0 },
    show: (delay: number) => ({
      pathLength: 1,
      opacity: 1,
      transition: { pathLength: { duration: 1.6, delay, ease: 'easeInOut' }, opacity: { duration: 0.3, delay } },
    }),
  }

  return (
    <div className={className}>
      <svg
        viewBox="0 0 520 320"
        className="h-auto w-full"
        role="img"
        aria-label="Animated git branch graph showing feature branches merging into main"
      >
        <defs>
          <linearGradient id="gbf-main" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22C55E" />
            <stop offset="100%" stopColor="#2F8D46" />
          </linearGradient>
          <linearGradient id="gbf-side" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#86EFAC" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>

        {/* main branch */}
        <motion.path
          d="M40 40 L40 280"
          stroke="url(#gbf-main)"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          variants={draw}
          custom={0}
          initial="hidden"
          animate="show"
        />

        {/* feature branch: diverges at 120, merges back at 240 */}
        <motion.path
          d="M40 120 C 40 150, 120 130, 150 150 C 190 175, 200 235, 240 240"
          stroke="url(#gbf-side)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          variants={draw}
          custom={0.35}
          initial="hidden"
          animate="show"
        />

        {/* hotfix branch */}
        <motion.path
          d="M40 200 C 60 215, 90 195, 120 130"
          stroke="#FBBF24"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          opacity={0.85}
          variants={draw}
          custom={0.6}
          initial="hidden"
          animate="show"
        />

        {/* commit nodes — main */}
        {mainCommits.map((y, index) => (
          <motion.g
            key={`main-${y}`}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + index * 0.28, duration: 0.35 }}
          >
            <circle cx="40" cy={y} r="7" fill="#050805" stroke="#22C55E" strokeWidth="2.5" />
            <circle cx="40" cy={y} r="2.5" fill="#22C55E" />
          </motion.g>
        ))}

        {/* feature commits */}
        {featureCommits.map((y, index) => (
          <motion.g
            key={`feat-${y}`}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + index * 0.3, duration: 0.35 }}
          >
            <circle cx={150 + index * 26} cy={y} r="6" fill="#050805" stroke="#86EFAC" strokeWidth="2.5" />
          </motion.g>
        ))}

        {/* fix commits */}
        {fixCommits.map((y, index) => (
          <motion.g
            key={`fix-${y}`}
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.1 + index * 0.28, duration: 0.35 }}
          >
            <circle cx={100 + index * 20} cy={y} r="6" fill="#050805" stroke="#FBBF24" strokeWidth="2.5" />
          </motion.g>
        ))}

        {/* merge marker */}
        <motion.g
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.7, duration: 0.5 }}
        >
          <circle cx="40" cy="240" r="9" fill="#050805" stroke="#22C55E" strokeWidth="3" />
          <path d="M36 240 l3 3 l6 -6" stroke="#050805" strokeWidth="2.4" fill="none" strokeLinecap="round" />
        </motion.g>

        {/* labels */}
        <motion.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.9, duration: 0.6 }}
          fontFamily="JetBrains Mono, monospace"
          fontSize="11"
        >
          <text x="60" y="34" fill="#6B7280">
            main
          </text>
          <text x="196" y="146" fill="#86EFAC">
            feat/new-feature
          </text>
          <text x="128" y="205" fill="#FBBF24">
            fix/token-refresh
          </text>
          <text x="60" y="266" fill="#22C55E">
            merged → +50 XP
          </text>
        </motion.g>
      </svg>
    </div>
  )
}
