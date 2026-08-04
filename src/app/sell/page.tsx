"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import StepIndicator from "@/components/ui/StepIndicator";
import { LISTING_CONDITION_VI, PRICE_MODE_VI } from "@/lib/dictionaries";
import {
  useCategories,
  useConfirmListingUpload,
  useCreateListing,
  usePublishListing,
  useRequestListingUpload,
} from "@/hooks/api/useCatalog";
import { useContacts } from "@/hooks/api/useContacts";
import { sameOriginUploadUrl } from "@/api/upload";
import type {
  CategoryId,
  ContactId,
  ListingCondition,
  ListingSuggestion,
  PriceMode,
  ResourceId,
} from "@/api/generated/types.gen";
import AiSuggestionPanel from "./_components/AiSuggestionPanel";

/** The currency every price on this marketplace is quoted in. */
const CURRENCY = "VND";

interface Photo {
  id: ResourceId;
  url: string;
}

/**
 * Posting a listing.
 *
 * Two writes, in this order: `POST /listings` creates it as a draft, then
 * `POST /listings/{id}/publication` queues it for moderation and freezes its pickup address
 * onto the row. Publication always goes through a human — there is no path that makes a
 * listing live without one — so the seller is told it is pending rather than live.
 */
export default function SellPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [condition, setCondition] = useState<ListingCondition | "">("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [specs, setSpecs] = useState<Array<{ key: string; value: string }>>([]);
  const [transcript, setTranscript] = useState("");
  const [price, setPrice] = useState("");
  const [priceMode, setPriceMode] = useState<PriceMode>("fixed");
  const [weightG, setWeightG] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [pickupContactId, setPickupContactId] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: categories = [] } = useCategories();
  const { data: contacts = [] } = useContacts();
  const requestUpload = useRequestListingUpload();
  const confirmUpload = useConfirmListingUpload();
  const createListing = useCreateListing();
  const publishListing = usePublishListing();

  const defaultPickup = contacts.find((c) => c.is_default_pickup) ?? contacts[0];
  const activePickupId = pickupContactId || defaultPickup?.id || "";
  const activePickup = contacts.find((c) => c.id === activePickupId) ?? null;

  const isUploading = requestUpload.isPending || confirmUpload.isPending;
  const isPosting = createListing.isPending || publishListing.isPending;

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    for (const file of files) {
      try {
        const slot = await requestUpload.mutateAsync({
          filename: file.name,
          mime: file.type,
          size: file.size,
        });
        const res = await fetch(sameOriginUploadUrl(slot.url), {
          method: "PUT",
          body: file,
          headers: { "Content-Type": file.type },
        });
        if (!res.ok) throw new Error("upload failed");
        // The row is only real once the bytes are there, which is what stops a listing
        // rendering a photo that never arrived.
        const resource = await confirmUpload.mutateAsync(slot.resource_id);
        setPhotos((prev) => [...prev, { id: resource.id, url: resource.url ?? "" }]);
      } catch {
        // The global handler raises the toast.
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  /** Everything the model could stand behind, and nothing it could not. */
  const applySuggestion = (s: ListingSuggestion): void => {
    setName(s.name);
    if (s.description) setDescription(s.description);
    if (s.category_id) setCategoryId(s.category_id);
    if (s.condition) setCondition(s.condition);
    if (s.tags.length > 0) setTags(s.tags.join(", "));
    if (s.price !== null) setPrice(String(s.price));
    if (s.weight_g !== null) setWeightG(String(s.weight_g));
    if (s.specifications) {
      setSpecs(
        Object.entries(s.specifications).map(([key, value]) => ({ key, value: String(value) })),
      );
    }
    // Echoed so a wrong field can be traced to what was heard rather than guessed at.
    setTranscript(s.transcript ?? "");
    setCurrentStep(1);
  };

  const handlePublish = async () => {
    const parsedPrice = Number(price);
    if (!name.trim() || !categoryId || !condition) {
      toast.error("Vui lòng nhập tên, danh mục và tình trạng sản phẩm.");
      setCurrentStep(1);
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast.error("Vui lòng nhập giá bán hợp lệ.");
      return;
    }
    if (contacts.length === 0) {
      toast.error("Bạn cần có ít nhất một địa chỉ lấy hàng trước khi đăng tin.");
      return;
    }

    const parsedWeight = Number(weightG);
    const parsedQuantity = Number(quantity);

    const specifications = Object.fromEntries(
      specs
        .filter((s) => s.key.trim() && s.value.trim())
        .map((s) => [s.key.trim(), s.value.trim()]),
    );

    try {
      const listing = await createListing.mutateAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        category_id: categoryId as CategoryId,
        condition,
        currency: CURRENCY,
        price_mode: priceMode,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        specifications: Object.keys(specifications).length > 0 ? specifications : undefined,
        attachments: photos.map((p) => p.id),
        // One variant: price and shipping weight live on the variant, not the listing, and
        // delivery is priced from the variant's package details.
        variants: [
          {
            attributes: {},
            package_details:
              Number.isFinite(parsedWeight) && parsedWeight > 0 ? { weight_g: parsedWeight } : {},
            price: parsedPrice,
            quantity: Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? parsedQuantity : 1,
          },
        ],
      });

      await publishListing.mutateAsync({
        id: listing.id,
        body: activePickupId ? { pickup_contact_id: activePickupId as ContactId } : undefined,
      });

      toast.success("Đã gửi tin đăng. Tin sẽ hiển thị sau khi được kiểm duyệt.");
      router.push("/dashboard/products");
    } catch {
      // The global handler raises the toast; the form keeps its values so a rejected
      // publication can be fixed rather than retyped.
    }
  };

  const rootCategories = categories.filter((c) => !c.parent_id);

  return (
    <div className="min-h-screen bg-surface-container-lowest py-8 pb-24">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-on-surface flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">sell</span>
            Tạo tin đăng mới
          </h1>
          <Link
            href="/"
            className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined">close</span>
          </Link>
        </div>

        <StepIndicator
          steps={["Hình ảnh", "Thông tin", "Giá & Giao hàng"]}
          currentStep={currentStep}
          className="mb-10"
        />

        <div className="bg-surface rounded-3xl border border-outline-variant shadow-sm overflow-hidden">
          <div className="p-6 md:p-10">
            {currentStep === 0 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h3 className="text-xl font-bold mb-2">Thêm hình ảnh</h3>
                  <p className="text-sm text-on-surface-variant">
                    Ảnh đầu tiên sẽ là ảnh bìa. Ảnh rõ nét giúp bạn bán nhanh hơn.
                  </p>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="aspect-square bg-surface-container-low border-2 border-dashed border-primary/50 rounded-2xl flex flex-col items-center justify-center p-4 text-center cursor-pointer hover:bg-surface-container transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-[36px] text-primary mb-1">add_a_photo</span>
                    <span className="text-xs font-semibold text-primary">
                      {isUploading ? "Đang tải..." : "Tải ảnh lên"}
                    </span>
                  </button>
                  {photos.map((photo, idx) => (
                    <div
                      key={photo.id}
                      className="relative aspect-square rounded-2xl overflow-hidden border border-outline-variant bg-surface-container"
                    >
                      {photo.url && <Image src={photo.url} alt="" fill className="object-cover" />}
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded">
                          Ảnh bìa
                        </span>
                      )}
                      <button
                        type="button"
                        aria-label="Xóa ảnh"
                        onClick={() => setPhotos((prev) => prev.filter((p) => p.id !== photo.id))}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full w-6 h-6 flex items-center justify-center cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handleUpload}
                />

                <AiSuggestionPanel
                  attachments={photos.map((p) => p.id)}
                  onSuggestion={applySuggestion}
                />
              </div>
            )}

            {currentStep === 1 && (
              <div className="flex flex-col gap-6">
                {transcript && (
                  <div className="bg-surface-container-low rounded-xl p-4 text-sm text-on-surface-variant flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-0.5 shrink-0">record_voice_over</span>
                    <span>
                      Ghi âm được nghe thành: <span className="italic">&quot;{transcript}&quot;</span>
                    </span>
                  </div>
                )}

                <div>
                  <label htmlFor="listing-name" className="block text-sm font-semibold text-on-surface mb-2">
                    Tên sản phẩm <span className="text-error">*</span>
                  </label>
                  <Input
                    id="listing-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ví dụ: iPhone 14 Pro Max 256GB mới 99%"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="listing-category" className="block text-sm font-semibold text-on-surface mb-2">
                      Danh mục <span className="text-error">*</span>
                    </label>
                    <select
                      id="listing-category"
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-base outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="">Chọn danh mục</option>
                      {rootCategories.map((root) => (
                        <optgroup key={root.id} label={root.name}>
                          <option value={root.id}>{root.name}</option>
                          {categories
                            .filter((c) => c.parent_id === root.id)
                            .map((child) => (
                              <option key={child.id} value={child.id}>
                                {child.name}
                              </option>
                            ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="listing-condition" className="block text-sm font-semibold text-on-surface mb-2">
                      Tình trạng <span className="text-error">*</span>
                    </label>
                    <select
                      id="listing-condition"
                      value={condition}
                      onChange={(e) => setCondition(e.target.value as ListingCondition)}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-base outline-none focus:border-primary cursor-pointer"
                    >
                      <option value="">Chọn tình trạng</option>
                      {(Object.keys(LISTING_CONDITION_VI) as ListingCondition[]).map((c) => (
                        <option key={c} value={c}>
                          {LISTING_CONDITION_VI[c]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="listing-description" className="block text-sm font-semibold text-on-surface mb-2">
                    Mô tả chi tiết
                  </label>
                  <textarea
                    id="listing-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-base outline-none focus:border-primary resize-y h-36"
                    placeholder="Nguồn gốc, tình trạng, phụ kiện đi kèm..."
                  />
                </div>

                <div>
                  <label htmlFor="listing-tags" className="block text-sm font-semibold text-on-surface mb-2">
                    Thẻ
                  </label>
                  <Input
                    id="listing-tags"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="iphone, apple, dien-thoai"
                  />
                  <p className="text-xs text-on-surface-variant mt-1">Cách nhau bằng dấu phẩy, tối đa 10 thẻ.</p>
                </div>

                <div>
                  <span className="block text-sm font-semibold text-on-surface mb-2">Thông số</span>
                  <div className="flex flex-col gap-2">
                    {specs.map((spec, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input
                          aria-label="Tên thông số"
                          value={spec.key}
                          onChange={(e) =>
                            setSpecs((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, key: e.target.value } : s)),
                            )
                          }
                          placeholder="Thương hiệu"
                          className="!py-2"
                        />
                        <Input
                          aria-label="Giá trị thông số"
                          value={spec.value}
                          onChange={(e) =>
                            setSpecs((prev) =>
                              prev.map((s, i) => (i === idx ? { ...s, value: e.target.value } : s)),
                            )
                          }
                          placeholder="Apple"
                          className="!py-2"
                        />
                        <button
                          type="button"
                          aria-label="Xóa thông số"
                          onClick={() => setSpecs((prev) => prev.filter((_, i) => i !== idx))}
                          className="material-symbols-outlined text-on-surface-variant hover:text-error px-2 cursor-pointer"
                        >
                          delete
                        </button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="self-start"
                      onClick={() => setSpecs((prev) => [...prev, { key: "", value: "" }])}
                    >
                      <span className="material-symbols-outlined text-[16px] mr-1">add</span>
                      Thêm thông số
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="flex flex-col gap-6">
                <div>
                  <label htmlFor="listing-price" className="block text-sm font-semibold text-on-surface mb-2">
                    Giá bán (₫) <span className="text-error">*</span>
                  </label>
                  <Input
                    id="listing-price"
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Nhập giá bán..."
                    leftIcon="payments"
                    className="text-lg"
                  />
                </div>

                <div className="bg-surface-container-low p-5 rounded-2xl border border-outline-variant">
                  <h4 className="text-sm font-semibold text-on-surface mb-3">Hình thức giá</h4>
                  <div className="flex flex-col gap-3">
                    {(Object.keys(PRICE_MODE_VI) as PriceMode[]).map((mode) => (
                      <label key={mode} className="flex items-start gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="price-mode"
                          value={mode}
                          checked={priceMode === mode}
                          onChange={() => setPriceMode(mode)}
                          className="mt-1 text-primary focus:ring-primary"
                        />
                        <div>
                          <span className="text-base text-on-surface font-medium block">
                            {PRICE_MODE_VI[mode]}
                          </span>
                          <span className="text-sm text-on-surface-variant block mt-0.5">
                            {mode === "fixed"
                              ? "Người mua chỉ có thể mua đúng giá bạn niêm yết."
                              : "Người mua có thể mua ngay theo giá niêm yết, hoặc gửi đề nghị giá khác."}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="listing-weight" className="block text-sm font-semibold text-on-surface mb-2">
                      Khối lượng (gram)
                    </label>
                    <Input
                      id="listing-weight"
                      type="number"
                      value={weightG}
                      onChange={(e) => setWeightG(e.target.value)}
                      placeholder="500"
                    />
                    <p className="text-xs text-on-surface-variant mt-1">
                      Phí vận chuyển được đơn vị vận chuyển báo giá từ số này.
                    </p>
                  </div>
                  <div>
                    <label htmlFor="listing-quantity" className="block text-sm font-semibold text-on-surface mb-2">
                      Số lượng
                    </label>
                    <Input
                      id="listing-quantity"
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="listing-pickup" className="block text-sm font-semibold text-on-surface mb-2">
                    Địa chỉ lấy hàng
                  </label>
                  {contacts.length > 0 ? (
                    <>
                      <select
                        id="listing-pickup"
                        value={activePickupId}
                        onChange={(e) => setPickupContactId(e.target.value)}
                        className="w-full bg-surface-container-low border border-outline-variant rounded-xl py-3 px-4 text-base outline-none focus:border-primary cursor-pointer"
                      >
                        {contacts.map((contact) => (
                          <option key={contact.id} value={contact.id}>
                            {contact.full_name} — {contact.address}, {contact.province_name}
                          </option>
                        ))}
                      </select>
                      {activePickup && (
                        <p className="text-xs text-on-surface-variant mt-2">
                          Đây cũng là khu vực người mua nhìn thấy và dùng để lọc tin:{" "}
                          {activePickup.ward_name},{" "}
                          {activePickup.district_name ? `${activePickup.district_name}, ` : ""}
                          {activePickup.province_name}.
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="bg-error-container/30 border border-error/20 rounded-xl p-4 text-sm text-on-surface">
                      Bạn chưa có địa chỉ nào.{" "}
                      <Link href="/dashboard/contacts" className="text-primary font-semibold hover:underline">
                        Thêm địa chỉ lấy hàng
                      </Link>{" "}
                      trước khi đăng tin.
                    </div>
                  )}
                </div>

                <div className="bg-surface-container-low rounded-xl p-4 text-sm text-on-surface-variant flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary mt-0.5 shrink-0">info</span>
                  <span>
                    Tin đăng luôn qua kiểm duyệt trước khi hiển thị, nên sau khi gửi tin sẽ ở trạng thái
                    &quot;Chờ duyệt&quot;.
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 md:px-10 py-5 border-t border-outline-variant bg-surface-container-lowest flex justify-between items-center">
            <button
              type="button"
              disabled={currentStep === 0}
              className="text-primary text-sm font-semibold hover:underline disabled:opacity-0 cursor-pointer"
              onClick={() => setCurrentStep((s) => s - 1)}
            >
              Quay lại
            </button>

            {currentStep === 2 ? (
              <Button
                variant="primary"
                className="px-8"
                onClick={handlePublish}
                disabled={isPosting || contacts.length === 0}
              >
                {isPosting ? "Đang gửi..." : "Đăng bán ngay"}
              </Button>
            ) : (
              <Button variant="primary" className="px-8" onClick={() => setCurrentStep((s) => s + 1)}>
                Tiếp tục
                <span className="material-symbols-outlined ml-1">arrow_forward</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
