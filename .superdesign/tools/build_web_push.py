"""Web push and install on the website, in K2.

  - The push offer: a small card where the snackbar sits, shown once after
    the buyer sends a chat message or places an order. "Bật" asks the
    browser; "Để sau" hides it for good.
  - Cài đặt thông báo gets a "Trên trình duyệt này" switch on top.
  - "Cài ShopNexus" in the account menu and on Tôi, only where the browser
    can install; on iPhone Safari it opens the add-to-home-screen hint.

    python3 tools/build_web_push.py        (run from .superdesign/)

Writes mockups/web-push-{offer,settings,install}-{desktop,phone}.html.
"""
import base64
import os

from build import OUT, PHOTOS, PRICE, TITLE
from build_header import Ids, bar_a, menu
from build_k2 import ME, detail, home, out, ri
from common import LOGO, img

POP = "shadow-[0_12px_32px_-8px_rgb(20_20_19/.16),0_0_0_1px_rgb(20_20_19/.05)]"
SWITCH_ON = ('<span class="relative h-7 w-12 shrink-0 rounded-full bg-brand" role="switch" aria-checked="true">'
             '<span class="absolute right-1 top-1 h-5 w-5 rounded-full bg-white shadow"></span></span>')
SWITCH_OFF = ('<span class="relative h-7 w-12 shrink-0 rounded-full bg-[#E3E3DF] {dim}" role="switch" aria-checked="false">'
              '<span class="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow"></span></span>')
APP_ICON = "data:image/png;base64," + base64.b64encode(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "brand", "web", "icon-192.png"), "rb").read()).decode()
IOS_SHARE = '<iconify-icon icon="material-symbols:ios-share-rounded" width="18" height="18" class="inline-block align-[-3px]"></iconify-icon>'


# --------------------------------------------------------------- offer --
def offer(text, where):
    """The card: the bell in mint, one line, Để sau and Bật."""
    return f"""<div role="dialog" aria-label="Bật thông báo" class="{where} z-50 flex w-[420px] max-w-[calc(100%-32px)] flex-wrap items-center gap-x-3 gap-y-2 rounded-[16px] bg-white p-3 {POP}">
  <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-mint text-on-mint">{ri("notification-3-line", 20)}</span>
  <p class="min-w-[200px] flex-1 text-[14px] leading-5">{text}</p>
  <span class="ml-auto flex gap-1">
    <button type="button" class="h-9 shrink-0 rounded-[10px] px-3 text-[14px] font-medium mute row">Để sau</button>
    <button type="button" class="h-9 shrink-0 rounded-[10px] bg-brand px-4 text-[14px] font-medium text-white">Bật</button>
  </span>
</div>"""


def offer_desktop():
    html = detail()
    card = offer("Bật thông báo để biết khi có tin nhắn mới", "fixed bottom-6 right-6")
    end = html.rindex("</div>", 0, html.rindex("</body>"))  # inside the page's one root div
    return (html[:end] + card + html[end:]).replace("<title>", "<title>Bật thông báo · ", 1)


def phone_header(L):
    return f"""<header class="sticky top-0 z-30 border-b bd bg-[var(--bg)]">
  <div class="flex h-16 items-center gap-2 px-4">
    {L.a("grid h-10 w-8 shrink-0 place-items-center", f'<img src="{LOGO}" alt="" class="h-8 w-8">', "ShopNexus")}
    <div class="ml-1 flex h-10 min-w-0 flex-1 items-center gap-2 rounded-[10px] bg-white pl-3 shadow-[inset_0_0_0_1px_#DCDCD8]">{ri("search-line", 17, "mute")}<span class="text-[14px] mute">Tìm iPhone, xe đạp…</span></div>
    {L.a("grid h-10 w-10 shrink-0 place-items-center rounded-[10px] row", ri("notification-3-line", 20), "Thông báo")}
  </div>
</header>"""


def bottom_nav(on):
    items = [("compass-3", "Khám phá"), ("apps-2", "Danh mục"), ("chat-3", "Tin nhắn"), ("user", "Tôi")]
    cells = "".join(f'<span class="flex flex-col items-center justify-center gap-1 text-[12px] {"" if t == on else "mute"}"><span class="grid h-8 w-16 place-items-center rounded-full {"bg-mint text-on-mint" if t == on else ""}">{ri(i + ("-fill" if t == on else "-line"), 22)}</span>{t}</span>'
                    for i, t in items)
    return f'<nav class="absolute inset-x-0 bottom-0 grid h-20 grid-cols-4 border-t bd bg-[var(--bg)]">{cells}</nav>'


def phone(title, inner, nav="Khám phá"):
    L = Ids("wp-phone")
    body = f"""<div class="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-[var(--bg)]">
  {phone_header(L)}
  {inner}
  {bottom_nav(nav)}
</div>"""
    return out(title, body)


def offer_phone():
    inner = f"""<main class="px-4 pt-4">
    <div class="card p-2"><img src="{PHOTOS[0]}" alt="" class="aspect-[4/3] w-full rounded-[11px] object-cover"></div>
    <div class="mt-3 card p-4">
      <h1 class="text-[18px] font-semibold leading-6">{TITLE}</h1>
      <p class="num mt-1.5 text-[24px] font-semibold">{PRICE[0]} ₫</p>
    </div>
    <div class="mt-3 card p-4">
      <p class="text-[14px] font-medium">Chat nhanh</p>
      <div class="mt-3 flex justify-end"><span class="max-w-[80%] rounded-[16px] rounded-br-[6px] bg-brand px-3 py-2 text-[14px] text-white">Máy còn bảo hành không bạn?</span></div>
      <p class="meta mt-1 text-right">Đã gửi</p>
    </div>
  </main>
  {offer("Bật thông báo để biết khi có tin nhắn mới", "absolute bottom-24 left-4 right-4 !w-auto")}"""
    return phone("Bật thông báo · điện thoại", inner)


# ------------------------------------------------------------ settings --
def pref(icon, title, sub="", trail=SWITCH_ON):
    s = f'<span class="block truncate text-[12.5px] leading-4 mute">{sub}</span>' if sub else ""
    return f"""<div class="flex items-center gap-3 rounded-[12px] px-2 py-2">
      <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-soft mute">{ri(icon, 19)}</span>
      <span class="min-w-0 flex-1"><span class="block truncate text-[15px] leading-5">{title}</span>{s}</span>{trail}
    </div>"""


def browser_rows(state):
    """The new block: on, off, or blocked in the browser."""
    if state == "on":
        row = pref("notification-3-line", "Trên trình duyệt này")
    elif state == "off":
        row = pref("notification-3-line", "Trên trình duyệt này", trail=SWITCH_OFF.format(dim=""))
    else:
        row = pref("notification-3-line", "Trên trình duyệt này", "Trình duyệt đang chặn", SWITCH_OFF.format(dim="opacity-40"))
    return f'{row}<div class="mx-1 my-2 border-t bd"></div>'


def settings_panel(state):
    groups = [("Giao dịch", [("chat-3-line", "Tin nhắn"), ("price-tag-3-line", "Trả giá và chốt giá"), ("truck-line", "Đơn hàng và giao hàng")]),
              ("Giá và tin mới", [("arrow-right-down-line", "Giảm giá ở tin đã lưu"), ("store-2-line", "Người bán bạn theo dõi")]),
              ("Đánh giá", [("star-line", "Đánh giá và trả lời")])]
    rows = "".join(f'<p class="mt-3 px-1 text-[12.5px] mute">{g}</p>' + "".join(pref(i, t) for i, t in items) for g, items in groups)
    return f"""<div class="rounded-[16px] border bd bg-white p-4">
    <h2 class="px-1 pb-2 text-[16px] font-semibold">Cài đặt thông báo</h2>
    {browser_rows(state)}
    {rows.replace('mt-3 px-1', 'px-1', 1)}
    <button type="button" class="mt-4 h-10 w-full rounded-[10px] bg-brand text-[14px] font-medium text-white">Lưu cài đặt</button>
  </div>"""


def account_nav(L, active):
    items = [("user-line", "Tôi"), ("price-tag-3-line", "Tin của bạn"), ("file-list-3-line", "Đơn mua"), ("store-2-line", "Đơn bán"),
             ("heart-line", "Đã lưu"), ("chat-3-line", "Tin nhắn"), ("notification-3-line", "Thông báo"), ("truck-line", "Thiết lập giao COD"),
             ("question-line", "Hỗ trợ")]
    rows = "".join(L.a(f"row flex h-10 items-center gap-3 rounded-[10px] px-3 text-[15px] {'on' if t == active else ''}", ri(i, 18) + t) for i, t in items)
    return f"""<aside class="flex flex-col gap-3">
    <div class="flex items-center gap-3 rounded-[16px] border bd bg-white p-3"><img src="{img(ME, 96, 96)}" alt="" class="h-11 w-11 rounded-full object-cover"><span><span class="block text-[15px] font-medium">Ngọc Anh</span><span class="meta">★ 4,9 · 12 đã bán</span></span></div>
    <nav class="flex flex-col">{rows}</nav>
  </aside>"""


NOTES = [("price-tag-3-line", "Minh Anh trả 4.200.000 ₫ cho Sofa nhung xanh 3 chỗ", "12 phút", True),
         ("truck-line", "Tuấn Kiệt đã gửi iPhone X 64GB · GHTK S22.1184", "1 giờ", True),
         ("arrow-right-down-line", "MacBook Air M1 giảm còn 11,2 tr, lúc lưu 12 tr", "1 ngày", False),
         ("star-line", "Hoàng Nam chấm bạn 5 sao · AirPods Pro 2", "1 ngày", False)]


def notes_list():
    rows = "".join(f"""<div class="flex items-start gap-3 rounded-[14px] px-3 py-2.5 {'bg-[rgb(6_106_97/.05)]' if unread else ''}">
      <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#E3F2EF] text-[#05554E]">{ri(i, 18)}</span>
      <span class="min-w-0 flex-1"><span class="block text-[14px] leading-5">{t}</span><span class="meta">{ago} trước</span></span>
      {'<span class="mt-2 h-2 w-2 rounded-full bg-brand"></span>' if unread else ''}</div>""" for i, t, ago, unread in NOTES)
    return f'<div class="rounded-[16px] border bd bg-white p-3"><p class="px-3 pb-1 text-[12.5px] mute">Hôm nay</p>{rows}</div>'


def settings_desktop():
    L = Ids("wp-set")
    body = f"""{bar_a(L, 1280)}
<main class="mx-auto grid max-w-[1280px] grid-cols-[232px_minmax(0,1fr)_340px] gap-6 px-8 pt-6">
  {account_nav(L, "Thông báo")}
  <section>
    <h1 class="text-[28px] font-semibold tracking-[-0.02em]">Thông báo</h1>
    <p class="meta mt-1 flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-brand"></span>2 chưa đọc</p>
    <div class="mt-4">{notes_list()}</div>
  </section>
  <aside>{settings_panel("on")}</aside>
</main>"""
    return out("Cài đặt thông báo · trình duyệt", body)


def settings_phone():
    inner = f"""<main class="px-4 pt-4">
    <h1 class="text-[22px] font-semibold tracking-[-0.02em]">Thông báo</h1>
    <div class="mt-3">{settings_panel("blocked")}</div>
  </main>"""
    return phone("Cài đặt thông báo · bị chặn", inner, "Tôi")


# ------------------------------------------------------------- install --
def install_desktop():
    L = Ids("wp-inst")
    html = home()
    from build_k2 import header as k2_header
    m = menu(L, "32px")
    extra = L.a("flex h-10 items-center gap-3 rounded-[8px] px-3 text-[14px] row", ri("install-line", 18, "mute") + '<span class="flex-1">Cài ShopNexus</span>')
    support = m.index("Hỗ trợ")
    cut = m.index("</a>", support) + len("</a>")
    m = m[:cut] + extra + m[cut:]
    bar = bar_a(L, 1280, menu_open=False).replace("</header>", m + "</header>", 1)
    return html.replace(k2_header(), bar, 1).replace("<title>", "<title>Cài ShopNexus · ", 1)


def install_phone():
    rows = [("notification-3-line", "Thông báo"), ("medal-line", "Uy tín của bạn"), ("store-2-line", "Gói người bán"),
            ("shield-line", "Bảo mật và xác minh"), ("question-line", "Trợ giúp và an toàn"), ("install-line", "Cài ShopNexus")]
    links = "".join(f"""<div class="flex items-center gap-3 px-2 py-2"><span class="grid h-9 w-9 place-items-center rounded-full bg-soft mute">{ri(i, 19)}</span>
      <span class="flex-1 text-[15px]">{t}</span>{ri("arrow-right-s-line", 18, "mute")}</div>""" for i, t in rows)
    steps = [(f"Chạm {IOS_SHARE} <b class='font-medium'>Chia sẻ</b> ở thanh dưới của Safari"),
             (f"Chọn {ri('add-box-line', 18, '!inline-block align-[-3px]')} <b class='font-medium'>Thêm vào MH chính</b>")]
    step_rows = "".join(f'<li class="flex items-start gap-3"><span class="num grid h-6 w-6 shrink-0 place-items-center rounded-full bg-mint text-[12px] font-semibold text-on-mint">{n}</span><span class="text-[14px] leading-6">{s}</span></li>'
                        for n, s in enumerate(steps, 1))
    inner = f"""<main class="px-4 pt-4">
    <div class="rounded-[16px] border bd bg-white p-3"><p class="px-1 text-[12.5px] mute">Tài khoản</p>{links}</div>
  </main>
  <div class="absolute inset-0 z-40 bg-black/30"></div>
  <section role="dialog" aria-label="Cài ShopNexus" class="absolute inset-x-0 bottom-0 z-50 rounded-t-[20px] bg-white px-5 pb-8 pt-2">
    <span class="mx-auto mb-4 block h-1 w-8 rounded-full bg-[#8C8C87]/50"></span>
    <div class="flex items-center gap-3">
      <img src="{APP_ICON}" alt="" class="h-12 w-12 rounded-[12px]">
      <div><p class="text-[17px] font-semibold">Cài ShopNexus</p><p class="meta">Mở nhanh từ màn hình chính</p></div>
    </div>
    <ol class="mt-5 flex flex-col gap-3">{step_rows}</ol>
    <button type="button" class="mt-6 h-11 w-full rounded-[10px] bg-brand text-[15px] font-medium text-white">Đã hiểu</button>
  </section>"""
    return phone("Cài ShopNexus · iPhone", inner, "Tôi")


if __name__ == "__main__":
    for name, fn in [("offer-desktop", offer_desktop), ("offer-phone", offer_phone), ("settings-desktop", settings_desktop),
                     ("settings-phone", settings_phone), ("install-desktop", install_desktop), ("install-phone", install_phone)]:
        with open(os.path.join(OUT, f"web-push-{name}.html"), "w") as f:
            f.write(fn())
        print("wrote web-push", name)
