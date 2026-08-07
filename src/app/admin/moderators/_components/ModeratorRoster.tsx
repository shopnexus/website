"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import type { AdminAccount } from "@/api/generated/types.gen";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import Panel from "@/components/admin-config/Panel";
import EmptyState from "@/components/admin-config/EmptyState";
import Pager from "@/components/admin-config/Pager";
import IdentityKey from "@/components/admin-config/IdentityKey";
import SuspensionBadge from "@/components/admin-config/SuspensionBadge";
import ConfirmDialog from "@/components/admin-config/ConfirmDialog";
import { useIsAdmin, useRevokeModerator } from "@/hooks/api/useAdminConfig";
import { useAccountSearch } from "../../accounts/_hooks/useAccountSearch";
import CreateModeratorDialog from "./CreateModeratorDialog";

/**
 * There is no "list moderators" endpoint — the roster is `/admin/accounts` pinned to
 * `role=moderator`, which is also why the filter controls are not rendered here.
 */
export default function ModeratorRoster() {
  const { isAdmin } = useIsAdmin();
  const roster = useAccountSearch({ role: "moderator" });
  const revoke = useRevokeModerator();
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState<AdminAccount | null>(null);

  const handleRevoke = async () => {
    if (!revoking) return;
    try {
      await revoke.mutateAsync(revoking.id);
      toast.success(`${revoking.name} không còn là kiểm duyệt viên`);
      setRevoking(null);
    } catch {
      // The global handler raises the toast; the dialog stays open to retry.
    }
  };

  return (
    <>
      <div className="flex items-center justify-between gap-4 mb-5">
        <p className="font-body-sm text-on-surface-variant">
          {isAdmin
            ? "Chỉ quản trị viên mới cấp hoặc thu hồi được vai trò này."
            : "Bạn đang xem ở chế độ chỉ đọc — chỉ quản trị viên mới cấp hoặc thu hồi vai trò kiểm duyệt viên."}
        </p>
        {isAdmin && (
          <Button icon={<span className="material-symbols-outlined text-[18px]">person_add</span>} onClick={() => setCreating(true)}>
            Tạo kiểm duyệt viên
          </Button>
        )}
      </div>

      <Panel>
        {roster.isLoading ? (
          <div className="p-5 flex flex-col gap-3">
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} className="h-16 w-full" />
            ))}
          </div>
        ) : roster.accounts.length === 0 ? (
          <EmptyState
            icon="shield_person"
            title="Chưa có kiểm duyệt viên nào"
            hint="Hàng đợi khiếu nại, xác minh danh tính và duyệt tin đăng đang không có ai xử lý."
          />
        ) : (
          <>
            <ul className="divide-y divide-outline-variant">
              {roster.accounts.map((moderator) => (
                <li key={moderator.id} className="px-5 py-4 flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="font-label-md text-on-surface">{moderator.name}</div>
                    <div className="font-body-sm text-on-surface-variant">
                      {moderator.email ?? moderator.username ?? moderator.phone ?? "—"}
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3">
                      <IdentityKey value={moderator.id} />
                      <span className="font-body-sm text-on-surface-variant">
                        Từ {new Date(moderator.created_at).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <SuspensionBadge account={moderator} />
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setRevoking(moderator)}
                        disabled={revoke.isPending}
                      >
                        Thu hồi quyền
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {roster.meta && (
              <Pager meta={roster.meta} loadedCount={roster.accounts.length} onChange={roster.setPage} />
            )}
          </>
        )}
      </Panel>

      {creating && <CreateModeratorDialog onClose={() => setCreating(false)} />}

      <ConfirmDialog
        open={revoking !== null}
        title="Thu hồi quyền kiểm duyệt"
        confirmLabel="Thu hồi quyền"
        pending={revoke.isPending}
        onConfirm={handleRevoke}
        onClose={() => setRevoking(null)}
      >
        <p>
          <strong className="text-on-surface">{revoking?.name}</strong> trở thành người dùng thường
          và mọi phiên đăng nhập hiện tại bị huỷ.
        </p>
        <p>
          Tài khoản không bị xoá: họ có thể đã mua bán, nên lịch sử giao dịch và đánh giá vẫn thuộc
          về tài khoản này.
        </p>
      </ConfirmDialog>
    </>
  );
}
