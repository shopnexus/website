// The server's refusals in chat and deals, as Tin nhắn and Chat nhanh say
// them. No server imports, so the page scripts can use it too.

const ERRORS: Record<string, string> = {
  phone_required: 'Nhắn tin và trả giá cần số điện thoại trong tài khoản.',
  blocked: 'Không nhắn được vì có lệnh chặn giữa hai bạn.',
  account_suspended: 'Tài khoản của bạn đang bị tạm khóa.',
  account_deleted: 'Người này đã xóa tài khoản.',
  listing_unavailable: 'Tin này không còn bán.',
  listing_not_found: 'Không tìm thấy tin này.',
  own_listing: 'Đây là tin của bạn.',
  deal_changed: 'Người kia vừa có thay đổi. Xem lại rồi làm tiếp nhé.',
  price_changed: 'Giá vừa đổi. Xem lại giá mới nhé.',
  move_not_allowed: 'Bước này không làm được nữa.',
  invalid_amount: 'Giá trả cần chẵn nghìn và trong khoảng cho phép.',
  invalid_message: 'Tin nhắn cần từ 1 đến 1.000 ký tự.',
  invalid_upload: 'Ảnh chưa tải lên xong hoặc không dùng được. Chọn lại ảnh nhé.',
  account_is_system: 'Không chặn hay báo cáo ShopNexus được.',
  conversation_not_found: 'Không tìm thấy cuộc trò chuyện này.',
  deal_not_found: 'Không tìm thấy giao dịch này.',
  conversation_is_support: 'Cuộc trò chuyện hỗ trợ luôn ở trong Tin nhắn.',
};

/** A server code as a sentence; an unknown one is the general failure. */
export const errorText = (code: string) => ERRORS[code] ?? 'Chưa làm được. Thử lại sau ít phút.';
