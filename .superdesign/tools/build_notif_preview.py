"""Header previews in K2 (header A): a tap on Thông báo or Tin nhắn opens a
panel under the button instead of leaving the page. Drawn over the signed-in
Home so the page behind stays in view.

    python3 tools/build_notif_preview.py        (run from .superdesign/)

Writes mockups/notif-preview-{desktop,messages,phone}.html.
"""
import os

from build import OUT
from build_header import BADGE, BTN, DOT, SELL, Ids, avatar, logo, search
from build_k2 import SELLERS, header as k2_header, home, ri
from common import LISTINGS, LOGO, img
from j_kit import LABEL  # noqa: F401  (the shared kit; K2 pieces come from build_k2/build_header)

POP = "absolute z-40 flex flex-col overflow-hidden rounded-[20px] bg-white shadow-[0_12px_32px_rgb(20_20_19/.14),0_2px_6px_rgb(20_20_19/.06)]"
TONE = {"offer": "bg-[#E3F2EF] text-[#05554E]", "deal": "bg-[rgb(6_106_97/.10)] text-[#066A61]", "neutral": "bg-[#F3F3F1] text-[#5E5E5A]"}

# (icon, tone, text, ago, unread) in the server's own wording.
NOTES = [
    ("Hôm nay", [
        ("price-tag-3-line", "offer", "Minh Anh trả 4.200.000 ₫ cho Sofa nhung xanh 3 chỗ", "12 phút", True),
        ("truck-line", "deal", "Tuấn Kiệt đã gửi iPhone X 64GB · GHTK S22.1184", "1 giờ", True),
        ("search-line", "deal", "Có 3 tin mới cho “sony a7 iii”", "2 giờ", True),
    ]),
    ("Hôm qua", [
        ("arrow-right-down-line", "deal", "MacBook Air M1 giảm còn 11,2 tr, lúc lưu 12 tr", "1 ngày", False),
        ("star-line", "neutral", "Hoàng Nam chấm bạn 5 sao · AirPods Pro 2", "1 ngày", False),
        ("shake-hands-line", "deal", "Chốt 950.000 ₫ Ghế xoay vải be với Thu Hà", "1 ngày", False),
        ("checkbox-circle-line", "deal", "Máy xay sinh tố 2L đã giao. Đánh giá Quốc Bảo", "1 ngày", False),
        ("store-2-line", "deal", "Bàn làm việc gỗ sồi đã lên", "1 ngày", False),
    ]),
]

# (seller index, listing index, last message, time, unread, tag icon, tag, sells)
CHATS = [
    (1, 5, "Bạn bớt thêm 200k được không ạ?", "12:40", 2, "price-tag-3-line", "Đang trả giá", True),
    (0, 0, "Mình gửi GHTK rồi nha, mai tới", "11:05", 1, "truck-line", "Đang giao", False),
    (3, 10, "Bạn: Ok chốt 950k nhé", "Hôm qua", 0, "shake-hands-line", "Đã chốt giá", False),
    (2, 4, "Tai nghe còn pin tốt không bạn?", "Hôm qua", 0, "", "", False),
    (4, 11, "Bạn: Cảm ơn bạn nhiều!", "T2", 0, "checkbox-circle-line", "Đã nhận hàng", False),
    (1, 2, "Xe còn không bạn?", "17/11", 0, "", "", True),
]


def note_rows(L, groups, n=8):
    out, left = [], n
    for day, items in groups:
        if left <= 0:
            break
        rows = ""
        for ic, tone, text, ago, unread in items[:left]:
            dot = '<span class="block h-2 w-2 rounded-full bg-[#066A61]"></span>' if unread else '<span class="block w-2"></span>'
            rows += L.a(f"flex items-start gap-3 rounded-[16px] px-3 py-2.5 {'bg-[rgb(6_106_97/.05)]' if unread else ''} row",
                        f'<span class="grid h-9 w-9 shrink-0 place-items-center rounded-full {TONE[tone]}">{ri(ic, 18)}</span>'
                        f'<span class="min-w-0 flex-1"><span class="block text-[13px] leading-[18px]">{text}</span>'
                        f'<span class="meta block">{ago} trước</span></span><span class="self-center">{dot}</span>')
        left -= len(items)
        out.append(f'<section class="pt-1"><h3 class="px-3 pb-1 pt-1.5 text-[12px] font-medium leading-4 mute">{day}</h3><div class="flex flex-col gap-0.5">{rows}</div></section>')
    return "".join(out)


def notes_panel(L, style, phone=False):
    head = f"""<div class="flex h-14 shrink-0 items-center gap-2 border-b bd px-4">
      <h2 class="whitespace-nowrap text-[16px] font-semibold">Thông báo</h2>
      <span class="meta flex items-center gap-1.5 whitespace-nowrap"><span class="h-1.5 w-1.5 rounded-full bg-[#066A61]"></span>3 chưa đọc</span>
      <span class="flex-1"></span>
      {L.a("flex h-8 items-center gap-1.5 whitespace-nowrap rounded-[10px] px-2 text-[13px] font-medium row", ri("check-double-line", 16) + "Đánh dấu đã đọc")}
    </div>"""
    foot = f'<div class="shrink-0 border-t bd p-2">{L.a("flex h-10 items-center justify-center gap-1 rounded-[10px] text-[14px] font-medium text-brand row", "Xem tất cả" + ri("arrow-right-s-line", 16))}</div>'
    return f"""<div class="{POP}" style="{style}" role="dialog" aria-label="Thông báo">
    {head}
    <div class="min-h-0 flex-1 overflow-y-auto p-2">{note_rows(L, NOTES)}</div>
    {foot}
  </div>"""


def chat_rows(L):
    rows = ""
    for si, li, last, when, unread, tic, tag, sells in CHATS:
        name, face, _ = SELLERS[si]
        photo, _, title, *_ = LISTINGS[li]
        badge = f'<span class="grid h-5 min-w-5 place-items-center rounded-full bg-[#066A61] px-1.5 text-[11px] font-medium text-white">{unread}</span>' if unread else ""
        chip = (f'<span class="mt-1.5 inline-flex h-6 items-center gap-1 rounded-full bg-[#F3F3F1] px-2 text-[12px] mute">{ri(tic, 14)}{tag}</span>') if tag else ""
        shop = ri("store-2-line", 14, "text-brand") if sells else ""
        rows += L.a("flex gap-3 rounded-[12px] p-3 row",
                    f'<span class="relative h-12 w-12 shrink-0"><img src="{img(photo, 96, 96)}" alt="" class="h-12 w-12 rounded-[8px] object-cover">'
                    f'<img src="{img(face, 48, 48)}" alt="" class="absolute -bottom-1 -right-1 h-6 w-6 rounded-full object-cover ring-2 ring-white"></span>'
                    f'<span class="min-w-0 flex-1"><span class="flex items-baseline gap-2"><span class="min-w-0 flex-1 truncate text-[14px] {"font-bold" if unread else "font-medium"}">{name}</span><span class="meta">{when}</span></span>'
                    f'<span class="mt-0.5 flex items-center gap-1 text-[12.5px] leading-4 mute">{shop}<span class="truncate">{title}</span></span>'
                    f'<span class="mt-0.5 flex items-center gap-2"><span class="min-w-0 flex-1 truncate text-[13px] {"font-medium" if unread else "mute"}">{last}</span>{badge}</span>{chip}</span>')
    return rows


def chats_panel(L, style):
    head = f"""<div class="flex h-14 shrink-0 items-center gap-2 border-b bd px-4">
      <h2 class="text-[16px] font-semibold">Tin nhắn</h2>
      <span class="meta">3 chưa đọc</span>
    </div>"""
    foot = f'<div class="shrink-0 border-t bd p-2">{L.a("flex h-10 items-center justify-center gap-1 rounded-[10px] text-[14px] font-medium text-brand row", "Xem tất cả" + ri("arrow-right-s-line", 16))}</div>'
    return f"""<div class="{POP}" style="{style}" role="dialog" aria-label="Tin nhắn">
    {head}
    <div class="min-h-0 flex-1 overflow-y-auto p-2">{chat_rows(L)}</div>
    {foot}
  </div>"""


def bar(L, *, bell=False, chat=False):
    on = " bg-[#EEEEEB]"
    acts = (L.a(BTN, ri("heart-line", 19), "Đã lưu")
            + L.a(BTN + (on if bell else ""), ri("notification-3-fill" if bell else "notification-3-line", 19) + DOT, "Thông báo")
            + L.a(BTN + (on if chat else ""), ri("chat-3-fill" if chat else "chat-3-line", 19) + BADGE.format(n=3), "Tin nhắn, 3 chưa đọc")
            + '<span class="mx-1.5 h-6 w-px bg-[#DCDCD8]"></span>' + L.a(SELL, ri("add-line", 17) + "Đăng tin") + avatar(L))
    cats = L.a("flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] px-3 text-[14px] row", ri("apps-2-line", 18) + "Danh mục" + ri("arrow-down-s-line", 16, "mute"), "Danh mục")
    return f"""<header class="sticky top-0 z-30 border-b bd bg-[var(--bg)]">
  <div class="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-6">
    {logo(L)}{cats}<div class="flex min-w-0 flex-1 justify-center">{search(False, "max-w-[720px]")}</div>
    <nav class="flex shrink-0 items-center gap-1">{acts}</nav>
  </div>
</header>"""


def desktop(kind):
    L = Ids(f"np-{kind}")
    page = home()
    # The bell's right edge sits 262 px from the window's right at 1280; the panel ends there.
    if kind == "notes":
        panel = notes_panel(L, "top:72px;right:262px;width:380px;max-height:704px")
        hdr = bar(L, bell=True)
    else:
        panel = chats_panel(L, "top:72px;right:218px;width:380px;max-height:704px")
        hdr = bar(L, chat=True)
    page = page.replace(k2_header(), hdr + f'<div class="pointer-events-none fixed inset-0 z-40"><div class="pointer-events-auto">{panel}</div></div>', 1)
    return page.replace("<title>ShopNexus</title>", f"<title>{'Thông báo' if kind == 'notes' else 'Tin nhắn'} · xem nhanh</title>", 1)


def phone():
    L = Ids("np-phone")
    bell = L.a("relative grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[#EEEEEB]", ri("notification-3-fill", 20) + DOT, "Thông báo")
    me = L.a("grid h-10 w-10 shrink-0 place-items-center rounded-full", f'<img src="{img(SELLERS[1][1], 64, 64)}" alt="" class="h-8 w-8 rounded-full object-cover">', "Tài khoản")
    hdr = f"""<header class="sticky top-0 z-30 border-b bd bg-[var(--bg)]">
  <div class="flex h-16 items-center gap-2 px-4">
    {L.a("grid h-10 w-8 shrink-0 place-items-center", f'<img src="{LOGO}" alt="" class="h-8 w-8">', "ShopNexus")}
    <form class="ml-1 flex h-10 min-w-0 flex-1 items-center gap-2 rounded-[10px] bg-white pl-3 pr-1 shadow-[inset_0_0_0_1px_#DCDCD8]">{ri("search-line", 17, "mute")}<input class="h-full min-w-0 flex-1 bg-transparent text-[14px] outline-none" placeholder="Tìm iPhone, xe đạp…"></form>
    {bell}{me}
  </div>
</header>"""
    chips = "".join(f'<span class="flex h-8 shrink-0 items-center gap-1.5 rounded-full border bd bg-white px-3 text-[13px]">{ri(i, 15, "mute")}{t}</span>'
                    for i, t in [("smartphone-line", "Điện thoại"), ("macbook-line", "Máy tính"), ("sofa-line", "Nội thất"), ("riding-line", "Xe đạp")])
    cards = "".join(f"""<article class="card min-w-0 p-1.5"><img src="{img(p, 360, 360)}" alt="" class="aspect-square w-full rounded-[11px] object-cover">
      <div class="px-1 pb-1 pt-2"><p class="num text-[15px] font-semibold">{pr}</p><p class="clamp2 text-[13px] leading-[18px]">{t}</p><p class="meta mt-1">{c} · {km}</p></div></article>"""
                    for p, pr, t, c, km, *_ in LISTINGS[:6])
    nav = "".join(f'<span class="flex flex-col items-center justify-center gap-1 text-[12px] {"" if on else "mute"}"><span class="grid h-8 w-16 place-items-center rounded-full {"bg-mint text-on-mint" if on else ""}">{ri(i, 22)}</span>{t}</span>'
                  for i, t, on in [("compass-3-fill", "Khám phá", True), ("apps-2-line", "Danh mục", False), ("chat-3-line", "Tin nhắn", False), ("user-line", "Tôi", False)])
    body = f"""<div class="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-[var(--bg)]">
  {hdr}
  <main class="px-4 pt-4">
    <p class="meta">Chiều thứ Năm, 20/11</p><h1 class="mt-0.5 text-[22px] font-semibold tracking-[-0.02em]">Chào Khánh Linh</h1>
    <div class="no-scrollbar mt-3 flex gap-2 overflow-hidden">{chips}</div>
    <div class="mt-4 grid grid-cols-2 gap-3">{cards}</div>
  </main>
  <nav class="absolute inset-x-0 bottom-0 grid h-20 grid-cols-4 border-t bd bg-[var(--bg)]">{nav}</nav>
  {notes_panel(L, "top:72px;left:16px;right:16px;max-height:748px")}
</div>"""
    from build_k2 import out
    return out("Thông báo · điện thoại", body)


if __name__ == "__main__":
    for name, html in [("desktop", desktop("notes")), ("messages", desktop("chats")), ("phone", phone())]:
        with open(os.path.join(OUT, f"notif-preview-{name}.html"), "w") as f:
            f.write(html)
        print("wrote notif-preview", name)
