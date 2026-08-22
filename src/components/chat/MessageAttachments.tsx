"use client"

import Image from "next/image"

import type { Resource } from "@/api/generated/types.gen"

/**
 * Every file on a message, not the first one.
 *
 * `Message.attachments` is a list and the composer can fill it, so rendering
 * `attachments[0]` silently dropped whatever came after it — a seller sending four photos
 * of a scratch showed one.
 *
 * Opening one hands over the whole image set and the position within it, so the viewer can
 * step through the rest. A video is not in that set: it plays in place.
 */

function download(event: React.MouseEvent, url: string): void {
	event.stopPropagation()
	const link = document.createElement("a")
	link.href = url
	link.target = "_blank"
	link.rel = "noopener"
	link.download = url.split("/").pop()?.split("?")[0] || "tep-dinh-kem"
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
}

function AttachmentTile({
	attachment,
	isMine,
	onOpen,
}: {
	attachment: Resource
	isMine: boolean
	onOpen: () => void
}) {
	const url = attachment.url || ""
	const isVideo = attachment.mime?.startsWith("video/") ?? false
	if (!url) return null

	return (
		<div
			className={`group relative rounded-xl overflow-hidden border border-outline-variant shadow-sm ${
				isMine ? "rounded-br-sm" : "rounded-bl-sm"
			} ${isVideo ? "" : "cursor-zoom-in"}`}
			onClick={() => {
				if (!isVideo) onOpen()
			}}
		>
			{isVideo ? (
				<video
					src={url}
					controls
					className="w-full aspect-[4/3] object-cover bg-black"
					onClick={(event) => event.stopPropagation()}
				/>
			) : (
				<Image
					src={url}
					alt="Tệp đính kèm"
					width={240}
					height={180}
					className="w-full aspect-[4/3] object-cover"
				/>
			)}
			{!isVideo && (
				<button
					type="button"
					onClick={(event) => download(event, url)}
					className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity hover:bg-black/60 backdrop-blur-sm"
					title="Tải xuống"
				>
					<span className="material-symbols-outlined text-[18px]">download</span>
				</button>
			)}
		</div>
	)
}

export default function MessageAttachments({
	attachments,
	isMine,
	onOpen,
}: {
	attachments: readonly Resource[]
	isMine: boolean
	onOpen: (images: string[], index: number) => void
}) {
	if (attachments.length === 0) return null

	const images = attachments
		.filter((attachment) => attachment.url && !attachment.mime?.startsWith("video/"))
		.map((attachment) => attachment.url!)

	return (
		<div
			className={`grid gap-1.5 max-w-[240px] ${attachments.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
		>
			{attachments.map((attachment) => (
				<AttachmentTile
					key={attachment.id}
					attachment={attachment}
					isMine={isMine}
					onOpen={() => onOpen(images, images.indexOf(attachment.url ?? ""))}
				/>
			))}
		</div>
	)
}
