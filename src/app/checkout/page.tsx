"use client";

import { useEffect, useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "@/components/ui/Button";
import StepIndicator from "@/components/ui/StepIndicator";
import { OrderService } from "@/services/order.service";
import { ContactService, Contact } from "@/services/contact.service";
import { toast } from "react-hot-toast";
import QuantitySelector from "@/components/ui/QuantitySelector";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft_id");

  const [isLoading, setIsLoading] = useState(true);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  
  const [draft, setDraft] = useState<any>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");
  
  const [shippingOptions, setShippingOptions] = useState<any[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<string>("");
  
  const [note, setNote] = useState("");

  useEffect(() => {
    if (!draftId) {
      router.push("/");
      return;
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        // Load draft and contacts concurrently
        const [draftRes, contactsRes] = await Promise.all([
          OrderService.getDraft(draftId),
          ContactService.getContacts()
        ]);
        
        const draftData = draftRes.data;
        setDraft(draftData);
        
        if (draftData.variants && draftData.variants.length > 0) {
          setSelectedVariantId(draftData.variants[0].id);
        }

        const contactsData = contactsRes.data || [];
        setContacts(contactsData);
        
        const defaultContact = contactsData.find(c => c.is_default_delivery) || contactsData[0] || null;
        setSelectedContact(defaultContact);

      } catch (error) {
        toast.error("Không thể tải thông tin thanh toán");
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [draftId, router]);

  // Lấy phí vận chuyển khi có contact và variant
  useEffect(() => {
    if (!draftId || !selectedContact || !selectedVariantId) return;

    const fetchShipping = async () => {
      try {
        const res = await OrderService.getShippingQuotes({
          draft_id: draftId,
          contact_id: selectedContact.id,
          lines: [{ variant_id: selectedVariantId, quantity }]
        });
        setShippingOptions(res.data || []);
        if (res.data && res.data.length > 0) {
          setSelectedShipping(res.data[0].slug);
        }
      } catch (error) {
        // Handle error quietly or show toast
        setShippingOptions([]);
      }
    };

    fetchShipping();
  }, [draftId, selectedContact, selectedVariantId, quantity]);

  if (isLoading) {
    return <div className="min-h-screen py-12 flex justify-center">Đang tải thông tin...</div>;
  }

  if (!draft) return null;

  const selectedVariant = draft.variants?.find((v: any) => v.id === selectedVariantId) || draft.variants?.[0];
  const subtotal = (selectedVariant?.price || 0) * quantity;
  
  const shippingFee = shippingOptions.find(o => o.slug === selectedShipping)?.price || 0;
  const total = subtotal + shippingFee;

  const handlePlaceOrder = async () => {
    if (!selectedContact) {
      toast.error("Vui lòng thêm địa chỉ nhận hàng");
      return;
    }
    if (!selectedShipping) {
      toast.error("Vui lòng chọn phương thức vận chuyển");
      return;
    }

    try {
      setIsPlacingOrder(true);
      const res = await OrderService.checkoutDraft(draft.id, {
        contact_id: selectedContact.id,
        transport_option: selectedShipping,
        currency: draft.currency || "VND",
        lines: [{ variant_id: selectedVariantId, quantity }],
        note: note || undefined
      });
      
      toast.success("Đặt hàng thành công!");
      router.push("/dashboard/orders");
      
    } catch (error) {
      // apiClient handles error toast
    } finally {
      setIsPlacingOrder(false);
    }
  };

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
                <div className="flex flex-col gap-1 text-body-md text-on-surface">
                  <div className="font-bold">{selectedContact.full_name} <span className="font-normal text-on-surface-variant mx-2">|</span> {selectedContact.phone}</div>
                  <div className="text-on-surface-variant">
                    {selectedContact.address_detail ? `${selectedContact.address_detail}, ` : ""}{selectedContact.address}<br />
                    {selectedContact.ward_name}, {selectedContact.district_name ? `${selectedContact.district_name}, ` : ""}{selectedContact.province_name}
                  </div>
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
                    
                    {draft.variants && draft.variants.length > 1 && (
                      <select 
                        value={selectedVariantId}
                        onChange={(e) => setSelectedVariantId(e.target.value)}
                        className="bg-surface-container-low border border-outline rounded p-1 text-sm max-w-[200px] mb-2"
                      >
                        {draft.variants.map((v: any) => (
                          <option key={v.id} value={v.id}>Loại: {v.attributes ? Object.values(v.attributes).join(", ") : v.id}</option>
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
                        <label key={opt.slug} className="flex items-center justify-between cursor-pointer">
                          <div className="flex items-center gap-2">
                            <input 
                              type="radio" 
                              name="shipping" 
                              value={opt.slug}
                              checked={selectedShipping === opt.slug}
                              onChange={(e) => setSelectedShipping(e.target.value)}
                              className="text-primary focus:ring-primary"
                            />
                            <span>{opt.name}</span>
                          </div>
                          <span className="font-medium">{formatPrice(opt.price)}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-on-surface-variant italic">Đang tính phí vận chuyển... (Cần có địa chỉ nhận hàng)</div>
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
                disabled={isPlacingOrder || !selectedContact || !selectedShipping}
              >
                {isPlacingOrder ? "Đang xử lý..." : "Đặt hàng"}
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
