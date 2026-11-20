"""Ảnh chia sẻ của một tin (OG image): the 1200 x 630 picture a link to a
listing shows in Zalo, Facebook or Messenger. The listing's first photo, the
title, the price in big tabular figures, the condition, the place and the
ShopNexus mark. Drawn with flexbox and inline styles only, as satori renders
it on the site (src/lib/og-card.tsx).

    python3 tools/build_seo_og.py        (run from .superdesign/)

Writes mockups/seo-og-split.html (A, photo left, chosen), mockups/seo-og-full.html
(B, photo full bleed) and mockups/seo-og-phone.html (390 px: A as a link
preview in a chat).
"""
import os
from html import escape

from build import OUT, PHOTOS, PRICE, TITLE
from build_k2 import out, ri
from common import LOGO

COND = "Như mới"
PLACE = "Bình Thạnh, TP.HCM"
FONT = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
        '<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@500;600;700&display=swap" rel="stylesheet">')
INK, MUTE, BG, MINT, ON_MINT = "#1A1A19", "#5E5E5A", "#F7F7F5", "#E3F2EF", "#05554E"  # j.css light
PIN = ('<svg width="{s}" height="{s}" viewBox="0 0 24 24" fill="{c}"><path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 11.5 7.3 11.8a1 1 0 0 0 1.4 0'
       'C13 21.5 20 15.4 20 10a8 8 0 0 0-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>')


def shell(title, body, w=1200, h=630):
    page = f'<div style="width:{w}px;height:{h}px;overflow:hidden;font-family:\'Be Vietnam Pro\',sans-serif">{body}</div>'
    return out(title, page).replace("</head>", FONT + "</head>", 1)


def brand(size=44, text=26, color=INK):
    return (f'<div style="display:flex;align-items:center;gap:{size // 4}px">'
            f'<img src="{LOGO}" alt="" style="width:{size}px;height:{size}px">'
            f'<span style="font-size:{text}px;font-weight:600;letter-spacing:-0.01em;color:{color}">ShopNexus</span></div>')


def chip(bg=MINT, fg=ON_MINT):
    return (f'<span style="display:flex;align-self:flex-start;border-radius:10px;background:{bg};color:{fg};'
            f'padding:6px 14px;font-size:24px;font-weight:500">{COND}</span>')


def price(size, color=INK, unit=MUTE):
    return (f'<div style="display:flex;align-items:baseline;gap:10px;color:{color}">'
            f'<span style="font-size:{size}px;font-weight:700;letter-spacing:-0.03em;font-variant-numeric:tabular-nums">{PRICE[0]}</span>'
            f'<span style="font-size:{size // 2}px;font-weight:600;color:{unit}">₫</span></div>')


def place(color=MUTE):
    return (f'<div style="display:flex;align-items:center;gap:8px;font-size:24px;color:{color}">'
            f'{PIN.format(s=26, c=color)}{PLACE}</div>')


# A: the photo as a square card on the left, the facts on a light panel.
def split():
    return f"""<div style="display:flex;width:1200px;height:630px;background:{BG};padding:28px;gap:44px">
  <img src="{PHOTOS[0]}" alt="" style="width:574px;height:574px;border-radius:28px;object-fit:cover">
  <div style="display:flex;flex-direction:column;flex:1;padding:12px 24px 12px 0">
    {brand()}
    <div style="display:flex;flex-direction:column;gap:18px;margin-top:auto">
      {chip()}
      <p style="margin:0;font-size:40px;line-height:52px;font-weight:600;color:{INK};display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden">{escape(TITLE)}</p>
      {price(84)}
    </div>
    <div style="margin-top:28px">{place()}</div>
  </div>
</div>"""


# B: the photo fills the card; the facts sit on a dark fade at the bottom.
def full():
    return f"""<div style="display:flex;position:relative;width:1200px;height:630px;background:#000">
  <img src="{PHOTOS[0]}" alt="" style="position:absolute;inset:0;width:1200px;height:630px;object-fit:cover">
  <div style="position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 35%,rgba(0,0,0,.72) 100%)"></div>
  <div style="position:absolute;left:40px;top:36px;display:flex;border-radius:999px;background:#fff;padding:8px 20px 8px 10px">{brand(40, 24)}</div>
  <div style="position:absolute;left:56px;right:56px;bottom:48px;display:flex;flex-direction:column;gap:14px">
    {chip("#fff", ON_MINT)}
    <p style="margin:0;font-size:40px;line-height:50px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">{escape(TITLE)}</p>
    <div style="display:flex;align-items:flex-end;justify-content:space-between">{price(92, "#fff", "rgba(255,255,255,.8)")}{place("rgba(255,255,255,.9)")}</div>
  </div>
</div>"""


# The phone: A as the link preview a friend sends in a chat.
def phone():
    card = split()
    preview = f"""<div style="width:276px;overflow:hidden;border-radius:16px;background:#fff;box-shadow:0 0 0 1px #E3E6E5">
      <div style="width:276px;height:145px;overflow:hidden"><div style="transform:scale(0.23);transform-origin:0 0">{card}</div></div>
      <div style="padding:10px 12px 12px">
        <p style="margin:0;font-size:14px;font-weight:600;line-height:19px">{escape(TITLE)} · ShopNexus</p>
        <p style="margin:2px 0 0;font-size:12.5px;line-height:17px;color:{MUTE}">{PRICE[0]} ₫ · {COND} · {PLACE}</p>
        <p style="margin:6px 0 0;font-size:12px;color:#8C948F">shopnexus.id.vn</p>
      </div>
    </div>"""
    body = f"""<div style="width:390px;height:844px;background:#EEF1F0;display:flex;flex-direction:column;font-family:'Be Vietnam Pro',sans-serif">
  <div style="height:64px;display:flex;align-items:center;gap:12px;padding:0 16px;background:#fff;border-bottom:1px solid #E3E6E5">
    {ri("arrow-left-line", 22)}<div style="width:36px;height:36px;border-radius:999px;background:#C7E6E0"></div>
    <div><p style="margin:0;font-size:15px;font-weight:600">Minh Anh</p><p style="margin:0;font-size:12px;color:{MUTE}">Đang hoạt động</p></div>
  </div>
  <div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;gap:8px;padding:16px">
    <div style="align-self:flex-start;max-width:260px;border-radius:16px;background:#fff;padding:9px 13px;font-size:14px">Có cái iPhone nào ổn không bạn?</div>
    <div style="align-self:flex-end;display:flex;flex-direction:column;align-items:flex-end;gap:6px">
      <div style="border-radius:16px;background:#066A61;color:#fff;padding:9px 13px;font-size:14px">Cái này nè, giá ổn</div>
      {preview}
    </div>
  </div>
  <div style="height:72px;display:flex;align-items:center;gap:10px;padding:0 16px;background:#fff">
    <div style="flex:1;height:40px;border-radius:999px;background:#F1F4F2;display:flex;align-items:center;padding:0 16px;font-size:14px;color:{MUTE}">Nhắn tin</div>
    {ri("send-plane-2-fill", 22, "text-brand")}
  </div>
</div>"""
    return shell("Ảnh chia sẻ trong tin nhắn", body, 390, 844)


if __name__ == "__main__":
    for name, html in [("seo-og-split", shell("Ảnh chia sẻ tin · A", split())),
                       ("seo-og-full", shell("Ảnh chia sẻ tin · B", full())),
                       ("seo-og-phone", phone())]:
        with open(os.path.join(OUT, f"{name}.html"), "w") as f:
            f.write(html)
        print("wrote", name)
