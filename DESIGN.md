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
  listed line heights. The scale is the app's, a step under the M3 baseline
  (body-medium 13/18, title-large 20/26); the two display steps the web adds
  stay at the baseline. Prices in Vietnamese format: `1.250.000 ₫`, and cards
  shorten 10 triệu and above to `12,5 tr ₫`.
- A card or row says the distance under 10 km and the seller's place from
  10 km on ("1,2 km", "Hà Nội"). Search and categories reach every province
  unless a distance is picked; nearness is one tab on Home, not the pitch.
- The snackbar is the app's tonal card: `secondaryContainer`, 16 px corners,
  the kind's icon in a circle with the time-left ring, an optional `primary`
  text action; a failure turns the icon and ring `error`.
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
extended FAB. From expanded up, the site header is a glass bar (see
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

## Expanded layout (chosen 2026-11-17)

The 2026-11-04 choice (Home from E, Listing detail and the floating pill
header from C) was dropped on 2026-11-17. The pill header and the search field
on Tìm kiếm were both white pills with a shadow, one under the other, and
pages had large tinted blocks with little in them. Directions G to L were
drawn on the Superdesign canvas (project "ShopNexus website"); the site takes
J "Kính mờ". Its shared pieces are in `.superdesign/tools/j_kit.py`, and each
page group has a builder: `build_j.py` (Tìm kiếm, both homes),
`build_j_public.py`, `build_j_flows.py`, `build_j_account.py` and
`build_j_orders.py`. The older builders still hold data the J builders import
and no longer write mockups.

### Values outside the app's tokens

J adds these, and `tokens.css` needs
them before the pages are built:

| Name | Value | Use |
|---|---|---|
| page | `#F5F8F7` | the page background under the wash |
| ink | `#121817` | text, "Đăng tin", the selected item in the account nav |
| line | `#121817` at 7 % | 1 px borders on cards and panels |
| glass | white at 62 %, 18 px blur, saturate 1.4 | the header and floating panels |
| card corner | 22 px | listing cards |
| photo corner | 16 px | the photo inside a card, inset 8 px |

### Wash

A mesh gradient behind the top 640 px of every page: `primary` at
55 % from the top left, `inversePrimary` at 55 % near the middle,
`tertiaryFixed` at 90 % at the top right and `secondaryContainer` at 70 %
lower down, masked to fade out from 55 % of its height. A film grain (SVG
fractal noise at 22 %, overlay blend) sits on it.

### Header

A glass bar, sticky, 64 px tall, inside a 1360 px content box,
with no border and no shadow. Brand mark and "ShopNexus"; the section links
Khám phá, Danh mục, Bản đồ, Cách mua as text, the current one on a white
capsule; Tin nhắn with the `error` badge; "Đăng tin" as an ink pill; the
avatar. Signed out, Tin nhắn and the avatar give way to a "Đăng nhập" text
button. On Tìm kiếm the search field sits in the header and the page has no
other search field; no page carries "Tìm nhanh" in the header.

### Footer

A white 28 px block with a 1 px line border inside the content
box: brand, the tagline "Đồ cũ giá tốt, xem hàng rồi mới trả" and the
`no_hold` sentence, then Khám phá, Mua và bán, Hỗ trợ, and a line with the
cities under the block. Tin nhắn leaves the footer out because its panes fill
the window.

### Corners

Cards 22, photos 16, panels 24, large panels 28. Buttons, chips,
search fields and segmented controls are pills.

### Type

Display and title text use weight 600 with letter spacing −0.02 em
(−0.035 em at 28 px and above), which departs from the app's weight 400. The
signed-in Home headline is 44/52, page titles 40, section titles 26 to 28.
Prices use tabular figures. The Home headline may carry one word in a
`primary` to `tertiary` gradient.

### Controls

A segmented control with a white thumb that slides under the
selected item (feed tabs, sort, Tình trạng, Mua/Bán). Filters on Tìm kiếm and
Danh mục are pill dropdowns with a count badge. A card lifts 4 px on hover and
its photo scales to 104 %.

### Density

Sections sit 32 to 40 px apart. A tinted block holds content or
is removed; no half of a hero is left for a drawing. The mascot and category
drawings are off the pages.

### Home

Two drafts, signed in and signed out, on the same frame. On the
left: one line, "Hôm nay tìm gì?", the 64 px search field, chips, four tiles,
the categories with counts. On the right: a glass panel of the newest
listings near the buyer. Below: the feed in a segmented control next to
"Đang được tìm nhiều" and "Đăng tin". Signed in, the line greets the buyer by
name, the chips are their searches and alerts, and the tiles are their order
on the way, their offers, their saved listings and their own listings. Signed
out, the line is the area guessed from the IP with "Đổi", the chips are this
browser's recent searches, and the tiles are the listings this browser
viewed, listings like them, the price of a recent search, and "Giữ 3 tin bạn
vừa xem trên mọi máy" with "Đăng nhập". The signed-out Home has no tagline,
no trust figures and no four steps; the feed opens on "Gợi ý cho bạn".

### Tìm kiếm

The search field in the header, the sentence read back as
removable sparkle chips, then pill dropdowns. A filter panel on the left
(price histogram with the median, brands, Tình trạng, distance, a link to the
map). Results are a grid of four cards by default with a list toggle, which
reverses the 2026-11-04 rule that results are a list.

### Listing detail

The gallery on the left, then the seller's description
and condition, then the specs as tiles. On the right, a sticky glass panel
with title, price, the price strip, "Nhắn tin", "Trả giá" and quick
questions, then the COD card with its route map, then the seller. Below, the
four checks at the door with the refusal sentence, then similar listings. The
ticket is gone.

### Account pages

Tôi, Tin của bạn, Đơn hàng, Đơn bán, Đã lưu, Tin nhắn,
Thông báo, Thiết lập giao COD and Hỗ trợ share one side nav
(`account_nav` in `j_kit.py`): a glass card with the buyer's avatar, name and
rating, the items with counts, the current one as an ink pill.

### Tin nhắn

Three full-height glass panes over the wash. The rules for
rows, deal chips, replies, the scam warning and "Chặn và báo cáo" are as
before: a row is a conversation with one person showing the deal the chat
opens on, with `+N` for more deals; chips under the bar switch the deal; a
message replies from a hover action; the scam warning is the `error` shield
on a neutral tag and a banner in the chat; "Chặn và báo cáo" is a dialog.

### Orders

The four steps are Chốt giá, Tạo đơn, Nhận hàng, Đánh giá
(`PHASES` in `j_kit.py`). Đơn bán creates the shipment on one screen through
a linked carrier (GHTK, GHN) or "Tự gửi"; Thiết lập giao COD has two steps,
Địa chỉ lấy hàng and Bên vận chuyển, and no payout step.

### Hỗ trợ

A ticket is its own chat with ShopNexus: the tickets on the left,
the open one's chat in the middle, the order in the ticket and its carrier
timeline on the right. Support tickets stay out of Tin nhắn, which holds
buying and selling chats.
