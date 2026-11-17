// Class strings J pages share, from .superdesign/tools/j_kit.py.

/** A panel: white, 24 px, hairline. */
export const PANEL = 'rounded-panel border border-line bg-card';
/** A section heading, 26 px. */
export const H2 = 'text-j-26 text-ink';
/** The small caps label over a group. */
export const LABEL = 'px-1 text-label-medium uppercase tracking-[0.1em] text-on-surface-variant';
/** The main column's width and gutters, under the header. */
export const CONTENT = 'mx-auto w-full max-w-[1360px] px-4 md:px-6 lg:px-8';

const LOOK = {
  ink: 'bg-ink text-on-ink',
  primary: 'bg-primary text-on-primary',
  tonal: 'bg-secondary-container text-on-secondary-container',
  ghost: 'text-primary',
  line: 'border border-line bg-card text-ink',
  tertiary: 'bg-tertiary text-on-tertiary',
  error: 'text-error',
} as const;

export type ButtonKind = keyof typeof LOOK;

/** A pill button. kind: ink is the page's main action. size: md 40 px, lg 44 px, sm 36 px. */
export function btnCls(kind: ButtonKind = 'ink', size: 'sm' | 'md' | 'lg' = 'md') {
  const dims = { sm: 'h-9 gap-1.5 px-4', md: 'h-10 gap-1.5 px-4', lg: 'h-11 gap-2 px-5' }[size];
  return `state-layer flex shrink-0 items-center justify-center whitespace-nowrap rounded-full text-label-large ${dims} ${LOOK[kind]}`;
}
