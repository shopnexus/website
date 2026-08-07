"use client"

import { useState } from "react"
import { toast } from "react-hot-toast"
import type { IdentityDocumentType, ResourceId } from "@/api/generated/types.gen"
import { useStartVerification, useUploadFile } from "@/hooks/api/useAccount"
import { needsBackScan } from "../_lib/kyc.logic"

/** Which of the three scans a slot holds. */
export type ScanSlot = "front" | "back" | "selfie"

interface Scan {
	resourceId: ResourceId
	previewUrl: string
}

/**
 * The identity submission, from picking a file to posting the document.
 *
 * Each scan is uploaded the moment it is chosen rather than all three at submit: the
 * upload is three round trips per file (reserve a slot, PUT the bytes to storage, confirm)
 * and doing nine of them behind one button leaves a seller staring at a spinner with no
 * idea which photo is being sent. The submit then carries three ids and nothing else.
 *
 * Preview URLs are object URLs over the local file, not the resource's own URL: the
 * server's is short-lived and empty until storage has been read back, so it is not
 * something to render immediately after an upload.
 */
export function useVerificationForm(onDone: () => void) {
	const upload = useUploadFile()
	const startVerification = useStartVerification()

	const [docType, setDocType] = useState<IdentityDocumentType>("national-id")
	const [scans, setScans] = useState<Partial<Record<ScanSlot, Scan>>>({})
	const [uploading, setUploading] = useState<ScanSlot | null>(null)

	const pick = async (slot: ScanSlot, file: File) => {
		setUploading(slot)
		try {
			const resource = await upload.mutateAsync({ file, kind: "identity" })
			setScans((current) => {
				// Revoke the URL the slot was holding, or a seller who re-picks four times
				// leaks four blobs for the life of the page.
				const previous = current[slot]
				if (previous) URL.revokeObjectURL(previous.previewUrl)
				return {
					...current,
					[slot]: { resourceId: resource.id, previewUrl: URL.createObjectURL(file) },
				}
			})
		} finally {
			setUploading(null)
		}
	}

	const missing: ScanSlot[] = (["front", "selfie"] as ScanSlot[])
		.concat(needsBackScan(docType) ? ["back"] : [])
		.filter((slot) => !scans[slot])

	const submit = () => {
		const front = scans.front
		const selfie = scans.selfie
		if (!front || !selfie || missing.length > 0) return

		startVerification.mutate(
			{
				doc_type: docType,
				front_resource_id: front.resourceId,
				selfie_resource_id: selfie.resourceId,
				back_resource_id: needsBackScan(docType) ? scans.back?.resourceId : undefined,
			},
			{
				onSuccess: () => {
					toast.success("Đã gửi giấy tờ. Kết quả sẽ hiện trong lịch sử xác minh.")
					setScans({})
					onDone()
				},
			},
		)
	}

	return {
		docType,
		setDocType: (next: IdentityDocumentType) => {
			setDocType(next)
			// A passport has no reverse, so a back scan carried over from a card would be
			// sent for a document that has no such page.
			if (!needsBackScan(next)) setScans((current) => ({ ...current, back: undefined }))
		},
		scans,
		pick,
		uploading,
		missing,
		submit,
		isSubmitting: startVerification.isPending,
	}
}
