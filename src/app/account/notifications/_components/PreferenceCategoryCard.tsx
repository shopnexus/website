"use client"

import type { NotificationCategory, NotificationChannel } from "@/api/generated/types.gen"
import { categoryStyle } from "@/lib/notification-display"

import {
	CATEGORY_HINTS,
	CHANNELS,
	CHANNEL_ICONS,
	CHANNEL_LABELS,
} from "../_lib/preferences.logic"
import ChannelSwitch from "./ChannelSwitch"

/**
 * One category and its four channels.
 *
 * The header switch turns the whole row on or off, because "stop emailing me about
 * promotions" and "stop telling me about promotions at all" are different requests and
 * only one of them was expressible four taps at a time.
 */
export default function PreferenceCategoryCard({
	category,
	isEnabled,
	isDirty,
	isDefault,
	onToggle,
	onSetAll,
}: {
	category: NotificationCategory
	isEnabled: (category: NotificationCategory, channel: NotificationChannel) => boolean
	isDirty: (category: NotificationCategory, channel: NotificationChannel) => boolean
	isDefault: (category: NotificationCategory, channel: NotificationChannel) => boolean
	onToggle: (category: NotificationCategory, channel: NotificationChannel) => void
	onSetAll: (category: NotificationCategory, enabled: boolean) => void
}) {
	const enabledCount = CHANNELS.filter((channel) => isEnabled(category, channel)).length
	const allOn = enabledCount === CHANNELS.length

	return (
		<section className="p-5 md:p-6">
			<header className="flex items-start justify-between gap-4 mb-4">
				<div className="min-w-0">
					<h2 className="text-title-md text-on-surface">
						{categoryStyle(category).label}
					</h2>
					<p className="text-body-sm text-on-surface-variant mt-0.5">
						{CATEGORY_HINTS[category]}
					</p>
				</div>

				<button
					type="button"
					onClick={() => onSetAll(category, !allOn)}
					className="shrink-0 text-label-md text-primary hover:bg-primary/5 px-3 py-1.5 rounded-full transition-colors cursor-pointer whitespace-nowrap"
				>
					{allOn ? "Tắt tất cả" : "Bật tất cả"}
				</button>
			</header>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
				{CHANNELS.map((channel) => (
					<ChannelSwitch
						key={channel}
						label={CHANNEL_LABELS[channel]}
						icon={CHANNEL_ICONS[channel]}
						checked={isEnabled(category, channel)}
						isDirty={isDirty(category, channel)}
						isDefault={isDefault(category, channel)}
						onToggle={() => onToggle(category, channel)}
					/>
				))}
			</div>

			<p className="mt-3 text-body-xs text-on-surface-variant">
				Đang bật {enabledCount}/{CHANNELS.length} kênh.
			</p>
		</section>
	)
}
