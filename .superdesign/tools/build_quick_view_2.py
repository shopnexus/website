"""Xem nhanh, round two: three ways to preview a result without leaving
Tìm kiếm, drawn over the same 1280 page so they compare side by side.

  A. Hover hiện popup: a preview pops up beside the hovered card and covers
     its neighbours.
  B. Nút Xem nhanh: hovering a card shows a "Xem nhanh" pill on its photo; a
     click on the card opens the listing page, the pill opens Xem nhanh as a
     drawer over the results with a light scrim. The grid keeps four columns.
     Phones get no pill: a tap opens the page.
  C. Panel đẩy lưới (today): the panel takes the right side and the grid
     falls to three columns.

The search API sends one cover per result, so B has no photo scrubbing.

    python3 tools/build_quick_view_2.py        (run from .superdesign/)

Writes mockups/quick-view-2-{a,b-hover,b-open,b-phone,c}.html.
"""
import os
from html import escape

from build import OUT
from build_header import Ids
from build_k2 import ri
from build_notif_preview import bar
from build_quick_view import CSS as QV_CSS, DESC, GALLERY, LAPTOPS, SELLER, desktop as push_panel_page, filters, panel, toolbar
from common import LOGO, img

HOVER = 1  # MacBook Air M1: the hovered card, and the one Xem nhanh shows

CSS = QV_CSS + """
  .card.hover { box-shadow: 0 2px 10px rgb(20 20 19 / .06); border-color: #DCDCD8; }
  .pill { box-shadow: 0 1px 2px rgb(20 20 19 / .08), 0 0 0 1px rgb(20 20 19 / .04); }
  .clamp3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
"""

# The mouse pointer over the hovered card.
CURSOR = """<svg width="22" height="24" viewBox="0 0 22 24" class="pointer-events-none absolute z-50" style="{pos}">
  <path d="M5 2.5v14.2l3.4-3 2.3 5.4 2.6-1.1-2.3-5.3h4.6z" fill="#1A1A19" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>"""


def out(title, body):
    from build_k2 import out as k2_out
    return k2_out(title, body).replace("</style>", CSS + "</style>", 1)


def card(i, *, hover=False, on=False, pill=False, size=15, L=None):
    p, pr, t, c, km, a = LAPTOPS[i % len(LAPTOPS)]
    place = km if float(km.split()[0].replace(".", "").replace(",", ".")) < 10 else a
    quick = (L.a("pill absolute bottom-2 left-2 z-10 flex h-8 items-center gap-1.5 rounded-full bg-white/95 pl-2.5 pr-3 text-[13px] font-medium",
                 ri("eye-line", 15) + "Xem nhanh") if pill else "")
    state = " hover" if hover else " on" if on else ""
    return f"""<article class="card{state} relative min-w-0 p-2">
  <div class="relative overflow-hidden rounded-[11px] bg-soft" style="aspect-ratio:1/1"><img src="{img(p, 360, 360)}" alt="" class="h-full w-full object-cover">
    <span class="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-[0_1px_2px_rgb(20_20_19/.08)]">{ri("heart-line", 16)}</span>
    {quick}</div>
  <div class="px-1.5 pb-1 pt-2.5">
    <p class="num text-[{size + 1}px] font-semibold tracking-tight">{pr}</p>
    <p class="clamp2 mt-0.5 min-h-[40px] text-[14px] leading-5">{escape(t)}</p>
    <p class="meta mt-1.5">{c} · {place}</p>
  </div>
</article>"""


def results(L, cards, over=""):
    """Tìm kiếm at 1280 as it is live: filters, then four columns of results."""
    return f"""<div class="relative">{bar(L)}
<div class="mx-auto max-w-[1280px] px-8 pt-6">
  <div class="flex items-end justify-between">
    <div><h1 class="text-[28px] font-semibold leading-9 tracking-[-0.02em]">“laptop”</h1><p class="mt-1 text-[14px] mute">Tìm laptop để bán hoặc mua trong danh mục Máy tính.</p></div>
    <span class="flex h-10 items-center gap-1.5 rounded-[10px] bg-brand px-4 text-[14px] font-medium text-white">{ri("notification-3-line", 16)}Báo khi có tin mới</span>
  </div>
  <div class="mt-6 grid grid-cols-[256px_1fr] gap-8">
    {filters()}
    <main class="relative min-w-0">
      {toolbar()}
      <div class="mt-5 grid grid-cols-4 gap-4">{cards}</div>
      {over}
    </main>
  </div>
</div></div>"""


# ------------------------------------------------------------ A. popup --
def popup(L):
    p, pr, t, c, km, a = LAPTOPS[HOVER]
    name, face, rate = SELLER
    thumbs = "".join(f'<img src="{img(g, 120, 120)}" alt="" class="h-12 w-12 rounded-[8px] object-cover {"ring-2 ring-[#066A61]" if i == 0 else "opacity-80"}">'
                     for i, g in enumerate(GALLERY))
    # Beside the hovered card (column 2), over columns 3 and 4.
    return f"""<section aria-label="Xem trước" class="shadow-pop absolute z-40 w-[372px] overflow-hidden rounded-[16px] bg-white" style="left:{236 + 236 - 12}px;top:84px">
      <span class="absolute -left-[7px] top-[120px] h-3.5 w-3.5 rotate-45 bg-white shadow-[-1px_1px_0_rgb(20_20_19/.06)]"></span>
      <div class="p-3">
        <img src="{img(GALLERY[0], 720, 470)}" alt="" class="w-full rounded-[11px] object-cover" style="aspect-ratio:16/10.5">
        <div class="mt-2 flex gap-2">{thumbs}</div>
      </div>
      <div class="px-4 pb-4">
        <p class="flex items-center gap-2 meta"><span class="rounded-[4px] bg-mint px-1.5 py-0.5 font-medium text-on-mint">{c}</span>{km} · 2 giờ trước</p>
        <h2 class="mt-2 text-[16px] font-semibold leading-6">{escape(t)}</h2>
        <p class="num mt-1 text-[22px] font-semibold tracking-[-0.02em]">{pr}</p>
        <p class="clamp3 mt-2 text-[13px] leading-5 mute">{DESC}</p>
        <div class="mt-3 flex items-center gap-2.5 border-t bd pt-3">
          <img src="{img(face, 64, 64)}" alt="" class="h-8 w-8 rounded-full object-cover">
          <span class="min-w-0 flex-1"><span class="block text-[13px] font-medium">{name}</span><span class="meta flex items-center gap-1">{ri("star-fill", 12, "text-[#E0A23B]")}{rate} · 14 đã bán</span></span>
        </div>
      </div>
    </section>"""


def a_popup():
    L = Ids("qv2-a")
    cards = "".join(card(i, hover=i == HOVER) for i in range(8))
    over = popup(L) + CURSOR.format(pos="left:330px;top:250px")
    return out("Xem nhanh · A. Hover hiện popup", results(L, cards, over))


# --------------------------------------------------- B. pill and drawer --
def b_hover():
    L = Ids("qv2-bh")
    cards = "".join(card(i, hover=i == HOVER, pill=i == HOVER, L=L) for i in range(8))
    return out("Xem nhanh · B. Nút Xem nhanh", results(L, cards, CURSOR.format(pos="left:330px;top:250px")))


def b_open():
    L = Ids("qv2-bo")
    cards = "".join(card(i, on=i == HOVER) for i in range(8))
    page = results(L, cards)
    # A light scrim under the header; the drawer floats over the right of the results.
    over = f"""<div class="fixed inset-x-0 bottom-0 top-[65px] z-20 bg-black/20"></div>
<div class="fixed bottom-3 right-3 top-[76px] z-40 w-[400px]">{panel(Ids("qv2-bop"))}</div>"""
    return out("Xem nhanh · B. Lớp phủ mở", page + over)


def b_phone():
    L = Ids("qv2-bp")
    hdr = f"""<header class="border-b bd bg-[var(--bg)]">
  <div class="flex h-16 items-center gap-2 px-4">
    <img src="{LOGO}" alt="" class="h-8 w-8">
    <div class="ml-1 flex h-10 min-w-0 flex-1 items-center gap-2 rounded-[10px] bg-white pl-3 shadow-[inset_0_0_0_1px_#DCDCD8]">{ri("search-line", 17, "mute")}<span class="text-[14px]">laptop</span></div>
    {L.a("grid h-10 w-10 place-items-center", ri("notification-3-line", 20), "Thông báo")}
  </div>
</header>"""
    cards = "".join(card(i, size=14) for i in range(6))
    body = f"""<div class="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-[var(--bg)]">
  {hdr}
  <main class="px-4 pt-4">
    <h1 class="text-[22px] font-semibold tracking-[-0.02em]">“laptop”</h1>
    {L.a("btn-o mt-3 inline-flex h-9 items-center gap-1.5 rounded-[10px] px-3.5 text-[14px] font-medium", ri("equalizer-line", 16) + "Bộ lọc")}
    <div class="mt-4 grid grid-cols-2 gap-3">{cards}</div>
  </main>
</div>"""
    return out("Xem nhanh · B. điện thoại", body)


# ---------------------------------------------------- C. today's panel --
def c_push():
    return push_panel_page().replace("<title>Xem nhanh · Tìm kiếm</title>", "<title>Xem nhanh · C. Panel đẩy lưới (hiện tại)</title>", 1)


if __name__ == "__main__":
    for name, fn in [("a", a_popup), ("b-hover", b_hover), ("b-open", b_open), ("b-phone", b_phone), ("c", c_push)]:
        with open(os.path.join(OUT, f"quick-view-2-{name}.html"), "w") as f:
            f.write(fn())
        print("wrote quick-view-2", name)
