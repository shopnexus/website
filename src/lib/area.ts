import type { AstroCookies } from 'astro';
import type { Schemas } from './api/client';
import { cookie } from './session';

// The buyer's place: the commune nearest the browser's position, found once
// through /vi-tri. Only the commune is kept; server calls send its code as
// near_commune, and the position itself is never stored.

const AREA = 'sn_area';

export interface Area {
  code: string;
  /** The commune's name: "Phường Bình Thạnh". */
  name: string;
}

export function area(cookies: AstroCookies): Area | undefined {
  try {
    const a = JSON.parse(cookies.get(AREA)?.value ?? '') as Area;
    return a.code && a.name ? a : undefined;
  } catch {
    return undefined;
  }
}

export function keepArea(cookies: AstroCookies, url: URL, loc: Schemas['Location']) {
  const a: Area = { code: loc.commune.code, name: loc.commune.display_name };
  cookies.set(AREA, JSON.stringify(a), cookie(url, 365 * 86400));
  return a;
}

/** The near_commune parameter for a server call, when the place is known. */
export function near(cookies: AstroCookies): { near_commune?: string } {
  const a = area(cookies);
  return a ? { near_commune: a.code } : {};
}
