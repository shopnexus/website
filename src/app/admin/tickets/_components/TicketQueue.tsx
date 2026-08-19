"use client"

import { useState } from "react"
import QueuePanel from "@/components/admin-config/QueuePanel"
import QueueTabs from "@/components/admin-config/QueueTabs"
import { useNow } from "@/hooks/useNow"
import { useAdminTickets } from "@/hooks/api/useAdminModeration"
import type { TicketKind } from "@/api/generated/types.gen"
import { QUEUE_TABS } from "../_lib/queue.logic"
import type { TicketQueueTab } from "../_lib/types"
import TicketKindFilter from "./TicketKindFilter"
import TicketQueueRow from "./TicketQueueRow"

/**
 * The ticket queue: every complaint, dispute and question a user raised, oldest first.
 *
 * One clock for the whole list — the ages tick together instead of each row owning a
 * timer — and the queue tab sends no status at all, because open + reviewing is what the
 * server answers by default and what its index covers.
 *
 * This read is the one cursor-paginated queue, so it can say how many rows it is holding
 * but never how many are behind them: the server does not count a cursor page. `count` is
 * therefore left off rather than filled with the length of what happens to be loaded,
 * which would read as a total and shrink when a filter narrows it.
 */
export default function TicketQueue() {
	const [tab, setTab] = useState<TicketQueueTab>("queue")
	const [kind, setKind] = useState<TicketKind | undefined>(undefined)
	const now = useNow(30_000)

	const { tickets, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useAdminTickets(
		tab === "queue" ? undefined : tab,
		kind,
	)

	return (
		<>
			<QueueTabs tabs={QUEUE_TABS} active={tab} onChange={setTab} />

			<QueuePanel
				heading="Hàng đợi"
				count={null}
				countNoun="yêu cầu"
				filters={<TicketKindFilter kind={kind} onChange={setKind} />}
				isLoading={isLoading}
				isEmpty={tickets.length === 0}
				emptyIcon="inbox"
				emptyTitle="Không có yêu cầu nào trong bộ lọc này."
				emptyHint="Hàng đợi trống nghĩa là không ai đang chờ trả lời."
				hasNextPage={hasNextPage}
				isFetchingNextPage={isFetchingNextPage}
				onLoadMore={() => void fetchNextPage()}
			>
				{tickets.map((entry) => (
					<TicketQueueRow key={entry.ticket.id} entry={entry} now={now} />
				))}
			</QueuePanel>
		</>
	)
}
