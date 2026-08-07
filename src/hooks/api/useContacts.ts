"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { deleteContactsById, patchContactsById, postContacts } from "@/api/generated/sdk.gen"
import { getContactsOptions } from "@/api/generated/@tanstack/react-query.gen"
import type {
	ContactId,
	CreateContactRequest,
	UpdateContactRequest,
} from "@/api/generated/types.gen"
import { OPERATIONS, invalidate } from "@/api/invalidate"
import { unwrapData } from "@/api/unwrap"

/**
 * Saved addresses.
 *
 * Unpaginated on the server — nobody has a thousand addresses — so this is a plain
 * query. Every write below invalidates it rather than patching the cache by hand: the
 * server decides which address is the default delivery one, and moving that flag between
 * two rows is not something the client can reproduce from the request it sent.
 */
export function useContacts() {
	return useQuery({
		...getContactsOptions(),
		select: unwrapData,
	})
}

export function useCreateContact() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (body: CreateContactRequest) => {
			const { data } = await postContacts({ body, throwOnError: true })
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.contacts),
	})
}

export function useUpdateContact() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, body }: { id: ContactId; body: UpdateContactRequest }) => {
			const { data } = await patchContactsById({ path: { id }, body, throwOnError: true })
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.contacts),
	})
}

export function useDeleteContact() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (id: ContactId) => {
			await deleteContactsById({ path: { id }, throwOnError: true })
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.contacts),
	})
}

// ── Phone verification ───────────────────────────────────────────────────────

import {
	postContactsByIdPhoneVerificationRequests,
	postContactsByIdPhoneVerifications,
} from "@/api/generated/sdk.gen"

/**
 * Send a one-time code by SMS to the number on this address.
 *
 * Throttled server-side per number, so a 429 is an ordinary answer and not a fault: the
 * caller surfaces it as "wait a moment" rather than as a failure to retry through.
 */
export function useRequestContactPhoneCode() {
	return useMutation({
		mutationFn: async (id: ContactId) => {
			await postContactsByIdPhoneVerificationRequests({ path: { id }, throwOnError: true })
		},
	})
}

/**
 * Confirm the code. The verified flag is on the contact row, so the list is what goes
 * stale — the account's own phone is a different identifier and is untouched by this.
 */
export function useVerifyContactPhone() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({ id, code }: { id: ContactId; code: string }) => {
			const { data } = await postContactsByIdPhoneVerifications({
				path: { id },
				body: { code },
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.contacts),
	})
}
