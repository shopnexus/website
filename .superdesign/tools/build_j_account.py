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
from build_account import GOOGLE_G, ME, MY_LISTINGS, NOTES
from common import LISTINGS, MONEY, icon, img, split_price, where
from j_kit import ADDRESS_BOOK, AVATAR, HREF, LABEL, PROFILE_TASKS, TASKS_DONE, PANEL, account_nav, field, btn, btn_cls, crumbs, footer, header, money_line, page, page_title, panel, price, seg, switch

CHEV = icon("chevron-right-rounded", 20, "text-on-surface-variant")


def with_dot(html):
    """Header avatar with a dot: ShopNexus has an unread reply for you."""
    tag = f'<img src="{img(AVATAR, 80, 80)}" alt="Tài khoản" class="ml-2 h-9 w-9 rounded-full object-cover ring-2 ring-white">'
    dot = '<span class="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-error ring-2 ring-white" aria-label="Có trả lời mới"></span>'
    return html.replace(tag, f'<span class="relative ml-2 shrink-0">{tag.replace("ml-2 ", "")}{dot}</span>', 1)


def row(ic, title, sub=None, trail=CHEV, tone="bg-surface-container-low text-on-surface-variant", cls="", href=None):
    """An icon, a title and a line; a link when href is given."""
    s = f'<span class="block truncate text-body-s text-on-surface-variant">{sub}</span>' if sub else ""
    inner = (f'<span class="grid h-9 w-9 shrink-0 place-items-center rounded-full {tone}">{icon(ic, 20)}</span>'
             f'<span class="min-w-0 flex-1"><span class="block truncate text-body-l ink">{title}</span>{s}</span>{trail}')
    look = f"state flex items-center gap-3 rounded-[14px] px-2 py-2 {cls}"
    return a("row", look, inner, href) if href else f'<div class="{look}">{inner}</div>'


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
    stats = "".join(f'<div><p class="num text-[28px] font-semibold leading-8 tighter {"ink" if i == 0 else "ink"}">{v}</p><p class="text-body-s text-on-surface-variant">{l}</p></div>'
                    for i, (v, l) in enumerate([("48.210", "món đang bán"), ("1.904", "tin mới hôm nay"), ("4,8★", "điểm người bán trung bình")]))
    otp = "".join(f'<span class="num grid h-14 w-12 place-items-center rounded-[14px] border {"border-primary ring-4 ring-primary/10" if i == 4 else "line"} bg-white text-headline-s font-semibold ink">{d}</span>'
                  for i, d in enumerate(["2", "8", "4", "9", '<span class="h-6 w-0.5 bg-primary"></span>', ""]))
    body = f"""{header(active=None, signed_in=False)}
<main class="mx-auto max-w-[1360px] px-8">
  <div class="mt-8 grid grid-cols-[1fr_480px] gap-10">
    <section class="min-w-0 pt-4">
      <h1 class="max-w-[640px] text-[56px] font-semibold leading-[60px] tighter ink">Đồ cũ giá tốt,<br>xem hàng rồi mới trả.</h1>
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
    stats = "".join(f'<div class="flex-1 px-5 first:pl-0"><p class="num text-[26px] font-semibold leading-8 tighter {"ink" if i == 0 else "ink"}">{v}</p><p class="text-body-s text-on-surface-variant">{l}</p></div>'
                    for i, (v, l) in enumerate([("14", "đã bán"), ("8 phút", "thường trả lời"), ("0", "ghi nhận bị từ chối · 90 ngày"), ("0/11", "COD bị từ chối nhận")]))
    todo = "".join(row(ic, t, trail=CHEV, cls="-mx-2", tone="bg-primary/10 text-primary" if i == 0 else "bg-surface-container-low text-on-surface-variant",
                       href=HREF["cod"] if k == "cod" else HREF["Hoàn thiện hồ sơ"])
                   for i, (k, ic, t, _done) in enumerate(t for t in PROFILE_TASKS if not t[3]))
    default_tag = '<span class="ml-1 rounded-full bg-secondary-container px-2 text-label-m text-on-secondary-container">Mặc định</span>'
    addresses = "".join(row(ic, f'{kind}{" " + default_tag if default else ""}', f"{street} · {ward.split(',')[0]}", cls="-mx-2", href=HREF["Địa chỉ"])
                        for ic, kind, street, ward, default, _used in ADDRESS_BOOK) \
        + row("add-rounded", "Thêm địa chỉ", trail="", tone="bg-primary/10 text-primary", cls="-mx-2")
    settings = "".join(row(ic, t, s, cls="-mx-2", href=HREF.get(t, HREF["notifications"])) for ic, t, s in [
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
        {panel(f'<p class="{LABEL}">Địa chỉ của tôi</p><div class="mt-1 flex flex-col">{addresses}</div>', "p-4")}
        {panel(f'''<p class="{LABEL}">Giao diện</p>
          <p class="mt-3 px-1 text-body-l ink">Giao diện tối</p>
          <div class="mt-2">{seg(["Theo hệ thống", "Sáng", "Tối"], 0, "bg-surface-container-low", "text-label-m")}</div>
          <p class="mt-3 px-1 text-body-s text-on-surface-variant">Theo hệ thống thì trang đổi sáng tối cùng máy của bạn.</p>''', "p-4")}
      </div>
    </div>

    <aside class="flex flex-col gap-4 self-start">
      {panel(f'''<div class="flex items-center gap-3">{ring(TASKS_DONE, len(PROFILE_TASKS))}<span class="flex-1"><span class="block text-title-m font-semibold ink">Hoàn thiện hồ sơ</span><span class="block text-body-s text-on-surface-variant">Còn {len(PROFILE_TASKS) - TASKS_DONE} bước</span></span></div>
        <div class="mt-3 flex flex-col">{todo}</div>
        <p class="mt-2 flex items-center gap-1.5 text-body-s text-on-surface-variant">{icon("check-circle-rounded", 15, "text-primary")}Đã xong: {", ".join(t[2].lower() for t in PROFILE_TASKS if t[3])}</p>''', "p-4")}

      <section class="relative overflow-hidden rounded-[24px] p-5 text-white" style="background: radial-gradient(120% 120% at 100% 0%, #5CC2B4 0%, #0E8A7D 35%, #005049 80%)">
        <img src="{build_c.ART["art_cod_ready"]}" alt="" class="absolute -right-2 -top-2 h-24 w-24">
        <p class="text-label-m uppercase tracking-[0.12em] text-white/75">Giao COD</p>
        <p class="mt-1 max-w-[200px] text-title-l font-semibold tight">Chưa liên kết bên vận chuyển</p>
        <p class="mt-2 text-body-s text-white/85">Liên kết tài khoản GHTK hoặc GHN của bạn để nhận đơn COD.</p>
        <p class="mt-2 flex gap-1.5 text-body-s text-white/85">{icon("payments-outline-rounded", 16, "mt-0.5")}<span>{MONEY["cod_seller"]}</span></p>
        <button type="button" class="state mt-4 h-10 w-full rounded-full bg-white text-label-l text-primary">Thiết lập giao COD</button>
      </section>

      {panel(f'''<p class="{LABEL}">Tài khoản</p><div class="mt-1 flex flex-col">{settings}</div>
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


# ------------------------------------------------------- account settings --
# Five pages reached from Tôi: Địa chỉ, Bảo mật, Quyền riêng tư, Hoàn thiện hồ
# sơ and Điểm uy tín. Copy comes from the app's settings, me and rep strings.
PHONE = "09•• ••• 812"


def settings_page(title, page_name, meta, main, side, end=""):
    """Tôi's frame: the account nav, a breadcrumb and title, the page, a side column."""
    body = f"""{header(active=None)}
<main class="mx-auto max-w-[1360px] px-8">
  <div class="mt-6 grid grid-cols-[232px_1fr_340px] gap-5">
    {account_nav("me")}
    <div class="flex min-w-0 flex-col gap-4">
      {crumbs("Tôi", page_name)}
      {page_title(title, meta, end)}
      {main}
    </div>
    <aside class="flex flex-col gap-4 self-start pt-[72px]">{side}</aside>
  </div>
</main>
{footer()}"""
    return page(f"{page_name} · ShopNexus", body)


def side_list(title, rows_html):
    return panel(f'<p class="{LABEL}">{title}</p><div class="mt-1 flex flex-col">{rows_html}</div>', "p-4")


# ---------------------------------------------------------------- Địa chỉ --
CARET = icon("keyboard-arrow-down-rounded", 20, "text-on-surface-variant")


def addresses():
    cards = []
    for ic, kind, street, ward, default, used in ADDRESS_BOOK:
        tag = '<span class="rounded-full bg-secondary-container px-2 py-0.5 text-label-m text-on-secondary-container">Mặc định</span>' if default else ""
        if default:
            acts = btn("Sửa", "edit-outline-rounded", "line") + '<span class="px-2 text-body-s text-on-surface-variant">Đang là địa chỉ mặc định</span>'
        else:
            acts = (btn("Sửa", "edit-outline-rounded", "line") + btn("Đặt làm mặc định", None, "ghost")
                    + f'<button type="button" class="state ml-auto grid h-10 w-10 place-items-center rounded-full text-error" aria-label="Xóa {kind}">{icon("delete-outline-rounded", 20)}</button>')
        cards.append(f"""<article class="{PANEL} p-4 {"" if default else "ring-2 ring-primary/40"}">
  <div class="flex items-start gap-3">
    <span class="grid h-11 w-11 shrink-0 place-items-center rounded-full {"bg-primary text-on-primary" if default else "bg-surface-container-low text-on-surface-variant"}">{icon(ic, 22)}</span>
    <div class="min-w-0 flex-1">
      <p class="flex items-center gap-2 text-title-m font-semibold ink">{kind}{tag}</p>
      <p class="mt-1 text-body-l ink">{street}</p>
      <p class="text-body-m text-on-surface-variant">{ward}</p>
      <p class="mt-1 text-body-s text-on-surface-variant">{ME["name"]} · {PHONE} · {used}</p>
    </div>
  </div>
  <div class="mt-3 flex items-center gap-2 border-t line pt-3">{acts}</div>
</article>""")
    kinds = "".join(f'<span class="flex h-9 items-center gap-1.5 rounded-full px-3.5 text-label-l {"bg-[var(--ink)] text-white" if k == "Công ty" else "border line bg-white ink"}">{icon(ic, 17)}{k}</span>'
                    for k, ic in [("Nhà", "home-outline-rounded"), ("Công ty", "work-outline-rounded"), ("Khác", "location-on-outline-rounded")])
    form = panel(f"""<div class="flex items-center justify-between"><h2 class="text-title-l font-semibold tight ink">Sửa địa chỉ Công ty</h2>
    <button type="button" class="state grid h-9 w-9 place-items-center rounded-full text-on-surface-variant" aria-label="Đóng">{icon("close-rounded", 20)}</button></div>
  <div class="mt-4 flex gap-2">{kinds}</div>
  <div class="mt-4 grid grid-cols-2 gap-3">
    {field("Người nhận", ME["name"])}
    {field("Số điện thoại", PHONE, trail='<span class="text-label-m text-primary">Đã xác minh</span>')}
    <div class="col-span-2">{field("Số nhà, đường", "Tầng 8, 2 Hải Triều", ring=True)}</div>
    {field("Phường, xã", "Phường Sài Gòn", trail=CARET)}
    {field("Tỉnh, thành phố", "TP.HCM", trail=CARET)}
  </div>
  <div class="mt-4 flex items-center justify-between rounded-[16px] bg-surface-container-low px-4 py-3"><span class="text-body-l ink">Đặt làm địa chỉ mặc định</span>{switch(False)}</div>
  <div class="mt-4 flex justify-end gap-2">{btn("Hủy", None, "line")}{btn("Lưu", None, "ink")}</div>""", "p-5")
    used = "".join(row("receipt-long-outline-rounded", t, s, trail=f'<span class="num text-body-s text-on-surface-variant">{w}</span>', cls="-mx-2") for t, s, w in [
        ("Tai nghe Sony WH-1000XM4", "Giao tới Nhà", "09/10"), ("Kệ gỗ nhỏ 3 tầng", "Giao tới Công ty", "02/10"), ("Máy xay sinh tố 2L", "Giao tới Nhà", "21/09")])
    main = f"""<div class="grid grid-cols-2 gap-4">{"".join(cards)}</div>
      {form}"""
    side = (panel(f"""<p class="flex gap-2 text-body-m ink">{icon("lock-outline-rounded", 18, "mt-0.5 shrink-0 text-primary")}<span>Chỉ shipper và người bán của đơn COD thấy địa chỉ. Tin gần bạn dùng vị trí của máy, không dùng địa chỉ.</span></p>""", "p-4")
            + side_list("Giao gần đây", used)
            + panel(f"""<p class="{LABEL}">Khi mua bằng COD</p>
  <p class="mt-2 px-1 text-body-m text-on-surface-variant">Chạm một địa chỉ để giao đơn này đến đó. Địa chỉ mặc định không đổi.</p>
  <div class="mt-3 px-1">{money_line("cod_buyer", "visibility-outline-rounded", small=True)}</div>""", "p-4"))
    return settings_page("Địa chỉ của tôi", "Địa chỉ", "2 địa chỉ · Nhà là mặc định", main, side, btn("Thêm địa chỉ", "add-rounded", "ink"))


# ---------------------------------------------------------------- Bảo mật --
def line_row(i, lead, title, sub, end=""):
    return f"""<div class="flex items-center gap-3 py-3 {"border-t line" if i else ""}">
  {lead}
  <div class="min-w-0 flex-1"><p class="flex items-center gap-2 text-body-l ink">{title}</p><p class="text-body-s text-on-surface-variant">{sub}</p></div>{end}
</div>"""


def bubble(ic, tone="bg-surface-container-low text-on-surface-variant"):
    return f'<span class="grid h-10 w-10 shrink-0 place-items-center rounded-full {tone}">{ic}</span>'


def security():
    sign_in = "".join(line_row(i, bubble(lead, tone), t, sub, end) for i, (lead, tone, t, sub, end) in enumerate([
        (icon("phone-android-outline-rounded", 20), "bg-primary/10 text-primary", "Số điện thoại", f"{PHONE} · đã xác minh · người khác không thấy số này", btn("Đổi số", None, "line")),
        (GOOGLE_G, "bg-surface-container-low", "Google", "k•••@gmail.com · đăng nhập một chạm", btn("Gỡ liên kết", None, "ghost")),
        (icon("mail-outline-rounded", 20), "bg-surface-container-low text-on-surface-variant", "Email", "Chưa thêm · đăng nhập khi không có điện thoại bên cạnh", btn("Thêm", "add-rounded", "ink"))]))
    here = '<span class="rounded-full bg-primary/10 px-2 py-0.5 text-label-m text-primary">Thiết bị này</span>'
    out = '<button type="button" class="state h-9 rounded-full px-3 text-label-l text-error">Đăng xuất</button>'
    devices = "".join(line_row(i, bubble(icon(ic, 20)), t + (here if me else ""), sub, "" if me else out) for i, (ic, t, sub, me) in enumerate([
        ("computer-outline-rounded", "Chrome trên Windows", "TP.HCM · đang dùng", True), ("phone-android-outline-rounded", "Pixel 9 · app ShopNexus", "TP.HCM · hôm nay 08:12", False),
        ("phone-android-outline-rounded", "Galaxy A55 · app ShopNexus", "TP.HCM · hôm nay 07:40", False), ("tablet-outline-rounded", "Galaxy Tab S9", "Đồng Nai · 3 ngày trước", False)]))
    login_panel = panel(f'<h2 class="text-title-l font-semibold tight ink">Đăng nhập</h2><div class="mt-1">{sign_in}</div>', "px-5 py-4")
    device_panel = panel(f"""<div class="flex items-center justify-between"><h2 class="text-title-l font-semibold tight ink">Thiết bị đang đăng nhập · 4</h2>{btn("Đăng xuất các thiết bị khác", "logout-rounded", "line")}</div>
  <div class="mt-1">{devices}</div>
  <p class="mt-1 flex gap-2 rounded-[14px] bg-surface-container-low px-3 py-2.5 text-body-s text-on-surface-variant">{icon("info-outline-rounded", 16, "mt-px shrink-0")}Thiết bị này vẫn đăng nhập. Đăng nhập đã hơn 15 phút thì bạn đăng nhập lại một lần trước khi đăng xuất các thiết bị khác.</p>""", "px-5 py-4")
    blocked = panel(f"""<h2 class="text-title-m font-semibold ink">Đã chặn · 1</h2>
  <div class="mt-3 flex items-center gap-3"><img src="{img("1556740758-90de374c12ad", 96, 96)}" alt="" class="h-10 w-10 rounded-full object-cover">
    <div class="min-w-0 flex-1"><p class="text-body-l ink">Thanh Lý 24h</p><p class="text-body-s text-on-surface-variant">Chặn 02/10 · không nhắn được cho bạn</p></div>{btn("Bỏ chặn", None, "line")}</div>""", "p-5")
    delete = f"""<section class="rounded-[24px] border border-error/20 bg-error/[.04] p-5">
  <h2 class="flex items-center gap-2 text-title-m font-semibold text-error">{icon("delete-forever-outline-rounded", 20)}Xóa tài khoản</h2>
  <p class="mt-2 text-body-m text-on-surface-variant">Tin đăng và trang của bạn được gỡ ngay. ShopNexus lưu ghi nhận của các đơn đã xong trong 12 tháng.</p>
  <button type="button" class="state mt-3 h-10 rounded-full border border-error/40 px-4 text-label-l text-error">Xóa tài khoản</button>
</section>"""
    main = f"""{login_panel}
      {device_panel}
      <div class="grid grid-cols-2 items-start gap-4">{blocked}{delete}</div>"""
    recent = "".join(row(ic, t, s, trail="", cls="-mx-2", tone=tone) for ic, t, s, tone in [
        ("login-rounded", "Đăng nhập trên Chrome", "Hôm nay 09:02 · TP.HCM", "bg-primary/10 text-primary"),
        ("sms-outline-rounded", "Mã SMS gửi tới " + PHONE, "Hôm nay 09:01", "bg-surface-container-low text-on-surface-variant"),
        ("link-rounded", "Liên kết Google", "28/09 · Pixel 9", "bg-surface-container-low text-on-surface-variant")])
    side = (panel(f"""<div class="flex items-center gap-3">{bubble(icon("verified-user-outline-rounded", 22), "bg-primary text-on-primary")}
  <div><p class="text-title-m font-semibold ink">2 cách đăng nhập</p><p class="text-body-s text-on-surface-variant">Số điện thoại và Google</p></div></div>
  <p class="mt-3 text-body-s text-on-surface-variant">Đăng tin, hỏi mua và nhắn tin cần một số điện thoại đã xác minh.</p>""", "p-4")
            + side_list("Hoạt động gần đây", recent)
            + side_list("Liên quan", row("lock-outline-rounded", "Quyền riêng tư", "Người khác thấy gì về bạn", cls="-mx-2")
                        + row("help-outline-rounded", "Thấy đăng nhập lạ?", "Gửi yêu cầu hỗ trợ", cls="-mx-2")))
    return settings_page("Bảo mật", "Bảo mật", "Cách đăng nhập, thiết bị và người bạn đã chặn", main, side)


# --------------------------------------------------------- Quyền riêng tư --
PRIVACY = [("database-outline-rounded", "Thông tin ShopNexus lưu", "Số điện thoại, khu vực, tin bạn đăng, tin nhắn, đơn hàng và đánh giá."),
           ("local-shipping-outline-rounded", "Bên vận chuyển", "Khi có đơn COD, bên vận chuyển nhận tên, số điện thoại và địa chỉ giao nhận của đơn đó."),
           ("photo-camera-outline-rounded", "Ảnh và video khi đăng tin", "AI đọc ảnh và video bạn chọn để điền tên, tình trạng và giá. Người mua thấy ảnh nào chụp trong app."),
           ("delete-outline-rounded", "Xóa dữ liệu", "Bạn xóa tài khoản trong Tôi › Bảo mật. Tin đăng và trang của bạn được gỡ ngay. "
            "ShopNexus lưu ghi nhận của các đơn đã xong trong 12 tháng, vì điểm uy tín tính trên 12 tháng.")]


def privacy():
    seen = "".join(f'<li class="flex items-center gap-2 text-body-m ink">{icon("visibility-outline-rounded", 17, "text-primary")}{t}</li>' for t in
                   ["Tên và ảnh đại diện", "Khu vực: Bình Thạnh, TP.HCM", "Hạng uy tín và đánh giá", "Các tin bạn đăng"])
    hidden = "".join(f'<li class="flex items-center gap-2 text-body-m ink">{icon("visibility-off-outline-rounded", 17, "text-on-surface-variant")}{t}</li>' for t in
                     ["Số điện thoại", "Địa chỉ nhà, công ty", "CCCD và ảnh khuôn mặt"])
    thumbs = "".join(f'<img src="{img(p, 200, 200)}" alt="" class="aspect-square w-full rounded-[12px] object-cover">' for p in (LISTINGS[5][0], LISTINGS[9][0], LISTINGS[4][0]))
    preview = f"""<div class="rounded-[20px] border line bg-white p-4 soft">
  <div class="flex items-center gap-3"><img src="{img(ME["photo"], 120, 120)}" alt="" class="h-12 w-12 rounded-full object-cover">
    <div class="min-w-0"><p class="flex items-center gap-1 text-title-m font-semibold ink">{ME["name"]}{icon("verified-rounded", 16, "text-primary")}</p>
      <p class="flex items-center gap-1 text-body-s text-on-surface-variant">Bình Thạnh · {icon("star-rounded", 12, "text-[#E0A23B]")}4,8 · Tin cậy</p></div></div>
  <div class="mt-3 grid grid-cols-3 gap-1.5">{thumbs}</div>
  <p class="mt-2 text-center text-body-s text-on-surface-variant">Trang của bạn, như người khác thấy</p>
</div>"""
    blocks = "".join(f"""<section id="p-{i}" class="{PANEL} p-5">
  <span class="grid h-10 w-10 place-items-center rounded-full bg-secondary-container text-on-secondary-container">{icon(ic, 20)}</span>
  <h2 class="mt-3 text-title-m font-semibold ink">{t}</h2><p class="mt-1 text-body-m text-on-surface-variant">{d}</p>
</section>""" for i, (ic, t, d) in enumerate(PRIVACY))
    who = panel(f"""<h2 class="text-title-l font-semibold tight ink">Người khác thấy gì</h2>
  <div class="mt-4 grid grid-cols-[1fr_1fr_280px] items-start gap-5">
    <div><p class="mb-2 text-label-l text-primary">Người mua và người bán thấy</p><ul class="flex flex-col gap-2">{seen}</ul></div>
    <div><p class="mb-2 text-label-l text-on-surface-variant">Họ không thấy</p><ul class="flex flex-col gap-2">{hidden}</ul></div>
    {preview}
  </div>""", "p-5")
    main = f"""{who}
      <div class="grid grid-cols-2 gap-4">{blocks}</div>"""
    toc = "".join(a(f"toc-{i}", "flex items-center gap-2 rounded-full px-3 py-2 text-body-m ink hover:bg-surface-container-low", f'{icon(ic, 18, "text-on-surface-variant")}{t}', f"#p-{i}")
                  for i, (ic, t, _) in enumerate(PRIVACY))
    side = (panel(f'<p class="{LABEL}">Trên trang này</p><nav class="mt-2 flex flex-col">{toc}</nav>', "p-3")
            + side_list("Cài đặt liên quan", row("shield-outline-rounded", "Bảo mật", "Đăng nhập, thiết bị, xóa tài khoản", cls="-mx-2")
                        + row("home-outline-rounded", "Địa chỉ", "Chỉ shipper và người bán của đơn COD thấy", cls="-mx-2")))
    return settings_page("Quyền riêng tư", "Quyền riêng tư", "Cập nhật 28/10/2026", main, side)


# -------------------------------------------------------- Hoàn thiện hồ sơ --
def fake_qr(n=11):
    """A drawn stand-in for the app link's QR code."""
    def on(x, y):
        corner = (x < 3 and y < 3) or (x > n - 4 and y < 3) or (x < 3 and y > n - 4)
        return corner or (x * 7 + y * 3 + x * y) % 3 == 0
    cells = "".join(f'<span class="rounded-[2px] {"bg-[var(--ink)]" if on(x, y) else ""}"></span>' for y in range(n) for x in range(n))
    return f'<div class="grid h-[104px] w-[104px] gap-[1.5px]" style="grid-template-columns:repeat({n},1fr)">{cells}</div>'


def profile_tasks():
    kyc_steps = "".join(f'<span class="flex items-center gap-1.5 rounded-full border line bg-white px-3 py-1.5 text-label-m ink">{icon(ic, 16, "text-primary")}{t}</span>'
                        for ic, t in [("badge-outline-rounded", "Chụp 2 mặt CCCD"), ("nfc-rounded", "Đọc chip trên thẻ"), ("face-outline-rounded", "Quét khuôn mặt")])
    kyc = panel(f"""<div class="flex items-start gap-4">
    {bubble(icon("verified-user-outline-rounded", 22), "bg-primary text-on-primary h-11 w-11")}
    <div class="min-w-0 flex-1">
      <p class="flex items-center gap-2 text-title-m font-semibold ink">Xác minh danh tính<span class="rounded-full bg-primary/10 px-2 py-0.5 text-label-m text-primary">+100 điểm uy tín</span></p>
      <p class="mt-0.5 text-body-m text-on-surface-variant">Cần để đăng tin · 2 phút · mã hóa</p>
      <div class="mt-3 flex flex-wrap gap-2">{kyc_steps}</div>
      <p class="mt-3 text-body-s text-on-surface-variant">Cần CCCD gắn chip và điện thoại có NFC, nên bước này làm trên app: Tôi › Xác minh danh tính, hoặc quét mã.</p>
    </div>
    <div class="shrink-0 rounded-[18px] border line bg-white p-2.5">{fake_qr()}</div>
  </div>""", "p-5 ring-2 ring-primary/30")
    cod = a("task-cod", f"card flex items-center gap-4 {PANEL} p-5",
            f"""{bubble(icon("local-shipping-outline-rounded", 22), "bg-secondary-container text-on-secondary-container h-11 w-11")}
  <span class="min-w-0 flex-1"><span class="block text-title-m font-semibold ink">Thiết lập giao COD</span><span class="block text-body-m text-on-surface-variant">Cần để đăng tin · nhận tiền COD</span></span>
  <span class="{btn_cls("ink")}">Thiết lập{icon("arrow-forward-rounded", 16)}</span>""", "cod-setup.html")
    bio = panel(f"""<p class="flex items-center gap-2 text-title-m font-semibold ink">{icon("edit-note-rounded", 20, "text-on-surface-variant")}Giới thiệu bản thân</p>
  <div class="mt-3">{field("Vài dòng về bạn", '<span class="text-on-surface-variant">VD: hay bán đồ công nghệ đã dùng kỹ, giao trong ngày ở Bình Thạnh</span>', tall=True)}</div>
  <p class="mt-1 px-1 text-right text-body-s text-on-surface-variant">0/150</p>
  <div class="mt-2 flex items-center justify-between">{btn("Viết giúp", "auto-awesome-rounded", "tonal")}{btn("Lưu", None, "ink")}</div>""", "p-5")
    done_sub = {"phone": PHONE, "avatar": "Đã thêm", "address": f"{len(ADDRESS_BOOK)} địa chỉ · {ADDRESS_BOOK[0][1]} là mặc định"}
    done = "".join(row(ic, t, done_sub[k], trail=icon("check-circle-rounded", 20, "text-primary"), cls="-mx-2", tone="bg-primary/10 text-primary",
                       href=HREF["Địa chỉ"] if k == "address" else None)
                   for k, ic, t, ok in PROFILE_TASKS if ok)
    left = len(PROFILE_TASKS) - TASKS_DONE
    head_panel = panel(f"""<div class="flex items-center gap-5">{ring(TASKS_DONE, len(PROFILE_TASKS), 84, 8)}
  <div class="flex-1"><p class="text-label-l text-on-surface-variant">Còn {left} bước</p><p class="text-[26px] font-semibold leading-8 tighter ink">Lên Người bán tin cậy</p>
    <p class="mt-1 text-body-m text-on-surface-variant">Xác minh danh tính và thiết lập giao COD là đủ để đăng tin.</p></div>
  <img src="{build_c.ART["tier_trusted"]}" alt="" class="h-20 w-20"></div>""", "p-5")
    main = f"""{head_panel}
      <p class="{LABEL} mt-1">Cần làm · {left}</p>
      {kyc}
      {cod}
      {bio}"""
    unlocks = "".join(f'<li class="flex gap-2">{icon(ic, 18, "mt-0.5 shrink-0 text-primary")}<span>{t}</span></li>' for ic, t in [
        ("sell-outline-rounded", "Đăng tin bán, sau khi xác minh và thiết lập COD"), ("military-tech-outline-rounded", "+100 điểm uy tín khi xác minh danh tính"),
        ("payments-outline-rounded", MONEY["cod_seller"])])
    side = (side_list(f"Đã xong · {TASKS_DONE}", done)
            + panel(f'<p class="{LABEL}">Mỗi bước mở ra</p><ul class="mt-2 flex flex-col gap-2.5 px-1 text-body-m ink">{unlocks}</ul>', "p-4")
            + a("rep-link", f"card flex items-center gap-3 {PANEL} p-4",
                f'<span class="num ink text-[28px] font-semibold leading-8 tighter">386</span><span class="flex-1 text-body-m ink">Điểm uy tín<span class="block text-body-s text-on-surface-variant">Còn 114 điểm lên Uy tín</span></span>{CHEV}',
                "reputation.html"))
    return settings_page("Hoàn thiện hồ sơ", "Hoàn thiện hồ sơ", f"{TASKS_DONE}/{len(PROFILE_TASKS)} bước · số điện thoại, ảnh đại diện và địa chỉ đã xong", main, side)


# ------------------------------------------------------------ Điểm uy tín --
TIERS = [("Mới", 0), ("Tin cậy", 200), ("Uy tín", 500), ("Xuất sắc", 800)]
SCORE = 386


def stat_row(items, label):
    cells = "".join(f'<div class="flex-1 px-4 first:pl-0"><p class="num text-[26px] font-semibold leading-8 tighter ink">{v}</p><p class="text-body-s text-on-surface-variant">{l}</p></div>' for v, l in items)
    return panel(f'<p class="{LABEL}">{label}</p><div class="mt-3 flex divide-x divide-[var(--line)]">{cells}</div>', "p-5")


def reputation():
    marks = "".join(f'<span class="absolute top-0 -translate-x-1/2 text-center" style="left:{max(v / 10, 2)}%"><span class="mx-auto block h-5 w-px bg-black/15"></span>'
                    f'<span class="mt-1 block whitespace-nowrap text-label-m {"ink" if t == "Tin cậy" else "text-on-surface-variant"}">{t}</span><span class="num block text-body-s text-on-surface-variant">{v}</span></span>'
                    for t, v in TIERS)
    track = f"""<div class="relative mt-5 h-[62px]">
  <div class="absolute inset-x-0 top-1.5 h-2 rounded-full bg-surface-container-high"></div>
  <div class="absolute left-0 top-1.5 h-2 rounded-full bg-gradient-to-r from-[#066A61] to-[#5CC2B4]" style="width:{SCORE / 10}%"></div>
  <div class="absolute inset-x-0 top-0">{marks}</div>
  <span class="absolute top-0 h-5 w-5 -translate-x-1/2 rounded-full border-4 border-white bg-primary soft" style="left:{SCORE / 10}%"></span>
</div>"""
    boosts = "".join(f"""<div class="{PANEL} flex flex-col p-4">
  <div class="flex items-center justify-between">{bubble(icon(ic, 20), "bg-primary/10 text-primary")}{end}</div>
  <p class="mt-3 text-title-s ink">{t}</p><p class="text-body-s text-on-surface-variant">{s}</p>
</div>""" for ic, t, s, end in [
        ("verified-user-outline-rounded", "Xác minh danh tính", "+100 · một lần", f'<span class="{btn_cls("ink")} !h-8 !px-3 text-label-m">Làm trên app</span>'),
        ("bolt-rounded", "Trả lời trong 1 giờ", "+20 mỗi tháng · tháng này 9/10 tin", '<span class="num text-title-s text-primary">9/10</span>'),
        ("handshake-outline-rounded", "Hoàn tất giao dịch", "+10 mỗi lần", "")])
    ladder = "".join(f'<span class="rounded-full px-3 py-1.5 text-label-m {"bg-tertiary-fixed text-on-tertiary-fixed-variant" if i == 0 else "bg-surface-container-low text-on-surface-variant"}">{t}</span>'
                     + (icon("chevron-right-rounded", 16, "text-outline") if i < 3 else "") for i, t in enumerate(["Hạ hiển thị", "Giới hạn COD", "Mất COD", "Khóa"]))
    history = "".join(f"""<li class="flex min-w-0 items-center gap-3 py-2.5 {"border-t line" if i % 3 else ""}">
  <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full {"bg-error/10 text-error" if pts < 0 else "bg-primary/10 text-primary"}">{icon(ic, 18)}</span>
  <span class="min-w-0 flex-1 truncate text-body-m ink">{t}</span><span class="num text-body-s text-on-surface-variant">{d}</span>
  <span class="num w-10 text-right text-title-s {"text-error" if pts < 0 else "text-primary"}">{"+" if pts > 0 else "−"}{abs(pts)}</span>
</li>""" for i, (ic, t, d, pts) in enumerate([
        ("star-outline-rounded", "Gia Bảo đánh giá 5 sao", "12/10", 5), ("sell-outline-rounded", "Bán Kệ gỗ nhỏ 3 tầng", "12/10", 10),
        ("shopping-bag-outline-rounded", "Mua Tai nghe Sony WH-1000XM4", "09/10", 10), ("star-outline-rounded", "Minh Thư đánh giá 2 sao", "02/10", -15),
        ("bolt-rounded", "Trả lời nhanh cả tháng 9", "30/09", 20), ("star-outline-rounded", "Hoàng Phúc đánh giá 4 sao", "21/09", 2)]))
    hero = panel(f"""<div class="flex items-center gap-5">
  <img src="{build_c.ART["tier_trusted"]}" alt="" class="h-20 w-20 shrink-0">
  <div class="flex-1"><p class="text-label-l text-on-surface-variant">Bậc hiện tại · Tin cậy</p>
    <p class="num"><span class="ink text-[56px] font-semibold leading-[60px] tighter">{SCORE}</span><span class="text-title-m text-on-surface-variant">/1000</span></p></div>
  <div class="text-right"><p class="text-title-m font-semibold ink">Còn 114 điểm</p><p class="text-body-s text-on-surface-variant">lên Uy tín</p></div>
</div>{track}""", "px-6 pb-4 pt-5")
    main = f"""{hero}
      <div class="grid grid-cols-[2fr_3fr] gap-4">
        {stat_row([('2<span class="text-body-m font-medium text-on-surface-variant">/5</span>', "Đơn COD đang mở"), ('5<span class="text-body-m font-medium text-on-surface-variant">/20</span>', "Tin đang đăng")], "Quyền của bạn")}
        {stat_row([("0/11", "Từ chối nhận COD"), ("0", "Ghi nhận bạn từ chối"), ("0", "Ghi nhận chưa trả lời")], "Chỉ số 90 ngày")}
      </div>
      {panel(f'''<div class="flex items-center justify-between gap-4"><p class="text-title-m font-semibold ink">Khi vượt ngưỡng</p><div class="flex flex-wrap items-center gap-1.5">{ladder}</div></div>
        <p class="mt-2 text-body-s text-on-surface-variant">Vượt ngưỡng thì mất quyền theo thứ tự này. Sạch 30 ngày thì gỡ.</p>''', "p-5")}
      <p class="{LABEL} mt-1">Tăng điểm</p>
      <div class="grid grid-cols-3 gap-4">{boosts}</div>
      {panel(f'<p class="text-title-m font-semibold ink">Lịch sử</p><ul class="mt-1 grid grid-flow-col grid-cols-2 grid-rows-3 gap-x-8">{history}</ul>', "p-5")}"""

    def rule(t, v, neg=False):
        return f'<li class="flex justify-between py-1.5 text-body-m"><span class="ink">{t}</span><span class="num font-medium {"text-error" if neg else "text-primary"}">{v}</span></li>'
    plus = "".join(rule(t, v) for t, v in [("Giao dịch xong", "+10"), ("Đánh giá 5 sao", "+5"), ("Đánh giá 4 sao", "+2"), ("Tự hoàn khi có ghi nhận", "+15"),
                                           ("Trả lời trong 1 giờ, cả tháng", "+20"), ("Xác minh danh tính", "+100")])
    tiers = "".join(f'<li class="flex justify-between py-1.5 text-body-m"><span class="ink">{t}</span><span class="num text-on-surface-variant">từ {v}</span></li>' for t, v in TIERS)
    side = (panel(f"""<p class="{LABEL}">Cách tính điểm</p>
  <p class="mt-3 px-1 text-label-l text-on-surface-variant">Cộng</p><ul class="divide-y divide-[var(--line)] px-1">{plus}</ul>
  <p class="mt-3 px-1 text-label-l text-on-surface-variant">Trừ</p><ul class="px-1">{rule("Đánh giá 1–2 sao", "−15", True)}</ul>
  <p class="mt-3 px-1 text-label-l text-on-surface-variant">Bậc</p><ul class="divide-y divide-[var(--line)] px-1">{tiers}</ul>""", "p-4")
            + panel(f"""<ul class="flex flex-col gap-2 text-body-s text-on-surface-variant">
  <li class="flex gap-2">{icon("history-rounded", 16, "mt-px shrink-0")}Tính 12 tháng gần nhất, điểm cũ hơn tính một nửa</li>
  <li class="flex gap-2">{icon("fact-check-outline-rounded", 16, "mt-px shrink-0")}Chỉ tính việc app ghi nhận được, không tính tranh chấp</li></ul>""", "p-4"))
    return settings_page("Điểm uy tín", "Điểm uy tín", "Người mua thấy bậc của bạn trên mọi tin bạn đăng", main, side)



if __name__ == "__main__":
    for name, fn in [("login", login), ("account", account), ("notifications", notifications), ("messages", messages),
                     ("addresses", addresses), ("security", security), ("privacy", privacy), ("profile-tasks", profile_tasks), ("reputation", reputation)]:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(fn())
        print("wrote", name)
