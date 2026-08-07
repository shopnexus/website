"use client"

import { useEffect, useMemo, useState } from "react"

import Button from "@/components/ui/Button"
import ImageViewerModal from "@/components/ui/ImageViewerModal"
import Modal from "@/components/ui/Modal"
import {
	useDeleteMessage,
	useEditMessage,
	useMarkConversationRead,
	useMessages,
	useSendMessage,
} from "@/hooks/api/useChat"
import { useAuthStore } from "@/stores/use-auth-store"
import type { Message, MessageId } from "@/api/generated/types.gen"

import ChatComposer from "./ChatComposer"
import MessageRow from "./MessageRow"
import {
	canModifyMessage,
	groupMessagesByDay,
	isOwnMessage,
	isSeenBy,
	lastOwnMessageId,
} from "./chat.logic"
import { useChatAttachments } from "./hooks/useChatAttachments"
import { useThreadScroll } from "./hooks/useThreadScroll"
import type { ChatThreadProps } from "./types"

/**
 * One thread's messages and the box you write in.
 *
 * Mounted per conversation by `ChatThread`, which keys it on the id — so switching threads
 * remounts rather than resetting, and an edit in progress or a staged attachment cannot
 * survive into somebody else's conversation.
 */
export default function ThreadView({
	conversationId,
	counterparty,
	refs,
	unread = 0,
	counterpartyReadAt,
	placeholder,
}: ChatThreadProps) {
	const [viewerImageUrl, setViewerImageUrl] = useState<string | null>(null)
	const [editingId, setEditingId] = useState<MessageId | null>(null)
	/** The message an unsend is being confirmed for. Redaction cannot be undone. */
	const [pendingDeletion, setPendingDeletion] = useState<Message | null>(null)

	const me = useAuthStore((state) => state.user)
	const { messages, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useMessages(conversationId)
	const sendMessage = useSendMessage(conversationId)
	const editMessage = useEditMessage()
	const deleteMessage = useDeleteMessage()
	const markRead = useMarkConversationRead()
	const attachments = useChatAttachments()

	const { listRef, preserveOnPrepend } = useThreadScroll(messages, conversationId)

	// Opening a thread with unread messages is the read receipt.
	useEffect(() => {
		if (conversationId && unread > 0 && !markRead.isPending) {
			markRead.mutate(conversationId)
		}
		// markRead is stable apart from its pending flag, guarded above.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [conversationId, unread])

	const days = useMemo(() => groupMessagesByDay(messages), [messages])
	const receiptTargetId = useMemo(() => lastOwnMessageId(messages, me?.id), [messages, me?.id])

	const handleSend = (body: string) => {
		if (!conversationId) return
		const ids = attachments.pending.map((item) => item.id)
		sendMessage.mutate(
			{
				body: body || undefined,
				attachments: ids.length > 0 ? ids : undefined,
				refs,
			},
			{ onSuccess: () => attachments.clear() },
		)
	}

	const isBusy = editMessage.isPending || deleteMessage.isPending

	return (
		<>
			<div
				ref={listRef}
				className="flex-1 p-4 md:p-5 overflow-y-auto space-y-4 bg-surface-container-lowest/50"
			>
				{isLoading && (
					<div className="flex justify-center py-8">
						<span className="material-symbols-outlined animate-spin text-primary">
							progress_activity
						</span>
					</div>
				)}

				{!isLoading && messages.length === 0 && (
					<div className="flex justify-center py-8 text-xs text-on-surface-variant">
						{conversationId ? "Chưa có tin nhắn nào." : "Chọn một cuộc trò chuyện để bắt đầu."}
					</div>
				)}

				{/* History is a cursor stream fifty rows deep; without this the thread simply
				    stopped at its most recent page and the rest was unreachable. */}
				{hasNextPage && (
					<div className="flex justify-center">
						<button
							type="button"
							disabled={isFetchingNextPage}
							onClick={() => preserveOnPrepend(fetchNextPage)}
							className="px-4 py-1.5 rounded-full border border-outline-variant text-[11px] font-bold text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors disabled:opacity-50 cursor-pointer"
						>
							{isFetchingNextPage ? "Đang tải..." : "Xem tin nhắn cũ hơn"}
						</button>
					</div>
				)}

				{days.map((day) => (
					<div key={day.key} className="space-y-4">
						<div className="flex justify-center">
							<span className="px-3 py-0.5 rounded-full bg-surface-container text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
								{day.label}
							</span>
						</div>

						{day.items.map((message) => {
							const mine = isOwnMessage(message, me?.id)
							return (
								<MessageRow
									key={message.id}
									message={message}
									isMine={mine}
									canModify={canModifyMessage(message, me?.id)}
									counterparty={counterparty}
									// Only where the caller passed the read mark. A screen that does
									// not know says nothing, rather than claiming "Đã gửi" over a
									// message the other side has in fact read.
									receipt={
										counterpartyReadAt !== undefined &&
										mine &&
										message.id === receiptTargetId
											? isSeenBy(message, counterpartyReadAt)
												? "Đã xem"
												: "Đã gửi"
											: undefined
									}
									isEditing={editingId === message.id}
									isSaving={isBusy}
									onStartEdit={() => setEditingId(message.id)}
									onCancelEdit={() => setEditingId(null)}
									onSaveEdit={(body) =>
										editMessage.mutate(
											{ id: message.id, createdAt: message.created_at, body },
											{ onSuccess: () => setEditingId(null) },
										)
									}
									onDelete={() => setPendingDeletion(message)}
									onOpenImage={setViewerImageUrl}
								/>
							)
						})}
					</div>
				))}
			</div>

			<ChatComposer
				disabled={!conversationId}
				isSending={sendMessage.isPending}
				placeholder={
					placeholder ??
					(counterparty
						? `Viết tin nhắn cho ${counterparty.name}...`
						: "Chọn một cuộc trò chuyện...")
				}
				attachments={attachments.pending}
				isUploading={attachments.isUploading}
				onPickFiles={(files) => void attachments.add(files)}
				onRemoveAttachment={attachments.remove}
				onSend={handleSend}
			/>

			<ImageViewerModal
				isOpen={Boolean(viewerImageUrl)}
				onClose={() => setViewerImageUrl(null)}
				imageUrl={viewerImageUrl || ""}
			/>

			<Modal
				open={pendingDeletion !== null}
				title="Thu hồi tin nhắn"
				onClose={() => setPendingDeletion(null)}
			>
				<div className="space-y-4">
					<p className="text-body-sm text-on-surface-variant leading-relaxed">
						Nội dung và tệp đính kèm sẽ bị xóa với cả hai bên. Dòng tin nhắn vẫn còn trong cuộc trò
						chuyện và được đánh dấu là đã thu hồi — không thể hoàn tác.
					</p>
					<div className="flex justify-end gap-2">
						<Button variant="ghost" onClick={() => setPendingDeletion(null)}>
							Giữ lại
						</Button>
						<Button
							variant="error"
							disabled={deleteMessage.isPending}
							onClick={() => {
								if (!pendingDeletion) return
								deleteMessage.mutate(
									{ id: pendingDeletion.id, createdAt: pendingDeletion.created_at },
									{ onSuccess: () => setPendingDeletion(null) },
								)
							}}
						>
							{deleteMessage.isPending ? "Đang thu hồi..." : "Thu hồi"}
						</Button>
					</div>
				</div>
			</Modal>
		</>
	)
}
