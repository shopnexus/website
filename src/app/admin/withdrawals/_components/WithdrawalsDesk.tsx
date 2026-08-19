"use client";

import ResolveWithdrawalDialog from "./ResolveWithdrawalDialog";
import WalletInspector from "./WalletInspector";
import WithdrawalQueue from "./WithdrawalQueue";
import { useResolveWithdrawal } from "../_hooks/useResolveWithdrawal";
import { useWalletInspector } from "../_hooks/useWalletInspector";
import { useWithdrawalQueue } from "../_hooks/useWithdrawalQueue";

/**
 * The withdrawal desk: the queue, the dialog that resolves a row, and the wallet a row can
 * be checked against.
 *
 * Split out of the route so `page.tsx` can be a server component and export a `metadata`
 * title. All six queue pages were client components, which meant every one of them sat
 * under the storefront's default document title — a moderator with four tabs open had four
 * tabs reading "ShopNexus – Giá tốt, gần bạn, chốt nhanh!".
 */
export default function WithdrawalsDesk() {
  const queue = useWithdrawalQueue();
  const resolve = useResolveWithdrawal();
  const inspector = useWalletInspector();

  return (
    <>
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
    </>
  );
}
