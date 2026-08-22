"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import Image from "next/image"

import type { ResourceId } from "@/api/generated/types.gen"
import { useCoarsePointer } from "@/hooks/useMediaQuery"

import QuoteBlock from "./QuoteBlock"
import type { ReplyDraft } from "./chat.logic"
import type { PendingAttachment } from "./types"

interface ChatComposerProps {
	disabled: boolean
	placeholder: string
	/** The message being answered, shown above the box until it is sent or dropped. */
	replyTo: ReplyDraft | null
	onCancelReply: () => void
	attachments: readonly PendingAttachment[]
	isUploading: boolean
	onPickFiles: (files: FileList | File[]) => void
	onRemoveAttachment: (id: ResourceId) => void
	onSend: (body: string) => void
}

/** Grows with the text and stops, rather than growing until it owns the screen. */
const MAX_HEIGHT_PX = 140

/**
 * The box you write in.
 *
 * A message is a body *and* its attachments, sent together: the tray holds confirmed
 * resources until send, so a picture can carry a caption and several can ride one message.
 *
 * A textarea, not a text input. It was the latter, which made a newline physically
 * impossible — a three-line question about size, colour and shipping had to be sent as
 * three messages — and `Enter` submitted whether or not Shift was held, so there was no
 * key left to break a line with even in principle.
 */
export default function ChatComposer({
	disabled,
	placeholder,
	replyTo,
	onCancelReply,
	attachments,
	isUploading,
	onPickFiles,
	onRemoveAttachment,
	onSend,
}: ChatComposerProps) {
	const [text, setText] = useState("")
	const fileInputRef = useRef<HTMLInputElement>(null)
	const boxRef = useRef<HTMLTextAreaElement>(null)

	/**
	 * On a touch keyboard, Enter is the only newline key there is — taking it would leave no
	 * way to break a line at all, and the send button is right there.
	 */
	const enterSends = !useCoarsePointer()

	// Picking "Trả lời" is a request to write, so the caret goes where the writing happens.
	useEffect(() => {
		if (replyTo) boxRef.current?.focus()
	}, [replyTo])

	// Before paint, so the box never renders at the wrong height for a frame.
	useLayoutEffect(() => {
		const box = boxRef.current
		if (!box) return
		box.style.height = "auto"
		box.style.height = `${Math.min(box.scrollHeight, MAX_HEIGHT_PX)}px`
	}, [text])

	const body = text.trim()
	const canSend = !disabled && (body.length > 0 || attachments.length > 0)

	const submit = () => {
		if (!canSend) return
		onSend(body)
		// Safe to clear: the outbox holds the message from here, and shows it back as a
		// bubble that can be retried if the send fails.
		setText("")
	}

	return (
		<div className="p-3 md:p-4 bg-surface border-t border-outline-variant shrink-0">
			{replyTo && (
				<div className="pb-2.5">
					<QuoteBlock lines={replyTo} tone="theirs" onCancel={onCancelReply} />
				</div>
			)}

			{(attachments.length > 0 || isUploading) && (
				<div className="flex items-center gap-2 flex-wrap pb-2.5">
					{attachments.map((item) => (
						<div
							key={item.id}
							className="group relative w-14 h-14 rounded-lg overflow-hidden border border-outline-variant bg-surface-container"
						>
							{item.previewUrl || item.resource.url ? (
								<Image
									src={item.previewUrl || item.resource.url!}
									alt={item.name}
									fill
									className="object-cover"
								/>
							) : (
								<span className="material-symbols-outlined text-outline text-[18px] absolute inset-0 m-auto w-fit h-fit">
									draft
								</span>
							)}
							<button
								type="button"
								title={`Bỏ ${item.name}`}
								aria-label={`Bỏ ${item.name}`}
								onClick={() => onRemoveAttachment(item.id)}
								className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/55 text-white flex items-center justify-center hover:bg-black/75 transition-colors cursor-pointer"
							>
								<span className="material-symbols-outlined text-[13px]">close</span>
							</button>
						</div>
					))}
					{isUploading && (
						<div className="w-14 h-14 rounded-lg border border-dashed border-outline-variant flex items-center justify-center">
							<span className="material-symbols-outlined animate-spin text-primary text-[18px]">
								progress_activity
							</span>
						</div>
					)}
				</div>
			)}

			<div className="flex items-end gap-1.5 md:gap-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-1.5 md:p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
				<button
					type="button"
					title="Đính kèm tệp"
					aria-label="Đính kèm tệp"
					disabled={disabled || isUploading}
					onClick={() => fileInputRef.current?.click()}
					className="material-symbols-outlined text-outline hover:text-primary p-1.5 transition-colors rounded-full hover:bg-surface-container-low shrink-0 text-[20px] disabled:opacity-40 cursor-pointer"
				>
					add_circle
				</button>
				<input
					type="file"
					accept="image/*,video/*"
					multiple
					className="hidden"
					ref={fileInputRef}
					onChange={(event) => {
						const files = event.target.files
						if (files && files.length > 0) onPickFiles(files)
						event.target.value = ""
					}}
				/>
				<textarea
					ref={boxRef}
					rows={1}
					className="flex-1 resize-none border-none bg-transparent py-2 text-body-md text-on-surface outline-none placeholder:text-outline focus:ring-0"
					placeholder={placeholder}
					value={text}
					disabled={disabled}
					onChange={(event) => setText(event.target.value)}
					onKeyDown={(event) => {
						if (event.key !== "Enter") return
						if (!enterSends || event.shiftKey) return
						event.preventDefault()
						submit()
					}}
					// A screenshot is how most of this gets sent, and Ctrl+V was the one route
					// into the tray that did not exist.
					onPaste={(event) => {
						const files = Array.from(event.clipboardData.files)
						if (files.length === 0) return
						event.preventDefault()
						onPickFiles(files)
					}}
				/>
				<button
					onClick={submit}
					type="button"
					title="Gửi tin nhắn"
					aria-label="Gửi tin nhắn"
					disabled={!canSend}
					className={`p-2 rounded-lg transition-all flex items-center justify-center shrink-0 shadow-sm ${
						canSend
							? "bg-primary text-on-primary hover:scale-105 active:scale-95 cursor-pointer"
							: "bg-surface-container-high text-outline cursor-not-allowed opacity-60"
					}`}
				>
					<span
						className="material-symbols-outlined text-[18px]"
						style={{ fontVariationSettings: "'FILL' 1" }}
					>
						send
					</span>
				</button>
			</div>

			{enterSends && text.length > 0 && (
				<p className="mt-1.5 px-1 text-label-xs text-outline">
					Enter để gửi · Shift+Enter để xuống dòng
				</p>
			)}
		</div>
	)
}
