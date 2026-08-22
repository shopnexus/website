import type { Category, PublicAccount, Reputation } from "@/api/generated/types.gen"

/**
 * The shapes and the one pure rule the reads around a listing need.
 *
 * The reads themselves are query hooks in the page now rather than awaits on the server. What
 * belongs here is what is not a fetch: the seller-card shape, and the walk from a category up to
 * its root — which is a function of the tree the client already holds, not a request of its own.
 */

/** What the seller card renders beyond the name and the avatar. Either half may be missing. */
export interface SellerStanding {
	account: PublicAccount | null
	reputation: Reputation | null
}

/** A rung of the breadcrumb: the id is what the link filters by. */
export interface CategoryCrumb {
	id: string
	name: string
}

/**
 * Root-first path to `id`, and just that category when its parents are not in the list.
 *
 * `GET /categories` answers the whole flat tree with a `parent_id` per row — one cached read the
 * whole app shares — so the ancestors are a walk over what is already in memory rather than a
 * request each. The breadcrumb used to show the leaf alone, which told a shopper looking at a
 * phone case that it was in "Ốp lưng" and nothing about where that sits; the ancestor links are
 * how somebody widens a search that was too narrow.
 *
 * The walk is bounded by the number of categories rather than by trusting `parent_id` to
 * terminate: a tree is what the API returns, but a cycle in one would otherwise hang the render
 * of every product page under it.
 */
export function categoryPath(categories: readonly Category[], id: string): CategoryCrumb[] {
	const byId = new Map(categories.map((category) => [category.id, category]))
	const path: CategoryCrumb[] = []
	let current = byId.get(id)
	while (current && path.length < categories.length) {
		path.unshift({ id: current.id, name: current.name })
		current = current.parent_id ? byId.get(current.parent_id) : undefined
	}
	return path
}
