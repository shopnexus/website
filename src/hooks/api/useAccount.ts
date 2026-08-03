"use client"

import { useMemo } from "react"
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
	deleteDevicesById,
	deleteFollowsByAccountId,
	deleteMeOauthIdentitiesByProvider,
	patchMe,
	patchMeProfile,
	postIdentityDocuments,
	postMeUploads,
	postMeUploadsByIdConfirmation,
	putFollowsByAccountId,
	putPassword,
} from "@/api/generated/sdk.gen"
import {
	getMeDevicesOptions,
	getMeFollowingInfiniteOptions,
	getMeIdentityDocumentsOptions,
	getMeOauthIdentitiesOptions,
	getMeOptions,
} from "@/api/generated/@tanstack/react-query.gen"
import type {
	AccountId,
	ChangePasswordRequest,
	DeviceId,
	OAuthProvider,
	StartIdentityVerificationRequest,
	UpdateAccountRequest,
	UpdateProfileRequest,
} from "@/api/generated/types.gen"
import { OPERATIONS, invalidate } from "@/api/invalidate"
import { flattenPages, pagePagination, totalCountOf } from "@/api/pagination"
import { unwrapData } from "@/api/unwrap"

// ── Profile ──────────────────────────────────────────────────────────────────

/** The signed-in account. */
export function useMe(enabled = true) {
	return useQuery({
		...getMeOptions(),
		select: unwrapData,
		enabled,
	})
}

/** Email, phone and username — the three things you can sign in with. */
export function useUpdateIdentifiers() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (body: UpdateAccountRequest) => {
			const { data } = await patchMe({ body, throwOnError: true })
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.me),
	})
}

/** Display name, avatar, date of birth — everything that is not an identifier. */
export function useUpdateProfile() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (body: UpdateProfileRequest) => {
			const { data } = await patchMeProfile({ body, throwOnError: true })
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.me),
	})
}

export function useChangePassword() {
	return useMutation({
		mutationFn: async (body: ChangePasswordRequest) => {
			await putPassword({ body, throwOnError: true })
		},
	})
}
import { sameOriginUploadUrl } from "@/api/upload"

/**
 * Upload an avatar or an identity document scan.
 *
 * Three steps, not one: the server reserves a slot and hands back a presigned URL, the
 * bytes go straight to storage, and a confirmation tells the server to read back the size
 * and checksum it actually received. The middle step deliberately bypasses the gateway —
 * it is a PUT to object storage — so it uses a bare fetch with the slot's own headers and
 * must not carry our bearer token.
 *
 * Returns the confirmed Resource. Attaching it to something is the caller's next step:
 * an avatar needs `PATCH /me/profile` with `avatar_resource_id`, a KYC scan needs
 * `POST /identity-documents`.
 */
export function useUploadFile() {
	return useMutation({
		mutationFn: async ({
			file,
			kind,
		}: {
			file: File
			kind: "avatar" | "identity"
		}) => {
			const { data: reserved } = await postMeUploads({
				body: { filename: file.name, kind, mime: file.type, size: file.size },
				throwOnError: true,
			})
			const slot = reserved.data

			const put = await fetch(sameOriginUploadUrl(slot.url), {
				method: "PUT",
				body: file,
				headers: { "Content-Type": file.type, ...slot.headers },
			})
			if (!put.ok) throw new Error("Tải tệp lên thất bại.")

			const { data: confirmed } = await postMeUploadsByIdConfirmation({
				path: { id: slot.resource_id },
				throwOnError: true,
			})
			return confirmed.data
		},
	})
}

// ── Sign-in methods and devices ──────────────────────────────────────────────

export function useOAuthIdentities() {
	return useQuery({
		...getMeOauthIdentitiesOptions(),
		select: unwrapData,
	})
}

export function useUnlinkProvider() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (provider: OAuthProvider) => {
			await deleteMeOauthIdentitiesByProvider({ path: { provider }, throwOnError: true })
		},
		// Unlinking can change whether the account still has a password to fall back on,
		// which is rendered from /me.
		onSuccess: () => invalidate(queryClient, OPERATIONS.oauthIdentities, OPERATIONS.me),
	})
}

export function usePushDevices() {
	return useQuery({
		...getMeDevicesOptions(),
		select: unwrapData,
	})
}

/** Revoke a push registration. The device stops receiving notifications immediately. */
export function useDeleteDevice() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: DeviceId) => {
			await deleteDevicesById({ path: { id }, throwOnError: true })
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.devices),
	})
}

// ── Identity verification ────────────────────────────────────────────────────

export function useIdentityDocuments() {
	return useQuery({
		...getMeIdentityDocumentsOptions(),
		select: unwrapData,
	})
}

export function useStartVerification() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (body: StartIdentityVerificationRequest) => {
			const { data } = await postIdentityDocuments({ body, throwOnError: true })
			return data.data
		},
		// A verdict flips identity_verified on the account, so /me is stale too.
		onSuccess: () => invalidate(queryClient, OPERATIONS.identityDocuments, OPERATIONS.me),
	})
}

// ── Following ────────────────────────────────────────────────────────────────

/** Sellers this account follows. Page-paginated, so it walks `page`. */
export function useFollowingFeed(limit = 20) {
	const query = useInfiniteQuery({
		...getMeFollowingInfiniteOptions({ query: { limit } }),
		...pagePagination,
	})

	const sellers = useMemo(() => flattenPages(query.data), [query.data])

	return { ...query, sellers, totalCount: totalCountOf(query.data) }
}

/**
 * Follow and unfollow, as one hook.
 *
 * Both are optimistic: the button has to flip on the click, not a round trip later, and
 * a failure rolls the list back and lets the global toast explain why.
 */
export function useToggleFollow() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({
			accountId,
			following,
		}: {
			accountId: AccountId
			/** The state being moved *to*. */
			following: boolean
		}) => {
			const path = { accountID: accountId }
			if (following) await putFollowsByAccountId({ path, throwOnError: true })
			else await deleteFollowsByAccountId({ path, throwOnError: true })
		},
		onSettled: () => invalidate(queryClient, OPERATIONS.following),
	})
}
