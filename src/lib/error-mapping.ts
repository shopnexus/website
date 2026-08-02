export const ERROR_MESSAGES: Record<string, string> = {
  // Authentication & Account
  invalid_credentials: "Sai thông tin tài khoản. Vui lòng thử lại.",
  unauthorized: "Vui lòng đăng nhập để tiếp tục.",
  invalid_token: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
  account_suspended: "Tài khoản của bạn đã bị khóa.",
  
  // Generic / Cross-cutting
  validation: "Dữ liệu nhập vào không hợp lệ. Vui lòng kiểm tra lại.",
  bad_request_body: "Dữ liệu gửi lên không hợp lệ.",
  invalid_id: "ID không hợp lệ.",
  not_implemented: "Tính năng này hiện chưa được hỗ trợ.",
  not_found: "Không tìm thấy tài nguyên yêu cầu.",
  conflict: "Dữ liệu đã tồn tại hoặc có xung đột.",
  forbidden: "Bạn không có quyền thực hiện hành động này.",
  
};

export function getErrorMessage(code: string | undefined, defaultMessage: string = "Đã có lỗi xảy ra. Vui lòng thử lại."): string {
  if (!code) return defaultMessage;
  return ERROR_MESSAGES[code] || defaultMessage;
}
