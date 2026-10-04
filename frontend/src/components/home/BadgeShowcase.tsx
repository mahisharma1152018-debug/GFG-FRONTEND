import { ArrowRight } from 'lucide-react'
import { useFeaturedBadges } from '@/hooks/useContributions'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Container } from '@/components/ui/Panel'
import { ButtonLink } from '@/components/ui/Button'
import { BadgeCard } from '@/components/badges/BadgeCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { ErrorState } from '@/components/ui/States'

/** Badge catalogue teaser on the landing page. */
export function BadgeShowcase() {
  const { data, isLoading, isError, refetch } = useFeaturedBadges()

  return (
    <section className="relative py-20 sm:py-24">
      <Container>
        <SectionHeading
          eyebrow="Achievements"
          title={
            <>
              Badges that mean <span className="text-brand-bright">something</span>
            </>
          }
          description="Every badge maps to verified work — merged pull requests, sustained streaks and cross-repository impact."
          actions={
            <ButtonLink to="/badges" variant="outline" trailing={<ArrowRight className="size-4" aria-hidden />}>
              All badges
            </ButtonLink>
          }
        />

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-36 rounded-[14px]" />
            ))}
          </div>
        ) : isError ? (
          <ErrorState title="Unable to load badges" onRetry={() => void refetch()} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(data ?? []).map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        )}
      </Container>
    </section>
  )
}
