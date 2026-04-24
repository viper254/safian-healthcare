export default function ProductLoading() {
  return (
    <div className="container py-6 md:py-10">
      {/* Breadcrumb skeleton */}
      <div className="flex gap-2 mb-5">
        <div className="h-4 w-12 bg-muted animate-pulse rounded" />
        <div className="h-4 w-12 bg-muted animate-pulse rounded" />
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
        {/* Image skeleton */}
        <div>
          <div className="aspect-square rounded-2xl bg-muted animate-pulse" />
          <div className="mt-3 grid grid-cols-5 gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="aspect-square rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        </div>

        {/* Details skeleton */}
        <div className="space-y-4">
          <div className="h-4 w-24 bg-muted animate-pulse rounded" />
          <div className="h-8 w-3/4 bg-muted animate-pulse rounded" />
          <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          <div className="h-10 w-40 bg-muted animate-pulse rounded" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-full bg-muted animate-pulse rounded" />
            <div className="h-4 w-2/3 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-12 w-full bg-muted animate-pulse rounded-lg" />
        </div>
      </div>
    </div>
  );
}
