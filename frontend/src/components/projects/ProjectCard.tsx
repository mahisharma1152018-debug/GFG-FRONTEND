import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowUpRight, Star, Users } from 'lucide-react'
import { GithubIcon } from '@/components/ui/BrandIcons'
import type { Project } from '@/types'
import { DifficultyPill, StatusPill, Tag } from '@/components/ui/Pills'
import { formatCompact, range } from '@/utils/format'
import { cn } from '@/utils/cn'

/**
 * Project registry card.
 * Everything rendered comes from the Project contract — safe to swap for the API.
 */
export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const slotsPct = project.slotsTotal > 0 ? Math.round((project.slotsAvailable / project.slotsTotal) * 100) : 0

  return (
    <motion.article
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: Math.min(index, 5) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex h-full flex-col overflow-hidden rounded-[14px] border border-line bg-coal/80 p-5 transition-all duration-200 hover:-translate-y-1 hover:border-brand/40 hover:shadow-[0_28px_60px_-40px_rgb(34_197_94_/_0.7)]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-brand/50 to-transparent opacity-0 transition group-hover:opacity-100"
      />

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-dim">{project.category}</p>
          <h3 className="mt-1.5 truncate text-xl font-bold tracking-tight text-ink">{project.name}</h3>
        </div>
        <StatusPill status={project.status} />
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted">{project.tagline}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <DifficultyPill difficulty={project.difficulty} />
        <span className="inline-flex items-center gap-1 rounded-md border border-line bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] text-muted">
          <Star className="size-3 text-amber" aria-hidden />
          {formatCompact(project.stars)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-md border border-line bg-white/[0.03] px-2 py-0.5 font-mono text-[11px] text-muted">
          <Users className="size-3 text-sky" aria-hidden />
          {formatCompact(project.forks)}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {project.technologies.slice(0, 4).map((tech) => (
          <Tag key={tech}>{tech}</Tag>
        ))}
        {project.technologies.length > 4 ? (
          <Tag className="text-dim">+{project.technologies.length - 4}</Tag>
        ) : null}
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-dim">Open issues</dt>
          <dd className="mt-1 font-mono text-lg font-bold tabular text-ink">{project.openIssues}</dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-dim">Slots</dt>
          <dd className="mt-1 font-mono text-lg font-bold tabular text-ink">
            {project.slotsAvailable}
            <span className="text-xs font-normal text-dim">/{project.slotsTotal}</span>
          </dd>
        </div>
        <div>
          <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-dim">Potential</dt>
          <dd className="mt-1 font-mono text-lg font-bold tabular text-mint">
            {range(project.potentialXpMin, project.potentialXpMax)}
          </dd>
        </div>
      </dl>

      <div className="mt-3">
        <div className="h-1.5 overflow-hidden rounded-full border border-line bg-white/[0.03]">
          <div
            className={cn('h-full rounded-full bg-gradient-to-r from-brand to-brand-bright')}
            style={{ width: `${Math.max(6, slotsPct)}%` }}
          />
        </div>
        <p className="mt-1.5 font-mono text-[10.5px] text-dim">
          {project.slotsAvailable > 0
            ? `${project.slotsAvailable} contribution slots open`
            : 'All slots filled for this project'}
        </p>
      </div>

      <div className="mt-5 flex items-center gap-2 pt-1">
        <Link
          to={`/projects/${project.slug}`}
          className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-brand/12 px-3 text-[13px] font-semibold text-mint transition group-hover:bg-brand group-hover:text-void"
        >
          View Project
          <ArrowUpRight className="size-3.5" aria-hidden />
        </Link>
        <a
          href={project.repositoryUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Open ${project.name} GitHub repository`}
          className="grid size-9 place-items-center rounded-lg border border-line text-muted transition hover:border-brand/50 hover:text-mint"
        >
          <GithubIcon className="size-4" />
        </a>
      </div>
    </motion.article>
  )
}
