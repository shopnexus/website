"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
	deleteAdminAccountsByIdSuspension,
	deleteAdminCategoriesById,
	deleteAdminModeratorsById,
	deleteAdminTagsBySlug,
	patchAdminCategoriesById,
	patchAdminOptionsById,
	postAdminAccountsByIdSuspension,
	postAdminCategories,
	postAdminModerators,
	putAdminTagsBySlug,
} from "@/api/generated/sdk.gen"
import {
	getAdminAccountsOptions,
	getAdminOptionsOptions,
	getTagsOptions,
} from "@/api/generated/@tanstack/react-query.gen"
import type {
	AccountId,
	CategoryId,
	CreateCategoryRequest,
	CreateModeratorRequest,
	GetAdminAccountsData,
	GetTagsData,
	OptionCategoryName,
	PutTagRequest,
	SaveOptionRequest,
	SuspendAccountRequest,
	TagSlug,
	UpdateCategoryRequest,
} from "@/api/generated/types.gen"
import { OPERATIONS, invalidate } from "@/api/invalidate"
import { unwrapData } from "@/api/unwrap"
import { useMe } from "@/hooks/api/useAccount"

/**
 * The staff surfaces that change *configuration* rather than decide a case: who may sign
 * in, who moderates, and the three vocabularies a listing and a checkout are built from
 * (categories, tags, payment/transport options).
 *
 * Every write here moves a public read as well as a staff one — a renamed category is on
 * the shopper's sidebar, a switched-off carrier is in the buyer's chooser — so the
 * invalidations below always name both.
 */

/**
 * Whether the caller may write on these surfaces.
 *
 * The split is real, not cosmetic: suspending an account is a moderator's job, while the
 * three vocabularies and the moderator roster are admin-only. A moderator reaching this
 * section should see what is configured and be told why the buttons are absent — hiding
 * them with no explanation is how "the page is broken" gets reported.
 *
 * The gate that counts is the server's; this only decides what is worth offering.
 */
export function useIsAdmin(): { isAdmin: boolean; isLoading: boolean } {
	const { data: me, isLoading } = useMe()
	return { isAdmin: me?.role === "admin", isLoading }
}

// ── Accounts ─────────────────────────────────────────────────────────────────

/** The filters `/admin/accounts` accepts, minus the paging the caller passes separately. */
export type AdminAccountFilters = Omit<NonNullable<GetAdminAccountsData["query"]>, "page">

/**
 * One page of accounts. Page-paginated rather than a load-more feed, because a moderator
 * arriving from a report is doing a lookup — `q` is an exact match on an identifier — and
 * a pager is what lets them say "row 3 of page 2" to a colleague.
 */
export function useAdminAccounts(filters: AdminAccountFilters = {}, page = 1) {
	return useQuery({
		...getAdminAccountsOptions({ query: { ...filters, page } }),
		// A suspension decided in another tab has to be visible here, so this is not held.
		staleTime: 0,
	})
}

export function useSuspendAccount() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, body }: { id: AccountId; body: SuspendAccountRequest }) => {
			const { data } = await postAdminAccountsByIdSuspension({
				path: { id },
				body,
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.adminAccounts),
	})
}

export function useReinstateAccount() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: AccountId) => {
			const { data } = await deleteAdminAccountsByIdSuspension({
				path: { id },
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.adminAccounts),
	})
}

// ── Moderators ───────────────────────────────────────────────────────────────

/**
 * Provisioning a moderator, which is the only way the role is ever granted — there is no
 * "promote this account" route, because a moderator decides disputes and takes listings
 * down, so the row is created for the job rather than borrowed from a trader's account.
 */
export function useCreateModerator() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (body: CreateModeratorRequest) => {
			const { data } = await postAdminModerators({ body, throwOnError: true })
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.adminAccounts),
	})
}

/** Demotes to a plain user and drops their sessions. The account itself survives. */
export function useRevokeModerator() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: AccountId) => {
			await deleteAdminModeratorsById({ path: { id }, throwOnError: true })
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.adminAccounts),
	})
}

// ── Categories ───────────────────────────────────────────────────────────────

export function useCreateCategory() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (body: CreateCategoryRequest) => {
			const { data } = await postAdminCategories({ body, throwOnError: true })
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.categories),
	})
}

/**
 * Rename, re-describe, or re-parent. A re-parent that would put a category under its own
 * descendant is refused by the server (422) under an advisory lock — this hook does not
 * pre-check it, because the tree it holds is a snapshot and two admins re-parenting at
 * once is exactly the case a client-side check cannot see.
 */
export function useUpdateCategory() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, body }: { id: CategoryId; body: UpdateCategoryRequest }) => {
			const { data } = await patchAdminCategoriesById({ path: { id }, body, throwOnError: true })
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.categories),
	})
}

/** Children are promoted to roots rather than deleted with it, so a branch is never lost. */
export function useDeleteCategory() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: CategoryId) => {
			await deleteAdminCategoriesById({ path: { id }, throwOnError: true })
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.categories, OPERATIONS.listings),
	})
}

// ── Tags ─────────────────────────────────────────────────────────────────────

/** The filters `/tags` accepts, minus the paging the caller passes separately. */
export type AdminTagFilters = Omit<NonNullable<GetTagsData["query"]>, "page" | "near">

/**
 * One page of the tag dictionary. The staff view reads the same public endpoint as the
 * shopper's type-ahead — there is no admin list — so `q` here is the same prefix match on
 * the slug.
 */
export function useAdminTags(filters: AdminTagFilters = {}, page = 1) {
	return useQuery({
		...getTagsOptions({ query: { ...filters, page } }),
		staleTime: 0,
	})
}

/**
 * Upsert by slug. There is no create-versus-update: the slug *is* the tag, so writing to
 * a slug nobody has used creates it and writing to an existing one edits its description.
 * Which is also why a "rename" is not expressible here — see `TagFormDialog`.
 */
export function usePutTag() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ slug, body }: { slug: TagSlug; body: PutTagRequest }) => {
			const { data } = await putAdminTagsBySlug({ path: { slug }, body, throwOnError: true })
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.tags),
	})
}

/** Deleting a tag also detaches it from every listing that carried it. */
export function useDeleteTag() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (slug: TagSlug) => {
			await deleteAdminTagsBySlug({ path: { slug }, throwOnError: true })
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.tags, OPERATIONS.listings),
	})
}

// ── Options ──────────────────────────────────────────────────────────────────

/**
 * Every row of a category including the ones switched off, plus the providers this
 * deployment has registered — which is the set a row may be moved to, so a switch is a
 * choice from a list rather than a guess the server answers with a 422.
 *
 * Unlike the category tree and the tag dictionary, this read is itself admin-only, so
 * `enabled` exists to keep a moderator's visit from firing a request whose only outcome is
 * a 403 toast on a page that already explains itself.
 */
export function useAdminOptions(category: OptionCategoryName, enabled = true) {
	return useQuery({
		...getAdminOptionsOptions({ query: { category } }),
		select: unwrapData,
		staleTime: 0,
		enabled,
	})
}

/**
 * The operator's edit. The slug and the category are not in the request at all: a settled
 * payment and a shipped parcel hold the slug as plain text for ever, so it is permanent.
 */
export function useSaveOption() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({
			id,
			category,
			body,
		}: {
			id: string
			category: OptionCategoryName
			body: SaveOptionRequest
		}) => {
			const { data } = await patchAdminOptionsById({
				path: { id },
				query: { category },
				body,
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.adminOptions, OPERATIONS.options),
	})
}
