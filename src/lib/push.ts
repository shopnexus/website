import { animate } from 'motion';
import { SPRING, reducedMotion } from './motion';
import { API } from './routes';

// Browser notifications. /sw.js shows the pushes; Firebase Messaging gives
// this browser's token, which /api/push-token hands to the server for the
// session. PushOffer.astro offers them after a chat message or an order,
// Thông báo's settings switch them, and both hide without a Web Push key.

/** The cookie /api/push-token sets for a day once the session has the token; signing out drops it (session.ts). */
export const PUSH_COOKIE = 'sn_push_sent';
/** This browser's own choice, in localStorage: off once switched off here, later once the offer was put off. */
const OFF = 'sn_push_off';
const LATER = 'sn_push_later';

const stored = (k: string) => {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
};
const store = (k: string, on: boolean) => {
  try {
    if (on) localStorage.setItem(k, '1');
    else localStorage.removeItem(k);
  } catch {}
};

/** The site's Web Push key, which PushOffer.astro puts on a signed-in page. */
const key = () => document.querySelector<HTMLElement>('[data-push-key]')?.dataset.pushKey ?? '';

/** Whether this page can offer pushes: signed in, the site has a key, the browser takes web push. */
export const pushable = () => !!key() && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;

type PushState = 'on' | 'off' | 'blocked';

export function pushState(): PushState {
  if (Notification.permission === 'denied') return 'blocked';
  return Notification.permission === 'granted' && !stored(OFF) ? 'on' : 'off';
}

/**
 * Hands this browser's ID to the server for the session: the Firebase
 * Installation ID, which FCM takes in the message's token field.
 */
async function register() {
  const reg = await navigator.serviceWorker.register('/sw.js');
  const [{ firebaseApp }, sdk] = await Promise.all([import('./firebase'), import('firebase/messaging')]);
  const messaging = sdk.getMessaging(await firebaseApp());
  const fid = new Promise<string>((resolve) => {
    const stop = sdk.onRegistered(messaging, (id) => {
      stop();
      resolve(id);
    });
  });
  await sdk.register(messaging, { vapidKey: key(), serviceWorkerRegistration: reg });
  const token = await fid;
  const res = await fetch(API.pushToken, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ token }) });
  if (!res.ok) throw new Error(`push token: ${res.status}`);
}

/** Asks the browser, then registers. False when the buyer did not allow it; a failure leaves it off. */
export async function enablePush() {
  if ((await Notification.requestPermission()) !== 'granted') return false;
  store(OFF, false);
  try {
    await register();
  } catch (e) {
    store(OFF, true);
    throw e;
  }
  return true;
}

/** Takes the token back from the server and drops this browser's subscription. */
export async function disablePush() {
  const res = await fetch(API.pushToken, { method: 'DELETE' });
  if (!res.ok) throw new Error(`push token: ${res.status}`);
  store(OFF, true);
  const reg = await navigator.serviceWorker.getRegistration('/');
  await (await reg?.pushManager.getSubscription())?.unsubscribe();
}

/** On every signed-in page: registers again when the cookie is gone, after a new sign-in or a day. */
export function syncPush() {
  if (!pushable() || pushState() !== 'on' || document.cookie.split('; ').some((c) => c.startsWith(`${PUSH_COOKIE}=`))) return;
  register().catch(() => {});
}

/** Whether to offer pushes now: never asked here, and the offer not put off. */
const offerable = () => pushable() && Notification.permission === 'default' && !stored(OFF) && !stored(LATER);

/** "Để sau": the offer does not come back in this browser; the settings switch stays. */
export const putOffOffer = () => store(LATER, true);

/**
 * Shows PushOffer.astro's card, with its line for `reason`, when the moment
 * fits: the buyer just sent a message or placed an order.
 */
export function offerPush(reason: 'chat' | 'order') {
  const card = document.querySelector<HTMLElement>('[data-push-offer]');
  if (!card?.hidden || !offerable()) return;
  card.querySelectorAll<HTMLElement>('[data-push-text]').forEach((p) => (p.hidden = p.dataset.pushText !== reason));
  card.hidden = false;
  if (!reducedMotion()) animate(card, { opacity: [0, 1], y: [24, 0], scale: [0.96, 1] }, SPRING.spatial);
}
