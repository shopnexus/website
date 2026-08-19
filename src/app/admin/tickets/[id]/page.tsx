"use client"

import { use } from "react"
import Link from "next/link"
import { AdminCanvas } from "@/components/admin-config/AdminPage"
import ChatThread from "@/components/chat/ChatThread"
import Skeleton from "@/components/ui/Skeleton"
import { useNow } from "@/hooks/useNow"
import ClaimBar from "./_components/ClaimBar"
import RefundVerdictPanel from "./_components/RefundVerdictPanel"
import ResolutionForm from "./_components/ResolutionForm"
import TicketCaseHeader from "./_components/TicketCaseHeader"
import TicketTargetCard from "./_components/TicketTargetCard"
import { useTicketCase } from "./_hooks/useTicketCase"

/**
 * One case: the evidence on the left, the decision on the right.
 *
 * The left column is the ticket's thread — a ticket *is* a conversation, so replying is
 * the ordinary chat box and not a second reply form. Staff are anonymised to the
 * requester by the server (`from_support`, blank sender), which is why nothing here tries
 * to hide anything: the moderator sees the requester's words and their own as themselves.
 */
export default function AdminTicketPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = use(params)
	const { entry, isLoading, isError, target, unread, claimable, refundDispute, orderRefund } =
		useTicketCase(id)
	const now = useNow(30_000)

	if (isLoading) {
		return (
			<AdminCanvas>
				<Skeleton className="h-32 w-full rounded-2xl" />
				<Skeleton className="h-[420px] w-full rounded-2xl" />
			</AdminCanvas>
		)
	}

	if (isError || !entry) {
		return (
			<AdminCanvas>
				<div className="flex flex-col items-start gap-3">
					<p className="font-body-sm text-on-surface-variant">Không tìm thấy yêu cầu này.</p>
					<Link href="/admin/tickets" className="font-label-md text-primary hover:underline">
						Quay lại hàng đợi
					</Link>
				</div>
			</AdminCanvas>
		)
	}

	const { ticket, requester } = entry
	const resolved = ticket.status === "resolved"

	return (
		<AdminCanvas>
			<Link
				href="/admin/tickets"
				className="inline-flex items-center gap-2 font-label-md text-on-surface-variant hover:text-primary transition-colors w-fit"
			>
				<span className="material-symbols-outlined text-[20px]">arrow_back</span>
				Hàng đợi yêu cầu
			</Link>

			<TicketCaseHeader entry={entry} now={now} />

			<div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-5 items-start">
				<div className="bg-surface-container-lowest border border-outline-variant rounded-2xl overflow-hidden flex flex-col h-[560px]">
					<div className="px-5 py-3 border-b border-outline-variant flex items-center gap-2 shrink-0">
						<span className="material-symbols-outlined text-primary text-[20px]">forum</span>
						<h2 className="font-label-md text-on-surface">Trao đổi với {requester.name}</h2>
					</div>

					{ticket.conversation_id ? (
						<ChatThread
							conversationId={ticket.conversation_id}
							counterparty={{ name: requester.name, avatarUrl: requester.avatar?.url }}
							unread={unread}
							placeholder={`Trả lời ${requester.name}...`}
						/>
					) : (
						// The ticket row and its thread live in different schemas, so one lands
						// first; reading the ticket is what repairs the pairing.
						<div className="flex-1 flex items-center justify-center text-center font-body-sm text-on-surface-variant p-8">
							Đang mở cuộc trao đổi cho yêu cầu này. Tải lại trang sau ít giây.
						</div>
					)}
				</div>

				<div className="flex flex-col gap-4">
					<ClaimBar ticketId={ticket.id} claimable={claimable} assignee={entry.assignee} />

					{target && (
						<TicketTargetCard
							target={target}
							openAgainstTarget={entry.open_tickets_against_target}
						/>
					)}

					{/* A refund dispute is decided where the money is; every other kind is
					    concluded by recording what was done. Never both. */}
					{!resolved &&
						(refundDispute ? (
							<RefundVerdictPanel orderRefId={ticket.ref_id} refund={orderRefund} />
						) : (
							<ResolutionForm ticketId={ticket.id} />
						))}
				</div>
			</div>
		</AdminCanvas>
	)
}
