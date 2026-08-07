/**
 * Grouping a feed by the day it happened on.
 *
 * A chat thread and the notification feed both want the same three things — a stable key
 * per calendar day, a Vietnamese label for it, and the runs of rows under each — and both
 * had "hôm nay vs. older" hardcoded instead. One definition, so a week-old thread and a
 * week-old notification read the same way.
 */

const DAY_MS = 86_400_000

const startOfDay = (value: Date): number =>
	new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()

/** Midnight-local identity of an instant. Two rows share it when they share a day. */
export function dayKey(iso: string): string {
	const date = new Date(iso)
	return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

/** "Hôm nay", "Hôm qua", or the written date. */
export function dayLabel(iso: string, now: number = Date.now()): string {
	const date = new Date(iso)
	const diffDays = Math.round((startOfDay(new Date(now)) - startOfDay(date)) / DAY_MS)

	if (diffDays === 0) return "Hôm nay"
	if (diffDays === 1) return "Hôm qua"
	return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
}

export interface DayGroup<T> {
	key: string
	label: string
	items: T[]
}

/**
 * Consecutive rows sharing a day, in the order they were given. Runs rather than buckets:
 * both feeds arrive already sorted, so a run is exact and needs no second sort.
 */
export function groupByDay<T>(
	items: readonly T[],
	instantOf: (item: T) => string,
	now: number = Date.now(),
): Array<DayGroup<T>> {
	const groups: Array<DayGroup<T>> = []

	for (const item of items) {
		const iso = instantOf(item)
		const key = dayKey(iso)
		const current = groups[groups.length - 1]
		if (current?.key === key) {
			current.items.push(item)
			continue
		}
		groups.push({ key, label: dayLabel(iso, now), items: [item] })
	}

	return groups
}
