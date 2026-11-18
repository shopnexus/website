"""Chat nhanh on Chi tiết tin: "Nhắn tin", "Trả giá" and the question chips open
a small chat on the listing page instead of sending the buyer to /tin-nhan.

    python3 tools/build_j_quickchat.py        (run from .superdesign/)

Writes three mockups:
  quickchat-dock.html    A. Hộp nổi: a 380 px box docked bottom-right, the page stays usable
  quickchat-inline.html  B. Trong khung mua: the buy panel itself turns into the chat
  quickchat-mobile.html  A on a phone: a bottom sheet over the listing

Clicking "Trả giá" in the box opens the offer tray; the expand icon goes to the
full Tin nhắn page (messages.html).
"""
import os
import re

from build import OUT, PHOTOS, PRICE, TITLE
from build_seller_map import SELLER
from common import icon, img
from build_j_public import detail

THUMB = PHOTOS[0]
NAME = SELLER["name"]

CSS = """
  .qc-bubble { border-radius: 18px; padding: 7px 12px; max-width: 82%; }
  .qc-mine { align-self: flex-end; background: #066A61; color: #fff; }
  .qc-theirs { align-self: flex-start; background: #fff; box-shadow: inset 0 0 0 1px var(--line); }
  .qc-mine.tuck { border-bottom-right-radius: 6px; } .qc-theirs.tuck { border-bottom-left-radius: 6px; }
  .qc-box { box-shadow: 0 0 0 1px rgb(255 255 255 / .8), 0 24px 60px -18px rgb(18 24 23 / .35), 0 6px 18px -8px rgb(18 24 23 / .18); }
  .qc-scroll { scrollbar-width: none; } .qc-scroll::-webkit-scrollbar { display: none; }
  .qc-tray[hidden] { display: none; }
  .qc-step[aria-pressed="true"] { background: var(--ink); color: #fff; }
  [data-offer-btn][aria-expanded="true"] { background: var(--ink); color: #fff; }
"""

JS = """<script>
// Trả giá opens the offer tray above the field; a step chip fills the amount.
document.querySelectorAll('[data-qc]').forEach(box => {
  const tray = box.querySelector('.qc-tray'), b = box.querySelector('[data-offer-btn]'), amt = box.querySelector('[data-amount]');
  if (!tray || !b) return;
  b.addEventListener('click', () => { const open = tray.hidden; tray.hidden = !open; b.setAttribute('aria-expanded', open); });
  box.querySelectorAll('.qc-step').forEach(s => s.addEventListener('click', () => {
    box.querySelectorAll('.qc-step').forEach(x => x.setAttribute('aria-pressed', x === s)); amt.textContent = s.dataset.v; }));
});
</script>"""


def ibtn(ic, label, href=None, cls="text-on-surface-variant"):
    tag = f'a id="qc-{ic}" href="{href}"' if href else 'button type="button"'
    end = "a" if href else "button"
    return f'<{tag} class="state grid h-8 w-8 place-items-center rounded-full {cls}" aria-label="{label}" title="{label}">{icon(ic, 19)}</{end}>'


def head_row(compact=False):
    """Seller, reply time and the box's own controls."""
    return f"""<div class="flex items-center gap-2.5 px-3 pt-3">
  <span class="relative"><img src="{img(SELLER["photo"], 80, 80)}" alt="" class="h-9 w-9 rounded-full object-cover">
    <span class="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-[#2E9E5B] ring-2 ring-white"></span></span>
  <div class="min-w-0 flex-1">
    <p class="flex items-center gap-1 text-title-s ink">{NAME}{icon("verified-rounded", 15, "text-primary")}</p>
    <p class="text-body-s text-on-surface-variant">Online · trả lời ~10 phút</p>
  </div>
  {ibtn("open-in-new-rounded", "Mở ở trang Tin nhắn", "#messages")}
  {"" if compact else ibtn("remove-rounded", "Thu nhỏ")}
  {ibtn("close-rounded", "Đóng")}
</div>"""


def item_row():
    return f"""<div class="mx-3 mt-2.5 flex items-center gap-2.5 rounded-[16px] bg-surface-container-low p-1.5 pr-3">
  <img src="{THUMB}" alt="" class="h-10 w-10 rounded-[12px] object-cover">
  <p class="min-w-0 flex-1 truncate text-body-m ink">{TITLE}</p>
  <p class="num text-title-s font-semibold ink">{PRICE[0]}<span class="ml-0.5 text-body-s font-medium text-on-surface-variant">₫</span></p>
</div>"""


def thread():
    return f"""<div class="qc-scroll flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-3">
  <p class="py-1 text-center text-label-m text-on-surface-variant">Hôm nay</p>
  <p class="qc-bubble qc-mine tuck text-body-m">Máy còn không bạn?</p>
  <p class="px-1 text-right text-body-s text-on-surface-variant">14:02 · Đã xem</p>
  <p class="qc-bubble qc-theirs text-body-m ink">Còn bạn nha. Pin 88%, chưa thay linh kiện gì.</p>
  <p class="qc-bubble qc-theirs tuck text-body-m ink">Có hộp, không còn hóa đơn.</p>
  <p class="px-1 text-body-s text-on-surface-variant">14:05</p>
</div>"""


def chips():
    qs = ["Xem máy ở đâu được?", "Giao COD được không?", "Có trầy không bạn?"]
    return ('<div class="qc-scroll flex gap-1.5 overflow-x-auto px-3 pb-2">'
            + "".join(f'<button type="button" class="state h-8 shrink-0 rounded-full border line bg-white px-3 text-label-m ink">{q}</button>' for q in qs)
            + "</div>")


def tray(open_=False):
    steps = [("5.000.000", "−200k"), ("4.900.000", "−300k"), ("4.700.000", "−500k")]
    step_html = "".join(f'<button type="button" class="qc-step state h-8 flex-1 rounded-full bg-white text-label-m ink" data-v="{v}" aria-pressed="{str(i == 1).lower()}">{d}</button>'
                        for i, (v, d) in enumerate(steps))
    return f"""<div class="qc-tray mx-3 mb-2 rounded-[20px] bg-tertiary-fixed/70 p-3"{"" if open_ else " hidden"}>
  <div class="flex items-center justify-between">
    <p class="text-label-l text-on-tertiary-fixed-variant">Giá bạn trả</p>
    <p class="text-body-s text-on-surface-variant">Giá đăng {PRICE[0]} ₫</p>
  </div>
  <p class="num mt-1 text-[30px] font-semibold leading-9 tighter ink"><span data-amount>4.900.000</span><span class="ml-1 text-title-m font-medium tracking-normal text-on-surface-variant">₫</span></p>
  <div class="mt-2 flex gap-1.5">{step_html}</div>
  <button type="button" class="state mt-2.5 flex h-10 w-full items-center justify-center gap-2 rounded-full bg-tertiary text-label-l text-on-tertiary">{icon("sell-outline-rounded", 18)}Gửi giá</button>
</div>"""


def composer(open_=False):
    return f"""<div class="flex items-center gap-1.5 px-2 pb-2.5">
  <button type="button" data-offer-btn aria-expanded="{str(open_).lower()}" class="state flex h-10 shrink-0 items-center gap-1 rounded-full bg-tertiary-fixed pl-2.5 pr-3 text-label-l text-on-tertiary-fixed-variant">{icon("sell-outline-rounded", 18)}Trả giá</button>
  <input placeholder="Nhắn {NAME}" aria-label="Nhắn tin cho {NAME}" class="h-10 min-w-0 flex-1 rounded-full border line bg-white px-4 text-body-m ink outline-none placeholder:text-on-surface-variant">
  <button type="button" class="state grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-on-primary" aria-label="Gửi">{icon("send-rounded", 19)}</button>
</div>"""


def body_parts(open_tray=False):
    return f"""{item_row()}{thread()}{chips()}{tray(open_tray)}{composer()}"""


def base_detail():
    """Today's listing page: the mockup's detail minus the shipping-from panel the site dropped."""
    html = detail()
    html = re.sub(r'<div class="rounded-\[24px\] border line bg-white p-4">\s*<div class="flex items-center gap-3">\s*<span class="grid h-10 w-10.*?</div>\s*</div>\s*(?=<div class="rounded-\[24px\] border line bg-white p-4">)',
                  "", html, count=1, flags=re.S)
    return html.replace("</style>", CSS + "</style>", 1)


# --------------------------------------------------------------- A. dock --
def dock():
    box = f"""<section data-qc class="qc-box glass fixed bottom-5 right-6 z-40 flex h-[520px] w-[380px] flex-col overflow-hidden rounded-[28px] bg-white/90" aria-label="Chat với {NAME}">
  {head_row()}
  {body_parts()}
</section>"""
    html = base_detail()
    # The Nhắn tin button reads as the one that opened the box.
    html = html.replace('bg-[var(--ink)] text-label-l text-white">', 'bg-[var(--ink)] text-label-l text-white ring-4 ring-primary/25">', 1)
    # inside #app, so the draft keeps one root element
    return html.replace("\n</div>\n</div>\n<script>", f"\n</div>\n{box}\n</div>\n<script>", 1).replace("</body>", JS + "</body>", 1)


# ------------------------------------------------------------ B. inline --
def inline():
    html = base_detail()
    start = html.index('<div class="mt-4 grid grid-cols-2 gap-2">')
    end = html.index("</div>\n  </div>\n  <div class=\"rounded-[24px] border line bg-white p-4\">", start)
    chat = f"""<div data-qc class="-mx-2 mt-4 flex h-[390px] flex-col overflow-hidden rounded-[22px] bg-white/85 glass-edge">
      <div class="flex items-center gap-2 px-3 pt-2.5">
        <span class="h-2 w-2 rounded-full bg-[#2E9E5B]"></span>
        <p class="flex-1 text-label-l ink">Chat với {NAME} <span class="text-body-s text-on-surface-variant">· trả lời trong 10 phút</span></p>
        {ibtn("open-in-new-rounded", "Mở ở trang Tin nhắn", "#messages")}{ibtn("close-rounded", "Đóng chat")}
      </div>
      {thread()}{chips()}{tray()}{composer()}
    </div>
  """
    end += len("</div>")  # drop the buttons and the question chips; the panel's own </div> stays
    return (html[:start] + chat + html[end:]).replace("</body>", JS + "</body>", 1)


# ------------------------------------------------------------ mobile --
def mobile():
    from common import head
    from j_kit import CSS as JCSS
    body = f"""<body>
<div class="relative h-[844px] w-[390px] overflow-hidden bg-[var(--bg)] font-sans ink">
  <img src="{THUMB}" alt="" class="h-[390px] w-full object-cover">
  <div class="px-4 pt-4">
    <p class="num text-[30px] font-semibold leading-9 tighter">{PRICE[0]} ₫</p>
    <p class="mt-1 text-title-m">{TITLE}</p>
  </div>
  <div class="absolute inset-0 bg-[rgb(18_24_23/.32)]"></div>
  <section data-qc class="absolute inset-x-0 bottom-0 flex h-[640px] flex-col overflow-hidden rounded-t-[28px] bg-[var(--bg)]" aria-label="Chat với {NAME}">
    <span class="mx-auto mt-2 h-1 w-8 rounded-full bg-on-surface-variant/40"></span>
    {head_row(compact=True)}
    {item_row()}{thread()}{chips()}{tray(open_=True)}{composer(open_=True)}
  </section>
</div>
{JS}
</body>
</html>"""
    return head("Chat nhanh · ShopNexus", JCSS + CSS) + body


if __name__ == "__main__":
    for name, fn in [("quickchat-dock", dock), ("quickchat-inline", inline), ("quickchat-mobile", mobile)]:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(fn())
        print("wrote", name)
