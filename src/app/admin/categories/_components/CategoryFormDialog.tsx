"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import type { Category } from "@/api/generated/types.gen";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Field from "@/components/admin-config/Field";
import IdentityKey from "@/components/admin-config/IdentityKey";
import { useCreateCategory, useUpdateCategory } from "@/hooks/api/useAdminConfig";
import { flatten, indentLabel, type CategoryNode } from "../_lib/category-tree";

const ROOT_VALUE = "";

/**
 * Create a category, or edit one. `editing` decides which; `defaultParent` is what the
 * "add a child here" action on a row passes in.
 */
export default function CategoryFormDialog({
  roots,
  editing,
  defaultParent,
  onClose,
}: {
  roots: ReadonlyArray<CategoryNode>;
  editing?: Category;
  defaultParent?: string | null;
  onClose: () => void;
}) {
  const create = useCreateCategory();
  const update = useUpdateCategory();

  const [name, setName] = useState(editing?.name ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [parentId, setParentId] = useState<string>(
    editing?.parent_id ?? defaultParent ?? ROOT_VALUE,
  );

  const isPending = create.isPending || update.isPending;
  // Only the node itself is taken out of the picker — being one's own parent is not a
  // tree question. Whether a chosen parent sits *below* this node is the server's call,
  // taken under a lock, so the picker offers it and the 422 explains it.
  const candidates = flatten(roots).filter((node) => node.id !== editing?.id);

  const handleSubmit = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    try {
      if (editing) {
        const movingToRoot = parentId === ROOT_VALUE;
        await update.mutateAsync({
          id: editing.id,
          body: {
            name: trimmed,
            description,
            // A tri-state field: the flag is the only way to say "no parent", since an
            // absent `parent_id` means "leave it where it is".
            ...(movingToRoot ? { clear_parent_id: true } : { parent_id: parentId }),
          },
        });
        toast.success(`Đã cập nhật danh mục ${trimmed}`);
      } else {
        await create.mutateAsync({
          name: trimmed,
          description,
          ...(parentId === ROOT_VALUE ? {} : { parent_id: parentId }),
        });
        toast.success(`Đã tạo danh mục ${trimmed}`);
      }
      onClose();
    } catch {
      // The global handler raises the toast — a cycle, a duplicate name or a parent that
      // vanished are all answers the form keeps its values for.
    }
  };

  return (
    <Modal open title={editing ? "Sửa danh mục" : "Thêm danh mục"} onClose={onClose}>
      <div className="space-y-4">
        {editing && (
          <div className="flex items-center gap-2">
            <span className="font-body-sm text-on-surface-variant">Mã danh mục</span>
            <IdentityKey value={editing.id} />
          </div>
        )}

        <Field label="Tên danh mục" hint="Tối đa 100 ký tự. Không được trùng tên danh mục khác.">
          <Input value={name} onChange={(event) => setName(event.target.value)} maxLength={100} fullWidth />
        </Field>

        <Field label="Mô tả" hint="Hiển thị cho người mua khi duyệt danh mục. Tối đa 2000 ký tự.">
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            maxLength={2000}
            className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
          />
        </Field>

        <Field
          label="Danh mục cha"
          hint="Nếu vị trí mới nằm trong nhánh con của chính danh mục này, máy chủ sẽ từ chối và cây danh mục giữ nguyên."
        >
          <select
            value={parentId}
            onChange={(event) => setParentId(event.target.value)}
            className="w-full rounded-2xl border border-outline-variant bg-surface-container-lowest px-4 py-3 font-body-md text-on-surface outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/15"
          >
            <option value={ROOT_VALUE}>Không có — đây là danh mục gốc</option>
            {candidates.map((node) => (
              <option key={node.id} value={node.id}>
                {indentLabel(node)}
              </option>
            ))}
          </select>
        </Field>

        <div className="flex justify-end gap-2 pt-1">
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Huỷ
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !name.trim()}>
            {isPending ? "Đang lưu…" : editing ? "Lưu thay đổi" : "Tạo danh mục"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
