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
	offers: "getOffers",
	drafts: "getDrafts",
	draft: "getDraftsById",
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
