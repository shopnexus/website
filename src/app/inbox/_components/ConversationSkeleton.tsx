import Skeleton from "@/components/ui/Skeleton"

/**
 * The list while it loads, shaped like the rows that will replace it. A spinner says
 * "wait"; this says how much is coming and where to look when it lands.
 */
export default function ConversationSkeleton({ rows = 6 }: { rows?: number }) {
	return (
		<div aria-hidden="true">
			{Array.from({ length: rows }).map((_, index) => (
				<div key={index} className="px-3 py-2.5 flex items-start gap-3 border-l-[3px] border-transparent">
					<Skeleton shape="circle" className="w-10 h-10 mt-0.5 shrink-0" />
					<div className="flex-1 min-w-0 space-y-2">
						<div className="flex justify-between gap-2">
							<Skeleton className="h-3 w-28" />
							<Skeleton className="h-2.5 w-8" />
						</div>
						<div className="flex justify-between gap-2">
							<Skeleton className="h-2.5 w-36" />
							<Skeleton className="h-2.5 w-16" />
						</div>
						<Skeleton className="h-2.5 w-44" />
					</div>
				</div>
			))}
		</div>
	)
}
