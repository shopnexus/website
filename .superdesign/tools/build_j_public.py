"""The public pages in J ("Kính mờ"): Danh mục, Chi tiết tin, Người bán and
Bản đồ. Everything shared comes from j_kit; this file only lays the pages out.
It supersedes build_pages.category, build_c.detail and build_seller_map for
these four mockups.

    python3 tools/build_j_public.py        (run from .superdesign/)
"""
import os
from html import escape

from build import DESCRIPTION, OUT, PHOTOS, PRICE, SIMILAR, SPECS, TITLE, a
from build_c import ART, CLAIMS, area_map
from build_pages import MODELS, PHONE_TIPS, PHONES, tr
from build_seller_map import IN_VIEW, REVIEWS, SELLER, SELLING, big_map
from common import MONEY, icon, img, split_price, where
from j_kit import card, crumbs, drop, footer, header, money_line, page, panel, price, section_title, seg


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
    tips = "".join(f"""<li class="flex items-start gap-3">
  <span class="num grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary-container text-label-l text-on-secondary-container">{i + 1}</span>
  <div><p class="text-title-s ink">{t}</p><p class="mt-0.5 text-body-s text-on-surface-variant">{d}</p></div>
</li>""" for i, (t, d) in enumerate(PHONE_TIPS))
    check = f"""<div class="col-span-4 grid grid-cols-[260px_1fr] items-center gap-8 rounded-[24px] border line bg-white p-5">
  <div>
    <p class="flex items-center gap-1.5 text-label-m text-primary">{icon("auto-awesome-rounded", 14)}Mẹo kiểm điện thoại · gợi ý chung</p>
    <p class="mt-1.5 text-[22px] font-semibold leading-7 tighter ink">Kiểm 4 điều này khi shipper tới cửa</p>
    <p class="mt-2 flex gap-1.5 text-body-s text-on-surface-variant">{icon("undo-rounded", 16, "mt-px shrink-0")}{MONEY["refuse"]}</p>
  </div>
  <ul class="grid grid-cols-4 gap-5">{tips}</ul>
</div>"""
    grid = "".join(card(it, i, saved=i == 1) for i, it in enumerate(items[:4])) + check + "".join(card(it, i + 4) for i, it in enumerate(items[4:8]))
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
    claims = "".join(f"""<li class="rounded-[20px] border line bg-white p-4">
  <span class="grid h-8 w-8 place-items-center rounded-full bg-secondary-container text-on-secondary-container">{icon("check-rounded", 18)}</span>
  <p class="mt-3 text-title-s ink">{c}</p><p class="mt-1 text-body-s text-on-surface-variant">{how}</p>
</li>""" for c, how in CLAIMS)
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
    <div class="mt-3 flex flex-col gap-1.5">{money_line("meet_hint", "group-outline-rounded", small=True)}{money_line("no_hold", "account-balance-outline-rounded", small=True)}</div>
  </div>
  <div class="rounded-[24px] border line bg-white p-4">
    <div class="flex items-center gap-3">
      <img src="{img(SELLER["photo"], 160, 160)}" alt="" class="h-11 w-11 rounded-full object-cover">
      <div class="min-w-0 flex-1"><p class="flex items-center gap-1 text-title-s ink">{SELLER["name"]}{icon("verified-rounded", 16, "text-primary")}</p><p class="text-body-s text-on-surface-variant">Bậc Xuất sắc · tham gia 2023</p></div>
      {a("seller-page", "state flex h-9 items-center rounded-full border line px-3.5 text-label-m ink", "14 tin khác")}
    </div>
    <div class="mt-3 grid grid-cols-3 gap-2">{stats}</div>
    <blockquote class="mt-3 rounded-[16px] bg-surface-container-low p-3"><p class="text-body-s ink">“Máy đúng như mô tả, pin còn tốt. Anh bán hẹn giờ rất đúng.”</p>
      <footer class="mt-1 flex items-center gap-2 text-body-s text-on-surface-variant"><span class="flex">{stars(5, 12)}</span>Minh Thư · 28/10/2026</footer></blockquote>
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
        {panel(f'''<div class="grid grid-cols-[260px_1fr] gap-6"><div><div class="flex items-center gap-3"><span class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#066A61] to-[#5CC2B4] text-label-m font-semibold text-white">Như<br>mới</span>
          <div><p class="text-title-s ink">Tình trạng: Như mới</p><p class="text-body-s text-on-surface-variant">Không vết, hoặc vết rất nhỏ chỉ thấy khi soi gần</p></div></div></div>
          <div class="border-l line pl-6"><p class="text-label-m text-on-surface-variant">Lời người bán</p><p class="mt-1 text-body-m ink">{DESCRIPTION}</p></div></div>''')}
        {panel(f'<p class="text-title-s ink">Thông số</p><dl class="mt-3 grid grid-cols-4 gap-2">{specs}</dl>')}
      </div>
    </div>
    {buy}
  </div>

  <section class="mt-10">
    <div class="flex items-baseline justify-between"><h2 class="text-[26px] font-semibold leading-8 tighter ink">Kiểm 4 điều này khi shipper tới cửa</h2>
      <span class="flex items-center gap-1.5 text-body-s text-on-surface-variant">{icon("auto-awesome-rounded", 14, "text-primary")}Mẹo kiểm iPhone · gợi ý chung, không phải điều {SELLER["name"]} cam kết</span></div>
    <ul class="mt-4 grid grid-cols-4 gap-4">{claims}</ul>
    <p class="mt-3 flex items-center gap-2 text-body-m ink">{icon("undo-rounded", 18, "text-primary")}{MONEY["refuse"]}</p>
  </section>

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
          {money_line("cod_buyer", "visibility-outline-rounded", small=True)}{money_line("no_hold", "account-balance-outline-rounded", small=True)}
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
    body = f"""{header(active=2)}
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
        <div><h1 class="text-title-l font-semibold tight ink"><span class="grad-num num">146</span> món trong 3 km</h1><p class="text-body-s text-on-surface-variant">quanh Bình Thạnh · gần nhất trước</p></div>
        <button type="button" class="state grid h-9 w-9 place-items-center rounded-full text-on-surface-variant" aria-label="Sắp xếp">{icon("swap-vert-rounded", 20)}</button>
      </div>
      <div class="no-scrollbar mt-2 flex flex-1 flex-col gap-1 overflow-hidden">{rows}</div>
      {a("list-all", "state mt-2 flex h-11 items-center justify-center gap-2 rounded-full bg-[var(--ink)] text-label-l text-white", icon("view-list-outline-rounded", 18) + "Xem dạng danh sách")}
    </aside>
  </section>

  <section class="mt-10">
    {section_title("Khu vực đang sôi động", "Tất cả khu vực", "areas-all")}
    <div class="mt-4 grid grid-cols-4 gap-4">{area_html}</div>
    <p class="mt-4 flex items-center gap-2 text-body-m text-on-surface-variant">{icon("group-outline-rounded", 18)}{MONEY["meet_hint"]}</p>
  </section>
</main>
{footer()}"""
    return page("Bản đồ · ShopNexus", body)


if __name__ == "__main__":
    for name, fn in [("category", category), ("detail-c", detail), ("seller", seller), ("map", map_page)]:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(fn())
        print("wrote", name)
