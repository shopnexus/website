"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
	postPaymentSessionsByIdCancellation,
	postPaymentSessionsByIdPayments,
} from "@/api/generated/sdk.gen"
import {
	getPaymentSessionsByIdOptions,
	getWalletsOptions,
} from "@/api/generated/@tanstack/react-query.gen"
import type { PaymentSessionId, StartPaymentRequest } from "@/api/generated/types.gen"
import { OPERATIONS, invalidate } from "@/api/invalidate"
import { unwrapData } from "@/api/unwrap"

/**
 * The account's wallets, one per currency it holds a balance in.
 *
 * `available_balance` is spendable now; `held_balance` is escrow against open orders —
 * money the platform is holding for a buyer, which the seller can see but not withdraw.
 * They are separate fields because showing their sum as "your balance" would promise a
 * payout that a refund can still take back.
 */
export function useWallets(enabled = true) {
	return useQuery({
		...getWalletsOptions(),
		select: unwrapData,
		enabled,
	})
}

import { getOptionsOptions } from "@/api/generated/@tanstack/react-query.gen";

/**
 * The rails a payment session may be tendered on, and the only place a valid
 * `payment_option` comes from.
 */
export function usePaymentOptions(enabled = true) {
	return useQuery({
		...getOptionsOptions({ query: { category: "payment" } }),
		select: (res) => res.data.options,
		staleTime: Infinity,
		enabled,
	})
}

/**
 * Tender one rail against a session.
 *
 * The result is not a receipt however much it looks like one: the leg starts `pending` and
 * only the provider's webhook settles it. A rail that redirects answers with `checkout_url`
 * and no outcome — send the payer there. A direct-debit one answers settled on the spot.
 * Either way the session is the thing to watch.
 */
export function useStartPayment() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async ({
			sessionId,
			body,
		}: {
			sessionId: PaymentSessionId
			body: StartPaymentRequest
		}) => {
			const { data } = await postPaymentSessionsByIdPayments({
				path: { id: sessionId },
				body,
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () => invalidate(queryClient, OPERATIONS.orders),
	})
}

/**
 * Watch a payment session until it settles.
 *
 * Polled rather than awaited, because nothing about a payment is synchronous: the money
 * landing is what creates the order, and it lands on a webhook this client never sees.
 * Polling stops at a terminal status, so a finished checkout costs nothing to stay mounted.
 */
/**
 * The payer walking away before the money moves.
 *
 * Only the payer of a `buyer-checkout` may, and only while it is still `pending` or
 * `processing` — a paid session is refunded instead, which is a different flow entirely.
 * Everything the server refuses is refused for a reason, so the button asks exactly the
 * question the route asks and nothing is guarded twice.
 *
 * Drops the checkout lines as well as the session: they are what the order screen renders
 * for an unpaid purchase, and a cancelled session leaves them behind as rows offering to
 * pay for something nobody can pay for any more.
 */
export function useCancelPaymentSession() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: async (sessionId: PaymentSessionId) => {
			const { data } = await postPaymentSessionsByIdCancellation({
				path: { id: sessionId },
				throwOnError: true,
			})
			return data.data
		},
		onSuccess: () =>
			invalidate(queryClient, OPERATIONS.items, OPERATIONS.paymentSession, OPERATIONS.orders),
	})
}

/**
 * One payment session, polled until it settles.
 *
 * `poll` is off for a caller that only wants to know where the payer left off — a list of
 * abandoned checkouts reads one session per row, and re-asking for every one of them every
 * two seconds buys nothing: nothing on that screen changes when a webhook lands except a row
 * leaving, and the list itself is invalidated for that.
 */
export function usePaymentSession(id: PaymentSessionId | undefined, poll = true) {
	return useQuery({
		...getPaymentSessionsByIdOptions({ path: { id: id! } }),
		select: unwrapData,
		enabled: Boolean(id),
		refetchInterval: (query) => {
			if (!poll) return false
			const status = query.state.data?.data.status
			return status === "pending" || status === "processing" ? 2000 : false
		},
	})
}
