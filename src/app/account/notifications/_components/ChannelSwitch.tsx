"use client"

/** One category × channel cell. A dot marks a value changed but not yet saved. */
export default function ChannelSwitch({
	label,
	icon,
	checked,
	isDirty,
	isDefault,
	onToggle,
}: {
	label: string
	icon: string
	checked: boolean
	isDirty: boolean
	isDefault: boolean
	onToggle: () => void
}) {
	return (
		<div
			className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-3 transition-colors ${
				isDirty
					? "border-primary/50 bg-primary/5"
					: "border-outline-variant bg-surface-container-lowest"
			}`}
		>
			<span className="flex items-center gap-2.5 min-w-0">
				<span
					className={`material-symbols-outlined text-[20px] shrink-0 ${checked ? "text-primary" : "text-outline"}`}
				>
					{icon}
				</span>
				<span className="min-w-0">
					<span className="block text-body-md text-on-surface truncate">{label}</span>
					{isDefault && !isDirty && (
						<span className="block text-label-xs text-on-surface-variant">Theo mặc định</span>
					)}
					{isDirty && <span className="block text-label-xs text-primary">Chưa lưu</span>}
				</span>
			</span>

			<button
				type="button"
				role="switch"
				aria-checked={checked}
				aria-label={label}
				onClick={onToggle}
				className={`relative w-11 h-6 rounded-full shrink-0 transition-colors cursor-pointer ${
					checked ? "bg-primary" : "bg-surface-container-high"
				}`}
			>
				<span
					className={`absolute top-[2px] left-[2px] w-5 h-5 rounded-full bg-white border border-outline-variant transition-transform ${
						checked ? "translate-x-5" : "translate-x-0"
					}`}
				/>
			</button>
		</div>
	)
}
