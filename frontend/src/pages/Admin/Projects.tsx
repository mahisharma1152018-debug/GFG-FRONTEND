import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Archive, Boxes, Pencil, Plus } from 'lucide-react'
import { GithubIcon } from '@/components/ui/BrandIcons'
import { toast } from 'sonner'
import { useAdminProjects, useProjectMutations } from '@/hooks/useAdmin'
import { Panel } from '@/components/ui/Panel'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'
import { DifficultyPill, StatusPill } from '@/components/ui/Pills'
import { SkeletonList } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { PROJECT_CATEGORIES } from '@/data/mock/projects'
import type { Difficulty, Project, ProjectCategory, ProjectStatus } from '@/types'
import { range } from '@/utils/format'

/* ---------------------------------------------------------------- schema */

const projectSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  tagline: z.string().min(4, 'Add a one-line description'),
  description: z.string().min(20, 'Describe the repository in at least 20 characters'),
  repositoryUrl: z.string().url('Must be a valid GitHub URL'),
  adminName: z.string().min(2, 'Assign a project admin'),
  adminUsername: z.string().min(2, 'GitHub username required'),
  category: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  status: z.enum(['active', 'upcoming', 'completed', 'archived']),
  technologies: z.string().min(2, 'List at least one technology'),
  slotsTotal: z.number().int().min(1, 'At least one slot'),
  potentialXpMin: z.number().int().min(1),
  potentialXpMax: z.number().int().min(1),
  openIssues: z.number().int().min(0),
})

type ProjectForm = z.infer<typeof projectSchema>

const DEFAULTS: ProjectForm = {
  name: '',
  tagline: '',
  description: '',
  repositoryUrl: 'https://github.com/gfg-hacktober-fest/',
  adminName: '',
  adminUsername: '',
  category: 'Developer Tools',
  difficulty: 'medium',
  status: 'active',
  technologies: 'React, TypeScript',
  slotsTotal: 20,
  potentialXpMin: 10,
  potentialXpMax: 100,
  openIssues: 0,
}

/* ------------------------------------------------------------------ page */

export default function AdminProjects() {
  const { data: projects = [], isLoading, isError, refetch } = useAdminProjects()
  const mutations = useProjectMutations()

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Project | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: DEFAULTS,
  })

  const openCreate = () => {
    setEditing(null)
    reset(DEFAULTS)
    setModalOpen(true)
  }

  const openEdit = (project: Project) => {
    setEditing(project)
    reset({
      name: project.name,
      tagline: project.tagline,
      description: project.description,
      repositoryUrl: project.repositoryUrl,
      adminName: project.admin.name,
      adminUsername: project.admin.username,
      category: project.category,
      difficulty: project.difficulty,
      status: project.status,
      technologies: project.technologies.join(', '),
      slotsTotal: project.slotsTotal,
      potentialXpMin: project.potentialXpMin,
      potentialXpMax: project.potentialXpMax,
      openIssues: project.openIssues,
    })
    setModalOpen(true)
  }

  const onSubmit = handleSubmit(async (values) => {
    const payload: Partial<Project> = {
      name: values.name,
      tagline: values.tagline,
      description: values.description,
      repositoryUrl: values.repositoryUrl,
      admin: { name: values.adminName, username: values.adminUsername, githubUrl: `https://github.com/${values.adminUsername}` },
      category: values.category as ProjectCategory,
      difficulty: values.difficulty as Difficulty,
      status: values.status as ProjectStatus,
      technologies: values.technologies
        .split(',')
        .map((item: string) => item.trim())
        .filter(Boolean),
      slotsTotal: values.slotsTotal,
      slotsAvailable: values.slotsTotal,
      potentialXpMin: values.potentialXpMin,
      potentialXpMax: values.potentialXpMax,
      openIssues: values.openIssues,
    }

    try {
      if (editing) await mutations.update.mutateAsync({ id: editing.id, patch: payload })
      else await mutations.create.mutateAsync(payload)
      toast.success(editing ? 'Project updated' : 'Project created')
      setModalOpen(false)
    } catch {
      toast.error('Could not save the project')
    }
  })

  const archive = async (project: Project) => {
    try {
      await mutations.archive.mutateAsync(project.id)
      toast.success(`${project.name} archived`)
    } catch {
      toast.error('Archive failed')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Projects</h1>
          <p className="mt-1 font-mono text-xs text-dim">{projects.length} repositories in the registry</p>
        </div>
        <Button icon={<Plus className="size-4" aria-hidden />} onClick={openCreate}>
          Add Project
        </Button>
      </div>

      {isLoading ? (
        <SkeletonList count={5} />
      ) : isError ? (
        <ErrorState title="Unable to load projects" onRetry={() => void refetch()} />
      ) : projects.length === 0 ? (
        <EmptyState title="No projects yet." description="Create the first repository entry to publish problem statements." />
      ) : (
        <Panel className="overflow-hidden">
          <div className="hidden grid-cols-[1.6fr_1fr_120px_120px_150px_140px] gap-4 border-b border-line px-5 py-3 font-mono text-[10.5px] uppercase tracking-[0.16em] text-dim lg:grid">
            <span>Project</span>
            <span>Stack</span>
            <span>Difficulty</span>
            <span>Status</span>
            <span>Opportunities</span>
            <span className="text-right">Actions</span>
          </div>

          <ul>
            {projects.map((project) => (
              <li
                key={project.id}
                className="grid gap-3 border-b border-line px-4 py-4 transition last:border-0 hover:bg-white/[0.02] lg:grid-cols-[1.6fr_1fr_120px_120px_150px_140px] lg:items-center lg:gap-4 lg:px-5"
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 truncate text-sm font-semibold text-ink">
                    <Boxes className="size-3.5 shrink-0 text-brand-bright" aria-hidden />
                    {project.name}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">{project.tagline}</p>
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center gap-1 font-mono text-[11px] text-mint hover:underline"
                  >
                    <GithubIcon className="size-3" />
                    {project.repositoryUrl.replace('https://github.com/', '')}
                  </a>
                </div>

                <div className="flex flex-wrap gap-1">
                  {project.technologies.slice(0, 3).map((tech) => (
                    <span key={tech} className="rounded border border-line bg-white/[0.03] px-1.5 py-px font-mono text-[10.5px] text-muted">
                      {tech}
                    </span>
                  ))}
                </div>

                <div><DifficultyPill difficulty={project.difficulty} /></div>
                <div><StatusPill status={project.status} /></div>

                <div className="font-mono text-xs text-muted">
                  <p className="text-mint">{range(project.potentialXpMin, project.potentialXpMax)}</p>
                  <p className="text-dim">
                    {project.openIssues} issues · {project.slotsAvailable}/{project.slotsTotal} slots
                  </p>
                </div>

                <div className="flex justify-start gap-2 lg:justify-end">
                  <Button size="sm" variant="outline" icon={<Pencil className="size-3.5" aria-hidden />} onClick={() => openEdit(project)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={<Archive className="size-3.5" aria-hidden />}
                    onClick={() => void archive(project)}
                    aria-label={`Archive ${project.name}`}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        size="lg"
        title={editing ? `Edit ${editing.name}` : 'Add project'}
        description="Stored through the admin API — values feed the public registry."
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button loading={isSubmitting} onClick={() => void onSubmit()}>
              {editing ? 'Save changes' : 'Create project'}
            </Button>
          </>
        }
      >
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={(event) => void onSubmit(event)}>
          <Field label="Project name" htmlFor="p-name" error={errors.name?.message} required>
            <Input id="p-name" invalid={Boolean(errors.name)} {...register('name')} />
          </Field>

          <Field label="Repository URL" htmlFor="p-repo" error={errors.repositoryUrl?.message} required>
            <Input id="p-repo" invalid={Boolean(errors.repositoryUrl)} {...register('repositoryUrl')} />
          </Field>

          <Field label="Tagline" htmlFor="p-tagline" error={errors.tagline?.message} className="sm:col-span-2" required>
            <Input id="p-tagline" placeholder="One line that sells the repository" invalid={Boolean(errors.tagline)} {...register('tagline')} />
          </Field>

          <Field label="Description" htmlFor="p-desc" error={errors.description?.message} className="sm:col-span-2" required>
            <Textarea id="p-desc" invalid={Boolean(errors.description)} {...register('description')} />
          </Field>

          <Field label="Project admin" htmlFor="p-admin" error={errors.adminName?.message}>
            <Input id="p-admin" placeholder="Maintainer name" invalid={Boolean(errors.adminName)} {...register('adminName')} />
          </Field>

          <Field label="Admin GitHub handle" htmlFor="p-handle" error={errors.adminUsername?.message}>
            <Input id="p-handle" placeholder="username" invalid={Boolean(errors.adminUsername)} {...register('adminUsername')} />
          </Field>

          <Field label="Category" htmlFor="p-category">
            <Select id="p-category" {...register('category')}>
              {PROJECT_CATEGORIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Difficulty" htmlFor="p-difficulty">
            <Select id="p-difficulty" {...register('difficulty')}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </Select>
          </Field>

          <Field label="Status" htmlFor="p-status">
            <Select id="p-status" {...register('status')}>
              <option value="active">Active</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </Select>
          </Field>

          <Field label="Technologies" htmlFor="p-tech" hint="Comma separated" error={errors.technologies?.message}>
            <Input id="p-tech" invalid={Boolean(errors.technologies)} {...register('technologies')} />
          </Field>

          <Field label="Contribution slots" htmlFor="p-slots" error={errors.slotsTotal?.message}>
            <Input id="p-slots" type="number" invalid={Boolean(errors.slotsTotal)} {...register('slotsTotal', { valueAsNumber: true })} />
          </Field>

          <Field label="Open issues" htmlFor="p-issues" error={errors.openIssues?.message}>
            <Input id="p-issues" type="number" invalid={Boolean(errors.openIssues)} {...register('openIssues', { valueAsNumber: true })} />
          </Field>

          <Field label="Min XP" htmlFor="p-xpmin" error={errors.potentialXpMin?.message}>
            <Input id="p-xpmin" type="number" invalid={Boolean(errors.potentialXpMin)} {...register('potentialXpMin', { valueAsNumber: true })} />
          </Field>

          <Field label="Max XP" htmlFor="p-xpmax" error={errors.potentialXpMax?.message}>
            <Input id="p-xpmax" type="number" invalid={Boolean(errors.potentialXpMax)} {...register('potentialXpMax', { valueAsNumber: true })} />
          </Field>
        </form>
      </Modal>
    </div>
  )
}
