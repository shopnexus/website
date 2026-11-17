# ShopNexus website design system

The public storefront of ShopNexus, a Vietnamese C2C marketplace for single
items, new or used. Buyers find something, message the seller,
haggle, and get it by COD, looking at it at the door before paying the
shipper. ShopNexus holds none of the money. Tagline: "Đồ cũ giá tốt, xem
hàng rồi mới trả" (the app's `auth_tagline`).

The reference is the Android app's system, `app/.superdesign/design-system.md`:
product, deal model, colour roles, type scale, corner scale, motion, the
listing card, the `MONEY` sentences and the copy rules all come from there.
`website/DESIGN.md` records what the web changes. Tokens are in
`src/styles/tokens.css`; the mockup builders in `tools/common.py` copy them.

## Tokens

- Colour: the app's M3 roles (seed #066A61, tertiary from #924628). `primary`
  is the one main action and trust; `tertiary` is bargaining and the agreed
  price only; `secondaryContainer` fills selected chips and indicators; depth
  is tonal, and only floating elements take the level-3 shadow.
- Type: Be Vietnam Pro on the app's scale, a step under the M3 baseline
  (`TYPE` in `tools/common.py`). The web may also use the two M3 display
  steps the app leaves out, at the baseline: displayLarge 57/64 and
  displayMedium 45/52, both weight 400.
- Corners: 4, 8, 12, 16, 20, 28, 32 and full.
- Icons: Material Symbols Rounded, weight 400; outline when inactive, filled
  when selected.

## Direction J, "Kính mờ" (chosen 2026-11-17, current)

Every page follows J; the rules are in `website/DESIGN.md` under "Expanded
layout". The user found the C pill header too close to the Tìm kiếm search
bar, the pages too empty, and stock M3 dull. Round one drew G "Sạp báo"
(editorial, flat header), H "Phố đêm" (dark masthead) and I "Chợ sticker"
(riso, hard shadows); G came closest but read old and square. Round two kept
G's frame and drew J (glass and mesh) and L (bento); a clay-3D K was dropped
on request. J won.

- Shared pieces: `tools/j_kit.py` (CSS, wash, `header`, `footer`, `card`,
  `price`, `seg`, `account_nav`, `panel`, `btn`, `money_line`, `crumbs`,
  `switch`, `drop`, `PHASES` and the steppers). Page builders import from it
  and define only page-specific parts.
- Builders: `build_j.py` (Tìm kiếm, Home signed in, Home signed out),
  `build_j_public.py` (Danh mục, Chi tiết tin, Người bán, Bản đồ),
  `build_j_flows.py` (Cách mua, Đăng tin, Giao COD, Hỗ trợ),
  `build_j_account.py` (Đăng nhập, Tôi, Thông báo, Tin nhắn),
  `build_j_orders.py` (Đơn hàng, Đơn COD, Đơn bán, Tin của bạn, Đã lưu,
  Thiết lập giao COD). Run from `.superdesign/`.
- Drafts: each page's existing draft carries J as its newest version; the
  signed-out Home is its own draft. G, H, I, J and L candidates stay on the
  canvas as separate drafts for reference.
- The older builders (`build.py`, `build_c.py`, `build_e.py`,
  `build_pages.py` and the rest) still hold the mock data the J builders
  import; their `__main__` writes nothing.
- Values outside the app's tokens (page `#F5F8F7`, ink `#121817`, the 7 %
  line, glass, 22 px cards) are listed in `website/DESIGN.md` and need adding
  to `tokens.css` before the pages are built.

## Directions (2026-11-04, superseded by J)

Chosen after six directions (A to F): Home from E "Hỏi là thấy"
(`tools/build_e.py`) on a full-bleed photo hero as in F, Listing detail from
C "Chợ xóm" (`tools/build_c.py`), and C's floating pill header and dark
footer on every page. The rules are in `website/DESIGN.md` under "Expanded
layout". The other drafts stay on the canvas for reference; new pages follow
this choice.

Desktop, 1440 wide, Home and Listing detail, drawn twice.

1. M3 as drawn. The app's layout carried to an expanded window the way M3
   prescribes: a navigation rail with the four destinations and the "Đăng
   tin" FAB, the pill search field, listing photos at 20 px corners, hero and
   panels at 28 px, pill buttons, grouped lists, wide spacing, type no larger
   than displaySmall.
2. M3 adapted for the web. Same colours, type family and copy. A 64 px top bar
   with the brand mark, a central search field and the account actions; a
   footer with category and help links; breadcrumbs on detail. Cards and photos
   at 12 px, hero at 16 px, buttons at 12 px instead of pills (chips stay
   pills). displayLarge for the Home headline. Denser cards: seller rating and
   posting time on the card. Hover shown with the M3 state layer.

## Copy

Vietnamese with correct diacritics, real places (Q.1, Bình Thạnh, Thủ Đức,
Cầu Giấy), VND prices as `1.250.000 ₫`, cards shorten 10 triệu and above to
`12,5 tr ₫`. Every step touching money carries its `MONEY` sentence word for
word. No escrow, wallet, deposit or platform refund anywhere.

## Direction C, "Chợ xóm" (2026-11-04, alternative to B)

Built by `tools/build_c.py`. A warm, illustrated neighbourhood market: a
floating pill header, a hero of a Bình Thạnh street drawn in the mascot style,
listing photos as polaroids with `tertiaryFixed` price tags (the app's
Chào mừng price tag), an SVG area map with price pins and the Sài Gòn river,
the app's category and deal-moment drawings as tiles and a storyboard, and a
Listing detail laid out as an item ticket (perforated sections, a condition
stamp, Tin ghi with how to check each claim at the door). Large containers use
the app's own 28 px corners and pills. New art comes from `tools/gen_art.py`
(gpt-image-2.5 through the user's proxy, with the app's drawings as
references) and is stored in `art/`; public URLs are in
`tools/art_urls.json`.
