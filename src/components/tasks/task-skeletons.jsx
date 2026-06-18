import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card">
      <div className="border-b bg-muted/40 px-4 py-3">
        <Skeleton className="h-4 w-24" />
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="hidden h-7 w-7 rounded-full sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function KanbanSkeleton() {
  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {[0, 1, 2].map((c) => (
        <div key={c} className="flex-1 space-y-2.5 rounded-2xl border border-dashed bg-muted/30 p-2.5">
          <Skeleton className="mb-2 h-4 w-24" />
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ))}
    </div>
  );
}
