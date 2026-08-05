"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { postPaymentSessionsByIdPayments } from "@/api/generated/sdk.gen"
import {
	getOptionsOptions,
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

/**
 * The rails a payment session may be tendered on, and the only place a valid
 * `payment_option` comes from — a hardcoded slug breaks the day an operator disables that
 * rail, and which rails a deployment offers is not a fact a client can know.
 *
 * Operator configuration rather than the user's data, so it is held for a few minutes:
 * asking again per checkout puts the same question to every buyer.
 */
export function usePaymentOptions(enabled = true) {
	return useQuery({
		...getOptionsOptions({ query: { category: "payment" } }),
		select: (envelope) => unwrapData(envelope).options,
		staleTime: 5 * 60 * 1000,
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
export function usePaymentSession(id: PaymentSessionId | undefined, watch = true) {
	return useQuery({
		...getPaymentSessionsByIdOptions({ path: { id: id! } }),
		select: unwrapData,
		enabled: Boolean(id) && watch,
		refetchInterval: (query) => {
			const status = query.state.data?.data.status
			return status === "pending" || status === "processing" ? 2000 : false
		},
	})
}
