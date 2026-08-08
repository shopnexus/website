"use client"

import Link from "next/link"
import type { Contact, ContactId } from "@/api/generated/types.gen"

interface PublishStepProps {
	contacts: Contact[]
	activePickupId: ContactId | ""
	onPickupChange: (id: ContactId) => void
}

export default function PublishStep({ contacts, activePickupId, onPickupChange }: PublishStepProps) {
	const activePickup = contacts.find(({ id }) => id === activePickupId)

	return (
		<section className="space-y-7">
			<header>
				<p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-primary">Bước 4 · Gửi duyệt</p>
				<h2 className="text-2xl font-bold tracking-tight text-on-surface">Chọn nơi lấy hàng</h2>
				<p className="mt-2 max-w-2xl text-sm leading-6 text-on-surface-variant">Khi gửi duyệt, server chụp lại khu vực của địa chỉ này cho tin đăng. Việc đổi địa chỉ sau đó không làm sai lịch sử của sản phẩm.</p>
			</header>

			{contacts.length > 0 ? (
				<div className="space-y-3">
					<label htmlFor="pickup-contact" className="text-sm font-semibold text-on-surface">Địa chỉ lấy hàng <span className="text-error">*</span></label>
					<select id="pickup-contact" value={activePickupId} onChange={(event) => onPickupChange(event.target.value as ContactId)} className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 text-on-surface outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15">
						{contacts.map((contact) => <option key={contact.id} value={contact.id}>{contact.full_name} — {contact.address}, {contact.ward_name}, {contact.province_name}</option>)}
					</select>
					{activePickup ? (
						<div className="rounded-2xl border border-outline-variant bg-surface-container-low p-5">
							<div className="flex items-start gap-3"><span className="material-symbols-outlined mt-0.5 text-primary">location_on</span><div><p className="font-semibold text-on-surface">{activePickup.full_name} · {activePickup.phone}</p><p className="mt-1 text-sm leading-6 text-on-surface-variant">{activePickup.address}{activePickup.address_detail ? `, ${activePickup.address_detail}` : ""}, {activePickup.ward_name}{activePickup.district_name ? `, ${activePickup.district_name}` : ""}, {activePickup.province_name}</p><p className="mt-2 text-xs font-semibold text-primary">{activePickup.is_default_pickup ? "Địa chỉ lấy hàng mặc định" : "Địa chỉ được chọn cho tin này"}</p></div></div>
						</div>
					) : null}
				</div>
			) : (
				<div className="rounded-2xl border border-error/25 bg-error-container/25 p-5">
					<div className="flex items-start gap-3"><span className="material-symbols-outlined text-error">wrong_location</span><div><h3 className="font-semibold text-on-surface">Chưa có địa chỉ lấy hàng</h3><p className="mt-1 text-sm leading-6 text-on-surface-variant">Bạn vẫn có thể lưu nháp, nhưng server sẽ từ chối gửi duyệt cho đến khi có địa chỉ.</p><Link href="/account/contacts" className="mt-3 inline-flex text-sm font-bold text-primary hover:underline">Thêm địa chỉ trong sổ liên hệ</Link></div></div>
				</div>
			)}

			<div className="grid gap-3 sm:grid-cols-3">
				{[
					["draft", "Tạo bản nháp", "Tin và mọi phiên bản được lưu cùng một giao dịch."],
					["fact_check", "Chờ kiểm duyệt", "Gửi duyệt luôn chuyển tin sang pending, không tự động active."],
					["storefront", "Xuất hiện trên chợ", "Tin chỉ hiển thị sau khi moderator phê duyệt."],
				].map(([icon, title, body]) => <div key={title} className="rounded-2xl border border-outline-variant p-4"><span className="material-symbols-outlined text-primary">{icon}</span><h3 className="mt-3 text-sm font-bold text-on-surface">{title}</h3><p className="mt-1 text-xs leading-5 text-on-surface-variant">{body}</p></div>)}
			</div>
		</section>
	)
}
