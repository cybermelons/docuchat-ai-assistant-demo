import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function DocumentSkeleton() {
  return (
    <Card className="flex items-center gap-3 px-3 py-2">
      <Skeleton className="h-4 w-4 rounded" />
      <Skeleton className="h-4 flex-1" />
      <Skeleton className="h-8 w-8 rounded" />
    </Card>
  );
}

export function DocumentListSkeleton() {
  return (
    <div className="space-y-1 px-2">
      {[...Array(3)].map((_, i) => (
        <DocumentSkeleton key={i} />
      ))}
    </div>
  );
}