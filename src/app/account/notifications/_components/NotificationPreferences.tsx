"use client"

import PreferenceCategoryCard from "./PreferenceCategoryCard"
import PreferenceSaveBar from "./PreferenceSaveBar"
import { usePreferenceDraft } from "../_hooks/usePreferenceDraft"
import { CATEGORIES } from "../_lib/preferences.logic"

/**
 * The preference grid and its save bar.
 *
 * The categories come from the enum, so this list is never empty — there is no state here
 * where an empty screen is the right answer, only one where it has not arrived yet.
 */
export default function NotificationPreferences() {
	const draft = usePreferenceDraft()

	if (draft.isLoading) {
		return (
			<div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 md:p-6 flex justify-center">
				<span className="material-symbols-outlined animate-spin text-primary text-[28px]">
					progress_activity
				</span>
			</div>
		)
	}

	return (
		<div className="rounded-2xl border border-outline-variant bg-surface-container-lowest overflow-hidden">
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
		</div>
	)
}
