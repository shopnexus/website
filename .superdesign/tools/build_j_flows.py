"""Cách mua, Đăng tin, Giao COD and Hỗ trợ in J ("Kính mờ"), on j_kit.

    python3 tools/build_j_flows.py        (run from .superdesign/)

Writes mockups/how.html, sell.html, cod.html and support.html, replacing what
build_sell_howto.py, build_chat_cod.py (cod) and build_support.py drew, and the
footer's info pages: help.html, plans.html, listing-rules.html, terms.html. The
content and deal facts are theirs; MONEY sentences stay word for word.
"""
import json
import os
from html import escape

from build import OUT, a
from build_c import ART
from build_chat_cod import DEALS, SELLER, TITLE as COD_TITLE
from build_sell_howto import CLAIMS, DESCRIPTION, GUIDE, PHOTO as SELL_PHOTO, PHOTOS, PRICE, SIMILAR, SOLD_BINS, TITLE as SELL_TITLE
from build_pages import tr
from build_support import CARRIER, FEEDBACK, KINDS, NO_ARBITRATION, ORDER, REPORT
from common import MONEY, crop, icon, img
from j_kit import H2, PANEL, btn_cls, card, crumbs, field, footer, header, link_rows, money_line, page, price, seg, stepper, summary_card

ART = {**ART, **json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "art_sh.json")))}

H1 = "text-[44px] font-semibold leading-[48px] tighter ink"

EXTRA_CSS = """<style>
  details.faq > summary { list-style: none; cursor: pointer; }
  details.faq > summary::-webkit-details-marker { display: none; }
  details.faq[open] .chev { transform: rotate(180deg); }
  .chev { transition: transform 420ms var(--spatial); }
  .badge-grad { background: linear-gradient(140deg, #066A61, #5CC2B4); color: #fff; }
</style>"""


# ------------------------------------------------------- shared in this file --
# ---------------------------------------------------------------- Cách mua --
FAQ = [("Tôi có phải trả tiền trước không?", MONEY["pay_shipper"], True),
       ("Mở ra thấy không đúng mô tả thì sao?", MONEY["refuse"] + " Hàng quay về người bán.", True),
       ("Hãng báo đã giao mà tôi chưa nhận?", "Trong đơn, bấm “Báo chưa nhận hàng”. Yêu cầu tới Hỗ trợ và ShopNexus trả lời trong chat.", False),
       ("Tôi hủy đơn được không?", MONEY["cancel"], False),
       ("Phí ship ai trả, bao nhiêu?", MONEY["cod_buyer"] + " Bạn thấy phí ship trong đơn khi người bán tạo vận đơn.", False)]


def how():
    deal = DEALS[0]
    hero_card = f"""<div class="{PANEL} soft p-5">
  <div class="flex items-center gap-3">
    <img src="{deal["chip"].replace("w=72&h=72", "w=128&h=128")}" alt="" class="h-14 w-14 rounded-[14px] object-cover">
    <div class="min-w-0 flex-1"><p class="truncate text-title-s ink">{escape(deal["title"])}</p><p class="text-body-s text-on-surface-variant">{SELLER["name"]} · GHTK · S1.A1.20931</p></div>
    <span class="rounded-full bg-secondary-container px-2.5 py-1 text-label-m text-on-secondary-container">Đang giao</span>
  </div>
  <div class="mt-4">{stepper(2, compact=True)}</div>
  <div class="mt-4 grid grid-cols-2 gap-2">
    <div class="rounded-[16px] bg-surface-container-low px-4 py-3"><p class="text-body-s text-on-surface-variant">Tiền hàng</p><p class="mt-0.5">{price("5.100.000 ₫")}</p></div>
    <div class="rounded-[16px] bg-surface-container-low px-4 py-3"><p class="text-body-s text-on-surface-variant">Phí ship</p><p class="mt-0.5">{price("32.000 ₫")}</p></div>
  </div>
  <div class="mt-3 flex items-center gap-3 rounded-[16px] bg-[#FFF4EF] px-4 py-3">
    <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-tertiary">{icon("payments-outline-rounded", 20)}</span>
    <p class="text-body-m text-on-tertiary-fixed-variant">{MONEY["pay_shipper"]}</p>
  </div>
  <div class="mt-3 grid grid-cols-2 gap-2">
    <button type="button" class="state h-10 rounded-full bg-[var(--ink)] text-label-l text-white">Đã nhận hàng</button>
    <button type="button" class="state h-10 rounded-full border line text-label-l ink">Báo chưa nhận hàng</button>
  </div>
</div>"""

    steps = [
        ("art_deal", "Chốt giá", "Tìm món gần bạn bằng một câu hoặc một tấm ảnh, rồi nhắn người bán và trả giá. Hai bên đồng ý là chốt, giá đó vào đơn.", [], "deal"),
        ("art_orders", "Tạo đơn", "Bạn chọn giao COD với một địa chỉ trong sổ. Người bán tạo vận đơn bằng tài khoản GHTK hoặc GHN đứng tên mình, hoặc tự gửi rồi nhập mã vận đơn.", ["cancel"], None),
        ("door-check", "Nhận hàng", "Shipper tới, bạn mở hàng và so với Tin ghi trên tin đăng, rồi bấm “Đã nhận hàng”. Hãng báo đã giao mà bạn chưa nhận, bấm “Báo chưa nhận hàng”.", ["pay_shipper", "refuse"], None),
        ("art_reviews", "Đánh giá", "Chấm sao cho người bán. Đánh giá tính vào điểm uy tín của họ.", [], "stars"),
    ]
    extra = {
        "deal": f'<div class="flex items-center justify-between rounded-[14px] bg-[#FFF4EF] px-3 py-2"><span class="text-body-s text-on-surface-variant line-through">5.200.000 ₫</span>{icon("arrow-forward-rounded", 15, "text-tertiary")}<span class="num text-title-s text-tertiary">5.100.000 ₫ · Đã chốt</span></div>',
        "stars": f'<div class="flex items-center justify-between rounded-[14px] bg-surface-container-low px-3 py-2"><span class="flex text-[#E0A23B]">{icon("star-rounded", 16) * 5}</span><span class="num text-title-s ink">4,9 <span class="text-body-s font-normal text-on-surface-variant">· 126 đánh giá</span></span></div>',
    }
    step_html = "".join(f"""<li class="card flex flex-col {PANEL} p-5">
  <div class="flex items-start justify-between">
    <span class="badge-grad num grid h-9 w-9 place-items-center rounded-full text-title-s">{i + 1}</span>
    <img src="{ART[art]}" alt="" class="-mr-1 -mt-1 h-[92px] w-[92px] object-contain">
  </div>
  <h3 class="mt-1 text-[20px] font-semibold leading-7 tight ink">{t}</h3>
  <p class="mt-1.5 text-body-m text-on-surface-variant">{d}</p>
  <div class="mt-auto flex flex-col gap-2 pt-3">{"".join(f'<p class="flex gap-2 rounded-[14px] bg-surface-container-low px-3 py-2 text-body-s ink">{icon("check-circle-outline-rounded", 16, "mt-px shrink-0 text-primary")}<span>{MONEY[k]}</span></p>' for k in keys)}{extra.get(x, "")}</div>
</li>""" for i, (art, t, d, keys, x) in enumerate(steps))

    do = [("search-rounded", "Kết nối bạn với người bán quanh nhà", "Tìm bằng cả câu hoặc bằng ảnh, AI điền tin giúp người bán."),
          ("query-stats-rounded", "Đưa giá tham khảo", "So giá một tin với các tin giống nó đã bán và đang bán."),
          ("local-shipping-outline-rounded", "Tạo vận đơn qua hãng của người bán", "GHTK hoặc GHN báo đơn tới đâu, bạn xem ngay trong đơn."),
          ("support-agent-outline-rounded", "Nhận yêu cầu trong Hỗ trợ", "Chưa nhận được hàng hay cần hỏi gì, bạn gửi yêu cầu và ShopNexus trả lời trong chat.")]
    dont = [("gavel-rounded", "Không phân xử giữa người mua và người bán."),
            ("payments-outline-rounded", "Không thu phí ship: bạn trả cho shipper, hãng chuyển tiền hàng cho người bán."),
            ("shield-outline-rounded", "Người thật chỉ xử lý ba việc: hàng cấm và hàng giả bị báo cáo, lừa đảo có dấu hiệu tổ chức, yêu cầu hợp lệ từ cơ quan.")]
    do_html = "".join(f'<li class="flex gap-3"><span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-secondary-container text-on-secondary-container">{icon(ic, 20)}</span>'
                      f'<div><p class="text-title-s ink">{t}</p><p class="text-body-m text-on-surface-variant">{d}</p></div></li>' for ic, t, d in do)
    dont_html = "".join(f'<li class="flex gap-3"><span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/10 text-[#85D5C9]">{icon(ic, 20)}</span>'
                        f'<p class="pt-2 text-body-m text-white/85">{t}</p></li>' for ic, t in dont)

    faq_html = "".join(f"""<details class="faq {PANEL} px-5 py-4"{" open" if op else ""}>
  <summary class="flex items-center justify-between gap-4 text-title-s ink">{q}{icon("keyboard-arrow-down-rounded", 22, "chev shrink-0 text-on-surface-variant")}</summary>
  <p class="mt-2 text-body-m text-on-surface-variant">{ans}</p>
</details>""" for q, ans, op in FAQ)

    body = f"""{header(active=2)}{EXTRA_CSS}
<main class="mx-auto max-w-[1360px] px-8">
  <section class="grid grid-cols-[1fr_520px] items-center gap-12 pt-10">
    <div>
      <span class="glass glass-edge inline-flex items-center gap-2 rounded-full px-3 py-1 text-label-m ink"><span class="h-1.5 w-1.5 rounded-full bg-primary"></span>Cách mua trên ShopNexus</span>
      <h1 class="mt-4 text-[60px] font-semibold leading-[64px] tighter ink">Xem hàng tận tay,<br>rồi mới trả tiền.</h1>
      <p class="mt-4 max-w-[520px] text-body-l text-on-surface-variant">{MONEY["cod_buyer"]}</p>
      <div class="mt-6 flex gap-2">
        {a("start-search", btn_cls("ink", "lg"), icon("search-rounded", 18) + "Bắt đầu tìm")}
        {a("jump-faq", btn_cls("line", "lg"), "Câu hỏi thường gặp", "#faq")}
      </div>
      <div class="mt-8 grid max-w-[560px] grid-cols-2 gap-2">
        <div class="glass glass-edge rounded-[18px] px-4 py-3"><p class="num text-[24px] font-semibold leading-8 tight ink">4 bước</p><p class="text-body-s text-on-surface-variant">chốt giá tới đánh giá</p></div>
        <div class="glass glass-edge rounded-[18px] px-4 py-3"><p class="num text-[24px] font-semibold leading-8 tight ink">GHTK · GHN</p><p class="text-body-s text-on-surface-variant">hãng của người bán</p></div>
      </div>
    </div>
    {hero_card}
  </section>

  <section class="mt-10">
    <div class="flex items-baseline justify-between"><h2 class="{H2}">Bốn bước, từ lúc chốt giá tới lúc đánh giá</h2><span class="text-body-s text-on-surface-variant">Mỗi đơn hiện đủ bốn bước</span></div>
    <ol class="mt-4 grid grid-cols-4 gap-4">{step_html}</ol>
  </section>

  <section class="mt-10 grid grid-cols-2 gap-4">
    <div class="{PANEL} p-6"><h2 class="text-[20px] font-semibold leading-7 tight ink">ShopNexus làm</h2><ul class="mt-4 grid grid-cols-1 gap-4">{do_html}</ul></div>
    <div class="rounded-[24px] bg-[var(--ink)] p-6"><h2 class="text-[20px] font-semibold leading-7 tight text-white">ShopNexus không làm</h2><ul class="mt-4 grid grid-cols-1 gap-4">{dont_html}</ul></div>
  </section>

  <section id="faq" class="mt-10 grid grid-cols-[340px_1fr] gap-6">
    <div class="flex flex-col gap-4">
      <h2 class="{H2}">Câu hỏi thường gặp</h2>
      <p class="text-body-m text-on-surface-variant">Chưa thấy câu bạn cần? Gửi yêu cầu trong Hỗ trợ, ShopNexus trả lời trong chat.</p>
      <div class="relative mt-auto overflow-hidden rounded-[24px] bg-gradient-to-br from-[#066A61] to-[#0E8A7D] p-5 text-white">
        <p class="text-[20px] font-semibold leading-7 tight">Có đồ cũ muốn bán?</p>
        <p class="mt-1 max-w-[200px] text-body-m text-white/80">Tải vài tấm ảnh lên, AI điền giúp tên, tình trạng và giá.</p>
        {a("go-sell", "state mt-4 inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-label-l text-primary", icon("add-rounded", 18) + "Đăng tin")}
        <img src="{ART["art_ai_camera"]}" alt="" class="absolute -bottom-3 -right-3 w-[130px]">
      </div>
    </div>
    <div class="grid grid-cols-2 content-start gap-3">{faq_html}</div>
  </section>
</main>
{footer()}"""
    return page("Cách mua · ShopNexus", body)


# ---------------------------------------------------------------- Đăng tin --
def sell():
    def panel(num, title, inner, aside=""):
        return f"""<section class="{PANEL} p-6">
  <div class="flex items-center gap-3"><span class="badge-grad num grid h-8 w-8 place-items-center rounded-full text-title-s">{num}</span>
    <h2 class="flex-1 text-[20px] font-semibold leading-7 tight ink">{title}</h2>{aside}</div>
  {inner}
</section>"""

    cover, *rest = PHOTOS
    tiles = "".join(f"""<button type="button" class="state relative overflow-hidden rounded-[16px] bg-surface-container-high" title="Đặt làm ảnh bìa">
  <img src="{src}" alt="{alt}" class="h-full w-full object-cover">
  <span class="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-black/55 text-white backdrop-blur" aria-label="Bỏ ảnh">{icon("close-rounded", 14)}</span>
</button>""" for src, alt in rest)
    photos = panel("1", "Ảnh", f"""
  <div class="mt-4 grid h-[260px] grid-cols-[1.6fr_1fr_1fr] grid-rows-2 gap-2.5">
    <div class="relative row-span-2 overflow-hidden rounded-[18px] bg-surface-container-high">
      <img src="{cover[0]}" alt="Ảnh bìa: {cover[1]}" class="h-full w-full object-cover">
      <span class="absolute left-3 top-3 rounded-full bg-white/85 px-2.5 py-0.5 text-label-m ink backdrop-blur">Ảnh bìa</span>
    </div>
    {tiles}
    <label class="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-[16px] border-[1.5px] border-dashed border-primary/40 bg-secondary-container/40 text-center">
      {icon("add-photo-alternate-outline-rounded", 26, "text-primary")}<span class="text-label-l ink">Thêm ảnh</span><span class="text-body-s text-on-surface-variant">Kéo thả vào đây</span>
    </label>
  </div>
  <p class="mt-3 flex items-center justify-between text-body-s text-on-surface-variant"><span class="flex items-center gap-1.5">{icon("upload-rounded", 15)}Ảnh tải lên</span><span>Bấm một ảnh để đặt làm ảnh bìa</span></p>""",
                   '<span class="num rounded-full bg-surface-container-low px-2.5 py-0.5 text-label-m text-on-surface-variant">4/10</span>')

    claims = "".join(f'<span class="flex h-8 items-center gap-1 rounded-full bg-secondary-container/70 pl-3 pr-1.5 text-label-l text-on-secondary-container">{c}'
                     f'<span class="grid h-5 w-5 place-items-center rounded-full">{icon("close-rounded", 14)}</span></span>' for c in CLAIMS)
    dd = icon("keyboard-arrow-down-rounded", 20, "text-on-surface-variant")
    item = panel("2", "Món đồ", f"""
  <div class="mt-4 flex flex-col gap-4">
    {field("Tiêu đề", SELL_TITLE, ai=True, trail=f'<span class="num text-body-s text-on-surface-variant">{len(SELL_TITLE)}/80</span>')}
    <div class="grid grid-cols-4 gap-3">
      {field("Danh mục", "Điện thoại › iPhone", ai=True, trail=dd)}{field("Màu", "Trắng", ai=True)}{field("Dung lượng", "64 GB", trail=dd)}{field("Pin", "81", trail='<span class="text-on-surface-variant">%</span>')}
    </div>
    <div class="grid grid-cols-[1fr_1.4fr] gap-4">
      <div><p class="mb-1.5 flex items-center gap-1 text-label-l text-on-surface-variant">Tình trạng{icon("auto-awesome-rounded", 14, "text-primary")}</p>
        {seg(["Mới", "Như mới", "Đã dùng"], 2, "w-full bg-surface-container-low", "flex-1 text-label-l")}
        <p class="mt-1.5 text-body-s text-on-surface-variant">Có vết thấy rõ hoặc lỗi nhỏ</p></div>
      <div><p class="mb-1.5 text-label-l text-on-surface-variant">Tin ghi <span class="font-normal">· người mua kiểm những điều này khi nhận hàng</span></p>
        <div class="flex flex-wrap gap-1.5">{claims}<button type="button" class="state flex h-8 items-center gap-1 rounded-full border border-dashed border-outline-variant px-3 text-label-l text-on-surface-variant">{icon("add-rounded", 16)}Thêm điều bạn ghi</button></div></div>
    </div>
    {field("Mô tả", DESCRIPTION, ai=True, tall=True)}
  </div>""")

    lo, hi = GUIDE["axis"]
    at = lambda v: round((v - lo) / (hi - lo) * 100, 2)
    peak = max(SOLD_BINS)
    bars = "".join(f'<span class="flex-1 rounded-[8px] {"bg-primary" if 1 <= i <= 4 else "bg-outline-variant/60"}" style="height:{max(n, .4) / peak * 100:.0f}%"></span>' for i, n in enumerate(SOLD_BINS))
    picks = "".join(f"""<button type="button" class="state flex items-center gap-3 rounded-[18px] px-4 py-3 text-left {"bg-white ring-2 ring-primary" if sel else "bg-surface-container-low"}">
  <span class="grid h-9 w-9 place-items-center rounded-full {"badge-grad" if sel else "bg-white text-on-surface-variant"}">{icon(ic, 18)}</span>
  <span class="min-w-0 flex-1"><span class="block whitespace-nowrap text-body-s text-on-surface-variant">{t} · {d}</span>{price(p)}</span>
</button>""" for ic, t, p, d, sel in [("bolt-outline-rounded", "Bán nhanh", "4.500.000 ₫", "~2 ngày", False), ("balance-rounded", "Giá thị trường", "4.800.000 ₫", "~1 tuần", True)])
    similar = "".join(f"""<button type="button" class="state min-w-0 rounded-[16px] text-left" title="So với tin của bạn">
  <img src="{ph}" alt="" class="aspect-square w-full rounded-[16px] object-cover">
  <span class="mt-1.5 block">{price(p + " ₫", "text-[15px] leading-5")}</span>
  <span class="block truncate text-body-s text-on-surface-variant">{cond} · {w}</span>
</button>""" for ph, p, cond, w, _ in SIMILAR)
    price_panel = panel("3", "Giá", f"""
  <div class="mt-4 grid grid-cols-[1.25fr_1fr] gap-6">
    <div>
      <button type="button" class="state -mx-2 flex items-center gap-1 rounded-full px-2 py-1 text-title-s text-tertiary">{icon("auto-awesome-rounded", 16)}Giá tham khảo {tr(GUIDE["low"])} – {tr(GUIDE["high"])} tr ₫{icon("chevron-right-rounded", 18)}</button>
      <div class="relative mt-3">
        <div class="flex h-[84px] items-end gap-1.5" role="img" aria-label="Số tin đã bán theo giá">{bars}</div>
        <span class="absolute -top-1 bottom-0 w-0.5 -translate-x-1/2 rounded-full bg-tertiary" style="left:{at(PRICE)}%"></span>
      </div>
      <div class="relative mt-2 h-1.5 rounded-full bg-surface-container-high"><span class="absolute inset-y-0 rounded-full bg-tertiary-fixed" style="left:{at(GUIDE["low"])}%;right:{100 - at(GUIDE["high"])}%"></span>
        <span class="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-tertiary soft" style="left:{at(PRICE)}%"></span></div>
      <div class="mt-1.5 flex justify-between text-body-s text-on-surface-variant"><span>{tr(lo)} tr</span><span>giữa {tr(GUIDE["median"])} tr</span><span>{tr(hi)} tr</span></div>
      <p class="mt-2 text-body-s text-on-surface-variant">Từ {GUIDE["sold"]} tin đã bán và {GUIDE["live"]} tin đang bán giống món này</p>
      <div class="mt-4 grid grid-cols-2 gap-2.5">{picks}</div>
    </div>
    <div class="flex flex-col justify-center gap-2.5">
      {field("Giá bán", '<span class="num text-[22px] font-semibold tight">4.800.000</span>', trail='<span class="text-on-surface-variant">₫</span>', ring=True)}
      <p class="-mt-1 flex items-center gap-1 text-label-m text-tertiary">{icon("auto-awesome-rounded", 14)}Rẻ hơn 8/12 tin đang bán · bán trong ~1 tuần</p>
      <label class="flex h-11 items-center gap-3 rounded-full bg-surface-container-low pl-4 pr-1.5">{icon("sell-outline-rounded", 18, "text-on-surface-variant")}<span class="flex-1 text-label-l ink">Cho phép trả giá</span>
        <span class="relative h-8 w-[52px] rounded-full bg-primary"><span class="absolute right-1 top-1 h-6 w-6 rounded-full bg-white"></span></span></label>
    </div>
  </div>
  <div class="mt-5 grid grid-cols-[repeat(3,1fr)_1.3fr] gap-3 border-t line pt-5">
    {similar}
    <div class="flex flex-col justify-between gap-3 rounded-[18px] bg-gradient-to-br from-[#E3F2EF] to-[#FFF1EB] p-4">
      <div><p class="text-title-s ink">Tin giống bạn</p><p class="text-body-s text-on-surface-variant">Cùng danh mục và tình trạng</p>
        <div class="mt-2">{seg(["Đang bán · 3", "Đã bán · 3"], 0, "bg-white/60", "text-label-m !h-7 !px-2.5")}</div></div>
      <dl class="grid grid-cols-2 gap-2">
        <div class="rounded-[14px] bg-white/70 px-3 py-2"><dt class="text-body-s text-on-surface-variant">Mức giữa</dt><dd class="num text-title-m font-semibold ink">4,9 tr ₫</dd></div>
        <div class="rounded-[14px] bg-white/70 px-3 py-2"><dt class="text-body-s text-on-surface-variant">Vừa bán</dt><dd class="num text-title-m font-semibold ink">4,5 tr ₫</dd></div>
      </dl>
      <p class="flex items-start gap-2 text-body-s ink">{icon("notifications-active-outline-rounded", 16, "mt-px shrink-0 text-primary")}<span><b class="font-semibold">{GUIDE["waiting"]} người</b> đang theo dõi một tìm kiếm khớp với tin này ở giá bạn đặt</span></p>
    </div>
  </div>""")

    def deal_tile(ic, title, sub, action=None, on=False):
        act = a(f"chg-{ic[:6]}", "state rounded-full px-3 py-1 text-label-l text-primary", action) if action else ""
        return (f'<div class="flex items-center gap-3 rounded-[18px] bg-surface-container-low p-3">'
                f'<span class="grid h-10 w-10 shrink-0 place-items-center rounded-full {"badge-grad" if on else "bg-white text-on-surface-variant"}">{icon(ic, 20)}</span>'
                f'<span class="min-w-0 flex-1"><span class="block text-title-s ink">{title}</span><span class="block text-body-s text-on-surface-variant">{sub}</span></span>{act}</div>')
    deal = panel("4", "Giao dịch", f"""
  <div class="mt-4 grid grid-cols-3 gap-2.5">
    {deal_tile("local-shipping-outline-rounded", "COD, xem hàng trước", "Người mua xem hàng rồi mới trả", on=True)}
    {deal_tile("check-rounded", "GHTK của bạn", "Có đơn thì tạo vận đơn ngay", "Đổi")}
    {deal_tile("location-on-outline-rounded", "Bình Thạnh", "Chỉ hiện quận", "Đổi")}
  </div>
  <div class="mt-4 flex flex-col gap-2">{money_line("cod_seller", "account-balance-outline-rounded")}{money_line("return_leg", "undo-rounded")}</div>""")

    ready = [("4 ảnh, có ảnh bìa", True), ("Tiêu đề và tình trạng", True), ("Giá 4.800.000 ₫", True), ("Giao COD bằng GHTK", True)]
    ready_html = "".join(f'<li class="flex items-center gap-2.5 text-body-m ink">{icon("check-circle-rounded", 18, "text-primary")}{t}</li>' for t, _ in ready)
    preview = card((SELL_PHOTO, "4.800.000 ₫", SELL_TITLE, "Đã dùng", "1,2 km", "Bình Thạnh", "4,9", ["64 GB", "Pin 81%"], None), 0, ratio="4 / 4.4")

    body = f"""{header(active=None)}{EXTRA_CSS}
<main class="mx-auto max-w-[1360px] px-8">
  <div class="flex items-end justify-between pt-8">
    <div><p class="text-label-l text-primary">Bán đồ</p><h1 class="{H1}">Đăng tin</h1></div>
    <div class="flex items-center gap-3">
      <span class="flex items-center gap-1 text-body-s text-on-surface-variant">{icon("draft-outline-rounded", 15)}Nháp giữ 30 ngày từ lần sửa cuối, tối đa 20 nháp</span>
      <button type="button" class="{btn_cls("line", "lg")}">Lưu nháp</button>
      {a("cancel-sell", "state flex h-11 items-center rounded-full px-4 text-label-l text-on-surface-variant", "Hủy")}
    </div>
  </div>
  <div class="mt-6 grid grid-cols-[1fr_340px] gap-6">
    <div class="flex flex-col gap-4">{photos}{item}{price_panel}{deal}</div>
    <aside class="self-start">
      <div class="sticky top-[84px] flex flex-col gap-3">
        <p class="px-1 text-label-l text-on-surface-variant">Người mua sẽ thấy</p>
        {preview}
        <div class="{PANEL} p-5">
          <div class="flex items-center justify-between"><p class="text-title-s ink">Sẵn sàng đăng</p><span class="num rounded-full bg-secondary-container px-2 py-0.5 text-label-m text-on-secondary-container">4/4</span></div>
          <ul class="mt-3 flex flex-col gap-2">{ready_html}</ul>
          <button type="button" class="{btn_cls("ink", "lg")} mt-4 w-full !h-12">{icon("send-rounded", 18)}Đăng tin</button>
          {a("preview-page", btn_cls("line", "lg") + " mt-2 w-full", icon("visibility-outline-rounded", 18) + "Xem trước trang tin")}
        </div>
      </div>
    </aside>
  </div>
</main>
{footer()}"""
    return page("Đăng tin · ShopNexus", body)


# ---------------------------------------------------------------- Giao COD --
def cod():
    deal = DEALS[0]
    open_cod, cap = 2, 3
    addresses = [("Chung cư Vinhomes Grand Park, tòa S5.02, 512 Nguyễn Xiển, Phường Long Bình, Hồ Chí Minh", "Khánh Linh · 09•• ••• 812", "Nhà", True),
                 ("88 Nguyễn Gia Trí, Phường 25, Bình Thạnh, Hồ Chí Minh", "Khánh Linh · 09•• ••• 812", "Công ty", False)]
    addr_html = "".join(f"""<label class="flex cursor-pointer items-center gap-3 rounded-[18px] p-3 {"bg-white ring-2 ring-primary" if on else "bg-surface-container-low"}">
  <span class="grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 {"border-primary" if on else "border-outline-variant"}">{'<span class="h-2.5 w-2.5 rounded-full bg-primary"></span>' if on else ""}</span>
  <span class="min-w-0 flex-1"><span class="flex items-center gap-2"><span class="rounded-full bg-surface-container-low px-2 text-label-s text-on-surface-variant">{tag}</span><span class="text-body-s text-on-surface-variant">{who}</span></span>
    <span class="mt-0.5 line-clamp-1 block text-body-m ink">{addr}</span></span>
</label>""" for addr, who, tag, on in addresses)
    checks = ["Pin 88%", "Face ID hoạt động", "Chưa sửa chữa", "Kèm hộp và cáp"]
    check_html = "".join(f'<li class="flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-1.5 text-label-l ink">{icon("check-rounded", 16, "text-primary")}{c}</li>' for c in checks)

    def row(ic, label, value, muted=False):
        return (f'<div class="flex items-center gap-3 py-2.5">{icon(ic, 20, "text-on-surface-variant")}<span class="flex-1 text-body-l ink">{label}</span>'
                + (f'<span class="text-body-l text-on-surface-variant">{value}</span>' if muted else price(value)) + "</div>")

    body = f"""{header(active=None)}{EXTRA_CSS}
<main class="mx-auto max-w-[1360px] px-8">
  <div class="pt-6">{a("crumb-chat", "inline-flex items-center gap-1 rounded-full px-1 text-body-s text-on-surface-variant hover:text-on-surface", icon("arrow-back-rounded", 16) + "Quay lại chat với " + SELLER["name"], "messages.html")}</div>
  <div class="mt-2 flex items-end justify-between">
    <h1 class="{H1}">Giao COD</h1>
    {stepper(1)}
  </div>
  <div class="mt-6 grid grid-cols-[1fr_400px] gap-6">
    <div class="flex flex-col gap-4">
      <section class="{PANEL} flex items-center gap-4 p-3 pr-6">
        <img src="{deal["photo"]}" alt="" class="h-24 w-24 rounded-[18px] object-cover">
        <div class="min-w-0 flex-1"><p class="truncate text-title-m ink">{escape(COD_TITLE)}</p>
          <p class="mt-1 flex items-center gap-2 text-body-m text-on-surface-variant"><img src="{img(SELLER["photo"], 48, 48)}" alt="" class="h-6 w-6 rounded-full object-cover">{SELLER["name"]} · {deal["meta"]}</p></div>
        <div class="text-right">{price(deal["agreed"], "text-[26px] leading-8")}
          <p class="mt-0.5 flex items-center justify-end gap-1 text-label-m text-tertiary">{icon("handshake-outline-rounded", 15)}Đã chốt · niêm yết <s class="text-on-surface-variant">{deal["listed"]}</s></p></div>
      </section>

      <section class="{PANEL} p-5">
        <div class="flex items-center justify-between"><h2 class="text-title-m ink">Giao đến</h2>{a("address-book", "text-label-l text-primary hover:underline", "Sổ địa chỉ", "account.html#addresses")}</div>
        <div class="mt-3 grid grid-cols-2 gap-2.5">{addr_html}</div>
      </section>

      <section class="{PANEL} grid grid-cols-[1fr_1fr] gap-6 p-5">
        <div>
          <h2 class="text-title-m ink">Khi shipper tới</h2>
          <p class="mt-1 text-body-m text-on-surface-variant">Mở hàng, so với Tin ghi của {SELLER["name"]}:</p>
          <ul class="mt-3 flex flex-wrap gap-1.5">{check_html}</ul>
        </div>
        <div class="flex flex-col gap-2 border-l line pl-6">{money_line("cod_buyer", "visibility-outline-rounded")}{money_line("refuse", "undo-rounded")}{money_line("cancel", "close-rounded")}</div>
      </section>
    </div>

    <aside class="self-start">
      <div class="sticky top-[84px] {PANEL} soft p-5">
        <h2 class="text-title-m ink">Tiền</h2>
        <div class="mt-1 divide-y divide-black/5">
          {row("handshake-outline-rounded", "Tiền hàng", "5.100.000 ₫")}
          {row("local-shipping-outline-rounded", "Phí ship", "Chưa có", muted=True)}
        </div>
        <p class="text-body-s text-on-surface-variant">Có phí ship khi người bán tạo đơn.</p>
        <div class="mt-4 rounded-[18px] bg-[#FFF4EF] p-4">
          <p class="text-body-s text-on-tertiary-fixed-variant">Trả cho shipper khi nhận</p>
          <p class="mt-0.5 flex items-baseline gap-1.5">{price("5.100.000 ₫", "text-[30px] leading-9")}<span class="text-body-m text-on-surface-variant">+ phí ship</span></p>
        </div>
        {a("cod-right", "state mt-3 flex items-center gap-3 rounded-[18px] bg-surface-container-low px-4 py-3", f'''
          {icon("verified-outline-rounded", 20, "text-on-surface-variant")}
          <span class="min-w-0 flex-1"><span class="block text-body-m ink">Đơn COD đang mở: {open_cod}/{cap}</span>
            <span class="mt-1.5 block h-1.5 rounded-full bg-white"><span class="block h-full rounded-full bg-gradient-to-r from-[#066A61] to-[#5CC2B4]" style="width:{open_cod / cap * 100:.0f}%"></span></span></span>
          {icon("chevron-right-rounded", 20, "text-on-surface-variant")}''', "account.html#rep")}
        <button type="button" class="{btn_cls("ink", "lg")} mt-4 w-full !h-12">{icon("send-rounded", 18)}Gửi yêu cầu COD</button>
      </div>
    </aside>
  </div>
</main>
{footer()}"""
    return page("Giao COD · ShopNexus", body)


# ------------------------------------------------------------------ Hỗ trợ --
def support():
    def official(size=36):
        return (f'<span class="badge-grad grid shrink-0 place-items-center rounded-full" style="width:{size}px;height:{size}px">'
                f'{icon("support-agent-rounded", size * 11 // 20)}</span>')

    tickets = [("not_received", ORDER["title"], "Bạn chưa trả tiền nên không mất gì. Bạn kiểm tra giúp mình với bảo vệ toà nhà…", "09:05", True, False),
               ("carrier_request", CARRIER["name"], "Bạn: " + CARRIER["note"], "Hôm qua", False, False),
               ("other", FEEDBACK, "Cảm ơn bạn. Lỗi này đã sửa trong bản 2.4, bạn cập nhật app giúp mình nhé.", "Thứ Hai", False, True)]

    def trow(i, kind, subject, last, when, sel, done):
        ic, name = KINDS[kind]
        tone = "badge-grad" if sel else ("bg-surface-container-low text-on-surface-variant" if done else "bg-secondary-container text-on-secondary-container")
        return a(f"ticket-{i}", f"flex gap-3 rounded-[18px] p-2.5 {'bg-white soft' if sel else 'hover:bg-white/70'}", f"""
  <span class="grid h-10 w-10 shrink-0 place-items-center rounded-full {tone}">{icon(ic, 20)}</span>
  <span class="min-w-0 flex-1">
    <span class="flex items-baseline gap-2"><span class="min-w-0 flex-1 truncate text-title-s ink">{name}</span><span class="shrink-0 text-body-s text-on-surface-variant">{when}</span></span>
    <span class="block truncate text-body-s text-on-surface-variant">{escape(subject)}</span>
    <span class="block truncate text-body-m text-on-surface-variant">{escape(last)}</span>
  </span>""")
    open_rows = "".join(trow(i, *t) for i, t in enumerate(tickets) if not t[5])
    done_rows = "".join(trow(i, *t) for i, t in enumerate(tickets) if t[5])

    def theirs(lines, time):
        bubbles = "".join(f'<p class="w-fit max-w-[440px] rounded-[20px] {"rounded-tl-[6px]" if i else ""} bg-surface-container-low px-4 py-2.5 text-body-l ink">{t}</p>' for i, t in enumerate(lines))
        return f'<div class="flex items-end gap-2">{official(30)}<div class="flex flex-col gap-1">{bubbles}<p class="px-2 text-body-s text-on-surface-variant">{time}</p></div></div>'

    def mine(text, time):
        return (f'<div class="flex flex-col items-end"><p class="max-w-[440px] rounded-[20px] rounded-br-[6px] bg-[var(--ink)] px-4 py-2.5 text-body-l text-white">{text}</p>'
                f'<p class="mt-1 px-2 text-body-s text-on-surface-variant">{time} · Đã xem</p></div>')

    ic, name = KINDS["not_received"]
    ticket = f"""<div class="flex flex-col items-end">
  <article class="w-[400px] rounded-[20px] rounded-br-[6px] border line bg-white p-4 soft">
    <p class="flex items-center gap-2 text-title-s ink">{icon(ic, 18, "text-primary")}{name}</p>
    <div class="mt-3 flex items-center gap-3 rounded-[14px] bg-surface-container-low p-2">
      <img src="{ORDER["thumb"]}" alt="" class="h-11 w-11 rounded-[10px] object-cover">
      <span class="min-w-0"><span class="block truncate text-title-s ink">{escape(ORDER["title"])}</span><span class="block text-body-s text-on-surface-variant">{ORDER["carrier"]} · {ORDER["code"]}</span></span>
    </div>
    <p class="mt-3 text-body-l ink">{escape(REPORT)}</p>
  </article>
  <p class="mt-1 px-2 text-body-s text-on-surface-variant">08:12 · Đã xem</p>
</div>"""
    thread = f"""
  <p class="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-surface-container-low px-3 py-1 text-body-s text-on-surface-variant">{icon("balance-rounded", 14)}{NO_ARBITRATION}</p>
  <p class="text-center text-label-m text-on-surface-variant">Hôm nay</p>
  {ticket}
  {theirs(["Chào bạn, mình đã xem lịch trình GHTK của đơn: bưu tá báo giao lúc 14:20 tại 12 Nguyễn Gia Trí, Bình Thạnh.",
           "Bạn chưa trả tiền nên không mất gì. Bạn kiểm tra giúp mình với bảo vệ toà nhà, mình cũng báo GHTK kiểm tra lại."], "09:05")}
  {mine("Ok bạn, để mình hỏi bảo vệ rồi báo lại nhé.", "09:11")}"""

    track = [("Đã lấy hàng", "Hôm kia, 16:40 · Gò Vấp", True), ("Đang giao", "Hôm qua, 09:12 · Bình Thạnh", True),
             ("Hãng báo đã giao", "Hôm qua, 14:20 · 12 Nguyễn Gia Trí", True), ("Bạn báo chưa nhận", "Hôm nay, 08:12", False)]
    track_html = "".join(f"""<li class="relative flex gap-3 pb-4 last:pb-0">
  {'' if i == len(track) - 1 else '<span class="absolute left-[7px] top-4 h-full w-0.5 bg-black/[.06]"></span>'}
  <span class="relative mt-1 h-4 w-4 shrink-0 rounded-full {"bg-primary" if ok else "border-2 border-tertiary bg-white"}"></span>
  <span><span class="block text-title-s {"ink" if ok else "text-tertiary"}">{t}</span><span class="block text-body-s text-on-surface-variant">{d}</span></span>
</li>""" for i, (t, d, ok) in enumerate(track))

    quick = "".join(a(f"quick-{i}", "flex items-center gap-2 rounded-[14px] px-2 py-2 text-body-m ink hover:bg-surface-container-low",
                      f'{icon("help-outline-rounded", 18, "shrink-0 text-on-surface-variant")}<span class="min-w-0 flex-1 truncate">{q}</span>{icon("chevron-right-rounded", 18, "shrink-0 text-on-surface-variant")}', "how.html#faq")
                    for i, (q, _, _) in enumerate(FAQ[:4]))
    body = f"""{header(active=None)}{EXTRA_CSS}
<main class="mx-auto max-w-[1360px] px-8">
  <div class="flex items-end justify-between pt-8">
    <div><h1 class="{H1}">Hỗ trợ</h1><p class="mt-1 flex items-center gap-1.5 text-body-m text-on-surface-variant">{icon("balance-rounded", 16)}{NO_ARBITRATION} Thường trả lời trong 2 giờ.</p></div>
    <button type="button" class="{btn_cls("ink", "lg")}">{icon("edit-outline-rounded", 18)}Yêu cầu mới</button>
  </div>
  <div class="mt-6 grid h-[660px] grid-cols-[340px_1fr_300px] items-start gap-4">
    <div class="flex flex-col gap-4">
    <section class="glass glass-edge flex flex-col rounded-[24px] p-3">
      <div class="px-1">{seg(["Đang xử lý · 2", "Đã xử lý · 1"], 0, "w-full bg-black/[.04]", "flex-1 text-label-l")}</div>
      <div class="mt-3 flex flex-col gap-1">{open_rows}</div>
      <p class="mb-1 mt-5 px-3 text-label-m text-on-surface-variant">Đã xử lý</p>
      <div class="flex flex-col gap-1 opacity-80">{done_rows}</div>
    </section>
    <section class="{PANEL} p-3">
      <p class="px-2 pb-1 pt-1 text-label-m text-on-surface-variant">Hỏi nhanh</p>
      {quick}
    </section>
    </div>
    <section class="{PANEL} flex h-full min-h-0 flex-col overflow-hidden">
      <div class="flex h-16 shrink-0 items-center gap-3 border-b line px-4">
        {official(38)}
        <div class="min-w-0 flex-1"><p class="truncate text-title-m ink">{name}</p>
          <p class="flex items-center gap-1 text-body-s text-on-surface-variant">ShopNexus{icon("verified-rounded", 14, "text-primary")}· Đang xử lý</p></div>
        <span class="rounded-full bg-secondary-container px-2.5 py-1 text-label-m text-on-secondary-container">Đang xử lý</span>
      </div>
      <div class="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">{thread}</div>
      <div class="flex shrink-0 items-center gap-2 p-3">
        <button type="button" class="state grid h-10 w-10 place-items-center rounded-full text-on-surface-variant" aria-label="Đính kèm">{icon("add-circle-outline-rounded", 22)}</button>
        <div class="flex h-11 flex-1 items-center rounded-full bg-surface-container-low px-4 text-body-l text-on-surface-variant">Nhắn ShopNexus</div>
        <button type="button" class="state grid h-11 w-11 place-items-center rounded-full bg-[var(--ink)] text-white" aria-label="Gửi">{icon("send-rounded", 18)}</button>
      </div>
    </section>
    <aside class="flex flex-col gap-4">
      <div class="{PANEL} p-4">
        <p class="text-label-m text-on-surface-variant">Đơn trong yêu cầu</p>
        <div class="mt-2 flex items-center gap-3">
          <img src="{ORDER["thumb"]}" alt="" class="h-14 w-14 rounded-[14px] object-cover">
          <div class="min-w-0"><p class="truncate text-title-s ink">{escape(ORDER["title"])}</p>{price("3.900.000 ₫", "text-[15px] leading-5")}</div>
        </div>
        <p class="mt-3 rounded-[14px] bg-[#FFF4EF] px-3 py-2 text-body-s text-on-tertiary-fixed-variant">Bạn chưa trả tiền nên không mất gì.</p>
        {a("open-order", btn_cls("line", "lg") + " mt-3 w-full !h-10", "Mở đơn", "order.html")}
      </div>
      <div class="{PANEL} p-4">
        <p class="flex items-center justify-between text-label-m text-on-surface-variant"><span>Lịch trình {ORDER["carrier"]}</span><span class="num">{ORDER["code"]}</span></p>
        <ol class="mt-3">{track_html}</ol>
      </div>
    </aside>
  </div>
</main>
{footer()}"""
    return page("Hỗ trợ · ShopNexus", body)


# ------------------------------------------------------------ Trợ giúp --
HELP_SAFETY = "Ai đòi chuyển cọc trước, bạn báo cáo trong menu của chat."
AFTER_PAY = "Sau khi bạn trả tiền, ShopNexus không đòi lại tiền được. Nếu hàng có vấn đề, bạn mở ghi nhận trong chat."
HELP_TOPICS = [
    ("Mua hàng", "shopping-bag-outline-rounded", [
        ("Xem hàng trước khi trả tiền thế nào?", MONEY["cod_buyer"] + " " + MONEY["refuse"]),
        ("Hủy đơn được không?", MONEY["cancel"]),
        ("Hàng có vấn đề sau khi đã nhận", AFTER_PAY),
        ("Hãng báo đã giao mà tôi chưa nhận?", "Trong đơn, bấm “Báo chưa nhận hàng”. Yêu cầu tới Hỗ trợ và ShopNexus trả lời trong chat.")]),
    ("Bán hàng", "storefront-outline-rounded", [
        ("Khi nào tôi nhận được tiền?", MONEY["cod_seller"]),
        ("Người mua từ chối nhận hàng thì sao?", MONEY["return_leg"]),
        ("Bật giao COD cho tin của tôi", "Liên kết tài khoản GHTK hoặc GHN đứng tên bạn trong Thiết lập giao COD. Tiền hàng về tài khoản ngân hàng bạn khai với hãng."),
        ("Đẩy tin là gì?", "Tin lên đầu mục Gần bạn trong 1 ngày (15.000 ₫) hoặc 3 ngày (35.000 ₫). Gói Plus có 4 lượt đẩy mỗi tháng.")]),
    ("An toàn", "verified-user-outline-rounded", [
        ("Người bán đòi chuyển cọc trước", "Bạn đừng chuyển tiền trước khi xem hàng, và báo cáo cuộc trò chuyện trong menu của chat."),
        ("Báo cáo một tin", "Trong menu của tin, chọn “Báo cáo tin”. Người của ShopNexus xem hàng cấm, hàng giả và lừa đảo; tình trạng và giá là chuyện giữa người mua và người bán."),
        ("Ai phân xử khi hai bên không đồng ý?", NO_ARBITRATION + " Ghi nhận và đánh giá hiện trên trang của người bán.")]),
]
SCAM_SIGNS = [("payments-outline-rounded", "Đòi cọc hoặc chuyển khoản trước", "Bạn chỉ trả cho shipper, sau khi xem hàng."),
              ("link-off-rounded", "Gửi link thanh toán lạ", "ShopNexus không có trang thanh toán cho tiền hàng."),
              ("password-rounded", "Hỏi mã đăng nhập", "ShopNexus không bao giờ hỏi mã gửi về điện thoại của bạn."),
              ("trending-down-rounded", "Giá rẻ bất thường", "So với Giá tham khảo trong tin trước khi nhắn.")]


def help_question(q, ans, opened):
    return (f'<details class="faq rounded-[18px] px-3 py-2.5 hover:bg-surface-container-low"{" open" if opened else ""}>'
            f'<summary class="flex items-center justify-between gap-3 text-body-l ink">{q}{icon("keyboard-arrow-down-rounded", 20, "chev shrink-0 text-on-surface-variant")}</summary>'
            f'<p class="mt-1.5 text-body-m text-on-surface-variant">{ans}</p></details>')


def help_page():
    q_open = {(0, 0), (1, 0), (2, 0)}
    topics = "".join(f"""<section class="{PANEL} p-2">
  <p class="flex items-center gap-2 px-3 pb-1 pt-3 text-title-s ink"><span class="grid h-8 w-8 place-items-center rounded-full bg-secondary-container text-on-secondary-container">{icon(ic, 18)}</span>{t}</p>
  {"".join(help_question(q, ans, (ti, qi) in q_open) for qi, (q, ans) in enumerate(qs))}
</section>""" for ti, (t, ic, qs) in enumerate(HELP_TOPICS))
    signs = "".join(f"""<div class="{PANEL} p-4"><span class="grid h-9 w-9 place-items-center rounded-full bg-error-container text-error">{icon(ic, 18)}</span>
  <p class="mt-3 text-title-s ink">{t}</p><p class="mt-0.5 text-body-s text-on-surface-variant">{d}</p></div>""" for ic, t, d in SCAM_SIGNS)
    popular = "".join(a(f"hq-{i}", "glass glass-edge flex h-9 items-center gap-1.5 rounded-full px-3 text-label-l ink hover:bg-white", f'{icon("help-outline-rounded", 16, "text-on-surface-variant")}{t}')
                      for i, t in enumerate(["Hủy đơn", "Từ chối nhận hàng", "Khi nào nhận tiền", "Bị đòi cọc"]))
    docs = link_rows([("gavel-rounded", "Quy định đăng tin", "listing-rules.html"), ("description-outline-rounded", "Điều khoản", "terms.html"),
                      ("lock-outline-rounded", "Chính sách bảo mật", "#privacy"), ("school-outline-rounded", "Cách mua bằng COD", "how.html")], "doc")
    body = f"""{header(active=None)}{EXTRA_CSS}
<main class="mx-auto max-w-[1360px] px-8 pt-8">
  <section class="grid grid-cols-[1fr_440px] items-start gap-8">
    <div>
      <h1 class="{H1}">Trợ giúp và an toàn</h1>
      <div class="mt-5 flex h-14 items-center gap-3 rounded-full bg-white pl-5 pr-2 glow">
        {icon("search-rounded", 22, "text-primary")}
        <span class="flex-1 text-body-l text-on-surface-variant">Gõ câu hỏi, ví dụ: hủy đơn thế nào</span>
        <button type="button" class="{btn_cls("primary")}">Tìm</button>
      </div>
      <div class="mt-3 flex flex-wrap gap-2">{popular}</div>
    </div>
    <div class="rounded-[28px] p-6 text-white" style="background: linear-gradient(140deg, #005049, #0E8A7D)">
      <p class="flex items-center gap-2 text-label-l text-[#B9EDE4]">{icon("shield-outline-rounded", 18)}Một điều cần nhớ</p>
      <p class="mt-2 text-[26px] font-semibold leading-8 tighter">Xem hàng rồi mới trả tiền</p>
      <p class="mt-2 text-body-m text-white/85">{HELP_SAFETY}</p>
    </div>
  </section>

  <section class="mt-8 grid grid-cols-3 items-start gap-4">{topics}</section>

  <section class="mt-10">
    <h2 class="{H2}">Dấu hiệu lừa đảo</h2>
    <div class="mt-4 grid grid-cols-4 gap-4">{signs}</div>
  </section>

  <section class="mt-10 grid grid-cols-2 gap-4">
    <div class="{PANEL} flex items-center gap-4 p-5">
      <span class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-secondary-container text-on-secondary-container">{icon("support-agent-rounded", 24)}</span>
      <div class="min-w-0 flex-1"><p class="text-title-m font-semibold ink">Không có câu hỏi nào khớp?</p>
        <p class="text-body-m text-on-surface-variant">Gửi yêu cầu, ShopNexus trả lời trong chat. Bạn có 2 yêu cầu đang xử lý.</p></div>
      {a("to-support", btn_cls("ink", "lg"), "Yêu cầu hỗ trợ", "support.html")}
    </div>
    <div class="{PANEL} grid grid-cols-2 gap-x-2 p-2">{docs}</div>
  </section>
</main>
{footer()}"""
    return page("Trợ giúp và an toàn · ShopNexus", body)


# --------------------------------------------------------- Gói người bán --
PLANS = [("Cơ bản", "Miễn phí", None, True, ["Số tin theo bậc uy tín", "Đẩy tin trả theo lượt, từ 15.000 ₫", "Thống kê 7 ngày"]),
         ("Plus", "49.000", "₫/tháng", False, ["4 lượt đẩy mỗi tháng", "Thống kê 30 ngày, người xem đến từ đâu", "Trả lời mẫu cho câu hỏi hay gặp"]),
         ("Cửa hàng", "199.000", "₫/tháng", False, ["Trang cửa hàng có tên riêng", "20 lượt đẩy mỗi tháng", "2 người cùng quản lý tin"])]
TIERS = [("Mới", "0", "COD 2 đơn đang mở · 5 tin"), ("Tin cậy", "200", "COD 5 đơn đang mở · 20 tin"),
         ("Uy tín", "500", "COD 10 đơn đang mở · ưu tiên ở Gần bạn"), ("Xuất sắc", "800", "COD 20 đơn đang mở · huy hiệu trên mọi tin · giảm 20% phí đẩy tin")]
PAY_WAYS = [("MoMo", "•• 0912", True, None), ("ZaloPay", "Chưa liên kết", False, "Liên kết"),
            ("Thẻ ngân hàng", "Visa, Mastercard, thẻ ATM", False, "Liên kết"), ("Chuyển khoản qua mã QR", "Quét mã mỗi lần trả", False, None)]
FEE_NOTE = "Phí dịch vụ của ShopNexus, không hoàn."


def plan_card(plan, chosen):
    name, amount, unit, current, perks = plan
    tag = ('<span class="rounded-full bg-secondary-container px-2.5 py-1 text-label-m text-on-secondary-container">Đang dùng</span>' if current
           else '<span class="rounded-full bg-[var(--ink)] px-2.5 py-1 text-label-m text-white">Đã chọn</span>' if chosen else "")
    figure = (f'<p class="mt-3 text-[34px] font-semibold leading-10 tighter ink">{amount}</p>' if not unit
              else f'<p class="mt-3 flex items-baseline gap-1"><span class="num text-[34px] font-semibold leading-10 tighter ink">{amount}</span><span class="text-body-m text-on-surface-variant">{unit}</span></p>')
    perks_html = "".join(f'<li class="flex gap-2 text-body-m ink">{icon("check-rounded", 18, "mt-px shrink-0 text-primary")}{p}</li>' for p in perks)
    action = "" if current else f'<button type="button" class="{btn_cls("ink" if chosen else "line", "lg")} mt-5 w-full">{"Đã chọn " + name if chosen else "Chọn " + name}</button>'
    return f"""<article class="card flex flex-col rounded-[24px] bg-white p-5 {"ring-2 ring-[var(--ink)] glow" if chosen else "border line"}">
  <div class="flex items-center justify-between"><p class="text-title-m font-semibold ink">{name}</p>{tag}</div>
  {figure}
  <ul class="mt-4 flex flex-1 flex-col gap-2">{perks_html}</ul>
  {action}
</article>"""


def plans():
    cards = "".join(plan_card(p, i == 1) for i, p in enumerate(PLANS))
    tiers = "".join(f"""<li class="flex items-center gap-3 py-2.5">
  <span class="grid h-9 w-9 shrink-0 place-items-center rounded-full {"bg-primary text-on-primary" if i == 1 else "bg-surface-container-low text-on-surface-variant"} text-label-m num">{pts}</span>
  <div class="min-w-0 flex-1"><p class="text-title-s ink">{t}</p><p class="text-body-s text-on-surface-variant">{r}</p></div>
  {'<span class="rounded-full bg-secondary-container px-2 py-0.5 text-label-s text-on-secondary-container">Bạn · 386</span>' if i == 1 else ""}
</li>""" for i, (t, pts, r) in enumerate(TIERS))
    pays = "".join(f"""<label class="flex items-center gap-3 rounded-[16px] px-3 py-2.5 {"bg-surface-container-low" if on else "hover:bg-surface-container-low"}">
  <span class="grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 {"border-primary" if on else "border-outline"}">{'<span class="h-2.5 w-2.5 rounded-full bg-primary"></span>' if on else ""}</span>
  <span class="min-w-0 flex-1"><span class="block text-body-m ink">{t}</span><span class="block text-body-s text-on-surface-variant">{sub}</span></span>
  {f'<span class="text-label-l text-primary">{act}</span>' if act else ""}
</label>""" for t, sub, on, act in PAY_WAYS)
    body = f"""{header(active=None)}{EXTRA_CSS}
<main class="mx-auto max-w-[1360px] px-8 pt-8">
  <div class="flex items-end justify-between gap-6">
    <div><h1 class="{H1}">Gói người bán</h1>
      <p class="mt-2 text-body-l text-on-surface-variant">Thêm lượt đẩy và thống kê cho người bán thường xuyên. Gói Cơ bản miễn phí.</p></div>
    <p class="glass glass-edge flex items-center gap-2 rounded-full px-4 py-2 text-label-l ink">{icon("workspace-premium-outline-rounded", 18, "text-primary")}Quyền COD và bậc uy tín không mua được</p>
  </div>

  <section class="mt-6 grid grid-cols-[1fr_380px] items-start gap-6">
    <div>
      <div class="grid grid-cols-3 gap-4">{cards}</div>
      <div class="mt-4 grid grid-cols-2 gap-4">
        <div class="{PANEL} p-5">
          <p class="flex items-center gap-2 text-title-s ink">{icon("trending-up-rounded", 18, "text-primary")}Đẩy tin theo lượt</p>
          <p class="mt-1 text-body-s text-on-surface-variant">Lên đầu mục Gần bạn quanh Bình Thạnh</p>
          <div class="mt-3 grid grid-cols-2 gap-2">
            <div class="rounded-[16px] bg-surface-container-low p-3"><p class="text-body-s text-on-surface-variant">1 ngày</p>{price("15.000 ₫")}</div>
            <div class="rounded-[16px] bg-surface-container-low p-3"><p class="text-body-s text-on-surface-variant">3 ngày</p>{price("35.000 ₫")}</div>
          </div>
        </div>
        <div class="{PANEL} p-5">
          <p class="flex items-center gap-2 text-title-s ink">{icon("autorenew-rounded", 18, "text-primary")}Gia hạn và hủy</p>
          <p class="mt-2 text-body-m text-on-surface-variant">Gia hạn mỗi tháng. Hủy lúc nào cũng được, gói chạy hết tháng đã trả.</p>
          <p class="mt-2 flex gap-2 text-body-s text-on-surface-variant">{icon("info-outline-rounded", 16, "mt-px shrink-0 text-primary")}{FEE_NOTE}</p>
        </div>
      </div>
      <div class="{PANEL} mt-4 p-5">
        <div class="flex items-baseline justify-between"><p class="text-title-s ink">Quyền theo bậc uy tín</p>{a("rep", "text-label-l text-primary hover:underline", "Cách tính điểm")}</div>
        <p class="mt-1 text-body-s text-on-surface-variant">Bậc lên theo điểm uy tín 12 tháng: giao dịch xong, đánh giá, trả lời nhanh. Gói không đổi được bậc.</p>
        <ul class="mt-2 grid grid-cols-2 gap-x-8">{tiers}</ul>
      </div>
    </div>
    <aside class="sticky top-[84px] {PANEL} p-5">
      <p class="text-label-m text-on-surface-variant">Xác nhận gói</p>
      <div class="mt-1 flex items-baseline justify-between"><p class="text-title-l font-semibold tight ink">Plus</p><p class="flex items-baseline gap-1">{price("49.000 ₫", "text-[24px] leading-8")}<span class="text-body-s text-on-surface-variant">/tháng</span></p></div>
      <p class="mt-4 text-label-l text-on-surface-variant">Trả bằng</p>
      <div class="mt-1.5 flex flex-col gap-1">{pays}</div>
      <p class="mt-3 text-body-s text-on-surface-variant">Dùng để trả phí đẩy tin và gói người bán. Tiền hàng vẫn trả cho shipper khi nhận.</p>
      <button type="button" class="{btn_cls("ink", "lg")} mt-4 w-full">Xác nhận</button>
      <p class="mt-3 text-center text-body-s text-on-surface-variant">{FEE_NOTE}</p>
    </aside>
  </section>
</main>
{footer()}"""
    return page("Gói người bán · ShopNexus", body)


# ------------------------------------------------- legal pages, one frame --
def legal_block(part):
    """A paragraph, or a list when part is a list."""
    if isinstance(part, list):
        items = "".join(f'<li class="flex gap-2.5 text-body-l ink"><span class="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-primary"></span><span>{li}</span></li>' for li in part)
        return f'<ul class="mt-3 flex flex-col gap-1.5">{items}</ul>'
    return f'<p class="mt-3 text-body-l leading-6 ink">{part}</p>'


def legal(title, updated, sections, aside, active_sec=0):
    """A legal page: the title row, a sticky table of contents on the left, the
    text in one readable column (numbered sections of short paragraphs and
    lists), and a summary on the right. sections: (title, [paragraph or list])."""
    toc = "".join(a(f"toc-{i}", f"flex gap-2.5 rounded-[14px] px-3 py-2 text-body-m {'bg-white ink shadow-sm' if i == active_sec else 'text-on-surface-variant hover:text-on-surface'}",
                    f'<span class="num w-5 shrink-0 text-label-m {"text-primary" if i == active_sec else ""}">{i + 1:02d}</span>{t}', f"#s{i + 1}")
                  for i, (t, _) in enumerate(sections))
    text = "".join(f"""<section id="s{i + 1}" class="{"border-t line pt-6" if i else ""} pb-6">
  <h2 class="flex items-baseline gap-3 text-[22px] font-semibold leading-7 tighter ink"><span class="ink num">{i + 1:02d}</span>{t}</h2>
  {"".join(legal_block(p) for p in parts)}
</section>""" for i, (t, parts) in enumerate(sections))
    body = f"""{header(active=None)}{EXTRA_CSS}
<main class="mx-auto max-w-[1360px] px-8 pt-6">
  {crumbs("Trợ giúp và an toàn", title)}
  <div class="mt-4 flex items-end justify-between gap-6">
    <div><h1 class="{H1}">{title}</h1><p class="mt-2 text-body-m text-on-surface-variant">Cập nhật ngày {updated} · {len(sections)} mục</p></div>
    <div class="flex gap-2"><button type="button" class="{btn_cls("line")}">{icon("print-outline-rounded", 18)}In</button><button type="button" class="{btn_cls("line")}">{icon("link-rounded", 18)}Sao chép link</button></div>
  </div>
  <div class="mt-6 grid grid-cols-[260px_1fr_320px] items-start gap-6">
    <nav class="glass glass-edge sticky top-[84px] flex flex-col gap-0.5 rounded-[24px] p-2">{toc}</nav>
    <article class="{PANEL} px-10 pt-8">{text}</article>
    <aside class="sticky top-[84px] flex flex-col gap-4">{aside}</aside>
  </div>
</main>
{footer()}"""
    return page(f"{title} · ShopNexus", body)


def listing_rules():
    sections = [
        ("Một tin, một món", ["Mỗi tin bán một món, mới hoặc đã dùng, của chính bạn. Bán nhiều món thì đăng nhiều tin.",
                              "Số tin đang đăng theo bậc uy tín: Mới 5 tin, Tin cậy 20 tin. Gói người bán không đổi được số này."]),
        ("Hàng không được đăng", ["Người của ShopNexus gỡ tin và có thể khóa tài khoản khi tin bán:",
                                  ["Vũ khí, chất nổ, ma túy và chất cấm", "Thuốc kê đơn",
                                   "Hàng giả, hàng nhái, hàng gắn nhãn hiệu không phải của nó", "Động vật hoang dã và sản phẩm từ chúng",
                                   "Tài khoản, sim đã đăng ký, giấy tờ tùy thân", "Hàng ăn cắp hoặc không rõ chủ"]]),
        ("Ảnh và video", ["Ảnh phải là món bạn đang bán. Người mua thấy ảnh nào chụp trong app, ví dụ “Cả 4 ảnh chụp trong app”.",
                          "Ảnh lấy từ mạng hay ảnh của món khác làm tin bị hạ hiển thị khi có người báo cáo.",
                          "AI đọc ảnh và video bạn chọn để điền tên, tình trạng và giá. Bạn sửa được mọi ô trước khi đăng."]),
        ("Tình trạng và Tin ghi", ["Chọn một trong ba: Mới (chưa dùng), Như mới (không vết, hoặc vết rất nhỏ chỉ thấy khi soi gần), Đã dùng (có vết dùng, ghi rõ trong mô tả).",
                                   "Mỗi điều bạn ghi trong tin, như pin 86%, máy zin hay còn bảo hành, là một Tin ghi. Người mua kiểm từng Tin ghi khi shipper tới cửa. " + MONEY["refuse"]]),
        ("Giá", ["Ghi giá bạn thật sự bán. Giá tối thiểu là 10.000 ₫.",
                 "Không ghi giá ảo để kéo người xem rồi báo giá khác trong chat. Trả giá diễn ra trong chat của tin.",
                 "Giá tham khảo trong tin do AI tính từ các tin cùng đời máy trong 30 ngày. Đó không phải lời hứa của người bán."]),
        ("Báo cáo và xử lý", ["Người mua báo cáo một tin với một trong bốn lý do: Hàng cấm bán; Hàng giả, hàng nhái; Có dấu hiệu lừa đảo; Lý do khác.",
                              "Người của ShopNexus chỉ xem hàng cấm, hàng giả và lừa đảo. Tình trạng và giá là chuyện giữa người mua và người bán.",
                              "Vi phạm lặp lại làm mất quyền theo thứ tự: hạ hiển thị, giới hạn COD, mất COD, khóa tài khoản. Mỗi 30 ngày không vi phạm gỡ một bậc."]),
        ("Bán xong", ["Bán qua COD thì tin chuyển sang Đã bán khi người mua nhận hàng.",
                      "Bán ngoài app thì bấm “Đánh dấu đã bán”, để món vẫn tính vào điểm uy tín của bạn."]),
    ]
    aside = summary_card("Tóm tắt", [("inventory-2-outline-rounded", "Một tin bán một món của chính bạn"),
                                     ("photo-camera-outline-rounded", "Ảnh chụp món thật; người mua thấy ảnh nào chụp trong app"),
                                     ("fact-check-outline-rounded", "Mỗi Tin ghi được kiểm tại cửa"),
                                     ("sell-outline-rounded", "Giá ghi là giá thật")]) + \
        f'<div class="{PANEL} p-2">' + link_rows([("help-outline-rounded", "Trợ giúp và an toàn", "help.html"), ("description-outline-rounded", "Điều khoản", "terms.html"),
                                                  ("add-circle-outline-rounded", "Đăng tin", "sell.html")], "rel") + "</div>"
    return legal("Quy định đăng tin", "28/10/2026", sections, aside)


def terms():
    sections = [
        ("ShopNexus là gì", ["ShopNexus là nơi người bán đăng món đồ, người mua tìm, nhắn và trả giá. ShopNexus không phải bên bán và không sở hữu món đồ nào.",
                             NO_ARBITRATION]),
        ("Tài khoản", ["Mỗi người một tài khoản, đăng nhập bằng số điện thoại hoặc Google. Bạn giữ mã đăng nhập cho riêng mình; ShopNexus không bao giờ hỏi mã đó.",
                       "Người mua và người bán thấy tên, ảnh đại diện, khu vực, hạng uy tín, đánh giá và các tin bạn đăng. Họ không thấy số điện thoại, địa chỉ hay giấy tờ của bạn."]),
        ("Tiền và giao hàng", ["ShopNexus không giữ tiền hàng của bên nào. Cách giao trong app là COD có xem hàng:",
                               [MONEY["cod_buyer"], MONEY["refuse"], MONEY["cancel"], MONEY["cod_seller"], MONEY["return_leg"]],
                               "Sau khi bạn trả tiền, ShopNexus không đòi lại tiền được."]),
        ("Khi có vấn đề sau khi nhận", ["Bạn mở ghi nhận trong chat hoặc trong đơn, kèm ảnh. Người bán tự hoàn tiền cho bạn hoặc từ chối.",
                                        "Ghi nhận bị từ chối hiện trên trang của người bán. ShopNexus không quyết định ai đúng."]),
        ("Điểm uy tín và quyền", ["Điểm uy tín từ 0 đến 1000, tính trên 12 tháng, chỉ từ những việc app thấy: giao dịch xong, đánh giá, trả lời nhanh, xác minh danh tính.",
                                  "Bậc uy tín quyết định số tin và số đơn COD đang mở. Tỷ lệ từ chối nhận và ghi nhận bị từ chối trong 90 ngày làm mất quyền, từng bậc."]),
        ("Phí của ShopNexus", ["Đăng tin, nhắn tin và mua hàng miễn phí. ShopNexus thu phí đẩy tin (từ 15.000 ₫) và gói người bán (Plus 49.000 ₫/tháng, Cửa hàng 199.000 ₫/tháng).",
                               FEE_NOTE + " Gói gia hạn mỗi tháng và hủy lúc nào cũng được."]),
        ("Nội dung bạn đăng", ["Bạn chịu trách nhiệm về tin, ảnh và lời nhắn của mình. Tin phải theo Quy định đăng tin.",
                               "ShopNexus hiển thị tin của bạn trên app, web và kết quả tìm kiếm để người mua tìm thấy."]),
        ("Khóa và xóa tài khoản", ["ShopNexus khóa tài khoản khi bán hàng cấm, hàng giả, lừa đảo, hoặc khi mất hết quyền theo điểm uy tín.",
                                   "Bạn xóa tài khoản trong Tôi › Bảo mật. Tin đăng và trang của bạn được gỡ ngay."]),
        ("Liên hệ", ["Gửi yêu cầu trong Hỗ trợ. ShopNexus trả lời trong chat của yêu cầu đó."]),
    ]
    aside = summary_card("Điều quan trọng nhất", [("visibility-outline-rounded", "Xem hàng rồi mới trả tiền cho shipper"),
                                                  ("undo-rounded", "Không ưng thì từ chối nhận, không mất tiền"),
                                                  ("block-rounded", "Đã trả thì ShopNexus không đòi lại được")], "priority-high-rounded") + \
        f'<div class="{PANEL} p-2">' + link_rows([("gavel-rounded", "Quy định đăng tin", "listing-rules.html"), ("lock-outline-rounded", "Chính sách bảo mật", "#privacy"),
                                                  ("support-agent-rounded", "Yêu cầu hỗ trợ", "support.html")], "rel") + "</div>"
    return legal("Điều khoản", "28/10/2026", sections, aside, active_sec=2)


if __name__ == "__main__":
    for name, fn in [("how", how), ("sell", sell), ("cod", cod), ("support", support),
                     ("help", help_page), ("plans", plans), ("listing-rules", listing_rules), ("terms", terms)]:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(fn())
        print("wrote", name)
