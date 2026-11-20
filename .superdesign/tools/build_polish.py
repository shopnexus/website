"""Polish round: the verified-phone badge, and the text contrast and corner
pass.

- "Đã xác minh SĐT": a seller who signs in with a phone number gets one quiet
  line, the verified glyph in primary and the short label in sub, with the
  full words as the tooltip. It sits under the name on the listing's seller
  card, the person card, the seller page and Xem nhanh.
- Contrast: faint (meta, placeholders, group labels) was 3.2:1 on the page;
  it goes darker on the same hue to 4.5:1 or more on every surface, in light
  and in dark. sub and ink already pass.
- Corners: every text field takes one style, 10 px with the field border
  (the header search's), so no field sits square or pill-shaped next to
  10 px chips and buttons.

    python3 tools/build_polish.py        (run from .superdesign/)

Writes mockups/polish-badge.html, polish-badge-phone.html,
polish-contrast.html and polish-contrast-phone.html.
"""
import os

from build import OUT
from build_header import Ids
from build_hover_card import CSS as CARD_CSS, POP, stars
from build_k2 import LISTINGS, SELLERS, card, out, ri
from build_notif_preview import bar
from build_price_drop import bottom_nav, phone_header
from build_trust_signals import buy_card, reviews_section, seller_card, specs_section, text_sections
from common import img

PRIMARY, SUB = "#005049", "#5E5E5A"
FAINT_OLD, FAINT_NEW = "#8C8C87", "#6C6C68"
DARK_FAINT_OLD, DARK_FAINT_NEW = "#7D7D78", "#92928D"
# The meta line follows the new faint everywhere in these drafts.
CSS = CARD_CSS + f"""
  .meta {{ color: {FAINT_NEW}; }}
  .tip {{ background: #1A1A19; color: #fff; }}
"""
SELLER, FACE, RATING = SELLERS[0]


def page(title, body):
    return out(title, body).replace("</style>", CSS + "</style>", 1)


def badge(tip=False, text="text-[12px] leading-4", glyph=14):
    """The shared badge: glyph and short label, at the size of the line it sits in; the tooltip drawn when hovered."""
    bubble = ('<span role="tooltip" class="tip absolute left-0 top-[calc(100%+6px)] z-10 whitespace-nowrap rounded-[6px] px-2 py-1 text-[12px] leading-4">'
              'Đã xác minh số điện thoại</span>') if tip else ""
    return (f'<span class="relative inline-flex items-center gap-1 {text} text-[{SUB}]" title="Đã xác minh số điện thoại">'
            f'{ri("verified-badge-fill", glyph, f"text-[{PRIMARY}]")}Đã xác minh SĐT{bubble}</span>')


def person_card(place, tip=False):
    figs = "".join(f'<div class="px-3 py-2"><p class="num text-[15px] font-semibold leading-5">{v}</p><p class="meta">{lbl}</p></div>'
                   for v, lbl in [(14, "đã bán"), (2023, "tham gia")])
    return f"""<div role="dialog" aria-label="{SELLER}" class="{POP} {place} p-4">
  <div class="flex items-center gap-3">
    <img src="{img(FACE, 112, 112)}" alt="" class="h-14 w-14 shrink-0 rounded-full object-cover">
    <div class="min-w-0 flex-1">
      <p class="truncate text-[16px] font-semibold leading-6">{SELLER}</p>
      <p class="mt-0.5 flex items-center gap-1.5 text-[13px] leading-[18px]">{stars(5)}<span class="font-semibold">{RATING}</span><span class="mute">· 32 đánh giá</span></p>
      <p class="mt-1">{badge(tip)}</p>
    </div>
  </div>
  <div class="mt-3 grid auto-cols-fr grid-flow-col divide-x divide-[#ECECE9] rounded-[10px] border bd">{figs}</div>
  <div class="mt-3 flex gap-2">
    <button type="button" class="flex h-9 flex-1 items-center justify-center gap-1.5 rounded-[10px] bg-brand text-[14px] font-medium text-white">{ri("user-add-line", 16)}Theo dõi</button>
    <a id="pc-open" href="#seller" class="btn-o flex h-9 flex-1 items-center justify-center rounded-[10px] text-[14px] font-medium">Xem trang</a>
  </div>
</div>"""


def with_badge(card_html, pop=""):
    """The listing's seller card with the badge after the joined year, and the person card over its head."""
    sub = '<span class="meta block">Tham gia 2023</span>'
    assert sub in card_html
    html = card_html.replace(sub, f'<span class="meta flex flex-wrap items-center gap-x-1.5">Tham gia 2023<span aria-hidden="true">·</span>{badge()}</span>', 1)
    head = html.index("<a ")
    end = html.index("</a>", head) + 4
    return html[:head] + f'<div class="relative">{html[head:end]}{pop}</div>' + html[end:]


def badge_desktop():
    L = Ids("pb")
    similar = "".join(card(i, *r[:6]) for i, r in enumerate(LISTINGS[:5]))
    seller = with_badge(seller_card(L), person_card("bottom-[calc(100%+8px)] left-0", tip=True))
    body = f"""{bar(L)}
<main class="mx-auto max-w-[1280px] px-8 pt-5">
  <div class="grid grid-cols-[minmax(0,1fr)_380px] gap-x-8">
    <div class="flex min-w-0 flex-col gap-4">
      {specs_section()}
      {reviews_section(L)}
    </div>
    <aside class="sticky top-[84px] flex flex-col gap-4 self-start">
      {buy_card(L)}
      {seller}
    </aside>
  </div>
  <section class="mt-10 pb-16"><h2 class="text-[18px] font-semibold tracking-[-0.02em]">Tin tương tự</h2>
    <div class="mt-4 grid grid-cols-5 gap-4">{similar}</div></section>
</main>"""
    return page("Người bán · đã xác minh SĐT", body)


def badge_phone():
    L = Ids("pbp")
    facts = "".join(f'<span class="flex items-center gap-1.5">{ri(i, 16, "mute")}{t}</span>'
                    for i, t in [("calendar-line", "Tham gia 2023"), ("time-line", "Hoạt động 2 giờ trước")])
    head = f"""<section class="flex flex-col gap-3">
      <img src="{img(FACE, 224, 224)}" alt="" class="h-20 w-20 rounded-full object-cover ring-4 ring-white">
      <div>
        <h1 class="text-[28px] font-semibold leading-[34px] tracking-[-0.035em]">{SELLER}</h1>
        <div class="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] leading-[18px] mute">{facts}{badge(text="gap-1.5", glyph=16)}</div>
      </div>
    </section>"""
    body = f"""<div class="relative mx-auto w-[390px] bg-[var(--bg)] pb-28">
  {phone_header()}
  <main class="flex flex-col gap-4 px-4 pt-4">
    <p class="meta">Người bán trên trang của họ</p>
    {head}
    <p class="meta mt-4">Trên tin, thẻ người bán</p>
    {with_badge(seller_card(L))}
    {text_sections(phone=True)}
  </main>
  <div class="fixed inset-x-0 bottom-0 mx-auto h-20 w-[390px]">{bottom_nav()}</div>
</div>"""
    return page("Người bán · đã xác minh SĐT · điện thoại", body)


# ------------------------------------------------------------ contrast --
def _lum(h):
    r, g, b = (int(h[i:i + 2], 16) / 255 for i in (1, 3, 5))
    f = lambda c: c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4  # noqa: E731
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def ratio(fg, bg):
    a, b = sorted([_lum(fg), _lum(bg)], reverse=True)
    return (a + 0.05) / (b + 0.05)


LIGHT = [("page", "#F7F7F5"), ("card", "#FFFFFF"), ("soft", "#F3F3F1"), ("hover", "#EEEEEB"), ("mint", "#E3F2EF")]
DARK = [("page", "#141413"), ("card", "#1C1C1B"), ("soft", "#232321"), ("hover", "#2A2A28"), ("mint", "#12302C")]
TOKENS = {
    "light": [("ink", "#1A1A19", None), ("sub", SUB, None), ("faint", FAINT_OLD, FAINT_NEW)],
    "dark": [("ink", "#ECECEA", None), ("sub", "#A8A8A3", None), ("faint", DARK_FAINT_OLD, DARK_FAINT_NEW)],
}


def cell(v):
    ok = v >= 4.5
    mark = ri("check-line", 13, f"text-[{PRIMARY}]") if ok else ri("subtract-line", 13, "mute")
    shown = f"{v:.2f}".replace(".", ",")
    return f'<td class="px-3 py-2 text-right"><span class="num inline-flex items-center justify-end gap-1 {"" if ok else "mute"}">{mark}{shown}</span></td>'


def ratio_table(theme):
    bgs = LIGHT if theme == "light" else DARK
    head = "".join(f'<th class="px-3 py-2 text-right font-medium">{n}</th>' for n, _ in bgs)
    rows = ""
    for name, old, new in TOKENS[theme]:
        sw = lambda c: f'<span class="inline-block h-3.5 w-3.5 rounded-[4px] align-[-2px]" style="background:{c}"></span>'  # noqa: E731
        if new:
            rows += (f'<tr class="border-t bd"><td class="px-3 py-2">{sw(old)} {name} <span class="meta">trước · {old}</span></td>' + "".join(cell(ratio(old, b)) for _, b in bgs) + "</tr>")
            rows += (f'<tr class="border-t bd bg-mint/40"><td class="px-3 py-2 font-medium">{sw(new)} {name} <span class="meta">sau · {new}</span></td>' + "".join(cell(ratio(new, b)) for _, b in bgs) + "</tr>")
        else:
            rows += (f'<tr class="border-t bd"><td class="px-3 py-2">{sw(old)} {name} <span class="meta">{old}</span></td>' + "".join(cell(ratio(old, b)) for _, b in bgs) + "</tr>")
    title = "Sáng" if theme == "light" else "Tối"
    return f"""<section class="card overflow-hidden">
      <h2 class="px-4 pt-4 text-[15px] font-semibold">{title} <span class="meta font-normal">· chữ trên từng nền, cần 4,5:1</span></h2>
      <div class="overflow-x-auto"><table class="mt-2 w-full text-[13px] leading-[18px]"><thead class="mute"><tr><th class="px-3 py-2 text-left font-medium">Màu chữ</th>{head}</tr></thead><tbody>{rows}</tbody></table></div>
    </section>"""


def sample(faint, theme):
    """A crop of real meta text: a card's line, a notice row, the seller's line."""
    bg, cardbg, ink, line = ("#F7F7F5", "#FFFFFF", "#1A1A19", "#ECECE9") if theme == "light" else ("#141413", "#1C1C1B", "#ECECEA", "#2A2A28")
    return f"""<div class="rounded-[12px] p-3" style="background:{bg};color:{ink}">
      <div class="rounded-[12px] border p-3" style="background:{cardbg};border-color:{line}">
        <p class="num text-[16px] font-semibold">5.200.000 ₫</p>
        <p class="text-[14px] leading-5">iPhone 13 Pro 128GB</p>
        <p class="mt-1 text-[12px] leading-4" style="color:{faint}">Như mới · 2,1 km</p>
        <div class="mt-3 border-t pt-3" style="border-color:{line}">
          <p class="text-[13px] leading-[18px]">Minh Anh trả 4.900.000 ₫</p>
          <p class="text-[12px] leading-4" style="color:{faint}">21 giờ trước</p>
        </div>
        <label class="mt-3 flex h-9 items-center rounded-[10px] border px-3 text-[13px]" style="border-color:{"#DCDCD8" if theme == "light" else "#3A3A37"};color:{faint}">Tìm iPhone, xe đạp…</label>
      </div>
    </div>"""


def pair(theme):
    old, new = (FAINT_OLD, FAINT_NEW) if theme == "light" else (DARK_FAINT_OLD, DARK_FAINT_NEW)
    return f"""<div class="grid grid-cols-2 gap-3">
      <div><p class="meta mb-1.5">Trước</p>{sample(old, theme)}</div>
      <div><p class="meta mb-1.5">Sau</p>{sample(new, theme)}</div>
    </div>"""


def chips():
    return "".join(f'<span class="flex h-8 shrink-0 items-center gap-1 rounded-[10px] border border-[#DCDCD8] bg-white px-3 text-[12px] font-medium">{t}</span>'
                   for t in ["Trả giá", "Còn không bạn?", "Xem ở đâu được?"])


def composer(radius, border):
    return f"""<div class="rounded-[12px] bg-[#F7F7F5] p-3">
      <div class="no-scrollbar flex gap-1.5 overflow-hidden">{chips()}</div>
      <div class="mt-2 flex items-end gap-1">
        <span class="grid h-12 w-12 shrink-0 place-items-center rounded-full mute">{ri("image-add-line", 22)}</span>
        <span class="flex min-h-12 min-w-0 flex-1 items-center border bg-white px-4 text-[14px] meta {radius}" style="border-color:{border}">Nhắn tin</span>
        <span class="grid h-12 w-12 shrink-0 place-items-center rounded-full mute">{ri("send-plane-2-line", 22)}</span>
      </div>
    </div>"""


def field_row(label, before, after):
    return f"""<div class="grid grid-cols-[140px_1fr_1fr] items-center gap-3 border-t bd py-3 first:border-t-0">
      <p class="text-[13px] font-medium leading-[18px]">{label}</p>
      <div>{before}</div><div>{after}</div>
    </div>"""


FIELD = "rounded-[10px] border border-[#DCDCD8] bg-white"


def radius_board():
    sign_old = (f'<div class="flex h-12 items-center gap-2 rounded-full border border-[#ECECE9] bg-white px-1.5"><span class="flex h-9 items-center rounded-full bg-soft px-3 text-[13px] font-medium">+84</span>'
                f'<span class="flex-1 text-[14px] meta">912 345 678</span><span class="flex h-9 items-center rounded-[10px] bg-brand px-3 text-[13px] font-medium text-white">Gửi mã</span></div>')
    sign_new = (f'<div class="flex h-12 items-center gap-2 {FIELD} px-1.5"><span class="flex h-9 items-center rounded-[8px] bg-soft px-3 text-[13px] font-medium">+84</span>'
                f'<span class="flex-1 text-[14px] meta">912 345 678</span><span class="flex h-9 items-center rounded-[8px] bg-brand px-3 text-[13px] font-medium text-white">Gửi mã</span></div>')
    note_old = '<div class="rounded-[4px] bg-[#ECECE9] px-4 py-2"><p class="text-[12px] leading-4 mute">Ghi chú thêm (không bắt buộc)</p><p class="h-10"></p></div>'
    note_new = f'<div class="{FIELD} px-4 py-2"><p class="text-[12px] leading-4 meta">Ghi chú thêm (không bắt buộc)</p><p class="h-10"></p></div>'
    form_old = '<div><p class="mb-1.5 text-[13px] mute">Tiêu đề</p><div class="flex h-12 items-center rounded-[10px] bg-soft px-4 text-[14px]">iPhone 13 Pro 128GB</div></div>'
    form_new = f'<div><p class="mb-1.5 text-[13px] mute">Tiêu đề</p><div class="flex h-12 items-center {FIELD} px-4 text-[14px]">iPhone 13 Pro 128GB</div></div>'
    price_old = '<div class="grid grid-cols-2 gap-2">' + "".join(f'<div class="rounded-[8px] border border-[#DCDCD8] px-2.5 py-2"><p class="meta">{t}</p><p class="num text-[14px]">{v}</p></div>' for t, v in [("Từ", "2.000.000"), ("Đến", "6.000.000")]) + "</div>"
    price_new = '<div class="grid grid-cols-2 gap-2">' + "".join(f'<div class="{FIELD} px-2.5 py-2"><p class="meta">{t}</p><p class="num text-[14px]">{v}</p></div>' for t, v in [("Từ", "2.000.000"), ("Đến", "6.000.000")]) + "</div>"
    rows = "".join([
        field_row("Chat nhanh · ô Nhắn tin", composer("rounded-none", "#ECECE9"), composer("rounded-[10px]", "#DCDCD8")),
        field_row("Đăng nhập · số điện thoại", sign_old, sign_new),
        field_row("Báo cáo · ghi chú", note_old, note_new),
        field_row("Đăng tin, Hồ sơ · ô nhập", form_old, form_new),
        field_row("Tìm kiếm · khoảng giá", price_old, price_new),
    ])
    return f"""<section class="card p-4">
      <h2 class="text-[15px] font-semibold">Bo góc ô nhập <span class="meta font-normal">· một kiểu: 10 px, viền field, nền trắng</span></h2>
      <div class="mt-2 grid grid-cols-[140px_1fr_1fr] gap-3 meta"><span></span><span>Trước</span><span>Sau</span></div>
      <div class="mt-1">{rows}</div>
    </section>"""


def contrast_desktop():
    body = f"""{bar(Ids("pc"))}
<main class="mx-auto flex max-w-[1280px] flex-col gap-5 px-8 pb-16 pt-6">
  <div>
    <h1 class="text-[28px] font-semibold leading-[34px] tracking-[-0.035em]">Độ tương phản và bo góc</h1>
    <p class="mt-1 text-[14px] mute">faint đậm hơn cùng sắc độ, đạt 4,5:1 trên mọi nền ở cả hai giao diện; ô nhập về một kiểu bo góc.</p>
  </div>
  <div class="grid grid-cols-2 gap-5">{ratio_table("light")}{ratio_table("dark")}</div>
  <div class="grid grid-cols-2 gap-5">
    <section class="card p-4"><h2 class="mb-3 text-[15px] font-semibold">Sáng</h2>{pair("light")}</section>
    <section class="card p-4"><h2 class="mb-3 text-[15px] font-semibold">Tối</h2>{pair("dark")}</section>
  </div>
  {radius_board()}
</main>"""
    return page("Độ tương phản và bo góc", body)


def contrast_phone():
    board = radius_board().replace("grid-cols-[140px_1fr_1fr]", "grid-cols-2").replace(
        '<p class="text-[13px] font-medium leading-[18px]">', '<p class="col-span-2 text-[13px] font-medium leading-[18px]">').replace(
        '<span></span><span>Trước</span>', '<span>Trước</span>').replace('<span>Sau</span></div>', '<span>Sau</span></div>', 1)
    body = f"""<div class="relative mx-auto w-[390px] bg-[var(--bg)] pb-28">
  {phone_header()}
  <main class="flex flex-col gap-4 px-4 pt-4">
    <h1 class="text-[24px] font-semibold leading-8 tracking-[-0.02em]">Độ tương phản và bo góc</h1>
    {ratio_table("light")}
    {ratio_table("dark")}
    <section class="card p-3"><h2 class="mb-3 text-[15px] font-semibold">Sáng</h2>{pair("light")}</section>
    <section class="card p-3"><h2 class="mb-3 text-[15px] font-semibold">Tối</h2>{pair("dark")}</section>
    {board}
  </main>
  <div class="fixed inset-x-0 bottom-0 mx-auto h-20 w-[390px]">{bottom_nav()}</div>
</div>"""
    return page("Độ tương phản và bo góc · điện thoại", body)


if __name__ == "__main__":
    for name, fn in [("badge", badge_desktop), ("badge-phone", badge_phone), ("contrast", contrast_desktop), ("contrast-phone", contrast_phone)]:
        with open(os.path.join(OUT, f"polish-{name}.html"), "w") as f:
            f.write(fn())
        print("wrote polish", name)
