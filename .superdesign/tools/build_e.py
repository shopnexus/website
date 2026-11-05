"""Direction E, "Hỏi là thấy": search-first. Home is one natural-language
question, the filters the model read from it, and the results beside a
"why these" panel. Listing detail is built for deciding: price against
similar listings, how this one fits the question, a side-by-side comparison.

    python3 tools/build_e.py        (run from .superdesign/)
"""
import os
from html import escape

from build import OUT, a, money
from build_c import footer as site_footer, header as site_header
from common import LOGO, MONEY, crop, head, icon, img, split_price

CSS = """
  .caret { display: inline-block; width: 2px; height: 28px; margin-left: 2px; vertical-align: -6px; background: var(--md-primary); }
  .row-hover:hover { background: var(--md-surface-container-low); }
"""

QUERY = "laptop cũ cho sinh viên thiết kế, dưới 8 triệu, gần Thủ Đức"
SELLER_PHOTO = "1500648767791-00dcc994a43e"

# photo, price, title, condition, km, area, rating, matched facts, AI note (price judgment) or None
RESULTS = [
    ("1593642632823-8f785ba67e45", "7.400.000 ₫", "Dell XPS 13 9310 i7, 16 GB, màn 100% sRGB", "Như mới", "1,8 km", "Thủ Đức", "4,9",
     ["16 GB RAM", "Màn 100% sRGB", "Pin 89%"], "Thấp hơn mức giữa 6%"),
    ("1611186871348-b1ce696e52c9", "7.900.000 ₫", "MacBook Air M1 8/256GB, màn P3, sạc 92 lần", "Như mới", "3,2 km", "Thủ Đức", "4,8",
     ["Màn P3", "Pin 92%", "8 GB RAM"], None),
    ("1496181133206-80ce9b88a853", "6.800.000 ₫", "ThinkPad X1 Carbon Gen 8, i5, 16 GB", "Đã dùng", "2,6 km", "Q.9 cũ", "4,7",
     ["16 GB RAM", "Màn 100% sRGB", "Pin 81%"], "Thấp hơn mức giữa 14%"),
    ("1517336714731-489689fd1ca8", "7.950.000 ₫", "MacBook Pro 13 2019 i5, 8 GB, Touch Bar", "Đã dùng", "4,1 km", "Bình Thạnh", "4,6",
     ["Màn P3", "Pin 84%", "8 GB RAM"], None),
    ("1525547719571-a2d4ac8945e2", "5.900.000 ₫", "HP Envy 13, i5 thế hệ 10, màn cảm ứng", "Đã dùng", "1,1 km", "Thủ Đức", "4,5",
     ["8 GB RAM", "Màn 72% NTSC", "Pin 78%"], None),
    ("1588872657578-7efd1f1555ed", "7.600.000 ₫", "ASUS ZenBook 14 OLED, Ryzen 5, 16 GB", "Như mới", "5,4 km", "Q.2 cũ", "4,9",
     ["16 GB RAM", "Màn OLED 100% DCI-P3", "Pin 95%"], None),
]


def header(over=False):
    """over=True sits on the hero photo: white text, no fill."""
    if over:
        return (_header().replace('<header class="border-b border-outline-variant bg-surface">', '<header class="absolute inset-x-0 top-0 z-20 border-b border-white/15">')
                .replace("text-on-surface-variant", "text-white/80").replace("text-on-surface", "text-white"))
    return _header()


def _header():
    return f"""<header class="border-b border-outline-variant bg-surface">
  <div class="mx-auto flex h-16 max-w-[1328px] items-center gap-8 px-6">
    {a("brand", "flex items-center gap-2", f'<img src="{LOGO}" alt="ShopNexus" class="h-8 w-8"><span class="text-title-l font-medium text-on-surface">ShopNexus</span>', "#home")}
    <nav class="flex gap-6 text-label-l text-on-surface-variant">{a("nav-search", "text-on-surface", "Tìm")}{a("nav-cats", "hover:text-on-surface", "Danh mục")}{a("nav-alerts", "hover:text-on-surface", "Đang theo dõi")}</nav>
    <span class="flex-1"></span>
    {a("saved", "state grid h-10 w-10 place-items-center rounded-full text-on-surface-variant", icon("favorite-outline-rounded", 24))}
    {a("messages", "state relative grid h-10 w-10 place-items-center rounded-full text-on-surface-variant", icon("chat-outline-rounded", 24) + '<span class="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-error px-1 text-label-s text-on-error">3</span>')}
    <button type="button" class="state flex h-10 items-center gap-2 rounded-full bg-primary pl-3 pr-4 text-label-l text-on-primary">{icon("add-rounded", 20)}Đăng tin</button>
    <img src="{img("1544723795-3fb6469f5b39", 96, 96)}" alt="Tài khoản" class="h-9 w-9 rounded-full object-cover">
  </div>
</header>"""


def chip(label, ai=False, picker=False, add=False):
    if add:
        return f'<button type="button" class="state flex h-9 items-center gap-1 rounded-full border border-dashed border-outline bg-surface-container-lowest px-3 text-label-l text-on-surface-variant">{icon("add-rounded", 18)}{label}</button>'
    if picker:
        return f'<button type="button" class="state flex h-9 items-center gap-1 rounded-full border border-outline-variant bg-surface-container-lowest pl-4 pr-2 text-label-l text-on-surface-variant">{label}{icon("keyboard-arrow-down-rounded", 18)}</button>'
    lead = icon("auto-awesome-rounded", 18, "text-primary") if ai else icon("check-rounded", 18)
    return (f'<button type="button" class="state flex h-9 items-center gap-1.5 rounded-full bg-secondary-container pl-2.5 pr-2 text-label-l text-on-secondary-container">'
            f'{lead}{label}<span class="ml-1 grid h-6 w-6 place-items-center rounded-full">{icon("close-rounded", 16)}</span></button>')


def mini_map(pins, h=240, you=(30, 64)):
    blocks = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{hh}" rx="8" fill="#E6ECEA"/>' for x, y, w, hh in [
        (16, 16, 90, 60), (120, 16, 80, 60), (214, 16, 110, 60), (338, 16, 46, 110), (16, 90, 90, 70), (120, 90, 80, 70),
        (214, 90, 110, 70), (16, 174, 140, 50), (170, 174, 154, 50)])
    road = '<path d="M0 84 H400 M110 0 V240 M330 0 V240 M0 166 H400" stroke="#FFFFFF" stroke-width="8"/>'
    svg = f'<svg viewBox="0 0 400 {h}" preserveAspectRatio="xMidYMid slice" class="absolute inset-0 h-full w-full" aria-hidden="true"><rect width="400" height="{h}" fill="#F1F4F2"/>{road}{blocks}</svg>'
    pins_html = "".join(
        f'<span class="absolute -translate-x-1/2 -translate-y-full rounded-full px-2.5 py-1 text-label-m shadow-float {"bg-primary text-on-primary" if sel else "bg-surface-container-lowest text-on-surface"}" style="left:{x}%;top:{y}%">{p}</span>'
        for x, y, p, sel in pins)
    me = f'<span class="absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-surface-container-lowest bg-primary ring-8 ring-primary/15" style="left:{you[0]}%;top:{you[1]}%"></span>'
    return f'<div class="relative overflow-hidden rounded-lg" style="height:{h}px">{svg}{pins_html}{me}</div>'


def result_row(item, i):
    photo, price, title, cond, km, area, rating, facts, note = item
    num, unit = split_price(price)
    facts_html = "".join(f'<span class="rounded-sm bg-surface-container px-2 py-0.5 text-label-m text-on-surface-variant">{f}</span>' for f in facts)
    note_html = (f'<p class="mt-1 flex items-center gap-1 text-label-m text-tertiary">{icon("auto-awesome-rounded", 14)}{note}</p>' if note else "")
    sel = "bg-surface-container-low" if i == 0 else ""
    return f"""<article class="row-hover flex gap-5 rounded-lg p-3 {sel}">
  <img src="{img(photo, 320, 240)}" alt="{escape(title)}" class="h-[120px] w-[160px] shrink-0 rounded-md object-cover">
  <div class="min-w-0 flex-1">
    <div class="flex items-start gap-3">
      <h3 class="min-w-0 flex-1 text-title-m text-on-surface">{escape(title)}</h3>
      <p class="whitespace-nowrap text-title-l text-on-surface">{num}<span class="text-body-m text-on-surface-variant">{unit}</span></p>
    </div>
    <p class="mt-1 text-body-m text-on-surface-variant">{cond} · {area} · {km}<span class="mx-1.5">·</span>{icon("star-rounded", 14, "inline-block align-[-2px]")} {rating}</p>
    <div class="mt-2.5 flex flex-wrap gap-1.5">{facts_html}</div>
    {note_html}
  </div>
  <button type="button" class="state -mr-1 grid h-10 w-10 shrink-0 place-items-center rounded-full {"text-primary" if i == 1 else "text-on-surface-variant"}" aria-label="Lưu tin">{icon("favorite-rounded" if i == 1 else "favorite-outline-rounded", 22)}</button>
</article>"""


def footer():
    links = "".join(a(f"foot-{i}", "whitespace-nowrap hover:text-on-surface", t) for i, t in enumerate(["Cách mua bằng COD", "Báo cáo vi phạm", "Trợ giúp", "Điều khoản"]))
    return f"""<footer class="mt-24 border-t border-outline-variant">
  <div class="mx-auto flex max-w-[1328px] items-center gap-8 px-6 py-8 text-body-m text-on-surface-variant">
    <span class="flex items-center gap-2 whitespace-nowrap"><img src="{LOGO}" alt="ShopNexus" class="h-6 w-6">© 2026 ShopNexus</span>
    <span class="whitespace-nowrap">{MONEY["no_hold"]}</span>
    <span class="flex-1"></span>
    <nav class="flex gap-6">{links}</nav>
  </div>
</footer>"""


def home():
    chips = (chip("Laptop", ai=True) + chip("Dưới 8 triệu", ai=True) + chip("Gần Thủ Đức · 5 km", ai=True)
             + chip("Màn hình chuẩn màu", ai=True) + chip("Tình trạng", picker=True) + chip("Thêm điều kiện", add=True))
    recent = "".join(a(f"recent-{i}", "state flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full bg-black/30 px-3 text-label-l text-white", icon("history-rounded", 16) + t)
                     for i, t in enumerate(["iPhone 13 pin trên 85%", "xe đạp cho bé 8 tuổi"]))
    rows = "".join(result_row(it, i) for i, it in enumerate(RESULTS))
    why = [("Màn hình chuẩn màu", "Chỉ giữ máy có màn từ 100% sRGB hoặc P3 trở lên, hợp làm đồ họa."),
           ("Dưới 8 triệu", "38 tin khớp, mức giữa 7,3 triệu cho cấu hình này."),
           ("Cho sinh viên thiết kế", "Ưu tiên RAM 16 GB, vì Photoshop và Figma mở cùng lúc dùng nhiều bộ nhớ.")]
    why_html = "".join(f'<li><p class="text-title-s text-on-surface">{t}</p><p class="mt-0.5 text-body-m text-on-surface-variant">{d}</p></li>' for t, d in why)
    refine = "".join(f'<button type="button" class="state flex h-9 items-center gap-1.5 rounded-full border border-outline-variant px-3.5 text-label-l text-on-surface">{icon("add-rounded", 16, "text-on-surface-variant")}{t}</button>'
                     for t in ["Chỉ RAM 16 GB", "Thêm MacBook M1", "Trong 3 km", "Pin trên 85%", "Có thể trả giá"])
    pins = [(26, 36, "7,4 tr", True), (52, 30, "7,9 tr", False), (70, 58, "6,8 tr", False), (44, 80, "5,9 tr", False), (84, 28, "7,6 tr", False)]
    body = f"""<body>
<div class="min-h-screen bg-surface font-sans text-on-surface">
  <main>
    <section class="relative overflow-hidden">
      <div class="fixed inset-x-0 top-0 z-30">{site_header(quick="scroll")}</div>
      <img src="{img("1583417319070-4a69db38a482", 2400, 1400)}" alt="" class="absolute inset-0 h-full w-full object-cover">
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      <div class="relative mx-auto max-w-[1328px] px-6 pb-14 pt-[176px]">
        <div class="mx-auto max-w-[920px]">
          <p class="flex items-center justify-center gap-2 text-label-l text-white/85">{icon("near-me-rounded", 18)}Thủ Đức, TP.HCM · 2.418 món đang bán quanh bạn</p>
          <h1 class="mt-4 text-center text-display-l text-white">Bạn đang tìm gì?</h1>
          <p class="mt-3 text-center text-body-l text-white/85">Gõ như đang nhắn cho người bạn rành đồ cũ, hoặc chụp một tấm ảnh.</p>
          <div data-big-search class="mt-10 flex h-[76px] items-center gap-3 rounded-full bg-surface-container-lowest pl-7 pr-2.5 shadow-float">
            {icon("search-rounded", 28, "text-on-surface-variant")}
            <p class="min-w-0 flex-1 truncate text-title-l text-on-surface">{QUERY}<span class="caret"></span></p>
            <button type="button" class="state grid h-12 w-12 place-items-center rounded-full text-on-surface-variant" aria-label="Nói">{icon("mic-outline-rounded", 24)}</button>
            <button type="button" class="state grid h-12 w-12 place-items-center rounded-full text-on-surface-variant" aria-label="Tìm bằng ảnh">{icon("photo-camera-outline-rounded", 24)}</button>
            <button type="button" class="state h-14 rounded-full bg-primary px-8 text-label-l text-on-primary">Tìm</button>
          </div>
          <div class="mt-5 flex flex-wrap items-center justify-center gap-2">{chips}</div>
          <div class="mt-8 flex items-center justify-center gap-1 border-t border-white/20 pt-5">
            <span class="mr-2 whitespace-nowrap text-label-l text-white/80">Gần đây</span>{recent}
            <span class="mx-3 h-5 w-px bg-white/25"></span>
            {a("alert-a7", "state flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full bg-surface-container-lowest px-3 text-label-l text-on-surface", icon("notifications-active-outline-rounded", 16, "text-primary") + 'Sony A7 III dưới 25 triệu<span class="ml-1 whitespace-nowrap rounded-full bg-primary px-1.5 text-label-s text-on-primary">2 mới</span>')}
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto mt-10 grid max-w-[1328px] grid-cols-[1fr_400px] gap-10 px-6">
      <div>
        <div class="flex items-center justify-between">
          <p class="text-title-m">38 tin khớp <span class="text-body-m text-on-surface-variant">· trong 5 km quanh Thủ Đức</span></p>
          <div class="flex items-center gap-2">
            {a("save-search", "state flex h-10 items-center gap-2 rounded-full border border-outline-variant px-4 text-label-l text-primary", icon("notifications-outline-rounded", 18) + "Báo khi có tin mới")}
            <button type="button" class="state flex h-10 items-center gap-1 rounded-full border border-outline-variant pl-4 pr-2 text-label-l text-on-surface-variant">Phù hợp nhất{icon("keyboard-arrow-down-rounded", 18)}</button>
          </div>
        </div>
        <div class="mt-4 flex flex-col gap-1">{rows}</div>
        <button type="button" class="state mt-4 h-12 w-full rounded-full bg-surface-container text-label-l text-on-surface">Xem thêm 32 tin</button>
      </div>
      <aside class="self-start">
        <div class="rounded-xl bg-surface-container-low p-6">
          <p class="flex items-center gap-2 text-title-m text-on-surface">{icon("auto-awesome-rounded", 20, "text-primary")}Cách đọc câu hỏi của bạn</p>
          <ul class="mt-4 flex flex-col gap-4">{why_html}</ul>
          <div class="mt-6">{mini_map(pins)}</div>
          <p class="mt-5 text-label-l text-on-surface-variant">Hỏi tiếp</p>
          <div class="mt-2.5 flex flex-wrap gap-2">{refine}</div>
        </div>
      </aside>
    </section>
  </main>
  {site_footer()}
</div>
</body>
</html>"""
    return head("Trang chủ · E. Hỏi là thấy", CSS) + body


# ------------------------------------------------------------------- detail --
PHOTO = RESULTS[0][0]
# One seller's photos: the whole machine and close-ups cropped from it.
PHOTOS = [img(PHOTO, 1200, 900), crop(PHOTO, 400, 0.35, 0.75, 2.4), crop(PHOTO, 400, 0.6, 0.4, 2.2),
          crop(PHOTO, 400, 0.8, 0.8, 2.8), crop(PHOTO, 400, 0.5, 0.6, 1.4)]
CLAIMS = [("Pin 89%", "Mở Dell Power Manager › Thông tin pin"), ("RAM 16 GB", "Cài đặt › Hệ thống › Giới thiệu"),
          ("Màn 100% sRGB, không điểm chết", "Mở một ảnh trắng và một ảnh đen toàn màn hình"), ("Chưa từng sửa", "Xem tem ở ốc đáy máy còn nguyên")]
COMPARE = [
    ("Tin này", RESULTS[0][0], "7.400.000 ₫", "Như mới", "1,8 km", "4,9 · 21 đánh giá", "i7 · 16 GB", "100% sRGB", "89%"),
    ("ThinkPad X1 Carbon", RESULTS[2][0], "6.800.000 ₫", "Đã dùng", "2,6 km", "4,7 · 9 đánh giá", "i5 · 16 GB", "100% sRGB", "81%"),
    ("MacBook Air M1", RESULTS[1][0], "7.900.000 ₫", "Như mới", "3,2 km", "4,8 · 40 đánh giá", "M1 · 8 GB", "P3", "92%"),
    ("ZenBook 14 OLED", RESULTS[5][0], "7.600.000 ₫", "Như mới", "5,4 km", "4,9 · 12 đánh giá", "Ryzen 5 · 16 GB", "100% DCI-P3", "95%"),
]


def detail():
    thumbs = "".join(f'<img src="{p}" alt="" class="aspect-square w-full rounded-sm object-cover {"ring-2 ring-primary ring-offset-2 ring-offset-surface" if i == 0 else ""}">'
                     for i, p in enumerate(PHOTOS))
    fit = [(True, "Dưới 8 triệu", "7.400.000 ₫"), (True, "Gần Thủ Đức", "1,8 km, cùng phường Linh Trung"),
           (True, "Màn hình chuẩn màu", "Người bán ghi 100% sRGB"), (True, "Cho thiết kế", "16 GB RAM, chạy Photoshop và Figma cùng lúc được")]
    fit_html = "".join(
        f'<li class="flex items-start gap-3"><span class="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary-container text-on-secondary-container">{icon("check-rounded", 16)}</span>'
        f'<span><span class="text-title-s text-on-surface">{t}</span><span class="block text-body-m text-on-surface-variant">{d}</span></span></li>' for ok, t, d in fit)
    lo, hi = 5_500_000, 9_000_000
    at = lambda v: round((v - lo) / (hi - lo) * 100, 2)
    strip = f"""<div class="relative mt-3 h-12" aria-hidden="true">
  <span class="absolute inset-x-0 top-4 h-2 rounded-full bg-surface-container-highest"></span>
  <span class="absolute top-4 h-2 rounded-full bg-tertiary-fixed" style="left:{at(6_600_000)}%;right:{100 - at(8_200_000)}%"></span>
  <span class="absolute top-3 h-4 w-0.5 -translate-x-1/2 rounded-full bg-on-surface-variant" style="left:{at(7_900_000)}%"></span>
  <span class="absolute top-3 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-surface bg-tertiary" style="left:{at(7_400_000)}%"></span>
  <span class="absolute left-0 top-7 text-body-s text-on-surface-variant">5,5 tr</span>
  <span class="absolute top-7 -translate-x-1/2 text-body-s text-on-surface-variant" style="left:{at(7_900_000)}%">giữa 7,9 tr</span>
  <span class="absolute right-0 top-7 text-body-s text-on-surface-variant">9 tr</span>
</div>"""
    rows = [("Giá", 2), ("Tình trạng", 3), ("Khoảng cách", 4), ("Người bán", 5), ("Cấu hình", 6), ("Màn hình", 7), ("Pin", 8)]
    head_cells = "".join(
        f'<th class="w-1/4 p-4 text-left align-top font-normal {"bg-secondary-container/60" if i == 0 else ""} {"rounded-t-lg" if i == 0 else ""}">'
        f'<img src="{img(c[1], 320, 240)}" alt="" class="aspect-[4/3] w-full rounded-md object-cover"><p class="mt-2 text-title-s text-on-surface">{c[0]}</p></th>'
        for i, c in enumerate(COMPARE))
    body_rows = "".join(
        f'<tr><th class="whitespace-nowrap py-3 pl-5 pr-6 text-left text-body-m font-normal text-on-surface-variant">{label}</th>'
        + "".join(f'<td class="px-4 py-3 text-body-m {"bg-secondary-container/60 text-on-surface" if i == 0 else "text-on-surface"} {"text-title-m" if idx == 2 else ""}">{c[idx]}</td>' for i, c in enumerate(COMPARE))
        + "</tr>" for label, idx in rows)
    claims = "".join(
        f"""<li class="flex items-start gap-4 border-t border-outline-variant py-4 first:border-t-0">
  {icon("fact-check-outline-rounded", 22, "mt-0.5 text-on-surface-variant")}
  <div><p class="text-title-s text-on-surface">{c}</p><p class="mt-0.5 text-body-m text-on-surface-variant">{how}</p></div>
</li>""" for c, how in CLAIMS)
    num, unit = split_price(RESULTS[0][1])
    body = f"""<body>
<div class="min-h-screen bg-surface font-sans text-on-surface">
  {header()}
  <main class="mx-auto max-w-[1328px] px-6">
    <div class="mt-5 flex items-center gap-3">
      {a("back-results", "state flex h-10 items-center gap-2 rounded-full bg-surface-container-low pl-3 pr-4 text-label-l text-on-surface", icon("arrow-back-rounded", 20) + f'38 tin cho “{QUERY}”')}
      <span class="flex-1"></span>
      <span class="text-body-m text-on-surface-variant">Tin 1 / 38</span>
      <button type="button" class="state grid h-10 w-10 place-items-center rounded-full border border-outline-variant text-on-surface-variant opacity-40" aria-label="Tin trước">{icon("chevron-left-rounded", 22)}</button>
      <button type="button" class="state grid h-10 w-10 place-items-center rounded-full border border-outline-variant text-on-surface" aria-label="Tin sau">{icon("chevron-right-rounded", 22)}</button>
    </div>

    <div class="mt-6 grid grid-cols-[680px_1fr] gap-12">
      <section>
        <div class="relative overflow-hidden rounded-xl bg-surface-container-high" style="aspect-ratio: 4 / 3">
          <img src="{PHOTOS[0]}" alt="Dell XPS 13 9310" class="h-full w-full object-cover">
          <span class="absolute bottom-4 right-4 rounded-full bg-black/60 px-3 py-1 text-label-m text-white">1 / 5</span>
        </div>
        <div class="mt-3 grid grid-cols-5 gap-3">{thumbs}</div>
        <p class="mt-4 flex items-center gap-2 text-body-m text-on-surface-variant">{icon("photo-camera-outline-rounded", 18)}Cả 5 ảnh chụp trong app</p>
      </section>

      <section>
        <p class="text-body-m text-on-surface-variant">Như mới · Thủ Đức · 1,8 km · Lê Hoàng đăng</p>
        <h1 class="mt-2 text-headline-m text-on-surface">{escape(RESULTS[0][2])}</h1>
        <div class="mt-6 flex items-end justify-between gap-6">
          <p><span class="text-display-m">{num}</span><span class="text-title-l text-on-surface-variant">{unit}</span></p>
          <p class="mb-2 flex items-center gap-1 text-label-l text-tertiary">{icon("auto-awesome-rounded", 16)}Thấp hơn mức giữa 6%</p>
        </div>
        {strip}
        <p class="text-body-s text-on-surface-variant">27 tin cùng cấu hình · 30 ngày · TP.HCM</p>

        <div class="mt-6 rounded-xl bg-surface-container-low p-5">
          <p class="flex items-center gap-2 text-title-m">{icon("auto-awesome-rounded", 20, "text-primary")}Khớp với câu hỏi của bạn</p>
          <ul class="mt-4 grid grid-cols-2 gap-x-6 gap-y-4">{fit_html}</ul>
        </div>

        <div class="mt-6 grid grid-cols-[1fr_1fr_auto] gap-2">
          <button type="button" class="state flex h-14 items-center justify-center gap-2 rounded-full bg-secondary-container text-label-l text-on-secondary-container">{icon("chat-outline-rounded", 20)}Nhắn tin</button>
          <button type="button" class="state flex h-14 items-center justify-center gap-2 rounded-full bg-tertiary text-label-l text-on-tertiary">{icon("sell-outline-rounded", 20)}Trả giá</button>
          <button type="button" class="state grid h-14 w-14 place-items-center rounded-full border border-outline-variant text-on-surface-variant" aria-label="Lưu tin">{icon("favorite-outline-rounded", 24)}</button>
        </div>
        <div class="mt-5 flex items-center gap-4 rounded-lg border border-outline-variant px-4 py-3">
          {icon("local-shipping-outline-rounded", 24, "text-on-surface-variant")}
          <span class="flex-1"><span class="block text-body-l">COD, xem hàng trước</span><span class="block text-body-s text-on-surface-variant">Gửi từ Thủ Đức · phí ship 16.000–30.000 ₫</span></span>
        </div>
        <div class="mt-4 flex flex-col gap-2.5">{money("cod_buyer", "inventory-2-outline-rounded")}{money("meet_hint", "group-outline-rounded")}{money("no_hold", "account-balance-outline-rounded")}</div>
      </section>
    </div>

    <section class="mt-16">
      <div class="flex items-end justify-between"><h2 class="text-headline-s">So với 3 tin tương tự</h2><p class="text-body-m text-on-surface-variant">Cùng tầm giá, trong 6 km</p></div>
      <div class="mt-5 overflow-hidden rounded-xl border border-outline-variant">
        <table class="w-full border-collapse">
          <thead><tr><th class="w-[140px]"></th>{head_cells}</tr></thead>
          <tbody class="[&>tr]:border-t [&>tr]:border-outline-variant">{body_rows}</tbody>
        </table>
      </div>
    </section>

    <section class="mt-16 grid grid-cols-2 gap-10">
      <div>
        <h2 class="text-headline-s">Tin ghi · kèm cách tự kiểm</h2>
        <ul class="mt-4">{claims}</ul>
        <p class="mt-2 flex items-center gap-2 text-body-m text-on-surface">{icon("undo-rounded", 18)}{MONEY["refuse"]}</p>
        <p class="mt-3 flex items-center gap-2 text-body-s text-on-surface-variant">{icon("auto-awesome-rounded", 14, "text-primary")}Mẹo kiểm laptop · gợi ý chung, không phải điều Lê Hoàng cam kết</p>
      </div>
      <div>
        <h2 class="text-headline-s">Người bán</h2>
        <div class="mt-4 flex items-center gap-4">
          <img src="{img(SELLER_PHOTO, 112, 112)}" alt="" class="h-14 w-14 rounded-full object-cover">
          <div class="flex-1"><p class="flex items-center gap-1 text-title-m">Lê Hoàng{icon("verified-rounded", 18, "text-primary")}</p><p class="text-body-m text-on-surface-variant">Thủ Đức · tham gia 2024</p></div>
          {a("seller", "state flex h-10 items-center rounded-full border border-outline-variant px-4 text-label-l text-primary", "Xem 6 tin khác")}
        </div>
        <dl class="mt-5 grid grid-cols-3 gap-3">{"".join(f'<div class="rounded-lg bg-surface-container-low p-4"><dt class="text-body-s text-on-surface-variant">{l}</dt><dd class="mt-1 text-title-l">{v}</dd></div>' for v, l in [("4,9", "21 đánh giá"), ("8", "đã bán"), ("15 phút", "thường trả lời")])}</dl>
        <h3 class="mt-8 text-title-m">Lời người bán</h3>
        <p class="mt-2 text-body-l text-on-surface">Máy mua 2022, dùng học kiến trúc, bàn phím và màn còn đẹp. Có sạc zin 45W. Xem máy ở Linh Trung sau 17h.</p>
      </div>
    </section>
  </main>
  {footer()}
</div>
</body>
</html>"""
    return head("Chi tiết tin · E. Hỏi là thấy", CSS) + body


if __name__ == "__main__":
    for name, fn in [("home-e", home)]:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(fn())
        print("wrote", name)
