"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import type { Withdrawal } from "@/api/generated/types.gen"
import { useApproveWithdrawal, useRejectWithdrawal } from "@/hooks/api/useAdminFinance"
import { resolveProblem } from "../_lib/withdrawals.logic"
import type { ResolveDraft, ResolveMode } from "../types"

const EMPTY: ResolveDraft = { providerRef: "", reason: "" }

/**
 * The decision dialog: which withdrawal, which verdict, and what was typed.
 *
 * One hook for both verdicts because they are one decision with two answers — and
 * because the draft has to survive switching between them, so an admin who wrote the
 * reason before realising they meant to approve does not start again.
 */
export function useResolveWithdrawal() {
	const [target, setTarget] = useState<Withdrawal | null>(null)
	const [mode, setMode] = useState<ResolveMode>("approve")
	const [draft, setDraft] = useState<ResolveDraft>(EMPTY)

	const approve = useApproveWithdrawal()
	const reject = useRejectWithdrawal()

	const open = (withdrawal: Withdrawal, next: ResolveMode) => {
		setTarget(withdrawal)
		setMode(next)
		setDraft(EMPTY)
	}

	const close = () => setTarget(null)

	const problem = resolveProblem(mode, draft)
	const isPending = approve.isPending || reject.isPending

	const submit = () => {
		if (!target || problem) return
		if (mode === "approve") {
			approve.mutate(
				{
					id: target.id,
					body: { provider_ref: draft.providerRef.trim(), reason: draft.reason.trim() },
				},
				{
					onSuccess: () => {
						toast.success("Đã duyệt. Khoản tiền được ghi nhận là đã chi.")
						close()
					},
				},
			)
			return
		}
		reject.mutate(
			{ id: target.id, body: { reason: draft.reason.trim() } },
			{
				onSuccess: () => {
					toast.success("Đã từ chối. Tiền đã hoàn lại số dư khả dụng của người bán.")
					close()
				},
			},
		)
	}

	return { target, mode, setMode, draft, setDraft, problem, isPending, open, close, submit }
}
