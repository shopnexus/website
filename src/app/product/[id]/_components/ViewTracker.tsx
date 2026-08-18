"use client";

import { useEffect } from "react";
import { recordInteraction } from "@/hooks/api/useCatalog";
import type { ListingId } from "@/api/generated/types.gen";

/**
 * Records the one interaction the product page itself can say with certainty happened: this
 * listing was looked at. A leaf client component because the page around it is a Server
 * Component — recordInteraction needs the browser's own fetch, and firing it during the
 * server render would count every crawler and every SSR pass as a shopper.
 *
 * Renders nothing. Once per listing id, not once per render: the effect's dependency array is
 * what keeps a re-render from double-counting the same visit.
 */
export default function ViewTracker({ listingId }: { listingId: ListingId }) {
  useEffect(() => {
    recordInteraction(listingId, "view");
  }, [listingId]);

  return null;
}
