"use client"

import { useRef } from "react"
import { useUploadOrderEvidence } from "@/hooks/api/useOrders"
import type { ResourceId } from "@/api/generated/types.gen"

export interface Evidence {
	id: ResourceId
	name: string
	/** An object URL for the local file, so a thumbnail needs no round trip. */
	preview: string
}

/** `ConfirmReceiptRequest` and `CreateRefundRequest` both cap attachments at ten. */
export const MAX_EVIDENCE = 10

/**
 * Photos attached to a receipt or a refund, uploaded as they are picked.
 *
 * Uploading on pick rather than on submit is what lets the parent hold resource ids and
 * nothing else: by the time the dialog's own button is pressed, every attachment is a
 * confirmed row the server will accept. A file that fails to upload simply never enters
 * the list, so a receipt is never submitted naming a photo whose bytes never arrived.
 */
export default function EvidencePicker({
	evidence,
	onChange,
	disabled = false,
}: {
	evidence: Evidence[]
	onChange: (next: Evidence[]) => void
	disabled?: boolean
}) {
	const inputRef = useRef<HTMLInputElement>(null)
	const upload = useUploadOrderEvidence()

	const room = MAX_EVIDENCE - evidence.length

	const handlePick = async (event: React.ChangeEvent<HTMLInputElement>) => {
		const files = [...(event.target.files ?? [])].slice(0, room)
		// Cleared before the awaits: the same file picked twice in a row fires no change
		// event otherwise, and re-picking after a failure is exactly what a user tries.
		if (inputRef.current) inputRef.current.value = ""

		const added: Evidence[] = []
		for (const file of files) {
			try {
				const id = await upload.mutateAsync(file)
				added.push({ id, name: file.name, preview: URL.createObjectURL(file) })
			} catch {
				// The QueryClient toasts the failure once, from the server's own code.
			}
		}
		if (added.length > 0) onChange([...evidence, ...added])
	}

	const remove = (id: ResourceId) => {
		const gone = evidence.find((item) => item.id === id)
		if (gone) URL.revokeObjectURL(gone.preview)
		onChange(evidence.filter((item) => item.id !== id))
	}

	return (
		<div className="flex flex-wrap gap-2">
			{evidence.map((item) => (
				<div key={item.id} className="relative w-[72px] h-[72px]">
					{/* eslint-disable-next-line @next/next/no-img-element -- an object: URL has no loader */}
					<img
						src={item.preview}
						alt={item.name}
						className="w-full h-full object-cover rounded-lg border border-outline-variant"
					/>
					<button
						type="button"
						disabled={disabled}
						onClick={() => remove(item.id)}
						aria-label={`Bỏ ${item.name}`}
						className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-error text-on-error flex items-center justify-center cursor-pointer disabled:opacity-50"
					>
						<span className="material-symbols-outlined text-[14px]">close</span>
					</button>
				</div>
			))}

			{room > 0 && (
				<button
					type="button"
					disabled={disabled || upload.isPending}
					onClick={() => inputRef.current?.click()}
					className="w-[72px] h-[72px] rounded-lg border border-dashed border-outline-variant flex items-center justify-center text-on-surface-variant hover:border-primary hover:text-primary transition-colors cursor-pointer disabled:opacity-50"
				>
					<span className="material-symbols-outlined">
						{upload.isPending ? "hourglass_top" : "add_a_photo"}
					</span>
				</button>
			)}

			<input
				ref={inputRef}
				type="file"
				accept="image/*"
				multiple
				hidden
				onChange={handlePick}
			/>
		</div>
	)
}
