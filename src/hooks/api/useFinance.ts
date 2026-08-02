"use client"

import { useQuery } from "@tanstack/react-query"
import { getWalletsOptions } from "@/api/generated/@tanstack/react-query.gen"
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
