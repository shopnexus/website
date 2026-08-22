import type {
	AccountId,
	Message,
	MessageId,
	MessageQuote,
	MessageReplyRef,
} from "@/api/generated/types.gen"
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

/**
 * The message the "new messages" line goes above: the first one that is not the caller's
 * own and arrived after their read mark.
 *
 * `unread` decides whether there is a line at all — it is the server's count, and the only
 * thing that knows about messages past the page that has been loaded. A null mark with
 * unread messages means the caller has read nothing, so the line goes above the first
 * incoming message in the thread.
 */
export function firstUnreadMessageId(
	messages: readonly Message[],
	readAt: string | null,
	accountId: AccountId | undefined,
	unread: number,
): MessageId | undefined {
	if (unread <= 0) return undefined
	const mark = readAt ? new Date(readAt).getTime() : null

	for (const message of messages) {
		if (isOwnMessage(message, accountId)) continue
		if (mark === null || new Date(message.created_at).getTime() > mark) return message.id
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

// ── Quoting one message from another ────────────────────────────────────────

/** The two lines a quote shows, wherever it is shown. */
export interface QuoteLines {
	author: string
	summary: string
}

const SUPPORT_AUTHOR = "ShopNexus Hỗ trợ"

/**
 * Whose words are being quoted, in the vocabulary the thread already uses.
 *
 * "Bạn" rather than the reader's own name, because that is how the rest of the inbox refers
 * to them; the desk is named as the platform, since that is who answered.
 */
function authorLabel(
	senderId: AccountId | null,
	fromSupport: boolean,
	accountId: AccountId | undefined,
	counterpartyName: string | undefined,
): string {
	if (fromSupport) return SUPPORT_AUTHOR
	if (!senderId) return "Tin nhắn hệ thống"
	if (senderId === accountId) return "Bạn"
	return counterpartyName ?? "Người dùng"
}

/** What a quote says, for the cases where what it said was not words. */
function summaryOf(redacted: boolean, text: string, attachments: number): string {
	if (redacted) return "Tin nhắn đã được thu hồi"
	if (text) return text
	if (attachments > 0) return attachments > 1 ? `${attachments} tệp đính kèm` : "Hình ảnh"
	return "Tin nhắn"
}

/** A resolved quote, as the bubble above a reply renders it. */
export function quoteLines(
	quote: MessageQuote,
	accountId: AccountId | undefined,
	counterpartyName: string | undefined,
): QuoteLines {
	return {
		author: authorLabel(quote.sender_id, quote.from_support, accountId, counterpartyName),
		summary: summaryOf(quote.redacted, quote.preview, quote.attachments),
	}
}

/**
 * The reply being composed, taken from the message it answers.
 *
 * The reference is `{ id, created_at }` because that is the hypertable's primary key — the
 * server resolves the quote with a point lookup rather than a scan of every chunk, and the
 * client already holds both halves.
 */
export interface ReplyDraft extends QuoteLines {
	ref: MessageReplyRef
}

export function replyDraft(
	message: Message,
	accountId: AccountId | undefined,
	counterpartyName: string | undefined,
): ReplyDraft {
	return {
		ref: { id: message.id, created_at: message.created_at },
		author: authorLabel(
			message.sender_id,
			message.from_support,
			accountId,
			counterpartyName,
		),
		summary: summaryOf(isRedacted(message), message.body, message.attachments.length),
	}
}
