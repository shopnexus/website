import AdminPage from "@/components/admin-config/AdminPage";
import TagCatalogue from "./_components/TagCatalogue";

export const metadata = {
  title: "Thẻ | Vận hành",
};

export default function AdminTagsPage() {
  return (
    <AdminPage
      width="md"
      eyebrow="Cấu hình"
      title="Thẻ"
      consequence="Slug của thẻ chính là danh tính của nó: ghi vào một slug khác là tạo thẻ mới, không phải đổi tên. Chỉ mô tả là sửa được."
    >
      <TagCatalogue />
    </AdminPage>
  );
}
