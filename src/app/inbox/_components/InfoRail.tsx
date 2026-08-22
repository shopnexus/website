"use client"

import type { ReactNode } from "react"
import * as Dialog from "@radix-ui/react-dialog"

import { useMediaQuery } from "@/hooks/useMediaQuery"

/** The width at which the third pane fits beside the thread — Tailwind's `lg`. */
const WIDE = "(min-width: 1024px)"

/**
 * The right rail, and the sheet it becomes on a narrow screen.
 *
 * One or the other, never both: it used to render its contents twice and let CSS hide the
 * losing copy, which meant an open sheet on a wide screen was a focus-trapping dialog with
 * `display: none`. Asking the viewport which one exists is also what lets the sheet be a
 * real dialog — Radix restores focus to the button that opened it and keeps Tab inside,
 * neither of which a hand-rolled overlay was doing.
 */
export default function InfoRail({
	title,
	isOpen,
	onClose,
	children,
}: {
	title: string
	isOpen: boolean
	onClose: () => void
	children: ReactNode
}) {
	const isWide = useMediaQuery(WIDE)

	if (isWide) {
		return (
			<aside className="hide-scrollbar flex w-[300px] shrink-0 flex-col overflow-y-auto border-l border-outline-variant bg-surface-container-lowest xl:w-[320px] 2xl:w-[340px]">
				{children}
			</aside>
		)
	}

	return (
		<Dialog.Root
			open={isOpen}
			onOpenChange={(next) => {
				if (!next) onClose()
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-40 bg-black/40" />
				<Dialog.Content
					aria-describedby={undefined}
					className="fixed inset-y-0 right-0 z-40 flex h-full w-[88%] max-w-[360px] flex-col border-l border-outline-variant bg-surface-container-lowest shadow-xl outline-none">
					<div className="flex shrink-0 items-center justify-between border-b border-outline-variant px-4 py-3">
						<Dialog.Title className="text-title-sm text-on-surface">{title}</Dialog.Title>
						<Dialog.Close
							aria-label="Đóng"
							className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container"
						>
							<span className="material-symbols-outlined text-[18px]">close</span>
						</Dialog.Close>
					</div>
					<div className="hide-scrollbar flex-1 overflow-y-auto">{children}</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
