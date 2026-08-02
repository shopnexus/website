/**
 * Strip the response envelope.
 *
 * Every successful body in this API is `{ data: … }`, and sometimes `{ data, meta }`.
 * The root is reserved that way on purpose — an Order has its own `items`, a Transaction
 * its own `error` — but it means a component that just wants the contact list would
 * otherwise read `query.data.data`.
 *
 * Passed as TanStack's `select`, so the unwrapping happens once per fetch rather than on
 * every render, and the component's `data` is the payload itself. Defined at module
 * scope because `select` is recomputed whenever its identity changes.
 */
export function unwrapData<T>(envelope: { data: T }): T {
	return envelope.data
}
