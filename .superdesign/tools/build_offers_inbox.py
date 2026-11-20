"""Trả giá: every open offer on the seller's listings on one page, answered in
the row. Đồng ý agrees at the offer, Trả giá lại opens the amount under the
row (the shared money field), Từ chối turns it down; the row then leaves the
list. A listing held for an order keeps only Từ chối. The avatar menu and the
account nav carry the count.

    python3 tools/build_offers_inbox.py        (run from .superdesign/)

Writes mockups/offers-inbox-{desktop,phone,menu}.html.
"""
import os

from build import OUT
from build_header import POP, Ids
from build_k2 import SELLERS, out, ri
from build_notif_preview import bar
from build_price_drop import phone_header
from common import LISTINGS, img

ME = "1438761681033-6461ffad8d80"  # Minh Anh, the seller
BUYERS = {"Khánh Linh": "1494790108377-be9c29b29330", **{n: f for n, f, _ in SELLERS}}

# (listing index, listed, buyer, offer, gap, ago, held)
OFFERS = [
    (5, "4.800.000", "Khánh Linh", "4.200.000", "−600.000 ₫ · 13%", "12 phút", False),
    (1, "11.500.000", "Quốc Bảo", "10.500.000", "−1.000.000 ₫ · 9%", "1 giờ", False),
    (7, "15.900.000", "Thu Hà", "14.000.000", "−1.900.000 ₫ · 12%", "3 giờ", False),
    (8, "26.500.000", "Hoàng Nam", "24.000.000", "−2.500.000 ₫ · 9%", "Hôm qua", True),
]

BTN_O = "btn-o flex h-9 items-center gap-1.5 whitespace-nowrap rounded-[10px] px-3 text-[14px] font-medium"
BTN_P = "flex h-9 items-center gap-1.5 whitespace-nowrap rounded-[10px] bg-brand px-3.5 text-[14px] font-medium text-white"


def money(v, size="text-[17px]"):
    return f'<span class="num {size} font-semibold tracking-tight">{v}<span class="ml-0.5 text-[12.5px] font-medium tracking-normal text-[#5E5E5A]">₫</span></span>'


def person(L, name):
    return L.a("row -mx-1 inline-flex h-7 items-center gap-1.5 rounded-full pl-1 pr-2 text-[13px] font-medium",
               f'<img src="{img(BUYERS[name], 40, 40)}" alt="" class="h-5 w-5 rounded-full object-cover">{name}')


def actions(L, held, phone=False):
    chat = L.a("grid h-9 w-9 shrink-0 place-items-center rounded-[10px] mute row", ri("chat-3-line", 18), "Mở chat")
    grow = " flex-1 justify-center !px-2" if phone else ""
    if held:
        return chat + L.a(BTN_O + grow, "Từ chối")
    icon = (lambda n: "") if phone else (lambda n: ri(n, 16))
    return (chat + L.a(BTN_O + grow, "Từ chối") + L.a(BTN_O + grow, icon("price-tag-3-line") + "Trả giá lại")
            + L.a(BTN_P + grow, icon("shake-hands-line") + "Đồng ý"))


def counter(L, value, low, high, phone=False):
    """Trả giá lại, open under the row: the amount, its range, Hủy and Gửi giá."""
    field = (f'<label class="field on flex h-11 items-center gap-2 px-3 {"w-full" if phone else "w-[220px]"}"><span class="sr-only">Giá bạn trả lại</span>'
             f'<input class="num min-w-0 flex-1 bg-transparent text-[18px] font-semibold outline-none" value="{value}" inputmode="numeric"><span class="mute">₫</span></label>')
    hint = f'<p class="meta">{low} – {high} ₫</p>'
    buttons = L.a("flex h-9 items-center rounded-[10px] px-3 text-[14px] font-medium text-brand row", "Hủy") + L.a(BTN_P, ri("send-plane-2-line", 16) + "Gửi giá")
    if phone:
        return f'<div class="mt-3 rounded-[12px] bg-[#F3F3F1] p-3">{field}<div class="mt-1.5">{hint}</div><div class="mt-2 flex justify-end gap-2">{buttons}</div></div>'
    return f'<div class="mt-3 flex items-center gap-3 rounded-[12px] bg-[#F3F3F1] p-2.5 pl-3">{field}{hint}<span class="flex-1"></span>{buttons}</div>'


def held_note():
    return f'<span class="meta inline-flex items-center gap-1">{ri("lock-line", 13)}Đang giữ cho một đơn khác</span>'


def row(L, o, *, open_=None, phone=False):
    li, listed, buyer, offer, gap, ago, held = o
    photo, _, title, *_ = LISTINGS[li]
    thumb = f'<img src="{img(photo, 160, 160)}" alt="" class="{"h-14 w-14" if phone else "h-16 w-16"} shrink-0 rounded-[10px] object-cover">'
    title_a = L.a("block truncate text-[14px] font-medium hover:underline", title)
    who = f'<div class="mt-1 flex items-center gap-2">{person(L, buyer)}<span class="meta">{ago}</span></div>'
    sub = held_note() if held else f'<span class="meta">Giá đăng {listed} ₫</span>'
    if phone:
        return f"""<article class="card p-3">
  <div class="flex gap-3">{thumb}<div class="min-w-0 flex-1">{title_a}<p class="mt-0.5">{sub}</p>{who}</div></div>
  <div class="mt-2.5 flex items-baseline justify-between border-t bd pt-2.5">{money(offer, "text-[19px]")}<span class="meta">{gap}</span></div>
  {counter(L, *open_, phone=True) if open_ else f'<div class="mt-2.5 flex gap-2">{actions(L, held, phone=True)}</div>'}
</article>"""
    return f"""<article class="card p-3">
  <div class="flex items-center gap-4">
    {thumb}
    <div class="min-w-0 flex-1">{title_a}<p class="mt-0.5">{sub}</p>{who}</div>
    <div class="w-[150px] shrink-0 text-right">{money(offer)}<p class="meta mt-0.5">{gap}</p></div>
    <div class="ml-2 flex w-[318px] shrink-0 items-center justify-end gap-2">{actions(L, held)}</div>
  </div>
  {counter(L, *open_) if open_ else ""}
</article>"""


def account_nav(L):
    items = [("user-line", "Tôi", ""), ("store-2-line", "Tin của bạn", ""), ("file-list-3-line", "Đơn mua", ""), ("archive-line", "Đơn bán", ""),
             ("price-tag-3-line", "Trả giá", "4"), ("heart-line", "Đã lưu", ""), ("chat-3-line", "Tin nhắn", "3"), ("notification-3-line", "Thông báo", ""),
             ("truck-line", "Thiết lập giao COD", ""), ("question-line", "Hỗ trợ", "")]
    nav = "".join(L.a(f"row flex h-10 items-center gap-3 rounded-[10px] px-3 text-[14px] {'on' if t == 'Trả giá' else ''}",
                      ri(i.replace("-line", "-fill") if t == "Trả giá" else i, 18, "mute") + f'<span class="flex-1">{t}</span>' + (f'<span class="meta num">{n}</span>' if n else ""))
                  for i, t, n in items)
    return f"""<aside class="sticky top-[88px] self-start">
  <div class="card flex items-center gap-3 p-3"><img src="{img(ME, 88, 88)}" alt="" class="h-11 w-11 rounded-full object-cover">
    <div><p class="text-[14px] font-medium">Minh Anh</p><p class="meta">★ 4,8 · 23 đã bán</p></div></div>
  <nav class="mt-3 flex flex-col gap-0.5">{nav}</nav>
</aside>"""


CSS = """
  .field { background: #fff; box-shadow: inset 0 0 0 1px #DCDCD8; border-radius: 10px; }
  .field.on { box-shadow: inset 0 0 0 2px #066A61; }
"""


def out_(title, body):
    return out(title, body).replace("</style>", CSS + "</style>", 1)


def page_body(L):
    rows = "".join(row(L, o, open_=("11.000.000", "10.501.000", "11.499.000") if i == 1 else None) for i, o in enumerate(OFFERS))
    return f"""<div class="mx-auto grid max-w-[1280px] grid-cols-[232px_1fr] gap-8 px-8 pt-6 pb-16">
  {account_nav(L)}
  <main class="min-w-0">
    <h1 class="text-[28px] font-semibold leading-9 tracking-[-0.02em]">Trả giá</h1>
    <p class="mt-1 text-[13px] text-[#5E5E5A]">4 lời trả giá đang chờ bạn</p>
    <section class="mt-5 flex flex-col gap-2.5">{rows}</section>
  </main>
</div>"""


def desktop():
    L = Ids("oi-d")
    return out_("Trả giá · người bán", bar(L) + page_body(L))


def menu_desktop():
    L = Ids("oi-m")
    items = [("file-list-3-line", "Đơn mua", ""), ("store-2-line", "Đơn bán", ""), ("price-tag-3-line", "Trả giá", "4"),
             ("store-3-line", "Tin của bạn", ""), ("customer-service-2-line", "Hỗ trợ", "")]
    rows = "".join(L.a("flex h-10 items-center gap-3 rounded-[8px] px-3 text-[14px] row",
                       ri(i, 18, "mute") + f'<span class="flex-1">{t}</span>'
                       + (f'<span class="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[11px] font-medium text-white">{n}</span>' if n else ""))
                   for i, t, n in items)
    pop = f"""<div class="pointer-events-none fixed inset-0 z-40"><div class="pointer-events-auto {POP} w-[280px] p-2" style="top:60px;right:24px">
  {L.a("flex items-center gap-3 rounded-[10px] p-2 row", f'<img src="{img(ME, 96, 96)}" alt="" class="h-10 w-10 rounded-full object-cover"><span class="min-w-0 flex-1"><span class="block text-[15px] font-medium">Minh Anh</span><span class="meta block">Xem trang của bạn</span></span>')}
  <div class="my-1.5 h-px bg-[#ECECE9]"></div>
  {rows}
  <div class="my-1.5 h-px bg-[#ECECE9]"></div>
  {L.a("flex h-10 items-center gap-3 rounded-[8px] px-3 text-[14px] text-[#B42318] row", ri("logout-box-r-line", 18) + "Đăng xuất")}
</div></div>"""
    hdr = bar(L).replace("h-8 w-8 rounded-full object-cover", "h-8 w-8 rounded-full object-cover shadow-[0_0_0_2px_#066A61]", 1)
    return out_("Trả giá · menu tài khoản", hdr + pop + page_body(L))


def tabs():
    items = "".join(f'<span class="flex flex-col items-center justify-center gap-1 text-[12px] {"" if on else "mute"}"><span class="grid h-8 w-16 place-items-center rounded-full {"bg-mint text-on-mint" if on else ""}">{ri(i, 22)}</span>{t}</span>'
                    for i, t, on in [("compass-3-line", "Khám phá", False), ("apps-2-line", "Danh mục", False), ("chat-3-line", "Tin nhắn", False), ("user-fill", "Tôi", True)])
    return f'<nav class="absolute inset-x-0 bottom-0 grid h-20 grid-cols-4 border-t bd bg-[var(--bg)]">{items}</nav>'


def phone():
    L = Ids("oi-p")
    rows = "".join(row(L, o, phone=True, open_=("4.500.000", "4.201.000", "4.799.000") if i == 0 else None) for i, o in enumerate(OFFERS[:3]))
    body = f"""<div class="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-[var(--bg)]">
  {phone_header()}
  <main class="px-4 pt-4">
    <h1 class="text-[24px] font-semibold tracking-[-0.02em]">Trả giá</h1>
    <p class="meta mt-0.5 !text-[13px] !text-[#5E5E5A]">4 lời trả giá đang chờ bạn</p>
    <section class="mt-3 flex flex-col gap-2.5 pb-24">{rows}</section>
  </main>
  {tabs()}
</div>"""
    return out_("Trả giá · điện thoại", body)


if __name__ == "__main__":
    for name, html in [("desktop", desktop()), ("menu", menu_desktop()), ("phone", phone())]:
        with open(os.path.join(OUT, f"offers-inbox-{name}.html"), "w") as f:
            f.write(html)
        print("wrote offers-inbox", name)
