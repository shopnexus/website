import RefundDetail from "./components/RefundDetail";

export const metadata = { title: "Yêu cầu hoàn tiền" };

export default async function RefundPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="max-w-[760px] mx-auto px-4 md:px-8 py-8 pb-24 min-h-screen">
      <RefundDetail id={id} />
    </div>
  );
}
