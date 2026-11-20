"""Seller tools, round 4, in K2 (build_seller_tools.py is the older C draft).

Tin của bạn: each row edits in place. The price is a button that opens a
small "Đổi giá" panel (a sheet on a phone) with the new price, -5/-10/-15 %
picks and, when the drop counts, the "Vừa giảm" chip buyers will see. A row
whose price dropped shows the price before it struck through and the chip,
as the cards do. "Đã bán" asks once; a sold row offers "Đăng lại".

Đăng tin: "Đăng tin" first opens Xem trước, the listing card and the top of
the listing page built from the form, with what a buyer would miss ("Tiêu đề
bị cắt trên thẻ") and a "Sửa" to that field. A side panel from 840 px, a
full sheet on a phone.

    python3 tools/build_seller_tools_k2.py        (run from .superdesign/)

Writes mockups/seller-tools-{listings,listings-phone,preview,preview-phone}.html.
"""
import os
from html import escape

from build import OUT
from build_header import Ids
from build_k2 import out, ri
from build_notif_preview import bar
from build_price_drop import phone_header
from common import LISTINGS, img

CSS = """
  .shadow-pop { box-shadow: 0 12px 32px -8px rgb(20 20 19 / .16), 0 0 0 1px rgb(20 20 19 / .05); }
  .field { background: #fff; box-shadow: inset 0 0 0 1px #DCDCD8; border-radius: 10px; }
  .field.on { box-shadow: inset 0 0 0 2px #066A61; }
  .busy { position: relative; color: transparent !important; }
"""

CHIP = (f'<span class="flex h-6 items-center gap-0.5 rounded-full bg-white/90 pl-1.5 pr-2 text-[11px] font-medium leading-4 text-[#066A61] '
        f'shadow-[0_1px_2px_rgb(20_20_19/.08),0_0_0_1px_rgb(20_20_19/.06)]">{ri("arrow-down-line", 13)}Vừa giảm</span>')
STRUCK = '<s class="ml-1.5 text-[12.5px] font-normal text-[#8C8C87]">{}</s>'

# (photo, price, title, views, askers, saves, posted, struck)
ROWS = [
    (LISTINGS[7][0], "14,9", "iPhone 15 128GB, bảo hành Apple đến 03/2027", 128, 6, 14, "2 ngày", "15,9 tr"),
    (LISTINGS[1][0], "11,5", "MacBook Air M1 13 inch 8/256GB, sạc 92 lần", 64, 3, 9, "5 ngày", ""),
    (LISTINGS[8][0], "26,5", "Sony A7 III kèm lens 28-70 và 50mm f/1.8", 41, 1, 5, "1 tuần", ""),
    (LISTINGS[5][0], "4.800.000", "Sofa nhung xanh 3 chỗ, chuyển nhà cần bán gấp", 22, 2, 3, "3 giờ", ""),
]


def out_(title, body):
    return out(title, body).replace("</style>", CSS + "</style>", 1)


def price_text(p, size="text-[15px]"):
    unit = "tr ₫" if "," in p or len(p) <= 4 else "₫"
    return f'<span class="num {size} font-semibold tracking-tight">{p}<span class="ml-0.5 text-[12.5px] font-medium tracking-normal text-[#5E5E5A]">{unit}</span></span>'


def stats(v, a, s, ago):
    return "".join(f'<span class="flex items-center gap-1">{ri(i, 15)}<span class="num">{n}</span></span>'
                   for i, n in [("eye-line", v), ("chat-3-line", a), ("heart-line", s)]) + f'<span class="flex items-center gap-1">{ri("time-line", 15)}{ago}</span>'


def row(L, r, *, open_=False, phone=False):
    photo, p, title, v, a, s, ago, was = r
    price_btn = L.a(f"-mx-1.5 flex h-8 items-center gap-1 rounded-[8px] px-1.5 {'bg-[#EEEEEB]' if open_ else 'row'}",
                    price_text(p) + (STRUCK.format(was) if was else "") + ri("pencil-line", 14, "mute ml-0.5"), "Đổi giá")
    chip = CHIP if was else ""
    acts = (L.a("btn-o flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-[14px] font-medium", ri("check-line", 16) + "Đã bán")
            + L.a("btn-o flex h-9 items-center gap-1.5 rounded-[10px] px-3 text-[14px] font-medium", ri("pencil-line", 16) + "Sửa")
            + L.a("grid h-9 w-9 place-items-center rounded-full mute row", ri("more-2-fill", 20), "Tùy chọn"))
    if phone:
        return f"""<article class="card relative p-2">
  <div class="flex items-center gap-3">
    <img src="{img(photo, 160, 160)}" alt="" class="h-16 w-16 shrink-0 rounded-[10px] object-cover">
    <div class="min-w-0 flex-1">
      <p class="truncate text-[14px] font-medium">{escape(title)}</p>
      <div class="mt-0.5 flex items-center gap-2">{price_btn}{chip}</div>
      <p class="meta mt-0.5 flex items-center gap-3">{stats(v, a, s, ago)}</p>
    </div>
  </div>
  <div class="ml-[76px] mt-2 flex justify-end gap-2">{acts}</div>
</article>"""
    return f"""<article class="card relative flex items-center gap-4 p-2">
  <img src="{img(photo, 160, 160)}" alt="" class="h-16 w-16 shrink-0 rounded-[10px] object-cover">
  <div class="min-w-0 flex-1">
    <p class="truncate text-[14px] font-medium">{escape(title)}</p>
    <div class="mt-0.5 flex items-center gap-3 whitespace-nowrap">
      <span class="flex items-center gap-2">{price_btn}{chip}</span>
      <span class="h-3 border-l border-black/10"></span>
      <span class="meta flex items-center gap-3 !text-[#5E5E5A]">{stats(v, a, s, ago)}</span>
    </div>
  </div>
  <div class="flex shrink-0 items-center gap-2">{acts}</div>
</article>"""


def price_panel(L, style, sheet=False):
    """Đổi giá for the MacBook: 11.500.000 ₫ to 10.350.000 ₫, a 10 % drop."""
    picks = "".join(L.a(f"flex h-8 items-center rounded-full px-3 text-[13px] font-medium {'bg-mint text-on-mint' if t == '-10%' else 'btn-o'}", t)
                    for t in ["-5%", "-10%", "-15%"])
    grab = '<span class="mx-auto mb-2 block h-1 w-8 rounded-full bg-[#5E5E5A]/40"></span>' if sheet else ""
    shape = "rounded-t-[20px] px-4 pb-6 pt-2" if sheet else "rounded-[20px] p-4"
    return f"""<div class="absolute z-40 bg-white shadow-pop {shape}" style="{style}" role="dialog" aria-label="Đổi giá">
  {grab}
  <p class="text-[16px] font-semibold">Đổi giá</p>
  <p class="meta mt-0.5 truncate">MacBook Air M1 13 inch 8/256GB, sạc 92 lần</p>
  <label class="mt-3 block">
    <span class="sr-only">Giá mới</span>
    <span class="field on flex h-12 items-center gap-3 px-4"><input class="num min-w-0 flex-1 bg-transparent text-[22px] font-semibold outline-none" value="10.350.000"><span class="mute">₫</span></span>
  </label>
  <div class="mt-2.5 flex gap-2">{picks}</div>
  <div class="mt-3 flex items-center gap-2 rounded-[12px] bg-[#F3F3F1] px-3 py-2.5">
    {price_text("10,4")}{STRUCK.format("11,5 tr")}<span class="flex-1"></span>{CHIP}
  </div>
  <div class="mt-4 flex justify-end gap-2">
    {L.a("flex h-10 items-center rounded-[10px] px-4 text-[14px] font-medium text-brand row", "Hủy")}
    {L.a("flex h-10 items-center rounded-[10px] bg-brand px-5 text-[14px] font-medium text-white", "Lưu giá")}
  </div>
</div>"""


def week(phone=False):
    cells = [("eye-line", "255", "Lượt xem · 7 ngày"), ("chat-3-line", "12", "Người hỏi · 7 ngày"), ("heart-line", "31", "Lượt lưu · 7 ngày")]
    return "".join(f'<div class="card flex items-center gap-3 p-{3 if phone else 4}">'
                   + ("" if phone else f'<span class="grid h-10 w-10 place-items-center rounded-full bg-brand text-white">{ri(i, 20)}</span>')
                   + f'<div><p class="num text-[{20 if phone else 24}px] font-semibold">{n}</p><p class="meta">{t}</p></div></div>' for i, n, t in cells)


def tabs(L):
    return "".join(L.a(f"flex h-9 items-center rounded-full px-4 text-[14px] font-medium {'bg-mint text-on-mint' if i == 0 else 'bg-[#F3F3F1] mute'}", t)
                   for i, t in enumerate(["Đang bán", "Nháp · 1", "Đã bán"]))


def account_nav(L):
    items = [("user-line", "Tôi"), ("store-2-line", "Tin của bạn"), ("file-list-3-line", "Đơn mua"), ("archive-line", "Đơn bán"), ("heart-line", "Đã lưu"),
             ("chat-3-line", "Tin nhắn"), ("notification-3-line", "Thông báo"), ("truck-line", "Thiết lập giao COD"), ("question-line", "Hỗ trợ")]
    nav = "".join(L.a(f"row flex h-10 items-center gap-3 rounded-[10px] px-3 text-[14px] {'on' if t == 'Tin của bạn' else ''}", ri(i, 18, "mute") + t) for i, t in items)
    return f"""<aside class="sticky top-[88px] self-start">
  <div class="card flex items-center gap-3 p-3"><img src="{img('1438761681033-6461ffad8d80', 88, 88)}" alt="" class="h-11 w-11 rounded-full object-cover">
    <div><p class="text-[14px] font-medium">Minh Anh</p><p class="meta">★ 4,8 · 23 đã bán</p></div></div>
  <nav class="mt-3 flex flex-col">{nav}</nav>
</aside>"""


def listings_desktop():
    L = Ids("st-l")
    rows = "".join(row(L, r, open_=i == 1) for i, r in enumerate(ROWS))
    body = f"""{bar(L)}
<div class="mx-auto grid max-w-[1280px] grid-cols-[232px_1fr] gap-8 px-8 pt-6">
  {account_nav(L)}
  <main class="relative min-w-0">
    <div class="flex items-end justify-between">
      <div><h1 class="text-[28px] font-semibold leading-9 tracking-[-0.02em]">Tin của bạn</h1><p class="meta mt-1 !text-[13px] !text-[#5E5E5A]">Đang dùng 4/20 chỗ đăng tin · 1 nháp</p></div>
      {L.a("flex h-10 items-center gap-1.5 rounded-[10px] bg-brand px-4 text-[14px] font-medium text-white", ri("image-add-line", 17) + "Đăng tin")}
    </div>
    <div class="mt-5 grid grid-cols-3 gap-3">{week()}</div>
    <nav class="mt-6 flex gap-2">{tabs(L)}</nav>
    <section class="mt-4 flex flex-col gap-2.5">{rows}</section>
    {price_panel(L, "top:402px;left:84px;width:340px")}
  </main>
</div>"""
    return out_("Tin của bạn · đổi giá tại chỗ", body)


def listings_phone():
    L = Ids("st-lp")
    rows = "".join(row(L, r, phone=True) for r in ROWS[:3])
    body = f"""<div class="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-[var(--bg)]">
  {phone_header()}
  <main class="px-4 pt-4">
    <h1 class="text-[24px] font-semibold tracking-[-0.02em]">Tin của bạn</h1>
    <p class="meta mt-0.5">Đang dùng 4/20 chỗ đăng tin · 1 nháp</p>
    <div class="mt-3 grid grid-cols-3 gap-2">{week(True)}</div>
    <nav class="mt-4 flex gap-2">{tabs(L)}</nav>
    <section class="mt-3 flex flex-col gap-2.5">{rows}</section>
  </main>
  <div class="absolute inset-0 z-30 bg-black/30"></div>
  {price_panel(L, "left:0;right:0;bottom:0", sheet=True)}
</div>"""
    return out_("Tin của bạn · đổi giá, điện thoại", body)


# ------------------------------------------------------------- preview --
LONG = "Xe đạp fixed gear khung thép Nhật, vừa thay lốp Continental và xích mới"
BIKE = ["1507035895480-2b3156c31fc8", "1485965120184-e220f721d03e", "1532298229144-0ec0c57515c7"]


def sell_behind(L):
    """The Đăng tin form as it stands behind the panel."""
    tiles = "".join(f'<li class="relative aspect-square overflow-hidden rounded-[16px]"><img src="{img(p, 240, 240)}" alt="" class="h-full w-full object-cover">'
                    + ('<span class="absolute left-2 top-2 rounded-full bg-white/85 px-2 py-0.5 text-[12px] font-medium">Ảnh bìa</span>' if i == 0 else "") + "</li>"
                    for i, p in enumerate(BIKE))
    return f"""<div class="mx-auto max-w-[1280px] px-8 pt-8">
  <p class="text-[14px] font-medium text-brand">Bán đồ</p><h1 class="text-[30px] font-semibold leading-9 tracking-[-0.02em]">Đăng tin</h1>
  <div class="mt-6 grid grid-cols-[1fr_340px] gap-6">
    <div class="flex flex-col gap-4">
      <section class="card p-6"><p class="flex items-center gap-3 text-[20px] font-semibold"><span class="grid h-8 w-8 place-items-center rounded-full bg-brand text-[14px] text-white">1</span>Ảnh</p>
        <ol class="mt-4 grid grid-cols-5 gap-2.5">{tiles}</ol></section>
      <section class="card p-6"><p class="flex items-center gap-3 text-[20px] font-semibold"><span class="grid h-8 w-8 place-items-center rounded-full bg-brand text-[14px] text-white">2</span>Món đồ</p>
        <p class="mt-4 text-[13px] font-medium mute">Tiêu đề</p><div class="mt-1.5 flex h-12 items-center rounded-[10px] bg-[#F3F3F1] px-4 text-[15px]">{escape(LONG)}</div></section>
    </div>
    <aside class="card self-start p-5"><p class="text-[14px] font-medium">Sẵn sàng đăng?</p>
      {L.a("mt-3 flex h-12 items-center justify-center gap-2 rounded-[10px] bg-brand text-[15px] font-medium text-white", ri("send-plane-2-line", 18) + "Đăng tin")}
      {L.a("btn-o mt-2 flex h-11 items-center justify-center gap-2 rounded-[10px] text-[15px] font-medium", ri("draft-line", 18) + "Lưu nháp")}</aside>
  </div>
</div>"""


def preview_card(w):
    return f"""<article class="card shrink-0 p-2" style="width:{w}px">
  <div class="relative overflow-hidden rounded-[11px] bg-soft" style="aspect-ratio:1/1"><img src="{img(BIKE[0], 480, 480)}" alt="" class="h-full w-full object-cover">
    <span class="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-[0_1px_2px_rgb(20_20_19/.08)]">{ri("heart-line", 16)}</span></div>
  <div class="px-1.5 pb-1 pt-2.5">
    {price_text("2.300.000", "text-[16px]")}
    <p class="clamp2 mt-0.5 min-h-[40px] text-[14px] leading-5">{escape(LONG)}</p>
    <p class="meta mt-1.5 truncate">Đã dùng · Phường Bến Thành</p>
  </div>
</article>"""


def note(L, icon, text, to):
    return (f'<li class="flex items-start gap-2 text-[13px] leading-[18px]">{ri(icon, 16, "mt-px text-[#5E5E5A]")}<span class="min-w-0 flex-1">{text}</span>'
            + L.a("-my-1 shrink-0 rounded-[8px] px-2 py-1 text-[13px] font-medium text-brand row", to) + "</li>")


def page_top(phone=False):
    dots = "".join(f'<span class="h-1.5 w-1.5 rounded-full {"bg-white" if i == 0 else "bg-white/60"}"></span>' for i in range(len(BIKE)))
    return f"""<div class="relative overflow-hidden rounded-[16px] bg-soft" style="aspect-ratio:16/10.5">
      <img src="{img(BIKE[0], 800, 525)}" alt="" class="h-full w-full object-cover">
      <span class="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-[12px] font-medium text-white">1/{len(BIKE)}</span>
      <span class="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">{dots}</span>
    </div>
    <div class="card mt-3 p-5">
      <p class="meta flex flex-wrap items-center gap-2"><span class="rounded-[4px] bg-mint px-1.5 py-0.5 font-medium text-on-mint">Đã dùng</span>Phường Bến Thành · vừa xong</p>
      <h2 class="mt-3 text-[{20 if phone else 22}px] font-semibold leading-7">{escape(LONG)}</h2>
      <p class="num mt-3 text-[30px] font-semibold leading-9 tracking-[-0.02em]">2.300.000<span class="ml-1 text-[16px] font-medium tracking-normal text-[#5E5E5A]">₫</span></p>
    </div>"""


def preview_body(L, phone=False):
    notes = note(L, "text-wrap", "Tiêu đề bị cắt trên thẻ", "Sửa tiêu đề")
    top = f'{preview_card(171 if phone else 228)}<ul class="mt-3 flex flex-col gap-2 rounded-[12px] bg-[#F3F3F1] px-3 py-2.5">{notes}</ul>'
    return f"""<div class="min-h-0 flex-1 overflow-y-auto px-5 pb-5">
    <p class="meta mb-2">Thẻ tin</p>
    {top}
    <p class="meta mb-2 mt-6">Trang tin</p>
    {page_top(phone)}
  </div>"""


def preview_frame(L, phone=False):
    head = f"""<div class="flex h-14 shrink-0 items-center gap-2 px-5">
    <p class="flex-1 text-[17px] font-semibold">Xem trước</p>
    {L.a("grid h-9 w-9 place-items-center rounded-[10px] row", ri("close-line", 20), "Đóng")}
  </div>"""
    foot = f"""<div class="flex shrink-0 gap-2 border-t bd p-4">
    {L.a("btn-o flex h-11 flex-1 items-center justify-center gap-2 rounded-[10px] text-[15px] font-medium", ri("pencil-line", 17) + "Sửa")}
    {L.a("flex h-11 flex-[2] items-center justify-center gap-2 rounded-[10px] bg-brand text-[15px] font-medium text-white", ri("send-plane-2-line", 17) + "Đăng tin")}
  </div>"""
    return head + preview_body(L, phone) + foot


def preview_desktop():
    L = Ids("st-p")
    body = f"""{bar(L)}
{sell_behind(L)}
<div class="fixed inset-0 z-30 bg-black/30"></div>
<div class="fixed bottom-3 right-3 top-3 z-40 flex w-[460px] flex-col overflow-hidden rounded-[16px] bg-white shadow-pop" role="dialog" aria-label="Xem trước">
  {preview_frame(L)}
</div>"""
    return out_("Đăng tin · xem trước", body)


def preview_phone():
    L = Ids("st-pp")
    body = f"""<div class="relative mx-auto flex h-[844px] w-[390px] flex-col overflow-hidden bg-white" role="dialog" aria-label="Xem trước">
  {preview_frame(L, phone=True)}
</div>"""
    return out_("Đăng tin · xem trước, điện thoại", body)


if __name__ == "__main__":
    for name, fn in [("listings", listings_desktop), ("listings-phone", listings_phone), ("preview", preview_desktop), ("preview-phone", preview_phone)]:
        with open(os.path.join(OUT, f"seller-tools-{name}.html"), "w") as f:
            f.write(fn())
        print("wrote seller-tools", name)
