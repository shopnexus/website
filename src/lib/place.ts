/**
 * Place names at the length a card has room for.
 *
 * The API returns the administrative name in full — "Tỉnh Ninh Bình", "Thành phố Đà Nẵng" —
 * which is right for an address and wrong for a 200px column: the prefix is the same on every
 * row, carries no information a reader wants, and eats enough width that the part that *is*
 * information gets truncated. "Tỉnh Ni…" is a card telling you nothing where it had room to
 * tell you "Ninh Bình".
 *
 * Only the prefix goes. Nothing here abbreviates a name itself: "Bà Rịa - Vũng Tàu" stays what
 * it is, because a shortening nobody agreed on is a place the reader has to decode.
 */
const ADMINISTRATIVE_PREFIX = /^(tỉnh|thành phố|tp\.?)\s+/i

export function shortProvince(name: string): string {
	return name.replace(ADMINISTRATIVE_PREFIX, "").trim() || name
}
