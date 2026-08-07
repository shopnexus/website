"use client"

import { useCallback, useState } from "react"

import { useConfirmChatUpload, useRequestChatUpload } from "@/hooks/api/useChat"
import { sameOriginUploadUrl } from "@/api/upload"
import type { ResourceId } from "@/api/generated/types.gen"

import type { PendingAttachment } from "../types"

/**
 * The composer's attachment tray.
 *
 * Files upload the moment they are picked — request a slot, PUT the bytes, confirm — but
 * the message is not sent until the user presses send. That is what lets a picture carry
 * a caption, and lets several pictures ride one message: `SendMessageRequest.attachments`
 * is a list, and sending one message per file was the client's limitation, not the API's.
 *
 * Removing one only drops it from the next send. The resource stays uploaded, which is
 * the same trade the ticket form makes: there is no route to un-upload, and a stranded
 * object nobody references is cheaper than a delete route that could orphan a live one.
 */
export function useChatAttachments() {
	const [pending, setPending] = useState<PendingAttachment[]>([])
	const [uploadingCount, setUploadingCount] = useState(0)

	const requestUpload = useRequestChatUpload()
	const confirmUpload = useConfirmChatUpload()

	const add = useCallback(
		async (files: FileList | File[]) => {
			const list = Array.from(files)
			if (list.length === 0) return

			setUploadingCount((count) => count + list.length)
			try {
				for (const file of list) {
					try {
						const slot = await requestUpload.mutateAsync({
							filename: file.name,
							mime: file.type,
							size: file.size,
						})

						const response = await fetch(sameOriginUploadUrl(slot.url), {
							method: "PUT",
							body: file,
							headers: { "Content-Type": file.type },
						})
						if (!response.ok) throw new Error("upload failed")

						const resource = await confirmUpload.mutateAsync(slot.resource_id)
						const previewUrl = file.type.startsWith("image/")
							? URL.createObjectURL(file)
							: undefined

						setPending((current) => [
							...current,
							{ id: resource.id, name: file.name, resource, previewUrl },
						])
					} finally {
						setUploadingCount((count) => count - 1)
					}
				}
			} catch {
				// The global error handler raises the toast; a file that failed simply never
				// reaches the tray, so the user sees exactly what will be sent.
			}
		},
		[confirmUpload, requestUpload],
	)

	const remove = useCallback((id: ResourceId) => {
		setPending((current) => {
			const item = current.find((i) => i.id === id)
			if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl)
			return current.filter((i) => i.id !== id)
		})
	}, [])

	const clear = useCallback(() => {
		setPending((current) => {
			current.forEach((item) => {
				if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
			})
			return []
		})
	}, [])

	return { pending, uploadingCount, isUploading: uploadingCount > 0, add, remove, clear }
}
