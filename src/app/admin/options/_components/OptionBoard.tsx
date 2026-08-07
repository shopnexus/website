"use client";

import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import type { Option, OptionCategoryName } from "@/api/generated/types.gen";
import Tabs from "@/components/ui/Tabs";
import Skeleton from "@/components/ui/Skeleton";
import Panel from "@/components/admin-config/Panel";
import EmptyState from "@/components/admin-config/EmptyState";
import ConfirmDialog from "@/components/admin-config/ConfirmDialog";
import AdminOnlyNotice from "@/components/admin-config/AdminOnlyNotice";
import { useAdminOptions, useIsAdmin, useSaveOption } from "@/hooks/api/useAdminConfig";
import OptionRow from "./OptionRow";
import OptionEditorDialog from "./OptionEditorDialog";

const CATEGORY_TABS: ReadonlyArray<{ id: OptionCategoryName; label: string }> = [
  { id: "payment", label: "Cổng thanh toán" },
  { id: "transport", label: "Đơn vị vận chuyển" },
];

const EMPTY_HINT: Record<OptionCategoryName, string> = {
  payment:
    "Các dòng này do bản triển khai khai báo và được đồng bộ khi máy chủ khởi động. Nếu trống, chưa có cổng thanh toán nào được đăng ký trong lần chạy này.",
  transport:
    "Các dòng này do bản triển khai khai báo và được đồng bộ khi máy chủ khởi động. Nếu trống, chưa có đơn vị vận chuyển nào được đăng ký trong lần chạy này.",
};

export default function OptionBoard() {
  const [category, setCategory] = useState<OptionCategoryName>("payment");
  const { isAdmin, isLoading: isRoleLoading } = useIsAdmin();
  const { data, isLoading } = useAdminOptions(category, isAdmin);
  const save = useSaveOption();
  const [editing, setEditing] = useState<Option | null>(null);
  const [disabling, setDisabling] = useState<Option | null>(null);

  // Highest priority first, which is the order the buyer's chooser draws them in — a staff
  // list sorted differently from the thing it configures is a list you cannot check.
  const options = useMemo(
    () => [...(data?.options ?? [])].sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0)),
    [data],
  );
  const providers = data?.providers ?? [];
  const enabledCount = options.filter((option) => option.is_enabled ?? true).length;

  const setEnabled = async (option: Option, isEnabled: boolean) => {
    try {
      await save.mutateAsync({ id: option.id, category, body: { is_enabled: isEnabled } });
      toast.success(isEnabled ? `Đã bật ${option.name}` : `Đã tắt ${option.name}`);
      setDisabling(null);
    } catch {
      // The global handler raises the toast; the switch snaps back on the refetch.
    }
  };

  if (!isRoleLoading && !isAdmin) {
    return (
      <AdminOnlyNotice detail="Danh sách cổng thanh toán và đơn vị vận chuyển — kể cả các dòng đang tắt — chỉ quản trị viên mới xem và chỉnh được." />
    );
  }

  return (
    <>
      <Tabs
        tabs={CATEGORY_TABS.map((tab) => ({ id: tab.id, label: tab.label }))}
        activeTabId={category}
        onChange={(id) => setCategory(id as OptionCategoryName)}
        className="mb-5"
      />

      <p className="font-body-sm text-on-surface-variant mb-4">
        {isLoading
          ? "Đang tải…"
          : `${options.length} dòng, ${enabledCount} đang bật. Không thể thêm hoặc xoá dòng ở đây — danh sách do bản triển khai khai báo.`}
      </p>

      <Panel>
        {isLoading ? (
          <div className="p-5 flex flex-col gap-3">
            {[0, 1, 2].map((row) => (
              <Skeleton key={row} className="h-20 w-full" />
            ))}
          </div>
        ) : options.length === 0 ? (
          <EmptyState icon="tune" title="Chưa có dòng nào trong nhóm này" hint={EMPTY_HINT[category]} />
        ) : (
          <ul className="divide-y divide-outline-variant">
            {options.map((option) => (
              <OptionRow
                key={option.id}
                option={option}
                isBusy={save.isPending}
                onEdit={() => setEditing(option)}
                onToggle={() =>
                  (option.is_enabled ?? true) ? setDisabling(option) : void setEnabled(option, true)
                }
              />
            ))}
          </ul>
        )}
      </Panel>

      {editing && (
        <OptionEditorDialog
          option={editing}
          category={category}
          providers={providers}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={disabling !== null}
        title="Tắt tuỳ chọn này?"
        confirmLabel="Tắt"
        danger={false}
        pending={save.isPending}
        onConfirm={() => disabling && void setEnabled(disabling, false)}
        onClose={() => setDisabling(null)}
      >
        <p>
          <strong className="text-on-surface">{disabling?.name}</strong> sẽ không còn xuất hiện khi
          người mua thanh toán. Dòng dữ liệu vẫn còn nguyên.
        </p>
        <p>
          Đây không phải là xoá, và cũng không có thao tác xoá: những giao dịch đã thanh toán và
          những đơn đã gửi đi vẫn lưu mã{" "}
          <code className="font-mono text-on-surface">{disabling?.id}</code> nên dòng này phải tra
          cứu được mãi mãi. Bật lại bất cứ lúc nào.
        </p>
      </ConfirmDialog>
    </>
  );
}
