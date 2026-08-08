"use client";

import type { Category, ListingCondition, ListingDetail, PriceMode } from "@/api/generated/types.gen";
import Button from "@/components/ui/Button";
import { LISTING_CONDITION_VI, PRICE_MODE_VI } from "@/lib/dictionaries";
import type { ListingDraft } from "../types";

const CONDITIONS: ListingCondition[] = ["new", "used", "damaged"];
const PRICE_MODES: PriceMode[] = ["fixed", "negotiable"];

const field =
  "w-full px-3 py-2.5 bg-surface-container-lowest rounded-lg border border-outline focus:border-primary outline-none transition-colors text-body-md";

/**
 * What the listing says about itself.
 *
 * Photos and specifications are not here: they are captured by the posting flow, and a
 * second uploader on this page would be the same field with two behaviours. The price is
 * not here either — it lives on the variant, which is the row a buyer actually buys.
 */
export default function ListingDetailsForm({
  listing,
  draft,
  onChange,
  onSave,
  saving,
  categories,
}: {
  listing: ListingDetail;
  draft: ListingDraft;
  onChange: (draft: ListingDraft) => void;
  onSave: () => void;
  saving: boolean;
  categories: ReadonlyArray<Category>;
}) {
  return (
    <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/40 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-outline-variant/40">
        <h2 className="font-headline font-bold text-lg text-primary">Thông tin sản phẩm</h2>
      </div>

      <form
        className="p-6 space-y-5"
        onSubmit={(event) => {
          event.preventDefault();
          onSave();
        }}
      >
        <div>
          <label htmlFor="listing-name" className="block font-label-sm font-semibold text-on-surface mb-1.5">
            Tên sản phẩm
          </label>
          <input
            id="listing-name"
            value={draft.name}
            maxLength={200}
            onChange={(event) => onChange({ ...draft, name: event.target.value })}
            className={field}
          />
        </div>

        <div>
          <label
            htmlFor="listing-description"
            className="block font-label-sm font-semibold text-on-surface mb-1.5"
          >
            Mô tả
          </label>
          <textarea
            id="listing-description"
            rows={5}
            value={draft.description}
            onChange={(event) => onChange({ ...draft, description: event.target.value })}
            className={`${field} resize-y`}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="listing-category"
              className="block font-label-sm font-semibold text-on-surface mb-1.5"
            >
              Danh mục
            </label>
            <select
              id="listing-category"
              value={draft.category_id}
              onChange={(event) => onChange({ ...draft, category_id: event.target.value })}
              className={field}
            >
              {/* The listing's own category is always in the list, even when the tree read
                  has not arrived — otherwise the select would silently show the first
                  category and a blind save would re-file the listing under it. */}
              {categories.length === 0 && (
                <option value={listing.category.id}>{listing.category.name}</option>
              )}
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="listing-condition"
              className="block font-label-sm font-semibold text-on-surface mb-1.5"
            >
              Tình trạng
            </label>
            <select
              id="listing-condition"
              value={draft.condition}
              onChange={(event) =>
                onChange({ ...draft, condition: event.target.value as ListingCondition })
              }
              className={field}
            >
              {CONDITIONS.map((condition) => (
                <option key={condition} value={condition}>
                  {LISTING_CONDITION_VI[condition]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <span className="block font-label-sm font-semibold text-on-surface mb-2">Kiểu giá</span>
          <div className="flex flex-wrap gap-2">
            {PRICE_MODES.map((mode) => (
              <button
                key={mode}
                type="button"
                aria-pressed={draft.price_mode === mode}
                onClick={() => onChange({ ...draft, price_mode: mode })}
                className={[
                  "px-4 py-2 rounded-full border text-sm font-semibold transition-all cursor-pointer",
                  draft.price_mode === mode
                    ? "bg-primary text-on-primary border-primary"
                    : "border-outline-variant text-on-surface-variant hover:bg-surface-container-high",
                ].join(" ")}
              >
                {PRICE_MODE_VI[mode]}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-on-surface-variant mt-2">
            Giá cố định vẫn bán bình thường; “có thể thương lượng” cho phép người mua mở một
            cuộc trả giá trong tin nhắn.
          </p>
        </div>

        <div>
          <label htmlFor="listing-tags" className="block font-label-sm font-semibold text-on-surface mb-1.5">
            Thẻ (cách nhau bằng dấu phẩy)
          </label>
          <input
            id="listing-tags"
            value={draft.tags}
            onChange={(event) => onChange({ ...draft, tags: event.target.value })}
            placeholder="vintage, gỗ, thủ công"
            className={field}
          />
          <p className="text-[11px] text-on-surface-variant mt-2">Tối đa 10 thẻ.</p>
        </div>

        <div className="pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </section>
  );
}
