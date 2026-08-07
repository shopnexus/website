import type { CreateModeratorRequest } from "@/api/generated/types.gen";

/**
 * A moderator is provisioned, never promoted — the request carries the locale fields an
 * ordinary registration would have collected, so the form has to ask for them. These
 * defaults are the operator's own market, which is what every moderator so far has been.
 */
export const DEFAULT_MODERATOR_FORM: CreateModeratorRequest = {
  name: "",
  email: "",
  password: "",
  country: "VN",
  locale: "vi-VN",
  timezone: "Asia/Ho_Chi_Minh",
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const COUNTRY_RE = /^[A-Z]{2}$/;
const LOCALE_RE = /^[a-z]{2}(-[A-Z]{2})?$/;

/**
 * The rules the server enforces, checked before the request. Not a second source of
 * truth — a mismatch still loses to the 400 — but a staff form that only reveals its
 * password minimum by rejecting the submission wastes a round trip on every new hire.
 */
export function validateModeratorForm(form: CreateModeratorRequest): Record<string, string> {
  const errors: Record<string, string> = {};
  if (!form.name.trim()) errors.name = "Bắt buộc.";
  else if (form.name.trim().length > 100) errors.name = "Tối đa 100 ký tự.";

  if (!EMAIL_RE.test(form.email)) errors.email = "Email không hợp lệ.";
  else if (form.email.length > 255) errors.email = "Tối đa 255 ký tự.";

  if (form.password.length < 8) errors.password = "Ít nhất 8 ký tự.";
  else if (form.password.length > 72) errors.password = "Tối đa 72 ký tự.";

  if (!COUNTRY_RE.test(form.country)) errors.country = "Mã quốc gia 2 chữ in hoa, ví dụ VN.";
  if (!LOCALE_RE.test(form.locale)) errors.locale = "Dạng vi hoặc vi-VN.";
  if (!form.timezone.trim() || form.timezone.length > 64) {
    errors.timezone = "Bắt buộc, tối đa 64 ký tự.";
  }
  return errors;
}
