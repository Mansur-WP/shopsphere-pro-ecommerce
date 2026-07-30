import { Skeleton } from "@/components/ui/skeleton";

export default function HomeLoading() {
  return (
    <div>
      <Skeleton className="min-h-[88vh] w-full rounded-none" />
      <div className="mx-auto max-w-7xl px-4 py-20">
        <Skeleton className="h-8 w-56" />
        <div className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
