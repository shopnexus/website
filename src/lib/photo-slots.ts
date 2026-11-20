import { busy } from './busy';
import { loginHref } from './routes';
import { UploadError, uploadPhoto } from './upload';

// In the browser: runs a PhotoSlots block. Picked photos upload at once, each
// in a tile with a ring until its upload id is in; × drops a tile. A submit
// while photos upload waits for them, then goes with the same button.

const WORDS: Record<UploadError['reason'], string> = {
  'sign-in': 'Phiên đăng nhập đã hết. Đăng nhập lại nhé.',
  type: 'Chỉ nhận ảnh JPEG, PNG hoặc WebP.',
  size: 'Có ảnh lớn hơn 15 MB.',
  failed: 'Có ảnh chưa tải lên được. Thử lại nhé.',
};

export function photoSlots(root: HTMLElement) {
  const max = Number(root.dataset.max);
  const list = root.querySelector<HTMLElement>('[data-photos]')!;
  const add = root.querySelector<HTMLElement>('[data-photo-add]')!;
  const input = root.querySelector<HTMLInputElement>('[data-photo-input]')!;
  const count = root.querySelector<HTMLElement>('[data-photo-count]')!;
  const status = root.querySelector<HTMLElement>('[data-photo-status]')!;
  const tpl = root.querySelector<HTMLTemplateElement>('[data-photo-tpl]')!;
  const tiles = () => list.querySelectorAll('[data-photo]').length;
  const pending = new Set<Promise<void>>();

  const refresh = () => {
    count.textContent = `${tiles()}/${max}`;
    add.hidden = tiles() >= max;
  };

  const upload = async (file: File) => {
    const li = tpl.content.firstElementChild!.cloneNode(true) as HTMLElement;
    const url = URL.createObjectURL(file);
    li.querySelector('img')!.src = url;
    list.insertBefore(li, add);
    refresh();
    try {
      li.querySelector('input')!.value = await uploadPhoto(file);
      li.querySelector('[data-photo-busy]')!.remove();
    } catch (e) {
      const reason = e instanceof UploadError ? e.reason : 'failed';
      if (reason === 'sign-in') location.href = loginHref(location.pathname + location.search);
      status.textContent = WORDS[reason];
      li.remove();
      URL.revokeObjectURL(url);
      refresh();
    }
  };

  input.addEventListener('change', () => {
    const files = [...(input.files ?? [])];
    const room = max - tiles();
    status.textContent = files.length > room ? `Tối đa ${max} ảnh, đã bỏ ${files.length - room} ảnh.` : '';
    for (const file of files.slice(0, Math.max(0, room))) {
      const p = upload(file).finally(() => pending.delete(p));
      pending.add(p);
    }
    input.value = '';
  });

  list.addEventListener('click', (e) => {
    const li = (e.target as Element).closest('[data-photo-remove]')?.closest('[data-photo]');
    if (!li) return;
    li.remove();
    refresh();
  });

  const form = root.closest('form');
  form?.addEventListener('submit', async (e) => {
    if (!pending.size) return;
    e.preventDefault();
    const by = (e as SubmitEvent).submitter;
    busy(by);
    while (pending.size) await Promise.all(pending);
    busy(by, false);
    form.requestSubmit(by);
  });
}
