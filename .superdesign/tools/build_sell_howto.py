"""Đăng tin and Cách mua, in the chosen style (C's shell).

    python3 tools/build_sell_howto.py        (run from .superdesign/)

Writes mockups/sell.html and mockups/how.html. Deal facts follow app/mohinh.md;
money sentences are the app's MONEY sentences, word for word.
"""
import json
import os

from build import OUT, a
from build_c import ART, CSS, footer, header
from common import crop, head, icon, img

ART = {**ART, **json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "art_sh.json")))}

# The app's MONEY sentences (app/.superdesign/tools/common.py), verbatim.
MONEY = dict(
    no_hold="ShopNexus không giữ tiền và không nhận cọc.",
    meet_hint="Món trên 5 triệu nên hẹn gặp xem trực tiếp.",
    cod_buyer="Xem hàng rồi mới trả tiền hàng và phí ship cho shipper.",
    cancel="Bạn hủy được đơn khi người bán chưa gửi hàng và không mất tiền.",
    refuse="Nếu không ưng, bạn từ chối nhận hàng và không mất tiền.",
    after_pay="Sau khi bạn trả tiền, ShopNexus không đòi lại tiền được. Nếu hàng có vấn đề, bạn mở ghi nhận trong chat.",
    cod_seller="Bên vận chuyển chuyển tiền hàng cho bạn 1–2 ngày sau khi người mua nhận.",
    return_leg="Người mua từ chối nhận thì bạn trả phí ship cả chiều đi và chiều về.",
    pay_shipper="Trả tiền hàng và phí ship cho shipper sau khi xem, bằng tiền mặt hoặc chuyển khoản.",
)

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
PHOTOS = [(crop(PHOTO, 900, 0.5, 0.5, 1), "Mặt lưng", "app"), (crop(PHOTO, 480, 0.25, 0.25, 3), "Cụm camera", "app"),
          (crop(PHOTO, 480, 0.5, 0.62, 1.8), "Logo và mặt lưng", "app"), (crop("1591337676887-a217a6970a8a", 480, 0.5, 0.5, 1.2), "Mặt trước", "library")]
SHOTS = [("flip-to-back-rounded", "Mặt sau", True), ("camera-outline-rounded", "Cụm camera", True), ("mobile-outline-rounded", "Màn hình sáng", True),
         ("battery-horiz-075-rounded", "Màn hình Pin", False), ("border-outer-rounded", "Cạnh viền", False), ("package-2-outline-rounded", "Hộp, phụ kiện", False)]
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


def source_badge(src):
    ic, t = ("photo-camera-rounded", "Chụp trong app") if src == "app" else ("photo-library-rounded", "Từ thư viện")
    return f'<span class="absolute bottom-2 left-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white" title="{t}" aria-label="{t}">{icon(ic, 16)}</span>'


def sell():
    cover, *rest = PHOTOS
    tiles = "".join(
        f"""<div class="relative aspect-square overflow-hidden rounded-lg bg-surface-container-high">
  <img src="{src}" alt="{alt}" class="h-full w-full object-cover">{source_badge(s)}
  <button type="button" class="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-black/60 text-white" aria-label="Bỏ ảnh">{icon("close-rounded", 16)}</button>
</div>""" for src, alt, s in rest)
    drop = f"""<label class="drop flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg bg-surface-container-lowest text-center text-on-surface-variant">
  {icon("add-photo-alternate-outline-rounded", 30, "text-primary")}<span class="text-label-l text-on-surface">Thêm ảnh</span><span class="px-3 text-body-s">Kéo thả vào đây</span>
</label>"""
    shots = "".join(
        f"""<div class="flex h-[76px] flex-col items-center justify-center gap-1 rounded-lg {"bg-surface-container-lowest text-on-surface" if have else "drop border-outline-variant text-on-surface-variant"}">
  <span class="flex items-center gap-1">{icon(ic, 20)}{icon("check-circle-rounded", 16, "text-primary") if have else ""}</span>
  <span class="text-label-m">{t}</span>{"" if have else ('<span class="text-label-s text-primary">Hay được hỏi</span>' if t == "Màn hình Pin" else '<span class="text-label-s text-primary">Thêm ảnh</span>')}
</div>""" for ic, t, have in SHOTS)
    photos = section("1", "Ảnh", f"""
  <div class="mt-6 grid grid-cols-[1.35fr_1fr] gap-3">
    <div class="relative overflow-hidden rounded-xl bg-surface-container-high" style="aspect-ratio: 4 / 3">
      <img src="{cover[0]}" alt="{cover[1]}" class="h-full w-full object-cover">{source_badge(cover[2])}
      <span class="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-label-m text-white">Ảnh bìa</span>
    </div>
    <div class="grid grid-cols-2 gap-3">{tiles}{drop}</div>
  </div>
  <div class="mt-6">
    <div class="flex items-center justify-between">{label("Người mua iPhone hay xem", ai=True)}<span class="text-body-s text-on-surface-variant">3/6</span></div>
    <div class="grid grid-cols-6 gap-2">{shots}</div>
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

    lo, hi = 4_000_000, 5_600_000
    at = lambda v: round((v - lo) / (hi - lo) * 100, 2)
    strip = f"""<div class="relative mt-3 h-12" aria-hidden="true">
  <span class="absolute inset-x-0 top-4 h-2 rounded-full bg-surface-container-highest"></span>
  <span class="absolute top-4 h-2 rounded-full bg-tertiary-fixed" style="left:{at(4_400_000)}%;right:{100 - at(5_100_000)}%"></span>
  <span class="absolute top-3 h-4 w-0.5 -translate-x-1/2 rounded-full bg-on-surface-variant" style="left:{at(4_800_000)}%"></span>
  <span class="absolute top-2.5 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-surface-container-low bg-tertiary shadow-float" style="left:{at(4_800_000)}%"></span>
  <span class="absolute left-0 top-8 text-body-s text-on-surface-variant">4 tr</span>
  <span class="absolute top-8 -translate-x-1/2 text-body-s text-on-surface-variant" style="left:{at(4_800_000)}%">giữa 4,8 tr</span>
  <span class="absolute right-0 top-8 text-body-s text-on-surface-variant">5,6 tr</span>
</div>
<div class="h-2"></div>"""
    picks = "".join(
        f"""<button type="button" class="state flex flex-1 items-center gap-3 rounded-lg p-4 text-left {"bg-secondary-container text-on-secondary-container ring-2 ring-primary" if sel else "bg-surface-container-lowest text-on-surface"}">
  {icon(ic, 24)}<span class="flex-1"><span class="block text-label-l">{t}</span><span class="block text-title-l">{p}<span class="text-body-m"> ₫</span></span></span>
  <span class="flex items-center gap-1 text-body-s">{icon("schedule-outline-rounded", 16)}{d}</span>
</button>""" for ic, t, p, d, sel in [("bolt-outline-rounded", "Bán nhanh", "4.500.000", "~2 ngày", False), ("balance-rounded", "Giá thị trường", "4.800.000", "~1 tuần", True)])
    price = section("3", "Giá", f"""
  <div class="mt-6">
    <p class="flex items-center gap-1.5 text-title-m text-on-surface">{SPARK(18)}Giá thị trường 4,4 – 5,1 tr ₫{icon("chevron-right-rounded", 20, "text-on-surface-variant")}</p>
    {strip}
    <p class="text-body-s text-on-surface-variant">18 máy đã bán, 12 tin đang bán trong 10 km · 30 ngày</p>
  </div>
  <div class="mt-6 flex gap-3">{picks}</div>
  <div class="mt-5 grid grid-cols-[1fr_auto] items-end gap-6">
    <div>{label("Giá bán")}<div class="field flex h-16 items-center justify-between px-5 text-headline-s text-on-surface ring-2 ring-primary">4.800.000<span class="text-title-m text-on-surface-variant">₫</span></div>
      <p class="mt-2 flex items-center gap-1 text-label-l text-tertiary">{icon("auto-awesome-rounded", 16)}Rẻ hơn 8/12 tin đang bán · bán trong ~1 tuần</p></div>
    <label class="flex h-16 items-center gap-4 rounded-lg bg-surface-container-lowest px-4">
      <span><span class="block text-label-l text-on-surface">Cho phép trả giá</span><span class="block text-body-s text-on-surface-variant">Thường được trả thấp hơn ~4%</span></span>
      <span class="relative h-8 w-[52px] rounded-full bg-primary"><span class="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full bg-on-primary"></span></span>
    </label>
  </div>
  <div class="mt-5 flex items-center gap-3 rounded-lg bg-surface-container-lowest p-4">
    <span class="grid h-10 w-10 place-items-center rounded-full bg-primary-container text-on-primary-container">{icon("notifications-active-outline-rounded", 22)}</span>
    <p class="flex-1 text-body-m text-on-surface">23 người đang chờ iPhone 11 64GB</p>
    {a("similar-listings", "text-label-l text-primary hover:underline", "Xem tin giống bạn")}
  </div>""")

    deal = section("4", "Giao dịch", f"""
  <div class="mt-6 flex flex-col gap-3">
    <div class="flex items-center gap-4 rounded-lg bg-surface-container-lowest p-4">
      {icon("local-shipping-outline-rounded", 26, "text-on-surface-variant")}
      <span class="flex-1"><span class="block text-body-l">COD, xem hàng trước</span><span class="block text-body-s text-on-surface-variant">Người mua xem hàng rồi mới trả</span></span>
    </div>
    <div class="flex items-center gap-4 rounded-lg bg-surface-container-lowest p-4">
      <span class="grid h-10 w-10 place-items-center rounded-full bg-secondary-container text-on-secondary-container">{icon("check-rounded", 22)}</span>
      <span class="flex-1"><span class="block text-body-l">Gửi bằng tài khoản GHTK của bạn</span><span class="block text-body-s text-on-surface-variant">Khi có đơn, bạn tạo vận đơn trên app GHTK rồi nhập mã vận đơn vào ShopNexus</span></span>
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
      <div class="flex items-center gap-2">
        <button type="button" class="state h-12 rounded-full px-5 text-label-l text-primary">Lưu nháp</button>
        {a("cancel-sell", "state flex h-12 items-center rounded-full border border-outline-variant px-5 text-label-l text-on-surface-variant", "Hủy")}
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
    steps = [
        ("art_search", "Tìm món gần bạn", "Gõ cả câu như đang nhắn cho bạn, hoặc chụp một tấm ảnh. Tin gần bạn lên trước, kèm khoảng cách và giá tham khảo.", [], False),
        ("art_deal", "Nhắn tin, trả giá, chốt", "Hỏi người bán ngay trong chat và đưa giá. Hai bên đồng ý là chốt, giá đó được ghi vào đơn.", [], True),
        ("art_orders", "Chọn giao COD", "Bạn chọn giao COD với một địa chỉ trong sổ địa chỉ của mình.", ["cancel"], False),
        ("art_cod_ready", "Người bán gửi hàng", "Người bán tạo vận đơn trên app của hãng bằng tài khoản đứng tên mình (GHTK, GHN, SPX, J&T, Viettel Post…), rồi nhập hãng, mã vận đơn và phí ship vào ShopNexus. Bạn thấy phí ship lúc đó.", [], False),
        ("door-check", "Xem hàng tại cửa", "Shipper tới, bạn mở hàng và so với Tin ghi trên tin đăng.", ["pay_shipper", "refuse", "after_pay"], False),
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
          ("query-stats-rounded", "Đưa giá tham khảo", "So giá một tin với các tin cùng đời trong 30 ngày."),
          ("chat-outline-rounded", "Ghi nhận sự cố trong chat", "Bạn mở ghi nhận kèm ảnh; người bán tự hoàn hoặc từ chối, và việc từ chối hiện trên hồ sơ của họ."),
          ("leaderboard-outline-rounded", "Tính uy tín bằng số liệu", "Tỉ lệ từ chối nhận, ghi nhận bị từ chối, trong 90 ngày.")]
    dont = [("account-balance-outline-rounded", MONEY["no_hold"]),
            ("gavel-rounded", "Không phân xử ai đúng ai sai trong từng vụ."),
            ("local-shipping-outline-rounded", "Không theo dõi bưu kiện và không thu phí ship."),
            ("support-agent-outline-rounded", "Người thật chỉ xử lý ba việc: hàng cấm và hàng giả bị báo cáo, lừa đảo có dấu hiệu tổ chức, yêu cầu hợp lệ từ cơ quan.")]
    do_html = "".join(f'<li class="flex gap-4"><span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-secondary-container text-on-secondary-container">{icon(ic, 22)}</span>'
                      f'<div><p class="text-title-m text-on-surface">{t}</p><p class="mt-0.5 text-body-m text-on-surface-variant">{d}</p></div></li>' for ic, t, d in do)
    dont_html = "".join(f'<li class="flex gap-4"><span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-inverse-on-surface/10 text-inverse-on-surface">{icon(ic, 22)}</span>'
                        f'<p class="pt-2.5 text-body-l text-inverse-on-surface">{t}</p></li>' for ic, t in dont)
    faq = [("Tôi có phải trả tiền trước không?", MONEY["pay_shipper"] + " " + MONEY["no_hold"], True),
           ("Mở ra thấy không đúng mô tả thì sao?", MONEY["refuse"] + " Hàng quay về người bán.", False),
           ("Đã trả tiền rồi mới thấy lỗi?", MONEY["after_pay"] + " Người bán chọn tự hoàn hoặc từ chối; từ chối thì vụ đó hiện trên hồ sơ của họ.", False),
           ("Tôi hủy đơn được không?", MONEY["cancel"], False),
           ("Phí ship ai trả, bao nhiêu?", MONEY["cod_buyer"] + " Bạn thấy phí ship khi người bán nhập vận đơn.", False),
           ("Món đắt tiền thì nên làm gì?", MONEY["meet_hint"] + " COD vẫn chọn được.", False)]
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
        <p class="mt-5 max-w-[560px] text-body-l text-on-primary-container">{MONEY["cod_buyer"]} {MONEY["no_hold"]}</p>
        <div class="mt-8 flex gap-3">
          {a("start-search", "state flex h-12 items-center gap-2 rounded-full bg-surface-container-lowest px-6 text-label-l text-primary", icon("search-rounded", 20) + "Bắt đầu tìm")}
          {a("jump-faq", "state flex h-12 items-center rounded-full border border-on-primary-container/40 px-6 text-label-l text-white", "Câu hỏi thường gặp")}
        </div>
      </div>
      <img src="{ART["art_received"]}" alt="" class="absolute -bottom-6 right-8 w-[420px]">
    </section>

    <section class="mt-20">
      <h2 class="text-display-s">Năm bước, từ lúc tìm tới lúc nhận</h2>
      <ol class="mt-8 flex flex-col gap-4">{step_html}</ol>
    </section>

    <section class="mt-16 grid grid-cols-[280px_1fr] items-center gap-10 rounded-xl bg-secondary-container px-10 py-8">
      <img src="{ART["map-guide"]}" alt="" class="w-full">
      <div>
        <p class="text-label-l uppercase tracking-[0.12em] text-on-secondary-container">Món giá cao</p>
        <h2 class="mt-2 text-display-s text-on-surface">{MONEY["meet_hint"]}</h2>
        <p class="mt-4 max-w-[640px] text-body-l text-on-secondary-container">Hai bên tự hẹn chỗ và giờ trong tin nhắn. Khi tin nhắn nhắc một địa điểm, ShopNexus gắn nút mở bản đồ. COD vẫn chọn được.</p>
      </div>
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
        <img src="{ART["art_reviews"]}" alt="" class="mt-6 w-[220px]">
      </div>
      <div class="flex flex-col gap-3">{faq_html}</div>
    </section>

    <section class="relative mt-20 grid h-[300px] grid-cols-[1fr_380px] overflow-hidden rounded-xl bg-surface-container">
      <div class="flex flex-col justify-center pl-14">
        <h2 class="text-display-s">Có đồ cũ muốn bán?</h2>
        <p class="mt-3 max-w-[520px] text-body-l text-on-surface-variant">Chụp vài tấm ảnh, AI điền giúp tên, tình trạng và giá.</p>
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
    for name, fn in [("sell", sell), ("how", how)]:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(fn())
        print("wrote", name)
