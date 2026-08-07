"use client";

import SessionFilters from "./_components/SessionFilters";
import SessionTable from "./_components/SessionTable";
import SessionTotals from "./_components/SessionTotals";
import { useSessionLedger } from "./_hooks/useSessionLedger";

export default function AdminPaymentSessionsPage() {
  const ledger = useSessionLedger();

  return (
    <div className="p-4 md:p-8 max-w-[1440px] mx-auto pb-12 space-y-6">
      <header>
        <h1 className="font-headline font-extrabold text-3xl md:text-4xl text-primary tracking-tight">
          Phiên thanh toán
        </h1>
        <p className="text-on-surface-variant font-body-md max-w-2xl mt-2">
          Toàn bộ phiên thanh toán của mọi tài khoản, để đối chiếu số của nền tảng với số các cổng
          thanh toán báo về. Chỉ webhook của cổng mới quyết định một phiên đã thu được tiền hay
          chưa — trang này đọc kết quả đó.
        </p>
      </header>

      <SessionFilters
        kind={ledger.kind}
        onKindChange={ledger.setKind}
        status={ledger.statusFilter}
        onStatusChange={ledger.setStatusFilter}
        limit={ledger.limit}
        onLimitChange={ledger.setLimit}
      />

      <SessionTotals totals={ledger.totals} loading={ledger.isLoading} />

      <SessionTable
        sessions={ledger.sessions}
        isLoading={ledger.isLoading}
        shown={ledger.sessions.length}
        totalCount={ledger.totalCount}
      />
    </div>
  );
}
