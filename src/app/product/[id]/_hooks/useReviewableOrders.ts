"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getOrdersOptions } from "@/api/generated/@tanstack/react-query.gen";
import type { ListingId, Order } from "@/api/generated/types.gen";
import { unwrapData } from "@/api/unwrap";
import { useAuthStore } from "@/stores/use-auth-store";

/** How far back a "review what you bought" prompt looks. */
const RECENT_PURCHASES = 50;

/**
 * The caller's completed purchases that included this listing.
 *
 * A review is gated on an order — `order_id` is required, and the server refuses one that
 * is not the caller's, did not carry this listing or did not complete — so the product
 * page has to name which purchase is being reviewed before it can offer the form. There
 * is no "orders containing listing X" filter, so this reads the most recent completed
 * purchases and matches on the line's `listing_id`, which every order line carries.
 *
 * Bounded on purpose: a shopper reviewing something they bought years and hundreds of
 * orders ago is not the case worth paging the whole history for, and the order itself is
 * still a place to review from.
 */
export function useReviewableOrders(listingId: ListingId | undefined) {
  const { user } = useAuthStore();

  const query = useQuery({
    ...getOrdersOptions({ query: { role: "buyer", state: "completed", limit: RECENT_PURCHASES } }),
    select: unwrapData,
    enabled: Boolean(user && listingId),
  });

  const orders = useMemo<Order[]>(() => {
    if (!query.data || !listingId) return [];
    return query.data.filter((order) =>
      order.items.some((item) => item.listing_id === listingId && item.cancelled_at === null),
    );
  }, [query.data, listingId]);

  return { orders, isLoading: query.isLoading };
}
