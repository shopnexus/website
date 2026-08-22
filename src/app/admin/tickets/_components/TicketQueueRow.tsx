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
				className="group flex gap-3 px-3 py-2.5 transition-colors hover:bg-surface-container-low sm:px-4"
			>
				<WaitGutter wait={waitSince(ticket.created_at, now)} />

				<div className="flex min-w-0 flex-1 flex-col gap-0.5 py-px">
					<div className="flex items-center gap-2">
						<span className="min-w-0 flex-1 truncate font-label-md font-semibold text-on-surface transition-colors group-hover:text-primary">
							{ticket.subject}
						</span>
						{/* A decision rests on the pattern, not on one complaint — so a target that
						    several people have reported says so before the subject does. */}
						{pattern > 1 && (
							<Badge variant="surface" icon="flag" className="shrink-0 bg-status-danger text-on-status-danger">
								{pattern}
							</Badge>
						)}
						<Badge variant="surface" className={`shrink-0 ${TICKET_STATUS_STYLES[ticket.status]}`}>
							{TICKET_STATUS_VI[ticket.status]}
						</Badge>
					</div>

					{/* Everything else on one line. It was three stacked ones — kind and reason, then
					    the subject, then requester and target and assignee — which made a row 120px
					    tall and showed three of them on a 1000px screen. */}
					<div className="flex min-w-0 items-center gap-x-2 font-label-sm text-on-surface-variant">
						<span className="shrink-0">{TICKET_KIND_VI[ticket.kind]}</span>
						{ticket.reason && (
							<span className="shrink-0">· {TICKET_REASON_VI[ticket.reason]}</span>
						)}
						<span aria-hidden="true">·</span>
						<span className="truncate">{requester.name}</span>
						{target && (
							<span className="hidden min-w-0 items-center gap-1 sm:inline-flex">
								<span aria-hidden="true">·</span>
								<span className="truncate">
									{target.kind}
									{target.title ? `: ${target.title}` : ""}
								</span>
							</span>
						)}
						{assignee && (
							<span className="ml-auto inline-flex shrink-0 items-center gap-1 text-primary">
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
