"""Trust signals on the listing page and the order review.

- The seller card says how fast the seller usually answers in chat, one quiet
  line under the figures ("Thường trả lời trong vài phút").
- A review can carry up to 4 photos: small squares under its text that open
  the listing Gallery's dark viewer, and a "Hữu ích" button with its count.
- The order's review form takes those photos: the Đăng tin photo tiles, an ×
  on each, a ring while one uploads, the dashed "Thêm ảnh" tile, and 3/4.

    python3 tools/build_trust_signals.py        (run from .superdesign/)

Writes mockups/trust-signals-{listing,listing-phone,review,review-phone,viewer-phone}.html.
"""
import os
from html import escape

from build import OUT, SPECS, TITLE
from build_header import Ids
from build_hover_card import stars
from build_k2 import SELLERS, card, out, ri
from build_notif_preview import bar
from build_price_drop import bottom_nav, phone_header
from common import LISTINGS, crop, img

# Live tokens as hex (tokens.css, j.css): primary, on-surface-variant,
# surface-container-low/high, secondary-container, star.
PRIMARY, VARIANT, LOW, HIGH = "#005049", "#3E4947", "#F1F4F2", "#E6E9E7"
CSS = """
  .spinner { display: inline-block; width: 1.25rem; height: 1.25rem; border-radius: 9999px; border: 2px solid currentColor; border-inline-end-color: transparent; animation: spin 700ms linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .help { border: 1px solid #DCDCD8; color: #5E5E5A; }
  .help:hover { background: #EEEEEB; }
  .help[aria-pressed="true"] { border-color: transparent; background: #E3F2EF; color: #05554E; }
"""

SELLER, SELLER_FACE, _ = SELLERS[0]
HEADPHONES = LISTINGS[4]  # (photo, price, title, …)
# Photos a buyer took of the headphones they got: three crops of one shot.
REVIEW_PHOTOS = [crop(HEADPHONES[0], 600, 0.5, 0.5, 1.2), crop(HEADPHONES[0], 600, 0.42, 0.38, 2.4), crop(HEADPHONES[0], 600, 0.62, 0.62, 2.0)]
REPLY_TIME = "Thường trả lời trong vài phút"


def page(title, body):
    return out(title, body).replace("</style>", CSS + "</style>", 1)


# ------------------------------------------------------------ pieces --
def reply_time():
    """The seller card's new line, under the two figures."""
    return (f'<p class="mt-3 flex items-center gap-1.5 text-[12px] leading-4 text-[#5E5E5A]">'
            f'{ri("time-line", 15, f"text-[{PRIMARY}]")}{REPLY_TIME}</p>')


def seller_card(L):
    figs = "".join(f'<div class="py-2.5"><p class="num text-[15px] font-semibold tracking-[-0.02em]">{v}</p><p class="meta">{lbl}</p></div>'
                   for v, lbl in [("4,9", "32 đánh giá"), ("14", "đã bán")])
    others = "".join(L.a("min-w-0", f'<span class="block aspect-square w-full overflow-hidden rounded-[10px] bg-soft"><img src="{img(p, 200, 200)}" alt="" class="h-full w-full object-cover"></span>'
                         f'<span class="num mt-1 block text-[13px] font-semibold">{pr}</span>')
                     for p, pr in [("1592899677977-9c10ca588bbd", "15,9 tr ₫"), (HEADPHONES[0], "3,2 tr ₫"), ("1611186871348-b1ce696e52c9", "11,5 tr ₫")])
    head = L.a("row -m-2 flex items-center gap-3 rounded-[10px] p-2",
               f'<img src="{img(SELLER_FACE, 96, 96)}" alt="" class="h-11 w-11 rounded-full object-cover">'
               f'<span class="min-w-0 flex-1"><span class="block truncate text-[15px] font-medium leading-[22px]">{SELLER}</span><span class="meta block">Tham gia 2023</span></span>'
               + ri("arrow-right-s-line", 20, "text-[#8C8C87]"))
    return f"""<div class="card p-5">
        {head}
        <div class="mt-4 grid grid-cols-2 divide-x divide-[#ECECE9] rounded-[10px] border bd text-center">{figs}</div>
        {reply_time()}
        <p class="meta mt-4">Tin khác của {SELLER}</p>
        <div class="mt-2 grid grid-cols-3 gap-2">{others}</div>
      </div>"""


def buy_card(L):
    asks = "".join(L.a("row -mx-2 flex h-10 items-center justify-between rounded-[8px] px-2 text-[14px]", q + ri("arrow-right-line", 15, "text-[#8C8C87]"))
                   for q in ["Còn không bạn?", "Xem ở đâu được?"])
    return f"""<div class="card p-6">
        <p class="flex items-center gap-2 meta"><span class="rounded-[4px] bg-mint px-1.5 py-0.5 font-medium text-on-mint">Như mới</span>2,1 km · 2 giờ trước</p>
        <h1 class="mt-3 text-[22px] font-semibold leading-7 tracking-[-0.02em]">{escape(TITLE)}</h1>
        <p class="num mt-3 text-[30px] font-semibold leading-9 tracking-[-0.035em]">5.200.000<span class="ml-1 text-[15px] font-medium tracking-normal text-[#5E5E5A]">₫</span></p>
        <div class="mt-5 flex flex-col gap-2">
          {L.a("flex h-11 items-center justify-center gap-2 rounded-[10px] bg-brand text-[14px] font-medium text-white", ri("shopping-bag-3-line", 18) + "Mua ngay")}
          {L.a("btn-o flex h-11 items-center justify-center gap-2 rounded-[10px] text-[14px] font-medium", ri("price-tag-3-line", 18) + "Trả giá")}
        </div>
        <p class="meta mt-5">Hỏi nhanh</p>
        <div class="mt-1 flex flex-col">{asks}</div>
      </div>"""


def helpful(n, on=False):
    """Hữu ích with its count; marked: mint, filled thumb."""
    label = f"Hữu ích · {n}" if n else "Hữu ích"
    return (f'<button type="button" aria-pressed="{"true" if on else "false"}" class="help mt-2 inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium leading-[18px] num">'
            f'{ri("thumb-up-fill" if on else "thumb-up-line", 16)}{label}</button>')


def photo_row(photos, size="h-16 w-16"):
    """A review's photos: square thumbs that open the viewer."""
    thumbs = "".join(f'<button type="button" aria-label="Ảnh {i + 1}/{len(photos)}" class="{size} shrink-0 overflow-hidden rounded-[10px] bg-[{HIGH}] hover:opacity-90">'
                     f'<img src="{p}" alt="" class="h-full w-full object-cover"></button>' for i, p in enumerate(photos))
    return f'<div class="mt-2 flex gap-2">{thumbs}</div>'


REVIEWS = [
    dict(name="Hoàng Nam", face="1500648767791-00dcc994a43e", stars=5, ago="2 tuần trước",
         text="Tai nghe đúng như mô tả, pin còn tốt, chống ồn ngon. Bạn bán gói kỹ, giao nhanh.",
         item=HEADPHONES[2], photos=REVIEW_PHOTOS, helpful=5, on=False),
    dict(name="Thu Hà", face="1544005313-94ddf0286df2", stars=5, ago="1 tháng trước",
         text="Hỏi gì trả lời nấy, cho xem máy kỹ trước khi nhận.",
         item="iPad Air 4 64GB", photos=[], helpful=3, on=True, reply="Cảm ơn bạn nhiều nha!"),
]


def review(L, r, first):
    reply = (f'<div class="mt-2 rounded-[10px] bg-[{LOW}] px-3 py-2"><p class="text-[12px] leading-4 text-[{VARIANT}]">{SELLER} trả lời</p>'
             f'<p class="text-[13px] leading-[18px]">{r["reply"]}</p></div>') if r.get("reply") else ""
    return f"""<div class="flex gap-3 {"" if first else "border-t bd pt-4"}">
          {L.a("flex shrink-0 self-start rounded-full", f'<img src="{img(r["face"], 72, 72)}" alt="" class="h-9 w-9 rounded-full object-cover">')}
          <div class="min-w-0 flex-1">
            <div class="flex flex-wrap items-center gap-x-2 gap-y-1">{L.a("text-[14px] font-medium leading-5 hover:underline", r["name"])}{stars(r["stars"], 12)}<span class="text-[12px] leading-4 text-[{VARIANT}]">{r["ago"]}</span></div>
            <p class="mt-1 text-[13px] leading-[18px]">{r["text"]}</p>
            {photo_row(r["photos"]) if r["photos"] else ""}
            <p class="mt-1 text-[12px] leading-4 text-[#8C8C87]">Đã mua {r["item"]}</p>
            {reply}
            {helpful(r["helpful"], r["on"])}
          </div>
        </div>"""


def reviews_section(L, pad="p-6"):
    items = "".join(review(L, r, i == 0) for i, r in enumerate(REVIEWS))
    return f"""<section class="card {pad}">
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-[16px] font-semibold leading-6 tracking-[-0.02em]">Đánh giá về {SELLER}</h2>
          <p class="flex items-center gap-1 whitespace-nowrap text-[14px] text-[#5E5E5A]">{ri("star-fill", 15, "text-[#E0A23B]")}<b class="font-semibold text-[#1A1A19]">4,9</b> · 32 đánh giá</p>
        </div>
        <div class="mt-4 flex flex-col gap-4">{items}</div>
      </section>"""


def specs_section():
    rows = "".join(f'<div class="flex justify-between gap-4 border-b bd py-2.5 text-[14px]"><dt class="mute">{k}</dt><dd class="text-right font-medium">{v}</dd></div>' for k, v in SPECS)
    return f'<section class="card p-6"><h2 class="text-[16px] font-semibold leading-6 tracking-[-0.02em]">Thông số</h2><dl class="mt-2 grid grid-cols-2 gap-x-10">{rows}</dl></section>'


def text_sections(phone=False):
    grades = "".join(f'<div class="rounded-[8px] px-3 py-2 {"bg-brand text-white" if on else "mute"}"><p class="text-[14px] font-medium">{t}</p>'
                     + ("" if phone else f'<p class="text-[12px] {"text-white/75" if on else ""}">{d}</p>') + "</div>"
                     for t, d, on in [("Mới", "Chưa dùng", False), ("Như mới", "Không vết, hoặc vết rất nhỏ chỉ thấy khi soi gần", True), ("Đã dùng", "Có vết dùng, người bán ghi trong mô tả", False)])
    pad = "p-5" if phone else "p-6"
    return f"""<section class="card {pad}"><h2 class="text-[16px] font-semibold leading-6 tracking-[-0.02em]">Mô tả</h2>
        <div class="mt-3 flex flex-col gap-2 text-[15px] leading-7"><p>Mình dùng từ 2022, máy zin chưa sửa, Face ID nhạy.</p><p>Viền có 2 vết xước nhỏ, có trong ảnh 3.</p></div>
        <p class="meta mt-5">Đăng 2 giờ trước · Bình Thạnh, TP.HCM</p></section>
      <section class="card {pad}"><h2 class="text-[16px] font-semibold leading-6 tracking-[-0.02em]">Tình trạng</h2>
        <div class="mt-3 grid grid-cols-3 gap-1 rounded-[10px] bg-soft p-1">{grades}</div></section>"""


# ------------------------------------------------------ listing pages --
def listing_desktop():
    L = Ids("ts-l")
    similar = "".join(card(i, *r[:6]) for i, r in enumerate(LISTINGS[:5]))
    # Scrolled to the reviews: the gallery and Mô tả are above the window, the aside sticks.
    body = f"""{bar(L)}
<main class="mx-auto max-w-[1280px] px-8 pt-5">
  <div class="grid grid-cols-[minmax(0,1fr)_380px] gap-x-8">
    <div class="flex min-w-0 flex-col gap-4">
      {specs_section()}
      {reviews_section(L)}
    </div>
    <aside class="sticky top-[84px] flex flex-col gap-4 self-start">
      {buy_card(L)}
      {seller_card(L)}
    </aside>
  </div>
  <section class="mt-10 pb-16"><h2 class="text-[18px] font-semibold tracking-[-0.02em]">Tin tương tự</h2>
    <div class="mt-4 grid grid-cols-5 gap-4">{similar}</div></section>
</main>"""
    return page("Chi tiết tin · trả lời nhanh, ảnh đánh giá", body)


def phone_listing_body(L):
    """The phone page from the seller card down: the gallery and buy card are above."""
    similar = "".join(card(i, *r[:6]) for i, r in enumerate(LISTINGS[5:7]))
    return f"""{phone_header()}
  <main class="flex flex-col gap-4 px-4 pt-4">
    {seller_card(L)}
    {text_sections(phone=True)}
    {reviews_section(L, "p-5")}
    <section class="mt-6"><h2 class="text-[18px] font-semibold tracking-[-0.02em]">Tin tương tự</h2><div class="mt-4 grid grid-cols-2 gap-3">{similar}</div></section>
  </main>"""


def listing_phone():
    L = Ids("ts-lp")
    body = f"""<div class="relative mx-auto w-[390px] bg-[var(--bg)] pb-28">
  {phone_listing_body(L)}
  <div class="fixed inset-x-0 bottom-0 mx-auto h-20 w-[390px]">{bottom_nav()}</div>
</div>"""
    return page("Chi tiết tin · điện thoại", body)


def viewer_phone():
    """A review photo opened large: the listing Gallery's viewer, at 1/3."""
    L = Ids("ts-v")
    side = "absolute top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white"
    body = f"""<div class="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-[var(--bg)]">
  {phone_listing_body(L)}
  <div role="dialog" aria-label="Ảnh đánh giá của Hoàng Nam" class="absolute inset-0 z-50 flex flex-col bg-black/95 text-white">
    <div class="flex h-16 shrink-0 items-center justify-between px-4">
      <span class="num text-[13px] font-medium leading-[18px]">1/3</span>
      <button type="button" class="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10" aria-label="Đóng">{ri("close-line", 24)}</button>
    </div>
    <div class="relative flex min-h-0 flex-1 items-center">
      <img src="{crop(HEADPHONES[0], 1200, 0.5, 0.5, 1.2)}" alt="Ảnh 1/3" class="h-full w-full object-contain">
    </div>
    <button type="button" class="{side} left-4 opacity-0" aria-label="Ảnh trước" disabled>{ri("arrow-left-s-line", 26)}</button>
    <button type="button" class="{side} right-4" aria-label="Ảnh sau">{ri("arrow-right-s-line", 26)}</button>
    <div class="h-16 shrink-0"></div>
  </div>
</div>"""
    return page("Ảnh đánh giá · điện thoại", body)


# --------------------------------------------------------- order pages --
def phase_track():
    steps = [("price-tag-3-line", "Chốt giá", "12/11"), ("truck-line", "Tạo đơn", "13/11"), ("box-3-line", "Nhận hàng", "15/11"), ("star-line", "Đánh giá", "")]
    cur = 3
    lis = ""
    for i, (ic, t, when) in enumerate(steps):
        bar_ = (f'<span class="absolute left-[calc(50%+22px)] right-[calc(-50%+22px)] top-[17px] h-[3px] rounded-full {"bg-[#005049]" if i < cur else f"bg-[{HIGH}]"}"></span>'
                if i < 3 else "")
        if i < cur:
            dot = f'<span class="grid h-[34px] w-[34px] place-items-center rounded-full bg-[{PRIMARY}] text-white">{ri("check-line", 20)}</span>'
        else:
            dot = f'<span class="grid h-[34px] w-[34px] place-items-center rounded-full bg-brand text-white ring-4 ring-[rgb(0_80_73/.15)]">{ri(ic, 20)}</span>'
        lis += (f'<li class="relative flex w-[112px] shrink-0 flex-col items-center text-center">{bar_}<span class="grid h-9 place-items-center">{dot}</span>'
                f'<span class="mt-2 text-[13px] font-medium leading-[18px]">{t}</span><span class="num h-4 text-[12px] leading-4 text-[{VARIANT}]">{when}</span></li>')
    return f'<div class="no-scrollbar overflow-x-auto"><ol class="flex">{lis}</ol></div>'


def hero(phone=False):
    box = "h-20 w-20" if phone else "h-[104px] w-[104px]"
    chip = f'<span class="flex h-8 items-center gap-1.5 rounded-full bg-[{LOW}] pl-2.5 pr-3 text-[12px] font-medium leading-4">{ri("hand-coin-line", 15)}Đã trả 3.230.000 ₫ cho shipper</span>'
    lay = "flex-col gap-4" if phone else "flex-row items-center gap-5 pr-8"
    return f"""<section class="mt-3 flex {lay} rounded-[16px] border bd bg-white p-3 shadow-[0_1px_2px_rgb(20_20_19/.04)]">
    <div class="flex min-w-0 flex-1 items-center gap-4">
      <img src="{img(HEADPHONES[0], 240, 240)}" alt="" class="{box} shrink-0 rounded-[16px] object-cover">
      <div class="min-w-0 flex-1"><h1 class="text-[28px] font-semibold leading-[34px] tracking-[-0.035em]">Đã nhận hàng</h1><div class="mt-2 flex flex-wrap gap-2">{chip}</div></div>
    </div>
    {phase_track()}
  </section>"""


TILE = f"relative aspect-square overflow-hidden rounded-[16px] bg-[{HIGH}]"
CHIP = "absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/55 text-white backdrop-blur"


def photo_field():
    """The review form's photos: Đăng tin's tiles, 4 at most."""
    done = "".join(f'<li class="{TILE}"><img src="{p}" alt="Ảnh đánh giá" class="h-full w-full object-cover">'
                   f'<button type="button" class="{CHIP}" aria-label="Bỏ ảnh">{ri("close-line", 15)}</button></li>' for p in REVIEW_PHOTOS[:2])
    busy = (f'<li class="{TILE}" aria-busy="true"><img src="{REVIEW_PHOTOS[2]}" alt="Ảnh đánh giá" class="h-full w-full object-cover">'
            f'<span class="absolute inset-0 grid place-items-center bg-black/40 text-white"><span class="spinner"></span></span></li>')
    add = (f'<li class="aspect-square"><label class="flex h-full cursor-pointer flex-col items-center justify-center gap-1 rounded-[16px] border-[1.5px] border-dashed border-[rgb(0_80_73/.4)] bg-[rgb(199_230_224/.4)] p-1 text-center">'
           f'{ri("image-add-line", 22, f"text-[{PRIMARY}]")}<span class="whitespace-nowrap text-[12px] font-medium leading-4">Thêm ảnh</span></label></li>')
    return f"""<div class="mt-3">
          <div class="flex items-center justify-between px-1">
            <span class="text-[12px] leading-4 text-[{VARIANT}]">Ảnh (không bắt buộc)</span>
            <span class="num rounded-full bg-[{LOW}] px-2.5 py-0.5 text-[12px] font-medium leading-4 text-[{VARIANT}]">3/4</span>
          </div>
          <ol class="mt-2 grid max-w-[400px] grid-cols-4 gap-2">{done}{busy}{add}</ol>
        </div>"""


def review_panel():
    picked = "".join(f'<label class="grid h-10 w-10 cursor-pointer place-items-center rounded-full text-[#E0A23B]">{ri("star-fill", 28)}</label>' for _ in range(5))
    return f"""<section class="card p-5">
      <h2 class="text-[14px] font-medium leading-5">Đánh giá {SELLER}</h2>
      <form class="mt-3">
        <div class="flex" role="radiogroup" aria-label="Số sao">{picked}</div>
        <label class="mt-3 block rounded-[12px] border bd bg-white px-4 py-2">
          <span class="block text-[12px] leading-4 text-[{VARIANT}]">Nhận xét (không bắt buộc)</span>
          <textarea rows="3" class="mt-0.5 block w-full resize-none bg-transparent text-[14px] leading-5 outline-none">Tai nghe đúng mô tả, pin trâu, chống ồn tốt. Bạn bán gói kỹ, giao nhanh.</textarea>
        </label>
        {photo_field()}
        <div class="mt-3 flex justify-end">
          <button type="button" class="flex h-10 items-center gap-1.5 rounded-[10px] bg-brand px-4 text-[14px] font-medium text-white">{ri("send-plane-2-line", 16)}Gửi đánh giá</button>
        </div>
      </form>
      <div class="mt-4 border-t bd pt-4">
        <p class="text-[13px] font-medium leading-[18px]">{SELLER} đánh giá bạn</p>
        <p class="mt-1 text-[13px] leading-[18px] text-[{VARIANT}]">Đã có · hiện từ 22/11</p>
      </div>
    </section>"""


def summary_aside(L):
    lines = (f'<p class="flex justify-between gap-3"><span class="text-[{VARIANT}]">Tiền hàng</span><span class="num flex items-center gap-1.5 text-[#773115]">{ri("shake-hands-line", 16)}3.200.000 ₫</span></p>'
             f'<p class="flex justify-between gap-3"><span class="text-[{VARIANT}]">Phí ship · GHTK</span><span class="num">30.000 ₫</span></p>')
    return f"""<aside class="sticky top-[84px] self-start overflow-hidden rounded-[16px] border bd bg-white shadow-[0_1px_2px_rgb(20_20_19/.04)]">
    <div class="flex items-center gap-3 p-4"><img src="{img(HEADPHONES[0], 160, 160)}" alt="" class="h-14 w-14 rounded-[10px] object-cover">
      <div class="min-w-0 flex-1"><p class="truncate text-[14px] font-medium leading-5">{HEADPHONES[2]}</p><p class="num text-[12px] leading-4 text-[{VARIANT}]">Giá chốt 3.200.000 ₫</p></div></div>
    <div class="mx-4 flex items-center gap-3 rounded-[12px] bg-[{LOW}] p-2.5">
      {L.a("row -m-1 flex min-w-0 flex-1 items-center gap-3 rounded-[10px] p-1", f'<img src="{img(SELLER_FACE, 72, 72)}" alt="" class="h-9 w-9 rounded-full object-cover"><span class="min-w-0 flex-1"><span class="block truncate text-[14px] font-medium leading-5">{SELLER}</span><span class="block text-[12px] leading-4 text-[{VARIANT}]">Người bán</span></span>')}
      {L.a(f"flex h-9 items-center gap-1.5 rounded-[10px] bg-white px-3 text-[13px] font-medium text-[{PRIMARY}]", ri("chat-3-line", 17) + "Nhắn")}
    </div>
    <div class="p-5">
      <p class="text-[13px] leading-[18px] text-[{VARIANT}]">Trả khi nhận</p>
      <p class="mt-0.5 flex items-baseline gap-x-1.5"><span class="num text-[30px] font-semibold leading-9 tracking-[-0.035em]">3.230.000</span><span class="text-[15px] font-medium text-[{VARIANT}]">₫</span></p>
      <div class="mt-3 flex flex-col gap-1.5 text-[13px] leading-[18px]">{lines}</div>
    </div>
  </aside>"""


def side_panels():
    steps = [("Đã nhận hàng", "Bạn bấm Đã nhận hàng", "15/11"), ("Đang giao", "GHTK lấy hàng", "13/11"), ("Đã tạo đơn", "", "13/11"), ("Chốt giá 3.200.000 ₫", "", "12/11")]
    lis = "".join(f'<li class="relative flex gap-3 pb-4 last:pb-0">{"" if i == len(steps) - 1 else "<span class=\"absolute bottom-0 left-[7px] top-5 w-px bg-black/10\"></span>"}'
                  f'<span class="relative mt-1 h-[15px] w-[15px] shrink-0 rounded-full {"bg-[#005049] ring-4 ring-[rgb(0_80_73/.15)]" if i == 0 else "border-2 border-[#BEC9C6] bg-white"}"></span>'
                  f'<span class="min-w-0 flex-1"><span class="block text-[13px] leading-[18px] {"font-medium" if i == 0 else ""}">{t}</span>'
                  + (f'<span class="block text-[12px] leading-4 text-[{VARIANT}]">{s}</span>' if s else "")
                  + f'</span><span class="num text-[12px] leading-4 text-[{VARIANT}]">{w}</span></li>' for i, (t, s, w) in enumerate(steps))
    return f"""<div class="grid grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] gap-4">
      <section class="card p-5"><div class="mb-2 flex justify-between"><h2 class="text-[14px] font-medium">Hành trình</h2><span class="text-[12px] font-medium text-[{PRIMARY}]">GHTK · Đã giao</span></div><ol class="mt-3">{lis}</ol></section>
      <section class="card px-5 py-3"><h2 class="mb-2 text-[14px] font-medium">Vận đơn</h2>
        <div class="flex min-h-[56px] items-center gap-3 py-2"><span class="grid h-9 w-9 place-items-center rounded-full bg-[{LOW}] text-[{VARIANT}]">{ri("bill-line", 19)}</span><span><span class="block text-[13px]">S22.1184.7731</span><span class="block text-[12px] text-[{VARIANT}]">GHTK</span></span></div>
        <div class="flex min-h-[56px] items-center gap-3 py-2"><span class="grid h-9 w-9 place-items-center rounded-full bg-[{LOW}] text-[{VARIANT}]">{ri("hashtag", 19)}</span><span><span class="block text-[13px]">SN-24A7K</span><span class="block text-[12px] text-[{VARIANT}]">Mã đơn ShopNexus</span></span></div>
      </section>
    </div>"""


def crumbs(parts):
    sep = ri("arrow-right-s-line", 14, "text-[#8C8C87]")
    return ('<nav class="flex items-center gap-1 whitespace-nowrap text-[12px] leading-4 text-[#8C8C87]">'
            + sep.join(parts[:-1]) + sep + f'<span class="text-[#1A1A19]">{parts[-1]}</span></nav>')


def review_desktop():
    L = Ids("ts-r")
    body = f"""{bar(L)}
<main class="mx-auto max-w-[1280px] px-8 pb-16 pt-5">
  {crumbs(["Tôi", "Đơn mua", "SN-24A7K"])}
  {hero()}
  <div class="mt-5 grid grid-cols-[minmax(0,1fr)_400px] gap-6">
    <div class="flex min-w-0 flex-col gap-4">
      {review_panel()}
      {side_panels()}
    </div>
    {summary_aside(L)}
  </div>
</main>"""
    return page("Đánh giá đơn · thêm ảnh", body)


def idle_nav():
    """The bottom bar with no tab on: an order is outside the four."""
    return bottom_nav().replace("compass-3-fill", "compass-3-line").replace(" bg-mint text-on-mint", "").replace('text-[12px] "', 'text-[12px] mute"')


def review_phone():
    body = f"""<div class="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-[var(--bg)]">
  {phone_header()}
  <main class="px-4 pt-4">
    {crumbs(["Tôi", "Đơn mua", "SN-24A7K"])}
    {hero(phone=True)}
    <div class="mt-5">{review_panel()}</div>
  </main>
  {idle_nav()}
</div>"""
    return page("Đánh giá đơn · điện thoại", body)


if __name__ == "__main__":
    for name, fn in [("listing", listing_desktop), ("listing-phone", listing_phone), ("review", review_desktop),
                     ("review-phone", review_phone), ("viewer-phone", viewer_phone)]:
        with open(os.path.join(OUT, f"trust-signals-{name}.html"), "w") as f:
            f.write(fn())
        print("wrote trust-signals", name)
