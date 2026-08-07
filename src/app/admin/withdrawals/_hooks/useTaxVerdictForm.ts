"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import type { AccountId } from "@/api/generated/types.gen"
import { useVerifyTaxInfo } from "@/hooks/api/useAdminFinance"
import { taxVerdictProblem } from "../_lib/withdrawals.logic"
import type { TaxVerdictDraft } from "../types"

const EMPTY: TaxVerdictDraft = { status: "verified", source: "", note: "" }

/** A verdict on a seller's tax registration, recorded against the account. */
export function useTaxVerdictForm(accountId: AccountId | undefined) {
	const [draft, setDraft] = useState<TaxVerdictDraft>(EMPTY)
	const verify = useVerifyTaxInfo()

	const problem = taxVerdictProblem(draft)

	const submit = () => {
		if (!accountId || problem) return
		verify.mutate(
			{
				accountId,
				body: { status: draft.status, source: draft.source.trim(), note: draft.note.trim() },
			},
			{
				onSuccess: () => {
					toast.success(
						draft.status === "verified"
							? "Đã xác minh đăng ký thuế."
							: "Đã từ chối đăng ký thuế.",
					)
					setDraft(EMPTY)
				},
			},
		)
	}

	return { draft, setDraft, problem, submit, isPending: verify.isPending }
}
