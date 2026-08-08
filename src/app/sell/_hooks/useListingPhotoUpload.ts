"use client"

import { useState } from "react"
import { sameOriginUploadUrl } from "@/api/upload"
import {
	useConfirmListingUpload,
	useRequestListingUpload,
} from "@/hooks/api/useCatalog"
import type { ListingPhoto } from "../types"

export function useListingPhotoUpload() {
	const requestUpload = useRequestListingUpload()
	const confirmUpload = useConfirmListingUpload()
	const [uploadingCount, setUploadingCount] = useState(0)

	async function uploadFiles(files: File[]): Promise<ListingPhoto[]> {
		if (files.length === 0) return []
		setUploadingCount(files.length)
		const uploaded: ListingPhoto[] = []
		try {
			for (const file of files) {
				try {
					const slot = await requestUpload.mutateAsync({
						filename: file.name,
						mime: file.type,
						size: file.size,
					})
					const response = await fetch(sameOriginUploadUrl(slot.url), {
						method: "PUT",
						body: file,
						headers: { ...slot.headers, "Content-Type": file.type },
					})
					if (!response.ok) throw new Error(`Upload failed with status ${response.status}`)
					const resource = await confirmUpload.mutateAsync(slot.resource_id)
					const previewUrl = file.type.startsWith("image/") ? resource.url : undefined
					uploaded.push({ id: resource.id, url: resource.url ?? "", previewUrl })
				} catch {
					// Keep successful files from the same selection. The caller reports the partial result.
				} finally {
					setUploadingCount((count) => Math.max(0, count - 1))
				}
			}
			return uploaded
		} finally {
			setUploadingCount(0)
		}
	}

	return {
		uploadFiles,
		uploadingCount,
		isUploading: uploadingCount > 0,
	}
}
