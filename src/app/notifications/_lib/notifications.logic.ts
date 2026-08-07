import type { Notification, NotificationCategory } from "@/api/generated/types.gen"
import { groupByDay, type DayGroup } from "@/lib/day"

import type { CategoryFilter } from "../_types"

/** How each category is drawn. One place, so the nav and the cards cannot disagree. */
export const CATEGORY_STYLES: Record<
	NotificationCategory,
	{ icon: string; bg: string; color: string }
> = {
	order: { icon: "package_2", bg: "bg-secondary-container", color: "text-on-secondary-container" },
	promotion: {
		icon: "trending_down",
		bg: "bg-tertiary-container",
		color: "text-on-tertiary-container",
	},
	chat: { icon: "chat_bubble", bg: "bg-primary-container", color: "text-on-primary-container" },
	social: {
		icon: "person_add",
		bg: "bg-surface-container-highest",
		color: "text-on-surface-variant",
	},
	system: { icon: "verified_user", bg: "bg-surface-container-high", color: "text-outline" },
}

export const CATEGORY_FILTERS: Array<{ id: CategoryFilter; label: string; icon: string }> = [
	{ id: "all", label: "Tất cả", icon: "grid_view" },
	{ id: "order", label: "Đơn hàng", icon: "local_shipping" },
	{ id: "promotion", label: "Khuyến mãi", icon: "sell" },
	{ id: "chat", label: "Tin nhắn", icon: "chat" },
	{ id: "social", label: "Mạng xã hội", icon: "people" },
	{ id: "system", label: "Hệ thống", icon: "settings" },
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

/**
 * A notification has no id of its own: `created_at` identifies the row together with the
 * feed order, and it is also the bound `POST /notifications/read` is expressed against.
 */
export function notificationKey(notification: Notification): string {
	return notification.created_at
}

export function countUnread(notifications: readonly Notification[]): number {
	return notifications.filter((notification) => notification.read_at === null).length
}
