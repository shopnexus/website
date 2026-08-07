import type { MoneyByCurrency } from "@/api/generated/types.gen"

/** How far back the window reaches. The server caps a window at one year. */
export type RangeId = "7d" | "30d" | "90d"

/** Which side of the orders the numbers describe. */
export type SummaryRole = "seller" | "buyer"

/** A half-open window, `to` exclusive, as the RFC 3339 strings the query takes. */
export interface Window {
	from: string
	to: string
}

/** One bucket of the chart, gaps included — the API sends only the days that had one. */
export interface DayBucket {
	/** Local date, `YYYY-MM-DD`, as the server cut it in the requested zone. */
	date: string
	placed: number
	completed: number
}

/**
 * A headline number with its comparison against the window immediately before it.
 *
 * `change` is null where a comparison would be a lie: a previous window of zero has no
 * percentage to move by, and "+100%" from one order to two reads as growth that is not
 * there. The card renders "không có kỳ trước" rather than a number in that case.
 */
export interface Metric {
	id: string
	label: string
	value: string
	hint: string
	icon: string
	change: number | null
}

export interface AnalyticsView {
	metrics: Metric[]
	buckets: DayBucket[]
	/** Completed-order goods money, one entry per currency the shop priced in. */
	totals: ReadonlyArray<MoneyByCurrency>
	isLoading: boolean
	/** True once the window has been asked about and held no orders at all. */
	isEmpty: boolean
}
