import Link from "next/link";
import AccountPage from "@/components/account/AccountPage";
import ProductTable from "./_components/ProductTable";

export const metadata = {
  title: "Sản phẩm của tôi",
};

export default function MyProductsPage() {
  return (
    <AccountPage
      title="Sản phẩm của tôi"
      description="Quản lý kho hàng, theo dõi tình trạng sản phẩm và tối ưu hóa danh sách bán hàng của bạn."
      width="wide"
      actions={
        <Link
          href="/sell"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-on-primary text-label-md hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
            add
          </span>
          Đăng sản phẩm mới
        </Link>
      }
    >
      <ProductTable />
    </AccountPage>
  );
}
