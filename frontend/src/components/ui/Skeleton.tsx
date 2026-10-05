import { cn } from '@/utils/cn'

/** Shimmering placeholder blocks used by every loading state. */
export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn('animate-pulse rounded-md bg-gradient-to-r from-white/[0.04] via-white/[0.08] to-white/[0.04]', className)}
      {...props}
    />
  )
}

export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="rounded-[14px] border border-line bg-coal/80 p-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-4 h-6 w-3/4" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: lines }).map((_, index) => (
          <Skeleton key={index} className="h-3 w-full" />
        ))}
      </div>
      <div className="mt-5 flex gap-2">
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-14" />
      </div>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 border-b border-line px-4 py-4 last:border-0">
      <Skeleton className="h-8 w-8 rounded-lg" />
      <Skeleton className="h-4 w-10" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-20" />
    </div>
  )
}

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  )
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="overflow-hidden rounded-[14px] border border-line bg-coal/80">
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonRow key={index} />
      ))}
    </div>
  )
}
