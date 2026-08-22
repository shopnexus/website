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
	// Ba luật server giữ ở cả draft, giỏ hàng lẫn thương lượng. Trang tin đăng và hai
	// ô nhập giá đều chặn trước, nên tới được đây là đã đi đường vòng — giỏ hàng cũ,
	// một link mở thẳng, hay người bán đổi giá niêm yết trong lúc bên kia đang gõ.
	// Đúng những lúc đó thì một câu chung chung là câu vô dụng nhất.
	self_purchase: "Bạn không thể mua tin đăng của chính mình.",
	// Đọc được nhưng không mua được: giỏ hàng và đơn cũ vẫn phải hiện ra tin đã gỡ, nên câu
	// này là chỗ duy nhất nói cho người mua biết vì sao nút mua không đi tới đâu.
	listing_not_for_sale: "Tin đăng này không còn được bán.",
	seller_cannot_offer: "Người bán không thể tự đề nghị giá cho tin của mình.",
	offer_above_asking: "Mức giá đề nghị không được cao hơn giá niêm yết.",
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
	// The staff queue's two conflicts. Losing a claim race is normal traffic, not a fault,
	// so it reads as information rather than as an error the moderator caused.
	ticket_not_claimable: "Yêu cầu này đã có người khác tiếp nhận hoặc đã được xử lý xong.",
	ticket_action_invalid: "Hành động xử lý này không hợp lệ cho yêu cầu đó.",

	// ── Hoàn tiền ──────────────────────────────────────────────────────────────
	refund_not_found: "Không tìm thấy yêu cầu hoàn tiền.",
	refund_settled: "Yêu cầu hoàn tiền này đã kết thúc.",
	// Mức mười ảnh tính trên cả vụ việc chứ không phải trên từng lần gửi, nên câu này phải
	// nói ra con số — người mua vừa chọn đủ mười ảnh cho một vụ việc đã có tám thì không tự
	// suy ra được là mình vượt ở đâu.
	too_much_evidence: "Một vụ việc chỉ nhận tối đa 10 ảnh bằng chứng.",
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

	// ── Phiên bản sản phẩm ─────────────────────────────────────────────────────
	duplicate_variant: "Đã có phiên bản khác dùng đúng bộ thuộc tính này. Hãy đổi thuộc tính để phân biệt.",
	too_many_featured: "Chỉ một phiên bản được hiện trên thẻ sản phẩm.",
	no_featured: "Cần chọn một phiên bản để hiện trên thẻ sản phẩm.",
	last_variant: "Đây là phiên bản duy nhất của một tin đăng đang bán, không thể xóa.",
	quantity_below_committed: "Số lượng thấp hơn phần đã giữ cho đơn hoặc đã bán.",
	// ── Khu vực ────────────────────────────────────────────────────────────────
	address_not_geocoded: "Địa chỉ này chưa có toạ độ nên chưa đo được khoảng cách.",

	// ── Các mã trước đây rơi vào câu chung ─────────────────────────────────────
	bank_account_not_found: "Không tìm thấy tài khoản ngân hàng này.",
	bank_account_in_use: "Vẫn còn một lệnh rút tiền về tài khoản này đang xử lý.",
	account_number_invalid: "Số tài khoản chỉ gồm chữ số.",
	bank_code_invalid: "Mã ngân hàng không hợp lệ.",
	payee_unverified: "Cần xác minh danh tính trước khi rút tiền.",
	withdrawal_not_found: "Không tìm thấy lệnh rút tiền này.",
	withdrawal_settled: "Lệnh rút tiền này đã được xử lý.",
	rejection_needs_reason: "Từ chối một lệnh rút tiền thì cần nêu lý do.",
	rejection_reason_required: "Cần nêu lý do khi từ chối.",
	transaction_not_found: "Không tìm thấy giao dịch này.",
	transaction_settled: "Giao dịch này đã hoàn tất.",
	tax_code_invalid: "Mã số thuế gồm 10 chữ số, có thể kèm 3 chữ số chi nhánh.",
	tax_code_taken: "Mã số thuế này đã được một tài khoản khác xác minh.",
	tax_info_not_found: "Bạn chưa đăng ký thông tin thuế.",
	tax_info_settled: "Đăng ký này đã có kết quả; gửi lại nếu muốn khai lại.",
	offer_not_found: "Không tìm thấy cuộc thương lượng này.",
	offer_already_open: "Đang có một cuộc thương lượng mở cho phiên bản này.",
	offer_expired: "Cuộc thương lượng này đã hết hạn.",
	offer_settled: "Cuộc thương lượng này đã kết thúc.",
	offer_not_accepted: "Hai bên chưa chốt mức giá này.",
	not_your_turn: "Đề nghị đang chờ bên kia trả lời.",
	only_buyer_checkout: "Chỉ người mua mới đặt đơn từ mức giá đã chốt.",
	no_variant: "Tin đăng cần ít nhất một phiên bản có giá.",
	no_pickup_address: "Hãy đặt địa chỉ lấy hàng trước khi đăng bán.",
	listing_in_use: "Vẫn còn đơn hàng đang mở cho tin đăng này.",
	listing_not_embedded: "Tin đăng này chưa được lập chỉ mục nên chưa xếp hạng được.",
	suggestion_empty: "Hãy gửi ít nhất một ảnh, một ghi chú hoặc một tin nhắn thoại.",
	suggestion_unusable: "Chưa tạo được gợi ý từ nội dung bạn gửi. Hãy thử lại hoặc tự nhập.",
	voice_note_not_supported: "Bản triển khai này chưa chuyển được giọng nói thành chữ; hãy nhập mô tả.",
	voice_note_too_large: "Tin nhắn thoại dài quá mức cho phép.",
	item_not_cancellable: "Dòng hàng này đã thuộc một đơn hàng.",
	session_paid: "Dòng hàng này đã được trả tiền; hãy dùng hoàn tiền để hoàn tác.",
	confirmation_already_escalated: "Đã yêu cầu nhân viên nhắc người bán cho đơn này.",
	shipment_not_reportable: "Vị trí kiện hàng do đơn vị vận chuyển báo; hãy mở khiếu nại nếu thấy sai.",
	transport_not_found: "Không tìm thấy kiện hàng với mã vận đơn đó.",
	transport_settled: "Kiện hàng đã ở mốc đó hoặc đã qua mốc đó.",
	no_return_leg: "Yêu cầu hoàn tiền này chưa có chặng trả hàng.",
	refund_not_disputed: "Yêu cầu hoàn tiền này không đang chờ nhân viên phân xử.",
	administrative_area_not_found: "Không tìm thấy khu vực này.",
	device_not_found: "Không tìm thấy thiết bị này.",
	feedback_not_found: "Không tìm thấy đánh giá này.",
	conversation_with_support: "Hãy tạo một yêu cầu hỗ trợ để liên hệ bộ phận hỗ trợ.",
	system_message: "Tin nhắn hệ thống không thể sửa hoặc xóa.",
	username_reserved: "Tên đăng nhập này không được phép dùng.",
	too_many_sockets: "Tài khoản đang mở quá nhiều kết nối. Hãy đóng vài tab rồi thử lại.",
	time_zone_unknown: "Múi giờ không hợp lệ.",
	summary_window_invalid: "Khoảng thời gian phải kết thúc sau khi bắt đầu.",
	summary_window_too_wide: "Một báo cáo chỉ bao trọn tối đa một năm.",
	storage_not_readable: "Tệp này được lưu ở nơi khác nên hệ thống không đọc được.",

	// ── Vận hành (chỉ hiện với kiểm duyệt viên và quản trị viên) ───────────────
	moderator_required: "Thao tác này cần quyền kiểm duyệt viên.",
	admin_required: "Thao tác này cần quyền quản trị viên.",
	// The listing queue's two conflicts: another moderator got there first, or the row was
	// never awaiting a decision to begin with.
	not_awaiting_moderation: "Tin đăng này không còn chờ duyệt.",
	invalid_transition: "Tin đăng này không ở trạng thái cho phép thao tác đó.",
	category_name_taken: "Đã có danh mục trùng tên này.",
	category_in_use: "Vẫn còn tin đăng thuộc danh mục này. Hãy chuyển chúng sang danh mục khác trước.",
	// The server takes an advisory lock and walks the tree, so this is a real answer about
	// the tree — not a guess a form could have made before sending.
	category_cycle: "Không thể đặt danh mục này nằm dưới chính nó hoặc dưới một danh mục con của nó.",
}

/** Last resort, for a server failure or an error carrying nothing to show. */
const FALLBACK = "Đã có lỗi xảy ra. Vui lòng thử lại."

/**
 * The sentence a toast shows.
 *
 * Vietnamese when the code is mapped. Otherwise the server's own `message` — English
 * developer text, but it names what actually happened, and a generic sentence in its place
 * left both users and us guessing. A 5xx keeps the generic line: the server's message there
 * describes an internal failure nobody outside can act on.
 *
 * Extend ERROR_MESSAGES when a code shows up in a real flow; the fallback is a stopgap that
 * says something true, not a reason to stop translating.
 */
export function getErrorMessage(error: {
	code?: string
	message?: string
	status?: number
}): string {
	const mapped = error.code ? ERROR_MESSAGES[error.code] : undefined
	if (mapped) return mapped
	if (error.status !== undefined && error.status >= 500) return FALLBACK
	return error.message?.trim() || FALLBACK
}
