"use client";

import ListingCarousel from "@/components/listings/ListingCarousel";
import Skeleton from "@/components/ui/Skeleton";
import { useShelves } from "@/hooks/api/useCatalog";
import { shelfTitle } from "@/lib/dictionaries";
import type { Shelf } from "@/api/generated/types.gen";

/**
 * The home page as rows that say why they are there.
 *
 * The page used to be one grid under one heading — "Dòng Khám Phá" — with four sort tabs above
 * it. That page can only be read one way: as a wall. It also could not say anything about the
 * reader, even though the server knows four things about them: `sort=recommended` blends the
 * account's four interest slots into a single ranking, so a shopper who looks at bicycles and at
 * houseplants gets one page mixing both and no way to tell which is which, or to skip one.
 *
 * `GET /listings/shelves` hands those slots over one at a time, each named by the category
 * nearest it, plus the neighbourhood of whatever they looked at last, plus the marketplace's own
 * rows. This component only lays them out: what is on the page and in what order is the
 * server's answer, because only the server holds the signals behind it.
 *
 * The grid is still below this — it is what "show me everything" looks like, and the rows are
 * what "here are some ideas" looks like. Both belong on a marketplace home page.
 */
export default function HomeShelves() {
  const { data: shelves, isLoading } = useShelves(12);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-10">
        {Array.from({ length: 2 }).map((_, index) => (
          <div key={index}>
            <Skeleton className="mb-4 h-6 w-52" />
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 5 }).map((__, card) => (
                <div key={card} className="w-[46%] shrink-0 sm:w-[31%] lg:w-[23%] xl:w-[18.5%]">
                  <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                  <Skeleton className="mt-3 h-4 w-4/5" />
                  <Skeleton className="mt-2 h-4 w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // No shelves is not an error and not an empty state: it is a marketplace with too few live
  // listings to fill a row, and the grid below is already the answer for that.
  if (!shelves || shelves.length === 0) return null;

  return (
    <div className="flex flex-col gap-12">
      {shelves.map((shelf) => (
        <ListingCarousel
          key={shelf.key}
          title={shelfTitle(shelf.reason, shelf.subject?.name)}
          listings={shelf.listings}
          moreHref={widen(shelf).href}
          moreLabel={widen(shelf).label}
          source={sourceOf(shelf)}
        />
      ))}
    </div>
  );
}

/**
 * Where the shelf's heading link goes, and what it says.
 *
 * The server sends the parameters that widen a shelf rather than a URL, so this is where they
 * become one: the client owns its own routes, and a server writing them would be writing this
 * router.
 *
 * `similar_to` is the exception, and deliberately so. It is what widens the "tương tự" row —
 * the browse page does not take that parameter yet, and a link to a search that answers 400 is
 * worse than no link — so that row points at the listing the row is *about* instead, which is
 * the thing a reader following it actually wants. When the browse page learns `similar_to`, this
 * becomes one more line above rather than a special case.
 */
function widen(shelf: Shelf): { href?: string; label: string } {
  const { browse } = shelf;
  if (browse.similar_to) {
    return { href: `/product/${browse.similar_to}`, label: "Xem lại sản phẩm" };
  }
  const params = new URLSearchParams();
  if (browse.category_id) params.set("category", browse.category_id);
  if (browse.sort) params.set("sort", browse.sort);
  const query = params.toString();
  return { href: query === "" ? undefined : `/search?${query}`, label: "Xem tất cả" };
}

/**
 * Which surface a click from this row is recorded as.
 *
 * The contract has three, and a personal shelf is the `recommended` one: these rows come from
 * the same interest slots that feed `sort=recommended`, so a click on one is the signal that
 * ranking is measured by. A platform row is nobody's recommendation and is left unattributed.
 */
function sourceOf(shelf: Shelf): "recommended" | undefined {
  return shelf.reason === "interest" || shelf.reason === "because-you-viewed"
    ? "recommended"
    : undefined;
}
