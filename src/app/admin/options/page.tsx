import PageHeader from "@/components/admin-config/PageHeader";
import OptionBoard from "./_components/OptionBoard";

export const metadata = {
  title: "Cổng thanh toán & vận chuyển | Vận hành",
};

export default function AdminOptionsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Cấu hình"
        title="Cổng thanh toán & vận chuyển"
        consequence="Mã của mỗi dòng là vĩnh viễn vì đơn hàng và giao dịch đã xong đều lưu nó. Vì vậy chỉ có bật/tắt, không có xoá."
      />
      <OptionBoard />
    </div>
  );
}
