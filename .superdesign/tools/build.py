"""Build the four comparison mockups into ../mockups/:

    python3 tools/build.py        (run from .superdesign/)

home-m3, detail-m3    the app's layout carried to a desktop window as M3 prescribes
home-web, detail-web  M3 tokens with web conventions
"""
import itertools
import os
from html import escape

from common import CATEGORIES, LISTINGS, LOGO, MONEY, crop, head, icon, img, split_price

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "mockups")
_ids = itertools.count(1)


def a(label_id, cls, inner, href=None):
    """Every anchor gets a unique id and a hash placeholder href."""
    return f'<a id="{label_id}-{next(_ids)}" href="{href or "#" + label_id}" class="{cls}">{inner}</a>'


# --------------------------------------------------------------- detail data --
PHOTO = "1632661674596-df8be070a5c5"
PHOTOS = [crop(PHOTO, 1200, 0.5, 0.52, 1.25), crop(PHOTO, 600, 0.48, 0.42, 3.4), crop(PHOTO, 600, 0.53, 0.56, 2.1),
          crop(PHOTO, 600, 0.64, 0.56, 3.2), crop(PHOTO, 600, 0.45, 0.6, 1.8)]
TITLE = "iPhone 13 Pro 128GB, Xanh Sierra, pin 88%"
PRICE = ("5.200.000", " ₫")
SELLER = dict(name="Tuấn Kiệt", photo="1544723795-3fb6469f5b39")
STATS = [("4,9", "32 đánh giá"), ("14", "Đã bán"), ("10 phút", "Thường trả lời"), ("2023", "Tham gia")]
SPECS = [("Dòng máy", "iPhone 13 Pro"), ("Dung lượng", "128 GB"), ("Màu", "Xanh Sierra"), ("Pin", "88%"),
         ("Phiên bản", "VN/A"), ("Bảo hành", "Đã hết"), ("Sửa chữa", "Chưa từng"), ("Phụ kiện", "Cáp sạc, ốp lưng")]
DESCRIPTION = ("Mình dùng từ 2022, máy zin chưa sửa chữa, Face ID nhạy. Viền có 2 vết xước nhỏ, mặt lưng đẹp vì luôn đeo ốp. "
               "Đổi máy nên bán lại.<br><br>Xem máy trực tiếp quanh Bình Thạnh, buổi tối sau 18h.")
SIMILAR = [
    ("1663499482523-1c0c1bae4ce1", "12,8 tr ₫", "iPhone 14 128GB, pin 91%", "Như mới", "4,4 km", "Q.3", "4,8", "1 giờ", None),
    ("1616348436168-de43ad0db179", "6.900.000 ₫", "iPhone 12 128GB, màn zin", "Đã dùng", "0,8 km", "Bình Thạnh", "4,6", "3 giờ", None),
    ("1678911820864-e2c567c655d7", "14,5 tr ₫", "Galaxy S23 Ultra 256GB", "Như mới", "2,9 km", "Phú Nhuận", "4,9", "20 phút", None),
    ("1580910051074-3eb694886505", "5.200.000 ₫", "iPhone 12 mini 64GB", "Đã dùng", "1,9 km", "Q.1", "4,7", "5 giờ", "Giá tham khảo"),
    ("1510557880182-3d4d3cba35a5", "3.900.000 ₫", "iPhone X 64GB, pin 86%", "Như mới", "1,2 km", "Bình Thạnh", "4,8", "12 phút", None),
    ("1695048133142-1a20484d2569", "15,9 tr ₫", "iPhone 15 128GB", "Như mới", "2,2 km", "Tân Bình", "4,9", "40 phút", None),
]


def money(key, ic="info-outline-rounded"):
    return (f'<p class="flex gap-2 text-body-m text-on-surface-variant">{icon(ic, 18, "mt-0.5")}'
            f'<span>{MONEY[key]}</span></p>')


# =================================================================== M3 ====
def rail(active):
    items = [("home", "Khám phá", "home"), ("grid", "Danh mục", "grid-view"), ("chat", "Tin nhắn", "chat"), ("me", "Tôi", "person")]
    out = []
    for key, label, ic in items:
        on = key == active
        glyph = icon(f"{ic}-rounded" if on else f"{ic}-outline-rounded", 24)
        badge = ('<span class="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-error px-1 '
                 'text-label-s text-on-error">3</span>') if key == "chat" else ""
        ind = "bg-secondary-container text-on-secondary-container" if on else "text-on-surface-variant"
        lab = "text-secondary font-semibold" if on else "text-on-surface-variant"
        out.append(a(f"rail-{key}", "flex flex-col items-center gap-1",
                     f'<span class="state relative grid h-8 w-14 place-items-center rounded-full {ind}">{glyph}{badge}</span>'
                     f'<span class="text-label-m {lab}">{label}</span>'))
    return f"""<nav class="sticky top-0 flex h-screen w-24 shrink-0 flex-col items-center gap-10 bg-surface pt-11">
  <button type="button" class="state grid h-14 w-14 place-items-center rounded-lg bg-primary-container text-on-primary-container" aria-label="Đăng tin">{icon("add-rounded", 24)}</button>
  <div class="flex flex-col items-center gap-3">{"".join(out)}</div>
</nav>"""


def m3_card(item, idx):
    photo, price, title, cond, km, area, _r, _t, insight = item
    num, unit = split_price(price)
    heart = "favorite-rounded" if idx == 2 else "favorite-outline-rounded"
    heart_cls = "text-primary" if idx == 2 else "text-on-surface-variant"
    ins = (f'<p class="mt-0.5 flex items-center gap-1 text-label-m text-tertiary">{icon("auto-awesome-rounded", 14)}{insight}</p>'
           if insight else "")
    return f"""<article class="min-w-0">
  <div class="aspect-square overflow-hidden rounded-lg-plus bg-surface-container-high"><img src="{img(photo, 480, 480)}" alt="{escape(title)}" class="h-full w-full object-cover"></div>
  <div class="mt-2 flex items-center">
    <p class="min-w-0 flex-1 truncate text-title-m text-on-surface">{num}<span class="text-body-m text-on-surface-variant">{unit}</span></p>
    <button type="button" class="state -my-1.5 -mr-3 grid h-12 w-12 place-items-center rounded-full {heart_cls}" aria-label="Lưu tin">{icon(heart, 22)}</button>
  </div>
  {ins}
  <h3 class="mt-0.5 line-clamp-2 text-body-m text-on-surface">{escape(title)}</h3>
  <p class="mt-1 truncate text-body-s text-on-surface-variant">{cond} · {km}</p>
</article>"""


def m3_search():
    return f"""<div class="flex h-14 w-[720px] items-center gap-4 rounded-full bg-surface-container-high pl-4 pr-1 text-on-surface-variant">
  {icon("search-rounded", 24)}<span class="flex-1 text-body-l">Tìm trên ShopNexus</span>
  <button type="button" class="state grid h-12 w-12 place-items-center rounded-full" aria-label="Tìm bằng ảnh">{icon("photo-camera-outline-rounded", 24)}</button>
</div>"""


def home_m3():
    hero = [("1583417319070-4a69db38a482", "TP.HCM", "Giá tốt, gần bạn, chốt nhanh", 640),
            ("1517649763962-0c623066013b", "Mùa đạp xe", "Xe đạp cũ từ 1,5 triệu", 400),
            ("1518455027359-f3f8164ba6bd", "Góc làm việc", "Bàn làm việc giá rẻ", 200)]
    slides = "".join(
        f"""<div class="relative h-[320px] shrink-0 overflow-hidden rounded-xl" style="width:{w}px">
  <img src="{img(p, 1000, 640)}" alt="" class="absolute inset-0 h-full w-full object-cover">
  <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
  {"" if w < 300 else f'<div class="absolute bottom-6 left-6 right-6"><span class="rounded-sm bg-tertiary-container px-2 py-1 text-label-m text-on-tertiary-container">{tag}</span><p class="mt-3 text-headline-s font-medium text-white">{t}</p></div>'}
</div>""" for p, tag, t, w in hero)
    shapes = ["rounded-full", "rounded-[40%]", "rounded-[30%_70%_70%_30%/30%_30%_70%_70%]", "rounded-t-full rounded-b-lg",
              "rounded-full", "rounded-[35%]", "rounded-[50%_50%_20%_50%]", "rounded-[45%]", "rounded-full", "rounded-[30%]"]
    cats = "".join(
        f"""<button type="button" class="flex w-[104px] flex-col items-center gap-2">
  <span class="grid h-[72px] w-[72px] place-items-center bg-secondary-container text-on-secondary-container {shapes[i]}">{icon(ic, 32)}</span>
  <span class="text-body-s text-on-surface">{label}</span></button>""" for i, (label, ic) in enumerate(CATEGORIES))
    chips = "".join(
        f'<button type="button" class="state flex h-8 items-center gap-1 rounded-full {"bg-secondary-container pl-2 pr-4 text-on-secondary-container" if i == 0 else "border border-outline-variant px-4 text-on-surface-variant"} text-label-l">'
        f'{icon("check-rounded", 18) if i == 0 else ""}{c}</button>'
        for i, c in enumerate(["Tất cả", "Dưới 2 triệu", "Như mới", "Trong 3 km", "Giao COD"]))
    cards = "".join(m3_card(it, i) for i, it in enumerate(LISTINGS))
    body = f"""<body>
<div class="flex min-h-screen bg-surface font-sans text-on-surface">
  {rail("home")}
  <main class="min-w-0 flex-1 px-6 pb-16">
    <header class="flex h-24 items-center gap-4">
      {m3_search()}
      <span class="flex-1"></span>
      <button type="button" class="state grid h-12 w-12 place-items-center rounded-full text-on-surface-variant" aria-label="Thông báo">{icon("notifications-outline-rounded", 24)}</button>
      <img src="{img(SELLER["photo"], 96, 96)}" alt="Tài khoản" class="h-10 w-10 rounded-full object-cover">
    </header>
    <section class="no-scrollbar flex gap-2 overflow-hidden">{slides}</section>
    <section class="mt-10 flex justify-between">{cats}</section>
    <section class="mt-12">
      <div class="flex items-center justify-between">
        <h2 class="text-headline-s">Gần bạn</h2>
        {a("near-all", "state grid h-12 w-12 place-items-center rounded-full text-on-surface-variant", icon("arrow-forward-rounded", 24))}
      </div>
      <div class="mt-4 flex gap-2">{chips}</div>
      <div class="mt-6 grid grid-cols-6 gap-x-3 gap-y-6">{cards}</div>
    </section>
  </main>
</div>
</body>
</html>"""
    return head("Khám phá · M3 nguyên bản") + body


def grouped(rows, cls=""):
    """The app's grouped list: 28 px outer corners, 4 px inner, 2 px gaps."""
    n = len(rows)
    out = []
    for i, r in enumerate(rows):
        top = "rounded-t-xl" if i == 0 else "rounded-t-xs"
        bot = "rounded-b-xl" if i == n - 1 else "rounded-b-xs"
        out.append(f'<div class="bg-surface-container px-5 py-4 {top} {bot}">{r}</div>')
    return f'<div class="flex flex-col gap-0.5 {cls}">{"".join(out)}</div>'


def detail_m3():
    thumbs = "".join(f'<div class="h-[132px] w-[132px] shrink-0 overflow-hidden rounded-lg-plus"><img src="{p}" alt="" class="h-full w-full object-cover"></div>'
                     for p in PHOTOS[1:])
    stats = "".join(f'<div class="flex-1 text-center"><p class="text-title-m">{v}{" ★" if i == 0 else ""}</p><p class="text-body-s text-on-surface-variant">{l}</p></div>'
                    for i, (v, l) in enumerate(STATS))
    spec_rows = [f'<div class="flex justify-between text-body-l"><span class="text-on-surface-variant">{k}</span><span>{v}</span></div>' for k, v in SPECS]
    similar = "".join(m3_card(it, 9) for it in SIMILAR[:4])
    body = f"""<body>
<div class="flex min-h-screen bg-surface font-sans text-on-surface">
  {rail("home")}
  <main class="min-w-0 flex-1 px-6 pb-16">
    <header class="flex h-16 items-center gap-1">
      {a("back", "state grid h-12 w-12 place-items-center rounded-full", icon("arrow-back-rounded", 24))}
      <span class="flex-1"></span>
      <button type="button" class="state grid h-12 w-12 place-items-center rounded-full text-on-surface-variant" aria-label="Chia sẻ">{icon("share-outline-rounded", 22)}</button>
      <button type="button" class="state grid h-12 w-12 place-items-center rounded-full text-on-surface-variant" aria-label="Lưu tin">{icon("favorite-outline-rounded", 22)}</button>
      <button type="button" class="state grid h-12 w-12 place-items-center rounded-full text-on-surface-variant" aria-label="Tùy chọn khác">{icon("more-vert", 22)}</button>
    </header>
    <div class="mt-2 flex gap-6">
      <section class="w-[760px] shrink-0">
        <div class="aspect-[4/3] overflow-hidden rounded-xl bg-surface-container-high"><img src="{PHOTOS[0]}" alt="{escape(TITLE)}" class="h-full w-full object-cover"></div>
        <div class="mt-2 flex gap-2">{thumbs}</div>
        <h2 class="mt-10 text-title-l">Mô tả</h2>
        <p class="mt-3 text-body-l">{DESCRIPTION}</p>
        <h2 class="mt-10 text-title-l">Thông số</h2>
        {grouped(spec_rows, "mt-4")}
      </section>
      <section class="min-w-0 flex-1">
        <p class="text-on-surface"><span class="text-display-s">{PRICE[0]}</span><span class="text-title-l text-on-surface-variant">{PRICE[1]}</span></p>
        <p class="mt-1 flex items-center gap-1 text-label-m text-tertiary">{icon("auto-awesome-rounded", 14)}Rẻ hơn 9% so với tin tương tự</p>
        <h1 class="mt-4 text-title-l">{escape(TITLE)}</h1>
        <p class="mt-2 text-body-m text-on-surface-variant">Như mới · Bình Thạnh · 2,1 km · 2 giờ trước</p>
        <div class="mt-6 flex gap-2">
          <button type="button" class="state flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-secondary-container text-label-l text-on-secondary-container">{icon("chat-outline-rounded", 20)}Nhắn tin</button>
          <button type="button" class="state flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-tertiary text-label-l text-on-tertiary">{icon("sell-outline-rounded", 20)}Trả giá</button>
        </div>
        <div class="mt-6 flex flex-col gap-3">
          {money("meet_hint", "group-outline-rounded")}
          {money("cod_buyer", "local-shipping-outline-rounded")}
          {money("no_hold")}
        </div>
        {grouped([
            f'<div class="flex items-center gap-4"><img src="{img(SELLER["photo"], 112, 112)}" alt="" class="h-14 w-14 rounded-full object-cover"><div class="flex-1"><p class="text-title-m">{SELLER["name"]}</p><p class="flex items-center gap-1 text-body-s text-on-surface-variant">{icon("verified-rounded", 16, "text-primary")}Đã xác minh danh tính</p></div>{icon("chevron-right-rounded", 24, "text-on-surface-variant")}</div>',
            f'<div class="flex">{stats}</div>'], "mt-8")}
        <div class="mt-8 flex items-center justify-between"><h2 class="text-title-l">Tin tương tự</h2>{a("similar-all", "state grid h-12 w-12 place-items-center rounded-full text-on-surface-variant", icon("arrow-forward-rounded", 24))}</div>
        <div class="mt-4 grid grid-cols-2 gap-x-3 gap-y-6">{similar}</div>
      </section>
    </div>
  </main>
</div>
</body>
</html>"""
    return head("Chi tiết tin · M3 nguyên bản") + body


# ================================================================== WEB ====
def topbar():
    return f"""<header class="sticky top-0 z-10 bg-surface">
  <div class="mx-auto flex h-16 max-w-[1328px] px-6 items-center gap-6">
    {a("brand", "flex shrink-0 items-center gap-2", f'<img src="{LOGO}" alt="ShopNexus" class="h-8 w-8"><span class="text-title-l font-medium text-on-surface">ShopNexus</span>', "#home")}
    <div class="flex h-12 flex-1 items-center rounded-md bg-surface-container-high pr-1 text-on-surface-variant">
      <button type="button" class="state flex h-full items-center gap-1 rounded-l-md border-r border-outline-variant pl-3 pr-3 text-label-l text-on-surface">{icon("location-on-outline-rounded", 20, "text-primary")}Bình Thạnh{icon("keyboard-arrow-down-rounded", 18)}</button>
      {icon("search-rounded", 22, "ml-3")}<span class="ml-3 flex-1 text-body-l">Tìm iPhone, xe đạp, sofa…</span>
      <button type="button" class="state grid h-10 w-10 place-items-center rounded-sm" aria-label="Tìm bằng ảnh">{icon("photo-camera-outline-rounded", 22)}</button>
    </div>
    <div class="flex items-center gap-1">
      {a("saved", "state grid h-10 w-10 place-items-center rounded-full text-on-surface-variant", icon("favorite-outline-rounded", 24))}
      {a("messages", "state relative grid h-10 w-10 place-items-center rounded-full text-on-surface-variant", icon("chat-outline-rounded", 24) + '<span class="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-error px-1 text-label-s text-on-error">3</span>')}
      <button type="button" class="state ml-3 flex h-10 items-center gap-2 rounded-md bg-primary pl-3 pr-4 text-label-l text-on-primary">{icon("add-rounded", 20)}Đăng tin</button>
      <img src="{img(SELLER["photo"], 96, 96)}" alt="Tài khoản" class="ml-3 h-9 w-9 rounded-full object-cover">
    </div>
  </div>
  <nav class="mx-auto flex h-11 max-w-[1328px] px-6 items-center gap-1 text-label-l text-on-surface-variant">
    {"".join(a("cat-" + str(i), "state flex h-9 items-center gap-1.5 rounded-sm px-2.5", icon(ic, 18) + label) for i, (label, ic) in enumerate(CATEGORIES[:9]))}
  </nav>
</header>"""


def web_card(item, idx, hover=False):
    photo, price, title, cond, km, area, rating, posted, insight = item
    num, unit = split_price(price)
    saved = idx == 2
    ins = (f'<p class="mt-0.5 flex items-center gap-1 text-label-m text-tertiary">{icon("auto-awesome-rounded", 14)}{insight}</p>'
           if insight else "")
    wrap = "bg-surface-container-low ring-1 ring-outline-variant/60" if hover else ""
    shade = '<div class="absolute inset-0 bg-black/[.06]"></div>' if hover else ""
    heart_cls = "text-primary" if saved else "text-on-surface"
    heart = "favorite-rounded" if saved else "favorite-outline-rounded"
    return f"""<article class="-m-2 min-w-0 rounded-lg p-2 {wrap}">
  <div class="relative aspect-square overflow-hidden rounded-md bg-surface-container-high">
    <img src="{img(photo, 480, 480)}" alt="{escape(title)}" class="h-full w-full object-cover {"scale-[1.03]" if hover else ""}" style="transition: transform 400ms var(--spatial)">{shade}
    <button type="button" class="state absolute right-2 top-2 grid h-9 w-9 place-items-center rounded-full bg-surface-container-lowest/90 {heart_cls}" aria-label="Lưu tin">{icon(heart, 20)}</button>
  </div>
  <p class="mt-2.5 text-title-m text-on-surface">{num}<span class="text-body-m text-on-surface-variant">{unit}</span></p>
  {ins}
  <h3 class="mt-0.5 line-clamp-2 text-body-m text-on-surface">{escape(title)}</h3>
  <p class="mt-1.5 truncate text-body-s text-on-surface-variant">{cond} · {area} · {km}</p>
  <p class="mt-1 flex items-center gap-1 text-body-s text-on-surface-variant">{icon("star-rounded", 14, "text-on-surface-variant")}{rating}<span class="mx-1">·</span>{posted} trước</p>
</article>"""


def footer():
    col = lambda title, links, key: (
        f'<div><p class="text-title-s text-on-surface">{title}</p><ul class="mt-4 flex flex-col gap-3 text-body-m text-on-surface-variant">'
        + "".join(f"<li>{a(f'{key}-{i}', 'hover:text-on-surface hover:underline', l)}</li>" for i, l in enumerate(links)) + "</ul></div>")
    return f"""<footer class="mt-20 bg-surface-container-low">
  <div class="mx-auto grid max-w-[1328px] px-6 grid-cols-[1.4fr_1fr_1fr_1fr] gap-12 py-14">
    <div>
      <div class="flex items-center gap-2"><img src="{LOGO}" alt="ShopNexus" class="h-8 w-8"><span class="text-title-l font-medium">ShopNexus</span></div>
      <p class="mt-4 max-w-[300px] text-body-m text-on-surface-variant">Giá tốt, gần bạn, chốt nhanh. {MONEY["no_hold"]}</p>
    </div>
    {col("Danh mục", [c[0] for c in CATEGORIES[:6]], "f-cat")}
    {col("Mua và bán", ["Mua bằng COD xem hàng", "Cách đăng tin", "Gói người bán", "Điểm uy tín"], "f-deal")}
    {col("Hỗ trợ", ["Trung tâm trợ giúp", "Báo cáo vi phạm", "Quy định đăng tin", "Điều khoản và quyền riêng tư"], "f-help")}
  </div>
  <div class="mx-auto flex max-w-[1328px] px-6 justify-between border-t border-outline-variant py-6 text-body-s text-on-surface-variant">
    <span>© 2026 ShopNexus</span><span>TP.HCM · Hà Nội · Đà Nẵng</span>
  </div>
</footer>"""


def home_web():
    chips = "".join(
        f'<button type="button" class="state flex h-8 items-center gap-1 rounded-full {"bg-secondary-container pl-2 pr-4 text-on-secondary-container" if i == 0 else "border border-outline-variant px-4 text-on-surface-variant"} text-label-l">'
        f'{icon("check-rounded", 18) if i == 0 else ""}{c}</button>'
        for i, c in enumerate(["Tất cả", "Dưới 2 triệu", "Như mới", "Trong 3 km", "Có thể trả giá"]))
    quick = "".join(f'<button type="button" class="state h-9 rounded-full border border-outline-variant px-4 text-label-l text-on-surface-variant">{q}</button>'
                    for q in ["iPhone cũ", "Xe đạp fixed gear", "MacBook M1", "Sofa", "Máy ảnh film"])
    points = "".join(f'<li class="flex items-center gap-3 text-body-m text-on-surface-variant">{icon(ic, 22, "text-primary")}{t}</li>'
                     for ic, t in [("local-shipping-outline-rounded", MONEY["cod_buyer"]), ("near-me-outline-rounded", "Tin gần bạn được xếp lên trước."),
                                   ("sell-outline-rounded", "Trả giá ngay trong chat với người bán.")])
    cards = "".join(web_card(it, i, hover=(i == 1)) for i, it in enumerate(LISTINGS))
    tiles = "".join(f'<button type="button" class="state flex h-20 items-center gap-3 rounded-md bg-surface-container-low px-4 text-left">'
                    f'<span class="grid h-11 w-11 place-items-center rounded-sm bg-secondary-container text-on-secondary-container">{icon(ic, 24)}</span>'
                    f'<span class="text-title-s">{label}</span></button>' for label, ic in CATEGORIES)
    body = f"""<body>
<div class="min-h-screen bg-surface font-sans text-on-surface">
  {topbar()}
  <main class="mx-auto max-w-[1328px] px-6">
    <section class="mt-4 grid grid-cols-[1fr_520px] gap-4">
      <div class="flex flex-col justify-center rounded-lg bg-surface-container-low px-12 py-12">
        <h1 class="text-display-l text-on-surface">Giá tốt, gần bạn,<br>chốt nhanh</h1>
        <p class="mt-4 text-body-l text-on-surface-variant">Đồ cũ và mới từ người bán quanh Bình Thạnh.</p>
        <div class="mt-6 flex flex-wrap gap-2">{quick}</div>
        <ul class="mt-8 flex flex-col gap-3">{points}</ul>
      </div>
      <div class="relative overflow-hidden rounded-lg">
        <img src="{img("1517649763962-0c623066013b", 1100, 900)}" alt="" class="h-full w-full object-cover">
        <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div class="absolute bottom-6 left-6 right-6 text-white"><span class="rounded-sm bg-tertiary-container px-2 py-1 text-label-m text-on-tertiary-container">Mùa đạp xe</span><p class="mt-3 text-headline-s">Xe đạp cũ từ 1,5 triệu</p></div>
      </div>
    </section>
    <section class="mt-14">
      <div class="flex items-end justify-between">
        <div><h2 class="text-headline-s">Tin mới gần bạn</h2><p class="mt-1 text-body-m text-on-surface-variant">2.418 tin trong 5 km quanh Bình Thạnh</p></div>
        <button type="button" class="state flex h-10 items-center gap-1 rounded-md border border-outline-variant pl-3 pr-2 text-label-l text-on-surface-variant">{icon("swap-vert-rounded", 18)}Gần nhất{icon("keyboard-arrow-down-rounded", 18)}</button>
      </div>
      <div class="mt-4 flex gap-2">{chips}</div>
      <div class="mt-6 grid grid-cols-6 gap-x-6 gap-y-8">{cards}</div>
      <div class="mt-10 flex justify-center"><button type="button" class="state h-10 rounded-md border border-outline-variant px-6 text-label-l text-primary">Xem thêm tin</button></div>
    </section>
    <section class="mt-16">
      <h2 class="text-headline-s">Danh mục</h2>
      <div class="mt-5 grid grid-cols-5 gap-3">{tiles}</div>
    </section>
  </main>
  {footer()}
</div>
</body>
</html>"""
    return head("Trang chủ · M3 cho web") + body


def detail_web():
    thumbs = "".join(f'<div class="h-[88px] w-[88px] overflow-hidden rounded-sm {"ring-2 ring-primary ring-offset-2 ring-offset-surface" if i == 0 else ""}"><img src="{p}" alt="" class="h-full w-full object-cover"></div>'
                     for i, p in enumerate(PHOTOS))
    specs = "".join(f'<div class="flex justify-between border-b border-outline-variant py-3 text-body-m"><dt class="text-on-surface-variant">{k}</dt><dd>{v}</dd></div>' for k, v in SPECS)
    crumbs = " ".join(
        (a(f"crumb-{i}", "hover:text-on-surface hover:underline", c) + f'<span class="mx-1.5">{icon("chevron-right-rounded", 16)}</span>')
        for i, c in enumerate(["Trang chủ", "Điện thoại", "iPhone"])) + f'<span class="text-on-surface">iPhone 13 Pro 128GB</span>'
    stats = "".join(f'<div><p class="text-title-m">{v}</p><p class="text-body-s text-on-surface-variant">{l}</p></div>' for v, l in STATS)
    similar = "".join(web_card(it, 9) for it in SIMILAR)
    body = f"""<body>
<div class="min-h-screen bg-surface font-sans text-on-surface">
  {topbar()}
  <main class="mx-auto max-w-[1328px] px-6">
    <nav class="flex h-12 items-center text-body-s text-on-surface-variant">{crumbs}</nav>
    <div class="grid grid-cols-[1fr_440px] gap-10">
      <section>
        <div class="flex gap-3">
          <div class="flex flex-col gap-3">{thumbs}</div>
          <div class="relative aspect-[4/3] flex-1 overflow-hidden rounded-md bg-surface-container-high">
            <img src="{PHOTOS[0]}" alt="{escape(TITLE)}" class="h-full w-full object-cover">
            <span class="absolute bottom-3 right-3 rounded-sm bg-black/60 px-2 py-1 text-label-m text-white">1 / 5</span>
          </div>
        </div>
        <h2 class="mt-10 text-title-l">Mô tả</h2>
        <p class="mt-3 max-w-[680px] text-body-l">{DESCRIPTION}</p>
        <h2 class="mt-10 text-title-l">Thông số</h2>
        <dl class="mt-2 grid grid-cols-2 gap-x-10">{specs}</dl>
        <h2 class="mt-10 text-title-l">Người bán</h2>
        <div class="mt-4 flex items-center gap-4 rounded-md bg-surface-container-low p-5">
          <img src="{img(SELLER["photo"], 112, 112)}" alt="" class="h-14 w-14 rounded-full object-cover">
          <div class="w-56"><p class="text-title-m">{SELLER["name"]}</p><p class="flex items-center gap-1 text-body-s text-on-surface-variant">{icon("verified-rounded", 16, "text-primary")}Đã xác minh danh tính</p></div>
          <div class="flex flex-1 justify-between">{stats}</div>
          {a("seller-page", "state ml-6 flex h-10 items-center rounded-md border border-outline-variant px-4 text-label-l text-primary", "Xem trang")}
        </div>
      </section>
      <aside class="self-start">
        <div class="rounded-lg bg-surface-container-low p-6">
          <h1 class="text-headline-s">{escape(TITLE)}</h1>
          <p class="mt-2 text-body-m text-on-surface-variant">Như mới · Bình Thạnh · 2,1 km · 2 giờ trước</p>
          <p class="mt-5"><span class="text-display-s">{PRICE[0]}</span><span class="text-title-l text-on-surface-variant">{PRICE[1]}</span></p>
          <p class="mt-1 flex items-center gap-1 text-label-m text-tertiary">{icon("auto-awesome-rounded", 14)}Rẻ hơn 9% so với tin tương tự</p>
          <div class="mt-6 flex flex-col gap-2">
            <button type="button" class="state flex h-12 items-center justify-center gap-2 rounded-md bg-secondary-container text-label-l text-on-secondary-container">{icon("chat-outline-rounded", 20)}Nhắn tin người bán</button>
            <button type="button" class="state flex h-12 items-center justify-center gap-2 rounded-md bg-tertiary text-label-l text-on-tertiary">{icon("sell-outline-rounded", 20)}Trả giá</button>
          </div>
          <div class="mt-5 flex gap-2">
            <button type="button" class="state flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md text-label-l text-on-surface-variant">{icon("favorite-outline-rounded", 20)}Lưu tin</button>
            <button type="button" class="state flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md text-label-l text-on-surface-variant">{icon("share-outline-rounded", 20)}Chia sẻ</button>
            <button type="button" class="state flex h-10 flex-1 items-center justify-center gap-1.5 rounded-md text-label-l text-on-surface-variant">{icon("flag-outline-rounded", 20)}Báo cáo</button>
          </div>
          <div class="mt-5 flex flex-col gap-3 border-t border-outline-variant pt-5">
            {money("meet_hint", "group-outline-rounded")}
            {money("cod_buyer", "local-shipping-outline-rounded")}
            {money("refuse", "undo-rounded")}
          </div>
        </div>
      </aside>
    </div>
    <section class="mt-16">
      <div class="flex items-end justify-between"><h2 class="text-headline-s">Tin tương tự</h2>{a("similar-all", "text-label-l text-primary hover:underline", "Xem tất cả")}</div>
      <div class="mt-6 grid grid-cols-6 gap-x-6 gap-y-8">{similar}</div>
    </section>
  </main>
  {footer()}
</div>
</body>
</html>"""
    return head("Chi tiết tin · M3 cho web") + body


if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    for name, fn in [("home-m3", home_m3), ("detail-m3", detail_m3), ("home-web", home_web), ("detail-web", detail_web)]:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(fn())
        print("wrote", name)
