# ShopNexus website design system

The public storefront of ShopNexus, a Vietnamese C2C marketplace for single
items, new or used. Buyers find something near them, message the seller,
haggle, and get it by COD, looking at it at the door before paying the
shipper. ShopNexus holds none of the money. Tagline: "Giá tốt, gần bạn, chốt
nhanh".

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
- Type: Be Vietnam Pro, M3 scale. The web may also use the two M3 display
  steps the app leaves out: displayLarge 57/64 and displayMedium 45/52, both
  weight 400.
- Corners: 4, 8, 12, 16, 20, 28, 32 and full.
- Icons: Material Symbols Rounded, weight 400; outline when inactive, filled
  when selected.

## Directions (2026-11-04)

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
