"use client"

import Link from "next/link"
import Button from "@/components/ui/Button"
import Skeleton from "@/components/ui/Skeleton"
import OrderCard from "./OrderCard"
import WaitingGroupHeader from "./WaitingGroupHeader"
import { useOrderInbox } from "../hooks/useOrderInbox"

/**
 * Every order, both sides of every sale, in three groups by whose turn it is.
 *
 * What this replaces: two competing screens — a buyer-only list at `/orders` and a
 * dashboard list behind a "Đơn mua | Đơn bán" toggle — carrying nine filter controls
 * between them over what is typically a handful of rows, plus three stat cards computed
 * from whichever page happened to be loaded, so the numbers changed as you scrolled.
 *
 * There is no search box either. The one that was here filtered in memory, over loaded
 * rows only, because `/orders` accepts no text parameter — so it silently answered "not
 * found" for orders that simply had not been paged in yet.
 */
export default function OrderInbox() {
	const {
		me,
		groups,
		order,
		listingsById,
		isLoading,
		isEmpty,
		hasMoreFinished,
		isFetchingNextPage,
		showMoreFinished,
	} = useOrderInbox()

	return (
		// A <div>, not a <main>: the root layout already wraps children in one, and a
		// second landmark makes a screen reader announce two "main" regions.
		<div className="max-w-[880px] mx-auto px-4 md:px-8 py-8 pb-24 min-h-screen">
			<header className="mb-8">
				<h1 className="font-headline-md text-3xl font-extrabold tracking-tight text-on-surface">
					Đơn hàng
				</h1>
				<p className="text-body-md text-on-surface-variant mt-1">
					Mọi giao dịch của bạn, mua và bán, xếp theo việc đang chờ ai.
				</p>
			</header>

			{isLoading ? (
				<OrdersSkeleton />
			) : isEmpty ? (
				<EmptyState />
			) : (
				<div className="flex flex-col gap-3">
					{order.map((side) => {
						const rows = groups[side]
						if (rows.length === 0) return null
						return (
							<section key={side} className="flex flex-col gap-3">
								<WaitingGroupHeader side={side} count={rows.length} />
								{rows.map((row) => (
									<OrderCard
										key={row.id}
										order={row}
										side={side}
										me={me}
										listingsById={listingsById}
									/>
								))}
							</section>
						)
					})}

					{hasMoreFinished && (
						<div className="flex justify-center pt-4">
							<Button variant="outline" disabled={isFetchingNextPage} onClick={showMoreFinished}>
								{isFetchingNextPage ? "Đang tải..." : "Xem thêm đơn đã xong"}
							</Button>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

function OrdersSkeleton() {
	return (
		<div className="flex flex-col gap-3">
			{[0, 1, 2].map((row) => (
				<div key={row} className="flex gap-4 p-4 rounded-xl border border-outline-variant/60">
					<Skeleton className="w-16 h-16 rounded-lg shrink-0" />
					<div className="flex-1 flex flex-col gap-2">
						<Skeleton className="h-4 w-2/3" />
						<Skeleton className="h-3 w-1/2" />
						<Skeleton className="h-3 w-1/3" />
					</div>
				</div>
			))}
		</div>
	)
}

function EmptyState() {
	return (
		<div className="flex flex-col items-center text-center py-20 gap-3">
			<span className="material-symbols-outlined text-[48px] text-on-surface-variant">
				receipt_long
			</span>
			<h2 className="font-headline-sm font-bold text-on-surface">Chưa có đơn hàng nào</h2>
			<p className="text-body-sm text-on-surface-variant max-w-sm">
				Đơn bạn mua và đơn người khác mua của bạn đều xuất hiện ở đây.
			</p>
			<Link href="/search" className="mt-2">
				<Button variant="primary">Khám phá sản phẩm</Button>
			</Link>
		</div>
	)
}
