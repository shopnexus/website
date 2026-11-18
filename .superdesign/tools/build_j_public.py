"""The public pages in J ("Kính mờ"): Danh mục, Chi tiết tin, Người bán and
Bản đồ. Everything shared comes from j_kit; this file only lays the pages out.
It supersedes build_pages.category, build_c.detail and build_seller_map for
these four mockups.

    python3 tools/build_j_public.py        (run from .superdesign/)
"""
import os
from html import escape

from build import DESCRIPTION, OUT, PHOTOS, PRICE, SIMILAR, SPECS, TITLE, a
from build_c import ART, area_map
from build_pages import MODELS, PHONES, tr
from build_seller_map import IN_VIEW, REVIEWS, SELLER, SELLING, big_map
from common import LISTINGS, crop, icon, img, split_price, where
from j_kit import ai_chip, btn, card, crumbs, drop, footer, header, mini_row, page, panel, price, search_field, section_title, seg, switch, trending


# What each condition on the scale means (the site's GRADE in tin/[id].astro).
GRADE = {"Mới": "Chưa dùng", "Như mới": "Không vết, hoặc vết rất nhỏ chỉ thấy khi soi gần", "Đã dùng": "Có vết dùng, người bán ghi trong mô tả"}


# ------------------------------------------------------------ page pieces --
def range_bar(lo, hi, med, axis=None, mark=None, labels=True):
    """A price band on an axis: tertiary band lo–hi, a tick at the median, an optional dot (this listing)."""
    a_lo, a_hi = axis or (lo * 0.85, hi * 1.15)
    at = lambda v: round((v - a_lo) / (a_hi - a_lo) * 100, 2)
    dot = (f'<span class="absolute top-0 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-white bg-tertiary shadow" style="left:{at(mark)}%"></span>' if mark else "")
    lab = (f'<div class="mt-1 flex justify-between text-body-s text-on-surface-variant"><span>{tr(a_lo)} tr</span>'
           f'<span>giữa <b class="num font-semibold ink">{tr(med)} tr</b></span><span>{tr(a_hi)} tr</span></div>') if labels else ""
    return f"""<div class="relative h-3.5" aria-hidden="true">
  <span class="absolute inset-x-0 top-1 h-1.5 rounded-full bg-surface-container-high"></span>
  <span class="absolute top-1 h-1.5 rounded-full bg-gradient-to-r from-[#FFDBCF] to-[#F2A98E]" style="left:{at(lo)}%;right:{100 - at(hi)}%"></span>
  <span class="absolute top-0 h-3.5 w-0.5 -translate-x-1/2 rounded-full bg-[var(--ink)]" style="left:{at(med)}%"></span>{dot}
</div>{lab}"""


def stars(n, size=15):
    return "".join(icon("star-rounded", size, "text-[#E0A23B]" if i < n else "text-outline-variant") for i in range(5))


def j_map(pins, you, h, route=None):
    """build_c.area_map without the mascot, clipped to J's 24 px corners."""
    return f'<div class="overflow-hidden rounded-[20px]">{area_map(pins, you=you, h=h, guide=False, route=route)}</div>'


# ---------------------------------------------------------------- category --
def category():
    brands = [("Tất cả", "3.412"), ("iPhone", "1.986"), ("Samsung", "742"), ("Xiaomi", "268"), ("OPPO", "171"), ("Google Pixel", "58"), ("Khác", "187")]
    brand_html = "".join(
        a(f"brand-{i}", f"state flex h-9 items-center gap-1.5 rounded-full px-3 text-label-l {'bg-[var(--ink)] text-white' if i == 0 else 'glass glass-edge ink'}",
          f'{b}<span class="num text-label-s {"text-white/70" if i == 0 else "text-on-surface-variant"}">{n}</span>')
        for i, (b, n) in enumerate(brands))
    models = "".join(f"""<li class="py-3 {"border-t line" if i else ""}">
  <div class="flex items-baseline justify-between gap-3"><span class="text-title-s ink">{name}</span>
    <span class="num whitespace-nowrap text-title-m font-semibold tight ink">{tr(lo)} – {tr(hi)}<span class="ml-0.5 text-body-s font-medium text-on-surface-variant">tr ₫</span></span></div>
  <div class="mt-2">{range_bar(lo, hi, med, labels=False)}</div>
  <p class="mt-1.5 flex justify-between text-body-s text-on-surface-variant"><span>giữa <b class="num font-semibold ink">{tr(med)} tr</b> · {n} tin trong 30 ngày</span>{a("model-" + str(i), "text-label-m text-primary hover:underline", "Xem tin")}</p>
</li>""" for i, (name, lo, hi, med, n) in enumerate(MODELS))
    bar = (drop("Mọi khu vực") + drop("Giá") + drop("Tình trạng", 1) + drop("Pin trên 85%") + drop("Trả giá được")
           + '<span class="flex-1"></span>' + seg(["Phù hợp nhất", "Mới đăng", "Giá thấp", "Gần nhất"], 0, "bg-black/[.04]"))
    items = PHONES
    grid = "".join(card(it, i, saved=i == 1) for i, it in enumerate(items[:4])) + "".join(card(it, i + 4) for i, it in enumerate(items[4:8]))
    newest = sorted((it for it in items if it[7].endswith("phút")), key=lambda it: int(it[7].split()[0]))[:4]
    fresh = "".join(a(f"fresh-{i}", "card flex items-center gap-2.5 rounded-[18px] border line bg-white p-1.5 pr-3",
                      f'<img src="{img(it[0], 120, 120)}" alt="" class="h-11 w-11 shrink-0 rounded-[12px] object-cover">'
                      f'<span class="min-w-0">{price(it[1], "text-[14px] leading-5")}<span class="block truncate text-body-s text-on-surface-variant">{it[7]} trước</span></span>')
                    for i, it in enumerate(newest))
    body = f"""{header(active=1)}
<main class="mx-auto max-w-[1360px] px-8">
  {crumbs("Khám phá", "Danh mục", "Điện thoại", cls="pt-4")}
  <section class="mt-4 grid grid-cols-[1fr_480px] gap-8">
    <div class="flex flex-col">
      <div>
        <p class="glass glass-edge flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-label-m ink">{icon("mobile-outline-rounded", 15, "text-primary")}Danh mục</p>
        <h1 class="mt-3 text-[64px] font-semibold leading-[68px] tighter ink">Điện thoại</h1>
        <p class="mt-2 text-body-l text-on-surface-variant"><b class="num font-semibold ink">3.412</b> máy đang bán · <b class="num font-semibold ink">218</b> máy mới đăng hôm nay</p>
        <div class="mt-6 flex h-14 items-center gap-3 rounded-full bg-white pl-5 pr-2 glow">
          {icon("search-rounded", 22, "text-primary")}
          <span class="flex-1 text-body-l text-on-surface-variant">Tìm trong Điện thoại: iPhone pin trên 85%, dưới 6 triệu</span>
          <button type="button" class="state grid h-10 w-10 place-items-center rounded-full text-on-surface-variant" aria-label="Tìm bằng ảnh">{icon("photo-camera-outline-rounded", 20)}</button>
          <button type="button" class="state h-10 rounded-full bg-primary px-6 text-label-l text-on-primary">Tìm</button>
        </div>
      </div>
      <div class="mt-4 flex flex-wrap gap-1.5">{brand_html}</div>
      <p class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-body-s text-on-surface-variant">{icon("trending-up-rounded", 16, "text-primary")}Hay tìm:
        {"".join(a(f"hot-{i}", "ink hover:text-primary", t) for i, t in enumerate(["iPhone 13 Pro pin trên 85%", "Galaxy S23 Ultra", "iPhone 12 dưới 7 triệu", "máy zin chưa sửa"]))}</p>
      <div class="mt-auto pt-5">
        <p class="mb-2 flex items-center gap-1.5 text-label-m text-on-surface-variant"><span class="h-1.5 w-1.5 rounded-full bg-primary"></span>Vừa đăng</p>
        <div class="grid grid-cols-4 gap-2">{fresh}</div>
      </div>
    </div>
    <div class="glass glass-edge soft rounded-[28px] px-5 pb-2 pt-4">
      <div class="flex items-center justify-between"><p class="flex items-center gap-1.5 text-title-s ink">{icon("auto-awesome-rounded", 16, "text-primary")}Giá tham khảo</p>
        <span class="text-body-s text-on-surface-variant">30 ngày · đã tính tình trạng, dung lượng</span></div>
      <ul class="mt-1">{models}</ul>
    </div>
  </section>

  <section class="mt-8">
    <div class="glass glass-edge soft sticky top-[76px] z-20 flex items-center gap-2 rounded-full py-1 pl-1.5 pr-1">{bar}</div>
    <div class="mt-4 flex items-baseline justify-between px-1">
      <h2 class="text-[26px] font-semibold leading-8 tighter ink">Máy đang bán</h2>
      <span class="text-body-s text-on-surface-variant">Mọi tỉnh thành · gần thì ghi km, xa thì ghi nơi bán</span>
    </div>
    <div class="mt-4 grid grid-cols-4 gap-4">{grid}</div>
    <div class="mt-6 flex justify-center"><button type="button" class="state h-11 rounded-full border line bg-white px-6 text-label-l ink">Xem thêm 3.404 máy</button></div>
  </section>
</main>
{footer()}"""
    return page("Danh mục Điện thoại · ShopNexus", body)


# ------------------------------------------------------------------ detail --
def detail():
    n = len(PHOTOS)
    thumbs = "".join(f'<button type="button" class="overflow-hidden rounded-[16px] {"ring-2 ring-primary ring-offset-2" if i == 0 else "opacity-90 hover:opacity-100"}"><img src="{p}" alt="" class="aspect-square w-full object-cover"></button>'
                     for i, p in enumerate(PHOTOS))
    facts = "".join(f'<span class="flex items-center gap-1">{icon(ic, 15)}{t}</span>' for ic, t in [
        ("check-circle-outline-rounded", "Như mới"), ("near-me-outline-rounded", where("2,1 km", "Bình Thạnh")), ("schedule-outline-rounded", "2 giờ trước"), ("visibility-outline-rounded", "318 lượt xem")])
    qs = "".join(f'<button type="button" class="state h-8 rounded-full border line bg-white px-3 text-label-m ink">{q}</button>'
                 for q in ["Máy còn không bạn?", "Xem máy ở đâu được?", "Có hộp và hóa đơn không?"])
    specs = "".join(f'<div class="rounded-[16px] bg-surface-container-low px-3 py-2"><dt class="text-body-s text-on-surface-variant">{k}</dt><dd class="truncate text-title-s ink">{v}</dd></div>'
                    for k, v in SPECS)
    stats = "".join(f'<div class="rounded-[16px] bg-surface-container-low px-3 py-2"><p class="num text-title-m font-semibold tight ink">{v}</p><p class="text-body-s text-on-surface-variant">{l}</p></div>'
                    for v, l in [("4,9", "32 đánh giá"), ("14", "đã bán"), ("10 phút", "trả lời")])
    similar = "".join(card(it, i, saved=i == 2) for i, it in enumerate(SIMILAR[:5]))
    share = (f'<button type="button" class="state grid h-9 w-9 place-items-center rounded-full text-on-surface-variant" aria-label="Chia sẻ">{icon("share-outline-rounded", 19)}</button>'
             f'<button type="button" class="state grid h-9 w-9 place-items-center rounded-full text-on-surface-variant" aria-label="Ẩn tin tương tự, Báo cáo tin">{icon("more-vert", 19)}</button>')
    buy = f"""<aside class="sticky top-[84px] flex flex-col gap-3 self-start">
  <div class="glass glass-edge soft rounded-[28px] p-5">
    {a("ticket-seller", "flex items-center gap-3 rounded-full", f'<img src="{img(SELLER["photo"], 96, 96)}" alt="" class="h-10 w-10 rounded-full object-cover ring-2 ring-white"><span class="flex flex-1 items-center gap-1 text-title-s ink">{SELLER["name"]}{icon("verified-rounded", 16, "text-primary")}</span><span class="flex items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-label-l ink">{icon("star-rounded", 15, "text-[#E0A23B]")}4,9</span>{icon("chevron-right-rounded", 20, "text-on-surface-variant")}', "#seller")}
    <h1 class="mt-4 text-[28px] font-semibold leading-[34px] tighter ink">{escape(TITLE)}</h1>
    <p class="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-body-s text-on-surface-variant">{facts}</p>
    <div class="mt-5 flex items-end justify-between">
      <p class="num text-[44px] font-semibold leading-[48px] tighter ink">{PRICE[0]}<span class="ml-1 text-title-m font-medium tracking-normal text-on-surface-variant">₫</span></p>
      <button type="button" class="state grid h-11 w-11 place-items-center rounded-full bg-white text-on-surface" aria-label="Lưu tin">{icon("favorite-outline-rounded", 22)}</button>
    </div>
    <div class="mt-3 rounded-[20px] bg-white/80 p-3.5">
      <p class="flex items-center justify-between text-label-l"><span class="flex items-center gap-1 text-tertiary">{icon("auto-awesome-rounded", 15)}Ngang giá thị trường</span><span class="text-body-s text-on-surface-variant">42 tin · 30 ngày · TP.HCM</span></p>
      <div class="mt-3">{range_bar(4_900_000, 5_600_000, 5_300_000, axis=(4_500_000, 6_000_000), mark=5_200_000)}</div>
    </div>
    <div class="mt-4 grid grid-cols-2 gap-2">
      <button type="button" class="state flex h-12 items-center justify-center gap-2 rounded-full bg-[var(--ink)] text-label-l text-white">{icon("chat-outline-rounded", 19)}Nhắn tin</button>
      <button type="button" class="state flex h-12 items-center justify-center gap-2 rounded-full bg-tertiary text-label-l text-on-tertiary">{icon("sell-outline-rounded", 19)}Trả giá</button>
    </div>
    <div class="mt-3 flex flex-wrap gap-1.5">{qs}</div>
  </div>
  <div class="rounded-[24px] border line bg-white p-4">
    <div class="flex items-center gap-3">
      <span class="grid h-10 w-10 place-items-center rounded-full bg-secondary-container text-on-secondary-container">{icon("local-shipping-outline-rounded", 20)}</span>
      <div class="flex-1"><p class="text-title-s ink">COD, xem hàng trước</p><p class="text-body-s text-on-surface-variant">Gửi từ Bình Thạnh · tới bạn 1–2 ngày</p></div>
    </div>
    <div class="mt-3">{j_map([(62, 38, "Tuấn Kiệt", True)], (28, 72), 150, route=((28, 72), (62, 38), where("2,1 km", "Bình Thạnh")))}</div>
  </div>
  <div class="rounded-[24px] border line bg-white p-4">
    <div class="flex items-center gap-3">
      <img src="{img(SELLER["photo"], 160, 160)}" alt="" class="h-11 w-11 rounded-full object-cover">
      <div class="min-w-0 flex-1"><p class="flex items-center gap-1 text-title-s ink">{SELLER["name"]}{icon("verified-rounded", 16, "text-primary")}</p><p class="text-body-s text-on-surface-variant">Bậc Xuất sắc · tham gia 2023</p></div>
      {a("seller-page", "state flex h-9 items-center rounded-full border line px-3.5 text-label-m ink", "14 tin khác")}
    </div>
    <div class="mt-3 grid grid-cols-3 gap-2">{stats}</div>
  </div>
</aside>"""
    body = f"""{header(active=0)}
<main class="mx-auto max-w-[1360px] px-8">
  {crumbs("Khám phá", "Điện thoại", "iPhone 13 Pro", tail=share, cls="pt-4")}
  <div class="mt-3 grid grid-cols-[1fr_420px] gap-8">
    <div class="min-w-0">
      <div class="rounded-[28px] border line bg-white p-2">
        <div class="relative overflow-hidden rounded-[22px]" style="aspect-ratio: 16 / 10.5">
          <img src="{PHOTOS[0]}" alt="{escape(TITLE)}" class="h-full w-full object-cover">
          <span class="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1.5 text-label-m text-white backdrop-blur">{icon("photo-camera-outline-rounded", 15)}Cả {n} ảnh chụp trong app</span>
          <button type="button" class="state absolute bottom-3 right-3 flex h-9 items-center gap-1.5 rounded-full bg-white/85 px-3.5 text-label-l ink backdrop-blur">{icon("fullscreen-rounded", 18)}Xem {n} ảnh</button>
        </div>
        <div class="mt-2 grid grid-cols-5 gap-2">{thumbs}</div>
      </div>
      <div class="mt-4 flex flex-col gap-4">
        {panel(f'''<p class="flex flex-wrap items-center gap-x-2.5 gap-y-1"><span class="inline-flex items-center gap-1.5 rounded-full bg-secondary-container px-3 py-1 text-label-l text-on-secondary-container">{icon("check-circle-outline-rounded", 16)}Như mới</span>
          <span class="text-body-s text-on-surface-variant">{GRADE["Như mới"]}</span></p>
          <div class="mt-4 flex max-w-[680px] flex-col gap-3"><p class="text-body-l ink">{DESCRIPTION}</p></div>''')}
        {panel(f'<p class="text-title-s ink">Thông số</p><dl class="mt-3 grid grid-cols-4 gap-2">{specs}</dl>')}
      </div>
    </div>
    {buy}
  </div>

  <section class="mt-10">
    {section_title("Tin tương tự", "Xem tất cả", "similar-all")}
    <div class="mt-4 grid grid-cols-5 gap-4">{similar}</div>
  </section>
</main>
{footer()}"""
    return page("Chi tiết tin · ShopNexus", body)


# ------------------------------------------------------------------ seller --
def seller():
    facts = "".join(f'<span class="flex items-center gap-1.5">{icon(ic, 16, "text-on-surface-variant")}{t}</span>' for ic, t in [
        ("location-on-outline-rounded", f"{SELLER['area']}, TP.HCM"), ("calendar-month-outline-rounded", f"Tham gia {SELLER['joined']}"),
        ("verified-user-outline-rounded", "Đã xác minh SĐT · CCCD")])
    stats = "".join(f'<div class="px-5 {"border-l line" if i else ""}"><p class="num text-[34px] font-semibold leading-10 tighter ink">{v}<span class="text-title-m font-medium tracking-normal text-on-surface-variant">{u}</span></p><p class="text-body-s text-on-surface-variant">{l}</p></div>'
                    for i, (v, u, l) in enumerate([("4,9", "/5", "32 đánh giá"), ("14", "", "đã bán"), ("10", " phút", "trả lời tin"), ("0", "", "đơn đã hủy")]))
    tier = "".join(f'<li class="flex items-center gap-3 py-2.5 text-body-m ink {"border-t line" if i else ""}">{icon(ic, 18, "text-on-surface-variant")}{t}</li>'
                   for i, (ic, t) in enumerate([("handshake-outline-rounded", "14 giao dịch xong"), ("cancel-outline-rounded", "Chưa hủy đơn nào"),
                                                ("block-rounded", "0/9 đơn COD bị từ chối nhận"), ("report-outline-rounded", "1 ghi nhận sự cố · đã tự hoàn"),
                                                ("verified-user-outline-rounded", "CCCD gắn chip"), ("schedule-outline-rounded", "Trả lời trong khoảng 10 phút")]))
    cats = "".join(f'<button type="button" class="state h-9 rounded-full px-3.5 text-label-l {"bg-[var(--ink)] text-white" if i == 0 else "border line bg-white/70 text-on-surface-variant"}">{t}</button>'
                   for i, t in enumerate(["Tất cả · 6", "Điện thoại", "Âm thanh", "Gia dụng", "Xe đạp"]))
    cards = "".join(card(it, i) for i, it in enumerate(SELLING))
    praise = "".join(f'<span class="flex items-center gap-1 rounded-full bg-secondary-container px-3 py-1 text-label-m text-on-secondary-container">{p}<b class="num font-semibold">{n}</b></span>'
                     for p, n in [("Đúng mô tả", "21"), ("Hẹn giờ đúng", "14"), ("Gói hàng kỹ", "9")])
    reviews = "".join(f"""<li class="flex gap-3 py-4 {"border-t line" if i else ""}">
  <img src="{img(p, 80, 80)}" alt="" class="h-10 w-10 rounded-full object-cover">
  <div class="min-w-0 flex-1">
    <div class="flex items-center gap-2"><span class="text-title-s ink">{nm}</span><span class="flex">{stars(st, 14)}</span><span class="text-body-s text-on-surface-variant">{ago}</span>
      <span class="ml-auto flex items-center gap-1.5 rounded-full bg-surface-container-low py-0.5 pl-0.5 pr-2.5 text-body-s text-on-surface-variant"><img src="{img(item, 48, 48)}" alt="" class="h-5 w-5 rounded-full object-cover">Đã mua {item_name}</span></div>
    <p class="mt-1 text-body-m ink">{t}</p>
  </div>
</li>""" for i, (nm, p, st, ago, t, item, item_name) in enumerate(REVIEWS))
    bars = "".join(f'<div class="flex items-center gap-2 text-body-s text-on-surface-variant"><span class="w-3">{s}</span><span class="h-1.5 flex-1 rounded-full bg-surface-container-high"><span class="block h-full rounded-full bg-primary" style="width:{w}%"></span></span><span class="num w-5 text-right">{c}</span></div>'
                   for s, w, c in [(5, 88, 28), (4, 9, 3), (3, 3, 1), (2, 0, 0), (1, 0, 0)])
    menu = f"""<span class="relative">
      <button type="button" class="state grid h-10 w-10 place-items-center rounded-full border line bg-white text-on-surface-variant" aria-label="Tùy chọn khác" aria-expanded="false">{icon("more-vert", 19)}</button>
    </span>"""
    body = f"""{header(active=None)}
<main class="mx-auto max-w-[1360px] px-8">
  {crumbs("Khám phá", "Người bán", cls="pt-4")}
  <section class="mt-4 flex items-end justify-between gap-8">
    <div class="flex items-center gap-6">
      <div class="relative shrink-0">
        <img src="{img(SELLER["photo"], 256, 256)}" alt="{SELLER['name']}" class="h-28 w-28 rounded-full object-cover ring-4 ring-white">
        <img src="{ART["tier_top"]}" alt="" class="absolute -bottom-1 -right-2 h-11 w-11">
      </div>
      <div>
        <h1 class="flex items-center gap-2 text-[48px] font-semibold leading-[52px] tighter ink">{SELLER['name']}{icon("verified-rounded", 30, "text-primary")}</h1>
        <div class="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-body-m text-on-surface-variant">
          <button type="button" class="state glass glass-edge flex h-8 items-center gap-1.5 rounded-full pl-1 pr-2.5 text-label-l ink"><img src="{ART["tier_top"]}" alt="" class="h-6 w-6">Xuất sắc{icon("chevron-right-rounded", 16, "text-on-surface-variant")}</button>{facts}</div>
        <div class="mt-4 flex items-center gap-2">
          <button type="button" class="state flex h-10 items-center gap-1.5 rounded-full bg-[var(--ink)] pl-3.5 pr-4 text-label-l text-white">{icon("person-add-outline-rounded", 18)}Theo dõi</button>
          <button type="button" class="state flex h-10 items-center gap-1.5 rounded-full border line bg-white pl-3.5 pr-4 text-label-l ink">{icon("chat-outline-rounded", 18)}Nhắn tin</button>
          <button type="button" class="state grid h-10 w-10 place-items-center rounded-full border line bg-white text-on-surface-variant" aria-label="Chia sẻ">{icon("share-outline-rounded", 18)}</button>
          {menu}
        </div>
      </div>
    </div>
    <div class="glass glass-edge soft grid shrink-0 grid-cols-4 rounded-[28px] py-5">{stats}</div>
  </section>

  <div class="mt-8 grid grid-cols-[1fr_340px] gap-8">
    <div class="min-w-0">
      <div class="glass glass-edge soft sticky top-[76px] z-20 flex items-center gap-2 rounded-full py-1 pl-1 pr-1.5">
        {seg(["Đang bán 6", "Đánh giá 32"], 0, "bg-black/[.04]")}
        <span class="mx-1 h-5 border-l border-black/10"></span>{cats}<span class="flex-1"></span>{drop("Mới đăng")}
      </div>
      <div class="mt-4 grid grid-cols-3 gap-4">{cards}</div>

    </div>

    <aside class="sticky top-[84px] flex flex-col gap-4 self-start">
      {panel(f'''<div class="flex items-center gap-3"><img src="{ART["tier_top"]}" alt="" class="h-12 w-12">
          <div><p class="text-title-m font-semibold ink">Bậc Xuất sắc</p><p class="flex items-center gap-1 text-body-s text-on-surface-variant">{icon("history-rounded", 14)}Tính từ 12 tháng gần nhất</p></div></div>
        <ul class="mt-2">{tier}</ul>''', "px-5 pb-2 pt-5")}
      <div class="rounded-[24px] border line bg-white p-2">
        {j_map([(56, 44, SELLER["area"], True)], (30, 72), 200, route=((30, 72), (56, 44), where("2,1 km", SELLER["area"])))}
        <div class="flex flex-col gap-1.5 px-3 pb-2 pt-3">
          <p class="flex items-center gap-2 text-title-s ink">{icon("local-shipping-outline-rounded", 18, "text-primary")}Gửi COD từ {SELLER['area']}</p>
        </div>
      </div>
    </aside>
  </div>
  <section class="mt-10">
        {section_title("Người mua nói gì", "Xem cả 32 đánh giá", "all-reviews")}
        <div class="mt-4 grid grid-cols-[240px_1fr] gap-6 rounded-[24px] border line bg-white p-5">
          <div>
            <p class="num text-[52px] font-semibold leading-[56px] tighter ink">4,9<span class="text-title-l font-medium tracking-normal text-on-surface-variant">/5</span></p>
            <p class="mt-1 flex">{stars(5, 18)}</p>
            <div class="mt-4 flex flex-col gap-1.5">{bars}</div>
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-2"><span class="flex items-center gap-1 text-label-m text-on-surface-variant">{icon("auto-awesome-rounded", 14, "text-primary")}Hay được khen</span>{praise}</div>
            <ul class="mt-1">{reviews}</ul>
          </div>
        </div>
      </section>
</main>
{footer()}"""
    return page("Người bán · Tuấn Kiệt", body)


# --------------------------------------------------------------------- map --
def map_row(item, i):
    photo, p, ttl, cond, km, area, rating, note = item
    note_html = f'<span class="flex items-center gap-1 text-label-m text-tertiary">{icon("auto-awesome-rounded", 13)}{note}</span>' if note else ""
    return f"""<article class="flex gap-3 rounded-[18px] p-2 {"bg-white shadow-sm ring-1 ring-primary/30" if i == 0 else "hover:bg-white/70"}">
  <img src="{img(photo, 200, 200)}" alt="{escape(ttl)}" class="h-[72px] w-[72px] shrink-0 rounded-[14px] object-cover">
  <div class="min-w-0 flex-1">
    <div class="flex items-baseline justify-between gap-2">{price(p, "text-[16px] leading-5")}{note_html}</div>
    <h3 class="truncate text-body-m ink">{escape(ttl)}</h3>
    <p class="mt-0.5 flex items-center gap-1 text-body-s text-on-surface-variant">{icon("near-me-outline-rounded", 12)}{cond} · {where(km, area)} · {icon("star-rounded", 12, "text-[#E0A23B]")}{rating}</p>
  </div>
</article>"""


def map_page():
    pins = [(45, 42, "5,2 tr", True), (33, 58, "2,3 tr", False), (49, 33, "4,8 tr", False), (26, 40, "450 k", False), (55, 52, "1,7 tr", False), (37, 28, "11,5 tr", False)]
    pin_html = "".join(
        f'<span class="absolute -translate-x-1/2 -translate-y-full" style="left:{x}%;top:{y}%"><span class="num flex items-center rounded-full px-3 py-1.5 text-label-l shadow-[0_6px_16px_-6px_rgb(0_0_0/.35)] {"scale-110 bg-[var(--ink)] text-white" if sel else "bg-white ink"}">{p}</span>'
        f'<span class="mx-auto block h-2 w-2 -translate-y-1 rotate-45 {"bg-[var(--ink)]" if sel else "bg-white"}"></span></span>'
        for x, y, p, sel in pins)
    clusters = [(18, 34, "38", "Phú Nhuận"), (56, 20, "64", "Q.3"), (58, 74, "27", "Q.1"), (12, 72, "19", "Gò Vấp")]
    cluster_html = "".join(
        f'<span class="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style="left:{x}%;top:{y}%"><span class="num grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-[#066A61] to-[#5CC2B4] text-title-s text-white ring-4 ring-white/80">{n}</span>'
        f'<span class="glass mt-1 rounded-full px-2 text-label-m ink">{label}</span></span>'
        for x, y, n, label in clusters)
    labels = "".join(f'<span class="absolute text-label-m tracking-[0.2em] text-secondary" style="left:{x}%;top:{y}%">{t}</span>' for x, y, t in [(42, 66, "BÌNH THẠNH"), (70, 88, "SÔNG SÀI GÒN"), (3, 31, "ĐIỆN BIÊN PHỦ")])
    chips = "".join(f'<button type="button" class="state flex h-9 items-center rounded-full px-3.5 text-label-l {"bg-[var(--ink)] text-white" if i == 0 else "glass glass-edge ink"}">{t}</button>'
                    for i, t in enumerate(["Tất cả", "Điện thoại", "Xe đạp", "Nội thất", "Dưới 2 triệu", "Như mới"]))
    rows = "".join(map_row(it, i) for i, it in enumerate(IN_VIEW))
    areas = [("Bình Thạnh", "812", "64", ["Điện thoại", "Xe đạp", "Nội thất"], True, [4, 6, 5, 8, 7, 10, 12]),
             ("Phú Nhuận", "438", "31", ["Thời trang", "Máy ảnh"], False, [5, 4, 6, 5, 7, 6, 8]),
             ("Q.1", "1.204", "97", ["Điện thoại", "Máy tính"], False, [7, 8, 7, 10, 9, 12, 14]),
             ("Thủ Đức", "967", "58", ["Máy tính", "Đồ cho bé"], False, [3, 5, 6, 6, 8, 9, 9])]

    def spark(vals):
        mx = max(vals)
        return "".join(f'<span class="flex-1 rounded-full {"bg-primary" if j == len(vals) - 1 else "bg-primary/25"}" style="height:{v / mx * 100:.0f}%"></span>' for j, v in enumerate(vals))
    area_html = "".join(f"""<a id="area-{i}" href="#area-{i}" class="card flex flex-col rounded-[24px] border line {"bg-secondary-container/60" if mine else "bg-white"} p-5">
  <div class="flex items-start justify-between"><p class="text-title-l font-semibold tight ink">{n}</p>{'<span class="rounded-full bg-white px-2.5 py-0.5 text-label-m text-primary">Bạn ở đây</span>' if mine else ""}</div>
  <div class="mt-4 flex items-end justify-between gap-4">
    <p><span class="num text-[30px] font-semibold leading-8 tighter ink">{c}</span><span class="text-body-s text-on-surface-variant"> món</span><br><span class="text-body-s text-on-surface-variant"><b class="num font-semibold text-primary">+{new}</b> mới hôm nay</span></p>
    <div class="flex h-12 w-24 items-end gap-1" aria-hidden="true">{spark(sp)}</div>
  </div>
  <div class="mt-3 flex flex-wrap gap-1.5">{"".join(f'<span class="rounded-full bg-white/80 px-2.5 py-0.5 text-label-m text-on-surface-variant ring-1 ring-black/5">{t}</span>' for t in tops)}</div>
</a>""" for i, (n, c, new, tops, mine, sp) in enumerate(areas))
    ctrl = "glass glass-edge soft"
    body = f"""{header(active=None)}
<main class="mx-auto max-w-[1360px] px-8">
  <section class="relative mt-4 h-[720px] overflow-hidden rounded-[28px] border line">
    {big_map()}
    {labels}
    <span class="absolute h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-primary/60 bg-primary/[.06]" style="left:38%;top:46%"></span>
    {cluster_html}
    {pin_html}
    <span class="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white bg-primary shadow-[0_0_0_10px_rgb(6_106_97/.18)]" style="left:38%;top:46%"></span>

    <div class="absolute left-5 right-[444px] top-5">
      <div class="flex h-14 items-center gap-3 rounded-full bg-white pl-5 pr-2 glow">
        {icon("search-rounded", 22, "text-primary")}<span class="flex-1 text-body-l text-on-surface-variant">Tìm quanh đây, hoặc gõ cả câu</span>
        <button type="button" class="state grid h-10 w-10 place-items-center rounded-full text-on-surface-variant" aria-label="Tìm bằng ảnh">{icon("photo-camera-outline-rounded", 20)}</button>
        <button type="button" class="state h-10 rounded-full bg-primary px-6 text-label-l text-on-primary">Tìm</button>
      </div>
      <div class="mt-3 flex flex-wrap gap-2">{chips}</div>
    </div>

    <div class="{ctrl} absolute bottom-5 left-5 flex items-center gap-3 rounded-full py-1 pl-4 pr-1">
      <span class="text-label-l ink">Bán kính</span>{seg(["1 km", "3 km", "5 km", "10 km"], 1, "bg-black/[.05]")}
    </div>
    <div class="absolute bottom-5 right-[444px] flex flex-col gap-2">
      <button type="button" class="state {ctrl} grid h-11 w-11 place-items-center rounded-full ink" aria-label="Về vị trí của bạn">{icon("my-location-rounded", 20)}</button>
      <div class="{ctrl} flex flex-col overflow-hidden rounded-full">
        <button type="button" class="state grid h-11 w-11 place-items-center ink" aria-label="Phóng to">{icon("add-rounded", 20)}</button>
        <button type="button" class="state grid h-11 w-11 place-items-center border-t border-black/5 ink" aria-label="Thu nhỏ">{icon("remove-rounded", 20)}</button>
      </div>
    </div>

    <aside class="{ctrl} absolute bottom-5 right-5 top-5 flex w-[404px] flex-col rounded-[24px] p-3">
      <div class="flex items-center justify-between px-2 pt-1">
        <div><h1 class="text-title-l font-semibold tight ink"><span class="ink num">146</span> món trong 3 km</h1><p class="text-body-s text-on-surface-variant">quanh Bình Thạnh · gần nhất trước</p></div>
        <button type="button" class="state grid h-9 w-9 place-items-center rounded-full text-on-surface-variant" aria-label="Sắp xếp">{icon("swap-vert-rounded", 20)}</button>
      </div>
      <div class="no-scrollbar mt-2 flex flex-1 flex-col gap-1 overflow-hidden">{rows}</div>
      {a("list-all", "state mt-2 flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--ink)] text-label-l text-white", icon("view-list-outline-rounded", 18) + "Xem dạng danh sách")}
    </aside>
  </section>

  <section class="mt-10">
    {section_title("Khu vực đang sôi động", "Tất cả khu vực", "areas-all")}
    <div class="mt-4 grid grid-cols-4 gap-4">{area_html}</div>
  </section>
</main>
{footer()}"""
    return page("Bản đồ · ShopNexus", body)


# -------------------------------------------------- discovery: shared bits --
# ------------------------------------------------------------ Danh mục index --
# name, icon, photo, count, new today, subcategories with counts (they add up to the count)
CATEGORY_INDEX = [
    ("Điện thoại", "mobile-outline-rounded", "1632661674596-df8be070a5c5", "3.412", "218",
     [("iPhone", "1.986"), ("Samsung", "742"), ("Xiaomi", "268"), ("OPPO", "171"), ("Khác", "245")]),
    ("Máy tính", "laptop-chromebook-outline-rounded", "1611186871348-b1ce696e52c9", "2.108", "131",
     [("Văn phòng", "518"), ("MacBook", "402"), ("Máy tính bảng", "312"), ("Linh kiện", "289"), ("Laptop gaming", "233"), ("PC", "178"), ("Màn hình", "176")]),
    ("Thời trang", "apparel-outline-rounded", "1593030761757-71fae45fa0e7", "5.870", "402",
     [("Nữ", "2.460"), ("Nam", "1.830"), ("Giày", "744"), ("Túi xách", "391"), ("Phụ kiện", "287"), ("Đồng hồ", "158")]),
    ("Xe máy", "two-wheeler-outline-rounded", "1558981403-c5f9899a28bc", "1.530", "87",
     [("Tay ga", "634"), ("Xe số", "512"), ("Côn tay", "214"), ("Phụ tùng", "170")]),
    ("Xe đạp", "pedal-bike-outline-rounded", "1507035895480-2b3156c31fc8", "964", "64",
     [("Thể thao", "286"), ("Fixed gear", "204"), ("Trẻ em", "190"), ("Xe đạp điện", "168"), ("Phụ tùng", "116")]),
    ("Nội thất", "chair-outline-rounded", "1555041469-a586c61ea9bc", "1.247", "73",
     [("Bàn", "428"), ("Sofa", "312"), ("Tủ, kệ", "274"), ("Giường", "156"), ("Đèn", "77")]),
    ("Đồ gia dụng", "blender-outline-rounded", "1585515320310-259814833e62", "2.301", "156",
     [("Đồ dùng nhỏ", "1.000"), ("Nhà bếp", "690"), ("Quạt", "210"), ("Tủ lạnh", "162"), ("Máy giặt", "141"), ("Điều hòa", "98")]),
    ("Mẹ và bé", "child-care-outline-rounded", "1515488042361-ee00e0ddd4e4", "1.328", "95",
     [("Quần áo bé", "612"), ("Đồ chơi", "455"), ("Xe đẩy", "187"), ("Ghế ăn", "74")]),
    ("Âm thanh", "headphones-outline-rounded", "1505740420928-5e560c06d30e", "912", "48",
     [("Tai nghe", "438"), ("Loa", "276"), ("Ampli", "110"), ("Đĩa than, cassette", "88")]),
    ("Máy ảnh", "photo-camera-outline-rounded", "1516035069371-29a1b244cc32", "688", "39",
     [("Mirrorless", "241"), ("DSLR", "156"), ("Ống kính", "133"), ("Máy film", "96"), ("Phụ kiện", "62")]),
    ("Thể thao", "sports-tennis-outline-rounded", "1554068865-24cecd4e34b8", "944", "52",
     [("Gym", "336"), ("Cầu lông, tennis", "289"), ("Bóng đá", "198"), ("Cắm trại", "121")]),
]


def category_tile(c, i):
    name, ic, photo, count, new, subs = c
    chips = "".join(a(f"sub-{i}-{j}", "flex h-7 items-center gap-1 rounded-full bg-surface-container-low px-2.5 text-label-m ink hover:bg-secondary-container",
                      f'{t}<span class="num text-label-s text-on-surface-variant">{n}</span>') for j, (t, n) in enumerate(subs[:4]))
    if len(subs) > 4:
        chips += a(f"sub-{i}-more", "flex h-7 items-center rounded-full px-2 text-label-m text-primary hover:underline", f"+{len(subs) - 4} mục")
    return f"""<article class="card flex flex-col rounded-[24px] border line bg-white p-2">
  {a(f"cat-{i}", "flex items-center gap-3 rounded-[18px] p-1.5 pr-2 hover:bg-surface-container-low",
     f'<img src="{img(photo, 160, 160)}" alt="" class="h-16 w-16 shrink-0 rounded-[16px] object-cover">'
     f'<span class="min-w-0 flex-1"><span class="flex items-center gap-1.5 text-title-m font-semibold tight ink">{icon(ic, 18, "text-primary")}{name}</span>'
     f'<span class="mt-0.5 block text-body-s text-on-surface-variant"><b class="num font-semibold ink">{count}</b> món · <span class="text-primary">+{new} hôm nay</span></span></span>'
     + icon("arrow-forward-rounded", 18, "text-on-surface-variant"))}
  <div class="flex flex-wrap gap-1 px-1.5 pb-1.5 pt-1">{chips}</div>
</article>"""


def categories():
    popular = [("iPhone", "1.986"), ("Xe đạp", "964"), ("Sofa", "312"), ("Giày", "744"), ("MacBook", "402"), ("Tai nghe", "438"), ("Xe đẩy", "187"), ("Máy film", "96")]
    pop = "".join(a(f"pop-{i}", "glass glass-edge flex h-9 items-center gap-1.5 rounded-full px-3 text-label-l ink hover:bg-white",
                    f'{t}<span class="num text-label-s text-on-surface-variant">{n}</span>') for i, (t, n) in enumerate(popular))
    tiles = "".join(category_tile(c, i) for i, c in enumerate(CATEGORY_INDEX))
    other = f"""<article class="flex flex-col justify-between rounded-[24px] bg-gradient-to-br from-[#066A61] to-[#0E8A7D] p-5 text-white">
  <div><p class="text-title-m font-semibold tight">Không chắc thuộc mục nào?</p>
    <p class="mt-1 text-body-s text-white/80">Gõ một câu, hoặc chụp món đồ.</p></div>
  <div class="mt-4 flex gap-2">
    {a("cat-ask", "state flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-white text-label-l text-primary", icon("search-rounded", 18) + "Tìm bằng câu")}
    {a("cat-photo", "state flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full bg-white/15 text-label-l text-white", icon("photo-camera-outline-rounded", 18) + "Bằng ảnh", "#photo-search")}
  </div>
</article>"""
    newest = [it for it in LISTINGS if it[7].endswith("phút")][:6]
    fresh = "".join(mini_row(it, i, "fresh") for i, it in enumerate(newest))
    body = f"""{header(active=1)}
<main class="mx-auto max-w-[1360px] px-8">
  {crumbs("Khám phá", "Danh mục", cls="pt-4")}
  <section class="mt-4 grid grid-cols-[1fr_520px] items-end gap-8">
    <div>
      <h1 class="text-[56px] font-semibold leading-[60px] tighter ink">Danh mục</h1>
      <p class="mt-2 text-body-l text-on-surface-variant"><b class="num font-semibold ink">11</b> danh mục · <b class="num font-semibold ink">1.904</b> món mới hôm nay</p>
    </div>
    {search_field("Tìm trong mọi danh mục: xe đẩy gấp gọn, dưới 1 triệu")}
  </section>
  <div class="mt-5 flex flex-wrap items-center gap-2"><span class="mr-1 flex items-center gap-1.5 text-label-l text-on-surface-variant">{icon("location-on-outline-rounded", 16)}Phổ biến quanh Bình Thạnh</span>{pop}</div>

  <section class="mt-6 grid grid-cols-4 gap-4">{tiles}{other}</section>

  <section class="mt-10 grid grid-cols-[1fr_340px] gap-8">
    <div>
      {section_title("Vừa đăng trong mọi danh mục", "Xem tất cả", "all-new")}
      <div class="mt-4 grid grid-cols-3 gap-3">{fresh}</div>
    </div>
    <aside class="rounded-[24px] border line bg-white p-3">{trending(5)}</aside>
  </section>
</main>
{footer()}"""
    return page("Danh mục · ShopNexus", body)


# ------------------------------------------------------------ Tìm bằng ảnh --
PHOTO_QUERY = "iPhone 13 Pro, Xanh Sierra"
SIERRA = "1632661674596-df8be070a5c5"
# Same model and colour as the photo, from other sellers (crops of the detail photos stand in for their own).
PHOTO_MATCHES = [
    (SIERRA, "5.200.000 ₫", "iPhone 13 Pro 128GB Xanh Sierra, pin 88%", "Như mới", "2,1 km", "Bình Thạnh", "4,9", ["128 GB", "Pin 88%"], "Ngang giá thị trường"),
    (SIERRA, "4.950.000 ₫", "iPhone 13 Pro 128GB Xanh, máy zin, có hộp", "Đã dùng", "3,4 km", "Phú Nhuận", "4,7", ["128 GB", "Pin 85%"], "Rẻ hơn 7%"),
    (SIERRA, "5.600.000 ₫", "iPhone 13 Pro 256GB Xanh Sierra, pin 90%", "Như mới", "4,8 km", "Q.3", "4,8", ["256 GB", "Pin 90%"], None),
    (SIERRA, "5.050.000 ₫", "iPhone 13 Pro 128GB, mặt lưng xanh, trầy nhẹ viền", "Đã dùng", "1,6 km", "Bình Thạnh", "4,6", ["128 GB", "Pin 84%"], None),
    (SIERRA, "5.350.000 ₫", "iPhone 13 Pro 128GB Xanh Sierra, đủ hộp sạc", "Như mới", "5,2 km", "Gò Vấp", "4,8", ["128 GB", "Pin 92%"], None),
    (SIERRA, "4.800.000 ₫", "iPhone 13 Pro 128GB, thay pin chính hãng", "Đã dùng", "6,0 km", "Q.10", "4,5", ["128 GB", "Pin 100%"], "Rẻ hơn 9%"),
    (SIERRA, "5.900.000 ₫", "iPhone 13 Pro 256GB Xanh, bảo hành 3 tháng", "Như mới", "7,4 km", "Thủ Đức", "4,9", ["256 GB", "Pin 89%"], None),
    (SIERRA, "5.150.000 ₫", "iPhone 13 Pro 128GB, ốp lưng sẵn, máy đẹp", "Như mới", "8,1 km", "Tân Bình", "4,7", ["128 GB", "Pin 87%"], None),
]
# Each other seller's photo is a different crop of the same shot (focus x, focus y, zoom).
MATCH_CROPS = [None, (0.48, 0.42, 2.2), (0.52, 0.5, 1.5), (0.6, 0.56, 2.6), (0.45, 0.6, 1.8), (0.55, 0.4, 3.0), (0.5, 0.55, 1.25), (0.42, 0.48, 2.0)]
PHOTO_SIMILAR = [p for p in PHONES if "13 Pro" not in p[2]][:4]


def match_card(i, start=0, saved=False):
    """card() for PHOTO_MATCHES[i], with its own crop of the shared photo."""
    html = card(PHOTO_MATCHES[i], start + i, saved=saved)
    if MATCH_CROPS[i]:
        fx, fy, z = MATCH_CROPS[i]
        html = html.replace(img(SIERRA, 480, 480), crop(SIERRA, 480, fx, fy, z), 1)
    return html


def photo_search():
    bar = (ai_chip("iPhone 13 Pro") + ai_chip("Xanh Sierra") + ai_chip("Điện thoại")
           + '<span class="mx-1 h-5 border-l border-black/10"></span>'
           + drop("Dung lượng") + drop("Tình trạng") + drop("Trong 10 km", on=True) + drop("Trả giá được"))
    recent = "".join(f'<button type="button" class="state overflow-hidden rounded-[14px] {"ring-2 ring-primary ring-offset-2" if i == 0 else ""}">'
                     f'<img src="{img(p, 120, 120)}" alt="" class="aspect-square w-full object-cover"></button>'
                     for i, p in enumerate([SIERRA, "1505740420928-5e560c06d30e", "1507035895480-2b3156c31fc8", "1555041469-a586c61ea9bc"]))
    lo, hi, med, n = MODELS[0][1:]
    side = f"""<aside class="sticky top-[84px] flex flex-col gap-3 self-start">
  <div class="rounded-[28px] border line bg-white p-2">
    <div class="relative overflow-hidden rounded-[22px]" style="aspect-ratio: 1 / 1">
      <img src="{img(SIERRA, 640, 640)}" alt="Ảnh bạn tải lên" class="h-full w-full object-cover">
      <span class="absolute rounded-[18px] border-2 border-white shadow-[0_0_0_999px_rgb(0_0_0/.28)]" style="left:24%;top:14%;width:52%;height:74%"></span>
      <span class="absolute bottom-3 left-3 rounded-full bg-white/90 px-2.5 py-1 text-label-m ink backdrop-blur">Ảnh của bạn</span>
    </div>
    <div class="flex items-center gap-2 p-2">
      {btn("Đổi ảnh", "upload-rounded", "line", "flex-1")}
      {btn("Chụp", "photo-camera-outline-rounded", "line", "flex-1")}
    </div>
    <p class="px-2 pb-2 text-body-s text-on-surface-variant">Kéo ảnh khác vào trang, hoặc dán ảnh bằng Ctrl+V.</p>
  </div>
  <div class="rounded-[24px] border line bg-white p-4">
    <p class="text-label-m text-on-surface-variant">Ảnh gần đây</p>
    <div class="mt-2 grid grid-cols-4 gap-2">{recent}</div>
  </div>
</aside>"""
    grid = "".join(match_card(i, saved=i == 0) for i in range(len(PHOTO_MATCHES)))
    similar = "".join(card(it, i + 8) for i, it in enumerate(PHOTO_SIMILAR))
    body = f"""{header(active=0, search=PHOTO_QUERY, photo=SIERRA)}
<div class="mx-auto max-w-[1360px] px-8">
  <div class="flex items-center gap-2 pt-4">{bar}<span class="flex-1"></span>{a("reset", "text-label-l text-primary hover:underline", "Xóa lọc")}</div>
</div>
<main class="mx-auto mt-6 grid max-w-[1360px] grid-cols-[320px_1fr] gap-8 px-8">
  {side}
  <section>
    <div class="flex items-end justify-between gap-6">
      <div>
        <h1 class="flex items-center gap-3 text-[40px] font-semibold leading-[44px] tighter ink"><span class="ink num">36</span> tin giống ảnh</h1>
        <p class="mt-1.5 text-body-m text-on-surface-variant">Trong 10 km quanh Bình Thạnh · cùng đời máy và màu</p>
      </div>
      <div class="w-[340px] rounded-[20px] border line bg-white px-4 py-3">
        <div class="flex items-baseline justify-between"><span class="flex items-center gap-1.5 text-label-m text-on-surface-variant">{icon("auto-awesome-rounded", 14, "text-primary")}Giá tham khảo · {n} tin</span>
          <span class="num text-title-s font-semibold ink">{tr(lo)} – {tr(hi)} tr ₫</span></div>
        <div class="mt-2">{range_bar(lo, hi, med, labels=False)}</div>
      </div>
    </div>
    <div class="glass glass-edge soft sticky top-[76px] z-20 mt-5 flex items-center justify-between rounded-full py-1 pl-1 pr-1.5">
      {seg(["Giống ảnh nhất", "Rẻ hơn", "Gần hơn", "Mới đăng"], 0, "bg-black/[.04]")}
      <span class="pr-2 text-body-s text-on-surface-variant">1–8 trong 36</span>
    </div>
    <div class="mt-4 grid grid-cols-4 gap-4">{grid}</div>
    <div class="mt-8">{section_title("Cùng hãng, đời khác", "Xem 214 tin", "more-iphone")}</div>
    <div class="mt-4 grid grid-cols-4 gap-4">{similar}</div>
  </section>
</main>
{footer()}"""
    return page("Tìm bằng ảnh · ShopNexus", body)


# --------------------------------------------------------------------- 404 --
SOLD = PHONES[1]


def not_found():
    similar = "".join(match_card(i) for i in (1, 2, 4, 5))
    near = [it for it in LISTINGS if it[7].endswith("phút")][:4]
    near_html = "".join(card(it, i + 4) for i, it in enumerate(near))
    sold_num, sold_unit = split_price(SOLD[1])
    body = f"""{header(active=None)}
<main class="mx-auto max-w-[1360px] px-8">
  <section class="grid grid-cols-[1fr_400px] items-center gap-10 pt-12">
    <div>
      <p class="glass glass-edge flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-label-m ink">{icon("link-off-rounded", 15, "text-primary")}Lỗi 404</p>
      <h1 class="mt-4 text-[52px] font-semibold leading-[58px] tighter ink">Tin này đã bán.</h1>
      <p class="mt-2 max-w-[560px] text-body-l text-on-surface-variant">Người bán đã đánh dấu đã bán lúc 14:20 hôm nay. Có 4 máy giống vậy đang bán quanh Bình Thạnh.</p>
      {search_field("iPhone 13 Pro 128GB, Xanh Sierra", "mt-6 max-w-[720px]", photo=SIERRA)}
      <p class="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-s text-on-surface-variant">Link sai hoặc cũ?
        {a("go-home", "text-label-l text-primary hover:underline", "Về Khám phá")}{a("go-cats", "text-label-l text-primary hover:underline", "Xem danh mục")}{a("go-help", "text-label-l text-primary hover:underline", "Báo link hỏng")}</p>
    </div>
    <article class="relative rounded-[28px] border line bg-white p-2">
      <div class="relative overflow-hidden rounded-[22px]" style="aspect-ratio: 4 / 3">
        <img src="{img(SOLD[0], 800, 600)}" alt="" class="h-full w-full object-cover grayscale-[.6] opacity-70">
        <span class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-6 rounded-[14px] border-2 border-white bg-[var(--ink)]/80 px-5 py-2 text-title-l font-semibold tracking-wide text-white backdrop-blur">ĐÃ BÁN</span>
      </div>
      <div class="flex items-center justify-between gap-3 px-3 py-3">
        <div class="min-w-0"><p class="truncate text-body-l text-on-surface-variant line-through decoration-1">{escape(SOLD[2])}</p>
          <p class="text-body-s text-on-surface-variant">Tuấn Kiệt · {SOLD[5]}</p></div>
        <span class="num whitespace-nowrap text-[20px] font-semibold tight text-on-surface-variant">{sold_num}<span class="ml-0.5 text-body-s">{sold_unit.strip()}</span></span>
      </div>
      <div class="mx-1 mb-1 flex items-center justify-between rounded-[18px] bg-secondary-container px-3 py-2.5 text-on-secondary-container">
        <span class="text-body-m">Báo khi người này đăng máy mới</span>{switch(False)}
      </div>
    </article>
  </section>

  <section class="mt-12">
    {section_title("Giống tin này, còn bán", "Xem 36 tin", "more-like")}
    <div class="mt-4 grid grid-cols-4 gap-4">{similar}</div>
  </section>
  <section class="mt-10">
    {section_title("Vừa đăng quanh bạn", "Xem tất cả", "more-near")}
    <div class="mt-4 grid grid-cols-4 gap-4">{near_html}</div>
  </section>
</main>
{footer()}"""
    return page("Tin đã bán · ShopNexus", body)


# ---------------------------------------------------- Tìm kiếm, no results --
EMPTY_QUERY = "iPhone 13 Pro Max 512GB dưới 8 triệu ở Q.7"


def search_empty():
    bar = (ai_chip("iPhone 13 Pro Max") + ai_chip("512 GB") + ai_chip("Dưới 8 triệu") + ai_chip("Q.7")
           + '<span class="mx-1 h-5 border-l border-black/10"></span>' + drop("Tình trạng") + drop("Trả giá được"))
    loosen = [("Bỏ “512 GB”", "256 GB trở lên", "6", "memory-rounded"), ("Đến 12 triệu", "giá giữa 11,4 tr cho 512 GB", "18", "payments-outline-rounded"),
              ("Mọi khu vực", "gần nhất ở Q.4, 3,2 km", "4", "location-on-outline-rounded"), ("iPhone 13 Pro", "cùng đời, màn nhỏ hơn", "42", "mobile-outline-rounded")]
    loosen_html = "".join(a(f"loosen-{i}", "card flex items-center gap-3 rounded-[20px] border line bg-white p-3",
                            f'<span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary-container text-on-secondary-container">{icon(ic, 20)}</span>'
                            f'<span class="min-w-0 flex-1"><span class="block text-title-s ink">{t}</span><span class="block truncate text-body-s text-on-surface-variant">{d}</span></span>'
                            f'<span class="num shrink-0 rounded-full bg-primary px-2.5 py-1 text-label-m text-on-primary">{n} tin</span>')
                          for i, (t, d, n, ic) in enumerate(loosen))
    close = [PHONES[1], PHONES[0], PHONES[5], PHONES[3]]
    close_html = "".join(card(it, i) for i, it in enumerate(close)) + "".join(match_card(i, 4) for i in (2, 6, 1, 4))
    body = f"""{header(active=0, search=EMPTY_QUERY, photo=PHONES[0][0])}
<div class="mx-auto max-w-[1360px] px-8">
  <div class="flex items-center gap-2 pt-4">{bar}<span class="flex-1"></span>{a("reset", "text-label-l text-primary hover:underline", "Xóa lọc")}</div>
</div>
<main class="mx-auto max-w-[1360px] px-8">
  <section class="mt-6 grid grid-cols-[1fr_400px] gap-8">
    <div>
      <h1 class="flex items-center gap-3 text-[40px] font-semibold leading-[44px] tighter ink"><span class="num text-on-surface-variant">0</span> tin khớp cả 4 điều kiện</h1>
      <p class="mt-1.5 text-body-m text-on-surface-variant">iPhone 13 Pro Max 512 GB đang bán quanh 11,4 tr ₫. Bỏ một điều kiện để thấy:</p>
      <div class="mt-4 grid grid-cols-2 gap-3">{loosen_html}</div>
      <div class="mt-3 flex items-center gap-6 rounded-[20px] border line bg-white px-5 py-4">
        <div class="shrink-0"><p class="flex items-center gap-1.5 text-label-m text-on-surface-variant">{icon("auto-awesome-rounded", 14, "text-primary")}Giá tham khảo · 512 GB · 30 ngày</p>
          <p class="num mt-0.5 text-title-m font-semibold tight ink">10,6 – 12,4 tr ₫</p></div>
        <div class="flex-1">{range_bar(10600000, 12400000, 11400000, axis=(7000000, 13500000), mark=8000000)}</div>
      </div>
    </div>
    <div class="flex flex-col gap-3">
      <div class="rounded-[24px] bg-gradient-to-br from-[#066A61] to-[#0E8A7D] p-5 text-white">
        <p class="flex items-center gap-2 text-title-m font-semibold tight">{icon("notifications-outline-rounded", 20)}Báo khi có tin mới</p>
        <p class="mt-1 text-body-s text-white/80">Có máy khớp cả 4 điều kiện, ShopNexus báo bạn ngay. Tháng trước có 2 máy như vậy.</p>
        <button type="button" class="state mt-4 h-10 w-full rounded-full bg-white text-label-l text-primary">Bật báo tin</button>
      </div>
      <div class="rounded-[24px] border line bg-white p-3">{trending(3)}</div>
    </div>
  </section>

  <section class="mt-10">
    {section_title("Gần với câu này", "Xem 42 tin iPhone 13 Pro", "more-close")}
    <div class="mt-4 grid grid-cols-4 gap-4">{close_html}</div>
  </section>
</main>
{footer()}"""
    return page("Không có kết quả · ShopNexus", body)


if __name__ == "__main__":
    for name, fn in [("category", category), ("detail-c", detail), ("seller", seller), ("map", map_page),
                     ("categories", categories), ("photo-search", photo_search), ("not-found", not_found), ("search-empty", search_empty)]:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(fn())
        print("wrote", name)
