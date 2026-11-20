// "Cài ShopNexus" ([data-install], in the account menu and on Tôi): the
// browser's install prompt where it offers one, the add-to-home-screen hint
// (InstallHint.astro) on iPhone and iPad Safari, hidden everywhere else and
// once the site runs as an app.

interface InstallPrompt extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let pending: InstallPrompt | null = null;

const installed = () => matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true;
/** Safari on iOS or iPadOS, which reports a Mac with a touch screen; other iOS browsers name themselves. */
const iosSafari = () =>
  (/iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1)) &&
  !/CriOS|FxiOS|EdgiOS|OPiOS/.test(navigator.userAgent);

const show = (on: boolean) => document.querySelectorAll<HTMLElement>('[data-install]').forEach((el) => (el.hidden = !on));

// Taken over so the browser's own banner stays away; the items offer it instead.
addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  pending = e as InstallPrompt;
  show(true);
});
addEventListener('appinstalled', () => {
  pending = null;
  show(false);
});
if (!installed() && iosSafari()) show(true);

document.addEventListener('click', async (e) => {
  const item = (e.target as Element).closest('[data-install]');
  if (!item) return;
  item.closest<HTMLElement>('[popover]')?.hidePopover();
  if (!pending) return document.querySelector<HTMLDialogElement>('#install-hint')?.showModal();
  // A prompt works once; the browser fires a new event when it would offer again.
  const p = pending;
  pending = null;
  show(false);
  await p.prompt();
});
