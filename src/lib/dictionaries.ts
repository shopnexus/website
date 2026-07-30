import type {
  ListingCondition,
  ListingStatus,
  PriceMode,
  ShippingPaidBy,
} from "@/types/catalog.type";

import type {
  OrderState,
  OrderItemState,
  OrderPaymentStatus,
  OfferStatus,
} from "@/types/order.type";

import type {
  AccountRole,
  AccountStatus,
  ProfileGender,
  IdentityDocumentType,
  IdentityStatus,
} from "@/types/account.type";

import type {
  TransactionStatus,
  PaymentSessionStatus,
} from "@/types/finance.type";

import type {
  ReportStatus,
  ReportReason,
  RefundStatus,
  DisputeStatus,
} from "@/types/trust.type";

// ── Catalog ──────────────────────────────────────────────────────────────────

export const LISTING_CONDITION_VI: Record<ListingCondition, string> = {
  new: "Mới",
  used: "Đã qua sử dụng",
  damaged: "Hỏng hóc/Lỗi",
};

export const LISTING_STATUS_VI: Record<ListingStatus, string> = {
  draft: "Bản nháp",
  pending: "Chờ duyệt",
  active: "Đang bán",
  hidden: "Đã ẩn",
};

export const PRICE_MODE_VI: Record<PriceMode, string> = {
  fixed: "Giá cố định",
  negotiable: "Có thể thương lượng",
};

export const SHIPPING_PAID_BY_VI: Record<ShippingPaidBy, string> = {
  buyer: "Người mua trả",
  seller: "Người bán trả (Freeship)",
};

// ── Orders ───────────────────────────────────────────────────────────────────

export const ORDER_STATE_VI: Record<OrderState, string> = {
  open: "Đang xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export const ORDER_ITEM_STATE_VI: Record<OrderItemState, string> = {
  pending: "Chờ xử lý",
  confirmed: "Đã xác nhận",
  cancelled: "Đã hủy",
};

export const ORDER_PAYMENT_STATUS_VI: Record<OrderPaymentStatus, string> = {
  pending: "Chờ thanh toán",
  processing: "Đang xử lý",
  success: "Thành công",
  cancelled: "Đã hủy",
  failed: "Thất bại",
};

export const OFFER_STATUS_VI: Record<OfferStatus, string> = {
  active: "Đang chờ",
  accepted: "Đã chấp nhận",
  cancelled: "Đã hủy",
};

// ── Account ──────────────────────────────────────────────────────────────────

export const ACCOUNT_ROLE_VI: Record<AccountRole, string> = {
  user: "Người dùng",
  moderator: "Kiểm duyệt viên",
  admin: "Quản trị viên",
};

export const ACCOUNT_STATUS_VI: Record<AccountStatus, string> = {
  active: "Hoạt động",
  suspended: "Đình chỉ",
};

export const PROFILE_GENDER_VI: Record<ProfileGender, string> = {
  male: "Nam",
  female: "Nữ",
  other: "Khác",
};

export const IDENTITY_DOCUMENT_TYPE_VI: Record<IdentityDocumentType, string> = {
  "national-id": "CCCD/CMND",
  passport: "Hộ chiếu",
  "driver-license": "Bằng lái xe",
};

export const IDENTITY_STATUS_VI: Record<IdentityStatus, string> = {
  pending: "Chờ duyệt",
  verified: "Đã xác thực",
  rejected: "Bị từ chối",
};

// ── Finance ──────────────────────────────────────────────────────────────────

export const TRANSACTION_STATUS_VI: Record<TransactionStatus, string> = {
  pending: "Chờ xử lý",
  success: "Thành công",
  failed: "Thất bại",
};

export const PAYMENT_SESSION_STATUS_VI: Record<PaymentSessionStatus, string> = {
  pending: "Chờ thanh toán",
  processing: "Đang xử lý",
  success: "Thành công",
  cancelled: "Đã hủy",
  failed: "Thất bại",
};

// ── Trust & Safety ───────────────────────────────────────────────────────────

export const REPORT_STATUS_VI: Record<ReportStatus, string> = {
  open: "Mở",
  reviewing: "Đang xem xét",
  actioned: "Đã xử lý",
  dismissed: "Bỏ qua",
};

export const REPORT_REASON_VI: Record<ReportReason, string> = {
  scam: "Lừa đảo",
  counterfeit: "Hàng giả/Nhái",
  prohibited: "Hàng cấm",
  harassment: "Quấy rối",
  spam: "Spam",
  inappropriate: "Không phù hợp",
  other: "Lý do khác",
};

export const REFUND_STATUS_VI: Record<RefundStatus, string> = {
  "awaiting-seller-review": "Chờ người bán xem xét",
  disputed: "Đang tranh chấp",
  accepted: "Đã chấp nhận",
  rejected: "Từ chối",
  cancelled: "Đã hủy",
};

export const DISPUTE_STATUS_VI: Record<DisputeStatus, string> = {
  open: "Đang mở",
  "seller-wins": "Người bán thắng",
  "buyer-wins": "Người mua thắng",
};

/** 
 * Helper function to safely fallback to a default or capitalised value
 * if the key doesn't exist in the dictionary.
 */
export function translateDict<T extends string>(
  dict: Record<string, string>,
  key: T | undefined | null,
  fallback = ""
): string {
  if (!key) return fallback;
  return dict[key] || key.charAt(0).toUpperCase() + key.slice(1);
}
