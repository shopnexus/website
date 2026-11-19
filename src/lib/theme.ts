import { THEME_COOKIE } from './session';

/** The theme picks on Tôi and in the account menu, in their order. */
export const THEMES = ['Theo hệ thống', 'Sáng', 'Tối'];

/** Applies a pick from THEMES and keeps it in the cookie; the first follows the system. */
export function setTheme(index: number) {
  const t = ['', 'light', 'dark'][index];
  if (t) document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
  document.cookie = t ? `${THEME_COOKIE}=${t}; path=/; max-age=31536000; samesite=lax` : `${THEME_COOKIE}=; path=/; max-age=0`;
}
