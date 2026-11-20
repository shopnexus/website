"""A person card on hover: resting the pointer on a seller's or reviewer's
face or name (or focusing the link) shows who they are without leaving the
page: face, name, stars, sold count, the year they joined, Theo dõi and
Xem trang. Drawn over K2 Chi tiết tin. Touch screens get no card; a tap
opens the person's page as before.

    python3 tools/build_hover_card.py        (run from .superdesign/)

Writes mockups/hover-card-seller.html (over the seller card),
hover-card-review.html (over a review, already followed) and
hover-card-loading.html (the skeleton while the card loads).
"""
import os

from build import OUT
from build_k2 import REVIEWS, SELLERS, detail, ri
from common import img
from j_kit import LABEL  # noqa: F401  (the shared kit; K2 pieces come from build_k2)

CSS = """
  .shadow-pop { box-shadow: 0 12px 32px -8px rgb(20 20 19 / .16), 0 0 0 1px rgb(20 20 19 / .05); }
  .skel { background: #ECECE9; }
"""
POP = "shadow-pop absolute z-40 w-[320px] rounded-[20px] bg-white p-4 text-left"


def stars(n, size=13):
    return '<span class="flex">' + "".join(ri("star-fill", size, "text-[#E0A23B]" if i < n else "text-[#DCDCD8]") for i in range(5)) + "</span>"


def card(name, face, rating, count, sold, joined, following=False, place="top-[calc(100%+8px)] left-0"):
    """The card. The figures row takes one more cell later (reply time) without changing the layout."""
    figs = "".join(f'<div class="px-3 py-2"><p class="num text-[15px] font-semibold leading-5">{v}</p><p class="meta">{l}</p></div>'
                   for v, l in [(sold, "đã bán"), (joined, "tham gia")])
    follow = (f'<button type="button" aria-pressed="true" class="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-mint text-[14px] font-medium text-on-mint">{ri("user-follow-line", 16)}Đang theo dõi</button>'
              if following else
              f'<button type="button" aria-pressed="false" class="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-brand text-[14px] font-medium text-white">{ri("user-add-line", 16)}Theo dõi</button>')
    return f"""<div role="dialog" aria-label="{name}" class="{POP} {place}">
  <div class="flex items-center gap-3">
    <img src="{img(face, 112, 112)}" alt="" class="h-14 w-14 shrink-0 rounded-full object-cover">
    <div class="min-w-0 flex-1">
      <p class="truncate text-[16px] font-semibold leading-6">{name}</p>
      <p class="mt-0.5 flex items-center gap-1.5 text-[13px] leading-[18px]">{stars(5)}<span class="font-semibold">{rating}</span><span class="mute">· {count} đánh giá</span></p>
    </div>
  </div>
  <div class="mt-3 grid auto-cols-fr grid-flow-col divide-x divide-[#ECECE9] rounded-[10px] border bd">{figs}</div>
  <div class="mt-3 flex gap-2">
    {follow}
    <a id="hc-open" href="#seller" class="btn-o flex h-9 flex-1 items-center justify-center rounded-[10px] text-[14px] font-medium">Xem trang</a>
  </div>
</div>"""


def skeleton(place="top-[calc(100%+8px)] left-0"):
    bar = "skel block rounded-full"
    return f"""<div role="dialog" aria-label="Đang tải" aria-busy="true" class="{POP} {place}">
  <div class="flex items-center gap-3">
    <span class="skel block h-14 w-14 shrink-0 rounded-full"></span>
    <div class="min-w-0 flex-1"><span class="{bar} h-3.5 w-1/2"></span><span class="{bar} mt-2.5 h-3 w-3/4"></span></div>
  </div>
  <span class="skel mt-3 block h-[58px] rounded-[10px]"></span>
  <div class="mt-3 flex gap-2"><span class="skel block h-9 flex-1 rounded-[10px]"></span><span class="skel block h-9 flex-1 rounded-[10px]"></span></div>
</div>"""


LIVE_FIGS = ('<div class="mt-4 grid grid-cols-2 divide-x divide-[#ECECE9] rounded-[10px] border bd text-center">'
             + "".join(f'<div class="py-2.5"><p class="num text-[15px] font-semibold">{v}</p><p class="meta">{l}</p></div>' for v, l in [("4,9", "32 đánh giá"), ("14", "đã bán")])
             + "</div>")


def seller_row(pop):
    """The live seller card's head: face, name, joined, chevron; hovered."""
    name, face, _ = SELLERS[0]
    return f"""<div class="relative">
          <a id="hc-seller" href="#seller" class="-m-2 flex items-center gap-3 rounded-[10px] bg-[#EEEEEB] p-2">
            <img src="{img(face, 96, 96)}" alt="" class="h-11 w-11 rounded-full object-cover">
            <span class="min-w-0 flex-1"><span class="block truncate text-[15px] font-medium">{name}</span><span class="meta block">Tham gia 2023</span></span>
            {ri("arrow-right-s-line", 20, "mute")}
          </a>
          {pop}
        </div>"""


def page(pop_html, *, review=False):
    html = detail().replace("</style>", CSS + "</style>", 1)
    # The live listing has no COD list in the buy card, which puts the seller card higher.
    cod = html.index('<ul class="mt-5 flex flex-col gap-2 rounded-[12px] bg-soft p-3.5">')
    html = html[:cod] + html[html.index("</ul>", cod) + 5:]
    head_start = html.index('<div class="flex items-center gap-3">', html.index('<div class="card p-5">'))
    head_end = html.index('<div class="mt-4 grid grid-cols-3', head_start)
    # The live seller card has two figures.
    html = html.replace(html[head_end:html.index("</div></div>", html.index("10 phút", head_end)) + 12], LIVE_FIGS, 1)
    if not review:
        return html[:head_start] + seller_row(pop_html) + "\n        " + html[head_end:]
    # Scrolled to Đánh giá: the gallery and the first sections are above the window.
    html = html[:head_start] + seller_row("") + "\n        " + html[head_end:]
    main = html.index('<main class="flex min-w-0 flex-col gap-4">') + len('<main class="flex min-w-0 flex-col gap-4">')
    specs = html.index('<section class="card p-6"><div class="flex items-center justify-between"><h2 class="text-[17px] font-semibold">Thông số')
    html = html[:main] + html[specs:]
    name, face, *_ = REVIEWS[0]
    # The name line becomes a div so the card (a div) can sit inside it.
    start = html.index(f'<p class="flex items-center gap-2 text-[14px] font-medium">{name}')
    end = html.index("</p>", start)
    line = html[start:end].replace("<p ", "<div ", 1).replace(
        name, f'<span class="relative"><a id="hc-reviewer" href="#reviewer" class="text-[#066A61] underline">{name}</a>{pop_html}</span>', 1)
    return html[:start] + line + "</div>" + html[end + 4:]


# Under the seller card the window ends, so the card opens above it.
ABOVE = "bottom-[calc(100%+8px)] left-0"


def seller():
    name, face, rating = SELLERS[0]
    return page(card(name, face, rating, 32, 14, 2023, place=ABOVE)).replace("<title>", "<title>Thẻ người bán · ", 1)


def review():
    name, face, *_ = REVIEWS[0]
    return page(card(name, face, "4,7", 18, 9, 2022, following=True), review=True).replace("<title>", "<title>Thẻ người đánh giá · ", 1)


def loading():
    return page(skeleton(ABOVE)).replace("<title>", "<title>Thẻ người bán đang tải · ", 1)


if __name__ == "__main__":
    for name, fn in [("seller", seller), ("review", review), ("loading", loading)]:
        with open(os.path.join(OUT, f"hover-card-{name}.html"), "w") as f:
            f.write(fn())
        print("wrote hover-card", name)
