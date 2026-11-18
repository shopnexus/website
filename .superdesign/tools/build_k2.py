"""K2, second pass: K in ai-portal's "Calm Enterprise" with more detail, after
the first K2 read empty. Detail comes from things a buyer uses, not decoration:
a category rail with counts and the saved searches, cards that name the seller
and the condition, a toolbar over the grid, and on a listing the condition
scale, the listing id, the seller's numbers and reviews.

    python3 tools/build_k2.py        (run from .superdesign/)

Writes mockups/quiet-k2-{home,search,detail}.html.
"""
import os
from html import escape

from build import OUT, PHOTOS, SPECS, TITLE
from build_quiet import STYLE, LISTINGS, LAPTOPS, page, link
import json

from common import LOGO, img

ART = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), "art_urls.json")))

S = STYLE["k2"]
TEAL = "#066A61"
ME = "1494790108377-be9c29b29330"
SELLERS = [("Tuấn Kiệt", "1544723795-3fb6469f5b39", "4,9"), ("Minh Anh", "1438761681033-6461ffad8d80", "4,8"),
           ("Hoàng Nam", "1500648767791-00dcc994a43e", "4,7"), ("Thu Hà", "1544005313-94ddf0286df2", "5,0"),
           ("Quốc Bảo", "1506794778202-cad84cf45f1d", "4,6")]
CATS = [("smartphone-line", "Điện thoại", "3.412"), ("macbook-line", "Máy tính", "2.108"), ("camera-3-line", "Máy ảnh", "688"),
        ("headphone-line", "Âm thanh", "902"), ("riding-line", "Xe đạp", "964"), ("motorbike-line", "Xe máy", "1.530"),
        ("sofa-line", "Nội thất", "1.247"), ("t-shirt-line", "Thời trang", "5.870"), ("fridge-line", "Đồ gia dụng", "2.311"),
        ("bear-smile-line", "Mẹ và bé", "1.096")]

# Brand (brand/README.md): teal #066A61, mint #97E7DB and #C7E6E0, charcoal
# #2D3130, terracotta #924628 as a small accent. Teal carries every primary
# action and selection; terracotta only marks bargaining.
EXTRA = """
  .bg-brand { background: #066A61; } .bg-brand:hover { background: #05554E; } .text-brand { color: #066A61; }
  .bg-mint { background: #E3F2EF; } .text-on-mint { color: #05554E; }
  .card { background: #fff; border: 1px solid var(--line); border-radius: 16px; transition: box-shadow 160ms cubic-bezier(.2,.7,.2,1), border-color 160ms; }
  .card:hover { box-shadow: 0 2px 10px rgb(20 20 19 / .06); border-color: #DCDCD8; }
  .row:hover { background: #EEEEEB; } .row.on { background: #E3F2EF; color: #05554E; font-weight: 500; } .row.on iconify-icon { color: #066A61; }
  .tab { height: 36px; display: inline-flex; align-items: center; border-bottom: 2px solid transparent; color: var(--mute); }
  .tab.on { color: var(--ink); border-color: #066A61; font-weight: 500; }
  .meta { font-size: 12.5px; line-height: 16px; color: #8C8C87; }
  .clamp2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .btn-o { background: #fff; box-shadow: inset 0 0 0 1px #DCDCD8; } .btn-o:hover { background: #F7F7F5; }
"""


def ri(name, size=16, cls=""):
    return f'<iconify-icon icon="ri:{name}" width="{size}" height="{size}" class="block shrink-0 {cls}"></iconify-icon>'


def out(title, body):
    return page(S, title, body).replace("</style>", EXTRA + "</style>", 1)


# ------------------------------------------------------------------ chrome --
def header(query=""):
    return f"""<header class="sticky top-0 z-30 border-b bd bg-[var(--bg)]/95 backdrop-blur">
  <div class="mx-auto flex h-16 items-center gap-4 {S['wrap']}">
    {link("brand", "flex items-center gap-2 pr-2", f'<img src="{LOGO}" alt="" class="h-8 w-8"><span class="text-[16px] font-semibold tracking-tight">ShopNexus</span>')}
    <button type="button" class="flex h-10 items-center gap-1.5 rounded-[10px] px-3 text-[14px] row">{ri("map-pin-line", 16, "mute")}TP.HCM{ri("arrow-down-s-line", 16, "mute")}</button>
    <form class="flex h-10 flex-1 items-center gap-2 rounded-[10px] bg-white pl-3 pr-1 shadow-[inset_0_0_0_1px_#DCDCD8] focus-within:shadow-[inset_0_0_0_1.5px_#066A61]">
      {ri("search-line", 17, "mute")}
      <input class="h-full min-w-0 flex-1 bg-transparent text-[14px] outline-none" placeholder="Tìm iPhone, xe đạp, sofa…" value="{escape(query)}">
      <span class="rounded-[6px] border bd px-1.5 text-[11px] mute">/</span>
      <button type="button" class="grid h-8 w-8 place-items-center rounded-[8px] mute row" aria-label="Tìm bằng ảnh">{ri("camera-line", 17)}</button>
    </form>
    <nav class="flex items-center gap-1">
      {link("h-bell", "relative grid h-10 w-10 place-items-center rounded-[10px] row", ri("notification-3-line", 19) + '<span class="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#DC2626]"></span>')}
      {link("h-msg", "relative flex h-10 items-center gap-2 rounded-[10px] px-3 text-[14px] row", ri("chat-3-line", 18) + 'Tin nhắn<span class="grid h-[18px] min-w-[18px] place-items-center rounded-full bg-brand px-1 text-[11px] font-medium text-white">3</span>')}
      {link("h-me", "ml-1 grid h-10 w-10 place-items-center rounded-full row", f'<img src="{img(ME, 64, 64)}" alt="Tôi" class="h-8 w-8 rounded-full object-cover">')}
      {link("h-sell", "ml-2 flex h-10 items-center gap-1.5 rounded-[10px] bg-brand px-4 text-[14px] font-medium text-white", ri("add-line", 17) + "Đăng tin")}
    </nav>
  </div>
</header>"""


def footer():
    cols = [("Khám phá", ["Danh mục", "Mới đăng", "Gần bạn"]), ("Mua bán", ["Cách mua COD", "Cách đăng tin", "Gói người bán", "Điểm uy tín"]),
            ("Hỗ trợ", ["Trợ giúp và an toàn", "Yêu cầu hỗ trợ", "Quy định đăng tin", "Điều khoản"])]
    c = "".join(f'<div><p class="meta">{t}</p><ul class="mt-3 flex flex-col gap-2 text-[14px]">'
                + "".join(f"<li>{link(f'f{t[:2]}{i}', 'hover:underline', x)}</li>" for i, x in enumerate(xs)) + "</ul></div>" for t, xs in cols)
    return f"""<footer class="mt-20 border-t bd bg-white">
  <div class="mx-auto grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 py-12 {S['wrap']}">
    <div>
      <p class="flex items-center gap-2 text-[15px] font-semibold"><img src="{LOGO}" alt="" class="h-7 w-7">ShopNexus</p>
      <p class="mt-3 max-w-[280px] text-[14px] mute">Mua bán đồ cũ quanh bạn. Xem hàng rồi mới trả tiền.</p>
      <div class="mt-5 flex gap-2">
        {link("gp", "btn-o flex h-10 items-center gap-2 rounded-[10px] px-3 text-[13px]", ri("google-play-line", 18) + "Tải trên Google Play")}
      </div>
    </div>
    {c}
  </div>
  <div class="mx-auto flex justify-between border-t bd py-5 meta {S['wrap']}"><span>© 2026 ShopNexus</span><span>TP.HCM · Hà Nội · Đà Nẵng</span></div>
</footer>"""


# ------------------------------------------------------------------- cards --
def card(i, photo, price, title, cond, place, ago="", saved=False, seller=None):
    name, face, rate = seller or SELLERS[i % len(SELLERS)]
    heart = (f'<button type="button" class="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/90 shadow-[0_1px_2px_rgb(20_20_19/.08)] {"text-[#DC2626]" if saved else "ink"}" aria-label="Lưu">'
             f'{ri("heart-fill" if saved else "heart-line", 16)}</button>')
    return f"""<article class="card min-w-0 p-2">
  <div class="relative overflow-hidden rounded-[11px] bg-soft" style="aspect-ratio:1/1"><img src="{img(photo, 480, 480)}" alt="" class="h-full w-full object-cover">{heart}</div>
  <div class="px-1.5 pb-1 pt-2.5">
    <p class="num text-[16px] font-semibold tracking-tight">{price}</p>
    <p class="clamp2 mt-0.5 min-h-[40px] text-[14px] leading-5">{escape(title)}</p>
    <p class="meta mt-1.5">{cond} · {place}</p>
    <div class="mt-2.5 flex items-center gap-1.5 border-t bd pt-2.5">
      <img src="{img(face, 48, 48)}" alt="" class="h-[18px] w-[18px] rounded-full object-cover">
      <span class="meta flex-1 truncate !text-[#5E5E5A]">{name} · ★ {rate}</span>
      <span class="meta">{ago}</span>
    </div>
  </div>
</article>"""


def listing_cards(rows, start=0, saved=(), with_ago=True):
    return "".join(card(start + i, p, pr, t, c, km if float(km.split()[0].replace(".", "").replace(",", ".")) < 10 else a, ago if with_ago else "", saved=i in saved)
                   for i, (p, pr, t, c, km, a, ago) in enumerate(rows))


def rail(active=None):
    cats = "".join(link(f"rc{i}", f"row flex h-9 items-center gap-2.5 rounded-[8px] px-2.5 text-[14px] {'on' if t == active else ''}",
                        ri(ic, 17, "mute") + f'<span class="flex-1">{t}</span><span class="meta">{n}</span>') for i, (ic, t, n) in enumerate(CATS))
    saved = "".join(link(f"rs{i}", "row flex h-9 items-center gap-2.5 rounded-[8px] px-2.5 text-[14px]",
                         ri("bookmark-line", 16, "mute") + f'<span class="flex-1 truncate">{q}</span>' + (f'<span class="rounded-full bg-[#E9F7F0] px-1.5 text-[11.5px] font-medium text-[#0B6B5F]">{n}</span>' if n else ""))
                    for i, (q, n) in enumerate([("Sony A7 III dưới 25 tr", "3"), ("iPhone 13 pin trên 85%", "1"), ("Xe đạp cho bé 8 tuổi", "")]))
    return f"""<aside class="sticky top-[88px] self-start">
  <p class="px-2.5 meta">Danh mục</p>
  <nav class="mt-1.5 flex flex-col">{cats}</nav>
  <div class="my-4 border-t bd"></div>
  <p class="flex items-center justify-between px-2.5 meta">Tìm đã lưu {link("rs-all", "hover:underline", "Sửa")}</p>
  <nav class="mt-1.5 flex flex-col">{saved}</nav>
  <div class="my-4 border-t bd"></div>
  {link("how", "block overflow-hidden rounded-[14px] bg-mint p-3.5", f'<img src="{ART["art_cod_ready"]}" alt="" class="mx-auto h-[92px] w-auto"><span class="mt-2 block text-[14px] font-medium text-on-mint">Mua bằng COD</span><span class="block text-[12.5px] text-on-mint/80">Xem hàng rồi mới trả tiền</span>')}
</aside>"""


def ago_rows(src):
    return [(p, pr, t, c, km, a, ago) for p, pr, t, c, km, a, _r, ago, _n in src]


# -------------------------------------------------------------------- home --
def home():
    L = LISTINGS
    tasks = "".join(f"""<div class="card flex items-center gap-3.5 px-4 py-3.5">
      <img src="{img(ph, 96, 96)}" alt="" class="h-12 w-12 rounded-[10px] object-cover">
      <div class="min-w-0 flex-1"><p class="flex items-center gap-1.5 meta"><span class="h-1.5 w-1.5 rounded-full" style="background:{dot}"></span>{kind}</p>
        <p class="mt-0.5 truncate text-[15px] font-medium">{t}</p><p class="meta mt-0.5 !text-[#5E5E5A]">{note}</p></div>
      {link(f"tk{i}", "btn-o flex h-9 items-center rounded-[10px] px-3.5 text-[14px] font-medium", act)}
    </div>""" for i, (ph, dot, kind, t, note, act) in enumerate([
        (L[0][0], "#2563EB", "Đơn đang giao", "iPhone X 64GB, pin 86%", "Shipper tới chiều nay, 14:00–17:00", "Xem đơn"),
        (L[5][0], "#924628", "Đang trả giá", "Sofa nhung xanh 3 chỗ", "Người bán trả lại 4.500.000 ₫", "Trả lời")]))
    rows = ago_rows(L)
    first = listing_cards(rows[:8], 0, saved=(4,))
    second = listing_cards(rows[8:12] + rows[:4], 8)
    alert_items = "".join(f"""<div class="flex items-center gap-3">
        <img src="{img(p, 120, 120)}" alt="" class="h-14 w-14 rounded-[10px] object-cover">
        <div class="min-w-0"><p class="num text-[15px] font-semibold">{pr}</p><p class="truncate text-[13.5px]">{t}</p><p class="meta">{pl} · {ago}</p></div>
      </div>""" for p, pr, t, pl, ago in [("1516035069371-29a1b244cc32", "24.500.000 ₫", "Sony A7 III body, 12k shot", "3,4 km", "20 phút"),
                                          ("1502920917128-1aa500764cbd", "23.900.000 ₫", "Sony A7 III kèm lens kit", "6,0 km", "1 giờ"),
                                          ("1510127034890-ba27508e9f1c", "22.000.000 ₫", "Sony A7 III, sạc 2 pin", "Hà Nội", "3 giờ")])
    seen = "".join(f'<div class="w-[132px] shrink-0"><img src="{img(p, 264, 264)}" alt="" class="aspect-square w-full rounded-[12px] object-cover"><p class="num mt-1.5 text-[14px] font-semibold">{pr}</p><p class="meta truncate">{t}</p></div>'
                   for p, pr, t, *_ in [L[7], L[1], L[5], L[9], L[3], L[11], L[2], L[6]])
    tabs = "".join(f'<span class="tab {"on" if i == 0 else ""}">{t}</span>' for i, t in enumerate(["Gần bạn", "Mới nhất", "Vừa giảm giá", "Miễn phí"]))
    body = f"""{header()}
<div class="mx-auto grid grid-cols-[224px_1fr] gap-10 pt-6 {S['wrap']}">
  {rail()}
  <main class="min-w-0">
    <div class="flex items-end justify-between">
      <div><p class="meta">Chiều thứ Tư, 18/11</p><h1 class="mt-1 text-[28px] font-semibold leading-9 tracking-[-0.02em]">Chào Khánh Linh</h1></div>
      <p class="text-[14px] mute"><span class="font-medium text-[#1A1A19]">214</span> tin mới quanh Bình Thạnh hôm nay</p>
    </div>
    <div class="mt-5 grid grid-cols-2 gap-3">{tasks}</div>

    <div class="mt-9 flex items-center justify-between border-b bd">
      <div class="flex gap-6 text-[14px]">{tabs}</div>
      <div class="flex items-center gap-2 pb-1.5">
        <button type="button" class="btn-o flex h-8 items-center gap-1.5 rounded-[8px] px-2.5 text-[13px]">{ri("map-pin-line", 14, "mute")}Trong 10 km{ri("arrow-down-s-line", 15, "mute")}</button>
        <span class="flex rounded-[8px] bg-soft p-0.5"><span class="grid h-7 w-7 place-items-center rounded-[6px] bg-white shadow-[0_1px_2px_rgb(20_20_19/.06)]">{ri("layout-grid-line", 15)}</span><span class="grid h-7 w-7 place-items-center mute">{ri("list-check", 15)}</span></span>
      </div>
    </div>
    <div class="mt-5 grid grid-cols-4 gap-4">{first}</div>

    <section class="card mt-6 flex items-center gap-8 px-5 py-4">
      <div class="w-[220px] shrink-0">
        <p class="flex items-center gap-1.5 text-[14px] font-medium">{ri("bookmark-fill", 15, "text-[#066A61]")}Sony A7 III dưới 25 tr</p>
        <p class="meta mt-0.5">3 tin mới từ hôm qua</p>
        {link("alert-all", "mt-2 inline-flex text-[13px] font-medium underline-offset-2 hover:underline", "Xem cả 3 →")}
      </div>
      <div class="grid flex-1 grid-cols-3 gap-6 border-l bd pl-8">{alert_items}</div>
    </section>

    <div class="mt-6 grid grid-cols-4 gap-4">{second}</div>
    <div class="mt-8 flex justify-center">{link("more", "btn-o flex h-10 items-center rounded-[10px] px-5 text-[14px] font-medium", "Xem thêm tin gần bạn")}</div>

    <section class="mt-14">
      <div class="flex items-center justify-between"><h2 class="text-[17px] font-semibold">Bạn vừa xem</h2>{link("seen-clear", "text-[13px] mute hover:underline", "Xóa lịch sử")}</div>
      <div class="no-scrollbar mt-4 flex gap-4 overflow-x-auto">{seen}</div>
    </section>
  </main>
</div>
{footer()}"""
    return out("ShopNexus", body)


# ------------------------------------------------------------------ search --
def search():
    def group(t, inner, first=False):
        return f'<div class="{"" if first else "border-t bd"} px-4 py-4"><p class="text-[13px] font-medium">{t}</p><div class="mt-2">{inner}</div></div>'

    def check(label, n, on=False):
        box = (f'<span class="grid h-4 w-4 place-items-center rounded-[4px] bg-brand text-white">{ri("check-line", 12)}</span>' if on
               else '<span class="h-4 w-4 rounded-[4px] shadow-[inset_0_0_0_1.5px_#C4C4BF]"></span>')
        return f'<label class="row -mx-2 flex h-8 items-center gap-2.5 rounded-[6px] px-2 text-[14px]">{box}<span class="flex-1">{label}</span><span class="meta">{n}</span></label>'
    bars = "".join(f'<span class="flex-1 rounded-t-[2px] {"bg-brand" if 3 <= i <= 8 else "bg-[#DCDCD8]"}" style="height:{h}px"></span>' for i, h in enumerate([6, 10, 14, 22, 30, 38, 34, 26, 18, 10, 6, 4]))
    side = f"""<aside class="card sticky top-[88px] self-start overflow-hidden">
      {group("Giá", f'<div class="flex h-10 items-end gap-[3px] px-1">{bars}</div><div class="mt-2 flex items-center gap-2"><input class="btn-o h-9 w-full rounded-[8px] px-2.5 text-[13px] outline-none" value="0 ₫"><span class="mute">–</span><input class="btn-o h-9 w-full rounded-[8px] px-2.5 text-[13px] outline-none" value="8.000.000 ₫"></div><p class="meta mt-2">Đa số tin từ 6,5 đến 7,9 tr</p>', True)}
      {group("Hãng", check("Dell", 11, True) + check("Apple", 9, True) + check("Lenovo", 8) + check("HP", 6) + check("ASUS", 4) + link("brand-more", "mt-1 block text-[13px] mute hover:underline", "Thêm 6 hãng"))}
      {group("Tình trạng", check("Mới", 3) + check("Như mới", 41, True) + check("Đã dùng", 82))}
      {group("Khoảng cách", '<div class="grid grid-cols-4 gap-1 rounded-[8px] bg-soft p-0.5 text-center text-[13px]">' + "".join(f'<span class="rounded-[6px] py-1.5 {"bg-white font-medium shadow-[0_1px_2px_rgb(20_20_19/.06)]" if k == "10 km" else "mute"}">{k}</span>' for k in ["2 km", "5 km", "10 km", "Mọi nơi"]) + "</div>")}
      {group("Khác", check("Trả giá được", 98) + check("Người bán đã xác minh", 74))}
    </aside>"""
    rows = [(p, pr, t, c, km, a, ago) for (p, pr, t, c, km, a), ago in zip(LAPTOPS + LAPTOPS[:4], ["12 phút", "1 giờ", "2 giờ", "3 giờ", "5 giờ", "1 ngày", "1 ngày", "2 ngày"] * 2)]
    grid = listing_cards(rows, 0, saved=(1,))
    chips = "".join(f'<span class="flex h-8 items-center gap-1 rounded-full bg-white pl-3 pr-1.5 text-[13px] shadow-[inset_0_0_0_1px_#DCDCD8]">{t}<button type="button" class="grid h-5 w-5 place-items-center rounded-full mute row" aria-label="Bỏ {t}">{ri("close-line", 13)}</button></span>'
                    for t in ["Dưới 8 tr", "Dell", "Apple", "Như mới", "Trong 10 km"])
    tabs = "".join(f'<span class="tab {"on" if i == 0 else ""}">{t}</span>' for i, t in enumerate(["Phù hợp nhất", "Mới đăng", "Giá thấp", "Gần nhất"]))
    pages = "".join(f'<span class="grid h-9 min-w-9 place-items-center rounded-[10px] px-2 text-[14px] {"bg-brand text-white" if n == "1" else "row"}">{n}</span>' for n in ["1", "2", "3", "…", "11"])
    body = f"""{header("laptop dưới 8 triệu")}
<div class="mx-auto pt-6 {S['wrap']}">
  <p class="meta">{link("s-b1", "hover:underline", "Khám phá")} / {link("s-b2", "hover:underline", "Máy tính")} / Laptop</p>
  <div class="mt-2 flex items-end justify-between">
    <div><h1 class="text-[28px] font-semibold leading-9 tracking-[-0.02em]">Laptop dưới 8 triệu</h1><p class="mt-1 text-[14px] mute">126 tin · 9 tin mới hôm nay</p></div>
    <button type="button" class="btn-o flex h-9 items-center gap-1.5 rounded-[10px] px-3.5 text-[14px] font-medium">{ri("bookmark-line", 16)}Lưu tìm kiếm</button>
  </div>
  <div class="mt-6 grid grid-cols-[256px_1fr] gap-8">
    {side}
    <main class="min-w-0">
      <div class="flex flex-wrap items-center gap-2">{chips}{link("clear", "ml-1 text-[13px] mute hover:underline", "Xóa hết")}</div>
      <div class="mt-4 flex items-center justify-between border-b bd"><div class="flex gap-6 text-[14px]">{tabs}</div><p class="meta pb-2">1–16 trong 126</p></div>
      <div class="mt-5 grid grid-cols-4 gap-4">{grid}</div>
      <div class="mt-10 flex items-center justify-center gap-1">{pages}{link("next", "btn-o ml-2 flex h-9 items-center gap-1 rounded-[10px] px-3 text-[14px]", "Trang sau" + ri("arrow-right-s-line", 16))}</div>
    </main>
  </div>
</div>
{footer()}"""
    return out("Laptop dưới 8 triệu · ShopNexus", body)


# ------------------------------------------------------------------ detail --
DESC = ["Mình dùng từ 2022, máy zin chưa sửa chữa, Face ID nhạy.",
        "Viền có 2 vết xước nhỏ, mặt lưng đẹp vì luôn đeo ốp. Đổi máy nên bán lại.",
        "Xem máy buổi tối sau 18h, hoặc giao COD."]
REVIEWS = [("Hoàng Nam", "1500648767791-00dcc994a43e", 5, "Máy đúng như mô tả, pin chuẩn. Giao nhanh, bạn bán dễ thương.", "AirPods Pro 2 · 10/2026"),
           ("Thu Hà", "1544005313-94ddf0286df2", 5, "Hỏi gì trả lời nấy, cho xem máy kỹ trước khi nhận.", "iPad Air 4 · 09/2026")]


def section(title, inner, aside=""):
    return f'<section class="card p-6"><div class="flex items-center justify-between"><h2 class="text-[17px] font-semibold">{title}</h2>{aside}</div><div class="mt-4">{inner}</div></section>'


def detail():
    thumbs = "".join(f'<img src="{p}" alt="" class="aspect-square w-full rounded-[10px] object-cover {"ring-2 ring-[#066A61] ring-offset-2 ring-offset-[#F7F7F5]" if i == 0 else "opacity-90"}">' for i, p in enumerate(PHOTOS))
    specs = "".join(f'<div class="flex justify-between border-b bd py-2.5 text-[14px]"><dt class="mute">{k}</dt><dd class="font-medium">{v}</dd></div>' for k, v in SPECS)
    grades = "".join(f'<div class="flex-1 rounded-[8px] px-3 py-2 {"bg-brand text-white" if on else "mute"}"><p class="text-[14px] font-medium">{t}</p><p class="text-[12.5px] {"text-white/70" if on else ""}">{d}</p></div>'
                     for t, d, on in [("Mới", "Chưa dùng", False), ("Như mới", "Vết rất nhỏ, soi gần mới thấy", True), ("Đã dùng", "Có vết dùng", False)])
    stars = lambda n: f'<span class="flex text-[#E0A23B]">{"".join(ri("star-fill", 13) for _ in range(n))}</span>'
    reviews = "".join(f"""<div class="flex gap-3 {"border-t bd pt-4" if i else ""}">
        <img src="{img(f, 72, 72)}" alt="" class="h-9 w-9 rounded-full object-cover">
        <div class="min-w-0 flex-1"><p class="flex items-center gap-2 text-[14px] font-medium">{n}{stars(st)}</p>
          <p class="mt-1 text-[14px] leading-6">{t}</p><p class="meta mt-1">{item}</p></div>
      </div>""" for i, (n, f, st, t, item) in enumerate(REVIEWS))
    asks = "".join(f'<button type="button" class="row -mx-2 flex h-10 items-center justify-between rounded-[8px] px-2 text-left text-[14px]">{q}{ri("arrow-right-line", 15, "mute")}</button>'
                   for q in ["Máy còn không bạn?", "Có hộp và hóa đơn không?", "Bớt chút được không?"])
    cod = "".join(f'<li class="flex items-center gap-2 text-[13.5px]">{ri("check-line", 15, "text-[#066A61]")}{t}</li>'
                  for t in ["Trả tiền khi nhận hàng", "Mở hàng xem trước khi trả", "Không ưng thì từ chối nhận"])
    others = "".join(f'<div class="min-w-0"><img src="{img(p, 200, 200)}" alt="" class="aspect-square w-full rounded-[10px] object-cover"><p class="num mt-1 text-[13px] font-semibold">{pr}</p></div>'
                     for p, pr in [("1592899677977-9c10ca588bbd", "15,9 tr ₫"), ("1505740420928-5e560c06d30e", "3,2 tr ₫"), ("1611186871348-b1ce696e52c9", "11,5 tr ₫")])
    rows = ago_rows(LISTINGS)
    similar = listing_cards(rows[:5], 0)
    body = f"""{header()}
<div class="mx-auto pt-5 {S['wrap']}">
  <div class="flex items-center justify-between">
    <p class="meta">{link("d-b1", "hover:underline", "Khám phá")} / {link("d-b2", "hover:underline", "Điện thoại")} / {link("d-b3", "hover:underline", "iPhone")} / iPhone 13 Pro</p>
    <div class="flex gap-1">
      {''.join(f'<button type="button" class="row flex h-8 items-center gap-1.5 rounded-[8px] px-2.5 text-[13px] mute">{ri(ic, 15)}{t}</button>' for ic, t in [("heart-line", "Lưu"), ("share-line", "Chia sẻ"), ("flag-line", "Báo cáo")])}
    </div>
  </div>
  <div class="mt-3 grid grid-cols-[1fr_380px] gap-8">
    <main class="flex min-w-0 flex-col gap-4">
      <div class="card p-2">
        <div class="relative overflow-hidden rounded-[11px]"><img src="{PHOTOS[0]}" alt="" class="aspect-[4/3] w-full object-cover">
          <span class="absolute bottom-3 left-3 rounded-full bg-black/55 px-2.5 py-1 text-[12px] font-medium text-white">1 / {len(PHOTOS)}</span>
          <button type="button" class="absolute bottom-3 right-3 flex h-8 items-center gap-1.5 rounded-[8px] bg-white/90 px-2.5 text-[13px] font-medium">{ri("fullscreen-line", 15)}Xem toàn màn hình</button></div>
        <div class="mt-2 grid grid-cols-6 gap-2 p-1">{thumbs}</div>
      </div>
      {section("Mô tả", f'<div class="flex max-w-[640px] flex-col gap-2 text-[15px] leading-7">{"".join(f"<p>{d}</p>" for d in DESC)}</div><p class="meta mt-5 flex gap-4"><span>Mã tin 18234</span><span>Đăng 2 giờ trước</span><span>318 lượt xem</span><span>12 người lưu</span></p>')}
      {section("Tình trạng", f'<div class="flex gap-1 rounded-[10px] bg-soft p-1">{grades}</div><p class="mt-3 text-[14px] mute">Người bán ghi: 2 vết xước nhỏ ở viền, có trong ảnh 3.</p>')}
      {section("Thông số", f'<dl class="grid grid-cols-2 gap-x-10">{specs}</dl>')}
      {section("Đánh giá về Tuấn Kiệt", f'<div class="flex flex-col gap-4">{reviews}</div>', f'<p class="flex items-center gap-1.5 text-[14px]">{ri("star-fill", 15, "text-[#E0A23B]")}<span class="font-semibold">4,9</span><span class="mute">· 32 đánh giá</span></p>')}
    </main>

    <aside class="sticky top-[88px] flex flex-col gap-4 self-start">
      <div class="card p-6">
        <p class="flex items-center gap-1.5 meta"><span class="rounded-[6px] bg-[#E9F7F0] px-1.5 py-0.5 font-medium text-[#0B6B5F]">Như mới</span>2,1 km · 2 giờ trước</p>
        <h1 class="mt-3 text-[22px] font-semibold leading-7 tracking-[-0.01em]">{escape(TITLE)}</h1>
        <p class="num mt-3 text-[30px] font-semibold leading-9 tracking-[-0.02em]">5.200.000 ₫</p>
        <p class="meta mt-1">Tin giống vậy: 4,9 – 5,6 tr ₫</p>
        <div class="mt-5 flex flex-col gap-2">
          <button type="button" class="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-brand text-[15px] font-medium text-white">{ri("chat-3-line", 18)}Nhắn tin</button>
          <button type="button" class="btn-o flex h-11 items-center justify-center gap-2 rounded-[10px] text-[15px] font-medium">{ri("price-tag-3-line", 18, "text-[#924628]")}Trả giá</button>
        </div>
        <ul class="mt-5 flex flex-col gap-2 rounded-[12px] bg-soft p-3.5">{cod}</ul>
        <p class="meta mt-5">Hỏi nhanh</p>
        <div class="mt-1 flex flex-col">{asks}</div>
      </div>
      <div class="card p-5">
        <div class="flex items-center gap-3">
          <img src="{img(SELLERS[0][1], 96, 96)}" alt="" class="h-11 w-11 rounded-full object-cover">
          <div class="min-w-0 flex-1"><p class="flex items-center gap-1 text-[15px] font-medium">Tuấn Kiệt{ri("verified-badge-fill", 16, "text-[#066A61]")}</p><p class="meta">Tham gia 2023 · Bình Thạnh</p></div>
          {link("seller", "btn-o flex h-8 items-center rounded-[8px] px-3 text-[13px] font-medium", "Xem trang")}
        </div>
        <div class="mt-4 grid grid-cols-3 divide-x divide-[#ECECE9] rounded-[10px] border bd text-center">
          {''.join(f'<div class="py-2.5"><p class="num text-[15px] font-semibold">{v}</p><p class="meta">{l}</p></div>' for v, l in [("4,9", "32 đánh giá"), ("14", "đã bán"), ("10 phút", "trả lời")])}
        </div>
        <p class="meta mt-4">14 tin khác</p>
        <div class="mt-2 grid grid-cols-3 gap-2">{others}</div>
      </div>
    </aside>
  </div>

  <section class="mt-14"><div class="flex items-center justify-between"><h2 class="text-[17px] font-semibold">Tin tương tự</h2>{link("sim-all", "text-[13px] mute hover:underline", "Xem tất cả")}</div>
    <div class="mt-4 grid grid-cols-5 gap-4">{similar}</div></section>
</div>
{footer()}"""
    return out(f"{TITLE} · ShopNexus", body)


if __name__ == "__main__":
    for name, fn in [("home", home), ("search", search), ("detail", detail)]:
        with open(os.path.join(OUT, f"quiet-k2-{name}.html"), "w") as f:
            f.write(fn())
        print("wrote k2", name)
