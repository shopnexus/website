import { busy, leaveWith } from './busy';
import { idempotencyKey } from './key';
import { connectSocket } from './socket';
import { hold } from './skeleton';
import { snack } from './snackbar';
import { UploadError, uploadPhoto } from './upload';

// In the browser: one chat pane, the same on Tin nhắn, Hỗ trợ and the chat
// box on a listing. Messages post in place and the pane's page answers with
// itself; its data-part blocks are swapped in. The socket asks the page again
// when the chat changes. Several panes may share a page: each works under its
// root.

type Update = { kind: string; conversation_id?: string; deal_id?: string };

export interface PaneOptions {
  /** The pane's element; the whole page by default. */
  root?: HTMLElement | Document;
  /** The URL that renders the pane, without the one-render params. */
  clean: () => URL;
  /** Whether the pane's URL is the address bar's, kept as it changes. */
  history?: boolean;
  /** What a socket update for another chat refreshes; nothing by default. */
  elsewhere?: (u: Update) => 'page' | 'inbox' | null;
  /** Fetches and swaps the inbox; Tin nhắn's alone. */
  refreshInbox?: () => Promise<void>;
  /** Whether an update about a deal is about this pane. */
  shows?: (u: Update) => boolean;
  /** After each swap. */
  afterSwap?: () => void;
}

const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => [...root.querySelectorAll<T>(s)];

export function mountChatPane(o: PaneOptions) {
  const root = o.root ?? document;
  // The listeners take the pane's element; a Document dispatches the same events.
  const on = root as HTMLElement;
  const history_ = o.history ?? root === document;
  const q = <T extends Element = HTMLElement>(sel: string) => $<T>(sel, root);
  // The chat may start after a first message (the chat box), so it is read each time.
  const chat = () => q('[data-chat]')?.dataset.chat ?? (root instanceof HTMLElement ? (root.dataset.chat ?? '') : '');
  const scroller = q('[data-thread]');
  // A pane off the address bar keeps its own URL, which a send may move (a first message opens the chat).
  let pageUrl: URL | null = null;
  const at = () => pageUrl ?? o.clean();
  const toEnd = () => scroller && (scroller.scrollTop = scroller.scrollHeight);
  toEnd();
  const socket = connectSocket();

  // ------------------------------------------------- swap from the server --
  // A fresh render replaces each data-part; one that holds the focus waits
  // for the next. The thread is replaced only while the reader is at its end
  // with no older pages open; otherwise "Có tin mới" holds it.
  const pill = q<HTMLButtonElement>('[data-news]');
  let held: HTMLElement | null = null;
  // A render that marked the chat read may come back as a read update; one
  // within 2 s of it is taken as that echo and changes nothing.
  let markedAt = q('[data-part="thread"]')?.hasAttribute('data-marked') ? Date.now() : 0;

  function putThread(fresh: HTMLElement) {
    q('[data-part="thread"]')?.replaceWith(fresh);
    q('[data-older-pages]')?.replaceChildren();
    const next = fresh.dataset.next ?? '';
    const older = q<HTMLButtonElement>('[data-older]');
    if (older) older.dataset.older = next;
    const wrap = q('[data-older-wrap]');
    if (wrap) wrap.hidden = !next;
    held = null;
    if (pill) pill.hidden = true;
    toEnd();
  }
  function swap(html: string, thread = false) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const atEnd = scroller ? scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 80 : false;
    for (const fresh of $$('[data-part]', doc)) {
      const name = fresh.dataset.part!;
      const old = q(`[data-part="${name}"]`);
      if (!old) continue;
      if (name === 'thread') {
        if (fresh.hasAttribute('data-marked')) markedAt = Date.now();
        const node = document.importNode(fresh, true);
        if (thread || (atEnd && !q('[data-older-pages]')?.childElementCount)) putThread(node);
        else if (node.dataset.last !== old.dataset.last) {
          held = node;
          if (pill) pill.hidden = false;
        }
        continue;
      }
      if (old.contains(document.activeElement)) continue;
      old.replaceWith(document.importNode(fresh, true));
    }
    o.afterSwap?.();
  }
  pill?.addEventListener('click', () => held && putThread(held));
  scroller?.addEventListener('scroll', () => {
    // Back at the end, the held thread takes its place.
    if (held && !q('[data-older-pages]')?.childElementCount && scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 40) putThread(held);
  });

  // The whole page for this chat's changes; the inbox for other chats'. Bursts wait 250 ms.
  let want: 'page' | 'inbox' | null = null;
  let timer = 0;
  let fetching = false;
  function schedule(kind: 'page' | 'inbox') {
    if (want !== 'page') want = kind;
    clearTimeout(timer);
    timer = window.setTimeout(run, 250);
  }
  async function run() {
    if (!want || fetching || document.hidden) return;
    const kind = want;
    want = null;
    fetching = true;
    try {
      if (kind === 'page') {
        const res = await fetch(at(), { headers: { accept: 'text/html' } });
        if (res.ok && !res.redirected) swap(await res.text());
      } else await o.refreshInbox?.();
    } catch {
      // The next update or a reload tries again.
    } finally {
      fetching = false;
      if (want) timer = window.setTimeout(run, 250);
    }
  }
  document.addEventListener('visibilitychange', () => !document.hidden && want && run());

  // A form sent in place: the page answers with itself after the redirect.
  // Resolves to the error code, '' when it went through.
  async function sendInPlace(form: HTMLFormElement, body = new FormData(form)) {
    const res = await fetch(form.action, { method: 'POST', body, headers: { accept: 'text/html' } });
    const to = new URL(res.url);
    if (!res.ok || to.pathname !== at().pathname) throw new Error(String(res.status));
    swap(await res.text(), true);
    const code = to.searchParams.get('error') ?? '';
    to.searchParams.delete('error');
    if (history_) history.replaceState(null, '', to);
    else pageUrl = to;
    return code;
  }
  on.addEventListener('submit', async (e) => {
    const form = e.target as HTMLFormElement;
    if (!form.matches('[data-in-place]')) return;
    e.preventDefault();
    // The fields are read before the buttons turn off; the focus would keep the form's part from being swapped.
    const submitter = (e as SubmitEvent).submitter as HTMLButtonElement | null;
    const body = new FormData(form, submitter);
    (document.activeElement as HTMLElement | null)?.blur();
    const buttons = $$<HTMLButtonElement>('button', form);
    buttons.forEach((b) => (b.disabled = true));
    busy(submitter);
    try {
      await sendInPlace(form, body);
    } catch {
      // Out of reach: a plain post, carrying the button's move in a hidden field.
      if (submitter?.name) form.append(Object.assign(document.createElement('input'), { type: 'hidden', name: submitter.name, value: submitter.value }));
      return leaveWith(form, submitter);
    }
    // A form the swap kept is ready for the next move; 'sent' tells its page.
    buttons.forEach((b) => (b.disabled = false));
    busy(submitter, false);
    form.dispatchEvent(new Event('sent'));
  });

  // --------------------------------------------------------- the composer --
  const composer = q<HTMLFormElement>('[data-composer]');
  if (composer) {
    const field = $<HTMLTextAreaElement>('[name="text"]', composer)!;
    const send = $<HTMLButtonElement>('[type=submit]', composer)!;
    const strip = $('[data-strip]', composer)!;
    const replyTo = $<HTMLInputElement>('[data-reply-to]', composer)!;
    const tray = $('[data-tray]', composer)!;
    const files = $<HTMLInputElement>('[data-files]', composer)!;
    const pick = $<HTMLButtonElement>('[data-pick]', composer)!;
    const cell = q<HTMLTemplateElement>('[data-tray-item]')!;
    let uploading = 0;
    let sending = false;
    const ready = () => (send.disabled = sending || uploading > 0 || (!field.value.trim() && !$$('input[name="photos"]', composer).length));
    pick.hidden = false;
    ready();
    field.addEventListener('input', ready);
    // Enter sends, Shift+Enter breaks the line; a word being composed (Telex, VNI) keeps its Enter.
    field.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' || e.shiftKey || e.isComposing) return;
      e.preventDefault();
      composer.requestSubmit();
    });

    const unreply = () => {
      strip.hidden = true;
      replyTo.value = '';
    };
    $('[data-strip-close]', composer)!.addEventListener('click', unreply);
    const replyTo_ = (b: HTMLElement) => {
      strip.hidden = false;
      replyTo.value = b.dataset.reply!;
      $('[data-strip-who]', strip)!.textContent = `Trả lời ${b.dataset.replyWho}`;
      $('[data-strip-text]', strip)!.textContent = b.dataset.replyText ?? '';
      field.focus();
    };
    on.addEventListener('click', (e) => {
      const b = (e.target as Element).closest<HTMLButtonElement>('[data-reply]');
      if (b) replyTo_(b);
    });
    // On a touch screen a message swiped 56 px toward the middle is answered, as in the app: the other person's to the right, one's own to the left.
    let swipe: { el: HTMLElement; x: number; y: number; id: number; sign: number } | null = null;
    on.addEventListener('pointerdown', (e) => {
      const el = (e.target as Element).closest<HTMLElement>('[data-msg]');
      if (e.pointerType !== 'touch' || !el?.querySelector('[data-reply]')) return;
      swipe = { el, x: e.clientX, y: e.clientY, id: e.pointerId, sign: el.closest('[data-group="mine"]') ? -1 : 1 };
    });
    on.addEventListener('pointermove', (e) => {
      if (!swipe || e.pointerId !== swipe.id) return;
      const dx = (e.clientX - swipe.x) * swipe.sign;
      if (Math.abs(e.clientY - swipe.y) > 24) {
        swipe.el.style.transform = '';
        swipe = null;
        return;
      }
      swipe.el.style.transform = `translateX(${Math.max(0, Math.min(dx, 72)) * swipe.sign}px)`;
    });
    const endSwipe = (e: PointerEvent) => {
      if (!swipe || e.pointerId !== swipe.id) return;
      const { el, x, sign } = swipe;
      swipe = null;
      el.style.transition = 'transform 150ms';
      el.style.transform = '';
      setTimeout(() => (el.style.transition = ''), 160);
      if (e.type === 'pointerup' && (e.clientX - x) * sign >= 56) replyTo_(el.querySelector<HTMLElement>('[data-reply]')!);
    };
    on.addEventListener('pointerup', endSwipe);
    on.addEventListener('pointercancel', endSwipe);

    // Each photo uploads as soon as it is picked; up to 4.
    pick.addEventListener('click', () => files.click());
    files.addEventListener('change', () => {
      const room = 4 - tray.childElementCount;
      [...(files.files ?? [])].slice(0, Math.max(0, room)).forEach(async (file) => {
        const node = (cell.content.cloneNode(true) as DocumentFragment).firstElementChild as HTMLElement;
        const url = URL.createObjectURL(file);
        node.querySelector('img')!.src = url;
        tray.append(node);
        tray.hidden = false;
        node.querySelector('[data-drop]')!.addEventListener('click', () => {
          node.remove();
          URL.revokeObjectURL(url);
          tray.hidden = !tray.childElementCount;
          ready();
        });
        uploading++;
        ready();
        try {
          const id = await uploadPhoto(file);
          const input = Object.assign(document.createElement('input'), { type: 'hidden', name: 'photos', value: id });
          node.append(input);
          node.querySelector('[data-busy]')?.remove();
        } catch (err) {
          node.remove();
          tray.hidden = !tray.childElementCount;
          const r = err instanceof UploadError ? err.reason : 'failed';
          snack({ text: r === 'type' ? 'Chỉ gửi được ảnh JPEG, PNG hoặc WebP.' : r === 'size' ? 'Ảnh lớn hơn 15 MB.' : 'Chưa tải được ảnh lên.', error: true });
        } finally {
          uploading--;
          ready();
        }
      });
      files.value = '';
    });

    composer.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (send.disabled) return;
      sending = true;
      ready();
      busy(send);
      try {
        const code = await sendInPlace(composer);
        if (!code) {
          field.value = '';
          tray.replaceChildren();
          tray.hidden = true;
          unreply();
        }
        // A sent message or a clear refusal makes the next one a new write;
        // after an unclear outcome the retry keeps the key, so it cannot go twice.
        if (code !== 'unknown') $<HTMLInputElement>('input[name="key"]', composer)!.value = idempotencyKey();
        toEnd();
      } catch {
        snack({ text: 'Chưa gửi được. Kiểm tra kết nối rồi thử lại.', error: true });
      } finally {
        sending = false;
        busy(send, false);
        ready();
        field.focus();
      }
    });

    // Typing tells the other person, at most once in 3 seconds.
    let typedAt = 0;
    field.addEventListener('input', () => {
      if (!field.value.trim() || Date.now() - typedAt < 3000) return;
      typedAt = Date.now();
      socket.send({ type: 'typing', conversation_id: chat() });
    });
  }

  // ------------------------------------------------------- older messages --
  q('[data-older]')?.addEventListener('click', async (e) => {
    const b = e.currentTarget as HTMLButtonElement;
    if (!b.dataset.older) return;
    b.disabled = true;
    busy(b);
    const box = q('[data-older-pages]')!;
    const h = hold(box, { kind: 'bubbles', at: 'prepend' });
    try {
      const res = await fetch(`/messages/older?${new URLSearchParams({ chat: chat(), cursor: b.dataset.older })}`, { headers: { accept: 'text/html' } });
      if (!res.ok) throw new Error(String(res.status));
      const holder = document.createElement('template');
      holder.innerHTML = await res.text();
      const page = holder.content.querySelector<HTMLTemplateElement>('template[data-older-page]')!;
      await h.end();
      const before = scroller!.scrollHeight;
      // A day split over the two pages keeps one heading.
      const firstDay = $('[data-day]', box) ?? q('[data-part="thread"] [data-day]');
      const days = $$('[data-day]', page.content);
      if (firstDay && days.at(-1)?.dataset.day === firstDay.dataset.day) firstDay.remove();
      box.prepend(page.content);
      scroller!.scrollTop += scroller!.scrollHeight - before;
      b.dataset.older = page.dataset.next ?? '';
      q('[data-older-wrap]')!.hidden = !b.dataset.older;
    } catch {
      h.undo();
      snack({ text: 'Chưa tải được tin cũ hơn.', error: true });
    } finally {
      busy(b, false);
      b.disabled = false;
    }
  });

  // ----------------------------------------------------------- the socket --
  let typingTimer = 0;
  const typing = (shown: boolean) => {
    const line = q('[data-typing]');
    if (line) line.hidden = !shown;
  };
  document.addEventListener('sn:update', (e) => {
    const f = (e as CustomEvent<Update>).detail;
    const chatId = chat();
    const here = !!chatId && (f.conversation_id === chatId || !!o.shows?.(f));
    // A message from the other person ends their typing.
    if (f.conversation_id === chatId) typing(false);
    if (f.kind === 'read' && here && Date.now() - markedAt < 2000) {
      markedAt = 0;
      return;
    }
    if (!['message', 'read', 'deal', 'scam_warning'].includes(f.kind)) return;
    const kind = here ? 'page' : (o.elsewhere?.(f) ?? null);
    if (kind) schedule(kind);
  });
  document.addEventListener('sn:reset', () => schedule('page'));
  document.addEventListener('sn:typing', (e) => {
    if ((e as CustomEvent<{ conversation_id: string }>).detail.conversation_id !== chat()) return;
    typing(true);
    clearTimeout(typingTimer);
    typingTimer = window.setTimeout(() => typing(false), 4000);
  });

  return { swap, sendInPlace };
}
