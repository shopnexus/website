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
export default function TagFormDialog({ editing, onClose }: { editing?: Tag; onClose: () => void }) {
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
          <div className="rounded-2xl border border-tertiary-container/60 bg-tertiary-container/10 px-4 py-3 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-label-md text-on-surface">Slug</span>
              <IdentityKey value={editing.slug} weight="settled" />
            </div>
            <p className="font-body-sm text-on-surface-variant">
              Slug chính là danh tính của thẻ — nó là khoá chính, là thứ mọi tin đăng trỏ tới và là
              giá trị nằm trên đường dẫn. Không có thao tác đổi tên: ghi vào một slug khác sẽ tạo ra
              một thẻ khác. Muốn thay slug, hãy tạo thẻ mới, gắn lại cho các tin đăng rồi mới xoá thẻ
              cũ.
            </p>
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

        <div className="flex justify-end gap-2 pt-1">
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
