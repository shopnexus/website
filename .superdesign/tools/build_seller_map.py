"""Người bán (a seller's public page) and Bản đồ (the map page), in the chosen
style: C's shell, 28 px containers, pills, cards for browsing, rows for results.

    python3 tools/build_seller_map.py        (run from .superdesign/)
"""
import os
from html import escape

from build import OUT, a
from build_c import ART, CSS, area_map, feed_card, footer, header
from common import MONEY, head, icon, img, split_price

PAGE_CSS = CSS + """
  .row-hover:hover { background: var(--md-surface-container-low); }
  .pin-c::after { content: ""; position: absolute; left: 50%; bottom: -4px; width: 9px; height: 9px; background: inherit; transform: translateX(-50%) rotate(45deg); border-radius: 2px; }
"""

SELLER = dict(name="Tuấn Kiệt", photo="1544723795-3fb6469f5b39", area="Bình Thạnh", joined="2023")
# img, price, title, condition, km, area, rating, posted, AI note
SELLING = [
    ("1632661674596-df8be070a5c5", "5.200.000 ₫", "iPhone 13 Pro 128GB Xanh Sierra, pin 88%", "Như mới", "2,1 km", "Bình Thạnh", "4,9", "2 giờ", "Giá tham khảo"),
    ("1585515320310-259814833e62", "450.000 ₫", "Máy xay sinh tố 2L, còn bảo hành 6 tháng", "Như mới", "2,1 km", "Bình Thạnh", "4,9", "3 ngày", None),
    ("1505740420928-5e560c06d30e", "3.200.000 ₫", "Tai nghe chống ồn Sony WH-1000XM4, fullbox", "Như mới", "2,1 km", "Bình Thạnh", "4,9", "1 tuần", None),
    ("1600294037681-c80b4cb5b434", "1.100.000 ₫", "AirPods 2, tai trái hơi rè", "Đã dùng", "2,1 km", "Bình Thạnh", "4,9", "2 tuần", "Rẻ hơn 12%"),
    ("1593764592116-bfb2a97c642a", "1.800.000 ₫", "Xe đạp fixie đen mờ size 50, ít đi", "Như mới", "2,1 km", "Bình Thạnh", "4,9", "3 tuần", None),
    ("1580480055273-228ff5388ef8", "950.000 ₫", "Ghế xoay vải be chân gỗ, ngồi êm", "Như mới", "2,1 km", "Bình Thạnh", "4,9", "1 tháng", None),
]
REVIEWS = [
    ("Minh Thư", "1494790108377-be9c29b29330", 5, "2 tuần trước", "Máy đúng như mô tả, pin còn tốt. Anh bán hẹn giờ rất đúng, gói hàng kỹ.", "1632661674596-df8be070a5c5", "iPhone 12 Pro"),
    ("Quốc Bảo", "1500648767791-00dcc994a43e", 5, "3 tuần trước", "Giao COD nhanh, mở ra kiểm tra thoải mái rồi mới trả. Sẽ mua tiếp.", "1505740420928-5e560c06d30e", "Sony WH-1000XM3"),
    ("Hải Yến", "1534528741775-53994a69daeb", 4, "1 tháng trước", "Hàng ổn, trả lời tin nhắn nhanh. Hộp hơi móp nhưng máy không sao.", "1585515320310-259814833e62", "Máy xay Philips"),
]


def stars(n, size=16):
    return "".join(icon("star-rounded" if i < n else "star-outline-rounded", size, "text-on-surface" if i < n else "text-outline-variant") for i in range(5))


def seller():
    facts = "".join(f'<span class="flex items-center gap-1.5">{icon(ic, 18, "text-on-surface-variant")}{t}</span>' for ic, t in [
        ("location-on-outline-rounded", f"{SELLER['area']}, TP.HCM"), ("calendar-month-outline-rounded", f"Tham gia {SELLER['joined']}"),
        ("verified-user-outline-rounded", "Đã xác minh số điện thoại")])
    stats = "".join(f'<div class="px-6 text-center {"border-l border-outline-variant" if i else ""}"><p class="text-display-s">{v}<span class="text-title-l text-on-surface-variant">{u}</span></p><p class="mt-1 text-body-m text-on-surface-variant">{l}</p></div>'
                    for i, (v, u, l) in enumerate([("4,9", "/5", "32 đánh giá"), ("14", "", "đã bán"), ("10", " phút", "thường trả lời"), ("0", "", "ghi nhận bị từ chối · 90 ngày")]))
    facts90 = "".join(f'<li class="flex items-center justify-between py-3 {"border-t border-outline-variant" if i else ""}"><span class="flex items-center gap-3 text-body-m">{icon(ic, 20, "text-on-surface-variant")}{t}</span><span class="text-title-m">{v}</span></li>'
                      for i, (ic, t, v) in enumerate([("local-shipping-outline-rounded", "Đơn COD bị từ chối nhận", "0/9"),
                                                       ("assignment-outline-rounded", "Ghi nhận sự cố", "1 · đã tự hoàn"),
                                                       ("schedule-rounded", "Ghi nhận chưa trả lời", "0"),
                                                       ("handshake-outline-rounded", "Giao dịch xong", "14")]))
    cards = "".join(feed_card(it, i) for i, it in enumerate(SELLING))
    praise = "".join(f'<span class="rounded-full bg-surface-container-lowest px-3.5 py-1.5 text-label-l text-on-surface">{p}</span>' for p in ["Đúng mô tả", "Hẹn giờ đúng", "Gói hàng kỹ"])
    reviews = "".join(f"""<li class="flex gap-4 py-5 {"border-t border-outline-variant" if i else ""}">
  <img src="{img(p, 80, 80)}" alt="" class="h-11 w-11 rounded-full object-cover">
  <div class="min-w-0 flex-1">
    <div class="flex items-center gap-3"><span class="text-title-s">{n}</span><span class="flex">{stars(st, 15)}</span><span class="text-body-s text-on-surface-variant">{ago}</span></div>
    <p class="mt-1.5 text-body-m text-on-surface">{t}</p>
    <p class="mt-2 flex items-center gap-2 text-body-s text-on-surface-variant"><img src="{img(item, 48, 48)}" alt="" class="h-6 w-6 rounded-xs object-cover">Đã mua {item_name}</p>
  </div>
</li>""" for i, (n, p, st, ago, t, item, item_name) in enumerate(REVIEWS))
    tabs = "".join(f'<span class="flex h-12 items-center gap-2 px-1 text-title-s {"border-b-[3px] border-primary text-primary" if i == 0 else "text-on-surface-variant"}">{t}<span class="rounded-full {"bg-primary text-on-primary" if i == 0 else "bg-surface-container-high text-on-surface-variant"} px-2 text-label-m">{n}</span></span>'
                   for i, (t, n) in enumerate([("Đang bán", "6"), ("Đã bán", "14"), ("Đánh giá", "32")]))
    body = f"""<body>
<div class="min-h-screen bg-surface pb-2 font-sans text-on-surface">
  {header()}
  <main class="mx-auto max-w-[1328px] px-6">
    <nav class="mt-6 flex items-center gap-1.5 text-body-s text-on-surface-variant">{a("crumb-home", "hover:underline", "Khám phá")}{icon("chevron-right-rounded", 16)}<span class="text-on-surface">Người bán</span></nav>

    <section class="relative mt-4 overflow-hidden rounded-xl bg-secondary-container px-12 pb-10 pt-12">
      <img src="{ART["art_deal"]}" alt="" class="pointer-events-none absolute -bottom-8 right-8 w-[230px] opacity-95">
      <div class="relative flex items-start gap-8">
        <div class="relative shrink-0">
          <img src="{img(SELLER["photo"], 256, 256)}" alt="{SELLER['name']}" class="h-32 w-32 rounded-full border-4 border-surface-container-lowest object-cover">
          <img src="{ART["tier_top"]}" alt="" class="absolute -bottom-2 -right-3 h-14 w-14">
        </div>
        <div class="min-w-0 flex-1">
          <h1 class="flex items-center gap-2 text-display-m text-on-surface">{SELLER['name']}{icon("verified-rounded", 34, "text-primary")}</h1>
          <button type="button" class="state mt-3 inline-flex h-9 items-center gap-2 rounded-full bg-surface-container-lowest pl-1.5 pr-3.5 text-label-l text-on-surface"><img src="{ART["tier_top"]}" alt="" class="h-6 w-6">Xuất sắc{icon("chevron-right-rounded", 18, "text-on-surface-variant")}</button>
          <div class="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-body-m text-on-secondary-container">{facts}</div>
          <div class="mt-7 flex items-center gap-2">
            <button type="button" class="state flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-label-l text-on-primary">{icon("person-add-outline-rounded", 20)}Theo dõi</button>
            <button type="button" class="state flex h-12 items-center gap-2 rounded-full bg-surface-container-lowest px-5 text-label-l text-on-surface">{icon("chat-outline-rounded", 20)}Nhắn tin</button>
            <button type="button" class="state grid h-12 w-12 place-items-center rounded-full bg-surface-container-lowest text-on-surface-variant" aria-label="Chia sẻ">{icon("share-outline-rounded", 20)}</button>
          </div>
        </div>
      </div>
      <div class="relative mt-10 grid w-[880px] grid-cols-4 rounded-xl bg-surface-container-lowest py-6">{stats}</div>
    </section>

    <div class="mt-12 grid grid-cols-[1fr_400px] gap-10">
      <div>
        <div class="flex gap-8 border-b border-outline-variant">{tabs}</div>
        <div class="mt-4 flex items-center justify-between">
          <div class="flex gap-2">{"".join(f'<button type="button" class="state h-9 rounded-full px-4 text-label-l {c}">{t}</button>' for t, c in [("Tất cả", "bg-secondary-container text-on-secondary-container"), ("Điện thoại", "border border-outline-variant text-on-surface-variant"), ("Âm thanh", "border border-outline-variant text-on-surface-variant"), ("Gia dụng", "border border-outline-variant text-on-surface-variant")])}</div>
          <button type="button" class="state flex h-9 items-center gap-1 rounded-full border border-outline-variant pl-4 pr-3 text-label-l text-on-surface-variant">Mới đăng{icon("keyboard-arrow-down-rounded", 18)}</button>
        </div>
        <div class="stagger mt-6 grid grid-cols-3 gap-x-5 gap-y-10 pb-7">{cards}</div>

        <section class="mt-14">
          <h2 class="text-display-s">Người mua nói gì</h2>
          <div class="mt-6 grid grid-cols-[220px_1fr] gap-8 rounded-xl bg-surface-container-low p-8">
            <div>
              <p class="text-display-l">4,9<span class="text-headline-s text-on-surface-variant">/5</span></p>
              <p class="mt-1 flex">{stars(5, 20)}</p>
              <p class="mt-2 text-body-m text-on-surface-variant">32 đánh giá</p>
            </div>
            <div>
              <p class="flex items-center gap-1.5 text-label-l text-on-surface-variant">{icon("auto-awesome-rounded", 16, "text-primary")}Hay được khen</p>
              <div class="mt-3 flex flex-wrap gap-2">{praise}</div>
              <ul class="mt-4">{reviews}</ul>
              {a("all-reviews", "text-label-l text-primary hover:underline", "Xem cả 32 đánh giá")}
            </div>
          </div>
        </section>
      </div>

      <aside class="flex flex-col gap-6 self-start">
        <div class="rounded-xl bg-surface-container-low p-6">
          <div class="flex items-center gap-4">
            <img src="{ART["tier_top"]}" alt="" class="h-16 w-16">
            <div><p class="text-title-l">Bậc Xuất sắc</p><p class="text-body-s text-on-surface-variant">Tính từ hành vi 12 tháng gần đây</p></div>
          </div>
          <ul class="mt-4">{facts90}</ul>
          <p class="mt-3 text-body-s text-on-surface-variant">Số liệu 90 ngày tính khi có từ 5 đơn. Ghi nhận bị từ chối hiện ở đây cho mọi người cùng thấy.</p>
        </div>
        <div>
          {area_map([(56, 44, "Khu vực của Kiệt", True)], you=(30, 72), h=280, guide=False, route=((30, 72), (56, 44), "cách bạn 2,1 km"))}
          <p class="mt-3 text-body-m text-on-surface-variant">Gửi COD từ {SELLER['area']}. Món trên 5 triệu, hai bên có thể hẹn gặp xem trực tiếp trong khu vực này.</p>
        </div>
        <div class="flex flex-col gap-2.5 rounded-xl border border-outline-variant p-5">
          <p class="flex gap-2 text-body-m text-on-surface-variant">{icon("account-balance-outline-rounded", 18, "mt-0.5")}<span>{MONEY["no_hold"]}</span></p>
          <p class="flex gap-2 text-body-m text-on-surface-variant">{icon("local-shipping-outline-rounded", 18, "mt-0.5")}<span>{MONEY["cod_buyer"]}</span></p>
        </div>
        <div class="flex gap-2">
          {a("report-seller", "state flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-label-l text-on-surface-variant", icon("flag-outline-rounded", 18) + "Báo cáo")}
          {a("block-seller", "state flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-label-l text-on-surface-variant", icon("block-rounded", 18) + "Chặn")}
        </div>
      </aside>
    </div>
  </main>
  {footer()}
</div>
</body>
</html>"""
    return head("Người bán · Tuấn Kiệt", PAGE_CSS) + body


# -------------------------------------------------------------------- map --
IN_VIEW = [
    ("1632661674596-df8be070a5c5", "5.200.000 ₫", "iPhone 13 Pro 128GB, pin 88%", "Như mới", "2,1 km", "Bình Thạnh", "4,9", "Rẻ hơn 9%"),
    ("1507035895480-2b3156c31fc8", "2.300.000 ₫", "Xe đạp fixed gear khung thép, vừa thay lốp", "Đã dùng", "0,8 km", "Bình Thạnh", "4,7", None),
    ("1555041469-a586c61ea9bc", "4.800.000 ₫", "Sofa nhung xanh 3 chỗ, chuyển nhà cần bán gấp", "Đã dùng", "1,6 km", "Bình Thạnh", "4,9", None),
    ("1526170375885-4d8ecf77b99f", "1.750.000 ₫", "Máy ảnh Polaroid OneStep 2, tặng 1 hộp film", "Như mới", "3,1 km", "Phú Nhuận", "5,0", "Giá tham khảo"),
    ("1585515320310-259814833e62", "450.000 ₫", "Máy xay sinh tố 2L, còn bảo hành 6 tháng", "Như mới", "0,6 km", "Bình Thạnh", "4,8", None),
    ("1611186871348-b1ce696e52c9", "11,5 tr ₫", "MacBook Air M1 13 inch 8/256GB, sạc 92 lần", "Như mới", "2,4 km", "Phú Nhuận", "4,9", None),
]


def map_row(item, i):
    photo, price, title, cond, km, area, rating, note = item
    num, unit = split_price(price)
    sel = "bg-secondary-container" if i == 0 else ""
    note_html = f'<p class="mt-1 flex items-center gap-1 text-label-m text-tertiary">{icon("auto-awesome-rounded", 13)}{note}</p>' if note else ""
    return f"""<article class="row-hover flex gap-4 rounded-lg p-2.5 {sel}">
  <img src="{img(photo, 200, 200)}" alt="{escape(title)}" class="h-[84px] w-[84px] shrink-0 rounded-md object-cover">
  <div class="min-w-0 flex-1">
    <p class="text-title-m text-on-surface">{num}<span class="text-body-s text-on-surface-variant">{unit}</span></p>
    <h3 class="truncate text-body-m text-on-surface">{escape(title)}</h3>
    <p class="mt-0.5 text-body-s text-on-surface-variant">{cond} · {area} · {km} · {icon("star-rounded", 12, "inline-block align-[-2px]")} {rating}</p>
    {note_html}
  </div>
</article>"""


def big_map():
    """A district map drawn in SVG: blocks on a street grid, two main roads, the river, parks."""
    blocks = []
    for r, y in enumerate(range(20, 700, 92)):
        for c, x in enumerate(range(20, 1300, 124)):
            if 560 < x + (r * 18) % 60 < 760 and y > 470:
                continue  # river bend
            w = 104 - (r * 7 + c * 11) % 28
            h = 72 - (r * 5 + c * 3) % 18
            fill = "#C7E6E0" if (r, c) in [(1, 3), (4, 8), (2, 9), (6, 1)] else "#E6ECEA"
            blocks.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="{fill}"/>')
    river = ('<path d="M-20 560 C 160 520, 300 640, 520 600 S 760 470, 900 560 S 1180 690, 1360 600 L 1360 760 L -20 760 Z" fill="#C7E6E0"/>'
             '<path d="M-20 560 C 160 520, 300 640, 520 600 S 760 470, 900 560 S 1180 690, 1360 600" fill="none" stroke="#97E7DB" stroke-width="3"/>')
    roads = ('<path d="M-20 250 C 300 230, 700 290, 1360 240" fill="none" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round"/>'
             '<path d="M620 -20 C 600 200, 700 380, 660 760" fill="none" stroke="#FFFFFF" stroke-width="18" stroke-linecap="round"/>')
    return (f'<svg viewBox="0 0 1328 720" preserveAspectRatio="xMidYMid slice" class="absolute inset-0 h-full w-full" aria-hidden="true">'
            f'<rect width="1328" height="720" fill="#F1F4F2"/>{"".join(blocks)}{roads}{river}</svg>')


def map_page():
    pins = [(45, 42, "5,2 tr", True), (33, 58, "2,3 tr", False), (47, 36, "4,8 tr", False), (26, 40, "450 k", False), (55, 52, "1,7 tr", False), (37, 28, "11,5 tr", False)]
    pin_html = "".join(
        f'<span class="pin-c absolute flex -translate-x-1/2 -translate-y-full items-center rounded-full px-3 py-1.5 text-label-l shadow-float {"bg-primary text-on-primary scale-110" if sel else "bg-surface-container-lowest text-on-surface"}" style="left:{x}%;top:{y}%">{p}</span>'
        for x, y, p, sel in pins)
    clusters = [(16, 22, "38", "Phú Nhuận"), (58, 22, "64", "Q.3"), (58, 72, "27", "Q.1"), (12, 70, "19", "Gò Vấp")]
    cluster_html = "".join(
        f'<span class="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style="left:{x}%;top:{y}%"><span class="grid h-14 w-14 place-items-center rounded-full border-4 border-surface-container-lowest bg-secondary-container text-title-m text-on-secondary-container shadow-float">{n}</span><span class="mt-1 rounded-full bg-surface-container-lowest/90 px-2 text-label-m text-on-surface-variant">{label}</span></span>'
        for x, y, n, label in clusters)
    labels = "".join(f'<span class="absolute text-label-m tracking-[0.2em] text-secondary" style="left:{x}%;top:{y}%">{t}</span>' for x, y, t in [(44, 66, "BÌNH THẠNH"), (72, 86, "SÔNG SÀI GÒN"), (4, 31, "ĐIỆN BIÊN PHỦ")])
    radius = "".join(f'<button type="button" class="state h-10 px-4 text-label-l {"bg-secondary-container text-on-secondary-container" if r == "3 km" else "text-on-surface-variant"}">{r}</button>' for r in ["1 km", "3 km", "5 km", "10 km"])
    chips = "".join(f'<button type="button" class="state flex h-9 items-center gap-1 rounded-full px-4 text-label-l shadow-float {c}">{t}</button>'
                    for t, c in [("Tất cả", "bg-secondary-container text-on-secondary-container"), ("Điện thoại", "bg-surface-container-lowest text-on-surface"), ("Xe đạp", "bg-surface-container-lowest text-on-surface"),
                                 ("Nội thất", "bg-surface-container-lowest text-on-surface"), ("Dưới 2 triệu", "bg-surface-container-lowest text-on-surface"), ("Như mới", "bg-surface-container-lowest text-on-surface")])
    rows = "".join(map_row(it, i) for i, it in enumerate(IN_VIEW))
    areas = [("Bình Thạnh", "812", "64", ["Điện thoại", "Xe đạp", "Nội thất"], True), ("Phú Nhuận", "438", "31", ["Thời trang", "Máy ảnh"], False),
             ("Q.1", "1.204", "97", ["Điện thoại", "Máy tính"], False), ("Thủ Đức", "967", "58", ["Máy tính", "Đồ cho bé"], False)]
    area_html = "".join(f"""<a id="area-{i}" href="#area-{i}" class="lift flex h-[200px] flex-col justify-between rounded-xl p-6 {"bg-secondary-container" if mine else "bg-surface-container-low"}">
  <div class="flex items-start justify-between"><p class="text-headline-m text-on-surface">{n}</p>{'<span class="rounded-full bg-surface-container-lowest px-2.5 py-1 text-label-m text-primary">Bạn ở đây</span>' if mine else ""}</div>
  <div><p class="text-title-l text-on-surface">{c}<span class="text-body-m text-on-surface-variant"> món · {new} mới hôm nay</span></p>
  <div class="mt-2 flex flex-wrap gap-1.5">{"".join(f'<span class="rounded-full bg-surface-container-lowest px-2.5 py-0.5 text-label-m text-on-surface-variant">{t}</span>' for t in tops)}</div></div>
</a>""" for i, (n, c, new, tops, mine) in enumerate(areas))
    body = f"""<body>
<div class="min-h-screen bg-surface pb-2 font-sans text-on-surface">
  {header(quick="scroll").replace('bg-secondary-container text-on-secondary-container">Khám phá', 'text-on-surface-variant">Khám phá', 1).replace('text-on-surface-variant">Bản đồ', 'bg-secondary-container text-on-secondary-container">Bản đồ', 1)}
  <main class="mx-auto max-w-[1328px] px-6">
    <section class="relative mt-6 h-[760px] overflow-hidden rounded-xl">
      {big_map()}
      {labels}
      <span class="absolute h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-primary bg-primary/[.06]" style="left:38%;top:46%"></span>
      {cluster_html}
      {pin_html}
      <span class="pin-pulse absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-surface-container-lowest bg-primary" style="left:38%;top:46%"></span>

      <div class="absolute left-6 right-[460px] top-6">
        <div data-big-search class="flex h-14 items-center gap-3 rounded-full bg-surface-container-lowest pl-5 pr-2 shadow-float">
          {icon("search-rounded", 22, "text-on-surface-variant")}<span class="flex-1 text-body-l text-on-surface-variant">Tìm quanh đây, hoặc gõ cả câu</span>
          <button type="button" class="state grid h-10 w-10 place-items-center rounded-full text-on-surface-variant" aria-label="Tìm bằng ảnh">{icon("photo-camera-outline-rounded", 22)}</button>
          <button type="button" class="state h-10 rounded-full bg-primary px-5 text-label-l text-on-primary">Tìm</button>
        </div>
        <div class="mt-3 flex flex-wrap gap-2">{chips}</div>
      </div>

      <div class="absolute bottom-6 left-6 flex items-end gap-4">
        <div class="rounded-xl bg-surface-container-lowest p-4 shadow-float">
          <p class="text-label-l text-on-surface-variant">Bán kính quanh bạn</p>
          <div class="mt-2 flex overflow-hidden rounded-full border border-outline-variant">{radius}</div>
        </div>
        <img src="{ART["map-guide"]}" alt="" class="pointer-events-none -mb-6 w-[170px]">
      </div>

      <div class="absolute bottom-6 right-[460px] flex flex-col gap-2">
        <button type="button" class="state grid h-12 w-12 place-items-center rounded-full bg-surface-container-lowest text-on-surface shadow-float" aria-label="Về vị trí của bạn">{icon("my-location-rounded", 22)}</button>
        <div class="flex flex-col overflow-hidden rounded-full bg-surface-container-lowest shadow-float">
          <button type="button" class="state grid h-12 w-12 place-items-center text-on-surface" aria-label="Phóng to">{icon("add-rounded", 22)}</button>
          <button type="button" class="state grid h-12 w-12 place-items-center border-t border-outline-variant text-on-surface" aria-label="Thu nhỏ">{icon("remove-rounded", 22)}</button>
        </div>
      </div>

      <aside class="absolute bottom-6 right-6 top-6 flex w-[420px] flex-col rounded-xl bg-surface-container-lowest p-5 shadow-float">
        <div class="flex items-center justify-between px-1">
          <div><h1 class="text-headline-s">146 món trong 3 km</h1><p class="text-body-s text-on-surface-variant">quanh Bình Thạnh · gần nhất trước</p></div>
          <button type="button" class="state grid h-10 w-10 place-items-center rounded-full text-on-surface-variant" aria-label="Sắp xếp">{icon("swap-vert-rounded", 22)}</button>
        </div>
        <div class="no-scrollbar mt-3 flex-1 overflow-hidden">{rows}</div>
        {a("list-all", "state mt-3 flex h-12 items-center justify-center gap-2 rounded-full bg-secondary-container text-label-l text-on-secondary-container", icon("view-list-outline-rounded", 20) + "Xem dạng danh sách")}
      </aside>
    </section>

    <section class="mt-16">
      <div class="flex items-end justify-between"><h2 class="text-display-s">Khu vực đang sôi động</h2>{a("areas-all", "text-label-l text-primary hover:underline", "Tất cả khu vực")}</div>
      <div class="mt-6 grid grid-cols-4 gap-4">{area_html}</div>
      <p class="mt-6 flex items-center gap-2 text-body-m text-on-surface-variant">{icon("group-outline-rounded", 18)}{MONEY["meet_hint"]}</p>
    </section>
  </main>
  {footer()}
</div>
</body>
</html>"""
    return head("Bản đồ · ShopNexus", PAGE_CSS) + body


if __name__ == "__main__":
    for name, fn in [("seller", seller), ("map", map_page)]:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(fn())
        print("wrote", name)
