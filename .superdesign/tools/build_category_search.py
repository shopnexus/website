"""One search field on a category page. Today Mẹ & bé shows the header's field
and a big "Tìm trong Mẹ & bé" field under it. Three ways out, drawn over the
live K2 category page, then the header field's dropdown while typing and the
search page's skeleton after Enter.

  A "Phạm vi trong ô tìm": the header field carries a removable "Mẹ & bé" chip
    and searches inside it; the hero keeps the title, count and pills.
  B "Ẩn ô header": the page's own field stays; the header drops its field here.
  C "Lọc trong kết quả": a small filter field in the results toolbar.

    python3 tools/build_category_search.py        (run from .superdesign/)

Writes mockups/category-search-*.html. The listing photos are the dev API's
(the compose stack), cached as data URIs in tmp/category_search_photos.json.
"""
import base64
import json
import os
import urllib.request
from html import escape

from build import OUT
from build_header import Ids
from build_k2 import out, ri
from common import LOGO
from j_kit import LABEL  # noqa: F401  (the shared kit; K2 pieces come from build_k2/build_header)

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = os.path.join(HERE, "..", "tmp", "category_search_photos.json")
API = "http://api.shopnexus.localhost:56481/v1/search?category=baby&limit=8&sort=newest"
COND = {"new": "Mới", "like_new": "Như mới", "used": "Đã dùng"}
CAT, COUNT = "Mẹ & bé", "3.699"
PILLS = [("Tất cả", "3.699"), ("Xe đẩy", "97"), ("Đồ chơi", "1.962"), ("Quần áo bé", "151"), ("Ghế ăn", "68"), ("Khác", "1.421")]
CSS = """
  .shadow-pop { box-shadow: 0 12px 32px -8px rgb(20 20 19 / .16), 0 0 0 1px rgb(20 20 19 / .05); }
  .skel { background: linear-gradient(90deg, #ECECE9 0%, #F3F3F1 50%, #ECECE9 100%); }
  .field { box-shadow: inset 0 0 0 1px #DCDCD8; }
  .field-on { box-shadow: inset 0 0 0 1px #066A61; }
  .opt-on { background: #EEEEEB; }
"""


def listings():
    if os.path.exists(CACHE):
        return json.load(open(CACHE))
    items = json.load(urllib.request.urlopen(API))["items"]
    rows = []
    for it in items:
        raw = urllib.request.urlopen(it["cover_thumb_url"]).read()
        rows.append({"photo": "data:image/jpeg;base64," + base64.b64encode(raw).decode(), "title": it["title"],
                     "price": f'{it["price"]:,}'.replace(",", "."), "cond": COND[it["condition"]], "place": it["commune"]})
    os.makedirs(os.path.dirname(CACHE), exist_ok=True)
    json.dump(rows, open(CACHE, "w"), ensure_ascii=False)
    return rows


# ----------------------------------------------------------------- header --
def chip(L, short=False):
    """The scope chip at the start of the field; on a phone the icon stands for the name."""
    name = "" if short else f'<span class="whitespace-nowrap">{CAT}</span>'
    return (f'<span class="flex h-7 shrink-0 items-center gap-1 rounded-full bg-mint pl-2 pr-0.5 text-[13px] font-medium text-on-mint">'
            f'{ri("bear-smile-line", 15)}{name}'
            f'<button type="button" aria-label="Bỏ phạm vi {CAT}" class="grid h-6 w-6 place-items-center rounded-full hover:bg-[#05554E]/10">{ri("close-line", 14)}</button></span>')


def field(L, *, q="", scope=False, focus=False, phone=False, place="Tìm iPhone, xe đạp, sofa…"):
    """On a phone a scoped field leads with the chip's icon and leaves the camera to the dropdown."""
    ring = "field-on" if focus else "field"
    hint = f'Tìm trong {CAT}' if scope else place
    value = f' value="{escape(q)}"' if q else ""
    tight = phone and scope
    lead = "" if tight else ri("search-line", 17, "mute")
    kbd = "" if phone else '<span class="rounded-[6px] border bd px-1.5 text-[11px] leading-[18px] mute">/</span>'
    cam = "" if tight else f'<button type="button" class="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] mute row" aria-label="Tìm bằng ảnh">{ri("camera-line", 17)}</button>'
    return f"""<form class="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-[10px] bg-white {"pl-1.5 pr-2" if tight else "pl-3 pr-1"} {ring}">
      {lead}{chip(L, phone) if scope else ""}
      <input class="h-full min-w-0 flex-1 bg-transparent text-[14px] outline-none placeholder:text-[#8C8C87]" placeholder="{hint}"{value}>
      {kbd}{cam}
    </form>"""


def header(L, inner_field):
    cats = L.a("flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] px-3 text-[14px] font-medium row", ri("apps-2-line", 18) + "Danh mục" + ri("arrow-down-s-line", 16, "mute"))
    acts = (L.a("flex h-10 shrink-0 items-center gap-1.5 rounded-[10px] bg-brand px-4 text-[14px] font-medium text-white", ri("add-line", 17) + "Đăng tin")
            + L.a("btn-o ml-1 flex h-10 shrink-0 items-center rounded-[10px] px-4 text-[14px] font-medium", "Đăng nhập"))
    middle = f'<div class="flex min-w-0 flex-1 justify-center"><div class="flex w-full max-w-[720px]">{inner_field}</div></div>' if inner_field else '<span class="flex-1"></span>'
    return f"""<header class="sticky top-0 z-30 border-b bd bg-[var(--bg)]">
  <div class="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-8">
    {L.a("flex shrink-0 items-center gap-2 pr-1", f'<img src="{LOGO}" alt="" class="h-8 w-8"><span class="text-[16px] font-semibold tracking-tight">ShopNexus</span>', "ShopNexus")}
    {cats}{middle}
    <nav class="flex shrink-0 items-center gap-1">{acts}</nav>
  </div>
</header>"""


def phone_header(L, inner_field):
    return f"""<header class="sticky top-0 z-30 border-b bd bg-[var(--bg)]">
  <div class="flex h-16 items-center gap-3 px-4">
    {L.a("grid h-10 w-8 shrink-0 place-items-center", f'<img src="{LOGO}" alt="" class="h-8 w-8">', "ShopNexus")}
    {inner_field}
    {L.a("btn-o flex h-10 shrink-0 items-center rounded-[10px] px-3 text-[14px] font-medium", "Đăng nhập")}
  </div>
</header>"""


# ------------------------------------------------------------------- page --
def crumbs(L):
    return (f'<p class="flex items-center gap-1.5 text-[12.5px] mute">{L.a("hover:underline", "Khám phá")}{ri("arrow-right-s-line", 14, "text-[#8C8C87]")}'
            f'{L.a("hover:underline", "Danh mục")}{ri("arrow-right-s-line", 14, "text-[#8C8C87]")}<span class="text-[#1A1A19]">{CAT}</span></p>')


def pills(L, phone=False):
    wrap = "no-scrollbar overflow-x-auto" if phone else "flex-wrap"
    return f'<nav class="flex gap-1.5 {wrap}" aria-label="Mục con">' + "".join(
        L.a(f"flex h-9 shrink-0 items-center gap-1.5 rounded-[10px] border px-3 text-[14px] {'border-[#066A61] bg-mint text-on-mint' if i == 0 else 'bd bg-white'}",
            f'{n}<span class="num text-[11.5px] {"text-on-mint/70" if i == 0 else "text-[#8C8C87]"}">{c}</span>')
        for i, (n, c) in enumerate(PILLS)) + "</nav>"


def title_block(size=32):
    return f"""<div>
      <p class="flex w-fit items-center gap-2 rounded-full border bd bg-white px-3 py-1.5 text-[12.5px] font-medium">{ri("bear-smile-line", 15, "text-brand")}Danh mục</p>
      <h1 class="mt-3 font-semibold tracking-[-0.02em]" style="font-size:{size}px;line-height:{size + 8}px">{CAT}</h1>
      <p class="mt-1.5 text-[15px] mute"><b class="num font-semibold text-[#1A1A19]">{COUNT}</b> món đang bán</p>
    </div>"""


def big_field():
    return f"""<form class="flex h-14 items-center gap-3 rounded-full bg-white pl-4 pr-2 shadow-[0_0_0_1px_#ECECE9,0_8px_24px_-12px_rgb(20_20_19/.12)]">
      {ri("search-line", 22, "text-brand")}
      <input class="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-[#5E5E5A]" placeholder="Tìm trong {CAT}">
      <button type="button" class="grid h-10 w-10 place-items-center rounded-full mute row" aria-label="Tìm bằng ảnh">{ri("camera-line", 20)}</button>
      <button type="button" class="h-10 rounded-full bg-brand px-6 text-[14px] font-medium text-white">Tìm</button>
    </form>"""


def hero(L, variant):
    if variant == "b":
        return f"""<section class="mt-4 grid grid-cols-[1fr_520px] items-end gap-8">{title_block()}{big_field()}</section>
  <div class="mt-4">{pills(L)}</div>"""
    # A and C: no field. Title and count on the left, the pills right under them.
    return f"""<section class="mt-4">{title_block()}</section>
  <div class="mt-4">{pills(L)}</div>"""


def filters():
    def box(t):
        return f'<label class="flex h-8 items-center gap-2.5 text-[14px]"><span class="h-4 w-4 rounded-[4px] shadow-[inset_0_0_0_1.5px_#C4C4BF]"></span>{t}</label>'
    inp = lambda p: f'<span class="field flex h-10 flex-1 items-center rounded-[10px] bg-white px-3 text-[13px] text-[#8C8C87]">{p}</span>'
    return f"""<aside class="self-start overflow-hidden rounded-[16px] border bd bg-white">
      <div class="px-4 py-4"><p class="text-[14px] font-medium">Giá</p><div class="mt-3 flex gap-2">{inp("Từ")}{inp("Đến")}</div></div>
      <div class="border-t bd px-4 py-4"><p class="text-[14px] font-medium">Tình trạng</p><div class="mt-2">{box("Mới")}{box("Như mới")}{box("Đã dùng")}</div><div class="mt-2">{box("Trả giá được")}</div></div>
      <div class="border-t bd px-4 py-4"><p class="text-[14px] font-medium">Khoảng cách</p><p class="mt-3 flex items-center gap-2 text-[13.5px] font-medium text-brand">{ri("focus-3-line", 16)}Dùng vị trí hiện tại</p></div>
      <div class="border-t bd p-4"><span class="btn-o flex h-10 items-center justify-center rounded-[10px] text-[14px] font-medium">Áp dụng</span></div>
    </aside>"""


def card(it, phone=False):
    return f"""<article class="card min-w-0 p-2">
  <div class="relative overflow-hidden rounded-[11px] bg-soft" style="aspect-ratio:1/1"><img src="{it["photo"]}" alt="" class="h-full w-full object-cover">
    <span class="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90">{ri("heart-line", 16)}</span></div>
  <div class="px-1.5 pb-1 pt-2.5">
    <p class="num text-[16px] font-semibold tracking-tight">{it["price"]} ₫</p>
    <p class="clamp2 mt-0.5 min-h-[40px] text-[14px] leading-5">{escape(it["title"])}</p>
    <p class="meta mt-1.5 truncate">{it["cond"]} · {escape(it["place"])}</p>
  </div>
</article>"""


def tabs(extra=""):
    t = "".join(f'<span class="tab {"on" if i == 0 else ""}">{x}</span>' for i, x in enumerate(["Mới đăng", "Giá thấp", "Giá cao"]))
    view = f'<span class="flex rounded-[8px] bg-soft p-0.5"><span class="grid h-7 w-7 place-items-center rounded-[6px] bg-white shadow-[0_1px_2px_rgb(20_20_19/.06)]">{ri("layout-grid-line", 15)}</span><span class="grid h-7 w-7 place-items-center mute">{ri("list-check", 15)}</span></span>'
    return f'<div class="flex items-center justify-between gap-4 border-b bd"><div class="flex gap-6 text-[14px]">{t}</div><div class="flex items-center gap-2 pb-1.5">{extra}{view}</div></div>'


def toolbar_filter(focus=False):
    """C: filters the cards below by their words, inside this category's results."""
    return (f'<label class="flex h-8 w-[220px] items-center gap-1.5 rounded-[8px] bg-white pl-2.5 pr-2 text-[13px] {"field-on" if focus else "field"}">'
            f'{ri("filter-3-line", 15, "mute")}<input class="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#8C8C87]" placeholder="Lọc trong {COUNT} món"></label>')


def results(rows, variant):
    extra = toolbar_filter() if variant == "c" else ""
    grid = "".join(card(it) for it in rows)
    return f"""<div class="mx-auto max-w-[1280px] px-8">
  <h2 class="pt-8 text-[28px] font-semibold tracking-[-0.02em]">Đang bán</h2>
  <div class="mt-6 grid grid-cols-[256px_1fr] gap-8">
    {filters()}
    <main class="min-w-0">{tabs(extra)}<div class="mt-5 grid grid-cols-4 gap-4">{grid}</div></main>
  </div>
</div>"""


def category_page(variant, rows, hdr_field):
    L = Ids(f"cs-{variant}")
    body = f"""{header(L, hdr_field(L))}
<div class="mx-auto max-w-[1280px] px-8 pt-4">
  {crumbs(L)}
  {hero(L, variant)}
</div>
{results(rows, variant)}"""
    return out(f"Danh mục {CAT} · ShopNexus", body).replace("</style>", CSS + "</style>", 1)


# ----------------------------------------------------------- suggestions --
def option(ic, main, sub="", on=False, tone="mute"):
    lead = f'<span class="grid h-8 w-8 shrink-0 place-items-center rounded-[8px] {"bg-soft" if tone == "mute" else "bg-mint text-on-mint"}">{ri(ic, 17)}</span>'
    tail = f'<span class="meta ml-auto shrink-0">{sub}</span>' if sub else ""
    return (f'<div role="option" aria-selected="{"true" if on else "false"}" class="flex h-11 items-center gap-3 rounded-[10px] px-2 text-[14px] {"opt-on" if on else ""}">'
            f'{lead}<span class="min-w-0 truncate">{main}</span>{tail}</div>')


def suggest_rows(q):
    return "".join([
        option("search-line", f'Tìm “<b class="font-semibold">{q}</b>”', f"trong {CAT}", on=True),
        option("search-line", f'Tìm “{q}”', "mọi danh mục"),
        '<p class="px-2 pb-1 pt-3 text-[12.5px] text-[#8C8C87]">Tìm gần đây</p>',
        option("history-line", "xe đồ chơi điều khiển"),
        option("history-line", "xe đồ chơi cho bé 3 tuổi"),
        '<p class="px-2 pb-1 pt-3 text-[12.5px] text-[#8C8C87]">Danh mục</p>',
        option("bear-smile-line", "Đồ chơi", f"trong {CAT}", tone="mint"),
    ])


def suggest_desktop(rows):
    L = Ids("cs-sg")
    q = "xe do choi"
    hdr = header(L, field(L, q=q, scope=True, focus=True))
    # The field spans 322 to 1014 px at 1280; the panel matches it, 8 px under.
    pop = f"""<div role="listbox" aria-label="Gợi ý tìm kiếm" class="shadow-pop absolute z-40 rounded-[20px] bg-white p-2" style="top:8px;left:322px;width:692px">{suggest_rows(q)}</div>"""
    body = f"""{hdr}
<div class="relative">{pop}</div>
<div class="mx-auto max-w-[1280px] px-8 pt-4">{crumbs(L)}{hero(L, "a")}</div>
{results(rows, "a")}"""
    return out("Gợi ý khi gõ · ShopNexus", body).replace("</style>", CSS + "</style>", 1)


# --------------------------------------------------------------- skeleton --
def bar(w, h=12, cls=""):
    return f'<div class="skel rounded-full {cls}" style="width:{w};height:{h}px"></div>'


def card_bone():
    return f"""<div class="rounded-[16px] border bd bg-white p-2"><div class="skel aspect-square rounded-[11px]"></div>
      <div class="px-1.5 pb-1 pt-3">{bar("45%", 14)}{bar("90%", 12, "mt-2.5")}{bar("60%", 12, "mt-1.5")}{bar("50%", 10, "mt-3")}</div></div>"""


def filters_bone():
    group = lambda n: '<div class="border-t bd px-4 py-4 first:border-0">' + bar("35%", 12) + "".join(bar(f"{60 - i * 8}%", 10, "mt-3") for i in range(n)) + "</div>"
    return f'<aside class="self-start overflow-hidden rounded-[16px] border bd bg-white">{group(1)}{group(4)}{group(1)}</aside>'


def pending_desktop():
    L = Ids("cs-pd")
    q = "xe do choi"
    tabs_bone = f'<div class="flex items-center justify-between border-b bd pb-2.5"><div class="flex gap-6">{bar("88px", 14)}{bar("64px", 14)}{bar("56px", 14)}</div>{bar("64px", 30, "!rounded-[8px]")}</div>'
    body = f"""{header(L, field(L, q=q, scope=True))}
<div class="mx-auto max-w-[1280px] px-8" aria-hidden="true">
  <h1 class="pt-6 text-[28px] font-semibold leading-9 tracking-[-0.02em]">“{q}”</h1>
  {bar("220px", 12, "mt-3")}
  <div class="mt-6 grid grid-cols-[256px_1fr] gap-8">
    {filters_bone()}
    <main class="min-w-0">{tabs_bone}<div class="mt-5 grid grid-cols-4 gap-4">{"".join(card_bone() for _ in range(8))}</div></main>
  </div>
</div>"""
    return out(f"Đang mở “{q}” · ShopNexus", body).replace("</style>", CSS + "</style>", 1)


# ------------------------------------------------------------------ phone --
def phone_shell(L, hdr, main, overlay="", section="Danh mục"):
    nav = "".join(f'<span class="flex flex-col items-center justify-center gap-1 text-[12px] {"" if on else "mute"}"><span class="grid h-8 w-16 place-items-center rounded-full {"bg-mint text-on-mint" if on else ""}">{ri(i, 22)}</span>{t}</span>'
                  for i, t, on in [(("compass-3-fill" if section == "Khám phá" else "compass-3-line"), "Khám phá", section == "Khám phá"),
                                   (("apps-2-fill" if section == "Danh mục" else "apps-2-line"), "Danh mục", section == "Danh mục"),
                                   ("chat-3-line", "Tin nhắn", False), ("user-line", "Tôi", False)])
    return f"""<div class="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-[var(--bg)]">
  {hdr}
  {main}
  {L.a("absolute bottom-24 right-4 flex h-12 items-center gap-2 rounded-[16px] bg-brand px-5 text-[14px] font-medium text-white shadow-pop", ri("add-line", 18) + "Đăng tin")}
  <nav class="absolute inset-x-0 bottom-0 grid h-20 grid-cols-4 border-t bd bg-[var(--bg)]">{nav}</nav>
  {overlay}
</div>"""


def phone_cards(rows, n=4):
    return '<div class="mt-4 grid grid-cols-2 gap-3">' + "".join(card(it, True) for it in rows[:n]) + "</div>"


def phone_category(rows):
    L = Ids("cs-ap")
    main = f"""<main class="px-4 pt-4">
    {crumbs(L)}
    <div class="mt-3">{title_block(28)}</div>
    <div class="mt-4">{pills(L, True)}</div>
    <h2 class="mt-6 text-[22px] font-semibold tracking-[-0.02em]">Đang bán</h2>
    <span class="btn-o mt-4 flex h-9 w-fit items-center gap-1.5 rounded-[10px] px-3 text-[14px] font-medium">{ri("equalizer-line", 16)}Bộ lọc</span>
    <div class="mt-4">{tabs()}</div>
    {phone_cards(rows)}
  </main>"""
    return out(f"{CAT} · điện thoại", phone_shell(L, phone_header(L, field(L, scope=True, phone=True)), main)).replace("</style>", CSS + "</style>", 1)


def phone_suggest(rows):
    L = Ids("cs-sp")
    q = "xe do choi"
    main = f'<main class="px-4 pt-4">{crumbs(L)}<div class="mt-3">{title_block(28)}</div><div class="mt-4">{pills(L, True)}</div>{phone_cards(rows)}</main>'
    pop = f'<div role="listbox" aria-label="Gợi ý tìm kiếm" class="shadow-pop absolute inset-x-4 top-[72px] z-40 rounded-[20px] bg-white p-2">{suggest_rows(q)}</div>'
    hdr = phone_header(L, field(L, q=q, scope=True, focus=True, phone=True))
    return out("Gợi ý khi gõ · điện thoại", phone_shell(L, hdr, main, pop)).replace("</style>", CSS + "</style>", 1)


def phone_pending():
    L = Ids("cs-pp")
    q = "xe do choi"
    main = f"""<main class="px-4" aria-hidden="true">
    <h1 class="pt-6 text-[24px] font-semibold leading-8 tracking-[-0.02em]">“{q}”</h1>
    {bar("200px", 12, "mt-3")}
    {bar("92px", 36, "mt-5 !rounded-[10px]")}
    <div class="mt-5 flex items-center justify-between border-b bd pb-2.5"><div class="flex gap-6">{bar("88px", 14)}{bar("64px", 14)}{bar("56px", 14)}</div>{bar("64px", 30, "!rounded-[8px]")}</div>
    <div class="mt-4 grid grid-cols-2 gap-3">{"".join(card_bone() for _ in range(4))}</div>
  </main>"""
    hdr = phone_header(L, field(L, q=q, scope=True, phone=True))
    return out("Đang mở kết quả · điện thoại", phone_shell(L, hdr, main, section="Khám phá")).replace("</style>", CSS + "</style>", 1)


# ------------------------------------------------------------------ write --
if __name__ == "__main__":
    rows = listings()
    pages = {
        "a": category_page("a", rows, lambda L: field(L, scope=True)),
        "a-phone": phone_category(rows),
        "b": category_page("b", rows, lambda L: ""),
        "c": category_page("c", rows, lambda L: field(L)),
        "suggest": suggest_desktop(rows),
        "suggest-phone": phone_suggest(rows),
        "pending": pending_desktop(),
        "pending-phone": phone_pending(),
    }
    for name, html in pages.items():
        with open(os.path.join(OUT, f"category-search-{name}.html"), "w") as f:
            f.write(html)
        print("wrote category-search", name)
