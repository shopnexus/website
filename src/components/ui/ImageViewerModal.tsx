"use client"

import { useCallback } from "react"
import Image from "next/image"
import * as Dialog from "@radix-ui/react-dialog"

interface ImageViewerModalProps {
	/** Every image in the set the viewer was opened from, in the order they are shown. */
	images: readonly string[]
	/** Which one is open, and `null` when the viewer is closed. */
	index: number | null
	onIndexChange: (index: number) => void
	onClose: () => void
	altText?: string
}

/**
 * One image at full size, inside the set it came from.
 *
 * It takes the whole set rather than a single url because every caller has one — a message
 * with four photos of a scratch, a product gallery, a refund's evidence — and opening the
 * third of four used to be a dead end: closing and reopening was the only way to see the
 * fourth. The set is also what makes ← and → mean something.
 *
 * The dialog itself is Radix's: Escape, the scroll lock and the focus trap were hand-rolled
 * here and in two other components, and the focus trap was hand-rolled nowhere.
 */
export default function ImageViewerModal({
	images,
	index,
	onIndexChange,
	onClose,
	altText = "Hình ảnh",
}: ImageViewerModalProps) {
	const isOpen = index !== null && index >= 0 && index < images.length
	const url = isOpen ? images[index] : ""

	const step = useCallback(
		(delta: number) => {
			if (index === null || images.length < 2) return
			// Wraps: at the last image, → is the first. A set is a ring, not a dead end.
			onIndexChange((index + delta + images.length) % images.length)
		},
		[index, images.length, onIndexChange],
	)

	if (!isOpen || !url) return null

	const download = (event: React.MouseEvent) => {
		event.stopPropagation()
		const link = document.createElement("a")
		link.href = url
		link.target = "_blank"
		link.rel = "noopener"
		link.download = url.split("/").pop()?.split("?")[0] || "hinh-anh.jpg"
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	const many = images.length > 1

	return (
		<Dialog.Root
			open
			onOpenChange={(next) => {
				if (!next) onClose()
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="fixed inset-0 z-[99998] bg-black/90" />
				{/* The frame spans the viewport so the toolbar and the arrows can sit against
				    its edges, but it does not take clicks: they fall through to the overlay,
				    which is outside the dialog and therefore closes it. Only the parts worth
				    pressing take pointer events back. */}
				<Dialog.Content
					aria-describedby={undefined}
					onKeyDown={(event) => {
						if (event.key === "ArrowRight") step(1)
						if (event.key === "ArrowLeft") step(-1)
					}}
					className="pointer-events-none fixed inset-0 z-[99999] flex items-center justify-center p-4 outline-none"
				>
					<Dialog.Title className="sr-only">{altText}</Dialog.Title>

					<div className="pointer-events-auto absolute right-4 top-4 z-10 flex items-center gap-3">
						{many && (
							<span className="rounded-full bg-white/10 px-2.5 py-1 text-label-sm text-white tabular-nums backdrop-blur-sm">
								{index + 1}/{images.length}
							</span>
						)}
						<button
							type="button"
							onClick={download}
							aria-label="Tải xuống"
							title="Tải xuống"
							className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
						>
							<span className="material-symbols-outlined">download</span>
						</button>
						<Dialog.Close
							aria-label="Đóng"
							title="Đóng"
							className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25"
						>
							<span className="material-symbols-outlined">close</span>
						</Dialog.Close>
					</div>

					{many && (
						<>
							<button
								type="button"
								aria-label="Ảnh trước"
								onClick={() => step(-1)}
								className="pointer-events-auto absolute left-2 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25 md:left-6"
							>
								<span className="material-symbols-outlined">chevron_left</span>
							</button>
							<button
								type="button"
								aria-label="Ảnh sau"
								onClick={() => step(1)}
								className="pointer-events-auto absolute right-2 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/25 md:right-6"
							>
								<span className="material-symbols-outlined">chevron_right</span>
							</button>
						</>
					)}

					<div className="pointer-events-auto relative z-[1] flex h-full max-h-[90vh] w-full max-w-5xl items-center justify-center">
						<Image src={url} alt={altText} fill className="object-contain" unoptimized />
					</div>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
