"""The J ("Kính mờ") kit: what every J page shares. A mesh-gradient wash with
film grain behind the top of the page, a translucent blurred header with no
border or shadow, generous corners (cards 22 px, panels 24 px, pills
elsewhere), soft hairline borders, tight 600-weight display type, a sliding
segmented control and the listing card. Chosen 2026-11-17 for the whole site.

Page builders import from here: build_j.py (Tìm kiếm, Trang chủ),
build_j_public.py, build_j_flows.py, build_j_account.py and build_j_orders.py.
"""
from html import escape

from build import a
from build_account import ME
from build_chat_cod import PHASES
from build_pages import QUERY_PHOTO
from common import LOGO, MONEY, head, icon, img, split_price, where

# The signed-in buyer on every signed-in page.
AVATAR = ME["photo"]

GRAIN = ("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'>"
         "<filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/>"
         "<feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .55 0'/></filter>"
         "<rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")

CSS = """
  :root { --bg: #F5F8F7; --ink: #121817; --line: rgb(18 24 23 / .07); --glass: rgb(255 255 255 / .62); }
  html, body { background: var(--bg); }
  .ink { color: var(--ink); }
  .line { border-color: var(--line); }
  .tight { letter-spacing: -0.02em; } .tighter { letter-spacing: -0.035em; }
  .num { font-variant-numeric: tabular-nums; }
  /* the wash: three soft blobs over the page colour, fading out below the fold */
  .mesh { position: absolute; inset: 0 0 auto 0; height: 640px; z-index: 0; pointer-events: none;
    background:
      radial-gradient(42% 70% at 8% 0%, rgb(6 106 97 / .55), transparent 70%),
      radial-gradient(38% 60% at 46% 10%, rgb(133 213 201 / .55), transparent 72%),
      radial-gradient(34% 62% at 92% 4%, rgb(255 219 207 / .9), transparent 70%),
      radial-gradient(40% 50% at 70% 40%, rgb(199 230 224 / .7), transparent 75%);
    -webkit-mask: linear-gradient(#000 55%, transparent); mask: linear-gradient(#000 55%, transparent); }
  .mesh::after { content: ""; position: absolute; inset: 0; background-image: url("GRAIN"); opacity: .22; mix-blend-mode: overlay; }
  .glass { background: var(--glass); -webkit-backdrop-filter: blur(18px) saturate(1.4); backdrop-filter: blur(18px) saturate(1.4); }
  .glass-edge { box-shadow: inset 0 0 0 1px rgb(255 255 255 / .7); }
  .soft { box-shadow: 0 1px 2px rgb(18 24 23 / .04), 0 8px 24px -8px rgb(18 24 23 / .10); }
  .glow { box-shadow: 0 0 0 1px rgb(255 255 255 / .9), 0 12px 32px -10px rgb(6 80 73 / .30); }
  .grad-text { background: linear-gradient(100deg, #005049 0%, #0E8A7D 45%, #C0623E 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .grad-num { background: linear-gradient(160deg, #066A61, #5CC2B4); -webkit-background-clip: text; background-clip: text; color: transparent; }
  .card { transition: transform 420ms var(--spatial), box-shadow 300ms var(--effects); }
  .card:hover { transform: translateY(-4px); box-shadow: 0 16px 32px -14px rgb(18 24 23 / .22); }
  .card img { transition: transform 600ms var(--spatial); } .card:hover img { transform: scale(1.04); }
  /* segmented control: a white pill slides under the selected item */
  .seg { position: relative; display: inline-flex; padding: 4px; border-radius: 9999px; }
  .seg > .thumb { position: absolute; top: 4px; bottom: 4px; border-radius: 9999px; background: #fff;
    box-shadow: 0 1px 2px rgb(18 24 23 / .08), 0 2px 8px rgb(18 24 23 / .06); transition: left 420ms var(--spatial), width 420ms var(--spatial); }
  .seg > button { position: relative; z-index: 1; height: 32px; padding: 0 14px; white-space: nowrap; border-radius: 9999px; }
  .seg > button[aria-selected="true"] { color: var(--ink); }
  .nav-link[aria-current="page"] { color: var(--ink); background: rgb(255 255 255 / .85); box-shadow: 0 1px 2px rgb(18 24 23 / .06); }
""".replace("GRAIN", GRAIN.replace('"', "%22"))

SEG_JS = """<script>
// Slide each segmented control's thumb under its selected item, and move it on click.
addEventListener('DOMContentLoaded', () => document.querySelectorAll('.seg').forEach(seg => {
  const thumb = seg.querySelector('.thumb');
  const put = b => { thumb.style.left = b.offsetLeft + 'px'; thumb.style.width = b.offsetWidth + 'px'; };
  const btns = [...seg.querySelectorAll('button')];
  put(btns.find(b => b.getAttribute('aria-selected') === 'true') || btns[0]);
  btns.forEach(b => b.addEventListener('click', () => { btns.forEach(x => x.setAttribute('aria-selected', x === b)); put(b); }));
}));
</script>"""

NAV = ["Khám phá", "Danh mục", "Bản đồ", "Cách mua"]

# Where each link opens, among the mockups (the rest stay hash placeholders).
HREF = {"Khám phá": "j-home.html", "Danh mục": "categories.html", "Bản đồ": "map.html", "Cách mua": "how.html",
        "Cách mua bằng COD": "how.html", "Cách đăng tin": "sell.html", "Gói người bán": "plans.html", "Điểm uy tín": "reputation.html",
        "Trợ giúp và an toàn": "help.html", "Yêu cầu hỗ trợ": "support.html", "Quy định đăng tin": "listing-rules.html",
        "Điều khoản": "terms.html", "Chính sách bảo mật": "privacy.html", "Bảo mật và xác minh": "security.html",
        "Địa chỉ": "addresses.html", "Hoàn thiện hồ sơ": "profile-tasks.html",
        "me": "account.html", "listings": "my-listings.html", "orders": "orders.html", "sales": "ship.html", "saved": "saved.html",
        "messages": "messages.html", "notifications": "notifications.html", "cod": "cod-setup.html", "support": "support.html"}


def seg(items, sel=0, cls="", size="text-label-l"):
    btns = "".join(f'<button type="button" class="{size} text-on-surface-variant" aria-selected="{"true" if i == sel else "false"}">{t}</button>' for i, t in enumerate(items))
    return f'<div class="seg {cls}"><span class="thumb"></span>{btns}</div>'


def header(active: int | None = 0, search: str | None = None, signed_in=True, photo=QUERY_PHOTO):
    """Translucent, blurred, no border or shadow. active: index into NAV, or None
    on pages outside the four destinations. search: None (no field) or the query
    text; photo: the picture at the start of that field. signed_in=False drops
    Tin nhắn and the avatar for "Đăng nhập"."""
    nav = "".join(a(f"nav-{i}", "nav-link flex h-9 items-center rounded-full px-3.5 text-label-l text-on-surface-variant hover:text-on-surface", t, HREF[t])
                  .replace("<a ", '<a aria-current="page" ' if i == active else "<a ", 1) for i, t in enumerate(NAV))
    if search is not None:
        field = f"""<div class="mx-6 flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-full bg-white pl-1.5 pr-1.5 glow">
      <img src="{img(photo, 64, 64)}" alt="" class="h-8 w-8 rounded-full object-cover">
      <span class="min-w-0 flex-1 truncate text-body-l ink">{escape(search)}</span>
      <button type="button" class="state grid h-8 w-8 place-items-center rounded-full text-on-surface-variant" aria-label="Tìm bằng ảnh">{icon("photo-camera-outline-rounded", 20)}</button>
      <button type="button" class="state flex h-8 items-center gap-1 rounded-full bg-primary pl-3 pr-4 text-label-l text-on-primary">{icon("search-rounded", 18)}Tìm</button>
    </div>"""
    else:
        field = '<span class="flex-1"></span>'
    messages = a("messages", "state relative grid h-10 w-10 place-items-center rounded-full text-on-surface-variant", icon("chat-outline-rounded", 22) + '<span class="absolute right-0.5 top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-error px-1 text-label-s text-on-error ring-2 ring-white">3</span>') if signed_in else ""
    account = (f'<img src="{img(AVATAR, 80, 80)}" alt="Tài khoản" class="ml-2 h-9 w-9 rounded-full object-cover ring-2 ring-white">' if signed_in
               else '<button type="button" class="state ml-1 h-10 rounded-full px-4 text-label-l ink">Đăng nhập</button>')
    return f"""<header class="glass sticky top-0 z-30">
  <div class="mx-auto flex h-16 max-w-[1360px] items-center px-8">
    {a("brand", "flex items-center gap-2 pr-6", f'<img src="{LOGO}" alt="ShopNexus" class="h-8 w-8"><span class="text-title-l font-semibold tight ink">ShopNexus</span>', "#home")}
    <nav class="flex items-center gap-0.5">{nav}</nav>
    {field}
    <div class="flex items-center gap-1">
      {messages}
      <button type="button" class="state ml-2 flex h-10 items-center gap-1.5 rounded-full bg-[var(--ink)] pl-3.5 pr-4 text-label-l text-white">{icon("add-rounded", 18)}Đăng tin</button>
      {account}
    </div>
  </div>
</header>"""


def footer():
    cols = [("Khám phá", ["Dành cho bạn", "Bản đồ", "Danh mục", "Mới nhất"]), ("Mua và bán", ["Cách mua bằng COD", "Cách đăng tin", "Gói người bán", "Điểm uy tín"]),
            ("Hỗ trợ", ["Trợ giúp và an toàn", "Yêu cầu hỗ trợ", "Quy định đăng tin", "Điều khoản"])]
    col_html = "".join(f'<div><p class="text-label-m text-on-surface-variant">{t}</p><ul class="mt-3 flex flex-col gap-2 text-body-m ink">'
                       + "".join(f"<li>{a(f'f-{t[:3]}-{i}', 'hover:text-primary', l, HREF.get(l))}</li>" for i, l in enumerate(ls)) + "</ul></div>" for t, ls in cols)
    return f"""<footer class="mx-auto mt-12 max-w-[1360px] px-8 pb-8">
  <div class="grid grid-cols-[1.6fr_1fr_1fr_1fr] gap-10 rounded-[28px] border line bg-white px-10 py-9">
    <div>
      <div class="flex items-center gap-2"><img src="{LOGO}" alt="ShopNexus" class="h-8 w-8"><span class="text-title-l font-semibold tight ink">ShopNexus</span></div>
      <p class="mt-3 max-w-[320px] text-body-m text-on-surface-variant">Đồ cũ giá tốt, xem hàng rồi mới trả. {MONEY["no_hold"]}</p>
    </div>
    {col_html}
  </div>
  <div class="flex justify-between px-4 pt-4 text-body-s text-on-surface-variant"><span>© 2026 ShopNexus</span><span>TP.HCM · Hà Nội · Đà Nẵng</span></div>
</footer>"""


def price(p, size="text-[18px] leading-6"):
    num, unit = split_price(p)
    return (f'<span class="num whitespace-nowrap font-semibold tight ink {size}">{num}'
            f'<span class="ml-0.5 text-body-s font-medium text-on-surface-variant">{unit.strip()}</span></span>')


def card(item, i, saved=False, ratio="1 / 1"):
    """White card, 22 px, soft line; photo at 16 px inside an 8 px inset."""
    photo, p, title, cond, km, area, rating = item[:7]
    tail, note = item[7], item[8]
    posted = None if isinstance(tail, list) else tail
    facts = tail if isinstance(tail, list) else None
    place = where(km, area)
    note_html = (f'<span class="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-label-m text-tertiary backdrop-blur">'
                 f'{icon("auto-awesome-rounded", 13)}{note}</span>') if note else ""
    facts_html = ('<div class="mt-1.5 flex flex-wrap gap-1">' + "".join(f'<span class="rounded-full bg-surface-container-low px-2 py-0.5 text-label-s text-on-surface-variant">{f}</span>' for f in facts[:2]) + "</div>") if facts else ""
    meta = f"{cond} · {place}" + (f" · {posted}" if posted else "")
    return f"""<article class="card min-w-0 rounded-[22px] border line bg-white p-2">
  <div class="relative overflow-hidden rounded-[16px] bg-surface-container-high" style="aspect-ratio: {ratio}">
    <img src="{img(photo, 480, 480)}" alt="{escape(title)}" class="h-full w-full object-cover">
    <button type="button" class="state absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/85 backdrop-blur {"text-primary" if saved else "text-on-surface"}" aria-label="Lưu tin">{icon("favorite-rounded" if saved else "favorite-outline-rounded", 18)}</button>
    {note_html}
  </div>
  <div class="px-1.5 pb-1.5 pt-2.5">
    <div class="flex items-baseline justify-between gap-2">{price(p)}<span class="flex shrink-0 items-center gap-0.5 text-label-m text-on-surface-variant">{icon("star-rounded", 13, "text-[#E0A23B]")}{rating}</span></div>
    <h3 class="mt-0.5 line-clamp-2 text-body-m ink">{escape(title)}</h3>
    {facts_html}
    <p class="mt-1.5 flex items-center gap-1 text-body-s text-on-surface-variant">{icon("near-me-outline-rounded", 13)}{meta}</p>
  </div>
</article>"""


def page(title, body):
    return head(title, CSS) + f"""<body>
<div id="app" class="relative min-h-screen overflow-hidden font-sans ink">
<div class="mesh"></div>
<div class="relative z-10">
{body}
</div>
</div>
{SEG_JS}
</body>
</html>"""


# ------------------------------------------------------------ page pieces --
PANEL = "rounded-[24px] border line bg-white"
H2 = "text-[26px] font-semibold leading-8 tighter ink"


def panel(inner, cls="p-5"):
    return f'<div class="{PANEL} {cls}">{inner}</div>'


BTN_LOOK = {"ink": "bg-[var(--ink)] text-white", "primary": "bg-primary text-on-primary",
            "tonal": "bg-secondary-container text-on-secondary-container", "ghost": "text-primary",
            "line": "border line bg-white ink"}


def btn_cls(kind="ink", size="md"):
    """kind: ink (the page's main action), primary, tonal, ghost, line. size: md 40 px, lg 44 px."""
    dims = "h-11 gap-2 px-5" if size == "lg" else "h-10 gap-1.5 px-4"
    return f"state flex shrink-0 items-center justify-center whitespace-nowrap rounded-full text-label-l {dims} {BTN_LOOK[kind]}"


def btn(label, ic=None, kind="ink", cls="", size="md"):
    return f'<button type="button" class="{btn_cls(kind, size)} {cls}">{icon(ic, 18) if ic else ""}{label}</button>'


def money_line(key, ic="info-outline-rounded", small=False):
    """One MONEY sentence, word for word, with its icon."""
    if small:
        return f'<p class="flex gap-2 text-body-s text-on-surface-variant">{icon(ic, 16, "mt-px shrink-0 text-primary")}<span>{MONEY[key]}</span></p>'
    return f'<p class="flex gap-2 text-body-m text-on-surface-variant">{icon(ic, 17, "mt-0.5 shrink-0 text-primary")}<span>{MONEY[key]}</span></p>'


def crumbs(*parts, tail="", cls=""):
    """Breadcrumbs: every part but the last is a link. tail sits at the right end."""
    links = "".join(a(f"crumb-{i}", "hover:text-on-surface", p) + icon("chevron-right-rounded", 16, "text-outline") for i, p in enumerate(parts[:-1]))
    return (f'<nav class="flex items-center gap-1 text-body-s text-on-surface-variant {cls}">{links}<span class="ink">{parts[-1]}</span>'
            f'{"<span class=\"flex-1\"></span>" + tail if tail else ""}</nav>')


def section_title(text, link=None, link_id="more"):
    more = a(link_id, "text-label-l text-primary hover:underline", link) if link else ""
    return f'<div class="flex items-baseline justify-between"><h2 class="{H2}">{text}</h2>{more}</div>'


def page_title(text, meta="", end=""):
    meta_html = f'<p class="mt-1.5 text-body-m text-on-surface-variant">{meta}</p>' if meta else ""
    return f"""<div class="flex items-end justify-between gap-6">
  <div><h1 class="text-[40px] font-semibold leading-[44px] tighter ink">{text}</h1>{meta_html}</div>
  <div class="flex items-center gap-2">{end}</div>
</div>"""


def switch(on=True):
    return (f'<span class="relative h-7 w-12 shrink-0 rounded-full {"bg-primary" if on else "bg-surface-container-highest"}" role="switch" aria-checked="{str(on).lower()}">'
            f'<span class="absolute top-1 h-5 w-5 rounded-full bg-white shadow {"right-1" if on else "left-1"}"></span></span>')


def drop(t, n=None, on=False):
    """A filter dropdown pill; n is how many values are picked."""
    tone = "bg-[var(--ink)] text-white border-transparent" if on else "line bg-white/70 text-on-surface-variant"
    badge = f'<span class="num grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-label-s text-on-primary">{n}</span>' if n else ""
    return f'<button type="button" class="state flex h-9 items-center gap-1.5 rounded-full border {tone} pl-3.5 pr-2 text-label-l">{t}{badge}{icon("keyboard-arrow-down-rounded", 16)}</button>'


# ------------------------------------------------------ the four deal steps --
# PHASES is the app's phase_steps. stepper() is the labelled pill track (guides,
# a deal in progress); phase_bar() and phase_track() are the order views: dots on
# an order row, and dots with labels and times across an order's hero card.
def stepper(current, compact=False):
    out = []
    for i, (ic, label) in enumerate(PHASES):
        if i < current:
            cls, ic2 = "text-primary", ic.replace("-outline", "")
        elif i == current:
            cls, ic2 = "bg-white ink soft", ic
        else:
            cls, ic2 = "text-on-surface-variant/70", ic
        pad = "h-8 gap-1 px-2.5 text-label-m" if compact else "h-9 gap-1.5 px-3.5 text-label-l"
        out.append(f'<span class="flex items-center whitespace-nowrap rounded-full {pad} {cls}">{icon(ic2, 15 if compact else 17)}{label}</span>')
        if i < 3:
            out.append(f'<span class="h-px {"w-2" if compact else "w-4"} {"bg-primary/50" if i < current else "bg-black/10"}"></span>')
    return f'<div class="glass glass-edge flex w-fit items-center rounded-full p-1">{"".join(out)}</div>'


def phase_dot(i, current, s=26):
    ic, label = PHASES[i]
    if i < current:
        return f'<span class="grid shrink-0 place-items-center rounded-full bg-primary text-on-primary" style="width:{s}px;height:{s}px" aria-label="{label}: xong">{icon("check-rounded", int(s * 0.6))}</span>'
    if i == current:
        return (f'<span class="grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#066A61] to-[#5CC2B4] text-white ring-4 ring-primary/15" '
                f'style="width:{s}px;height:{s}px" aria-label="Bước {i + 1}/4 · {label}">{icon(ic, int(s * 0.58))}</span>')
    return f'<span class="grid shrink-0 place-items-center rounded-full bg-surface-container-high text-on-surface-variant" style="width:{s}px;height:{s}px" aria-label="{label}">{icon(ic, int(s * 0.55))}</span>'


def phase_bar(current):
    out = []
    for i in range(4):
        out.append(phase_dot(i, current, 22))
        if i < 3:
            out.append(f'<span class="h-[3px] w-4 rounded-full {"bg-primary" if i < current else "bg-surface-container-high"}"></span>')
    return f'<div class="flex items-center gap-1" role="img" aria-label="Bước {min(current + 1, 4)}/4">{"".join(out)}</div>'


def phase_track(current, times):
    cols = []
    for i, (_, label) in enumerate(PHASES):
        line = "" if i == 3 else f'<span class="absolute left-[calc(50%+22px)] right-[calc(-50%+22px)] top-[17px] h-[3px] rounded-full {"bg-primary" if i < current else "bg-surface-container-high"}"></span>'
        cols.append(f"""<li class="relative flex w-[112px] flex-col items-center text-center">{line}
  <span class="grid h-9 place-items-center">{phase_dot(i, current, 34)}</span>
  <span class="mt-2 text-label-l {"ink" if i <= current else "text-on-surface-variant"}">{label}</span>
  <span class="num h-4 text-body-s text-on-surface-variant">{times[i]}</span>
</li>""")
    return f'<ol class="flex" aria-label="Tiến trình">{"".join(cols)}</ol>'


# ------------------------------------------------------------ account nav --
# Every "Tôi" page. Counts are what waits in each place, and match the pages:
# 5 tin đang bán, 2 đơn COD đang mở, 1 đơn bán chờ tạo đơn, 13 tin đã lưu,
# 3 tin nhắn và 3 thông báo chưa đọc, 1 yêu cầu hỗ trợ có trả lời.
ACCOUNT_NAV = [("me", "person-outline-rounded", "Tôi", None), ("listings", "storefront-outline-rounded", "Tin của bạn", "5"),
               ("orders", "receipt-long-outline-rounded", "Đơn hàng", "2"), ("sales", "inventory-2-outline-rounded", "Đơn bán", "1"),
               ("saved", "favorite-outline-rounded", "Đã lưu", "13"), ("messages", "chat-outline-rounded", "Tin nhắn", "3"),
               ("notifications", "notifications-outline-rounded", "Thông báo", "3"), ("cod", "local-shipping-outline-rounded", "Thiết lập giao COD", None),
               ("support", "help-outline-rounded", "Hỗ trợ", "1")]


def account_nav(active):
    """Who you are, then the account's pages; the current one is an ink pill."""
    items = []
    for k, ic, t, n in ACCOUNT_NAV:
        on = k == active
        badge = f'<span class="num rounded-full {"bg-white/20" if on else "bg-surface-container-low text-on-surface-variant"} px-2 text-label-s">{n}</span>' if n else ""
        items.append(a(f"acc-{k}", f"flex h-10 items-center gap-3 rounded-full px-3 text-label-l {'bg-[var(--ink)] text-white' if on else 'ink hover:bg-white/80'}",
                       f'{icon(ic.replace("-outline", "") if on else ic, 20)}<span class="flex-1">{t}</span>{badge}', HREF[k])
                     .replace("<a ", '<a aria-current="page" ' if on else "<a ", 1))
    return f"""<aside class="sticky top-[84px] self-start">
  <div class="glass glass-edge flex items-center gap-3 rounded-[24px] p-3">
    <img src="{img(ME["photo"], 176, 176)}" alt="" class="h-11 w-11 shrink-0 rounded-full object-cover ring-2 ring-white">
    <div class="min-w-0"><p class="flex items-center gap-1 truncate text-title-s ink">{ME["name"]}{icon("verified-rounded", 15, "text-primary")}</p>
      <p class="flex items-center gap-1 text-body-s text-on-surface-variant">{icon("star-rounded", 13, "text-[#E0A23B]")}4,8 · 14 đã bán</p></div>
  </div>
  <nav class="mt-3 flex flex-col gap-0.5" aria-label="Tài khoản">{"".join(items)}</nav>
</aside>"""


# ------------------------------------------------------- the buyer's data --
# One address book and one task list, so Tôi, Địa chỉ, Hoàn thiện hồ sơ and
# Thiết lập giao COD agree. icon, label, street, ward, default, delivered.
ADDRESS_BOOK = [("home-outline-rounded", "Nhà", "12 Nguyễn Gia Trí", "Phường Bình Thạnh, TP.HCM", True, "6 đơn đã giao"),
                ("work-outline-rounded", "Công ty", "Tầng 8, 2 Hải Triều", "Phường Sài Gòn, TP.HCM", False, "2 đơn đã giao")]
# key, icon, title, done. The address task is done once the book has an address.
PROFILE_TASKS = [("phone", "phone-android-outline-rounded", "Số điện thoại", True),
                 ("avatar", "account-circle-outline-rounded", "Ảnh đại diện", True),
                 ("address", "home-outline-rounded", "Địa chỉ nhận hàng", bool(ADDRESS_BOOK)),
                 ("kyc", "verified-user-outline-rounded", "Xác minh danh tính", False),
                 ("cod", "local-shipping-outline-rounded", "Thiết lập giao COD", False),
                 ("bio", "edit-note-rounded", "Giới thiệu bản thân", False)]
TASKS_DONE = sum(1 for t in PROFILE_TASKS if t[3])


# ------------------------------------------------------------ small parts --
LABEL = "px-1 text-label-m uppercase tracking-[0.1em] text-on-surface-variant"


def field(label, value, *, ai=False, trail="", tall=False, ring=False, hint=""):
    """A form field: label over a soft filled box, 14 px corners, no border.
    ai: the model filled it (sparkle). ring: focused. hint: a line under it."""
    spark = icon("auto-awesome-rounded", 14, "text-primary") if ai else ""
    box = (f'<div class="flex {"min-h-[88px] items-start py-3" if tall else "h-12 items-center"} justify-between gap-3 rounded-[14px] '
           f'px-4 text-body-l ink {"bg-white ring-2 ring-primary" if ring else "bg-surface-container-low"}">{value}{trail}</div>')
    tip = f'<p class="mt-1 px-1 text-body-s text-on-surface-variant">{hint}</p>' if hint else ""
    return f'<div><p class="mb-1.5 flex items-center gap-1 text-label-l text-on-surface-variant">{label}{spark}</p>{box}{tip}</div>'


def ai_chip(t):
    """A read-back condition the model set: sparkle, removable."""
    return (f'<span class="glass glass-edge flex h-9 items-center gap-1.5 rounded-full pl-3 pr-1.5 text-label-l ink">'
            f'{icon("auto-awesome-rounded", 15, "text-primary")}{t}'
            f'<button type="button" class="state grid h-6 w-6 place-items-center rounded-full text-on-surface-variant" aria-label="Bỏ">{icon("close-rounded", 14)}</button></span>')


def search_field(text, cls="", photo=None):
    """The 56 px page search field (Danh mục, 404): placeholder or query text, photo button, Tìm."""
    lead = (f'<img src="{img(photo, 72, 72)}" alt="" class="h-9 w-9 rounded-full object-cover">' if photo
            else icon("search-rounded", 22, "text-primary"))
    return f"""<div class="flex h-14 items-center gap-3 rounded-full bg-white pl-4 pr-2 glow {cls}">
  {lead}
  <span class="min-w-0 flex-1 truncate text-body-l {"ink" if photo else "text-on-surface-variant"}">{escape(text)}</span>
  {a("photo-search", "state grid h-10 w-10 place-items-center rounded-full text-on-surface-variant", icon("photo-camera-outline-rounded", 20), "photo-search.html")}
  <button type="button" class="state h-10 rounded-full bg-primary px-6 text-label-l text-on-primary">Tìm</button>
</div>"""


def mini_row(it, i, pre="mini"):
    """A compact listing link: thumb, price, title, place."""
    return a(f"{pre}-{i}", "card flex items-center gap-3 rounded-[18px] border line bg-white p-1.5 pr-3",
             f'<img src="{img(it[0], 120, 120)}" alt="" class="h-14 w-14 shrink-0 rounded-[12px] object-cover">'
             f'<span class="min-w-0 flex-1">{price(it[1], "text-[15px] leading-5")}<span class="block truncate text-body-s ink">{escape(it[2])}</span>'
             f'<span class="block truncate text-body-s text-on-surface-variant">{where(it[4], it[5])} · {it[7]} trước</span></span>')


TRENDING = [("iPhone 13 Pro", "412", "5,3 tr"), ("MacBook Air M1", "268", "11,2 tr"), ("Xe đạp trẻ em", "190", "850 k"),
            ("Sofa 3 chỗ", "143", "3,9 tr"), ("Máy ảnh film", "96", "1,6 tr"), ("Tai nghe Sony", "121", "2,9 tr")]


def trending(n=6):
    """"Đang được tìm nhiều": title, then ranked searches with count and median price."""
    rows = "".join(a(f"trend-{i}", "flex items-center gap-3 rounded-[14px] px-2 py-1.5 text-body-m ink hover:bg-surface-container-low",
                     f'<span class="num grid h-7 w-7 place-items-center rounded-full {"bg-primary text-on-primary" if i < 3 else "bg-surface-container-low text-on-surface-variant"} text-label-m">{i + 1}</span>'
                     f'<span class="flex-1">{t}</span><span class="num text-body-s text-on-surface-variant">{c} tin</span><span class="num w-14 text-right text-label-l ink">{m}</span>')
                   for i, (t, c, m) in enumerate(TRENDING[:n]))
    return f'<p class="flex items-center gap-1.5 px-2 pb-2 pt-1 text-title-s ink">{icon("trending-up-rounded", 18, "text-primary")}Đang được tìm nhiều</p><div class="flex flex-col">{rows}</div>'


def link_rows(links, prefix):
    """Rows of icon · label · chevron, each a link: (icon, label, href)."""
    return "".join(a(f"{prefix}-{i}", "flex items-center gap-3 rounded-[14px] px-3 py-2.5 hover:bg-surface-container-low",
                     f'{icon(ic, 20, "text-on-surface-variant")}<span class="flex-1 text-body-m ink">{t}</span>{icon("chevron-right-rounded", 18, "text-on-surface-variant")}', href)
                   for i, (ic, t, href) in enumerate(links))


def summary_card(title, points, ic="summarize-outline-rounded"):
    """The teal gradient card that sums a page up: (icon, sentence) points."""
    items = "".join(f'<li class="flex gap-2.5 text-body-m text-white">{icon(pic, 18, "mt-px shrink-0 text-[#B9EDE4]")}<span>{t}</span></li>' for pic, t in points)
    return f"""<div class="rounded-[24px] p-5 text-white" style="background: linear-gradient(150deg, #005049, #0E8A7D)">
  <p class="flex items-center gap-2 text-label-l text-[#B9EDE4]">{icon(ic, 18)}{title}</p>
  <ul class="mt-3 flex flex-col gap-2.5">{items}</ul>
</div>"""
