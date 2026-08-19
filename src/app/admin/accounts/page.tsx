import AdminPage from "@/components/admin-config/AdminPage";
import AccountsBrowser from "./_components/AccountsBrowser";

export const metadata = {
  title: "Tài khoản | Vận hành",
};

export default function AdminAccountsPage() {
  return (
    <AdminPage
      width="lg"
      eyebrow="Người dùng"
      title="Tài khoản"
      consequence="Đình chỉ một tài khoản sẽ đăng xuất mọi phiên đang mở của tài khoản đó ngay lập tức. Không có thời hạn nghĩa là vĩnh viễn."
    >
      <AccountsBrowser />
    </AdminPage>
  );
}
