"""Chat box from the header: a tap on a chat in the Tin nhắn panel opens a
small box docked bottom-right over the page (as on Messenger's web), not the
Tin nhắn page. The same box is Chat nhanh on a listing. Drawn over K2 Chi
tiết tin, so the page behind stays in view.

    python3 tools/build_chat_dock.py        (run from .superdesign/)

Writes mockups/chat-dock-{panel,open,min,phone}.html: the panel with a row
under the pointer, the box open on that chat (a price waiting on the viewer),
the box folded into its pill with a new message, and Chat nhanh on a phone
with the rounded field.
"""
import os

from build import OUT, PHOTOS, TITLE
from build_header import Ids
from build_hover_card import page as detail_page
from build_k2 import SELLERS, header as k2_header, ri
from build_notif_preview import bar, chats_panel
from common import LISTINGS, img
from j_kit import LABEL  # noqa: F401  (the shared kit; K2 pieces come from build_k2/build_header)

NAME, FACE, _ = SELLERS[1]  # Minh Anh, the first row of the panel
PHOTO, _, ITEM, *_ = LISTINGS[5]  # Sofa nhung xanh 3 chỗ, which the viewer sells

CSS = """
  .shadow-pop { box-shadow: 0 12px 32px -8px rgb(20 20 19 / .16), 0 0 0 1px rgb(20 20 19 / .05); }
  .dock-scroll { scrollbar-width: none; } .dock-scroll::-webkit-scrollbar { display: none; }
"""
ICON_BTN = "grid h-9 w-9 shrink-0 place-items-center rounded-full mute row"


def head(L):
    """The other person (opens their card on hover) and the box's own buttons."""
    return f"""<div class="flex items-center gap-1 px-3 pt-3">
  {L.a("flex min-w-0 flex-1 items-center gap-2.5 rounded-[10px] py-0.5 pr-2 row",
       f'<img src="{img(FACE, 72, 72)}" alt="" class="h-9 w-9 shrink-0 rounded-full object-cover">'
       f'<span class="min-w-0"><span class="block truncate text-[14px] font-medium leading-5">{NAME}</span>'
       f'<span class="block truncate text-[12.5px] leading-4 text-[#8C8C87]">Đang hoạt động</span></span>', NAME)}
  {L.a(ICON_BTN, ri("external-link-line", 18), "Mở trong Tin nhắn")}
  <button type="button" class="{ICON_BTN}" aria-label="Thu nhỏ">{ri("subtract-line", 18)}</button>
  <button type="button" class="{ICON_BTN}" aria-label="Đóng">{ri("close-line", 18)}</button>
</div>"""


def ref(L, caption, price, move=True):
    """The listing the chat is on, and the price that stands with the way to the full chat for the moves."""
    link = L.a("shrink-0 whitespace-nowrap rounded-[8px] px-1.5 py-0.5 text-[12.5px] font-medium leading-4 text-brand row", "Mở trong Tin nhắn") if move else ""
    return f"""<div class="mx-3 mt-2.5 flex items-center gap-2.5 rounded-[16px] bg-[#F3F3F1] p-1.5 pr-2">
  <img src="{img(PHOTO, 96, 96)}" alt="" class="h-11 w-11 shrink-0 rounded-[10px] object-cover">
  <div class="min-w-0 flex-1">
    <p class="truncate text-[13px] leading-[18px]">{ITEM}</p>
    <p class="mt-0.5 flex items-center gap-1 text-[12.5px] leading-4">{ri("price-tag-3-line", 14, "text-brand")}<span class="num shrink-0 font-semibold">{price}</span><span class="min-w-0 flex-1 truncate text-[#5E5E5A]">· {caption}</span>{link}</p>
  </div>
</div>"""


def bubble(text, mine=False, tail=True):
    tone = "bg-brand text-white" if mine else "border bd bg-white"
    corner = ("rounded-br-[6px]" if mine else "rounded-bl-[6px]") if tail else ""
    return f'<p class="max-w-[78%] rounded-[18px] {corner} {tone} px-3 py-[7px] text-[13px] leading-[18px] {"self-end" if mine else "self-start"}">{text}</p>'


def time(t, mine=False):
    return f'<p class="px-1 text-[12px] leading-4 text-[#8C8C87] {"text-right" if mine else ""}">{t}</p>'


def thread():
    face = f'<img src="{img(FACE, 56, 56)}" alt="" class="mb-5 h-7 w-7 shrink-0 rounded-full object-cover">'
    theirs = lambda inner: f'<div class="flex items-end gap-1.5">{face}<div class="flex min-w-0 flex-1 flex-col gap-0.5">{inner}</div></div>'
    offer = ('<span class="flex h-10 items-center gap-2 self-start rounded-full bg-[#E3F2EF] pl-3 pr-4 text-[14px] font-medium text-[#05554E]">'
             f'{ri("price-tag-3-line", 18)}<span class="num">4.200.000 ₫</span></span>')
    return f"""<div class="dock-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
  <p class="pt-1 text-center text-[12px] font-medium text-[#8C8C87]">Hôm nay</p>
  {theirs(bubble("Sofa còn không bạn? Mình ở Q.3, tối qua xem được không?") + time("11:58"))}
  <div class="flex flex-col items-end gap-0.5">{bubble("Còn bạn ơi, tối nay sau 7h nha", mine=True)}{time("12:05 · Đã xem", mine=True)}</div>
  {theirs(offer + time("12:38"))}
  {theirs(bubble("Bạn bớt thêm 200k được không ạ?") + time("12:40"))}
</div>"""


def composer(name=NAME):
    """The field takes the controls' 10 px corner, like the chips beside it; photo and send stay round."""
    return f"""<div class="flex items-end gap-1 px-2 pb-2.5 pt-1.5">
  <button type="button" class="grid h-11 w-11 shrink-0 place-items-center rounded-full mute row" aria-label="Gửi ảnh">{ri("image-add-line", 21)}</button>
  <textarea rows="1" placeholder="Nhắn tin" aria-label="Nhắn tin cho {name}" class="h-11 min-w-0 flex-1 resize-none rounded-[10px] border bd bg-white px-4 py-[11px] text-[14px] leading-5 outline-none placeholder:text-[#8C8C87]"></textarea>
  <button type="button" class="grid h-11 w-11 shrink-0 place-items-center rounded-full text-brand row" aria-label="Gửi">{ri("send-plane-2-line", 20)}</button>
</div>"""


def dock(L):
    return f"""<section class="shadow-pop fixed bottom-5 right-6 z-40 flex h-[600px] w-[440px] flex-col overflow-hidden rounded-[16px] bg-white" aria-label="Chat với {NAME}">
  {head(L)}
  {ref(L, f"Giá {NAME} đưa", "4.200.000 ₫")}
  {thread()}
  {composer()}
</section>"""


def pill(L):
    return L.a("shadow-pop fixed bottom-5 right-6 z-40 flex h-12 items-center gap-2 rounded-[10px] bg-white pl-1.5 pr-3 text-[14px] font-medium",
               f'<span class="relative"><img src="{img(FACE, 72, 72)}" alt="" class="h-9 w-9 rounded-full object-cover">'
               '<span class="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-brand"></span></span>'
               f'{NAME}<span class="ml-1 text-[12.5px] font-normal text-[#8C8C87]">Tin mới</span>', f"Mở chat với {NAME}, có tin mới")


def listing_page(L, overlay, *, panel=False):
    html = detail_page("").replace("</style>", CSS + "</style>", 1)
    hdr = bar(L, chat=panel)
    return html.replace(k2_header(), hdr + overlay, 1)


def desktop_panel():
    L = Ids("cd-panel")
    panel = chats_panel(L, "top:72px;right:218px;width:380px;max-height:704px")
    # The first row is under the pointer.
    panel = panel.replace("flex gap-3 rounded-[12px] p-3 row", "flex gap-3 rounded-[12px] p-3 row bg-[#EEEEEB]", 1)
    html = listing_page(L, f'<div class="pointer-events-none fixed inset-0 z-40"><div class="pointer-events-auto">{panel}</div></div>', panel=True)
    return html.replace("<title>", "<title>Tin nhắn · chọn chat · ", 1)


def desktop_open():
    L = Ids("cd-open")
    return listing_page(L, dock(L)).replace("<title>", "<title>Hộp chat · mở · ", 1)


def desktop_min():
    L = Ids("cd-min")
    return listing_page(L, pill(L)).replace("<title>", "<title>Hộp chat · thu nhỏ · ", 1)


def phone():
    """Chat nhanh on a phone: the sheet over the listing, the field rounded like the chips."""
    from build_k2 import out
    L = Ids("cd-phone")
    seller, sface, _ = SELLERS[0]
    chips = "".join(f'<button type="button" class="h-8 shrink-0 rounded-[10px] border bd bg-white px-3 text-[12.5px]">{q}</button>'
                    for q in ["Còn không bạn?", "Xem ở đâu được?", "Giao COD được không?"])
    offer = f'<button type="button" class="flex h-8 shrink-0 items-center gap-1 rounded-[10px] border border-[#DCDCD8] bg-white pl-2 pr-3 text-[12.5px]">{ri("price-tag-3-line", 16)}Trả giá</button>'
    body = f"""<div class="relative mx-auto h-[844px] w-[390px] overflow-hidden bg-[var(--bg)]">
  <img src="{PHOTOS[0]}" alt="" class="h-[390px] w-full object-cover">
  <div class="px-4 pt-4"><p class="num text-[26px] font-semibold">5.200.000 ₫</p><p class="mt-1 text-[16px]">{TITLE}</p></div>
  <div class="absolute inset-0 bg-[rgb(20_20_19/.30)]"></div>
  <section class="absolute inset-x-0 bottom-0 flex h-[640px] flex-col overflow-hidden rounded-t-[28px] bg-[var(--bg)]" aria-label="Chat với {seller}">
    <span class="mx-auto mt-2 h-1 w-8 shrink-0 rounded-full bg-[#8C8C87]/40"></span>
    <div class="flex items-center gap-1 px-3 pt-3">
      {L.a("flex min-w-0 flex-1 items-center gap-2.5 py-0.5", f'<img src="{img(sface, 72, 72)}" alt="" class="h-9 w-9 rounded-full object-cover"><span class="min-w-0"><span class="block text-[14px] font-medium leading-5">{seller}</span><span class="block text-[12.5px] leading-4 text-[#8C8C87]">Hoạt động 5 phút trước</span></span>', seller)}
      {L.a(ICON_BTN, ri("external-link-line", 18), "Mở trong Tin nhắn")}
      <button type="button" class="{ICON_BTN}" aria-label="Đóng">{ri("close-line", 18)}</button>
    </div>
    <div class="mx-3 mt-2.5 flex items-center gap-2.5 rounded-[16px] bg-[#F3F3F1] p-1.5 pr-3">
      <img src="{PHOTOS[0]}" alt="" class="h-11 w-11 rounded-[10px] object-cover">
      <div class="min-w-0 flex-1"><p class="truncate text-[13px] leading-[18px]">{TITLE}</p>
        <p class="mt-0.5 flex items-center gap-1 text-[12.5px] leading-4">{ri("price-tag-3-line", 14, "text-brand")}<span class="num font-semibold">5.200.000 ₫</span><span class="text-[#5E5E5A]">· Giá đăng</span></p></div>
    </div>
    <div class="dock-scroll flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-3">
      <p class="pt-1 text-center text-[12px] font-medium text-[#8C8C87]">Hôm nay</p>
      <div class="flex flex-col items-end gap-0.5">{bubble("Máy còn không bạn? Pin bao nhiêu %?", mine=True)}{time("14:02 · Đã xem", mine=True)}</div>
      <div class="flex items-end gap-1.5"><img src="{img(sface, 56, 56)}" alt="" class="mb-5 h-7 w-7 rounded-full object-cover"><div class="flex flex-1 flex-col gap-0.5">{bubble("Còn bạn nha. Pin 88%, chưa thay linh kiện gì.")}{time("14:05")}</div></div>
    </div>
    <div class="dock-scroll flex shrink-0 gap-1.5 overflow-x-auto px-3 pb-1">{offer}{chips}</div>
    {composer(seller)}
  </section>
</div>"""
    return out("Chat nhanh · điện thoại", body).replace("</style>", CSS + "</style>", 1)


if __name__ == "__main__":
    for name, fn in [("panel", desktop_panel), ("open", desktop_open), ("min", desktop_min), ("phone", phone)]:
        with open(os.path.join(OUT, f"chat-dock-{name}.html"), "w") as f:
            f.write(fn())
        print("wrote chat-dock", name)
