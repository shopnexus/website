import { cache } from "react"
import { getAdministrativeAreas } from "@/api/generated/sdk.gen"
import type { OrderAddressSnapshot } from "@/api/generated/types.gen"

/**
 * The lines of a shipping address, with the administrative codes turned into names.
 *
 * An order snapshot freezes area *codes* — "01", "00001" — and not their names, because a
 * carrier is routed by the code and a renamed ward must not rewrite where a past parcel
 * went. That is right for the record and useless on screen: the detail page was rendering
 * `address_detail` alone, which is nullable, so an address with no street line showed a
 * name and a phone number and nothing else.
 *
 * Resolved at render rather than stored, so a renamed ward reads correctly next time
 * without touching the order.
 */
export async function resolveAddressLines(address: OrderAddressSnapshot): Promise<string[]> {
	const [province, ward] = await Promise.all([
		areaName(address.province_code),
		areaName(address.ward_code, address.province_code),
	])

	// Vietnamese order: street, ward, province. A missing piece drops out rather than
	// leaving a stray comma.
	return [address.address_detail, ward, province].filter((line): line is string =>
		Boolean(line && line.trim()),
	)
}

/**
 * One level of the tree, memoised for the lifetime of a request.
 *
 * `cache` rather than an HTTP cache: an order page resolves a province and a ward, and a
 * page listing several addresses would otherwise fetch the same 500-ward list once per
 * address. Boundaries change on the order of years, so nothing here needs to be fresh.
 */
const areasOf = cache(async (parent?: string) => {
	// A name that will not resolve must never take the order page down with it — the
	// address still renders, just without that line.
	try {
		const { data } = await getAdministrativeAreas({ query: parent ? { parent } : undefined })
		return data?.data ?? []
	} catch {
		return []
	}
})

async function areaName(code: string | null, parent?: string): Promise<string | null> {
	if (!code) return null
	const areas = await areasOf(parent)
	return areas.find((area) => area.code === code)?.name ?? null
}
