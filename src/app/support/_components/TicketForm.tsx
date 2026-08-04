"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { TICKET_KIND_VI, TICKET_REASON_VI } from "@/lib/dictionaries";
import { TICKET_REF_PREFIX, isReportKind, useOpenTicket } from "@/hooks/api/useTickets";
import { useConfirmChatUpload, useRequestChatUpload } from "@/hooks/api/useChat";
import { sameOriginUploadUrl } from "@/api/upload";
import type { ResourceId, TicketKind, TicketReason } from "@/api/generated/types.gen";

/**
 * Raise a ticket.
 *
 * `body` and `attachments` are not columns on the ticket — they open its conversation as
 * the first message — so the uploads go through the chat upload routes, which is what the
 * server validates them against.
 */
export default function TicketForm({
  initialKind = "other",
  initialRefId = "",
  /** A ref supplied by the calling page (a listing, an order) is not the user's to change. */
  refLocked = false,
  onCancel,
}: {
  initialKind?: TicketKind;
  initialRefId?: string;
  refLocked?: boolean;
  onCancel?: () => void;
}) {
  const router = useRouter();
  const openTicket = useOpenTicket();
  const requestUpload = useRequestChatUpload();
  const confirmUpload = useConfirmChatUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [kind, setKind] = useState<TicketKind>(initialKind);
  const [refId, setRefId] = useState(initialRefId);
  const [reason, setReason] = useState<TicketReason>("other");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<Array<{ id: ResourceId; name: string }>>([]);

  const refPrefix = TICKET_REF_PREFIX[kind];

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const slot = await requestUpload.mutateAsync({
        filename: file.name,
        mime: file.type,
        size: file.size,
      });
      const res = await fetch(sameOriginUploadUrl(slot.url), {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!res.ok) throw new Error("upload failed");
      const uploaded = await confirmUpload.mutateAsync(slot.resource_id);
      setAttachments((prev) => [...prev, { id: uploaded.id, name: file.name }]);
    } catch {
      // The global handler raises the toast.
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error("Vui lòng nhập tiêu đề.");
      return;
    }
    if (refPrefix && !refId.trim()) {
      toast.error("Loại yêu cầu này cần mã của nội dung liên quan.");
      return;
    }

    openTicket.mutate(
      {
        kind,
        subject: subject.trim(),
        body: body.trim() || undefined,
        // Each of these is refused on the kinds that do not take it, so neither is sent
        // where it does not belong.
        ref_id: refPrefix ? refId.trim() : undefined,
        reason: isReportKind(kind) ? reason : undefined,
        attachments: attachments.length > 0 ? attachments.map((a) => a.id) : undefined,
      },
      {
        onSuccess: (ticket) => {
          toast.success("Đã gửi yêu cầu hỗ trợ.");
          router.push(`/support/${ticket.id}`);
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col gap-5">
      <h2 className="font-headline-sm font-bold text-on-surface">Gửi yêu cầu hỗ trợ</h2>

      <div>
        <label htmlFor="ticket-kind" className="block text-sm font-semibold text-on-surface mb-2">
          Loại yêu cầu
        </label>
        <select
          id="ticket-kind"
          value={kind}
          onChange={(e) => setKind(e.target.value as TicketKind)}
          className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-base outline-none focus:border-primary cursor-pointer"
        >
          {(Object.keys(TICKET_KIND_VI) as TicketKind[]).map((k) => (
            <option key={k} value={k}>
              {TICKET_KIND_VI[k]}
            </option>
          ))}
        </select>
      </div>

      {refPrefix && (
        <div>
          <label htmlFor="ticket-ref" className="block text-sm font-semibold text-on-surface mb-2">
            Mã nội dung liên quan <span className="text-error">*</span>
          </label>
          <Input
            id="ticket-ref"
            value={refId}
            onChange={(e) => setRefId(e.target.value)}
            disabled={refLocked}
            placeholder={`${refPrefix}_...`}
          />
          <p className="text-xs text-on-surface-variant mt-1">
            Mã hiển thị trên trang của nội dung bạn muốn phản ánh, bắt đầu bằng{" "}
            <code className="font-mono">{refPrefix}_</code>.
          </p>
        </div>
      )}

      {isReportKind(kind) && (
        <div>
          <label htmlFor="ticket-reason" className="block text-sm font-semibold text-on-surface mb-2">
            Lý do
          </label>
          <select
            id="ticket-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value as TicketReason)}
            className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-base outline-none focus:border-primary cursor-pointer"
          >
            {(Object.keys(TICKET_REASON_VI) as TicketReason[]).map((r) => (
              <option key={r} value={r}>
                {TICKET_REASON_VI[r]}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label htmlFor="ticket-subject" className="block text-sm font-semibold text-on-surface mb-2">
          Tiêu đề <span className="text-error">*</span>
        </label>
        <Input
          id="ticket-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Ví dụ: Người bán gửi sai sản phẩm"
        />
      </div>

      <div>
        <label htmlFor="ticket-body" className="block text-sm font-semibold text-on-surface mb-2">
          Nội dung
        </label>
        <textarea
          id="ticket-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Mô tả chi tiết vấn đề. Đây sẽ là tin nhắn đầu tiên trong cuộc trao đổi với bộ phận hỗ trợ."
          className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-base outline-none focus:border-primary resize-y min-h-[120px]"
        />
      </div>

      <div>
        <span className="block text-sm font-semibold text-on-surface mb-2">Ảnh đính kèm</span>
        <div className="flex flex-wrap items-center gap-2">
          {attachments.map((a) => (
            <span
              key={a.id}
              className="inline-flex items-center gap-1 bg-surface-container-low border border-outline-variant rounded-full px-3 py-1 text-xs text-on-surface-variant"
            >
              <span className="material-symbols-outlined text-[14px]">image</span>
              <span className="max-w-[160px] truncate">{a.name}</span>
              <button
                type="button"
                onClick={() => setAttachments((prev) => prev.filter((p) => p.id !== a.id))}
                className="material-symbols-outlined text-[14px] hover:text-error cursor-pointer"
              >
                close
              </button>
            </span>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={requestUpload.isPending || confirmUpload.isPending}
            onClick={() => fileInputRef.current?.click()}
          >
            <span className="material-symbols-outlined text-[16px] mr-1">attach_file</span>
            Thêm ảnh
          </Button>
          <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleUpload} />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2 border-t border-outline-variant">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Hủy
          </Button>
        )}
        <Button type="submit" variant="primary" disabled={openTicket.isPending}>
          {openTicket.isPending ? "Đang gửi..." : "Gửi yêu cầu"}
        </Button>
      </div>
    </form>
  );
}
