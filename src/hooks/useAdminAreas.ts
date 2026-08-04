"use client"

import { useQuery } from "@tanstack/react-query"

/**
 * Vietnam's administrative divisions.
 *
 * A third-party dataset, not our API, but held by the query client all the same: two
 * screens need it — the address book writes `province_code`/`district_code`/`ward_code`
 * onto a contact, and the listing browse filters on the same codes — and a plain fetch in
 * each would download it twice per visit. Keyed by depth, because a filter needs provinces
 * and districts while an address needs wards too, and the deep document is large.
 *
 * The codes here are the ones the backend stores: a listing's location is the snapshot of
 * the seller's pickup address, so filtering by province means sending the same code the
 * contact was saved with.
 */

export interface AdminArea {
  name: string
  code: number
}

export interface District extends AdminArea {
  wards?: AdminArea[]
}

export interface Province extends AdminArea {
  districts?: District[]
}

/** 1 = provinces only, 2 = with districts, 3 = with wards. */
export type AreaDepth = 1 | 2 | 3

export function useAdminAreas(depth: AreaDepth) {
  return useQuery({
    queryKey: ["admin-areas", depth],
    queryFn: async ({ signal }): Promise<Province[]> => {
      const res = await fetch(`https://provinces.open-api.vn/api/?depth=${depth}`, { signal })
      if (!res.ok) throw new Error(`administrative areas: ${res.status}`)
      return res.json()
    },
    // Administrative boundaries change on the order of years, and a stale name is a label
    // rather than a wrong request — the code is what travels.
    staleTime: Infinity,
    gcTime: Infinity,
    meta: { silent: true },
  })
}
