"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import type { AdminIdentityDocument } from "@/api/generated/types.gen"
import { useRecordIdentityVerdict } from "@/hooks/api/useAdminFinance"
import { toExpiryInstant, verdictProblem } from "../_lib/identity.logic"
import type { VerdictDraft } from "../types"

const EMPTY: VerdictDraft = { status: "verified", expiresAt: "", rejectionReason: "" }

/**
 * The verdict dialog: which entry, which answer, and what it needs alongside.
 *
 * Prefills the expiry from the document when there already is one — a vendor that read
 * the scans may have answered with a date — so a moderator confirms it rather than
 * retyping it off the screen.
 */
export function useIdentityVerdictForm() {
	const [target, setTarget] = useState<AdminIdentityDocument | null>(null)
	const [draft, setDraft] = useState<VerdictDraft>(EMPTY)
	const record = useRecordIdentityVerdict()

	const open = (entry: AdminIdentityDocument) => {
		setTarget(entry)
		setDraft({
			...EMPTY,
			expiresAt: entry.document.expires_at ? entry.document.expires_at.slice(0, 10) : "",
		})
	}

	const close = () => setTarget(null)

	const problem = target ? verdictProblem(draft, target.document.doc_type) : null

	const submit = () => {
		if (!target || problem) return
		record.mutate(
			{
				id: target.document.id,
				body: {
					status: draft.status,
					expires_at: draft.status === "verified" ? toExpiryInstant(draft.expiresAt) : undefined,
					rejection_reason:
						draft.status === "rejected" ? draft.rejectionReason.trim() : undefined,
				},
			},
			{
				onSuccess: () => {
					toast.success(
						draft.status === "verified" ? "Đã xác thực giấy tờ." : "Đã từ chối giấy tờ.",
					)
					close()
				},
			},
		)
	}

	return { target, draft, setDraft, problem, isPending: record.isPending, open, close, submit }
}
