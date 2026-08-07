"use client";

import type { ReactNode } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

/**
 * A confirmation for a write that cannot be undone from this screen.
 *
 * The body is a node rather than a string on purpose: every use here has to name what
 * else the write touches — the listings a tag is detached from, the sessions a revoked
 * moderator loses — and that is a sentence with the row's own words in it.
 */
export default function ConfirmDialog({
  open,
  title,
  confirmLabel,
  danger = true,
  pending = false,
  onConfirm,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  confirmLabel: string;
  danger?: boolean;
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <Modal open={open} title={title} onClose={onClose}>
      <div className="font-body-sm text-on-surface-variant space-y-3">{children}</div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onClose} disabled={pending}>
          Huỷ
        </Button>
        <Button variant={danger ? "error" : "primary"} onClick={onConfirm} disabled={pending}>
          {pending ? "Đang xử lý…" : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
