"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"

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
import type { Message, MessageId, SendMessageRequest } from "@/api/generated/types.gen"

import ChatComposer from "./ChatComposer"
import MessageRow from "./MessageRow"
import PendingMessageRow from "./PendingMessageRow"
import {
	canModifyMessage,
	firstUnreadMessageId,
	groupMessagesByDay,
	isOwnMessage,
	isSeenBy,
	lastOwnMessageId,
	replyDraft,
	type ReplyDraft,
} from "./chat.logic"
import { useChatAttachments } from "./hooks/useChatAttachments"
import { useMessageOutbox } from "./hooks/useMessageOutbox"
import { useThreadScroll } from "./hooks/useThreadScroll"
import type { ChatThreadProps } from "./types"

/**
 * One thread's messages and the box you write in.
 *
 * Mounted per conversation by `ChatThread`, which keys it on the id — so switching threads
 * remounts rather than resetting, and an edit in progress or a staged attachment cannot
 * survive into somebody else's conversation. The read mark and the outbox rely on that
 * remount too: both are per-thread by construction rather than by a reset effect.
 */
export default function ThreadView({
	conversationId,
	counterparty,
	refs,
	unread = 0,
	counterpartyReadAt,
	readAt,
	placeholder,
	onReportMessage,
}: ChatThreadProps) {
	/** The image set being viewed and the position in it, or null while closed. */
	const [viewer, setViewer] = useState<{
		images: string[]
		index: number
	} | null>(null)
	const [editingId, setEditingId] = useState<MessageId | null>(null)
	/** The message an unsend is being confirmed for. Redaction cannot be undone. */
	const [pendingDeletion, setPendingDeletion] = useState<Message | null>(null)
	const [isDropping, setDropping] = useState(false)
	/** The message being answered, until it is sent or dropped. */
	const [replyTo, setReplyTo] = useState<ReplyDraft | null>(null)
	/** Briefly marked after a jump from a quote, so the eye lands on the right row. */
	const [highlightId, setHighlightId] = useState<MessageId | null>(null)

	const me = useAuthStore((state) => state.user)
	const { messages, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } =
		useMessages(conversationId)
	const sendMessage = useSendMessage(conversationId)
	const editMessage = useEditMessage()
	const deleteMessage = useDeleteMessage()
	const markRead = useMarkConversationRead()
	const attachments = useChatAttachments()

	// What the sender pointed at rides every outgoing message, so it belongs to the send
	// rather than to any one entry in the outbox.
	const send = useCallback(
		(payload: SendMessageRequest) => sendMessage.mutateAsync({ ...payload, refs }),
		[sendMessage, refs],
	)
	const outbox = useMessageOutbox(send)

	const { listRef, contentRef, onScroll, preserveOnPrepend, isPinned, unseenCount, jumpToEnd } =
		useThreadScroll(messages, conversationId)
	const topSentinelRef = useRef<HTMLDivElement>(null)

	/**
	 * Where the reader had got to when they opened this. Frozen on mount, because the very
	 * next thing this component does is post the read receipt — after which the answer is
	 * always "all of it" and the line would never appear.
	 */
	const [openedAtReadMark] = useState<string | null>(() => (unread > 0 ? (readAt ?? null) : null))
	const [unreadOnOpen] = useState(() => unread)

	// Opening a thread with unread messages is the read receipt.
	useEffect(() => {
		if (conversationId && unread > 0 && !markRead.isPending) {
			markRead.mutate(conversationId)
		}
		// markRead is stable apart from its pending flag, guarded above.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [conversationId, unread])

	/**
	 * Older history pages itself as the reader approaches the top. It was a button, so a
	 * thread's past was reachable only by noticing it and pressing it — while the list of
	 * threads beside it had been paging on scroll all along.
	 *
	 * Watched only once the reader has left the end. On open, the sentinel is briefly in view
	 * because the jump to the newest message happens on the next frame, and an observer armed
	 * then would fetch a page of history nobody asked for on every thread opened. Leaving the
	 * end is the only way to reach the top, so it is the honest condition — and a full page
	 * of fifty messages always overflows the pane, so there is no short thread that needs the
	 * fetch while still pinned.
	 */
	useEffect(() => {
		const sentinel = topSentinelRef.current
		const root = listRef.current
		if (!sentinel || !root || isPinned || !hasNextPage || isFetchingNextPage || isLoading) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries.some((entry) => entry.isIntersecting)) preserveOnPrepend(fetchNextPage)
			},
			{ root, rootMargin: "120px" },
		)
		observer.observe(sentinel)
		return () => observer.disconnect()
	}, [
		isPinned,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		preserveOnPrepend,
		fetchNextPage,
		listRef,
	])

	const days = useMemo(() => groupMessagesByDay(messages), [messages])
	const receiptTargetId = useMemo(() => lastOwnMessageId(messages, me?.id), [messages, me?.id])
	const newMessageMarkId = useMemo(
		() => firstUnreadMessageId(messages, openedAtReadMark, me?.id, unreadOnOpen),
		[messages, openedAtReadMark, me?.id, unreadOnOpen],
	)

	const handleSend = (body: string) => {
		if (!conversationId) return
		outbox.enqueue(body, attachments.pending, replyTo?.ref)
		// The tray is emptied because the outbox entry now holds those resources; a failed
		// send is retried from the bubble, with the same files and the same reply.
		attachments.clear()
		setReplyTo(null)
	}

	/**
	 * Jump to the message a quote points at.
	 *
	 * Only when the row is on screen: history is a cursor stream, so a quote can name
	 * something a hundred messages back that has not been paged in. Rather than fetching
	 * blindly towards it, the quote stays readable where it is — the preview is the part that
	 * was needed, and the jump is the bonus.
	 */
	const jumpToQuoted = (target: MessageId) => {
		const row = listRef.current?.querySelector<HTMLElement>(`[data-message-id="${target}"]`)
		if (!row) return
		const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
		row.scrollIntoView({
			block: "center",
			behavior: reduced ? "auto" : "smooth",
		})
		setHighlightId(target)
	}

	// The mark is a hint, not a state: it clears itself so a later jump reads as a new one.
	useEffect(() => {
		if (!highlightId) return
		const timer = setTimeout(() => setHighlightId(null), 1600)
		return () => clearTimeout(timer)
	}, [highlightId])

	const isBusy = editMessage.isPending || deleteMessage.isPending

	return (
		<div
			className="flex-1 flex flex-col min-h-0 relative"
			onDragOver={(event) => {
				if (!conversationId || event.dataTransfer.types.indexOf("Files") === -1) return
				event.preventDefault()
				setDropping(true)
			}}
			onDragLeave={(event) => {
				// Only when the pointer actually left the pane, not on every child boundary.
				if (event.currentTarget.contains(event.relatedTarget as Node | null)) return
				setDropping(false)
			}}
			onDrop={(event) => {
				if (!conversationId) return
				const files = Array.from(event.dataTransfer.files)
				event.preventDefault()
				setDropping(false)
				if (files.length > 0) void attachments.add(files)
			}}
		>
			<div
				ref={listRef}
				onScroll={onScroll}
				className="flex-1 overflow-y-auto bg-surface-container-lowest/50"
			>
				{/* The contents are their own box so their height can be watched: it grows after
				    the first paint, and the end has to be held across that — see useThreadScroll. */}
				<div ref={contentRef} className="p-4 md:p-5 space-y-4">
					{/* Above the first message, so approaching the top is what asks for more. */}
					<div ref={topSentinelRef} aria-hidden="true" className="h-px" />

					{(isLoading || isFetchingNextPage) && (
						<div className="flex justify-center py-4">
							<span className="material-symbols-outlined animate-spin text-primary">
								progress_activity
							</span>
						</div>
					)}

					{!isLoading && messages.length === 0 && outbox.entries.length === 0 && (
						<div className="flex justify-center py-8 text-xs text-on-surface-variant">
							{conversationId ? "Chưa có tin nhắn nào." : "Chọn một cuộc trò chuyện để bắt đầu."}
						</div>
					)}

					{days.map((day) => (
						<div key={day.key} className="space-y-4">
							<div className="flex justify-center">
								<span className="rounded-full bg-surface-container px-3 py-0.5 text-label-xs uppercase text-on-surface-variant">
									{day.label}
								</span>
							</div>

							{day.items.map((message) => {
								const mine = isOwnMessage(message, me?.id)
								return (
									<div key={message.id} className="space-y-4">
										{message.id === newMessageMarkId && <NewMessageMark />}

										<MessageRow
											message={message}
											isMine={mine}
											canModify={canModifyMessage(message, me?.id)}
											accountId={me?.id}
											counterparty={counterparty}
											isHighlighted={highlightId === message.id}
											// Only where the caller passed the read mark. A screen that does
											// not know says nothing, rather than claiming "Đã gửi" over a
											// message the other side has in fact read.
											receipt={
												counterpartyReadAt !== undefined && mine && message.id === receiptTargetId
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
													{
														id: message.id,
														createdAt: message.created_at,
														body,
													},
													{ onSuccess: () => setEditingId(null) },
												)
											}
											onDelete={() => setPendingDeletion(message)}
											onOpenImage={(images, index) => setViewer({ images, index })}
											// A system note and a support reply have no sender, so there is
											// nobody to report: only the other party's own words.
											onReport={
												onReportMessage && message.sender_id && !mine
													? () => onReportMessage(message)
													: undefined
											}
											// A redacted message has nothing left to quote, and a thread
											// with no id has nowhere to send the reply.
											onReply={
												conversationId && message.deleted_at === null
													? () => setReplyTo(replyDraft(message, me?.id, counterparty?.name))
													: undefined
											}
											onJumpToQuoted={
												message.reply_to ? () => jumpToQuoted(message.reply_to!.id) : undefined
											}
										/>
									</div>
								)
							})}
						</div>
					))}

					{outbox.entries.map((entry) => (
						<PendingMessageRow
							key={entry.key}
							entry={entry}
							onRetry={() => outbox.retry(entry)}
							onDiscard={() => outbox.discard(entry.key)}
						/>
					))}
				</div>
			</div>

			{/* Offered rather than taken: the reader looking at history decides when to come
			    back to the end. */}
			{!isPinned && messages.length > 0 && (
				<button
					type="button"
					onClick={jumpToEnd}
					className="absolute bottom-24 right-4 z-10 flex cursor-pointer items-center gap-1.5 rounded-full border border-outline-variant bg-surface py-1.5 pl-3 pr-2.5 text-label-sm text-on-surface shadow-lg transition-colors hover:border-primary hover:text-primary md:right-6"
				>
					{unseenCount > 0
						? `${unseenCount > 99 ? "99+" : unseenCount} tin nhắn mới`
						: "Xuống cuối"}
					<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
						arrow_downward
					</span>
				</button>
			)}

			{isDropping && (
				<div className="absolute inset-0 z-20 m-3 rounded-2xl border-2 border-dashed border-primary bg-primary-container/20 backdrop-blur-sm flex flex-col items-center justify-center gap-2 pointer-events-none">
					<span className="material-symbols-outlined text-primary text-[32px]" aria-hidden="true">
						upload_file
					</span>
					<span className="text-label-md text-primary">Thả để đính kèm</span>
				</div>
			)}

			<ChatComposer
				disabled={!conversationId}
				replyTo={replyTo}
				onCancelReply={() => setReplyTo(null)}
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
				images={viewer?.images ?? []}
				index={viewer?.index ?? null}
				onIndexChange={(index) =>
					setViewer((current) => (current ? { ...current, index } : current))
				}
				onClose={() => setViewer(null)}
				altText="Tệp đính kèm trong hội thoại"
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
									{
										id: pendingDeletion.id,
										createdAt: pendingDeletion.created_at,
									},
									{ onSuccess: () => setPendingDeletion(null) },
								)
							}}
						>
							{deleteMessage.isPending ? "Đang thu hồi..." : "Thu hồi"}
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	)
}

/** Where the reader left off. Drawn once, above the first message they have not seen. */
function NewMessageMark() {
	return (
		<div className="flex items-center gap-2" role="separator" aria-label="Tin nhắn mới">
			<span className="h-px flex-1 bg-tertiary/40" />
			<span className="text-label-xs uppercase text-tertiary">Tin nhắn mới</span>
			<span className="h-px flex-1 bg-tertiary/40" />
		</div>
	)
}
