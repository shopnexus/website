import type { AstroCookies } from 'astro';
import { ApiError, type Api, type Schemas, unwrap } from './api/client';
import { R } from './routes';
import { cookie, secondsUntil } from './session';

// Đăng nhập by email code: the address gets a six-digit code, and the code
// signs in. The challenge between the two steps waits in a short cookie.

const CHALLENGE = 'sn_ch';

export interface Challenge {
  id: string;
  email: string;
  /** When another code may be sent, ISO. */
  resendAt: string;
}

export function readChallenge(cookies: AstroCookies): Challenge | undefined {
  try {
    const c = JSON.parse(cookies.get(CHALLENGE)?.value ?? '') as Challenge;
    return c.id && c.email ? c : undefined;
  } catch {
    return undefined;
  }
}

export function dropChallenge(cookies: AstroCookies) {
  cookies.delete(CHALLENGE, { path: R.login });
}

/** Mails a code to `email` and keeps the challenge for the code step. */
export async function sendEmailCode(api: Api, cookies: AstroCookies, url: URL, raw: string, key: string) {
  const email = raw.trim().toLowerCase();
  const r = await unwrap(api.POST('/v1/auth/email-codes', { params: { header: { 'Idempotency-Key': key } }, body: { email } }));
  const c: Challenge = { id: r.challenge_id, email, resendAt: r.resend_at };
  cookies.set(CHALLENGE, JSON.stringify(c), cookie(url, secondsUntil(r.expires_at), R.login));
}

export function signInWithCode(api: Api, c: Challenge, code: string, key: string, device: string): Promise<Schemas['SignIn']> {
  return unwrap(
    api.POST('/v1/auth/sign-in', {
      params: { header: { 'Idempotency-Key': key } },
      body: { email_code: { challenge_id: c.id, code }, device_name: device },
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

/** The sentence for a failed step; `restart` when the code step is over and a new code is needed. */
export function signInError(e: unknown): { text: string; restart?: boolean } {
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
      return { text: 'Chưa đăng nhập được. Thử lại sau ít phút.' };
  }
}
