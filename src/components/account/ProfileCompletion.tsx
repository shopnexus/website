"use client"

import Link from "next/link"
import { useMe } from "@/hooks/api/useAccount"
import { useContacts } from "@/hooks/api/useContacts"

/** One thing still missing, where it is done, and what it unlocks. */
type Task = {
	label: string
	why: string
	href: string
	done: boolean
}

/**
 * What is still missing from this account, and what each gap closes off.
 *
 * Not a percentage for its own sake: every row here is a door that stays shut while it is
 * empty — no address means no checkout, no identity verification means no selling and no
 * withdrawal, no phone means the carrier has nobody to call. The bar only says how many
 * doors are left.
 *
 * Each row carries the consequence rather than the instruction, because a checklist whose
 * every line reads "chưa điền" is a checklist people learn to scroll past.
 *
 * At full marks the card disappears instead of standing there showing 100%: with nothing
 * left to do, it has nothing left to say.
 */
export default function ProfileCompletion() {
	const { data: me } = useMe()
	const { data: contacts } = useContacts()

	if (!me) return null

	// Addresses still loading (or failed) count as present: a card telling someone to add the
	// address they already have is the fastest way to teach them to ignore it.
	const hasAddress = contacts === undefined || contacts.length > 0

	const tasks: Task[] = [
		{
			label: "Số điện thoại",
			why: "Đơn vị vận chuyển gọi số này khi giao hàng.",
			href: "/account/security",
			done: Boolean(me.phone),
		},
		{
			label: "Địa chỉ nhận hàng",
			why: "Chưa có địa chỉ thì không đặt hàng được.",
			href: "/account/contacts",
			done: hasAddress,
		},
		{
			label: "Email đã xác minh",
			why: "Email đã xác minh là đường lấy lại mật khẩu.",
			href: "/account/security",
			done: me.email_verified,
		},
		{
			label: "Ảnh đại diện",
			why: "Người mua thấy ảnh này trong mọi cuộc trò chuyện.",
			href: "/account/profile",
			done: Boolean(me.profile?.avatar?.url),
		},
		{
			label: "Xác minh danh tính",
			why: "Cần có để đăng bán và để rút tiền.",
			href: "/account/verification",
			done: me.identity_verified,
		},
	]

	const remaining = tasks.filter((task) => !task.done)
	if (remaining.length === 0) return null

	const done = tasks.length - remaining.length

	return (
		<section
			aria-labelledby="profile-completion-heading"
			className="mb-6 rounded-2xl border border-outline-variant bg-surface p-5"
		>
			<div className="flex items-center justify-between gap-3">
				<h2 id="profile-completion-heading" className="text-title-md text-on-surface">
					Hoàn thiện hồ sơ
				</h2>
				<p className="font-label-lg text-primary tabular-nums">
					{done}/{tasks.length}
				</p>
			</div>

			<div
				className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-container-high"
				role="progressbar"
				aria-valuemin={0}
				aria-valuemax={tasks.length}
				aria-valuenow={done}
				aria-label={`Đã hoàn thành ${done} trên ${tasks.length} bước`}
			>
				<div
					className="h-full rounded-full bg-primary transition-[width] duration-500"
					style={{ width: `${(done / tasks.length) * 100}%` }}
				/>
			</div>

			<ul className="mt-3 flex flex-col divide-y divide-outline-variant">
				{remaining.map((task) => (
					<li key={task.label}>
						<Link
							href={task.href}
							className="group flex items-start gap-3 py-3 transition-colors hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
						>
							<span
								aria-hidden="true"
								className="material-symbols-outlined mt-0.5 text-[20px] text-on-surface-variant"
							>
								radio_button_unchecked
							</span>
							<span className="min-w-0 flex-1">
								<span className="block font-label-md text-on-surface group-hover:text-primary">
									{task.label}
								</span>
								<span className="block text-body-sm text-on-surface-variant">{task.why}</span>
							</span>
							<span
								aria-hidden="true"
								className="material-symbols-outlined mt-0.5 text-[20px] text-on-surface-variant"
							>
								chevron_right
							</span>
						</Link>
					</li>
				))}
			</ul>
		</section>
	)
}
