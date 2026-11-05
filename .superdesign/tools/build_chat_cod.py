"""Tin nhắn (inbox + thread on one page) and Giao COD (the buyer's COD request),
in the chosen style: C's shell with the app's chat, deal console and money rules.

    python3 tools/build_chat_cod.py        (run from .superdesign/)

The deal is the one on Listing detail: Tuấn Kiệt's iPhone 13 Pro, listed at
5.200.000 ₫, offered 4.900.000 ₫, countered 5.100.000 ₫, agreed at 5.100.000 ₫.
"""
import os
from html import escape

from build import OUT, a
from build_c import ART, CSS, footer, header
from common import crop, head, icon, img

# Verbatim from app/.superdesign/tools/common.py MONEY.
MONEY = dict(
    no_hold="ShopNexus không giữ tiền và không nhận cọc.",
    meet_hint="Món trên 5 triệu nên hẹn gặp xem trực tiếp.",
    cod_buyer="Xem hàng rồi mới trả tiền hàng và phí ship cho shipper.",
    cancel="Bạn hủy được đơn khi người bán chưa gửi hàng và không mất tiền.",
    refuse="Nếu không ưng, bạn từ chối nhận hàng và không mất tiền.",
    after_pay="Sau khi bạn trả tiền, ShopNexus không đòi lại tiền được. Nếu hàng có vấn đề, bạn mở ghi nhận trong chat.",
)

PHOTO = "1632661674596-df8be070a5c5"
THUMB = crop(PHOTO, 200, 0.5, 0.52, 1.25)
SELLER = dict(name="Tuấn Kiệt", photo="1544723795-3fb6469f5b39")
ME = dict(name="Khánh Linh", photo="1541823709867-1b206113eafd")
TITLE = "iPhone 13 Pro 128GB, Xanh Sierra, pin 88%"

PAGE_CSS = CSS + """
  .bubble { border-radius: 20px; padding: 10px 16px; max-width: 80%; }
  .mine .bubble { background: var(--md-secondary-container); }
  .theirs .bubble { background: var(--md-surface-container-high); }
  .mine .bubble + .bubble, .mine .bubble:has(+ .bubble) { border-top-right-radius: 4px; }
  .mine .bubble:has(+ .bubble) { border-bottom-right-radius: 4px; }
  .mine .bubble + .bubble { border-top-right-radius: 4px; }
  .theirs .bubble:has(+ .bubble) { border-bottom-left-radius: 4px; }
  .theirs .bubble + .bubble { border-top-left-radius: 4px; }
  .thread-scroll { scrollbar-width: none; }
  .row-hover:hover { background: var(--md-surface-container); }
  .milestone { animation: tilt-in 600ms var(--spatial) both; }
  @keyframes tilt-in { from { opacity: 0; transform: rotate(-6deg) scale(.92); } }
  @media (prefers-reduced-motion: reduce) { .milestone { animation: none; } }
"""

INBOX = [
    dict(name="Tuấn Kiệt", photo="1544723795-3fb6469f5b39", time="14:12", item="iPhone 13 Pro 128GB", thumb=THUMB,
         preview="Ok bạn, chốt 5,1 tr nhé. Tối nay mình ở Landmark 81.", status=("handshake-outline-rounded", "5,1 tr"), unread=0, sel=True),
    dict(name="Thanh Lý 24h", photo=None, time="13:41", item="Galaxy S23 Ultra 256GB", thumb=img("1678911820864-e2c567c655d7", 168, 168),
         preview="Bạn chuyển trước 500k để mình giữ máy nhé.", scam=True, unread=1),
    dict(name="Minh Quang", photo=None, time="13:22", item="Đàn guitar Yamaha F310", thumb=img("1525201548942-d8732f6617a0", 168, 168),
         preview="Đàn còn không bạn? Mai mình qua xem được không?", unread=1, seller=True),
    dict(name="Đức Huy", photo=None, time="09:12", item="Ghế đôn gỗ cao", thumb=img("1503602642458-232111445657", 168, 168),
         preview="Mình chọn COD rồi nha, bạn tạo đơn giúp mình.", status=("receipt-long-outline-rounded", "Chờ tạo đơn"), seller=True),
    dict(name="Minh Thư", photo="1438761681033-6461ffad8d80", time="Hôm qua", item="Bàn phím cơ 87 phím", thumb=img("1595225476474-87563907a212", 168, 168),
         preview="Shipper báo chiều nay giao, mình nhận rồi báo bạn nhé.", status=("local-shipping-outline-rounded", "Đang giao"), seller=True),
    dict(name="Ngọc Hân", photo="1534751516642-a1af1ef26a56", time="Hôm qua", item="Xe đạp fixed gear khung thép", thumb=img("1507035895480-2b3156c31fc8", 168, 168),
         preview="Mình gửi qua SPX cho rẻ nhé, mai gửi.", status=("schedule-send-outline-rounded", "Chờ gửi")),
    dict(name="Gia Bảo", photo="1506794778202-cad84cf45f1d", time="Thứ Hai", item="Kệ gỗ nhỏ 3 tầng", thumb=img("1532372320572-cda25653a26d", 168, 168),
         preview="Cảm ơn bạn, kệ đẹp lắm!", status=("check-circle-outline-rounded", "650.000 ₫"), seller=True),
]
TONES = ["bg-secondary-container text-on-secondary-container", "bg-primary-container text-on-primary-container", "bg-tertiary-container text-on-tertiary-container"]


def avatar(name, photo, size, ring=""):
    if photo:
        return f'<img src="{img(photo, size * 2, size * 2)}" alt="" class="rounded-full object-cover {ring}" style="width:{size}px;height:{size}px">'
    tone = TONES[sum(map(ord, name)) % len(TONES)]
    return (f'<span class="grid shrink-0 place-items-center rounded-full text-label-m {tone} {ring}" style="width:{size}px;height:{size}px">'
            f'{name[0]}</span>')


def inbox_row(c, i):
    unread = c.get("unread", 0) > 0
    name_cls = "font-bold text-on-surface" if unread else "text-on-surface"
    prev_cls = "font-medium text-on-surface" if unread else "text-on-surface-variant"
    lead = icon("storefront-outline-rounded", 14, "text-primary") if c.get("seller") else ""
    tag = ""
    if c.get("scam"):
        tag = f'<span class="mt-1.5 inline-flex items-center gap-1 rounded-sm bg-error-container px-1.5 py-0.5 text-label-m text-error">{icon("auto-awesome-rounded", 14)}Nghi lừa đảo</span>'
    elif c.get("status"):
        ic, t = c["status"]
        tag = f'<span class="mt-1.5 inline-flex items-center gap-1 rounded-sm bg-surface-container-high px-1.5 py-0.5 text-label-m text-on-surface-variant">{icon(ic, 14)}{t}</span>'
    badge = (f'<span class="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-label-s text-on-primary">{c["unread"]}</span>' if unread else "")
    sel = "bg-secondary-container" if c.get("sel") else "row-hover"
    return a(f"conv-{i}", f"flex gap-3 rounded-lg p-3 {sel}", f"""
  <span class="relative shrink-0"><img src="{c['thumb']}" alt="" class="h-14 w-14 rounded-lg object-cover">
    <span class="absolute -bottom-1 -right-1">{avatar(c["name"], c["photo"], 24, "ring-2 ring-surface-container-low")}</span></span>
  <span class="min-w-0 flex-1">
    <span class="flex items-center gap-2"><span class="min-w-0 flex-1 truncate text-title-s {name_cls}">{c["name"]}</span><span class="text-body-s text-on-surface-variant">{c["time"]}</span></span>
    <span class="mt-0.5 flex items-center gap-1 truncate text-body-s text-on-surface-variant">{lead}<span class="truncate">{c["item"]}</span></span>
    <span class="mt-0.5 flex items-center gap-2"><span class="min-w-0 flex-1 truncate text-body-m {prev_cls}">{escape(c["preview"])}</span>{badge}</span>
    {tag}
  </span>""")


def stepper(current=1, gap=32):
    phases = [("sell-outline-rounded", "Thương lượng"), ("local-shipping-outline-rounded", "Tạo đơn, gửi hàng"),
              ("inventory-2-outline-rounded", "Xem và nhận"), ("star-outline-rounded", "Đánh giá")]
    out = []
    for i, (ic, label) in enumerate(phases):
        if i < current:
            dot = f'<span class="grid h-8 w-8 place-items-center rounded-full bg-primary text-on-primary" aria-label="{label}: xong">{icon(ic.replace("-outline", ""), 18)}</span>'
        elif i == current:
            dot = f'<span class="grid h-[38px] w-[38px] place-items-center rounded-[38%] bg-primary-container text-on-primary-container" aria-label="Bước {i + 1}/4 · {label}">{icon(ic, 20)}</span>'
        else:
            dot = f'<span class="grid h-8 w-8 place-items-center rounded-full bg-surface-container-highest text-on-surface-variant" aria-label="{label}">{icon(ic, 18)}</span>'
        out.append(dot)
        if i < 3:
            out.append(f'<span class="h-0.5 {"bg-primary" if i < current else "bg-surface-container-highest"}" style="width:{gap}px"></span>')
    return f'<div class="flex items-center">{"".join(out)}</div>'


def stepper_labelled(current=1):
    phases = ["Thương lượng", "Tạo đơn, gửi hàng", "Xem và nhận", "Đánh giá"]
    labels = "".join(f'<span class="w-[120px] text-center text-label-m {"text-on-surface" if i == current else "text-on-surface-variant"}">{p}</span>' for i, p in enumerate(phases))
    return f'<div class="flex flex-col items-center gap-2">{stepper(current, gap=84)}<div class="flex gap-[2px]">{labels}</div></div>'


def theirs(*texts, time=None):
    bubbles = "".join(f'<p class="bubble text-body-l text-on-surface">{t}</p>' for t in texts)
    t = f'<p class="ml-11 mt-1 text-label-m text-on-surface-variant">{time}</p>' if time else ""
    return f"""<div class="theirs flex items-end gap-3">{avatar(SELLER["name"], SELLER["photo"], 32)}<div class="flex min-w-0 flex-col items-start gap-0.5">{bubbles}</div></div>{t}"""


def mine(*texts, time=None):
    bubbles = "".join(f'<p class="bubble text-body-l text-on-surface">{t}</p>' for t in texts)
    t = f'<p class="mt-1 text-right text-label-m text-on-surface-variant">{time}</p>' if time else ""
    return f"""<div class="mine flex flex-col items-end gap-0.5">{bubbles}</div>{t}"""


def offer_pill(amount, side, kind="offer", time=None):
    cls = ("bg-tertiary-fixed text-on-tertiary-fixed-variant", "sell-outline-rounded") if kind == "offer" else ("bg-secondary-container text-on-secondary-container", "check-rounded")
    align = "items-end" if side == "mine" else "items-start pl-11"
    t = f'<p class="mt-1 text-label-m text-on-surface-variant">{time}</p>' if time else ""
    return (f'<div class="flex flex-col {align}"><span class="flex h-10 items-center gap-2 rounded-full pl-3 pr-4 text-title-s {cls[0]}">'
            f'{icon(cls[1], 18)}{amount}</span>{t}</div>')


def event(ic, text):
    return f'<p class="flex items-center justify-center gap-1.5 text-label-m text-on-surface-variant">{icon(ic, 16)}{text}</p>'


def messages():
    filters = "".join(f'<button type="button" class="state h-8 rounded-full px-3.5 text-label-l {"bg-secondary-container text-on-secondary-container" if i == 0 else "border border-outline-variant text-on-surface-variant"}">{t}</button>'
                      for i, t in enumerate(["Tất cả", "Mua", "Bán", "Chưa đọc"]))
    rows = "".join(inbox_row(c, i) for i, c in enumerate(INBOX))
    quick = "".join(f'<button type="button" class="state h-8 shrink-0 rounded-full border border-outline-variant px-3.5 text-label-l text-on-surface-variant">{q}</button>'
                    for q in ["Xem máy trước được không?", "Chụp thêm ảnh giúp mình được không?", "Tối nay rảnh không?"])
    thread = f"""
      {event("shield-outline-rounded", MONEY["no_hold"])}
      <p class="text-center text-label-m text-on-surface-variant">Hôm nay</p>
      {mine("Máy còn không bạn?", "Pin 88% là đo trong Cài đặt đúng không?", time="13:52 · Đã xem")}
      {theirs("Còn bạn nhé. Máy zin, pin 88% đo trong Cài đặt, chưa sửa gì.", time="13:55")}
      {offer_pill("4.900.000 ₫", "mine", time="13:58")}
      {theirs("4,9 thì hơi thấp bạn ơi. 5,1 mình bán liền, tặng thêm ốp.")}
      {offer_pill("5.100.000 ₫", "theirs", time="14:03")}
      {offer_pill("Đồng ý 5.100.000 ₫", "mine", kind="accept", time="14:05")}
      <div class="milestone mx-auto flex w-[340px] flex-col items-center rounded-xl bg-tertiary-fixed px-6 pb-5 pt-3 text-center text-on-tertiary-fixed-variant">
        <img src="{ART["art_deal"]}" alt="" class="h-[112px] w-[112px]">
        <p class="text-title-l">Chốt 5,1 tr</p>
        <p class="mt-1 text-body-m">Bắt tay rồi! Đặt COD, hoặc hẹn nhau xem máy.</p>
      </div>
      {theirs("Ok bạn, chốt 5,1 tr nhé. Tối nay mình ở Landmark 81, bạn qua xem máy cũng được.", time="14:12")}
      <div class="pl-11">{a("place-chip", "state inline-flex h-9 items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-lowest px-3.5 text-label-l text-on-surface", icon("auto-awesome-rounded", 16, "text-primary") + "Sảnh Landmark 81" + icon("map-outline-rounded", 16, "text-on-surface-variant"), "https://maps.google.com/?q=Landmark+81")}</div>
    """
    console = f"""<div class="mx-3 mb-3 rounded-xl bg-surface-container px-4 pb-3 pt-3">
      <div class="flex items-center justify-between">{stepper(1)}
        <button type="button" class="state grid h-8 w-8 place-items-center rounded-full bg-surface-container-highest text-on-surface-variant" aria-label="Thu gọn">{icon("keyboard-arrow-down-rounded", 20)}</button></div>
      <div class="mt-2 flex items-center gap-3">
        <span class="grid h-8 w-8 place-items-center rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant">{icon("handshake-outline-rounded", 18)}</span>
        <div class="flex-1"><p class="text-on-surface"><span class="text-display-s">5.100.000</span><span class="text-title-l text-on-surface-variant"> ₫</span></p>
          <p class="flex items-center gap-1 text-body-m text-tertiary">{icon("handshake-outline-rounded", 16)}Đã chốt với {SELLER["name"]}</p></div>
        <button type="button" class="state flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-label-l text-on-primary">{icon("local-shipping-outline-rounded", 20)}Chọn giao COD</button>
      </div>
    </div>"""
    composer = f"""<div class="px-3 pb-3">
      <div class="no-scrollbar mb-2 flex gap-2 overflow-hidden">{quick}</div>
      <div class="flex items-center gap-2">
        <button type="button" class="state grid h-12 w-12 shrink-0 place-items-center rounded-full text-on-surface-variant" aria-label="Đính kèm">{icon("add-photo-alternate-outline-rounded", 24)}</button>
        <div class="flex h-12 flex-1 items-center rounded-full bg-surface-container-high px-5 text-body-l text-on-surface-variant">Nhắn cho {SELLER["name"]}…</div>
        <button type="button" class="state flex h-12 items-center gap-2 rounded-full bg-tertiary-fixed px-5 text-label-l text-on-tertiary-fixed-variant">{icon("sell-outline-rounded", 20)}Trả giá</button>
        <button type="button" class="grid h-12 w-12 shrink-0 place-items-center rounded-full text-on-surface-variant" aria-label="Gửi" disabled>{icon("send-outline-rounded", 24)}</button>
      </div>
    </div>"""
    rules = "".join(f'<li class="flex gap-2 text-body-m text-on-surface-variant">{icon(ic, 18, "mt-0.5")}<span>{MONEY[k]}</span></li>'
                    for k, ic in [("cod_buyer", "local-shipping-outline-rounded"), ("refuse", "undo-rounded"), ("cancel", "cancel-outline-rounded")])
    side = f"""<aside class="flex flex-col gap-4 overflow-hidden">
      <div class="rounded-xl bg-surface-container-lowest p-4">
        <img src="{crop(PHOTO, 640, 0.5, 0.52, 1.25)}" alt="{escape(TITLE)}" class="aspect-[4/3] w-full rounded-lg object-cover">
        <p class="mt-3 line-clamp-2 text-title-m">{escape(TITLE)}</p>
        <p class="mt-1 text-body-s text-on-surface-variant">Như mới · Bình Thạnh · 2,1 km</p>
        <div class="mt-3 flex items-baseline justify-between"><span class="text-body-m text-on-surface-variant">Giá đăng</span><span class="text-body-m text-on-surface-variant line-through">5.200.000 ₫</span></div>
        <div class="mt-1 flex items-baseline justify-between"><span class="flex items-center gap-1 text-body-m text-tertiary">{icon("handshake-outline-rounded", 16)}Đã chốt</span><span class="text-title-l text-tertiary">5.100.000 ₫</span></div>
        {a("open-listing", "state mt-4 flex h-10 items-center justify-center rounded-full border border-outline-variant text-label-l text-primary", "Xem tin")}
      </div>
      <div class="rounded-xl bg-surface-container-lowest p-4">
        <p class="text-title-s">Bước tiếp theo</p>
        <p class="mt-1 text-body-m text-on-surface-variant">Chọn giao COD, {SELLER["name"]} tạo đơn với bên vận chuyển.</p>
        <p class="mt-3 flex gap-2 text-body-m text-on-surface-variant">{icon("group-outline-rounded", 18, "mt-0.5")}<span>{MONEY["meet_hint"]}</span></p>
        <p class="mt-4 text-title-s">Quy tắc tiền</p>
        <ul class="mt-2 flex flex-col gap-2">{rules}</ul>
      </div>
    </aside>"""
    body = f"""<body>
<div class="min-h-screen bg-surface pb-2 font-sans text-on-surface">
  {header(quick="always").replace('bg-secondary-container text-on-secondary-container">Khám phá', 'text-on-surface-variant">Khám phá', 1)}
  <main class="mx-auto max-w-[1328px] px-6">
    <div class="mt-6 grid h-[880px] grid-cols-[360px_1fr_320px] gap-4 rounded-xl bg-surface-container-low p-4">
      <section class="flex min-h-0 flex-col">
        <div class="flex items-center justify-between px-2 pt-2"><h1 class="text-headline-s">Tin nhắn</h1>
          <button type="button" class="state grid h-10 w-10 place-items-center rounded-full text-on-surface-variant" aria-label="Tìm trong tin nhắn">{icon("search-rounded", 22)}</button></div>
        <div class="mt-3 flex gap-2 px-2">{filters}</div>
        <div class="thread-scroll mt-3 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">{rows}</div>
      </section>
      <section class="flex min-h-0 flex-col overflow-hidden rounded-xl bg-surface-container-lowest">
        <div class="flex h-16 items-center gap-3 border-b border-outline-variant px-4">
          {avatar(SELLER["name"], SELLER["photo"], 40)}
          <div class="min-w-0 flex-1"><p class="flex items-center gap-1 text-title-m">{SELLER["name"]}{icon("verified-rounded", 16, "text-primary")}</p><p class="truncate text-body-s text-on-surface-variant">iPhone 13 Pro 128GB · Thường trả lời trong 10 phút</p></div>
          <button type="button" class="state grid h-10 w-10 place-items-center rounded-full text-on-surface-variant" aria-label="Tùy chọn khác">{icon("more-vert", 22)}</button>
        </div>
        <div id="thread" class="thread-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-5">{thread}</div>
        {console}
        {composer}
      </section>
      {side}
    </div>
  </main>
  {footer()}
</div>
<script>
// A thread opens at its newest message.
addEventListener('load', () => {{ const t = document.getElementById('thread'); t.scrollTop = t.scrollHeight; }});
</script>
</body>
</html>"""
    return head("Tin nhắn · ShopNexus", PAGE_CSS) + body


# ---------------------------------------------------------------------- COD --
def cod():
    door = [("inventory-2-outline-rounded", "Mở hộp, xem máy", "Shipper chờ bạn xem: tình trạng, Tin ghi, bật máy kiểm Face ID và pin."),
            ("payments-outline-rounded", "Ưng thì trả shipper", MONEY["cod_buyer"]),
            ("undo-rounded", "Không ưng thì từ chối", MONEY["refuse"])]
    door_html = "".join(f"""<li class="flex gap-4 rounded-lg bg-surface-container-lowest p-4">
  <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary-container text-on-secondary-container">{icon(ic, 22)}</span>
  <div><p class="text-title-m">{t}</p><p class="mt-0.5 text-body-m text-on-surface-variant">{d}</p></div></li>""" for ic, t, d in door)
    row = lambda ic, label, value, cls="": (f'<div class="flex items-center gap-3 py-2.5 {cls}">{icon(ic, 20, "text-on-surface-variant")}'
                                            f'<span class="flex-1 text-body-l">{label}</span><span class="text-title-m">{value}</span></div>')
    body = f"""<body>
<div class="min-h-screen bg-surface pb-2 font-sans text-on-surface">
  {header(quick="always").replace('bg-secondary-container text-on-secondary-container">Khám phá', 'text-on-surface-variant">Khám phá', 1)}
  <main class="mx-auto max-w-[1328px] px-6">
    <nav class="mt-6 flex items-center gap-1.5 text-body-s text-on-surface-variant">{a("crumb-chat", "flex items-center gap-1 hover:underline", icon("arrow-back-rounded", 16) + "Quay lại chat với " + SELLER["name"])}</nav>
    <div class="mt-4 flex items-end justify-between">
      <div><p class="text-label-l uppercase tracking-[0.12em] text-primary">Giao COD</p><h1 class="mt-2 text-display-m">Gửi yêu cầu giao COD</h1></div>
      {stepper_labelled(1)}
    </div>

    <div class="mt-10 grid grid-cols-[1fr_440px] gap-8">
      <div class="flex flex-col gap-6">
        <section class="flex items-center gap-4 rounded-xl bg-surface-container-low p-5">
          <img src="{THUMB}" alt="" class="h-20 w-20 rounded-lg object-cover">
          <div class="min-w-0 flex-1"><p class="truncate text-title-m">{escape(TITLE)}</p>
            <p class="mt-1 flex items-center gap-2 text-body-m text-on-surface-variant">{avatar(SELLER["name"], SELLER["photo"], 24)}{SELLER["name"]} · gửi từ Bình Thạnh</p></div>
          <div class="text-right"><p class="text-headline-s">5.100.000 ₫</p><p class="mt-0.5 flex items-center justify-end gap-1 text-label-l text-tertiary">{icon("handshake-outline-rounded", 16)}Đã chốt</p></div>
        </section>

        <section class="rounded-xl bg-surface-container-low p-6">
          <div class="flex items-center justify-between"><h2 class="text-title-l">Giao đến</h2>{a("change-address", "state flex h-10 items-center rounded-full px-4 text-label-l text-primary", "Đổi")}</div>
          <div class="mt-4 flex flex-col gap-3">
              <div class="flex gap-3">{icon("location-on-outline-rounded", 22, "mt-0.5 text-primary")}<div><p class="text-body-l">Khánh Linh · 0903 ••• 128</p><p class="mt-0.5 text-body-m text-on-surface-variant">Chung cư Vinhomes Grand Park, tòa S5.02, phường Long Thạnh Mỹ, TP Thủ Đức</p></div></div>
              <div class="mt-1 rounded-md bg-surface-container-lowest px-4 py-3 text-body-m text-on-surface-variant">Ghi chú cho shipper: Gọi trước 15 phút, giao giờ hành chính.</div>
          </div>
        </section>

        <section class="grid grid-cols-[240px_1fr] items-center gap-6 rounded-xl bg-secondary-container p-6">
          <img src="{ART["door-check"]}" alt="" class="w-full">
          <div><h2 class="text-title-l text-on-surface">Tại cửa</h2><ul class="mt-4 flex flex-col gap-3">{door_html}</ul></div>
        </section>
      </div>

      <aside class="ticket self-start">
        <div>
          <p class="text-title-l">Tiền</p>
          <div class="mt-3">
            {row("handshake-outline-rounded", "Tiền hàng", "5.100.000 ₫")}
            {row("local-shipping-outline-rounded", "Phí ship", "16.000–30.000 ₫")}
          </div>
          <p class="mt-1 text-body-s text-on-surface-variant">Phí ship thật hiện khi {SELLER["name"]} tạo đơn với bên vận chuyển.</p>
        </div>
        <div>
          <div class="flex items-baseline justify-between"><span class="text-title-m">Tổng trả cho shipper</span></div>
          <p class="mt-1"><span class="text-display-s">5.116.000–5.130.000</span><span class="text-title-l text-on-surface-variant"> ₫</span></p>
          <p class="mt-2 flex items-center gap-2 text-body-m text-on-surface-variant">{icon("payments-outline-rounded", 18)}Bạn không trả gì trong app.</p>
          <button type="button" class="state mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary text-label-l text-on-primary">{icon("send-rounded", 20)}Gửi yêu cầu COD</button>
          <p class="mt-3 text-center text-body-s text-on-surface-variant">Đơn COD đang mở: 2/5 · {a("rep", "text-primary hover:underline", "Điểm uy tín")}</p>
        </div>
        <div class="flex flex-col gap-3">
          {"".join(f'<p class="flex gap-2 text-body-m text-on-surface-variant">{icon(ic, 18, "mt-0.5")}<span>{MONEY[k]}</span></p>' for k, ic in [("cancel", "cancel-outline-rounded"), ("after_pay", "report-outline-rounded"), ("meet_hint", "group-outline-rounded"), ("no_hold", "account-balance-outline-rounded")])}
        </div>
      </aside>
    </div>
  </main>
  {footer()}
</div>
</body>
</html>"""
    return head("Giao COD · ShopNexus", PAGE_CSS) + body


if __name__ == "__main__":
    for name, fn in [("messages", messages), ("cod", cod)]:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(fn())
        print("wrote", name)
