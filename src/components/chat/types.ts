import type { ConversationId, Message, Resource, ResourceId } from "@/api/generated/types.gen"

/** Whoever is on the other side of a thread, as much of them as a thread needs. */
export interface Counterparty {
	name: string
	avatarUrl?: string | null
}

/**
 * A file already uploaded and confirmed, waiting in the composer for the message that
 * will carry it. It is a real `resource` the moment it appears here — the tray holds ids,
 * not bytes — so removing one only drops it from the next send.
 */
export interface PendingAttachment {
	id: ResourceId
	name: string
	resource: Resource
	previewUrl?: string
}

export interface ChatThreadProps {
	conversationId: ConversationId | undefined
	/** Whoever is on the other side. Absent while the thread is still resolving. */
	counterparty?: Counterparty
	/** Attached to every outgoing message — what the sender is pointing at. */
	refs?: Record<string, unknown>
	/** How many unread messages the thread has, so opening it can post the read receipt. */
	unread?: number
	/**
	 * How far the other side has read, from the conversation row. This is the read
	 * receipt: no message carries a delivery status of its own.
	 */
	counterpartyReadAt?: string | null
	/**
	 * How far the *caller* had read when the thread was opened, from the conversation row.
	 * It is where the "Tin nhắn mới" line goes, and it has to come from outside: opening a
	 * thread posts the read receipt, so by the time the thread could ask, the answer is
	 * already "all of it".
	 */
	readAt?: string | null
	placeholder?: string
	/**
	 * Report the other side's message. Optional, and the host supplies the behaviour: what
	 * a report *is* here is a `report-message` ticket, which the inbox owns — a thread has
	 * no business knowing the route.
	 */
	onReportMessage?: (message: Message) => void
}
