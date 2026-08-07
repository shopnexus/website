import type { EditDiffRow } from "../_lib/types"

/**
 * What the seller wants to change, beside what buyers are seeing right now.
 *
 * Only the fields they touched: a held edit leaves the rest null, and approving writes
 * exactly this much onto the live row.
 */
export default function PendingEditDiff({ rows }: { rows: EditDiffRow[] }) {
	return (
		<section className="rounded-2xl border border-tertiary-container overflow-hidden">
			<h3 className="bg-tertiary-container text-on-tertiary-container px-4 py-2.5 font-label-md flex items-center gap-2">
				<span className="material-symbols-outlined text-[18px]">difference</span>
				Chỉnh sửa đang chờ duyệt
			</h3>

			<div className="divide-y divide-outline-variant">
				{rows.map((row) => (
					<div key={row.label} className="grid grid-cols-1 sm:grid-cols-[7rem_1fr_1fr] gap-2 p-3">
						<span className="font-label-sm text-on-surface-variant pt-0.5">{row.label}</span>
						<span className="font-body-sm text-on-surface-variant line-through decoration-outline break-words">
							{row.before}
						</span>
						<span className="font-body-sm text-on-surface font-medium break-words">
							{row.after}
						</span>
					</div>
				))}
			</div>
		</section>
	)
}
