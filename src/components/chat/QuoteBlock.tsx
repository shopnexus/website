"use client"

import type { QuoteLines } from "./chat.logic"

/**
 * The message being answered, above the answer.
 *
 * One component for both places it appears — over a bubble in the thread, and in the
 * composer while a reply is being written — because they are the same two lines and drifting
 * apart would make the preview you agreed to send different from the one that arrives.
 */
export default function QuoteBlock({
	lines,
	tone,
	onJump,
	onCancel,
}: {
	lines: QuoteLines
	/** Which side it sits on, so the quote reads as part of its own bubble. */
	tone: "mine" | "theirs"
	/** Jump to the quoted message. Absent in the composer, where there is nothing to jump in. */
	onJump?: () => void
	/** Drop the reply being composed. Absent in the thread, where it is already sent. */
	onCancel?: () => void
}) {
	const body = (
		<>
			<span
				className={`block truncate text-label-xs ${
					tone === "mine" ? "text-on-primary/80" : "text-primary"
				}`}
			>
				{lines.author}
			</span>
			<span
				className={`block truncate text-body-xs ${
					tone === "mine" ? "text-on-primary/70" : "text-on-surface-variant"
				}`}
			>
				{lines.summary}
			</span>
		</>
	)

	return (
		<div
			className={`flex items-start gap-2 rounded-lg border-l-2 px-2 py-1.5 ${
				tone === "mine"
					? "border-on-primary/40 bg-on-primary/10"
					: "border-primary/50 bg-primary-container/10"
			}`}
		>
			{onJump ? (
				<button
					type="button"
					onClick={onJump}
					title="Xem tin nhắn được trả lời"
					className="min-w-0 flex-1 cursor-pointer text-left"
				>
					{body}
				</button>
			) : (
				<span className="min-w-0 flex-1">{body}</span>
			)}

			{onCancel && (
				<button
					type="button"
					onClick={onCancel}
					aria-label="Bỏ trả lời"
					title="Bỏ trả lời"
					className="flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-full text-outline hover:bg-surface-container-high hover:text-on-surface"
				>
					<span className="material-symbols-outlined text-[14px]">close</span>
				</button>
			)}
		</div>
	)
}
