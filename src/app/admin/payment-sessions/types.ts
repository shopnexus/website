import type { CurrencyCode } from "@/api/generated/types.gen"

/**
 * What the rows on screen add up to, per currency.
 *
 * Kept per currency rather than as one number because adding two currencies together is
 * not addition — the API states the currency on every session precisely so nothing has to
 * assume one.
 */
export interface SessionTotals {
	currency: CurrencyCode
	count: number
	/** Sum of what was asked for. */
	total: number
	/** Sum of what a further payment may still tender. */
	outstanding: number
	/** What has already landed on a rail — `total` less `outstanding`, not a stored fact. */
	settled: number
}
