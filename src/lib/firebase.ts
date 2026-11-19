import type { Auth, ConfirmationResult, RecaptchaVerifier } from 'firebase/auth';

// In the browser: Firebase Auth proves a Google account or a phone number,
// and the page posts the proof to this site, which signs in with the server.
// The SDK loads on first use, only on the pages that ask for it.

const CONFIG = {
  apiKey: 'AIzaSyDPvHRO5LiwnsxKXaujtZSnAc8gQDVRZfY',
  authDomain: 'shopnexus-26aca.firebaseapp.com',
  projectId: 'shopnexus-26aca',
  appId: '1:5362373878:web:937000112e3b0db4c5c8d7',
};

type Sdk = typeof import('firebase/auth');
let loading: Promise<{ sdk: Sdk; auth: Auth }> | undefined;
let loaded: { sdk: Sdk; auth: Auth } | undefined;

/** Loads the SDK once. */
export function loadFirebase() {
  loading ??= Promise.all([import('firebase/app'), import('firebase/auth')]).then(([app, sdk]) => {
    // In memory only: the server's session is the one that lasts.
    const auth = sdk.initializeAuth(app.initializeApp(CONFIG), {
      persistence: sdk.inMemoryPersistence,
      popupRedirectResolver: sdk.browserPopupRedirectResolver,
    });
    auth.languageCode = 'vi';
    loaded = { sdk, auth };
    return loaded;
  });
  loading.catch(() => (loading = undefined));
  return loading;
}

/** Whether the SDK is in, so Google's popup can open inside the click. */
export const firebaseReady = () => !!loaded;

/**
 * The Google ID token of the account picked in Google's popup. Call it from
 * the click once firebaseReady(): the popup opens before the first await.
 */
export async function googleToken(): Promise<string> {
  if (!loaded) throw Object.assign(new Error('Firebase not loaded'), { code: 'auth/network-request-failed' });
  const { sdk, auth } = loaded;
  const result = await sdk.signInWithPopup(auth, new sdk.GoogleAuthProvider());
  const token = sdk.GoogleAuthProvider.credentialFromResult(result)?.idToken;
  await sdk.signOut(auth);
  if (!token) throw Object.assign(new Error('no Google ID token'), { code: 'auth/internal-error' });
  return token;
}

let verifier: RecaptchaVerifier | undefined;

/**
 * Texts a code to `e164`, after an invisible reCAPTCHA. The answer's
 * `confirm` takes the code and gives Firebase's ID token for the number.
 */
export async function sendPhoneCode(e164: string) {
  const { sdk, auth } = await loadFirebase();
  // A verifier works for one send; a fresh box for each, at the end of the page.
  verifier?.clear();
  document.querySelector('[data-recaptcha]')?.remove();
  const box = document.createElement('div');
  box.dataset.recaptcha = '';
  document.body.append(box);
  verifier = new sdk.RecaptchaVerifier(auth, box, { size: 'invisible' });
  let sent: ConfirmationResult;
  try {
    sent = await sdk.signInWithPhoneNumber(auth, e164, verifier);
  } catch (e) {
    verifier.clear();
    verifier = undefined;
    throw e;
  }
  return {
    async confirm(code: string) {
      const { user } = await sent.confirm(code);
      const token = await user.getIdToken();
      await sdk.signOut(auth);
      return token;
    },
  };
}

/** What to say for a Firebase error; null when the buyer closed the popup. */
export function firebaseError(e: unknown): string | null {
  switch ((e as { code?: string } | null)?.code ?? '') {
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
    case 'auth/user-cancelled':
      return null;
    case 'auth/popup-blocked':
      return 'Trình duyệt đã chặn cửa sổ Google. Cho phép cửa sổ bật lên rồi thử lại.';
    case 'auth/invalid-verification-code':
    case 'auth/missing-verification-code':
      return 'Mã chưa đúng. Xem lại tin nhắn rồi nhập lại.';
    case 'auth/code-expired':
      return 'Mã đã hết hạn. Gửi mã mới nhé.';
    case 'auth/too-many-requests':
    case 'auth/quota-exceeded':
      return 'Bạn đã thử nhiều lần. Thử lại sau ít phút.';
    case 'auth/invalid-phone-number':
    case 'auth/missing-phone-number':
      return 'Số điện thoại chưa đúng.';
    case 'auth/network-request-failed':
      return 'Chưa kết nối được. Kiểm tra mạng rồi thử lại.';
    case 'auth/captcha-check-failed':
    case 'auth/invalid-app-credential':
    case 'auth/missing-app-credential':
      return 'Chưa xác minh được trình duyệt. Tải lại trang rồi thử lại.';
    case 'auth/operation-not-allowed':
    case 'auth/unauthorized-domain':
      return 'Cách đăng nhập này đang tạm tắt. Bạn dùng email nhé.';
    default:
      return 'Chưa đăng nhập được. Thử lại sau ít phút.';
  }
}
