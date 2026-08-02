import type { Notification, NotificationCategory } from "@/api/generated/types.gen"

/**
 * Rendering helpers for a notification.
 *
 * A Notification carries a `title` and a free-form `payload`, and no body column — the
 * structured content is whatever the emitting module put in the payload, so reading it
 * means probing for the keys that are actually used rather than typing a body that does
 * not exist.
 */

const BODY_KEYS = ["body", "message", "description", "text"] as const

/** The notification's supporting line, or empty when the payload carries none. */
export function notificationBody(notification: Notification): string {
	for (const key of BODY_KEYS) {
		const value = notification.payload[key]
		if (typeof value === "string" && value) return value
	}
	return ""
}

/** A deep link into the app, when the payload names one. */
export function notificationHref(notification: Notification): string | undefined {
	const value = notification.payload.url ?? notification.payload.href
	return typeof value === "string" && value.startsWith("/") ? value : undefined
}

const CATEGORY_ICONS: Record<NotificationCategory, string> = {
	order: "local_shipping",
	promotion: "sell",
	system: "info",
	chat: "chat_bubble",
	social: "group",
}

export function notificationIcon(category: NotificationCategory): string {
	return CATEGORY_ICONS[category] ?? "info"
}

export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
	order: "Đơn hàng",
	promotion: "Khuyến mãi",
	system: "Hệ thống",
	chat: "Tin nhắn",
	social: "Cộng đồng",
}
