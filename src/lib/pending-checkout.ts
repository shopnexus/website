import type { OrderItem, PaymentSessionId } from "@/api/generated/types.gen"

/**
 * One unfinished checkout: the lines it covers, and the session that will pay for them.
 *
 * Grouped by `payment_session_id` because that is what a checkout *is* on the wire — the
 * contract calls it "the single session covering every line of this checkout". Rendering
 * the raw lines instead would show a two-item basket as two separate things to pay, each
 * with a button leading to the same gateway for the same money.
 */
export type PendingCheckout = {
	sessionId: PaymentSessionId
	items: OrderItem[]
	total: number
	currency: string
	/** Oldest line in the group — a checkout is opened all at once. */
	createdAt: string
}

export function groupPendingCheckouts(items: ReadonlyArray<OrderItem>): PendingCheckout[] {
	const bySession = new Map<PaymentSessionId, PendingCheckout>()

	for (const item of items) {
		const existing = bySession.get(item.payment_session_id)
		if (existing) {
			existing.items.push(item)
			existing.total += item.total_amount
			if (item.created_at < existing.createdAt) existing.createdAt = item.created_at
			continue
		}
		bySession.set(item.payment_session_id, {
			sessionId: item.payment_session_id,
			items: [item],
			total: item.total_amount,
			currency: item.currency,
			createdAt: item.created_at,
		})
	}

	// Newest first: an abandoned checkout is most likely to be resumed while the buyer
	// still remembers opening it.
	return [...bySession.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}
