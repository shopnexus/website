import AccountPage from "@/components/account/AccountPage";
import RefundDetail from "./components/RefundDetail";

export const metadata = { title: "Yêu cầu hoàn tiền" };

export default async function RefundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AccountPage
      title={`Yêu cầu hoàn tiền #${id}`}
      description="Trạng thái vụ việc, bằng chứng đã gửi và bước tiếp theo."
      width="wide"
    >
      <RefundDetail id={id} />
    </AccountPage>
  );
}
