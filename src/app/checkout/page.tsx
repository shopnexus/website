"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";
import ResumePayment from "./components/ResumePayment";
import StepIndicator from "@/components/ui/StepIndicator";
import QuantitySelector from "@/components/ui/QuantitySelector";
import { toast } from "react-hot-toast";
import { useContacts } from "@/hooks/api/useContacts";
import { useCheckout, useDraft, useShippingQuotes } from "@/hooks/api/useOrders";
import { useCheckoutOffer, useOffer } from "@/hooks/api/useOffers";
import { useListing } from "@/hooks/api/useCatalog";
import { usePaymentOptions, usePaymentSession, useStartPayment } from "@/hooks/api/useFinance";
import type { DraftOrderId, OfferId, PaymentSessionId } from "@/api/generated/types.gen";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

/**
 * One checkout for both ways a sale is made.
 *
 * A fixed-price purchase arrives with `draft_id` and a negotiated one with `offer_id` —
 * the two things that can freeze a price — and from there the page is identical: the buyer
 * pays delivery on both paths, so both quote every enabled carrier through
 * `POST /shipping-quotes` and neither gets to name a fee. What differs is only which
 * route turns the terms into a payment session, and how much of the form is still open: an
 * accepted offer already froze the variant, the quantity and the total.
 */
function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft_id") as DraftOrderId | null;
  const offerId = searchParams.get("offer_id") as OfferId | null;

  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  const [selectedPayment, setSelectedPayment] = useState<string>("");
  const [draftQuantity, setDraftQuantity] = useState(1);
  const [note, setNote] = useState("");
  // The session this page's own checkout opened. What the buyer waits on from here — an order
  // exists when it settles — so it is state rather than the mutation's result.
  const [tenderedSessionId, setTenderedSessionId] = useState<PaymentSessionId | null>(null);

  const { data: draft, isLoading: isLoadingDraft, isError: draftFailed } = useDraft(
    draftId ?? undefined,
  );
  const { data: offer, isLoading: isLoadingOffer, isError: offerFailed } = useOffer(
    offerId ?? undefined,
  );
  // A negotiated sale carries no name of its own: the offer names a listing and a variant.
  const { data: listing } = useListing(offer?.listing_id || draft?.listing_id);
  const { data: contacts = [], isLoading: isLoadingContacts } = useContacts();
  const checkout = useCheckout();
  const checkoutOffer = useCheckoutOffer();
  const { data: paymentOptions = [] } = usePaymentOptions();
  const startPayment = useStartPayment();

  // Coming back from a rail that took the payer away. The draft is spent by then, so this is the
  // only thing left to read: the session says whether the money arrived. Derived rather than
  // copied into state, like every other default on this page.
  const returningSessionId = searchParams.get("session_id") as PaymentSessionId | null;
  const sessionId = tenderedSessionId ?? returningSessionId;
  const { data: session, isLoading: isLoadingSession } = usePaymentSession(sessionId ?? undefined);

  // Came back with nothing but the session. Not every rail reports a cancellation — SePay's
  // hosted page has a back button and no webhook behind it — so the session is still `pending`
  // and good until `expired_at`, and this page has to offer the way back to the gateway. It
  // used to render `null` here, because the guard below asks for a draft the payer no longer
  // has: a live, payable order showed as a blank screen.
  const isResuming = !draftId && !offerId && Boolean(returningSessionId);

  useEffect(() => {
    // A returning payer has no draft or offer in the URL and does not need one.
    if (!draftId && !offerId && !returningSessionId) router.push("/");
  }, [draftId, offerId, returningSessionId, router]);

  // Terms that cannot be read are a checkout that cannot proceed — expired, cancelled, or
  // someone else's. The global toast has already said which.
  useEffect(() => {
    if (returningSessionId) return;
    if (draftFailed || offerFailed) router.push("/");
  }, [draftFailed, offerFailed, returningSessionId, router]);

  // The selections below are derived, not synced through effects: each falls back to a
  // default computed from data that may still be loading, and the moment the user picks
  // something their choice wins. Writing the default into state from an effect would
  // render once with nothing selected and again with it, for no gain.
  const activeVariantId =
    offer?.variant_id ?? (selectedVariantId || draft?.variants[0]?.variant_id || "");
  const quantity = offer?.quantity ?? draftQuantity;

  const defaultContact = contacts.find((c) => c.is_default_delivery) ?? contacts[0];
  const activeContactId = selectedContactId || defaultContact?.id || "";
  const selectedContact = contacts.find((c) => c.id === activeContactId) ?? null;

  const { data: quotes, isFetching: isQuoting } = useShippingQuotes(
    offerId
      ? // An offer carries its own variant and quantity, so lines are ignored for it.
        { offer_id: offerId, contact_id: activeContactId }
      : {
          draft_id: draftId ?? undefined,
          contact_id: activeContactId,
          lines: activeVariantId ? [{ variant_id: activeVariantId, quantity }] : undefined,
        },
    Boolean(activeContactId && (offerId || (draftId && activeVariantId))),
  );

  const shippingOptions = useMemo(() => quotes?.options ?? [], [quotes]);

  // Re-quoting after an address or quantity change can retire the chosen carrier, so a
  // selection that is no longer on offer falls back rather than lingering.
  const activeShipping = shippingOptions.some((o) => o.option === selectedShipping)
    ? selectedShipping
    : (shippingOptions[0]?.option ?? "");

  // Same rule as the carrier: an operator can disable a rail between page load and payment,
  // so a selection that is no longer offered falls back instead of being sent and refused.
  const activePayment = paymentOptions.some((o) => o.id === selectedPayment)
    ? selectedPayment
    : (paymentOptions[0]?.id ?? "");

  const selectedVariant =
    draft?.variants.find((v) => v.variant_id === activeVariantId) ?? draft?.variants[0];

  // An accepted offer's total is the whole agreed price, not a unit price.
  const subtotal = offer ? offer.total : (selectedVariant?.price ?? 0) * quantity;
  const shippingFee = shippingOptions.find((o) => o.option === activeShipping)?.fee ?? 0;
  const total = subtotal + shippingFee;

  const itemName = offer ? (listing?.name ?? "Sản phẩm đã thương lượng") : (draft?.name ?? "");
  // `processing` is a leg in flight — the rail was called and has not reported. That is the only
  // status worth blocking on: a declined leg does not fail the session, it puts it back on the
  // shelf as `pending` so another rail can be tendered, which is what makes the retry below a
  // retry and not a second sale.
  const isSettling = session?.status === "processing";
  const isPlacing =
    checkout.isPending || checkoutOffer.isPending || startPayment.isPending || isSettling;
  // Tendered, and the session is takeable again: the rail said no. `isError` is the other way to
  // get here — a rail that could not be reached at all, where nothing was charged either.
  const wasDeclined =
    startPayment.isError || (startPayment.isSuccess && session?.status === "pending");

  // The session settling is the whole answer: the order exists because the money arrived, and
  // nobody confirms anything in between.
  useEffect(() => {
    if (session?.status === "success") {
      toast.success("Thanh toán thành công! Đơn hàng đã được tạo.");
      // The order exists but the seller has not accepted yet, which is exactly this tab.
      router.push("/account/orders?tab=awaiting-confirmation");
    }
  }, [session?.status, router]);

  /// The checkout opened a session; nothing is bought until it is paid. Tendering right here
  /// rather than on another screen is what the buyer expects from pressing "pay", and leaving
  /// the session untendered was how this page used to end — with a payment nobody made and an
  /// order that never appeared.
  const tender = (id: PaymentSessionId) => {
    setTenderedSessionId(id);
    startPayment.mutate(
      {
        sessionId: id,
        body: {
          payment_option: activePayment,
          // Where the gateway sends the payer back, for a rail that takes them away. Checked
          // against the platform's own allowlist server-side, so a host nobody configured is
          // refused rather than followed.
          return_url: `${window.location.origin}/checkout?session_id=${id}`,
        },
      },
      {
        onSuccess: (leg) => {
          // A redirect rail decides nothing here: the payer has to go and come back, and the
          // session is what says how it went when they do.
          if (leg.checkout_url) {
            window.location.href = leg.checkout_url;
          }
        },
      },
    );
  };

  const handlePlaceOrder = () => {
    if (!selectedContact) {
      toast.error("Vui lòng thêm địa chỉ nhận hàng");
      return;
    }
    if (!activeShipping) {
      toast.error("Vui lòng chọn phương thức vận chuyển");
      return;
    }
    if (!activePayment) {
      toast.error("Vui lòng chọn phương thức thanh toán");
      return;
    }

    if (offer) {
      checkoutOffer.mutate(
        {
          id: offer.id,
          body: {
            contact_id: selectedContact.id,
            transport_option: activeShipping,
            note: note || undefined,
          },
        },
        { onSuccess: (result) => tender(result.payment_session_id) },
      );
      return;
    }

    if (!draft) return;
    checkout.mutate(
      {
        draftId: draft.id,
        body: {
          contact_id: selectedContact.id,
          transport_option: activeShipping,
          // Must match the listing's currency, which the draft froze.
          currency: draft.currency,
          lines: [{ variant_id: activeVariantId, quantity }],
          note: note || undefined,
        },
      },
      { onSuccess: (result) => tender(result.payment_session_id) },
    );
  };

  // Before the draft/offer guards: a returning payer has neither, and waiting on the address
  // book would stall a screen that never asks for an address.
  if (isResuming) {
    return (
      <ResumePayment
        session={session}
        isLoading={isLoadingSession}
        paymentOptions={paymentOptions}
        activePayment={activePayment}
        onSelectPayment={setSelectedPayment}
        onRetry={() => returningSessionId && tender(returningSessionId)}
        isRetrying={startPayment.isPending}
      />
    );
  }

  if (isLoadingDraft || isLoadingOffer || isLoadingContacts) {
    return <div className="min-h-screen py-12 flex justify-center">Đang tải thông tin...</div>;
  }

  if (!draft && !offer) return null;

  return (
    <div className="bg-surface-container-lowest min-h-screen py-8 pb-24">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        <div className="mb-8 hidden md:block">
           <StepIndicator steps={["Sản phẩm", "Thanh toán", "Xác nhận"]} currentStep={1} />
        </div>

        <h1 className="font-headline-md font-bold mb-6">Thanh toán</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 flex flex-col gap-6">
            
            <section className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0Ij48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iNCIgZmlsbD0iIzAwNGU0NyIvPjxyZWN0IHg9IjIwIiB3aWR0aD0iMjAiIGhlaWdodD0iNCIgZmlsbD0iI2JhMWExYSIvPjwvc3ZnPg==')] bg-repeat-x"></div>
              
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-headline-sm font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">location_on</span>
                  Địa chỉ nhận hàng
                </h2>
                <Link href="/account/contacts" className="text-primary font-label-md hover:underline">Quản lý địa chỉ</Link>
              </div>
              
              {selectedContact ? (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1 text-body-md text-on-surface">
                    <div className="font-bold">{selectedContact.full_name} <span className="font-normal text-on-surface-variant mx-2">|</span> {selectedContact.phone}</div>
                    <div className="text-on-surface-variant">
                      {selectedContact.address_detail ? `${selectedContact.address_detail}, ` : ""}{selectedContact.address}<br />
                      {selectedContact.ward_name}, {selectedContact.district_name ? `${selectedContact.district_name}, ` : ""}{selectedContact.province_name}
                    </div>
                  </div>

                  {/* Switching address re-quotes delivery, because the fee depends on
                      where the parcel is going. */}
                  {contacts.length > 1 && (
                    <select
                      value={activeContactId}
                      onChange={(e) => setSelectedContactId(e.target.value)}
                      className="self-start max-w-full bg-surface-container-low border border-outline rounded-lg px-3 py-2 text-body-sm outline-none focus:border-primary"
                    >
                      {contacts.map((contact) => (
                        <option key={contact.id} value={contact.id}>
                          {contact.full_name} — {contact.address}, {contact.province_name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                <div className="text-error font-medium">Chưa có địa chỉ nhận hàng. Vui lòng thêm địa chỉ!</div>
              )}
            </section>

            <section className="bg-surface rounded-2xl border border-outline-variant overflow-hidden shadow-sm">
              <h2 className="font-headline-sm font-bold p-6 border-b border-outline-variant">
                Sản phẩm
              </h2>
              
              <div className="p-6">
                {offer && (
                  <div className="mb-4 flex items-center gap-2 bg-secondary-container/40 text-on-secondary-container rounded-xl px-4 py-2 text-body-sm">
                    <span className="material-symbols-outlined text-[18px]">handshake</span>
                    Giá đã thương lượng và được chấp nhận. Bạn chỉ cần chọn địa chỉ và đơn vị vận chuyển.
                  </div>
                )}

                <div className="flex gap-4 mb-6">
                  <div className="relative w-20 h-20 rounded border border-outline-variant overflow-hidden shrink-0 bg-surface-container">
                    {listing?.images?.[0]?.url ? (
                      <Image
                        src={listing.images[0].url}
                        alt={itemName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-on-surface-variant">image</span>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col min-w-0">
                    <span className="font-body-md font-medium text-on-surface line-clamp-2 mb-2">{itemName}</span>

                    {/* An accepted offer froze the variant, so there is nothing to pick. */}
                    {!offer && draft && draft.variants.length > 1 && (
                      <select
                        value={activeVariantId}
                        onChange={(e) => setSelectedVariantId(e.target.value)}
                        className="bg-surface-container-low border border-outline rounded p-1 text-sm max-w-[200px] mb-2"
                      >
                        {draft.variants.map((v) => (
                          <option key={v.variant_id} value={v.variant_id}>
                            Loại: {v.attributes ? Object.values(v.attributes).join(", ") : v.variant_id}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="font-price-md text-primary">
                      {formatPrice(offer ? offer.total : (selectedVariant?.price ?? 0))}
                    </div>
                    {offer ? (
                      <span className="text-body-sm text-on-surface-variant">x{offer.quantity}</span>
                    ) : (
                      <QuantitySelector value={quantity} onChange={setDraftQuantity} min={1} max={99} />
                    )}
                  </div>
                </div>

                <div className="bg-surface-container-low p-4 rounded-xl mb-4">
                  <h4 className="font-label-md text-on-surface mb-2 text-primary">Phương thức vận chuyển</h4>
                  
                  {shippingOptions.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {shippingOptions.map((opt) => (
                        <label key={opt.option} className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-2">
                            <input
                              type="radio"
                              name="shipping"
                              value={opt.option}
                              checked={activeShipping === opt.option}
                              onChange={(e) => setSelectedShipping(e.target.value)}
                              className="text-primary focus:ring-primary"
                            />
                            <span>{opt.name}</span>
                          </div>
                          <span className="font-medium">{formatPrice(opt.fee)}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-on-surface-variant italic">
                      {isQuoting
                        ? "Đang tính phí vận chuyển..."
                        : selectedContact
                          ? "Không có đơn vị vận chuyển nào khả dụng cho địa chỉ này."
                          : "Cần có địa chỉ nhận hàng để tính phí vận chuyển."}
                    </div>
                  )}
                </div>
                
                <div className="bg-surface-container-low p-4 rounded-xl mb-4">
                  <h4 className="font-label-md text-on-surface mb-2 text-primary">Phương thức thanh toán</h4>

                  {paymentOptions.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {paymentOptions.map((opt) => (
                        <label key={opt.id} className="flex items-start gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="payment"
                            value={opt.id}
                            checked={activePayment === opt.id}
                            onChange={(e) => setSelectedPayment(e.target.value)}
                            className="mt-1 text-primary focus:ring-primary"
                          />
                          <span className="flex flex-col">
                            <span>{opt.name}</span>
                            {opt.description && (
                              <span className="text-xs text-on-surface-variant">{opt.description}</span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-on-surface-variant italic">
                      Không có phương thức thanh toán nào khả dụng. Vui lòng liên hệ hỗ trợ.
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-label-md text-on-surface-variant font-medium">Lời nhắn cho người bán:</span>
                  <textarea 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Lưu ý cho Người bán (ví dụ: giao trong giờ hành chính)..." 
                    className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest text-sm text-on-surface outline-none transition-all duration-200 focus:bg-surface focus:border-primary focus:ring-2 focus:ring-primary/20 px-4 py-3 min-h-[80px] resize-y"
                  />
                </div>
              </div>
            </section>
          </div>

          <div className="w-full lg:w-[380px] shrink-0">
            <div className="bg-surface rounded-2xl border border-outline-variant p-6 sticky top-24 shadow-sm">
              <h2 className="font-headline-sm font-bold mb-6">Đơn hàng</h2>
              
              <div className="flex flex-col gap-4 text-body-md text-on-surface-variant border-b border-outline-variant pb-6 mb-6">
                <div className="flex justify-between">
                  <span>Tổng tiền hàng</span>
                  <span className="text-on-surface">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="text-on-surface">{formatPrice(shippingFee)}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <span className="font-label-md text-on-surface">Tổng thanh toán</span>
                          <span className="font-headline-md text-primary leading-none">
                  {formatPrice(total)}
                </span>
              </div>
              
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={sessionId && wasDeclined ? () => tender(sessionId) : handlePlaceOrder}
                disabled={isPlacing || !selectedContact || !activeShipping || !activePayment}
              >
                {isSettling
                  ? "Đang chờ thanh toán..."
                  : isPlacing
                    ? "Đang xử lý..."
                    : wasDeclined
                      ? "Thử lại"
                      : "Đặt hàng"}
              </Button>

              {/* A pending session is the ordinary case for a rail that reports by webhook, not
                  an error: the page waits rather than claiming a result it does not have. */}
              {isSettling && (
                <p className="text-xs text-on-surface-variant text-center mt-3 px-2 leading-relaxed">
                  Đang chờ xác nhận từ cổng thanh toán. Bạn có thể để trang này mở — đơn hàng sẽ
                  được tạo ngay khi thanh toán hoàn tất.
                </p>
              )}
              {wasDeclined && (
                <p className="text-xs text-error text-center mt-3 px-2 leading-relaxed">
                  Thanh toán không thành công. Hãy chọn phương thức khác và thử lại — đơn hàng vẫn
                  đang chờ được thanh toán.
                </p>
              )}
              {/* An expired or cancelled session cannot be tendered again, and the draft behind it
                  is already spent: there is nothing to retry from this page. */}
              {(session?.status === "failed" || session?.status === "cancelled") && (
                <p className="text-xs text-error text-center mt-3 px-2 leading-relaxed">
                  Phiên thanh toán đã kết thúc. Vui lòng đặt hàng lại từ trang sản phẩm.
                </p>
              )}
              
              <p className="text-xs text-on-surface-variant text-center mt-4 px-4 leading-relaxed">
                Bằng việc tiến hành Đặt hàng, bạn đồng ý với các <Link href="/terms" className="text-primary hover:underline">Điều khoản Dịch vụ</Link> của ShopNexus.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-12 flex justify-center">Đang tải...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
