"use client";

import { IDENTITY_DOCUMENT_TYPE_VI } from "@/lib/dictionaries";
import { formatMoney } from "@/lib/money";
import { longestWait } from "@/lib/wait";
import { useNow } from "@/hooks/useNow";
import { useAdminTickets, useAdminListings } from "@/hooks/api/useAdminModeration";
import { useAdminIdentityDocuments, useAdminWithdrawals } from "@/hooks/api/useAdminFinance";
import QueueCard from "./QueueCard";

/** How many rows a card previews. Also the page's whole cost: four reads of three. */
const PEEK = 3;

/**
 * What needs a person right now, across all four queues.
 *
 * `/admin` used to be a `redirect()` to the ticket queue, which meant the only way to learn
 * that withdrawals had been piling up for two days was to go and look. Four reads of three
 * rows is the cheapest honest answer: three of the four are page-paginated and hand back
 * `total_count` alongside the rows, so the counts here are exact rather than estimated.
 *
 * The tickets read is the exception — it is cursor-paginated, and the server does not count
 * a cursor page — so that card reports its longest wait and nothing else. Sidebar badges
 * were the alternative and would have cost these same four requests on all eleven pages
 * instead of on this one.
 *
 * One clock for the page, so four cards' worth of ages tick together.
 */
export default function QueueOverview() {
  const now = useNow(30_000);

  const tickets = useAdminTickets(undefined, undefined, PEEK);
  const identity = useAdminIdentityDocuments("pending", PEEK);
  const listings = useAdminListings(undefined, PEEK);
  const withdrawals = useAdminWithdrawals("pending", PEEK);

  // Stretching rather than `items-start`: the cards hold different numbers of preview rows,
  // and letting them size to content puts the four "Mở hàng đợi" links at four different
  // heights — and that link is the one control on each card.
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
      <QueueCard
        href="/admin/tickets"
        icon="support_agent"
        name="Yêu cầu hỗ trợ"
        count={null}
        countNoun="yêu cầu"
        wait={longestWait(tickets.tickets, (entry) => entry.ticket.created_at, now)}
        peeks={tickets.tickets.map((entry) => ({
          id: entry.ticket.id,
          title: entry.ticket.subject,
          detail: entry.assignee
            ? `${entry.requester.name} · ${entry.assignee.name} đang xử lý`
            : entry.requester.name,
        }))}
        isLoading={tickets.isLoading}
        emptyLine="Không ai đang chờ trả lời"
      />

      <QueueCard
        href="/admin/identity-documents"
        icon="badge"
        name="Xác minh danh tính"
        count={identity.totalCount}
        countNoun="hồ sơ chờ duyệt"
        wait={longestWait(identity.entries, (entry) => entry.document.created_at, now)}
        peeks={identity.entries.map((entry) => ({
          id: entry.document.id,
          title: entry.account.name,
          detail: `${IDENTITY_DOCUMENT_TYPE_VI[entry.document.doc_type]} · ${entry.document.provider}`,
        }))}
        isLoading={identity.isLoading}
        emptyLine="Không hồ sơ nào chờ duyệt"
      />

      <QueueCard
        href="/admin/listings"
        icon="inventory_2"
        name="Tin đăng chờ duyệt"
        count={listings.totalCount}
        countNoun="tin chờ duyệt"
        wait={longestWait(listings.listings, (listing) => listing.created_at, now)}
        peeks={listings.listings.map((listing) => ({
          id: listing.id,
          title: listing.name,
          detail: `${listing.seller.name} · ${formatMoney(listing.price, listing.currency)}`,
        }))}
        isLoading={listings.isLoading}
        emptyLine="Không tin đăng nào chờ duyệt"
      />

      <QueueCard
        href="/admin/withdrawals"
        icon="payments"
        name="Yêu cầu rút tiền"
        count={withdrawals.totalCount}
        countNoun="yêu cầu chờ duyệt"
        wait={longestWait(withdrawals.withdrawals, (row) => row.created_at, now)}
        peeks={withdrawals.withdrawals.map((row) => ({
          id: row.id,
          title: formatMoney(row.amount, row.currency),
          detail: `${row.bank_account.account_holder} · ${row.bank_account.account_number_masked}`,
        }))}
        isLoading={withdrawals.isLoading}
        emptyLine="Không ai đang chờ tiền"
      />
    </div>
  );
}
