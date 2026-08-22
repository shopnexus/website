import type {
  AccountRole,
  AccountStatus,
  IdentityDocumentType,
  IdentityStatus,
  ListingCondition,
  ListingHistoryCode,
  ListingStatus,
  NotificationCategory,
  NotificationChannel,
  OfferStatus,
  OrderState,
  PaymentSessionStatus,
  PriceMode,
  ProfileGender,
  ShelfReason,
  RefundStatus,
  TaxCodeType,
  TaxVerificationStatus,
  TicketAction,
  TicketKind,
  TicketReason,
  TicketStatus,
  TransactionStatus,
  TransportStatus,
  WalletTransactionKind,
  WithdrawalOutcome,
} from "@/api/generated/types.gen";

/**
 * Vietnamese labels for the API's enums.
 *
 * Every map is typed `Record<Enum, string>`, so adding a value to an enum in the spec
 * breaks the build here rather than rendering a raw slug like `awaiting-buyer-action` to
 * a shopper. That is the whole point of keying on the generated union: three maps in the
 * previous version had drifted — an offer could be `checked-out` and a refund could be
 * `returning`, `returned` or `awaiting-buyer-action`, and none of those had a label.
 */

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

/**
 * What each entry in a listing's trail says, written from the reader's side: the subject
 * is whoever acted, which the timeline puts in front of the label.
 *
 * `listing.edit` and `listing.edit_submitted` are the same edit under different
 * circumstances — written straight through, or held because buyers were already looking
 * at the listing — and the labels have to keep them apart, since only one of them means
 * the change is live.
 */
export const LISTING_HISTORY_CODE_VI: Record<ListingHistoryCode, string> = {
  "listing.create": "đã tạo tin đăng",
  "listing.edit": "đã chỉnh sửa",
  "listing.edit_submitted": "đã gửi chỉnh sửa chờ duyệt",
  "listing.publish": "đã gửi tin đăng đi duyệt",
  "listing.approve": "đã duyệt tin đăng",
  "listing.takedown": "đã gỡ tin đăng",
  "listing.hide": "đã ẩn tin đăng",
  "listing.variant_added": "đã thêm một phiên bản",
  "listing.variant_edited": "đã sửa một phiên bản",
  "listing.variant_removed": "đã xoá một phiên bản",
  "listing.delete": "đã xoá tin đăng",
};

/**
 * The field names the trail records, in the words the form beside it uses. Both halves are
 * here — a listing's own fields and a variant's — because one timeline shows both and a
 * reader does not care which table a price lives in.
 */
export const LISTING_FIELD_VI: Record<string, string> = {
  name: "Tên",
  description: "Mô tả",
  category_id: "Danh mục",
  condition: "Tình trạng",
  price_mode: "Kiểu giá",
  specifications: "Thông số",
  attachments: "Hình ảnh",
  tags: "Thẻ",
  price: "Giá",
  attributes: "Thuộc tính",
  package_details: "Đóng gói",
  quantity: "Số lượng kho",
  is_featured: "Phiên bản hiển thị",
};

// ── Orders ───────────────────────────────────────────────────────────────────

export const ORDER_STATE_VI: Record<OrderState, string> = {
  "awaiting-confirmation": "Chờ người bán xác nhận",
  open: "Đang xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export const TRANSPORT_STATUS_VI: Record<TransportStatus, string> = {
  pending: "Chờ lấy hàng",
  "picked-up": "Đã lấy hàng",
  "in-transit": "Đang vận chuyển",
  delivered: "Đã giao",
  returned: "Đã hoàn về",
  failed: "Giao thất bại",
  cancelled: "Đã hủy",
};

export const OFFER_STATUS_VI: Record<OfferStatus, string> = {
  active: "Đang chờ",
  accepted: "Đã chấp nhận",
  "checked-out": "Đã thanh toán",
  cancelled: "Đã hủy",
};

// ── Account ──────────────────────────────────────────────────────────────────

export const ACCOUNT_ROLE_VI: Record<AccountRole, string> = {
  user: "Người dùng",
  moderator: "Kiểm duyệt viên",
  admin: "Quản trị viên",
  support: "Bộ phận hỗ trợ",
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

// ── Notifications ────────────────────────────────────────────────────────────

export const NOTIFICATION_CATEGORY_VI: Record<NotificationCategory, string> = {
  order: "Đơn hàng",
  promotion: "Khuyến mãi",
  system: "Hệ thống",
  chat: "Tin nhắn",
  social: "Cộng đồng",
};

export const NOTIFICATION_CHANNEL_VI: Record<NotificationChannel, string> = {
  "in-app": "Trong ứng dụng",
  push: "Thông báo đẩy",
  email: "Email",
  sms: "SMS",
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

/**
 * A withdrawal carries two states: `outcome` is the moderator's decision and `status` is
 * where the money got to on the rail. They are separate because an approved withdrawal
 * can still fail to pay out.
 */
export const WITHDRAWAL_OUTCOME_VI: Record<WithdrawalOutcome, string> = {
  "awaiting-review": "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Bị từ chối",
  cancelled: "Đã hủy",
};

/**
 * What moved a wallet balance. Named from the owner's side rather than the ledger's:
 * `escrow-hold` is money of theirs the platform is holding, not an operation performed
 * on a table.
 */
export const WALLET_TRANSACTION_KIND_VI: Record<WalletTransactionKind, string> = {
  topup: "Nạp tiền",
  "escrow-hold": "Tạm giữ cho đơn hàng",
  "escrow-release": "Giải ngân từ tạm giữ",
  payout: "Tiền bán hàng",
  refund: "Hoàn tiền",
  withdrawal: "Rút tiền",
  fee: "Phí",
  adjustment: "Điều chỉnh",
};

export const TAX_CODE_TYPE_VI: Record<TaxCodeType, string> = {
  individual: "Cá nhân",
  business: "Doanh nghiệp",
  household: "Hộ kinh doanh",
};

export const TAX_VERIFICATION_STATUS_VI: Record<TaxVerificationStatus, string> = {
  pending: "Chờ xác minh",
  verified: "Đã xác minh",
  rejected: "Bị từ chối",
};

// ── Trust & Safety ───────────────────────────────────────────────────────────

export const TICKET_STATUS_VI: Record<TicketStatus, string> = {
  open: "Chờ tiếp nhận",
  reviewing: "Đang xử lý",
  resolved: "Đã xử lý",
};

/**
 * What the requester raised. One surface covers abuse reports, refund disputes, order and
 * payment problems and plain support requests, so the kind is the only thing that differs
 * between them — including whether the form asks for a reason and for a `ref_id`.
 */
export const TICKET_KIND_VI: Record<TicketKind, string> = {
  "report-listing": "Báo cáo tin đăng",
  "report-account": "Báo cáo người dùng",
  "report-message": "Báo cáo tin nhắn",
  "report-review": "Báo cáo đánh giá",
  "report-review-reply": "Báo cáo phản hồi đánh giá",
  "refund-dispute": "Khiếu nại hoàn tiền",
  "order-issue": "Sự cố đơn hàng",
  payment: "Vấn đề thanh toán",
  account: "Vấn đề tài khoản",
  "feature-request": "Góp ý tính năng",
  other: "Vấn đề khác",
};

/** What staff did about it. `none` is a ticket answered with nothing done, not a status. */
export const TICKET_ACTION_VI: Record<TicketAction, string> = {
  none: "Không có hành động",
  "listing-removed": "Đã gỡ tin đăng",
  "message-removed": "Đã gỡ tin nhắn",
  "account-suspended": "Đã khoá tài khoản",
  warning: "Đã cảnh báo",
  "refund-granted": "Đã chấp nhận hoàn tiền",
  "refund-refused": "Đã từ chối hoàn tiền",
};

export const TICKET_REASON_VI: Record<TicketReason, string> = {
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
  returning: "Đang hoàn hàng",
  returned: "Đã hoàn hàng",
  accepted: "Đã chấp nhận",
  rejected: "Từ chối",
  cancelled: "Đã hủy",
};

// ── Home shelves ─────────────────────────────────────────────────────────────

/**
 * What each shelf on the home page says it is.
 *
 * The server sends a `reason` and, where the reason is about something, a `subject` — never a
 * title. That split is deliberate and it is why this map exists: a Vietnamese sentence composed
 * on the server would be the one string a second language could not translate, and the reason
 * is an enum like every other one localised in this file.
 *
 * `interest` and `because-you-viewed` need the subject's name, so they are written as templates
 * rather than as labels. A shelf whose subject is missing is not rendered with a hole in its
 * title — see shelfTitle.
 */
export const SHELF_REASON_VI: Record<ShelfReason, (subject?: string) => string> = {
  interest: (subject) => `Vì bạn thích ${subject}`,
  "because-you-viewed": (subject) => `Tương tự “${subject}”`,
  trending: () => "Đang được quan tâm",
  "best-selling": () => "Bán chạy nhất",
  "top-rated": () => "Được đánh giá cao",
  newest: () => "Vừa lên sàn",
};

/**
 * The shelf's heading.
 *
 * A reason that needs a subject and has none falls back to the generic line rather than
 * rendering "Vì bạn hay xem undefined" — the server drops such a shelf, so this is the second
 * line of defence rather than the first.
 */
export function shelfTitle(reason: ShelfReason, subject?: string): string {
  const needsSubject = reason === "interest" || reason === "because-you-viewed";
  if (needsSubject && !subject) return "Gợi ý cho bạn";
  return SHELF_REASON_VI[reason](subject);
}

/**
 * Read a label, falling back to a capitalised form of the key.
 *
 * Only for the places that hold a value the API typed as a bare string — a transport
 * option's slug, say. A value from one of the enums above is already exhaustive and
 * should be indexed directly, so a missing label is a compile error.
 */
export function translateDict<T extends string>(
  dict: Record<string, string>,
  key: T | undefined | null,
  fallback = ""
): string {
  if (!key) return fallback;
  return dict[key] || key.charAt(0).toUpperCase() + key.slice(1);
}
