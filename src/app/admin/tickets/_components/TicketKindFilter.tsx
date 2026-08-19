"use client"

import Select from "@/components/ui/Select"
import { TICKET_KIND_VI } from "@/lib/dictionaries"
import type { TicketKind } from "@/api/generated/types.gen"

const KIND_OPTIONS = (Object.keys(TICKET_KIND_VI) as TicketKind[]).map((kind) => ({
	value: kind,
	label: TICKET_KIND_VI[kind],
}))

/**
 * The one thing narrowing this queue that is not its status.
 *
 * A select rather than chips: seven kinds is more than a row of chips can hold beside a
 * heading, and unlike the status slices they are not what the desk is organised around.
 */
export default function TicketKindFilter({
	kind,
	onChange,
}: {
	kind: TicketKind | undefined
	onChange: (kind: TicketKind | undefined) => void
}) {
	return (
		<div className="w-full sm:w-56 h-10 flex items-center bg-surface-container-low rounded-full border border-outline-variant px-2">
			<span className="material-symbols-outlined text-[18px] text-on-surface-variant pl-1">
				filter_list
			</span>
			<Select
				className="flex-1 h-full"
				options={KIND_OPTIONS}
				value={kind ?? ""}
				onChange={(value) => onChange(value ? (value as TicketKind) : undefined)}
				placeholder="Mọi loại yêu cầu"
			/>
		</div>
	)
}
