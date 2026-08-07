import type { AccountId, Message, MessageId } from "@/api/generated/types.gen"
import { groupByDay, type DayGroup } from "@/lib/day"

/**
 * What a thread means, derived from what the server already sent.
 *
 * Nothing here fetches or guesses: a receipt is `conversation.counterparty_read_at`
 * against a message's own instant, a redaction is `deleted_at`, an edit is `edited_at`.
 */

/** Whose message this is. A system note and a support reply both have no sender. */
export function isOwnMessage(message: Message, accountId: AccountId | undefined): boolean {
	return Boolean(message.sender_id) && message.sender_id === accountId
}

/** A redacted message: the row survives so the thread has no unexplained gap. */
export function isRedacted(message: Message): boolean {
	return message.deleted_at !== null
}

/**
 * Only the sender may rewrite or unsend, and only an ordinary message — a system message
 * has no author, and a redacted one has nothing left to change.
 */
export function canModifyMessage(message: Message, accountId: AccountId | undefined): boolean {
	return message.type === "user" && isOwnMessage(message, accountId) && !isRedacted(message)
}

/**
 * Seen by the other side.
 *
 * The mark is an instant, so every message at or before it has been read. Comparing
 * instants rather than counting rows is what makes this survive a page of history
 * arriving later.
 */
export function isSeenBy(message: Message, counterpartyReadAt: string | null | undefined): boolean {
	if (!counterpartyReadAt) return false
	return new Date(message.created_at).getTime() <= new Date(counterpartyReadAt).getTime()
}

/**
 * The one message that carries the receipt: the newest one the caller sent. Marking every
 * sent message read turns the thread into a column of ticks that says nothing.
 */
export function lastOwnMessageId(
	messages: readonly Message[],
	accountId: AccountId | undefined,
): MessageId | undefined {
	for (let i = messages.length - 1; i >= 0; i--) {
		if (isOwnMessage(messages[i], accountId)) return messages[i].id
	}
	return undefined
}

/** The offer a system card points at, or undefined on an ordinary message. */
export function offerIdOf(message: Message): string | undefined {
	const value = message.card.offer_id
	return typeof value === "string" ? value : undefined
}

/** The listing most recently pointed at in a thread — a conversation has none of its own. */
export function lastReferencedListingId(messages: readonly Message[]): string | undefined {
	for (let i = messages.length - 1; i >= 0; i--) {
		const ref = messages[i].refs.listing_id
		if (typeof ref === "string" && ref) return ref
	}
	return undefined
}

/** The thread as days, oldest first — the order it is read in. */
export function groupMessagesByDay(
	messages: readonly Message[],
	now: number = Date.now(),
): Array<DayGroup<Message>> {
	return groupByDay(messages, (message) => message.created_at, now)
}

export function formatClock(iso: string): string {
	return new Date(iso).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })
}
