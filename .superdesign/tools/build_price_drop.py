"""Vừa giảm giá: a listing whose seller lowered the price in the last week
shows a small "Vừa giảm" chip on its photo and the old price struck through
beside the new one. On the listing page the price block says how much and
when. Teal and neutrals only; one chip per card.

    python3 tools/build_price_drop.py        (run from .superdesign/)

Writes mockups/price-drop-{cards,listing}.html (1280) and
mockups/price-drop-{cards,listing}-phone.html (390).
"""
import os
from html import escape

from build import OUT, PHOTOS, TITLE
from build_header import Ids
from build_k2 import S, detail, out, rail, ri
from build_notif_preview import bar
from common import LISTINGS, LOGO, img, where

# The card's chip: white on the photo like the heart, the teal arrow and word.
CHIP = ('<span class="absolute left-2 top-2 flex h-6 items-center gap-0.5 rounded-full bg-white/90 pl-1.5 pr-2 '
        'text-[11px] font-medium leading-4 text-[#066A61] shadow-[0_1px_2px_rgb(20_20_19/.08)]">'
        + ri("arrow-down-line", 13) + "Vừa giảm</span>")
# Index in LISTINGS of the dropped listing, and its price before the drop as a
# card writes it: in triệu from 1 triệu up, so it fits beside the new price.
DROPPED = {5: "5,5 tr"}


def price(pr, was="", size="text-[16px]"):
    num, unit = pr.split(" ", 1)  # "3.900.000 ₫", "11,5 tr ₫"
    old = f'<s class="num min-w-0 truncate text-[12px] font-normal leading-4 text-[#8C8C87]">{was}</s>' if was else ""
    return (f'<p class="flex min-w-0 items-baseline gap-1.5 whitespace-nowrap"><span class="num {size} font-semibold tracking-tight">{num}'
            f'<span class="ml-0.5 text-[12px] font-medium tracking-normal text-[#5E5E5A]">{unit}</span></span>{old}</p>')


def card(i, compact=False):
    photo, pr, title, cond, km, area, *_ = LISTINGS[i]
    was = DROPPED.get(i, "")
    heart = (f'<button type="button" class="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 '
             f'shadow-[0_1px_2px_rgb(20_20_19/.08)]" aria-label="Lưu tin">{ri("heart-line", 16)}</button>')
    return f"""<article class="card min-w-0 p-2">
  <div class="relative overflow-hidden rounded-[11px] bg-soft" style="aspect-ratio:1/1"><img src="{img(photo, 480, 480)}" alt="" class="h-full w-full object-cover">{CHIP if was else ""}{heart}</div>
  <div class="px-1.5 pb-1 pt-2.5">
    {price(pr, was, "text-[15px]" if compact else "text-[16px]")}
    <p class="clamp2 mt-0.5 min-h-[40px] text-[14px] leading-5">{escape(title)}</p>
    <p class="meta mt-1.5 truncate">{cond} · {where(km, area)}</p>
  </div>
</article>"""


# ------------------------------------------------------------- desktop --
def cards_desktop():
    L = Ids("pd")
    tabs = "".join(f'<span class="tab {"on" if i == 0 else ""}">{t}</span>' for i, t in enumerate(["Gợi ý", "Gần bạn", "Mới nhất"]))
    grid = "".join(card(i) for i in [0, 5, 2, 3, 4, 1, 6, 9])
    body = f"""{bar(L)}
<div class="mx-auto grid grid-cols-[224px_1fr] gap-10 pt-6 {S['wrap']}">
  {rail()}
  <main class="min-w-0">
    <p class="meta">Sáng thứ Sáu, 20/11</p><h1 class="mt-1 text-[28px] font-semibold leading-9 tracking-[-0.02em]">Chào Khánh Linh</h1>
    <div class="mt-8 flex gap-6 border-b bd text-[14px]">{tabs}</div>
    <div class="mt-5 grid grid-cols-4 gap-3">{grid}</div>
  </main>
</div>"""
    return out("Vừa giảm giá · thẻ tin", body)


PRICE_BLOCK = f"""<p class="num mt-3 flex flex-wrap items-baseline gap-x-2.5 text-[30px] font-semibold leading-9 tracking-[-0.02em]">4.700.000<span class="-ml-1.5 text-[16px] font-medium tracking-normal text-[#5E5E5A]">₫</span>
          <s class="text-[16px] font-normal tracking-normal text-[#8C8C87]">5.200.000 ₫</s></p>
        <p class="mt-1.5 flex items-center gap-1.5 meta"><span class="flex items-center gap-0.5 rounded-[4px] bg-mint py-0.5 pl-1 pr-1.5 font-medium text-on-mint">{ri("arrow-down-line", 13)}Vừa giảm 500.000 ₫</span>2 ngày trước</p>"""


def listing_desktop():
    html = detail()
    old = '<p class="num mt-3 text-[30px] font-semibold leading-9 tracking-[-0.02em]">5.200.000 ₫</p>\n        <p class="meta mt-1">Tin giống vậy: 4,9 – 5,6 tr ₫</p>'
    assert old in html
    return html.replace(old, PRICE_BLOCK, 1).replace(f"<title>{escape(TITLE)} · ShopNexus</title>", "<title>Vừa giảm giá · chi tiết tin</title>", 1)


# --------------------------------------------------------------- phone --
def phone_header():
    return f"""<header class="sticky top-0 z-30 border-b bd bg-[var(--bg)]">
  <div class="flex h-16 items-center gap-2 px-4">
    <img src="{LOGO}" alt="" class="h-8 w-8">
    <form class="ml-1 flex h-10 min-w-0 flex-1 items-center gap-2 rounded-[10px] bg-white pl-3 pr-1 shadow-[inset_0_0_0_1px_#DCDCD8]">{ri("search-line", 17, "mute")}<input class="h-full min-w-0 flex-1 bg-transparent text-[14px] outline-none" placeholder="Tìm iPhone, xe đạp…"></form>
    <span class="grid h-10 w-10 place-items-center">{ri("notification-3-line", 20)}</span>
  </div>
</header>"""


def bottom_nav():
    items = "".join(f'<span class="flex flex-col items-center justify-center gap-1 text-[12px] {"" if on else "mute"}"><span class="grid h-8 w-16 place-items-center rounded-full {"bg-mint text-on-mint" if on else ""}">{ri(i, 22)}</span>{t}</span>'
                    for i, t, on in [("compass-3-fill", "Khám phá", True), ("apps-2-line", "Danh mục", False), ("chat-3-line", "Tin nhắn", False), ("user-line", "Tôi", False)])
    return f'<nav class="absolute inset-x-0 bottom-0 grid h-20 grid-cols-4 border-t bd bg-[var(--bg)]">{items}</nav>'


def cards_phone():
    grid = "".join(card(i, compact=True) for i in [0, 5, 2, 1])
    body = f"""<div class="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-[var(--bg)]">
  {phone_header()}
  <main class="px-4 pt-4">
    <p class="meta">Sáng thứ Sáu, 20/11</p><h1 class="mt-0.5 text-[22px] font-semibold tracking-[-0.02em]">Chào Khánh Linh</h1>
    <div class="mt-4 flex gap-6 border-b bd text-[14px]"><span class="tab on">Gợi ý</span><span class="tab">Gần bạn</span><span class="tab">Mới nhất</span></div>
    <div class="mt-4 grid grid-cols-2 gap-3">{grid}</div>
  </main>
  {bottom_nav()}
</div>"""
    return out("Vừa giảm giá · thẻ tin, điện thoại", body)


def listing_phone():
    body = f"""<div class="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-[var(--bg)]">
  {phone_header()}
  <div class="flex items-center gap-1 px-4 pt-4">
    <p class="meta min-w-0 flex-1 truncate">Khám phá › Điện thoại › {escape(TITLE)}</p>
    <span class="grid h-8 w-8 place-items-center mute">{ri("heart-line", 16)}</span>
    <span class="grid h-8 w-8 place-items-center mute">{ri("share-line", 16)}</span>
  </div>
  <div class="mx-4 mt-3 card p-2"><img src="{PHOTOS[0]}" alt="" class="aspect-[4/3] w-full rounded-[11px] object-cover"></div>
  <div class="mx-4 mt-4 card p-5">
    <p class="flex items-center gap-1.5 meta"><span class="rounded-[4px] bg-mint px-1.5 py-0.5 font-medium text-on-mint">Như mới</span>2,1 km · 2 giờ trước</p>
    <h1 class="mt-3 text-[20px] font-semibold leading-7">{escape(TITLE)}</h1>
    {PRICE_BLOCK}
    <div class="mt-5 flex flex-col gap-2">
      <button type="button" class="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-brand text-[15px] font-medium text-white">{ri("shopping-bag-3-line", 18)}Mua ngay</button>
      <button type="button" class="btn-o flex h-11 items-center justify-center gap-2 rounded-[10px] text-[15px] font-medium">{ri("price-tag-3-line", 18)}Trả giá</button>
    </div>
  </div>
  {bottom_nav()}
</div>"""
    return out("Vừa giảm giá · chi tiết tin, điện thoại", body)


if __name__ == "__main__":
    for name, fn in [("price-drop-cards", cards_desktop), ("price-drop-listing", listing_desktop),
                     ("price-drop-cards-phone", cards_phone), ("price-drop-listing-phone", listing_phone)]:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(fn())
        print("wrote", name)
