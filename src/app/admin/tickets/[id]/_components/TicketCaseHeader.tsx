"use client"

import Badge from "@/components/ui/Badge"
import {
	TICKET_ACTION_VI,
	TICKET_KIND_VI,
	TICKET_REASON_VI,
	TICKET_STATUS_VI,
} from "@/lib/dictionaries"
import type { AdminTicket } from "@/api/generated/types.gen"
import { TICKET_STATUS_STYLES, waitSince } from "../../_lib/queue.logic"
import WaitGutter from "../../_components/WaitGutter"

/** The case at a glance: who raised it, how long ago, and how it ended if it has. */
export default function TicketCaseHeader({ entry, now }: { entry: AdminTicket; now: number }) {
	const { ticket, requester, assignee, resolved_by: resolvedBy } = entry

	return (
		<div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 flex gap-4">
			<WaitGutter wait={waitSince(ticket.created_at, now)} />

			<div className="flex-1 min-w-0 flex flex-col gap-2">
				<div className="flex flex-wrap items-center gap-2">
					<Badge variant="surface" className={TICKET_STATUS_STYLES[ticket.status]}>
						{TICKET_STATUS_VI[ticket.status]}
					</Badge>
					<span className="font-label-sm text-on-surface-variant">
						{TICKET_KIND_VI[ticket.kind]}
					</span>
					{ticket.reason && (
						<span className="font-label-sm text-on-surface-variant">
							· {TICKET_REASON_VI[ticket.reason]}
						</span>
					)}
					<span className="font-label-sm text-on-surface-variant ml-auto">
						{new Date(ticket.created_at).toLocaleString("vi-VN")}
					</span>
				</div>

				<h1 className="font-headline-sm font-bold text-on-surface break-words">
					{ticket.subject}
				</h1>

				<div className="flex flex-wrap gap-x-4 gap-y-1 font-label-sm text-on-surface-variant">
					<span className="inline-flex items-center gap-1">
						<span className="material-symbols-outlined text-[15px]">person</span>
						Người gửi: {requester.name}
					</span>
					{assignee && (
						<span className="inline-flex items-center gap-1 text-primary">
							<span className="material-symbols-outlined text-[15px]">how_to_reg</span>
							Đang xử lý: {assignee.name}
						</span>
					)}
				</div>

				{ticket.status === "resolved" && (
					<div className="mt-1 pt-3 border-t border-outline-variant flex flex-col gap-1">
						<div className="font-body-sm text-on-surface">
							Kết quả:{" "}
							<span className="font-semibold">
								{ticket.action_taken ? TICKET_ACTION_VI[ticket.action_taken] : "—"}
							</span>
							{resolvedBy && (
								<span className="text-on-surface-variant"> · bởi {resolvedBy.name}</span>
							)}
						</div>
						{ticket.resolution_note && (
							<p className="font-body-sm text-on-surface-variant whitespace-pre-wrap">
								{ticket.resolution_note}
							</p>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
