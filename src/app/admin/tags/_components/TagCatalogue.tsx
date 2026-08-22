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

/** Uneven on purpose: a row of equal blocks does not look like a row of words. */
const PLACEHOLDER_WIDTHS = [
  "5rem", "9rem", "6.5rem", "4rem", "11rem", "7rem", "5.5rem", "8rem",
  "4.5rem", "10rem", "6rem", "7.5rem", "5rem", "8.5rem", "6rem", "12rem",
];

/**
 * One tag. A button for an admin, because the only thing to do with a tag is edit its
 * description — so the chip *is* the edit control and there is no hover-only row of
 * actions, which on a touch screen did not exist at all.
 *
 * For a moderator it is `IdentityKey`, which copies the slug: that is the whole of what a
 * moderator can do here, and it is what they came for.
 */
function TagChip({ tag, onEdit }: { tag: Tag; onEdit?: () => void }) {
  const described = Boolean(tag.description);

  if (!onEdit) {
    return (
      <IdentityKey
        value={tag.slug}
        weight="settled"
        title={tag.description || "Chưa có mô tả — nhấn để sao chép slug"}
      />
    );
  }

  return (
    <button
      type="button"
      onClick={onEdit}
      title={tag.description || "Chưa có mô tả. Nhấn để sửa."}
      className="inline-flex max-w-full items-center gap-1.5 rounded-md border border-primary/25 bg-primary/[0.06] px-2 py-1 font-mono text-[12px] leading-5 text-on-surface transition-colors hover:border-primary hover:bg-primary/10"
    >
      <span className="truncate">{tag.slug}</span>
      {described && (
        <span
          aria-label="Có mô tả"
          className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
        />
      )}
    </button>
  );
}

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

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="min-w-[16rem] flex-1">
          <Input
            value={search.term}
            onChange={(event) => search.setTerm(event.target.value)}
            leftIcon="search"
            placeholder="Tìm theo phần đầu của slug"
            fullWidth
          />
          {search.normalizedTerm && search.normalizedTerm !== search.term && (
            <p className="ml-1 mt-1 font-body-sm text-on-surface-variant">
              Đang tìm: <code className="font-mono">{search.normalizedTerm}</code>
            </p>
          )}
        </div>
        {/* How big the dictionary is, at the top. It was only ever stated by the pager at the
            bottom of the list, which on a set this size is off the screen. */}
        {search.meta?.total_count != null && (
          <span className="font-label-sm tabular-nums text-on-surface-variant">
            {search.meta.total_count} thẻ
          </span>
        )}
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
          <div className="flex flex-wrap gap-1.5 p-3" aria-busy="true">
            {PLACEHOLDER_WIDTHS.map((width, index) => (
              // The width goes on a wrapper: Skeleton takes a className, not a style.
              <div key={index} style={{ width }}>
                <Skeleton className="h-7 w-full rounded-md" />
              </div>
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
            {/* A flow of chips, not a list of records.
                Each tag was a row 85px tall carrying one word, and under it a second line that
                read "Chưa có mô tả" — which on this data is every row, so nine rows filled a
                screen and three of those words were repeated nine times. A dictionary is
                scanned for the one junk slug in three hundred; density is the whole feature.
                Sixty tags now fit where nine did.

                The description moves into the tooltip and leaves a dot behind, so the marked
                chips are the ones that *have* one. That is the inverse of before, where the
                common case shouted and the exception was silent. */}
            <ul className="flex flex-wrap gap-1.5 p-3">
              {search.tags.map((tag) => (
                <li key={tag.slug}>
                  <TagChip
                    tag={tag}
                    onEdit={isAdmin ? () => setEditing({ kind: "edit", tag }) : undefined}
                  />
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
          canDelete={isAdmin}
          onRequestDelete={() => {
            if (editing.kind !== "edit") return
            setDeleting(editing.tag)
            setEditing(null)
          }}
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
