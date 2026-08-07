"use client"

import { useEffect, useRef, useState } from "react"

/**
 * Editing a message in place.
 *
 * In place rather than in a dialog: the thing being changed is a line of a conversation,
 * and a modal hides the lines around it that gave it its meaning.
 */
export default function MessageEditor({
	initialBody,
	isSaving,
	onSave,
	onCancel,
}: {
	initialBody: string
	isSaving: boolean
	onSave: (body: string) => void
	onCancel: () => void
}) {
	const [draft, setDraft] = useState(initialBody)
	const inputRef = useRef<HTMLTextAreaElement>(null)

	useEffect(() => {
		const input = inputRef.current
		if (!input) return
		input.focus()
		input.setSelectionRange(input.value.length, input.value.length)
	}, [])

	const trimmed = draft.trim()
	const canSave = trimmed.length > 0 && trimmed !== initialBody && !isSaving

	return (
		<div className="w-full min-w-[220px] rounded-xl border border-primary/40 bg-surface-container-lowest p-2 shadow-sm">
			<textarea
				ref={inputRef}
				value={draft}
				rows={2}
				onChange={(event) => setDraft(event.target.value)}
				onKeyDown={(event) => {
					if (event.key === "Escape") onCancel()
					if (event.key === "Enter" && !event.shiftKey) {
						event.preventDefault()
						if (canSave) onSave(trimmed)
					}
				}}
				className="w-full resize-none bg-transparent text-xs md:text-sm text-on-surface outline-none placeholder:text-outline"
				placeholder="Sửa tin nhắn..."
			/>
			<div className="flex items-center justify-end gap-1.5 pt-1">
				<button
					type="button"
					onClick={onCancel}
					className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
				>
					Hủy
				</button>
				<button
					type="button"
					disabled={!canSave}
					onClick={() => onSave(trimmed)}
					className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-primary text-on-primary disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all cursor-pointer"
				>
					{isSaving ? "Đang lưu..." : "Lưu"}
				</button>
			</div>
			<p className="text-[10px] text-outline pt-0.5">Enter để lưu, Esc để hủy.</p>
		</div>
	)
}
