import type { QueryClient } from "@tanstack/react-query"

/**
 * Cache invalidation, addressed by operation.
 *
 * Every generated query key is a one-element array `[{ _id, baseUrl, query?, path? }]`,
 * where `_id` is the operation name. TanStack matches query keys partially, so
 * `[{ _id: "getContacts" }]` matches every cached `getContacts` — each filter
 * combination, each page, and the infinite variant alongside the plain one.
 *
 * Naming the operation rather than the URL is what keeps this honest: rename a route in
 * the spec and the operation id changes with it, so a stale invalidation target fails to
 * compile instead of silently invalidating nothing.
 */

/** Operations whose cached results some mutation somewhere has to drop. */
export const OPERATIONS = {
	me: "getMe",
	contacts: "getContacts",
	cartItems: "getCartItems",
	listings: "getListings",
	listing: "getListingsById",
	following: "getMeFollowing",
	devices: "getMeDevices",
	oauthIdentities: "getMeOauthIdentities",
	identityDocuments: "getMeIdentityDocuments",
	notifications: "getNotifications",
	notificationsUnread: "getNotificationsUnreadCount",
	notificationPreferences: "getNotificationPreferences",
	conversations: "getConversations",
	conversation: "getConversationsById",
	messages: "getConversationsByIdMessages",
	conversationsUnread: "getConversationsUnreadCount",
	orders: "getOrders",
	order: "getOrdersById",
	orderFeedback: "getOrdersByOrderIdFeedback",
	refunds: "getRefunds",
	refund: "getRefundsById",
	offers: "getOffers",
	// The single offer behind a negotiation card. This is the one the inbox actually
	// renders (`OfferMessageCard` → `useOffer`), so a counter-offer that does not
	// invalidate it leaves the other party looking at terms that are off the table.
	offer: "getOffersById",
	drafts: "getDrafts",
	draft: "getDraftsById",
	tickets: "getTickets",
	ticket: "getTicketsById",
	// Product reviews. Both are dropped together by a vote, a reply or a new review: the
	// listing page holds the paged list and a single-review read holds the whole reply
	// thread, and a tally that moved on one is stale on the other.
	listingReviews: "getListingsByListingIdReviews",
	review: "getReviewsById",
	// A new review moves the seller's product-review average, which the shop header reads.
	reputation: "getAccountsByAccountIdReputation",
	// Money the seller holds and the paperwork behind moving it out. A withdrawal debits
	// the wallet the moment it is raised and credits it back when it is cancelled, so the
	// balance, the ledger and the request list are always stale together.
	wallets: "getWallets",
	walletTransactions: "getWalletsByCurrencyTransactions",
	bankAccounts: "getBankAccounts",
	withdrawals: "getWithdrawals",
	taxInfo: "getTaxInfo",
	// Counts and daily buckets over the caller's own orders, which every listing or order
	// write can move.
	ordersSummary: "getOrdersSummary",
} as const

export type Operation = (typeof OPERATIONS)[keyof typeof OPERATIONS]

/**
 * Invalidate every cached result of the given operations.
 *
 * Returns the promise so a mutation's `onSuccess` can await it — awaiting means the
 * mutation stays pending until the refetch lands, so a form's spinner covers the whole
 * round trip rather than stopping while the list underneath is still the old one.
 */
export function invalidate(client: QueryClient, ...operations: Operation[]): Promise<void> {
	return Promise.all(
		operations.map((id) => client.invalidateQueries({ queryKey: [{ _id: id }] })),
	).then(() => undefined)
}

/**
 * Drop everything. Used when the identity behind the cache changes — a sign-in or a
 * sign-out — where no individual key is wrong so much as all of them belong to someone
 * else. `removeQueries` rather than `invalidateQueries`: refetching the previous user's
 * queries as the new user is exactly what must not happen.
 */
export function clearCache(client: QueryClient): void {
	client.removeQueries()
}
