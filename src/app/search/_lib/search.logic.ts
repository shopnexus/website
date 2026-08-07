import { LISTING_CONDITION_VI } from "@/lib/dictionaries";
import type { ListingCondition } from "@/api/generated/types.gen";
import type { ConditionFilter, Position, SearchMode, SortOption } from "../_types";

/** What the sort selector offers, in the order a shopper scans it. */
export const SORT_OPTIONS: Array<{ value: SortOption; label: string }> = [
  { value: "newest", label: "Mới nhất" },
  { value: "relevance", label: "Độ liên quan" },
  { value: "price-asc", label: "Giá: Thấp đến Cao" },
  { value: "price-desc", label: "Giá: Cao đến Thấp" },
  { value: "rating", label: "Đánh giá cao" },
  { value: "best-selling", label: "Bán chạy" },
  { value: "recommended", label: "Gợi ý cho bạn" },
  { value: "distance", label: "Gần tôi nhất" },
];

/**
 * How a query is matched.
 *
 * `lexical` is the words as typed, `semantic` is the meaning, `hybrid` is both. The
 * server ignores the parameter without a query, so the control is only offered with one.
 */
export const SEARCH_MODES: Array<{ value: SearchMode; label: string; hint: string }> = [
  { value: "hybrid", label: "Kết hợp", hint: "Khớp cả từ khoá lẫn ý nghĩa" },
  { value: "lexical", label: "Từ khoá", hint: "Đúng chữ đã gõ" },
  { value: "semantic", label: "Ý nghĩa", hint: "Món tương tự, dù gọi tên khác" },
];

/** The condition filter's choices, "Tất cả" first. */
export const CONDITION_OPTIONS: Array<{ value: ConditionFilter; label: string }> = [
  { value: "", label: "Tất cả" },
  ...(Object.entries(LISTING_CONDITION_VI) as Array<[ListingCondition, string]>).map(
    ([value, label]) => ({ value, label }),
  ),
];

/** What the radius selector offers. Any value here needs a position to mean anything. */
export const RADIUS_OPTIONS = [5, 10, 25, 50, 100] as const;

/** A price input that is blank or not a number means "no bound". */
export function priceBound(raw: string): number | undefined {
  if (!raw.trim()) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) && value >= 0 ? value : undefined;
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

/** The sort actually sent: the chosen one, or `newest` when it has lost its footing. */
export function effectiveSort(sort: SortOption, availability: SortAvailability): SortOption {
  return sortIsAvailable(sort, availability) ? sort : "newest";
}

/** Only the narrowest administrative level is sent — a ward is already inside its province. */
export function locationFilter(provinceCode: string, wardCode: string) {
  return {
    province_code: wardCode ? undefined : provinceCode || undefined,
    ward_code: wardCode || undefined,
  };
}

/** A position ranks and reports distance on its own; the radius is what excludes. */
export function positionFilter(position: Position | null, radiusKm: number) {
  return {
    lat: position?.lat,
    lon: position?.lon,
    radius_km: position ? radiusKm : undefined,
  };
}
