import { API } from './routes';

// In the browser: a province select that refills its commune select from the
// server when it changes (Địa chỉ, Đăng tin).

export function wireCommunes(province: HTMLSelectElement | null, commune: HTMLSelectElement | null, onFill?: () => void) {
  province?.addEventListener('change', async () => {
    if (!commune) return;
    // Off until the province's communes are in.
    commune.replaceChildren(new Option('Chọn phường, xã', '', true, true));
    commune.disabled = true;
    const res = await fetch(API.communes(province.value)).catch(() => null);
    commune.disabled = false;
    const items: { code: string; name: string }[] = res?.ok ? await res.json() : [];
    const first = new Option(items.length ? 'Chọn phường, xã' : 'Chưa tải được. Chọn lại tỉnh.', '', true, true);
    first.disabled = true;
    commune.replaceChildren(first, ...items.map((c) => new Option(c.name, c.code)));
    onFill?.();
  });
}
