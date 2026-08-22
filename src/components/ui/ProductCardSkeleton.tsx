import Skeleton from "./Skeleton";

/** The shape of a card, in the same order the card fills in: photo, name, price, place. */
export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="flex flex-1 flex-col p-2.5">
        <div className="min-h-[44px]">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="mt-1.5 h-4 w-2/3" />
        </div>
        <div className="mt-auto pt-1.5">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="mt-1.5 h-3 w-28" />
        </div>
      </div>
    </div>
  );
}
