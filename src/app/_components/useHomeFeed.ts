"use client";

import { useState } from "react";
import { useListingsFeed } from "@/hooks/api/useCatalog";
import { useAuthStore } from "@/stores/use-auth-store";
import type { GetListingsData } from "@/api/generated/types.gen";

type Sort = NonNullable<NonNullable<GetListingsData["query"]>["sort"]>;

export interface FeedTab {
  id: Sort;
  label: string;
  /** A personal ranking has nobody to rank for until somebody is signed in. */
  needsAccount?: boolean;
}

/**
 * The discovery feed's orderings.
 *
 * Every one of these is a `sort` the API already serves. The tabs used to be three
 * buttons that changed a highlight and nothing else — the same twelve listings under all
 * of them, in the same order.
 */
export const FEED_TABS: FeedTab[] = [
  { id: "recommended", label: "Gợi ý cho bạn", needsAccount: true },
  { id: "newest", label: "Vừa đăng" },
  { id: "best-selling", label: "Bán chạy" },
  { id: "rating", label: "Đánh giá cao" },
];

/**
 * What the home page opens on. The personal ranking, because it is the only ordering that
 * answers "what is here for me" — and it is the one that falls back on its own: an account
 * with nothing computed yet is served the newest listings by the API itself, so a first-time
 * buyer sees the same page they used to and everyone else sees theirs.
 */
const DEFAULT_SORT: Sort = "recommended";

export function useHomeFeed(limit = 12) {
  const { isAuthenticated } = useAuthStore();
  const [sort, setSort] = useState<Sort>(DEFAULT_SORT);

  const [seed] = useState(() => Math.random().toString(36).substring(7));

  // `sort=recommended` is 401 without a token, so a visitor — and anyone who signs out while
  // it is selected — falls back rather than sending a request that can only fail.
  const tabs = FEED_TABS.filter((tab) => !tab.needsAccount || isAuthenticated);
  const active: Sort = tabs.some((tab) => tab.id === sort) ? sort : "newest";

  const feed = useListingsFeed({ 
    limit, 
    sort: active,
    seed: active === "recommended" ? seed : undefined
  });

  return { tabs, active, setSort, feed };
}
