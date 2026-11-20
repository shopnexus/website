"""Chia sẻ on a listing: the button opens the providers people in Vietnam use
instead of only copying the link. A popover under the button on a wide window,
a bottom sheet on a phone. The listing's photo, title and price sit on top.

    python3 tools/build_share_sheet.py        (run from .superdesign/)

Writes mockups/share-sheet-desktop.html (K2 Chi tiết tin, popover open) and
mockups/share-sheet-phone.html (390 px, sheet open). The brand glyphs are in
tools/share_marks.json, the same paths as the site's src/lib/share-marks.ts.
"""
import json
import os
from html import escape

from build import OUT, PHOTOS, PRICE, TITLE
from build_k2 import S, detail, out, ri
from build_quiet import link
from common import LOGO
from j_kit import CSS as J_CSS  # noqa: F401  (the J kit's tokens; K2 restyles them)

MARKS = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "share_marks.json")))
URL = "shopnexus.vn/listings/iphone-13-pro-128gb-18234"
# Brand fills on the marks only; the sheet itself stays neutral and teal.
FILL = {"zalo": "#0068FF", "facebook": "#0866FF", "messenger": "linear-gradient(200deg,#FF6968,#A334FA 50%,#0695FF)",
        "telegram": "#2AABEE", "x": "#000"}
LABEL = {"zalo": "Zalo", "facebook": "Facebook", "messenger": "Messenger", "telegram": "Telegram", "x": "X", "email": "Email", "more": "Khác"}

CSS = """
  .shadow-pop { box-shadow: 0 12px 32px -8px rgb(20 20 19 / .16), 0 0 0 1px rgb(20 20 19 / .05); }
  .share-item:hover { background: #EEEEEB; }
  .share-item:focus-visible { outline: 2px solid #066A61; outline-offset: 2px; }
"""


def mark(key, size):
    glyph = 24 if key != "zalo" else 30
    g = round(size * glyph / 44)
    if key in FILL:
        inner = f'<svg viewBox="0 0 24 24" width="{g}" height="{g}" aria-hidden="true">{MARKS[key]}</svg>'
        return f'<span class="grid shrink-0 place-items-center rounded-full text-white" style="width:{size}px;height:{size}px;background:{FILL[key]}">{inner}</span>'
    ic = {"email": "mail-line", "more": "more-line", "copy": "link", "copied": "check-line"}[key]
    tone = "bg-mint text-[#05554E]" if key == "copied" else "bg-soft"
    return f'<span class="grid shrink-0 place-items-center rounded-full {tone}" style="width:{size}px;height:{size}px">{ri(ic, round(size * 0.45))}</span>'


def item(key, size):
    return (f'<button type="button" role="menuitem" class="share-item flex flex-col items-center gap-1.5 rounded-[10px] px-1 py-2">'
            f'{mark(key, size)}<span class="text-[12px] leading-4 mute">{LABEL[key]}</span></button>')


def preview(photo_size=48):
    return f"""<div class="flex items-center gap-3 rounded-[12px] bg-soft p-2 pr-3">
    <img src="{PHOTOS[0]}" alt="" class="shrink-0 rounded-[8px] object-cover" style="width:{photo_size}px;height:{photo_size}px">
    <div class="min-w-0 flex-1">
      <p class="truncate text-[14px] font-medium leading-5">{escape(TITLE)}</p>
      <p class="num text-[14px] font-semibold leading-5">{PRICE[0]} ₫</p>
    </div>
  </div>"""


def copy_row(copied=False):
    m = mark("copied" if copied else "copy", 32)
    text = "Đã sao chép" if copied else "Sao chép liên kết"
    return f"""<button type="button" role="menuitem" class="share-item flex h-12 w-full items-center gap-3 rounded-[10px] px-2 text-left">
    {m}<span class="shrink-0 text-[14px] {"font-medium text-[#05554E]" if copied else ""}">{text}</span>
    <span class="meta ml-auto min-w-0 truncate">{URL}</span>
  </button>"""


def panel(keys, cols, size, copied=False):
    grid = "".join(item(k, size) for k in keys)
    return f"""{preview()}
  <div class="grid gap-0.5 px-1 pb-1 pt-3" style="grid-template-columns:repeat({cols},minmax(0,1fr))">{grid}</div>
  <div class="mx-1 border-t bd"></div>
  <div class="px-1 pt-1">{copy_row(copied)}</div>"""


# ------------------------------------------------------------- desktop --
def desktop():
    html = detail().replace("</style>", CSS + "</style>", 1)
    share = '<button type="button" class="row flex h-8 items-center gap-1.5 rounded-[8px] px-2.5 text-[13px] mute">'
    i = html.index(share, html.index("Lưu</button>"))
    end = html.index("</button>", i) + len("</button>")
    pop = f"""<div class="relative">
      <button type="button" aria-haspopup="menu" aria-expanded="true" class="flex h-8 items-center gap-1.5 rounded-[8px] bg-[#EEEEEB] px-2.5 text-[13px] text-[var(--ink)]">{ri("share-line", 15)}Chia sẻ</button>
      <div role="menu" aria-label="Chia sẻ tin" class="shadow-pop absolute right-0 top-10 z-40 w-[352px] rounded-[20px] bg-white p-2">
  {panel(["zalo", "facebook", "telegram", "x", "email"], 5, 40)}
      </div>
    </div>"""
    return html[:i] + pop + html[end:]


# --------------------------------------------------------------- phone --
def phone():
    keys = ["zalo", "facebook", "messenger", "telegram", "x", "email", "more"]
    body = f"""<div class="relative h-[844px] w-[390px] overflow-hidden bg-[var(--bg)]">
  <header class="flex h-16 items-center gap-3 border-b bd px-4">
    <img src="{LOGO}" alt="" class="h-8 w-8">
    <div class="flex h-10 flex-1 items-center gap-2 rounded-[10px] bg-white pl-3 shadow-[inset_0_0_0_1px_#DCDCD8]">{ri("search-line", 17, "mute")}<span class="text-[14px] mute">Tìm iPhone, xe đạp…</span></div>
    {link("p-login", "flex h-10 items-center rounded-[10px] btn-o px-3 text-[14px] font-medium", "Đăng nhập")}
  </header>
  <div class="flex items-center gap-1 px-4 pt-4">
    <p class="meta min-w-0 flex-1 truncate">Khám phá › Điện thoại › {escape(TITLE)}</p>
    <span class="grid h-8 w-8 place-items-center mute">{ri("heart-line", 16)}</span>
    <span class="grid h-8 w-8 place-items-center rounded-[8px] bg-[#EEEEEB]">{ri("share-line", 16)}</span>
  </div>
  <div class="mx-4 mt-3 card p-2"><img src="{PHOTOS[0]}" alt="" class="aspect-[4/3] w-full rounded-[11px] object-cover"></div>
  <div class="mx-4 mt-4 card p-5">
    <h1 class="text-[20px] font-semibold leading-7">{escape(TITLE)}</h1>
    <p class="num mt-2 text-[28px] font-semibold">{PRICE[0]} ₫</p>
  </div>
  <div class="absolute inset-0 bg-black/30"></div>
  <section role="dialog" aria-label="Chia sẻ tin" class="absolute inset-x-0 bottom-0 rounded-t-[20px] bg-white px-3 pb-6 pt-2">
    <span class="mx-auto mb-3 block h-1 w-8 rounded-full bg-[#8C8C87]/50"></span>
  {panel(keys, 4, 48)}
  </section>
</div>"""
    return out("Chia sẻ · ShopNexus", body).replace("</style>", CSS + "</style>", 1)


if __name__ == "__main__":
    for name, fn in [("share-sheet-desktop", desktop), ("share-sheet-phone", phone)]:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(fn())
        print("wrote", name)
