import type { AstroCookies } from 'astro';
import { ApiError, type Api, type Schemas, unwrap } from './api/client';
import { R } from './routes';
import { cookie, secondsUntil } from './session';

// Codes mailed to an address: Đăng nhập signs in with one, Bảo mật adds an
// email or signs in again with one. The challenge between the two steps
// waits in a short cookie on the page that asked.

/** Where a challenge waits: its cookie's name and path. */
export interface CodeFlow {
  name: string;
  path: string;
}

export const SIGN_IN: CodeFlow = { name: 'sn_ch', path: R.login };

export interface Challenge {
  id: string;
  email: string;
  /** When another code may be sent, ISO. */
  resendAt: string;
  /** What the page does once the code is in, for flows with a next step. */
  then?: string;
}

export function readChallenge(cookies: AstroCookies, flow = SIGN_IN): Challenge | undefined {
  try {
    const c = JSON.parse(cookies.get(flow.name)?.value ?? '') as Challenge;
    return c.id && c.email ? c : undefined;
  } catch {
    return undefined;
  }
}

export function dropChallenge(cookies: AstroCookies, flow = SIGN_IN) {
  cookies.delete(flow.name, { path: flow.path });
}

/** Seconds until another code may be sent, 0 when it may now. */
export const resendSeconds = (c: Challenge) => Math.max(0, Math.ceil((Date.parse(c.resendAt) - Date.now()) / 1000));

interface SendOptions {
  flow?: CodeFlow;
  /** A code that adds the address to the caller's account, in place of a sign-in code. */
  mine?: boolean;
  then?: string;
}

/** Mails a code to `raw` and keeps the challenge for the code step. */
export async function sendEmailCode(api: Api, cookies: AstroCookies, url: URL, raw: string, key: string, { flow = SIGN_IN, mine = false, then }: SendOptions = {}) {
  const email = raw.trim().toLowerCase();
  const init = { params: { header: { 'Idempotency-Key': key } }, body: { email } };
  const r = await unwrap(mine ? api.POST('/v1/accounts/me/email-codes', init) : api.POST('/v1/auth/email-codes', init));
  const c: Challenge = { id: r.challenge_id, email, resendAt: r.resend_at, then };
  cookies.set(flow.name, JSON.stringify(c), cookie(url, secondsUntil(r.expires_at), flow.path));
}

/** The proof a typed code makes, for sign-in, reauthentication or a new identity. */
export const emailProof = (c: Challenge, code: string) => ({ email_code: { challenge_id: c.id, code: code.replace(/\D/g, '') } });

export function signInWithCode(api: Api, c: Challenge, code: string, key: string, device: string): Promise<Schemas['SignIn']> {
  return unwrap(
    api.POST('/v1/auth/sign-in', {
      params: { header: { 'Idempotency-Key': key } },
      body: { ...emailProof(c, code), device_name: device },
    }),
  );
}

/** "Chrome trên Windows", for the list of signed-in devices. */
export function deviceName(ua: string | null) {
  const s = ua ?? '';
  const browser = /Edg\//.test(s) ? 'Edge' : /OPR\//.test(s) ? 'Opera' : /Firefox\//.test(s) ? 'Firefox' : /Chrome\//.test(s) ? 'Chrome' : /Safari\//.test(s) ? 'Safari' : 'Trình duyệt';
  const os = /Android/.test(s) ? 'Android' : /iPhone|iPad/.test(s) ? 'iOS' : /Windows/.test(s) ? 'Windows' : /Mac OS X/.test(s) ? 'macOS' : /Linux/.test(s) ? 'Linux' : '';
  return os ? `${browser} trên ${os}` : browser;
}

/** The sentence for a failed code step; `restart` when the code is spent and a new one is needed. */
export function codeError(e: unknown, fallback = 'Chưa đăng nhập được. Thử lại sau ít phút.'): { text: string; restart?: boolean } {
  if (!(e instanceof ApiError)) return { text: 'Chưa kết nối được. Thử lại sau ít phút.' };
  const wait = e.details?.retry_after;
  switch (e.code) {
    case 'invalid_email':
      return { text: 'Email này chưa đúng.' };
    case 'otp_too_soon':
      return { text: `Chờ ${wait ?? 45} giây rồi gửi lại mã.` };
    case 'otp_limit':
      return { text: `Bạn đã xin mã nhiều lần. Thử lại sau ${Math.ceil((wait ?? 3600) / 60)} phút.` };
    case 'invalid_code':
      return { text: `Mã chưa đúng. Còn ${e.details?.attempts_left ?? 1} lần thử.` };
    case 'code_expired':
      return { text: 'Mã đã hết hạn. Gửi mã mới nhé.', restart: true };
    case 'code_locked':
      return { text: 'Sai mã quá nhiều lần. Gửi mã mới nhé.', restart: true };
    case 'account_suspended':
      return { text: 'Tài khoản này đang bị khóa.' };
    default:
      return { text: fallback };
  }
}
