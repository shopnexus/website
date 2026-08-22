import Link from "next/link"

import AccountPage from "@/components/account/AccountPage"
import AccountSettingsTabs from "@/components/account/AccountSettingsTabs"
import NotificationPreferences from "./_components/NotificationPreferences"

export const metadata = { title: "Cài đặt thông báo" }

export default function NotificationSettingsPage() {
	return (
		<AccountPage
			title="Cài đặt thông báo"
			description="Chọn loại thông báo nào đến với bạn qua kênh nào."
			actions={
				<Link
					href="/notifications"
					className="inline-flex items-center gap-1.5 text-label-md text-primary hover:underline"
				>
					<span className="material-symbols-outlined text-[18px]">inbox</span>
					<span>Xem hộp thông báo</span>
				</Link>
			}
		>
			<AccountSettingsTabs />
			<NotificationPreferences />
		</AccountPage>
	)
}
