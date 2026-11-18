"""Two calmer directions for the website after J ("Kính mờ") read as AI-built:
no mesh wash, no glass, no sparkles, no pill on everything, fewer words and
more room. Same product, colours narrowed to ink, grey and the brand teal.

  K "Gọn":   a working marketplace. White, hairlines, 8 px corners, the search
             field always in the header, dense but orderly grids.
  L "Thoáng": calm and editorial. Warm off-white, no card boxes, large photos,
             wide gaps, one action per screen.

    python3 tools/build_quiet.py        (run from .superdesign/)

Writes quiet-{k,l}-{home,search,detail}.html in mockups/.
"""
import os
from html import escape

from build import OUT, PHOTOS, SPECS, TITLE
from common import LISTINGS, LOGO, head, icon, img, where

TEAL = "#066A61"

# Search results: laptops (photo, price, title, condition, km, area).
LAPTOPS = [
    ("1496181133206-80ce9b88a853", "7.400.000 ₫", "Dell XPS 13 9310 i7, 16 GB", "Như mới", "1,8 km", "Q.3"),
    ("1517336714731-489689fd1ca8", "7.900.000 ₫", "MacBook Air M1 8/256GB", "Như mới", "3,2 km", "Q.10"),
    ("1588872657578-7efd1f1555ed", "6.800.000 ₫", "ThinkPad X1 Carbon Gen 8, i5", "Đã dùng", "2,6 km", "Phú Nhuận"),
    ("1611186871348-b1ce696e52c9", "7.950.000 ₫", "MacBook Pro 13 2019 i5", "Đã dùng", "1.140 km", "Hà Nội"),
    ("1525547719571-a2d4ac8945e2", "5.900.000 ₫", "HP Envy 13, màn cảm ứng", "Đã dùng", "1,1 km", "Bình Thạnh"),
    ("1593642632823-8f785ba67e45", "7.600.000 ₫", "ASUS ZenBook 14 OLED", "Như mới", "640 km", "Đà Nẵng"),
    ("1484788984921-03950022c9ef", "7.200.000 ₫", "Lenovo Yoga Slim 7, Ryzen 7", "Như mới", "4,1 km", "Q.7"),
    ("1541807084-5c52b6b3adef", "7.800.000 ₫", "MacBook Air M1, vỏ còn đẹp", "Đã dùng", "4,6 km", "Tân Bình"),
]

CATS = ["Điện thoại", "Máy tính", "Máy ảnh", "Âm thanh", "Xe đạp", "Xe máy", "Nội thất", "Thời trang", "Đồ gia dụng", "Mẹ và bé"]

# K2: K dressed in ai-portal's "Calm Enterprise" (ai-portal/.superdesign/design-system.md):
# warm off-white app, white surfaces with #ECECE9 hairlines, ink primary buttons,
# the brand colour only as a small accent, Remix Icon line glyphs, Inter.
RI = {"search-rounded": "search-line", "photo-camera-outline-rounded": "camera-line", "chat-outline-rounded": "chat-3-line",
      "favorite-outline-rounded": "heart-line", "favorite-rounded": "heart-fill", "local-shipping-outline-rounded": "truck-line",
      "share-outline-rounded": "share-line", "flag-outline-rounded": "flag-line", "arrow-forward-rounded": "arrow-right-line",
      "check-rounded": "check-line", "keyboard-arrow-down-rounded": "arrow-down-s-line", "visibility-outline-rounded": "eye-line"}

STYLE = {
    "k2": dict(
        name="Gọn · kiểu ai-portal", bg="#F7F7F5", ink="#1A1A19", mute="#5E5E5A", line="#ECECE9", soft="#F3F3F1",
        r="10px", rphoto="12px", wrap="max-w-[1280px] px-8", font="Inter", ri=True,
    ),
    "k": dict(
        name="Gọn", bg="#FFFFFF", ink="#141414", mute="#6B6F6E", line="#E7E9E8", soft="#F4F5F5",
        r="8px", rphoto="8px", wrap="max-w-[1280px] px-8",
    ),
    "l": dict(
        name="Thoáng", bg="#FAF9F6", ink="#1A1A18", mute="#73716B", line="#E6E3DC", soft="#F1EEE8",
        r="10px", rphoto="4px", wrap="max-w-[1180px] px-10",
    ),
}


def css(s):
    return f"""
  :root {{ --bg: {s['bg']}; --ink: {s['ink']}; --mute: {s['mute']}; --line: {s['line']}; --soft: {s['soft']}; --teal: {TEAL}; --r: {s['r']}; --rp: {s['rphoto']}; }}
  html, body {{ background: var(--bg); color: var(--ink); }}
  .ink {{ color: var(--ink); }} .mute {{ color: var(--mute); }} .bd {{ border-color: var(--line); }}
  .bg-soft {{ background: var(--soft); }} .bg-ink {{ background: var(--ink); }} .bg-teal {{ background: var(--teal); }} .text-teal {{ color: var(--teal); }}
  .r {{ border-radius: var(--r); }} .rp {{ border-radius: var(--rp); }}
  .num {{ font-variant-numeric: tabular-nums; }}
  .tile img {{ transition: opacity 200ms; }} .tile:hover img {{ opacity: .92; }}
  .tile:hover .t {{ text-decoration: underline; text-underline-offset: 2px; }}
  input::placeholder {{ color: var(--mute); }}
"""


def k2(s, html):
    """Swap Material Symbols for Remix Icon, teal fills for ink, and load Inter."""
    for m, r in RI.items():
        html = html.replace(f'icon="material-symbols:{m}"', f'icon="ri:{r}"')
    html = html.replace("bg-teal", "bg-ink").replace(".bg-ink { background: var(--teal); }", ".bg-teal { background: var(--teal); }").replace("bg-soft py-12", "border-y bd bg-white py-12")
    html = html.replace("r bg-soft px-10 py-8", "r border bd bg-white px-10 py-8").replace("rounded-full bg-white ink", "rounded-full bg-soft ink")
    html = html.replace('family=Be+Vietnam+Pro:wght@400;500;600;700', 'family=Inter:wght@400;500;600;700')
    html = html.replace("<header class=\"sticky top-0 z-30 border-b bd bg-white\">", "<header class=\"sticky top-0 z-30 border-b bd bg-[var(--bg)]\">")
    return html.replace("</style>", "  #app { font-family: Inter, system-ui, sans-serif; letter-spacing: -0.005em; }\n  .tile .rp { box-shadow: inset 0 0 0 1px rgb(20 20 19 / .04); }\n</style>", 1)


def page(s, title, body):
    if s.get("ri"):
        return k2(s, _page(s, title, body))
    return _page(s, title, body)


def _page(s, title, body):
    return head(title, css(s)) + f"""<body>
<div id="app" class="min-h-screen font-sans ink">
{body}
</div>
</body>
</html>"""


def link(i, cls, inner):
    return f'<a id="{i}" href="#{i}" class="{cls}">{inner}</a>'


# ------------------------------------------------------------------ header --
def header_k(s, query="", cats=False):
    """cats: the text row of categories under the bar, on Trang chủ only."""
    q = escape(query)
    cat_row = (f'<div class="mx-auto flex h-11 items-center gap-6 text-[14px] mute {s["wrap"]}">'
               + "".join(link(f"c{i}", "hover:text-[var(--ink)]", c) for i, c in enumerate(CATS)) + "</div>") if cats else ""
    return f"""<header class="sticky top-0 z-30 border-b bd bg-white">
  <div class="mx-auto flex h-16 items-center gap-6 {s['wrap']}">
    {link("brand", "flex items-center gap-2", f'<img src="{LOGO}" alt="" class="h-7 w-7"><span class="text-[17px] font-semibold tracking-tight">ShopNexus</span>')}
    <form class="flex h-10 flex-1 items-center gap-2 r border bd bg-white pl-3 pr-1 focus-within:border-[var(--ink)]">
      {icon("search-rounded", 20, "mute")}
      <input class="h-full min-w-0 flex-1 bg-transparent text-[15px] outline-none" placeholder="Tìm đồ cũ" value="{q}">
      <button type="button" class="grid h-8 w-8 place-items-center rounded-[6px] mute hover:bg-[var(--soft)]" aria-label="Tìm bằng ảnh">{icon("photo-camera-outline-rounded", 19)}</button>
    </form>
    <nav class="flex items-center gap-1 text-[14px]">
      {link("h-msg", "relative flex h-10 items-center gap-2 rounded-[6px] px-3 hover:bg-[var(--soft)]", icon("chat-outline-rounded", 20) + 'Tin nhắn<span class="h-1.5 w-1.5 rounded-full bg-[#C4372B]"></span>')}
      {link("h-me", "flex h-10 items-center gap-2 rounded-[6px] px-3 hover:bg-[var(--soft)]", f'<img src="{img("1494790108377-be9c29b29330", 64, 64)}" alt="" class="h-6 w-6 rounded-full object-cover">Tôi')}
      {link("h-sell", "ml-2 flex h-10 items-center r bg-teal px-4 font-medium text-white", "Đăng tin")}
    </nav>
  </div>
  {cat_row}
</header>"""


def header_l(s, query=None):
    field = ""
    if query is not None:
        field = f"""<form class="mx-10 flex h-11 flex-1 items-center gap-3 border-b-2 border-[var(--ink)]">
      {icon("search-rounded", 20)}
      <input class="h-full min-w-0 flex-1 bg-transparent text-[16px] outline-none" value="{escape(query)}">
    </form>"""
    else:
        field = '<span class="flex-1"></span>'
    return f"""<header class="bg-[var(--bg)]">
  <div class="mx-auto flex h-20 items-center {s['wrap']}">
    {link("brand", "flex items-center gap-2", f'<img src="{LOGO}" alt="" class="h-7 w-7"><span class="text-[17px] font-semibold tracking-tight">ShopNexus</span>')}
    <nav class="ml-10 flex gap-7 text-[15px] mute">{link("n-cat", "hover:text-[var(--ink)]", "Danh mục")}{link("n-how", "hover:text-[var(--ink)]", "Cách mua")}</nav>
    {field}
    <nav class="flex items-center gap-6 text-[15px]">
      {link("h-msg", "mute hover:text-[var(--ink)]", "Tin nhắn")}
      {link("h-me", "mute hover:text-[var(--ink)]", "Tôi")}
      {link("h-sell", "flex h-10 items-center rounded-full border border-[var(--ink)] px-5 font-medium", "Đăng tin")}
    </nav>
  </div>
</header>"""


def footer(s):
    cols = [("Mua bán", ["Cách mua", "Cách đăng tin", "Gói người bán"]), ("Hỗ trợ", ["Trợ giúp", "Quy định đăng tin", "Điều khoản"])]
    c = "".join(f'<div><p class="text-[13px] mute">{t}</p><ul class="mt-3 flex flex-col gap-2 text-[14px]">'
                + "".join(f"<li>{link(f'f{t[:2]}{i}', 'hover:underline', x)}</li>" for i, x in enumerate(xs)) + "</ul></div>" for t, xs in cols)
    return f"""<footer class="mt-24 border-t bd">
  <div class="mx-auto flex justify-between gap-10 py-12 {s['wrap']}">
    <div><p class="text-[15px] font-semibold">ShopNexus</p><p class="mt-2 text-[14px] mute">Xem hàng rồi mới trả tiền.</p></div>
    <div class="flex gap-20">{c}</div>
  </div>
</footer>"""


# ------------------------------------------------------------------- tiles --
def tile(s, photo, price, title, cond, km, area, extra="", saved=False, ratio="1/1"):
    place = where(km, area)
    heart = (f'<button type="button" class="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 {"text-[#C4372B]" if saved else "ink"}" aria-label="Lưu">'
             f'{icon("favorite-rounded" if saved else "favorite-outline-rounded", 18)}</button>')
    return f"""<article class="tile min-w-0">
  <div class="relative overflow-hidden rp bg-soft" style="aspect-ratio:{ratio}"><img src="{img(photo, 520, 520)}" alt="" class="h-full w-full object-cover">{heart}</div>
  <p class="num mt-2.5 text-[16px] font-semibold">{price}</p>
  <p class="t mt-0.5 truncate text-[14px]">{escape(title)}</p>
  <p class="mt-0.5 text-[13px] mute">{place}{extra}</p>
</article>"""


def section_head(title, more=None, sub=None):
    m = link("more-" + title[:3], "text-[14px] mute hover:text-[var(--ink)]", more) if more else ""
    sub_html = f'<p class="mt-1 text-[14px] mute">{sub}</p>' if sub else ""
    return f'<div class="flex items-end justify-between"><div><h2 class="text-[20px] font-semibold tracking-tight">{title}</h2>{sub_html}</div>{m}</div>'


# -------------------------------------------------------------------- home --
CAT_PHOTOS = ["1510557880182-3d4d3cba35a5", "1611186871348-b1ce696e52c9", "1516035069371-29a1b244cc32", "1505740420928-5e560c06d30e",
              "1507035895480-2b3156c31fc8", "1558981403-c5f9899a28bc", "1555041469-a586c61ea9bc", "1542291026-7eec264c27ff",
              "1585515320310-259814833e62", "1515488042361-ee00e0ddd4e4"]


def task(i, photo, kind, title, note, action, tone="text-teal"):
    return f"""<div class="flex items-center gap-4 r border bd bg-white px-4 py-3">
    <img src="{img(photo, 96, 96)}" alt="" class="h-12 w-12 rounded-[6px] object-cover">
    <div class="min-w-0 flex-1"><p class="text-[13px] mute">{kind}</p><p class="truncate text-[15px] font-medium">{title}</p><p class="text-[13px] mute">{note}</p></div>
    {link(f"task{i}", f"text-[14px] font-medium {tone}", action)}
  </div>"""


def home_k(s):
    L = LISTINGS
    cats = "".join(link(f"cat{i}", "group flex flex-col gap-2",
                        f'<span class="block overflow-hidden rp bg-soft"><img src="{img(ph, 240, 240)}" alt="" class="aspect-square w-full object-cover transition group-hover:scale-[1.03]"></span>'
                        f'<span class="text-[14px]">{c}</span>') for i, (c, ph) in enumerate(zip(CATS, CAT_PHOTOS)))
    near = "".join(tile(s, p, pr, t, c, km, a, f" · {ago}", saved=i == 4) for i, (p, pr, t, c, km, a, _r, ago, _n) in enumerate(L))
    saved_new = "".join(tile(s, p, pr, t, c, km, a) for p, pr, t, c, km, a in [
        ("1516035069371-29a1b244cc32", "24.500.000 ₫", "Sony A7 III body, 12k shot", "Như mới", "3,4 km", "Q.3"),
        ("1502920917128-1aa500764cbd", "23.900.000 ₫", "Sony A7 III kèm lens kit", "Đã dùng", "6,0 km", "Gò Vấp"),
        ("1510127034890-ba27508e9f1c", "22.000.000 ₫", "Sony A7 III, sạc 2 pin", "Đã dùng", "1.140 km", "Hà Nội"),
        ("1526170375885-4d8ecf77b99f", "1.750.000 ₫", "Polaroid OneStep 2", "Như mới", "3,1 km", "Phú Nhuận")])
    seen = "".join(tile(s, p, pr, t, c, km, a) for p, pr, t, c, km, a, *_ in [L[7], L[1], L[5], L[9], L[3], L[11]])
    saved_q = "".join(link(f"sq{i}", "flex items-center justify-between border-b bd py-3 text-[15px] hover:underline",
                           f'<span>{q}</span><span class="text-[13px] {"font-medium text-teal" if n else "mute"}">{n or "Không có tin mới"}</span>')
                      for i, (q, n) in enumerate([("Sony A7 III dưới 25 triệu", "3 tin mới"), ("iPhone 13 pin trên 85%", "1 tin mới"), ("Xe đạp cho bé 8 tuổi", "")]))
    steps = "".join(f'<div class="flex items-start gap-3"><span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white ink">{icon(ic, 20)}</span>'
                    f'<div><p class="text-[15px] font-medium">{t}</p><p class="mt-0.5 text-[14px] mute">{d}</p></div></div>'
                    for ic, t, d in [("chat-outline-rounded", "Nhắn người bán", "Hỏi, trả giá ngay trên tin."),
                                     ("local-shipping-outline-rounded", "Giao COD", "Shipper mang hàng tới nhà."),
                                     ("visibility-outline-rounded", "Xem rồi mới trả", "Không ưng thì không nhận.")])
    body = f"""{header_k(s, cats=True)}
<main>
  <div class="mx-auto {s['wrap']}">
    <div class="mt-6 grid grid-cols-2 gap-4">
      {task(0, L[0][0], "Đơn đang giao", "iPhone X 64GB, pin 86%", "Shipper tới chiều nay", "Xem đơn")}
      {task(1, L[5][0], "Đang trả giá", "Sofa nhung xanh 3 chỗ", "Người bán trả lại 4.500.000 ₫", "Trả lời", "text-[#8A3B1C]")}
    </div>
    <section class="mt-12">{section_head("Danh mục", "Tất cả")}
      <div class="mt-5 grid grid-cols-10 gap-4">{cats}</div></section>
    <section class="mt-14">{section_head("Mới đăng gần bạn", "Xem tất cả", "Trong 10 km")}
      <div class="mt-5 grid grid-cols-6 gap-x-5 gap-y-8">{near}</div></section>
  </div>

  <section class="mt-16 bg-soft py-12">
    <div class="mx-auto grid grid-cols-[300px_1fr] gap-12 {s['wrap']}">
      <div>
        <h2 class="text-[20px] font-semibold tracking-tight">Tìm đã lưu</h2>
        <p class="mt-1 text-[14px] mute">Có tin mới là báo bạn.</p>
        <div class="mt-4 border-t bd">{saved_q}</div>
      </div>
      <div>
        <p class="text-[15px] font-medium">Sony A7 III dưới 25 triệu <span class="font-normal mute">· 3 tin mới</span></p>
        <div class="mt-4 grid grid-cols-4 gap-5">{saved_new}</div>
      </div>
    </div>
  </section>

  <div class="mx-auto {s['wrap']}">
    <section class="mt-14">{section_head("Bạn vừa xem", "Xóa")}
      <div class="mt-5 grid grid-cols-6 gap-x-5 gap-y-8">{seen}</div></section>
  </div>

  <section class="mx-auto mt-16 {s['wrap']}">
    <div class="grid grid-cols-3 gap-10 r bg-soft px-10 py-8">{steps}</div>
  </section>
</main>
{footer(s)}"""
    return page(s, "ShopNexus", body)

def home(key):
    s = STYLE[key]
    items = LISTINGS + LISTINGS[:6]
    if key in ("k", "k2"):
        return home_k(s)
    else:
        grid = "".join(tile(s, p, pr, t, c, km, a, ratio="4/5") for p, pr, t, c, km, a, *_ in items[:12])
        recent = "".join(link(f"r{i}", "flex h-9 items-center rounded-full border bd px-4 text-[14px] mute hover:text-[var(--ink)]", q)
                         for i, q in enumerate(["iPhone 13", "xe đạp trẻ em", "sofa"]))
        body = f"""{header_l(s)}
<main class="mx-auto {s['wrap']}">
  <section class="pb-16 pt-14">
    <h1 class="text-[44px] font-semibold leading-[52px] tracking-[-0.03em]">Tìm đồ cũ quanh bạn</h1>
    <form class="mt-8 flex h-14 max-w-[720px] items-center gap-3 rounded-full border bd bg-white pl-5 pr-1.5">
      {icon("search-rounded", 22, "mute")}
      <input class="h-full min-w-0 flex-1 bg-transparent text-[16px] outline-none" placeholder="Bạn cần gì?">
      <button type="button" class="h-11 rounded-full bg-[var(--ink)] px-6 text-[15px] font-medium text-white">Tìm</button>
    </form>
    <div class="mt-4 flex gap-2">{recent}</div>
  </section>
  <section>{section_head("Mới đăng gần bạn", "Xem tất cả")}
    <div class="mt-6 grid grid-cols-4 gap-x-8 gap-y-12">{grid}</div></section>
</main>
{footer(s)}"""
    return page(s, "ShopNexus", body)


# ------------------------------------------------------------------ search --
def check(label, n, on=False):
    box = (f'<span class="grid h-[18px] w-[18px] place-items-center rounded-[4px] bg-[var(--ink)] text-white">{icon("check-rounded", 14)}</span>' if on
           else '<span class="h-[18px] w-[18px] rounded-[4px] border-[1.5px] border-[var(--mute)]"></span>')
    return f'<label class="flex h-9 items-center gap-3 text-[14px]">{box}<span class="flex-1">{label}</span><span class="mute">{n}</span></label>'


def search(key):
    s = STYLE[key]
    items = LAPTOPS + LAPTOPS[:4]
    if key in ("k", "k2"):
        def group(t, inner):
            return f'<div class="border-t bd py-5"><p class="text-[14px] font-semibold">{t}</p><div class="mt-2">{inner}</div></div>'
        side = (group("Giá", f'<div class="flex items-center gap-2"><input class="h-10 w-full r border bd px-3 text-[14px]" value="0"><span class="mute">–</span><input class="h-10 w-full r border bd px-3 text-[14px]" value="8.000.000"></div>')
                + group("Hãng", check("Dell", 11, True) + check("Apple", 9, True) + check("Lenovo", 8) + check("HP", 6) + check("ASUS", 4))
                + group("Tình trạng", check("Mới", 3) + check("Như mới", 41, True) + check("Đã dùng", 82))
                + group("Khoảng cách", f'<select class="h-10 w-full r border bd bg-white px-3 text-[14px]"><option>Trong 10 km</option></select>'))
        grid = "".join(tile(s, p, pr, t, c, km, a, saved=i == 1) for i, (p, pr, t, c, km, a) in enumerate(items))
        body = f"""{header_k(s, "laptop dưới 8 triệu")}
<main class="mx-auto {s['wrap']}">
  <div class="flex items-baseline justify-between pt-8">
    <h1 class="text-[22px] font-semibold tracking-tight">126 kết quả</h1>
    <label class="flex items-center gap-2 text-[14px] mute">Sắp xếp<select class="h-9 r border bd bg-white px-3 text-[14px] ink"><option>Phù hợp nhất</option></select></label>
  </div>
  <div class="mt-6 grid grid-cols-[240px_1fr] gap-10">
    <aside>{side}{link("clear", "mt-2 block text-[14px] text-teal", "Xóa bộ lọc")}</aside>
    <div class="grid grid-cols-4 gap-x-5 gap-y-8">{grid}</div>
  </div>
  <div class="mt-12 flex justify-center gap-1 text-[14px]">
    {''.join(f'<span class="grid h-9 w-9 place-items-center r {"bg-[var(--ink)] text-white" if n == "1" else "hover:bg-[var(--soft)]"}">{n}</span>' for n in ["1", "2", "3", "…", "11"])}
  </div>
</main>
{footer(s)}"""
    else:
        drops = "".join(f'<button type="button" class="flex h-10 items-center gap-1.5 rounded-full border px-4 text-[14px] {"border-[var(--ink)]" if on else "bd mute"}">{t}{icon("keyboard-arrow-down-rounded", 18)}</button>'
                        for t, on in [("Dưới 8 triệu", True), ("Dell, Apple", True), ("Tình trạng", False), ("Khoảng cách", False)])
        grid = "".join(tile(s, p, pr, t, c, km, a, ratio="4/5", saved=i == 1) for i, (p, pr, t, c, km, a) in enumerate(items[:9]))
        body = f"""{header_l(s, "laptop dưới 8 triệu")}
<main class="mx-auto {s['wrap']}">
  <div class="flex items-end justify-between pt-6">
    <div><h1 class="text-[32px] font-semibold tracking-[-0.03em]">Laptop</h1><p class="mt-1 text-[15px] mute">126 tin</p></div>
    <button type="button" class="flex items-center gap-1 text-[14px] mute">Phù hợp nhất{icon("keyboard-arrow-down-rounded", 18)}</button>
  </div>
  <div class="mt-6 flex gap-2 border-b bd pb-6">{drops}</div>
  <div class="mt-10 grid grid-cols-3 gap-x-10 gap-y-14">{grid}</div>
  <div class="mt-16 flex justify-center">{link("more", "flex h-12 items-center rounded-full border border-[var(--ink)] px-8 text-[15px] font-medium", "Xem thêm")}</div>
</main>
{footer(s)}"""
    return page(s, "laptop dưới 8 triệu · ShopNexus", body)


# ------------------------------------------------------------------ detail --
DESC = "Mình dùng từ 2022, máy zin chưa sửa chữa, Face ID nhạy. Viền có 2 vết xước nhỏ, mặt lưng đẹp vì luôn đeo ốp. Xem máy quanh Bình Thạnh, buổi tối sau 18h."
SELLER_PHOTO = "1544723795-3fb6469f5b39"


def detail(key):
    s = STYLE[key]
    specs = "".join(f'<div class="flex justify-between border-b bd py-3 text-[15px]"><dt class="mute">{k}</dt><dd>{v}</dd></div>' for k, v in SPECS)
    similar = "".join(tile(s, p, pr, t, c, km, a) for p, pr, t, c, km, a, *_ in LISTINGS[:4 if key == "l" else 6])
    seller = f"""<div class="flex items-center gap-3">
      <img src="{img(SELLER_PHOTO, 96, 96)}" alt="" class="h-11 w-11 rounded-full object-cover">
      <div class="min-w-0 flex-1"><p class="text-[15px] font-medium">Tuấn Kiệt</p><p class="text-[13px] mute">★ 4,9 · 14 đã bán</p></div>
      {link("seller", "text-[14px] mute hover:text-[var(--ink)]", "14 tin khác")}
    </div>"""
    if key in ("k", "k2"):
        asks = "".join(f'<button type="button" class="flex h-10 items-center justify-between border-b bd text-left text-[14px] hover:text-[var(--teal)]">{q}{icon("arrow-forward-rounded", 16, "mute")}</button>'
                       for q in ["Máy còn không bạn?", "Xem máy ở đâu được?", "Có hộp và hóa đơn không?"])
        others = "".join(f'<div><img src="{img(p, 200, 200)}" alt="" class="aspect-square w-full rounded-[6px] object-cover"><p class="num mt-1 text-[13px] font-medium">{pr}</p></div>'
                         for p, pr in [("1592899677977-9c10ca588bbd", "15,9 tr ₫"), ("1505740420928-5e560c06d30e", "3.200.000 ₫"), ("1611186871348-b1ce696e52c9", "11,5 tr ₫")])
        thumbs = "".join(f'<img src="{p}" alt="" class="aspect-square w-full rounded-[6px] object-cover {"ring-2 ring-[var(--ink)] ring-offset-2" if i == 0 else ""}">' for i, p in enumerate(PHOTOS))
        body = f"""{header_k(s)}
<main class="mx-auto {s['wrap']}">
  <p class="pt-5 text-[13px] mute">{link("b1", "hover:underline", "Điện thoại")} / iPhone 13 Pro</p>
  <div class="mt-4 grid grid-cols-[1fr_380px] gap-12">
    <div class="min-w-0">
      <img src="{PHOTOS[0]}" alt="" class="aspect-[4/3] w-full rp object-cover">
      <div class="mt-3 grid grid-cols-6 gap-3">{thumbs}</div>
      <h2 class="mt-12 text-[18px] font-semibold">Mô tả</h2>
      <p class="mt-3 max-w-[640px] text-[15px] leading-7">{DESC}</p>
      <h2 class="mt-10 text-[18px] font-semibold">Thông số</h2>
      <dl class="mt-2 grid max-w-[640px] grid-cols-2 gap-x-10">{specs}</dl>
    </div>
    <aside class="sticky top-[88px] self-start">
      <h1 class="text-[24px] font-semibold leading-8 tracking-tight">{escape(TITLE)}</h1>
      <p class="num mt-3 text-[30px] font-semibold tracking-tight">5.200.000 ₫</p>
      <p class="mt-1 text-[14px] mute">Như mới · 2,1 km · 2 giờ trước</p>
      <div class="mt-6 flex flex-col gap-2">
        <button type="button" class="h-12 r bg-teal text-[15px] font-medium text-white">Nhắn tin</button>
        <button type="button" class="h-12 r border border-[var(--ink)] text-[15px] font-medium">Trả giá</button>
      </div>
      <p class="mt-3 flex items-center gap-2 text-[13px] mute">{icon("local-shipping-outline-rounded", 17)}COD, xem hàng rồi mới trả tiền</p>
      <p class="mt-6 text-[13px] mute">Hỏi nhanh</p>
      <div class="mt-2 flex flex-col">{asks}</div>
      <div class="mt-6 border-t bd pt-6">{seller}
        <div class="mt-4 grid grid-cols-3 gap-2">{others}</div></div>
      <div class="mt-6 flex gap-5 text-[14px] mute">
        <button type="button" class="flex items-center gap-1.5 hover:text-[var(--ink)]">{icon("favorite-outline-rounded", 18)}Lưu</button>
        <button type="button" class="flex items-center gap-1.5 hover:text-[var(--ink)]">{icon("share-outline-rounded", 18)}Chia sẻ</button>
        <button type="button" class="flex items-center gap-1.5 hover:text-[var(--ink)]">{icon("flag-outline-rounded", 18)}Báo cáo</button>
      </div>
    </aside>
  </div>
  <section class="mt-20">{section_head("Tin tương tự", "Xem tất cả")}<div class="mt-5 grid grid-cols-6 gap-x-5 gap-y-8">{similar}</div></section>
</main>
{footer(s)}"""
    else:
        side_photos = "".join(f'<img src="{p}" alt="" class="aspect-square w-full rp object-cover">' for p in PHOTOS[1:5])
        body = f"""{header_l(s)}
<main class="mx-auto {s['wrap']}">
  <div class="grid grid-cols-[2fr_1fr_1fr] grid-rows-2 gap-2 pt-2">
    <img src="{PHOTOS[0]}" alt="" class="row-span-2 h-full w-full rp object-cover" style="aspect-ratio:1/1">
    {side_photos}
  </div>
  <div class="mt-12 grid grid-cols-[1fr_360px] gap-20">
    <div class="min-w-0">
      <p class="text-[14px] mute">Điện thoại · Như mới · 2,1 km</p>
      <h1 class="mt-2 text-[34px] font-semibold leading-[42px] tracking-[-0.03em]">{escape(TITLE)}</h1>
      <p class="mt-8 max-w-[600px] text-[17px] leading-8">{DESC}</p>
      <dl class="mt-12 max-w-[600px] border-t bd">{specs}</dl>
    </div>
    <aside class="sticky top-8 self-start">
      <p class="num text-[36px] font-semibold tracking-[-0.03em]">5.200.000 ₫</p>
      <button type="button" class="mt-6 h-13 w-full rounded-full bg-[var(--ink)] py-3.5 text-[16px] font-medium text-white">Nhắn tin</button>
      <button type="button" class="mt-3 w-full py-2 text-[15px] font-medium underline underline-offset-4">Trả giá</button>
      <p class="mt-4 text-center text-[13px] mute">Trả tiền khi nhận hàng, sau khi xem.</p>
      <div class="mt-10 border-t bd pt-8">{seller}</div>
    </aside>
  </div>
  <section class="mt-28">{section_head("Tin tương tự")}<div class="mt-6 grid grid-cols-4 gap-x-8 gap-y-12">{similar}</div></section>
</main>
{footer(s)}"""
    return page(s, f"{TITLE} · ShopNexus", body)


if __name__ == "__main__":
    for key in ("k", "l", "k2"):
        for name, fn in [("home", home), ("search", search), ("detail", detail)]:
            with open(os.path.join(OUT, f"quiet-{key}-{name}.html"), "w") as f:
                f.write(fn(key))
            print("wrote", key, name)
