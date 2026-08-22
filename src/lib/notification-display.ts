import type { NotificationCategory } from "@/api/generated/types.gen"

/**
 * How a notification is drawn.
 *
 * Only presentation lives here. A notification arrives already written — `title`, `body` and
 * `href` are rendered by the server in the reader's own language — so there is nothing to
 * derive and nothing to probe. This file used to guess a body by trying `payload.body`,
 * `payload.message`, `payload.description` and `payload.text` in turn, and a link by trying
 * `payload.url` and `payload.href`: no emitter ever set any of the six, so every row rendered
 * as a bare title with nowhere to go.
 *
 * Keyed by category rather than by kind. There are two dozen kinds and they grow with every
 * fact the platform learns to tell somebody; what a reader needs at a glance is which part of
 * their life this is about, which is exactly what the category says.
 */
export interface CategoryStyle {
	/** A Material Symbols ligature. */
	icon: string
	label: string
	/** Container and content colours, from the theme's tonal pairs. */
	bg: string
	color: string
}

export const CATEGORY_STYLES: Record<NotificationCategory, CategoryStyle> = {
	order: {
		icon: "local_shipping",
		label: "Đơn hàng",
		bg: "bg-secondary-container",
		color: "text-on-secondary-container",
	},
	promotion: {
		icon: "sell",
		label: "Khuyến mãi",
		bg: "bg-tertiary-container",
		color: "text-on-tertiary-container",
	},
	chat: {
		icon: "chat_bubble",
		label: "Tin nhắn",
		bg: "bg-primary-container",
		color: "text-on-primary-container",
	},
	social: {
		icon: "group",
		label: "Cộng đồng",
		bg: "bg-surface-container-highest",
		color: "text-on-surface-variant",
	},
	system: {
		icon: "verified_user",
		label: "Hệ thống",
		bg: "bg-surface-container-high",
		color: "text-outline",
	},
}

/** A category the client does not know renders as a system notice rather than a blank box. */
export function categoryStyle(category: NotificationCategory): CategoryStyle {
	return CATEGORY_STYLES[category] ?? CATEGORY_STYLES.system
}
