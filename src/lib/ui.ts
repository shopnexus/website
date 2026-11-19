// Class strings the pages share. K2 (j.css): .superdesign/tools/build_k2.py.

/** A panel: white, 16 px, hairline. */
export const PANEL = 'rounded-panel border border-line bg-card';
/** A section heading, 18 px. */
export const H2 = 'text-j-18 text-ink';
/** The small label over a group. */
export const LABEL = 'px-1 text-body-small text-faint';
/** The main column's width and gutters, under the header. */
export const CONTENT = 'mx-auto w-full max-w-[1280px] px-4 md:px-6 lg:px-8';
/** CONTENT at 1600 px, for the chat pages. The extra width goes to the chat pane. */
export const CONTENT_WIDE = 'mx-auto w-full max-w-[1600px] px-4 md:px-6 lg:px-8';

const LOOK = {
  ink: 'bg-brand text-white hover:bg-brand-hover',
  primary: 'bg-brand text-white hover:bg-brand-hover',
  tonal: 'bg-mint text-on-mint',
  ghost: 'text-ink hover:bg-hover',
  line: 'border border-field bg-card text-ink hover:bg-page',
  tertiary: 'bg-tertiary text-on-tertiary',
  error: 'text-error',
} as const;

export type ButtonKind = keyof typeof LOOK;

/** A button, 10 px corners. kind: ink (or primary) is the page's main action, in the brand teal. size: md 40 px, lg 44 px, sm 36 px. */
export function btnCls(kind: ButtonKind = 'ink', size: 'sm' | 'md' | 'lg' = 'md') {
  const dims = { sm: 'h-9 gap-1.5 px-3.5', md: 'h-10 gap-1.5 px-4', lg: 'h-11 gap-2 px-5' }[size];
  return `state-layer flex shrink-0 items-center justify-center whitespace-nowrap rounded-control text-title-small ${dims} ${LOOK[kind]}`;
}
