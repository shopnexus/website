"use client"

import Select from "@/components/ui/Select"
import Tabs from "@/components/ui/Tabs"
import { TICKET_KIND_VI, TICKET_STATUS_VI } from "@/lib/dictionaries"
import type { TicketKind } from "@/api/generated/types.gen"
import type { TicketQueueTab } from "../_lib/types"

const TABS: Array<{ id: TicketQueueTab; label: string }> = [
	// Not a status: the server's default is open + reviewing together, and that pair is
	// the only slice its index covers.
	{ id: "queue", label: "Đang chờ xử lý" },
	{ id: "open", label: TICKET_STATUS_VI.open },
	{ id: "reviewing", label: TICKET_STATUS_VI.reviewing },
	{ id: "resolved", label: TICKET_STATUS_VI.resolved },
]

const KIND_OPTIONS = (Object.keys(TICKET_KIND_VI) as TicketKind[]).map((kind) => ({
	value: kind,
	label: TICKET_KIND_VI[kind],
}))

export default function TicketQueueFilters({
	tab,
	kind,
	onTabChange,
	onKindChange,
}: {
	tab: TicketQueueTab
	kind: TicketKind | undefined
	onTabChange: (tab: TicketQueueTab) => void
	onKindChange: (kind: TicketKind | undefined) => void
}) {
	return (
		<div className="flex flex-col lg:flex-row lg:items-center gap-3">
			<div className="flex-1 bg-surface-container-lowest rounded-2xl border border-outline-variant overflow-hidden">
				<Tabs
					tabs={TABS}
					activeTabId={tab}
					onChange={(id) => onTabChange(id as TicketQueueTab)}
					fullWidth
				/>
			</div>

			<div className="w-full lg:w-64 h-12 flex items-center bg-surface-container-lowest rounded-2xl border border-outline-variant px-2">
				<span className="material-symbols-outlined text-[18px] text-on-surface-variant pl-1">
					filter_list
				</span>
				<Select
					className="flex-1 h-full"
					options={KIND_OPTIONS}
					value={kind ?? ""}
					onChange={(value) => onKindChange(value ? (value as TicketKind) : undefined)}
					placeholder="Mọi loại yêu cầu"
				/>
			</div>
		</div>
	)
}
