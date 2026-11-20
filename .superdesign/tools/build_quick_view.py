"""Xem nhanh from Tìm kiếm and a category: a tap on a result opens the listing
beside the results instead of leaving them. From 840 px a panel on the right
(the results reflow beside it, filters and sort stay as they were); below, a
sheet from the bottom. "Mở trang" opens the full listing.

    python3 tools/build_quick_view.py        (run from .superdesign/)

Writes mockups/quick-view-desktop.html (1280, panel open over "laptop"),
mockups/quick-view-loading.html (1280, the panel's skeleton) and
mockups/quick-view-phone.html (390, sheet open).
"""
import os
from html import escape

from build import OUT
from build_header import Ids
from build_k2 import SELLERS, ri
from build_notif_preview import bar
from build_quiet import LAPTOPS
from common import LOGO, img
from j_kit import LABEL  # noqa: F401  (the shared kit; K2 pieces come from build_k2/build_header)

PICK = 1  # MacBook Air M1, the result that is open
GALLERY = ["1517336714731-489689fd1ca8", "1541807084-5c52b6b3adef", "1611186871348-b1ce696e52c9", "1496181133206-80ce9b88a853"]
DESC = ("Máy mua 2021 ở FPT, pin 91%, sạc 212 lần. Vỏ còn đẹp, có một vết nhỏ ở góc dưới. "
        "Kèm sạc zin và hộp. Xem máy buổi tối hoặc cuối tuần ở Q.10.")
SELLER = SELLERS[1]

CSS = """
  .shadow-pop { box-shadow: 0 12px 32px -8px rgb(20 20 19 / .16), 0 0 0 1px rgb(20 20 19 / .05); }
  .card.on { border-color: #066A61; box-shadow: 0 0 0 1px #066A61; }
  .skeleton { background: linear-gradient(90deg, #EEEEEB 0, #F7F7F5 50%, #EEEEEB 100%); background-size: 200% 100%; }
  .clamp4 { display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; }
"""


def out(title, body):
    from build_k2 import out as k2_out
    return k2_out(title, body).replace("</style>", CSS + "</style>", 1)


# ----------------------------------------------------------- the results --
def result_card(i, on=False, compact=False):
    p, pr, t, c, km, a = LAPTOPS[i % len(LAPTOPS)]
    place = km if float(km.split()[0].replace(".", "").replace(",", ".")) < 10 else a
    size = "text-[15px]" if compact else "text-[16px]"
    return f"""<article class="card {'on' if on else ''} min-w-0 p-{'1.5' if compact else '2'}">
  <div class="relative overflow-hidden rounded-[11px] bg-soft" style="aspect-ratio:1/1"><img src="{img(p, 360, 360)}" alt="" class="h-full w-full object-cover">
    <span class="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-[0_1px_2px_rgb(20_20_19/.08)]">{ri("heart-line", 16)}</span></div>
  <div class="px-1.5 pb-1 pt-2.5">
    <p class="num {size} font-semibold tracking-tight">{pr}</p>
    <p class="clamp2 mt-0.5 min-h-[40px] text-[14px] leading-5">{escape(t)}</p>
    <p class="meta mt-1.5">{c} · {place}</p>
  </div>
</article>"""


def filters():
    def group(t, inner, first=False):
        return f'<div class="{"" if first else "border-t bd"} px-4 py-4"><p class="text-[14px] font-medium">{t}</p><div class="mt-3">{inner}</div></div>'

    def check(label):
        return f'<label class="flex h-8 items-center gap-2.5 text-[14px]"><span class="h-4 w-4 rounded-[4px] shadow-[inset_0_0_0_1.5px_#C4C4BF]"></span>{label}</label>'
    price = ('<div class="flex gap-2"><span class="btn-o flex h-9 flex-1 items-center rounded-[8px] px-2.5 text-[13px] meta">Từ</span>'
             '<span class="btn-o flex h-9 flex-1 items-center rounded-[8px] px-2.5 text-[13px] meta">Đến</span></div>')
    return f"""<aside class="card self-start overflow-hidden">
    {group("Giá", price, True)}
    {group("Tình trạng", check("Mới") + check("Như mới") + check("Đã dùng") + '<div class="h-2"></div>' + check("Trả giá được"))}
    {group("Khoảng cách", f'<span class="flex items-center gap-1.5 text-[13px] font-medium text-brand">{ri("focus-3-line", 15)}Dùng vị trí hiện tại</span>')}
    <div class="border-t bd p-4"><span class="btn-o flex h-9 items-center justify-center rounded-[10px] text-[14px] font-medium">Áp dụng</span></div>
  </aside>"""


def toolbar():
    tabs = "".join(f'<span class="tab {"on" if i == 0 else ""}">{t}</span>' for i, t in enumerate(["Phù hợp nhất", "Mới đăng", "Giá thấp", "Giá cao"]))
    chips = "".join(f'<span class="flex h-8 items-center gap-1 rounded-full bg-white pl-3 pr-1.5 text-[13px] shadow-[inset_0_0_0_1px_#DCDCD8]">{t}<span class="grid h-5 w-5 place-items-center rounded-full mute">{ri("close-line", 13)}</span></span>'
                    for t in ["Máy tính", "laptop"])
    view = (f'<span class="flex rounded-[8px] bg-soft p-0.5"><span class="grid h-8 w-8 place-items-center rounded-[6px] bg-white shadow-[0_1px_2px_rgb(20_20_19/.06)]">{ri("layout-grid-line", 15)}</span>'
            f'<span class="grid h-8 w-8 place-items-center mute">{ri("list-check", 15)}</span></span>')
    return f"""<div class="flex flex-wrap items-center gap-2">{chips}<span class="ml-1 text-[13px] mute">Xóa hết</span></div>
      <div class="mt-3 flex items-center justify-between border-b bd"><div class="flex gap-6 text-[14px]">{tabs}</div><div class="pb-1.5">{view}</div></div>"""


def results_page(L, panel):
    cards = "".join(result_card(i, on=i == PICK) for i in range(9))
    return f"""{bar(L)}
<div class="mx-auto max-w-[1280px] px-8 pt-6">
  <div class="flex items-end justify-between">
    <div><h1 class="text-[28px] font-semibold leading-9 tracking-[-0.02em]">“laptop”</h1><p class="mt-1 text-[14px] mute">Tìm laptop để bán hoặc mua trong danh mục Máy tính.</p></div>
    <span class="flex h-10 items-center gap-1.5 rounded-[10px] bg-brand px-4 text-[14px] font-medium text-white">{ri("notification-3-line", 16)}Báo khi có tin mới</span>
  </div>
  <!-- Open: the results make room for the panel and fall to three columns. -->
  <div class="mt-6 grid grid-cols-[256px_1fr] gap-8 pr-[388px]">
    {filters()}
    <main class="min-w-0">
      {toolbar()}
      <div class="mt-5 grid grid-cols-3 gap-4">{cards}</div>
    </main>
  </div>
</div>
<div class="fixed bottom-3 right-3 top-[76px] z-40 w-[400px]">{panel}</div>"""


# --------------------------------------------------------------- the panel --
def bar_row(L, phone=False):
    nav = (f'<span class="flex">'
           f'{L.a("grid h-9 w-9 place-items-center rounded-[10px] row", ri("arrow-left-s-line", 20), "Tin trước")}'
           f'{L.a("grid h-9 w-9 place-items-center rounded-[10px] row", ri("arrow-right-s-line", 20), "Tin sau")}</span>')
    open_ = L.a("flex h-9 items-center gap-1.5 rounded-[10px] px-2.5 text-[14px] font-medium row", ri("external-link-line", 16) + "Mở trang")
    close = L.a("grid h-9 w-9 place-items-center rounded-[10px] row", ri("close-line", 20), "Đóng")
    return f'<div class="flex h-14 shrink-0 items-center gap-1 {"px-3" if phone else "border-b bd px-3"}">{nav}<span class="flex-1"></span>{open_}{close}</div>'


def gallery(phone=False):
    dots = "".join(f'<span class="h-1.5 w-1.5 rounded-full {"bg-white" if i == 0 else "bg-white/60"}"></span>' for i in range(len(GALLERY)))
    arrows = "" if phone else (f'<span class="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-white/85">{ri("arrow-right-s-line", 20)}</span>')
    return f"""<div class="relative overflow-hidden rounded-[12px] bg-soft" style="aspect-ratio:16/10.5">
      <img src="{img(GALLERY[0], 800, 525)}" alt="" class="h-full w-full object-cover">
      {arrows}
      <span class="absolute bottom-3 left-3 rounded-full bg-black/50 px-2.5 py-1 text-[12px] font-medium text-white">1/{len(GALLERY)}</span>
      {f'<span class="absolute inset-x-0 bottom-4 flex justify-center gap-1.5">{dots}</span>' if phone else ''}
      <span class="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-[10px] bg-white/85">{ri("fullscreen-line", 17)}</span>
    </div>"""


def details(L):
    p, pr, t, c, km, a = LAPTOPS[PICK]
    name, face, rate = SELLER
    return f"""<p class="flex items-center gap-2 meta"><span class="rounded-[4px] bg-mint px-1.5 py-0.5 font-medium text-on-mint">{c}</span>{km} · 2 giờ trước</p>
      <h2 class="mt-2.5 text-[18px] font-semibold leading-6">{escape(t)}</h2>
      <p class="num mt-2 text-[26px] font-semibold leading-8 tracking-[-0.02em]">{pr.replace(" ₫", "")}<span class="ml-1 text-[15px] font-medium mute">₫</span></p>"""


def actions(L):
    return f"""<div class="flex gap-2">
        {L.a("flex h-11 flex-1 items-center justify-center gap-2 rounded-[10px] bg-brand text-[14px] font-medium text-white", ri("shopping-bag-3-line", 18) + "Mua ngay")}
        {L.a("btn-o flex h-11 flex-1 items-center justify-center gap-2 rounded-[10px] text-[14px] font-medium", ri("price-tag-3-line", 18) + "Trả giá")}
        {L.a("btn-o grid h-11 w-11 shrink-0 place-items-center rounded-[10px]", ri("heart-line", 18), "Lưu tin")}
      </div>"""


def seller_row(L):
    name, face, rate = SELLER
    return L.a("row -mx-2 flex items-center gap-3 rounded-[10px] p-2",
               f'<img src="{img(face, 72, 72)}" alt="" class="h-9 w-9 rounded-full object-cover">'
               f'<span class="min-w-0 flex-1"><span class="block truncate text-[14px] font-medium">{name}</span>'
               f'<span class="meta flex items-center gap-1">{ri("star-fill", 12, "text-[#E0A23B]")}{rate} · 14 đã bán</span></span>'
               + ri("arrow-right-s-line", 18, "mute"))


def description():
    return f"""<p class="text-[13px] font-medium mute">Mô tả</p>
      <p class="clamp4 mt-1.5 text-[14px] leading-6">{DESC}</p>"""


def panel(L):
    return f"""<section role="dialog" aria-label="Xem nhanh" class="shadow-pop flex h-full flex-col overflow-hidden rounded-[16px] bg-white">
    {bar_row(L)}
    <article class="min-h-0 flex-1 overflow-y-auto p-4">
      {gallery()}
      <div class="px-1 pt-4">{details(L)}</div>
      <div class="mt-4 px-1">{actions(L)}</div>
      <div class="mt-4 border-t bd px-1 pt-3">{seller_row(L)}</div>
      <div class="mt-3 border-t bd px-1 pt-4">{description()}</div>
    </article>
  </section>"""


def skeleton_panel(L):
    bar_ = lambda w, h="h-3.5", extra="": f'<div class="skeleton {h} {w} rounded-full {extra}"></div>'
    return f"""<section role="dialog" aria-label="Xem nhanh" class="shadow-pop flex h-full flex-col overflow-hidden rounded-[16px] bg-white">
    {bar_row(L)}
    <div class="flex-1 p-4">
      <div class="skeleton rounded-[12px]" style="aspect-ratio:16/10.5"></div>
      <div class="px-1 pt-4">{bar_("w-28", "h-4")}{bar_("w-11/12", "h-5", "mt-3")}{bar_("w-1/2", "h-5", "mt-2")}{bar_("w-2/5", "h-7", "mt-3")}</div>
      <div class="mt-5 flex gap-2 px-1"><div class="skeleton h-11 flex-1 rounded-[10px]"></div><div class="skeleton h-11 flex-1 rounded-[10px]"></div><div class="skeleton h-11 w-11 rounded-[10px]"></div></div>
      <div class="mt-5 flex items-center gap-3 px-1"><div class="skeleton h-9 w-9 rounded-full"></div><div class="flex-1">{bar_("w-1/3")}{bar_("w-1/4", "h-3", "mt-2")}</div></div>
    </div>
  </section>"""


def desktop():
    return out("Xem nhanh · Tìm kiếm", results_page(Ids("qv-d"), panel(Ids("qv-dp"))))


def loading():
    return out("Xem nhanh đang tải · Tìm kiếm", results_page(Ids("qv-l"), skeleton_panel(Ids("qv-lp"))))


# --------------------------------------------------------------- phone --
def phone():
    L = Ids("qv-p")
    hdr = f"""<header class="border-b bd bg-[var(--bg)]">
  <div class="flex h-16 items-center gap-2 px-4">
    <img src="{LOGO}" alt="" class="h-8 w-8">
    <div class="ml-1 flex h-10 min-w-0 flex-1 items-center gap-2 rounded-[10px] bg-white pl-3 shadow-[inset_0_0_0_1px_#DCDCD8]">{ri("search-line", 17, "mute")}<span class="text-[14px]">laptop</span></div>
    <span class="grid h-10 w-10 place-items-center">{ri("notification-3-line", 20)}</span>
  </div>
</header>"""
    cards = "".join(result_card(i, on=i == PICK, compact=True) for i in range(4))
    sheet = f"""<section role="dialog" aria-label="Xem nhanh" class="absolute inset-x-0 bottom-0 top-[92px] flex flex-col rounded-t-[20px] bg-white">
    <span class="mx-auto mt-2 block h-1 w-8 shrink-0 rounded-full bg-[#8C8C87]/50"></span>
    {bar_row(L, phone=True)}
    <article class="min-h-0 flex-1 overflow-hidden px-4">
      {gallery(phone=True)}
      <div class="px-1 pt-4">{details(L)}</div>
      <div class="mt-3 border-t bd px-1 pt-3">{seller_row(L)}</div>
      <div class="mt-2 border-t bd px-1 pt-3">{description()}</div>
    </article>
    <div class="border-t bd bg-white px-4 pb-6 pt-3">{actions(L)}</div>
  </section>"""
    body = f"""<div class="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-[var(--bg)]">
  {hdr}
  <main class="px-4 pt-4">
    <h1 class="text-[22px] font-semibold tracking-[-0.02em]">“laptop”</h1>
    <span class="btn-o mt-3 inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3.5 text-[14px] font-medium">{ri("equalizer-line", 16)}Bộ lọc</span>
    <div class="mt-4 grid grid-cols-2 gap-3">{cards}</div>
  </main>
  <div class="absolute inset-0 bg-black/30"></div>
  {sheet}
</div>"""
    return out("Xem nhanh · điện thoại", body)


if __name__ == "__main__":
    for name, fn in [("desktop", desktop), ("loading", loading), ("phone", phone)]:
        with open(os.path.join(OUT, f"quick-view-{name}.html"), "w") as f:
            f.write(fn())
        print("wrote quick-view", name)
