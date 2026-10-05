import { useFeaturedProjects } from '@/hooks/useProjects'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Container } from '@/components/ui/Panel'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { ButtonLink } from '@/components/ui/Button'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EmptyState, ErrorState } from '@/components/ui/States'
import { ArrowRight } from 'lucide-react'

/** Landing-page preview of the project registry. */
export function FeaturedProjects() {
  const { data, isLoading, isError, refetch } = useFeaturedProjects(6)

  return (
    <section id="projects" className="relative py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Project registry"
          title={
            <>
              Real repositories with <span className="text-brand-bright">real work</span> waiting
            </>
          }
          description="Curated problem statements across twelve active repositories — each one scoped, labelled and scored before you start."
          actions={
            <ButtonLink to="/projects" variant="outline" trailing={<ArrowRight className="size-4" aria-hidden />}>
              Browse all projects
            </ButtonLink>
          }
        />

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        ) : isError ? (
          <ErrorState title="Unable to load projects" description="The registry did not respond." onRetry={() => void refetch()} />
        ) : !data?.length ? (
          <EmptyState
            title="No projects available."
            description="Projects will appear here once the organisers publish the first problem statements."
            action={{ label: 'Check the leaderboard instead', to: '/leaderboard' }}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}
