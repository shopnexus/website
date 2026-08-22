"use client"

import * as DropdownMenu from "@radix-ui/react-dropdown-menu"

interface Action {
	icon: string
	label: string
	danger?: boolean
	onSelect: () => void
}

/**
 * What can be done to a message, from a menu beside the bubble.
 *
 * It was a row of icon buttons at `opacity-0` until `:hover`, which on a touch screen means
 * they did not exist: there is no hover on a phone, and the inbox is mostly read on one.
 * A menu has one trigger that is always there, and its items are named in words rather than
 * left to a glyph.
 *
 * Each action is optional and only what is passed is drawn, because the two sides of a
 * thread have different ones: either can be replied to, your own can be rewritten or unsent,
 * and theirs can be reported. Reporting had a backend and a ticket kind (`report-message`)
 * and no control anywhere that reached them.
 */
export default function MessageActions({
	onReply,
	onEdit,
	onDelete,
	onReport,
	isBusy = false,
}: {
	onReply?: () => void
	onEdit?: () => void
	onDelete?: () => void
	onReport?: () => void
	isBusy?: boolean
}) {
	const actions: Action[] = []
	if (onReply) actions.push({ icon: "reply", label: "Trả lời", onSelect: onReply })
	if (onEdit) actions.push({ icon: "edit", label: "Sửa tin nhắn", onSelect: onEdit })
	if (onDelete)
		actions.push({ icon: "delete", label: "Thu hồi tin nhắn", danger: true, onSelect: onDelete })
	if (onReport)
		actions.push({ icon: "flag", label: "Báo cáo tin nhắn", danger: true, onSelect: onReport })

	if (actions.length === 0) return null

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				disabled={isBusy}
				aria-label="Tùy chọn tin nhắn"
				title="Tùy chọn tin nhắn"
				className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center self-center rounded-full text-outline opacity-0 transition-opacity hover:bg-surface-container hover:text-on-surface focus-visible:opacity-100 disabled:opacity-40 group-hover:opacity-100 group-focus-within:opacity-100 data-[state=open]:opacity-100"
			>
				<span className="material-symbols-outlined text-[18px]">more_vert</span>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content
					sideOffset={4}
					align="end"
					className="z-50 min-w-[168px] overflow-hidden rounded-xl border border-outline-variant bg-surface p-1 shadow-lg"
				>
					{actions.map((action) => (
						<DropdownMenu.Item
							key={action.label}
							onSelect={action.onSelect}
							className={`flex cursor-pointer items-center gap-2 rounded-lg px-2.5 py-2 text-body-xs outline-none transition-colors ${
								action.danger
									? "text-error data-[highlighted]:bg-error-container/40"
									: "text-on-surface data-[highlighted]:bg-surface-container"
							}`}
						>
							<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
								{action.icon}
							</span>
							{action.label}
						</DropdownMenu.Item>
					))}
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	)
}
