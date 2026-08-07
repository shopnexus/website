import type { AccountId, Conversation } from "@/api/generated/types.gen"
import { isSeenBy, offerIdOf } from "@/components/chat/chat.logic"

/**
 * What a row in the conversation list says.
 *
 * Everything here reads the `Conversation` the server already sent — its `last_message`,
 * its `unread`, its `counterparty_read_at`. Nothing is fetched per row.
 */

const DAY_MS = 86_400_000

/**
 * The preview line.
 *
 * `last_message.body || "Hình ảnh/Tệp"` was wrong in four different ways: a redacted
 * message showed its cleared body as a file, a price negotiation showed nothing at all,
 * an empty thread claimed to hold a file, and your own last message was indistinguishable
 * from theirs — which is the difference between "they replied" and "they have not".
 */
export function conversationPreview(conversation: Conversation, accountId: AccountId | undefined): string {
	const message = conversation.last_message
	if (!message) return "Chưa có tin nhắn"

	const mine = Boolean(message.sender_id) && message.sender_id === accountId
	const prefix = mine ? "Bạn: " : ""

	if (message.deleted_at !== null) return `${prefix}Tin nhắn đã được thu hồi`
	if (offerIdOf(message)) return "Đề nghị giá"
	if (message.body) return `${prefix}${message.body}`
	if (message.attachments.length > 0) {
		return `${prefix}${message.attachments.length > 1 ? `${message.attachments.length} tệp đính kèm` : "Hình ảnh"}`
	}
	return `${prefix}Tin nhắn`
}

/**
 * The timestamp beside the name. A thread from last month rendered as "09:14" — the clock
 * is only the answer for today.
 */
export function conversationTimeLabel(iso: string, now: number = Date.now()): string {
	const date = new Date(iso)
	const startOf = (value: Date) =>
		new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()
	const diffDays = Math.round((startOf(new Date(now)) - startOf(date)) / DAY_MS)

	if (diffDays <= 0) return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
	if (diffDays === 1) return "Hôm qua"
	if (diffDays < 7) return `${diffDays} ngày`
	return date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })
}

/**
 * Whether the caller's own last message has been read by the other side — the tick in the
 * list, so "did they see it" is answered without opening the thread.
 */
export function isLastMessageSeen(
	conversation: Conversation,
	accountId: AccountId | undefined,
): boolean {
	const message = conversation.last_message
	if (!message || message.sender_id !== accountId) return false
	return isSeenBy(message, conversation.counterparty_read_at)
}

/**
 * Search across the threads already loaded.
 *
 * Client-side on purpose: `GET /conversations` takes only `cursor` and `limit`, so there
 * is no server-side search to call. It matches the counterparty and the preview line,
 * which is what the row actually shows — searching a body the row does not display would
 * return rows that look like they do not match.
 */
export function matchesQuery(
	conversation: Conversation,
	query: string,
	accountId: AccountId | undefined,
): boolean {
	const needle = query.trim().toLowerCase()
	if (!needle) return true

	const haystack = [
		conversation.counterparty.name,
		conversationPreview(conversation, accountId),
	].join(" ")

	return haystack.toLowerCase().includes(needle)
}
