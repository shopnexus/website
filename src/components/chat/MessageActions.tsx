"use client"

/**
 * Edit and unsend, on your own messages only.
 *
 * Shown on hover and on keyboard focus — `focus-within` on the row, so the two buttons are
 * reachable by Tab rather than only by a pointer that happens to be over the bubble.
 */
export default function MessageActions({
	onEdit,
	onDelete,
	isBusy,
}: {
	onEdit: () => void
	onDelete: () => void
	isBusy: boolean
}) {
	return (
		<div className="flex items-center gap-0.5 self-center opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity">
			<button
				type="button"
				title="Sửa tin nhắn"
				aria-label="Sửa tin nhắn"
				disabled={isBusy}
				onClick={onEdit}
				className="w-7 h-7 rounded-full flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container transition-colors disabled:opacity-40 cursor-pointer"
			>
				<span className="material-symbols-outlined text-[16px]">edit</span>
			</button>
			<button
				type="button"
				title="Thu hồi tin nhắn"
				aria-label="Thu hồi tin nhắn"
				disabled={isBusy}
				onClick={onDelete}
				className="w-7 h-7 rounded-full flex items-center justify-center text-outline hover:text-error hover:bg-error-container/40 transition-colors disabled:opacity-40 cursor-pointer"
			>
				<span className="material-symbols-outlined text-[16px]">delete</span>
			</button>
		</div>
	)
}
