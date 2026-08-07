"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"

/**
 * A centred dialog with a scrim.
 *
 * `onClose` is not wired to the scrim by default: a dialog that submits — a receipt, a
 * refund, a rating — must not lose what was typed to a stray click beside it. The pages
 * that want it pass `closeOnScrim`.
 */
export default function Modal({
	open,
	title,
	onClose,
	closeOnScrim = false,
	children,
}: {
	open: boolean
	title: string
	onClose: () => void
	closeOnScrim?: boolean
	children: ReactNode
}) {
	useEffect(() => {
		if (!open) return
		const onKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose()
		}
		window.addEventListener("keydown", onKey)
		// The page behind must not scroll under an open dialog.
		const previous = document.body.style.overflow
		document.body.style.overflow = "hidden"
		return () => {
			window.removeEventListener("keydown", onKey)
			document.body.style.overflow = previous
		}
	}, [open, onClose])

	if (!open) return null

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
			onClick={closeOnScrim ? onClose : undefined}
		>
			<div
				role="dialog"
				aria-modal="true"
				aria-label={title}
				className="bg-surface rounded-2xl shadow-lg w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col"
				onClick={(event) => event.stopPropagation()}
			>
				<div className="px-6 py-4 border-b border-outline-variant flex items-center justify-between shrink-0">
					<h2 className="font-headline-sm font-bold text-on-surface">{title}</h2>
					<button
						type="button"
						onClick={onClose}
						aria-label="Đóng"
						className="text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
					>
						<span className="material-symbols-outlined">close</span>
					</button>
				</div>
				<div className="px-6 py-5 overflow-y-auto">{children}</div>
			</div>
		</div>
	)
}
