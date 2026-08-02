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
