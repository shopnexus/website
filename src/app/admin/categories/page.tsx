import AdminPage from "@/components/admin-config/AdminPage";
import CategoryTree from "./_components/CategoryTree";

export const metadata = {
  title: "Danh mục | Vận hành",
};

export default function AdminCategoriesPage() {
  return (
    <AdminPage
      width="md"
      eyebrow="Cấu hình"
      title="Danh mục"
      consequence="Cây danh mục này là thứ người bán chọn khi đăng tin và người mua duyệt theo. Đổi tên có hiệu lực ngay trên toàn sàn."
    >
      <CategoryTree />
    </AdminPage>
  );
}
