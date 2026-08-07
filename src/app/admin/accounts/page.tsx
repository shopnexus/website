import PageHeader from "@/components/admin-config/PageHeader";
import AccountsBrowser from "./_components/AccountsBrowser";

export const metadata = {
  title: "Tài khoản | Vận hành",
};

export default function AdminAccountsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-6xl">
      <PageHeader
        eyebrow="Người dùng"
        title="Tài khoản"
        consequence="Đình chỉ một tài khoản sẽ đăng xuất mọi phiên đang mở của tài khoản đó ngay lập tức. Không có thời hạn nghĩa là vĩnh viễn."
      />
      <AccountsBrowser />
    </div>
  );
}
