"use client"

import Link from "next/link"

import type { Ticket } from "@/api/generated/types.gen"
import { TICKET_ACTION_VI, TICKET_STATUS_VI } from "@/lib/dictionaries"

import { TICKET_STATUS_TONE, ticketKindLine, ticketRefHref } from "../_lib/ticket.logic"

/**
 * The ticket this thread is about, pinned above the messages — the support answer to the
 * listing banner.
 *
 * The verdict is here rather than a screen away: "kết quả" is the reason a resolved ticket
 * is reopened at all, and scrolling a thread to find it is how it gets missed.
 */
export default function TicketBanner({ ticket }: { ticket: Ticket }) {
	const refHref = ticketRefHref(ticket)
	const resolved = ticket.status === "resolved"

	return (
		<div className="bg-surface border-b border-outline-variant px-3 py-2.5 md:px-4 shrink-0 shadow-sm z-10 relative">
			<div className="flex items-start justify-between gap-3">
				<div className="min-w-0">
					<div className="flex items-center gap-2 flex-wrap">
						<span
							className={`rounded-full border px-1.5 py-px text-label-xs uppercase ${TICKET_STATUS_TONE[ticket.status]}`}
						>
							{TICKET_STATUS_VI[ticket.status]}
						</span>
						<span className="truncate text-label-xs text-on-surface-variant">
							{ticketKindLine(ticket)}
						</span>
					</div>

					<p className="mt-1 line-clamp-2 text-title-sm text-on-surface">
						{ticket.subject}
					</p>
				</div>

				{refHref && (
					<Link
						href={refHref}
						className="inline-flex shrink-0 items-center gap-1 text-label-sm text-primary hover:underline"
					>
						Xem nội dung liên quan
						<span className="material-symbols-outlined text-[14px]" aria-hidden="true">
							open_in_new
						</span>
					</Link>
				)}
			</div>

			{resolved && (
				<p className="mt-2 border-t border-outline-variant pt-2 text-body-xs text-on-surface-variant">
					<span className="text-label-sm text-on-surface">
						Kết quả: {ticket.action_taken ? TICKET_ACTION_VI[ticket.action_taken] : "—"}
					</span>
					{ticket.resolution_note && (
						<span className="block mt-0.5 whitespace-pre-wrap">{ticket.resolution_note}</span>
					)}
				</p>
			)}
		</div>
	)
}
