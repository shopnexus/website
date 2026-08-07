"use client"

import { useState } from "react"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import { useNow } from "@/hooks/useNow"
import { useAdminTickets } from "@/hooks/api/useAdminModeration"
import type { TicketKind } from "@/api/generated/types.gen"
import TicketQueueFilters from "./_components/TicketQueueFilters"
import TicketQueueRow from "./_components/TicketQueueRow"
import type { TicketQueueTab } from "./_lib/types"

/**
 * The ticket queue: every complaint, dispute and question a user raised, oldest first.
 *
 * One clock for the whole list — the ages tick together instead of each row owning a
 * timer — and the queue tab sends no status at all, because open + reviewing is what the
 * server answers by default and what its index covers.
 */
export default function AdminTicketsPage() {
	const [tab, setTab] = useState<TicketQueueTab>("queue")
	const [kind, setKind] = useState<TicketKind | undefined>(undefined)
	const now = useNow(30_000)

	const { tickets, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useAdminTickets(
		tab === "queue" ? undefined : tab,
		kind,
	)

	return (
		<div className="p-6 lg:p-8 flex flex-col gap-6 max-w-[1100px]">
			<header className="flex flex-col gap-1">
				<h1 className="font-headline-md font-bold text-on-surface">Hàng đợi yêu cầu hỗ trợ</h1>
				<p className="font-body-sm text-on-surface-variant">
					Báo cáo vi phạm, khiếu nại hoàn tiền, sự cố đơn hàng và góp ý. Xếp theo thời gian
					chờ, cũ nhất lên trước.
				</p>
			</header>

			<TicketQueueFilters
				tab={tab}
				kind={kind}
				onTabChange={setTab}
				onKindChange={setKind}
			/>

			<div className="flex flex-col gap-2.5">
				{isLoading &&
					[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-[104px] w-full rounded-2xl" />)}

				{!isLoading && tickets.length === 0 && (
					<div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 flex flex-col items-center gap-2 text-center">
						<span className="material-symbols-outlined text-[32px] text-on-surface-variant">
							inbox
						</span>
						<p className="font-body-sm text-on-surface-variant">
							Không có yêu cầu nào trong bộ lọc này.
						</p>
					</div>
				)}

				{tickets.map((entry) => (
					<TicketQueueRow key={entry.ticket.id} entry={entry} now={now} />
				))}

				{hasNextPage && (
					<div className="flex justify-center pt-2">
						<Button
							variant="outline"
							disabled={isFetchingNextPage}
							onClick={() => fetchNextPage()}
						>
							{isFetchingNextPage ? "Đang tải..." : "Tải thêm"}
						</Button>
					</div>
				)}
			</div>
		</div>
	)
}
