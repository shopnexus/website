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
with its settle time. Scripts animate with the `motion` library, and
`src/lib/motion.ts` turns each app spring (damping ratio and stiffness) into
its options. `src/styles/motion.css` holds the CSS side and
`src/scripts/page-motion.ts` the scripted side; Layout.astro loads both on
every page.

- A link to another page is a cross-document view transition: the old page
  fades out, the new one fades in and rises 8 px on the default spatial spring.
  The header, the bottom bar and the current-section pill keep their place
  and slide to the new section.
- A listing's photo grows from the card that was clicked into the gallery,
  and shrinks back into the card on the way back. An inline script in
  Layout.astro names the one pair on `pageswap` and `pagereveal`, because the
  same listing can appear twice on a page.
- Pills and round buttons with `state-layer` shrink to 96 % while held, on
  the fast spatial spring. A held card drops to 1 px above its place. The
  switch's knob stretches while held.
- Links and buttons change colour over the fast effects spring.
- A save button (`data-save`) draws both hearts. The filled one pops in with
  a ring, and the snackbar says "Đã lưu tin" with "Xem", or "Đã bỏ lưu tin"
  with "Hoàn tác". The saved state lives in the page until the server is
  wired.
- `snack()` in `src/lib/snackbar.ts` shows the app's snackbar. It rises on
  the spatial spring, the ring round its icon empties over its four seconds,
  and hovering or focusing it stops the time. Share on a listing copies the
  link through it; on a touch screen it opens the system share sheet.
- Listing photos (`<Photo fade>`) fade in over the `surfaceContainerHigh`
  placeholder once loaded.
- A top-level `section` in `main` rises 16 px and fades in over the first
  100 px of scroll after it enters the window. What is on the first screen
  is already past that range and shows as it is. The Home category row comes
  in with a 30 ms stagger (`stagger`).
- A whole number marked `data-count` from 10 up counts from 0 the first
  time it is in view, on a critically damped spring at stiffness 400, so it
  never passes its value.
- Rings fill and price bands grow from the left when the page opens; the
  listing's dot lands on the band after it.
- Dialogs scale up from 96 % over a fading backdrop and leave the same way.
  The ⋮ menus and the "Gỡ liên kết" confirm drop in from their button. A FAQ
  answer slides open.
- In the gallery a thumbnail zooms a little on hover, and the big photo
  settles in from 103 % once the new one has decoded.
- The header gets a 1 px `line` edge once the page has scrolled 48 px under
  it.
- While a feed page is on its way, `ListingSkeleton` cards hold its place:
  the card's frame with a shimmering photo and three lines. They appear only
  after 80 ms and then stay at least 350 ms, so a fast answer does not flash
  them. The cards that replace them fade in. A listing photo that has not
  loaded shimmers in its frame the same way.
- A carousel row snaps its items to the start and fades the edge that hides
  more items. On a mouse two arrows beside the heading page it by 85 % of its
  width on the spatial spring; on touch the row scrolls directly.
- Under `prefers-reduced-motion` page changes are instant, skeletons and
  sections stand still, figures show their value at once, the snackbar
  appears without moving, and every CSS animation lasts 1 ms.

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

J adds these in `src/styles/j.css`, which `global.css` imports after
`tokens.css`. The console shares `tokens.css`, so J stays out of it. Each
value has a dark counterpart.

| Name | Value | Use |
|---|---|---|
| page | `#F5F8F7` | the page background under the wash |
| ink | `#121817` | text, "Đăng tin", the selected item in the account nav |
| line | `#121817` at 7 % | 1 px borders on cards and panels |
| glass | white at 62 %, 18 px blur, saturate 1.4 | the header and floating panels |
| card corner | 22 px | listing cards |
| photo corner | 16 px | the photo inside a card, inset 8 px |

In code they are `bg-page`, `text-ink`, `bg-ink text-on-ink`, `border-line`,
`bg-card` (in place of `bg-white`, so dark mode works), `glass` with
`glass-edge`, `rounded-card` 22, `rounded-panel` 24, `rounded-tile` 18,
`rounded-field` 14, and `shadow-soft`, `shadow-glow` and `shadow-lift`. The
display sizes are `text-j-15` to `text-j-64`, at weight 600 with the tight
tracking below. Badges and buttons over a photo keep `bg-white/90` and use
`text-photo-ink` in both themes.

### Wash

A mesh gradient behind the top 640 px of every page: `primary` at
55 % from the top left, `inversePrimary` at 55 % near the middle,
`tertiaryFixed` at 90 % at the top right and `secondaryContainer` at 70 %
lower down, masked to fade out from 55 % of its height. A film grain (SVG
fractal noise at 22 %, overlay blend) sits on it.

### Header

A glass bar, sticky, 64 px tall, inside a 1360 px content box,
with no shadow, and no border until the page scrolls under it. Brand mark and "ShopNexus"; the section links
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
Prices use tabular figures. Text is never a gradient; gradients are
for backgrounds only.

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

One column on every window, chosen 2026-11-18 in place of the split with a
glass panel on the right, which the user found looked generated. Two drafts, signed in and
signed out. From the top: one line and "Hôm nay tìm gì?" centred over the
64 px search field and the chips; the four tiles in two columns; then three
sideways rows (`Carousel.astro`): Danh mục with counts, "Vừa đăng quanh bạn"
(listings within 10 km, nearest first) and "Đang được tìm nhiều"; then the
feed across the full width, five cards a row on a large window. Signed in,
the line greets the buyer by name, the chips are their searches and alerts,
and the tiles are their order on the way, their offers, their saved listings
and their own listings. Signed out, the line is the area guessed from the IP
with "Đổi", the chips are this browser's recent searches, and the tiles are
the listings this browser viewed, listings like them, the price of a recent
search, and "Giữ 3 tin bạn vừa xem trên mọi máy" with "Đăng nhập". The
signed-out Home has no tagline, no trust figures and no four steps; the feed
opens on "Gợi ý cho bạn".

The feed's tabs and "Xem thêm tin" load pages of ten cards from `/bang-tin`
(`?tab=cho-ban|gan-ban|moi-nhat&trang=`), which renders them from the mock
data in `src/lib/feed.ts` until the server's feed is wired.

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

### Danh mục index

The header's "Danh mục" opens a page of every category: a search field,
popular searches near the buyer with counts, then 11 tiles in four columns.
A tile has a photo, the item count, the listings added today and up to four
subcategories with counts that add up to the category count. The twelfth
tile offers search by sentence or by photo. Below the tiles sit "Vừa đăng
trong mọi danh mục" and "Đang được tìm nhiều". Tiles use photos; the
category drawings are off this page.

### Tìm bằng ảnh

The photo takes the place of the query in the header search field. The
conditions read from the photo are removable sparkle chips, followed by the
usual dropdowns. A sticky left column holds the photo with its crop frame,
"Đổi ảnh", "Chụp" and recent photos; the main column shows the count, the
price range and a grid of matches, then other models of the same brand.

### Not found and no results

A sold or removed listing opens a 404 page: when it sold, a search field
filled with its name, the listing greyed out with "ĐÃ BÁN" and a switch to
follow the seller, then similar listings still for sale. A search with no
match keeps the Tìm kiếm frame, says how many conditions failed, lists ways
to loosen the search with the number of listings each would show, offers
"Báo khi có tin mới" and shows listings close to the query.

### Account settings

Địa chỉ, Bảo mật, Quyền riêng tư, Hoàn thiện hồ sơ and Điểm uy tín use the
account nav with "Tôi" selected, a breadcrumb from Tôi and a side column.
Địa chỉ edits the address book inline. Bảo mật lists sign-in methods,
signed-in devices and "Xóa tài khoản". Quyền riêng tư shows what others see
next to a preview of the public profile. Hoàn thiện hồ sơ counts its steps
from one task list in `j_kit.py` (`PROFILE_TASKS`); the address step is done
when the address book (`ADDRESS_BOOK`) has an address, so Tôi, Địa chỉ,
Hoàn thiện hồ sơ and Thiết lập giao COD show the same state. Identity
verification needs NFC and happens in the app; the web page shows its steps
and a code to open the app. Điểm uy tín shows the score, the tier track, the
buyer's limits, the penalty ladder and the history.

### Help and legal pages

Trợ giúp và an toàn has a question search, answers grouped as Mua hàng, Bán
hàng and An toàn in the app's `MONEY` words, and the scam signs. Gói người
bán follows the app's plans and payment screens: Cơ bản is free, Plus and
Cửa hàng are monthly, Đẩy tin is paid per push, and a plan cannot buy COD
rights or a tier. Quy định đăng tin and Điều khoản share one layout: a
sticky table of contents, the numbered text and a summary card.

## Code

The site renders the J mockups from mock data in `src/data`, the same people
and listings as the mockups, until the server's public endpoints are wired.
A cookie stands in for the session: "Đăng nhập" sets it, "Đăng xuất" clears
it, and account pages send a signed-out visitor to Đăng nhập with `?tiep=`
back to the page. "Giao diện tối" on Tôi is kept in a second cookie, so the
server renders the chosen theme.

| Mockup piece | Code |
|---|---|
| `page()`, `header()`, `footer()` in `j_kit.py` | `src/layouts/Layout.astro`, `Header.astro`, `Footer.astro`, and `BottomNav.astro` below 840 px |
| the other `j_kit.py` pieces | the components at the top of `src/components/` |
| a page group's own parts | `src/components/<group>/`: `home`, `public`, `flows`, `account`, `orders` |
| `icon()` | `<Icon name>`, served from the names `src/build/icons.mjs` finds in `src/` |
| the links in `HREF` | `R` in `src/lib/routes.ts`, Vietnamese paths such as `/tim-kiem` and `/tin/<id>` |

An icon name has to appear in `src/` as a whole quoted string. A name built
by joining strings is not found and renders nothing; the one exception is a
known name with "-outline" removed, which the plugin adds for every name.
