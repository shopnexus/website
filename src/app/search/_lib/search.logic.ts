import { LISTING_CONDITION_VI } from "@/lib/dictionaries";
import type { ContactId, ListingCondition } from "@/api/generated/types.gen";
import type { ConditionFilter, Position, SortOption } from "../_types";

/** What the sort selector offers, in the order a shopper scans it — the default first. */
export const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "relevance", label: "Độ liên quan" },
  { value: "newest", label: "Mới nhất" },
  { value: "price-asc", label: "Giá: Thấp đến Cao" },
  { value: "price-desc", label: "Giá: Cao đến Thấp" },
  { value: "rating", label: "Đánh giá cao" },
  { value: "best-selling", label: "Bán chạy" },
  { value: "recommended", label: "Gợi ý cho bạn" },
  { value: "distance", label: "Gần tôi nhất" },
];

/** The condition filter's choices, "Tất cả" first. */
export const CONDITION_OPTIONS: Array<{ value: ConditionFilter; label: string }> = [
  { value: "", label: "Tất cả" },
  ...(Object.entries(LISTING_CONDITION_VI) as Array<[ListingCondition, string]>).map(
    ([value, label]) => ({ value, label }),
  ),
];

/**
 * What the radius selector offers; each needs an origin to mean anything. `0` is "no bound" —
 * a real choice, so a rare thing three provinces away is found rather than excluded.
 */
export const RADIUS_OPTIONS = [5, 10, 25, 50, 100, 0] as const;

/** The radius a "near me" browse starts at: wide enough to fill a page in a city. */
export const DEFAULT_RADIUS_KM = 25;

/** How a radius reads in the selector and on its chip. */
export function radiusLabel(km: number): string {
  return km === 0 ? "Không giới hạn khoảng cách" : `Trong vòng ${km} km`;
}

/**
 * Whether a sort has what it needs.
 *
 * The server refuses combinations rather than resolving them by precedence: `relevance`
 * is 400 without a query, `distance` needs a position, and `recommended` is 401 without a
 * token. So each is offered only when it would work, and the selector falls back rather
 * than sending a request that can only fail.
 */
export function sortIsAvailable(
  sort: SortOption,
  { hasQuery, hasPosition, isSignedIn }: SortAvailability,
): boolean {
  if (sort === "relevance") return hasQuery;
  if (sort === "distance") return hasPosition;
  if (sort === "recommended") return isSignedIn;
  return true;
}

export interface SortAvailability {
  hasQuery: boolean;
  hasPosition: boolean;
  isSignedIn: boolean;
}

/**
 * The ordering a shopper gets before they touch the selector.
 *
 * A search sorted by recency answers a question nobody asked: the top row is then the last
 * thing anyone posted that happened to match, and the best match for what was typed can be
 * anywhere below it. With nothing typed there is nothing to be relevant to, so a browse of a
 * category falls back to what the server will actually accept.
 */
export function defaultSort(availability: SortAvailability): SortOption {
  return availability.hasQuery ? "relevance" : "newest";
}

/** The sort actually sent: the chosen one, or the default when it has lost its footing. */
export function effectiveSort(
  sort: SortOption | null,
  availability: SortAvailability,
): SortOption {
  if (sort === null || !sortIsAvailable(sort, availability)) return defaultSort(availability);
  return sort;
}

/** Only the narrowest administrative level is sent — a ward is already inside its province. */
export function locationFilter(provinceCode: string, wardCode: string) {
  return {
    province_code: wardCode ? undefined : provinceCode || undefined,
    ward_code: wardCode || undefined,
  };
}

/**
 * Where distance is measured from. The origin only measures; `radius_km` is what excludes.
 * Coordinates and a saved address are exclusive — the server refuses the pair.
 */
export function originFilter(
  position: Position | null,
  nearContactId: ContactId | null,
  radiusKm: number,
) {
  // A radius of zero is "no bound", so the parameter is left off entirely rather than sent
  // as 0 — the server validates it as `gt=0` and would refuse the request.
  const bound = radiusKm > 0 ? { radius_km: radiusKm } : {};
  if (position) {
    return { lat: position.lat, lon: position.lon, ...bound };
  }
  if (nearContactId) {
    return { near_contact_id: nearContactId, ...bound };
  }
  return {};
}
