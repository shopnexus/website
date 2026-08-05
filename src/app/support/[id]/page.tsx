"use client";

import { use } from "react";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import ChatThread from "@/components/chat/ChatThread";
import {
  TICKET_ACTION_VI,
  TICKET_KIND_VI,
  TICKET_REASON_VI,
  TICKET_STATUS_VI,
} from "@/lib/dictionaries";
import { useTicket } from "@/hooks/api/useTickets";
import { useConversation } from "@/hooks/api/useChat";
import type { TicketStatus } from "@/api/generated/types.gen";

const STATUS_BADGES: Record<TicketStatus, string> = {
  open: "bg-primary/10 text-primary border border-primary/20",
  reviewing: "bg-secondary-container text-on-secondary-container",
  resolved: "bg-surface-container-high text-on-surface-variant",
};

/**
 * One ticket, which is one chat thread with a header on top.
 *
 * Support is anonymous: a reply from the desk arrives with no sender and `from_support`
 * set, which is what the thread renders as the platform rather than as a person.
 */
export default function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: ticket, isLoading, isError } = useTicket(id);
  // Only for the unread count: opening the thread is the read receipt, and the ticket row
  // does not carry one.
  const { data: thread } = useConversation(ticket?.conversation_id ?? undefined);

  if (isLoading) {
    return <div className="min-h-screen py-12 flex justify-center text-on-surface-variant">Đang tải yêu cầu...</div>;
  }

  if (isError || !ticket) {
    return (
      <div className="min-h-screen py-12 flex flex-col items-center gap-4">
        <p className="text-on-surface-variant">Không tìm thấy yêu cầu hỗ trợ này.</p>
        <Link href="/support" className="text-primary font-label-md hover:underline">
          Quay lại Trung tâm hỗ trợ
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest min-h-screen py-8">
      <div className="max-w-[900px] mx-auto px-4 md:px-8 flex flex-col gap-6">
        <Link
          href="/support"
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-label-md"
        >
          <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          Quay lại Trung tâm hỗ trợ
        </Link>

        <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <Badge variant="surface" className={STATUS_BADGES[ticket.status]}>
              {TICKET_STATUS_VI[ticket.status]}
            </Badge>
            <span className="text-label-md text-on-surface-variant">{TICKET_KIND_VI[ticket.kind]}</span>
            {ticket.reason && (
              <span className="text-label-md text-on-surface-variant">
                · {TICKET_REASON_VI[ticket.reason]}
              </span>
            )}
            <span className="text-xs text-on-surface-variant ml-auto">
              Gửi ngày {new Date(ticket.created_at).toLocaleDateString("vi-VN")}
            </span>
          </div>

          <h1 className="font-headline-sm font-bold text-on-surface">{ticket.subject}</h1>

          {ticket.ref_id && (
            <div className="text-body-sm text-on-surface-variant mt-2">
              Nội dung liên quan: <code className="font-mono">{ticket.ref_id}</code>
            </div>
          )}

          {ticket.status === "resolved" && (
            <div className="mt-4 pt-4 border-t border-outline-variant flex flex-col gap-1">
              <div className="text-body-sm text-on-surface">
                Kết quả:{" "}
                <span className="font-semibold">
                  {ticket.action_taken ? TICKET_ACTION_VI[ticket.action_taken] : "—"}
                </span>
              </div>
              {ticket.resolution_note && (
                <p className="text-body-sm text-on-surface-variant whitespace-pre-wrap">
                  {ticket.resolution_note}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="bg-surface rounded-2xl border border-outline-variant shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="px-5 py-3 border-b border-outline-variant/30 flex items-center gap-2 shrink-0">
            <span className="material-symbols-outlined text-primary text-[20px]">support_agent</span>
            <h2 className="text-sm font-bold text-on-surface">Trao đổi với bộ phận hỗ trợ</h2>
          </div>

          {ticket.conversation_id ? (
            <ChatThread
              conversationId={ticket.conversation_id}
              unread={thread?.unread ?? 0}
              placeholder="Viết tin nhắn cho bộ phận hỗ trợ..."
            />
          ) : (
            // The row and its thread live in different schemas, so one lands first. Reading
            // the ticket repairs it, which means a reload is the whole remedy.
            <div className="flex-1 flex items-center justify-center text-center text-body-sm text-on-surface-variant p-8">
              Đang mở cuộc trao đổi cho yêu cầu này. Vui lòng tải lại trang sau ít giây.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
