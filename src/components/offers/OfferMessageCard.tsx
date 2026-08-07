"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import CounterOfferDialog from "./CounterOfferDialog";
import { useOffer, useAcceptOffer, useCancelOffer } from "@/hooks/api/useOffers";
import { useAuthStore } from "@/stores/use-auth-store";
import { OFFER_STATUS_VI } from "@/lib/dictionaries";
import { remainingLabel } from "@/lib/order-state";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

const STATUS_COLORS: Record<string, string> = {
  active: "text-secondary font-bold",
  accepted: "text-primary font-bold",
  "checked-out": "text-green-600 font-bold",
  cancelled: "text-error font-bold",
};

/**
 * A negotiation, inside the thread the two of them already share.
 *
 * This is the whole negotiation surface — there is no separate offers screen, and there
 * should not be: the terms and the conversation about them belong in one place.
 *
 * Whose move it is comes from `author_id`, not from which side of the sale you are on.
 * The two parties alternate, so the one holding the standing proposal waits and the other
 * answers; keying the buttons on buyer/seller assumed the buyer always proposes, which is
 * only true of the first offer and breaks the moment anyone counters.
 */
export default function OfferMessageCard({ offerId }: { offerId: string }) {
  const { data: offer, isLoading } = useOffer(offerId);
  const user = useAuthStore((s) => s.user);

  const acceptOffer = useAcceptOffer();
  const cancelOffer = useCancelOffer();
  const [counterOpen, setCounterOpen] = useState(false);

  if (isLoading) {
    return <div className="p-4 bg-surface-container rounded-xl animate-pulse w-64 h-32" />;
  }
  if (!offer) {
    return (
      <div className="p-4 bg-error-container text-on-error-container rounded-xl text-sm text-center">
        Không thể tải đề nghị giá
      </div>
    );
  }

  const isBuyer = user?.id === offer.buyer_id;
  // The standing proposal is the author's; the other side is the one who may move.
  const isAuthor = user?.id === offer.author_id;
  const busy = acceptOffer.isPending || cancelOffer.isPending;
  const active = offer.status === "active";
  const left = remainingLabel(offer.expires_at);

  const accept = () =>
    acceptOffer.mutate(offer.id, {
      onSuccess: () => toast.success("Đã đồng ý mức giá này"),
    });

  // One route for both: withdrawing your own proposal and refusing theirs are the same
  // write, told apart only by who is asking — which is what the labels below say.
  const cancel = () =>
    cancelOffer.mutate(
      { id: offer.id },
      { onSuccess: () => toast.success(isAuthor ? "Đã rút đề nghị" : "Đã từ chối đề nghị") },
    );

  return (
    <div className="w-[280px] bg-surface rounded-xl shadow-sm border border-outline-variant overflow-hidden flex flex-col">
      <div className="px-4 py-3 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
        <span className="font-bold text-sm text-on-surface flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[18px]">handshake</span>
          Đề nghị giá
        </span>
        <span className={`text-[11px] uppercase tracking-wider ${STATUS_COLORS[offer.status]}`}>
          {OFFER_STATUS_VI[offer.status]}
        </span>
      </div>

      <div className="p-4 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {offer.listing.cover?.url ? (
            // eslint-disable-next-line @next/next/no-img-element -- fixed 48px thumbnail
            <img
              src={offer.listing.cover.url}
              alt=""
              className="w-12 h-12 rounded-lg object-cover border border-outline-variant shrink-0"
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-surface-container shrink-0" />
          )}
          <p className="text-xs text-on-surface line-clamp-2 leading-snug">{offer.listing.name}</p>
        </div>

        <div className="flex justify-between items-end border-t border-outline-variant/30 pt-3 mt-1">
          <div className="flex flex-col">
            <span className="text-[10px] text-on-surface-variant font-medium">GIÁ ĐỀ NGHỊ</span>
            <span className="font-display-sm text-primary font-bold">{formatPrice(offer.total)}</span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-on-surface-variant font-medium">SỐ LƯỢNG</span>
            <span className="font-bold text-sm text-on-surface">x{offer.quantity}</span>
          </div>
        </div>

        {offer.reason && (
          <div className="mt-1 border-l-2 border-primary/30 pl-3 py-1">
            <span className="text-[10px] text-on-surface-variant font-medium block mb-0.5">LỜI NHẮN</span>
            <p className="text-xs text-on-surface whitespace-pre-wrap break-words italic">{offer.reason}</p>
          </div>
        )}

        {/* An offer expires, and an accepted one holds the price for only 30 minutes. A card
            with no clock on it lets both windows pass unnoticed. */}
        {left && offer.status !== "cancelled" && offer.status !== "checked-out" && (
          <span className="text-[11px] font-bold text-error">
            {left === "đã quá hạn" ? "Đã quá hạn" : `Còn ${left}`}
          </span>
        )}
      </div>

      <div className="px-4 pb-4 flex flex-col gap-2">
        {active && !isAuthor && (
          <>
            <Button variant="primary" fullWidth disabled={busy} onClick={accept} className="rounded-xl py-2">
              Đồng ý mức giá này
            </Button>
            <Button
              variant="outline"
              fullWidth
              disabled={busy}
              onClick={() => setCounterOpen(true)}
              className="rounded-xl py-2"
            >
              Trả giá
            </Button>
            <Button
              variant="secondary"
              fullWidth
              disabled={busy}
              onClick={cancel}
              className="rounded-xl py-2 !bg-error-container !text-on-error-container hover:!bg-error/20"
            >
              Từ chối
            </Button>
          </>
        )}

        {active && isAuthor && (
          <>
            <p className="text-[11px] text-on-surface-variant text-center">
              Đang chờ {offer.counterparty.name} trả lời.
            </p>
            <Button
              variant="outline"
              fullWidth
              disabled={busy}
              onClick={cancel}
              className="rounded-xl py-2"
            >
              Rút đề nghị
            </Button>
          </>
        )}

        {/* Agreeing froze the price for a short window; the buyer's checkout is the sale,
            and it is the same page a fixed-price purchase goes through. */}
        {offer.status === "accepted" &&
          (isBuyer ? (
            <Link href={`/checkout?offer_id=${offer.id}`} className="block">
              <Button variant="primary" fullWidth className="rounded-xl py-2">
                Tạo đơn hàng ngay
              </Button>
            </Link>
          ) : (
            <p className="text-[11px] text-on-surface-variant text-center">
              Đã thống nhất giá — chờ {offer.counterparty.name} thanh toán.
            </p>
          ))}
      </div>

      <CounterOfferDialog offer={offer} open={counterOpen} onClose={() => setCounterOpen(false)} />
    </div>
  );
}
