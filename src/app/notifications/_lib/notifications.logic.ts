import type { Notification, NotificationCategory } from "@/api/generated/types.gen"
import { groupByDay, type DayGroup } from "@/lib/day"
import { CATEGORY_STYLES } from "@/lib/notification-display"

import type { CategoryFilter } from "../_types"

/**
 * The sidebar's filters, in the order they are shown. "all" is the absence of a filter; the
 * rest are the categories, with their icon and label taken from the one place that decides how
 * a category is drawn — the nav and the rows cannot disagree about what an order looks like.
 */
const ORDERED_CATEGORIES: NotificationCategory[] = [
	"order",
	"promotion",
	"chat",
	"social",
	"system",
]

export const CATEGORY_FILTERS: Array<{ id: CategoryFilter; label: string; icon: string }> = [
	{ id: "all", label: "Tất cả", icon: "grid_view" },
	...ORDERED_CATEGORIES.map((category) => ({
		id: category,
		label: CATEGORY_STYLES[category].label,
		icon: CATEGORY_STYLES[category].icon,
	})),
]

/**
 * The feed as days.
 *
 * Was "today" and "everything else", which put a notification from March under the same
 * heading as one from yesterday. The feed is already newest-first, so the runs are exact.
 */
export function groupNotifications(
	notifications: readonly Notification[],
	now: number = Date.now(),
): Array<DayGroup<Notification>> {
	return groupByDay(notifications, (notification) => notification.created_at, now)
}
