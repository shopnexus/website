"""Three header directions for the website, in K2. Every one puts the avatar
last on the right, gives it a menu, and opens a panel under the search field.
  A "Một hàng": one 64 px row, Danh mục button, icon-only Thông báo and Tin nhắn.
  B "Hai hàng": search row, then a 40 px row of categories and text links.
  C "Nhãn":     one 64 px row, each action an icon with a small label under it.

    python3 tools/build_header.py        (run from .superdesign/)

Writes mockups/header-{a,b,c}.html, one board per direction.
"""
import os

from build import OUT
from build_k2 import CATS, ME, card, out, ri
from common import LISTINGS, LOGO, img

BTN = "relative grid h-10 w-10 place-items-center rounded-[10px] row"
BADGE = '<span class="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full border-2 border-[var(--bg)] bg-brand px-1 text-[10.5px] font-semibold leading-none text-white">{n}</span>'
DOT = '<span class="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[var(--bg)] bg-[#DC2626]"></span>'
FIELD = "flex h-10 min-w-0 flex-1 items-center gap-2 rounded-[10px] bg-white pl-3 pr-1 shadow-[inset_0_0_0_1px_#DCDCD8]"
FOCUS = "flex h-10 min-w-0 flex-1 items-center gap-2 rounded-[10px] bg-white pl-3 pr-1 shadow-[inset_0_0_0_1.5px_#066A61,0_0_0_4px_rgb(6_106_97/.10)]"
SELL = "flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] bg-brand px-4 text-[14px] font-medium text-white"
POP = "absolute z-40 rounded-[14px] border bd bg-white shadow-[0_12px_32px_rgb(20_20_19/.12),0_2px_6px_rgb(20_20_19/.06)]"


class Ids:
    """Unique anchor ids across the board."""

    def __init__(self, prefix):
        self.p, self.n = prefix, 0

    def a(self, cls, inner, label=""):
        self.n += 1
        aria = f' aria-label="{label}"' if label else ""
        return f'<a id="{self.p}-{self.n}" href="#{self.p}-{self.n}" class="{cls}"{aria}>{inner}</a>'


def logo(L, short=False):
    word = "" if short else '<span class="text-[16px] font-semibold tracking-tight">ShopNexus</span>'
    return L.a("flex shrink-0 items-center gap-2 pr-1", f'<img src="{LOGO}" alt="" class="h-8 w-8">{word}', "ShopNexus")


def search(focused=False, wide=""):
    return f"""<form class="{FOCUS if focused else FIELD} {wide}">
      {ri("search-line", 17, "mute")}
      <input class="h-full min-w-0 flex-1 bg-transparent text-[14px] outline-none" placeholder="Tìm iPhone, xe đạp, sofa…">
      <span class="rounded-[6px] border bd px-1.5 text-[11px] leading-[18px] mute">/</span>
      <button type="button" class="grid h-8 w-8 place-items-center rounded-[8px] mute row" aria-label="Tìm bằng ảnh">{ri("camera-line", 17)}</button>
    </form>"""


def avatar(L, open_=False):
    ring = "shadow-[0_0_0_2px_#066A61]" if open_ else ""
    return L.a(f"flex h-10 shrink-0 items-center gap-1 rounded-full pl-1 pr-1.5 row {'bg-[#EEEEEB]' if open_ else ''}",
               f'<img src="{img(ME, 64, 64)}" alt="" class="h-8 w-8 rounded-full object-cover {ring}">' + ri("arrow-down-s-line", 16, "mute"),
               "Tài khoản")


def menu(L, right="0"):
    items = [("file-list-3-line", "Đơn mua", "2"), ("store-2-line", "Đơn bán", ""), ("price-tag-3-line", "Tin của bạn", "5"),
             ("heart-line", "Đã lưu", ""), ("customer-service-2-line", "Hỗ trợ", "")]
    rows = "".join(L.a("flex h-10 items-center gap-3 rounded-[8px] px-3 text-[14px] row",
                       ri(i, 18, "mute") + f'<span class="flex-1">{t}</span>' + (f'<span class="meta num">{n}</span>' if n else ""))
                   for i, t, n in items)
    return f"""<div class="{POP} top-[60px] w-[300px] p-2" style="right:{right}">
  {L.a("flex items-center gap-3 rounded-[10px] p-2 row", f'<img src="{img(ME, 96, 96)}" alt="" class="h-11 w-11 rounded-full object-cover"><span class="min-w-0 flex-1"><span class="block text-[15px] font-medium">Ngọc Anh</span><span class="meta block">Xem hồ sơ · ★ 4,9</span></span>' + ri("arrow-right-s-line", 18, "mute"))}
  <div class="my-1.5 h-px bg-[#ECECE9]"></div>
  {rows}
  <div class="my-1.5 h-px bg-[#ECECE9]"></div>
  <div class="flex h-10 items-center gap-3 px-3 text-[14px]">{ri("contrast-2-line", 18, "mute")}<span class="flex-1 whitespace-nowrap">Giao diện</span>
    <span class="flex rounded-[8px] bg-soft p-0.5 text-[12px]"><span class="rounded-[6px] bg-white px-2 py-0.5 shadow-[0_1px_2px_rgb(20_20_19/.08)]">Sáng</span><span class="px-2 py-0.5 mute">Tối</span><span class="px-2 py-0.5 mute">Tự động</span></span></div>
  {L.a("flex h-10 items-center gap-3 rounded-[8px] px-3 text-[14px] text-[#B42318] row", ri("logout-box-r-line", 18) + "Đăng xuất")}
</div>"""


def suggest(L, left, width):
    recent = ["iphone 13 pro", "xe đạp fixed", "sofa da", "macbook air m1"]
    chips = "".join(L.a("flex h-8 items-center gap-1.5 rounded-full bg-soft pl-2.5 pr-3 text-[13px] row", ri("history-line", 14, "mute") + r) for r in recent)
    cats = "".join(L.a("flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[14px] row", ri(i, 18, "mute") + f'<span class="flex-1">{t}</span><span class="meta num">{n}</span>')
                   for i, t, n in CATS[:6])
    return f"""<div class="{POP} top-[58px] p-3" style="left:{left};width:{width}">
  <div class="flex items-center justify-between px-1"><p class="meta">Tìm gần đây</p>{L.a("meta hover:underline", "Xóa")}</div>
  <div class="mt-2 flex flex-wrap gap-2 px-1">{chips}</div>
  <div class="my-3 h-px bg-[#ECECE9]"></div>
  <p class="meta px-1">Danh mục</p>
  <div class="mt-1 grid grid-cols-2 gap-x-2">{cats}</div>
  <div class="my-3 h-px bg-[#ECECE9]"></div>
  {L.a("flex items-center gap-3 rounded-[10px] px-2.5 py-2 text-[14px] row", '<span class="grid h-8 w-8 place-items-center rounded-[8px] bg-mint text-brand">' + ri("camera-line", 17) + '</span><span class="flex-1">Tìm bằng ảnh<span class="meta block">Chụp hoặc tải ảnh món đồ</span></span>' + ri("arrow-right-s-line", 18, "mute"))}
</div>"""


def mega(L):
    cells = "".join(L.a("flex items-center gap-3 rounded-[10px] p-2.5 row", f'<span class="grid h-9 w-9 place-items-center rounded-[10px] bg-soft">{ri(i, 19)}</span><span><span class="block text-[14px]">{t}</span><span class="meta num">{n} tin</span></span>')
                    for i, t, n in CATS)
    return f"""<div class="{POP} left-[150px] top-[58px] w-[560px] p-3">
  <div class="grid grid-cols-2 gap-1">{cells}</div>
  <div class="mt-2 border-t bd px-2 pt-3">{L.a("text-[13px] font-medium text-brand hover:underline", "Xem tất cả danh mục")}</div>
</div>"""


def tip(text, left):
    return f'<div class="absolute top-[56px] z-40 rounded-[8px] bg-[#1A1A19] px-2 py-1 text-[12px] text-white" style="left:{left}">{text}</div>'


# ------------------------------------------------------------- directions --
def bar_a(L, w, *, signed=True, focus=False, menu_open=False, cats_open=False):
    narrow = w < 1200
    cats_btn = L.a(f"flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] px-3 text-[14px] row {'bg-[#EEEEEB]' if cats_open else ''}",
                   ri("apps-2-line", 18) + ("" if narrow else "Danh mục") + ri("arrow-down-s-line", 16, "mute"), "Danh mục")
    if signed:
        acts = (L.a(BTN, ri("heart-line", 19), "Đã lưu") + L.a(BTN, ri("notification-3-line", 19) + DOT, "Thông báo")
                + L.a(BTN, ri("chat-3-line", 19) + BADGE.format(n=3), "Tin nhắn, 3 chưa đọc")
                + f'<span class="mx-1.5 h-6 w-px bg-[#DCDCD8]"></span>' + L.a(SELL, ri("add-line", 17) + "Đăng tin") + avatar(L, menu_open))
    else:
        acts = (L.a(SELL, ri("add-line", 17) + "Đăng tin")
                + L.a("btn-o flex h-10 shrink-0 items-center rounded-[10px] px-4 text-[14px] font-medium", "Đăng nhập"))
    return f"""<header class="relative border-b bd bg-[var(--bg)]">
  <div class="mx-auto flex h-16 items-center gap-3 px-8">
    {logo(L, narrow)}{cats_btn}<div class="flex min-w-0 flex-1 justify-center">{search(focus, "max-w-[720px]")}</div>
    <nav class="flex shrink-0 items-center gap-1">{acts}</nav>
  </div>
  {suggest(L, "300px" if not narrow else "200px", "640px") if focus else ""}
  {menu(L, "32px") if menu_open else ""}
  {mega(L) if cats_open else ""}
</header>"""


def bar_b(L, w, *, signed=True, focus=False, menu_open=False, **_):
    narrow = w < 1200
    links = "".join(L.a("shrink-0 hover:text-[var(--ink)]", t) for _, t, _ in CATS[: 6 if narrow else 9])
    if signed:
        right = (L.a("flex items-center gap-1.5 hover:text-[var(--ink)]", ri("heart-line", 16) + "Đã lưu")
                 + L.a("relative flex items-center gap-1.5 hover:text-[var(--ink)]", ri("notification-3-line", 16) + 'Thông báo<span class="h-1.5 w-1.5 rounded-full bg-[#DC2626]"></span>')
                 + L.a("flex items-center gap-1.5 font-medium text-[var(--ink)]", ri("chat-3-line", 16) + 'Tin nhắn<span class="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[10.5px] font-semibold text-white">3</span>'))
        top = L.a(SELL, ri("add-line", 17) + "Đăng tin") + avatar(L, menu_open)
    else:
        right = L.a("hover:text-[var(--ink)]", "Cách mua") + L.a("hover:text-[var(--ink)]", "Trợ giúp")
        top = L.a(SELL, ri("add-line", 17) + "Đăng tin") + L.a("btn-o flex h-10 items-center rounded-[10px] px-4 text-[14px] font-medium", "Đăng nhập")
    return f"""<header class="relative border-b bd bg-[var(--bg)]">
  <div class="mx-auto flex h-16 items-center gap-4 px-8">
    {logo(L)}{search(focus, "max-w-[760px]")}
    <div class="ml-auto flex shrink-0 items-center gap-2">{top}</div>
  </div>
  <div class="mx-auto flex h-10 items-center gap-6 px-8 text-[13.5px] mute">
    {L.a("flex shrink-0 items-center gap-1.5 font-medium text-[var(--ink)]", ri("menu-line", 16) + "Tất cả danh mục")}
    <span class="h-4 w-px bg-[#DCDCD8]"></span>
    <div class="flex min-w-0 flex-1 gap-5 overflow-hidden">{links}</div>
    <div class="flex shrink-0 items-center gap-5">{right}</div>
  </div>
  {suggest(L, "200px", "640px") if focus else ""}
  {menu(L, "32px") if menu_open else ""}
</header>"""


def stack(L, icon, label, extra="", on=False):
    return L.a(f"relative flex h-14 w-[64px] shrink-0 flex-col items-center justify-center gap-0.5 rounded-[10px] row {'bg-[#EEEEEB]' if on else ''}",
               f'<span class="relative">{ri(icon, 20)}{extra}</span><span class="text-[11.5px] leading-4 mute">{label}</span>', label)


def bar_c(L, w, *, signed=True, focus=False, menu_open=False, cats_open=False):
    narrow = w < 1200
    badge = '<span class="absolute -right-2.5 -top-1.5 grid h-[16px] min-w-[16px] place-items-center rounded-full bg-brand px-1 text-[10px] font-semibold leading-none text-white">3</span>'
    dot = '<span class="absolute -right-0.5 top-0 h-2 w-2 rounded-full border-2 border-[var(--bg)] bg-[#DC2626]"></span>'
    if narrow:
        st = lambda i, t, e="", on=False: L.a(f"{BTN} {'bg-[#EEEEEB]' if on else ''}", ri(i, 19) + e.replace("-right-2.5 -top-1.5", "-right-0.5 -top-0.5").replace("-right-0.5 top-0", "right-2 top-2"), t)
    else:
        st = lambda i, t, e="", on=False: stack(L, i, t, e, on)
    acts = st("apps-2-line", "Danh mục", on=cats_open)
    if signed:
        acts += st("heart-line", "Đã lưu") + st("notification-3-line", "Thông báo", dot) + st("chat-3-line", "Tin nhắn", badge)
        acts += f'<span class="mx-1.5 h-8 w-px bg-[#DCDCD8]"></span>' + L.a(SELL, ri("add-line", 17) + "Đăng tin") + avatar(L, menu_open)
    else:
        acts += st("question-line", "Cách mua") + f'<span class="mx-1.5 h-8 w-px bg-[#DCDCD8]"></span>' + L.a(SELL, ri("add-line", 17) + "Đăng tin") + L.a("btn-o flex h-10 items-center rounded-[10px] px-4 text-[14px] font-medium", "Đăng nhập")
    return f"""<header class="relative border-b bd bg-[var(--bg)]">
  <div class="mx-auto flex h-16 items-center gap-3 px-8">
    {logo(L, narrow)}{search(focus)}
    <nav class="flex shrink-0 items-center gap-0.5">{acts}</nav>
  </div>
  {suggest(L, "200px" if not narrow else "80px", "600px") if focus else ""}
  {menu(L, "32px") if menu_open else ""}
  {mega(L).replace("left-[150px]", "right-[330px]") if cats_open else ""}
</header>"""


# ------------------------------------------------------------------ board --
def under(n=5, wide=False):
    cards = "".join(card(i, *r[:6]) for i, r in enumerate((LISTINGS * 2)[:n]))
    return f'<div class="mx-auto px-8 pt-6 {"max-w-[1280px]" if wide else ""}"><h2 class="text-[17px] font-semibold">Mới đăng gần bạn</h2><div class="mt-4 grid gap-3" style="grid-template-columns:repeat({n},minmax(0,1fr))">{cards}</div></div>'


def frame(bar, L, caption, w=1280, h=300, **kw):
    n = 5 if w >= 1200 else 4
    inner = f'<div class="relative overflow-hidden rounded-[16px] border bd bg-[var(--bg)]" style="width:{w}px;height:{h}px">{bar(L, w, **kw)}{under(n, w > 1280)}</div>'
    if w > 1280:  # drawn at 1280 / w so it fits the board
        k = 1280 / w
        inner = f'<div style="width:1280px;height:{h * k:.0f}px"><div style="transform:scale({k:.4f});transform-origin:0 0">{inner}</div></div>'
    return f"""<section class="mt-12">
  <p class="text-[13px] font-medium">{caption}</p>
  <div class="mt-3">{inner}</div>
</section>"""


def board(key, name, why, bar):
    L = Ids(key)
    body = f"""<div class="mx-auto w-[1376px] px-12 py-14">
  <p class="meta">Header · K2</p>
  <h1 class="mt-1 text-[28px] font-semibold tracking-tight">{name}</h1>
  <p class="mt-2 max-w-[760px] text-[14px] mute">{why}</p>
  {frame(bar, L, "Đã đăng nhập · 1280", h=260)}
  {frame(bar, L, "Màn 1920 · header full màn, nội dung vẫn 1280", w=1920, h=300) if bar is bar_a else ""}
  {frame(bar, L, "Bấm vào ô tìm kiếm", h=560, focus=True)}
  {frame(bar, L, "Bấm vào avatar", h=560, menu_open=True)}
  {frame(bar, L, "Danh mục", h=520, cats_open=True) if bar is not bar_b else ""}
  {frame(bar, L, "Chưa đăng nhập", h=260, signed=False)}
  {frame(bar, L, "Màn 1024", w=1024, h=260)}
</div>"""
    return out(f"Header · {name}", body)


DIRECTIONS = [
    ("a", "A. Một hàng", "Một hàng 64 px. Danh mục thành nút mở bảng. Đã lưu, Thông báo, Tin nhắn là ba icon cùng kiểu với số đếm; Đăng tin rồi avatar ở ngoài cùng.", bar_a),
    ("b", "B. Hai hàng", "Hàng trên chỉ có tìm kiếm, Đăng tin và avatar. Hàng dưới 40 px là các danh mục bên trái và Đã lưu, Thông báo, Tin nhắn bằng chữ bên phải. Header cao 104 px.", bar_b),
    ("c", "C. Nhãn dưới icon", "Một hàng 64 px. Mỗi hành động là icon có nhãn nhỏ bên dưới, dễ đoán hơn icon trơn. Màn hẹp thì bỏ nhãn.", bar_c),
]

if __name__ == "__main__":
    for key, name, why, bar in DIRECTIONS:
        with open(os.path.join(OUT, f"header-{key}.html"), "w") as f:
            f.write(board(key, name, why, bar))
        print("wrote header", key)
