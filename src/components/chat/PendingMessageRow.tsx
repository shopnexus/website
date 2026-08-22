"use client"

import Image from "next/image"

import { formatClock } from "./chat.logic"
import type { OutboxEntry } from "./hooks/useMessageOutbox"

/**
 * A message on its way out, or one that did not make it.
 *
 * It sits where a sent message would, on the sender's side, so pressing send always puts
 * something on screen. A failure stays here holding the words: the only way to lose them
 * is to discard it deliberately.
 */
export default function PendingMessageRow({
	entry,
	onRetry,
	onDiscard,
}: {
	entry: OutboxEntry
	onRetry: () => void
	onDiscard: () => void
}) {
	const failed = entry.status === "failed"

	return (
		<div className="group flex gap-1.5 max-w-[85%] md:max-w-[75%] ml-auto justify-end">
			<div className="flex flex-col items-end space-y-1.5 min-w-0">
				{entry.attachments.length > 0 && (
					<div
						className={`grid gap-1.5 max-w-[240px] ${
							entry.attachments.length > 1 ? "grid-cols-2" : "grid-cols-1"
						}`}
					>
						{entry.attachments.map((item) => {
							const url = item.previewUrl || item.resource.url
							return (
								<div
									key={item.id}
									className="relative rounded-xl rounded-br-sm overflow-hidden border border-outline-variant bg-surface-container aspect-[4/3]"
								>
									{url && <Image src={url} alt={item.name} fill className="object-cover" />}
								</div>
							)
						})}
					</div>
				)}

				{entry.body && (
					<div
						className={`px-3.5 py-2 md:px-4 md:py-2.5 rounded-xl rounded-br-sm text-xs md:text-sm leading-relaxed break-words whitespace-pre-wrap max-w-full ${
							failed
								? "bg-error-container text-on-error-container border border-error/30"
								: "bg-primary text-on-primary opacity-60"
						}`}
					>
						{entry.body}
					</div>
				)}

				{failed ? (
					<div className="flex items-center gap-2 text-label-xs">
						<span className="text-error">Không gửi được</span>
						<button
							type="button"
							onClick={onRetry}
							className="cursor-pointer text-primary hover:underline"
						>
							Gửi lại
						</button>
						<button
							type="button"
							onClick={onDiscard}
							className="cursor-pointer text-on-surface-variant hover:text-error hover:underline"
						>
							Bỏ
						</button>
					</div>
				) : (
					<span className="flex items-center gap-1 text-label-xs text-outline">
						<span>{formatClock(entry.createdAt)}</span>
						<span className="flex items-center gap-0.5">
							<span className="material-symbols-outlined text-[11px] animate-spin">
								progress_activity
							</span>
							Đang gửi
						</span>
					</span>
				)}
			</div>
		</div>
	)
}
