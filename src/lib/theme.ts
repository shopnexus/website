import type { AstroGlobal } from 'astro';

/** "Giao diện tối" on Tôi: light or dark, or nothing to follow the system. A
 * cookie, so the server renders the chosen theme and the page does not flash. */
const THEME_COOKIE = 'sn_theme';

export function theme(ctx: Pick<AstroGlobal, 'cookies'>): 'light' | 'dark' | undefined {
  const t = ctx.cookies.get(THEME_COOKIE)?.value;
  return t === 'light' || t === 'dark' ? t : undefined;
}

/** The theme picks on Tôi and in the account menu, in their order. */
export const THEMES = ['Theo hệ thống', 'Sáng', 'Tối'];

/** The browser's bar colour per theme: j.css's page colour, as the header has it. */
export const BAR_COLOR = { light: '#f7f7f5', dark: '#141413' } as const;

/** When the theme-color meta of `scheme` applies: with the system, or always or never once a theme is picked. */
export const barMedia = (scheme: keyof typeof BAR_COLOR, picked?: string) =>
  picked ? (picked === scheme ? 'all' : 'not all') : `(prefers-color-scheme: ${scheme})`;

/** Applies a pick from THEMES and keeps it in the cookie; the first follows the system. */
export function setTheme(index: number) {
  const t = ['', 'light', 'dark'][index];
  if (t) document.documentElement.dataset.theme = t;
  else delete document.documentElement.dataset.theme;
  for (const m of document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')) m.media = barMedia(m.dataset.scheme as keyof typeof BAR_COLOR, t);
  document.cookie = t ? `${THEME_COOKIE}=${t}; path=/; max-age=31536000; samesite=lax` : `${THEME_COOKIE}=; path=/; max-age=0`;
}
