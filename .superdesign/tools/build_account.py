"""Đăng nhập, Tôi and Thông báo in the chosen style (C's shell).

    python3 tools/build_account.py        (run from .superdesign/)
"""
import json
import os
from html import escape

from build import OUT, a
from build_c import ART, CSS, footer, header
from common import LISTINGS, LOGO, head, icon, img, split_price

HERE = os.path.dirname(os.path.abspath(__file__))
ART2 = {**json.load(open(os.path.join(HERE, "art_sh.json"))), **json.load(open(os.path.join(HERE, "art_account.json")))}

# Verbatim from app/.superdesign/tools/common.py MONEY.
MONEY = dict(
    no_hold="ShopNexus không giữ tiền và không nhận cọc.",
    cod_seller="Bên vận chuyển chuyển tiền hàng cho bạn 1–2 ngày sau khi người mua nhận.",
    cod_buyer="Xem hàng rồi mới trả tiền hàng và phí ship cho shipper.",
)

ME = dict(name="Khánh Linh", photo="1494790108377-be9c29b29330", area="Bình Thạnh, TP.HCM")

PAGE_CSS = CSS + """
  .seg > * { border-radius: 4px; }
  .seg > :first-child { border-top-left-radius: 9999px; border-bottom-left-radius: 9999px; }
  .seg > :last-child { border-top-right-radius: 9999px; border-bottom-right-radius: 9999px; }
  .grouped > * { border-radius: 4px; }
  .grouped > :first-child { border-top-left-radius: 28px; border-top-right-radius: 28px; }
  .grouped > :last-child { border-bottom-left-radius: 28px; border-bottom-right-radius: 28px; }
  .otp { width: 56px; height: 64px; }
"""


def nav_active(html, label):
    """Mark one header link as current (C's header marks Khám phá by default)."""
    html = html.replace('bg-secondary-container text-on-secondary-container">Khám phá', 'text-on-surface-variant">Khám phá', 1)
    if label:
        html = html.replace(f'text-on-surface-variant">{label}', f'bg-secondary-container text-on-secondary-container">{label}', 1)
    return html


def money(key, ic):
    return (f'<p class="flex gap-2 text-body-m text-on-surface-variant">{icon(ic, 18, "mt-0.5")}<span>{MONEY[key]}</span></p>')


def ring(done, total, size=56, stroke=6):
    r = (size - stroke) / 2
    c = 2 * 3.14159 * r
    return f"""<span class="relative grid shrink-0 place-items-center" style="width:{size}px;height:{size}px">
  <svg viewBox="0 0 {size} {size}" class="absolute inset-0 -rotate-90" aria-hidden="true">
    <circle cx="{size / 2}" cy="{size / 2}" r="{r}" fill="none" stroke="var(--md-surface-container-highest)" stroke-width="{stroke}"/>
    <circle cx="{size / 2}" cy="{size / 2}" r="{r}" fill="none" stroke="var(--md-primary)" stroke-width="{stroke}" stroke-linecap="round" stroke-dasharray="{c * done / total:.1f} {c:.1f}"/>
  </svg>
  <span class="relative text-title-m text-on-surface">{done}<span class="text-body-s text-on-surface-variant">/{total}</span></span>
</span>"""


# -------------------------------------------------------------------- login --
def login():
    shapes = [("1611186871348-b1ce696e52c9", "rounded-[38%]", "left-10 top-14 w-[190px] -rotate-6"),
              ("1507035895480-2b3156c31fc8", "rounded-[50%_50%_18%_50%]", "left-[230px] top-6 w-[170px] rotate-6"),
              ("1555041469-a586c61ea9bc", "rounded-t-full rounded-b-[28px]", "left-16 top-[280px] w-[170px] rotate-3"),
              ("1526170375885-4d8ecf77b99f", "rounded-[30%_70%_70%_30%/30%_30%_70%_70%]", "left-[250px] top-[250px] w-[180px] -rotate-6")]
    photos = "".join(f'<img src="{img(p, 400, 400)}" alt="" class="absolute aspect-square object-cover {shape} {pos}">' for p, shape, pos in shapes)
    promises = "".join(f'<li class="flex items-center gap-3 text-body-l text-on-surface">{icon(ic, 22, "text-primary")}{t}</li>' for ic, t in [
        ("local-shipping-outline-rounded", "Giao tận nơi, xem hàng rồi mới trả"),
        ("photo-camera-outline-rounded", "Ảnh chụp trong app, ghi rõ tình trạng"),
        ("account-balance-outline-rounded", MONEY["no_hold"])])
    boxes_filled = "".join(f'<span class="otp grid place-items-center rounded-md border-2 {"border-primary" if i == 4 else "border-outline-variant"} bg-surface-container-lowest text-headline-m">{d}</span>'
                           for i, d in enumerate("2849") ) + '<span class="otp grid place-items-center rounded-md border-2 border-primary bg-surface-container-lowest"><span class="h-7 w-0.5 bg-primary"></span></span>' \
                   + '<span class="otp rounded-md border-2 border-outline-variant bg-surface-container-lowest"></span>'
    step = lambda n, label: (f'<span class="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-3 py-1 text-label-l text-on-surface-variant">'
                             f'<span class="text-primary">Bước {n}/3</span>· {label}</span>')
    body = f"""<body>
<div class="min-h-screen bg-surface pb-2 font-sans text-on-surface">
  {nav_active(header(quick="always"), None)}
  <main class="mx-auto max-w-[1328px] px-6">
    <div class="mt-8 grid grid-cols-[1fr_520px] gap-8">
      <section class="relative overflow-hidden rounded-xl bg-secondary-container p-12">
        <div class="flex items-center gap-3"><img src="{LOGO}" alt="ShopNexus" class="h-12 w-12"><span class="text-headline-s font-medium text-on-surface">ShopNexus</span></div>
        <h1 class="mt-8 max-w-[440px] text-display-m text-on-surface">Giá tốt, gần bạn, chốt nhanh</h1>
        <ul class="mt-8 flex flex-col gap-4">{promises}</ul>
        <div class="relative mt-10 h-[480px]">
          {photos}
          <span class="absolute left-[200px] top-[210px] rotate-[-8deg] whitespace-nowrap rounded-full bg-tertiary-fixed px-4 py-1.5 text-title-m text-on-tertiary-fixed-variant shadow-float">2,1<span class="text-body-m"> tr ₫</span></span>
          <span class="absolute left-[420px] top-[200px] grid h-12 w-12 place-items-center rounded-full bg-primary text-on-primary shadow-float">{icon("check-rounded", 28)}</span>
          <img src="{ART["art_deal"]}" alt="" class="absolute -bottom-6 right-0 w-[300px]">
        </div>
      </section>

      <section class="flex flex-col gap-6">
        <div class="rounded-xl bg-surface-container-lowest p-8 shadow-float">
          {step(1, "Số điện thoại")}
          <h2 class="mt-5 text-headline-m">Đăng nhập bằng số điện thoại</h2>
          <p class="mt-2 text-body-l text-on-surface-variant">Chỉ cần số điện thoại. Mã gửi qua SMS.</p>
          <label class="mt-6 block text-label-l text-on-surface-variant">Số điện thoại</label>
          <div class="mt-2 flex h-14 items-center gap-3 rounded-full border-2 border-primary bg-surface-container-lowest pl-2 pr-5">
            <span class="flex h-10 items-center gap-1 rounded-full bg-surface-container-high px-3 text-label-l text-on-surface">+84{icon("keyboard-arrow-down-rounded", 18)}</span>
            <span class="flex-1 text-title-l font-normal text-on-surface">903 452 128</span>
          </div>
          <p class="mt-3 flex items-center gap-2 text-body-m text-on-surface-variant">{icon("visibility-off-outline-rounded", 18)}Người mua và người bán không thấy số của bạn.</p>
          <button type="button" class="state mt-6 h-14 w-full rounded-full bg-secondary-container text-label-l text-on-secondary-container">Gửi mã</button>
        </div>

        <div class="rounded-xl bg-surface-container-low p-8">
          {step(2, "Mã xác nhận")}
          <h2 class="mt-5 text-headline-s">Nhập mã 6 số</h2>
          <p class="mt-2 text-body-m text-on-surface-variant">Đã gửi tới +84 903 452 128 · {a("change-number", "text-label-l text-primary hover:underline", "Đổi số")}</p>
          <div class="mt-5 flex justify-between">{boxes_filled}</div>
          <p class="mt-4 text-body-m text-on-surface-variant">Gửi lại mã sau 45 giây</p>
        </div>

        <p class="px-4 text-center text-body-s text-on-surface-variant">Tiếp tục là bạn đồng ý với {a("terms", "text-primary hover:underline", "Điều khoản sử dụng")} và {a("privacy", "text-primary hover:underline", "Chính sách quyền riêng tư")} của ShopNexus.</p>
        {a("preview", "state mx-auto flex h-11 items-center gap-2 rounded-full px-5 text-label-l text-primary", "Xem trước, đăng nhập sau" + icon("arrow-forward-rounded", 18))}
      </section>
    </div>
  </main>
  {footer()}
</div>
</body>
</html>"""
    return head("Đăng nhập · ShopNexus", PAGE_CSS) + body


# ------------------------------------------------------------------ account --
MY_LISTINGS = [
    ("draft", "1586023492125-27b2c045efd7", "Ghế bành bọc vải vàng mù tạt", None, None),
    ("sale", "1505740420928-5e560c06d30e", "Tai nghe Sony WH-1000XM4, fullbox", "3.200.000 ₫", ("8", "146", "Cao hơn 12%")),
    ("sale", "1585515320310-259814833e62", "Máy xay sinh tố 2L, còn bảo hành", "450.000 ₫", ("3", "61", None)),
    ("sold", "1593764592116-bfb2a97c642a", "Fixie đen mờ size 50", "1.800.000 ₫", None),
]


def my_row(kind, photo, title, price, stats):
    if kind == "draft":
        right = f'<button type="button" class="state h-10 rounded-full bg-secondary-container px-4 text-label-l text-on-secondary-container">Tiếp tục</button>'
        meta = '<span class="rounded-sm bg-surface-container-high px-2 py-0.5 text-label-m text-on-surface-variant">Bản nháp</span>'
    elif kind == "sold":
        right = f'<span class="text-label-l text-on-surface-variant">Đã bán</span>'
        num, unit = split_price(price)
        meta = f'<span class="text-body-m text-on-surface-variant">{num}{unit} · bán tuần trước</span>'
    else:
        chats, views, judge = stats
        num, unit = split_price(price)
        j = f'<span class="flex items-center gap-1 text-label-m text-tertiary">{icon("auto-awesome-rounded", 14)}{judge}</span>' if judge else ""
        meta = (f'<span class="text-title-s text-on-surface">{num}<span class="text-body-s text-on-surface-variant">{unit}</span></span>'
                f'<span class="flex items-center gap-1 text-body-s text-on-surface-variant">{icon("chat-outline-rounded", 14)}{chats}</span>'
                f'<span class="flex items-center gap-1 text-body-s text-on-surface-variant">{icon("visibility-outline-rounded", 14)}{views}</span>{j}')
        right = icon("chevron-right-rounded", 24, "text-on-surface-variant")
    return f"""<li class="state flex items-center gap-4 rounded-lg p-3">
  <img src="{img(photo, 128, 128)}" alt="" class="h-16 w-16 shrink-0 rounded-lg object-cover {"opacity-60" if kind == "sold" else ""}">
  <div class="min-w-0 flex-1"><p class="truncate text-body-l text-on-surface">{escape(title)}</p><p class="mt-1 flex flex-wrap items-center gap-3">{meta}</p></div>
  {right}
</li>"""


def setting_row(ic, title, value=None, last=False):
    v = f'<span class="block text-body-s text-on-surface-variant">{value}</span>' if value else ""
    return (f'<div class="state flex min-h-[56px] items-center gap-4 bg-surface-container px-5 py-3">{icon(ic, 22, "text-on-surface-variant")}'
            f'<span class="flex-1"><span class="block text-body-l text-on-surface">{title}</span>{v}</span>{icon("chevron-right-rounded", 22, "text-on-surface-variant")}</div>')


def account():
    tiles = "".join(
        f"""<a id="tile-{k}" href="#tile-{k}" class="lift state flex flex-col justify-between rounded-xl bg-surface-container-low p-5" style="min-height:132px">
  <span class="grid h-11 w-11 place-items-center rounded-full bg-secondary-container text-on-secondary-container">{icon(ic, 22)}</span>
  <span><span class="block text-title-m text-on-surface">{t}</span><span class="block text-body-s text-on-surface-variant">{sub}</span></span>
</a>""" for k, ic, t, sub in [("listings", "sell-outline-rounded", "Tin của bạn", "6 đang bán · 1 nháp"), ("orders", "shopping-bag-outline-rounded", "Đơn hàng", "3 đơn mua"),
                              ("sales", "inventory-2-outline-rounded", "Đơn bán", "1 đơn chờ bạn"), ("saved", "favorite-outline-rounded", "Đã lưu", "12 tin"),
                              ("rep", "military-tech-outline-rounded", "Điểm uy tín", "Xuất sắc · 4,9"), ("plans", "workspace-premium-outline-rounded", "Gói người bán", "Cơ bản · miễn phí"),
                              ("settings", "settings-outline-rounded", "Cài đặt", "Thông báo, khu vực")])
    rows = "".join(my_row(*l) for l in MY_LISTINGS)
    theme = "".join(f'<span class="flex h-10 {"flex-[1.6]" if t == "Theo hệ thống" else "flex-1"} items-center justify-center gap-1 whitespace-nowrap text-label-l {"bg-secondary-container text-on-secondary-container" if t == "Theo hệ thống" else "bg-surface-container-high text-on-surface-variant"}">'
                    f'{icon("check-rounded", 16) if t == "Theo hệ thống" else ""}{t}</span>' for t in ["Theo hệ thống", "Sáng", "Tối"])
    todo = "".join(f'<li class="flex items-center gap-3 py-2.5">{icon(ic, 20, "text-on-surface-variant")}<span class="flex-1 text-body-m {"text-primary" if i == 0 else "text-on-surface"}">{t}</span>{icon("chevron-right-rounded", 20, "text-on-surface-variant")}</li>'
                   for i, (ic, t) in enumerate([("local-shipping-outline-rounded", "Thiết lập giao COD"), ("home-outline-rounded", "Địa chỉ nhận hàng"),
                                                ("edit-note-rounded", "Giới thiệu bản thân"), ("location-on-outline-rounded", "Khu vực bán")]))
    body = f"""<body>
<div class="min-h-screen bg-surface pb-2 font-sans text-on-surface">
  {nav_active(header(quick="always"), None)}
  <main class="mx-auto max-w-[1328px] px-6">
    <div class="mt-8 grid grid-cols-[1fr_400px] gap-8">
      <div class="min-w-0">
        <section class="relative overflow-hidden rounded-xl bg-secondary-container p-8">
          <div class="flex items-center gap-6">
            <div class="relative"><img src="{img(ME["photo"], 192, 192)}" alt="" class="h-24 w-24 rounded-full object-cover"><img src="{ART["tier_trusted"]}" alt="" class="absolute -bottom-1 -right-2 h-10 w-10"></div>
            <div class="min-w-0 flex-1">
              <h1 class="text-headline-m text-on-surface">{ME["name"]}</h1>
              <p class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-body-m text-on-secondary-container">
                <span class="flex items-center gap-1">{icon("star-rounded", 16)}4,8 · 27 đánh giá</span>
                <span class="flex items-center gap-1">{icon("location-on-outline-rounded", 16)}{ME["area"]}</span>
                <span class="flex items-center gap-1">{icon("verified-rounded", 16, "text-primary")}Đã xác minh số điện thoại</span>
              </p>
              <span class="mt-3 inline-flex items-center gap-1.5 rounded-full bg-surface-container-lowest px-3 py-1 text-label-l text-on-surface">{icon("military-tech-outline-rounded", 16, "text-primary")}Người bán tin cậy</span>
            </div>
            <div class="flex items-center gap-2 self-start">
              {a("my-page", "state flex h-11 items-center rounded-full border border-outline px-5 text-label-l text-on-surface", "Trang của bạn")}
              <button type="button" class="state grid h-11 w-11 place-items-center rounded-full border border-outline text-on-surface" aria-label="Chia sẻ">{icon("share-outline-rounded", 20)}</button>
            </div>
          </div>
          <div class="mt-7 grid grid-cols-4 gap-3">{"".join(f'<div class="rounded-lg bg-surface-container-lowest p-4"><p class="text-headline-s text-on-surface">{v}</p><p class="text-body-s text-on-surface-variant">{l}</p></div>' for v, l in [("27", "đã bán"), ("8 phút", "thường trả lời"), ("0", "ghi nhận bị từ chối · 90 ngày"), ("0/11", "COD bị từ chối nhận")])}</div>
        </section>

        <a id="waiting" href="#waiting" class="state mt-6 flex items-center gap-5 rounded-xl bg-surface-container-low p-5">
          <img src="{img("1580480055273-228ff5388ef8", 128, 128)}" alt="" class="h-16 w-16 rounded-lg object-cover">
          <span class="flex-1"><span class="block text-label-l uppercase tracking-[0.1em] text-on-surface-variant">Đang chờ bạn</span><span class="mt-1 block text-title-l text-primary">Tạo đơn cho Đức Huy</span><span class="block text-body-m text-on-surface-variant">Ghế xoay vải be chân gỗ · đã gửi yêu cầu COD</span></span>
          <span class="flex h-11 items-center gap-1 rounded-full bg-secondary-container px-5 text-label-l text-on-secondary-container">Mở Đơn bán{icon("arrow-forward-rounded", 18)}</span>
        </a>

        <section class="mt-10">
          <h2 class="text-display-s">Lối tắt</h2>
          <div class="mt-5 grid grid-cols-4 gap-3">{tiles}</div>
        </section>

        <section class="mt-10">
          <div class="flex items-end justify-between"><h2 class="text-display-s">Tin của bạn</h2>{a("all-listings", "text-label-l text-primary hover:underline", "Xem cả 7 tin")}</div>
          <ul class="mt-4 flex flex-col gap-1 rounded-xl bg-surface-container-low p-3">{rows}</ul>
        </section>
      </div>

      <aside class="flex flex-col gap-6 self-start">
        <a id="tasks" href="#tasks" class="block rounded-xl bg-surface-container-lowest p-6 shadow-float">
          <div class="flex items-center gap-4">{ring(2, 6)}<span class="flex-1"><span class="block text-title-l text-on-surface">Hoàn thiện hồ sơ</span><span class="block text-body-m text-on-surface-variant">Còn 4 bước</span></span></div>
          <ul class="mt-4 border-t border-outline-variant pt-2">{todo}</ul>
          <p class="mt-2 flex items-center gap-2 text-body-s text-on-surface-variant">{icon("check-circle-rounded", 16, "text-primary")}Đã xong: số điện thoại, ảnh đại diện</p>
        </a>

        <section>
          <div class="rounded-xl bg-primary-container p-6 text-on-primary-container">
            <div class="flex items-start justify-between gap-3">
              <div><p class="text-label-l uppercase tracking-[0.1em]">Giao COD</p><p class="mt-1 text-title-l text-white">Chưa liên kết bên vận chuyển</p></div>
              <img src="{ART["art_cod_ready"]}" alt="" class="-mr-3 -mt-3 h-24 w-24">
            </div>
            <p class="mt-2 text-body-m">Liên kết tài khoản GHTK hoặc GHN của bạn để nhận đơn COD.</p>
            <p class="mt-3 flex gap-2 text-body-m">{icon("payments-outline-rounded", 18, "mt-0.5")}<span>{MONEY["cod_seller"]}</span></p>
            <button type="button" class="state mt-5 h-11 w-full rounded-full bg-surface-container-lowest text-label-l text-primary">Thiết lập giao COD</button>
          </div>
        </section>

        <section>
          <h3 class="px-2 text-title-s text-on-surface-variant">Giao diện</h3>
          <div class="mt-2 rounded-xl bg-surface-container p-5">
            <p class="text-body-l text-on-surface">Giao diện tối</p>
            <div class="seg mt-3 flex gap-0.5">{theme}</div>
          </div>
        </section>

        <section>
          <h3 class="px-2 text-title-s text-on-surface-variant">Tài khoản</h3>
          <div class="grouped mt-2 flex flex-col gap-0.5">
            {setting_row("notifications-outline-rounded", "Thông báo")}
            {setting_row("workspace-premium-outline-rounded", "Gói người bán", "Cơ bản · miễn phí")}
            {setting_row("location-on-outline-rounded", "Khu vực", ME["area"])}
            {setting_row("lock-outline-rounded", "Bảo mật")}
            {setting_row("help-outline-rounded", "Trợ giúp và an toàn")}
          </div>
          <button type="button" class="state mt-3 flex h-14 w-full items-center gap-4 rounded-xl px-5 text-body-l text-error">{icon("logout-rounded", 22)}Đăng xuất</button>
        </section>
      </aside>
    </div>
  </main>
  {footer()}
</div>
</body>
</html>"""
    return head("Tôi · ShopNexus", PAGE_CSS) + body


# ------------------------------------------------------------ notifications --
TONES = {"offer": "bg-tertiary-fixed text-on-tertiary-fixed-variant", "deal": "bg-secondary-container text-on-secondary-container",
         "neutral": "bg-surface-container-high text-on-surface-variant"}
NOTES = [
    ("Hôm nay", [
        ("offer", "sell-outline-rounded", "<b class='font-medium'>Tuấn Kiệt</b> trả 4.900.000 ₫ cho iPhone 13 Pro 128GB", "10 phút", True, "1632661674596-df8be070a5c5", "Xem trong chat"),
        ("deal", "local-shipping-outline-rounded", "Shipper đang tới giao <b class='font-medium'>Sony WH-1000XM4</b>. " + MONEY["cod_buyer"], "32 phút", True, "1505740420928-5e560c06d30e", "Mở đơn COD"),
        ("deal", "inventory-2-outline-rounded", "<b class='font-medium'>Đức Huy</b> gửi yêu cầu COD cho Ghế xoay vải be. Tạo đơn trong Đơn bán.", "1 giờ", True, "1580480055273-228ff5388ef8", "Tạo đơn"),
        ("offer", "trending-down-rounded", "Máy ảnh Polaroid OneStep 2 bạn đã lưu giảm còn 1.590.000 ₫", "3 giờ", False, "1526170375885-4d8ecf77b99f", None),
    ]),
    ("Hôm qua", [
        ("deal", "handshake-outline-rounded", "<b class='font-medium'>Lan Anh</b> đồng ý giá 1.650.000 ₫ cho Ghế bành bọc vải", "20:14", False, "1586023492125-27b2c045efd7", None),
        ("neutral", "search-rounded", "12 tin mới khớp “laptop cũ cho sinh viên thiết kế”", "18:02", False, None, "Xem kết quả"),
        ("neutral", "star-outline-rounded", "<b class='font-medium'>Minh Thư</b> chấm bạn 5 sao cho Máy xay sinh tố 2L", "09:30", False, None, None),
    ]),
    ("Tuần này", [
        ("deal", "payments-outline-rounded", "GHTK đã chuyển 450.000 ₫ tiền đơn Máy xay sinh tố vào tài khoản ngân hàng bạn khai với GHTK", "Thứ Hai", False, None, None),
        ("neutral", "checklist-rounded", "Còn 4 bước để hoàn thiện hồ sơ", "Thứ Hai", False, None, "Xem"),
        ("neutral", "favorite-outline-rounded", "20 người đã lưu Fixie đen mờ size 50 của bạn", "Chủ nhật", False, "1593764592116-bfb2a97c642a", None),
    ]),
]


def note_row(tone, ic, text, when, unread, photo, action):
    thumb = f'<img src="{img(photo, 112, 112)}" alt="" class="h-14 w-14 shrink-0 rounded-lg object-cover">' if photo else ""
    act = f'<span class="mt-2 inline-flex h-8 items-center rounded-full border border-outline-variant px-3 text-label-l text-primary">{action}</span>' if action else ""
    dot = '<span class="block h-2.5 w-2.5 shrink-0 rounded-full bg-primary" aria-label="Chưa đọc"></span>' if unread else '<span class="block w-2.5 shrink-0"></span>'
    return f"""<li class="state flex items-start gap-4 rounded-lg p-4 {"bg-surface-container-low" if unread else ""}">
  <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full {TONES[tone]}">{icon(ic, 20)}</span>
  <div class="min-w-0 flex-1"><p class="text-body-l text-on-surface">{text}</p><p class="mt-0.5 text-body-s text-on-surface-variant">{when}</p>{act}</div>
  {thumb}
  <span class="self-center">{dot}</span>
</li>"""


def notifications():
    chips = "".join(f'<button type="button" class="state flex h-10 items-center gap-1.5 rounded-full px-4 text-label-l {"bg-secondary-container text-on-secondary-container" if i == 0 else "border border-outline-variant text-on-surface-variant"}">'
                    f'{icon("check-rounded", 18) if i == 0 else ""}{t}</button>' for i, t in enumerate(["Tất cả", "Giao dịch", "Giá và tin mới", "Tài khoản"]))
    groups = "".join(f'<section class="mt-8 first:mt-0"><h2 class="px-4 text-title-s text-on-surface-variant">{day}</h2><ul class="mt-2 flex flex-col gap-1">{"".join(note_row(*n) for n in items)}</ul></section>'
                     for day, items in NOTES)
    prefs = "".join(f'<li class="flex h-12 items-center justify-between text-body-m text-on-surface">{t}<span class="relative h-8 w-[52px] rounded-full {"bg-primary" if on else "border-2 border-outline bg-surface-container-highest"}"><span class="absolute top-1/2 -translate-y-1/2 rounded-full {"right-1 h-6 w-6 bg-on-primary" if on else "left-1.5 h-4 w-4 bg-outline"}"></span></span></li>'
                    for t, on in [("Trả giá và tin nhắn", True), ("Đơn COD", True), ("Giá giảm ở tin đã lưu", True), ("Tin mới khớp tìm kiếm", True), ("Gợi ý từ ShopNexus", False)])
    body = f"""<body>
<div class="min-h-screen bg-surface pb-2 font-sans text-on-surface">
  {nav_active(header(quick="always"), None)}
  <main class="mx-auto max-w-[1328px] px-6">
    <div class="mt-8 grid grid-cols-[1fr_380px] gap-8">
      <section class="min-w-0">
        <div class="flex items-end justify-between">
          <div><h1 class="text-display-s">Thông báo</h1><p class="mt-1 text-body-l text-on-surface-variant">3 chưa đọc</p></div>
          <button type="button" class="state flex h-11 items-center gap-2 rounded-full border border-outline-variant px-5 text-label-l text-primary">{icon("done-all-rounded", 20)}Đánh dấu đã đọc</button>
        </div>
        <div class="mt-6 flex flex-wrap gap-2">{chips}</div>
        <div class="mt-8 rounded-xl bg-surface-container-lowest p-4 shadow-float">{groups}</div>
      </section>
      <aside class="flex flex-col gap-6 self-start">
        <div class="relative overflow-hidden rounded-xl bg-secondary-container p-6">
          <img src="{ART2["art_notifications"]}" alt="" class="mx-auto h-[180px] w-[180px]">
          <p class="mt-2 text-center text-title-l text-on-surface">Không bỏ lỡ lời trả giá</p>
          <p class="mt-1 text-center text-body-m text-on-secondary-container">Bật thông báo trên trình duyệt hoặc tải app để nhận ngay khi có người trả giá.</p>
          <button type="button" class="state mt-5 h-11 w-full rounded-full bg-surface-container-lowest text-label-l text-primary">Bật thông báo trình duyệt</button>
        </div>
        <div class="rounded-xl bg-surface-container-low p-6">
          <h2 class="text-title-l">Nhận thông báo về</h2>
          <ul class="mt-2">{prefs}</ul>
        </div>
      </aside>
    </div>
  </main>
  {footer()}
</div>
</body>
</html>"""
    return head("Thông báo · ShopNexus", PAGE_CSS) + body


if __name__ == "__main__":
    for name, fn in [("login", login), ("account", account), ("notifications", notifications)]:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(fn())
        print("wrote", name)
