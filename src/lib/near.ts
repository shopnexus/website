import type { Listing } from './format';

// "Quanh tôi" on Tìm kiếm: ?gan=<km> keeps listings within that distance of
// the buyer. With none that close, the search widens to the next step that has
// some and says so, instead of an empty page.

export const NEAR_STEPS = [2, 5, 10, 20] as const;

/** Where "quanh tôi" is measured from. The mock stands in for the browser's location. */
export const HERE = 'Bình Thạnh, TP.HCM';

/** ?gan=5 → 5. Anything else is "Mọi nơi" (null). */
export function nearParam(url: URL): number | null {
  const km = Number(url.searchParams.get('gan'));
  return (NEAR_STEPS as readonly number[]).includes(km) ? km : null;
}

/** The listings within km, widening when there are none. shown is the distance
 * used, or null when not even the widest step had any and every listing shows. */
export function nearby(items: Listing[], km: number): { items: Listing[]; shown: number | null } {
  for (const step of NEAR_STEPS.filter((s) => s >= km)) {
    const hits = items.filter((it) => it.km < step);
    if (hits.length) return { items: hits, shown: step };
  }
  return { items, shown: null };
}
