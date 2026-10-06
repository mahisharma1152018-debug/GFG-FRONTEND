import { Skeleton } from '@/components/ui/Skeleton'
import { Container } from '@/components/ui/Panel'

/** Fallback shown while a lazily loaded route bundle is downloading. */
export function PageLoader() {
  return (
    <Container className="py-16" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading page…</span>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="mt-5 h-11 w-2/3 max-w-xl" />
      <Skeleton className="mt-4 h-5 w-1/2 max-w-lg" />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-52 rounded-[14px]" />
        ))}
      </div>
    </Container>
  )
}
