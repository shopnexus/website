"use client"

import Link from "next/link"
import type { TargetView } from "../../_lib/types"

/**
 * What the ticket is about, and how many other people have raised one about the same
 * thing — the pattern a decision rests on rather than the single complaint on screen.
 *
 * `target` arrives empty on two ordinary occasions: the owning module no longer has the
 * thing (a listing already taken down), and an order, which no module projects for staff.
 * Both still leave a decision somebody has to record, so the id is shown either way.
 */
export default function TicketTargetCard({
	target,
	openAgainstTarget,
}: {
	target: TargetView
	openAgainstTarget: number
}) {
	return (
		<section className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 flex flex-col gap-3">
			<div className="flex items-center justify-between gap-3">
				<h2 className="font-label-md text-on-surface-variant uppercase tracking-[0.06em]">
					Đối tượng bị nêu
				</h2>
				{openAgainstTarget > 1 && (
					<span className="inline-flex items-center gap-1 bg-error-container text-on-error-container rounded-full px-2.5 py-1 font-label-sm">
						<span className="material-symbols-outlined text-[14px]">flag</span>
						{openAgainstTarget} yêu cầu đang mở
					</span>
				)}
			</div>

			<div className="flex flex-col gap-1">
				<span className="font-label-sm text-on-surface-variant">{target.kind}</span>
				{target.title ? (
					<p className="font-body-md text-on-surface break-words line-clamp-4">
						{target.title}
					</p>
				) : (
					<p className="font-body-sm text-on-surface-variant">
						Không đọc được nội dung — có thể đã bị gỡ, hoặc hệ thống không dựng sẵn bản xem
						cho loại này.
					</p>
				)}
				{target.lines.map((line) => (
					<span key={line} className="font-label-sm text-on-surface-variant">
						{line}
					</span>
				))}
			</div>

			<div className="flex items-center gap-3 flex-wrap">
				{target.refId && (
					<code className="font-mono text-body-xs bg-surface-container px-2 py-1 rounded-md text-on-surface-variant">
						{target.refId}
					</code>
				)}
				{target.href && (
					<Link
						href={target.href}
						target="_blank"
						className="inline-flex items-center gap-1 font-label-md text-primary hover:underline"
					>
						Mở để xem
						<span className="material-symbols-outlined text-[16px]">open_in_new</span>
					</Link>
				)}
			</div>
		</section>
	)
}
