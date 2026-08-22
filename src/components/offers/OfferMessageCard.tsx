"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import { useOffer, useAcceptOffer, useCancelOffer } from "@/hooks/api/useOffers";
import { useListing } from "@/hooks/api/useCatalog";
import { useAuthStore } from "@/stores/use-auth-store";
import { formatMoney } from "@/lib/money";
import { remainingLabel } from "@/lib/order-state";
import type { Offer } from "@/api/generated/types.gen";
import CounterOfferDialog from "./CounterOfferDialog";
import { isReadersMove, offerStage, priceGap, urgencyOf, type OfferStage } from "./offer.logic";

/**
 * A negotiation, inside the thread the two of them already share.
 *
 * This is the whole negotiation surface — there is no separate offers screen, and there should
 * not be: the terms and the conversation about them belong in one place.
 *
 * The card is built around the four things a reader asks, in the order they ask them: whose move
 * is it, how much and how far from the asking price, how long do I have, what do I press. The
 * version before this answered the first with an abstract status word ("Đang chờ" — waiting on
 * whom?), the second with a bare total and no comparison, the third with a small red line in the
 * middle of the card whatever the time left, and the fourth with three full-width buttons of
 * equal weight where one of them was "refuse".
 *
 * One rule governs the colour: the header is `primary-container` exactly when the reader has
 * something to do, and quiet otherwise. In a thread of several cards that makes the one waiting
 * on you findable without reading any of them.
 */
export default function OfferMessageCard({ offerId }: { offerId: string }) {
  const { data: offer, isLoading } = useOffer(offerId);
  const user = useAuthStore((s) => s.user);

  if (isLoading) {
    return (
      <div className="h-[196px] w-full max-w-[320px] animate-pulse rounded-2xl border border-outline-variant bg-surface-container motion-reduce:animate-none" />
    );
  }
  if (!offer) {
    return (
      <div className="w-full max-w-[320px] rounded-2xl bg-error-container px-4 py-3 font-body-sm text-on-error-container">
        Không tải được đề nghị giá này.
      </div>
    );
  }

  return <Card offer={offer} me={user?.id} />;
}

/**
 * Split from the fetch so the stage is computed once against a loaded offer, rather than every
 * branch below having to allow for it being absent.
 */
function Card({ offer, me }: { offer: Offer; me: string | undefined }) {
  const acceptOffer = useAcceptOffer();
  const cancelOffer = useCancelOffer();
  const [counterOpen, setCounterOpen] = useState(false);

  // The asking price the proposal is answering. Not on the offer — the DTO carries the variant
  // id and nothing else — so it comes from the listing, which the thread's own banner has
  // usually already fetched: same query key, same cache, no second request.
  const { data: listing } = useListing(offer.listing_id);
  const unitAsking = listing?.variants.find((v) => v.id === offer.variant_id)?.price;
  const asking = unitAsking ? unitAsking * offer.quantity : undefined;
  const gap = priceGap(offer.total, asking);

  const stage = offerStage(offer, me);
  const isBuyer = me === offer.buyer_id;
  const mine = isReadersMove(stage, isBuyer);
  const busy = acceptOffer.isPending || cancelOffer.isPending;

  const accept = () =>
    acceptOffer.mutate(offer.id, { onSuccess: () => toast.success("Đã đồng ý mức giá này") });

  // One route for both: withdrawing your own proposal and refusing theirs are the same write,
  // told apart only by who is asking — which is what the labels say.
  const cancel = () =>
    cancelOffer.mutate(
      { id: offer.id },
      {
        onSuccess: () =>
          toast.success(stage === "theirs" ? "Đã rút đề nghị" : "Đã từ chối đề nghị"),
      },
    );

  return (
    <div className="w-full max-w-[320px] overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-sm sm:max-w-[360px]">
      <Header stage={stage} counterparty={offer.counterparty.name} isBuyer={isBuyer} mine={mine} />

      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-2.5">
          {offer.listing.cover?.url ? (
            // eslint-disable-next-line @next/next/no-img-element -- fixed 36px thumbnail
            <img
              src={offer.listing.cover.url}
              alt=""
              className="h-9 w-9 shrink-0 rounded-lg border border-outline-variant object-cover"
            />
          ) : (
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-surface-container text-on-surface-variant">
              <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                image
              </span>
            </div>
          )}
          <p className="line-clamp-2 min-w-0 font-body-sm leading-snug text-on-surface-variant">
            {offer.listing.name}
          </p>
        </div>

        <div>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span
              className={[
                "font-headline-sm font-bold tabular-nums",
                // A settled or lapsed number is history: it should not go on shouting from the
                // middle of a thread you have scrolled back through.
                stage === "closed" || stage === "expired"
                  ? "text-on-surface-variant line-through decoration-1"
                  : "text-primary",
              ].join(" ")}
            >
              {formatMoney(offer.total, offer.currency)}
            </span>
            {offer.quantity > 1 && (
              <span className="font-body-sm text-on-surface-variant">
                cho {offer.quantity} sản phẩm
              </span>
            )}
          </div>

          {/* What the offer is answering. Without it a total says nothing: 400.000 ₫ is a bargain
              or an insult depending on a number that was nowhere on this card. */}
          {(gap || asking) && (
            <p className="mt-0.5 font-body-sm text-on-surface-variant">
              {asking && <span className="line-through">{formatMoney(asking, offer.currency)}</span>}
              {gap && (
                <span
                  className={gap.cheaper ? "ml-1.5 font-semibold text-primary" : "ml-1.5 font-semibold"}
                >
                  {gap.cheaper ? `giảm ${gap.percent}%` : `cao hơn ${gap.percent}%`}
                </span>
              )}
              {offer.quantity > 1 && unitAsking && (
                <span className="ml-1.5">
                  · {formatMoney(Math.round(offer.total / offer.quantity), offer.currency)}/cái
                </span>
              )}
            </p>
          )}
        </div>

        {offer.reason && (
          <p className="whitespace-pre-wrap break-words rounded-xl bg-surface-container-low px-3 py-2 font-body-sm italic leading-relaxed text-on-surface">
            “{offer.reason}”
          </p>
        )}

        <Clock offer={offer} stage={stage} />
      </div>

      <Actions
        stage={stage}
        offer={offer}
        isBuyer={isBuyer}
        busy={busy}
        onAccept={accept}
        onCancel={cancel}
        onCounter={() => setCounterOpen(true)}
      />

      <CounterOfferDialog offer={offer} open={counterOpen} onClose={() => setCounterOpen(false)} />
    </div>
  );
}

/**
 * Whose move it is, said out loud.
 *
 * The status enum cannot carry this — `active` is "your turn" to one party and "hold on" to the
 * other at the same moment — so the header is written from the reader's side, and the fill is the
 * one signal that means "this one is on you".
 */
function Header({
  stage,
  counterparty,
  isBuyer,
  mine,
}: {
  stage: OfferStage;
  counterparty: string;
  isBuyer: boolean;
  mine: boolean;
}) {
  const label: Record<OfferStage, string> = {
    yours: "Chờ bạn trả lời",
    theirs: `Đang chờ ${counterparty}`,
    agreed: isBuyer ? "Đã thống nhất — thanh toán ngay" : `Đã thống nhất — chờ ${counterparty} thanh toán`,
    paid: "Đã thanh toán",
    expired: "Đã quá hạn",
    closed: "Đã hủy",
  };
  const icon: Record<OfferStage, string> = {
    yours: "campaign",
    theirs: "hourglass_top",
    agreed: "handshake",
    paid: "check_circle",
    expired: "timer_off",
    closed: "block",
  };

  return (
    <div
      className={[
        "flex items-center gap-1.5 px-4 py-2.5 font-label-md",
        mine
          ? "bg-primary-container text-on-primary-container"
          : "bg-surface-container-low text-on-surface-variant",
      ].join(" ")}
    >
      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
        {icon[stage]}
      </span>
      <span className="truncate font-semibold">{label[stage]}</span>
    </div>
  );
}

/**
 * The window, and only while there is one.
 *
 * Twelve hours for a proposal, thirty minutes once it is accepted — two very different clocks
 * behind one field, which is why this reads the time rather than the status. It used to be a red
 * line whatever the time left, so "còn 8 giờ" and "còn 3 phút" looked equally alarming and
 * neither was believed.
 */
function Clock({ offer, stage }: { offer: Offer; stage: OfferStage }) {
  if (stage === "closed" || stage === "paid") return null;

  if (stage === "expired") {
    return (
      <p className="flex items-center gap-1.5 font-body-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
          timer_off
        </span>
        Cửa sổ thương lượng đã đóng — hãy gửi một mức giá mới.
      </p>
    );
  }

  const left = remainingLabel(offer.expires_at);
  if (!left) return null;
  const urgency = urgencyOf(offer.expires_at);

  return (
    <p
      className={[
        "flex items-center gap-1.5 font-body-sm",
        urgency === "soon" ? "font-semibold text-error" : "text-on-surface-variant",
      ].join(" ")}
    >
      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
        schedule
      </span>
      {stage === "agreed" ? `Giữ giá còn ${left}` : `Còn ${left} để trả lời`}
    </p>
  );
}

/**
 * What to press.
 *
 * Weighted, not stacked: one filled button for the thing the reader most likely wants, an
 * outlined one beside it for the alternative, and walking away as plain text. The previous card
 * gave all three the same full width and painted "Từ chối" in the error colour, which made
 * refusing the loudest thing on a card about agreeing.
 */
function Actions({
  stage,
  offer,
  isBuyer,
  busy,
  onAccept,
  onCancel,
  onCounter,
}: {
  stage: OfferStage;
  offer: Offer;
  isBuyer: boolean;
  busy: boolean;
  onAccept: () => void;
  onCancel: () => void;
  onCounter: () => void;
}) {
  // Nothing either party can do: the row is settled, spent or lapsed.
  if (stage === "paid" || stage === "closed" || stage === "expired") return null;

  if (stage === "agreed") {
    // The seller's side of an agreement is waiting, which the header already says.
    if (!isBuyer) return null;
    return (
      <div className="px-4 pb-4">
        <Link href={`/checkout?offer_id=${offer.id}`} className="block">
          <Button variant="primary" fullWidth className="h-11 rounded-xl">
            Tạo đơn hàng ngay
          </Button>
        </Link>
      </div>
    );
  }

  if (stage === "theirs") {
    return (
      <div className="px-4 pb-4">
        <Button
          variant="ghost"
          fullWidth
          disabled={busy}
          onClick={onCancel}
          className="h-10 rounded-xl"
        >
          Rút đề nghị
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 px-4 pb-4">
      {/* The amount is in the label: money is not a thing to agree to by position. */}
      <Button variant="primary" fullWidth disabled={busy} onClick={onAccept} className="h-11 rounded-xl">
        Đồng ý {formatMoney(offer.total, offer.currency)}
      </Button>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          disabled={busy}
          onClick={onCounter}
          className="h-10 flex-1 rounded-xl"
        >
          Trả giá khác
        </Button>
        <Button variant="ghost" disabled={busy} onClick={onCancel} className="h-10 rounded-xl">
          Từ chối
        </Button>
      </div>
    </div>
  );
}
