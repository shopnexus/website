import { PRICE_MAX, PRICE_MIN } from './sell';

// Tin của bạn's steps on one listing, shared by the page's form posts and
// the in-place edits (api/listing-steps.ts runs them, my-listings-edit.ts
// draws them): their names, what a refusal says, and the price rules.

export const LISTING_STEPS = ['hide', 'unhide', 'mark-sold', 'unmark-sold', 'delete', 'price', 'relist'] as const;
export type ListingStep = (typeof LISTING_STEPS)[number];
export const isListingStep = (s: string): s is ListingStep => (LISTING_STEPS as readonly string[]).includes(s);

/** What a step's refusal says, by the server's code. */
export function stepRefusal(code: string) {
  return (
    {
      listing_held: 'ShopNexus đã ẩn tin này, chỉ ShopNexus mở lại được. Bạn gửi yêu cầu hỗ trợ nhé.',
      listing_cap_reached: 'Bạn đã có đủ số tin cho phép. Xóa hoặc đánh dấu đã bán một tin khác trước.',
      listing_state_conflict: 'Tin vừa đổi trạng thái nên chưa làm được. Xem lại danh sách nhé.',
      invalid_listing: 'Giá từ 10.000 ₫ đến 1 tỷ ₫.',
      phone_required: 'Cần số điện thoại trong tài khoản để đăng tin.',
      account_suspended: 'Tài khoản đang bị khóa nên chưa làm được.',
    }[code] ?? 'Chưa làm được. Thử lại sau ít phút.'
  );
}

export const priceAllowed = (p: number | null): p is number => p !== null && p >= PRICE_MIN && p <= PRICE_MAX;

/**
 * The price a buyer sees struck through after a change from `price` to
 * `next`: the server shows a drop of 5 % or more on a listing that went on sale.
 */
export const dropFrom = (price: number, next: number, published: boolean) =>
  published && (price - next) * 100 >= price * 5 ? price : undefined;

/** `price` less `pct` %, rounded to 10.000 ₫ (1.000 ₫ under 1 triệu). */
export function lessPercent(price: number, pct: number) {
  const step = price >= 1_000_000 ? 10_000 : 1_000;
  return Math.max(PRICE_MIN, Math.round((price * (100 - pct)) / 100 / step) * step);
}
