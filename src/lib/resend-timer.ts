import { clock } from './format';

// In the browser: "Gửi lại sau 0:45" counts down on a code step, then lets
// the "Gửi lại mã" button through. The page marks them data-resend and data-resend-btn.
export function resendTimer() {
  const timer = document.querySelector<HTMLElement>('[data-resend]');
  const resend = document.querySelector<HTMLButtonElement>('[data-resend-btn]');
  if (!timer || !resend) return;
  let left = Number(timer.dataset.resend);
  const tick = setInterval(() => {
    left -= 1;
    timer.textContent = `Gửi lại sau ${clock(left)}`;
    if (left <= 0) {
      clearInterval(tick);
      timer.remove();
      resend.disabled = false;
    }
  }, 1000);
}
