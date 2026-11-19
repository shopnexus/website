import { busy, leaveWith } from './busy';
import { firebaseError, firebaseReady, googleToken, loadFirebase } from './firebase';
import { clock } from './format';
import type { TokenKind } from './sign-in';

// In the browser: the pieces Đăng nhập and Bảo mật share around a Firebase
// proof. The page's one alert line, the hidden form that posts the token,
// one step at a time with its button held, and the Google button.

export type Say = (text: string | null) => void;
export type Step = (button: HTMLButtonElement | null, run: () => Promise<void>, keep?: () => boolean) => Promise<void>;

/** Shows `text` in the page's Notice inside [data-alert], or hides it for null. A shown line hides [data-done]. */
export function alertLine(box: HTMLElement | null): Say {
  return (text) => {
    if (!box) return;
    box.hidden = !text;
    const slot = box.querySelector('[data-notice-text]');
    if (slot) slot.textContent = text ?? '';
    if (text) {
      document.querySelectorAll<HTMLElement>('[data-done]').forEach((d) => (d.hidden = true));
      box.scrollIntoView({ block: 'nearest' });
    }
  };
}

/** Posts a token through a hidden form with `kind` and `token` fields (and `step`, when the form has one to set). The step's button stays busy until the page answers. */
export function postToken(form: HTMLFormElement, kind: TokenKind, token: string, step?: string) {
  const set = (name: string, value: string) => {
    const input = form.querySelector<HTMLInputElement>(`[name=${name}]`);
    if (input) input.value = value;
  };
  if (step) set('step', step);
  set('kind', kind);
  set('token', token);
  leaveWith(form);
}

/**
 * Runs one Firebase step at a time: its button disabled meanwhile, a failure
 * shown with `say`. A step asked for while another runs waits and runs after
 * it, the latest one only. `keep` decides whether the button stays disabled.
 */
export function stepper(say: Say): Step {
  let running = false;
  let queued: (() => void) | undefined;
  const step: Step = async (button, run, keep = () => false) => {
    if (running) {
      queued = () => void step(button, run, keep);
      return;
    }
    running = true;
    if (button) {
      button.disabled = true;
      busy(button);
    }
    say(null);
    try {
      await run();
    } catch (e) {
      say(firebaseError(e));
    } finally {
      running = false;
      if (button) {
        busy(button, false);
        button.disabled = keep();
      }
      const next = queued;
      queued = undefined;
      next?.();
    }
  };
  return step;
}

/** "Gửi lại sau 0:59" in `timer` while `button` waits, then the button is free. Returns a stop. */
export function countdown(timer: HTMLElement, button: HTMLButtonElement, seconds = 60) {
  let left = seconds;
  button.disabled = true;
  timer.textContent = `Gửi lại sau ${clock(left)}`;
  const tick = setInterval(() => {
    left -= 1;
    timer.textContent = left > 0 ? `Gửi lại sau ${clock(left)}` : '';
    if (left <= 0) {
      clearInterval(tick);
      button.disabled = false;
    }
  }, 1000);
  return () => {
    clearInterval(tick);
    timer.textContent = '';
  };
}

/** The email code's "Gửi lại sau" from the server: [data-resend] seconds, then [data-resend-btn] is free. */
export function resendTimer() {
  const timer = document.querySelector<HTMLElement>('[data-resend]');
  const button = document.querySelector<HTMLButtonElement>('[data-resend-btn]');
  if (timer && button) countdown(timer, button, Number(timer.dataset.resend));
}

/**
 * A Google button: shown and disabled until the SDK is in, so the popup opens
 * inside the click (Safari blocks it after an await). A click hands the token to `done`.
 */
export function googleButton(button: HTMLButtonElement, step: Step, say: Say, done: (token: string) => void) {
  button.hidden = false;
  button.type = 'button';
  const arm = () => (button.disabled = !firebaseReady());
  arm();
  // Loads as the page opens; a failed load frees the button to try again.
  const load = () =>
    loadFirebase().then(arm, () => {
      button.disabled = false;
    });
  load();
  button.addEventListener('click', () => {
    // The SDK failed to load: try again, and say why this click did nothing.
    if (!firebaseReady()) {
      say(firebaseError({ code: 'auth/network-request-failed' }));
      load();
      return;
    }
    step(button, async () => done(await googleToken()));
  });
}
