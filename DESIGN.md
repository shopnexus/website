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
extended FAB. From expanded up, the site header is a floating pill (see
Expanded layout). The app shows its logo on the splash only; the web has no
splash, and a page opened from a search result needs to say whose it is, so
the mark sits at the start of the header.

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

## Expanded layout (chosen 2026-11-04)

Six directions were drawn on the Superdesign canvas (project "ShopNexus
website"): A (M3 as drawn), B (M3 with web conventions), C "Chợ xóm"
(illustrated neighbourhood), D "Tạp chí" (editorial), E "Hỏi là thấy"
(search-first) and F "Chợ đêm" (dark). The site takes:

- Home from E, on a full-bleed photo hero as in F
  (`.superdesign/tools/build_e.py`, draft "Trang chủ · E. Hỏi là thấy").
- Listing detail from C (`.superdesign/tools/build_c.py`, draft "Chi tiết
  tin · C. Chợ xóm").
- The site shell, header and footer, from C, on every page.

**Header.** A floating pill, `surfaceContainerLowest` with `shadow-float`,
64 px tall, inset 16 px from the top and inside the 1328 px content box. Brand
mark and "ShopNexus"; the section links Khám phá, Danh mục, Bản đồ, Cách mua
(the current one on `secondaryContainer`); "Tìm nhanh" with its `/` shortcut;
Tin nhắn with the `error` badge; "Đăng tin" as the page's one `primary`
button; the avatar. It is sticky, and on Home it floats over the hero photo.

**Footer.** A 28 px rounded block on `inverseSurface` inside the content box:
brand and the `no_hold` sentence, then Khám phá, Mua và bán, Hỗ trợ, and a
bottom line with the cities.

**Corners.** Large containers (hero, panels, the ticket, footer) use
`rounded-xl` (28); cards and photos `rounded-lg` to `rounded-xl`; buttons,
chips, the search field and pins are pills. Small badges use `rounded-sm`.

**Type.** Page headlines use `text-display-large` (57/64); section titles
`text-display-small`; the price on Listing detail `text-display-medium` with
the ₫ at `text-title-large`.

**Home.** The hero is a full-bleed photo of the city at dusk under a black
40 % layer and a black 60 % to transparent scrim, with the header floating on
it. Centred on it: area and count, "Bạn đang tìm gì?", one 76 px search
field that takes a whole sentence, with voice and photo search; the sentence
read back as filter chips the model set (sparkle, removable), a condition
picker and "Thêm điều kiện"; then recent searches and a saved alert. Under the
hero, on `surface`: results in two columns, a dense list on the left (photo,
title, condition, area, distance, rating, matched specs, the AI price note)
with "Báo khi có tin mới" and a sort menu, and on the right "Cách đọc câu
hỏi của bạn", a small map with price pins and follow-up refinements. Ranking
carries no AI mark.

**Listing detail.** Breadcrumbs. On the left, a mint stage with the main
photo ("Chụp trong app" and "Xem 5 ảnh" on it) and the other photos as a
fanned row, with the line counting the photos taken in the app. On the right,
the ticket: three parts joined by a dashed tear line with real notches cut by
a mask, and a drop-shadow that follows the notched outline. Part one: seller,
rating, title, age and saves. Part two: price, the price strip against similar
listings, "Nhắn tin" and "Trả giá", quick questions. Part three: the condition
stamp with its meaning, the COD row with the shipping estimate and its
`MONEY` sentences. Below: "Kiểm 4 điều này khi shipper tới cửa" (Tin ghi with
how to check each claim, the refusal sentence, the model's general tips marked
as not the seller's promise) beside the mascot drawing; Lời người bán and
Thông số; the seller with stats, a review and a map with the route and
distance; similar listings.

**Search results and browsing.** Search results (Home's results and the
Tìm kiếm page) are a list: photo on the left, title, condition, area,
distance and rating, the specs that match the query as chips, the AI price
note, and the price in one right-aligned column, so a buyer compares rows at a
glance. The Tìm kiếm page keeps a "Lưới" toggle for goods judged by their
looks. Browsing surfaces (Danh mục, Vừa đăng, Tin tương tự, a seller's other
listings) use cards, since the photo decides the click there. This departs on
purpose from the app's rule that every browsed listing renders through the
shared card; on compact windows the web follows the app and uses cards.

**Tìm nhanh.** The header's "Tìm nhanh" is hidden on pages that have their
own big search field (Home, Tìm kiếm, Danh mục) and slides in once that field
has scrolled under the header; elsewhere it always shows.

**Art.** The app's mascot and category drawings, plus drawings made with
gpt-image-2.5 from the app's drawings as references (`.superdesign/tools/
gen_art.py`, files in `.superdesign/art/`). Photos carry no capture time.
