import PageHeader from "@/components/admin-config/PageHeader";
import ModeratorRoster from "./_components/ModeratorRoster";

export const metadata = {
  title: "Kiểm duyệt viên | Vận hành",
};

export default function AdminModeratorsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      <PageHeader
        eyebrow="Người dùng"
        title="Kiểm duyệt viên"
        consequence="Kiểm duyệt viên xử lý khiếu nại, gỡ tin đăng và quyết định hoàn tiền. Vai trò này được cấp bằng một tài khoản mới, không thể tự đăng ký."
      />
      <ModeratorRoster />
    </div>
  );
}
