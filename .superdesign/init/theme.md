# Theme

Tokens live in `src/styles/tokens.css` (Tailwind 4 `@theme`). Tailwind's
default palette, type steps, radii and breakpoints are switched off.

- Colours: M3 roles from seed #066A61 (teal) with tertiary from #924628
  (terracotta). Light: primary #005049, primaryContainer #066A61,
  secondaryContainer #C7E6E0, tertiary #773115, tertiaryFixed #FFDBCF,
  surface #F7FAF8, surfaceContainerLow #F1F4F2, surfaceContainer #EBEFED,
  surfaceContainerHigh #E6E9E7, onSurface #181C1C, onSurfaceVariant #3E4947,
  outlineVariant #BEC9C6, error #BA1A1A. Dark values in the same file.
- Utilities: `bg-primary`, `text-on-surface-variant`, `bg-surface-container-high`...
- Type: Be Vietnam Pro; `text-display-small` 36/44 400 ... `text-label-small`
  11/16 500 (M3 names).
- Radii: `rounded-xs` 4, `sm` 8, `md` 12, `lg` 16, `lg-plus` 20, `xl` 28,
  `xl-plus` 32, `rounded-full`.
- Shadow: `shadow-float` (M3 level 3) for floating elements only.
- Breakpoints: `md` 600, `lg` 840, `xl` 1200, `2xl` 1600 (M3 window classes).
- Motion: `ease-spatial-fast`, `ease-spatial`, `ease-effects` with
  `--duration-*` variables.
