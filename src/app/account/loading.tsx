import { Skeleton } from "@/components/ui/skeleton";

export default function AccountLoading() {
  return (
    <div className="container py-8">
      <Skeleton className="h-10 w-48 mb-8" />
      
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </aside>
        
        <div className="space-y-6">
          <div className="rounded-2xl border bg-card p-6">
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
