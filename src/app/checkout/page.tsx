"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import StepIndicator from "@/components/ui/StepIndicator";
import QuantitySelector from "@/components/ui/QuantitySelector";
import { toast } from "react-hot-toast";
import { useContacts } from "@/hooks/api/useContacts";
import { useCheckout, useDraft, useShippingQuotes } from "@/hooks/api/useOrders";
import type { DraftOrderId } from "@/api/generated/types.gen";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft_id") as DraftOrderId | null;

  const [selectedContactId, setSelectedContactId] = useState<string>("");
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");

  const { data: draft, isLoading: isLoadingDraft, isError: draftFailed } = useDraft(
    draftId ?? undefined,
  );
  const { data: contacts = [], isLoading: isLoadingContacts } = useContacts();
  const checkout = useCheckout();

  useEffect(() => {
    if (!draftId) router.push("/");
  }, [draftId, router]);

  // A draft that cannot be read is a checkout that cannot proceed — expired, cancelled,
  // or someone else's. The global toast has already said which.
  useEffect(() => {
    if (draftFailed) router.push("/");
  }, [draftFailed, router]);

  // The three selections below are derived, not synced through effects: each falls back
  // to a default computed from data that may still be loading, and the moment the user
  // picks something their choice wins. Writing the default into state from an effect
  // would render once with nothing selected and again with it, for no gain.
  const activeVariantId = selectedVariantId || draft?.variants[0]?.variant_id || "";

  const defaultContact = contacts.find((c) => c.is_default_delivery) ?? contacts[0];
  const activeContactId = selectedContactId || defaultContact?.id || "";
  const selectedContact = contacts.find((c) => c.id === activeContactId) ?? null;

  const { data: quotes, isFetching: isQuoting } = useShippingQuotes(
    {
      draft_id: draftId ?? undefined,
      contact_id: activeContactId,
      lines: activeVariantId ? [{ variant_id: activeVariantId, quantity }] : undefined,
    },
    Boolean(draftId && activeContactId && activeVariantId),
  );

  const shippingOptions = useMemo(() => quotes?.options ?? [], [quotes]);

  // Re-quoting after an address or quantity change can retire the chosen carrier, so a
  // selection that is no longer on offer falls back rather than lingering.
  const activeShipping = shippingOptions.some((o) => o.option === selectedShipping)
    ? selectedShipping
    : (shippingOptions[0]?.option ?? "");

  const selectedVariant =
    draft?.variants.find((v) => v.variant_id === activeVariantId) ?? draft?.variants[0];

  const subtotal = (selectedVariant?.price ?? 0) * quantity;
  const shippingFee = shippingOptions.find((o) => o.option === activeShipping)?.fee ?? 0;
  const total = subtotal + shippingFee;

  const handlePlaceOrder = () => {
    if (!draft || !selectedContact) {
      toast.error("Vui lòng thêm địa chỉ nhận hàng");
      return;
    }
    if (!activeShipping) {
      toast.error("Vui lòng chọn phương thức vận chuyển");
      return;
    }

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
      {
        onSuccess: () => {
          toast.success("Đặt hàng thành công!");
          router.push("/dashboard/orders");
        },
      },
    );
  };

  if (isLoadingDraft || isLoadingContacts) {
    return <div className="min-h-screen py-12 flex justify-center">Đang tải thông tin...</div>;
  }

  if (!draft) return null;

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
                <Link href="/dashboard/contacts" className="text-primary font-label-md hover:underline">Quản lý địa chỉ</Link>
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
                <div className="font-label-md text-on-surface mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">store</span>
                  Shop {draft.seller_id}
                </div>
                
                <div className="flex gap-4 mb-6">
                  <div className="relative w-20 h-20 rounded border border-outline-variant overflow-hidden shrink-0 bg-surface-container">
                    {/* Draft order attachments are not standard in schema, but assuming we can show fallback */}
                    <span className="material-symbols-outlined absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-on-surface-variant">image</span>
                  </div>
                  <div className="flex-1 flex flex-col min-w-0">
                    <span className="font-body-md font-medium text-on-surface line-clamp-2 mb-2">{draft.name}</span>
                    
                    {draft.variants.length > 1 && (
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
                    <div className="font-price-md text-primary">{formatPrice(selectedVariant?.price || 0)}</div>
                    <QuantitySelector value={quantity} onChange={setQuantity} min={1} max={99} />
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
                <span className="font-headline-md text-[22px] text-primary font-bold leading-none">
                  {formatPrice(total)}
                </span>
              </div>
              
              <Button 
                variant="primary" 
                fullWidth 
                size="lg" 
                onClick={handlePlaceOrder}
                disabled={checkout.isPending || !selectedContact || !activeShipping}
              >
                {checkout.isPending ? "Đang xử lý..." : "Đặt hàng"}
              </Button>
              
              <p className="text-xs text-on-surface-variant text-center mt-4 px-4 leading-relaxed">
                Bằng việc tiến hành Đặt hàng, bạn đồng ý với các <Link href="#" className="text-primary hover:underline">Điều khoản Dịch vụ</Link> của ShopNexus.
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
