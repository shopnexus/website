"use client"

import Button from "@/components/ui/Button"

/** What is unsaved, and the two ways out of it. */
export default function PreferenceSaveBar({
	changeCount,
	isSaving,
	onDiscard,
	onSave,
}: {
	changeCount: number
	isSaving: boolean
	onDiscard: () => void
	onSave: () => void
}) {
	return (
		<div className="p-5 bg-surface-container-lowest border-t border-outline-variant flex items-center justify-between gap-4 flex-wrap">
			<p className="font-body-sm text-on-surface-variant">
				{changeCount === 0
					? "Mọi thay đổi đã được lưu."
					: `${changeCount} thay đổi chưa lưu.`}
			</p>
			<div className="flex items-center gap-2">
				<Button variant="ghost" onClick={onDiscard} disabled={changeCount === 0 || isSaving}>
					Hoàn tác
				</Button>
				<Button onClick={onSave} disabled={changeCount === 0 || isSaving}>
					{isSaving ? "Đang lưu..." : "Lưu thay đổi"}
				</Button>
			</div>
		</div>
	)
}
