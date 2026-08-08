"use client"

import Link from "next/link"

import PreferenceCategoryCard from "./_components/PreferenceCategoryCard"
import PreferenceSaveBar from "./_components/PreferenceSaveBar"
import { usePreferenceDraft } from "./_hooks/usePreferenceDraft"
import { CATEGORIES } from "./_lib/preferences.logic"

export default function NotificationSettingsPage() {
	const draft = usePreferenceDraft()

	return (
		<div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
			<div className="flex items-start justify-between gap-4 flex-wrap">
				<div>
					<h1 className="font-headline-md font-bold text-on-surface mb-2">Cài đặt thông báo</h1>
					<p className="font-body-sm text-on-surface-variant">
						Chọn loại thông báo nào đến với bạn qua kênh nào.
					</p>
				</div>
				<Link
					href="/notifications"
					className="inline-flex items-center gap-1.5 text-label-sm font-bold text-primary hover:underline"
				>
					<span className="material-symbols-outlined text-[18px]">inbox</span>
					<span>Xem hộp thông báo</span>
				</Link>
			</div>

			<div className="bg-surface border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
				{draft.isLoading ? (
					<div className="flex justify-center p-12">
						<span className="material-symbols-outlined animate-spin text-primary text-3xl">
							progress_activity
						</span>
					</div>
				) : (
					<>
						<div className="divide-y divide-outline-variant">
							{CATEGORIES.map((category) => (
								<PreferenceCategoryCard
									key={category}
									category={category}
									isEnabled={draft.isEnabled}
									isDirty={draft.isDirty}
									isDefault={draft.isDefault}
									onToggle={draft.toggle}
									onSetAll={draft.setCategory}
								/>
							))}
						</div>

						<PreferenceSaveBar
							changeCount={draft.changeCount}
							isSaving={draft.isSaving}
							onDiscard={draft.discard}
							onSave={draft.commit}
						/>
					</>
				)}
			</div>
		</div>
	)
}
