"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import { TICKET_ACTION_VI, TICKET_KIND_VI, TICKET_STATUS_VI } from "@/lib/dictionaries";
import { useTickets } from "@/hooks/api/useTickets";
import type { TicketKind, TicketStatus } from "@/api/generated/types.gen";
import TicketForm from "./_components/TicketForm";

type Tab = "all" | TicketStatus;

const STATUS_BADGES: Record<TicketStatus, string> = {
  open: "bg-primary/10 text-primary border border-primary/20",
  reviewing: "bg-secondary-container text-on-secondary-container",
  resolved: "bg-surface-container-high text-on-surface-variant",
};

function SupportContent() {
  const searchParams = useSearchParams();
  // A page that knows what the ticket is about links here with the kind and the ref
  // filled in — a report button on a listing, a problem button on an order.
  const presetKind = searchParams.get("kind") as TicketKind | null;
  const presetRefId = searchParams.get("ref_id") ?? "";

  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [isFormOpen, setIsFormOpen] = useState(Boolean(presetKind));

  const { tickets, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useTickets(
    activeTab === "all" ? undefined : activeTab,
  );

  const tabs = [
    { id: "all", label: "Tất cả" },
    { id: "open", label: TICKET_STATUS_VI.open },
    { id: "reviewing", label: TICKET_STATUS_VI.reviewing },
    { id: "resolved", label: TICKET_STATUS_VI.resolved },
  ];

  return (
    <div className="bg-surface-container-lowest min-h-screen py-8 pb-24">
      <div className="max-w-[1000px] mx-auto px-4 md:px-8 flex flex-col gap-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="font-headline-md font-bold text-on-surface">Trung tâm hỗ trợ</h1>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Báo cáo vi phạm, khiếu nại hoàn tiền, sự cố đơn hàng hay góp ý — tất cả đều ở đây.
            </p>
          </div>
          {!isFormOpen && (
            <Button variant="primary" onClick={() => setIsFormOpen(true)}>
              <span className="material-symbols-outlined mr-1">add</span>
              Yêu cầu mới
            </Button>
          )}
        </div>

        {isFormOpen && (
          <TicketForm
            initialKind={presetKind ?? "other"}
            initialRefId={presetRefId}
            refLocked={Boolean(presetRefId)}
            onCancel={() => setIsFormOpen(false)}
          />
        )}

        <div>
          <div className="bg-surface rounded-t-2xl border border-outline-variant border-b-0 overflow-hidden shadow-sm">
            <Tabs tabs={tabs} activeTabId={activeTab} onChange={(id) => setActiveTab(id as Tab)} fullWidth />
          </div>

          <div className="flex flex-col gap-4">
            {isLoading ? (
              <div className="bg-surface rounded-b-2xl border border-outline-variant p-12 text-center text-on-surface-variant shadow-sm">
                Đang tải yêu cầu...
              </div>
            ) : tickets.length === 0 ? (
              <div className="bg-surface rounded-b-2xl border border-outline-variant p-12 text-center text-on-surface-variant shadow-sm">
                Bạn chưa gửi yêu cầu hỗ trợ nào.
              </div>
            ) : (
              tickets.map((ticket, idx) => (
                <Link
                  key={ticket.id}
                  href={`/support/${ticket.id}`}
                  className={[
                    "bg-surface border border-outline-variant p-6 shadow-sm hover:border-primary transition-colors",
                    idx === 0 ? "rounded-b-2xl" : "rounded-2xl",
                  ].join(" ")}
                >
                  <div className="flex flex-wrap items-center gap-3 mb-2">
                    <Badge variant="surface" className={STATUS_BADGES[ticket.status]}>
                      {TICKET_STATUS_VI[ticket.status]}
                    </Badge>
                    <span className="text-label-md text-on-surface-variant">
                      {TICKET_KIND_VI[ticket.kind]}
                    </span>
                    <span className="text-xs text-on-surface-variant ml-auto">
                      {new Date(ticket.created_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="font-body-md font-semibold text-on-surface">{ticket.subject}</div>
                  {ticket.action_taken && (
                    <div className="text-body-sm text-on-surface-variant mt-2">
                      Kết quả: {TICKET_ACTION_VI[ticket.action_taken]}
                    </div>
                  )}
                </Link>
              ))
            )}

            {hasNextPage && (
              <div className="flex justify-center pt-2">
                <Button variant="outline" disabled={isFetchingNextPage} onClick={() => fetchNextPage()}>
                  {isFetchingNextPage ? "Đang tải..." : "Tải thêm"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SupportPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-12 flex justify-center">Đang tải...</div>}>
      <SupportContent />
    </Suspense>
  );
}
