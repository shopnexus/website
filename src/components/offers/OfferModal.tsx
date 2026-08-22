"use client";

import { toast } from "react-hot-toast";
import Modal from "@/components/ui/Modal";
import { useCreateOffer } from "@/hooks/api/useOffers";
import { ApiError } from "@/api/api-error";
import type { ListingDetail, Variant } from "@/api/generated/types.gen";
import OfferForm from "./OfferForm";

/**
 * Opening a negotiation, from the listing page.
 *
 * The buyer starts it — a seller has nobody to propose to on their own listing — so this is only
 * ever reached from the buy panel, and the form is the same one a counter uses.
 *
 * It hand-rolled its own scrim and panel before, which meant focus was never trapped and Escape
 * did nothing; `Modal` is the shared one, built on Radix for exactly those parts.
 */
export default function OfferModal({
  isOpen,
  onClose,
  product,
  variant,
  onSuccessCallback,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: ListingDetail | null;
  /** The variant being negotiated over. The featured one when the caller has no selection. */
  variant?: Variant;
  onSuccessCallback?: () => void;
}) {
  const createOffer = useCreateOffer();

  if (!product) return null;

  const target = variant ?? product.variants.find((v) => v.is_featured) ?? product.variants[0];
  if (!target) return null;

  return (
    <Modal open={isOpen} title="Đề nghị giá" onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          {product.images?.[0]?.url ? (
            // eslint-disable-next-line @next/next/no-img-element -- fixed 48px thumbnail
            <img
              src={product.images[0].url}
              alt=""
              className="h-12 w-12 shrink-0 rounded-xl border border-outline-variant object-cover"
            />
          ) : (
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-surface-container text-on-surface-variant">
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                image
              </span>
            </div>
          )}
          <p className="line-clamp-2 font-body-md text-on-surface">{product.name}</p>
        </div>

        <OfferForm
          unitPrice={target.price}
          currency={product.currency}
          submitLabel="Gửi đề nghị"
          isPending={createOffer.isPending}
          onCancel={onClose}
          onSubmit={({ total, quantity, reason }) =>
            createOffer.mutate(
              { variant_id: target.id, quantity, total, reason: reason || undefined },
              {
                onSuccess: () => {
                  toast.success("Đã gửi đề nghị giá");
                  onClose();
                  onSuccessCallback?.();
                },
                onError: (err) => {
                  // The interceptor normalises every failure into an ApiError, so the code is a
                  // field rather than something to dig out of a response body.
                  const code = err instanceof ApiError ? err.code : undefined;
                  toast.error(
                    code === "offer_already_open"
                      ? "Bạn đã có một đề nghị giá đang chờ trả lời cho sản phẩm này."
                      : "Không gửi được đề nghị giá.",
                  );
                },
              },
            )
          }
        />
      </div>
    </Modal>
  );
}
