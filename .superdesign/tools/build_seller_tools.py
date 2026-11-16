"""Tin của bạn, Đã lưu and Thiết lập giao COD, in the chosen style (C's shell).

    python3 tools/build_seller_tools.py        (run from .superdesign/)

Follows the app's current screens: Tin của bạn without Đẩy tin (the server sells
no boosts), and a COD setup in two steps, the pickup address from the address
book and the seller's existing GHTK or GHN account, with no payout step.
"""
import json
import os
from html import escape

from build import OUT, a
from build_c import ART, CSS, SELLER, footer, header
from common import head, icon, img, split_price, where

HERE = os.path.dirname(os.path.abspath(__file__))
ART = {**ART, **json.load(open(os.path.join(HERE, "art_sh.json"))), **json.load(open(os.path.join(HERE, "art_seller_tools.json")))}

# Verbatim from app/.superdesign/tools/common.py MONEY.
MONEY = dict(
    no_hold="ShopNexus không giữ tiền và không nhận cọc.",
    cod_seller="Bên vận chuyển chuyển tiền hàng cho bạn 1–2 ngày sau khi người mua nhận.",
)

PAGE_CSS = CSS + """
  .seg > * { border-radius: 4px; }
  .seg > :first-child { border-top-left-radius: 9999px; border-bottom-left-radius: 9999px; }
  .seg > :last-child { border-top-right-radius: 9999px; border-bottom-right-radius: 9999px; }
  .row-hover:hover { background: var(--md-surface-container); }
"""


def money(key, ic="info-outline-rounded"):
    return f'<p class="flex gap-2 text-body-m text-on-surface-variant">{icon(ic, 18, "mt-0.5")}<span>{MONEY[key]}</span></p>'


def page(title, body, tonal_post=False):
    top = header(quick="always")
    if tonal_post:  # the page has its own primary action; the header's "Đăng tin" steps down to tonal
        top = top.replace("bg-primary pl-4 pr-5 text-label-l text-on-primary", "bg-secondary-container pl-4 pr-5 text-label-l text-on-secondary-container", 1)
    return head(title, PAGE_CSS) + f"""<body>
<div class="min-h-screen bg-surface pb-2 font-sans text-on-surface">
  {top}
  <main class="mx-auto max-w-[1328px] px-6">{body}</main>
  {footer()}
</div>
</body>
</html>"""


def crumbs(*parts):
    out = []
    for i, p in enumerate(parts[:-1]):
        out.append(a(f"crumb-{i}", "hover:underline", p) + icon("chevron-right-rounded", 16))
    return f'<nav class="mt-6 flex items-center gap-1.5 text-body-s text-on-surface-variant">{"".join(out)}<span class="text-on-surface">{parts[-1]}</span></nav>'


def tonal(label, ic=None, cls=""):
    return (f'<button type="button" class="state flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full bg-secondary-container px-4 text-label-l text-on-secondary-container {cls}">'
            f'{icon(ic, 18) if ic else ""}{label}</button>')


def outlined(label, ic=None, cls=""):
    return (f'<button type="button" class="state flex h-10 items-center gap-1.5 whitespace-nowrap rounded-full border border-outline-variant px-4 text-label-l text-on-surface-variant {cls}">'
            f'{icon(ic, 18) if ic else ""}{label}</button>')


def icon_btn(label, ic):
    return f'<button type="button" class="state grid h-10 w-10 place-items-center rounded-full text-on-surface-variant" aria-label="{label}">{icon(ic, 22)}</button>'


# ------------------------------------------------------------ Tin của bạn --
ON_SALE = [
    dict(photo="1510915361894-db8b60106cb1", title="Đàn guitar acoustic Yamaha F310, kèm bao", price="1.900.000 ₫",
         stats=(86, 2, 5, "12 ngày"), extra="price"),
    dict(photo="1503602642458-232111445657", title="Ghế đôn gỗ thông cao 45 cm", price="350.000 ₫",
         stats=(24, 1, 1, "5 ngày"), extra=("receipt-long-outline-rounded", "Đơn COD · chờ bạn tạo đơn")),
    dict(photo="1505740420928-5e560c06d30e", title="Tai nghe chống ồn Sony WH-1000XM4, fullbox", price="3.200.000 ₫",
         stats=(58, 3, 2, "9 ngày"), extra=("local-shipping-outline-rounded", "Đơn COD · đang giao cho Minh Thư")),
    dict(photo="1510557880182-3d4d3cba35a5", title="iPhone X 64GB, pin 86%, máy zin chưa sửa", price="3.900.000 ₫",
         stats=(86, 4, 7, "6 ngày"), extra=None, menu=True),
    dict(photo="1586023492125-27b2c045efd7", title="Ghế bành bọc vải vàng mù tạt, khung gỗ sồi", price="1.600.000 ₫",
         stats=(31, 0, 2, "20 ngày"), extra="hidden"),
]
# A draft names what the account lacks first, then the days left before the 30-day end.
DRAFTS = [
    dict(photo="1611186871348-b1ce696e52c9", title="MacBook Air M1 8/256GB", line="4 ảnh · 11.500.000 ₫", label=("schedule-outline-rounded", "Còn 2 ngày")),
    dict(photo="1603891128711-11b4b03bb138", title="iPhone 11 64GB Trắng, máy zin", line="3 ảnh · chưa có giá", label=("cloud-off-outline-rounded", "Chưa đồng bộ")),
]
MENU = [("edit-outline-rounded", "Sửa tin"), ("sell-outline-rounded", "Đánh dấu đã bán"), ("visibility-off-outline-rounded", "Ẩn tin"), ("delete-outline-rounded", "Xóa tin")]


def card_menu():
    items = "".join(f'<li class="flex h-12 items-center gap-3 px-4 text-body-l {"bg-on-surface/[.08]" if i == 1 else ""}">{icon(ic, 22, "text-on-surface-variant")}{t}</li>'
                    for i, (ic, t) in enumerate(MENU))
    return f'<ul role="menu" class="absolute right-3 top-14 z-20 w-[232px] overflow-hidden rounded-lg bg-surface-container py-1 shadow-float">{items}</ul>'


def listing_row(it):
    num, unit = split_price(it["price"])
    v, c, s, d = it["stats"]
    hidden = it["extra"] == "hidden"
    stats = "".join(f'<span class="flex items-center gap-1" title="{t}">{icon(ic, 16)}{n}</span>' for ic, n, t in
                    [("visibility-outline-rounded", v, "Lượt xem"), ("chat-outline-rounded", c, "Người hỏi"),
                     ("favorite-outline-rounded", s, "Lượt lưu"), ("schedule-outline-rounded", d, "Đã đăng")])
    extra = ""
    if it["extra"] == "price":
        extra = (f'<span class="flex items-center gap-1 text-label-m text-tertiary">{icon("auto-awesome-rounded", 16)}Cao hơn 12%</span>'
                 f'{tonal("Giảm còn 1,7 tr", "trending-down-rounded")}')
    elif it["extra"] == "hidden":
        extra = f'<span class="flex items-center gap-1.5 text-body-m text-on-surface-variant">{icon("visibility-off-outline-rounded", 18)}Đã ẩn</span>'
    elif it["extra"]:
        ic, label = it["extra"]
        extra = a("order", "state flex h-12 items-center gap-3 rounded-lg bg-primary-container px-4 text-label-l text-on-primary-container",
                  icon(ic, 20) + label + icon("chevron-right-rounded", 20))
    dim = "opacity-50" if hidden else ""
    return f"""<article class="row-hover relative rounded-xl bg-surface-container p-4">
  <div class="flex items-center gap-4">
    <img src="{img(it["photo"], 160, 160)}" alt="{escape(it["title"])}" class="h-14 w-14 shrink-0 rounded-lg object-cover {dim}">
    <div class="min-w-0 flex-1 {dim}">
      <h3 class="truncate text-title-s">{escape(it["title"])}</h3>
      <p class="text-title-m">{num}<span class="text-body-m text-on-surface-variant">{unit}</span></p>
      <div class="mt-0.5 flex items-center gap-4 text-body-s text-on-surface-variant">{stats}</div>
    </div>
    <div class="flex shrink-0 items-center gap-3">{extra}</div>
    {icon_btn("Tùy chọn cho " + escape(it["title"]), "more-vert")}
  </div>
  {card_menu() if it.get("menu") else ""}
</article>"""


def rating(rated):
    if rated is None:
        return ""
    if rated:
        return f'<span class="flex shrink-0 items-center gap-1 text-label-m">{icon("star-rounded", 16, "text-primary")}5</span>'
    return f'<span class="flex shrink-0 items-center gap-1 text-body-s text-on-surface-variant">{icon("hourglass-empty-rounded", 14)}Chờ đánh giá</span>'


def my_listings():
    tiles = "".join(f"""<div class="flex items-center gap-4 rounded-lg bg-surface-container-lowest px-5 py-4">
  <span class="grid h-11 w-11 place-items-center rounded-full bg-secondary-container text-on-secondary-container">{icon(ic, 22)}</span>
  <div><p class="text-headline-s">{n}</p><p class="text-body-s text-on-surface-variant">{l}</p></div></div>"""
                    for ic, n, l in [("visibility-outline-rounded", "214", "Lượt xem"), ("chat-outline-rounded", "9", "Người hỏi"),
                                     ("favorite-outline-rounded", "17", "Lượt lưu")])
    tabs = "".join(f'<span class="flex h-11 flex-1 items-center justify-center gap-2 px-5 text-label-l {"bg-secondary-container text-on-secondary-container" if i == 0 else "bg-surface-container-high text-on-surface-variant"}">'
                   f'{icon("check-rounded", 18) if i == 0 else ""}{t}<span class="text-label-m opacity-80">{n}</span></span>'
                   for i, (t, n) in enumerate([("Đang bán", len(ON_SALE)), ("Nháp", len(DRAFTS)), ("Đã bán", 14)]))
    rows = "".join(listing_row(it) for it in ON_SALE)
    drafts = "".join(f"""<li class="flex items-center gap-3 py-3 {"border-t border-outline-variant" if i else ""}">
  <img src="{img(d["photo"], 120, 120)}" alt="" class="h-14 w-14 shrink-0 rounded-lg object-cover">
  <div class="min-w-0 flex-1"><p class="truncate text-title-s">{d["title"]}</p>
    <p class="flex items-center gap-1 text-body-s text-on-surface-variant">{icon("photo-library-outline-rounded", 14)}{d["line"]}</p>
    <p class="flex items-center gap-1 text-body-s text-on-surface-variant">{icon(d["label"][0], 14)}{d["label"][1]}</p></div>
  {tonal("Tiếp tục")}</li>""" for i, d in enumerate(DRAFTS))
    sold = "".join(f"""<li class="flex items-center gap-3 py-2.5 {"border-t border-outline-variant" if i else ""}">
  <img src="{img(p, 120, 120)}" alt="" class="h-14 w-14 shrink-0 rounded-lg object-cover">
  <div class="min-w-0 flex-1"><p class="truncate text-body-m">{t}</p>
    <p class="flex items-center gap-1.5 text-body-s text-on-surface-variant">{f'<img src="{img(face, 48, 48)}" alt="" class="h-5 w-5 rounded-full object-cover">' if face else ""}<span class="truncate">{who}</span></p></div>
  {rating(rated)}</li>"""
                   for i, (p, t, face, who, rated) in enumerate([
                       ("1526170375885-4d8ecf77b99f", "Máy ảnh Polaroid OneStep 2", "1494790108377-be9c29b29330", "Minh Anh · Thứ Hai", True),
                       ("1593764592116-bfb2a97c642a", "Fixie đen mờ size 50", "1506794778202-cad84cf45f1d", "Quốc Bảo · Hôm nay", False),
                       ("1585515320310-259814833e62", "Máy xay sinh tố 2L", None, "Người ngoài ShopNexus · 28/10", None)]))
    body = f"""
    {crumbs("Tôi", "Tin của bạn")}
    <section class="mt-4 flex items-end justify-between">
      <div><h1 class="text-display-s">Tin của bạn</h1><p class="mt-2 text-body-l text-on-surface-variant">{len(ON_SALE)} tin đang bán · 14 tin đã bán</p></div>
      <div class="flex gap-2">{outlined("Quay video", "videocam-outline-rounded")}{outlined("Chụp ảnh", "photo-camera-outline-rounded")}</div>
    </section>
    <section class="relative mt-6 overflow-hidden rounded-xl bg-secondary-container p-6 pr-[240px]">
      <p class="text-title-s text-on-secondary-container">7 ngày qua</p>
      <div class="mt-3 grid grid-cols-3 gap-3">{tiles}</div>
      <img src="{ART["art_listings"]}" alt="" class="absolute -bottom-4 right-6 w-[200px]">
    </section>
    <div class="mt-8 grid grid-cols-[minmax(0,1fr)_380px] gap-8">
      <section class="min-w-0">
        <div class="seg flex gap-0.5">{tabs}</div>
        <div class="mt-5 flex flex-col gap-3">{rows}</div>
      </section>
      <aside class="flex min-w-0 flex-col gap-4 self-start">
        <div class="rounded-xl bg-surface-container-low p-5">
          <h2 class="text-title-l">Nháp</h2>
          <ul class="mt-1">{drafts}</ul>
        </div>
        <div class="rounded-xl bg-surface-container-low p-5">
          <h2 class="text-title-l">Vừa bán</h2>
          <ul class="mt-1">{sold}</ul>
          {a("sold-all", "mt-2 inline-flex items-center gap-1 text-label-l text-primary hover:underline", "Xem 14 tin đã bán" + icon("arrow-forward-rounded", 16))}
        </div>
      </aside>
    </div>"""
    return page("Tin của bạn · ShopNexus", body)


# ----------------------------------------------------------------- Đã lưu --
# In the order the 5-column grid packs them, two kinds to a row.
# (photo, price, title, condition, km, area, change): change is ("cut", "300k"), ("ai", judgment), "sold" or None.
SAVED_GROUPS = [
    ("Xe đạp", [
        ("1505705694340-019e1e335916", "2.100.000 ₫", "Xe đạp single speed trắng size 52", "Như mới", "1,2 km", "Bình Thạnh", ("cut", "300k")),
        ("1529422643029-d4585747aaf2", "2.900.000 ₫", "Giant Escape 3 size M", "Đã dùng", "2,5 km", "Q.3", ("ai", "Rẻ hơn 9%")),
        ("1571068316344-75bc76f77890", "2.600.000 ₫", "Xe đạp cổ điển khung thép, yên da", "Đã dùng", "3,8 km", "Q.2", "sold"),
    ]),
    ("Nội thất", [
        ("1586023492125-27b2c045efd7", "1.600.000 ₫", "Ghế bành bọc vải vàng mù tạt", "Đã dùng", "5,5 km", "Q.2", None),
        ("1580480055273-228ff5388ef8", "950.000 ₫", "Ghế xoay vải be chân gỗ", "Như mới", "3,9 km", "Bình Thạnh", None),
    ]),
    ("Điện thoại", [
        ("1632661674596-df8be070a5c5", "5.200.000 ₫", "iPhone 13 Pro 128GB", "Như mới", "1,6 km", "Phú Nhuận", ("cut", "400k")),
        ("1616348436168-de43ad0db179", "6.900.000 ₫", "iPhone 12 128GB", "Đã dùng", "0,8 km", "Q.1", None),
        ("1610945415295-d9bbf067e59c", "7.500.000 ₫", "Galaxy S21 Ultra 256GB", "Đã dùng", "5,1 km", "Tân Bình", None),
    ]),
    ("Đồ điện tử", [
        ("1526170375885-4d8ecf77b99f", "1.750.000 ₫", "Máy ảnh Polaroid OneStep 2", "Như mới", "1,8 km", "Phú Nhuận", None),
        ("1546868871-7041f2a55e12", "4.500.000 ₫", "Apple Watch Series 7 45mm", "Đã dùng", "1,6 km", "Q.3", None),
        ("1516035069371-29a1b244cc32", "26,5 tr ₫", "Sony A7 III kèm lens 28-70 và 50mm f/1.8", "Đã dùng", "1.140 km", "Hà Nội", None),
    ]),
    ("Thời trang", [
        ("1542291026-7eec264c27ff", "1.290.000 ₫", "Giày Nike Free RN size 42", "Mới", "2,2 km", "Q.10", None),
    ]),
]
COMPARE = "Điện thoại"


def saved_card(photo, price, title, cond, km, area, change):
    num, unit = split_price(price)
    sold = change == "sold"
    photo_html = f'<img src="{img(photo, 480, 600)}" alt="{escape(title)}" class="h-full w-full object-cover {"grayscale opacity-60" if sold else ""}">'
    overlay = (f'<span class="absolute left-3 top-3 rounded-full bg-inverse-surface px-3 py-1 text-label-m text-inverse-on-surface">Đã bán</span>'
               if sold else
               f'<span class="absolute bottom-3 left-3 rounded-full bg-surface-container-lowest px-3 py-1 text-title-m text-on-surface shadow-float">{num}<span class="text-body-s text-on-surface-variant">{unit}</span></span>')
    heart = f'<button type="button" class="state absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-surface-container-lowest/90 text-primary" aria-label="Bỏ lưu">{icon("favorite-rounded", 22)}</button>'
    if sold:
        foot = a("similar", "state -ml-3 mt-1 inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-label-l text-primary", icon("search-rounded", 18) + "Xem đồ tương tự")
    elif isinstance(change, tuple):
        kind, v = change
        ic = "arrow-downward-rounded" if kind == "cut" else "auto-awesome-rounded"
        foot = f'<p class="mt-1 flex items-center gap-1 text-label-m text-tertiary">{icon(ic, 14)}{v}</p>'
    else:
        foot = ""
    return f"""<article class="lift min-w-0">
  <div class="relative overflow-hidden rounded-xl bg-surface-container-high" style="aspect-ratio: 4 / 5">{photo_html}{overlay}{heart}</div>
  <h3 class="mt-3 line-clamp-1 text-body-l {"text-on-surface-variant" if sold else "text-on-surface"}">{escape(title)}</h3>
  <p class="mt-0.5 text-body-s text-on-surface-variant">{cond} · {where(km, area)}</p>
  {foot}
</article>"""


def compare_table():
    tier = lambda name: f'<span class="inline-flex items-center gap-1 rounded-full bg-surface-container-high px-2.5 py-0.5 text-label-m">{icon("workspace-premium-outline-rounded", 14)}{name}</span>'
    cols = [("1632661674596-df8be070a5c5", "iPhone 13 Pro", "5,2 tr", "Như mới", "88%", "1,6 km", tier("Xuất sắc")),
            ("1616348436168-de43ad0db179", "iPhone 12", "6,9 tr", "Đã dùng", "84%", "0,8 km", tier("Tin cậy")),
            ("1610945415295-d9bbf067e59c", "Galaxy S21 Ultra", "7,5 tr", "Đã dùng", "81%", "5,1 km", tier("Mới"))]
    best = {"Giá": 0, "Tình trạng": 0, "Pin": 0, "Cách bạn": 1, "Người bán": 0}
    rows = [("Giá", "sell-outline-rounded", 2), ("Tình trạng", "visibility-outline-rounded", 3), ("Pin", "battery-full-rounded", 4),
            ("Cách bạn", "near-me-outline-rounded", 5), ("Người bán", "person-outline-rounded", 6)]
    head_html = "".join(f'<th class="px-2 pb-2 text-left text-label-m font-normal text-on-surface-variant">{c[1]}</th>' for c in cols)
    dot = '<span class="h-1.5 w-1.5 shrink-0 rounded-full bg-primary"></span>'
    body_html = "".join(
        f'<tr class="border-t border-outline-variant"><td class="py-2.5 pr-2 text-body-s text-on-surface-variant"><span class="flex items-center gap-1.5">{icon(ic, 16)}{label}</span></td>'
        + "".join(f'<td class="px-2 py-2.5 text-body-m {"text-primary" if best.get(label) == j else "text-on-surface"}"><span class="flex items-center gap-1.5 whitespace-nowrap">'
                  f'{c[k]}{dot if best.get(label) == j else ""}</span></td>' for j, c in enumerate(cols)) + "</tr>"
        for label, ic, k in rows)
    return f"""<aside class="col-span-2 mt-14 flex flex-col rounded-xl bg-surface-container-low p-5">
  <table class="w-full"><thead><tr><th class="w-[96px]"></th>{head_html}</tr></thead><tbody>{body_html}</tbody></table>
  <div class="mt-4 rounded-lg bg-surface-container-lowest p-4">
    <p class="flex items-center gap-1.5 text-title-m">{icon("auto-awesome-rounded", 18, "text-primary")}iPhone 13 Pro đáng tiền nhất</p>
    <p class="mt-1.5 text-body-m text-on-surface-variant">Pin 88%, như mới, người bán Xuất sắc. Nếu cần rẻ, iPhone 12 rẻ hơn 4 triệu và gần bạn nhất.</p>
    {tonal("Nhắn người bán", "chat-outline-rounded", "mt-3")}
  </div>
</aside>"""


def saved():
    searches = [("xe đạp đi làm dưới 3 triệu", "4 tin mới · Bình Thạnh · 5 km", True), ("iPhone 128GB dưới 8 triệu", "Chưa có tin mới · TP.HCM", False)]
    search_html = "".join(
        f"""<div class="row-hover flex items-center gap-4 rounded-xl bg-surface-container-low p-4">
  <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-container-lowest text-on-surface-variant">{icon("search-rounded", 22)}</span>
  <div class="min-w-0 flex-1"><p class="truncate text-title-s">{q}</p><p class="mt-0.5 text-body-s {"text-primary" if new else "text-on-surface-variant"}">{n}</p></div>
  <button type="button" class="state grid h-10 w-10 place-items-center rounded-full text-on-surface-variant" aria-label="Bỏ theo dõi">{icon("notifications-active-rounded", 22)}</button>
</div>""" for q, n, new in searches)
    # Groups sit side by side in the 5-column grid; the comparison takes the two columns beside its cards.
    groups = ""
    for name, items in SAVED_GROUPS:
        cards = "".join(saved_card(*it) for it in items)
        on_sale = sum(1 for it in items if it[6] != "sold")
        n = len(items)
        groups += f"""<section class="min-w-0" style="grid-column: span {n} / span {n}">
  <div class="flex h-10 items-center justify-between"><h2 class="text-title-s text-primary">{name}</h2>{tonal("So sánh", "compare-arrows-rounded") if on_sale >= 2 and name in ("Xe đạp", COMPARE) else ""}</div>
  <div class="mt-4 grid gap-5" style="grid-template-columns: repeat({n}, minmax(0, 1fr))">{cards}</div>
</section>{compare_table() if name == COMPARE else ""}"""
    groups = f'<div class="mt-10 grid grid-cols-5 gap-x-5 gap-y-12">{groups}</div>'
    count = sum(len(items) for _, items in SAVED_GROUPS)
    body = f"""
    {crumbs("Tôi", "Đã lưu")}
    <section class="relative mt-4 flex items-center justify-between overflow-hidden rounded-xl bg-secondary-container px-10 py-8">
      <div><h1 class="text-display-s">Đã lưu</h1><p class="mt-2 text-body-l text-on-secondary-container">{count} tin và {len(searches)} tìm kiếm</p></div>
      <img src="{ART["art_saved"]}" alt="" class="-my-10 w-[220px]">
    </section>
    <section class="mt-10">
      <h2 class="text-title-s text-primary">Tìm kiếm</h2>
      <div class="mt-4 grid grid-cols-2 gap-4">{search_html}</div>
    </section>
    {groups}
    <section class="mt-12">
      <label class="flex max-w-[560px] items-center gap-4 rounded-xl bg-surface-container px-5 py-4">{icon("trending-down-rounded", 22, "text-on-surface-variant")}
        <span class="flex-1 text-body-l">Báo khi tin đã lưu giảm giá</span>
        <span class="relative h-8 w-[52px] rounded-full bg-primary"><span class="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-on-primary"></span></span></label>
    </section>"""
    return page("Đã lưu · ShopNexus", body)


# ------------------------------------------------------ Thiết lập giao COD --
NAME = "Nguyễn Khánh Linh"
PHONE = "0912 345 812"
SHOP_CODE = "S55163"
# Địa chỉ của tôi as (kind, icon, street, ward), with Nhà as the picked row.
BOOK = [("Nhà", "home-outline-rounded", "12 Nguyễn Gia Trí", "Phường Bình Thạnh, Hồ Chí Minh"),
        ("Công ty", "work-outline-rounded", "Tầng 8, 2 Hải Triều", "Phường Sài Gòn, Hồ Chí Minh")]
# A grouped list: blocks 2 px apart, 28 px corners at the group's ends, 4 px inside.
GROUP = "flex flex-col gap-0.5 [&>*]:rounded-[4px] [&>:first-child]:rounded-t-[28px] [&>:last-child]:rounded-b-[28px]"


def radio(on):
    return (f'<span class="grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 {"border-primary" if on else "border-on-surface-variant"}">'
            f'{"<span class=\"h-2.5 w-2.5 rounded-full bg-primary\"></span>" if on else ""}</span>')


def circle(ic, on=False):
    return (f'<span class="grid h-10 w-10 shrink-0 place-items-center rounded-full {"bg-primary text-on-primary" if on else "bg-surface-container-highest text-on-surface-variant"}">'
            f'{icon(ic, 22)}</span>')


def edit_btn(label):
    return f'<button type="button" class="state flex h-10 shrink-0 items-center gap-1 rounded-full px-3 text-label-l text-primary" aria-label="{label}">{icon("edit-outline-rounded", 18)}Sửa</button>'


def step_head(n, title, state):
    circle_html = {"done": f'<span class="grid h-10 w-10 place-items-center rounded-full bg-primary text-on-primary">{icon("check-rounded", 22)}</span>',
                   "active": f'<span class="grid h-10 w-10 place-items-center rounded-full bg-primary-container text-title-m text-on-primary-container">{n}</span>'}[state]
    return f'<div class="flex items-center gap-4">{circle_html}<h2 class="text-headline-s">{title}</h2></div>'


def group_title(t):
    return f'<h3 class="mb-2 pl-4 text-title-s text-primary">{t}</h3>'


def cod_setup():
    stepper = "".join(
        f"""<li class="flex items-center gap-3 py-3">
  <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-label-l {c}">{g}</span>
  <span class="min-w-0 flex-1"><span class="block text-title-s">{name}</span><span class="block truncate text-body-s text-on-surface-variant">{d}</span></span></li>"""
        for name, d, c, g in [
            ("Địa chỉ lấy hàng", "Nhà · 12 Nguyễn Gia Trí", "bg-primary text-on-primary", icon("check-rounded", 18)),
            ("Bên vận chuyển", f"GHTK · {SHOP_CODE}", "bg-primary-container text-on-primary-container", "2"),
            ("Sẵn sàng giao COD", "Người mua chọn được COD", "bg-surface-container-highest text-on-surface-variant", icon("flag-outline-rounded", 18))])
    book = "".join(
        f"""<label class="flex min-h-16 cursor-pointer items-center gap-4 py-3 pl-4 pr-4 {"bg-secondary-container" if i == 0 else "row-hover bg-surface-container"}">
  {circle(ic, i == 0)}
  <span class="min-w-0 flex-1"><span class="block text-body-l">{kind}</span><span class="block text-body-m text-on-surface-variant">{street}, {ward}</span>
    {edit_btn("Sửa địa chỉ " + kind).replace("state flex", "state -ml-3 mt-1 inline-flex") if i == 0 else ""}</span>
  {radio(i == 0)}</label>""" for i, (kind, ic, street, ward) in enumerate(BOOK))
    book += f"""<label class="row-hover flex min-h-16 cursor-pointer items-center gap-4 bg-surface-container px-4 py-3">
  {circle("add-rounded")}<span class="flex-1 text-body-l">Địa chỉ mới</span>{radio(False)}</label>"""
    sender = f"""<div class="flex min-h-16 items-center gap-4 bg-surface-container px-4 py-3">
  <img src="{img(SELLER["photo"], 96, 96)}" alt="" class="h-10 w-10 shrink-0 rounded-full object-cover">
  <span class="min-w-0 flex-1"><span class="flex items-center gap-1 text-body-l">{NAME}{icon("verified-rounded", 16, "text-primary")}</span>
    <span class="block text-body-s text-on-surface-variant">Tên trên CCCD</span></span></div>
<div class="flex min-h-16 items-center gap-4 bg-surface-container py-3 pl-4 pr-2">
  {circle("call-outline-rounded")}
  <span class="min-w-0 flex-1"><span class="block text-body-l">{PHONE}</span><span class="block text-body-s text-on-surface-variant">Shipper gọi số này khi đến lấy</span></span>
  {edit_btn("Sửa số điện thoại")}</div>"""
    unlink = f"""<div role="dialog" aria-labelledby="unlink-title" class="absolute right-0 top-[calc(100%+8px)] z-20 w-[300px] rounded-xl bg-surface-container-high p-5 shadow-float">
  <h4 id="unlink-title" class="text-title-m">Gỡ liên kết GHTK?</h4>
  <p class="mt-2 text-body-m text-on-surface-variant">Các đơn đã gửi vẫn giữ nguyên.</p>
  <div class="mt-4 flex justify-end gap-1">
    <button type="button" class="state h-10 rounded-full px-3 text-label-l text-primary">Giữ lại</button>
    <button type="button" class="state h-10 rounded-full px-3 text-label-l text-primary">Gỡ liên kết</button>
  </div>
</div>"""
    linked = f"""<div class="relative flex min-h-14 items-center gap-4 bg-surface-container py-2 pl-4 pr-2">
  {icon("local-shipping-outline-rounded", 22, "text-on-surface-variant")}<span class="flex-1 text-body-l">GHTK · {SHOP_CODE}</span>
  <button type="button" class="state h-10 rounded-full bg-on-surface/[.08] px-3 text-label-l text-primary">Gỡ liên kết</button>
  {unlink}</div>"""
    more = f"""<div class="flex min-h-16 items-center gap-4 bg-surface-container py-3 pl-4 pr-3">
  {circle("link-rounded")}
  <span class="min-w-0 flex-1"><span class="block text-body-l">GHN</span><span class="block text-body-s text-on-surface-variant">Dán mã API và mã cửa hàng</span></span>
  {tonal("Kết nối GHN")}</div>"""
    summary = "".join(f'<div class="flex items-center gap-3 py-3 {"border-t border-outline-variant" if i else ""}">{icon(ic, 20, "text-on-surface-variant")}<span class="w-32 shrink-0 text-body-m text-on-surface-variant">{k}</span><span class="text-body-m">{v}</span></div>'
                      for i, (ic, k, v) in enumerate([("location-on-outline-rounded", "Lấy hàng tại", f"{BOOK[0][2]}, {BOOK[0][3]}"),
                                                      ("local-shipping-outline-rounded", "Bên vận chuyển", f"GHTK · {SHOP_CODE}")]))
    body = f"""
    {crumbs("Tôi", "Thiết lập giao COD")}
    <section class="relative mt-4 overflow-hidden rounded-xl bg-primary-container px-12 py-10 text-on-primary-container">
      <p class="flex items-center gap-4 text-label-l"><span class="flex items-center gap-1.5">{icon("timer-outline-rounded", 18)}3 phút</span><span class="flex items-center gap-1.5">{icon("event-repeat-outline-rounded", 18)}Làm một lần</span></p>
      <h1 class="mt-2 text-display-m text-white">Thiết lập giao COD</h1>
      <div class="mt-4 flex max-w-[560px] flex-col gap-2 text-body-l">
        <p class="flex gap-2">{icon("account-balance-outline-rounded", 20, "mt-0.5")}{MONEY["cod_seller"]}</p>
        <p class="flex gap-2">{icon("lock-outline-rounded", 20, "mt-0.5")}{MONEY["no_hold"]}</p>
      </div>
      <img src="{ART["art_cod_ready"]}" alt="" class="absolute -bottom-6 right-12 w-[260px]">
    </section>

    <div class="mt-8 grid grid-cols-[300px_1fr] gap-8">
      <aside class="self-start rounded-xl bg-surface-container-low p-5">
        <p class="text-title-s text-on-surface-variant">Các bước</p>
        <ol class="mt-1">{stepper}</ol>
        {a("later", "mt-3 inline-flex items-center gap-1 text-label-l text-primary hover:underline", "Để sau")}
      </aside>

      <div class="flex flex-col gap-6">
        <section class="rounded-xl bg-surface-container-low p-8">
          {step_head(1, "Địa chỉ lấy hàng", "done")}
          <div class="mt-6 grid grid-cols-2 gap-6">
            <div>{group_title("Lấy hàng tại")}<div class="{GROUP}">{book}</div></div>
            <div>{group_title("Người gửi")}<div class="{GROUP}">{sender}</div></div>
          </div>
        </section>

        <section class="rounded-xl bg-surface-container-lowest p-8 shadow-float">
          {step_head(2, "Bên vận chuyển", "active")}
          <div class="mt-6 grid grid-cols-2 gap-6">
            <div>{group_title("Tài khoản đã liên kết")}<div class="{GROUP}">{linked}</div></div>
            <div>{group_title("Liên kết thêm")}<div class="{GROUP}">{more}</div>
              {a("ask-carrier", "state -ml-1 mt-2 inline-flex h-10 items-center gap-2 rounded-full px-3 text-label-l text-primary", icon("add-rounded", 20) + "Hãng của bạn chưa có?")}</div>
          </div>
          <div class="mt-8 flex justify-end border-t border-outline-variant pt-5">
            <button type="button" class="state flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-label-l text-on-primary">Tiếp tục{icon("arrow-forward-rounded", 20)}</button>
          </div>
        </section>

        <section class="grid grid-cols-[200px_1fr] items-center gap-6 rounded-xl border-2 border-dashed border-outline-variant p-8">
          <img src="{ART["art_cod_placed"]}" alt="" class="w-full">
          <div>
            <h2 class="text-headline-m">Sẵn sàng giao COD</h2>
            <p class="mt-1 text-body-m text-on-surface-variant">Người mua chọn được COD với tin của bạn.</p>
            <div class="mt-4 rounded-lg bg-surface-container-low px-4">{summary}</div>
            <div class="mt-3">{money("no_hold", "lock-outline-rounded")}</div>
          </div>
        </section>
      </div>
    </div>"""
    return page("Thiết lập giao COD · ShopNexus", body, tonal_post=True)


if __name__ == "__main__":
    for name, fn in [("my-listings", my_listings), ("saved", saved), ("cod-setup", cod_setup)]:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(fn())
        print("wrote", name)
