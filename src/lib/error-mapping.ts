/**
 * Server error code → Vietnamese UI string.
 *
 * The server's own `message` is explicitly not a UI string — the OpenAPI document says
 * so — it is English developer text meant for logs. So the code is what we translate,
 * and an unmapped code falls back to a generic sentence rather than showing a shopper
 * "purchase session not found".
 *
 * Codes come from `internal/shared/errx` (cross-cutting) and each module's
 * `domain/errors.go`. The server defines around 190; mapped here are the ones reachable
 * from the flows this app actually has. Extend it when a flow is added rather than
 * pre-translating the admin surface.
 */
export const ERROR_MESSAGES: Record<string, string> = {
	// ── Cross-cutting (shared/errx) ────────────────────────────────────────────
	unauthorized: "Vui lòng đăng nhập để tiếp tục.",
	invalid_token: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
	forbidden: "Bạn không có quyền thực hiện hành động này.",
	validation: "Dữ liệu nhập vào không hợp lệ. Vui lòng kiểm tra lại.",
	bad_request_body: "Dữ liệu gửi lên không hợp lệ.",
	invalid_id: "Liên kết không hợp lệ hoặc đã hỏng.",
	not_found: "Không tìm thấy nội dung bạn yêu cầu.",
	conflict: "Dữ liệu đã tồn tại hoặc đang xung đột.",
	not_implemented: "Tính năng này hiện chưa được hỗ trợ.",
	internal: "Hệ thống đang gặp sự cố. Vui lòng thử lại sau ít phút.",
	too_many_requests: "Bạn thao tác hơi nhanh. Vui lòng đợi một chút rồi thử lại.",

	// ── Client-side, produced by src/api/api-error.ts ──────────────────────────
	network: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra đường truyền mạng.",

	// ── Đăng nhập, đăng ký, mật khẩu ───────────────────────────────────────────
	invalid_credentials: "Sai tài khoản hoặc mật khẩu. Vui lòng thử lại.",
	account_not_found: "Tài khoản không tồn tại.",
	account_suspended: "Tài khoản của bạn đã bị khoá.",
	identifier_taken: "Email, số điện thoại hoặc tên đăng nhập này đã được sử dụng.",
	no_identifier: "Cần ít nhất một trong: email, số điện thoại hoặc tên đăng nhập.",
	no_password: "Tài khoản này đăng nhập qua nhà cung cấp bên ngoài và chưa đặt mật khẩu.",
	no_email: "Tài khoản này chưa có email.",
	invalid_reset_token: "Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.",
	invalid_verification_token: "Liên kết xác minh không hợp lệ hoặc đã hết hạn.",
	invalid_session: "Phiên đăng nhập không hợp lệ.",
	session_not_found: "Phiên đăng nhập không tồn tại.",
	email_already_verified: "Email này đã được xác minh.",
	last_sign_in_method: "Đây là cách đăng nhập duy nhất còn lại, không thể gỡ bỏ.",
	oauth_rejected: "Nhà cung cấp đã từ chối thông tin đăng nhập này.",
	oauth_unknown_provider: "Nhà cung cấp đăng nhập này không được hỗ trợ.",
	oauth_identity_not_found: "Không tìm thấy liên kết với nhà cung cấp này.",
	version_conflict: "Thông tin vừa thay đổi ở nơi khác. Vui lòng tải lại và thử lại.",

	// ── Địa chỉ liên hệ ────────────────────────────────────────────────────────
	contact_not_found: "Không tìm thấy địa chỉ này.",
	contact_phone_already_verified: "Số điện thoại này đã được xác minh.",
	invalid_phone_code: "Mã xác minh sai, đã hết hạn hoặc đã được dùng.",
	no_delivery_contact: "Bạn chưa có địa chỉ nhận hàng mặc định.",
	no_pickup_contact: "Người bán chưa có địa chỉ lấy hàng.",

	// ── Xác minh danh tính ─────────────────────────────────────────────────────
	identity_document_not_found: "Không tìm thấy giấy tờ này.",
	identity_already_verified: "Tài khoản của bạn đã được xác minh.",
	identity_already_decided: "Giấy tờ này đã có kết quả duyệt.",
	identity_required: "Cần xác minh danh tính trước khi bán hàng.",
	identity_expiry_required: "Loại giấy tờ này có hạn sử dụng, vui lòng nhập ngày hết hạn.",
	scan_unavailable: "Không đọc được ảnh chụp giấy tờ. Vui lòng tải lên lại.",

	// ── Tệp tải lên ────────────────────────────────────────────────────────────
	mime_not_allowed: "Định dạng tệp này không được chấp nhận.",
	upload_too_large: "Tệp vượt quá dung lượng cho phép.",
	upload_not_completed: "Tệp chưa được tải lên hoàn tất.",
	attachment_not_found: "Không tìm thấy tệp đính kèm.",
	resource_not_found: "Không tìm thấy tệp.",

	// ── Sản phẩm ───────────────────────────────────────────────────────────────
	listing_not_found: "Sản phẩm không tồn tại hoặc đã bị gỡ.",
	variant_not_found: "Phiên bản sản phẩm không tồn tại.",
	category_not_found: "Không tìm thấy danh mục.",
	tag_not_found: "Không tìm thấy thẻ.",
	slug_taken: "Đã có sản phẩm trùng tên này.",
	insufficient_stock: "Số lượng trong kho không đủ.",
	quantity_positive: "Số lượng phải lớn hơn 0.",
	too_many_tags: "Một sản phẩm chỉ gắn được tối đa 10 thẻ.",
	authentication_required: "Vui lòng đăng nhập để dùng bộ lọc này.",

	// ── Giỏ hàng và thanh toán ─────────────────────────────────────────────────
	cart_item_not_found: "Sản phẩm này không còn trong giỏ hàng.",
	draft_not_found: "Phiên mua hàng không tồn tại hoặc đã kết thúc.",
	draft_expired: "Phiên mua hàng đã hết hạn. Vui lòng đặt lại.",
	draft_settled: "Phiên mua hàng này đã được thanh toán hoặc đã huỷ.",
	price_moved: "Giá sản phẩm đã thay đổi. Vui lòng kiểm tra lại trước khi thanh toán.",
	checkout_empty: "Không có sản phẩm nào để thanh toán.",
	currency_mismatch: "Đơn vị tiền tệ không khớp với sản phẩm.",
	variant_not_in_draft: "Phiên bản này không nằm trong phiên mua hàng.",
	fixed_price_listing: "Sản phẩm này không hỗ trợ thương lượng giá.",
	carrier_unknown: "Đơn vị vận chuyển không khả dụng.",
	quote_source_invalid: "Không xác định được đơn cần tính phí vận chuyển.",
	carrier_down: "Đơn vị vận chuyển không phản hồi. Vui lòng thử lại.",
	shipping_quote_invalid: "Không tính được phí vận chuyển cho địa chỉ này.",
	payment_option_unknown: "Phương thức thanh toán không khả dụng.",
	// The row exists but this deployment has no implementation behind it — an operator's
	// problem, not the buyer's, so it does not tell them to change anything.
	option_provider_unknown: "Phương thức này đang tạm ngưng. Vui lòng chọn phương thức khác.",
	option_not_found: "Không tìm thấy tuỳ chọn này.",
	option_category_unknown: "Không có nhóm tuỳ chọn này.",
	option_category_required: "Thiếu nhóm tuỳ chọn cần đọc.",

	// ── Đơn hàng ───────────────────────────────────────────────────────────────
	order_not_found: "Không tìm thấy đơn hàng.",
	order_settled: "Đơn hàng này đã hoàn tất hoặc đã huỷ.",
	order_not_cancellable: "Đơn hàng đã được giao đi, không thể huỷ.",
	order_not_completed: "Chỉ đánh giá được đơn hàng đã hoàn tất.",
	order_not_finished: "Đơn hàng này chưa kết thúc.",
	not_a_party: "Bạn không liên quan đến đơn hàng này.",
	not_the_buyer: "Chỉ người mua của đơn hàng này mới thực hiện được.",
	not_the_seller: "Chỉ người bán của đơn hàng này mới thực hiện được.",
	receipt_already_confirmed: "Đơn hàng này đã được xác nhận nhận hàng.",
	receipt_needs_evidence: "Cần ít nhất một ảnh hoặc video để xác nhận nhận hàng.",
	item_not_found: "Không tìm thấy sản phẩm trong đơn.",

	// ── Đánh giá ───────────────────────────────────────────────────────────────
	review_not_found: "Không tìm thấy đánh giá.",
	review_exists: "Bạn đã đánh giá sản phẩm này cho đơn hàng đó.",
	review_rating_range: "Số sao phải từ 1 đến 5.",
	review_body_too_long: "Nội dung đánh giá tối đa 2000 ký tự.",
	review_forbidden: "Bạn không có quyền sửa đánh giá này.",
	listing_not_in_order: "Đơn hàng bạn chọn không có sản phẩm này.",
	review_reply_not_found: "Không tìm thấy phản hồi này.",
	review_reply_forbidden: "Bạn không có quyền xoá phản hồi này.",
	vote_value: "Bình chọn chỉ nhận giá trị hữu ích hoặc không hữu ích.",
	self_vote: "Không thể bình chọn đánh giá của chính mình.",
	vote_not_found: "Bạn chưa bình chọn đánh giá này.",
	feedback_exists: "Bạn đã đánh giá phía bên kia cho đơn hàng này.",
	self_feedback: "Không thể tự đánh giá chính mình.",

	// ── Yêu cầu hỗ trợ (ticket) ────────────────────────────────────────────────
	ticket_not_found: "Không tìm thấy yêu cầu hỗ trợ này.",
	ticket_target_not_found: "Nội dung bạn muốn báo cáo không còn tồn tại.",
	ticket_exists: "Bạn đã có một yêu cầu đang mở về nội dung này.",
	ticket_resolved: "Yêu cầu này đã được xử lý xong.",
	ticket_ref_required: "Loại yêu cầu này cần chỉ rõ nội dung liên quan.",
	ticket_ref_unexpected: "Loại yêu cầu này không gắn với nội dung nào cụ thể.",
	ticket_reason_mismatch: "Lý do chỉ dùng cho các yêu cầu báo cáo.",
	ticket_decided_elsewhere: "Yêu cầu này được xử lý khi bộ phận hỗ trợ quyết định việc hoàn tiền.",

	// ── Hoàn tiền ──────────────────────────────────────────────────────────────
	refund_not_found: "Không tìm thấy yêu cầu hoàn tiền.",
	refund_settled: "Yêu cầu hoàn tiền này đã kết thúc.",
	refund_already_open: "Đơn hàng này đã có một yêu cầu hoàn tiền đang mở.",
	refund_not_escalatable: "Yêu cầu hoàn tiền này chưa thể chuyển cho bộ phận hỗ trợ.",
	refund_not_due: "Chưa đến lúc thực hiện bước này của yêu cầu hoàn tiền.",
	not_awaiting_seller: "Yêu cầu hoàn tiền không còn chờ người bán phản hồi.",
	not_awaiting_buyer: "Yêu cầu hoàn tiền không còn chờ người mua phản hồi.",
	// A seller cannot refuse a refund any more, so `rejection_needs_reason` is gone. These are the
	// codes the seller-confirmation step added.
	order_not_confirmed: "Người bán chưa xác nhận đơn này.",
	order_already_confirmed: "Đơn này đã được xác nhận.",
	decline_needs_reason: "Cần nêu lý do khi từ chối đơn.",

	// ── Theo dõi và nhắn tin ───────────────────────────────────────────────────
	self_follow: "Không thể tự theo dõi chính mình.",
	conversation_not_found: "Không tìm thấy cuộc trò chuyện.",
	self_conversation: "Không thể nhắn tin cho chính mình.",
	not_a_participant: "Bạn không thuộc cuộc trò chuyện này.",
	empty_message: "Tin nhắn cần có nội dung hoặc tệp đính kèm.",
	message_not_found: "Không tìm thấy tin nhắn.",
	message_redacted: "Tin nhắn này đã bị thu hồi.",
	not_the_sender: "Chỉ người gửi mới sửa được tin nhắn này.",

	// ── Ví và thanh toán ───────────────────────────────────────────────────────
	insufficient_balance: "Số dư trong ví không đủ.",
	wallet_not_found: "Không tìm thấy ví.",
	payment_session_not_found: "Không tìm thấy phiên thanh toán.",
	payment_session_expired: "Phiên thanh toán đã hết hạn.",
	payment_session_settled: "Phiên thanh toán này đã được xử lý.",
	payment_session_not_payable: "Phiên thanh toán này không ở trạng thái có thể thanh toán.",
	return_url_not_allowed: "Đường dẫn quay lại không được chấp nhận.",
	finance_unreachable: "Hệ thống thanh toán đang bận. Vui lòng thử lại sau.",
	catalog_unavailable: "Không tải được dữ liệu sản phẩm. Vui lòng thử lại.",
}

/** Generic fallback. Never surfaces the server's English developer message. */
const FALLBACK = "Đã có lỗi xảy ra. Vui lòng thử lại."

export function getErrorMessage(code: string | undefined): string {
	if (!code) return FALLBACK
	return ERROR_MESSAGES[code] ?? FALLBACK
}
