"use client"

import { useRef, useState } from "react"
import Image from "next/image"

import type { ResourceId } from "@/api/generated/types.gen"

import type { PendingAttachment } from "./types"

interface ChatComposerProps {
	disabled: boolean
	isSending: boolean
	placeholder: string
	attachments: readonly PendingAttachment[]
	isUploading: boolean
	onPickFiles: (files: FileList) => void
	onRemoveAttachment: (id: ResourceId) => void
	onSend: (body: string) => void
}

/**
 * The box you write in.
 *
 * A message is a body *and* its attachments, sent together: the tray holds confirmed
 * resources until send, so a picture can carry a caption and several can ride one message.
 */
export default function ChatComposer({
	disabled,
	isSending,
	placeholder,
	attachments,
	isUploading,
	onPickFiles,
	onRemoveAttachment,
	onSend,
}: ChatComposerProps) {
	const [text, setText] = useState("")
	const fileInputRef = useRef<HTMLInputElement>(null)

	const body = text.trim()
	const canSend = !disabled && !isSending && (body.length > 0 || attachments.length > 0)

	const submit = () => {
		if (!canSend) return
		onSend(body)
		setText("")
	}

	return (
		<div className="p-3 md:p-4 bg-surface border-t border-outline-variant/30 shrink-0">
			{(attachments.length > 0 || isUploading) && (
				<div className="flex items-center gap-2 flex-wrap pb-2.5">
					{attachments.map((item) => (
						<div
							key={item.id}
							className="group relative w-14 h-14 rounded-lg overflow-hidden border border-outline-variant/40 bg-surface-container"
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

			<div className="flex items-center gap-1.5 md:gap-2 bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-1.5 md:p-2 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all shadow-sm">
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
				<input
					className="flex-1 border-none focus:ring-0 bg-transparent text-xs md:text-sm py-1.5 outline-none text-on-surface placeholder:text-outline"
					placeholder={placeholder}
					value={text}
					disabled={disabled}
					onChange={(event) => setText(event.target.value)}
					onKeyDown={(event) => {
						if (event.key === "Enter") submit()
					}}
					type="text"
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
		</div>
	)
}
