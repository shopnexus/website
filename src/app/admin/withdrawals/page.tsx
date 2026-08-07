"use client";

import ResolveWithdrawalDialog from "./_components/ResolveWithdrawalDialog";
import WalletInspector from "./_components/WalletInspector";
import WithdrawalQueue from "./_components/WithdrawalQueue";
import { useResolveWithdrawal } from "./_hooks/useResolveWithdrawal";
import { useWalletInspector } from "./_hooks/useWalletInspector";
import { useWithdrawalQueue } from "./_hooks/useWithdrawalQueue";

export default function AdminWithdrawalsPage() {
  const queue = useWithdrawalQueue();
  const resolve = useResolveWithdrawal();
  const inspector = useWalletInspector();

  return (
    <div className="p-4 md:p-8 max-w-[1280px] mx-auto pb-12 space-y-6">
      <header>
        <h1 className="font-headline font-extrabold text-3xl md:text-4xl text-primary tracking-tight">
          Yêu cầu rút tiền
        </h1>
        <p className="text-on-surface-variant font-body-md max-w-2xl mt-2">
          Tiền đã bị trừ khỏi số dư khả dụng ngay khi người bán gửi yêu cầu. Duyệt là ghi nhận
          khoản đã chuyển ra ngân hàng; từ chối là hoàn khoản đó về ví ngay lập tức.
        </p>
      </header>

      <WithdrawalQueue
        withdrawals={queue.withdrawals}
        status={queue.statusFilter}
        onStatusChange={queue.setStatusFilter}
        totalCount={queue.totalCount}
        isLoading={queue.isLoading}
        hasNextPage={queue.hasNextPage}
        isFetchingNextPage={queue.isFetchingNextPage}
        onLoadMore={() => void queue.fetchNextPage()}
        onResolve={resolve.open}
        onInspect={inspector.open}
      />

      <ResolveWithdrawalDialog
        target={resolve.target}
        mode={resolve.mode}
        onModeChange={resolve.setMode}
        draft={resolve.draft}
        onDraftChange={resolve.setDraft}
        problem={resolve.problem}
        isPending={resolve.isPending}
        onClose={resolve.close}
        onSubmit={resolve.submit}
      />

      <WalletInspector inspector={inspector} />
    </div>
  );
}
