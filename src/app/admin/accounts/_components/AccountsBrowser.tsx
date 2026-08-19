"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import type { AccountRole, AccountStatus, AdminAccount } from "@/api/generated/types.gen";
import { ACCOUNT_ROLE_VI, ACCOUNT_STATUS_VI } from "@/lib/dictionaries";
import Input from "@/components/ui/Input";
import Skeleton from "@/components/ui/Skeleton";
import Panel from "@/components/admin-config/Panel";
import EmptyState from "@/components/admin-config/EmptyState";
import FilterChips from "@/components/admin-config/FilterChips";
import Pager from "@/components/admin-config/Pager";
import ConfirmDialog from "@/components/admin-config/ConfirmDialog";
import { useReinstateAccount } from "@/hooks/api/useAdminConfig";
import { useAccountSearch } from "../_hooks/useAccountSearch";
import AccountRow from "./AccountRow";
import SuspensionDialog from "./SuspensionDialog";

const STATUS_OPTIONS: ReadonlyArray<{ value: AccountStatus; label: string }> = [
  { value: "active", label: ACCOUNT_STATUS_VI.active },
  { value: "suspended", label: ACCOUNT_STATUS_VI.suspended },
];

// `support` is left out: the desk's row is granted by no route and is the counterparty of
// every ticket thread, so filtering to it offers a moderator nothing to do.
const ROLE_OPTIONS: ReadonlyArray<{ value: AccountRole; label: string }> = [
  { value: "user", label: ACCOUNT_ROLE_VI.user },
  { value: "moderator", label: ACCOUNT_ROLE_VI.moderator },
  { value: "admin", label: ACCOUNT_ROLE_VI.admin },
];

export default function AccountsBrowser() {
  const search = useAccountSearch();
  const reinstate = useReinstateAccount();
  const [suspending, setSuspending] = useState<AdminAccount | null>(null);
  const [reinstating, setReinstating] = useState<AdminAccount | null>(null);

  const handleReinstate = async () => {
    if (!reinstating) return;
    try {
      await reinstate.mutateAsync(reinstating.id);
      toast.success(`Đã gỡ đình chỉ ${reinstating.name}`);
      setReinstating(null);
    } catch {
      // The global handler raises the toast; the dialog stays open to retry.
    }
  };

  return (
    <>
      <div className="flex flex-col gap-4 mb-5">
        <Input
          value={search.term}
          onChange={(event) => search.setTerm(event.target.value)}
          leftIcon="search"
          placeholder="Email, số điện thoại, tên đăng nhập, hoặc một phần tên hiển thị"
          fullWidth
        />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <FilterChips label="Trạng thái" value={search.status} options={STATUS_OPTIONS} onChange={search.setStatus} />
          <FilterChips label="Vai trò" value={search.role} options={ROLE_OPTIONS} onChange={search.setRole} />
        </div>
      </div>

      <Panel>
        {search.isLoading ? (
          <div className="p-5 flex flex-col gap-3">
            {[0, 1, 2, 3].map((row) => (
              <Skeleton key={row} className="h-16 w-full" />
            ))}
          </div>
        ) : search.accounts.length === 0 ? (
          <EmptyState
            icon="person_search"
            title="Không có tài khoản nào khớp"
            hint="Tìm kiếm khớp chính xác với email, số điện thoại hoặc tên đăng nhập; tên hiển thị thì khớp một phần."
          />
        ) : (
          <>
            {/* Four columns and a button do not fit a tablet, and a table that overflows its
                panel takes the whole page sideways with it. */}
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[640px]">
                <thead>
                  <tr className="font-label-sm uppercase tracking-[0.08em] text-on-surface-variant bg-surface-container-low">
                    <th className="px-5 py-3 font-medium">Tài khoản</th>
                    <th className="px-5 py-3 font-medium">Vai trò</th>
                    <th className="px-5 py-3 font-medium">Tình trạng</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {search.accounts.map((account) => (
                    <AccountRow
                      key={account.id}
                      account={account}
                      isBusy={reinstate.isPending}
                      onSuspend={() => setSuspending(account)}
                      onReinstate={() => setReinstating(account)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
            {search.meta && (
              <Pager meta={search.meta} loadedCount={search.accounts.length} onChange={search.setPage} />
            )}
          </>
        )}
      </Panel>

      {suspending && (
        <SuspensionDialog account={suspending} onClose={() => setSuspending(null)} />
      )}

      <ConfirmDialog
        open={reinstating !== null}
        title="Gỡ đình chỉ"
        confirmLabel="Gỡ đình chỉ"
        danger={false}
        pending={reinstate.isPending}
        onConfirm={handleReinstate}
        onClose={() => setReinstating(null)}
      >
        <p>
          <strong className="text-on-surface">{reinstating?.name}</strong> sẽ đăng nhập lại được
          ngay. Lý do và thời hạn đình chỉ hiện tại bị xoá khỏi hồ sơ — lần đình chỉ này vẫn nằm
          trong nhật ký kiểm duyệt.
        </p>
      </ConfirmDialog>
    </>
  );
}
