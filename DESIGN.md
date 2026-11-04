# Website design

The public storefront at `<domain>`: Home, search, categories, listing
detail, seller profiles, and the buyer's account. It is what a search engine
indexes and what a shared link opens.

## Source

The Android app's design system, `app/.superdesign/design-system.md`, is the
reference. It holds the product, the deal model, the colour roles, the type
scale, the corner scale, motion, and the copy rules. This file covers only
what changes on the web, and the app document wins wherever this file is
silent.

`src/styles/tokens.css` turns the app's tokens into Tailwind utilities. The
console carries the same file. Tailwind's own palette, type steps, radii and
breakpoints are switched off, so a value outside the system does not compile.

| App token | Utility |
|---|---|
| colour roles (`surfaceContainerHigh`, `onSurfaceVariant`, ...) | `bg-surface-container-high`, `text-on-surface-variant`, ... |
| type scale (`bodyMedium`, `titleLarge`, ...) | `text-body-medium`, `text-title-large`, ... (size, line height and weight) |
| corners extraSmall to extraLargeIncreased | `rounded-xs` 4, `sm` 8, `md` 12, `lg` 16, `lg-plus` 20, `xl` 28, `xl-plus` 32, `rounded-full` |
| shadow level 3 | `shadow-float` |
| springs | `ease-spatial-fast`, `ease-spatial`, `ease-effects` with `duration-(--duration-<family>-<speed>)` |
| icons, Material Symbols Rounded | `import Icon from '~icons/material-symbols/<name>-rounded'` |

## Kept from the app

- The deal model and every rule that follows from it. ShopNexus holds no
  money, so no page may promise protection, mention escrow, a wallet, a
  refund from the platform, or a dispute desk. The old Next.js site on the
  `escrow` branch was built on that model, so take nothing from it without
  checking.
- Colour roles and their meanings: `primary` for the one main action and for
  trust, `tertiary` for bargaining and the agreed price only,
  `secondaryContainer` for selected chips and the nav indicator, `error` for
  errors, the scam warning and "Đăng xuất". Depth is tonal; only floating
  elements get a shadow.
- One family, Be Vietnam Pro, at the listed weights and never below the
  listed line heights. Prices in Vietnamese format: `1.250.000 ₫`, and cards
  shorten 10 triệu and above to `12,5 tr ₫`.
- The listing card, the sparkle for AI judgments only, the `MONEY` sentences
  word for word, and Vietnamese copy with correct diacritics.
- The minimal look: few elements per block, wide spacing, icons and layout in
  place of explanatory copy.

## Changed for the web

**Window sizes.** The app draws one phone. The web lays out at the M3 window
size classes, which replace Tailwind's breakpoints.

| Class | Width | Prefix | Listing grid | Side margin | Navigation |
|---|---|---|---|---|---|
| compact | < 600 | none | 2 columns | 16 | the app's bottom bar |
| medium | 600 to 839 | `md:` | 3 columns | 24 | bottom bar |
| expanded | 840 to 1199 | `lg:` | 4 columns | 24 | top bar |
| large | 1200 to 1599 | `xl:` | 5 columns | 24, content up to 1280 | top bar |
| extra-large | ≥ 1600 | `2xl:` | 6 columns | content up to 1280 | top bar |

The grid gap stays 12 at every size.

**Navigation.** Compact and medium keep the app's four destinations (Khám
phá, Danh mục, Tin nhắn, Tôi) in a bottom bar, with "Đăng tin" as the
extended FAB. From expanded up, a 64 px top bar on `surface` holds the brand
mark, the search field (pill, `surfaceContainerHigh`) in the middle, and Tin
nhắn, Đăng tin and the account at the end. The app shows its logo on the
splash only; the web has no splash, and a page opened from a search result
needs to say whose it is, so the mark sits at the start of the top bar.

**Pointer and keyboard.** A mouse can hover, so interactive elements take the
M3 state layer (`state-layer`: 8 % on hover, 10 % on focus and press). Every
control shows a 2 px `primary` focus ring on keyboard focus. Touch targets
stay at least 48 px on a coarse pointer; with a fine pointer a dense control
may go to 40 px.

**Pages, not screens.** Each listing, category, seller and search has its own
URL, rendered on the server with its title, description, Open Graph tags and
`Product` structured data. A sheet in the app becomes a dialog or a side panel
on wide windows when it holds a form, and stays a bottom sheet on compact.

**Interactivity.** A page is HTML first. Only the parts that react to the
buyer ship JavaScript, as React islands: save, offer, the photo carousel,
filters, chat. Parts that depend on who is signed in (the saved heart, the
unread badge) load as server islands so the rest of the page can be cached.

**Motion.** CSS has no springs, so each spring is sampled into `linear()`
with its settle time. Page changes use the View Transitions API with the slow
spatial spring. Everything drops to an instant change under
`prefers-reduced-motion`.

**Theme.** Light, dark from the system, and an override through `data-theme`
on `<html>`, as "Giao diện tối" does in the app. Material You is left out: a
browser has no wallpaper to build a scheme from.
