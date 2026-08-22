"use client"

import Link from "next/link"

import type { Ticket } from "@/api/generated/types.gen"
import {
	TICKET_ACTION_VI,
	TICKET_KIND_VI,
	TICKET_REASON_VI,
	TICKET_STATUS_VI,
} from "@/lib/dictionaries"

import { TICKET_STATUS_TONE, ticketRefHref } from "../_lib/ticket.logic"
import InfoRail from "./InfoRail"

const SECTION = "text-label-xs uppercase text-outline"

function stamp(iso: string): string {
	return new Date(iso).toLocaleString("vi-VN", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	})
}

/**
 * The rail for a support thread: what was raised, where it stands, and the verdict.
 *
 * It takes the place of the trade rail rather than sitting beside it — a ticket has no
 * price and no counterparty to vet, and the desk is not a shop to open.
 */
export default function TicketInfoPanel({
	ticket,
	isOpen,
	onClose,
}: {
	ticket: Ticket | undefined
	isOpen: boolean
	onClose: () => void
}) {
	return (
		<InfoRail title="Thông tin yêu cầu" isOpen={isOpen} onClose={onClose}>
			{ticket ? <TicketBody ticket={ticket} /> : <TicketBodyPending />}
		</InfoRail>
	)
}

function TicketBodyPending() {
	return (
		<p className="p-5 text-body-xs text-on-surface-variant">
			Đang mở yêu cầu này...
		</p>
	)
}

function TicketBody({ ticket }: { ticket: Ticket }) {
	const refHref = ticketRefHref(ticket)
	const resolved = ticket.status === "resolved"

	return (
		<div className="p-4 md:p-5 space-y-5">
			<section>
				<h3 className={`${SECTION} mb-2.5 block`}>Trạng thái</h3>
				<span
					className={`inline-block rounded-full border px-2 py-0.5 text-label-xs uppercase ${TICKET_STATUS_TONE[ticket.status]}`}
				>
					{TICKET_STATUS_VI[ticket.status]}
				</span>
				<p className="mt-2 text-body-xs text-on-surface-variant">
					{ticket.status === "open"
						? "Yêu cầu đã tới bộ phận hỗ trợ và đang chờ được nhận."
						: ticket.status === "reviewing"
							? "Một nhân viên đang xem xét yêu cầu này."
							: "Yêu cầu đã được xử lý xong."}
				</p>

				<dl className="mt-3 space-y-1.5 text-body-xs">
					<Fact label="Gửi lúc" value={stamp(ticket.created_at)} />
					{ticket.resolved_at && <Fact label="Xử lý lúc" value={stamp(ticket.resolved_at)} />}
				</dl>
			</section>

			{resolved && (
				<section className="rounded-xl border border-outline-variant bg-surface-container-low p-3.5">
					<h3 className={`${SECTION} mb-2 block`}>Kết quả</h3>
					<p className="text-title-sm text-on-surface">
						{ticket.action_taken ? TICKET_ACTION_VI[ticket.action_taken] : "—"}
					</p>
					{ticket.resolution_note && (
						<p className="mt-1.5 whitespace-pre-wrap text-body-xs text-on-surface-variant">
							{ticket.resolution_note}
						</p>
					)}
				</section>
			)}

			<section>
				<h3 className={`${SECTION} mb-2.5 block`}>Nội dung yêu cầu</h3>
				<p className="mb-2.5 text-title-sm text-on-surface">
					{ticket.subject}
				</p>
				<dl className="space-y-1.5 text-body-xs">
					<Fact label="Loại" value={TICKET_KIND_VI[ticket.kind]} />
					{ticket.reason && <Fact label="Lý do" value={TICKET_REASON_VI[ticket.reason]} />}
				</dl>

				{ticket.ref_id && (
					<div className="mt-3 p-2.5 rounded-xl bg-surface-container-low border border-outline-variant">
						<p className="mb-1 text-label-xs uppercase text-outline">
							Nội dung liên quan
						</p>
						<code className="break-all font-mono text-label-xs text-on-surface-variant">
							{ticket.ref_id}
						</code>
						{refHref && (
							<Link
								href={refHref}
								className="mt-1.5 block text-label-sm text-primary hover:underline"
							>
								Mở nội dung này →
							</Link>
						)}
					</div>
				)}
			</section>

			<section className="pt-4 border-t border-outline-variant">
				<h3 className={`${SECTION} mb-2.5 block`}>Cách hỗ trợ trả lời</h3>
				<div className="bg-primary-container/10 p-3 rounded-xl border border-primary/10">
					<p className="text-body-xs text-on-surface-variant">
						Bộ phận hỗ trợ trả lời dưới tên ShopNexus, không phải tên nhân viên — người tiếp nhận
						sau vẫn đọc được toàn bộ hội thoại này. Thêm ảnh hoặc thông tin mới ngay trong hội
						thoại, không cần gửi yêu cầu khác.
					</p>
					<Link
						href="/help"
						className="mt-1.5 inline-block text-label-sm text-primary hover:underline"
					>
						Trung tâm trợ giúp →
					</Link>
				</div>
			</section>
		</div>
	)
}

function Fact({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-baseline justify-between gap-2">
			<dt className="text-on-surface-variant shrink-0">{label}</dt>
			<dd className="text-right text-label-sm text-on-surface tabular-nums">{value}</dd>
		</div>
	)
}
