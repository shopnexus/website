import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import type { Listing } from "@/api/generated/types.gen";

/**
 * A row of listings under a heading, with the link that opens the full browse behind it.
 * Renders nothing when there is nothing to show — an empty rail is a heading that lies.
 */
export default function ListingRail({
  title,
  listings,
  moreHref,
  moreLabel,
}: {
  title: string;
  listings: Listing[];
  moreHref: string;
  moreLabel: string;
}) {
  if (listings.length === 0) return null;

  return (
    <section className="mt-12">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="font-headline-md font-bold text-on-surface">{title}</h2>
        <Link
          href={moreHref}
          className="shrink-0 font-label-md font-bold text-primary underline decoration-2 underline-offset-4 hover:opacity-80"
        >
          {moreLabel}
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {listings.map((listing) => (
          <ProductCard key={listing.id} product={listing} />
        ))}
      </div>
    </section>
  );
}
