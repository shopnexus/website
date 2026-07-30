import Button from "@/components/ui/Button";
import ProductTable from "./_components/ProductTable";

export default function MyProductsPage() {
  return (
    <div className="p-4 md:p-8 max-w-[1280px] mx-auto">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-primary mb-2 font-headline">Sản phẩm của tôi</h1>
          <p className="text-on-surface-variant text-body-md max-w-xl">
            Quản lý kho hàng, theo dõi tình trạng sản phẩm và tối ưu hóa danh sách bán hàng của bạn.
          </p>
        </div>
        <button className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:opacity-90 transition-all shadow-md active:scale-95 self-start md:self-auto font-label-md">
          <span className="material-symbols-outlined">add</span>
          Đăng sản phẩm mới
        </button>
      </header>

      <ProductTable />
    </div>
  );
}
