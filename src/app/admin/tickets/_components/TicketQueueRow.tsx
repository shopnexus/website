"use client"

import Link from "next/link"
import Badge from "@/components/ui/Badge"
import { TICKET_KIND_VI, TICKET_REASON_VI, TICKET_STATUS_VI } from "@/lib/dictionaries"
import type { AdminTicket } from "@/api/generated/types.gen"
import WaitGutter from "@/components/admin-config/WaitGutter"
import { waitSince } from "@/lib/wait"
import { TICKET_STATUS_STYLES, readTarget } from "../_lib/queue.logic"

/**
 * One case in the queue. Pure render — the age it shows comes from the caller's clock, so
 * every row on screen ticks from one interval instead of one timer each.
 */
export default function TicketQueueRow({ entry, now }: { entry: AdminTicket; now: number }) {
	const { ticket, requester, assignee, open_tickets_against_target: pattern } = entry
	const target = readTarget(entry)

	return (
		<li>
			<Link
				href={`/admin/tickets/${ticket.id}`}
				className="group flex gap-4 px-4 sm:px-5 py-4 hover:bg-surface-container-low transition-colors"
			>
				<WaitGutter wait={waitSince(ticket.created_at, now)} />

				<div className="flex-1 min-w-0 flex flex-col gap-1.5 py-0.5">
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
						{/* A decision rests on the pattern, not on one complaint — so a target that
						    several people have reported says so before the subject does. */}
						{pattern > 1 && (
							<Badge
								variant="surface"
								icon="flag"
								className="bg-error-container text-on-error-container"
							>
								{pattern} yêu cầu về cùng đối tượng
							</Badge>
						)}
					</div>

					<div className="font-body-md font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
						{ticket.subject}
					</div>

					<div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-label-sm text-on-surface-variant">
						<span className="inline-flex items-center gap-1">
							<span className="material-symbols-outlined text-[14px]">person</span>
							{requester.name}
						</span>
						{target && (
							<span className="inline-flex items-center gap-1 min-w-0">
								<span className="material-symbols-outlined text-[14px]">link</span>
								<span className="truncate">
									{target.kind}
									{target.title ? `: ${target.title}` : ""}
								</span>
							</span>
						)}
						{assignee && (
							<span className="inline-flex items-center gap-1 ml-auto text-primary">
								<span className="material-symbols-outlined text-[14px]">how_to_reg</span>
								{assignee.name}
							</span>
						)}
					</div>
				</div>
			</Link>
		</li>
	)
}
