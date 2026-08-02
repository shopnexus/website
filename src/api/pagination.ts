import type { InfiniteData } from "@tanstack/react-query"
import type { CursorMeta, PageMeta } from "./generated/types.gen"

/**
 * The two pagination styles this API uses, as options you spread into a generated
 * `*InfiniteOptions()` call.
 *
 * The generated code knows how to *send* the next page — it saw `page` and `cursor` in
 * the query parameters and wired the page param into the right one — but it cannot know
 * when to stop, because that depends on the response envelope rather than the request.
 * So `getNextPageParam` lives here, once per style, instead of being rewritten at every
 * call site.
 *
 * Which style an endpoint uses is not a choice: page+limit for anything browsed or
 * ranked (`/listings`, `/me/following`, `/tags`), cursor+limit for the append-only
 * streams (`/orders`, `/drafts`, `/notifications`, `/conversations`, reviews, refunds).
 * Guessing wrong is a compile error — the generated page param is typed `number` for one
 * and `string` for the other.
 */

type PageEnvelope<T> = { data: ReadonlyArray<T>; meta: PageMeta }
type CursorEnvelope<T> = { data: ReadonlyArray<T>; meta: CursorMeta }

export const pagePagination = {
	initialPageParam: 1,
	getNextPageParam: (last: PageEnvelope<unknown>): number | undefined => {
		const { page, limit, total_count } = last.meta
		// A ranked result (relevance, semantic, recommended) reports total_count: null,
		// because the search never visits the rows it does not return. With no total, a
		// short page is the only signal that the end has been reached.
		if (total_count === null) {
			return last.data.length < limit ? undefined : page + 1
		}
		return page * limit >= total_count ? undefined : page + 1
	},
} as const

export const cursorPagination = {
	// The empty cursor, which the server documents as the first page rather than as an
	// error (`common.ParseCursor`). It goes out as a bare `cursor=` on the first request
	// of a feed, which is cosmetically untidy and functionally exact.
	//
	// The alternative — an object page param, which the generated queryFn would splice
	// into the request and thereby omit `cursor` altogether — cannot be typed here: the
	// param is `string | Pick<Options, 'body'|'headers'|'path'|'query'>`, and the object
	// arm is per-operation, so `/orders` would need its required `role` repeated in it.
	initialPageParam: "",
	getNextPageParam: (last: CursorEnvelope<unknown>): string | undefined =>
		last.meta.next_cursor ?? undefined,
} as const

/**
 * Collapse the pages into the flat list a component renders.
 *
 * Called from a `useMemo` in each feed hook rather than passed as TanStack's `select`,
 * because the generated `*InfiniteOptions()` bakes its own `TData` into the options
 * object it returns — overriding `select` to return a different shape is a type error,
 * and casting past it would throw away exactly the checking that makes generation worth
 * having.
 */
export function flattenPages<T>(
	data: InfiniteData<{ data: ReadonlyArray<T> }> | undefined,
): T[] {
	if (!data) return []
	return data.pages.flatMap((page) => [...page.data])
}

/**
 * Matching rows across the whole collection, or null when the query was ranked and
 * cannot know one. Page-paginated reads only; a cursor stream has no total by design.
 */
export function totalCountOf(data: InfiniteData<PageEnvelope<unknown>> | undefined): number | null {
	return data?.pages[0]?.meta.total_count ?? null
}
