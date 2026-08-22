import AccountPage from "@/components/account/AccountPage";
import SavedListingsGrid from "./_components/SavedListingsGrid";

export const metadata = { title: "Sản phẩm đã lưu" };

export default function FavoritesPage() {
  return (
    <AccountPage
      title="Sản phẩm đã lưu"
      description="Những tin đăng bạn đã lưu lại để xem sau."
      width="wide"
    >
      <SavedListingsGrid />
    </AccountPage>
  );
}
