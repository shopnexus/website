import PageHeader from "@/components/admin-config/PageHeader";
import TagCatalogue from "./_components/TagCatalogue";

export const metadata = {
  title: "Thẻ | Vận hành",
};

export default function AdminTagsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <PageHeader
        eyebrow="Cấu hình"
        title="Thẻ"
        consequence="Slug của thẻ chính là danh tính của nó: ghi vào một slug khác là tạo thẻ mới, không phải đổi tên. Chỉ mô tả là sửa được."
      />
      <TagCatalogue />
    </div>
  );
}
