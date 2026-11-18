"""Calmer Home, three directions for the signed-in buyer. Same J dress
(j_kit), far fewer blocks than build_j.home():

  A  Lặng      centred search, one quiet "cần bạn" line, a plain 4-column feed
  B  Gọn hai   search left, the two things waiting on the buyer right, then the feed
  C  Bảng tin  a short top, then a roomy 3-column feed with big photos

Dropped from all three: the category chips (Danh mục is in the header), the
"vừa đăng quanh bạn" panel, the trending sidebar, the post nudge (Đăng tin is
in the header) and the feed's caption.

    python3 tools/build_j_calm.py        (run from .superdesign/)
"""
import os
from html import escape

from build import OUT, a
from build_e import FOR_YOU
from common import LISTINGS, icon, img, where
from j_kit import ME, footer, header, page, price, seg

FEED = FOR_YOU + LISTINGS[:6]
ORDER, OFFER = LISTINGS[7], LISTINGS[5]
RECENT = ["Sony A7 III dưới 25 triệu", "iPhone 13 pin trên 85%", "xe đạp cho bé 8 tuổi"]


def search_box(cls=""):
    return f"""<div class="flex h-16 items-center gap-3 rounded-full bg-white pl-6 pr-2 glow {cls}">
  {icon("search-rounded", 24, "text-primary")}
  <span class="flex-1 text-left text-title-m font-normal text-on-surface-variant">Bạn đang tìm gì?</span>
  <button type="button" class="state grid h-11 w-11 place-items-center rounded-full text-on-surface-variant" aria-label="Tìm bằng ảnh">{icon("photo-camera-outline-rounded", 22)}</button>
  <button type="button" class="state h-12 rounded-full bg-primary px-7 text-label-l text-on-primary">Tìm</button>
</div>"""


def recent_links(cls=""):
    return f'<div class="flex flex-wrap items-center gap-x-5 gap-y-2 {cls}">' + "".join(
        a(f"recent-{i}", "flex items-center gap-1.5 text-body-m text-on-surface-variant hover:text-[var(--ink)]",
          f'{icon("history-rounded", 16)}{t}') for i, t in enumerate(RECENT)) + "</div>"


def calm_card(item, i, ratio="1 / 1", big=False):
    """No frame: the photo, the price, one line of title, the place."""
    photo, p, title, _, km, area = item[:6]
    w = 720 if big else 480
    return a(f"item-{i}", "card group block min-w-0", f"""<div class="relative overflow-hidden rounded-[20px] bg-surface-container-high" style="aspect-ratio: {ratio}">
    <img src="{img(photo, w, round(w * (1.25 if big else 1)))}" alt="{escape(title)}" class="h-full w-full object-cover">
    <span class="absolute right-2.5 top-2.5 grid h-8 w-8 place-items-center rounded-full bg-white/85 text-on-surface opacity-0 backdrop-blur transition group-hover:opacity-100">{icon("favorite-outline-rounded", 18)}</span>
  </div>
  <div class="px-1 pt-3">
    {price(p, "text-[20px] leading-7" if big else "text-[17px] leading-6")}
    <p class="mt-0.5 truncate text-body-m ink">{escape(title)}</p>
    <p class="mt-0.5 text-body-s text-on-surface-variant">{where(km, area)}</p>
  </div>""")


def more_button():
    return '<div class="mt-12 flex justify-center"><button type="button" class="state h-11 rounded-full border line bg-white px-6 text-label-l ink">Xem thêm tin</button></div>'


# ------------------------------------------------------------------- A Lặng --
def calm_a():
    waiting = f"""<div class="mx-auto mt-10 flex max-w-[720px] items-center gap-3 rounded-full border line bg-white/80 py-2 pl-2 pr-2 backdrop-blur">
  <img src="{img(OFFER[0], 96, 96)}" alt="" class="h-10 w-10 shrink-0 rounded-full object-cover">
  <p class="min-w-0 flex-1 truncate text-body-m ink">Người bán trả lại <b class="num font-semibold text-tertiary">4.500.000 ₫</b> cho {escape(OFFER[2])}</p>
  {a("reply", "state shrink-0 rounded-full bg-tertiary px-4 py-2 text-label-l text-on-tertiary", "Trả lời")}
</div>"""
    body = f"""{header(active=0)}
<main class="mx-auto max-w-[1200px] px-8">
  <section class="pb-6 pt-24 text-center">
    <p class="text-label-l text-on-surface-variant">Chào buổi tối, {ME["name"]}</p>
    <h1 class="mt-2 text-[56px] font-semibold leading-[64px] tighter ink">Hôm nay tìm gì?</h1>
    {search_box("mx-auto mt-8 max-w-[720px]")}
    {recent_links("mt-5 justify-center")}
    {waiting}
  </section>
  <section class="mt-24">
    <div class="flex items-baseline gap-6">
      <h2 class="text-[26px] font-semibold leading-8 tighter ink">Dành cho bạn</h2>
      {a("tab-near", "text-label-l text-on-surface-variant hover:text-[var(--ink)]", "Gần bạn")}
      {a("tab-new", "text-label-l text-on-surface-variant hover:text-[var(--ink)]", "Mới nhất")}
    </div>
    <div class="mt-6 grid grid-cols-4 gap-x-6 gap-y-10">{"".join(calm_card(it, i) for i, it in enumerate(FEED[:8]))}</div>
    {more_button()}
  </section>
</main>
{footer()}"""
    return page("ShopNexus · Đồ cũ giá tốt", body)


# ---------------------------------------------------------------- B Gọn hai --
def calm_b():
    def row(rid, lead, label, label_cls, line, end=""):
        return a(rid, "flex items-center gap-3 rounded-[18px] p-2 hover:bg-white/70",
                 f'{lead}<span class="min-w-0 flex-1"><span class="block text-label-m {label_cls}">{label}</span>'
                 f'<span class="mt-0.5 block truncate text-body-m ink">{line}</span></span>{end}')
    waiting = f"""<div class="glass glass-edge soft self-end rounded-[28px] p-3">
  <p class="px-2 pb-1 pt-1 text-title-s ink">Đang chờ bạn</p>
  {row("my-offer", f'<img src="{img(OFFER[0], 120, 120)}" alt="" class="h-14 w-14 shrink-0 rounded-[14px] object-cover">',
       "Người bán trả lại", "text-tertiary", f'<b class="num font-semibold">4.500.000 ₫</b> · {escape(OFFER[2])}',
       '<span class="shrink-0 rounded-full bg-tertiary px-3 py-1.5 text-label-m text-on-tertiary">Trả lời</span>')}
  {row("my-order", f'<img src="{img(ORDER[0], 120, 120)}" alt="" class="h-14 w-14 shrink-0 rounded-[14px] object-cover">',
       "Giao chiều nay", "text-primary", escape(ORDER[2]))}
</div>"""
    body = f"""{header(active=0)}
<main class="mx-auto max-w-[1280px] px-8">
  <section class="grid grid-cols-[1fr_400px] items-end gap-16 pb-4 pt-20">
    <div>
      <p class="text-label-l text-on-surface-variant">Chào buổi tối, {ME["name"]}</p>
      <h1 class="mt-2 text-[52px] font-semibold leading-[60px] tighter ink">Hôm nay tìm gì?</h1>
      {search_box("mt-8")}
      {recent_links("mt-5 pl-6")}
    </div>
    {waiting}
  </section>
  <section class="mt-20">
    {seg(["Dành cho bạn", "Gần bạn", "Mới nhất"], 0, "bg-black/[.05]")}
    <div class="mt-6 grid grid-cols-4 gap-x-6 gap-y-10">{"".join(calm_card(it, i) for i, it in enumerate(FEED[:8]))}</div>
    {more_button()}
  </section>
</main>
{footer()}"""
    return page("ShopNexus · Đồ cũ giá tốt", body)


# --------------------------------------------------------------- C Bảng tin --
def calm_c():
    pill = "glass glass-edge flex h-10 items-center gap-2 rounded-full pl-1 pr-4 text-label-l ink hover:bg-white"
    waiting = (a("my-offer", pill, f'<img src="{img(OFFER[0], 80, 80)}" alt="" class="h-8 w-8 rounded-full object-cover">'
                 f'Trả lại <b class="num font-semibold text-tertiary">4.500.000 ₫</b>')
               + a("my-order", pill, f'<img src="{img(ORDER[0], 80, 80)}" alt="" class="h-8 w-8 rounded-full object-cover">Giao chiều nay'))
    body = f"""{header(active=0)}
<main class="mx-auto max-w-[1120px] px-8">
  <section class="pt-14">
    <h1 class="text-[40px] font-semibold leading-[48px] tighter ink">Chào buổi tối, {ME["name"]}</h1>
    {search_box("mt-6")}
    <div class="mt-4 flex items-center gap-2">{waiting}</div>
  </section>
  <section class="mt-14">
    {seg(["Dành cho bạn", "Gần bạn", "Mới nhất"], 0, "bg-black/[.05]")}
    <div class="mt-6 grid grid-cols-3 gap-x-8 gap-y-12">{"".join(calm_card(it, i, "4 / 5", big=True) for i, it in enumerate(FEED[:9]))}</div>
    {more_button()}
  </section>
</main>
{footer()}"""
    return page("ShopNexus · Đồ cũ giá tốt", body)


if __name__ == "__main__":
    for name, fn in [("j-home-calm-a", calm_a), ("j-home-calm-b", calm_b), ("j-home-calm-c", calm_c)]:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(fn())
        print("wrote", name)
