import type { OrderSummary, OrderSummaryDay } from "@/api/generated/types.gen"
import { formatMoney } from "@/lib/money"
import type { DayBucket, Metric, RangeId, Window } from "../types"

/** How many days each range covers. */
export const RANGE_DAYS: Record<RangeId, number> = { "7d": 7, "30d": 30, "90d": 90 }

const DAY_MS = 24 * 60 * 60 * 1000

/**
 * The window a range asks about, and the one immediately before it.
 *
 * Both are computed from the same `now` so the two halves of a comparison are exactly
 * the same length — deriving the previous window from a second `Date.now()` would make
 * it a few milliseconds shorter and, on a month boundary, a day shorter.
 */
export function windowsFor(range: RangeId, now: number): { current: Window; previous: Window } {
	const span = RANGE_DAYS[range] * DAY_MS
	const to = now
	const from = to - span
	return {
		current: { from: new Date(from).toISOString(), to: new Date(to).toISOString() },
		previous: { from: new Date(from - span).toISOString(), to: new Date(from).toISOString() },
	}
}

/**
 * The chart's buckets, gaps included.
 *
 * The API documents `daily` as "only the days that had an order; a client fills the gaps
 * it wants to draw" — so a shop that sold on Monday and Friday would otherwise render a
 * two-column chart in which Monday sits next to Friday. Walking the window instead keeps
 * the x-axis a calendar.
 *
 * The dates are walked in UTC and formatted from their parts, because the server already
 * cut its buckets in the requested zone and re-deriving a local date here would shift
 * every label by the offset between the two.
 */
export function fillDays(daily: ReadonlyArray<OrderSummaryDay>, from: string, to: string): DayBucket[] {
	const bySeen = new Map(daily.map((d) => [d.date, d]))
	const start = startOfUtcDay(new Date(from))
	// `to` is exclusive, so the last bucket is the day before it — unless the window ends
	// mid-day, in which case that day is partial and still worth drawing.
	const end = startOfUtcDay(new Date(new Date(to).getTime() - 1))

	const out: DayBucket[] = []
	for (let t = start; t <= end; t += DAY_MS) {
		const date = isoDate(new Date(t))
		const hit = bySeen.get(date)
		out.push({ date, placed: hit?.placed ?? 0, completed: hit?.completed ?? 0 })
	}
	return out
}

function startOfUtcDay(d: Date): number {
	return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())
}

function isoDate(d: Date): string {
	const month = String(d.getUTCMonth() + 1).padStart(2, "0")
	const day = String(d.getUTCDate()).padStart(2, "0")
	return `${d.getUTCFullYear()}-${month}-${day}`
}

/** `12/03`, which is what a Vietnamese reader expects on an axis. */
export function shortDate(isoDay: string): string {
	const [, month, day] = isoDay.split("-")
	return `${day}/${month}`
}

/**
 * Percentage movement, or null where there is nothing to move from.
 *
 * Zero to anything is not a percentage — it is a start — and reporting it as one puts a
 * meaningless "+100%" on the first week a shop trades.
 */
export function percentChange(current: number, previous: number): number | null {
	if (previous === 0) return null
	return Math.round(((current - previous) / previous) * 1000) / 10
}

/** Goods money across every currency in one window, keyed for comparison. */
function totalIn(summary: OrderSummary | undefined, currency: string): number {
	return summary?.totals.find((t) => t.currency === currency)?.amount ?? 0
}

/**
 * The four numbers at the top of the page, each of which the summary endpoint answers
 * directly. Nothing derived from a source that does not exist — page views and repeat
 * customers are collected client-side by a separate analytics stack, not by this API.
 */
export function buildMetrics(
	current: OrderSummary | undefined,
	previous: OrderSummary | undefined,
): Metric[] {
	// The revenue card reports the currency the shop earned most in, which for a single-
	// currency shop is simply its currency. The rest are listed under the chart.
	const leading = [...(current?.totals ?? [])].sort((a, b) => b.amount - a.amount)[0]
	const currency = leading?.currency ?? "VND"

	const placed = countPlaced(current)
	const previousPlaced = countPlaced(previous)

	return [
		{
			id: "revenue",
			label: "Doanh thu đã hoàn tất",
			value: formatMoney(leading?.amount ?? 0, currency),
			hint: "Tiền hàng của đơn đã hoàn thành, chưa gồm phí giao",
			icon: "payments",
			change: percentChange(totalIn(current, currency), totalIn(previous, currency)),
		},
		{
			id: "placed",
			label: "Đơn đã đặt",
			value: String(placed),
			hint: "Mọi đơn phát sinh trong kỳ",
			icon: "receipt_long",
			change: percentChange(placed, previousPlaced),
		},
		{
			id: "completed",
			label: "Đơn hoàn thành",
			value: String(current?.completed ?? 0),
			hint: `${current?.open ?? 0} đơn đang xử lý`,
			icon: "task_alt",
			change: percentChange(current?.completed ?? 0, previous?.completed ?? 0),
		},
		{
			id: "cancelled",
			label: "Tỷ lệ hủy",
			value: placed === 0 ? "0%" : `${Math.round(((current?.cancelled ?? 0) / placed) * 100)}%`,
			hint: `${current?.cancelled ?? 0} đơn đã hủy`,
			icon: "cancel",
			change: null,
		},
	]
}

/**
 * Every order in the window, whichever state it reached. The endpoint reports the three
 * states side by side rather than a total, because the window filters when an order was
 * placed and an order is in exactly one of them now.
 */
export function countPlaced(summary: OrderSummary | undefined): number {
	if (!summary) return 0
	return summary.open + summary.completed + summary.cancelled
}
