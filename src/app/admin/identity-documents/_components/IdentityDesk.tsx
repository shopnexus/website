"use client";

import IdentityQueue from "./IdentityQueue";
import VerdictDialog from "./VerdictDialog";
import { useIdentityQueue } from "../_hooks/useIdentityQueue";
import { useIdentityVerdictForm } from "../_hooks/useIdentityVerdictForm";

/** The verification desk: the queue and the dialog that records a verdict on a row. */
export default function IdentityDesk() {
  const queue = useIdentityQueue();
  const verdict = useIdentityVerdictForm();

  return (
    <>
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
    </>
  );
}
