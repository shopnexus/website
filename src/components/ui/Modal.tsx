"use client"

import type { ReactNode } from "react"
import * as Dialog from "@radix-ui/react-dialog"

/**
 * A centred dialog with a scrim.
 *
 * Built on Radix's dialog rather than a hand-rolled portal, because the parts that were
 * missing are the parts that are hard: focus was never trapped, so Tab walked out of an
 * open dialog into the page behind it, and it was never restored to whatever opened the
 * dialog on close. The Escape handler and the body scroll lock were ours in three separate
 * components, each slightly different.
 *
 * `onClose` is not wired to the scrim by default: a dialog that submits — a receipt, a
 * refund, a rating — must not lose what was typed to a stray click beside it. The pages
 * that want it pass `closeOnScrim`. Escape always closes, which is what a keyboard user
 * expects and is recoverable in a way a misplaced click is not.
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
	return (
		<Dialog.Root
			open={open}
			onOpenChange={(next) => {
				if (!next) onClose()
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
				<Dialog.Content
					aria-describedby={undefined}
					onInteractOutside={(event) => {
						if (!closeOnScrim) event.preventDefault()
					}}
					className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 flex max-h-[90vh] w-[calc(100%-2rem)] max-w-md flex-col overflow-hidden rounded-2xl bg-surface shadow-lg"
				>
					<div className="flex shrink-0 items-center justify-between border-b border-outline-variant px-6 py-4">
						<Dialog.Title className="text-title-lg text-on-surface">{title}</Dialog.Title>
						<Dialog.Close
							aria-label="Đóng"
							className="cursor-pointer text-on-surface-variant transition-colors hover:text-on-surface"
						>
							<span className="material-symbols-outlined">close</span>
						</Dialog.Close>
					</div>
					<div className="overflow-y-auto px-6 py-5">{children}</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
