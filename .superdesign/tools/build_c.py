"""Direction C, "Chợ xóm": a warm, illustrated neighbourhood market led by the
app's mascot. Same tokens and deal model as A and B; a different composition.

    python3 tools/build_c.py        (run from .superdesign/)

Art: the app's own drawings plus four new ones from tools/gen_art.py, all
uploaded as Superdesign content; their public URLs are in tools/art_urls.json.
"""
import json
import os
from html import escape

from build import DESCRIPTION, OUT, PHOTOS, PRICE, SELLER, SIMILAR, SPECS, TITLE, a, money
from common import LISTINGS, LOGO, MONEY, head, icon, img, split_price

ART = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "art_urls.json")))

CSS = """
  .tilt-l { transform: rotate(-5deg); } .tilt-r { transform: rotate(4deg); } .tilt-s { transform: rotate(-2deg); }
  .pin-pulse::before { content: ""; position: absolute; inset: -10px; border-radius: 9999px; background: var(--md-primary); opacity: .18; }
  /* The ticket: three stacked parts with real notches cut by a mask, so the
     page shows through and the shadow (a drop-shadow on the wrapper) follows
     the notched outline instead of being painted over. */
  .ticket { filter: drop-shadow(0 1px 2px rgb(0 0 0 / .22)) drop-shadow(0 4px 10px rgb(0 0 0 / .10)); }
  .ticket > * { --n: 12px; background: var(--md-surface-container-lowest); padding: 24px; }
  .ticket > :first-child { border-radius: 28px 28px 0 0; padding-bottom: 28px;
    -webkit-mask: radial-gradient(circle var(--n) at 0 100%, #0000 98%, #000) 0 100% / 51% 51% no-repeat,
                  radial-gradient(circle var(--n) at 100% 100%, #0000 98%, #000) 100% 100% / 51% 51% no-repeat,
                  linear-gradient(#000 0 0) 0 0 / 100% 50% no-repeat;
            mask: radial-gradient(circle var(--n) at 0 100%, #0000 98%, #000) 0 100% / 51% 51% no-repeat,
                  radial-gradient(circle var(--n) at 100% 100%, #0000 98%, #000) 100% 100% / 51% 51% no-repeat,
                  linear-gradient(#000 0 0) 0 0 / 100% 50% no-repeat; }
  .ticket > :not(:first-child):not(:last-child) { padding-top: 28px; padding-bottom: 28px;
    -webkit-mask: radial-gradient(circle var(--n) at 0 0, #0000 98%, #000) 0 0 / 51% 51% no-repeat,
                  radial-gradient(circle var(--n) at 100% 0, #0000 98%, #000) 100% 0 / 51% 51% no-repeat,
                  radial-gradient(circle var(--n) at 0 100%, #0000 98%, #000) 0 100% / 51% 51% no-repeat,
                  radial-gradient(circle var(--n) at 100% 100%, #0000 98%, #000) 100% 100% / 51% 51% no-repeat;
            mask: radial-gradient(circle var(--n) at 0 0, #0000 98%, #000) 0 0 / 51% 51% no-repeat,
                  radial-gradient(circle var(--n) at 100% 0, #0000 98%, #000) 100% 0 / 51% 51% no-repeat,
                  radial-gradient(circle var(--n) at 0 100%, #0000 98%, #000) 0 100% / 51% 51% no-repeat,
                  radial-gradient(circle var(--n) at 100% 100%, #0000 98%, #000) 100% 100% / 51% 51% no-repeat; }
  .ticket > :last-child { border-radius: 0 0 28px 28px; padding-top: 28px;
    -webkit-mask: radial-gradient(circle var(--n) at 0 0, #0000 98%, #000) 0 0 / 51% 51% no-repeat,
                  radial-gradient(circle var(--n) at 100% 0, #0000 98%, #000) 100% 0 / 51% 51% no-repeat,
                  linear-gradient(#000 0 0) 0 100% / 100% 50% no-repeat;
            mask: radial-gradient(circle var(--n) at 0 0, #0000 98%, #000) 0 0 / 51% 51% no-repeat,
                  radial-gradient(circle var(--n) at 100% 0, #0000 98%, #000) 100% 0 / 51% 51% no-repeat,
                  linear-gradient(#000 0 0) 0 100% / 100% 50% no-repeat; }
  /* the tear line sits between the notches, inset so it never touches the edge */
  .ticket > :not(:first-child) { position: relative; }
  .ticket > :not(:first-child)::before { content: ""; position: absolute; top: 0; left: 22px; right: 22px;
    border-top: 2px dashed var(--md-outline-variant); }
  .stamp { border: 2px solid currentColor; box-shadow: inset 0 0 0 4px var(--md-surface-container-lowest), inset 0 0 0 5px currentColor; }
  .lift { transition: transform 420ms var(--spatial); } .lift:hover { transform: translateY(-4px) rotate(-1deg); }
  .dash-line { background-image: linear-gradient(to right, var(--md-on-primary-container) 50%, transparent 0); background-size: 12px 2px; background-repeat: repeat-x; }
  .stagger > :nth-child(even) { transform: translateY(28px); }
"""


QUICK_SCRIPT = """<style>
  .quick { max-width: 240px; transition: max-width 412ms var(--spatial), opacity 212ms var(--effects), padding 412ms var(--spatial); overflow: hidden; }
  .quick-hidden { max-width: 0; opacity: 0; padding-left: 0; padding-right: 0; pointer-events: none; }
</style>
<script>
// Pages with a big search field hide "Tìm nhanh" until that field scrolls under the header.
addEventListener('DOMContentLoaded', () => {
  const big = document.querySelector('[data-big-search]'), quick = document.getElementById('quick-search');
  if (!big || !quick) return;
  new IntersectionObserver(([e]) => quick.classList.toggle('quick-hidden', e.isIntersecting || e.boundingClientRect.top > 0),
    { rootMargin: '-96px 0px 0px 0px' }).observe(big);
});
</script>"""


def header(quick="always"):
    """quick="scroll" on a page with its own big search field (marked data-big-search):
    "Tìm nhanh" stays hidden until that field has scrolled under the header."""
    nav = "".join(a(f"nav-{i}", f"state flex h-10 items-center rounded-full px-4 text-label-l {'bg-secondary-container text-on-secondary-container' if i == 0 else 'text-on-surface-variant'}", t)
                  for i, t in enumerate(["Khám phá", "Danh mục", "Bản đồ", "Cách mua"]))
    return f"""<header class="sticky top-4 z-30 mx-auto mt-4 max-w-[1328px] px-6">
  <div class="flex h-16 items-center gap-2 rounded-full bg-surface-container-lowest pl-3 pr-2 shadow-float">
    {a("brand", "flex items-center gap-2 pr-4", f'<img src="{LOGO}" alt="ShopNexus" class="h-9 w-9"><span class="text-title-l font-medium">ShopNexus</span>', "#home")}
    <nav class="flex items-center gap-1">{nav}</nav>
    <span class="flex-1"></span>
    <button id="quick-search" type="button" class="quick {"quick-hidden" if quick == "scroll" else ""} state flex h-10 items-center gap-2 whitespace-nowrap rounded-full bg-surface-container-high px-4 text-body-m text-on-surface-variant">{icon("search-rounded", 20)}Tìm nhanh<span class="ml-6 rounded-xs bg-surface-container-lowest px-1.5 text-label-s">/</span></button>
    {a("messages", "state relative grid h-10 w-10 place-items-center rounded-full text-on-surface-variant", icon("chat-outline-rounded", 24) + '<span class="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-error px-1 text-label-s text-on-error">3</span>')}
    <button type="button" class="state flex h-12 items-center gap-2 rounded-full bg-primary pl-4 pr-5 text-label-l text-on-primary">{icon("add-rounded", 20)}Đăng tin</button>
    <img src="{img(SELLER["photo"], 96, 96)}" alt="Tài khoản" class="ml-1 h-11 w-11 rounded-full object-cover">
  </div>
</header>{QUICK_SCRIPT if quick == "scroll" else ""}"""


def polaroid(photo, price, km, cls="", w=200):
    num, unit = split_price(price)
    return f"""<div class="absolute rounded-md bg-surface-container-lowest p-2 pb-3 shadow-float {cls}" style="width:{w}px">
  <img src="{img(photo, 400, 400)}" alt="" class="aspect-square w-full rounded-sm object-cover">
  <div class="mt-2 flex items-center justify-between px-1">
    <span class="whitespace-nowrap rounded-full bg-tertiary-fixed px-2.5 py-0.5 text-title-s text-on-tertiary-fixed-variant">{num}<span class="text-body-s">{unit}</span></span>
    <span class="flex items-center gap-0.5 whitespace-nowrap text-label-m text-on-surface-variant">{icon("near-me-rounded", 14)}{km}</span>
  </div>
</div>"""


def feed_card(item, i):
    photo, price, title, cond, km, area, rating, posted, insight = item
    num, unit = split_price(price)
    saved = i == 3
    ins = (f'<p class="mt-1 flex items-center gap-1 text-label-m text-tertiary">{icon("auto-awesome-rounded", 14)}{insight}</p>' if insight else "")
    return f"""<article class="lift min-w-0">
  <div class="relative overflow-hidden rounded-xl bg-surface-container-high" style="aspect-ratio: 4 / 5">
    <img src="{img(photo, 480, 600)}" alt="{escape(title)}" class="h-full w-full object-cover">
    <span class="absolute bottom-3 left-3 rounded-full bg-surface-container-lowest px-3 py-1 text-title-m text-on-surface shadow-float">{num}<span class="text-body-s text-on-surface-variant">{unit}</span></span>
    <button type="button" class="state absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-surface-container-lowest/90 {"text-primary" if saved else "text-on-surface"}" aria-label="Lưu tin">{icon("favorite-rounded" if saved else "favorite-outline-rounded", 22)}</button>
    <span class="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-label-m text-white">{km}</span>
  </div>
  {ins}
  <h3 class="mt-2 line-clamp-2 text-body-l text-on-surface">{escape(title)}</h3>
  <p class="mt-1 text-body-s text-on-surface-variant">{cond} · {area} · {posted} trước</p>
</article>"""


def area_map(pins, you=(54, 58), h=460, guide=True, route=None):
    blocks = "".join(f'<rect x="{x}" y="{y}" width="{w}" height="{hh}" rx="10" fill="#E6ECEA"/>' for x, y, w, hh in [
        (30, 30, 150, 90), (200, 30, 120, 90), (340, 30, 170, 90), (30, 140, 150, 110), (200, 140, 120, 110), (340, 140, 80, 110),
        (440, 140, 70, 110), (30, 270, 150, 90), (200, 270, 120, 90), (340, 270, 170, 90), (530, 30, 110, 150), (530, 200, 110, 160),
        (660, 30, 120, 330)])
    parks = '<rect x="340" y="140" width="80" height="110" rx="10" fill="#C7E6E0"/><circle cx="370" cy="175" r="14" fill="#97E7DB"/><circle cx="395" cy="215" r="10" fill="#97E7DB"/>'
    river = '<path d="M-10 420 C 150 380, 260 470, 420 410 S 700 380, 820 430 L 820 520 L -10 520 Z" fill="#C7E6E0"/>'
    svg = (f'<svg viewBox="0 0 800 {h}" preserveAspectRatio="xMidYMid slice" class="absolute inset-0 h-full w-full" aria-hidden="true">'
           f'<rect width="800" height="{h}" fill="#F1F4F2"/>{river}{blocks}{parks}</svg>')
    pin_html = "".join(
        f'<span class="absolute -translate-x-1/2 -translate-y-full" style="left:{x}%;top:{y}%"><span class="flex items-center gap-1 rounded-full px-3 py-1.5 text-label-l shadow-float {"bg-primary text-on-primary" if sel else "bg-surface-container-lowest text-on-surface"}">{p}</span>'
        f'<span class="mx-auto block h-2 w-2 -translate-y-1 rotate-45 {"bg-primary" if sel else "bg-surface-container-lowest"}"></span></span>'
        for x, y, p, sel in pins)
    route_html = ""
    if route:
        (x1, y1), (x2, y2), label = route
        route_html = (f'<svg viewBox="0 0 100 100" preserveAspectRatio="none" class="absolute inset-0 h-full w-full" aria-hidden="true">'
                      f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="#005049" stroke-width="3" stroke-dasharray="2 6" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>'
                      f'<span class="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-inverse-surface px-3 py-1 text-label-l text-inverse-on-surface" style="left:{(x1 + x2) / 2}%;top:{(y1 + y2) / 2 + 6}%">{label}</span>')
    me = f'<span class="pin-pulse absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-surface-container-lowest bg-primary" style="left:{you[0]}%;top:{you[1]}%"></span>'
    river_label = '<span class="absolute bottom-6 left-8 text-label-m tracking-[0.2em] text-secondary">SÔNG SÀI GÒN</span>'
    guide_html = f'<img src="{ART["map-guide"]}" alt="" class="pointer-events-none absolute -bottom-6 -right-4 w-[210px]">' if guide else ""
    return f'<div class="relative overflow-hidden rounded-xl" style="height:{h}px">{svg}{river_label}{route_html}{pin_html}{me}{guide_html}</div>'


def footer():
    cols = [("Khám phá", ["Gần bạn", "Bản đồ", "Danh mục", "Vừa đăng"]), ("Mua và bán", ["Cách mua bằng COD", "Cách đăng tin", "Gói người bán", "Điểm uy tín"]),
            ("Hỗ trợ", ["Trung tâm trợ giúp", "Báo cáo vi phạm", "Quy định đăng tin", "Điều khoản"])]
    col_html = "".join(f'<div><p class="text-title-s text-inverse-on-surface">{t}</p><ul class="mt-4 flex flex-col gap-3 text-body-m text-inverse-on-surface/70">'
                       + "".join(f"<li>{a(f'f-{t[:3]}-{i}', 'hover:text-inverse-on-surface', l)}</li>" for i, l in enumerate(ls)) + "</ul></div>" for t, ls in cols)
    return f"""<footer class="mx-auto mt-24 max-w-[1328px] px-6 pb-6">
  <div class="relative overflow-hidden rounded-xl bg-inverse-surface px-12 pb-10 pt-14">
    <div class="grid grid-cols-[1.5fr_1fr_1fr_1fr] gap-10">
      <div>
        <div class="flex items-center gap-2"><img src="{LOGO}" alt="ShopNexus" class="h-9 w-9"><span class="text-title-l font-medium text-inverse-on-surface">ShopNexus</span></div>
        <p class="mt-4 max-w-[300px] text-body-m text-inverse-on-surface/70">Giá tốt, gần bạn, chốt nhanh. {MONEY["no_hold"]}</p>
      </div>
      {col_html}
    </div>
    <div class="mt-12 flex justify-between border-t border-inverse-on-surface/15 pt-6 text-body-s text-inverse-on-surface/60"><span>© 2026 ShopNexus</span><span>TP.HCM · Hà Nội · Đà Nẵng</span></div>
  </div>
</footer>"""


# --------------------------------------------------------------------- home --
def home():
    quick = "".join(f'<button type="button" class="state h-9 rounded-full bg-surface-container-lowest/80 px-4 text-label-l text-on-surface">{q}</button>'
                    for q in ["iPhone cũ", "Xe đạp", "Sofa", "Máy ảnh film", "Đồ cho bé"])
    pins = [(22, 30, "3,9 tr", False), (40, 48, "11,5 tr", False), (62, 36, "2,3 tr", True), (70, 66, "950 k", False), (30, 74, "1,6 tr", False), (84, 26, "450 k", False)]
    near = "".join(
        f"""<li class="state flex items-center gap-4 rounded-lg p-2 {"bg-secondary-container" if i == 0 else ""}">
  <img src="{img(p, 160, 160)}" alt="" class="h-16 w-16 rounded-md object-cover">
  <div class="min-w-0 flex-1"><p class="text-title-m">{split_price(pr)[0]}<span class="text-body-s text-on-surface-variant">{split_price(pr)[1]}</span></p><p class="truncate text-body-m">{escape(t)}</p></div>
  <span class="flex items-center gap-1 text-label-l text-on-surface-variant">{icon("near-me-rounded", 16)}{km}</span>
</li>""" for i, (p, pr, t, _c, km, *_r) in enumerate([LISTINGS[2], LISTINGS[11], LISTINGS[10], LISTINGS[0]]))
    cats = [("Điện thoại", "category_phones", "3.412", "bg-secondary-container"), ("Máy tính", "category_laptop", "1.208", "bg-surface-container"),
            ("Xe cộ", "category_vehicles", "1.402", "bg-surface-container"), ("Thời trang", "category_fashion", "4.977", "bg-tertiary-fixed"),
            ("Nội thất", "category_furniture", "1.733", "bg-surface-container"), ("Gia dụng", "category_home", "1.390", "bg-secondary-container"),
            ("Thể thao", "category_sports", "448", "bg-surface-container"), ("Mẹ và bé", "category_baby", "702", "bg-surface-container")]
    cat_html = "".join(
        f"""<a id="cat-{k}" href="#cat-{k}" class="lift group relative flex h-[200px] flex-col justify-between overflow-hidden rounded-xl p-5 {bg}">
  <div><p class="text-title-l text-on-surface">{t}</p><p class="text-body-s text-on-surface-variant">{n} món quanh bạn</p></div>
  <img src="{ART[k]}" alt="" class="absolute -bottom-3 -right-3 w-[150px]">
  <span class="grid h-9 w-9 place-items-center rounded-full bg-surface-container-lowest text-on-surface">{icon("arrow-forward-rounded", 20)}</span>
</a>""" for t, k, n, bg in cats)
    feed = "".join(feed_card(it, i) for i, it in enumerate(LISTINGS[:10]))
    story = [("art_search", "Tìm và nhắn", "Gõ cả câu hoặc chụp một tấm ảnh. Hỏi người bán ngay trong chat.", False),
             ("art_deal", "Trả giá, chốt", "Đưa giá trong chat. Hai bên đồng ý là chốt, giá đó vào đơn.", True),
             ("art_cod_ready", "Người bán gửi COD", "Người bán tạo đơn với bên vận chuyển, bạn theo dõi trong app.", False),
             ("art_received", "Xem rồi mới trả", MONEY["cod_buyer"] + " " + MONEY["refuse"], False)]
    story_html = "".join(
        f"""<li class="relative flex flex-col rounded-xl p-6 {"bg-tertiary-fixed text-on-tertiary-fixed-variant" if bar else "bg-surface-container-lowest text-on-surface"}">
  <span class="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full {"bg-tertiary text-on-tertiary" if bar else "bg-primary-container text-on-primary-container"} text-title-s">{i + 1}</span>
  <img src="{ART[k]}" alt="" class="mx-auto h-[170px] w-[170px]">
  <h3 class="mt-2 text-title-l">{t}</h3>
  <p class="mt-2 text-body-m {"" if bar else "text-on-surface-variant"}">{d}</p>
</li>""" for i, (k, t, d, bar) in enumerate(story))
    sellers = [("Tuấn Kiệt", "1544723795-3fb6469f5b39", "tier_top", "Bình Thạnh · 2,1 km", "4,9", "14", [LISTINGS[0][0], LISTINGS[4][0], LISTINGS[11][0]]),
               ("Lan Anh", "1494790108377-be9c29b29330", "tier_trusted", "Phú Nhuận · 3,0 km", "4,8", "27", [LISTINGS[3][0], LISTINGS[6][0], LISTINGS[9][0]]),
               ("Quốc Bảo", "1500648767791-00dcc994a43e", "tier_trusted", "Q.1 · 3,4 km", "4,7", "9", [LISTINGS[2][0], LISTINGS[8][0], LISTINGS[1][0]]),
               ("Hải Yến", "1534528741775-53994a69daeb", "tier_top", "Q.3 · 4,2 km", "5,0", "41", [LISTINGS[5][0], LISTINGS[10][0], LISTINGS[7][0]])]
    seller_html = "".join(
        f"""<article class="lift rounded-xl bg-surface-container-low p-5">
  <div class="flex items-center gap-3">
    <div class="relative"><img src="{img(p, 112, 112)}" alt="" class="h-14 w-14 rounded-full object-cover"><img src="{ART[tier]}" alt="" class="absolute -bottom-1 -right-2 h-7 w-7"></div>
    <div class="min-w-0 flex-1"><p class="flex items-center gap-1 text-title-m">{n}{icon("verified-rounded", 16, "text-primary")}</p><p class="text-body-s text-on-surface-variant">{loc}</p></div>
  </div>
  <div class="mt-4 grid grid-cols-3 gap-1.5">{"".join(f'<img src="{img(t, 200, 200)}" alt="" class="aspect-square w-full rounded-sm object-cover">' for t in thumbs)}</div>
  <p class="mt-3 flex items-center gap-1 text-body-s text-on-surface-variant">{icon("star-rounded", 14)}{r}<span class="mx-1">·</span>{sold} đã bán</p>
</article>""" for n, p, tier, loc, r, sold, thumbs in sellers)
    body = f"""<body>
<div class="min-h-screen bg-surface pb-2 font-sans text-on-surface">
  {header()}
  <main class="mx-auto max-w-[1328px] px-6">
    <section class="relative mt-6 h-[640px] overflow-hidden rounded-xl bg-[#F4F8F6]">
      <img src="{ART["hero-street"]}" alt="" class="absolute right-0 top-0 h-full">
      <div class="absolute inset-y-0 right-[440px] w-[200px] bg-gradient-to-r from-[#F4F8F6] to-transparent"></div>
      <div class="relative z-10 max-w-[600px] px-14 pt-16">
        <p class="inline-flex items-center gap-2 rounded-full bg-surface-container-lowest/85 px-3 py-1.5 text-label-l text-primary">{icon("near-me-rounded", 16)}Bình Thạnh · 2.418 món đang bán</p>
        <h1 class="mt-5 text-display-l text-on-surface">Cả xóm đang<br>bán gì hôm nay?</h1>
        <p class="mt-4 max-w-[460px] text-body-l text-on-surface-variant">Đồ cũ, đồ mới từ hàng xóm quanh bạn. Nhắn tin, trả giá, rồi xem hàng tại cửa trước khi trả tiền.</p>
        <div class="mt-8 flex h-16 items-center gap-3 rounded-full bg-surface-container-lowest pl-6 pr-2 shadow-float">
          {icon("search-rounded", 24, "text-on-surface-variant")}
          <span class="flex-1 text-body-l text-on-surface">xe đạp cho bé 8 tuổi, dưới 1 triệu<span class="ml-0.5 inline-block h-5 w-0.5 translate-y-1 bg-primary"></span></span>
          <button type="button" class="state grid h-12 w-12 place-items-center rounded-full text-on-surface-variant" aria-label="Tìm bằng ảnh">{icon("photo-camera-outline-rounded", 24)}</button>
          <button type="button" class="state flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-label-l text-on-primary">Tìm</button>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">{quick}</div>
      </div>
      {polaroid(LISTINGS[3][0], LISTINGS[3][1], "3,1 km", "tilt-l left-[590px] top-[350px]", 196)}
      {polaroid(LISTINGS[11][0], LISTINGS[11][1], "0,6 km", "tilt-r right-[36px] bottom-[40px]", 180)}
    </section>

    <section class="mt-24 grid grid-cols-[1fr_400px] gap-8">
      <div>
        <div class="mb-6 flex items-end justify-between">
          <div><p class="text-label-l uppercase tracking-[0.12em] text-primary">Bản đồ quanh bạn</p><h2 class="mt-2 text-display-s">Mua của người ở cách bạn vài con phố</h2></div>
        </div>
        {area_map(pins)}
      </div>
      <div class="flex flex-col pt-[88px]">
        <div class="flex items-center justify-between"><h3 class="text-title-l">Gần nhất</h3><span class="text-body-s text-on-surface-variant">trong 1 km</span></div>
        <ul class="mt-3 flex flex-col gap-1">{near}</ul>
        {a("map-open", "state mt-auto flex h-12 items-center justify-center gap-2 rounded-full border border-outline-variant text-label-l text-primary", icon("map-outline-rounded", 20) + "Mở bản đồ lớn")}
      </div>
    </section>

    <section class="mt-24">
      <div class="flex items-end justify-between"><h2 class="text-display-s">Hôm nay bạn cần gì?</h2>{a("cats-all", "text-label-l text-primary hover:underline", "Tất cả danh mục")}</div>
      <div class="mt-8 grid grid-cols-4 gap-4">{cat_html}</div>
    </section>

    <section class="mt-24">
      <div class="flex items-end justify-between">
        <div><p class="text-label-l uppercase tracking-[0.12em] text-primary">Mới lên kệ</p><h2 class="mt-2 text-display-s">Vừa đăng quanh Bình Thạnh</h2></div>
        <div class="flex gap-2">{"".join(f'<button type="button" class="state h-10 rounded-full px-4 text-label-l {c}">{t}</button>' for t, c in [("Gần nhất", "bg-secondary-container text-on-secondary-container"), ("Mới nhất", "border border-outline-variant text-on-surface-variant"), ("Giá thấp", "border border-outline-variant text-on-surface-variant")])}</div>
      </div>
      <div class="stagger mt-8 grid grid-cols-5 gap-x-5 gap-y-10 pb-7">{feed}</div>
      <div class="mt-10 flex justify-center"><button type="button" class="state h-12 rounded-full bg-secondary-container px-8 text-label-l text-on-secondary-container">Xem thêm 2.408 món</button></div>
    </section>

    <section class="mt-24 rounded-xl bg-primary-container px-12 pb-12 pt-14">
      <div class="flex items-end justify-between text-on-primary-container">
        <div><p class="text-label-l uppercase tracking-[0.12em]">Từ lúc nhắn đến lúc nhận</p><h2 class="mt-2 text-display-m text-white">Xem hàng tận tay<br>rồi mới trả tiền</h2></div>
        <p class="max-w-[320px] text-body-l">{MONEY["no_hold"]}</p>
      </div>
      <div class="dash-line mx-24 mt-10 h-0.5 opacity-60"></div>
      <ol class="-mt-px grid grid-cols-4 gap-4 pt-8">{story_html}</ol>
    </section>

    <section class="mt-24">
      <div class="flex items-end justify-between"><h2 class="text-display-s">Hàng xóm bán uy tín</h2>{a("sellers-all", "text-label-l text-primary hover:underline", "Xem thêm người bán")}</div>
      <div class="mt-8 grid grid-cols-4 gap-4">{seller_html}</div>
    </section>

    <section class="relative mt-24 grid h-[380px] grid-cols-[1fr_440px] overflow-hidden rounded-xl bg-secondary-container">
      <div class="flex flex-col justify-center pl-14 text-on-secondary-container">
        <h2 class="text-display-m text-on-surface">Đăng bán trong một phút</h2>
        <p class="mt-4 max-w-[520px] text-body-l">Quay một video món đồ, AI điền tên, tình trạng và giá. Có người trả giá là điện thoại báo ngay.</p>
        <div class="mt-8 flex items-center gap-4">
          {a("get-app", "state flex h-14 items-center gap-2 rounded-full bg-inverse-surface px-6 text-label-l text-inverse-on-surface", icon("android-rounded", 22) + "Tải trên Google Play")}
          <span class="text-body-m">Android 10 trở lên</span>
        </div>
      </div>
      <img src="{ART["boxes-wave"]}" alt="" class="absolute -bottom-10 right-6 w-[420px]">
    </section>
  </main>
  {footer()}
</div>
</body>
</html>"""
    return head("Trang chủ · C. Chợ xóm", CSS) + body


# ------------------------------------------------------------------- detail --
CLAIMS = [("Pin 88%", "Cài đặt › Pin › Tình trạng pin"), ("Chưa từng sửa", "Cài đặt › Cài đặt chung › Giới thiệu › Lịch sử linh kiện"),
          ("Bản VN/A", "Cài đặt › Cài đặt chung › Giới thiệu › Kiểu máy"), ("Face ID nhạy", "Khóa máy rồi mở bằng mặt 3 lần")]


def detail():
    thumbs = "".join(
        f"""<div class="rounded-sm bg-surface-container-lowest p-1.5 pb-5 shadow-float {["tilt-l", "tilt-s", "tilt-r", "tilt-s"][i]}" style="width:118px">
  <img src="{p}" alt="" class="aspect-square w-full rounded-xs object-cover"></div>"""
        for i, p in enumerate(PHOTOS[1:]))
    claims = "".join(
        f"""<li class="flex items-start gap-4 rounded-lg bg-surface-container-lowest p-4">
  <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary-container text-on-secondary-container">{icon("check-rounded", 20)}</span>
  <div><p class="text-title-m">{c}</p><p class="mt-0.5 text-body-m text-on-surface-variant">{how}</p></div>
</li>""" for c, how in CLAIMS)
    specs = "".join(f'<div class="flex justify-between py-3 text-body-m {"border-t border-outline-variant" if i > 1 else ""}"><dt class="text-on-surface-variant">{k}</dt><dd>{v}</dd></div>' for i, (k, v) in enumerate(SPECS))
    qs = "".join(f'<button type="button" class="state h-9 rounded-full border border-outline-variant px-3.5 text-label-l text-on-surface-variant">{q}</button>'
                 for q in ["Máy còn không bạn?", "Xem máy ở đâu được?", "Có hộp và hóa đơn không?"])
    lo, hi = 4_500_000, 6_000_000
    at = lambda v: round((v - lo) / (hi - lo) * 100, 2)
    strip = f"""<div class="relative mt-3 h-12" aria-hidden="true">
  <span class="absolute inset-x-0 top-4 h-2 rounded-full bg-surface-container-highest"></span>
  <span class="absolute top-4 h-2 rounded-full bg-tertiary-fixed" style="left:{at(4_900_000)}%;right:{100 - at(5_600_000)}%"></span>
  <span class="absolute top-3 h-4 w-0.5 -translate-x-1/2 rounded-full bg-on-surface-variant" style="left:{at(5_300_000)}%"></span>
  <span class="absolute top-3 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-surface-container-lowest bg-tertiary" style="left:{at(5_200_000)}%"></span>
  <span class="absolute left-0 top-7 text-body-s text-on-surface-variant">4,5 tr</span>
  <span class="absolute top-7 -translate-x-1/2 text-body-s text-on-surface-variant" style="left:{at(5_300_000)}%">giữa 5,3 tr</span>
  <span class="absolute right-0 top-7 text-body-s text-on-surface-variant">6 tr</span>
</div>"""
    similar = "".join(feed_card(it, 9) for it in SIMILAR[:5])
    body = f"""<body>
<div class="min-h-screen bg-surface pb-2 font-sans text-on-surface">
  {header()}
  <main class="mx-auto max-w-[1328px] px-6">
    <nav class="mt-6 flex items-center gap-1.5 text-body-s text-on-surface-variant">{a("crumb-home", "hover:underline", "Khám phá")}{icon("chevron-right-rounded", 16)}{a("crumb-cat", "hover:underline", "Điện thoại")}{icon("chevron-right-rounded", 16)}<span class="text-on-surface">iPhone 13 Pro</span></nav>
    <div class="mt-4 grid grid-cols-[1fr_440px] gap-8">
      <section class="relative overflow-hidden rounded-xl bg-[#E3F2EF] p-8">
        <div class="relative overflow-hidden rounded-lg" style="aspect-ratio: 4 / 3.2">
          <img src="{PHOTOS[0]}" alt="{escape(TITLE)}" class="h-full w-full object-cover">
          <span class="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-label-m text-white">{icon("photo-camera-outline-rounded", 16)}Chụp trong app</span>
          <button type="button" class="state absolute bottom-4 right-4 flex h-10 items-center gap-2 rounded-full bg-surface-container-lowest/90 px-4 text-label-l text-on-surface">{icon("fullscreen-rounded", 18)}Xem 5 ảnh</button>
        </div>
        <div class="mt-6 flex items-end gap-5 pl-2">{thumbs}
          <div class="ml-auto flex items-center gap-3 rounded-full bg-surface-container-lowest py-2 pl-2 pr-5 text-body-m">
            <span class="grid h-9 w-9 place-items-center rounded-full bg-primary-container text-on-primary-container">{icon("photo-camera-outline-rounded", 20)}</span>Cả 5 ảnh chụp trong app
          </div>
        </div>
      </section>

      <aside class="ticket self-start">
        <div>
        <div class="flex items-center gap-3">
          <img src="{img(SELLER["photo"], 96, 96)}" alt="" class="h-10 w-10 rounded-full object-cover">
          <div class="flex-1"><p class="flex items-center gap-1 text-title-s">{SELLER["name"]}{icon("verified-rounded", 16, "text-primary")}</p><p class="text-body-s text-on-surface-variant">Bình Thạnh · cách bạn 2,1 km</p></div>
          <span class="flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-label-l">{icon("star-rounded", 16)}4,9</span>
        </div>
        <h1 class="mt-5 text-headline-m">{escape(TITLE)}</h1>
        <p class="mt-2 text-body-m text-on-surface-variant">Đăng 2 giờ trước · 38 người đã lưu</p>
        </div>
        <div>
        <p><span class="text-display-m">{PRICE[0]}</span><span class="text-title-l text-on-surface-variant">{PRICE[1]}</span></p>
        <p class="mt-1 flex items-center gap-1 text-label-l text-tertiary">{icon("auto-awesome-rounded", 16)}Thấp hơn mức giữa một chút</p>
        {strip}
        <p class="text-body-s text-on-surface-variant">42 tin cùng đời máy · 30 ngày · TP.HCM</p>
        <div class="mt-6 grid grid-cols-2 gap-2">
          <button type="button" class="state flex h-14 items-center justify-center gap-2 rounded-full bg-secondary-container text-label-l text-on-secondary-container">{icon("chat-outline-rounded", 20)}Nhắn tin</button>
          <button type="button" class="state flex h-14 items-center justify-center gap-2 rounded-full bg-tertiary text-label-l text-on-tertiary">{icon("sell-outline-rounded", 20)}Trả giá</button>
        </div>
        <div class="mt-4 flex flex-wrap gap-2">{qs}</div>
        </div>
        <div>
        <div class="flex items-center gap-5">
          <div class="stamp grid h-[88px] w-[88px] shrink-0 -rotate-12 place-items-center rounded-full text-secondary">
            <span class="text-center text-label-m uppercase leading-4 tracking-[0.08em]">Như<br>mới</span>
          </div>
          <div><p class="text-title-m">Tình trạng: Như mới</p><p class="mt-1 text-body-m text-on-surface-variant">Không vết, hoặc vết rất nhỏ chỉ thấy khi soi gần</p></div>
        </div>
        <div class="mt-5 flex items-center gap-4 rounded-lg bg-surface-container px-4 py-3">
          {icon("local-shipping-outline-rounded", 24, "text-on-surface-variant")}
          <span class="flex-1"><span class="block text-body-l">COD, xem hàng trước</span><span class="block text-body-s text-on-surface-variant">Gửi từ Bình Thạnh · phí ship 16.000–30.000 ₫</span></span>
        </div>
        <div class="mt-4 flex flex-col gap-2.5">{money("cod_buyer", "inventory-2-outline-rounded")}{money("meet_hint", "group-outline-rounded")}{money("no_hold", "account-balance-outline-rounded")}</div>
        </div>
      </aside>
    </div>

    <section class="mt-16 grid grid-cols-[400px_1fr] items-center gap-10 rounded-xl bg-secondary-container p-10">
      <img src="{ART["door-check"]}" alt="" class="w-full">
      <div>
        <p class="text-label-l uppercase tracking-[0.12em] text-on-secondary-container">Tin ghi · kèm cách tự kiểm</p>
        <h2 class="mt-2 text-display-s text-on-surface">Kiểm 4 điều này khi shipper tới cửa</h2>
        <ul class="mt-6 grid grid-cols-2 gap-3">{claims}</ul>
        <p class="mt-5 flex items-center gap-2 text-body-l text-on-surface">{icon("undo-rounded", 20)}{MONEY["refuse"]}</p>
        <p class="mt-3 flex items-center gap-2 text-body-m text-on-secondary-container">{icon("auto-awesome-rounded", 16, "text-primary")}Mẹo kiểm iPhone · gợi ý chung, không phải điều {SELLER["name"]} cam kết</p>
      </div>
    </section>

    <section class="mt-16 grid grid-cols-2 gap-8">
      <div class="rounded-xl bg-surface-container-low p-8"><h2 class="text-headline-s">Lời người bán</h2><p class="mt-4 text-body-l">{DESCRIPTION}</p></div>
      <div class="rounded-xl bg-surface-container-low p-8"><h2 class="text-headline-s">Thông số</h2><dl class="mt-2 grid grid-cols-2 gap-x-8">{specs}</dl></div>
    </section>

    <section class="mt-16 grid grid-cols-[1fr_480px] gap-8">
      <div class="rounded-xl bg-surface-container-low p-8">
        <div class="flex items-center gap-4">
          <div class="relative"><img src="{img(SELLER["photo"], 160, 160)}" alt="" class="h-20 w-20 rounded-full object-cover"><img src="{ART["tier_top"]}" alt="" class="absolute -bottom-1 -right-2 h-9 w-9"></div>
          <div class="flex-1"><p class="flex items-center gap-1.5 text-headline-s">{SELLER["name"]}{icon("verified-rounded", 22, "text-primary")}</p><p class="text-body-m text-on-surface-variant">Hàng xóm ở Bình Thạnh · tham gia 2023</p></div>
          {a("seller-page", "state flex h-12 items-center rounded-full border border-outline-variant px-5 text-label-l text-primary", "Xem 14 tin khác")}
        </div>
        <div class="mt-8 grid grid-cols-4 gap-4">{"".join(f'<div class="rounded-lg bg-surface-container-lowest p-4"><p class="text-headline-s">{v}</p><p class="text-body-s text-on-surface-variant">{l}</p></div>' for v, l in [("4,9", "32 đánh giá"), ("14", "đã bán"), ("10 phút", "thường trả lời"), ("0", "ghi nhận bị từ chối")])}</div>
        <blockquote class="mt-6 rounded-lg bg-surface-container-lowest p-5"><p class="text-body-l">“Máy đúng như mô tả, pin còn tốt. Anh bán hẹn giờ rất đúng.”</p><footer class="mt-2 text-body-s text-on-surface-variant">Minh Thư · 28/10/2026 · ★★★★★</footer></blockquote>
      </div>
      {area_map([(62, 38, "Tuấn Kiệt", True)], you=(28, 72), h=420, guide=False, route=((28, 72), (62, 38), "2,1 km · khoảng 9 phút đi xe"))}
    </section>

    <section class="mt-20">
      <div class="flex items-end justify-between"><h2 class="text-display-s">Món tương tự quanh đây</h2>{a("similar-all", "text-label-l text-primary hover:underline", "Xem tất cả")}</div>
      <div class="stagger mt-8 grid grid-cols-5 gap-x-5 pb-7">{similar}</div>
    </section>
  </main>
  {footer()}
</div>
</body>
</html>"""
    return head("Chi tiết tin · C. Chợ xóm", CSS) + body


if __name__ == "__main__":
    for name, fn in [("detail-c", detail)]:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(fn())
        print("wrote", name)
