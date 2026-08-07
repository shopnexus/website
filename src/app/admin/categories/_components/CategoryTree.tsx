"use client";

import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import Skeleton from "@/components/ui/Skeleton";
import Panel from "@/components/admin-config/Panel";
import EmptyState from "@/components/admin-config/EmptyState";
import ConfirmDialog from "@/components/admin-config/ConfirmDialog";
import AdminOnlyNotice from "@/components/admin-config/AdminOnlyNotice";
import { useCategories } from "@/hooks/api/useCatalog";
import { useDeleteCategory, useIsAdmin } from "@/hooks/api/useAdminConfig";
import { buildTree, type CategoryNode } from "../_lib/category-tree";
import CategoryBranch from "./CategoryBranch";
import CategoryFormDialog from "./CategoryFormDialog";

type Editing = { kind: "create"; parentId: string | null } | { kind: "edit"; node: CategoryNode };

export default function CategoryTree() {
  const { data: categories = [], isLoading } = useCategories();
  const { isAdmin } = useIsAdmin();
  const remove = useDeleteCategory();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [deleting, setDeleting] = useState<CategoryNode | null>(null);

  const roots = useMemo(() => buildTree(categories), [categories]);

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      await remove.mutateAsync(deleting.id);
      toast.success(`Đã xoá danh mục ${deleting.name}`);
      setDeleting(null);
    } catch {
      // The global handler raises the toast — a category still holding listings is a 409.
    }
  };

  return (
    <>
      {!isAdmin && (
        <AdminOnlyNotice detail="Bạn xem được cây danh mục nhưng không thêm, sửa hay xoá được. Hãy nhờ một quản trị viên." />
      )}

      <div className="flex items-center justify-between gap-4 mb-5">
        <p className="font-body-sm text-on-surface-variant">
          {categories.length} danh mục, {roots.length} nhánh gốc.
        </p>
        {isAdmin && (
          <Button
            icon={<span className="material-symbols-outlined text-[18px]">add</span>}
            onClick={() => setEditing({ kind: "create", parentId: null })}
          >
            Thêm danh mục gốc
          </Button>
        )}
      </div>

      <Panel>
        {isLoading ? (
          <div className="p-5 flex flex-col gap-2">
            {[0, 1, 2, 3, 4].map((row) => (
              <Skeleton key={row} className="h-10 w-full" />
            ))}
          </div>
        ) : roots.length === 0 ? (
          <EmptyState
            icon="category"
            title="Chưa có danh mục nào"
            hint="Người bán phải chọn một danh mục khi đăng tin, nên cần ít nhất một danh mục gốc."
          />
        ) : (
          <ul className="py-2">
            {roots.map((node) => (
              <CategoryBranch
                key={node.id}
                node={node}
                canEdit={isAdmin}
                onAddChild={(parentId) => setEditing({ kind: "create", parentId })}
                onEdit={(target) => setEditing({ kind: "edit", node: target })}
                onDelete={setDeleting}
              />
            ))}
          </ul>
        )}
      </Panel>

      {editing && (
        <CategoryFormDialog
          roots={roots}
          editing={editing.kind === "edit" ? editing.node : undefined}
          defaultParent={editing.kind === "create" ? editing.parentId : undefined}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Xoá danh mục"
        confirmLabel="Xoá danh mục"
        pending={remove.isPending}
        onConfirm={handleDelete}
        onClose={() => setDeleting(null)}
      >
        <p>
          Xoá <strong className="text-on-surface">{deleting?.name}</strong>.
        </p>
        {deleting && deleting.children.length > 0 && (
          <p>
            {deleting.children.length} danh mục con sẽ được nâng lên thành danh mục gốc, không bị
            xoá theo.
          </p>
        )}
        <p>
          Nếu vẫn còn tin đăng thuộc danh mục này, máy chủ sẽ từ chối — hãy chuyển những tin đó
          sang danh mục khác trước.
        </p>
      </ConfirmDialog>
    </>
  );
}
