import type { GetListingsData, ListingCondition } from "@/api/generated/types.gen";

/** The orderings `/listings` accepts. */
export type SortOption = NonNullable<NonNullable<GetListingsData["query"]>["sort"]>;

/** How a free-text query is matched. Ignored by the server without a query. */
export type SearchMode = NonNullable<NonNullable<GetListingsData["query"]>["mode"]>;

/** Where the buyer is, as `/listings` wants it. */
export interface Position {
  lat: number;
  lon: number;
}

/** The condition filter, with "" for the unfiltered browse. */
export type ConditionFilter = ListingCondition | "";
