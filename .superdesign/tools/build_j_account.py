"""Đăng nhập, Tôi, Thông báo and Tin nhắn in J ("Kính mờ").

    python3 tools/build_j_account.py        (run from .superdesign/)

Supersedes build_account.py and the messages page of build_chat_cod.py for
login.html, account.html, notifications.html and messages.html. Messages
reuses the chat's panes, dialog and script from build_chat_cod.py and only
restyles them, so the conversation logic stays in one place.

The side nav, panels, buttons and switches come from j_kit.
"""
import os
from html import escape

import build_c
import build_chat_cod as chat
from build import OUT, a
from build_account import ADDRESSES, GOOGLE_G, ME, MY_LISTINGS, NOTES
from common import LISTINGS, MONEY, icon, img, split_price, where
from j_kit import AVATAR, PANEL, account_nav, btn_cls, footer, header, page, panel, price, seg, switch

CHEV = icon("chevron-right-rounded", 20, "text-on-surface-variant")


def with_dot(html):
    """Header avatar with a dot: ShopNexus has an unread reply for you."""
    tag = f'<img src="{img(AVATAR, 80, 80)}" alt="Tài khoản" class="ml-2 h-9 w-9 rounded-full object-cover ring-2 ring-white">'
    dot = '<span class="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-error ring-2 ring-white" aria-label="Có trả lời mới"></span>'
    return html.replace(tag, f'<span class="relative ml-2 shrink-0">{tag.replace("ml-2 ", "")}{dot}</span>', 1)


def row(ic, title, sub=None, trail=CHEV, tone="bg-surface-container-low text-on-surface-variant", cls=""):
    s = f'<span class="block truncate text-body-s text-on-surface-variant">{sub}</span>' if sub else ""
    return (f'<div class="state flex items-center gap-3 rounded-[14px] px-2 py-2 {cls}">'
            f'<span class="grid h-9 w-9 shrink-0 place-items-center rounded-full {tone}">{icon(ic, 20)}</span>'
            f'<span class="min-w-0 flex-1"><span class="block truncate text-body-l ink">{title}</span>{s}</span>{trail}</div>')


def ring(done, total, size=52, stroke=5):
    r = (size - stroke) / 2
    c = 2 * 3.14159 * r
    return f"""<span class="relative grid shrink-0 place-items-center" style="width:{size}px;height:{size}px">
  <svg viewBox="0 0 {size} {size}" class="absolute inset-0 -rotate-90" aria-hidden="true">
    <circle cx="{size / 2}" cy="{size / 2}" r="{r}" fill="none" stroke="var(--md-surface-container-high)" stroke-width="{stroke}"/>
    <circle cx="{size / 2}" cy="{size / 2}" r="{r}" fill="none" stroke="url(#ringgrad)" stroke-width="{stroke}" stroke-linecap="round" stroke-dasharray="{c * done / total:.1f} {c:.1f}"/>
    <defs><linearGradient id="ringgrad" x1="0" x2="1"><stop offset="0" stop-color="#066A61"/><stop offset="1" stop-color="#5CC2B4"/></linearGradient></defs>
  </svg>
  <span class="num relative text-title-m font-semibold ink">{done}<span class="text-body-s text-on-surface-variant">/{total}</span></span>
</span>"""


# -------------------------------------------------------------------- login --
NEARBY = [LISTINGS[i] for i in (2, 3, 11, 6, 0, 10)]


def mini(item):
    photo, p, title, _cond, km, area = item[:6]
    num, unit = split_price(p)
    return f"""<div class="card rounded-[20px] border line bg-white p-1.5">
  <div class="relative overflow-hidden rounded-[15px]" style="aspect-ratio: 4 / 3">
    <img src="{img(photo, 360, 270)}" alt="{escape(title)}" class="h-full w-full object-cover">
    <span class="absolute left-1.5 top-1.5 flex items-center gap-0.5 rounded-full bg-white/85 px-2 py-0.5 text-label-s ink backdrop-blur">{icon("near-me-outline-rounded", 12)}{where(km, area)}</span>
  </div>
  <p class="num px-1.5 pt-2 text-title-m font-semibold tight ink">{num}<span class="text-body-s font-medium text-on-surface-variant">{unit}</span></p>
  <p class="truncate px-1.5 pb-1 text-body-s text-on-surface-variant">{escape(title)}</p>
</div>"""


def login():
    promises = "".join(f'<span class="glass glass-edge flex h-10 items-center gap-2 rounded-full pl-3 pr-4 text-label-l ink">{icon(ic, 18, "text-primary")}{t}</span>' for ic, t in [
        ("local-shipping-outline-rounded", "Giao tận nơi, xem hàng rồi mới trả"),
        ("photo-camera-outline-rounded", "Ảnh chụp trong app"),
        ("shield-outline-rounded", "Không cọc trước")])
    stats = "".join(f'<div><p class="num text-[28px] font-semibold leading-8 tighter {"grad-num" if i == 0 else "ink"}">{v}</p><p class="text-body-s text-on-surface-variant">{l}</p></div>'
                    for i, (v, l) in enumerate([("48.210", "món đang bán"), ("1.904", "tin mới hôm nay"), ("4,8★", "điểm người bán trung bình")]))
    otp = "".join(f'<span class="num grid h-14 w-12 place-items-center rounded-[14px] border {"border-primary ring-4 ring-primary/10" if i == 4 else "line"} bg-white text-headline-s font-semibold ink">{d}</span>'
                  for i, d in enumerate(["2", "8", "4", "9", '<span class="h-6 w-0.5 bg-primary"></span>', ""]))
    body = f"""{header(active=None, signed_in=False)}
<main class="mx-auto max-w-[1360px] px-8">
  <div class="mt-8 grid grid-cols-[1fr_480px] gap-10">
    <section class="min-w-0 pt-4">
      <h1 class="max-w-[640px] text-[56px] font-semibold leading-[60px] tighter ink">Đồ cũ giá tốt,<br><span class="grad-text">xem hàng</span> rồi mới trả.</h1>
      <div class="mt-6 flex flex-wrap gap-2">{promises}</div>
      <div class="mt-7 flex gap-10">{stats}</div>
      <div class="mt-8 flex items-baseline justify-between"><h2 class="text-title-m font-semibold ink">Đang bán quanh Bình Thạnh</h2><span class="text-body-s text-on-surface-variant">cập nhật 2 phút trước</span></div>
      <div class="mt-3 grid grid-cols-3 gap-3">{"".join(mini(x) for x in NEARBY)}</div>
    </section>

    <section class="glass glass-edge soft self-start rounded-[28px] p-7">
      <div role="alert" class="flex items-start gap-3 rounded-[18px] bg-white/70 p-3.5">
        <span class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-surface-container-low text-on-surface-variant">{icon("devices-off-outline-rounded", 18)}</span>
        <div class="min-w-0 flex-1"><p class="text-title-s ink">Bạn đã được đăng xuất</p><p class="text-body-s text-on-surface-variant">Phiên này đã kết thúc từ một thiết bị khác. Đăng nhập lại để tiếp tục.</p></div>
        <button type="button" class="state h-8 shrink-0 rounded-full px-2.5 text-label-l text-primary">Đã hiểu</button>
      </div>
      <h2 class="mt-6 text-[28px] font-semibold leading-8 tighter ink">Đăng nhập</h2>
      <button id="google" type="button" class="{btn_cls("line", "lg")} mt-5 h-12 w-full gap-3">{GOOGLE_G}Tiếp tục với Google</button>
      <div class="my-5 flex items-center gap-3 text-body-s text-on-surface-variant"><span class="h-px flex-1 bg-[var(--line)]"></span>hoặc<span class="h-px flex-1 bg-[var(--line)]"></span></div>
      <label class="block text-label-m text-on-surface-variant">Số điện thoại</label>
      <div class="mt-1.5 flex h-12 items-center gap-2 rounded-full border border-primary bg-white pl-1.5 pr-1.5 ring-4 ring-primary/10">
        <span class="flex h-9 items-center rounded-full bg-surface-container-low px-3 text-label-l ink">+84</span>
        <span class="num flex-1 text-body-l ink">903 452 128</span>
        <button type="button" class="state h-9 rounded-full bg-[var(--ink)] px-4 text-label-l text-white">Gửi mã</button>
      </div>
      <div class="mt-2 flex items-center justify-between">
        <p class="flex items-center gap-1.5 text-body-s text-on-surface-variant">{icon("visibility-off-outline-rounded", 16)}Người khác không thấy số của bạn.</p>
        <button type="button" class="state flex h-8 items-center gap-1 rounded-full px-2 text-label-l text-primary">{icon("mail-outline-rounded", 16)}Dùng email</button>
      </div>
      <div class="mt-5 border-t line pt-5">
        <div class="flex items-baseline justify-between"><h3 class="text-title-m font-semibold ink">Nhập mã 6 số</h3><span class="num text-body-s text-on-surface-variant">Gửi lại sau 0:45</span></div>
        <p class="mt-0.5 text-body-s text-on-surface-variant">Gửi tới 0903 452 128 · {a("change-number", "text-label-m text-primary hover:underline", "Đổi số")}</p>
        <div class="mt-3 flex justify-between">{otp}</div>
      </div>
      <p class="mt-5 text-center text-body-s text-on-surface-variant">Tiếp tục là bạn đồng ý với {a("terms", "text-primary hover:underline", "Điều khoản sử dụng")} và {a("privacy", "text-primary hover:underline", "Chính sách quyền riêng tư")} của ShopNexus.</p>
      {a("preview", "state mx-auto mt-2 flex h-10 w-fit items-center gap-1.5 rounded-full px-4 text-label-l text-primary", "Xem trước, đăng nhập sau" + icon("arrow-forward-rounded", 18))}
    </section>
  </div>
</main>
{footer()}"""
    return page("Đăng nhập · ShopNexus", body)


# ------------------------------------------------------------------ account --
def my_row(kind, photo, title, p, stats):
    if kind == "draft":
        meta = '<span class="rounded-full bg-surface-container-low px-2 py-0.5 text-label-s text-on-surface-variant">Bản nháp</span>'
        right = f'<button type="button" class="state h-9 rounded-full bg-secondary-container px-4 text-label-l text-on-secondary-container">Tiếp tục</button>'
    elif kind == "sold":
        meta = f'<span class="num text-body-s text-on-surface-variant">{p} · bán tuần trước</span>'
        right = '<span class="rounded-full bg-surface-container-low px-2.5 py-1 text-label-m text-on-surface-variant">Đã bán</span>'
    else:
        chats, views, judge = stats
        j = f'<span class="flex items-center gap-1 text-label-m text-tertiary">{icon("auto-awesome-rounded", 13)}{judge}</span>' if judge else ""
        meta = (f'{price(p, "text-title-s")}<span class="flex items-center gap-1 text-body-s text-on-surface-variant">{icon("chat-outline-rounded", 14)}{chats}</span>'
                f'<span class="flex items-center gap-1 text-body-s text-on-surface-variant">{icon("visibility-outline-rounded", 14)}{views}</span>{j}')
        right = CHEV
    return f"""<li class="state flex items-center gap-3 rounded-[16px] p-2">
  <img src="{img(photo, 112, 112)}" alt="" class="h-14 w-14 shrink-0 rounded-[14px] object-cover {"opacity-60" if kind == "sold" else ""}">
  <div class="min-w-0 flex-1"><p class="truncate text-body-l ink">{escape(title)}</p><p class="mt-0.5 flex flex-wrap items-center gap-3">{meta}</p></div>
  {right}
</li>"""


def account():
    stats = "".join(f'<div class="flex-1 px-5 first:pl-0"><p class="num text-[26px] font-semibold leading-8 tighter {"grad-num" if i == 0 else "ink"}">{v}</p><p class="text-body-s text-on-surface-variant">{l}</p></div>'
                    for i, (v, l) in enumerate([("14", "đã bán"), ("8 phút", "thường trả lời"), ("0", "ghi nhận bị từ chối · 90 ngày"), ("0/11", "COD bị từ chối nhận")]))
    todo = "".join(row(ic, t, trail=CHEV, cls="-mx-2", tone="bg-primary/10 text-primary" if i == 0 else "bg-surface-container-low text-on-surface-variant")
                   for i, (ic, t) in enumerate([("local-shipping-outline-rounded", "Thiết lập giao COD"), ("home-outline-rounded", "Địa chỉ nhận hàng"),
                                                ("edit-note-rounded", "Giới thiệu bản thân"), ("location-on-outline-rounded", "Khu vực bán")]))
    addresses = "".join(row(ic, f'{kind}{" " + tag.replace("rounded-sm", "rounded-full").replace("px-1.5", "ml-1 px-2") if tag else ""}', f"{street} · {commune}", cls="-mx-2")
                        for ic, kind, street, commune, tag in ADDRESSES) \
        + row("add-rounded", "Thêm địa chỉ", trail="", tone="bg-primary/10 text-primary", cls="-mx-2")
    settings = "".join(row(ic, t, s, cls="-mx-2") for ic, t, s in [
        ("notifications-outline-rounded", "Thông báo", None), ("storefront-outline-rounded", "Gói người bán", "Cơ bản · miễn phí"),
        ("shield-outline-rounded", "Bảo mật và xác minh", None), ("help-outline-rounded", "Trợ giúp và an toàn", "2 yêu cầu đang xử lý")])
    rows = "".join(my_row(*l) for l in MY_LISTINGS)
    body = f"""{with_dot(header(active=None))}
<main class="mx-auto max-w-[1360px] px-8">
  <div class="mt-6 grid grid-cols-[232px_1fr_340px] gap-5">
    {account_nav("me")}

    <div class="flex min-w-0 flex-col gap-4">
      {panel(f'''<div class="flex items-center gap-5">
        <div class="relative shrink-0"><img src="{img(ME["photo"], 176, 176)}" alt="" class="h-[88px] w-[88px] rounded-full object-cover ring-4 ring-white"><img src="{build_c.ART["tier_trusted"]}" alt="" class="absolute -bottom-1 -right-2 h-9 w-9"></div>
        <div class="min-w-0 flex-1">
          <h1 class="text-[32px] font-semibold leading-9 tighter ink">{ME["name"]}</h1>
          <p class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-m text-on-surface-variant">
            <span class="flex items-center gap-1">{icon("star-rounded", 15, "text-[#E0A23B]")}4,8 · 27 đánh giá</span>
            <span class="flex items-center gap-1">{icon("location-on-outline-rounded", 15)}{ME["area"]}</span>
            <span class="flex items-center gap-1">{icon("verified-rounded", 15, "text-primary")}Đã xác minh số điện thoại</span></p>
          <span class="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-label-l text-primary">{icon("military-tech-outline-rounded", 16)}Người bán tin cậy</span>
        </div>
        <div class="flex items-center gap-2 self-start">{a("my-page", btn_cls("line", "lg"), "Trang của bạn")}<button type="button" class="state grid h-11 w-11 place-items-center rounded-full border line bg-white ink" aria-label="Chia sẻ">{icon("share-outline-rounded", 20)}</button></div>
      </div>
      <div class="mt-5 flex divide-x divide-[var(--line)] border-t line pt-4">{stats}</div>''', "p-6")}

      <div class="flex flex-col gap-2">
        <a id="support-reply" href="support.html" class="card flex items-center gap-3 {PANEL} p-4">
          <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-primary text-on-primary">{icon("support-agent-rounded", 22)}</span>
          <span class="min-w-0 flex-1"><span class="flex items-center gap-2 text-title-s ink">ShopNexus đã trả lời<span class="grid h-5 min-w-5 place-items-center rounded-full bg-error px-1.5 text-label-s text-on-error">1</span></span>
            <span class="block truncate text-body-s text-on-surface-variant">Báo chưa nhận hàng · Bạn chưa trả tiền nên không mất gì…</span></span>{CHEV}
        </a>
        <a id="waiting" href="#waiting" class="card flex items-center gap-3 {PANEL} p-4">
          <img src="{img("1580480055273-228ff5388ef8", 96, 96)}" alt="" class="h-11 w-11 shrink-0 rounded-[12px] object-cover">
          <span class="min-w-0 flex-1"><span class="block text-title-s text-primary">Đang chờ bạn: tạo đơn cho Đức Huy</span>
            <span class="block truncate text-body-s text-on-surface-variant">Ghế xoay vải be chân gỗ · đã gửi yêu cầu COD</span></span>
          <span class="flex h-9 shrink-0 items-center gap-1 rounded-full bg-[var(--ink)] px-3.5 text-label-l text-white">Mở Đơn bán{icon("arrow-forward-rounded", 16)}</span>
        </a>
      </div>

      {panel(f'''<div class="flex items-center justify-between px-2 pb-1"><h2 class="text-title-l font-semibold tight ink">Tin của bạn</h2>
        <div class="flex items-center gap-3">{seg(["Đang bán 5", "Nháp 2", "Đã bán 14"], 0, "bg-surface-container-low", "text-label-m")}{a("all-listings", "text-label-l text-primary hover:underline", "Xem cả 7 tin")}</div></div>
        <ul class="mt-2 flex flex-col">{rows}</ul>''', "p-3")}
      <div class="grid grid-cols-2 gap-4">
        {panel(f'<p class="px-1 text-label-m uppercase tracking-[0.1em] text-on-surface-variant">Địa chỉ của tôi</p><div class="mt-1 flex flex-col">{addresses}</div>', "p-4")}
        {panel(f'''<p class="px-1 text-label-m uppercase tracking-[0.1em] text-on-surface-variant">Giao diện</p>
          <p class="mt-3 px-1 text-body-l ink">Giao diện tối</p>
          <div class="mt-2">{seg(["Theo hệ thống", "Sáng", "Tối"], 0, "bg-surface-container-low", "text-label-m")}</div>
          <p class="mt-3 px-1 text-body-s text-on-surface-variant">Theo hệ thống thì trang đổi sáng tối cùng máy của bạn.</p>''', "p-4")}
      </div>
    </div>

    <aside class="flex flex-col gap-4 self-start">
      {panel(f'''<div class="flex items-center gap-3">{ring(2, 6)}<span class="flex-1"><span class="block text-title-m font-semibold ink">Hoàn thiện hồ sơ</span><span class="block text-body-s text-on-surface-variant">Còn 4 bước</span></span></div>
        <div class="mt-3 flex flex-col">{todo}</div>
        <p class="mt-2 flex items-center gap-1.5 text-body-s text-on-surface-variant">{icon("check-circle-rounded", 15, "text-primary")}Đã xong: số điện thoại, ảnh đại diện</p>''', "p-4")}

      <section class="relative overflow-hidden rounded-[24px] p-5 text-white" style="background: radial-gradient(120% 120% at 100% 0%, #5CC2B4 0%, #0E8A7D 35%, #005049 80%)">
        <img src="{build_c.ART["art_cod_ready"]}" alt="" class="absolute -right-2 -top-2 h-24 w-24">
        <p class="text-label-m uppercase tracking-[0.12em] text-white/75">Giao COD</p>
        <p class="mt-1 max-w-[200px] text-title-l font-semibold tight">Chưa liên kết bên vận chuyển</p>
        <p class="mt-2 text-body-s text-white/85">Liên kết tài khoản GHTK hoặc GHN của bạn để nhận đơn COD.</p>
        <p class="mt-2 flex gap-1.5 text-body-s text-white/85">{icon("payments-outline-rounded", 16, "mt-0.5")}<span>{MONEY["cod_seller"]}</span></p>
        <button type="button" class="state mt-4 h-10 w-full rounded-full bg-white text-label-l text-primary">Thiết lập giao COD</button>
      </section>

      {panel(f'''<p class="px-1 text-label-m uppercase tracking-[0.1em] text-on-surface-variant">Tài khoản</p><div class="mt-1 flex flex-col">{settings}</div>
        <button type="button" class="state -mx-2 mt-1 flex w-[calc(100%+16px)] items-center gap-3 rounded-[14px] px-2 py-2 text-body-l text-error"><span class="grid h-9 w-9 place-items-center rounded-full bg-error/10">{icon("logout-rounded", 20)}</span>Đăng xuất</button>''', "p-4")}
    </aside>
  </div>
</main>
{footer()}"""
    return page("Tôi · ShopNexus", body)


# ------------------------------------------------------------ notifications --
TONES = {"offer": "bg-tertiary-fixed text-on-tertiary-fixed-variant", "deal": "bg-primary/10 text-primary",
         "neutral": "bg-surface-container-low text-on-surface-variant"}


def note_row(tone, ic, text, when, unread, photo, action):
    thumb = f'<img src="{img(photo, 96, 96)}" alt="" class="h-12 w-12 shrink-0 rounded-[12px] object-cover">' if photo else ""
    act = f'<span class="mt-1.5 inline-flex h-7 items-center rounded-full border line bg-white px-3 text-label-m text-primary">{action}</span>' if action else ""
    dot = '<span class="block h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Chưa đọc"></span>' if unread else '<span class="block w-2 shrink-0"></span>'
    return f"""<li class="state flex items-start gap-3 rounded-[16px] px-3 py-2.5 {"bg-primary/[.05]" if unread else ""}">
  <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full {TONES[tone]}">{icon(ic, 18)}</span>
  <div class="min-w-0 flex-1"><p class="text-body-m ink">{text}</p><p class="text-body-s text-on-surface-variant">{when}</p>{act}</div>
  {thumb}<span class="self-center">{dot}</span>
</li>"""


def notifications():
    groups = "".join(f'<section class="{"mt-3 border-t line pt-3" if i else ""}"><h2 class="px-3 pb-1 text-label-m uppercase tracking-[0.1em] text-on-surface-variant">{day}</h2>'
                     f'<ul class="flex flex-col gap-0.5">{"".join(note_row(*n) for n in items)}</ul></section>' for i, (day, items) in enumerate(NOTES))
    t = lambda v: f'<span class="num text-body-m text-on-surface-variant">{v}</span>'
    prefs = [("Giao dịch", [("chat-outline-rounded", "Tin nhắn", None, switch()), ("sell-outline-rounded", "Trả giá và chốt giá", None, switch()),
                            ("local-shipping-outline-rounded", "Đơn hàng và giao hàng", None, switch())]),
             ("Giá và tin mới", [("trending-down-rounded", "Giảm giá ở tin đã lưu", None, switch()), ("storefront-outline-rounded", "Người bán bạn theo dõi", None, switch()),
                                 ("search-rounded", "Tìm kiếm đang theo dõi", "Bật chuông ở từng tìm kiếm trong Đã lưu", CHEV)]),
             ("Tài khoản", [("star-outline-rounded", "Đánh giá mới", None, switch())]),
             ("Giờ yên lặng", [("bedtime-outline-rounded", "Tắt tiếng ban đêm", "Từ 22:00 đến 07:00", switch()),
                               ("schedule-outline-rounded", "Bắt đầu", None, t("22:00")), ("schedule-outline-rounded", "Kết thúc", None, t("07:00"))])]
    prefs_html = "".join(f'<p class="px-1 {"mt-3 " if i else ""}text-label-m uppercase tracking-[0.1em] text-on-surface-variant">{g}</p>'
                         + "".join(row(ic, ti, s, tr, cls="-mx-2") for ic, ti, s, tr in rs) for i, (g, rs) in enumerate(prefs))
    counts = [("Hôm nay", "4"), ("Trả giá", "2"), ("Đơn COD", "2")]
    body = f"""{header(active=None)}
<main class="mx-auto max-w-[1360px] px-8">
  <div class="mt-6 grid grid-cols-[232px_1fr_340px] gap-5">
    {account_nav("notifications")}

    <section class="min-w-0">
      <div class="flex items-end justify-between">
        <div><h1 class="text-[40px] font-semibold leading-[44px] tighter ink">Thông báo</h1>
          <p class="mt-1 flex items-center gap-3 text-body-m text-on-surface-variant"><span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-primary"></span>3 chưa đọc</span>
            {"".join(f'<span><b class="num font-semibold ink">{n}</b> {l[0].lower() + l[1:] if l != 'Đơn COD' else 'đơn COD'}</span>' for l, n in counts)}</p></div>
        <button type="button" class="{btn_cls("line", "lg")} h-10">{icon("done-all-rounded", 18)}Đánh dấu đã đọc</button>
      </div>
      <div class="glass glass-edge mt-4 inline-flex rounded-full">{seg(["Tất cả", "Giao dịch", "Giá và tin mới", "Tài khoản"], 0)}</div>
      {panel(groups, "mt-4 p-3")}
    </section>

    <aside class="flex flex-col gap-4 self-start">
      <section class="relative overflow-hidden rounded-[24px] p-5 text-white" style="background: radial-gradient(120% 120% at 100% 0%, #FFB59C 0%, #C0623E 30%, #773115 85%)">
        <span class="grid h-10 w-10 place-items-center rounded-full bg-white/20">{icon("notifications-active-outline-rounded", 22)}</span>
        <p class="mt-3 text-title-l font-semibold tight">Không bỏ lỡ lời trả giá</p>
        <p class="mt-1 text-body-s text-white/85">Bật thông báo trên trình duyệt hoặc tải app để nhận ngay khi có người trả giá.</p>
        <button type="button" class="state mt-4 h-10 w-full rounded-full bg-white text-label-l text-tertiary">Bật thông báo trình duyệt</button>
      </section>
      {panel(f'<h2 class="px-1 pb-2 text-title-m font-semibold ink">Cài đặt thông báo</h2>{prefs_html}', "p-4")}
    </aside>
  </div>
</main>
{footer()}"""
    return page("Thông báo · ShopNexus", body)


# ----------------------------------------------------------------- messages --
# The chat's own rules (bubbles, quote, dialog, radios) without C's page CSS,
# then J's dress on top: glass panes, ink bubbles for mine, pills everywhere.
CHAT_CSS = chat.PAGE_CSS[len(build_c.CSS):] + """
  .mine .bubble { background: #066A61; color: #fff !important; }
  .mine .bubble .quote { background: rgb(255 255 255 / .14); }
  .mine .bubble .quote .bar { background: #85D5C9; }
  .mine .bubble .quote .text-primary { color: #C7E6E0; }
  .mine .bubble .quote .text-on-surface-variant { color: rgb(255 255 255 / .75); }
  .theirs .bubble { background: #fff; box-shadow: inset 0 0 0 1px var(--line); }
  .row-hover:hover { background: rgb(255 255 255 / .7); }
  .deal-chip { background: #fff; }
  .deal-chip[aria-selected="true"] { background: var(--ink); color: #fff; }
  dialog.report { background: rgb(255 255 255 / .92); -webkit-backdrop-filter: blur(20px); backdrop-filter: blur(20px); }
  dialog.report::backdrop { background: rgb(18 24 23 / .28); -webkit-backdrop-filter: blur(2px); backdrop-filter: blur(2px); }
"""


def j_chat(html):
    """Swap the chat's tonal M3 surfaces for J's glass and white panes."""
    for old, new in [
        ("flex min-h-0 flex-col overflow-hidden rounded-xl bg-surface-container-lowest", "flex min-h-0 flex-col overflow-hidden rounded-[24px] glass glass-edge soft"),
        ('<div class="rounded-xl bg-surface-container-lowest p-4"', f'<div class="{PANEL} p-3"'),
        ('class="aspect-[4/3] w-full rounded-lg object-cover"', 'class="aspect-[4/3] w-full rounded-[16px] object-cover"'),
        ("mx-3 mt-2 rounded-xl bg-surface-container px-4 pb-3 pt-3", "mx-3 mt-2 rounded-[20px] border line bg-white px-4 pb-3 pt-3"),
        ("rounded-full bg-surface-container-high px-5 text-body-l text-on-surface-variant", "rounded-full border line bg-white px-5 text-body-l text-on-surface-variant"),
        ("reply-strip mb-2 flex items-center gap-3 rounded-lg bg-surface-container", "reply-strip mb-2 flex items-center gap-3 rounded-[16px] bg-white/80"),
        ("state flex w-full items-center gap-3 rounded-lg bg-surface-container-high py-3", "state flex w-full items-center gap-3 rounded-[18px] border border-error/20 bg-error-container/60 py-3"),
        ("bg-secondary-container\" data-open", "bg-white soft\" data-open"),
        ("border-b border-outline-variant", "border-b line"),
        ("rounded-full bg-primary px-6 text-label-l text-on-primary", "rounded-full bg-[var(--ink)] px-6 text-label-l text-white"),
        ("rounded-lg p-3 bg-secondary-container", "rounded-[18px] p-3 bg-white soft"),
        ("rounded-lg p-3 row-hover", "rounded-[18px] p-3 row-hover"),
        ("rounded-sm bg-surface-container-high px-2 text-label-m", "rounded-full bg-white/80 px-2 text-label-m"),
        ("m-3 flex items-center gap-3 rounded-lg bg-surface-container", "m-3 flex items-center gap-3 rounded-[18px] bg-white"),
    ]:
        html = html.replace(old, new)
    # the open conversation's row is white (the script toggles this class)
    return html


SCRIPT = chat.SCRIPT.replace("r.classList.toggle('bg-secondary-container', on)", "r.classList.toggle('bg-white', on); r.classList.toggle('soft', on)")


def messages():
    filters = seg(["Tất cả", "Mua", "Bán", "Chưa đọc 2"], 0, "bg-white/60", "text-label-m")
    rows = "".join(chat.inbox_row(c) for c in chat.INBOX)
    # The selected row was drawn with bg-secondary-container; mark it the J way.
    rows = rows.replace("flex gap-3 rounded-lg p-3 bg-secondary-container", "flex gap-3 rounded-[18px] p-3 bg-white soft") \
               .replace("flex gap-3 rounded-lg p-3 row-hover", "flex gap-3 rounded-[18px] p-3 row-hover") \
               .replace("ring-2 ring-secondary-container", "ring-2 ring-white").replace("ring-2 ring-surface-container-low", "ring-2 ring-white") \
               .replace("rounded-lg object-cover", "rounded-[12px] object-cover")
    panes = j_chat(chat.kiet_pane() + chat.scam_pane() + chat.side_panels())
    body = f"""{header(active=None)}
<main class="mx-auto max-w-[1360px] px-8">
  <div class="mt-4 grid grid-cols-[340px_1fr_312px] gap-4" style="height: calc(100vh - 64px - 32px); min-height: 760px">
    <section class="glass glass-edge soft flex min-h-0 flex-col rounded-[24px] p-2">
      <div class="flex items-center justify-between px-2 pt-2"><h1 class="text-[26px] font-semibold leading-8 tighter ink">Tin nhắn</h1>
        <button type="button" class="{chat.ICON_BTN}" aria-label="Tìm trong tin nhắn">{icon("search-rounded", 22)}</button></div>
      <div class="mt-2 px-1">{filters}</div>
      <div class="thread-scroll mt-2 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">{rows}</div>
    </section>
    {panes}
  </div>
</main>
{j_chat(chat.report_dialog())}
{SCRIPT}"""
    return page("Tin nhắn · ShopNexus", body).replace("</style>", CHAT_CSS + "</style>", 1)


if __name__ == "__main__":
    for name, fn in [("login", login), ("account", account), ("notifications", notifications), ("messages", messages)]:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(fn())
        print("wrote", name)
