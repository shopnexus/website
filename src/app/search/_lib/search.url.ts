import type { ConditionFilter, Position, SortOption } from "../_types";

/**
 * The query string is the search's state, all of it — so a filtered search is a link.
 * Everything but the price drafts used to be React state, lost on refresh and on share.
 */

/** Every key the search page owns. Anything else in the query string is left alone. */
export const SEARCH_PARAMS = [
  "q",
  "category",
  "tag",
  "province",
  "ward",
  "condition",
  "min",
  "max",
  "sort",
  "lat",
  "lon",
  "radius",
  "near",
] as const;

export type SearchParamKey = (typeof SEARCH_PARAMS)[number];

/** A patch of key→value. An empty value removes the key, so a cleared filter leaves no trace. */
export type ParamPatch = Partial<Record<SearchParamKey, string>>;

export function patchParams(current: URLSearchParams, patch: ParamPatch): string {
  const next = new URLSearchParams(current);
  for (const [key, value] of Object.entries(patch)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  return next.toString();
}

/** Clearing every filter is one patch, so it is one navigation and cannot half-apply. */
export const CLEARED: ParamPatch = Object.fromEntries(
  SEARCH_PARAMS.filter((key) => key !== "q").map((key) => [key, ""]),
);

/** A number, or undefined: `Number("")` is 0, and a zero bound filters where none does not. */
export function numberParam(raw: string | null): number | undefined {
  if (!raw?.trim()) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

/** A price bound: a finite number at or above zero, or no bound at all. */
export function priceParam(raw: string | null): number | undefined {
  const value = numberParam(raw);
  return value !== undefined && value >= 0 ? value : undefined;
}

/** Both coordinates or neither: the server refuses half a position, so a broken link browses. */
export function positionParam(params: URLSearchParams): Position | null {
  const lat = numberParam(params.get("lat"));
  const lon = numberParam(params.get("lon"));
  if (lat === undefined || lon === undefined) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}

/** Coordinates as the URL carries them: short enough to read, precise to about a metre. */
export function positionPatch(position: Position | null): ParamPatch {
  if (!position) return { lat: "", lon: "" };
  return { lat: position.lat.toFixed(5), lon: position.lon.toFixed(5) };
}

/**
 * The radius the server accepts (`gt=0,lte=500`), with `0` for no bound. Zero is spelled out
 * because absent already means "the default", which would re-narrow a deliberately wide link.
 */
export function radiusParam(raw: string | null, fallback: number): number {
  const value = numberParam(raw);
  if (value === 0) return 0;
  if (value === undefined || value < 0 || value > 500) return fallback;
  return value;
}

/**
 * A sort, or null for "not chosen" — the default depends on whether something was typed.
 * An unknown value is null too, rather than passed through for the server to 400 on.
 */
export function sortParam(raw: string | null, allowed: readonly SortOption[]): SortOption | null {
  if (!raw) return null;
  return allowed.includes(raw as SortOption) ? (raw as SortOption) : null;
}

/** A condition out of the URL, or "" for the unfiltered browse. */
export function conditionParam(
  raw: string | null,
  allowed: readonly ConditionFilter[],
): ConditionFilter {
  if (!raw) return "";
  return allowed.includes(raw as ConditionFilter) ? (raw as ConditionFilter) : "";
}
