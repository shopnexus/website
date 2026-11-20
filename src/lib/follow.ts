import { API } from './routes';
import { snack } from './snackbar';
import { toggleRemote } from './toggle';

// In the browser: "Theo dõi" buttons (data-follow="<account id>", FollowButton)
// flip at once and follow through /api/follows/<id>. Every button for that
// person flips together; a failed call puts them back and says so.

/** What this page last set per person, for buttons drawn from an older copy (a cached person card). */
const known = new Map<string, boolean>();

function draw(b: HTMLElement, on: boolean) {
  b.setAttribute('aria-pressed', String(on));
  b.querySelector('[data-follow-label]')!.textContent = on ? 'Đang theo dõi' : 'Theo dõi';
}

function set(id: string, on: boolean) {
  known.set(id, on);
  document.querySelectorAll<HTMLElement>(`[data-follow="${id}"]`).forEach((b) => draw(b, on));
}

/** Brings the follow buttons under root to what this page last set. */
export function syncFollows(root: ParentNode) {
  root.querySelectorAll<HTMLElement>('[data-follow]').forEach((b) => {
    const on = known.get(b.dataset.follow!);
    if (on !== undefined) draw(b, on);
  });
}

document.addEventListener('click', async (e) => {
  const b = (e.target as Element).closest<HTMLButtonElement>('button[data-follow]');
  if (!b) return;
  const id = b.dataset.follow!;
  const on = b.getAttribute('aria-pressed') !== 'true';
  set(id, on);
  if (await toggleRemote(API.follows(id), on)) return;
  set(id, !on);
  snack({ text: 'Chưa đổi được. Thử lại sau.', error: true });
});
