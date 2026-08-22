import type { AccountId, Conversation, ListingId } from "@/api/generated/types.gen"
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
 * The item a thread is about, or undefined when the last message pointed at none.
 *
 * A conversation carries no listing of its own — it is between two accounts and outlives
 * any one item — so the row follows what was last referenced, the same rule the panel
 * uses. Reading the row's own `last_message` rather than the thread's history is what
 * keeps this to one batched lookup for the whole list.
 */
export function conversationListingId(conversation: Conversation): ListingId | undefined {
	const ref = conversation.last_message?.refs.listing_id
	return typeof ref === "string" && ref ? (ref as ListingId) : undefined
}

/**
 * Query keys that belong to whichever conversation is open, and mean nothing once it is not.
 *
 * `listing_id` is the only one today. It is a *hint* — "this thread is about this item" — set by
 * whatever linked here: the chat button on a product page, the offer form after a negotiation.
 * The thread itself carries no listing (a conversation is between two accounts and outlives any
 * one item), so the hint is what lets the panel and the composer name an item before any message
 * has referenced it.
 */
const CONVERSATION_SCOPED_PARAMS = ["listing_id"] as const

/**
 * The next query string, with any hint that belonged to the conversation being left dropped.
 *
 * This is the fix for a bug worth spelling out, because the symptom looked cosmetic and was not.
 * `listing_id` lived in the URL beside `c` but independently of it, so opening another thread
 * rewrote `c` and kept the hint: the reader clicked a different shop and the panel kept showing
 * the item they had been negotiating with the *previous* one. `useInbox` guarded the hint with
 * `activeId === queryC`, which cannot catch this — once `c` is rewritten the guard passes again,
 * and it only ever caught a `c` naming a thread that is not in the list.
 *
 * Cosmetic is the half that was visible. The composer sends `refs: { listing_id }` from the same
 * value, so a message sent in the new thread was tagged with the old shop's listing — and the
 * conversation list reads `last_message.refs.listing_id` to decide what a row is about, so the
 * wrong item would then stick to that thread for good.
 *
 * Enforced here rather than at the one call site that changes `c` today: the dependency is a
 * property of the query, so the next thing that navigates between threads gets it for free. A
 * caller setting both at once — the deep links from a product page do — is left alone, because
 * that pair is coherent by construction.
 */
export function nextInboxQuery(
	current: URLSearchParams,
	changes: Record<string, string | null>,
): URLSearchParams {
	const next = new URLSearchParams(current.toString())
	const movingThread = "c" in changes && changes.c !== current.get("c")

	for (const [key, value] of Object.entries(changes)) {
		if (value === null) next.delete(key)
		else next.set(key, value)
	}
	if (movingThread) {
		for (const key of CONVERSATION_SCOPED_PARAMS) {
			if (!(key in changes)) next.delete(key)
		}
	}
	return next
}

/**
 * Search across the threads already loaded.
 *
 * Client-side on purpose: `GET /conversations` takes only `cursor` and `limit`, so there
 * is no server-side search to call. It matches what the row actually shows — the
 * counterparty, the preview line, and the item name once that has resolved — because
 * searching a body the row does not display returns rows that look like they do not match.
 */
export function matchesQuery(
	conversation: Conversation,
	query: string,
	accountId: AccountId | undefined,
	listingName?: string,
): boolean {
	const needle = query.trim().toLowerCase()
	if (!needle) return true

	const haystack = [
		conversation.counterparty.name,
		conversationPreview(conversation, accountId),
		listingName ?? "",
	].join(" ")

	return haystack.toLowerCase().includes(needle)
}

/**
 * A label split around what the search matched, so a hit is visible in the row rather
 * than left for the reader to find. Empty query returns the whole string unmarked.
 */
export function highlightParts(text: string, query: string): Array<{ text: string; match: boolean }> {
	const needle = query.trim().toLowerCase()
	if (!needle) return [{ text, match: false }]

	const parts: Array<{ text: string; match: boolean }> = []
	const haystack = text.toLowerCase()
	let cursor = 0

	for (let at = haystack.indexOf(needle); at !== -1; at = haystack.indexOf(needle, cursor)) {
		if (at > cursor) parts.push({ text: text.slice(cursor, at), match: false })
		parts.push({ text: text.slice(at, at + needle.length), match: true })
		cursor = at + needle.length
	}

	if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false })
	return parts
}
