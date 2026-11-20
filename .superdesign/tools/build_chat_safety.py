"""Chat safety and seller replies on Tin nhắn, in K2.

- Scam warning: when the server's check finds a sign in the other person's
  messages, a quiet line sits under the message it was found at, on their
  side: what is risky in a few words, "ShopNexus chỉ có COD: xem hàng rồi
  mới trả", "Báo cáo" (the Chặn và báo cáo dialog) and × to hide it. The
  sender never sees it. Neutral greys, a teal action, no red.
- Câu trả lời mẫu: a seller's composer has a quick-reply button (and "/" in
  an empty field). It opens the saved replies above the field; a tap puts
  one in the field. "Sửa" turns the same panel into a small editor: each
  reply a field with ×, "Thêm câu", the count of 20 and Lưu. On a phone the
  panel is a bottom sheet.

    python3 tools/build_chat_safety.py        (run from .superdesign/)

Writes mockups/chat-safety-{warning,replies,replies-edit}.html (1280) and
mockups/chat-safety-{warning,replies,replies-edit}-phone.html (390).
"""
import os
from html import escape

from build import OUT
from build_header import Ids
from build_k2 import ME, SELLERS, out, ri
from build_notif_preview import bar
from build_price_drop import phone_header
from common import LISTINGS, img

TEAL = "#066A61"
SUB, FAINT = "#5E5E5A", "#8C8C87"
CSS = """
  .pane { background: #fff; border: 1px solid var(--line); border-radius: 16px; box-shadow: 0 1px 2px rgb(20 20 19 / .04); }
  .mine { background: #066A61; color: #fff; }
  .theirs { background: #fff; box-shadow: inset 0 0 0 1px #ECECE9; }
  .field { background: #fff; box-shadow: inset 0 0 0 1px #DCDCD8; }
  .field:focus-within { box-shadow: inset 0 0 0 1.5px #066A61, 0 0 0 4px rgb(6 106 97 / .10); }
  .pop { background: #fff; border: 1px solid #ECECE9; box-shadow: 0 12px 32px rgb(20 20 19 / .12), 0 2px 6px rgb(20 20 19 / .06); }
  .kbd { border: 1px solid #ECECE9; border-radius: 6px; padding: 0 6px; font-size: 11px; line-height: 18px; color: #5E5E5A; }
  .act { background: #EEEEEB; }
"""

SCAMMER = ("Thanh Lý 24h", None)
S23 = dict(title="Galaxy S23 Ultra 256GB, đen", photo="1678911820864-e2c567c655d7", price="6.500.000 ₫", listed="6.500.000")
SOFA = LISTINGS[5]  # (photo, price, title, …)
BUYER = SELLERS[1]  # Minh Anh asks about Khánh Linh's sofa.

# The server's own texts of the two codes found (domain.texts).
SIGNS = ["Đòi chuyển tiền hoặc đặt cọc trước", "Rủ chuyển sang Zalo, Telegram, Facebook"]
COD_LINE = "ShopNexus chỉ có COD: xem hàng rồi mới trả"
REPLIES = ["Còn bạn ơi", "Mình ở Q.1, xem hàng buổi tối được", "Giá đã tốt rồi, mình bớt thêm không nhiều được bạn nhé",
           "Bạn nhắn giờ ghé, mình để hàng cho bạn xem trước"]


def page(title, body):
    return out(title, body).replace("</style>", CSS + "</style>", 1)


def face(photo, name, size=28, cls=""):
    if photo:
        return f'<img src="{img(photo, size * 2, size * 2)}" alt="" class="shrink-0 rounded-full object-cover {cls}" style="width:{size}px;height:{size}px">'
    return (f'<span class="grid shrink-0 place-items-center rounded-full bg-[#E3F2EF] text-[{max(11, size // 2.6):.0f}px] font-semibold text-[#05554E] {cls}" '
            f'style="width:{size}px;height:{size}px">{name[0]}</span>')


# ---------------------------------------------------------------- thread --
def bubbles(side, texts, time, photo=None, name=""):
    mine = side == "mine"
    n = len(texts)
    rows = ""
    for i, t in enumerate(texts):
        tuck = ""
        if i > 0:
            tuck += " rounded-tr-[4px]" if mine else " rounded-tl-[4px]"
        if i < n - 1:
            tuck += " rounded-br-[4px]" if mine else " rounded-bl-[4px]"
        rows += f'<div class="max-w-[80%] rounded-[16px] px-3 py-2 text-[14px] leading-5 {"mine" if mine else "theirs"}{tuck}">{escape(t)}</div>'
    av = "" if mine else face(photo, name, 28, "mb-6")
    return f"""<div class="flex items-end gap-1.5 {"justify-end" if mine else ""}">{av}
  <div class="flex min-w-0 flex-1 flex-col gap-0.5 {"items-end" if mine else "items-start"}">{rows}<p class="mt-1 px-2 text-[12px] leading-4 text-[{SUB}]">{time}</p></div>
</div>"""


def warning(L, signs, phone=False):
    """The line under the message a sign was found at, on the other side."""
    report = L.a(f"font-medium text-[{TEAL}] underline-offset-2 hover:underline", "Báo cáo")
    hide = L.a(f"-mr-1 -mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full text-[{SUB}] row", ri("close-line", 16), "Ẩn cảnh báo")
    return f"""<div class="flex gap-1.5" role="note" aria-label="Cảnh báo lừa đảo">
  <span class="w-7 shrink-0"></span>
  <div class="flex {"min-w-0 flex-1" if phone else "max-w-[80%]"} items-start gap-2.5 rounded-[12px] border border-[#ECECE9] bg-[#F3F3F1] py-2 pl-3 pr-2">
    {ri("shield-flash-line", 18, "mt-px text-[#1A1A19]")}
    <div class="min-w-0 flex-1">
      <p class="text-[13px] font-medium leading-[18px]">{escape(" · ".join(signs))}</p>
      <p class="mt-0.5 text-[12.5px] leading-[18px] text-[{SUB}]">{COD_LINE} · {report}</p>
    </div>
    {hide}
  </div>
</div>"""


def day(label):
    return f'<p class="pt-1 text-center text-[12px] font-medium leading-4 text-[{SUB}]">{label}</p>'


def scam_thread(L, phone=False):
    name, photo = SCAMMER
    return (day("Hôm nay")
            + bubbles("mine", ["Máy còn không bạn? Mình ở Q.3, xem máy chiều nay được không?"], "09:12")
            + bubbles("theirs", ["Còn nha bạn, máy đẹp keng.", "Mình đang ở Đà Nẵng, gửi xe khách vào cho bạn.",
                                 "Bạn chuyển cọc 1 triệu qua Momo giữ máy giúp mình, hoặc add Zalo mình gửi thêm ảnh nhé."], "09:20", photo, name)
            + warning(L, SIGNS, phone))


def seller_thread():
    name, photo, _ = BUYER
    return (day("Hôm nay")
            + bubbles("theirs", ["Sofa còn không bạn?", "Mình xem hàng tối nay được không ạ?"], "19:02", photo, name))


# ------------------------------------------------------------- composer --
def composer(L, *, replies=False, open_=False, text=""):
    pick = L.a(f"grid h-12 w-12 shrink-0 place-items-center rounded-full text-[{SUB}] row", ri("image-add-line", 22), "Gửi ảnh")
    quick = ""
    if replies:
        quick = L.a(f"grid h-12 w-12 shrink-0 place-items-center rounded-full row {'act text-[#1A1A19]' if open_ else f'text-[{SUB}]'}",
                    ri("chat-quote-line", 22), "Câu trả lời mẫu")
    value = (f'<span class="text-[14px] leading-5">{escape(text)}</span>' if text
             else f'<span class="text-[14px] leading-5 text-[{FAINT}]">Nhắn tin</span>')
    return f"""<div class="px-3 pb-3 pt-2">
  <div class="flex items-end gap-1">{pick}{quick}
    <div class="field flex min-h-12 min-w-0 flex-1 items-center rounded-[24px] px-5 {"!shadow-[inset_0_0_0_1.5px_#066A61,0_0_0_4px_rgb(6_106_97/.10)]" if open_ else ""}">{value}</div>
    <span class="grid h-12 w-12 shrink-0 place-items-center rounded-full text-[{TEAL if text else FAINT}]">{ri("send-plane-2-line", 22)}</span>
  </div>
</div>"""


def picker_rows(L, active=0):
    rows = ""
    for i, t in enumerate(REPLIES):
        rows += L.a(f"flex min-h-11 items-center rounded-[10px] px-3 py-2 text-[14px] leading-5 row {'act' if i == active else ''}",
                    f'<span class="clamp2">{escape(t)}</span>')
    return rows


def picker(L, style, sheet=False):
    """The saved replies, a popover above the field or a bottom sheet."""
    edit = L.a(f"flex h-8 items-center gap-1 rounded-[8px] px-2 text-[13px] font-medium text-[{TEAL}] row", ri("pencil-line", 15) + "Sửa")
    handle = '<span class="mx-auto mb-1 mt-2 block h-1 w-8 rounded-full bg-[#DCDCD8]"></span>' if sheet else ""
    kbd = "" if sheet else '<span class="kbd">/</span>'
    shape = "rounded-t-[20px]" if sheet else "rounded-[16px]"
    return f"""<div class="pop absolute z-40 flex flex-col {shape}" style="{style}" role="listbox" aria-label="Câu trả lời mẫu">
  {handle}
  <div class="flex h-12 shrink-0 items-center gap-2 pl-4 pr-2">
    <h2 class="text-[14px] font-semibold">Câu trả lời mẫu</h2>{kbd}<span class="flex-1"></span>{edit}
  </div>
  <div class="flex flex-col gap-0.5 overflow-y-auto px-2 pb-2">{picker_rows(L)}</div>
</div>"""


def editor(L, style, sheet=False):
    """The same panel in edit mode: a field per reply, Thêm câu, Lưu."""
    back = L.a(f"-ml-1 grid h-8 w-8 place-items-center rounded-full text-[{SUB}] row", ri("arrow-left-line", 18), "Quay lại")
    items = ""
    for i, t in enumerate(REPLIES):
        focus = i == 1
        drop = L.a(f"grid h-8 w-8 shrink-0 place-items-center rounded-full text-[{SUB}] row", ri("close-line", 16), "Xóa câu này")
        ring = "shadow-[inset_0_0_0_1.5px_#066A61,0_0_0_4px_rgb(6_106_97/.10)]" if focus else "shadow-[inset_0_0_0_1px_#DCDCD8]"
        items += (f'<div class="flex items-start gap-1"><div class="min-h-10 min-w-0 flex-1 rounded-[10px] bg-white px-3 py-2.5 text-[14px] leading-5 {ring}">{escape(t)}</div>'
                  f'<span class="pt-1">{drop}</span></div>')
    add = L.a(f"flex h-10 items-center gap-2 rounded-[10px] px-2 text-[14px] font-medium text-[{TEAL}] row", ri("add-line", 18) + "Thêm câu")
    cancel = L.a(f"flex h-10 items-center rounded-[10px] px-4 text-[14px] font-medium text-[{TEAL}] row", "Hủy")
    save = L.a("flex h-10 items-center rounded-[10px] bg-brand px-5 text-[14px] font-medium text-white", "Lưu")
    handle = '<span class="mx-auto mb-1 mt-2 block h-1 w-8 rounded-full bg-[#DCDCD8]"></span>' if sheet else ""
    shape = "rounded-t-[20px]" if sheet else "rounded-[16px]"
    return f"""<div class="pop absolute z-40 flex flex-col {shape}" style="{style}" role="dialog" aria-label="Sửa câu trả lời mẫu">
  {handle}
  <div class="flex h-12 shrink-0 items-center gap-1 pl-3 pr-4">{back}<h2 class="text-[14px] font-semibold">Sửa câu trả lời mẫu</h2><span class="flex-1"></span><span class="meta">{len(REPLIES)}/20</span></div>
  <div class="flex flex-col gap-2 overflow-y-auto px-3 pb-1">{items}</div>
  <div class="flex shrink-0 items-center gap-2 px-2 pb-3 pt-2">{add}<span class="flex-1"></span>{cancel}{save}</div>
</div>"""


# ---------------------------------------------------------------- panes --
def bottom_nav():
    items = "".join(f'<span class="flex flex-col items-center justify-center gap-1 text-[12px] {"" if on else "mute"}"><span class="grid h-8 w-16 place-items-center rounded-full {"bg-mint text-on-mint" if on else ""}">{ri(i, 22)}</span>{t}</span>'
                    for i, t, on in [("compass-3-line", "Khám phá", False), ("apps-2-line", "Danh mục", False), ("chat-3-fill", "Tin nhắn", True), ("user-line", "Tôi", False)])
    return f'<nav class="absolute inset-x-0 bottom-0 grid h-20 grid-cols-4 border-t bd bg-[var(--bg)]">{items}</nav>'


def inbox(L, rows):
    seg = "".join(f'<span class="flex h-8 items-center rounded-[8px] px-3 text-[13px] {"bg-white font-medium shadow-[0_1px_2px_rgb(20_20_19/.08)]" if i == 0 else "mute"}">{t}</span>'
                  for i, t in enumerate(["Tất cả", "Mua", "Bán", "Chưa đọc"]))
    items = ""
    for on, photo, fphoto, name, title, last, when, unread in rows:
        badge = f'<span class="grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1.5 text-[11px] font-medium text-white">{unread}</span>' if unread else ""
        items += L.a(f"flex gap-3 rounded-[12px] p-3 {'bg-[#E3F2EF]' if on else 'row'}",
                     f'<span class="relative h-12 w-12 shrink-0"><img src="{img(photo, 96, 96)}" alt="" class="h-12 w-12 rounded-[8px] object-cover">'
                     f'<span class="absolute -bottom-1 -right-1 rounded-full ring-2 ring-white">{face(fphoto, name, 24)}</span></span>'
                     f'<span class="min-w-0 flex-1"><span class="flex items-baseline gap-2"><span class="min-w-0 flex-1 truncate text-[14px] {"font-semibold" if unread else "font-medium"}">{name}</span><span class="meta">{when}</span></span>'
                     f'<span class="mt-0.5 block truncate text-[12.5px] leading-4 mute">{escape(title)}</span>'
                     f'<span class="mt-0.5 flex items-center gap-2"><span class="min-w-0 flex-1 truncate text-[13px] {"font-medium" if unread else "mute"}">{escape(last)}</span>{badge}</span></span>')
    return f"""<section class="pane flex min-h-0 flex-col p-2">
  <div class="flex items-center justify-between px-2 pt-2"><h1 class="text-[26px] font-semibold leading-8 tracking-[-0.02em]">Tin nhắn</h1>
    <span class="grid h-10 w-10 place-items-center mute">{ri("search-line", 20)}</span></div>
  <div class="mx-1 mt-2 inline-flex w-fit gap-0.5 rounded-[10px] bg-[#F3F3F1] p-0.5">{seg}</div>
  <div class="mt-2 flex flex-col gap-0.5">{items}</div>
</section>"""


def chat_head(L, title, name, photo, thumb, sub, back=False):
    arrow = L.a("grid h-10 w-10 shrink-0 place-items-center rounded-full row", ri("arrow-left-s-line", 22), "Về hộp thư") if back else ""
    return f"""<div class="flex h-16 shrink-0 items-center gap-3 border-b bd px-4">{arrow}
  <span class="relative h-10 w-10 shrink-0"><img src="{img(thumb, 80, 80)}" alt="" class="h-10 w-10 rounded-[8px] object-cover">
    <span class="absolute -bottom-1 -right-1 rounded-full ring-2 ring-white">{face(photo, name, 20)}</span></span>
  <span class="min-w-0 flex-1"><span class="block truncate text-[15px] font-medium leading-5">{escape(title)}</span><span class="block truncate text-[12.5px] leading-4 mute">{escape(sub)}</span></span>
  {L.a("grid h-10 w-10 shrink-0 place-items-center rounded-full row", ri("more-2-fill", 20), "Thêm")}
</div>"""


def deal_bar(L, price, seller=False, phone=False):
    acts = (L.a("btn-o flex h-10 items-center gap-1.5 rounded-[10px] px-4 text-[14px] font-medium", ri("price-tag-3-line", 16) + "Trả giá")
            + L.a("flex h-10 items-center gap-1.5 rounded-[10px] bg-brand px-4 text-[14px] font-medium text-white", ri("hand-coin-line", 16) + "Mua giá này"))
    if seller:
        acts = L.a("btn-o flex h-10 items-center gap-1.5 rounded-[10px] px-4 text-[14px] font-medium", ri("price-tag-3-line", 16) + "Đưa giá")
    if phone:
        return f"""<div class="mx-3 rounded-[16px] border bd px-4 py-3">
  <p class="flex items-baseline gap-2"><span class="num text-[18px] font-semibold tracking-[-0.02em]">{price}</span><span class="meta">Giá đăng</span></p>
  <div class="mt-2 grid {"grid-cols-1" if seller else "grid-cols-2"} gap-2 [&>a]:justify-center">{acts}</div>
</div>"""
    return f"""<div class="mx-3 flex items-center gap-3 rounded-[16px] border bd px-4 py-3">
  <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#E3F2EF] text-[#05554E]">{ri("price-tag-3-line", 17)}</span>
  <span class="min-w-0 flex-1"><span class="num block text-[20px] font-semibold leading-6 tracking-[-0.02em]">{price}</span><span class="meta">Giá đăng</span></span>
  <div class="flex gap-2">{acts}</div>
</div>"""


def side_pane(photo, title, who, price):
    return f"""<aside class="pane h-fit p-3">
  <img src="{img(photo, 600, 440)}" alt="" class="aspect-[4/3] w-full rounded-[12px] object-cover">
  <p class="mt-3 text-[15px] font-medium leading-5">{escape(title)}</p><p class="meta mt-0.5">{who}</p>
  <p class="mt-2 flex justify-between text-[13px]"><span class="mute">Giá đăng</span><span class="num">{price}</span></p>
  <span class="btn-o mt-3 flex h-10 items-center justify-center rounded-[10px] text-[14px] font-medium">Xem tin</span>
</aside>"""


SCAM_ROWS = lambda: [  # noqa: E731
    (True, S23["photo"], None, SCAMMER[0], S23["title"], "Bạn chuyển cọc 1 triệu qua Momo…", "09:20", 2),
    (False, LISTINGS[0][0], SELLERS[0][1], SELLERS[0][0], LISTINGS[0][2], "Mình gửi GHTK rồi nha, mai tới", "Hôm qua", 0),
    (False, LISTINGS[3][0], SELLERS[3][1], SELLERS[3][0], LISTINGS[3][2], "Bạn: Ok chốt 1,7 tr nhé", "T3", 0),
]
SELL_ROWS = lambda: [  # noqa: E731
    (True, SOFA[0], BUYER[1], BUYER[0], SOFA[2], "Mình xem hàng tối nay được không ạ?", "19:02", 2),
    (False, LISTINGS[1][0], SELLERS[2][1], SELLERS[2][0], LISTINGS[1][2], "Bạn: Máy sạc 92 lần thôi bạn", "Hôm qua", 0),
    (False, LISTINGS[4][0], SELLERS[4][1], SELLERS[4][0], LISTINGS[4][2], "Cảm ơn bạn nhiều!", "T2", 0),
]


def desktop(kind):
    L = Ids(f"cs-{kind}")
    if kind == "warning":
        name, photo = SCAMMER
        head = chat_head(L, S23["title"], name, photo, S23["photo"], "Hoạt động 3 phút trước")
        thread, deal = scam_thread(L), deal_bar(L, S23["price"])
        comp, overlay = composer(L), ""
        rows, side = SCAM_ROWS(), side_pane(S23["photo"], S23["title"], f"Của {name}", S23["price"])
        title = "Tin nhắn · cảnh báo lừa đảo"
    else:
        name, photo, _ = BUYER
        head = chat_head(L, SOFA[2], name, photo, SOFA[0], "Đang hoạt động")
        thread, deal = seller_thread(), deal_bar(L, SOFA[1], seller=True)
        comp = composer(L, replies=True, open_=True)
        # The panel's left edge lines up with the quick-reply button: pane left 388 + 12 padding + 48.
        style = "left:12px;bottom:76px;width:380px"
        overlay = picker(L, style) if kind == "replies" else editor(L, style + ";max-height:420px")
        rows, side = SELL_ROWS(), side_pane(SOFA[0], SOFA[2], "Tin của bạn", SOFA[1])
        title = "Tin nhắn · câu trả lời mẫu" + (", sửa" if kind == "replies-edit" else "")
    body = f"""{bar(L, chat=True)}
<div class="mx-auto grid h-[720px] max-w-[1280px] grid-cols-[340px_minmax(0,1fr)_312px] gap-4 px-6 pt-4">
  {inbox(L, rows)}
  <section class="pane relative flex min-h-0 flex-col">
    {head}
    <div class="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden px-5 py-4">{thread}</div>
    {deal}
    {comp}
    {overlay}
  </section>
  {side}
</div>"""
    return page(title, body)


def phone(kind):
    L = Ids(f"csp-{kind}")
    if kind == "warning":
        name, photo = SCAMMER
        head = chat_head(L, S23["title"], name, photo, S23["photo"], name, back=True)
        thread, deal, comp, overlay = scam_thread(L, phone=True), deal_bar(L, S23["price"], phone=True), composer(L), ""
        title = "Tin nhắn · cảnh báo lừa đảo, điện thoại"
    else:
        name, photo, _ = BUYER
        head = chat_head(L, SOFA[2], name, photo, SOFA[0], name, back=True)
        thread, deal = seller_thread(), deal_bar(L, SOFA[1], seller=True, phone=True)
        comp = composer(L, replies=True, open_=True)
        style = "left:0;right:0;bottom:0"
        sheet = picker(L, style, sheet=True) if kind == "replies" else editor(L, style + ";max-height:560px", sheet=True)
        overlay = f'<div class="absolute inset-0 z-30 bg-black/30"></div>{sheet}'
        title = "Tin nhắn · câu trả lời mẫu, điện thoại" + (", sửa" if kind == "replies-edit" else "")
    body = f"""<div class="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-[var(--bg)]">
  {phone_header()}
  <section class="pane absolute inset-x-4 bottom-[96px] top-[80px] flex min-h-0 flex-col">
    {head}
    <div class="flex min-h-0 flex-1 flex-col justify-end gap-2 overflow-hidden px-4 py-4">{thread}</div>
    {deal}
    {comp}
  </section>
  {bottom_nav()}
  {overlay}
</div>"""
    return page(title, body)


if __name__ == "__main__":
    for kind in ["warning", "replies", "replies-edit"]:
        for name, html in [(f"chat-safety-{kind}", desktop(kind)), (f"chat-safety-{kind}-phone", phone(kind))]:
            with open(os.path.join(OUT, f"{name}.html"), "w") as f:
                f.write(html)
            print("wrote", name)
