"""Superseded 2026-11-17: orders.html, order.html and ship.html are drawn in J by build_j_orders.py.
This file still holds data and pieces the J builders import.

Orders, in the chosen style: Đơn hàng (one row per order), Đơn COD (the
buyer's order while GHTK carries it) and Đơn bán (the seller creates the
shipment on one screen). Follows the app's order flow of 2026-11-14
(app/.superdesign/tools/build_cod_order.py, build_ship_order.py).

    python3 tools/build_orders.py        (run from .superdesign/)
"""
import json
import os
from html import escape

from build import OUT, a
from build_c import ART, CSS, footer, header
from common import MONEY, head, icon, img

HERE = os.path.dirname(os.path.abspath(__file__))
ART = dict(ART, **json.load(open(os.path.join(HERE, "art_sh.json"))),
           **json.load(open(os.path.join(HERE, "art_seller_tools.json"))))

# Verbatim from app/.superdesign/tools/common.py MONEY.

# The four steps of an order, as the app's PhaseStepper: agreed, created, received, rated.
PHASES = [("handshake-outline-rounded", "Chốt giá"), ("receipt-long-outline-rounded", "Tạo đơn"),
          ("package-2-outline-rounded", "Nhận hàng"), ("star-outline-rounded", "Đánh giá")]

PAGE_CSS = CSS + """
  .row-hover:hover { background: var(--md-surface-container); }
  /* M3 connected button group, as the app's .seg */
  .seg { display: flex; gap: 2px; }
  .seg > * { flex: 1; min-width: 0; height: 40px; display: flex; align-items: center; justify-content: center; gap: 6px;
    border-radius: 8px; padding: 0 12px; white-space: nowrap; background: var(--md-surface-container-high); color: var(--md-on-surface-variant); }
  .seg > :first-child { border-radius: 20px 8px 8px 20px; }
  .seg > :last-child { border-radius: 8px 20px 20px 8px; }
  .seg > [aria-checked="true"] { border-radius: 20px; background: var(--md-secondary-container); color: var(--md-on-secondary-container); }
  .group > * { border-radius: 4px; }
  .group > :first-child { border-top-left-radius: 20px; border-top-right-radius: 20px; }
  .group > :last-child { border-bottom-left-radius: 20px; border-bottom-right-radius: 20px; }
"""

FACE = {"Hoàng Nam": "1500648767791-00dcc994a43e", "Tuấn Kiệt": "1544723795-3fb6469f5b39", "Ngọc Hân": "1494790108377-be9c29b29330",
        "Lan Anh": "1534528741775-53994a69daeb", "Quốc Bảo": "1507003211169-0a1dd7228f2d", "Gia Bảo": "1506794778202-cad84cf45f1d",
        "Đức Huy": "1500648767791-00dcc994a43e", "Khánh Linh": "1494790108377-be9c29b29330"}

TONAL_ICON = "state grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary-container text-on-secondary-container"
COPY = f'<button type="button" class="state grid h-10 w-10 shrink-0 place-items-center rounded-full text-on-surface-variant" aria-label="Sao chép">{icon("content-copy-outline-rounded", 20)}</button>'


def money(key, ic="info-outline-rounded", cls="text-on-surface-variant"):
    return f'<p class="flex gap-2 text-body-m {cls}">{icon(ic, 18, "mt-0.5")}<span>{MONEY[key]}</span></p>'


def face(name, size=20):
    return f'<img src="{img(FACE[name], size * 4, size * 4)}" alt="" class="rounded-full object-cover" style="width:{size}px;height:{size}px">'


def page(title, body):
    return head(f"{title} · ShopNexus", PAGE_CSS) + f"""<body>
<div class="min-h-screen bg-surface pb-2 font-sans text-on-surface">
  {header(quick="always")}
  <main class="mx-auto max-w-[1328px] px-6">{body}</main>
  {footer()}
</div>
</body>
</html>"""


def vnd(n):
    return f"{n:,}".replace(",", ".")


def step_dot(i, current, small=False):
    ic, label = PHASES[i]
    s = 28 if small else 40
    if i < current:
        return f'<span class="grid shrink-0 place-items-center rounded-full bg-primary text-on-primary" style="width:{s}px;height:{s}px" aria-label="{label}: xong">{icon("check-rounded", 16 if small else 20)}</span>'
    if i == current:
        return f'<span class="grid shrink-0 place-items-center rounded-[38%] bg-primary-container text-on-primary-container" style="width:{s + 4}px;height:{s + 4}px" aria-label="Bước {i + 1}/4 · {label}">{icon(ic, 18 if small else 22)}</span>'
    return f'<span class="grid shrink-0 place-items-center rounded-full bg-surface-container-highest text-on-surface-variant" style="width:{s}px;height:{s}px" aria-label="{label}">{icon(ic, 16 if small else 20)}</span>'


def stepper(current, gap=20):
    """The small four-step stepper on an order row."""
    out = []
    for i in range(4):
        out.append(step_dot(i, current, small=True))
        if i < 3:
            out.append(f'<span class="h-0.5 {"bg-primary" if i < current else "bg-surface-container-highest"}" style="width:{gap}px"></span>')
    return f'<div class="flex items-center" role="img">{"".join(out)}</div>'


def stepper_timed(current, times):
    """The four steps across the hero, each with its label and the time it was done."""
    cols = []
    for i, (_, label) in enumerate(PHASES):
        line = "" if i == 3 else f'<span class="absolute left-[calc(50%+26px)] right-[calc(-50%+26px)] top-[21px] h-0.5 {"bg-primary" if i < current else "bg-surface-container-highest"}"></span>'
        cols.append(f"""<li class="relative flex w-[132px] flex-col items-center text-center">{line}
  <span class="grid h-11 place-items-center">{step_dot(i, current)}</span>
  <span class="mt-2 text-title-s {"text-on-surface" if i <= current else "text-on-surface-variant"}">{label}</span>
  <span class="mt-0.5 h-4 text-body-s text-on-surface-variant">{times[i]}</span>
</li>""")
    return f'<ol class="flex" aria-label="Tiến trình">{"".join(cols)}</ol>'


def crumbs(*parts):
    links = "".join(a(f"crumb-{i}", "hover:underline", p) + icon("chevron-right-rounded", 16) for i, p in enumerate(parts[:-1]))
    return f'<nav class="mt-6 flex items-center gap-1.5 text-body-s text-on-surface-variant">{links}<span class="text-on-surface">{parts[-1]}</span></nav>'


def hero(art, title, facts, end=""):
    line = "".join(f'<span class="flex items-center gap-1.5">{icon(i, 18)}{t}</span>' for i, t in facts)
    return f"""<section class="mt-4 flex items-center gap-8 rounded-xl bg-surface-container-low py-6 pl-6 pr-10">
  <img src="{ART[art]}" alt="" class="h-[150px] w-[150px] shrink-0">
  <div class="min-w-0 flex-1"><h1 class="text-display-s">{title}</h1><p class="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-l text-on-surface-variant">{line}</p></div>
  {end}
</section>"""


def heading(text):
    return f'<h2 class="mb-3 ml-4 text-title-s text-primary">{text}</h2>'


def row(ic, title, sub="", trailing="", cls="bg-surface-container-low"):
    sub_html = f'<span class="block text-body-s text-on-surface-variant">{sub}</span>' if sub else ""
    return f"""<div class="flex min-h-[56px] items-center gap-4 py-3 pl-5 pr-3 {cls}">
  <span class="text-on-surface-variant">{icon(ic, 24)}</span>
  <span class="min-w-0 flex-1"><span class="block text-body-l text-on-surface">{title}</span>{sub_html}</span>
  {trailing}
</div>"""


# ------------------------------------------------------------------ Đơn hàng --
# phase: the step in progress (4 = all done). action: stars | create | None (the row itself opens the order).
BUYING = [
    dict(photo="1510557880182-3d4d3cba35a5", title="iPhone X 64GB, pin 86%", who="Hoàng Nam", price=3_800_000,
         phase=2, line=("local-shipping-outline-rounded", "Chờ giao hàng")),
    dict(photo="1632661674596-df8be070a5c5", title="iPhone 13 Pro 128GB Xanh Sierra, pin 88%", who="Tuấn Kiệt", price=5_100_000,
         phase=1, line=("hourglass-top-rounded", "Chờ người bán tạo đơn")),
    dict(photo="1505740420928-5e560c06d30e", title="Tai nghe chống ồn Sony WH-1000XM4, fullbox", who="Quốc Bảo", price=3_100_000,
         phase=3, line=("package-2-outline-rounded", "Đã nhận hàng · 12/10"), action="stars"),
    dict(photo="1526170375885-4d8ecf77b99f", title="Máy ảnh Polaroid OneStep 2, tặng 1 hộp film", who="Lan Anh", price=1_650_000,
         phase=4, line=("star-rounded", "5 sao cho Lan Anh"), filled=True),
    dict(photo="1580480055273-228ff5388ef8", title="Ghế xoay vải be chân gỗ, ngồi êm", who="Gia Bảo", price=900_000,
         phase=2, line=("undo-rounded", "Giao không thành"), muted=True),
    dict(photo="1507035895480-2b3156c31fc8", title="Xe đạp fixed gear khung thép, vừa thay lốp", who="Ngọc Hân", price=2_200_000,
         phase=1, line=("cancel-outline-rounded", "Đã hủy đơn"), muted=True),
]


def order_row(o):
    if o.get("action") == "stars":
        act = ('<div class="flex" role="radiogroup" aria-label="Đánh giá ' + o["who"] + '">' + "".join(
            f'<button type="button" class="state grid h-10 w-10 place-items-center rounded-full text-outline-variant" aria-label="{n} sao">{icon("star-rounded", 26)}</button>'
            for n in range(1, 6)) + "</div>")
    else:
        act = f'<span class="text-on-surface-variant">{icon("chevron-right-rounded", 24)}</span>'
    ic, text = o["line"]
    return f"""<article class="row-hover flex cursor-pointer items-center gap-5 rounded-xl bg-surface-container-low p-4 {"opacity-70" if o.get("muted") else ""}">
  <img src="{img(o["photo"], 200, 200)}" alt="" class="h-[72px] w-[72px] shrink-0 rounded-lg object-cover">
  <div class="min-w-0 flex-1">
    <div class="flex items-start gap-4">
      <h3 class="min-w-0 flex-1 truncate text-title-m">{escape(o["title"])}</h3>
      <p class="whitespace-nowrap text-title-m">{vnd(o["price"])}<span class="text-body-m text-on-surface-variant"> ₫</span></p>
    </div>
    <p class="mt-1 flex items-center gap-1.5 text-body-m text-on-surface-variant">{face(o["who"])}{o["who"]}<span aria-hidden="true">·</span>{icon("local-shipping-outline-rounded", 16)}COD</p>
    <div class="mt-3 flex h-10 items-center gap-6">
      {stepper(o["phase"])}
      <p class="flex items-center gap-1.5 text-body-m text-on-surface-variant">{icon(ic, 18, "text-primary" if o.get("filled") else "")}{text}</p>
      <span class="flex-1"></span>
      {act}
    </div>
  </div>
</article>"""


def orders():
    side = "".join(f'<span role="radio" aria-checked="{str(i == 0).lower()}" class="state text-label-l">{icon(ic, 18)}{t} · {n}</span>'
                   for i, (t, ic, n) in enumerate([("Mua", "shopping-bag-outline-rounded", len(BUYING)), ("Bán", "storefront-outline-rounded", 3)]))
    slots = "".join(f'<span class="h-3 flex-1 rounded-full {"bg-primary" if i < 2 else "bg-surface-container-highest"}"></span>' for i in range(5))
    body = f"""
    <div class="mt-10 flex items-end justify-between">
      <div><p class="text-label-l uppercase tracking-[0.12em] text-primary">Tài khoản</p><h1 class="mt-2 text-display-s">Đơn hàng</h1></div>
      <div class="seg w-[280px]" role="radiogroup" aria-label="Loại đơn">{side}</div>
    </div>
    <div class="mt-8 grid grid-cols-[1fr_340px] gap-8">
      <section class="flex flex-col gap-3">{"".join(order_row(o) for o in BUYING)}</section>
      <aside class="flex flex-col gap-4 self-start">
        <div class="rounded-xl bg-surface-container-low p-6">
          <p class="text-title-m">Đơn COD đang mở</p>
          <p class="mt-2"><span class="text-display-s">2</span><span class="text-title-l text-on-surface-variant">/5</span></p>
          <div class="mt-3 flex gap-1.5">{slots}</div>
          <div class="mt-5 flex flex-col gap-2.5 border-t border-outline-variant pt-4">{money("cod_buyer", "inventory-2-outline-rounded")}</div>
        </div>
        <div class="flex items-center gap-4 overflow-hidden rounded-xl bg-secondary-container py-3 pl-3 pr-5">
          <img src="{ART["art_orders"]}" alt="" class="h-[104px] w-[104px] shrink-0">
          <div><p class="text-title-m">Đang bán đồ?</p><p class="mt-1 text-body-m text-on-secondary-container">Đơn người khác mua của bạn nằm ở mục Bán.</p>{a("to-selling", "mt-2 inline-flex items-center gap-1 text-label-l text-primary hover:underline", "Xem 3 đơn bán" + icon("arrow-forward-rounded", 16))}</div>
        </div>
      </aside>
    </div>"""
    return page("Đơn hàng", body)


# ------------------------------------------------------------------- Đơn COD --
CODE = "S1.A1.17373471"


def order():
    events = [("Đang giao hàng", "Hôm nay 08:05"), ("Đến kho Bình Thạnh", "Hôm qua 21:10"), ("Đã lấy hàng", "Hôm qua 16:40")]
    ev = "".join(f'<li class="flex items-start gap-3 py-2"><span class="mt-1.5 h-2 w-2 shrink-0 rounded-full {"bg-primary" if i == 0 else "bg-outline-variant"}"></span>'
                 f'<span class="flex-1 text-body-l">{t}</span><span class="text-body-s text-on-surface-variant">{w}</span></li>' for i, (t, w) in enumerate(events))
    track = a("ghtk-track", "state grid h-10 shrink-0 place-items-center rounded-full px-3 text-label-l text-primary", "Tra mã", f"https://i.ghtk.vn/{CODE}")
    body = f"""
    {crumbs("Đơn hàng", "iPhone X 64GB")}
    {hero("art_cod_placed", "Chờ giao hàng", [("receipt-long-outline-rounded", "GHTK · " + CODE)],
          stepper_timed(2, ["Hôm qua · 09:15", "Hôm qua · 10:02", "", ""]))}
    <div class="mt-8 grid grid-cols-[1fr_420px] gap-8">
      <div class="flex flex-col gap-8">
        <section class="rounded-xl bg-surface-container-low p-2">
          <button type="button" class="state flex w-full items-center gap-4 rounded-lg p-3 text-left">
            {icon("fact-check-outline-rounded", 24, "text-on-surface-variant")}
            <span class="min-w-0 flex-1"><span class="block text-body-s text-on-surface-variant">Tin ghi</span><span class="block text-body-l">Pin 86% · Bản quốc tế, đã mở mạng</span></span>
            {icon("chevron-right-rounded", 24, "text-on-surface-variant")}
          </button>
          <div class="px-3 pb-3 pt-1">{money("refuse", "undo-rounded")}</div>
        </section>
        <div class="grid grid-cols-2 gap-6">
          <section>
            {heading("Vận đơn")}
            <div class="group flex flex-col gap-0.5">{row("receipt-long-outline-rounded", "GHTK · " + CODE, "Mã vận đơn", track + COPY)}</div>
            <div class="mt-3 rounded-xl bg-surface-container-low px-5 py-4">
              <h3 class="text-title-s text-primary">GHTK báo</h3>
              <ul class="mt-1">{ev}</ul>
            </div>
          </section>
          <section>
            {heading("Giao đến")}
            <div class="group flex flex-col gap-0.5">{row("location-on-outline-rounded", "12 Nguyễn Văn Đậu, Phường Bình Thạnh, TP.HCM", "Khánh Linh · 09•• ••• 812", COPY)}</div>
            <div class="group mt-3 flex flex-col gap-0.5">{row("tag-rounded", "SNX 5521 0937", "Mã đơn")}</div>
          </section>
        </div>
      </div>

      <aside class="ticket self-start">
        <div>
          <div class="flex items-center gap-3">
            <img src="{img("1510557880182-3d4d3cba35a5", 160, 160)}" alt="" class="h-14 w-14 rounded-lg object-cover">
            <div class="min-w-0 flex-1"><p class="truncate text-title-m">iPhone X 64GB, pin 86%</p><p class="text-body-m text-on-surface-variant">3.800.000 ₫</p></div>
          </div>
          <div class="mt-4 flex items-center gap-3">
            {face("Hoàng Nam", 40)}
            <div class="min-w-0 flex-1"><p class="text-title-s">Hoàng Nam</p><p class="flex items-center gap-1 text-body-s text-on-surface-variant">4,7{icon("star-rounded", 14)}· 12 đã bán</p></div>
            {a("chat-seller", TONAL_ICON, icon("chat-outline-rounded", 20))}
          </div>
        </div>
        <div>
          <p class="text-body-m text-on-surface-variant">Trả khi nhận</p>
          <p class="mt-1"><span class="text-display-m">3.822.000</span><span class="text-title-l text-on-surface-variant"> ₫</span></p>
          <div class="mt-4 flex flex-col gap-2 text-body-m">
            <p class="flex justify-between"><span class="text-on-surface-variant">Tiền hàng</span><span class="flex items-center gap-1.5 text-tertiary">{icon("handshake-outline-rounded", 18)}3.800.000 ₫</span></p>
            <p class="flex justify-between"><span class="text-on-surface-variant">Phí ship · GHTK Giao nhanh</span><span>22.000 ₫</span></p>
          </div>
          <div class="mt-5 flex flex-col gap-2.5">{money("pay_shipper", "payments-outline-rounded")}</div>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" class="state flex h-12 shrink-0 items-center gap-2 rounded-full px-3 text-label-l text-primary">{icon("help-outline-rounded", 20)}Báo chưa nhận hàng</button>
          <button type="button" class="state flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary text-label-l text-on-primary">{icon("package-2-outline-rounded", 20)}Đã nhận hàng</button>
        </div>
      </aside>
    </div>"""
    return page("Đơn COD", body)


# ------------------------------------------------------------------- Đơn bán --
def radio(title, sub="", end="", checked=False):
    ring = "border-primary" if checked else "border-on-surface-variant"
    dot = '<span class="h-2.5 w-2.5 rounded-full bg-primary"></span>' if checked else ""
    sub_html = f'<span class="block text-body-s text-on-surface-variant">{sub}</span>' if sub else ""
    end_html = f'<span class="shrink-0 text-title-s">{end}</span>' if end else ""
    return f"""<label class="state -mx-3 flex min-h-[48px] cursor-pointer items-center gap-4 rounded-lg px-3 py-1.5" role="radio" aria-checked="{str(checked).lower()}">
  <span class="grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 {ring}">{dot}</span>
  <span class="min-w-0 flex-1"><span class="block text-body-l">{title}</span>{sub_html}</span>{end_html}
</label>"""


def ship():
    carriers = "".join(f'<span role="radio" aria-checked="{str(i == 0).lower()}" class="state text-label-l">{icon("check-rounded", 18) if i == 0 else ""}{c}</span>'
                       for i, c in enumerate(["GHTK", "GHN", "Tự gửi"]))
    form = f"""<div class="grid grid-cols-2 gap-10 rounded-xl bg-surface-container-low p-6">
  <div>
    <label class="block rounded-t-sm border-b border-on-surface-variant bg-surface-container-highest px-4 py-2">
      <span class="block text-body-s text-on-surface-variant">Khối lượng</span>
      <span class="flex items-baseline gap-2"><span class="flex-1 text-body-l">2</span><span class="text-body-l text-on-surface-variant">kg</span></span>
    </label>
    <h3 class="mt-6 text-title-s">Dịch vụ</h3>
    <div class="mt-1">{radio("Giao nhanh", "1–2 ngày", "22.000 ₫", True)}{radio("Tiết kiệm", "2–4 ngày", "16.000 ₫")}</div>
  </div>
  <div>
    <h3 class="text-title-s">Cách lấy hàng</h3>
    <div class="mt-1">{radio("Lấy tại nhà", "Shipper tới lấy", checked=True)}{radio("Gửi tại bưu cục", "Bạn mang ra bưu cục gần nhất")}</div>
    <h3 class="mt-5 text-title-s">Lấy hàng tại</h3>
    <p class="mt-2 text-body-s text-on-surface-variant">Kho trên GHTK</p>
    {radio("Kho Bình Thạnh", "12 Nơ Trang Long, Phường Bình Thạnh", checked=True)}
    <p class="mt-2 text-body-s text-on-surface-variant">Địa chỉ của bạn</p>
    {radio("Nhà", "18 Đinh Bộ Lĩnh, Phường Bình Thạnh")}{radio("Công ty", "60 Nguyễn Đình Chiểu, Phường Sài Gòn")}
  </div>
</div>"""
    cancel = '<button type="button" class="state h-10 shrink-0 rounded-full px-4 text-label-l text-primary">Hủy đơn</button>'
    body = f"""
    {crumbs("Đơn hàng", "Bán", "Ghế đôn gỗ cao")}
    {hero("art_orders", "Tạo đơn cho Đức Huy", [("schedule-outline-rounded", "Chờ từ 09:12")], cancel)}
    <div class="mt-8 grid grid-cols-[1fr_420px] gap-8">
      <div class="flex flex-col gap-8">
        <section>
          {heading("Giao đến")}
          <div class="group flex flex-col gap-0.5">{row("location-on-outline-rounded", "45 Phan Xích Long, Phường Cầu Kiệu, TP.HCM", "Đức Huy · 09•• ••• 345")}</div>
        </section>
        <section>
          {heading("Gửi bằng")}
          <div class="seg w-[420px]" role="radiogroup" aria-label="Gửi bằng">{carriers}</div>
          <div class="mb-4 mt-2 flex items-center justify-between pl-4">
            <p class="text-body-s text-on-surface-variant">Tạo vận đơn trên tài khoản GHTK S55163 của bạn</p>
            <button type="button" class="state flex h-10 items-center gap-2 rounded-full px-3 text-label-l text-primary">{icon("add-business-outline-rounded", 20)}Hãng của bạn chưa có?</button>
          </div>
          {form}
        </section>
      </div>

      <aside class="ticket self-start">
        <div>
          <div class="flex items-center gap-3">
            <img src="{img("1503602642458-232111445657", 160, 160)}" alt="" class="h-14 w-14 rounded-lg object-cover">
            <div class="min-w-0 flex-1"><p class="truncate text-title-m">Ghế đôn gỗ cao</p><p class="text-body-m text-on-surface-variant">350.000 ₫</p></div>
          </div>
          <div class="mt-4 flex items-center gap-3">
            {face("Đức Huy", 40)}
            <div class="min-w-0 flex-1"><p class="text-title-s">Đức Huy</p><p class="text-body-s text-on-surface-variant">Phường Cầu Kiệu · giao COD</p></div>
            {a("chat-buyer", TONAL_ICON, icon("chat-outline-rounded", 20))}
          </div>
        </div>
        <div>
          <p class="text-body-m text-on-surface-variant">Người mua trả shipper</p>
          <p class="mt-1"><span class="text-display-m">372.000</span><span class="text-title-l text-on-surface-variant"> ₫</span></p>
          <div class="mt-4 flex flex-col gap-2 text-body-m">
            <p class="flex justify-between"><span class="text-on-surface-variant">Tiền hàng COD</span><span class="flex items-center gap-1.5 text-tertiary">{icon("handshake-outline-rounded", 18)}350.000 ₫</span></p>
            <p class="flex justify-between"><span class="text-on-surface-variant">Phí ship người mua trả</span><span>22.000 ₫</span></p>
          </div>
          <div class="mt-4 flex items-center gap-3 rounded-lg bg-surface-container px-4 py-3">
            {icon("account-balance-outline-rounded", 22, "text-on-surface-variant")}
            <span class="flex-1"><span class="block text-body-l">Tiền COD về tài khoản GHTK</span><span class="block text-body-s text-on-surface-variant">GHTK S55163 · đứng tên bạn</span></span>
          </div>
          <div class="mt-4 flex flex-col gap-2.5">{money("cod_seller", "local-shipping-outline-rounded")}{money("return_leg", "undo-rounded")}</div>
          <p class="mt-4 flex items-center gap-2 text-body-s text-on-surface-variant">{icon("tag-rounded", 16)}Mã đơn SNX 8841 2207</p>
        </div>
        <div>
          <button type="button" class="state flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-label-l text-on-primary">{icon("receipt-long-outline-rounded", 20)}Tạo đơn</button>
        </div>
      </aside>
    </div>"""
    return page("Đơn bán", body)


if __name__ == "__main__":
    # Writing would put the old look back over the J pages.
    print("superseded: run build_j_orders.py")
