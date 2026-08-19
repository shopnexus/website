import type { GetListingsData, ListingCondition } from "@/api/generated/types.gen";

/** The orderings `/listings` accepts. */
export type SortOption = NonNullable<NonNullable<GetListingsData["query"]>["sort"]>;

/** Where the buyer is, as `/listings` wants it. */
export interface Position {
  lat: number;
  lon: number;
}

/** The condition filter, with "" for the unfiltered browse. */
export type ConditionFilter = ListingCondition | "";
