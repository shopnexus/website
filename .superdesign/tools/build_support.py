"""Hỗ trợ in the chosen style (C's shell): the person's tickets on the left, the open ticket's chat on the right.

    python3 tools/build_support.py        (run from .superdesign/)

Each ticket is its own chat with ShopNexus, as in the app (app/.superdesign/tools/build_support.py). People at
ShopNexus answer as "ShopNexus", with the support agent on primaryContainer as the avatar. The chat is Tin nhắn's
thread without the deal console, quick replies, the scam banner and the menu.
"""
import os
from html import escape

from build import OUT, a
from build_account import nav_active
from build_c import footer, header
from build_chat_cod import PAGE_CSS, composer, event, group
from common import head, icon, img

ORDER = dict(title="iPhone X 64GB, pin 86%", thumb=img("1510557880182-3d4d3cba35a5", 112, 112), carrier="GHTK", code="S1.A1.17373471")
CARRIER = dict(name="Ninja Van", note="Mình gửi Ninja Van vì gần nhà, phí rẻ hơn GHTK.")
REPORT = "GHTK báo đã giao lúc 14:20 hôm qua nhưng mình chưa nhận được, nhà không ai ký nhận."
FEEDBACK = "Lọc theo khu vực hay nhảy về Q.1 dù mình đã chọn Bình Thạnh."
NO_ARBITRATION = "ShopNexus không phân xử giữa người mua và người bán."

KINDS = {
    "not_received": ("package-2-outline-rounded", "Báo chưa nhận hàng"),
    "carrier_request": ("local-shipping-outline-rounded", "Xin thêm hãng"),
    "other": ("chat-outline-rounded", "Yêu cầu khác"),
}

# kind, what it is about, the last message, when, unread, selected
OPEN = [
    ("not_received", ORDER["title"], "Bạn chưa trả tiền nên không mất gì. Bạn kiểm tra giúp mình với bảo vệ toà nhà…", "09:05", 0, True),
    ("carrier_request", CARRIER["name"], "Bạn: " + CARRIER["note"], "Hôm qua", 0, False),
]
DONE = [("other", FEEDBACK, "Cảm ơn bạn. Lỗi này đã sửa trong bản 2.4, bạn cập nhật app giúp mình nhé.", "Thứ Hai", 0, False)]

CSS = PAGE_CSS + """
  .tk-card { border-bottom-right-radius: 4px; }
"""


def official(size=40):
    """ShopNexus in a chat or a row: the support agent on primaryContainer, not the logo."""
    return (f'<span class="grid shrink-0 place-items-center rounded-full bg-primary-container text-on-primary-container" style="width:{size}px;height:{size}px">'
            f'{icon("support-agent-rounded", size * 11 // 20)}</span>')


def row(i, kind, subject, last, when, unread, sel, done=False):
    ic, name = KINDS[kind]
    tone = "bg-surface-container-highest text-on-surface-variant" if done else "bg-secondary-container text-on-secondary-container"
    badge = (f'<span class="grid h-5 min-w-5 shrink-0 place-items-center rounded-full bg-primary px-1.5 text-label-s text-on-primary">{unread}</span>' if unread else "")
    weight = "font-medium text-on-surface" if unread else "text-on-surface-variant"
    return a(f"ticket-{i}", f"flex gap-4 rounded-lg p-3 {'bg-secondary-container' if sel else 'row-hover'}", f"""
  <span class="grid h-12 w-12 shrink-0 place-items-center rounded-full {tone if not sel else 'bg-primary text-on-primary'}">{icon(ic, 24)}</span>
  <span class="min-w-0 flex-1">
    <span class="flex items-baseline gap-2"><span class="min-w-0 flex-1 truncate text-title-s text-on-surface">{name}</span><span class="shrink-0 text-body-s text-on-surface-variant">{when}</span></span>
    <span class="block truncate text-body-s text-on-surface-variant">{escape(subject)}</span>
    <span class="mt-0.5 flex items-center gap-3"><span class="min-w-0 flex-1 truncate text-body-m {weight}">{escape(last)}</span>{badge}</span>
  </span>""")


def ticket_card(kind, body, time):
    """The ticket's card, the first message of its chat, on the person's side."""
    ic, name = KINDS[kind]
    about = f"""<div class="mt-3 flex items-center gap-3">
      <img src="{ORDER["thumb"]}" alt="" class="h-12 w-12 shrink-0 rounded-md object-cover">
      <span class="min-w-0"><span class="block truncate text-title-s text-on-surface">{escape(ORDER["title"])}</span>
      <span class="block truncate text-body-s text-on-surface-variant">{ORDER["carrier"]} · {ORDER["code"]}</span></span>
    </div>""" if kind == "not_received" else ""
    return f"""<div class="flex flex-col items-end">
  <article class="tk-card w-[420px] rounded-lg-plus bg-surface-container p-4" aria-label="{name}">
    <p class="flex items-center gap-2 text-title-s text-on-surface">{icon(ic, 20, "text-primary")}{name}</p>
    {about}
    <p class="mt-3 text-body-l text-on-surface">{escape(body)}</p>
  </article>
  <p class="mt-1 px-2 text-body-s text-on-surface-variant">{time} · Đã xem</p>
</div>"""


def page():
    rows_open = "".join(row(i, *t) for i, t in enumerate(OPEN))
    rows_done = "".join(row(10 + i, *t, done=True) for i, t in enumerate(DONE))
    thread = f"""
      {event("balance-rounded", NO_ARBITRATION)}
      <p class="text-center text-label-m text-on-surface-variant">Hôm nay</p>
      {ticket_card("not_received", REPORT, "08:12")}
      {group("theirs", ["Chào bạn, mình đã xem lịch trình GHTK của đơn: bưu tá báo giao lúc 14:20 tại 12 Nguyễn Gia Trí, Bình Thạnh.",
                        "Bạn chưa trả tiền nên không mất gì. Bạn kiểm tra giúp mình với bảo vệ toà nhà, mình cũng báo GHTK kiểm tra lại."], "09:05")}
    """
    # Chat's own composer, so a change to Chat reaches Hỗ trợ too.
    bar = composer("ShopNexus").replace(">Nhắn tin</div>", ">Nhắn ShopNexus</div>", 1)
    body = f"""<body>
<div class="min-h-screen bg-surface pb-2 font-sans text-on-surface">
  {nav_active(header(quick="always"), None)}
  <main class="mx-auto max-w-[1328px] px-6">
    <div class="mt-6 grid h-[720px] grid-cols-[400px_1fr] gap-4 rounded-xl bg-surface-container-low p-4">
      <section class="flex min-h-0 flex-col">
        <div class="flex items-center justify-between px-2 pt-2">
          <h1 class="text-headline-s">Hỗ trợ</h1>
          <button type="button" class="state flex h-12 items-center gap-2 rounded-lg bg-primary-container pl-4 pr-5 text-label-l text-on-primary-container">{icon("edit-outline-rounded", 20)}Yêu cầu mới</button>
        </div>
        <p class="mt-3 flex items-center gap-2 px-2 text-body-s text-on-surface-variant">{icon("balance-rounded", 16)}{NO_ARBITRATION}</p>
        <div class="thread-scroll mt-2 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          <h2 class="mb-1 mt-4 px-3 text-title-s text-primary">Đang xử lý</h2>
          {rows_open}
          <h2 class="mb-1 mt-6 px-3 text-title-s text-primary">Đã xử lý</h2>
          {rows_done}
        </div>
      </section>
      <section class="flex min-h-0 flex-col overflow-hidden rounded-xl bg-surface-container-lowest">
        <div class="flex h-16 items-center gap-3 border-b border-outline-variant px-4">
          {official(40)}
          <div class="min-w-0 flex-1"><p class="truncate text-title-m">{KINDS["not_received"][1]}</p>
            <p class="flex items-center gap-1 text-body-s text-on-surface-variant">ShopNexus{icon("verified-rounded", 14, "text-primary")}· Đang xử lý</p></div>
        </div>
        <div class="thread-scroll flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-6 py-5">{thread}</div>
        {bar}
      </section>
    </div>
  </main>
  {footer()}
</div>
</body>
</html>"""
    return head("Hỗ trợ · ShopNexus", CSS) + body


if __name__ == "__main__":
    with open(os.path.join(OUT, "support.html"), "w") as f:
        f.write(page())
    print("wrote support")
