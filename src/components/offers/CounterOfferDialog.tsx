"use client";

import { toast } from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import { useCounterOffer } from "@/hooks/api/useOffers";
import { useListing } from "@/hooks/api/useCatalog";
import { useAuthStore } from "@/stores/use-auth-store";
import type { Offer } from "@/api/generated/types.gen";
import OfferForm from "./OfferForm";

/**
 * Putting different terms on the table.
 *
 * A revision of the same negotiation, not a new offer: the id stays, authorship flips to you, and
 * the 12-hour window restarts. Which is also why the terms being answered are shown above the
 * field — a counter is a reply to a number, and typing one with that number out of sight is how
 * people land on the wrong side of their own intent.
 *
 * The form is shared with the dialog that opens a negotiation, because they ask for the same
 * three things under the same rule. What is left here is the request.
 */
export default function CounterOfferDialog({
  offer,
  open,
  onClose,
}: {
  offer: Offer;
  open: boolean;
  onClose: () => void;
}) {
  const counterOffer = useCounterOffer();
  const me = useAuthStore((s) => s.user?.id);

  // The asking price is the ceiling and the offer DTO does not carry it — only `variant_id`. So
  // a read of its own, and only while the dialog is open. A failed read invents no ceiling: the
  // server is where the rule lives, and blocking somebody from negotiating because a secondary
  // read failed trades an inconvenience for a feature.
  const { data: listing } = useListing(open ? offer.listing_id : undefined);
  const unitPrice = listing?.variants.find((v) => v.id === offer.variant_id)?.price;

  return (
    <Modal open={open} title="Trả giá" onClose={onClose}>
      <OfferForm
        unitPrice={unitPrice}
        currency={offer.currency}
        standing={{
          total: offer.total,
          quantity: offer.quantity,
          from: offer.counterparty.name,
        }}
        // Which way the suggested number moves: a seller answers upward towards their asking
        // price, a buyer answers downward from what the seller just asked.
        asSeller={me === offer.seller_id}
        submitLabel="Gửi mức giá này"
        isPending={counterOffer.isPending}
        onCancel={onClose}
        onSubmit={({ total, quantity, reason }) =>
          counterOffer.mutate(
            { id: offer.id, body: { total, quantity, reason: reason || undefined } },
            {
              onSuccess: () => {
                toast.success("Đã gửi mức giá của bạn");
                onClose();
              },
            },
          )
        }
      />
    </Modal>
  );
}
