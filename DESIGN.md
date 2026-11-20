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
| icons, Material Symbols names | `<Icon name="chat-outline-rounded">`, drawn with Remix Icon (see Type and icons) |

## Kept from the app

- The deal model and every rule that follows from it. ShopNexus holds no
  money, so no page may promise protection, mention escrow, a wallet, a
  refund from the platform, or a dispute desk. The old Next.js site on the
  `escrow` branch was built on that model, so take nothing from it without
  checking.
- Colour roles and their meanings: `primary` for the one main action and for
  trust, `tertiary` for bargaining and the agreed price only (on the web
  `tertiary` is the brand teal; see Expanded layout),
  `secondaryContainer` for selected chips and the nav indicator, `error` for
  errors, the scam warning and "Đăng xuất". Depth is tonal; only floating
  elements get a shadow.
- One family at the listed weights and never below the listed line heights:
  Be Vietnam Pro in the app, Inter on the web. The scale is the app's, a step under the M3 baseline
  (body-medium 13/18, title-large 20/26); the two display steps the web adds
  stay at the baseline. Prices in Vietnamese format: `1.250.000 ₫`, and cards
  shorten 10 triệu and above to `12,5 tr ₫`.
- A card or row says the distance under 10 km and the seller's place from
  10 km on ("1,2 km", "Hà Nội"). Search and categories reach every province
  unless a distance is picked; nearness is one tab on Home, not the pitch.
- The snackbar is the app's tonal card: `secondaryContainer`, 16 px corners,
  the kind's icon in a circle with the time-left ring, an optional `primary`
  text action; a failure turns the icon and ring `error`.
- The listing card, the sparkle for AI judgments only, and Vietnamese copy
  with correct diacritics.
- COD and money facts appear only as answers in Cách mua's FAQ, Trợ giúp and
  Điều khoản. Screens carry no money notes, no door checklists and no rules
  panel, because buyers and sellers already know how COD works.
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
extended FAB. From expanded up, the site header carries the search field and the
account actions (see Expanded layout). The app shows its logo on the splash only; the web has no
splash, and a page opened from a search result needs to say whose it is, so
the mark sits at the start of the header.

**Pointer and keyboard.** A mouse can hover, so interactive elements take the
M3 state layer (`state-layer`: 8 % on hover, 10 % on focus and press). Every
control shows a 2 px `primary` focus ring on keyboard focus. Touch targets
stay at least 48 px on a coarse pointer; with a fine pointer a dense control
may go to 40 px. A control drawn smaller still takes a 44 px target on a
coarse pointer: a state layer does, and `tap` adds it to a small link. Hover
styles apply only where the pointer can hover, so a tap leaves nothing lit.

A link to a person's page marked `data-person` (the listing's seller card,
a reviewer, the chat head, the order's other person, a person named in a
message) shows their card once the pointer or keyboard focus rests on it for
300 ms (`PersonCard.astro`, `src/lib/person-card.ts`): face, name, stars, the
figures (sold, year joined), "Theo dõi" and "Xem trang". The figures sit in
one row of equal cells, and another figure takes a cell of its own. The card
opens under the link, or above it when only above has room, and loads once a
page from `/sellers/<id>/peek`, with a skeleton while it is on its way. It
closes 200 ms after the pointer leaves the link and the card, on Esc, on
scroll and on a press elsewhere. Tab from the link enters the card. The
viewer's own card has no "Theo dõi", and a touch screen gets no card.
`FollowButton.astro` draws "Theo dõi" here and on Người bán; "Đang theo dõi"
turns mint. Drafts: `.superdesign/mockups/hover-card-*.html`
(`tools/build_hover_card.py`).

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
  the fast spatial spring. A held card takes the `hover` tone and drops its
  shadow. A link or button without a state layer dims to 65 % while held.
  A bottom bar item (`data-press`) presses its pill wherever it is tapped.
  The switch's knob stretches while held.
- Links and buttons change colour over the fast effects spring.
- A save button (`data-save`) draws both hearts. The filled one pops in with
  a ring, and the snackbar says "Đã lưu tin" with "Xem", or "Đã bỏ lưu tin"
  with "Hoàn tác". The saved state lives in the page until the server is
  wired.
- `snack()` in `src/lib/snackbar.ts` shows the app's snackbar. It rises on
  the spatial spring, the ring round its icon empties over its four seconds,
  and hovering or focusing it stops the time.
- "Chia sẻ" on a listing or a seller page opens `ShareSheet.astro`: a popover
  under the button from 600 px up, a bottom sheet below. It shows the photo,
  title and price (a seller: face, name and listing count), then Zalo,
  Facebook, Telegram, X and Email, plus Messenger on a phone and "Khác" where
  the browser has a system share sheet. "Sao chép liên kết" copies the
  canonical address, turns to a check and says so in the snackbar. The share
  addresses are in `src/lib/share.ts`, the brand glyphs in
  `src/lib/share-marks.ts`.
- Listing photos (`<Photo fade>`) fade in over the `surfaceContainerHigh`
  placeholder once loaded. Every photo from the server holds that tone in
  its box until it arrives.
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
- The listing gallery (`Gallery.astro`) is a row of every photo, one per
  frame width. It swipes on a touch screen and pages with side arrows that
  show on hover with a mouse; a counter, dots on a phone and thumbnails from
  medium up follow it, and the arrow keys move it once it has focus. "Xem N
  ảnh" opens a full-window viewer on the same photo, and closing it leaves
  the gallery on the photo the viewer ended on. Going back from the listing
  flies the photo in view, not the first one, into its card.
- While a list or a pane is on its way, skeletons from `Skeleton.astro` hold
  its place: listing cards, rows, notice lines or chat bubbles in the
  `.skeleton` shimmer. They appear only after 80 ms and then stay at least
  350 ms, so a fast answer does not flash them (`src/lib/skeleton.ts`). The
  items that replace them fade in. A region that did not load shows "Chưa tải
  được." with "Thử lại". A listing photo that has not loaded shimmers in its
  frame the same way, and so does a shipping fee being read again.
- A sort, filter, tab or chat row that opens another page (`data-pending`)
  turns current at once, and skeletons fill the region that page will
  replace. "Xem thêm" appends the next page under the current one
  (`data-more`). Back to that page shows the same pages at the same scroll
  position: the browser's page cache keeps them, and when it has dropped the
  page, `src/lib/keep.ts` puts back the grown regions, Home's feed tab and the
  scroll from sessionStorage.
- A listing tap or a search from the header that is still on the page after
  100 ms covers it, under the header, with a skeleton of the next page
  (`PageSkeletons.astro`, `src/lib/page-skeleton.ts`): the listing's gallery
  frame takes the card's photo, the search's title reads as the results will.
- A carousel row snaps its items to the start and fades the edge that hides
  more items. On a mouse two arrows beside the heading page it by 85 % of its
  width on the spatial spring; on touch the row scrolls directly.
- Under `prefers-reduced-motion` page changes are instant, skeletons and
  sections stand still, figures show their value at once, the snackbar
  appears without moving, and every CSS animation lasts 1 ms.

**Theme.** Light, dark from the system, and an override through `data-theme`
on `<html>`, as "Giao diện tối" does in the app. Material You is left out: a
browser has no wallpaper to build a scheme from.

## Expanded layout

The site follows K2, chosen 2026-11-18. J "Kính mờ" (2026-11-17) was dropped because the user found it
read as AI-built: the mesh wash, glass panels, sparkle icons, pills on every
control and a big headline over a centred search field. Directions K "Gọn" and
L "Thoáng" were drawn on the Superdesign canvas; K won, and K2 is K dressed in
ai-portal's design system (`~/ai-portal/.superdesign/design-system.md`,
"Calm Enterprise") with the brand colours. The mockups are
`.superdesign/mockups/quiet-k2-*.html`, written by
`.superdesign/tools/build_k2.py`; `build_quiet.py` holds K and L.

### Values outside the app's tokens

K2 adds these in `src/styles/j.css`, which `global.css` imports after
`tokens.css`. The console shares `tokens.css`, so K2 stays out of it. Each
value has a dark counterpart.

| Name | Light | Use |
|---|---|---|
| page | `#F7F7F5` | the page background and the header |
| card | `#FFFFFF` | cards, panels, fields |
| ink | `#1A1A19` | text |
| sub | `#5E5E5A` | secondary text |
| faint | `#8C8C87` | meta, placeholders, group labels |
| line | `#ECECE9` | 1 px borders on cards, panels and rows |
| field | `#DCDCD8` | borders on inputs and outline buttons |
| soft | `#F3F3F1` | insets and segmented tracks |
| hover | `#EEEEEB` | hover on rows and ghost buttons |
| brand | `#066A61` | the main action, selected tabs, checkboxes, pagination |
| mint | `#E3F2EF` on `#05554E` | a selected row or chip, an offer |

In code they are `bg-page`, `bg-card`, `text-ink`, `text-sub`, `text-faint`,
`border-line`, `border-field`, `bg-soft`, `bg-hover`, `bg-brand` with
`hover:bg-brand-hover`, and `bg-mint text-on-mint`. `j.css` also points the
M3 surface, `onSurfaceVariant`, `secondaryContainer` and `tertiary` roles at
these greys, mint and teal, so a page still written with M3 class names
matches. The app's tertiary (`#924628` brown, `#FFDBCF` peach) is not used on
the web; the user rejected it on the Chat nhanh offer tray.

### Type and icons

Inter for everything (`@fontsource-variable/inter`), body 14/20. Until it
loads, Arial or Roboto scaled to Inter's width and line (`Inter Fallback` in
`j.css`) stands in, so the text does not reflow when it arrives. Page titles
are 24 to 28 at weight 600, section titles 16 to 17. Icons are Remix Icon
line glyphs, `-fill` for a selected item. Code keeps the app's Material
Symbols names; `src/build/icon-map.mjs` gives each one its Remix glyph and
`src/build/icons.mjs` ships them.

### Shape and depth

Buttons, fields and rows 10 px (`rounded-control`), cards and panels 16 px
(`rounded-card`, `rounded-panel`), the photo inside a card 12 px
(`rounded-tile`). Chips and avatars stay round. Cards have a 1 px line and
take `shadow-lift` and a darker border on hover; popovers, the Chat nhanh box
and the FAB take `shadow-pop`.

### Controls

`btnCls` draws the buttons: `ink` and `primary` are the brand teal, `line` is
white with a field border. `Seg` is a segmented control on a soft track, or
with `variant="tabs"` a row of tabs underlined in teal; both fire
`seg-change`. Filter dropdowns (`Drop`) have a field border and turn mint
when set. A condition read from the query (`AiChip`) is a white chip with ×.

### Header

Sticky, 64 px, the page colour with a hairline under it, inside a 1280 px
content box. The brand mark and "ShopNexus", the search field on every page
(Tìm kiếm fills it with the query), then Thông báo, Tin nhắn with its count,
the avatar and "Đăng tin" in teal. Signed out, those give way to
"Đăng nhập". The sections are in BottomNav below expanded and in Home's rail
above it.

Thông báo and Tin nhắn open a 380 px panel under their button (`Peek.astro`,
full width less 16 px a side on a phone): the latest eight notices, with
"Đánh dấu đã đọc", or the latest six chats, then "Xem tất cả". The rows are
the page's own (`NoticeGroups`, `InboxRow`), loaded from `/notifications/peek`
and `/messages/peek` each time the panel opens. Thông báo shows on phones too;
Tin nhắn there stays the bottom bar's page. Drafts:
`.superdesign/mockups/notif-preview-*.html` (`tools/build_notif_preview.py`).

On a category page and on Tìm kiếm with `?category=`, the search field starts
with a mint chip for the category (its icon only on a phone, where the camera
moves to the dropdown) and searches inside it; × or Backspace in the empty
field drops the chip. A category page has no search field of its own. The
empty field's dropdown shows the recent searches (the server's history when
signed in, this browser's when signed out), six categories and Tìm bằng ảnh.
With words typed it is a listbox: "Tìm “…”" in the scope, again for every
category when scoped, the past searches holding the words and the categories
whose name matches without accents (`src/lib/suggest.ts`). ↑ and ↓ move, Enter
picks, Esc closes. Picking closes the dropdown at once, and after 100 ms the
search page's skeleton covers the page until the results arrive. Drafts:
`.superdesign/mockups/category-search-*.html`
(`tools/build_category_search.py`).

### Footer

A white band under a hairline: the brand line, then Khám phá, Mua và bán and
Hỗ trợ, then the copyright row with the cities.

### Listing card

`ListingCard.astro`: white, 16 px, hairline, the photo inset 8 px. Price,
the title on two lines, condition and place, then a hairline and the seller
(face, name, rating) with the posting age. The seller's face loads with
`sellerLoading`, since it sits lower than the photo.

### Home

From expanded up, a 224 px rail on the left (`HomeRail.astro`): the
categories with counts, the buyer's saved searches (signed out: this
browser's recent searches), Tin đã lưu and Tin của bạn, and the "Mua bằng
COD" card with the mascot. On the right: the day and "Chào <name>" (signed
out: "Đồ cũ quanh bạn") with today's count, two shortcuts (`HomeTiles.astro`:
the order on the way and the offer waiting; signed out: what this browser
viewed and "Đăng nhập"), the feed under the tabs Dành cho bạn, Gần bạn, Mới
nhất, four cards a row, and "Bạn vừa xem" as a sideways row. Below expanded
the categories are a sideways row of chips. The feed loads twelve cards a
page from `/feed` (`?tab=for-you|nearby|newest&after=<cursor>`).

### Tìm kiếm

The count and one summary line with "Báo khi có tin mới". The filter card on
the left: price histogram and bounds, brands, Tình trạng, distance with the
buyer's area. On the right: the query's conditions as removable chips, the
sort tabs with the grid and list switch, four cards a row, and the alert
strip after the eighth.

A click on a result opens the listing page. From 840 px, a mouse resting on
a result or the keyboard inside it shows "Xem nhanh" on the photo's bottom-left
corner (`QuickViewButton.astro`), a button beside the result's link with its
own tab stop. It opens Xem nhanh (`QuickView.astro`): a 400 px drawer on the
right under the header, over the results behind a light scrim. The grid keeps
its columns, the filters stay, and the results behind the drawer are inert.
Below 840 px there is no button, and only a `?view=` address opens Xem nhanh,
as a sheet from the bottom with the buttons at its foot. It shows the gallery,
condition, place, title, price, the listing's buttons with the heart
(`ListingActions.astro`, shared with the listing page), the seller and four
lines of the description, loaded from `/listings/<slug>/quick`. The arrows
step to the previous and next result; "Mở trang" opens the listing page and
the photo flies into its gallery. The address takes `?view=<slug>` as a new
history entry, so Back, Esc, the scrim or Đóng closes the drawer and puts the
focus back on the result's "Xem nhanh", and a reload or a shared link opens
it again. Category pages and Tìm bằng ảnh show the same results.

From 840 px a mouse across a result's photo steps through its first five
photos, one per vertical strip, with a bar of segments on a dark fade at
the photo's bottom (`src/lib/photo-scrub.ts`, from the card's
`photo_thumb_urls`). The other photos load on the first hover. Leaving the
result shows the cover again; keyboard focus and phones do not scrub. A
click flies the photo on show into the listing's gallery, and Back returns
to the cover.
Drafts: `.superdesign/mockups/quick-view-2-*.html`
(`tools/build_quick_view_2.py`); A, a popup beside the hovered card, and C,
the earlier panel that pushed the grid to three columns, are on the canvas
for comparison.

### Listing detail

The gallery, then a sticky right column with the condition, title, price,
"Tin giống vậy" range, "Mua ngay" and "Trả giá" ("Nhắn tin" when the
listing takes no offers), Hỏi nhanh, then the seller card with three numbers
and three of their listings. "Mua ngay" opens the COD order at the listed
price in a dialog (`BuyDialog.astro`, the form from `/listings/<id>/buy`);
the others open Chat nhanh. "Thêm địa chỉ" in that dialog and in Giao COD
shows the address form from Địa chỉ (`AddressForm.astro`) in the dialog,
with a back arrow, and the saved address comes back picked. The seller card's face and name open their page,
and so does a reviewer's. Under the gallery: Mô tả with the listing code and counts, Tình
trạng as a three-step scale, Thông số, and Đánh giá. On a phone the price
and actions come right after the gallery. The page shows no shipping origin,
map or COD checklist.

### Account pages

Tôi, Tin của bạn, Đơn hàng, Đơn bán, Đã lưu, Tin nhắn, Thông báo, Thiết lập
giao COD and Hỗ trợ share one side nav (`AccountNav.astro`): the buyer's
card, then the items with counts, the current one mint.

### Tin nhắn

Three full-height white panes. The rules for
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

The header's "Danh mục" opens a page of every category: the title and count,
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
| the links in `HREF` | `R` in `src/lib/routes.ts`, English paths such as `/search` and `/listings/<id>` |

An icon name has to appear in `src/` as a whole quoted string. A name built
by joining strings is not found and renders nothing; the one exception is a
known name with "-outline" removed, which the plugin adds for every name.
