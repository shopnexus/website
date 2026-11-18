"""Orders and seller tools in J ("Kính mờ"): Đơn hàng, Đơn COD, Đơn bán, Tin của
bạn, Đã lưu and Thiết lập giao COD. Content and flow follow build_orders.py and
build_seller_tools.py (which these pages supersede); the dress is j_kit's.

    python3 tools/build_j_orders.py        (run from .superdesign/)

Pages under "Tôi" (Đơn hàng, Tin của bạn, Đã lưu, Thiết lập giao COD) carry the
account side nav; the two order screens carry breadcrumbs instead.
"""
import os
from html import escape

from build import OUT, a
from common import icon, img, split_price, where
from j_kit import ADDRESS_BOOK, ME, PANEL, account_nav, btn, crumbs, footer, header, page, page_title, phase_bar, phase_track, price, seg, switch

# ----------------------------------------------------------------- pieces --

FACE = {"Hoàng Nam": "1500648767791-00dcc994a43e", "Tuấn Kiệt": "1544723795-3fb6469f5b39", "Ngọc Hân": "1438761681033-6461ffad8d80",
        "Lan Anh": "1534528741775-53994a69daeb", "Quốc Bảo": "1507003211169-0a1dd7228f2d", "Gia Bảo": "1506794778202-cad84cf45f1d",
        "Đức Huy": "1500648767791-00dcc994a43e", "Minh Anh": "1544005313-94ddf0286df2", "Khánh Linh": ME["photo"]}

def face(name, size=20, ring=False):
    return (f'<img src="{img(FACE[name], size * 4, size * 4)}" alt="" class="shrink-0 rounded-full object-cover {"ring-2 ring-white" if ring else ""}" '
            f'style="width:{size}px;height:{size}px">')


def icon_btn(label, ic, cls="text-on-surface-variant"):
    return f'<button type="button" class="state grid h-9 w-9 shrink-0 place-items-center rounded-full {cls}" aria-label="{label}">{icon(ic, 20)}</button>'


def account_page(name, active, inner):
    body = f"""{header(active=None)}
<main class="mx-auto grid max-w-[1360px] grid-cols-[232px_minmax(0,1fr)] gap-8 px-8 pt-6">
  {account_nav(active)}
  <div class="min-w-0">{inner}</div>
</main>
{footer()}"""
    return page(f"{name} · ShopNexus", body)


def detail_page(name, inner):
    body = f"""{header(active=None)}
<main class="mx-auto max-w-[1360px] px-8 pt-5">{inner}</main>
{footer()}"""
    return page(f"{name} · ShopNexus", body)


def vnd(n):
    return f"{n:,}".replace(",", ".")


def amount(n, size="text-[44px] leading-[48px]"):
    return f'<span class="num font-semibold tighter ink {size}">{vnd(n)}</span><span class="ml-1 text-title-m text-on-surface-variant">₫</span>'


def radio(on):
    return (f'<span class="grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 {"border-primary" if on else "border-outline-variant bg-white"}">'
            + ('<span class="h-2.5 w-2.5 rounded-full bg-primary"></span>' if on else "") + "</span>")


def option(t, sub="", end="", on=False):
    """A radio row: white and outlined when picked, quiet otherwise."""
    sub_html = f'<span class="block text-body-s text-on-surface-variant">{sub}</span>' if sub else ""
    end_html = f'<span class="num shrink-0 text-title-s ink">{end}</span>' if end else ""
    look = "border-primary/40 bg-white ring-1 ring-primary/30" if on else "line bg-white/60 hover:bg-white"
    return f"""<label class="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-[16px] border px-3.5 py-2 {look}" role="radio" aria-checked="{str(on).lower()}">
  {radio(on)}<span class="min-w-0 flex-1"><span class="block text-body-m ink">{t}</span>{sub_html}</span>{end_html}
</label>"""


def list_row(ic, main, sub="", end=""):
    sub_html = f'<span class="block text-body-s text-on-surface-variant">{sub}</span>' if sub else ""
    return f"""<div class="flex min-h-[56px] items-center gap-3 py-2">
  <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface-container-low text-on-surface-variant">{icon(ic, 19)}</span>
  <span class="min-w-0 flex-1"><span class="block text-body-m ink">{main}</span>{sub_html}</span>{end}
</div>"""


def section_label(t, end=""):
    return f'<div class="mb-2 flex items-center justify-between"><h2 class="text-title-s ink">{t}</h2>{end}</div>'


# --------------------------------------------------------------- Đơn hàng --
# phase: the step in progress (4 = all done).
BUYING = [
    dict(photo="1510557880182-3d4d3cba35a5", title="iPhone X 64GB, pin 86%", who="Hoàng Nam", price=3_800_000, phase=2,
         line=("local-shipping-outline-rounded", "Chờ giao hàng"), when="GHTK · đến hôm nay"),
    dict(photo="1632661674596-df8be070a5c5", title="iPhone 13 Pro 128GB Xanh Sierra, pin 88%", who="Tuấn Kiệt", price=5_100_000, phase=1,
         line=("hourglass-top-rounded", "Chờ người bán tạo đơn"), when="Chốt giá 09:40"),
    dict(photo="1505740420928-5e560c06d30e", title="Tai nghe chống ồn Sony WH-1000XM4, fullbox", who="Quốc Bảo", price=3_100_000, phase=3,
         line=("package-2-outline-rounded", "Đã nhận hàng · 12/10"), action="stars", when="Nhận 12/10"),
    dict(photo="1526170375885-4d8ecf77b99f", title="Máy ảnh Polaroid OneStep 2, tặng 1 hộp film", who="Lan Anh", price=1_650_000, phase=4,
         line=("star-rounded", "5 sao cho Lan Anh"), filled=True, when="Xong 02/10"),
    dict(photo="1580480055273-228ff5388ef8", title="Ghế xoay vải be chân gỗ, ngồi êm", who="Gia Bảo", price=900_000, phase=2,
         line=("undo-rounded", "Giao không thành"), muted=True, when="28/09"),
    dict(photo="1507035895480-2b3156c31fc8", title="Xe đạp fixed gear khung thép, vừa thay lốp", who="Ngọc Hân", price=2_200_000, phase=1,
         line=("cancel-outline-rounded", "Đã hủy đơn"), muted=True, when="21/09"),
]


def order_row(o):
    if o.get("action") == "stars":
        act = ('<div class="flex" role="radiogroup" aria-label="Đánh giá ' + o["who"] + '">' + "".join(
            f'<button type="button" class="state grid h-8 w-8 place-items-center rounded-full text-outline-variant" aria-label="{n} sao">{icon("star-rounded", 22)}</button>'
            for n in range(1, 6)) + "</div>")
    else:
        act = icon("chevron-right-rounded", 22, "text-on-surface-variant")
    ic, text = o["line"]
    active = not o.get("muted") and o["phase"] < 3
    status = (f'<span class="flex items-center gap-1.5 rounded-full {"bg-secondary-container text-on-secondary-container" if active else "text-on-surface-variant"} px-2.5 py-1 text-label-m">'
              f'{icon(ic, 15, "text-[#E0A23B]" if o.get("filled") else "")}{text}</span>')
    return f"""<article class="card flex cursor-pointer items-center gap-4 rounded-[22px] border line bg-white p-2 pr-4 {"opacity-60" if o.get("muted") else ""}">
  <img src="{img(o["photo"], 200, 200)}" alt="" class="h-[84px] w-[84px] shrink-0 rounded-[16px] object-cover">
  <div class="min-w-0 flex-1">
    <div class="flex items-baseline gap-4">
      <h3 class="min-w-0 flex-1 truncate text-title-s ink">{escape(o["title"])}</h3>
      {price(f"{vnd(o['price'])} ₫", "text-[16px] leading-6")}
    </div>
    <p class="mt-0.5 flex items-center gap-1.5 text-body-s text-on-surface-variant">{face(o["who"], 18)}{o["who"]}<span>·</span>COD<span>·</span>{o["when"]}</p>
    <div class="mt-2 flex h-8 items-center gap-3">{phase_bar(o["phase"])}{status}<span class="flex-1"></span>{act}</div>
  </div>
</article>"""


def orders():
    slots = "".join(f'<span class="h-2 flex-1 rounded-full {"bg-gradient-to-r from-[#066A61] to-[#5CC2B4]" if i < 2 else "bg-surface-container-high"}"></span>' for i in range(5))
    month = "".join(f'<div class="flex items-center justify-between py-2 {"border-t line" if i else ""}"><span class="text-body-m text-on-surface-variant">{k}</span><span class="num text-title-s ink">{v}</span></div>'
                    for i, (k, v) in enumerate([("Đơn đã nhận", "3"), ("Tiền hàng đã trả", "9.150.000 ₫"), ("Phí ship", "64.000 ₫")]))
    inner = f"""
  {page_title("Đơn hàng", "6 đơn mua · 3 đơn bán", seg(["Mua · 6", "Bán · 3"], 0, "bg-white/70 glass-edge"))}
  <div class="mt-5 flex items-center gap-2">
    {seg(["Tất cả", "Đang mở · 2", "Chờ đánh giá · 1", "Đã xong", "Không thành"], 0, "bg-black/[.04]", "text-label-m")}
  </div>
  <div class="mt-4 grid grid-cols-[minmax(0,1fr)_300px] gap-6">
    <section class="flex flex-col gap-3">{"".join(order_row(o) for o in BUYING)}</section>
    <aside class="sticky top-[84px] flex flex-col gap-4 self-start">
      <div class="{PANEL} p-5">
        <p class="text-title-s ink">Đơn COD đang mở</p>
        <p class="mt-2"><span class="num ink text-[44px] font-semibold leading-[48px] tighter">2</span><span class="text-title-l text-on-surface-variant">/5</span></p>
        <div class="mt-3 flex gap-1.5">{slots}</div>
      </div>
      <div class="{PANEL} px-5 py-3">
        <p class="py-1 text-label-m text-on-surface-variant">Tháng 10</p>
        {month}
      </div>
      <div class="glass glass-edge flex items-center gap-3 rounded-[24px] p-4">
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#066A61] to-[#5CC2B4] text-white">{icon("storefront-outline-rounded", 20)}</span>
        <p class="min-w-0 flex-1 text-body-m ink"><b class="font-semibold">1 đơn bán</b> chờ bạn tạo đơn</p>
        {a("to-ship", "state grid h-9 w-9 place-items-center rounded-full bg-white text-primary", icon("arrow-forward-rounded", 18))}
      </div>
    </aside>
  </div>"""
    return account_page("Đơn hàng", "orders", inner)


# ---------------------------------------------------------------- Đơn COD --
CODE = "S1.A1.17373471"
COPY = icon_btn("Sao chép", "content-copy-outline-rounded")


def summary_card(photo, item, item_price, person, person_sub, chat_id, total_label, total, lines, extra="", actions=""):
    """The sticky card on the right of an order screen: the item and the other
    person, the sum the buyer hands the shipper, how it splits."""
    rows = "".join(f'<p class="flex justify-between gap-3"><span class="text-on-surface-variant">{k}</span><span class="num flex items-center gap-1.5 {cls}">{v}</span></p>'
                   for k, v, cls in lines)
    return f"""<aside class="sticky top-[84px] self-start overflow-hidden rounded-[28px] border line bg-white soft">
  <div class="flex items-center gap-3 p-4">
    <img src="{img(photo, 160, 160)}" alt="" class="h-14 w-14 shrink-0 rounded-[14px] object-cover">
    <div class="min-w-0 flex-1"><p class="truncate text-title-s ink">{item}</p><p class="num text-body-s text-on-surface-variant">{item_price}</p></div>
  </div>
  <div class="mx-4 flex items-center gap-3 rounded-[18px] bg-surface-container-low p-2.5">
    {face(person, 36)}
    <div class="min-w-0 flex-1"><p class="text-title-s ink">{person}</p><p class="flex items-center gap-1 text-body-s text-on-surface-variant">{person_sub}</p></div>
    {a(chat_id, "state flex h-9 items-center gap-1.5 rounded-full bg-white px-3 text-label-l text-primary", icon("chat-outline-rounded", 17) + "Nhắn")}
  </div>
  <div class="p-5">
    <p class="text-body-m text-on-surface-variant">{total_label}</p>
    <p class="mt-0.5">{amount(total)}</p>
    <div class="mt-3 flex flex-col gap-1.5 border-b line pb-4 text-body-m">{rows}</div>
    {extra}
  </div>
  {f'<div class="flex items-center gap-2 border-t line bg-surface-container-low/60 p-3">{actions}</div>' if actions else ""}
</aside>"""


def hero_card(photo, heading, chips, end):
    chip_html = "".join(f'<span class="flex items-center gap-1.5 rounded-full bg-surface-container-low py-1 pl-2.5 pr-1 text-label-m ink">{c}</span>' for c in chips)
    return f"""<section class="glass glass-edge soft mt-3 flex items-center gap-5 rounded-[28px] p-3 pr-8">
  <img src="{img(photo, 240, 240)}" alt="" class="h-[104px] w-[104px] shrink-0 rounded-[20px] object-cover">
  <div class="min-w-0 flex-1">
    <h1 class="text-[34px] font-semibold leading-[40px] tighter ink">{heading}</h1>
    <div class="mt-2 flex flex-wrap items-center gap-2">{chip_html}</div>
  </div>
  {end}
</section>"""


def order():
    events = [("Đang giao hàng", "Shipper Văn Tài · 09•• ••• 117", "Hôm nay 08:05", True),
              ("Đến kho Bình Thạnh", "GHTK", "Hôm qua 21:10", False),
              ("Đã lấy hàng", "GHTK", "Hôm qua 16:40", False),
              ("Người bán tạo đơn", "Hoàng Nam · GHTK Giao nhanh", "Hôm qua 10:02", False),
              ("Chốt giá 3.800.000 ₫", "Từ 4.000.000 ₫, sau 3 lần trả giá", "Hôm qua 09:15", False)]
    ev = "".join(f"""<li class="relative flex gap-3 pb-4 last:pb-0">
  {'' if i == len(events) - 1 else '<span class="absolute left-[7px] top-5 bottom-0 w-px bg-black/10"></span>'}
  <span class="relative mt-1 h-[15px] w-[15px] shrink-0 rounded-full {"bg-primary ring-4 ring-primary/15" if now else "border-2 border-outline-variant bg-white"}"></span>
  <span class="min-w-0 flex-1"><span class="block text-body-m {"font-medium ink" if now else "ink"}">{t}</span><span class="block text-body-s text-on-surface-variant">{s}</span></span>
  <span class="num shrink-0 text-body-s text-on-surface-variant">{w}</span>
</li>""" for i, (t, s, w, now) in enumerate(events))
    track = a("ghtk-track", "state flex h-9 items-center rounded-full px-3 text-label-l text-primary", "Tra mã", f"https://i.ghtk.vn/{CODE}")
    left = f"""<div class="flex min-w-0 flex-col gap-4">
  <div class="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-4">
    <section class="{PANEL} p-5">
      {section_label("Hành trình", '<span class="flex items-center gap-1.5 text-label-m text-primary"><span class="h-1.5 w-1.5 rounded-full bg-primary"></span>GHTK cập nhật 08:05</span>')}
      <ol class="mt-3">{ev}</ol>
    </section>
    <div class="flex flex-col gap-4">
      <section class="{PANEL} px-5 py-3">
        {section_label("Vận đơn")}
        {list_row("receipt-long-outline-rounded", "GHTK · " + CODE, "Giao nhanh · 1–2 ngày", track + COPY)}
        {list_row("tag-rounded", "SNX 5521 0937", "Mã đơn ShopNexus", COPY)}
      </section>
      <section class="{PANEL} px-5 py-3">
        {section_label("Giao đến")}
        {list_row("location-on-outline-rounded", "12 Nguyễn Văn Đậu, Phường Bình Thạnh, TP.HCM", "Khánh Linh · 09•• ••• 812", COPY)}
        {list_row("schedule-outline-rounded", "Dự kiến hôm nay, 14:00–18:00", "Shipper gọi trước khi tới")}
      </section>
    </div>
  </div>
</div>"""
    right = summary_card(
        "1510557880182-3d4d3cba35a5", "iPhone X 64GB, pin 86%", "Giá chốt 3.800.000 ₫", "Hoàng Nam",
        f'4,7{icon("star-rounded", 13, "text-[#E0A23B]")}· 12 đã bán', "chat-seller", "Trả khi nhận", 3_822_000,
        [("Tiền hàng", icon("handshake-outline-rounded", 16) + "3.800.000 ₫", "text-tertiary"), ("Phí ship · GHTK Giao nhanh", "22.000 ₫", "ink")],
        actions=btn("Báo chưa nhận", "help-outline-rounded", "ghost") + btn("Đã nhận hàng", "package-2-outline-rounded", "primary", "h-11 flex-1"))
    inner = f"""
  {crumbs("Tôi", "Đơn hàng", "iPhone X 64GB")}
  {hero_card("1510557880182-3d4d3cba35a5", "Chờ giao hàng",
             [icon("local-shipping-outline-rounded", 15) + "GHTK · " + CODE + COPY.replace("h-9 w-9", "h-6 w-6"), icon("schedule-outline-rounded", 15) + "Dự kiến hôm nay&nbsp;&nbsp;"],
             phase_track(2, ["Hôm qua 09:15", "Hôm qua 10:02", "Hôm nay", ""]))}
  <div class="mt-5 grid grid-cols-[minmax(0,1fr)_400px] gap-6">{left}{right}</div>"""
    return detail_page("Đơn COD", inner)


# ---------------------------------------------------------------- Đơn bán --
def ship():
    carriers = seg(["GHTK", "GHN", "Tự gửi"], 0, "bg-black/[.04]")
    form = f"""<div class="grid grid-cols-2 gap-x-6 gap-y-5">
  <div>
    <p class="mb-2 text-label-l ink">Khối lượng</p>
    <label class="flex h-12 items-center gap-2 rounded-[16px] border line bg-white px-4 ring-primary/30 focus-within:ring-2">
      <span class="num flex-1 text-body-l ink">2</span><span class="text-body-m text-on-surface-variant">kg</span></label>
    <p class="mt-1.5 text-body-s text-on-surface-variant">Ghế đôn gói thùng thường nặng 1,5–2,5 kg</p>
  </div>
  <div>
    <p class="mb-2 text-label-l ink">Dịch vụ</p>
    <div class="flex flex-col gap-2">{option("Giao nhanh", "1–2 ngày", "22.000 ₫", True)}{option("Tiết kiệm", "2–4 ngày", "16.000 ₫")}</div>
  </div>
  <div>
    <p class="mb-2 text-label-l ink">Cách lấy hàng</p>
    <div class="flex flex-col gap-2">{option("Lấy tại nhà", "Shipper tới lấy", on=True)}{option("Gửi tại bưu cục", "Bạn mang ra bưu cục gần nhất")}
      <p class="flex min-h-[52px] items-center gap-2 rounded-[16px] bg-surface-container-low px-3.5 text-body-s text-on-surface-variant">{icon("schedule-outline-rounded", 18, "shrink-0")}Tạo trước 11:00, shipper lấy trong chiều nay</p></div>
  </div>
  <div>
    <p class="mb-2 flex items-center justify-between text-label-l ink">Lấy hàng tại<span class="text-body-s font-normal text-on-surface-variant">Kho trên GHTK · địa chỉ của bạn</span></p>
    <div class="flex flex-col gap-2">{option("Kho Bình Thạnh", "12 Nơ Trang Long, Phường Bình Thạnh", on=True)}{option("Nhà", "18 Đinh Bộ Lĩnh, Phường Bình Thạnh")}{option("Công ty", "60 Nguyễn Đình Chiểu, Phường Sài Gòn")}</div>
  </div>
</div>"""
    left = f"""<div class="flex min-w-0 flex-col gap-4">
  <section class="{PANEL} px-5 py-3">
    {section_label("Giao đến")}
    {list_row("location-on-outline-rounded", "45 Phan Xích Long, Phường Cầu Kiệu, TP.HCM", "Đức Huy · 09•• ••• 345", icon_btn("Sao chép", "content-copy-outline-rounded"))}
  </section>
  <section class="{PANEL} p-5">
    <div class="flex items-center justify-between">
      <h2 class="text-title-s ink">Gửi bằng</h2>
      {btn("Hãng của bạn chưa có?", "add-business-outline-rounded", "ghost", "-mr-2")}
    </div>
    <div class="mt-2 flex items-center gap-3">{carriers}<p class="text-body-s text-on-surface-variant">Tạo vận đơn trên tài khoản GHTK S55163 của bạn</p></div>
    <div class="mt-5 border-t line pt-5">{form}</div>
  </section>
</div>"""
    cod_to = f"""<div class="mt-4 flex items-center gap-3 rounded-[16px] bg-surface-container-low px-3.5 py-3">
  {icon("account-balance-outline-rounded", 20, "text-primary")}
  <span class="min-w-0 flex-1"><span class="block text-body-m ink">Tiền COD về tài khoản GHTK</span><span class="block text-body-s text-on-surface-variant">GHTK S55163 · đứng tên bạn</span></span>
</div>"""
    right = summary_card(
        "1503602642458-232111445657", "Ghế đôn gỗ cao", "Giá chốt 350.000 ₫", "Đức Huy", "Phường Cầu Kiệu · giao COD", "chat-buyer",
        "Người mua trả shipper", 372_000,
        [("Tiền hàng COD", icon("handshake-outline-rounded", 16) + "350.000 ₫", "text-tertiary"), ("Phí ship người mua trả", "22.000 ₫", "ink")],
        extra=cod_to,
        actions=f'<span class="flex items-center gap-1.5 pl-2 text-body-s text-on-surface-variant">{icon("tag-rounded", 15)}SNX 8841 2207</span><span class="flex-1"></span>'
                + btn("Tạo đơn", "receipt-long-outline-rounded", "primary", "h-11 px-6"))
    inner = f"""
  {crumbs("Tôi", "Đơn hàng", "Bán", "Ghế đôn gỗ cao")}
  {hero_card("1503602642458-232111445657", "Tạo đơn cho Đức Huy",
             [icon("schedule-outline-rounded", 15) + "Chờ từ 09:12&nbsp;&nbsp;", icon("handshake-outline-rounded", 15) + "Chốt 350.000 ₫&nbsp;&nbsp;"],
             '<div class="flex items-center gap-6">' + phase_track(1, ["09:12", "", "", ""]) + btn("Hủy đơn", None, "line") + "</div>")}
  <div class="mt-5 grid grid-cols-[minmax(0,1fr)_400px] gap-6">{left}{right}</div>"""
    return detail_page("Đơn bán", inner)


# ------------------------------------------------------------ Tin của bạn --
ON_SALE = [
    dict(photo="1510915361894-db8b60106cb1", title="Đàn guitar acoustic Yamaha F310, kèm bao", price="1.900.000 ₫", stats=(86, 2, 5, "12 ngày"), extra="price"),
    dict(photo="1503602642458-232111445657", title="Ghế đôn gỗ thông cao 45 cm", price="350.000 ₫", stats=(24, 1, 1, "5 ngày"),
         extra=("receipt-long-outline-rounded", "Chờ bạn tạo đơn", True)),
    dict(photo="1505740420928-5e560c06d30e", title="Tai nghe chống ồn Sony WH-1000XM4, fullbox", price="3.200.000 ₫", stats=(58, 3, 2, "9 ngày"),
         extra=("local-shipping-outline-rounded", "Đang giao · Minh Thư", False)),
    dict(photo="1510557880182-3d4d3cba35a5", title="iPhone X 64GB, pin 86%, máy zin chưa sửa", price="3.900.000 ₫", stats=(86, 4, 7, "6 ngày"), extra=None, menu=True),
    dict(photo="1586023492125-27b2c045efd7", title="Ghế bành bọc vải vàng mù tạt, khung gỗ sồi", price="1.600.000 ₫", stats=(31, 0, 2, "20 ngày"), extra="hidden"),
]
DRAFTS_ = [
    dict(photo="1611186871348-b1ce696e52c9", title="MacBook Air M1 8/256GB", line="4 ảnh · 11.500.000 ₫", label=("schedule-outline-rounded", "Còn 2 ngày")),
    dict(photo="1603891128711-11b4b03bb138", title="iPhone 11 64GB Trắng, máy zin", line="3 ảnh · chưa có giá", label=("cloud-off-outline-rounded", "Chưa đồng bộ")),
]
MENU = [("edit-outline-rounded", "Sửa tin"), ("sell-outline-rounded", "Đánh dấu đã bán"), ("visibility-off-outline-rounded", "Ẩn tin"), ("delete-outline-rounded", "Xóa tin")]


def card_menu():
    items = "".join(f'<li class="flex h-11 items-center gap-3 rounded-[12px] px-3 text-body-m {"bg-black/[.05]" if i == 1 else ""} {"text-error" if i == 3 else "ink"}">'
                    f'{icon(ic, 20, "" if i == 3 else "text-on-surface-variant")}{t}</li>' for i, (ic, t) in enumerate(MENU))
    return f'<ul role="menu" class="glass glass-edge absolute right-3 top-14 z-20 w-[220px] rounded-[18px] p-1.5 shadow-float">{items}</ul>'


def listing_row(it):
    v, c, s, d = it["stats"]
    hidden = it["extra"] == "hidden"
    stats = "".join(f'<span class="flex items-center gap-1" title="{t}">{icon(ic, 15)}<span class="num">{n}</span></span>' for ic, n, t in
                    [("visibility-outline-rounded", v, "Lượt xem"), ("chat-outline-rounded", c, "Người hỏi"),
                     ("favorite-outline-rounded", s, "Lượt lưu"), ("schedule-outline-rounded", d, "Đã đăng")])
    extra = ""
    if it["extra"] == "price":
        extra = btn("Giảm còn 1,7 tr", "trending-down-rounded", "tonal", "h-9")
    elif hidden:
        extra = f'<span class="flex items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1.5 text-label-m text-on-surface-variant">{icon("visibility-off-outline-rounded", 16)}Đã ẩn</span>'
    elif it["extra"]:
        ic, label, todo = it["extra"]
        look = "bg-primary text-on-primary" if todo else "bg-secondary-container text-on-secondary-container"
        extra = a("order", f"state flex h-9 items-center gap-2 rounded-full pl-3 pr-2 text-label-l {look}", icon(ic, 17) + label + icon("chevron-right-rounded", 18))
    dim = "opacity-50" if hidden else ""
    return f"""<article class="card relative flex items-center gap-4 rounded-[22px] border line bg-white p-2 pr-2">
  <img src="{img(it["photo"], 160, 160)}" alt="{escape(it["title"])}" class="h-16 w-16 shrink-0 rounded-[16px] object-cover {dim}">
  <div class="min-w-0 flex-1 {dim}">
    <h3 class="truncate text-title-s ink">{escape(it["title"])}</h3>
    {f'<p class="flex items-center gap-1 text-label-m text-tertiary">{icon("auto-awesome-rounded", 13)}Cao hơn 12% so với máy cùng đời</p>' if it["extra"] == "price" else ""}
    <div class="mt-0.5 flex items-center gap-3 overflow-hidden whitespace-nowrap">{price(it["price"], "text-[15px] leading-5")}<span class="h-3 border-l border-black/10"></span><span class="flex items-center gap-3 text-body-s text-on-surface-variant">{stats}</span></div>
  </div>
  <div class="flex shrink-0 items-center gap-2">{extra}</div>
  {icon_btn("Tùy chọn cho " + escape(it["title"]), "more-vert")}
  {card_menu() if it.get("menu") else ""}
</article>"""


def stat_tile(ic, n, label, delta=None):
    d = f'<span class="num rounded-full bg-secondary-container px-2 py-0.5 text-label-s text-on-secondary-container">{delta}</span>' if delta else ""
    return f"""<div class="{PANEL} flex items-center gap-3 p-4">
  <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#066A61] to-[#5CC2B4] text-white">{icon(ic, 20)}</span>
  <div class="min-w-0 flex-1"><p class="flex items-center gap-2"><span class="num text-[24px] font-semibold leading-7 tighter ink">{n}</span>{d}</p><p class="text-body-s text-on-surface-variant">{label}</p></div>
</div>"""


def rating(rated):
    if rated is None:
        return '<span class="shrink-0 text-body-s text-on-surface-variant">Ngoài app</span>'
    if rated:
        return f'<span class="flex shrink-0 items-center gap-0.5 text-label-m ink">{icon("star-rounded", 15, "text-[#E0A23B]")}5</span>'
    return f'<span class="flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full bg-surface-container-low px-2 py-0.5 text-label-s text-on-surface-variant">{icon("hourglass-empty-rounded", 12)}Chờ</span>'


def my_listings():
    tiles = (stat_tile("visibility-outline-rounded", "214", "Lượt xem · 7 ngày", "+18%") + stat_tile("chat-outline-rounded", "9", "Người hỏi · 7 ngày", "+3")
             + stat_tile("favorite-outline-rounded", "17", "Lượt lưu · 7 ngày") + stat_tile("payments-outline-rounded", "4,2 tr", "Đã bán · tháng 10"))
    drafts = "".join(f"""<li class="flex items-center gap-3 py-2.5 {"border-t line" if i else ""}">
  <img src="{img(d["photo"], 120, 120)}" alt="" class="h-12 w-12 shrink-0 rounded-[12px] object-cover">
  <div class="min-w-0 flex-1"><p class="truncate text-body-m ink">{d["title"]}</p>
    <p class="truncate text-body-s text-on-surface-variant">{d["line"]}</p>
    <p class="flex items-center gap-1 whitespace-nowrap text-label-s text-tertiary">{icon(d["label"][0], 12)}{d["label"][1]}</p></div>
  {btn("Tiếp tục", None, "tonal", "h-8 px-3")}</li>""" for i, d in enumerate(DRAFTS_))
    sold = "".join(f"""<li class="flex items-center gap-3 py-2.5 {"border-t line" if i else ""}">
  <img src="{img(p, 120, 120)}" alt="" class="h-12 w-12 shrink-0 rounded-[12px] object-cover">
  <div class="min-w-0 flex-1"><p class="truncate text-body-m ink">{t}</p>
    <p class="flex items-center gap-1.5 text-body-s text-on-surface-variant">{face(who, 16) if who in FACE else ""}<span class="truncate">{who} · {when}</span></p></div>
  {rating(rated)}</li>"""
                   for i, (p, t, who, when, rated) in enumerate([
                       ("1526170375885-4d8ecf77b99f", "Máy ảnh Polaroid OneStep 2", "Minh Anh", "Thứ Hai", True),
                       ("1593764592116-bfb2a97c642a", "Fixie đen mờ size 50", "Quốc Bảo", "Hôm nay", False),
                       ("1585515320310-259814833e62", "Máy xay sinh tố 2L", "Người ngoài ShopNexus", "28/10", None)]))
    inner = f"""
  {page_title("Tin của bạn", f"{len(ON_SALE)} tin đang bán · 2 nháp · 14 tin đã bán", btn("Quay video", "videocam-outline-rounded", "line") + btn("Chụp ảnh đăng tin", "photo-camera-outline-rounded", "ink"))}
  <div class="mt-5 grid grid-cols-4 gap-3">{tiles}</div>
  <div class="mt-5 grid grid-cols-[minmax(0,1fr)_320px] gap-6">
    <section class="min-w-0">
      <div class="flex items-center justify-between">
        {seg(["Đang bán · 5", "Nháp · 2", "Đã bán · 14"], 0, "bg-black/[.04]")}
        {seg(["Mới đăng", "Nhiều người hỏi"], 0, "bg-black/[.04]", "text-label-m")}
      </div>
      <div class="mt-3 flex flex-col gap-2.5">{"".join(listing_row(it) for it in ON_SALE)}</div>
    </section>
    <aside class="flex min-w-0 flex-col gap-4 self-start">
      <div class="{PANEL} px-5 py-4">{section_label("Nháp", '<span class="text-body-s text-on-surface-variant">Tự xóa sau 30 ngày</span>')}<ul>{drafts}</ul></div>
      <div class="{PANEL} px-5 py-4">{section_label("Vừa bán", a("sold-all", "text-label-l text-primary hover:underline", "Xem 14 tin"))}<ul>{sold}</ul></div>
    </aside>
  </div>"""
    return account_page("Tin của bạn", "listings", inner)


# ----------------------------------------------------------------- Đã lưu --
# (photo, price, title, condition, km, area, change): change is ("cut", "300k"), ("ai", judgment), "sold" or None.
SAVED_GROUPS = [
    ("Xe đạp", [
        ("1505705694340-019e1e335916", "2.100.000 ₫", "Xe đạp single speed trắng size 52", "Như mới", "1,2 km", "Bình Thạnh", ("cut", "Giảm 300k")),
        ("1529422643029-d4585747aaf2", "2.900.000 ₫", "Giant Escape 3 size M", "Đã dùng", "2,5 km", "Q.3", ("ai", "Rẻ hơn 9%")),
        ("1571068316344-75bc76f77890", "2.600.000 ₫", "Xe đạp cổ điển khung thép, yên da", "Đã dùng", "3,8 km", "Q.2", "sold"),
    ]),
    ("Nội thất", [
        ("1586023492125-27b2c045efd7", "1.600.000 ₫", "Ghế bành bọc vải vàng mù tạt", "Đã dùng", "5,5 km", "Q.2", None),
        ("1580480055273-228ff5388ef8", "950.000 ₫", "Ghế xoay vải be chân gỗ", "Như mới", "3,9 km", "Bình Thạnh", None),
    ]),
    ("Điện thoại", [
        ("1632661674596-df8be070a5c5", "5.200.000 ₫", "iPhone 13 Pro 128GB", "Như mới", "1,6 km", "Phú Nhuận", ("cut", "Giảm 400k")),
        ("1616348436168-de43ad0db179", "6.900.000 ₫", "iPhone 12 128GB", "Đã dùng", "0,8 km", "Q.1", None),
        ("1610945415295-d9bbf067e59c", "7.500.000 ₫", "Galaxy S21 Ultra 256GB", "Đã dùng", "5,1 km", "Tân Bình", None),
    ]),
    ("Đồ điện tử", [
        ("1526170375885-4d8ecf77b99f", "1.750.000 ₫", "Máy ảnh Polaroid OneStep 2", "Như mới", "1,8 km", "Phú Nhuận", None),
        ("1546868871-7041f2a55e12", "4.500.000 ₫", "Apple Watch Series 7 45mm", "Đã dùng", "1,6 km", "Q.3", None),
        ("1516035069371-29a1b244cc32", "26,5 tr ₫", "Sony A7 III kèm lens 28-70 và 50mm f/1.8", "Đã dùng", "1.140 km", "Hà Nội", None),
    ]),
    ("Thời trang", [
        ("1542291026-7eec264c27ff", "1.290.000 ₫", "Giày Nike Free RN size 42", "Mới", "2,2 km", "Q.10", None),
        ("1460353581641-37baddab0fa2", "850.000 ₫", "Giày Nike Air Max size 41", "Đã dùng", "4,4 km", "Q.5", ("cut", "Giảm 100k")),
    ]),
]


def saved_card(photo, p, t, cond, km, area, change):
    sold = change == "sold"
    if sold:
        badge = '<span class="absolute left-2 top-2 rounded-full bg-black/70 px-2.5 py-0.5 text-label-m text-white backdrop-blur">Đã bán</span>'
        foot = a("similar", "mt-1 inline-flex items-center gap-1 text-label-l text-primary hover:underline", icon("search-rounded", 15) + "Xem đồ tương tự")
    elif isinstance(change, tuple):
        kind, v = change
        badge = (f'<span class="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-label-m text-tertiary backdrop-blur">'
                 f'{icon("arrow-downward-rounded" if kind == "cut" else "auto-awesome-rounded", 13)}{v}</span>')
        foot = ""
    else:
        badge, foot = "", ""
    return f"""<article class="card min-w-0 rounded-[22px] border line bg-white p-2">
  <div class="relative overflow-hidden rounded-[16px] bg-surface-container-high" style="aspect-ratio: 1 / 1">
    <img src="{img(photo, 400, 400)}" alt="{escape(t)}" class="h-full w-full object-cover {"grayscale opacity-60" if sold else ""}">
    <button type="button" class="state absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/85 text-primary backdrop-blur" aria-label="Bỏ lưu">{icon("favorite-rounded", 18)}</button>
    {badge}
  </div>
  <div class="px-1.5 pb-1 pt-2">
    {price(p, "text-[16px] leading-6") if not sold else f'<span class="num text-[16px] font-semibold leading-6 text-on-surface-variant line-through">{p}</span>'}
    <h3 class="line-clamp-1 text-body-m {"text-on-surface-variant" if sold else "ink"}">{escape(t)}</h3>
    <p class="text-body-s text-on-surface-variant">{cond} · {where(km, area)}</p>
    {foot}
  </div>
</article>"""


def compare_panel():
    cols = [("1632661674596-df8be070a5c5", "iPhone 13 Pro", "5,2 tr", "Như mới", "88%", "1,6 km", "Xuất sắc"),
            ("1616348436168-de43ad0db179", "iPhone 12", "6,9 tr", "Đã dùng", "84%", "0,8 km", "Tin cậy"),
            ("1610945415295-d9bbf067e59c", "Galaxy S21 Ultra", "7,5 tr", "Đã dùng", "81%", "5,1 km", "Mới")]
    best = {"Giá": 0, "Tình trạng": 0, "Pin": 0, "Cách bạn": 1, "Người bán": 0}
    rows = [("Giá", 2), ("Tình trạng", 3), ("Pin", 4), ("Cách bạn", 5), ("Người bán", 6)]
    head_html = "".join(f'<th class="px-1 pb-1.5 text-left align-bottom font-normal"><img src="{img(c[0], 80, 80)}" alt="" class="h-7 w-7 rounded-[8px] object-cover"><span class="mt-1 block text-label-m leading-4 ink">{c[1]}</span></th>' for c in cols)
    body_html = "".join(
        f'<tr class="border-t line"><td class="py-1.5 pr-1 text-body-s text-on-surface-variant">{label}</td>'
        + "".join(f'<td class="px-1 py-1.5 text-body-s"><span class="num inline-flex items-center gap-1.5 whitespace-nowrap {"rounded-full bg-secondary-container px-2 text-on-secondary-container" if best.get(label) == j else "ink"}">{c[k]}</span></td>'
                  for j, c in enumerate(cols)) + "</tr>" for label, k in rows)
    return f"""<section class="col-span-2 flex flex-col rounded-[24px] border line bg-white p-4">
  <h2 class="text-title-s ink">So sánh 3 điện thoại</h2>
  <table class="mt-2 w-full"><thead><tr><th class="w-[72px]"></th>{head_html}</tr></thead><tbody>{body_html}</tbody></table>
  <div class="mt-3 flex items-center gap-3 rounded-[18px] bg-gradient-to-br from-[#E4F3F0] to-[#FFF1EB] p-3">
    <p class="min-w-0 flex-1 text-body-s text-on-surface-variant"><b class="flex items-center gap-1 text-label-l text-on-surface">{icon("auto-awesome-rounded", 15, "text-primary")}iPhone 13 Pro đáng tiền nhất</b>Pin 88%, như mới, người bán Xuất sắc.</p>
    {btn("Nhắn", "chat-outline-rounded", "ink", "h-9 px-3")}
  </div>
</section>"""


def saved():
    searches = [("xe đạp đi làm dưới 3 triệu", "Bình Thạnh · 5 km", "4 tin mới"), ("iPhone 128GB dưới 8 triệu", "TP.HCM", None)]
    search_html = "".join(f"""<div class="card flex items-center gap-3 rounded-[22px] border line bg-white p-3">
  <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary-container text-on-secondary-container">{icon("search-rounded", 20)}</span>
  <div class="min-w-0 flex-1"><p class="truncate text-title-s ink">{q}</p><p class="text-body-s text-on-surface-variant">{where_}</p></div>
  {f'<span class="rounded-full bg-primary px-2.5 py-0.5 text-label-m text-on-primary">{n}</span>' if n else '<span class="text-body-s text-on-surface-variant">Chưa có tin mới</span>'}
  {icon_btn("Tắt thông báo", "notifications-active-rounded", "text-primary")}
</div>""" for q, where_, n in searches)
    # Each group spans as many of the 5 columns as it has cards; rows pack 5.
    grid = ""
    for name, items in SAVED_GROUPS:
        n = len(items)
        cmp = btn("So sánh", "compare-arrows-rounded", "line", "h-8 px-3") if name == "Điện thoại" else ""
        grid += f"""<section class="min-w-0" style="grid-column: span {n} / span {n}">
  <div class="mb-2 flex h-8 items-center justify-between pl-1"><h2 class="text-title-s ink">{name} <span class="num font-normal text-on-surface-variant">{n}</span></h2>{cmp}</div>
  <div class="grid gap-3" style="grid-template-columns: repeat({n}, minmax(0, 1fr))">{"".join(saved_card(*it) for it in items)}</div>
</section>"""
        if name == "Điện thoại":
            grid += compare_panel()
    count = sum(len(items) for _, items in SAVED_GROUPS)
    alert = f"""<label class="glass glass-edge flex cursor-pointer items-center gap-3 rounded-full py-1.5 pl-4 pr-1.5">
  {icon("trending-down-rounded", 18, "text-primary")}<span class="text-label-l ink">Báo khi giảm giá</span>{switch(True)}</label>"""
    inner = f"""
  {page_title("Đã lưu", f"{count} tin · 2 tìm kiếm · 3 tin vừa giảm giá", alert)}
  <div class="mt-5 grid grid-cols-2 gap-3">{search_html}</div>
  <div class="mt-6 grid grid-cols-5 gap-x-3 gap-y-6">{grid}</div>"""
    return account_page("Đã lưu", "saved", inner)


# ------------------------------------------------------ Thiết lập giao COD --
NAME = "Nguyễn Khánh Linh"
PHONE = "0912 345 812"
SHOP_CODE = "S55163"
BOOK = [(kind, ic, street, ward) for ic, kind, street, ward, _default, _used in ADDRESS_BOOK]


def step_head(n, t, state, end=""):
    mark = {"done": f'<span class="grid h-9 w-9 place-items-center rounded-full bg-primary text-on-primary">{icon("check-rounded", 20)}</span>',
            "active": f'<span class="num grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-[#066A61] to-[#5CC2B4] text-title-s text-white ring-4 ring-primary/15">{n}</span>',
            "next": f'<span class="grid h-9 w-9 place-items-center rounded-full bg-surface-container-high text-on-surface-variant">{icon("flag-outline-rounded", 18)}</span>'}[state]
    return f'<div class="flex items-center gap-3">{mark}<h2 class="flex-1 text-[20px] font-semibold leading-7 tight ink">{t}</h2>{end}</div>'


def cod_setup():
    steps = "".join(f"""<li class="flex items-center gap-2.5">
  <span class="grid h-7 w-7 shrink-0 place-items-center rounded-full text-label-m {c}">{g}</span>
  <span class="whitespace-nowrap"><span class="block text-label-l ink">{name}</span><span class="block text-body-s text-on-surface-variant">{d}</span></span></li>
  {'<span class="h-[3px] min-w-10 rounded-full ' + ('bg-primary' if i == 0 else 'bg-black/10') + ' flex-1"></span>' if i < 2 else ''}"""
                    for i, (name, d, c, g) in enumerate([
                        ("Địa chỉ lấy hàng", "Nhà · 12 Nguyễn Gia Trí", "bg-primary text-on-primary", icon("check-rounded", 16)),
                        ("Bên vận chuyển", f"GHTK · {SHOP_CODE}", "bg-gradient-to-br from-[#066A61] to-[#5CC2B4] text-white", "2"),
                        ("Sẵn sàng giao COD", "Người mua chọn được COD", "bg-surface-container-high text-on-surface-variant", icon("flag-outline-rounded", 15))]))
    book = "".join(option(f'<span class="flex items-center gap-1.5">{icon(ic, 17, "text-on-surface-variant")}{kind}</span>', f"{street}, {ward}",
                          btn("Sửa", "edit-outline-rounded", "ghost", "h-8 px-2") if i == 0 else "", i == 0)
                   for i, (kind, ic, street, ward) in enumerate(BOOK))
    book += option(f'<span class="flex items-center gap-1.5">{icon("add-rounded", 17, "text-primary")}Địa chỉ mới</span>')
    sender = f"""<div class="rounded-[18px] border line bg-white px-4 py-1">
  <div class="flex min-h-[56px] items-center gap-3 py-2">{face("Khánh Linh", 36)}
    <span class="min-w-0 flex-1"><span class="flex items-center gap-1 text-body-m ink">{NAME}{icon("verified-rounded", 15, "text-primary")}</span><span class="block text-body-s text-on-surface-variant">Tên trên CCCD</span></span></div>
  <div class="border-t line">{list_row("call-outline-rounded", PHONE, "Shipper gọi số này khi đến lấy", btn("Sửa", "edit-outline-rounded", "ghost", "h-8 px-2"))}</div>
</div>"""
    unlink = f"""<div role="dialog" aria-labelledby="unlink-title" class="glass glass-edge absolute right-0 top-[calc(100%+8px)] z-20 w-[290px] rounded-[22px] p-4 shadow-float">
  <h4 id="unlink-title" class="text-title-s ink">Gỡ liên kết GHTK?</h4>
  <p class="mt-1 text-body-m text-on-surface-variant">Các đơn đã gửi vẫn giữ nguyên.</p>
  <div class="mt-3 flex justify-end gap-1">{btn("Giữ lại", None, "ghost")}{btn("Gỡ liên kết", None, "line", "!text-error")}</div>
</div>"""
    linked = f"""<div class="relative flex min-h-[60px] items-center gap-3 rounded-[18px] border border-primary/40 bg-white px-3.5 py-2 ring-1 ring-primary/30">
  <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#0A8F3C] text-label-m font-semibold text-white">GH</span>
  <span class="min-w-0 flex-1"><span class="block text-body-m ink">GHTK · {SHOP_CODE}</span><span class="flex items-center gap-1 text-body-s text-primary"><span class="h-1.5 w-1.5 rounded-full bg-primary"></span>Đã liên kết · 18 đơn đã gửi</span></span>
  {btn("Gỡ liên kết", None, "line", "h-8 px-3")}
  {unlink}
</div>"""
    more = f"""<div class="flex min-h-[60px] items-center gap-3 rounded-[18px] border line bg-white/60 px-3.5 py-2">
  <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#F26522] text-label-m font-semibold text-white">GHN</span>
  <span class="min-w-0 flex-1"><span class="block text-body-m ink">GHN</span><span class="block text-body-s text-on-surface-variant">Dán mã API và mã cửa hàng</span></span>
  {btn("Kết nối GHN", None, "tonal", "h-8 px-3")}
</div>"""
    summary = "".join(f'<div class="flex items-center gap-3 py-2.5 {"border-t line" if i else ""}">{icon(ic, 18, "text-on-surface-variant")}<span class="w-28 shrink-0 text-body-s text-on-surface-variant">{k}</span><span class="text-body-m ink">{v}</span></div>'
                      for i, (ic, k, v) in enumerate([("location-on-outline-rounded", "Lấy hàng tại", f"{BOOK[0][2]}, {BOOK[0][3]}"),
                                                      ("local-shipping-outline-rounded", "Bên vận chuyển", f"GHTK · {SHOP_CODE}"),
                                                      ("call-outline-rounded", "Shipper gọi", PHONE)]))
    inner = f"""
  <section class="glass glass-edge soft rounded-[28px] p-6">
    <div class="flex items-start justify-between gap-8">
      <div>
        <p class="flex items-center gap-3 text-label-m text-on-surface-variant"><span class="flex items-center gap-1">{icon("timer-outline-rounded", 15)}3 phút</span><span class="flex items-center gap-1">{icon("event-repeat-outline-rounded", 15)}Làm một lần</span>{a("later", "text-primary hover:underline", "Để sau")}</p>
        <h1 class="mt-1 text-[40px] font-semibold leading-[44px] tighter ink">Thiết lập giao COD</h1>
      </div>
    </div>
    <ol class="mt-5 flex items-center gap-4 border-t border-white/70 pt-4">{steps}</ol>
  </section>

  <section class="{PANEL} mt-4 p-5">
    {step_head(1, "Địa chỉ lấy hàng", "done", '<span class="text-body-s text-on-surface-variant">Xong · Nhà</span>')}
    <div class="mt-4 grid grid-cols-2 gap-5">
      <div><p class="mb-2 text-label-l ink">Lấy hàng tại</p><div class="flex flex-col gap-2">{book}</div></div>
      <div><p class="mb-2 text-label-l ink">Người gửi</p>{sender}</div>
    </div>
  </section>

  <section class="mt-4 rounded-[24px] border border-white bg-white p-5 glow">
    {step_head(2, "Bên vận chuyển", "active")}
    <div class="mt-4 grid grid-cols-2 gap-5">
      <div><p class="mb-2 text-label-l ink">Tài khoản đã liên kết</p>{linked}</div>
      <div><p class="mb-2 text-label-l ink">Liên kết thêm</p>{more}
        {btn("Hãng của bạn chưa có?", "add-rounded", "ghost", "mt-1 -ml-2")}</div>
    </div>
    <div class="mt-5 flex justify-end border-t line pt-4">{btn("Tiếp tục", None, "primary", "h-11 px-7").replace("Tiếp tục", "Tiếp tục" + icon("arrow-forward-rounded", 18))}</div>
  </section>

  <section class="mt-4 grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-6 rounded-[24px] border border-dashed border-black/15 bg-white/50 p-5">
    <div>{step_head(3, "Sẵn sàng giao COD", "next")}
      <p class="mt-2 pl-12 text-body-m text-on-surface-variant">Người mua chọn được COD với mọi tin của bạn.</p></div>
    <div class="rounded-[18px] border line bg-white px-4">{summary}</div>
  </section>"""
    return account_page("Thiết lập giao COD", "cod", inner)


PAGES = [("orders", orders), ("order", order), ("ship", ship), ("my-listings", my_listings), ("saved", saved), ("cod-setup", cod_setup)]

if __name__ == "__main__":
    for name, fn in PAGES:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(fn())
        print("wrote", name)
