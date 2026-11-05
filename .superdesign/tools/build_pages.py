"""Search and Category, in the chosen style: C's shell (floating pill header,
dark footer, 28 px containers, polaroid-like cards) with E's sentence search.

    python3 tools/build_pages.py        (run from .superdesign/)
"""
import os
from html import escape

from build import OUT, a
from build_c import ART, CSS, area_map, feed_card, footer, header
from build_e import QUERY, RESULTS, chip, result_row
from common import MONEY, head, icon, img, split_price

PAGE_CSS = CSS + """
  .row-hover:hover { background: var(--md-surface-container-low); }
  .seg > * { border-radius: 4px; }
  .seg > :first-child { border-top-left-radius: 9999px; border-bottom-left-radius: 9999px; }
  .seg > :last-child { border-top-right-radius: 9999px; border-bottom-right-radius: 9999px; }
"""


def check(label, on=False, count=None):
    box = (f'<span class="grid h-5 w-5 place-items-center rounded-xs bg-primary text-on-primary">{icon("check-rounded", 16)}</span>' if on
           else '<span class="h-5 w-5 rounded-xs border-2 border-on-surface-variant"></span>')
    n = f'<span class="text-body-s text-on-surface-variant">{count}</span>' if count else ""
    return f'<label class="flex h-10 cursor-pointer items-center gap-3 text-body-m text-on-surface">{box}<span class="flex-1">{label}</span>{n}</label>'


def switch(label, on=False):
    track = ("bg-primary" if on else "bg-surface-container-highest border-2 border-outline")
    thumb = ("right-1 h-6 w-6 bg-on-primary" if on else "left-1.5 h-4 w-4 bg-outline")
    return (f'<label class="flex h-12 items-center justify-between text-body-m text-on-surface">{label}'
            f'<span class="relative h-8 w-[52px] rounded-full {track}"><span class="absolute top-1/2 -translate-y-1/2 rounded-full {thumb}"></span></span></label>')


def price_range(lo_label, hi_label, lo_pct, hi_pct, median_pct, median_label):
    return f"""<div class="relative mt-4 h-12" aria-hidden="true">
  <span class="absolute inset-x-0 top-4 h-2 rounded-full bg-surface-container-highest"></span>
  <span class="absolute top-4 h-2 rounded-full bg-secondary-container" style="left:{lo_pct}%;right:{100 - hi_pct}%"></span>
  <span class="absolute top-3 h-4 w-0.5 -translate-x-1/2 rounded-full bg-on-surface-variant" style="left:{median_pct}%"></span>
  <span class="absolute top-2 h-6 w-6 -translate-x-1/2 rounded-full border-2 border-surface-container-low bg-primary shadow-float" style="left:{lo_pct}%"></span>
  <span class="absolute top-2 h-6 w-6 -translate-x-1/2 rounded-full border-2 border-surface-container-low bg-primary shadow-float" style="left:{hi_pct}%"></span>
  <span class="absolute left-0 top-8 text-body-s text-on-surface-variant">{lo_label}</span>
  <span class="absolute top-8 -translate-x-1/2 whitespace-nowrap text-body-s text-on-surface-variant" style="left:{median_pct}%">{median_label}</span>
  <span class="absolute right-0 top-8 text-body-s text-on-surface-variant">{hi_label}</span>
</div>"""


def filter_group(title, body, first=False):
    return f'<section class="{"" if first else "border-t border-outline-variant pt-5"} pb-5"><h3 class="text-title-s text-on-surface">{title}</h3>{body}</section>'


def search_card(item, i):
    photo, price, title, cond, km, area, rating, facts, note = item
    num, unit = split_price(price)
    saved = i == 1
    facts_html = "".join(f'<span class="rounded-full bg-surface-container px-2.5 py-0.5 text-label-m text-on-surface-variant">{f}</span>' for f in facts)
    note_html = (f'<p class="mt-2 flex items-center gap-1 text-label-m text-tertiary">{icon("auto-awesome-rounded", 14)}{note}</p>' if note else "")
    return f"""<article class="lift min-w-0">
  <div class="relative overflow-hidden rounded-xl bg-surface-container-high" style="aspect-ratio: 4 / 3">
    <img src="{img(photo, 560, 420)}" alt="{escape(title)}" class="h-full w-full object-cover">
    <span class="absolute bottom-3 left-3 rounded-full bg-surface-container-lowest px-3 py-1 text-title-m text-on-surface shadow-float">{num}<span class="text-body-s text-on-surface-variant">{unit}</span></span>
    <span class="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-label-m text-white">{km}</span>
    <button type="button" class="state absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-surface-container-lowest/90 {"text-primary" if saved else "text-on-surface"}" aria-label="Lưu tin">{icon("favorite-rounded" if saved else "favorite-outline-rounded", 22)}</button>
  </div>
  <h3 class="mt-3 line-clamp-2 text-body-l text-on-surface">{escape(title)}</h3>
  <p class="mt-1 text-body-s text-on-surface-variant">{cond} · {area} · {icon("star-rounded", 13, "inline-block align-[-2px]")} {rating}</p>
  <div class="mt-2 flex flex-wrap gap-1.5">{facts_html}</div>
  {note_html}
</article>"""


EXTRA = [
    ("1496181133206-80ce9b88a853", "7.200.000 ₫", "Lenovo Yoga Slim 7, Ryzen 7, 16 GB, màn 100% sRGB", "Như mới", "3,8 km", "Q.2 cũ", "4,8",
     ["16 GB RAM", "Màn 100% sRGB", "Pin 90%"], None),
    ("1611186871348-b1ce696e52c9", "7.800.000 ₫", "MacBook Air M1 8/256GB, vỏ còn đẹp", "Đã dùng", "4,6 km", "Bình Thạnh", "4,7",
     ["Màn P3", "Pin 87%", "8 GB RAM"], None),
    ("1593642632823-8f785ba67e45", "6.500.000 ₫", "Dell Inspiron 14 Plus, i5, 16 GB", "Đã dùng", "2,9 km", "Thủ Đức", "4,6",
     ["16 GB RAM", "Màn 100% sRGB", "Pin 83%"], "Thấp hơn mức giữa 11%"),
]


def search():
    chips = (chip("Laptop", ai=True) + chip("Dưới 8 triệu", ai=True) + chip("Gần Thủ Đức · 5 km", ai=True)
             + chip("Màn hình chuẩn màu", ai=True) + chip("Thêm điều kiện", add=True))
    seg = "".join(f'<span class="flex h-10 flex-1 items-center justify-center gap-1 text-label-l {"bg-secondary-container text-on-secondary-container" if on else "bg-surface-container-high text-on-surface-variant"}">'
                  f'{icon("check-rounded", 16) if on else ""}{t}</span>' for t, on in [("Mới", False), ("Như mới", True), ("Đã dùng", True)])
    dist = "".join(f'<button type="button" class="state h-9 rounded-full px-3.5 text-label-l {"bg-secondary-container text-on-secondary-container" if d == "5 km" else "border border-outline-variant text-on-surface-variant"}">{d}</button>'
                   for d in ["1 km", "3 km", "5 km", "10 km", "Cả TP"])
    sidebar = f"""<aside class="self-start">
  <div class="overflow-hidden rounded-xl">{area_map([(36, 40, "7,4 tr", True), (64, 30, "7,9 tr", False), (70, 66, "6,8 tr", False), (30, 74, "5,9 tr", False)], you=(48, 56), h=200, guide=False)}</div>
  {a("map-view", "state mt-3 flex h-11 items-center justify-center gap-2 rounded-full border border-outline-variant text-label-l text-primary", icon("map-outline-rounded", 20) + "Xem trên bản đồ")}
  <div class="mt-6 rounded-xl bg-surface-container-low p-6">
    <div class="mb-4 flex items-center justify-between"><h2 class="text-title-l">Bộ lọc</h2>{a("reset", "text-label-l text-primary hover:underline", "Đặt lại")}</div>
    {filter_group("Giá", price_range("0", "15 tr", 0, 53, 49, "giữa 7,3 tr") + '<div class="mt-2 grid grid-cols-2 gap-2"><span class="rounded-md bg-surface-container-lowest px-3 py-2 text-body-m text-on-surface-variant">Từ <b class="font-medium text-on-surface">0 ₫</b></span><span class="rounded-md bg-surface-container-lowest px-3 py-2 text-body-m text-on-surface-variant">Đến <b class="font-medium text-on-surface">8.000.000 ₫</b></span></div>', first=True)}
    {filter_group("Tình trạng", f'<div class="seg mt-3 flex gap-0.5">{seg}</div>')}
    {filter_group("Khoảng cách", f'<div class="mt-3 flex flex-wrap gap-2">{dist}</div>')}
    {filter_group("Hãng", '<div class="mt-2">' + check("Apple", True, 9) + check("Dell", True, 11) + check("Lenovo", False, 8) + check("HP", False, 6) + check("ASUS", False, 4) + "</div>")}
    {filter_group("Khác", '<div class="mt-1">' + switch("Có thể trả giá", True) + switch("Người bán đã xác minh") + "</div>")}
  </div>
</aside>"""
    # Search results are a list (compare price, distance and matched specs at a glance);
    # browsing surfaces use cards. The grid view stays one click away.
    rows = [result_row(it, i) for i, it in enumerate(RESULTS[:6] + EXTRA)]
    alert = f"""<div class="my-3 flex items-center gap-6 overflow-hidden rounded-xl bg-secondary-container py-2 pl-4 pr-8">
  <img src="{ART["art_search"]}" alt="" class="h-[132px] w-[132px] shrink-0">
  <div class="flex-1"><p class="text-title-l text-on-surface">Chưa thấy máy ưng?</p><p class="mt-1 text-body-m text-on-secondary-container">Có laptop mới khớp câu này là ShopNexus báo bạn ngay.</p></div>
  <button type="button" class="state flex h-12 items-center gap-2 rounded-full bg-surface-container-lowest px-5 text-label-l text-primary">{icon("notifications-active-outline-rounded", 20)}Báo khi có tin mới</button>
</div>"""
    listing = "".join(rows[:3]) + alert + "".join(rows[3:])
    views = "".join(f'<span class="flex h-10 items-center gap-1.5 px-4 text-label-l {"bg-secondary-container text-on-secondary-container" if v == "Danh sách" else "text-on-surface-variant"}">{icon(ic, 18)}{v}</span>'
                    for v, ic in [("Danh sách", "view-list-outline-rounded"), ("Lưới", "grid-view-outline-rounded")])
    body = f"""<body>
<div class="min-h-screen bg-surface pb-2 font-sans text-on-surface">
  {header(quick="scroll")}
  <main class="mx-auto max-w-[1328px] px-6">
    <section class="mt-8">
      <div data-big-search class="flex h-16 items-center gap-3 rounded-full bg-surface-container-lowest pl-6 pr-2 shadow-float">
        {icon("search-rounded", 26, "text-on-surface-variant")}
        <p class="min-w-0 flex-1 truncate text-title-m font-normal text-on-surface">{QUERY}</p>
        <button type="button" class="state grid h-12 w-12 place-items-center rounded-full text-on-surface-variant" aria-label="Tìm bằng ảnh">{icon("photo-camera-outline-rounded", 24)}</button>
        <button type="button" class="state h-12 rounded-full bg-primary px-7 text-label-l text-on-primary">Tìm</button>
      </div>
      <div class="mt-4 flex flex-wrap items-center gap-2">{chips}</div>
    </section>

    <div class="mt-8 grid grid-cols-[300px_1fr] gap-8">
      {sidebar}
      <section>
        <div class="flex items-center justify-between">
          <div><h1 class="text-headline-m">38 laptop khớp</h1><p class="mt-1 flex items-center gap-1 text-body-m text-on-surface-variant">{icon("auto-awesome-rounded", 16, "text-primary")}Ưu tiên RAM 16 GB, vì Photoshop và Figma mở cùng lúc dùng nhiều bộ nhớ.</p></div>
          <div class="flex items-center gap-3">
            <div class="flex overflow-hidden rounded-full border border-outline-variant">{views}</div>
            <button type="button" class="state flex h-10 items-center gap-1 rounded-full border border-outline-variant pl-4 pr-3 text-label-l text-on-surface-variant">Phù hợp nhất{icon("keyboard-arrow-down-rounded", 18)}</button>
          </div>
        </div>
        <div class="mt-4 flex flex-col gap-1">{listing}</div>
        <div class="mt-10 flex justify-center"><button type="button" class="state h-12 rounded-full bg-secondary-container px-8 text-label-l text-on-secondary-container">Xem thêm 29 tin</button></div>
      </section>
    </div>
  </main>
  {footer()}
</div>
</body>
</html>"""
    return head("Tìm kiếm · ShopNexus", PAGE_CSS) + body


# ----------------------------------------------------------------- category --
PHONES = [
    ("1663499482523-1c0c1bae4ce1", "12,8 tr ₫", "iPhone 14 128GB, pin 91%, máy zin", "Như mới", "4,4 km", "Q.3", "4,8", "1 giờ", None),
    ("1632661674596-df8be070a5c5", "5.200.000 ₫", "iPhone 13 Pro 128GB Xanh Sierra, pin 88%", "Như mới", "2,1 km", "Bình Thạnh", "4,9", "2 giờ", "Giá tham khảo"),
    ("1678911820864-e2c567c655d7", "14,5 tr ₫", "Galaxy S23 Ultra 256GB, kèm bút", "Như mới", "2,9 km", "Phú Nhuận", "4,9", "20 phút", None),
    ("1616348436168-de43ad0db179", "6.900.000 ₫", "iPhone 12 128GB, màn zin, pin 84%", "Đã dùng", "0,8 km", "Bình Thạnh", "4,6", "3 giờ", "Rẻ hơn 8%"),
    ("1598327105666-5b89351aff97", "3.400.000 ₫", "Galaxy A54 5G 128GB, còn bảo hành", "Như mới", "1,7 km", "Q.1", "4,7", "45 phút", None),
    ("1695048133142-1a20484d2569", "15,9 tr ₫", "iPhone 15 128GB, bảo hành Apple đến 03/2027", "Như mới", "2,2 km", "Tân Bình", "4,9", "40 phút", "Cao hơn 6%"),
    ("1580910051074-3eb694886505", "5.200.000 ₫", "iPhone 12 mini 64GB, pin 82%", "Đã dùng", "1,9 km", "Q.1", "4,7", "5 giờ", None),
    ("1510557880182-3d4d3cba35a5", "3.900.000 ₫", "iPhone X 64GB, pin 86%, máy zin chưa sửa", "Như mới", "1,2 km", "Bình Thạnh", "4,8", "12 phút", "Rẻ hơn 13%"),
]
MODELS = [("iPhone 13 Pro 128GB", 4_900_000, 5_600_000, 5_300_000, 42), ("iPhone 12 128GB", 6_100_000, 7_400_000, 6_800_000, 57),
          ("Galaxy S23 Ultra 256GB", 13_200_000, 15_800_000, 14_600_000, 18), ("iPhone 15 128GB", 14_200_000, 16_500_000, 15_200_000, 23)]
PHONE_TIPS = [("Tài khoản iCloud đã thoát", "Cài đặt › tên tài khoản: máy không còn đăng nhập của người bán"),
              ("Tình trạng pin", "Cài đặt › Pin › Tình trạng pin, so với Tin ghi"),
              ("IMEI khớp vỏ hộp", "Bấm *#06# rồi so với số in trên hộp"),
              ("Face ID, camera, loa", "Mở khóa 3 lần, chụp một tấm, gọi thử một cuộc")]


def tr(v):
    s = f"{v / 1_000_000:.1f}".replace(".", ",")
    return s[:-2] if s.endswith(",0") else s


def model_card(name, lo, hi, med, n):
    axis_lo, axis_hi = lo * 0.85, hi * 1.15
    at = lambda v: round((v - axis_lo) / (axis_hi - axis_lo) * 100, 2)
    return f"""<article class="rounded-xl bg-surface-container-lowest p-5">
  <p class="text-title-m text-on-surface">{name}</p>
  <p class="mt-2 flex items-baseline gap-1"><span class="text-headline-m">{tr(lo)} – {tr(hi)}</span><span class="text-title-m text-on-surface-variant">tr ₫</span></p>
  <div class="relative mt-3 h-4" aria-hidden="true">
    <span class="absolute inset-x-0 top-1 h-2 rounded-full bg-surface-container-highest"></span>
    <span class="absolute top-1 h-2 rounded-full bg-tertiary-fixed" style="left:{at(lo)}%;right:{100 - at(hi)}%"></span>
    <span class="absolute top-0 h-4 w-0.5 -translate-x-1/2 rounded-full bg-on-surface-variant" style="left:{at(med)}%"></span>
  </div>
  <p class="mt-2 text-body-s text-on-surface-variant">giữa {tr(med)} tr · {n} tin trong 30 ngày</p>
  {a("model-" + name.split()[1], "mt-3 inline-flex items-center gap-1 text-label-l text-primary hover:underline", "Xem tin" + icon("arrow-forward-rounded", 16))}
</article>"""


def category():
    brands = [("Tất cả", "3.412"), ("iPhone", "1.986"), ("Samsung", "742"), ("Xiaomi", "268"), ("OPPO", "171"), ("Google Pixel", "58"), ("Khác", "187")]
    brand_html = "".join(
        f'<button type="button" class="state flex h-11 items-center gap-2 rounded-full px-5 text-label-l {"bg-inverse-surface text-inverse-on-surface" if i == 0 else "bg-surface-container-lowest text-on-surface"}">{b}<span class="{"text-inverse-on-surface/70" if i == 0 else "text-on-surface-variant"} text-label-m">{n}</span></button>'
        for i, (b, n) in enumerate(brands))
    filters = "".join(f'<button type="button" class="state flex h-9 items-center gap-1 rounded-full px-4 text-label-l {c}">{t}</button>'
                      for t, c in [("Dưới 5 triệu", "border border-outline-variant text-on-surface-variant"), ("Như mới", "bg-secondary-container text-on-secondary-container"),
                                   ("Trong 3 km", "border border-outline-variant text-on-surface-variant"), ("Pin trên 85%", "border border-outline-variant text-on-surface-variant"),
                                   ("Có thể trả giá", "border border-outline-variant text-on-surface-variant")])
    grid = "".join(feed_card(it, i) for i, it in enumerate(PHONES))
    tips = "".join(f"""<li class="flex items-start gap-4 rounded-lg bg-surface-container-lowest p-4">
  <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary-container text-title-s text-on-secondary-container">{i + 1}</span>
  <div><p class="text-title-m">{t}</p><p class="mt-0.5 text-body-m text-on-surface-variant">{d}</p></div></li>""" for i, (t, d) in enumerate(PHONE_TIPS))
    body = f"""<body>
<div class="min-h-screen bg-surface pb-2 font-sans text-on-surface">
  {header(quick="scroll").replace('bg-secondary-container text-on-secondary-container">Khám phá', 'text-on-surface-variant">Khám phá', 1).replace('text-on-surface-variant">Danh mục', 'bg-secondary-container text-on-secondary-container">Danh mục', 1)}
  <main class="mx-auto max-w-[1328px] px-6">
    <nav class="mt-6 flex items-center gap-1.5 text-body-s text-on-surface-variant">{a("crumb-home", "hover:underline", "Khám phá")}{icon("chevron-right-rounded", 16)}{a("crumb-cats", "hover:underline", "Danh mục")}{icon("chevron-right-rounded", 16)}<span class="text-on-surface">Điện thoại</span></nav>
    <section class="relative mt-4 h-[380px] overflow-hidden rounded-xl bg-secondary-container">
      <div class="relative z-10 max-w-[620px] px-14 pt-14">
        <p class="text-label-l uppercase tracking-[0.12em] text-on-secondary-container">Danh mục</p>
        <h1 class="mt-2 text-display-l text-on-surface">Điện thoại</h1>
        <p class="mt-3 text-body-l text-on-secondary-container">3.412 máy quanh Bình Thạnh · 218 máy mới đăng hôm nay</p>
        <div data-big-search class="mt-7 flex h-14 max-w-[520px] items-center gap-3 rounded-full bg-surface-container-lowest pl-5 pr-2 shadow-float">
          {icon("search-rounded", 22, "text-on-surface-variant")}<span class="flex-1 text-body-l text-on-surface-variant">iPhone pin trên 85%, dưới 6 triệu</span>
          <button type="button" class="state h-10 rounded-full bg-primary px-5 text-label-l text-on-primary">Tìm</button>
        </div>
      </div>
      <img src="{ART["category_phones"]}" alt="" class="absolute -bottom-10 right-[260px] w-[300px] rotate-[8deg]">
      <div class="absolute right-12 top-12 w-[200px] rotate-[4deg] rounded-md bg-surface-container-lowest p-2 pb-3 shadow-float">
        <img src="{img(PHONES[1][0], 400, 400)}" alt="" class="aspect-square w-full rounded-sm object-cover">
        <div class="mt-2 flex items-center justify-between px-1"><span class="whitespace-nowrap rounded-full bg-tertiary-fixed px-2.5 py-0.5 text-title-s text-on-tertiary-fixed-variant">5.200.000<span class="text-body-s"> ₫</span></span><span class="flex items-center gap-0.5 whitespace-nowrap text-label-m text-on-surface-variant">{icon("near-me-rounded", 14)}2,1 km</span></div>
      </div>
    </section>

    <div class="-mt-6 relative z-10 flex flex-wrap gap-2 px-8">{brand_html}</div>

    <section class="mt-16 rounded-xl bg-surface-container-low p-8">
      <div class="flex items-end justify-between">
        <div><p class="flex items-center gap-1.5 text-label-l uppercase tracking-[0.12em] text-primary">{icon("auto-awesome-rounded", 16)}Giá tham khảo</p><h2 class="mt-2 text-display-s">Máy đời này đang bán quanh bao nhiêu?</h2></div>
        <p class="max-w-[300px] text-right text-body-m text-on-surface-variant">Tính trên tin cùng đời máy ở TP.HCM trong 30 ngày, đã tính tình trạng và dung lượng.</p>
      </div>
      <div class="mt-6 grid grid-cols-4 gap-4">{"".join(model_card(*m) for m in MODELS)}</div>
    </section>

    <section class="mt-16">
      <div class="flex items-end justify-between">
        <h2 class="text-display-s">Máy đang bán gần bạn</h2>
        <button type="button" class="state flex h-10 items-center gap-1 rounded-full border border-outline-variant pl-4 pr-3 text-label-l text-on-surface-variant">Gần nhất{icon("keyboard-arrow-down-rounded", 18)}</button>
      </div>
      <div class="mt-5 flex flex-wrap gap-2">{filters}</div>
      <div class="stagger mt-8 grid grid-cols-4 gap-x-5 gap-y-10 pb-7">{grid}</div>
      <div class="mt-10 flex justify-center"><button type="button" class="state h-12 rounded-full bg-secondary-container px-8 text-label-l text-on-secondary-container">Xem thêm 3.404 máy</button></div>
    </section>

    <section class="mt-20 grid grid-cols-[360px_1fr] items-center gap-10 rounded-xl bg-secondary-container p-10">
      <img src="{ART["door-check"]}" alt="" class="w-full">
      <div>
        <p class="flex items-center gap-1.5 text-label-l uppercase tracking-[0.12em] text-on-secondary-container">{icon("auto-awesome-rounded", 16, "text-primary")}Mẹo kiểm điện thoại · gợi ý chung</p>
        <h2 class="mt-2 text-display-s text-on-surface">Kiểm 4 điều này khi shipper tới cửa</h2>
        <ul class="mt-6 grid grid-cols-2 gap-3">{tips}</ul>
        <p class="mt-5 flex items-center gap-2 text-body-l text-on-surface">{icon("undo-rounded", 20)}{MONEY["refuse"]}</p>
      </div>
    </section>
  </main>
  {footer()}
</div>
</body>
</html>"""
    return head("Danh mục Điện thoại · ShopNexus", PAGE_CSS) + body


if __name__ == "__main__":
    for name, fn in [("search", search), ("category", category)]:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(fn())
        print("wrote", name)
