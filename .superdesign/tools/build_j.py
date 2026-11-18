"""Direction J, "Kính mờ": G's skeleton (flat header, one search field on /s,
dense data-filled sections) in a fresher 2026 dress: a mesh-gradient wash with
film grain at the top of the page, a translucent blurred header, generous
corners (cards 22 px, panels 24 px, pills elsewhere), soft hairline borders,
tight 600-weight display type, a sliding segmented control and a glassy sort bar.

    python3 tools/build_j.py        (run from .superdesign/)
"""
import os
from html import escape

from build import OUT, a
from build_e import FOR_YOU, RESULTS
from build_pages import EXTRA, QUERY_PHOTO, SEARCH_QUERY, SEARCH_RESULTS
from common import LISTINGS, LOGO, MONEY, head, icon, img, split_price, where
from j_kit import ME, ai_chip, card, drop, footer, header, page, price, seg, trending

# ------------------------------------------------------------------- search --
def search():
    bar = (ai_chip("Laptop") + ai_chip("Dưới 8 triệu") + ai_chip("Màn hình chuẩn màu")
           + '<span class="mx-1 h-5 border-l border-black/10"></span>'
           + drop("Tình trạng", 2) + drop("Hãng", 2) + drop("Mọi khu vực") + drop("Trả giá được"))

    def group(t, inner, last=False):
        return f'<div class="{"" if last else "border-b line"} py-4"><p class="text-title-s ink">{t}</p>{inner}</div>'

    def row(label, n, on=False):
        box = (f'<span class="grid h-[18px] w-[18px] place-items-center rounded-[6px] bg-primary text-on-primary">{icon("check-rounded", 13)}</span>' if on
               else '<span class="h-[18px] w-[18px] rounded-[6px] border-[1.5px] border-outline-variant bg-white"></span>')
        return (f'<label class="flex h-8 items-center gap-2.5 text-body-m ink">{box}<span class="flex-1">{label}</span>'
                f'<span class="num rounded-full bg-surface-container-low px-2 text-label-s text-on-surface-variant">{n}</span></label>')

    hist = [3, 5, 8, 12, 18, 26, 22, 17, 11, 7, 4, 2]
    bars = "".join(f'<span class="flex-1 rounded-full {"bg-primary" if i < 7 else "bg-outline-variant/60"}" style="height:{h * 2.6}px"></span>' for i, h in enumerate(hist))
    sidebar = f"""<aside class="sticky top-[84px] self-start rounded-[24px] border line bg-white px-5 py-1">
  {group("Giá", f'''<div class="mt-3 flex h-[70px] items-end gap-[3px]">{bars}</div>
    <div class="relative mt-2 h-1.5 rounded-full bg-surface-container-high"><span class="absolute inset-y-0 left-0 w-[58%] rounded-full bg-primary"></span>
      <span class="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-primary bg-white"></span><span class="absolute left-[58%] top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-primary bg-white"></span></div>
    <div class="mt-3 grid grid-cols-2 gap-2 text-body-m"><span class="rounded-full bg-surface-container-low px-3 py-1.5">0 ₫</span><span class="rounded-full bg-surface-container-low px-3 py-1.5">8.000.000 ₫</span></div>
    <p class="mt-2 text-body-s text-on-surface-variant">Mức giữa <b class="font-semibold ink">7,3 tr ₫</b> cho cấu hình này</p>''')}
  {group("Hãng", '<div class="mt-2">' + row("Dell", 11, True) + row("Apple", 9, True) + row("Lenovo", 8) + row("HP", 6) + row("ASUS", 4) + "</div>")}
  {group("Tình trạng", '<div class="mt-3">' + seg(["Mới", "Như mới", "Đã dùng"], 1, "w-full bg-surface-container-low", "flex-1 !px-1 text-label-m") + "</div>")}
  {group("Khoảng cách", '<div class="mt-3 flex flex-wrap gap-1.5">' + "".join(f'<span class="rounded-full px-3 py-1 text-label-l {"bg-[var(--ink)] text-white" if i == 0 else "border line text-on-surface-variant"}">{d}</span>' for i, d in enumerate(["Mọi nơi", "2 km", "5 km", "10 km", "20 km"])) + "</div>", last=True)}
  <div class="-mx-1 mb-4">{a("map-view", "state flex h-11 items-center justify-center gap-2 rounded-full bg-secondary-container text-label-l text-on-secondary-container", icon("map-outline-rounded", 18) + "Xem 126 tin trên bản đồ")}</div>
</aside>"""

    items = SEARCH_RESULTS + EXTRA
    while len(items) < 12:
        items = items + RESULTS
    items = items[:12]
    grid = "".join(card(it, i, saved=i == 1) for i, it in enumerate(items[:8]))
    alert = f"""<div class="col-span-4 flex items-center gap-4 rounded-[24px] border line bg-white py-3 pl-3 pr-3">
  <span class="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#066A61] to-[#5CC2B4] text-white">{icon("notifications-outline-rounded", 22)}</span>
  <p class="flex-1 text-body-l ink"><b class="font-semibold">Chưa thấy máy ưng?</b> <span class="text-on-surface-variant">Có laptop mới khớp câu này, ShopNexus báo bạn.</span></p>
  <button type="button" class="state h-10 rounded-full bg-[var(--ink)] px-5 text-label-l text-white">Báo khi có tin mới</button>
</div>"""
    grid += alert + "".join(card(it, i + 8) for i, it in enumerate(items[8:12]))
    sortbar = f"""<div class="glass glass-edge soft sticky top-[76px] z-20 flex items-center justify-between rounded-full py-1 pl-1 pr-1.5">
  {seg(["Phù hợp nhất", "Mới đăng", "Giá thấp", "Gần nhất"], 0, "bg-black/[.04]")}
  <div class="flex items-center gap-2">
    <span class="text-body-s text-on-surface-variant">1–12 trong 126</span>
    {seg([icon("grid-view-outline-rounded", 18), icon("view-list-outline-rounded", 18)], 0, "bg-black/[.04]")}
  </div>
</div>"""
    body = f"""{header(active=0, search=SEARCH_QUERY)}
<div class="mx-auto max-w-[1360px] px-8">
  <div class="flex items-center gap-2 pt-4">{bar}<span class="flex-1"></span>{a("reset", "text-label-l text-primary hover:underline", "Xóa lọc")}</div>
  <div class="mt-6 flex items-end justify-between">
    <div>
      <h1 class="flex items-center gap-3 text-[40px] font-semibold leading-[44px] tighter ink"><span class="ink num">126</span> laptop khớp
        <span class="rounded-full bg-white/80 px-2.5 py-1 text-label-m font-medium tracking-normal text-primary">+9 hôm nay</span></h1>
      <p class="mt-1.5 flex items-center gap-1.5 text-body-m text-on-surface-variant">{icon("auto-awesome-rounded", 15, "text-primary")}Ưu tiên RAM 16 GB cho Photoshop và Figma.</p>
    </div>
    <div class="flex items-center gap-4 pb-1 text-body-s text-on-surface-variant">
      <span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-primary"></span>Giữa <b class="num font-semibold ink">7,3 tr ₫</b></span>
      <span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-[#5CC2B4]"></span><b class="num font-semibold ink">38</b> tin trong 5 km</span>
    </div>
  </div>
</div>
<main class="mx-auto mt-5 grid max-w-[1360px] grid-cols-[264px_1fr] gap-8 px-8">
  {sidebar}
  <section>
    {sortbar}
    <div class="mt-4 grid grid-cols-4 gap-4">{grid}</div>
    <div class="mt-8 flex items-center justify-center gap-1">{"".join(f'<span class="num grid h-10 min-w-10 place-items-center rounded-full px-2 text-label-l {"bg-[var(--ink)] text-white" if n == "1" else "ink"}">{n}</span>' for n in ["1", "2", "3", "…", "11"])}
      <span class="ml-2 flex h-10 items-center gap-1 rounded-full border line bg-white px-4 text-label-l ink">Trang sau{icon("arrow-forward-rounded", 16)}</span></div>
  </section>
</main>
{footer()}"""
    return page("Tìm kiếm · ShopNexus", body)


# --------------------------------------------------------------------- home --
CATS = [("Điện thoại", "mobile-outline-rounded", "3.412"), ("Máy tính", "laptop-chromebook-outline-rounded", "2.108"),
        ("Xe đạp", "pedal-bike-outline-rounded", "964"), ("Xe máy", "two-wheeler-outline-rounded", "1.530"),
        ("Thời trang", "apparel-outline-rounded", "5.870"), ("Nội thất", "chair-outline-rounded", "1.247"),
        ("Máy ảnh", "photo-camera-outline-rounded", "688"), ("Âm thanh", "headphones-outline-rounded", "912")]


def home(signed_in=True):
    """Two homes on one frame, neither a pitch. Signed in: the buyer's own deals
    (order on the way, offers, saved items, their listings). Signed out: what
    this browser already knows (its recent searches and viewed listings, the
    rough area from the IP), with signing in offered as a way to keep them."""
    cats = "".join(a(f"cat-{i}", "state flex h-11 shrink-0 items-center gap-2 rounded-full border line bg-white pl-1.5 pr-2 text-label-l ink",
                     f'<span class="grid h-8 w-8 place-items-center rounded-full bg-secondary-container text-on-secondary-container">{icon(ic, 18)}</span>{t}'
                     f'<span class="num rounded-full bg-surface-container-low px-2 py-0.5 text-label-s text-on-surface-variant">{n}</span>')
                   for i, (t, ic, n) in enumerate(CATS))
    side = [LISTINGS[2], LISTINGS[3], LISTINGS[11]]
    side_html = "".join(f"""<li class="flex items-center gap-3 rounded-[18px] p-1.5 hover:bg-white/70">
  <img src="{img(it[0], 160, 160)}" alt="" class="h-14 w-14 shrink-0 rounded-[14px] object-cover">
  <div class="min-w-0 flex-1"><p class="truncate text-body-m ink">{escape(it[2])}</p><p class="text-body-s text-on-surface-variant">{where(it[4], it[5])} · {it[7]} trước</p></div>
  {price(it[1], "text-[15px] leading-5")}
</li>""" for it in side)
    recent = "".join(a(f"recent-{i}", "glass glass-edge flex h-9 items-center gap-1.5 rounded-full px-3 text-label-l ink hover:bg-white",
                       f'{icon(ic, 16, "text-on-surface-variant")}{t}{extra}')
                     for i, (t, ic, extra) in enumerate([("Sony A7 III dưới 25 triệu", "notifications-outline-rounded", '<span class="grid h-5 min-w-5 place-items-center rounded-full bg-tertiary px-1 text-label-s text-on-tertiary">+2</span>'),
                                                          ("iPhone 13 pin trên 85%", "history-rounded", ""), ("xe đạp cho bé 8 tuổi", "history-rounded", ""), ("sofa 3 chỗ Q.7", "history-rounded", "")]))
    if not signed_in:
        recent = "".join(a(f"recent-{i}", "glass glass-edge flex h-9 items-center gap-1.5 rounded-full px-3 text-label-l ink hover:bg-white",
                           f'{icon("history-rounded", 16, "text-on-surface-variant")}{t}')
                         for i, t in enumerate(["iPhone 13 pin trên 85%", "sofa 3 chỗ", "xe đạp cho bé 8 tuổi"]))
    feed = FOR_YOU + LISTINGS[:5]
    lead = LISTINGS[1]
    search_box = f"""<div class="mt-7 flex h-16 items-center gap-3 rounded-full bg-white pl-6 pr-2 glow">
        {icon("search-rounded", 24, "text-primary")}
        <span class="flex-1 text-title-m font-normal text-on-surface-variant">Gõ như nhắn tin: laptop cho sinh viên thiết kế, dưới 8 triệu</span>
        <button type="button" class="state grid h-11 w-11 place-items-center rounded-full text-on-surface-variant" aria-label="Tìm bằng ảnh">{icon("photo-camera-outline-rounded", 22)}</button>
        <button type="button" class="state h-12 rounded-full bg-primary px-7 text-label-l text-on-primary">Tìm</button>
      </div>"""
    order, offer, saved_it = LISTINGS[7], LISTINGS[5], LISTINGS[3]
    tile = "rounded-[24px] border line bg-white p-4"
    mine = f"""      <p class="text-label-l text-on-surface-variant">Chào buổi tối, {ME["name"]}</p>
      <h1 class="mt-1 text-[44px] font-semibold leading-[52px] tighter ink">Hôm nay tìm gì?</h1>
{search_box.replace('mt-7', 'mt-5')}
      <div class="mt-3 flex flex-wrap items-center gap-2">{recent}</div>
      <div class="mt-6 grid grid-cols-2 gap-3">
        {a("my-order", f"card flex items-center gap-3 {tile}", f'''<img src="{img(order[0], 160, 160)}" alt="" class="h-16 w-16 shrink-0 rounded-[16px] object-cover">
          <div class="min-w-0 flex-1"><p class="flex items-center gap-1.5 text-label-m text-primary">{icon("local-shipping-outline-rounded", 16)}Đơn đang giao</p>
            <p class="mt-0.5 truncate text-body-m ink">{escape(order[2])}</p><p class="text-body-s text-on-surface-variant">Shipper giao chiều nay · trả khi đã xem hàng</p></div>''')}
        {a("my-offer", f"card flex items-center gap-3 {tile}", f'''<img src="{img(offer[0], 160, 160)}" alt="" class="h-16 w-16 shrink-0 rounded-[16px] object-cover">
          <div class="min-w-0 flex-1"><p class="flex items-center gap-1.5 text-label-m text-tertiary">{icon("sell-outline-rounded", 16)}Đang trả giá · 2</p>
            <p class="mt-0.5 truncate text-body-m ink">{escape(offer[2])}</p><p class="text-body-s text-on-surface-variant">Người bán trả lại <b class="font-semibold text-tertiary">4.500.000 ₫</b></p></div>
          <span class="shrink-0 rounded-full bg-tertiary px-3 py-1.5 text-label-m text-on-tertiary">Trả lời</span>''')}
        {a("my-saved", f"card flex items-center gap-3 {tile}", f'''<span class="flex shrink-0 -space-x-4">{"".join(f'<img src="{img(p, 120, 120)}" alt="" class="h-12 w-12 rounded-[14px] object-cover ring-2 ring-white">' for p in (saved_it[0], LISTINGS[9][0], LISTINGS[4][0]))}</span>
          <div class="min-w-0 flex-1"><p class="flex items-center gap-1.5 text-label-m text-on-surface-variant">{icon("favorite-outline-rounded", 16)}Tin đã lưu · 13</p>
            <p class="mt-0.5 truncate text-body-m ink">Polaroid OneStep 2 vừa giảm 150.000 ₫</p></div>''')}
        {a("my-listings", f"card flex items-center gap-3 {tile}", f'''<span class="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-secondary-container text-on-secondary-container">{icon("storefront-outline-rounded", 22)}</span>
          <div class="min-w-0 flex-1"><p class="text-label-m text-on-surface-variant">Tin của bạn · 5 đang bán</p>
            <p class="mt-0.5 text-body-m ink"><b class="num font-semibold">46</b> lượt xem mới · <b class="num font-semibold">5</b> tin nhắn</p></div>''')}
      </div>"""
    seen = [LISTINGS[5], LISTINGS[9], LISTINGS[10]]
    guest = f"""      <p class="flex items-center gap-1 text-label-l text-on-surface-variant">{icon("location-on-outline-rounded", 16)}Gần Bình Thạnh, TP.HCM{a("area", "ml-1 text-primary hover:underline", "Đổi")}</p>
      <h1 class="mt-1 text-[44px] font-semibold leading-[52px] tighter ink">Hôm nay tìm gì?</h1>
{search_box.replace('mt-7', 'mt-5')}
      <div class="mt-3 flex flex-wrap items-center gap-2">{recent}</div>
      <div class="mt-6 grid grid-cols-2 gap-3">
        {a("seen", f"card flex items-center gap-3 {tile}", f'''<span class="flex shrink-0 -space-x-4">{"".join(f'<img src="{img(it[0], 120, 120)}" alt="" class="h-12 w-12 rounded-[14px] object-cover ring-2 ring-white">' for it in seen)}</span>
          <div class="min-w-0 flex-1"><p class="flex items-center gap-1.5 text-label-m text-on-surface-variant">{icon("history-rounded", 16)}Bạn vừa xem · 3</p>
            <p class="mt-0.5 truncate text-body-m ink">Sofa nhung xanh và 2 ghế</p></div>''')}
        {a("like-seen", f"card flex items-center gap-3 {tile}", f'''<img src="{img(LISTINGS[9][0], 160, 160)}" alt="" class="h-12 w-12 shrink-0 rounded-[14px] object-cover">
          <div class="min-w-0 flex-1"><p class="flex items-center gap-1.5 text-label-m text-primary">{icon("chair-outline-rounded", 16)}Giống tin bạn vừa xem</p>
            <p class="mt-0.5 text-body-m ink"><b class="num font-semibold">8</b> sofa, ghế mới quanh Bình Thạnh</p></div>''')}
        {a("price-seen", f"card flex items-center gap-3 {tile}", f'''<span class="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-tertiary-fixed text-on-tertiary-fixed-variant">{icon("sell-outline-rounded", 22)}</span>
          <div class="min-w-0 flex-1"><p class="text-label-m text-on-surface-variant">iPhone 13, pin trên 85%</p>
            <p class="mt-0.5 text-body-m ink">Đang bán quanh <b class="num font-semibold">5,3 tr ₫</b> · 412 tin</p></div>''')}
        <div class="flex items-center gap-3 {tile}"><span class="grid h-12 w-12 shrink-0 place-items-center rounded-[14px] bg-secondary-container text-on-secondary-container">{icon("favorite-outline-rounded", 22)}</span>
          <p class="min-w-0 flex-1 text-body-m ink">Giữ 3 tin bạn vừa xem trên mọi máy</p>
          <button type="button" class="state h-9 shrink-0 rounded-full bg-[var(--ink)] px-4 text-label-l text-white">Đăng nhập</button></div>
      </div>"""
    hero = mine if signed_in else guest
    near = "Vừa đăng quanh bạn" if signed_in else "Vừa đăng quanh Bình Thạnh"
    tabs = ["Dành cho bạn", "Gần bạn", "Mới nhất"] if signed_in else ["Gợi ý cho bạn", "Gần bạn", "Mới nhất"]
    nudge = f"""<div class="mt-3 rounded-[18px] bg-secondary-container p-4 text-on-secondary-container">
        <p class="text-title-s">Có đồ không dùng nữa?</p>
        <button type="button" class="state mt-3 flex h-9 items-center gap-1.5 rounded-full bg-[var(--ink)] pl-3 pr-4 text-label-l text-white">{icon("add-rounded", 18)}Đăng tin</button>
      </div>"""
    body = f"""{header(active=0, search=None, signed_in=signed_in)}
<main class="mx-auto max-w-[1360px] px-8">
  <section class="grid grid-cols-[1fr_400px] gap-8 pt-10">
    <div class="flex flex-col">
{hero}
      <div class="mt-5 flex flex-wrap gap-2">{cats}</div>
    </div>
    <div class="glass glass-edge soft self-start rounded-[28px] p-3">
      <div class="flex items-center justify-between px-2 pb-2 pt-1"><p class="text-title-s ink">{near}</p>{a("see-new", "text-label-l text-primary hover:underline", "Xem tất cả")}</div>
      <article class="card overflow-hidden rounded-[22px] bg-white">
        <div class="relative" style="aspect-ratio: 16 / 10"><img src="{img(lead[0], 800, 500)}" alt="" class="h-full w-full object-cover">
          <span class="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-label-m ink backdrop-blur">{lead[4]} · {lead[7]} trước</span></div>
        <div class="flex items-center justify-between gap-3 px-4 py-3"><div class="min-w-0"><h3 class="truncate text-body-l ink">{escape(lead[2])}</h3><p class="text-body-s text-on-surface-variant">{lead[3]}{" · " + lead[5]}</p></div>{price(lead[1], "text-[22px] leading-7")}</div>
      </article>
      <ul class="mt-2 flex flex-col">{side_html}</ul>
    </div>
  </section>


  <section class="mt-10 grid grid-cols-[1fr_340px] gap-8">
    <div>
      <div class="flex items-center justify-between">
        {seg(tabs, 0, "bg-black/[.05]")}
        <span class="text-body-s text-on-surface-variant">Mọi tỉnh thành · gần thì ghi km, xa thì ghi nơi bán</span>
      </div>
      <div class="mt-4 grid grid-cols-4 gap-4">{"".join(card(it, i, saved=signed_in and i == 2) for i, it in enumerate(feed[:12]))}</div>
      <div class="mt-6 flex justify-center"><button type="button" class="state h-11 rounded-full border line bg-white px-6 text-label-l ink">Xem thêm tin</button></div>
    </div>
    <aside class="sticky top-[84px] self-start rounded-[24px] border line bg-white p-3">
      {trending()}
      {nudge}
    </aside>
  </section>

</main>
{footer()}"""
    return page("ShopNexus · Đồ cũ giá tốt", body)


if __name__ == "__main__":
    for name, fn in [("j-search", search), ("j-home", home), ("j-home-guest", lambda: home(signed_in=False))]:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(fn())
        print("wrote", name)
