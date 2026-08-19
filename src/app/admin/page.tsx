import AdminPage from "@/components/admin-config/AdminPage";
import QueueOverview from "./_components/QueueOverview";

export const metadata = {
  title: "Bảng điều hành | Vận hành",
};

/**
 * The landing. It used to `redirect()` to the ticket queue on the grounds that the queues
 * are the job — true, but there are four of them, and picking one for the visitor meant the
 * other three were only visible to somebody who went looking.
 */
export default function AdminOverviewPage() {
  return (
    <AdminPage
      width="lg"
      eyebrow="Tổng quan"
      title="Bảng điều hành"
      consequence="Bốn hàng đợi, cũ nhất lên trước. Con số bên phải mỗi thẻ là thời gian chờ dài nhất trong hàng đợi đó — đỏ là đã quá ba ngày."
    >
      <QueueOverview />
    </AdminPage>
  );
}
