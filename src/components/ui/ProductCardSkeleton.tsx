import Skeleton from "./Skeleton";

export default function ProductCardSkeleton() {
  return (
    <div className="bg-surface rounded-xl overflow-hidden border border-outline-variant flex flex-col shadow-sm">
      <Skeleton className="w-full aspect-[4/3] rounded-none" />
      <div className="p-3 flex flex-col flex-1 gap-2">
        <div className="flex items-center gap-1.5">
          <Skeleton shape="circle" className="w-5 h-5 shrink-0" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-4 w-full mt-1" />
        <Skeleton className="h-4 w-2/3" />
        <div className="mt-auto pt-2">
          <Skeleton className="h-6 w-24 mb-2" />
          <div className="flex items-center justify-between gap-2 mt-2 pt-2 border-t border-outline-variant">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
