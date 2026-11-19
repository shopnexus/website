import { clearCode, codeOf } from './code-boxes';
import { sendPhoneCode } from './firebase';
import { phoneText, vnMobile } from './format';
import { countdown, type Step } from './proof-form';

// In the browser: a texted code, as Đăng nhập and Bảo mật run it. `root`
// [data-phone-flow] holds a start form [data-phone-start], with a phone field
// or the number in root's data-number, and the hidden code form
// [data-phone-code] with CodeBoxes, [data-code-submit], [data-phone-timer],
// [data-phone-resend], and optionally [data-phone-to] and [data-phone-change].
// [data-phone-hide] elements in root hide while the code form shows.

export function phoneFlow(root: HTMLElement, step: Step, done: (token: string) => void) {
  const start = root.querySelector<HTMLFormElement>('[data-phone-start]')!;
  const codeForm = root.querySelector<HTMLFormElement>('[data-phone-code]')!;
  const field = start.querySelector<HTMLInputElement>('[name=phone]');
  const timer = codeForm.querySelector<HTMLElement>('[data-phone-timer]')!;
  const resend = codeForm.querySelector<HTMLButtonElement>('[data-phone-resend]')!;
  const hide = [start, ...root.querySelectorAll<HTMLElement>('[data-phone-hide]')];
  let sent: Awaited<ReturnType<typeof sendPhoneCode>> | undefined;
  let number = '';
  let stop = () => {};

  const send = async () => {
    sent = await sendPhoneCode(number);
    hide.forEach((el) => (el.hidden = true));
    codeForm.hidden = false;
    const to = codeForm.querySelector('[data-phone-to]');
    if (to) to.textContent = phoneText(number);
    clearCode(codeForm);
    stop();
    stop = countdown(timer, resend);
  };

  start.addEventListener('submit', (e) => {
    e.preventDefault();
    step(e.submitter as HTMLButtonElement | null, async () => {
      number = (field ? vnMobile(field.value) : root.dataset.number) ?? '';
      if (!number) throw { code: 'auth/invalid-phone-number' };
      await send();
    });
  });
  codeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    step(codeForm.querySelector('[data-code-submit]'), async () => {
      try {
        done(await sent!.confirm(codeOf(codeForm)));
      } catch (err) {
        clearCode(codeForm);
        throw err;
      }
    });
  });
  // "Gửi lại mã" stays held while its countdown runs.
  resend.addEventListener('click', () => step(resend, send, () => !!timer.textContent));
  codeForm.querySelector('[data-phone-change]')?.addEventListener('click', () => {
    stop();
    sent = undefined;
    codeForm.hidden = true;
    hide.forEach((el) => (el.hidden = false));
    field?.focus();
  });
}
