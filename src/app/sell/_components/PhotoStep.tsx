"use client"

import { useRef } from "react"
import Image from "next/image"
import type { ListingSuggestion, ResourceId } from "@/api/generated/types.gen"
import AiSuggestionPanel from "./AiSuggestionPanel"
import type { ListingPhoto } from "../types"

interface PhotoStepProps {
	photos: ListingPhoto[]
	isUploading: boolean
	uploadingCount: number
	onUpload: (files: File[]) => Promise<void>
	onRemove: (id: ResourceId) => void
	onSuggestion: (suggestion: ListingSuggestion) => void
}

export default function PhotoStep({
	photos,
	isUploading,
	uploadingCount,
	onUpload,
	onRemove,
	onSuggestion,
}: PhotoStepProps) {
	const inputRef = useRef<HTMLInputElement>(null)

	async function chooseFiles(event: React.ChangeEvent<HTMLInputElement>): Promise<void> {
		const files = Array.from(event.target.files ?? [])
		if (files.length > 0) await onUpload(files)
		if (inputRef.current) inputRef.current.value = ""
	}

	return (
		<section className="space-y-7">
			<header>
				<p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">Bước 1 · Hình ảnh</p>
				<h2 className="text-2xl font-bold tracking-tight text-on-surface">Cho người mua nhìn rõ món đồ</h2>
				<p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">
					Ảnh đầu tiên là ảnh bìa. Ưu tiên mặt trước, mặt sau và các dấu hiệu đã qua sử dụng.
				</p>
			</header>

			<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
				<button
					type="button"
					onClick={() => inputRef.current?.click()}
					disabled={isUploading}
					className="group grid aspect-square place-items-center rounded-2xl border-2 border-dashed border-primary/35 bg-primary/5 p-4 text-center transition hover:border-primary hover:bg-primary/10 disabled:opacity-50"
				>
					<div>
						<span className="material-symbols-outlined text-[34px] text-primary transition-transform group-hover:-translate-y-0.5">add_photo_alternate</span>
						<p className="mt-2 text-sm font-bold text-primary">
							{isUploading ? `Đang tải ${uploadingCount} ảnh` : "Thêm ảnh"}
						</p>
					</div>
				</button>
				{photos.map((photo, index) => (
					<div key={photo.id} className="group relative aspect-square overflow-hidden rounded-2xl border border-outline-variant bg-surface-container">
						{photo.url ? <Image src={photo.url} alt={`Ảnh sản phẩm ${index + 1}`} fill sizes="(max-width: 640px) 50vw, 220px" className="object-cover" /> : null}
						<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-3 pt-8 text-xs font-semibold text-white">
							{index === 0 ? "Ảnh bìa" : `Ảnh ${index + 1}`}
						</div>
						<button
							type="button"
							aria-label={`Xóa ảnh ${index + 1}`}
							onClick={() => onRemove(photo.id)}
							className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-black/55 text-white opacity-100 backdrop-blur transition hover:bg-error sm:opacity-0 sm:group-hover:opacity-100"
						>
							<span className="material-symbols-outlined text-[18px]">close</span>
						</button>
					</div>
				))}
			</div>
			<input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={chooseFiles} />

			<AiSuggestionPanel attachments={photos.map(({ id }) => id)} onSuggestion={onSuggestion} />
		</section>
	)
}
