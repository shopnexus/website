"""Tin nhắn (inbox + thread on one page) and Giao COD (the buyer's COD request),
in the chosen style: C's shell with the app's chat, deal console and money rules.

    python3 tools/build_chat_cod.py        (run from .superdesign/)

A conversation is the pair. Khánh Linh and Tuấn Kiệt have two deals: the
iPhone 13 Pro (listed 5.200.000 ₫, offered 4.900.000 ₫, countered and agreed at
5.100.000 ₫) and the AirPods Pro 2 (offered 3.000.000 ₫, waiting on him). The
thread is theirs; the chips under the bar switch the listing and the console.
Thanh Lý 24h's row (or #scam) opens the warned conversation; its banner opens
"Chặn và báo cáo" as a dialog (#report, #reported).
"""
import os
from html import escape

from build import OUT, a
from build_c import ART, CSS, footer, header
from common import MONEY, crop, head, icon, img

# Verbatim from app/.superdesign/tools/common.py MONEY.

PHOTO = "1632661674596-df8be070a5c5"
THUMB = crop(PHOTO, 200, 0.5, 0.52, 1.25)
AIRPODS = "1572569511254-d8f925fe2cbb"
SELLER = dict(name="Tuấn Kiệt", photo="1544723795-3fb6469f5b39")
SCAMMER = dict(name="Thanh Lý 24h", photo=None)
TITLE = "iPhone 13 Pro 128GB, Xanh Sierra, pin 88%"
DEALS = [
    dict(id="iphone", short="iPhone 13 Pro", title=TITLE, photo=crop(PHOTO, 640, 0.5, 0.52, 1.25), chip=crop(PHOTO, 72, 0.5, 0.52, 1.25),
         meta="Như mới · Bình Thạnh · 2,1 km", listed="5.200.000 ₫", agreed="5.100.000 ₫"),
    dict(id="airpods", short="AirPods Pro 2", title="AirPods Pro 2, hộp sạc USB-C", photo=crop(AIRPODS, 640), chip=crop(AIRPODS, 72),
         meta="Như mới · Bình Thạnh · 2,1 km", listed="3.200.000 ₫", offer="3.000.000 ₫"),
]
SCAM_ITEM = dict(title="Galaxy S23 Ultra 256GB, đen", photo=img("1678911820864-e2c567c655d7", 640, 480),
                 thumb=img("1678911820864-e2c567c655d7", 160, 160), meta="Như mới · Q.10 · 4,6 km", listed="8.700.000 ₫")
SIGNALS = [
    ("account-balance-outline-rounded", "Đòi chuyển cọc ngoài app"),
    ("person-add-outline-rounded", "Tài khoản 2 ngày tuổi, chưa xác minh"),
    ("sell-outline-rounded", "Giá thấp hơn 40% so với tin tương tự"),
]
REASONS = [("banned", "Hàng cấm bán"), ("fake", "Hàng giả, hàng nhái"), ("scam", "Có dấu hiệu lừa đảo"), ("other", "Lý do khác")]

PAGE_CSS = CSS + """
  .bubble { border-radius: 20px; padding: 8px 12px; }
  .msg { display: flex; align-items: center; gap: 4px; max-width: 80%; }
  .mine .msg { flex-direction: row-reverse; }
  .mine .bubble { background: var(--md-secondary-container); }
  .theirs .bubble { background: var(--md-surface-container-high); }
  .mine .tuck-top { border-top-right-radius: 4px; } .mine .tuck-bottom { border-bottom-right-radius: 4px; }
  .theirs .tuck-top { border-top-left-radius: 4px; } .theirs .tuck-bottom { border-bottom-left-radius: 4px; }
  /* A mouse replies from the message's hover action, the app's swipe. */
  .reply-btn { opacity: 0; transition: opacity 120ms var(--effects); }
  .msg:hover .reply-btn, .msg:focus-within .reply-btn, .msg.hovered .reply-btn { opacity: 1; }
  .quote { display: flex; gap: 8px; margin: -2px -4px 6px; padding: 6px 8px; border-radius: 12px; background: var(--md-surface-container-lowest); cursor: pointer; }
  .quote .bar, .reply-strip .bar { width: 3px; flex: none; align-self: stretch; border-radius: 9999px; background: var(--md-primary); }
  .clamp2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  [hidden] { display: none !important; }
  .thread-scroll { scrollbar-width: none; }
  .row-hover:hover { background: var(--md-surface-container); }
  .deal-chip[aria-selected="true"] { background: var(--md-secondary-container); color: var(--md-on-secondary-container); border-color: transparent; }
  .unit { margin-left: 4px; font-size: 20px; line-height: 26px; color: var(--md-on-surface-variant); }
  [data-conv]:not(.on) { display: none !important; }
  dialog.report { width: min(480px, calc(100vw - 32px)); border: 0; padding: 24px; border-radius: 28px;
    background: var(--md-surface-container-high); color: var(--md-on-surface); }
  dialog.report::backdrop { background: rgb(0 0 0 / .32); }
  dialog.report [data-pane]:not(.on) { display: none; }
  .radio { flex: none; width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--md-on-surface-variant); display: grid; place-items: center; }
  .radio::after { content: ""; width: 10px; height: 10px; border-radius: 50%; background: var(--md-primary); transform: scale(0); transition: transform 200ms var(--spatial); }
  input:checked + .radio { border-color: var(--md-primary); } input:checked + .radio::after { transform: scale(1); }
  .checkbox { flex: none; width: 18px; height: 18px; border-radius: 2px; border: 2px solid var(--md-on-surface-variant); display: grid; place-items: center; color: var(--md-on-primary); }
  .checkbox > * { opacity: 0; } input:checked + .checkbox { background: var(--md-primary); border-color: var(--md-primary); } input:checked + .checkbox > * { opacity: 1; }
  input:focus-visible + .radio, input:focus-visible + .checkbox { box-shadow: 0 0 0 8px color-mix(in srgb, var(--md-primary) 14%, transparent); }
"""

# role: "sell" when the listing is yours, "none" without a deal; more: the pair's other deals.
INBOX = [
    dict(id="kiet", name="Tuấn Kiệt", photo=SELLER["photo"], time="14:13", item="iPhone 13 Pro 128GB", thumb=THUMB, more=1,
         preview="AirPods để mình xem lại rồi báo bạn nha.", status=("handshake-outline-rounded", "5,1 tr"), sel=True),
    dict(id="scam", name=SCAMMER["name"], photo=None, time="13:41", item="Galaxy S23 Ultra 256GB", thumb=SCAM_ITEM["thumb"],
         preview="Bạn chuyển cọc 500k qua số tài khoản này để mình giữ máy nhé.", scam=True, unread=1),
    dict(id="quang", name="Minh Quang", photo=None, time="13:22", item="Đàn guitar Yamaha F310", thumb=img("1525201548942-d8732f6617a0", 160, 160),
         preview="Đàn còn không bạn? Mai mình qua xem được không?", unread=1, role="sell"),
    dict(id="vy", name="Thảo Vy", photo="1517841905240-472988babdf9", time="10:05", role="none",
         preview="Bạn còn món nào khác không? Mình ở gần Bình Thạnh."),
    dict(id="huy", name="Đức Huy", photo=None, time="09:12", item="Ghế đôn gỗ cao", thumb=img("1503602642458-232111445657", 160, 160),
         preview="Mình chọn COD rồi nha, bạn tạo đơn giúp mình.", status=("receipt-long-outline-rounded", "Chờ tạo đơn"), role="sell"),
    dict(id="thu", name="Minh Thư", photo="1438761681033-6461ffad8d80", time="Hôm qua", item="Bàn phím cơ 87 phím, switch đỏ",
         thumb=img("1595225476474-87563907a212", 160, 160), preview="Shipper báo chiều nay giao, mình nhận rồi báo bạn nhé.",
         status=("local-shipping-outline-rounded", "Đang giao"), role="sell"),
    dict(id="nam", name="Hoàng Nam", photo="1500648767791-00dcc994a43e", time="Hôm qua", item="iPhone X 64GB, pin 86%",
         thumb=img("1510557880182-3d4d3cba35a5", 160, 160), preview="Ok bạn, chốt 3,8 tr. Bạn chọn COD đi, mình tạo đơn liền.",
         status=("handshake-outline-rounded", "3,8 tr")),
    dict(id="bao", name="Gia Bảo", photo="1506794778202-cad84cf45f1d", time="Thứ Hai", item="Kệ gỗ nhỏ 3 tầng",
         thumb=img("1532372320572-cda25653a26d", 160, 160), preview="Cảm ơn bạn, kệ đẹp lắm!",
         status=("check-circle-outline-rounded", "650.000 ₫"), role="sell"),
]
# The app's four avatar tones, by the name's hash.
TONES = ["bg-secondary-container text-on-secondary-container", "bg-primary-container text-on-primary-container",
         "bg-tertiary-container text-on-tertiary-container", "bg-surface-container-highest text-on-surface-variant"]
ICON_BTN = "state grid h-10 w-10 shrink-0 place-items-center rounded-full text-on-surface-variant"
FILLED = "state flex h-10 items-center justify-center gap-2 rounded-full bg-primary px-6 text-label-l text-on-primary"
BARGAIN = "state flex h-10 items-center justify-center gap-2 rounded-full bg-tertiary-fixed px-6 text-label-l text-on-tertiary-fixed-variant"
TAG = "inline-flex h-6 items-center gap-1 rounded-sm bg-surface-container-high px-2 text-label-m text-on-surface-variant"


def avatar(name, photo, size, ring=""):
    if photo:
        return f'<img src="{img(photo, size * 2, size * 2)}" alt="" class="shrink-0 rounded-full object-cover {ring}" style="width:{size}px;height:{size}px">'
    tone = TONES[sum(map(ord, name)) % len(TONES)]
    return (f'<span class="grid shrink-0 place-items-center rounded-full text-label-m {tone} {ring}" style="width:{size}px;height:{size}px">'
            f'{name[0]}</span>')


def inbox_row(c):
    unread = c.get("unread", 0) > 0
    name_cls = "font-bold" if unread else ""
    prev_cls = "font-medium text-on-surface" if unread else "text-on-surface-variant"
    tag = ""
    if c.get("scam"):
        # A status tag like the others; only the shield takes error.
        tag = f'<span class="mt-1.5 {TAG}"><span class="text-error">{icon("gpp-maybe-outline-rounded", 14)}</span>Nghi lừa đảo</span>'
    elif c.get("status"):
        ic, t = c["status"]
        tag = f'<span class="mt-1.5 {TAG}">{icon(ic, 14)}{t}</span>'
    badge = (f'<span class="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-label-s text-on-primary">{c["unread"]}</span>' if unread else "")
    sel = "bg-secondary-container" if c.get("sel") else "row-hover"
    ring = "ring-2 ring-secondary-container" if c.get("sel") else "ring-2 ring-surface-container-low"
    if c.get("item"):
        lead = (f'<span class="relative h-12 w-12 shrink-0"><img src="{c["thumb"]}" alt="" class="h-12 w-12 rounded-lg object-cover">'
                f'<span class="absolute -bottom-1 -right-1">{avatar(c["name"], c["photo"], 24, ring)}</span></span>')
        seller = icon("storefront-outline-rounded", 14, "text-primary") if c.get("role") == "sell" else ""
        more = f'<span class="ml-1 shrink-0 rounded-sm bg-surface-container-high px-1.5 text-label-s text-on-surface-variant">+{c["more"]}</span>' if c.get("more") else ""
        item = f'<span class="mt-0.5 flex items-center gap-1 text-body-s text-on-surface-variant">{seller}<span class="truncate">{escape(c["item"])}</span>{more}</span>'
    else:
        # A conversation with no deal: the person's face, no listing line, no tag.
        lead, item = avatar(c["name"], c["photo"], 48), ""
    target = f' data-open="{c["id"]}"' if c["id"] in ("kiet", "scam") else ""
    return a(f"conv-{c['id']}", f"flex gap-3 rounded-lg p-3 {sel}", f"""
  {lead}
  <span class="min-w-0 flex-1">
    <span class="flex items-baseline gap-2"><span class="min-w-0 flex-1 truncate text-title-s text-on-surface {name_cls}">{c["name"]}</span><span class="text-body-s text-on-surface-variant">{c["time"]}</span></span>
    {item}
    <span class="mt-0.5 flex items-center gap-2"><span class="min-w-0 flex-1 truncate text-body-m {prev_cls}">{escape(c["preview"])}</span>{badge}</span>
    {tag}
  </span>""").replace("<a ", f"<a{target} ", 1)


# The four steps every deal and order shows (the app's phase_steps): price agreed, order created, item received, rated.
PHASES = [("sell-outline-rounded", "Chốt giá"), ("local-shipping-outline-rounded", "Tạo đơn"),
          ("package-2-outline-rounded", "Nhận hàng"), ("star-outline-rounded", "Đánh giá")]


def stepper(current=1, gap=32):
    out = []
    for i, (ic, label) in enumerate(PHASES):
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
    labels = "".join(f'<span class="w-[120px] text-center text-label-m {"text-on-surface" if i == current else "text-on-surface-variant"}">{p}</span>'
                     for i, (_, p) in enumerate(PHASES))
    return f'<div class="flex flex-col items-center gap-2">{stepper(current, gap=84)}<div class="flex gap-[2px]">{labels}</div></div>'


# ------------------------------------------------------------------ thread --
def reply_btn():
    return f'<button type="button" class="reply-btn state grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-container-high text-on-surface-variant" aria-label="Trả lời">{icon("reply-rounded", 18)}</button>'


def group(side, texts, time, hovered=None, quote=None):
    """Consecutive bubbles of one side: 2 px apart, corners on the sender's side tucked, one time under the last."""
    n = len(texts)
    msgs = []
    for i, t in enumerate(texts):
        tuck = (" tuck-top" if i else "") + (" tuck-bottom" if i < n - 1 else "")
        q = ""
        if quote and i == 0:
            who, said = quote
            q = (f'<span class="quote"><span class="bar"></span><span class="min-w-0 flex-1"><span class="block text-label-m text-primary">{who}</span>'
                 f'<span class="clamp2 text-body-s text-on-surface-variant">{said}</span></span></span>')
        msgs.append(f'<div class="msg{" hovered" if hovered == i else ""}"><div class="bubble{tuck} text-body-l text-on-surface">{q}{t}</div>{reply_btn()}</div>')
    align = "items-end" if side == "mine" else "items-start"
    return (f'<div class="{side} flex flex-col {align} gap-0.5">{"".join(msgs)}'
            f'<p class="mt-1 px-2 text-body-s text-on-surface-variant">{time}</p></div>')


def move(side, amount, time, kind="offer"):
    """A price move: a 40 px pill on the side that made it; with two deals the line under it names the item."""
    pill, ic = (("bg-tertiary-fixed text-on-tertiary-fixed-variant", "sell-outline-rounded") if kind == "offer"
                else ("bg-secondary-container text-on-secondary-container", "check-rounded"))
    align = "items-end" if side == "mine" else "items-start"
    return (f'<div class="flex flex-col {align} gap-1"><span class="flex h-10 items-center gap-2 rounded-full pl-3 pr-4 text-title-s {pill}">'
            f'{icon(ic, 18)}{amount}</span><p class="px-2 text-body-s text-on-surface-variant">{time}</p></div>')


def event(ic, text):
    return f'<p class="flex items-center justify-center gap-1.5 text-label-m text-on-surface-variant">{icon(ic, 16)}{text}</p>'


def pane_head(title, name, verified, thumb, face, chips=""):
    return f"""<div class="border-b border-outline-variant">
        <div class="flex h-16 items-center gap-3 px-4">
          {a("listing-link", "state flex min-w-0 flex-1 items-center gap-3 rounded-lg py-1 pr-2", f'''
            <span class="relative h-10 w-10 shrink-0"><img src="{thumb}" alt="" class="h-10 w-10 rounded-md object-cover">
              <span class="absolute -bottom-1 -right-1">{face}</span></span>
            <span class="min-w-0"><span class="block truncate text-title-m text-on-surface">{escape(title)}</span>
              <span class="flex items-center gap-1 text-body-s text-on-surface-variant">{name}{icon("verified-rounded", 14, "text-primary") if verified else ""}</span></span>''')}
          <button type="button" class="{ICON_BTN}" aria-label="Tùy chọn khác">{icon("more-vert", 22)}</button>
        </div>{chips}
      </div>"""


def deal_chips():
    chips = "".join(
        f'<button type="button" role="tab" data-deal="{d["id"]}" aria-selected="{str(i == 0).lower()}" '
        f'class="deal-chip state flex h-8 shrink-0 items-center gap-2 rounded-full border border-outline-variant pl-1 pr-3 text-label-l text-on-surface-variant">'
        f'<img src="{d["chip"]}" alt="" class="h-6 w-6 rounded-full object-cover">{d["short"]}</button>'
        for i, d in enumerate(DEALS))
    return f'\n        <div class="flex gap-2 px-4 pb-3" role="tablist" aria-label="Món đang thỏa thuận">{chips}</div>'


def console_shell(current, body):
    return f"""<div class="mx-3 mt-2 rounded-xl bg-surface-container px-4 pb-3 pt-3">
        <div class="flex items-center justify-between">{stepper(current)}
          <button type="button" class="state grid h-8 w-8 place-items-center rounded-full bg-surface-container-highest text-on-surface-variant" aria-label="Thu gọn">{icon("keyboard-arrow-down-rounded", 20)}</button></div>
        <div class="pt-2">{body}</div>
      </div>"""


def figure(lead, value, actions):
    return (f'<div class="flex items-center gap-3">{lead}<p class="flex flex-1 items-baseline text-on-surface"><span class="text-headline-m">{value}</span>'
            f'<span class="unit">₫</span></p><div class="flex gap-2">{actions}</div></div>')


def lead_icon(name, tone="bg-tertiary-fixed text-on-tertiary-fixed-variant"):
    return f'<span class="grid h-8 w-8 shrink-0 place-items-center rounded-full {tone}">{icon(name, 18)}</span>'


def composer(peer, strip=""):
    return f"""<div class="px-3 pb-3 pt-2">{strip}
        <div class="flex items-center gap-1">
          <button type="button" class="state grid h-12 w-12 shrink-0 place-items-center rounded-full text-on-surface-variant" aria-label="Gửi ảnh hoặc vị trí">{icon("add-circle-outline-rounded", 24)}</button>
          <div class="flex h-12 flex-1 items-center rounded-full bg-surface-container-high px-5 text-body-l text-on-surface-variant" aria-label="Nhắn tin cho {peer}">Nhắn tin</div>
          <button type="button" class="grid h-12 w-12 shrink-0 place-items-center rounded-full text-on-surface-variant" aria-label="Gửi" disabled>{icon("send-rounded", 22)}</button>
        </div>
      </div>"""


def kiet_pane():
    iphone, airpods = DEALS
    landmark = "Ok bạn, chốt 5,1 tr nhé. Tối nay 19h gặp ở sảnh Landmark 81 xem máy nhé?"
    asked = "AirPods để mình xem lại rồi báo bạn nha."
    place = a("place-chip", "state mt-1 inline-flex h-9 items-center gap-1.5 rounded-full border border-outline-variant bg-surface-container-lowest px-3.5 text-label-l text-on-surface",
              icon("auto-awesome-rounded", 16, "text-primary") + "Sảnh Landmark 81" + icon("map-outline-rounded", 16, "text-on-surface-variant"),
              "https://maps.google.com/?q=Landmark+81")
    thread = f"""
      {event("shield-outline-rounded", MONEY["no_hold"])}
      <p class="pt-1 text-center text-label-m text-on-surface-variant">Hôm nay</p>
      {group("mine", ["Máy còn không bạn?", "Pin 88% là đo trong Cài đặt đúng không?"], "13:52 · Đã xem")}
      {group("theirs", ["Còn bạn nhé. Máy zin, pin 88% đo trong Cài đặt, chưa sửa gì."], "13:55")}
      {move("mine", "4.900.000 ₫", "iPhone 13 Pro · 13:58")}
      {group("theirs", ["4,9 thì hơi thấp bạn ơi. 5,1 mình bán liền, tặng thêm ốp."], "14:03")}
      {move("theirs", "5.100.000 ₫", "iPhone 13 Pro · 14:03")}
      {move("mine", "5.100.000 ₫", "iPhone 13 Pro · 14:05", kind="accept")}
      {event("handshake-outline-rounded", "iPhone 13 Pro · Chốt 5,1 tr")}
      <div class="flex flex-col items-start">{group("theirs", [landmark], "14:06").replace('<p class="mt-1 px-2', place + '<p class="mt-1 px-2', 1)}</div>
      {group("mine", ["Ok, 19h mình qua."], "14:07 · Đã xem", quote=(SELLER["name"], landmark))}
      {group("mine", ["Bạn bán luôn AirPods Pro 2 không? Mình lấy cả hai."], "14:11")}
      {move("mine", airpods["offer"], "AirPods Pro 2 · 14:12")}
      {group("theirs", [asked], "14:13", hovered=0)}
    """
    agreed = figure(lead_icon("handshake-outline-rounded"), "5.100.000",
                    a("choose-cod", FILLED, icon("local-shipping-outline-rounded", 20) + "Chọn giao COD", "cod.html"))
    body = f"""{agreed}
          <p class="mt-1 flex items-center gap-2 text-body-m text-on-surface-variant">{icon("local-shipping-outline-rounded", 18)}Giao COD · xem hàng rồi mới trả</p>
          <p class="mt-1 flex items-center gap-2 text-body-m text-on-surface-variant">{icon("group-outline-rounded", 18)}{MONEY["meet_hint"]}</p>"""
    strip = f"""
        <div class="reply-strip mb-2 flex items-center gap-3 rounded-lg bg-surface-container py-2 pl-3 pr-1">
          <span class="bar"></span>
          <span class="min-w-0 flex-1"><span class="block text-label-m text-primary">Trả lời {SELLER["name"]}</span><span class="block truncate text-body-s text-on-surface-variant">{asked}</span></span>
          <button type="button" class="{ICON_BTN}" aria-label="Bỏ trả lời">{icon("close-rounded", 20)}</button>
        </div>"""
    return f"""<section data-conv="kiet" class="on flex min-h-0 flex-col overflow-hidden rounded-xl bg-surface-container-lowest">
      {pane_head(iphone["title"], SELLER["name"], True, THUMB, avatar(SELLER["name"], SELLER["photo"], 20, "ring-2 ring-surface-container-lowest"), deal_chips())}
      <div class="thread-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-5 py-4" data-thread>{thread}</div>
      {console_shell(1, body)}
      {composer(SELLER["name"], strip)}
    </section>"""


def scam_pane():
    banner = f"""<button type="button" data-open-report class="state flex w-full items-center gap-3 rounded-lg bg-surface-container-high py-3 pl-4 pr-3 text-left" aria-haspopup="dialog">
        <span class="text-error">{icon("gpp-maybe-outline-rounded", 24)}</span>
        <span class="min-w-0 flex-1"><span class="block text-title-s text-on-surface">Có thể là lừa đảo</span>
          <span class="mt-0.5 flex items-center gap-1 text-body-s text-on-surface-variant">{icon("auto-awesome-rounded", 14, "text-primary")}3 dấu hiệu · đừng chuyển tiền trước</span></span>
        <span class="text-on-surface-variant">{icon("chevron-right-rounded", 24)}</span>
      </button>"""
    thread = f"""
      {event("shield-outline-rounded", MONEY["no_hold"])}
      <p class="pt-1 text-center text-label-m text-on-surface-variant">Hôm nay</p>
      {group("mine", ["Máy còn không bạn? Mình ở Bình Thạnh."], "13:35 · Đã xem")}
      {group("theirs", ["Còn bạn, nhiều người hỏi lắm.", "Bạn chuyển cọc 500k qua số tài khoản này để mình giữ máy nhé."], "13:41")}
    """
    listed = figure(lead_icon("sell-outline-rounded"), "8.700.000",
                    f'<button type="button" class="{BARGAIN}">{icon("sell-outline-rounded", 20)}Trả giá</button>'
                    f'<button type="button" class="{FILLED}">{icon("handshake-outline-rounded", 20)}Mua giá này</button>')
    body = f'{listed}<p class="mt-1 pl-11 text-body-s text-on-surface-variant">Giá đăng</p>'
    blocked = f"""<div data-blocked hidden class="m-3 flex items-center gap-3 rounded-lg bg-surface-container py-2 pl-4 pr-2">
        <span class="text-on-surface-variant">{icon("block-rounded", 20)}</span>
        <p class="min-w-0 flex-1 text-body-m text-on-surface-variant">Bạn đã chặn và báo cáo {SCAMMER["name"]}</p>
        <button type="button" data-unblock class="state h-10 rounded-full px-3 text-label-l text-primary">Bỏ chặn</button>
      </div>"""
    return f"""<section data-conv="scam" class="flex min-h-0 flex-col overflow-hidden rounded-xl bg-surface-container-lowest">
      {pane_head(SCAM_ITEM["title"], SCAMMER["name"], False, SCAM_ITEM["thumb"], avatar(SCAMMER["name"], None, 20, "ring-2 ring-surface-container-lowest"))}
      <div data-warning class="px-3 pt-3">{banner}</div>
      <div class="thread-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-5 py-4" data-thread>{thread}</div>
      <div data-live>{console_shell(0, body)}{composer(SCAMMER["name"])}</div>
      {blocked}
    </section>"""


def listing_card(d, price_rows, conv=None):
    return f"""<div class="rounded-xl bg-surface-container-lowest p-4"{f' data-deal-card="{conv}"' if conv else ""}>
        <img src="{d["photo"]}" alt="{escape(d["title"])}" class="aspect-[4/3] w-full rounded-lg object-cover">
        <p class="mt-3 line-clamp-2 text-title-m">{escape(d["title"])}</p>
        <p class="mt-1 text-body-s text-on-surface-variant">{d["meta"]}</p>
        {price_rows}
        {a("open-listing", "state mt-4 flex h-10 items-center justify-center rounded-full border border-outline-variant text-label-l text-primary", "Xem tin")}
      </div>"""


def price_row(label, value, cls="text-body-m text-on-surface-variant", vcls="text-body-m text-on-surface-variant"):
    return f'<div class="mt-1 flex items-baseline justify-between"><span class="flex items-center gap-1 {cls}">{label}</span><span class="{vcls}">{value}</span></div>'


def rules_card():
    """Chat's "Quy tắc tiền" sheet, kept open beside the thread on a wide window."""
    groups = [("COD, xem hàng trước", [("cod_buyer", "local-shipping-outline-rounded"), ("refuse", "undo-rounded"),
                                       ("cancel", "cancel-outline-rounded"), ("meet_hint", "group-outline-rounded")]),
              ("Mọi giao dịch", [("no_hold", "account-balance-outline-rounded")])]
    out = "".join(f'<p class="{"mt-4 " if i else ""}text-title-s text-primary">{name}</p><ul class="mt-2 flex flex-col gap-2">'
                  + "".join(f'<li class="flex gap-2 text-body-m text-on-surface-variant">{icon(ic, 18, "mt-0.5")}<span>{MONEY[k]}</span></li>' for k, ic in notes)
                  + "</ul>" for i, (name, notes) in enumerate(groups))
    return f'<div class="rounded-xl bg-surface-container-lowest p-4"><p class="text-title-m">Quy tắc tiền</p><div class="mt-3">{out}</div></div>'


def side_panels():
    iphone, airpods = DEALS
    hand = icon("handshake-outline-rounded", 16)
    iphone_rows = (price_row("Giá đăng", iphone["listed"], vcls="text-body-m text-on-surface-variant line-through")
                   + price_row(hand + "Đã chốt", iphone["agreed"], "text-body-m text-tertiary", "text-title-l text-tertiary"))
    airpods_rows = (price_row("Giá đăng", airpods["listed"])
                    + price_row(icon("hourglass-empty-rounded", 16) + "Chờ " + SELLER["name"], airpods["offer"], "text-body-m text-on-surface-variant", "text-title-l text-on-surface"))
    scam_rows = price_row("Giá đăng", SCAM_ITEM["listed"], vcls="text-title-l text-on-surface")
    return f"""<aside data-conv="kiet" class="on flex flex-col gap-4 overflow-hidden">
      {listing_card(iphone, iphone_rows, "iphone")}{listing_card(airpods, airpods_rows, "airpods").replace("<div ", "<div hidden ", 1)}
      {rules_card()}
    </aside>
    <aside data-conv="scam" class="flex flex-col gap-4 overflow-hidden">
      {listing_card(SCAM_ITEM, scam_rows)}
      {rules_card()}
    </aside>"""


def report_dialog():
    """Chặn và báo cáo: the app's bottom sheet, a dialog on a wide window. The signals, then the block form, then sent."""
    def close(label="Đóng"):
        return f'<button type="button" data-close class="{ICON_BTN} -mr-2" aria-label="{label}">{icon("close-rounded", 22)}</button>'
    signals = "".join(f'<li class="flex min-h-12 items-center gap-4">{icon(ic, 24, "text-on-surface-variant")}<span class="text-body-l">{t}</span></li>' for ic, t in SIGNALS)
    ticks = "".join(f'<label class="flex min-h-12 items-center gap-4"><input type="checkbox" class="sr-only" checked><span class="checkbox">{icon("check-rounded", 16)}</span>'
                    f'<span class="text-body-m">{t}</span></label>' for _, t in SIGNALS)
    reasons = "".join(
        f'<label class="flex min-h-12 items-center gap-4"><input type="radio" name="reason" value="{k}" class="sr-only"{" checked" if k == "scam" else ""}>'
        f'<span class="radio"></span><span class="text-body-l">{label}</span></label>'
        + (f'<div class="pl-9"><p class="flex items-center gap-1 text-label-m text-primary">{icon("auto-awesome-rounded", 14)}3 dấu hiệu</p>{ticks}</div>' if k == "scam" else "")
        for k, label in REASONS)
    btn = "state h-10 w-full rounded-full text-label-l"
    return f"""<dialog id="report" class="report" aria-labelledby="report-title">
  <div data-pane="signals" class="on">
    <div class="flex items-center justify-between"><h2 class="text-headline-s">Có thể là lừa đảo</h2>{close()}</div>
    <p class="mt-1 flex items-center gap-1 text-label-m text-primary">{icon("auto-awesome-rounded", 16)}3 dấu hiệu</p>
    <ul class="mt-2">{signals}</ul>
    <button type="button" data-go="form" class="{btn} mt-6 bg-primary text-on-primary">Chặn và báo cáo</button>
    <button type="button" data-hide-warning class="{btn} mt-2 text-primary">Ẩn cảnh báo</button>
  </div>
  <div data-pane="form">
    <div class="flex items-center justify-between"><h2 id="report-title" class="text-headline-s">Chặn và báo cáo</h2>{close()}</div>
    <p class="text-body-m text-on-surface-variant">{SCAMMER["name"]}</p>
    <fieldset class="mt-3" aria-label="Lý do">{reasons}</fieldset>
    <label class="mt-3 block rounded-xs bg-surface-container-highest px-4 pb-2 pt-2">
      <span class="block text-body-s text-on-surface-variant">Ghi chú thêm (không bắt buộc)</span>
      <textarea rows="2" maxlength="300" class="mt-0.5 block w-full resize-none border-0 bg-transparent p-0 text-body-l outline-none"></textarea>
    </label>
    <p class="mt-3 flex items-center gap-2 text-body-s text-on-surface-variant">{icon("block-rounded", 16)}{SCAMMER["name"]} sẽ không nhắn cho bạn được nữa.</p>
    <div class="mt-6 flex justify-end gap-2">
      <button type="button" data-go="signals" class="state h-10 rounded-full px-4 text-label-l text-primary">Quay lại</button>
      <button type="button" data-go="sent" class="state h-10 rounded-full bg-primary px-6 text-label-l text-on-primary">Chặn và gửi báo cáo</button>
    </div>
  </div>
  <div data-pane="sent">
    <div class="flex items-center justify-between"><h2 class="text-headline-s">Đã gửi báo cáo</h2>{close()}</div>
    <div class="mt-3 flex items-center gap-4">
      <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-container text-on-primary-container">{icon("check-rounded", 24)}</span>
      <p class="text-body-m text-on-surface-variant">Đã chặn {SCAMMER["name"]}. Cuộc trò chuyện đã rời Tin nhắn.</p>
    </div>
    <div class="mt-6 flex justify-end gap-2">
      <button type="button" data-unblock class="state h-10 rounded-full px-4 text-label-l text-primary">Bỏ chặn</button>
      <button type="button" data-close class="state h-10 rounded-full bg-primary px-6 text-label-l text-on-primary">Xong</button>
    </div>
  </div>
</dialog>"""


SCRIPT = """<script>
(() => {
  const dlg = document.getElementById('report');
  const open = id => {
    document.querySelectorAll('[data-conv]').forEach(el => el.classList.toggle('on', el.dataset.conv === id));
    document.querySelectorAll('[data-open]').forEach(r => {
      const on = r.dataset.open === id;
      r.classList.toggle('bg-secondary-container', on); r.classList.toggle('row-hover', !on);
    });
    document.querySelectorAll('[data-conv="' + id + '"] [data-thread]').forEach(t => { t.scrollTop = t.scrollHeight; });
  };
  const pane = p => dlg.querySelectorAll('[data-pane]').forEach(el => el.classList.toggle('on', el.dataset.pane === p));
  const blocked = on => {
    document.querySelector('[data-blocked]').hidden = !on;
    document.querySelector('[data-live]').hidden = on;
    document.querySelector('[data-warning]').hidden = on;
    document.querySelector('[data-open="scam"]').hidden = on;
  };
  document.querySelectorAll('[data-open]').forEach(r => r.addEventListener('click', e => { e.preventDefault(); open(r.dataset.open); }));
  document.querySelector('[data-open-report]').addEventListener('click', () => { pane('signals'); dlg.showModal(); });
  dlg.addEventListener('click', e => {
    const go = e.target.closest('[data-go]');
    if (go) { pane(go.dataset.go); if (go.dataset.go === 'sent') blocked(true); }
    if (e.target.closest('[data-close]') || e.target === dlg) dlg.close();
    if (e.target.closest('[data-hide-warning]')) { document.querySelector('[data-warning]').hidden = true; dlg.close(); }
  });
  document.querySelectorAll('[data-unblock]').forEach(b => b.addEventListener('click', () => { blocked(false); dlg.close(); open('scam'); }));
  // The chips switch the listing in the bar and on the side; the thread is the pair's and stays.
  document.querySelectorAll('[data-deal]').forEach(c => c.addEventListener('click', () => {
    document.querySelectorAll('[data-deal]').forEach(x => x.setAttribute('aria-selected', x === c));
    document.querySelectorAll('[data-deal-card]').forEach(card => { card.hidden = card.dataset.dealCard !== c.dataset.deal; });
  }));
  const h = location.hash.slice(1);
  addEventListener('load', () => {
    open(h === 'scam' || h === 'report' || h === 'reported' ? 'scam' : 'kiet');
    if (h === 'report') { pane('form'); dlg.showModal(); }
    if (h === 'reported') { pane('sent'); blocked(true); dlg.showModal(); }
  });
})();
</script>"""


def messages():
    filters = "".join(f'<button type="button" class="state flex h-8 items-center gap-1 rounded-full px-3.5 text-label-l {"bg-secondary-container text-on-secondary-container" if i == 0 else "border border-outline-variant text-on-surface-variant"}">{t}</button>'
                      for i, t in enumerate(["Tất cả", "Mua", "Bán", "Chưa đọc (2)"]))
    rows = "".join(inbox_row(c) for c in INBOX)
    body = f"""<body>
<div class="min-h-screen bg-surface pb-2 font-sans text-on-surface">
  {header(quick="always").replace('bg-secondary-container text-on-secondary-container">Khám phá', 'text-on-surface-variant">Khám phá', 1)}
  <main class="mx-auto max-w-[1328px] px-6">
    <div class="mt-6 grid h-[880px] grid-cols-[360px_1fr_320px] gap-4 rounded-xl bg-surface-container-low p-4">
      <section class="flex min-h-0 flex-col">
        <div class="flex items-center justify-between px-2 pt-2"><h1 class="text-headline-s">Tin nhắn</h1>
          <button type="button" class="{ICON_BTN}" aria-label="Tìm trong tin nhắn">{icon("search-rounded", 22)}</button></div>
        <div class="mt-3 flex gap-2 px-2">{filters}</div>
        <div class="thread-scroll mt-3 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">{rows}</div>
      </section>
      {kiet_pane()}
      {scam_pane()}
      {side_panels()}
    </div>
  </main>
  {footer()}
  {report_dialog()}
  {SCRIPT}
</div>
</body>
</html>"""
    return head("Tin nhắn · ShopNexus", PAGE_CSS) + body


# ---------------------------------------------------------------------- COD --
COD_CSS = PAGE_CSS + """
  .group > * { border-radius: 4px; background: var(--md-surface-container); }
  .group > :first-child { border-top-left-radius: 28px; border-top-right-radius: 28px; }
  .group > :last-child { border-bottom-left-radius: 28px; border-bottom-right-radius: 28px; }
  /* A money row: an amount too wide to sit beside its label goes under it, at the right; the label never breaks. */
  .money-row { display: flex; flex-wrap: wrap; align-items: center; column-gap: 16px; }
  .money-row > .label { white-space: nowrap; flex: 1 0 auto; }
  .money-row > .amount { margin-left: auto; text-align: right; }
"""


def cod():
    open_cod, cap = 2, 3

    def money_row(ic, label, value, vcls="text-body-l"):
        return (f'<div class="money-row min-h-14 px-5 py-2">{icon(ic, 22, "text-on-surface-variant")}'
                f'<span class="label text-body-l">{label}</span><span class="amount {vcls}">{value}</span></div>')
    address = "Chung cư Vinhomes Grand Park, tòa S5.02, 512 Nguyễn Xiển, Phường Long Bình, Hồ Chí Minh"
    body = f"""<body>
<div class="min-h-screen bg-surface pb-2 font-sans text-on-surface">
  {header(quick="always").replace('bg-secondary-container text-on-secondary-container">Khám phá', 'text-on-surface-variant">Khám phá', 1)}
  <main class="mx-auto max-w-[1328px] px-6">
    <nav class="mt-6 flex items-center gap-1.5 text-body-s text-on-surface-variant">{a("crumb-chat", "flex items-center gap-1 hover:underline", icon("arrow-back-rounded", 16) + "Quay lại chat với " + SELLER["name"], "messages.html")}</nav>
    <div class="mt-4 flex items-end justify-between">
      <h1 class="text-display-m">Giao COD</h1>
      {stepper_labelled(1)}
    </div>

    <div class="mt-10 grid grid-cols-[1fr_440px] gap-8">
      <div class="flex flex-col gap-8">
        <section class="flex items-center gap-4 rounded-xl bg-surface-container p-5">
          <img src="{THUMB}" alt="" class="h-20 w-20 rounded-lg object-cover">
          <div class="min-w-0 flex-1"><p class="truncate text-title-m">{escape(TITLE)}</p>
            <p class="mt-1 flex items-center gap-2 text-body-m text-on-surface-variant">{avatar(SELLER["name"], SELLER["photo"], 24)}{SELLER["name"]}</p></div>
          <div class="text-right"><p class="text-on-surface"><span class="text-headline-s">5.100.000</span><span class="text-body-l text-on-surface-variant"> ₫</span></p>
            <p class="mt-0.5 flex items-center justify-end gap-1 text-label-l text-tertiary">{icon("handshake-outline-rounded", 16)}Đã chốt</p></div>
        </section>

        <section>
          <h2 class="px-5 text-title-s text-primary">Giao đến</h2>
          {a("address", "state mt-2 flex min-h-[72px] items-center gap-4 rounded-xl bg-surface-container py-3 pl-5 pr-3", f'''
            {icon("location-on-outline-rounded", 24, "text-on-surface-variant")}
            <span class="min-w-0 flex-1"><span class="line-clamp-2 block text-body-l">{address}</span>
              <span class="mt-0.5 block text-body-s text-on-surface-variant">Khánh Linh · 09•• ••• 812</span></span>
            {icon("chevron-right-rounded", 24, "text-on-surface-variant")}''', "account.html#addresses")}
        </section>
      </div>

      <aside class="ticket self-start">
        <div>
          <h2 class="text-title-s text-primary">Tiền</h2>
          <div class="group mt-3 flex flex-col gap-0.5">
            {money_row("handshake-outline-rounded", "Tiền hàng", "5.100.000 ₫")}
            {money_row("local-shipping-outline-rounded", "Phí ship", "Chưa có", "text-body-l text-on-surface-variant")}
          </div>
          <p class="mt-2 px-5 text-body-s text-on-surface-variant">Có phí ship khi người bán tạo đơn.</p>
        </div>
        <div>
          {a("cod-right", "state flex items-center gap-4 rounded-lg bg-surface-container-low px-4 py-3", f'''
            {icon("verified-outline-rounded", 22, "text-on-surface-variant")}
            <span class="min-w-0 flex-1"><span class="block text-body-m">Đơn COD đang mở: {open_cod}/{cap}</span>
              <span class="mt-1.5 block h-1 rounded-full bg-surface-container-highest"><span class="block h-full rounded-full bg-primary" style="width:{open_cod / cap * 100:.0f}%"></span></span></span>
            {icon("chevron-right-rounded", 22, "text-on-surface-variant")}''', "account.html#rep")}
          <button type="button" class="state mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-label-l text-on-primary">{icon("send-rounded", 20)}Gửi yêu cầu COD</button>
        </div>
      </aside>
    </div>
  </main>
  {footer()}
</div>
</body>
</html>"""
    return head("Giao COD · ShopNexus", COD_CSS) + body


if __name__ == "__main__":
    for name, fn in [("messages", messages), ("cod", cod)]:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(fn())
        print("wrote", name)
