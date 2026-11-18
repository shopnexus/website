"""Superseded 2026-11-17: sell.html and how.html are drawn in J by build_j_flows.py.
This file still holds data and pieces the J builders import.

Đăng tin and Cách mua, in the chosen style (C's shell).

    python3 tools/build_sell_howto.py        (run from .superdesign/)

Writes mockups/sell.html and mockups/how.html. Deal facts follow app/mohinh.md;
money sentences are the app's MONEY sentences, word for word.
"""
import json
import os
from typing import Any

from build import OUT, a
from build_c import ART, CSS, footer, header
from common import MONEY, crop, head, icon, img, where

ART = {**ART, **json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "art_sh.json")))}

# The app's MONEY sentences (app/.superdesign/tools/common.py), verbatim.

PAGE_CSS = CSS + """
  .seg > * { border-radius: 4px; }
  .seg > :first-child { border-top-left-radius: 9999px; border-bottom-left-radius: 9999px; }
  .seg > :last-child { border-top-right-radius: 9999px; border-bottom-right-radius: 9999px; }
  .field { border-radius: 12px; border: 1px solid var(--md-outline-variant); background: var(--md-surface-container-lowest); }
  .drop { border: 2px dashed var(--md-outline); }
  details.faq > summary { list-style: none; cursor: pointer; }
  details.faq > summary::-webkit-details-marker { display: none; }
  details.faq[open] .chev { transform: rotate(180deg); }
  .chev { transition: transform 412ms var(--spatial); }
"""

SPARK = lambda size=16, cls="": icon("auto-awesome-rounded", size, f"text-primary {cls}")


# ---------------------------------------------------------------- Đăng tin --
PHOTO = "1603891128711-11b4b03bb138"
PHOTOS = [(crop(PHOTO, 900, 0.5, 0.5, 1), "Mặt lưng"), (crop(PHOTO, 480, 0.25, 0.25, 3), "Cụm camera"),
          (crop(PHOTO, 480, 0.5, 0.62, 1.8), "Logo và mặt lưng"), (crop("1591337676887-a217a6970a8a", 480, 0.5, 0.5, 1.2), "Mặt trước")]
TITLE = "iPhone 11 64GB Trắng, máy zin"
DESCRIPTION = "Máy dùng 3 năm, chưa sửa chữa hay thay linh kiện. Face ID và camera hoạt động tốt. Kèm cáp sạc."
CLAIMS = ["Pin 81%", "Bản VN/A", "Chưa từng sửa", "Kèm cáp sạc"]


def section(num, title, body, aside=""):
    return f"""<section class="rounded-xl bg-surface-container-low p-8">
  <div class="flex items-center gap-3">
    <span class="grid h-9 w-9 place-items-center rounded-full bg-primary-container text-title-s text-on-primary-container">{num}</span>
    <h2 class="flex-1 text-headline-s text-on-surface">{title}</h2>{aside}
  </div>
  {body}
</section>"""


def label(text, ai=False, extra=""):
    return f'<p class="mb-2 flex items-center gap-1.5 text-title-s text-on-surface">{text}{SPARK(16) if ai else ""}{extra}</p>'


# The price guide for this iPhone: the range, the sold prices behind it, the listings on sale, and the people waiting.
GUIDE: dict[str, Any] = dict(low=4_400_000, high=5_100_000, median=4_800_000, axis=(4_000_000, 5_600_000), sold=18, live=12, waiting=23)
# Sold prices in eight equal bins over the axis (200.000 ₫ each), the bars over the strip.
SOLD_BINS = [1, 2, 3, 5, 4, 2, 1, 0]
PRICE = 4_800_000
IP11, IPX = "1591337676887-a217a6970a8a", "1510557880182-3d4d3cba35a5"
SIMILAR = [(crop(IP11, 320, 0.5, 0.5, 1), "4.900.000", "Như mới", where("1,2 km", "Bình Thạnh"), False),
           (crop(IPX, 320, 0.5, 0.45, 1.2), "4.400.000", "Đã dùng", where("2,5 km", "Phú Nhuận"), False),
           (crop(IP11, 320, 0.4, 0.35, 1.5), "5.300.000", "Đã dùng", where("3,1 km", "Gò Vấp"), False)]


def price_body():
    """The Giá step on a wide window: the guide's sold prices as bars over the strip (the app keeps them in its sheet),
    the two suggestions, the price with its verdict, the offer switch, then similar listings and the people waiting."""
    lo, hi = GUIDE["axis"]
    at = lambda v: round((v - lo) / (hi - lo) * 100, 2)
    peak = max(SOLD_BINS)
    step = (hi - lo) // len(SOLD_BINS)
    tr = lambda v: f"{v / 1e6:.1f}".rstrip("0").rstrip(".").replace(".", ",")
    bars = "".join(
        f'<span class="flex h-full flex-1 items-end" title="{n} tin bán {tr(lo + i * step)}–{tr(lo + (i + 1) * step)} tr">'
        f'<span class="block w-full rounded-t-[4px] bg-primary/80" style="height:{n / peak * 100:.0f}%"></span></span>'
        for i, n in enumerate(SOLD_BINS))
    guide = f"""<div class="mt-6">
  <button type="button" class="state -mx-3 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-title-s text-tertiary" aria-haspopup="dialog">
    {icon("auto-awesome-rounded", 18)}Giá tham khảo {tr(GUIDE["low"])} – {tr(GUIDE["high"])} tr ₫{icon("chevron-right-rounded", 20)}</button>
  <div class="relative mt-4">
    <div class="flex h-24 items-end gap-1.5 border-b border-outline-variant" role="img" aria-label="Số tin đã bán theo giá, nhiều nhất quanh 4,6 tr">{bars}</div>
    <span class="absolute top-0 h-24 w-0.5 -translate-x-1/2 bg-tertiary" style="left:{at(PRICE)}%" aria-hidden="true"></span>
  </div>
  <div class="relative h-12 cursor-grab" role="slider" aria-label="Giá bán" aria-valuemin="{lo}" aria-valuemax="{hi}" aria-valuenow="{PRICE}" tabindex="0">
    <span class="absolute inset-x-0 top-4 h-2 rounded-full bg-surface-container-highest"></span>
    <span class="absolute top-4 h-2 rounded-full bg-tertiary-fixed" style="left:{at(GUIDE["low"])}%;right:{100 - at(GUIDE["high"])}%"></span>
    <span class="absolute top-3 h-4 w-0.5 -translate-x-1/2 rounded-full bg-on-surface-variant" style="left:{at(GUIDE["median"])}%"></span>
    <span class="absolute top-2.5 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-surface-container-low bg-tertiary shadow-float" style="left:{at(PRICE)}%"></span>
    <span class="absolute left-0 top-8 text-body-s text-on-surface-variant">{tr(lo)} tr</span>
    <span class="absolute top-8 -translate-x-1/2 text-body-s text-on-surface-variant" style="left:{at(GUIDE["median"])}%">giữa {tr(GUIDE["median"])} tr</span>
    <span class="absolute right-0 top-8 text-body-s text-on-surface-variant">{tr(hi)} tr</span>
  </div>
  <p class="mt-3 text-body-s text-on-surface-variant">Từ {GUIDE["sold"]} tin đã bán và {GUIDE["live"]} tin đang bán giống món này</p>
</div>"""
    picks = "".join(
        f"""<button type="button" class="state flex flex-1 items-center gap-3 rounded-lg p-4 text-left {"bg-secondary-container text-on-secondary-container ring-2 ring-primary" if sel else "bg-surface-container-lowest text-on-surface"}">
  {icon(ic, 24)}<span class="flex-1"><span class="block text-label-l">{t}</span><span class="block text-title-l">{p}<span class="text-body-m"> ₫</span></span></span>
  <span class="flex items-center gap-1 text-body-s">{icon("schedule-outline-rounded", 16)}{d}</span>
</button>""" for ic, t, p, d, sel in [("bolt-outline-rounded", "Bán nhanh", "4.500.000", "~2 ngày", False), ("balance-rounded", "Giá thị trường", "4.800.000", "~1 tuần", True)])
    cards = "".join(
        f"""<button type="button" class="state w-[156px] rounded-lg text-left" aria-haspopup="dialog" title="So với tin của bạn">
  <span class="relative block aspect-square overflow-hidden rounded-lg bg-surface-container-high"><img src="{ph}" alt="" class="h-full w-full object-cover">{'<span class="absolute left-2 top-2 rounded-full bg-inverse-surface px-2 py-0.5 text-label-s text-inverse-on-surface">Đã bán</span>' if sold else ""}</span>
  <span class="mt-2 block text-title-m text-on-surface">{p}<span class="text-body-m text-on-surface-variant"> ₫</span></span>
  <span class="block text-body-s text-on-surface-variant">{cond}</span>
  <span class="block text-body-s text-on-surface-variant">{w}</span>
</button>""" for ph, p, cond, w, sold in SIMILAR)
    chip = lambda t, on: (f'<button type="button" class="state flex h-8 items-center gap-1 rounded-sm px-3 text-label-l '
                          + ('bg-secondary-container text-on-secondary-container">' + icon("check-rounded", 18) if on else 'border border-outline-variant text-on-surface-variant">')
                          + f'{t}</button>')
    return f"""{guide}
  <div class="mt-6 flex gap-3">{picks}</div>
  <div class="mt-5 grid grid-cols-[1fr_auto] items-end gap-6">
    <div>{label("Giá bán")}<div class="field flex h-16 items-center justify-between px-5 text-headline-s text-on-surface ring-2 ring-primary">4.800.000<span class="text-title-m text-on-surface-variant">₫</span></div>
      <p class="mt-2 flex items-center gap-1 text-label-l text-tertiary">{icon("auto-awesome-rounded", 16)}Rẻ hơn 8/12 tin đang bán · bán trong ~1 tuần</p></div>
    <label class="mb-7 flex h-16 items-center gap-4 rounded-lg bg-surface-container-lowest px-4">
      {icon("sell-outline-rounded", 22, "text-on-surface-variant")}<span class="text-label-l text-on-surface">Cho phép trả giá</span>
      <span class="relative h-8 w-[52px] rounded-full bg-primary"><span class="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-on-primary"></span></span>
    </label>
  </div>
  <div class="mt-8 border-t border-outline-variant pt-6">
    <div class="flex items-baseline justify-between gap-4">
      <h3 class="text-title-l text-on-surface">Tin giống bạn</h3>
      <p class="text-body-s text-on-surface-variant">Cùng danh mục và tình trạng, đang bán hoặc đã bán gần đây</p>
    </div>
    <div class="mt-3 flex gap-2">{chip("Đang bán · 3", True)}{chip("Đã bán · 3", False)}</div>
    <div class="mt-4 flex gap-3">{cards}</div>
  </div>
  <div class="mt-6 flex items-center gap-4 rounded-lg bg-surface-container-lowest p-4">
    <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-container text-on-primary-container">{icon("notifications-active-outline-rounded", 22)}</span>
    <p class="flex-1"><span class="block text-title-s text-on-surface">{GUIDE["waiting"]} người đang tìm món như của bạn</span>
      <span class="block text-body-s text-on-surface-variant">Họ đang theo dõi một tìm kiếm khớp với tin này ở giá bạn đặt</span></p>
  </div>"""


def sell():
    cover, *rest = PHOTOS
    tiles = "".join(
        f"""<button type="button" class="state relative aspect-square overflow-hidden rounded-lg bg-surface-container-high" title="Đặt làm ảnh bìa">
  <img src="{src}" alt="{alt}" class="h-full w-full object-cover">
  <span class="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white" aria-label="Bỏ ảnh">{icon("close-rounded", 16)}</span>
</button>""" for src, alt in rest)
    drop = f"""<label class="drop flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg bg-surface-container-lowest text-center text-on-surface-variant">
  {icon("add-photo-alternate-outline-rounded", 30, "text-primary")}<span class="text-label-l text-on-surface">Thêm ảnh</span><span class="px-3 text-body-s">Kéo thả vào đây</span>
</label>"""
    # The model reads the cover only; the web has no camera, so every photo is an upload and carries no badge.
    photos = section("1", "Ảnh", f"""
  <div class="mt-6 grid grid-cols-[1.35fr_1fr] gap-3">
    <div class="relative overflow-hidden rounded-xl bg-surface-container-high" style="aspect-ratio: 4 / 3">
      <img src="{cover[0]}" alt="Ảnh bìa: {cover[1]}" class="h-full w-full object-cover">
      <span class="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-label-m text-white">Ảnh bìa</span>
    </div>
    <div class="grid grid-cols-2 gap-3">{tiles}{drop}</div>
  </div>
  <div class="mt-4 flex items-center justify-between text-body-s text-on-surface-variant">
    <span class="flex items-center gap-1.5">{icon("upload-rounded", 16)}Ảnh tải lên</span>
    <span>Bấm một ảnh để đặt làm ảnh bìa</span>
  </div>""", '<span class="text-body-m text-on-surface-variant">4/10</span>')

    cond = "".join(f'<span class="flex h-11 flex-1 items-center justify-center gap-1 text-label-l {"bg-secondary-container text-on-secondary-container" if t == "Đã dùng" else "bg-surface-container-lowest text-on-surface-variant"}">'
                   f'{icon("check-rounded", 18) if t == "Đã dùng" else ""}{t}</span>' for t in ["Mới", "Như mới", "Đã dùng"])
    claims = "".join(f'<span class="flex h-9 items-center gap-1.5 rounded-full bg-surface-container-lowest pl-3 pr-2 text-label-l text-on-surface">{c}'
                     f'<span class="grid h-6 w-6 place-items-center rounded-full text-on-surface-variant">{icon("close-rounded", 16)}</span></span>' for c in CLAIMS)
    item = section("2", "Món đồ", f"""
  <div class="mt-6 flex flex-col gap-6">
    <div>{label("Tiêu đề", ai=True)}<div class="field flex h-14 items-center justify-between px-4 text-body-l text-on-surface">{TITLE}<span class="text-body-s text-on-surface-variant">{len(TITLE)}/80</span></div></div>
    <div class="grid grid-cols-2 gap-4">
      <div>{label("Danh mục", ai=True)}<div class="field flex h-14 items-center justify-between px-4 text-body-l">Điện thoại › iPhone{icon("keyboard-arrow-down-rounded", 22, "text-on-surface-variant")}</div></div>
      <div>{label("Màu", ai=True)}<div class="field flex h-14 items-center px-4 text-body-l">Trắng</div></div>
      <div>{label("Dung lượng")}<div class="field flex h-14 items-center justify-between px-4 text-body-l">64 GB{icon("keyboard-arrow-down-rounded", 22, "text-on-surface-variant")}</div></div>
      <div>{label("Pin")}<div class="field flex h-14 items-center justify-between px-4 text-body-l">81<span class="text-on-surface-variant">%</span></div></div>
    </div>
    <div>{label("Tình trạng", ai=True)}<div class="seg flex gap-0.5">{cond}</div><p class="mt-2 text-body-m text-on-surface-variant">Có vết thấy rõ hoặc lỗi nhỏ</p></div>
    <div>{label("Tin ghi", extra='<span class="ml-1 text-body-s font-normal text-on-surface-variant">· người mua kiểm những điều này khi nhận hàng</span>')}
      <div class="flex flex-wrap gap-2">{claims}<button type="button" class="state flex h-9 items-center gap-1 rounded-full border border-dashed border-outline px-3 text-label-l text-on-surface-variant">{icon("add-rounded", 18)}Thêm điều bạn ghi</button></div></div>
    <div>{label("Mô tả", ai=True)}<div class="field min-h-[112px] px-4 py-3 text-body-l text-on-surface">{DESCRIPTION}</div></div>
  </div>""")

    price = section("3", "Giá", price_body())

    deal = section("4", "Giao dịch", f"""
  <div class="mt-6 flex flex-col gap-3">
    <div class="flex items-center gap-4 rounded-lg bg-surface-container-lowest p-4">
      {icon("local-shipping-outline-rounded", 26, "text-on-surface-variant")}
      <span class="flex-1"><span class="block text-body-l">COD, xem hàng trước</span><span class="block text-body-s text-on-surface-variant">Người mua xem hàng rồi mới trả</span></span>
    </div>
    <div class="flex items-center gap-4 rounded-lg bg-surface-container-lowest p-4">
      <span class="grid h-10 w-10 place-items-center rounded-full bg-secondary-container text-on-secondary-container">{icon("check-rounded", 22)}</span>
      <span class="flex-1"><span class="block text-body-l">Gửi bằng GHTK · tài khoản của bạn</span><span class="block text-body-s text-on-surface-variant">Có đơn thì bạn tạo vận đơn ngay trên ShopNexus</span></span>
      {a("change-carrier", "state flex h-10 items-center rounded-full px-4 text-label-l text-primary", "Đổi")}
    </div>
    <div class="flex items-center gap-4 rounded-lg bg-surface-container-lowest p-4">
      {icon("location-on-outline-rounded", 26, "text-on-surface-variant")}
      <span class="flex-1"><span class="block text-body-l">Bình Thạnh</span><span class="flex items-center gap-1 text-body-s text-on-surface-variant">{icon("visibility-outline-rounded", 14)}Chỉ hiện quận</span></span>
      {a("change-area", "state flex h-10 items-center rounded-full px-4 text-label-l text-primary", "Đổi")}
    </div>
    <div class="mt-2 flex flex-col gap-2.5">
      <p class="flex gap-2 text-body-m text-on-surface-variant">{icon("account-balance-outline-rounded", 18, "mt-0.5")}<span>{MONEY["cod_seller"]}</span></p>
      <p class="flex gap-2 text-body-m text-on-surface-variant">{icon("undo-rounded", 18, "mt-0.5")}<span>{MONEY["return_leg"]}</span></p>
    </div>
  </div>""")

    ready = "".join(f'<li class="flex items-center gap-3 text-body-m text-on-surface">{icon("check-circle-rounded", 20, "text-primary")}{t}</li>'
                    for t in ["4 ảnh, có ảnh bìa", "Tiêu đề và tình trạng", "Giá 4.800.000 ₫", "Giao COD bằng GHTK"])
    body = f"""<body>
<div class="min-h-screen bg-surface pb-2 font-sans text-on-surface">
  {header(quick="always").replace('bg-secondary-container text-on-secondary-container">Khám phá', 'text-on-surface-variant">Khám phá', 1).replace('bg-primary pl-4 pr-5 text-label-l text-on-primary', 'bg-secondary-container pl-4 pr-5 text-label-l text-on-secondary-container', 1)}
  <main class="mx-auto max-w-[1328px] px-6">
    <div class="mt-8 flex items-end justify-between">
      <div><p class="text-label-l uppercase tracking-[0.12em] text-primary">Bán đồ</p><h1 class="mt-2 text-display-m">Đăng tin</h1></div>
      <div class="flex flex-col items-end gap-1.5">
        <div class="flex items-center gap-2">
          <button type="button" class="state h-12 rounded-full px-5 text-label-l text-primary">Lưu nháp</button>
          {a("cancel-sell", "state flex h-12 items-center rounded-full border border-outline-variant px-5 text-label-l text-on-surface-variant", "Hủy")}
        </div>
        <p class="flex items-center gap-1 text-body-s text-on-surface-variant">{icon("draft-outline-rounded", 16)}Nháp giữ 30 ngày từ lần sửa cuối, tối đa 20 nháp</p>
      </div>
    </div>
    <div class="mt-8 grid grid-cols-[1fr_400px] gap-8">
      <div class="flex flex-col gap-5">{photos}{item}{price}{deal}</div>
      <aside class="self-start">
        <div class="sticky top-[104px] flex flex-col gap-4">
          <p class="text-label-l uppercase tracking-[0.12em] text-on-surface-variant">Người mua sẽ thấy</p>
          <article class="rounded-xl bg-surface-container-lowest p-4 shadow-float">
            <div class="relative overflow-hidden rounded-xl" style="aspect-ratio: 4 / 5">
              <img src="{crop(PHOTO, 600, 0.5, 0.5, 1)}" alt="" class="h-full w-full object-cover">
              <span class="absolute bottom-3 left-3 rounded-full bg-surface-container-lowest px-3 py-1 text-title-m text-on-surface shadow-float">4.800.000<span class="text-body-s text-on-surface-variant"> ₫</span></span>
              <span class="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-label-m text-white">Bình Thạnh</span>
            </div>
            <h3 class="mt-3 text-body-l text-on-surface">{TITLE}</h3>
            <p class="mt-1 text-body-s text-on-surface-variant">Đã dùng · 64 GB · Pin 81%</p>
          </article>
          <div class="rounded-xl bg-surface-container-low p-5">
            <p class="text-title-m">Sẵn sàng đăng</p>
            <ul class="mt-3 flex flex-col gap-2.5">{ready}</ul>
          </div>
          <button type="button" class="state flex h-14 items-center justify-center gap-2 rounded-full bg-primary text-label-l text-on-primary">{icon("send-rounded", 20)}Đăng tin</button>
          {a("preview-page", "state flex h-12 items-center justify-center gap-2 rounded-full border border-outline-variant text-label-l text-on-surface", icon("visibility-outline-rounded", 20) + "Xem trước trang tin")}
        </div>
      </aside>
    </div>
  </main>
  {footer()}
</div>
</body>
</html>"""
    return head("Đăng tin · ShopNexus", PAGE_CSS) + body


# ---------------------------------------------------------------- Cách mua --
def how():
    # The app's four order steps (Chốt giá, Tạo đơn, Nhận hàng, Đánh giá), each with what the buyer does in it.
    steps = [
        ("art_deal", "Chốt giá", "Tìm món gần bạn bằng một câu hoặc một tấm ảnh, rồi nhắn người bán và trả giá. Hai bên đồng ý là chốt, giá đó vào đơn.", [], True),
        ("art_orders", "Tạo đơn", "Bạn chọn giao COD với một địa chỉ trong sổ. Người bán tạo vận đơn ngay trên ShopNexus bằng tài khoản GHTK hoặc GHN đứng tên mình, hoặc tự gửi rồi nhập mã vận đơn. Đơn hiện hãng, mã vận đơn và phí ship.", [], False),
        ("door-check", "Nhận hàng", "Shipper tới, bạn xem hàng rồi bấm “Đã nhận hàng”. Hãng báo đã giao mà bạn chưa nhận, bấm “Báo chưa nhận hàng” để gửi cho Hỗ trợ.", [], False),
        ("art_reviews", "Đánh giá", "Chấm sao cho người bán. Đánh giá tính vào điểm uy tín của họ.", [], False),
    ]
    step_html = "".join(
        f"""<li class="grid grid-cols-[96px_1fr_300px] items-center gap-8 rounded-xl p-8 {"bg-tertiary-fixed" if bar else "bg-surface-container-low"}">
  <span class="text-display-l {"text-on-tertiary-fixed-variant/40" if bar else "text-outline-variant"}">0{i + 1}</span>
  <div>
    <h3 class="text-headline-m {"text-on-tertiary-fixed-variant" if bar else "text-on-surface"}">{t}</h3>
    <p class="mt-3 max-w-[560px] text-body-l {"text-on-tertiary-fixed-variant" if bar else "text-on-surface-variant"}">{d}</p>
    {"".join(f'<p class="mt-3 flex max-w-[600px] gap-2 text-body-m text-on-surface">{icon("info-outline-rounded", 18, "mt-0.5 text-primary")}<span>{MONEY[k]}</span></p>' for k in keys)}
  </div>
  <img src="{ART[art]}" alt="" class="mx-auto h-[200px] w-[200px] object-contain">
</li>""" for i, (art, t, d, keys, bar) in enumerate(steps))
    do = [("search-rounded", "Kết nối bạn với người bán quanh nhà", "Tìm bằng cả câu hoặc bằng ảnh, AI điền tin giúp người bán."),
          ("query-stats-rounded", "Đưa giá tham khảo", "So giá một tin với các tin giống nó đã bán và đang bán."),
          ("local-shipping-outline-rounded", "Tạo vận đơn qua hãng của người bán", "GHTK hoặc GHN báo đơn tới đâu, bạn xem ngay trong đơn."),
          ("support-agent-outline-rounded", "Nhận yêu cầu trong Hỗ trợ", "Chưa nhận được hàng hay cần hỏi gì, bạn gửi yêu cầu và ShopNexus trả lời trong chat.")]
    dont = [("gavel-rounded", "Không phân xử giữa người mua và người bán."),
            ("payments-outline-rounded", "Không thu phí ship: bạn trả cho shipper, hãng chuyển tiền hàng cho người bán."),
            ("shield-outline-rounded", "Người thật chỉ xử lý ba việc: hàng cấm và hàng giả bị báo cáo, lừa đảo có dấu hiệu tổ chức, yêu cầu hợp lệ từ cơ quan.")]
    do_html = "".join(f'<li class="flex gap-4"><span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary-container text-on-secondary-container">{icon(ic, 22)}</span>'
                      f'<div><p class="text-title-m text-on-surface">{t}</p><p class="mt-0.5 text-body-m text-on-surface-variant">{d}</p></div></li>' for ic, t, d in do)
    dont_html = "".join(f'<li class="flex gap-4"><span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-inverse-on-surface/10 text-inverse-on-surface">{icon(ic, 22)}</span>'
                        f'<p class="pt-2.5 text-body-l text-inverse-on-surface">{t}</p></li>' for ic, t in dont)
    faq = [("Mở ra thấy không đúng mô tả thì sao?", "Bạn từ chối nhận, hàng quay về người bán.", True),
           ("Hãng báo đã giao mà tôi chưa nhận?", "Trong đơn, bấm “Báo chưa nhận hàng”. Yêu cầu tới Hỗ trợ và ShopNexus trả lời trong chat.", False),
           ("Tôi hủy đơn được không?", "Được, khi người bán chưa tạo vận đơn. Bạn không mất tiền.", False),
           ("Phí ship ai trả, bao nhiêu?", "Bạn thấy phí ship trong đơn khi người bán tạo vận đơn.", False)]
    faq_html = "".join(f"""<details class="faq rounded-lg bg-surface-container-low px-6 py-5"{" open" if op else ""}>
  <summary class="flex items-center justify-between gap-4 text-title-m text-on-surface">{q}{icon("keyboard-arrow-down-rounded", 24, "chev text-on-surface-variant")}</summary>
  <p class="mt-3 max-w-[760px] text-body-l text-on-surface-variant">{ans}</p>
</details>""" for q, ans, op in faq)
    nav_header = header(quick="always").replace('bg-secondary-container text-on-secondary-container">Khám phá', 'text-on-surface-variant">Khám phá', 1) \
        .replace('text-on-surface-variant">Cách mua', 'bg-secondary-container text-on-secondary-container">Cách mua', 1)
    body = f"""<body>
<div class="min-h-screen bg-surface pb-2 font-sans text-on-surface">
  {nav_header}
  <main class="mx-auto max-w-[1328px] px-6">
    <section class="relative mt-6 grid h-[480px] grid-cols-[1fr_460px] overflow-hidden rounded-xl bg-primary-container">
      <div class="flex flex-col justify-center pl-14">
        <p class="text-label-l uppercase tracking-[0.12em] text-on-primary-container">Cách mua trên ShopNexus</p>
        <h1 class="mt-3 text-display-l text-white">Xem hàng tận tay<br>rồi mới trả tiền</h1>
        <div class="mt-8 flex gap-3">
          {a("start-search", "state flex h-12 items-center gap-2 rounded-full bg-surface-container-lowest px-6 text-label-l text-primary", icon("search-rounded", 20) + "Bắt đầu tìm")}
          {a("jump-faq", "state flex h-12 items-center rounded-full border border-on-primary-container/40 px-6 text-label-l text-white", "Câu hỏi thường gặp")}
        </div>
      </div>
      <img src="{ART["art_received"]}" alt="" class="absolute -bottom-6 right-8 w-[420px]">
    </section>

    <section class="mt-20">
      <h2 class="text-display-s">Bốn bước, từ lúc chốt giá tới lúc đánh giá</h2>
      <ol class="mt-8 flex flex-col gap-4">{step_html}</ol>
    </section>

    <section class="mt-16 grid grid-cols-2 gap-5">
      <div class="rounded-xl bg-surface-container-low p-10">
        <h2 class="text-headline-m">ShopNexus làm</h2>
        <ul class="mt-7 flex flex-col gap-6">{do_html}</ul>
      </div>
      <div class="rounded-xl bg-inverse-surface p-10">
        <h2 class="text-headline-m text-inverse-on-surface">ShopNexus không làm</h2>
        <ul class="mt-7 flex flex-col gap-6">{dont_html}</ul>
      </div>
    </section>

    <section id="faq" class="mt-20 grid grid-cols-[360px_1fr] gap-10">
      <div>
        <h2 class="text-display-s">Câu hỏi thường gặp</h2>
        <img src="{ART["art_cod_ready"]}" alt="" class="mt-6 w-[220px]">
      </div>
      <div class="flex flex-col gap-3">{faq_html}</div>
    </section>

    <section class="relative mt-20 grid h-[300px] grid-cols-[1fr_380px] overflow-hidden rounded-xl bg-surface-container">
      <div class="flex flex-col justify-center pl-14">
        <h2 class="text-display-s">Có đồ cũ muốn bán?</h2>
        <p class="mt-3 max-w-[520px] text-body-l text-on-surface-variant">Tải vài tấm ảnh lên, AI điền giúp tên, tình trạng và giá.</p>
        <div class="mt-6">{a("go-sell", "state inline-flex h-12 items-center gap-2 rounded-full bg-inverse-surface px-6 text-label-l text-inverse-on-surface", icon("add-rounded", 20) + "Đăng tin")}</div>
      </div>
      <img src="{ART["art_ai_camera"]}" alt="" class="absolute -bottom-4 right-10 w-[320px]">
    </section>
  </main>
  {footer()}
</div>
</body>
</html>"""
    return head("Cách mua · ShopNexus", PAGE_CSS) + body


if __name__ == "__main__":
    # Writing would put the old look back over the J pages.
    print("superseded: run build_j_flows.py")
