"""Đã lưu with price changes, and a sold listing that still helps, in K2.

  - Đã lưu: a saved listing whose price moved since the save says so under
    its price, "↓ 400.000 ₫ từ khi bạn lưu" in teal, a rise muted. Listings
    sold or taken down follow the ones on sale under "Không còn bán", greyed;
    a sold one keeps "Đã bán" on its photo and "Xem đồ tương tự".
  - A sold listing's page: the gallery dimmed under "Đã bán", the title, the
    price it sold at and the sale date, no buy, offer or chat. The one action
    is "Báo khi có món giống vậy"; similar listings on sale follow.

    python3 tools/build_saved_sold.py        (run from .superdesign/)

Writes mockups/saved-sold-{saved,listing}.html (1280) and
mockups/saved-sold-{saved,listing}-phone.html (390).
"""
import os
from html import escape

from build import OUT, PHOTOS, TITLE
from build_header import Ids
from build_k2 import card as k2_card, out, ri
from build_notif_preview import bar
from build_price_drop import bottom_nav, phone_header
from build_web_push import account_nav
from common import LISTINGS, img

FAINT = "text-[#8C8C87]"
# Index in LISTINGS, and the move since the save: (arrow, amount) or None.
ON_SALE = [(0, ("down", "400.000 ₫")), (1, None), (2, ("up", "200.000 ₫")), (5, ("down", "500.000 ₫")), (7, None), (10, None)]
ENDED = [(3, "sold"), (4, "gone")]


def moved(change):
    """The line under the price: a drop in teal, a rise muted."""
    if not change:
        return ""
    way, amount = change
    tone = "text-[#066A61]" if way == "down" else FAINT
    arrow = "↓" if way == "down" else "↑"
    return (f'<p class="num mt-0.5 text-[12.5px] leading-4 {tone}">'
            f'<span class="font-medium">{arrow} {amount}</span> <span class="whitespace-nowrap">từ khi bạn lưu</span></p>')


def alert_link():
    return f'<p class="mt-2 flex h-8 items-center gap-1.5 text-[13.5px] font-medium text-[#066A61]">{ri("notification-3-line", 16)}Báo khi giảm giá</p>'


def saved_card(i, change=None, ended=""):
    photo, pr, title, cond, km, area, *_ = LISTINGS[i]
    heart = (f'<span class="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-[#066A61] '
             f'shadow-[0_1px_2px_rgb(20_20_19/.08)]">{ri("heart-fill", 16)}</span>')
    if ended == "gone":
        return f"""<article class="card min-w-0 p-2">
  <div class="relative grid place-items-center rounded-[11px] bg-soft {FAINT}" style="aspect-ratio:1/1">{ri("eye-off-line", 26)}{heart}</div>
  <div class="px-1.5 pb-1 pt-2.5"><p class="text-[14px] leading-5 text-[#5E5E5A]">Tin không còn hiển thị</p></div>
</article>"""
    sold = ended == "sold"
    chip = '<span class="absolute left-2 top-2 rounded-full bg-black/70 px-2.5 py-0.5 text-[12px] font-medium text-white">Đã bán</span>' if sold else ""
    price = (f'<p class="num text-[16px] font-semibold tracking-tight text-[#8C8C87] line-through">{pr}</p>' if sold
             else f'<p class="num text-[16px] font-semibold tracking-tight">{pr}</p>')
    foot = (f'<p class="mt-2 flex h-8 items-center gap-1.5 text-[13.5px] font-medium text-[#066A61]">{ri("search-line", 15)}Xem đồ tương tự</p>'
            if sold else alert_link())
    return f"""<article class="card min-w-0 p-2">
  <div class="relative overflow-hidden rounded-[11px] bg-soft" style="aspect-ratio:1/1"><img src="{img(photo, 400, 400)}" alt="" class="h-full w-full object-cover {"opacity-60 grayscale" if sold else ""}">{chip}{heart}</div>
  <div class="px-1.5 pb-1 pt-2.5">
    {price}{moved(change)}
    <p class="mt-0.5 truncate text-[14px] leading-5 {"text-[#5E5E5A]" if sold else ""}">{escape(title)}</p>
    <p class="meta mt-0.5 truncate">{cond} · {area}</p>
    {foot}
  </div>
</article>"""


def saved_grid(cols, on_sale, ended):
    cards = "".join(saved_card(i, c) for i, c in on_sale)
    divider = (f'<div class="col-span-full mt-3 flex items-center gap-3"><p class="text-[13px] font-medium text-[#5E5E5A]">Không còn bán '
               f'<span class="font-normal {FAINT}">{len(ended)}</span></p><span class="h-px flex-1 bg-[#ECECE9]"></span></div>')
    rest = "".join(saved_card(i, ended=e) for i, e in ended)
    return f'<div class="grid {cols} gap-3">{cards}{divider}{rest}</div>'


# ---------------------------------------------------------------- saved --
def saved_desktop():
    L = Ids("ss-saved")
    body = f"""{bar(L)}
<main class="mx-auto grid max-w-[1280px] grid-cols-[232px_minmax(0,1fr)] gap-8 px-6 pt-6 pb-16">
  {account_nav(L, "Đã lưu")}
  <section class="min-w-0">
    <h1 class="text-[28px] font-semibold tracking-[-0.02em]">Đã lưu</h1>
    <p class="meta mt-1">8 tin</p>
    <div class="mt-5">{saved_grid("grid-cols-4", ON_SALE, ENDED)}</div>
  </section>
</main>"""
    return out("Đã lưu · giá đổi, tin đã bán xuống cuối", body)


def saved_phone():
    body = f"""<div class="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-[var(--bg)]">
  {phone_header()}
  <main class="px-4 pt-4">
    <h1 class="text-[22px] font-semibold tracking-[-0.02em]">Đã lưu</h1>
    <p class="meta mt-0.5">8 tin</p>
    <div class="mt-4">{saved_grid("grid-cols-2", ON_SALE[:4], ENDED)}</div>
  </main>
  {bottom_nav()}
</div>"""
    return out("Đã lưu · điện thoại", body)


# ------------------------------------------------------------- sold page --
SOLD_ON = "14/11/2026"


def gallery(phone=False):
    """The cover dimmed and greyed under one "Đã bán" chip; thumbnails dimmed too."""
    ratio = "aspect-[4/3]" if phone else "aspect-[16/10.5]"
    thumbs = "" if phone else ('<div class="mt-2 grid grid-cols-6 gap-2 p-1">' + "".join(
        f'<img src="{p}" alt="" class="aspect-square w-full rounded-[10px] object-cover opacity-50 grayscale">' for p in PHOTOS) + "</div>")
    return f"""<div class="card p-2">
  <div class="relative overflow-hidden rounded-[11px] bg-soft"><img src="{PHOTOS[0]}" alt="" class="{ratio} w-full object-cover opacity-50 grayscale">
    <span class="absolute inset-0 grid place-items-center"><span class="flex items-center gap-1.5 rounded-full bg-black/70 px-4 py-2 text-[15px] font-semibold text-white">{ri("check-double-line", 18)}Đã bán</span></span>
  </div>{thumbs}
</div>"""


def sold_panel(L, pad="p-6"):
    return f"""<div class="card {pad}">
  <p class="flex flex-wrap items-center gap-1.5 meta"><span class="rounded-[4px] bg-soft px-1.5 py-0.5 font-medium text-[#5E5E5A]">Như mới</span>Bình Thạnh · Đã bán ngày {SOLD_ON}</p>
  <h1 class="mt-3 text-[22px] font-semibold leading-7 tracking-[-0.01em] text-[#5E5E5A]">{escape(TITLE)}</h1>
  <p class="num mt-3 text-[30px] font-semibold leading-9 tracking-[-0.02em] text-[#8C8C87]">5.200.000 ₫</p>
  <div class="mt-5 rounded-[12px] bg-mint p-4">
    <p class="text-[15px] font-medium text-on-mint">Món này đã có chủ</p>
    <p class="mt-0.5 text-[13.5px] text-on-mint/80">Điện thoại · 3.900.000 ₫ – 6.500.000 ₫</p>
    {L.a("mt-3 flex h-11 items-center justify-center gap-2 rounded-[10px] bg-brand text-[15px] font-medium text-white", ri("notification-3-line", 18) + "Báo khi có món giống vậy")}
  </div>
  {L.a("mt-2 flex h-11 items-center justify-center gap-2 rounded-[10px] btn-o text-[15px] font-medium", ri("search-line", 17) + "Xem tin tương tự")}
</div>"""


def similar(n, cols):
    cards = "".join(k2_card(i, p, pr, t, c, km if float(km.split()[0].replace(".", "").replace(",", ".")) < 10 else a, ago)
                    for i, (p, pr, t, c, km, a, _r, ago, _n) in enumerate([LISTINGS[j] for j in [0, 7, 1, 3, 4][:n]]))
    return f'<div class="mt-4 grid {cols} gap-3">{cards}</div>'


def crumbs(L, phone=False):
    tail = "" if phone else f" / {escape(TITLE)}"
    return f'<p class="meta">{L.a("hover:underline", "Khám phá")} / {L.a("hover:underline", "Điện thoại")}{tail}</p>'


def listing_desktop():
    L = Ids("ss-sold")
    body = f"""{bar(L)}
<div class="mx-auto max-w-[1280px] px-6 pt-5 pb-16">
  <div class="flex h-8 items-center">{crumbs(L)}</div>
  <div class="mt-3 grid grid-cols-[minmax(0,1fr)_380px] gap-8">
    <main class="min-w-0">{gallery()}</main>
    <aside class="sticky top-[88px] self-start">{sold_panel(L)}</aside>
  </div>
  <section class="mt-10"><div class="flex items-center justify-between"><h2 class="text-[17px] font-semibold">Tin tương tự</h2>{L.a("text-[13px] mute hover:underline", "Xem tất cả")}</div>
    {similar(5, "grid-cols-5")}</section>
</div>"""
    return out("Tin đã bán · chi tiết", body)


def listing_phone():
    L = Ids("ss-sold-p")
    body = f"""<div class="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-[var(--bg)]">
  {phone_header()}
  <div class="px-4 pt-4"><div class="truncate">{crumbs(L, True)}</div></div>
  <div class="mx-4 mt-3">{gallery(True)}</div>
  <div class="mx-4 mt-4">{sold_panel(L, "p-5")}</div>
  <section class="mx-4 mt-6"><h2 class="text-[17px] font-semibold">Tin tương tự</h2>{similar(2, "grid-cols-2")}</section>
  {bottom_nav()}
</div>"""
    return out("Tin đã bán · điện thoại", body)


if __name__ == "__main__":
    for name, fn in [("saved-sold-saved", saved_desktop), ("saved-sold-saved-phone", saved_phone),
                     ("saved-sold-listing", listing_desktop), ("saved-sold-listing-phone", listing_phone)]:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(fn())
        print("wrote", name)
