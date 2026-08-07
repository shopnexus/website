"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import type { Tag } from "@/api/generated/types.gen";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Skeleton from "@/components/ui/Skeleton";
import Panel from "@/components/admin-config/Panel";
import EmptyState from "@/components/admin-config/EmptyState";
import Pager from "@/components/admin-config/Pager";
import IdentityKey from "@/components/admin-config/IdentityKey";
import ConfirmDialog from "@/components/admin-config/ConfirmDialog";
import AdminOnlyNotice from "@/components/admin-config/AdminOnlyNotice";
import { useDeleteTag, useIsAdmin } from "@/hooks/api/useAdminConfig";
import { useTagSearch } from "../_hooks/useTagSearch";
import TagFormDialog from "./TagFormDialog";

type Editing = { kind: "create" } | { kind: "edit"; tag: Tag };

export default function TagCatalogue() {
  const search = useTagSearch();
  const { isAdmin } = useIsAdmin();
  const remove = useDeleteTag();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [deleting, setDeleting] = useState<Tag | null>(null);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.slug);
      toast.success(`Đã xoá thẻ ${deleting.slug}`);
      setDeleting(null);
    } catch {
      // The global handler raises the toast; the dialog stays open to retry.
    }
  };

  return (
    <>
      {!isAdmin && (
        <AdminOnlyNotice detail="Bạn tra cứu được từ điển thẻ nhưng không thêm, sửa hay xoá được. Hãy nhờ một quản trị viên." />
      )}

      <div className="flex flex-wrap items-center gap-3 mb-5">
        <div className="flex-1 min-w-[16rem]">
          <Input
            value={search.term}
            onChange={(event) => search.setTerm(event.target.value)}
            leftIcon="search"
            placeholder="Tìm theo phần đầu của slug"
            fullWidth
          />
          {search.normalizedTerm && search.normalizedTerm !== search.term && (
            <p className="font-body-sm text-on-surface-variant mt-1 ml-1">
              Đang tìm: <code className="font-mono">{search.normalizedTerm}</code>
            </p>
          )}
        </div>
        {isAdmin && (
          <Button
            icon={<span className="material-symbols-outlined text-[18px]">add</span>}
            onClick={() => setEditing({ kind: "create" })}
          >
            Thêm thẻ
          </Button>
        )}
      </div>

      <Panel>
        {search.isLoading ? (
          <div className="p-5 flex flex-col gap-2">
            {[0, 1, 2, 3].map((row) => (
              <Skeleton key={row} className="h-12 w-full" />
            ))}
          </div>
        ) : search.tags.length === 0 ? (
          <EmptyState
            icon="sell"
            title="Không có thẻ nào khớp"
            hint="Tìm kiếm khớp theo phần đầu của slug, không khớp theo mô tả."
          />
        ) : (
          <>
            <ul className="divide-y divide-outline-variant">
              {search.tags.map((tag) => (
                <li key={tag.slug} className="group px-5 py-3.5 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <IdentityKey
                      value={tag.slug}
                      weight="settled"
                      title="Slug là danh tính của thẻ — nhấn để sao chép"
                    />
                    <p className="font-body-sm text-on-surface-variant mt-1">
                      {tag.description || "Chưa có mô tả"}
                    </p>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" onClick={() => setEditing({ kind: "edit", tag })}>
                        Sửa mô tả
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setDeleting(tag)}>
                        <span className="text-error">Xoá</span>
                      </Button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            {search.meta && (
              <Pager meta={search.meta} loadedCount={search.tags.length} onChange={search.setPage} />
            )}
          </>
        )}
      </Panel>

      {editing && (
        <TagFormDialog
          editing={editing.kind === "edit" ? editing.tag : undefined}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Xoá thẻ"
        confirmLabel="Xoá thẻ"
        pending={remove.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      >
        <p>
          Thẻ <code className="font-mono text-on-surface">{deleting?.slug}</code> sẽ bị gỡ khỏi mọi
          tin đăng đang mang nó. Tin đăng không bị ảnh hưởng gì khác.
        </p>
        <p>
          Tạo lại một thẻ cùng slug sau này là một thẻ mới và trống — các tin đăng cũ không tự gắn
          lại.
        </p>
      </ConfirmDialog>
    </>
  );
}
