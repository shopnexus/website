"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import type { AccountId, CurrencyCode } from "@/api/generated/types.gen"
import { useAdjustWallet } from "@/hooks/api/useAdminFinance"
import { DEFAULT_CURRENCY } from "@/hooks/api/useWallet"
import { adjustmentProblem, newIdempotencyKey } from "../_lib/withdrawals.logic"
import type { AdjustmentDraft } from "../types"

function emptyDraft(currency: CurrencyCode): AdjustmentDraft {
	return { currency, availableDelta: 0, heldDelta: 0, reason: "" }
}

/**
 * A hand-written balance movement.
 *
 * The idempotency key is minted once per correction and only replaced after one lands:
 * every retry of the same attempt carries the same key, so a connection that dropped
 * after the server had already written the row answers the balance as it stands instead
 * of crediting again.
 */
export function useAdjustmentForm(accountId: AccountId | undefined, currency = DEFAULT_CURRENCY) {
	const [draft, setDraft] = useState<AdjustmentDraft>(() => emptyDraft(currency))
	const [key, setKey] = useState(newIdempotencyKey)
	const adjust = useAdjustWallet()

	const problem = adjustmentProblem(draft)

	const submit = () => {
		if (!accountId || problem) return
		adjust.mutate(
			{
				accountId,
				body: {
					currency: draft.currency,
					available_delta: draft.availableDelta,
					held_delta: draft.heldDelta,
					reason: draft.reason.trim(),
					idempotency_key: key,
				},
			},
			{
				onSuccess: () => {
					toast.success("Đã ghi bút toán điều chỉnh vào sổ ví.")
					setDraft(emptyDraft(draft.currency))
					setKey(newIdempotencyKey())
				},
			},
		)
	}

	return { draft, setDraft, problem, submit, isPending: adjust.isPending }
}
