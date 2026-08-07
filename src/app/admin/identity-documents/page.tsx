"use client";

import IdentityQueue from "./_components/IdentityQueue";
import VerdictDialog from "./_components/VerdictDialog";
import { useIdentityQueue } from "./_hooks/useIdentityQueue";
import { useIdentityVerdictForm } from "./_hooks/useIdentityVerdictForm";

export default function AdminIdentityDocumentsPage() {
  const queue = useIdentityQueue();
  const verdict = useIdentityVerdictForm();

  return (
    <div className="p-4 md:p-8 max-w-[1280px] mx-auto pb-12 space-y-6">
      <header>
        <h1 className="font-headline font-extrabold text-3xl md:text-4xl text-primary tracking-tight">
          Xác minh danh tính
        </h1>
        <p className="text-on-surface-variant font-body-md max-w-2xl mt-2">
          Nền tảng không lưu số trên giấy tờ, nhưng có giữ ảnh để bạn đối chiếu: kết quả nhà
          cung cấp trả về không phải quyết định cuối cùng. Nhớ ghi ngày hết hạn với loại giấy
          tờ có hạn, vì cổng chi tiền đọc ngày đó chứ không chỉ đọc trạng thái.
        </p>
      </header>

      <IdentityQueue
        entries={queue.entries}
        status={queue.statusFilter}
        onStatusChange={queue.setStatusFilter}
        totalCount={queue.totalCount}
        isLoading={queue.isLoading}
        hasNextPage={queue.hasNextPage}
        isFetchingNextPage={queue.isFetchingNextPage}
        onLoadMore={() => void queue.fetchNextPage()}
        onDecide={verdict.open}
      />

      <VerdictDialog
        target={verdict.target}
        draft={verdict.draft}
        onDraftChange={verdict.setDraft}
        problem={verdict.problem}
        isPending={verdict.isPending}
        onClose={verdict.close}
        onSubmit={verdict.submit}
      />
    </div>
  );
}
