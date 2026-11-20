"""Đơn COD with its steps and what the viewer does next. A "Việc của bạn" card
opens the left column (the one primary move of the state sits in it), and
Hành trình lists the order's steps oldest first: done ones with their time,
the ones to come in grey. Drawn over the live order page in K2.

    python3 tools/build_order_steps.py        (run from .superdesign/)

Writes mockups/order-steps-{buyer,seller}-{desktop,phone}.html: the buyer of a
parcel on its way, the seller of a pending order.
"""
import os

from build import OUT
from build_header import Ids
from build_k2 import SELLERS, out, ri
from build_notif_preview import bar
from common import LOGO, icon, img

PHOTO = "1570222094114-d054a817e56b"  # a blender on a counter
ITEM, PRICE, FEE = "Máy xay sinh tố Philips 2L", 628_000, 22_000
CODE, ORDER = "S22.1184.6630", "SN-145364"
SELLER, BUYER = SELLERS[0], ("Khánh Linh", "1494790108377-be9c29b29330", "")

CSS = """
  .panel { background: #fff; border: 1px solid var(--line); border-radius: 16px; box-shadow: 0 1px 2px rgb(20 20 19 / .04); }
  .next { background: linear-gradient(0deg, rgb(6 106 97 / .05), rgb(6 106 97 / .05)), #fff; border: 1px solid rgb(6 106 97 / .22); border-radius: 16px; }
  .chip { display: inline-flex; height: 32px; align-items: center; gap: 6px; border-radius: 999px; background: var(--soft); padding: 0 12px 0 10px; font-size: 13px; font-weight: 500; }
  .btn-p { background: #066A61; color: #fff; } .btn-p:hover { background: #05554E; }
"""


def vnd(n):
    return f"{n:,}".replace(",", ".") + " ₫"


def crumbs(*parts):
    sep = ri("arrow-right-s-line", 14, "mute")
    items = [f'<span class="mute">{p}</span>' for p in parts[:-1]] + [f'<span>{parts[-1]}</span>']
    return f'<nav class="flex items-center gap-1.5 text-[13px]">{sep.join(items)}</nav>'


def phase_track(current, times, small=False):
    """The four deal steps across the hero card, as PhaseTrack draws them."""
    phases = [("sell-outline-rounded", "Chốt giá"), ("local-shipping-outline-rounded", "Tạo đơn"), ("package-2-outline-rounded", "Nhận hàng"), ("star-outline-rounded", "Đánh giá")]
    w = 112
    out_ = ""
    for i, (ic, label) in enumerate(phases):
        done, now = i < current, i == current
        dot = ("bg-[#066A61] text-white" if done else "bg-[#066A61] text-white ring-4 ring-[rgb(6_106_97/.15)]" if now else "bg-soft mute")
        inner = icon("check-rounded", 18) if done else icon(ic, 18)
        line = "" if i == 3 else f'<span class="absolute left-[calc(50%+22px)] right-[calc(-50%+22px)] top-[17px] h-[3px] rounded-full {"bg-[#066A61]" if done else "bg-soft"}"></span>'
        out_ += (f'<li class="relative flex shrink-0 flex-col items-center text-center" style="width:{w}px">{line}'
                 f'<span class="grid h-[34px] w-[34px] place-items-center rounded-full {dot}">{inner}</span>'
                 f'<span class="mt-2 text-[14px] font-medium {"" if i <= current else "mute"}">{label}</span>'
                 f'<span class="num h-4 text-[12px] mute">{times[i]}</span></li>')
    return f'<ol class="flex">{out_}</ol>'


def hero(heading, chip, current, times, phone=False):
    if phone:
        return f"""<section class="panel mt-3 flex flex-col gap-4 p-3">
  <div class="flex items-center gap-4">
    <img src="{img(PHOTO, 160, 160)}" alt="" class="h-20 w-20 shrink-0 rounded-[16px] object-cover">
    <div class="min-w-0 flex-1"><h1 class="text-[22px] font-semibold leading-7 tracking-[-0.01em]">{heading}</h1>
      <div class="mt-2 flex flex-wrap gap-2"><span class="chip">{chip}</span></div></div>
  </div>
  <div class="no-scrollbar overflow-x-auto">{phase_track(current, times, small=True)}</div>
</section>"""
    return f"""<section class="panel mt-3 flex items-center gap-5 p-3 pr-8">
  <img src="{img(PHOTO, 240, 240)}" alt="" class="h-[104px] w-[104px] shrink-0 rounded-[16px] object-cover">
  <div class="min-w-0 flex-1"><h1 class="text-[28px] font-semibold leading-9 tracking-[-0.015em]">{heading}</h1>
    <div class="mt-2 flex flex-wrap gap-2"><span class="chip">{chip}</span></div></div>
  {phase_track(current, times)}
</section>"""


def next_card(title, lines, action="", phone=False):
    """Việc của bạn: what the viewer does now, a fact or two, and the state's one primary move."""
    rows = "".join(f'<p class="flex items-center gap-2 text-[14px] leading-5 mute">{icon(ic, 18, "text-[#066A61]")}{t}</p>' for ic, t in lines)
    btn = ""
    if action:
        ic, label = action
        btn = f'<button type="button" class="btn-p flex h-11 shrink-0 items-center justify-center gap-2 rounded-[10px] px-5 text-[15px] font-medium {"w-full" if phone else ""}">{icon(ic, 18)}{label}</button>'
    body = f"""<div class="min-w-0 flex-1">
      <p class="text-[12.5px] font-medium leading-4 text-[#05554E]">Việc của bạn</p>
      <h2 class="mt-1 text-[20px] font-semibold leading-7 tracking-[-0.01em]">{title}</h2>
      <div class="mt-2 flex flex-col gap-1.5">{rows}</div>
    </div>"""
    if phone:
        return f'<section class="next p-4">{body}<div class="mt-4">{btn}</div></section>' if btn else f'<section class="next p-4">{body}</section>'
    return f'<section class="next flex items-center gap-5 p-5">{body}{btn}</section>'


def steps(rows):
    """Hành trình, oldest first. rows: (title, sub, when, state) with state done, now or next."""
    lis = ""
    for i, (t, sub, when, state) in enumerate(rows):
        dot = {"done": "bg-[#066A61]", "now": "bg-[#066A61] ring-4 ring-[rgb(6_106_97/.15)]", "next": "border-2 border-[#C9CCCA] bg-white"}[state]
        line = "" if i == len(rows) - 1 else f'<span class="absolute bottom-0 left-[7px] top-5 w-px {"bg-[#066A61]/60" if state == "done" else "bg-black/10"}"></span>'
        tone = "mute" if state == "next" else ""
        weight = "font-medium" if state == "now" else ""
        lis += (f'<li class="relative flex gap-3 pb-4 last:pb-0">{line}<span class="relative mt-1 h-[15px] w-[15px] shrink-0 rounded-full {dot}"></span>'
                f'<span class="min-w-0 flex-1"><span class="block text-[14px] leading-5 {tone} {weight}">{t}</span>'
                + (f'<span class="block text-[12.5px] leading-4 mute">{sub}</span>' if sub else "")
                + f'</span><span class="num shrink-0 text-[12.5px] mute">{when}</span></li>')
    return f"""<section class="panel p-5">
  <div class="flex items-center justify-between"><h2 class="text-[14px] font-semibold">Hành trình</h2>
  <span class="text-[12.5px] font-medium text-[#066A61]">GHTK · Đang giao</span></div>
  <ol class="mt-3">{lis}</ol>
</section>"""


def list_row(ic, main, sub, end=""):
    return (f'<div class="flex items-center gap-3 py-2.5"><span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-soft mute">{icon(ic, 18)}</span>'
            f'<span class="min-w-0 flex-1"><span class="block text-[14px] leading-5">{main}</span><span class="block text-[12.5px] leading-4 mute">{sub}</span></span>{end}</div>')


COPY = f'<span class="grid h-9 w-9 place-items-center rounded-full mute">{icon("content-copy-outline-rounded", 18)}</span>'


def side_panels(shipped=True):
    waybill = (list_row("receipt-long-outline-rounded", CODE, "GHTK", '<span class="flex h-9 items-center rounded-[10px] px-3 text-[14px] font-medium text-[#066A61]">Tra mã</span>' + COPY)
               if shipped else list_row("receipt-long-outline-rounded", "Chưa có vận đơn", ""))
    return f"""<div class="flex flex-col gap-4">
  <section class="panel px-5 py-3"><h2 class="py-1 text-[14px] font-semibold">Vận đơn</h2>
    {waybill}
    {list_row("tag-rounded", ORDER, "Mã đơn ShopNexus", COPY)}</section>
  <section class="panel px-5 py-3"><h2 class="py-1 text-[14px] font-semibold">Giao đến</h2>
    {list_row("location-on-outline-rounded", "12 Nguyễn Văn Đậu, Phường An Đông, TP. Hồ Chí Minh", "Khánh Linh · 0912 345 812", COPY)}</section>
</div>"""


def aside(person, sub, total_label, fee, actions):
    name, face, _ = person
    fee_v = vnd(FEE) if fee else "Chưa tính"
    total = PRICE + (FEE if fee else 0)
    note = "" if fee else '<span class="text-[12.5px] mute">+ phí ship</span>'
    return f"""<aside class="panel w-full self-start overflow-hidden !p-0">
  <div class="flex items-center gap-3 p-4"><img src="{img(PHOTO, 160, 160)}" alt="" class="h-14 w-14 shrink-0 rounded-[12px] object-cover">
    <div class="min-w-0"><p class="truncate text-[14px] font-medium">{ITEM}</p><p class="num text-[12.5px] mute">Giá chốt {vnd(PRICE)}</p></div></div>
  <div class="mx-4 flex items-center gap-3 rounded-[12px] bg-soft p-2.5"><img src="{img(face, 72, 72)}" alt="" class="h-9 w-9 rounded-full object-cover">
    <span class="min-w-0 flex-1"><span class="block text-[14px] font-medium">{name}</span><span class="block text-[12.5px] mute">{sub}</span></span>
    <span class="flex h-9 items-center gap-1.5 rounded-[10px] bg-white px-3 text-[14px] font-medium text-[#066A61]">{icon("chat-outline-rounded", 17)}Nhắn</span></div>
  <div class="p-5">
    <p class="text-[14px] mute">{total_label}</p>
    <p class="mt-0.5 flex items-baseline gap-1.5"><span class="num text-[30px] font-semibold tracking-[-0.02em]">{vnd(total)[:-2]}</span><span class="text-[16px] mute">₫</span>{note}</p>
    <div class="mt-3 flex flex-col gap-1.5 border-b bd pb-4 text-[14px]">
      <p class="flex justify-between"><span class="mute">Tiền hàng</span><span class="num flex items-center gap-1.5 text-[#924628]">{icon("handshake-outline-rounded", 16)}{vnd(PRICE)}</span></p>
      <p class="flex justify-between"><span class="mute">Phí ship{" · GHTK" if fee else ""}</span><span class="num">{fee_v}</span></p>
    </div>
  </div>
  <div class="flex flex-wrap items-center gap-2 border-t bd bg-soft/60 p-3">{actions}</div>
</aside>"""


def ship_form():
    """The seller's shipment form, closed up: the page's own, unchanged."""
    def opt(t, sub, end, on):
        ring = "shadow-[inset_0_0_0_1.5px_#066A61]" if on else "shadow-[inset_0_0_0_1px_var(--line)]"
        r = '<span class="grid h-5 w-5 place-items-center rounded-full border-2 border-[#066A61]"><span class="h-2.5 w-2.5 rounded-full bg-[#066A61]"></span></span>' if on else '<span class="h-5 w-5 rounded-full border-2 border-[#C9CCCA]"></span>'
        return f'<div class="flex items-center gap-3 rounded-[12px] bg-white px-4 py-3 {ring}">{r}<span class="flex-1"><span class="block text-[14px]">{t}</span><span class="block text-[12.5px] mute">{sub}</span></span><span class="num text-[14px]">{end}</span></div>'
    return f"""<section class="panel p-5">
  <h2 class="text-[14px] font-semibold">Gửi bằng</h2>
  <div class="mt-3 inline-flex rounded-[10px] bg-soft p-1 text-[14px]"><span class="rounded-[8px] bg-white px-4 py-1.5 font-medium shadow-[0_1px_2px_rgb(20_20_19/.08)]">GHTK</span><span class="px-4 py-1.5 mute">Tự gửi</span></div>
  <div class="mt-5 grid grid-cols-2 gap-x-6 gap-y-5 border-t bd pt-5">
    <div><p class="text-[14px] font-medium">Khối lượng</p><div class="mt-2 flex h-12 items-center justify-between rounded-[12px] px-4 shadow-[inset_0_0_0_1px_var(--line)]"><span>2</span><span class="mute">kg</span></div></div>
    <div><p class="text-[14px] font-medium">Dịch vụ</p><div class="mt-2 flex flex-col gap-2">{opt("Giao nhanh", "1–2 ngày", vnd(FEE), True)}{opt("Tiết kiệm", "2–4 ngày", vnd(FEE), False)}</div></div>
  </div>
  <div class="mt-5 flex justify-end border-t bd pt-4"><span class="btn-p flex h-11 items-center gap-2 rounded-[10px] px-5 text-[15px] font-medium">{icon("receipt-long-outline-rounded", 18)}Tạo đơn</span></div>
</section>"""


def phone_header(L):
    face = SELLERS[0][1]
    return f"""<header class="sticky top-0 z-30 border-b bd bg-[var(--bg)]">
  <div class="flex h-16 items-center gap-2 px-4">
    {L.a("grid h-10 w-8 shrink-0 place-items-center", f'<img src="{LOGO}" alt="" class="h-8 w-8">', "ShopNexus")}
    <form class="ml-1 flex h-10 min-w-0 flex-1 items-center gap-2 rounded-[10px] bg-white pl-3 pr-1 shadow-[inset_0_0_0_1px_#DCDCD8]">{ri("search-line", 17, "mute")}<input class="h-full min-w-0 flex-1 bg-transparent text-[14px] outline-none" placeholder="Tìm iPhone, xe đạp…"></form>
    {L.a("relative grid h-10 w-10 shrink-0 place-items-center rounded-[10px]", ri("notification-3-line", 20), "Thông báo")}
    {L.a("grid h-10 w-10 shrink-0 place-items-center rounded-full", f'<img src="{img(face, 64, 64)}" alt="" class="h-8 w-8 rounded-full object-cover">', "Tài khoản")}
  </div>
</header>"""


# --------------------------------------------------------------- states --
def buyer_parts(phone):
    card = next_card(f"Chuẩn bị {vnd(PRICE + FEE)} tiền mặt",
                     [("visibility-outline-rounded", "Mở hàng kiểm tra trước khi trả tiền")],
                     ("package-2-outline-rounded", "Đã nhận hàng"), phone)
    track = steps([("Bạn gửi yêu cầu COD", vnd(PRICE), "Hôm qua 12:29", "done"),
                   ("Người bán tạo vận đơn", f"GHTK · {CODE}", "Hôm qua 16:02", "done"),
                   ("GHTK đã lấy hàng", "", "Hôm nay 09:40", "now"),
                   ("GHTK giao tới bạn", "", "", "next"),
                   ("Bạn nhận hàng, trả tiền", "", "", "next")])
    acts = '<button type="button" class="flex h-10 items-center gap-1.5 rounded-[10px] px-3 text-[14px] font-medium text-[#066A61]">' + icon("help-outline-rounded", 18) + "Báo chưa nhận hàng</button>"
    side = aside(SELLER, "Người bán", "Trả khi nhận", True, acts)
    return dict(heading="Chờ giao hàng", chip=icon("local-shipping-outline-rounded", 15) + f"GHTK · {CODE}", current=2,
                times=["Hôm qua 12:20", "Hôm qua 16:02", "", ""], card=card, main=f'<div class="grid gap-4 {"" if phone else "grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"}">{track}{side_panels()}</div>',
                side=side, crumb="Đơn mua")


def seller_parts(phone):
    card = next_card("Tạo vận đơn trước Thứ Hai 12:29",
                     [("schedule-outline-rounded", "Còn 2 ngày 23 giờ")], "", phone)
    track = steps([("Khánh Linh gửi yêu cầu COD", vnd(PRICE), "Hôm nay 12:29", "now"),
                   ("Bạn tạo vận đơn", "", "", "next"),
                   ("Hãng lấy hàng", "", "", "next"),
                   ("Giao tới Khánh Linh", "", "", "next"),
                   ("Khánh Linh nhận hàng, trả tiền", "", "", "next")]).replace("GHTK · Đang giao", "")
    acts = '<button type="button" class="btn-o flex h-10 items-center rounded-[10px] px-4 text-[14px] font-medium">Hủy đơn</button>'
    side = aside(BUYER, "Người mua · giao COD", "Người mua trả shipper", False, acts)
    return dict(heading="Tạo đơn cho Khánh Linh", chip=icon("hourglass-top-rounded", 15) + "Chờ từ Hôm nay 12:29", current=1,
                times=["Hôm nay 12:20", "", "", ""], card=card, main=ship_form() + f'<div class="grid gap-4 {"" if phone else "grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]"}">{track}{side_panels(shipped=False)}</div>',
                side=side, crumb="Đơn bán")


def desktop(who):
    L = Ids(f"os-{who}")
    p = buyer_parts(False) if who == "buyer" else seller_parts(False)
    body = f"""{bar(L)}
<main class="mx-auto max-w-[1280px] px-8 pb-16 pt-5">
  {crumbs("Tôi", p["crumb"], ORDER)}
  {hero(p["heading"], p["chip"], p["current"], p["times"])}
  <div class="mt-5 grid grid-cols-[minmax(0,1fr)_400px] gap-6">
    <div class="flex min-w-0 flex-col gap-4">{p["card"]}{p["main"]}</div>
    {p["side"]}
  </div>
</main>"""
    return out(f"Đơn COD · {ITEM}", body).replace("</style>", CSS + "</style>", 1)


def phone(who):
    L = Ids(f"osp-{who}")
    p = buyer_parts(True) if who == "buyer" else seller_parts(True)
    main = p["main"].replace("grid-cols-2 gap-x-6", "grid-cols-1 gap-x-6")
    body = f"""<div class="relative mx-auto w-[390px] overflow-hidden bg-[var(--bg)]">
  {phone_header(L)}
  <main class="px-4 pb-10 pt-4">
    {crumbs("Tôi", p["crumb"], ORDER)}
    {hero(p["heading"], p["chip"], p["current"], p["times"], phone=True)}
    <div class="mt-4 flex flex-col gap-4">{p["card"]}{main}{p["side"]}</div>
  </main>
</div>"""
    return out(f"Đơn COD · điện thoại", body).replace("</style>", CSS + "</style>", 1)


if __name__ == "__main__":
    for who in ("buyer", "seller"):
        for kind, fn in (("desktop", desktop), ("phone", phone)):
            path = os.path.join(OUT, f"order-steps-{who}-{kind}.html")
            with open(path, "w") as f:
                f.write(fn(who))
            print("wrote", path)
