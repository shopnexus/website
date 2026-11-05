"""Orders, in the chosen style: Đơn hàng (the buyer's list), Đơn COD (one order
at the door) and Đơn bán (the seller creates and ships a COD order).

    python3 tools/build_orders.py        (run from .superdesign/)
"""
import json
import os
from html import escape

from build import OUT, a
from build_c import ART, CSS, footer, header
from build_chat_cod import stepper, stepper_labelled
from common import head, icon, img

HERE = os.path.dirname(os.path.abspath(__file__))
ART = dict(ART, **json.load(open(os.path.join(HERE, "art_sh.json"))))

# Verbatim from app/.superdesign/tools/common.py MONEY.
MONEY = dict(
    no_hold="ShopNexus không giữ tiền và không nhận cọc.",
    cod_buyer="Xem hàng rồi mới trả tiền hàng và phí ship cho shipper.",
    cancel="Bạn hủy được đơn khi người bán chưa gửi hàng và không mất tiền.",
    refuse="Nếu không ưng, bạn từ chối nhận hàng và không mất tiền.",
    after_pay="Sau khi bạn trả tiền, ShopNexus không đòi lại tiền được. Nếu hàng có vấn đề, bạn mở ghi nhận trong chat.",
    cod_seller="Bên vận chuyển chuyển tiền hàng cho bạn 1–2 ngày sau khi người mua nhận.",
    return_leg="Người mua từ chối nhận thì bạn trả phí ship cả chiều đi và chiều về.",
    refused_stat="Từ chối nhận được tính vào chỉ số 90 ngày của bạn.",
    pay_shipper="Trả tiền hàng và phí ship cho shipper sau khi xem, bằng tiền mặt hoặc chuyển khoản.",
)

PAGE_CSS = CSS + """
  .row-hover:hover { background: var(--md-surface-container); }
"""

FACE = {"Hoàng Nam": "1500648767791-00dcc994a43e", "Tuấn Kiệt": "1544723795-3fb6469f5b39", "Ngọc Hân": "1494790108377-be9c29b29330",
        "Lan Anh": "1534528741775-53994a69daeb", "Quốc Bảo": "1507003211169-0a1dd7228f2d", "Gia Bảo": "1506794778202-cad84cf45f1d",
        "Đức Huy": "1500648767791-00dcc994a43e", "Khánh Linh": "1494790108377-be9c29b29330"}


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


# ------------------------------------------------------------------ Đơn hàng --
ORDERS = [
    dict(photo="1510557880182-3d4d3cba35a5", title="iPhone X 64GB, pin 86%, máy zin", who="Hoàng Nam", ship="COD · GHTK", price=3_800_000,
         step=2, line=("door-front-outline-rounded", "Shipper đang ở cửa", "text-primary"), action="view", tab="Đang giao"),
    dict(photo="1632661674596-df8be070a5c5", title="iPhone 13 Pro 128GB Xanh Sierra, pin 88%", who="Tuấn Kiệt", ship="COD", price=5_200_000,
         step=0, line=("sell-outline-rounded", "Bạn trả 5.100.000 ₫ · chờ Tuấn Kiệt trả lời", "text-tertiary"), action="chat", tab="Đang thương lượng", offer=True),
    dict(photo="1526170375885-4d8ecf77b99f", title="Máy ảnh Polaroid OneStep 2, tặng 1 hộp film", who="Lan Anh", ship="COD", price=1_650_000,
         step=1, line=("receipt-long-outline-rounded", "Chờ Lan Anh tạo đơn", "text-on-surface-variant"), action="cancel", tab="Chờ người bán tạo đơn"),
    dict(photo="1507035895480-2b3156c31fc8", title="Xe đạp fixed gear khung thép, vừa thay lốp", who="Ngọc Hân", ship="Tự gửi · SPX", price=2_200_000,
         step=1, line=("local-shipping-outline-rounded", "Chờ Ngọc Hân gửi qua SPX", "text-on-surface-variant"), action=None, tab="Đang giao"),
    dict(photo="1505740420928-5e560c06d30e", title="Tai nghe chống ồn Sony WH-1000XM4, fullbox", who="Quốc Bảo", ship="COD · GHN", price=3_100_000,
         step=3, line=("inventory-2-outline-rounded", "Đã xem và trả shipper · 12/10", "text-on-surface-variant"), action="rate", tab="Đã nhận"),
    dict(photo="1580480055273-228ff5388ef8", title="Ghế xoay vải be chân gỗ, ngồi êm", who="Gia Bảo", ship="COD · GHTK", price=900_000,
         step=2, line=("undo-rounded", "Bạn đã từ chối nhận · 03/10", "text-on-surface-variant"), action=None, tab="Đã hủy, từ chối", muted=True),
]


def order_row(o, i):
    act = {
        "view": f'{a("order-open", "state flex h-10 items-center gap-2 rounded-full bg-primary-container px-5 text-label-l text-on-primary-container", icon("visibility-outline-rounded", 18) + "Xem hàng")}',
        "chat": f'{a("chat-open", "state flex h-10 items-center gap-2 rounded-full bg-secondary-container px-5 text-label-l text-on-secondary-container", icon("chat-outline-rounded", 18) + "Mở chat")}',
        "cancel": '<button type="button" class="state flex h-10 items-center gap-2 rounded-full bg-surface-container-highest px-5 text-label-l text-on-surface">' + icon("close-rounded", 18) + "Hủy đơn</button>",
        "rate": '<div class="flex" aria-label="Chấm sao cho Quốc Bảo">' + "".join(f'<button type="button" class="state grid h-10 w-10 place-items-center rounded-full text-on-surface-variant" aria-label="{n} sao">{icon("star-outline-rounded", 24)}</button>' for n in range(1, 6)) + "</div>",
        None: "",
    }[o["action"]]
    ic, text, tone = o["line"]
    price_cls = "text-tertiary" if o.get("offer") else "text-on-surface"
    return f"""<article class="row-hover flex items-center gap-5 rounded-xl bg-surface-container-low p-4 {"opacity-70" if o.get("muted") else ""}">
  <img src="{img(o["photo"], 200, 200)}" alt="" class="h-[88px] w-[88px] shrink-0 rounded-lg object-cover">
  <div class="min-w-0 flex-1">
    <div class="flex items-start gap-4">
      <h3 class="min-w-0 flex-1 truncate text-title-m">{escape(o["title"])}</h3>
      <p class="whitespace-nowrap text-title-m {price_cls}">{vnd(o["price"])}<span class="text-body-m text-on-surface-variant"> ₫</span></p>
    </div>
    <p class="mt-1 flex items-center gap-1.5 text-body-m text-on-surface-variant">{face(o["who"])}{o["who"]}<span>·</span>{icon("local-shipping-outline-rounded", 16)}{o["ship"]}</p>
    <div class="mt-3 flex items-center gap-6">
      {stepper(o["step"], gap=20)}
      <p class="flex items-center gap-1.5 text-body-m {tone}">{icon(ic, 18)}{text}</p>
      <span class="flex-1"></span>
      {act}
    </div>
  </div>
</article>"""


def orders():
    tabs = [("Tất cả", 6), ("Đang thương lượng", 1), ("Chờ người bán tạo đơn", 1), ("Đang giao", 2), ("Đã nhận", 1), ("Đã hủy, từ chối", 1)]
    tab_html = "".join(f'<button type="button" class="state flex h-10 items-center gap-2 rounded-full px-4 text-label-l {"bg-secondary-container text-on-secondary-container" if i == 0 else "border border-outline-variant text-on-surface-variant"}">{t}<span class="text-label-m opacity-70">{n}</span></button>'
                       for i, (t, n) in enumerate(tabs))
    side = "".join(f'<span class="flex h-12 flex-1 items-center justify-center gap-2 text-label-l {"bg-secondary-container text-on-secondary-container" if i == 0 else "text-on-surface-variant"}">{icon(ic, 20)}{t}<span class="text-label-m opacity-70">{n}</span></span>'
                   for i, (t, ic, n) in enumerate([("Mua", "shopping-bag-outline-rounded", 6), ("Bán", "storefront-outline-rounded", 3)]))
    slots = "".join(f'<span class="h-3 flex-1 rounded-full {"bg-primary" if i < 2 else "bg-surface-container-highest"}"></span>' for i in range(5))
    body = f"""
    <div class="mt-10 flex items-end justify-between">
      <div><p class="text-label-l uppercase tracking-[0.12em] text-primary">Tài khoản</p><h1 class="mt-2 text-display-s">Đơn hàng</h1></div>
      <div class="flex w-[300px] overflow-hidden rounded-full border border-outline-variant">{side}</div>
    </div>
    <div class="mt-8 grid grid-cols-[1fr_340px] gap-8">
      <section>
        <div class="flex flex-wrap gap-2">{tab_html}</div>
        <div class="mt-6 flex flex-col gap-3">{"".join(order_row(o, i) for i, o in enumerate(ORDERS))}</div>
      </section>
      <aside class="flex flex-col gap-4 self-start">
        <div class="rounded-xl bg-surface-container-low p-6">
          <p class="text-title-m">Đơn COD đang mở</p>
          <p class="mt-2"><span class="text-display-s">2</span><span class="text-title-l text-on-surface-variant">/5</span></p>
          <div class="mt-3 flex gap-1.5">{slots}</div>
          <p class="mt-4 text-body-m text-on-surface-variant">Mỗi yêu cầu COD dùng một lượt. Lượt trả lại khi đơn đã nhận, đã hủy hoặc bị từ chối.</p>
          <div class="mt-4 flex flex-col gap-2.5 border-t border-outline-variant pt-4">{money("cod_buyer", "inventory-2-outline-rounded")}{money("no_hold", "account-balance-outline-rounded")}</div>
        </div>
        <div class="flex items-center gap-4 overflow-hidden rounded-xl bg-secondary-container py-3 pl-3 pr-5">
          <img src="{ART["art_orders"]}" alt="" class="h-[104px] w-[104px] shrink-0">
          <div><p class="text-title-m">Đang bán đồ?</p><p class="mt-1 text-body-m text-on-secondary-container">Đơn người khác mua của bạn nằm ở mục Bán.</p>{a("to-selling", "mt-2 inline-flex items-center gap-1 text-label-l text-primary hover:underline", "Xem 3 đơn bán" + icon("arrow-forward-rounded", 16))}</div>
        </div>
      </aside>
    </div>"""
    return page("Đơn hàng", body)


# ------------------------------------------------------------------- Đơn COD --
def hero(shape_cls, ic, title, line, step, extra=""):
    return f"""<section class="mt-6 flex items-center gap-8 rounded-xl bg-surface-container-low p-8">
  <span class="grid h-24 w-24 shrink-0 place-items-center {shape_cls}">{icon(ic, 44)}</span>
  <div class="min-w-0 flex-1"><h1 class="text-display-s">{title}</h1><p class="mt-2 flex items-center gap-2 text-body-l text-on-surface-variant">{line}</p>{extra}</div>
  {stepper_labelled(step)}
</section>"""


def timeline(rows):
    """rows: (icon, title, value, state) with state done | now | todo."""
    out = []
    for i, (ic, title, value, state) in enumerate(rows):
        dot = {"done": "bg-primary text-on-primary", "now": "bg-primary-container text-on-primary-container", "todo": "bg-surface-container-highest text-on-surface-variant"}[state]
        line = "" if i == len(rows) - 1 else f'<span class="absolute left-[19px] top-10 h-[calc(100%-24px)] w-0.5 {"bg-primary" if state == "done" else "bg-surface-container-highest"}"></span>'
        out.append(f"""<li class="relative flex gap-4 pb-6">{line}
  <span class="relative grid h-10 w-10 shrink-0 place-items-center rounded-full {dot}">{icon(ic, 20)}</span>
  <div class="flex flex-1 items-start justify-between pt-2"><p class="text-body-l {"text-on-surface" if state != "todo" else "text-on-surface-variant"}">{title}</p><p class="text-body-m text-on-surface-variant">{value}</p></div>
</li>""")
    return f'<ol>{"".join(out)}</ol>'


def order():
    events = [("Đã lấy hàng tại Q.3", "09:40"), ("Đang trung chuyển, kho Bình Thạnh", "11:15"), ("Đang giao cho bạn", "13:05"), ("Shipper đang ở cửa", "15:12")]
    ev = "".join(f'<li class="flex gap-3 py-2"><span class="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary"></span><span class="flex-1 text-body-m">{t}</span><span class="text-body-s text-on-surface-variant">{h}</span></li>' for t, h in events)
    states = [
        ("Đơn tự gửi · SPX", "local-shipping-outline-rounded", "bg-surface-container-low",
         f'<p class="text-body-m">Mã vận đơn SPX <b class="font-mono font-medium">SPXVN04471923</b> {a("spx-track", "ml-1 text-label-l text-primary hover:underline", "Tra mã")}</p>'
         '<p class="mt-2 text-body-m text-on-surface-variant">ShopNexus không theo dõi được đơn tự gửi.</p>'
         '<div class="mt-4 flex gap-2"><button type="button" class="state h-10 flex-1 rounded-full bg-surface-container-highest text-label-l">Không nhận</button><button type="button" class="state h-10 flex-1 rounded-full bg-secondary-container text-label-l text-on-secondary-container">Đã nhận hàng</button></div>'),
        ("Đã nhận", "inventory-2-outline-rounded", "bg-surface-container-low",
         '<p class="text-body-m">Chấm sao cho Hoàng Nam để hoàn tất đơn.</p><div class="mt-3 flex">' + "".join(f'<span class="grid h-10 w-10 place-items-center text-on-surface-variant">{icon("star-outline-rounded", 26)}</span>' for _ in range(5)) + "</div>"
         '<p class="mt-2 text-body-m text-on-surface-variant">Máy có vấn đề? Mở ghi nhận kèm ảnh.</p>'),
        ("Đã từ chối nhận", "undo-rounded", "bg-surface-container-low",
         '<p class="text-body-m">Máy được gửi trả cho Hoàng Nam.</p>' + money("refused_stat", "query-stats-rounded", "mt-2 text-on-surface-variant")),
    ]
    state_html = "".join(f'<article class="rounded-xl {bg} p-5"><p class="flex items-center gap-2 text-title-m">{icon(ic, 20, "text-on-surface-variant")}{t}</p><div class="mt-3">{body}</div></article>' for t, ic, bg, body in states)
    record = f"""<section class="mt-8 rounded-xl bg-surface-container-low p-8">
  <div class="flex items-start gap-8">
    <div class="flex-1">
      <h2 class="text-headline-s">Máy có vấn đề sau khi nhận?</h2>
      <p class="mt-2 max-w-[560px] text-body-l text-on-surface-variant">Mở ghi nhận kèm một tấm ảnh và vài dòng mô tả. Hoàng Nam tự hoàn tiền cho bạn hoặc từ chối; ghi nhận bị từ chối hiện trên hồ sơ của người bán.</p>
      <ul class="mt-5 grid grid-cols-3 gap-3">
        <li class="rounded-lg bg-surface-container-lowest p-4"><p class="flex items-center gap-2 text-title-s">{icon("add-a-photo-outline-rounded", 20, "text-primary")}Ảnh và mô tả</p><p class="mt-1 text-body-m text-on-surface-variant">Chụp chỗ có vấn đề, ghi điều bạn thấy.</p></li>
        <li class="rounded-lg bg-surface-container-lowest p-4"><p class="flex items-center gap-2 text-title-s">{icon("auto-awesome-rounded", 20, "text-primary")}Một ghi chú trung lập</p><p class="mt-1 text-body-m text-on-surface-variant">AI so tin đăng với ảnh của bạn, viết một ghi chú cho cả hai bên.</p></li>
        <li class="rounded-lg bg-surface-container-lowest p-4"><p class="flex items-center gap-2 text-title-s">{icon("gavel-rounded", 20, "text-on-surface-variant")}Người bán quyết định</p><p class="mt-1 text-body-m text-on-surface-variant">ShopNexus không phân xử ai đúng ai sai.</p></li>
      </ul>
    </div>
    <img src="{ART["art_received"]}" alt="" class="h-[180px] w-[180px] shrink-0">
  </div>
  <div class="mt-5 flex items-center gap-4"><button type="button" class="h-12 rounded-full bg-on-surface/10 px-6 text-label-l text-on-surface/40" disabled>Mở ghi nhận</button><span class="text-body-m text-on-surface-variant">Mở được sau khi bạn nhận hàng.</span></div>
</section>"""
    body = f"""
    <nav class="mt-6 flex items-center gap-1.5 text-body-s text-on-surface-variant">{a("crumb-orders", "hover:underline", "Đơn hàng")}{icon("chevron-right-rounded", 16)}<span class="text-on-surface">iPhone X 64GB</span></nav>
    {hero("rounded-[38%] bg-primary-container text-on-primary-container", "door-front-outline-rounded", "Shipper đang ở cửa", icon("visibility-outline-rounded", 20) + "Xem hàng trước khi trả", 2)}
    <div class="mt-8 grid grid-cols-[1fr_440px] gap-8">
      <div>
        <section class="rounded-xl bg-surface-container-low p-6">
          <button type="button" class="state flex w-full items-center gap-4 rounded-lg bg-surface-container px-4 py-3 text-left">
            {icon("fact-check-outline-rounded", 24, "text-on-surface-variant")}
            <span class="min-w-0 flex-1"><span class="block text-body-l">Tin ghi · Pin 86% · Bản quốc tế, đã mở mạng</span><span class="block text-body-s text-on-surface-variant">Kèm cách tự kiểm khi nhận hàng</span></span>
            {icon("chevron-right-rounded", 24, "text-on-surface-variant")}
          </button>
          {money("refuse", "undo-rounded", "mt-3 text-on-surface")}
        </section>
        <section class="mt-6 grid grid-cols-2 gap-6">
          <div class="rounded-xl bg-surface-container-low p-6">
            <h2 class="text-title-l">Tiến trình</h2>
            <div class="mt-5">{timeline([("sell-rounded", "Đã chốt giá", "10/10", "done"), ("receipt-long-rounded", "Hoàng Nam tạo đơn GHTK", "11/10", "done"),
                                         ("local-shipping-rounded", "Đang giao", "Hôm nay", "done"), ("door-front-outline-rounded", "Xem hàng tại cửa", "Bây giờ", "now"), ("star-outline-rounded", "Đánh giá", "", "todo")])}</div>
          </div>
          <div class="rounded-xl bg-surface-container-low p-6">
            <div class="flex items-center justify-between"><h2 class="text-title-l text-primary">Bên vận chuyển báo</h2><span class="rounded-full bg-surface-container px-3 py-1 text-label-m">GHTK</span></div>
            <p class="mt-2 text-body-m text-on-surface-variant">Mã vận đơn <b class="font-mono font-medium text-on-surface">S55163.SG.8841</b> {a("ghtk-track", "ml-1 text-label-l text-primary hover:underline", "Tra mã")}</p>
            <ul class="mt-3">{ev}</ul>
          </div>
        </section>
        {record}
        <section class="mt-8">
          <h2 class="text-headline-s">Khi đơn sang bước khác</h2>
          <div class="mt-4 grid grid-cols-3 gap-4">{state_html}</div>
        </section>
      </div>

      <aside class="ticket self-start">
        <div>
          <div class="flex items-center gap-3">
            <img src="{img("1510557880182-3d4d3cba35a5", 160, 160)}" alt="" class="h-14 w-14 rounded-lg object-cover">
            <div class="min-w-0 flex-1"><p class="truncate text-title-m">iPhone X 64GB, pin 86%, máy zin</p><p class="flex items-center gap-1.5 text-body-s text-on-surface-variant">{face("Hoàng Nam", 18)}Hoàng Nam · {icon("star-rounded", 13)}4,7 · 12 đã bán</p></div>
          </div>
        </div>
        <div>
          <p class="text-body-m text-on-surface-variant">Trả khi nhận</p>
          <p class="mt-1"><span class="text-display-m">3.822.000</span><span class="text-title-l text-on-surface-variant"> ₫</span></p>
          <div class="mt-4 flex flex-col gap-2 text-body-m">
            <p class="flex justify-between"><span class="text-on-surface-variant">Giá đã chốt</span><span class="flex items-center gap-1.5 text-tertiary">{icon("handshake-outline-rounded", 18)}3.800.000 ₫</span></p>
            <p class="flex justify-between"><span class="text-on-surface-variant">Phí ship GHTK</span><span>22.000 ₫</span></p>
          </div>
          <div class="mt-5 flex flex-col gap-2.5">{money("pay_shipper", "payments-outline-rounded")}{money("after_pay", "info-outline-rounded")}{money("no_hold", "account-balance-outline-rounded")}</div>
        </div>
        <div>
          {a("chat-seller", "state flex h-12 items-center justify-center gap-2 rounded-full bg-secondary-container text-label-l text-on-secondary-container", icon("chat-outline-rounded", 20) + "Nhắn Hoàng Nam")}
          <p class="mt-4 flex gap-2 text-body-m text-on-surface-variant">{icon("block-rounded", 18, "mt-0.5")}<span>Đơn đã gửi đi nên không hủy được nữa. Không ưng thì từ chối nhận tại cửa.</span></p>
        </div>
      </aside>
    </div>"""
    return page("Đơn COD", body)


# ------------------------------------------------------------------- Đơn bán --
def ship():
    carrier = lambda sel, logo, title, sub, extra="": f"""<div role="radio" class="flex cursor-pointer items-start gap-4 rounded-lg p-4 {"bg-secondary-container" if sel else "border border-outline-variant"}">
  <span class="mt-0.5 grid h-5 w-5 place-items-center rounded-full border-2 {"border-primary" if sel else "border-on-surface-variant"}">{'<span class="h-2.5 w-2.5 rounded-full bg-primary"></span>' if sel else ""}</span>
  <span class="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-surface-container-lowest text-label-l {"text-primary" if sel else "text-on-surface-variant"}">{logo}</span>
  <span class="min-w-0 flex-1"><span class="block text-title-m">{title}</span><span class="block text-body-m text-on-surface-variant">{sub}</span>{extra}</span>
</div>"""
    services = "".join(f"""<span role="radio" class="flex flex-1 cursor-pointer items-center justify-between rounded-lg p-4 {"bg-surface-container-lowest ring-2 ring-primary" if sel else "bg-surface-container-lowest"}">
  <span><span class="block text-title-s">{t}</span><span class="block text-body-s text-on-surface-variant">{d}</span></span><span class="text-title-m">{fee}</span></span>"""
                       for t, d, fee, sel in [("Giao nhanh", "1–2 ngày", "22.000 ₫", True), ("Tiết kiệm", "3–4 ngày", "19.000 ₫", False)])
    ghtk_extra = f"""<span class="mt-4 block rounded-lg bg-surface-container-low p-4">
  <span class="flex items-center gap-4"><span class="text-body-m text-on-surface-variant">Khối lượng</span>
    <span class="flex items-center rounded-full bg-surface-container-lowest"><button type="button" class="state grid h-9 w-9 place-items-center rounded-full">{icon("remove-rounded", 18)}</button><span class="w-16 text-center text-title-m">1,5 kg</span><button type="button" class="state grid h-9 w-9 place-items-center rounded-full">{icon("add-rounded", 18)}</button></span>
    <span class="text-body-s text-on-surface-variant">Đến 2 kg 22.000 ₫, mỗi kg thêm 5.000 ₫</span></span>
  <span class="mt-3 flex gap-3">{services}</span>
  <span class="mt-3 flex items-center gap-1.5 text-body-s text-on-surface-variant">{icon("info-outline-rounded", 16)}Phí do GHTK trả về khi tạo đơn.</span>
</span>"""
    other_extra = ('<span class="mt-3 flex gap-2">' + "".join(f'<span class="rounded-full border border-outline-variant px-3 py-1 text-label-l text-on-surface-variant">{c}</span>' for c in ["SPX", "J&amp;T", "Viettel Post"])
                   + '</span><span class="mt-2 block text-body-s text-on-surface-variant">Cần tên đơn vị, mã vận đơn và phí ship.</span>')
    steps = [("photo-camera-outline-rounded", "Chụp món đồ trong app trước khi đóng gói", "Ảnh này dùng khi người mua mở ghi nhận."),
             ("edit-note-outline-rounded", "Ghi mã giao hàng lên gói", "SNX 8841 2207, kèm mã QR cho shipper."),
             ("hail-outline-rounded", "Hẹn lấy hàng hoặc gửi tại bưu cục", "GHTK lấy hàng trong ngày nếu tạo đơn trước 16:00.")]
    step_html = "".join(f'<li class="flex gap-4 rounded-lg bg-surface-container-lowest p-4"><span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-secondary-container text-title-s text-on-secondary-container">{i + 1}</span><div><p class="flex items-center gap-2 text-title-m">{icon(ic, 18, "text-on-surface-variant")}{t}</p><p class="mt-0.5 text-body-m text-on-surface-variant">{d}</p></div></li>'
                        for i, (ic, t, d) in enumerate(steps))
    body = f"""
    <nav class="mt-6 flex items-center gap-1.5 text-body-s text-on-surface-variant">{a("crumb-orders", "hover:underline", "Đơn hàng")}{icon("chevron-right-rounded", 16)}{a("crumb-selling", "hover:underline", "Bán")}{icon("chevron-right-rounded", 16)}<span class="text-on-surface">Ghế đôn gỗ cao</span></nav>
    {hero("rounded-[30%] bg-secondary-container text-on-secondary-container", "receipt-long-outline-rounded", "Tạo đơn cho Đức Huy", icon("schedule-rounded", 20) + "Chờ từ 09:12 · Đức Huy đã chọn giao COD", 1)}
    <div class="mt-8 grid grid-cols-[1fr_440px] gap-8">
      <div class="flex flex-col gap-6">
        <section class="rounded-xl bg-surface-container-low p-6">
          <h2 class="text-title-l">Giao đến</h2>
          <div class="mt-3 flex items-start gap-4 rounded-lg bg-surface-container-lowest p-4">
            {icon("location-on-outline-rounded", 24, "text-primary")}
            <div class="flex-1"><p class="text-title-m">Đức Huy · 0912 ••• 486</p><p class="mt-0.5 text-body-m text-on-surface-variant">42/7 Nguyễn Văn Đậu, Phường Bình Lợi Trung, TP Hồ Chí Minh</p><p class="mt-1 text-body-s text-on-surface-variant">Ghi chú: Gọi trước 15 phút.</p></div>
          </div>
        </section>
        <section class="rounded-xl bg-surface-container-low p-6">
          <h2 class="text-title-l">Đơn vị giao</h2>
          <div class="mt-3 flex flex-col gap-3">
            {carrier(True, "GHTK", "GHTK · S55163", "Tài khoản của bạn · app tạo vận đơn và báo phí", ghtk_extra)}
            {carrier(False, "GHN", "GHN", "Chưa liên kết · " + a("link-ghn", "text-primary hover:underline", "Liên kết tài khoản"))}
            {carrier(False, icon("more-horiz", 20), "Đơn vị khác", "Bạn tự tạo vận đơn rồi nhập vào đây", other_extra)}
          </div>
          <div class="mt-4 flex items-start gap-3 rounded-lg border border-dashed border-outline p-4">
            {icon("keyboard-outline-rounded", 22, "mt-0.5 text-on-surface-variant")}
            <div class="flex-1"><p class="text-title-s">Đã tạo vận đơn trên app GHTK?</p><p class="mt-0.5 text-body-m text-on-surface-variant">Nhập mã vận đơn và phí ship thay vì để app tạo.</p></div>
            <button type="button" class="state h-10 rounded-full border border-outline-variant px-4 text-label-l text-primary">Nhập mã</button>
          </div>
        </section>
        <section class="rounded-xl bg-surface-container-low p-6">
          <h2 class="text-title-l">Sau khi tạo đơn</h2>
          <ol class="mt-3 flex flex-col gap-3">{step_html}</ol>
        </section>
      </div>

      <aside class="ticket self-start">
        <div>
          <div class="flex items-center gap-3">
            <img src="{img("1586023492125-27b2c045efd7", 160, 160)}" alt="" class="h-14 w-14 rounded-lg object-cover">
            <div class="min-w-0 flex-1"><p class="truncate text-title-m">Ghế đôn gỗ cao, chân sắt sơn tĩnh điện</p><p class="flex items-center gap-1.5 text-body-s text-on-surface-variant">{face("Đức Huy", 18)}Người mua: Đức Huy</p></div>
          </div>
        </div>
        <div>
          <p class="text-body-m text-on-surface-variant">Người mua trả shipper</p>
          <p class="mt-1"><span class="text-display-m">372.000</span><span class="text-title-l text-on-surface-variant"> ₫</span></p>
          <div class="mt-4 flex flex-col gap-2 text-body-m">
            <p class="flex justify-between"><span class="text-on-surface-variant">Giá đã chốt (tiền về bạn)</span><span class="flex items-center gap-1.5 text-tertiary">{icon("handshake-outline-rounded", 18)}350.000 ₫</span></p>
            <p class="flex justify-between"><span class="text-on-surface-variant">Phí ship người mua trả</span><span>22.000 ₫</span></p>
          </div>
          <div class="mt-4 flex items-center gap-3 rounded-lg bg-surface-container px-4 py-3">
            {icon("account-balance-outline-rounded", 22, "text-on-surface-variant")}
            <span class="flex-1"><span class="block text-body-l">Tài khoản ngân hàng ở GHTK</span><span class="block text-body-s text-on-surface-variant">GHTK S55163 · đứng tên bạn</span></span>
          </div>
          <div class="mt-4 flex flex-col gap-2.5">{money("cod_seller", "schedule-rounded")}{money("return_leg", "undo-rounded")}{money("no_hold", "info-outline-rounded")}</div>
        </div>
        <div>
          <button type="button" class="state flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-label-l text-on-primary">{icon("receipt-long-rounded", 20)}Tạo đơn GHTK · 22.000 ₫</button>
          <div class="mt-3 grid grid-cols-2 gap-2">
            {a("chat-buyer", "state flex h-11 items-center justify-center gap-2 rounded-full bg-secondary-container text-label-l text-on-secondary-container", icon("chat-outline-rounded", 18) + "Nhắn Đức Huy")}
            <button type="button" class="state flex h-11 items-center justify-center gap-2 rounded-full text-label-l text-error">{icon("close-rounded", 18)}Hủy đơn</button>
          </div>
          <p class="mt-3 text-center text-body-s text-on-surface-variant">Hủy được đến khi gửi hàng.</p>
        </div>
      </aside>
    </div>"""
    return page("Đơn bán", body)


if __name__ == "__main__":
    for name, fn in [("orders", orders), ("order", order), ("ship", ship)]:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(fn())
        print("wrote", name)
