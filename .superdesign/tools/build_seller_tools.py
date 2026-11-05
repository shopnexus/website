"""Tin của bạn, Đã lưu and Thiết lập giao COD, in the chosen style (C's shell).

    python3 tools/build_seller_tools.py        (run from .superdesign/)

Follows app/mohinh.md where the app design system differs: posting needs only a
phone number, and ShopNexus has no carrier API yet, so the COD setup declares
the seller's own carrier account instead of logging into it.
"""
import json
import os
from html import escape

from build import OUT, a
from build_c import ART, CSS, footer, header
from common import head, icon, img, split_price

HERE = os.path.dirname(os.path.abspath(__file__))
ART = {**ART, **json.load(open(os.path.join(HERE, "art_sh.json"))), **json.load(open(os.path.join(HERE, "art_seller_tools.json")))}

# Verbatim from app/.superdesign/tools/common.py MONEY.
MONEY = dict(
    no_hold="ShopNexus không giữ tiền và không nhận cọc.",
    cod_seller="Bên vận chuyển chuyển tiền hàng cho bạn 1–2 ngày sau khi người mua nhận.",
    return_leg="Người mua từ chối nhận thì bạn trả phí ship cả chiều đi và chiều về.",
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
    dict(photo="1510557880182-3d4d3cba35a5", title="iPhone X 64GB, pin 86%, máy zin chưa sửa", price="3.900.000 ₫",
         stats=(86, 4, 7, 6), waiting=3, extra="boost"),
    dict(photo="1510915361894-db8b60106cb1", title="Đàn guitar acoustic Yamaha F310, kèm bao", price="1.950.000 ₫",
         stats=(41, 1, 3, 12), waiting=0, extra="price"),
    dict(photo="1503602642458-232111445657", title="Ghế đẩu gỗ thông cao 45 cm", price="350.000 ₫",
         stats=(29, 2, 2, 4), waiting=1, extra="cod"),
    dict(photo="1505740420928-5e560c06d30e", title="Tai nghe chống ồn Sony WH-1000XM4, fullbox", price="3.200.000 ₫",
         stats=(58, 2, 5, 9), waiting=2, extra=None),
]


def listing_row(it):
    num, unit = split_price(it["price"])
    v, c, s, d = it["stats"]
    stats = "".join(f'<span class="flex items-center gap-1">{icon(ic, 16)}{n}</span>' for ic, n in
                    [("visibility-outline-rounded", v), ("chat-outline-rounded", c), ("favorite-outline-rounded", s), ("calendar-today-outline-rounded", f"{d} ngày")])
    waiting = (f'<span class="flex items-center gap-1 shrink-0 whitespace-nowrap rounded-full bg-secondary-container px-2.5 py-0.5 text-label-m text-on-secondary-container">{icon("group-outline-rounded", 14)}{it["waiting"]} người đang chờ</span>'
               if it["waiting"] else "")
    extra = ""
    if it["extra"] == "boost":
        extra = f'<div class="mt-3 flex items-center gap-2 text-label-l text-primary">{icon("rocket-launch-outline-rounded", 18)}Đang đẩy · còn 2 ngày trên đầu mục Gần bạn</div>'
    elif it["extra"] == "price":
        extra = (f'<div class="mt-3 flex items-center gap-3"><span class="flex items-center gap-1 text-label-l text-tertiary">{icon("auto-awesome-rounded", 16)}Cao hơn 12% so với tin tương tự</span>'
                 f'{tonal("Giảm còn 1,7 tr", "trending-down-rounded")}</div>')
    elif it["extra"] == "cod":
        extra = (f'<div class="mt-3 flex items-center gap-3 rounded-lg bg-primary-container px-4 py-2.5 text-on-primary-container">{icon("local-shipping-outline-rounded", 20)}'
                 f'<span class="flex-1 text-label-l">Đơn COD · chờ bạn nhập mã vận đơn</span>'
                 + a("enter-waybill", "flex items-center gap-1 text-label-l text-white hover:underline", "Nhập vận đơn" + icon("arrow-forward-rounded", 16)) + "</div>")
    return f"""<article class="row-hover rounded-xl bg-surface-container-low p-4">
  <div class="flex items-center gap-5">
    <img src="{img(it["photo"], 200, 200)}" alt="{escape(it["title"])}" class="h-20 w-20 shrink-0 rounded-lg object-cover">
    <div class="min-w-0 flex-1">
      <div class="flex min-w-0 items-center gap-3"><h3 class="min-w-0 truncate text-title-m">{escape(it["title"])}</h3>{waiting}</div>
      <p class="mt-1 text-title-m">{num}<span class="text-body-m text-on-surface-variant">{unit}</span></p>
      <div class="mt-1.5 flex items-center gap-4 text-body-s text-on-surface-variant">{stats}</div>
    </div>
    <div class="flex shrink-0 items-center gap-1">
      {outlined("Sửa", "edit-outline-rounded")}{tonal("Đẩy tin", "rocket-launch-outline-rounded")}{tonal("Đã bán", "handshake-outline-rounded")}
      {icon_btn("Ẩn tin", "visibility-off-outline-rounded")}{icon_btn("Tùy chọn khác", "more-vert")}
    </div>
  </div>
  {extra}
</article>"""


def my_listings():
    tiles = "".join(f"""<div class="flex items-center gap-4 rounded-lg bg-surface-container-lowest px-5 py-4">
  <span class="grid h-11 w-11 place-items-center rounded-full bg-secondary-container text-on-secondary-container">{icon(ic, 22)}</span>
  <div><p class="text-headline-s">{n}</p><p class="text-body-s text-on-surface-variant">{l}</p></div></div>"""
                    for ic, n, l in [("visibility-outline-rounded", "214", "Lượt xem"), ("chat-outline-rounded", "9", "Người hỏi"),
                                     ("favorite-outline-rounded", "17", "Lượt lưu"), ("group-outline-rounded", "6", "Người đang chờ")])
    tabs = "".join(f'<span class="flex h-11 flex-1 items-center justify-center gap-2 px-5 text-label-l {"bg-secondary-container text-on-secondary-container" if i == 0 else "bg-surface-container-high text-on-surface-variant"}">'
                   f'{icon("check-rounded", 18) if i == 0 else ""}{t}<span class="text-label-m opacity-80">{n}</span></span>'
                   for i, (t, n) in enumerate([("Đang bán", 4), ("Nháp", 1), ("Đã bán", 14), ("Đã ẩn", 1)]))
    rows = "".join(listing_row(it) for it in ON_SALE)
    sold = "".join(f"""<li class="flex items-center gap-3 py-2.5 {"border-t border-outline-variant" if i else ""}">
  <img src="{img(p, 120, 120)}" alt="" class="h-12 w-12 rounded-md object-cover grayscale-[40%]">
  <div class="min-w-0 flex-1"><p class="truncate text-body-m">{t}</p><p class="flex items-center gap-1 text-body-s text-on-surface-variant">{who}</p></div>
  <span class="text-title-s">{pr}</span></li>"""
                   for i, (p, t, pr, who) in enumerate([
                       ("1526170375885-4d8ecf77b99f", "Máy ảnh Polaroid OneStep 2", "1,7 tr", "Minh Anh · " + icon("star-rounded", 14, "inline-block") + " 5"),
                       ("1585515320310-259814833e62", "Máy xay sinh tố 2L", "420k", "Người ngoài ShopNexus"),
                       ("1593764592116-bfb2a97c642a", "Fixie đen mờ size 50", "1,8 tr", icon("hourglass-empty-rounded", 14, "inline-block") + " Quốc Bảo · chờ đánh giá")]))
    body = f"""
    {crumbs("Tôi", "Tin của bạn")}
    <section class="mt-4 flex items-end justify-between">
      <div><h1 class="text-display-s">Tin của bạn</h1><p class="mt-2 text-body-l text-on-surface-variant">4 tin đang bán quanh Bình Thạnh · 14 tin đã bán</p></div>
      <div class="flex gap-2">{outlined("Quay video đăng tin", "videocam-outline-rounded")}{outlined("Chụp ảnh đăng tin", "photo-camera-outline-rounded")}</div>
    </section>
    <section class="relative mt-6 overflow-hidden rounded-xl bg-secondary-container p-6 pr-[240px]">
      <p class="text-title-s text-on-secondary-container">7 ngày qua</p>
      <div class="mt-3 grid grid-cols-4 gap-3">{tiles}</div>
      <img src="{ART["art_listings"]}" alt="" class="absolute -bottom-4 right-6 w-[200px]">
    </section>
    <div class="mt-8 grid grid-cols-[minmax(0,1fr)_340px] gap-8">
      <section class="min-w-0">
        <div class="seg flex gap-0.5">{tabs}</div>
        <div class="mt-5 flex flex-col gap-3">{rows}</div>
      </section>
      <aside class="flex min-w-0 flex-col gap-4 self-start">
        <div class="rounded-xl bg-surface-container-low p-5">
          <div class="flex items-center justify-between"><h2 class="text-title-l">Nháp đang dở</h2><span class="text-body-s text-on-surface-variant">1 nháp</span></div>
          <div class="mt-4 flex items-center gap-4">
            <div class="relative h-16 w-16 shrink-0"><img src="{img("1611186871348-b1ce696e52c9", 160, 160)}" alt="" class="h-full w-full rounded-lg object-cover"><span class="absolute -bottom-1 -right-1 rounded-full bg-inverse-surface px-1.5 text-label-s text-inverse-on-surface">4 ảnh</span></div>
            <div class="min-w-0 flex-1"><p class="truncate text-title-s">MacBook Air M1 8/256GB</p><p class="text-body-s text-on-surface-variant">Còn thiếu giá và tình trạng</p></div>
          </div>
          {tonal("Tiếp tục đăng", "arrow-forward-rounded", "mt-4 w-full justify-center")}
        </div>
        <div class="rounded-xl bg-surface-container-low p-5">
          <h2 class="text-title-l">Vừa bán</h2>
          <ul class="mt-2">{sold}</ul>
          {a("sold-all", "mt-2 inline-flex items-center gap-1 text-label-l text-primary hover:underline", "Xem 14 tin đã bán" + icon("arrow-forward-rounded", 16))}
        </div>
        <div class="rounded-xl bg-surface-container-low p-5">
          <h2 class="flex items-center gap-2 text-title-l">{icon("rocket-launch-outline-rounded", 22, "text-primary")}Đẩy tin</h2>
          <p class="mt-2 text-body-m text-on-surface-variant">Lên đầu mục Gần bạn quanh Bình Thạnh.</p>
          <div class="mt-3 grid grid-cols-2 gap-2">
            <div class="rounded-lg bg-surface-container-lowest p-3"><p class="text-title-m">1 ngày</p><p class="text-body-s text-on-surface-variant">15.000 ₫</p></div>
            <div class="rounded-lg bg-surface-container-lowest p-3"><p class="text-title-m">3 ngày</p><p class="text-body-s text-on-surface-variant">35.000 ₫</p></div>
          </div>
          {a("plans", "mt-3 inline-flex items-center gap-1 text-label-l text-primary hover:underline", "Gói Plus có 4 lượt đẩy mỗi tháng" + icon("arrow-forward-rounded", 16))}
        </div>
        <div class="flex items-center gap-4 rounded-xl bg-surface-container-low p-4 opacity-70">
          <img src="{img("1586023492125-27b2c045efd7", 120, 120)}" alt="" class="h-12 w-12 rounded-md object-cover">
          <div class="min-w-0 flex-1"><p class="truncate text-body-m">Ghế bành vải vàng mù tạt</p><p class="flex items-center gap-1 text-body-s text-on-surface-variant">{icon("visibility-off-outline-rounded", 14)}Đã ẩn</p></div>
          {outlined("Hiện tin")}
        </div>
      </aside>
    </div>"""
    return page("Tin của bạn · ShopNexus", body)


# ----------------------------------------------------------------- Đã lưu --
SAVED_GROUPS = [
    ("Điện thoại", True, [
        ("1632661674596-df8be070a5c5", "iPhone 13 Pro 128GB Xanh Sierra", "5.200.000 ₫", "Như mới · 2,1 km", ("cut", "300k")),
        ("1616348436168-de43ad0db179", "iPhone 12 128GB, màn zin", "6.900.000 ₫", "Đã dùng · 0,8 km", ("ai", "Rẻ hơn 8%")),
        ("1663499482523-1c0c1bae4ce1", "iPhone 14 128GB, pin 91%", "12,8 tr ₫", "Như mới · 4,4 km", None),
        ("1580910051074-3eb694886505", "iPhone 12 mini 64GB", "5.200.000 ₫", "Đã dùng · 1,9 km", "sold"),
    ]),
    ("Xe đạp", False, [
        ("1507035895480-2b3156c31fc8", "Xe đạp fixed gear khung thép", "2.300.000 ₫", "Đã dùng · 0,8 km", ("cut", "200k")),
        ("1593764592116-bfb2a97c642a", "Fixie đen mờ size 50", "1.800.000 ₫", "Như mới · 0,7 km", None),
    ]),
    ("Nội thất", False, [
        ("1555041469-a586c61ea9bc", "Sofa nhung xanh 3 chỗ", "4.800.000 ₫", "Đã dùng · 5,6 km", None),
        ("1586023492125-27b2c045efd7", "Ghế bành bọc vải vàng mù tạt", "1.600.000 ₫", "Đã dùng · 3,8 km", "sold"),
    ]),
]


def saved_card(photo, title, price, meta, change):
    num, unit = split_price(price)
    sold = change == "sold"
    pill = ""
    if isinstance(change, tuple):
        kind, v = change
        pill = (f'<span class="flex items-center gap-0.5 rounded-full bg-tertiary-fixed px-2.5 py-0.5 text-label-m text-on-tertiary-fixed-variant">{icon("arrow-downward-rounded", 14)}{v} từ lúc lưu</span>'
                if kind == "cut" else
                f'<span class="flex items-center gap-1 text-label-m text-tertiary">{icon("auto-awesome-rounded", 14)}{v}</span>')
    photo_html = f'<img src="{img(photo, 480, 600)}" alt="{escape(title)}" class="h-full w-full object-cover {"grayscale opacity-60" if sold else ""}">'
    overlay = (f'<span class="absolute inset-x-3 top-3 flex justify-between"><span class="rounded-full bg-inverse-surface px-3 py-1 text-label-m text-inverse-on-surface">Đã bán</span></span>'
               if sold else
               f'<span class="absolute bottom-3 left-3 rounded-full bg-surface-container-lowest px-3 py-1 text-title-m text-on-surface shadow-float">{num}<span class="text-body-s text-on-surface-variant">{unit}</span></span>'
               f'<button type="button" class="state absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-surface-container-lowest/90 text-primary" aria-label="Bỏ lưu">{icon("favorite-rounded", 22)}</button>')
    foot = (f'<button type="button" class="state mt-2 flex h-9 items-center gap-1.5 rounded-full border border-outline-variant px-3.5 text-label-l text-primary">{icon("search-rounded", 18)}Xem đồ tương tự</button>'
            if sold else f'<div class="mt-2 flex min-h-[22px] items-center">{pill}</div>')
    return f"""<article class="lift min-w-0">
  <div class="relative overflow-hidden rounded-xl bg-surface-container-high" style="aspect-ratio: 4 / 5">{photo_html}{overlay}</div>
  <h3 class="mt-3 line-clamp-1 text-body-l {"text-on-surface-variant" if sold else "text-on-surface"}">{escape(title)}</h3>
  <p class="mt-0.5 text-body-s text-on-surface-variant">{meta}</p>
  {foot}
</article>"""


def compare_table():
    cols = [("1632661674596-df8be070a5c5", "iPhone 13 Pro", "5,2 tr", "Như mới", "88%", "2,1 km", "Xuất sắc"),
            ("1616348436168-de43ad0db179", "iPhone 12", "6,9 tr", "Đã dùng", "84%", "0,8 km", "Uy tín"),
            ("1663499482523-1c0c1bae4ce1", "iPhone 14", "12,8 tr", "Như mới", "91%", "4,4 km", "Uy tín")]
    best = {"Giá": 0, "Tình trạng": None, "Pin": 2, "Cách bạn": 1, "Người bán": 0}
    rows = [("Giá", "sell-outline-rounded", 2), ("Tình trạng", "verified-outline-rounded", 3), ("Pin", "battery-full-rounded", 4),
            ("Cách bạn", "near-me-outline-rounded", 5), ("Người bán", "workspace-premium-outline-rounded", 6)]
    head_html = "".join(f'<th class="p-3 text-left font-normal"><img src="{img(c[0], 160, 160)}" alt="" class="h-14 w-14 rounded-md object-cover"><p class="mt-2 text-title-s">{c[1]}</p></th>' for c in cols)
    body_html = "".join(
        f'<tr class="border-t border-outline-variant"><td class="p-3 text-body-m text-on-surface-variant"><span class="flex items-center gap-2">{icon(ic, 18)}{label}</span></td>'
        + "".join(f'<td class="p-3 text-body-m {"text-primary" if best.get(label) == j else "text-on-surface"}"><span class="flex items-center gap-1.5">'
                  f'{"<span class=\"h-1.5 w-1.5 rounded-full bg-primary\"></span>" if best.get(label) == j else ""}{c[k]}</span></td>' for j, c in enumerate(cols)) + "</tr>"
        for label, ic, k in rows)
    return f"""<div class="mt-5 grid grid-cols-[1fr_340px] gap-6 rounded-xl bg-surface-container-low p-6">
  <table class="w-full"><thead><tr><th class="w-[160px]"></th>{head_html}</tr></thead><tbody>{body_html}</tbody></table>
  <div class="flex flex-col rounded-lg bg-surface-container-lowest p-5">
    <p class="flex items-center gap-1.5 text-label-l text-primary">{icon("auto-awesome-rounded", 16)}Đáng tiền nhất</p>
    <p class="mt-2 text-headline-s">iPhone 13 Pro</p>
    <p class="mt-2 text-body-m text-on-surface-variant">Giá thấp nhất trong ba máy, tình trạng như mới và người bán hạng Xuất sắc. Muốn rẻ hơn nữa thì iPhone 12 ở gần bạn nhất, nhưng pin đã xuống 84%.</p>
    <button type="button" class="state mt-auto flex h-11 items-center justify-center gap-2 rounded-full bg-secondary-container text-label-l text-on-secondary-container">{icon("chat-outline-rounded", 18)}Nhắn người bán</button>
  </div>
</div>"""


def saved():
    searches = [("xe đạp fixed gear dưới 3 triệu", "4 tin mới · Bình Thạnh · 5 km", True), ("iPhone 13 Pro pin trên 85%", "1 tin mới · TP.HCM", True),
                ("sofa 3 chỗ", "Chưa có tin mới", False)]
    search_html = "".join(
        f"""<div class="row-hover flex items-center gap-4 rounded-xl bg-surface-container-low p-4">
  <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-surface-container-lowest text-on-surface-variant">{icon("search-rounded", 22)}</span>
  <div class="min-w-0 flex-1"><p class="truncate text-title-s">{q}</p><p class="mt-0.5 text-body-s {"text-primary" if new else "text-on-surface-variant"}">{n}</p></div>
  <button type="button" class="state grid h-10 w-10 place-items-center rounded-full text-primary" aria-label="Thôi theo dõi">{icon("notifications-active-rounded", 22)}</button>
</div>""" for q, n, new in searches)
    groups = ""
    for name, compare, items in SAVED_GROUPS:
        cards = "".join(saved_card(*it) for it in items)
        on_sale = sum(1 for it in items if it[4] != "sold")
        cmp_btn = tonal(f"So sánh {on_sale} máy", "compare-arrows-rounded") if on_sale >= 2 and compare else (tonal("So sánh", "compare-arrows-rounded") if on_sale >= 2 else "")
        groups += f"""<section class="mt-10">
  <div class="flex items-center justify-between"><h2 class="text-title-s uppercase tracking-[0.08em] text-primary">{name} · {len(items)}</h2>{cmp_btn}</div>
  {compare_table() if compare else ""}
  <div class="mt-5 grid grid-cols-5 gap-5">{cards}</div>
</section>"""
    body = f"""
    {crumbs("Tôi", "Đã lưu")}
    <section class="relative mt-4 flex items-center justify-between overflow-hidden rounded-xl bg-secondary-container px-10 py-8">
      <div><h1 class="text-display-s">Đã lưu</h1><p class="mt-2 text-body-l text-on-secondary-container">8 tin và 3 tìm kiếm. 2 tin đã giảm giá từ lúc bạn lưu.</p>
        <label class="mt-5 flex w-fit items-center gap-4 rounded-full bg-surface-container-lowest py-2 pl-5 pr-2 text-body-m">Báo khi tin đã lưu giảm giá
          <span class="relative h-8 w-[52px] rounded-full bg-primary"><span class="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-on-primary"></span></span></label>
      </div>
      <img src="{ART["art_saved"]}" alt="" class="-my-10 w-[220px]">
    </section>
    <section class="mt-10">
      <div class="flex items-center justify-between"><h2 class="text-title-s uppercase tracking-[0.08em] text-primary">Tìm kiếm đang theo dõi · 3</h2></div>
      <div class="mt-4 grid grid-cols-3 gap-4">{search_html}</div>
    </section>
    {groups}"""
    return page("Đã lưu · ShopNexus", body)


# ------------------------------------------------------ Thiết lập giao COD --
CARRIERS = [("GHTK", "Giao Hàng Tiết Kiệm", True), ("GHN", "Giao Hàng Nhanh", False), ("SPX", "SPX Express", False),
            ("J&amp;T", "J&amp;T Express", False), ("Viettel Post", "Viettel Post", False), ("Khác", "Hãng khác", False)]


def field(label, value, hint=None, lock=False, w=""):
    hint_html = f'<span class="mt-1 block text-body-s text-on-surface-variant">{hint}</span>' if hint else ""
    return f"""<label class="block {w}"><span class="text-label-l text-on-surface-variant">{label}</span>
  <span class="mt-1.5 flex h-12 items-center rounded-md bg-surface-container-lowest px-4 text-body-l {"text-on-surface-variant" if lock else "text-on-surface"} ring-1 ring-outline-variant">
    <span class="flex-1">{value}</span>{icon("lock-outline-rounded", 18) if lock else ""}{icon("keyboard-arrow-down-rounded", 20) if label.startswith(("Phường", "Tỉnh")) else ""}</span>{hint_html}</label>"""


def step_head(n, title, state, sub=None):
    circle = {"done": f'<span class="grid h-10 w-10 place-items-center rounded-full bg-primary text-on-primary">{icon("check-rounded", 22)}</span>',
              "active": f'<span class="grid h-10 w-10 place-items-center rounded-full bg-primary-container text-title-m text-on-primary-container">{n}</span>',
              "todo": f'<span class="grid h-10 w-10 place-items-center rounded-full bg-surface-container-highest text-title-m text-on-surface-variant">{n}</span>'}[state]
    sub_html = f'<p class="text-body-m text-on-surface-variant">{sub}</p>' if sub else ""
    return f'<div class="flex items-center gap-4">{circle}<div class="flex-1"><h2 class="text-headline-s">{title}</h2>{sub_html}</div></div>'


def cod_setup():
    stepper = "".join(
        f"""<li class="relative flex items-center gap-3 py-3">
  <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full text-label-l {c}">{g}</span>
  <span class="flex-1"><span class="block text-title-s {t}">{name}</span><span class="block text-body-s text-on-surface-variant">{d}</span></span></li>"""
        for name, d, c, g, t in [
            ("Địa chỉ lấy hàng", "Phường Thạnh Mỹ Tây, TP.HCM", "bg-primary text-on-primary", icon("check-rounded", 18), "text-on-surface"),
            ("Bên vận chuyển", "Đang chọn", "bg-primary-container text-on-primary-container", "2", "text-on-surface"),
            ("Nhận tiền COD", "Khai ở tài khoản của hãng", "bg-surface-container-highest text-on-surface-variant", "3", "text-on-surface-variant"),
            ("Xong", "Người mua chọn được COD", "bg-surface-container-highest text-on-surface-variant", icon("flag-outline-rounded", 18), "text-on-surface-variant")])
    carriers = "".join(
        f"""<label class="state flex cursor-pointer items-center gap-3 rounded-lg p-4 {"bg-secondary-container ring-2 ring-primary" if on else "bg-surface-container-lowest ring-1 ring-outline-variant"}">
  <span class="grid h-5 w-5 place-items-center rounded-full border-2 {"border-primary" if on else "border-on-surface-variant"}">{'<span class="h-2.5 w-2.5 rounded-full bg-primary"></span>' if on else ""}</span>
  <span class="flex-1"><span class="block text-title-s">{short}</span><span class="block text-body-s text-on-surface-variant">{full}</span></span>
  {icon("local-shipping-outline-rounded", 22, "text-primary" if on else "text-on-surface-variant")}</label>""" for short, full, on in CARRIERS)
    payout_steps = "".join(
        f'<li class="flex items-start gap-3"><span class="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-surface-container-highest text-label-l">{i + 1}</span><span class="pt-0.5 text-body-m">{t}</span></li>'
        for i, t in enumerate(["Mở app hoặc trang khách hàng của GHTK.", "Vào Tài khoản › Tài khoản ngân hàng, thêm tài khoản đứng tên bạn.", "Quay lại đây và đánh dấu đã thêm."]))
    summary = "".join(f'<div class="flex items-center gap-3 py-3 {"border-t border-outline-variant" if i else ""}">{icon(ic, 20, "text-on-surface-variant")}<span class="w-40 text-body-m text-on-surface-variant">{k}</span><span class="text-body-m">{v}</span></div>'
                      for i, (ic, k, v) in enumerate([("home-pin-outline-rounded", "Lấy hàng tại", "Số 12 Nguyễn Gia Trí, Phường Thạnh Mỹ Tây, TP.HCM"),
                                                      ("local-shipping-outline-rounded", "Bên vận chuyển", "GHTK · tài khoản đứng tên Nguyễn Khánh Linh"),
                                                      ("account-balance-outline-rounded", "Tiền COD về", "Tài khoản ngân hàng bạn khai với GHTK")]))
    body = f"""
    {crumbs("Tôi", "Thiết lập giao COD")}
    <section class="relative mt-4 overflow-hidden rounded-xl bg-primary-container px-12 py-10 text-on-primary-container">
      <p class="flex items-center gap-2 text-label-l">{icon("timer-outline-rounded", 18)}Khoảng 3 phút · làm một lần</p>
      <h1 class="mt-2 text-display-m text-white">Thiết lập giao COD</h1>
      <p class="mt-3 max-w-[560px] text-body-l">Bạn gửi hàng bằng tài khoản vận chuyển đứng tên mình. Người mua xem hàng tại cửa rồi trả tiền cho shipper. {MONEY["no_hold"]}</p>
      <img src="{ART["art_cod_ready"]}" alt="" class="absolute -bottom-6 right-12 w-[260px]">
    </section>

    <div class="mt-8 grid grid-cols-[300px_1fr] gap-8">
      <aside class="self-start rounded-xl bg-surface-container-low p-5">
        <p class="text-title-s text-on-surface-variant">Các bước</p>
        <ol class="mt-1">{stepper}</ol>
        {a("later", "mt-3 inline-flex items-center gap-1 text-label-l text-primary hover:underline", "Để sau, quay lại Tin của bạn")}
      </aside>

      <div class="flex flex-col gap-6">
        <section class="rounded-xl bg-surface-container-low p-8">
          <div class="flex items-center justify-between">{step_head(1, "Địa chỉ lấy hàng", "done", "Shipper đến đây lấy hàng")}{outlined("Sửa", "edit-outline-rounded")}</div>
          <div class="mt-6 grid grid-cols-2 gap-x-5 gap-y-4">
            {field("Người gửi", "Nguyễn Khánh Linh")}
            {field("Số điện thoại", "0903 ••• 128", "Shipper gọi số này khi đến lấy", lock=True)}
            {field("Số nhà, tên đường", "Số 12 Nguyễn Gia Trí", w="col-span-2")}
            {field("Phường, xã", "Phường Thạnh Mỹ Tây", "Theo đơn vị hành chính mới, không còn quận, huyện")}
            {field("Tỉnh, thành phố", "TP. Hồ Chí Minh")}
          </div>
          <p class="mt-4 flex items-center gap-2 text-body-m text-on-surface-variant">{icon("visibility-off-outline-rounded", 18)}Chỉ bên vận chuyển thấy. Người mua chỉ thấy khu vực.</p>
        </section>

        <section class="rounded-xl bg-surface-container-lowest p-8 shadow-float">
          {step_head(2, "Bên vận chuyển", "active", "Hãng bạn dùng để gửi hàng, bằng tài khoản đứng tên bạn")}
          <div class="mt-6 grid grid-cols-3 gap-3">{carriers}</div>
          <div class="mt-5 grid grid-cols-2 gap-5">
            {field("Tên shop trên GHTK", "Khánh Linh Đồ Cũ", "Không bắt buộc. Giúp người mua nhận ra bưu kiện của bạn.")}
            <div class="rounded-lg bg-surface-container p-4 text-body-m text-on-surface-variant">
              <p class="flex items-center gap-2 text-title-s text-on-surface">{icon("receipt-long-outline-rounded", 20)}Khi có đơn</p>
              <p class="mt-1.5">Bạn tạo vận đơn trên app GHTK, để người nhận trả phí ship, rồi nhập mã vận đơn và phí ship vào ShopNexus.</p>
            </div>
          </div>
          <div class="mt-6 flex items-center justify-between border-t border-outline-variant pt-5">
            {a("open-ghtk-account", "inline-flex items-center gap-1 text-label-l text-primary hover:underline", "Chưa có tài khoản? Mở tài khoản GHTK" + icon("open-in-new-rounded", 16))}
            <button type="button" class="state flex h-12 items-center gap-2 rounded-full bg-primary px-7 text-label-l text-on-primary">Tiếp tục{icon("arrow-forward-rounded", 20)}</button>
          </div>
        </section>

        <section class="rounded-xl bg-surface-container-low p-8 opacity-90">
          {step_head(3, "Nhận tiền COD", "todo", "Tiền COD về tài khoản ngân hàng bạn khai với GHTK")}
          <div class="mt-6 grid grid-cols-[1fr_320px] gap-8">
            <ol class="flex flex-col gap-3">{payout_steps}</ol>
            <div class="flex flex-col gap-2.5">{money("cod_seller", "payments-outline-rounded")}{money("return_leg", "undo-rounded")}</div>
          </div>
          <label class="mt-6 flex items-center gap-3 text-body-m"><span class="h-5 w-5 rounded-xs border-2 border-on-surface-variant"></span>Tôi đã thêm tài khoản ngân hàng ở GHTK</label>
          <p class="mt-2 text-body-s text-on-surface-variant">ShopNexus không đọc được tài khoản ngân hàng của bạn ở GHTK, nên chỉ cần bạn đánh dấu.</p>
        </section>

        <section class="grid grid-cols-[200px_1fr] items-center gap-6 rounded-xl border-2 border-dashed border-outline-variant p-8">
          <img src="{ART["art_cod_placed"]}" alt="" class="w-full">
          <div>
            <p class="text-label-l uppercase tracking-[0.12em] text-on-surface-variant">Khi xong</p>
            <h2 class="mt-1 text-headline-m">Sẵn sàng giao COD</h2>
            <p class="mt-1 text-body-m text-on-surface-variant">Người mua chọn được COD với tin của bạn.</p>
            <div class="mt-4 rounded-lg bg-surface-container-low px-4">{summary}</div>
            <div class="mt-3">{money("no_hold", "account-balance-outline-rounded")}</div>
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
