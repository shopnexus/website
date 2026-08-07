/**
 * Money formatting, keyed on the currency the row itself carries.
 *
 * A wallet, a withdrawal and an order total each state their own `currency` — the API
 * never assumes one — so hardcoding `VND` renders a foreign balance as dong. The locale
 * stays `vi-VN` because that is who reads the screen; only the unit follows the data.
 *
 * `Intl` throws on a currency code it does not know, and a code reaches this from the
 * server rather than from a literal here, so an unknown one falls back to the plain
 * number plus the code instead of blanking the page it was rendering.
 */
export function formatMoney(amount: number, currency: string): string {
	try {
		return new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(amount)
	} catch {
		return `${new Intl.NumberFormat("vi-VN").format(amount)} ${currency}`
	}
}

/** A signed movement, where the sign is the information: `+1.000 ₫` against `−1.000 ₫`. */
export function formatSignedMoney(amount: number, currency: string): string {
	const formatted = formatMoney(Math.abs(amount), currency)
	if (amount > 0) return `+${formatted}`
	if (amount < 0) return `−${formatted}`
	return formatted
}

/** Digits only, for an amount field a person types into. */
export function parseAmount(input: string): number {
	const digits = input.replace(/\D/g, "")
	return digits === "" ? 0 : Number(digits)
}
