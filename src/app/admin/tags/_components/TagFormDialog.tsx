"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import type { Tag } from "@/api/generated/types.gen";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Field from "@/components/admin-config/Field";
import IdentityKey from "@/components/admin-config/IdentityKey";
import { usePutTag } from "@/hooks/api/useAdminConfig";
import {
  MAX_TAG_DESCRIPTION_LENGTH,
  MAX_TAG_SLUG_LENGTH,
  isValidTagSlug,
  toTagSlug,
} from "../_lib/tag-slug";

/**
 * Create a tag, or edit the description of one.
 *
 * There is no rename here and there cannot be: the slug *is* the tag — it is the primary
 * key, the thing every listing's join row points at and the value a URL carries — so
 * writing to a different slug creates a second tag rather than moving this one. The
 * dialog says that where the slug is, because "why is the slug greyed out" is otherwise
 * answered by somebody creating a duplicate.
 */
export default function TagFormDialog({
  editing,
  canDelete = false,
  onRequestDelete,
  onClose,
}: {
  editing?: Tag
  /** Admin only. The catalogue owns the confirm step, so this only asks for it. */
  canDelete?: boolean
  onRequestDelete?: () => void
  onClose: () => void
}) {
  const put = usePutTag();
  const [slug, setSlug] = useState(editing?.slug ?? "");
  const [description, setDescription] = useState(editing?.description ?? "");

  const slugError = slug && !isValidTagSlug(slug) ? "Chỉ gồm chữ thường, số và dấu gạch ngang." : undefined;
  const canSubmit = isValidTagSlug(slug) && !put.isPending;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await put.mutateAsync({ slug, body: { description: description.trim() } });
      toast.success(editing ? `Đã cập nhật thẻ ${slug}` : `Đã tạo thẻ ${slug}`);
      onClose();
    } catch {
      // The global handler raises the toast; the form keeps what was typed.
    }
  };

  return (
    <Modal open title={editing ? "Sửa mô tả thẻ" : "Thêm thẻ"} onClose={onClose}>
      <div className="space-y-4">
        {editing ? (
          // One line. The four that were here explained that a slug is a primary key, that
          // there is no rename, and how to fake one — which the page header already says in a
          // sentence, and which nobody re-reads on the fifth description they fix.
          <div className="flex items-center gap-2">
            <span className="font-label-md text-on-surface">Slug</span>
            <IdentityKey value={editing.slug} weight="settled" />
            <span className="font-label-sm text-on-surface-variant">không sửa được</span>
          </div>
        ) : (
          <Field
            label="Slug"
            hint="Chữ thường không dấu, các từ nối bằng dấu gạch ngang. Đây là danh tính vĩnh viễn của thẻ."
            error={slugError}
          >
            <Input
              value={slug}
              onChange={(event) => setSlug(toTagSlug(event.target.value))}
              placeholder="do-gom"
              maxLength={MAX_TAG_SLUG_LENGTH}
              fullWidth
            />
          </Field>
        )}

        <Field label="Mô tả" hint={`Không bắt buộc. Tối đa ${MAX_TAG_DESCRIPTION_LENGTH} ký tự.`}>
          <Input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={MAX_TAG_DESCRIPTION_LENGTH}
            fullWidth
          />
        </Field>

        <div className="flex items-center justify-end gap-2 pt-1">
          {/* The one destructive action on this surface, and it lives here rather than on
              every chip in the grid: three hundred delete targets in a dense flow is three
              hundred chances to hit one by accident. */}
          {editing && canDelete && (
            <Button
              variant="ghost"
              className="mr-auto text-error hover:bg-error/10 hover:text-error"
              onClick={onRequestDelete}
              disabled={put.isPending}
            >
              Xoá thẻ
            </Button>
          )}
          <Button variant="outline" onClick={onClose} disabled={put.isPending}>
            Huỷ
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {put.isPending ? "Đang lưu…" : editing ? "Lưu mô tả" : "Tạo thẻ"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
