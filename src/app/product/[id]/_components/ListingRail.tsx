import ListingCarousel from "@/components/listings/ListingCarousel";
import type { Listing } from "@/api/generated/types.gen";

/**
 * A row of listings under a heading, with the link that opens the full browse behind it.
 *
 * The rail is `ListingCarousel` now — the same component the home page's shelves are — because
 * these were two implementations of one idea and only one of them could be scrolled. Renders
 * nothing when there is nothing to show: an empty rail is a heading that lies.
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
  return (
    <ListingCarousel
      title={title}
      listings={listings}
      moreHref={moreHref}
      moreLabel={moreLabel}
      className="mt-12"
    />
  );
}
