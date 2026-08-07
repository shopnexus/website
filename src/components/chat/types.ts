import type { ConversationId, Resource, ResourceId } from "@/api/generated/types.gen"

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
	placeholder?: string
}
