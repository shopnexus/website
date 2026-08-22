import Link from "next/link"

/**
 * The thread pane with nothing to show.
 *
 * Reached only when there is no thread at all — the pane otherwise opens the newest one —
 * so it is an invitation rather than a "pick something" prompt. Both ways a thread starts
 * are here: from a listing, or by raising a ticket.
 */
export default function EmptyThread({ onCompose }: { onCompose: () => void }) {
	return (
		<div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 py-12 text-center bg-surface-container-lowest/50">
			<span
				className="material-symbols-outlined text-[40px] text-primary/40"
				aria-hidden="true"
				style={{ fontVariationSettings: "'FILL' 1" }}
			>
				forum
			</span>

			<div className="space-y-1.5 max-w-[320px]">
				<h2 className="text-title-md text-on-surface">
					Chưa có hội thoại nào
				</h2>
				<p className="text-body-sm text-on-surface-variant">
					Mở một sản phẩm và nhắn cho người bán — hội thoại sẽ xuất hiện ở đây cùng giá đang
					thương lượng.
				</p>
			</div>

			<div className="flex flex-wrap items-center justify-center gap-2">
				<Link
					href="/search"
					className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-label-md text-on-primary transition-all hover:brightness-110"
				>
					<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
						storefront
					</span>
					Khám phá sản phẩm
				</Link>
				<button
					type="button"
					onClick={onCompose}
					className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-outline-variant px-4 py-2 text-label-md text-on-surface-variant transition-colors hover:border-primary hover:text-primary"
				>
					<span className="material-symbols-outlined text-[16px]" aria-hidden="true">
						support_agent
					</span>
					Cần hỗ trợ
				</button>
			</div>
		</div>
	)
}
