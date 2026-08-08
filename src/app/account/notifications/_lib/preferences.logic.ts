import type {
	NotificationCategory,
	NotificationChannel,
	NotificationPreference,
} from "@/api/generated/types.gen"

/**
 * The preference grid, as data.
 *
 * The axes come from the enums, not from whichever rows the server returned: a stored row
 * exists only where the account differs from the default, so deriving the axes from the
 * response would hide exactly the channels a user came here to turn on.
 */
export const CATEGORIES: NotificationCategory[] = ["order", "chat", "promotion", "social", "system"]
export const CHANNELS: NotificationChannel[] = ["in-app", "push", "email", "sms"]

export const CHANNEL_LABELS: Record<NotificationChannel, string> = {
	"in-app": "Trong ứng dụng",
	push: "Thông báo đẩy",
	email: "Email",
	sms: "SMS",
}

export const CHANNEL_ICONS: Record<NotificationChannel, string> = {
	"in-app": "notifications",
	push: "phone_iphone",
	email: "mail",
	sms: "sms",
}

export const CATEGORY_HINTS: Record<NotificationCategory, string> = {
	order: "Trạng thái đơn hàng, vận chuyển, hoàn tiền.",
	chat: "Tin nhắn mới và đề nghị giá trong hội thoại.",
	promotion: "Giảm giá và ưu đãi từ người bán bạn theo dõi.",
	social: "Người theo dõi mới, đánh giá và trả lời.",
	system: "Bảo mật tài khoản và thông báo từ ShopNexus.",
}

/** The key a draft toggle is stored under. */
export function keyOf(category: NotificationCategory, channel: NotificationChannel): string {
	return `${category}:${channel}`
}

export function parseKey(key: string): [NotificationCategory, NotificationChannel] {
	return key.split(":") as [NotificationCategory, NotificationChannel]
}

/** The stored rows as a lookup, so a cell reads in constant time. */
export function indexPreferences(
	preferences: readonly NotificationPreference[] | undefined,
): Map<string, NotificationPreference> {
	const index = new Map<string, NotificationPreference>()
	for (const preference of preferences ?? []) {
		index.set(keyOf(preference.category, preference.channel), preference)
	}
	return index
}

/**
 * Only what the user changed.
 *
 * The server replaces the rows it is given and leaves the rest inherited, so sending the
 * whole grid would freeze every untouched default into an explicit choice — and a later
 * change to a default would then never reach the accounts that never chose anything.
 */
export function draftToItems(
	draft: Record<string, boolean>,
): Array<{ category: NotificationCategory; channel: NotificationChannel; is_enabled: boolean }> {
	return Object.entries(draft).map(([key, is_enabled]) => {
		const [category, channel] = parseKey(key)
		return { category, channel, is_enabled }
	})
}
