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
  { id: "newest", label: "Vừa đăng" },
  { id: "best-selling", label: "Bán chạy" },
  { id: "rating", label: "Đánh giá cao" },
  { id: "recommended", label: "Gợi ý cho bạn", needsAccount: true },
];

export function useHomeFeed(limit = 12) {
  const { isAuthenticated } = useAuthStore();
  const [sort, setSort] = useState<Sort>("newest");

  // `sort=recommended` is 401 without a token, so a visitor who signs out while it is
  // selected falls back rather than sending a request that can only fail.
  const tabs = FEED_TABS.filter((tab) => !tab.needsAccount || isAuthenticated);
  const active: Sort = tabs.some((tab) => tab.id === sort) ? sort : "newest";

  const feed = useListingsFeed({ limit, sort: active });

  return { tabs, active, setSort, feed };
}
