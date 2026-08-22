import { LISTING_CONDITION_VI } from "@/lib/dictionaries"
import { timeAgo } from "@/lib/day"
import type { ListingDetail, ListingLocation, Variant } from "@/api/generated/types.gen"

/**
 * What the listing already says about itself, turned into rows something can render.
 *
 * The API has carried all of this along — where the goods are and how far, when the tin was
 * posted, what condition the seller declared, whatever they typed into `specifications` —
 * and the product page showed two of those fields and dropped the rest. Pure functions so
 * the components stay render-only, and so "which facts does a listing have" is answered in
 * one place rather than by four conditionals in JSX.
 */

/** One line of the ledger. `tone` is the only colour any of them may carry. */
export interface Fact {
	key: string
	/** Material Symbols name. */
	icon: string
	label: string
	value: string
	/** `warning` is for a fact a buyer should not skim past — a listing sold as damaged. */
	tone?: "warning"
}

/**
 * Where the goods are, at the precision the reader can use: the distance when the browse
 * sent a position, otherwise the place. Ward and district are joined only when they exist —
 * a country with no district tier leaves that half null, and "null, TP.HCM" is not an address.
 */
export function formatLocation(location: ListingLocation): string {
	const parts = [location.ward_name, location.district_name, location.province_name].filter(
		(part): part is string => Boolean(part),
	)
	return parts.join(", ")
}

/** The short form for a chip: the district and province, or the province alone. */
export function shortLocation(location: ListingLocation): string {
	return [location.district_name, location.province_name]
		.filter((part): part is string => Boolean(part))
		.join(", ")
}

export function formatDistance(km: number): string {
	if (km < 1) return `${Math.round(km * 1000)} m`
	return `${km.toFixed(1)} km`
}

/**
 * The facts a buyer of a used thing from a stranger actually weighs, in the order they weigh
 * them: what it is, where it is, how old the offer is, what happens if it breaks.
 *
 * `warranty_remaining` and `brand` are lifted out of `specifications` because they are
 * answers to that question rather than attributes of the product; the rest of the
 * specifications stay in the table further down the page, and `specificationEntries` skips
 * the two lifted here so nothing is stated twice.
 */
export function listingFacts(product: ListingDetail): Fact[] {
	const facts: Fact[] = []

	const condition =
		LISTING_CONDITION_VI[product.condition as keyof typeof LISTING_CONDITION_VI] ??
		product.condition
	facts.push({
		key: "condition",
		icon: product.condition === "damaged" ? "report" : "verified",
		label: "Tình trạng",
		value: condition,
		tone: product.condition === "damaged" ? "warning" : undefined,
	})

	if (product.location) {
		const place = shortLocation(product.location)
		const distance = product.location.distance_km
		facts.push({
			key: "location",
			icon: "location_on",
			label: "Nơi bán",
			value: distance != null ? `${place} · cách ${formatDistance(distance)}` : place,
		})
	}

	facts.push({
		key: "posted",
		icon: "schedule",
		label: "Đăng tin",
		value: timeAgo(product.created_at),
	})

	const brand = product.specifications?.brand
	if (typeof brand === "string" && brand.trim() !== "") {
		facts.push({ key: "brand", icon: "sell", label: "Thương hiệu", value: brand })
	}

	const warranty = product.specifications?.warranty_remaining
	if (typeof warranty === "string" && warranty.trim() !== "") {
		facts.push({ key: "warranty", icon: "shield", label: "Bảo hành", value: warranty })
	}

	return facts
}

/** Lifted into the ledger above, so the table below leaves them out. */
const LIFTED_SPECIFICATIONS = new Set(["brand", "warranty_remaining"])

/**
 * Vietnamese labels for the keys the posting flow and the AI suggestion produce most often.
 * Everything else is the seller's own wording and is shown as typed — a dictionary that
 * rewrote it would be guessing at what somebody else's product has.
 */
const SPECIFICATION_LABELS: Record<string, string> = {
	model: "Model",
	origin: "Xuất xứ",
	material: "Chất liệu",
	color: "Màu sắc",
	size: "Kích cỡ",
	capacity: "Dung lượng",
	weight: "Khối lượng",
	year: "Năm sản xuất",
	accessories: "Phụ kiện kèm theo",
	defects: "Lỗi / khuyết điểm",
}

/** A `snake_case` key the dictionary does not know, as a sentence: `screen_size` → `Screen size`. */
function humanize(key: string): string {
	const spaced = key.replace(/[_-]+/g, " ").trim()
	return spaced.charAt(0).toUpperCase() + spaced.slice(1)
}

export interface SpecEntry {
	key: string
	label: string
	value: string
}

/**
 * Every specification the seller filled in, whatever they called it.
 *
 * The values are `unknown` on the wire — the field is a free-form object — so a number and a
 * boolean are rendered rather than dropped, and anything structural (an object, an array) is
 * skipped: a `[object Object]` in a spec table is worse than a missing row.
 */
export function specificationEntries(product: ListingDetail): SpecEntry[] {
	return Object.entries(product.specifications ?? {})
		.filter(([key]) => !LIFTED_SPECIFICATIONS.has(key))
		.flatMap(([key, raw]) => {
			const value = scalarText(raw)
			if (value === null) return []
			return [{ key, label: SPECIFICATION_LABELS[key] ?? humanize(key), value }]
		})
}

/**
 * Weight and dimensions of the selected variant. The shipping quote is computed from these,
 * so they belong beside the specifications rather than hidden until checkout.
 */
export function packageEntries(variant: Variant): SpecEntry[] {
	return Object.entries(variant.package_details ?? {}).flatMap(([key, raw]) => {
		const value = scalarText(raw)
		if (value === null) return []
		return [{ key, label: PACKAGE_LABELS[key] ?? humanize(key), value }]
	})
}

const PACKAGE_LABELS: Record<string, string> = {
	weight: "Khối lượng",
	weight_g: "Khối lượng (g)",
	length: "Dài",
	width: "Rộng",
	height: "Cao",
	length_cm: "Dài (cm)",
	width_cm: "Rộng (cm)",
	height_cm: "Cao (cm)",
}

/** A value worth printing, or null for one that is not text a person can read. */
function scalarText(raw: unknown): string | null {
	if (typeof raw === "string") return raw.trim() === "" ? null : raw
	if (typeof raw === "number" && Number.isFinite(raw)) return new Intl.NumberFormat("vi-VN").format(raw)
	if (typeof raw === "boolean") return raw ? "Có" : "Không"
	return null
}

/**
 * What the stock line says, and whether it is a warning.
 *
 * "Còn 3 sản phẩm" moves a shopper and "Còn 412" does not, so a comfortable stock says only
 * that it is in stock: a precise number is information when it is running out and noise
 * otherwise.
 */
export function stockNote(available: number): { text: string; scarce: boolean } {
	if (available <= 0) return { text: "Hết hàng", scarce: true }
	if (available <= 5) return { text: `Chỉ còn ${available} sản phẩm`, scarce: true }
	return { text: "Còn hàng", scarce: false }
}
