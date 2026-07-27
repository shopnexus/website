import Skeleton from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 flex flex-col lg:flex-row gap-8">
      <Skeleton className="w-full lg:w-[500px] aspect-[4/5] rounded-2xl shrink-0" />
      <div className="flex-1 flex flex-col gap-6">
        <Skeleton className="h-10 w-3/4 rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-28 w-full rounded-2xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
      </div>
    </div>
  );
}
