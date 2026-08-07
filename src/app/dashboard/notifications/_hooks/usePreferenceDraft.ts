"use client"

import { useMemo, useState } from "react"
import { toast } from "react-hot-toast"

import type { NotificationCategory, NotificationChannel } from "@/api/generated/types.gen"
import {
	useNotificationPreferences,
	useUpdateNotificationPreferences,
} from "@/hooks/api/useNotifications"

import { CHANNELS, draftToItems, indexPreferences, keyOf } from "../_lib/preferences.logic"

/**
 * The unsaved half of the settings grid.
 *
 * A toggle writes to the draft, never to the server: turning off five channels one at a
 * time would otherwise be five round trips, five chances to half-apply, and no way to
 * change your mind before committing.
 */
export function usePreferenceDraft() {
	const { data: preferences, isLoading } = useNotificationPreferences()
	const save = useUpdateNotificationPreferences()

	/** Toggles flipped but not saved, keyed by category:channel. */
	const [draft, setDraft] = useState<Record<string, boolean>>({})

	const stored = useMemo(() => indexPreferences(preferences), [preferences])

	const isEnabled = (category: NotificationCategory, channel: NotificationChannel): boolean => {
		const key = keyOf(category, channel)
		return draft[key] ?? stored.get(key)?.is_enabled ?? false
	}

	/** True while the value on screen differs from the one the server holds. */
	const isDirty = (category: NotificationCategory, channel: NotificationChannel): boolean =>
		keyOf(category, channel) in draft

	const isDefault = (category: NotificationCategory, channel: NotificationChannel): boolean =>
		stored.get(keyOf(category, channel))?.is_default ?? true

	const toggle = (category: NotificationCategory, channel: NotificationChannel) => {
		const key = keyOf(category, channel)
		setDraft((current) => ({ ...current, [key]: !isEnabled(category, channel) }))
	}

	/** Every channel of one category at once — the row header's switch. */
	const setCategory = (category: NotificationCategory, enabled: boolean) => {
		setDraft((current) => {
			const next = { ...current }
			for (const channel of CHANNELS) next[keyOf(category, channel)] = enabled
			return next
		})
	}

	const changeCount = Object.keys(draft).length

	const discard = () => setDraft({})

	const commit = () => {
		if (changeCount === 0) {
			toast("Không có thay đổi nào để lưu.")
			return
		}
		save.mutate(
			{ items: draftToItems(draft) },
			{
				onSuccess: () => {
					toast.success("Đã lưu cài đặt thông báo.")
					setDraft({})
				},
			},
		)
	}

	return {
		isLoading,
		isSaving: save.isPending,
		changeCount,
		isEnabled,
		isDirty,
		isDefault,
		toggle,
		setCategory,
		discard,
		commit,
	}
}
