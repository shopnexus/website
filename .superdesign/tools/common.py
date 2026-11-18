"""Shared pieces for the website mockups.

Tokens copy src/styles/tokens.css (which copies the Android app's design
system). Mock content comes from app/.superdesign/tools so the web and the app
show the same listings.

Two directions are drawn: "m3" (the app's layout carried to a desktop window
as M3 prescribes) and "web" (M3 tokens with web conventions). See
.superdesign/design-system.md.
"""
from html import escape

PROJECT = "af33e77d-fa0e-408b-a30c-0ae8731c173e"
MODEL = "claude-opus-5-5"
LOGO = ("https://vgbujcuwptvheqijyjbe.supabase.co/storage/v1/object/public/hmac-uploads/projects/"
        "af33e77d-fa0e-408b-a30c-0ae8731c173e/brand-assets/website-public-favicon.svg/favicon.svg")

# Published drafts on the Superdesign canvas.
DRAFTS = {
    "home-e": "cc1198e3-abdb-4dd9-b538-6d2b6b61b640",
    "detail-c": "297be322-2715-478b-b555-ed2bf0dcfe7c",
    "search": "5064eb8c-9e6b-4301-b53a-6f127a1e35a4",
    "category": "3f316891-b4fa-4d18-8fb0-25f07b547b70",
    "seller": "e322dbf4-f686-4e13-9b4c-07307acf9e36",
    "map": "0a8a0c4c-0715-48fe-b7fb-dc1ebaa64dbb",
    "messages": "5f73de9d-4afa-4101-9bef-658bd4331f66",
    "cod": "7e3ac5c7-d989-4364-8cdb-4f5f7f55101b",
    "sell": "9e3ff29b-a8bb-46ad-9563-ab7b06470094",
    "how": "6aa21972-7f8f-42a2-b5f4-2122f25e2fe8",
    "login": "31ef8a60-7d0c-484c-aaf8-38f819fc0434",
    "account": "b0456a9c-cf87-4073-a25b-29b61f9dc4cb",
    "notifications": "e9aac9e5-1b2a-48d5-950a-0b44c32b2716",
    "orders": "f874fc32-71bf-4f49-901a-6069e97202aa",
    "order": "dbf0b87b-c943-422a-8887-e5b2d7c7ef20",
    "ship": "5af7cd52-be74-4781-9148-f53b78e5ea58",
    "my-listings": "e7f20770-6b20-4ea8-b23e-ef717b2c1ec3",
    "saved": "ac40ee5a-e804-4db6-8030-3abc9e385006",
    "cod-setup": "1d38ced3-110d-407e-a285-5e053e602871",
    "support": "72743100-5344-4813-a878-2b5a11b1edfe",
    "home-guest": "06ec18a8-1f11-4eb8-a3e3-c12397513c58",
    "categories": "a1ad86b1-ca66-453c-ae6b-64e54aad97ed",
    "photo-search": "28a507c0-9855-4740-81ff-d950eec583db",
    "not-found": "be194482-e06c-438e-9da6-9d4e8e035a78",
    "search-empty": "c75ca368-f235-4027-8192-be9bb9b24f9f",
    "help": "60be3f4a-2102-4fe4-af6e-d9db5d51f495",
    "plans": "ea492d9d-66a1-44f1-b4e0-c21dd7ccaeeb",
    "listing-rules": "41fdcdfd-6d1c-4b4f-a660-9b39ead0f652",
    "terms": "d80ca0ed-56d0-4db4-b3f5-6e3fc7ee1563",
    "addresses": "5aedec63-d086-4f26-a40c-14848af83031",
    "security": "e1f6b964-3bcd-44a2-ac7b-03216aad93ed",
    "privacy": "5471755e-1f9c-4704-a3d0-931ce9bb357f",
    "profile-tasks": "59f9ca79-2682-4fe8-95d8-1c1953c5241d",
    "reputation": "cca2daf2-da31-4fb3-b797-4ca4714ecf66",
}

LIGHT = {
    "primary": "#005049", "on-primary": "#FFFFFF", "primary-container": "#066A61", "on-primary-container": "#97E7DB",
    "secondary": "#47645F", "on-secondary": "#FFFFFF", "secondary-container": "#C7E6E0", "on-secondary-container": "#4B6863",
    "tertiary": "#773115", "on-tertiary": "#FFFFFF", "tertiary-container": "#95482A", "on-tertiary-container": "#FFCDBC",
    "tertiary-fixed": "#FFDBCF", "on-tertiary-fixed-variant": "#773215",
    "error": "#BA1A1A", "on-error": "#FFFFFF", "error-container": "#FFDAD6",
    "surface": "#F7FAF8", "surface-container-lowest": "#FFFFFF", "surface-container-low": "#F1F4F2",
    "surface-container": "#EBEFED", "surface-container-high": "#E6E9E7", "surface-container-highest": "#E0E3E1",
    "on-surface": "#181C1C", "on-surface-variant": "#3E4947", "outline": "#6E7977", "outline-variant": "#BEC9C6",
    "inverse-surface": "#2D3130", "inverse-on-surface": "#EEF1EF", "inverse-primary": "#85D5C9",
}

# The app's type scale, a step under the M3 baseline (Be Vietnam Pro reads
# larger than the system font). display-l and display-m are M3 steps the app
# leaves out; the web keeps them at the baseline for page headlines.
TYPE = {
    "display-l": ("57px", "64px", "400", "-0.25px"),
    "display-m": ("45px", "52px", "400", "0"),
    "display-s": ("32px", "40px", "400", "0"),
    "headline-m": ("24px", "32px", "400", "0"),
    "headline-s": ("20px", "28px", "400", "0"),
    "title-l": ("20px", "26px", "400", "0"),
    "title-m": ("15px", "22px", "500", "0.1px"),
    "title-s": ("14px", "20px", "500", "0.1px"),
    "body-l": ("14px", "20px", "400", "0.25px"),
    "body-m": ("13px", "18px", "400", "0.2px"),
    "body-s": ("12px", "16px", "400", "0.3px"),
    "label-l": ("13px", "18px", "500", "0.1px"),
    "label-m": ("12px", "16px", "500", "0.4px"),
    "label-s": ("11px", "16px", "500", "0.4px"),
}
RADII = {"xs": "4px", "sm": "8px", "md": "12px", "lg": "16px", "lg-plus": "20px", "xl": "28px", "xl-plus": "32px"}

MONEY = dict(
    cod_buyer="Xem hàng rồi mới trả tiền hàng và phí ship cho shipper.",
    cancel="Bạn hủy được đơn khi người bán chưa tạo đơn và không mất tiền.",
    refuse="Nếu không ưng, bạn từ chối nhận hàng và không mất tiền.",
    cod_seller="Bên vận chuyển chuyển tiền hàng cho bạn 1–2 ngày sau khi người mua nhận.",
    return_leg="Người mua từ chối nhận thì bạn trả phí ship cả chiều đi và chiều về.",
    pay_shipper="Trả tiền hàng và phí ship cho shipper sau khi xem, bằng tiền mặt hoặc chuyển khoản.",
)

CATEGORIES = [
    ("Điện thoại", "mobile-outline-rounded"), ("Máy tính", "laptop-chromebook-outline-rounded"),
    ("Xe đạp", "pedal-bike-outline-rounded"), ("Xe máy", "two-wheeler-outline-rounded"),
    ("Thời trang", "apparel-outline-rounded"), ("Nội thất", "chair-outline-rounded"),
    ("Máy ảnh", "photo-camera-outline-rounded"), ("Âm thanh", "headphones-outline-rounded"),
    ("Đồ gia dụng", "blender-outline-rounded"), ("Thể thao", "sports-tennis-outline-rounded"),
]

# img, price, title, condition, distance, area, seller rating, posted, AI price note
LISTINGS = [
    ("1510557880182-3d4d3cba35a5", "3.900.000 ₫", "iPhone X 64GB, pin 86%, máy zin chưa sửa", "Như mới", "1,2 km", "Bình Thạnh", "4,8", "12 phút", "Rẻ hơn 13%"),
    ("1611186871348-b1ce696e52c9", "11,5 tr ₫", "MacBook Air M1 13 inch 8/256GB, sạc 92 lần", "Như mới", "2,4 km", "Q.3", "4,9", "1 giờ", None),
    ("1507035895480-2b3156c31fc8", "2.300.000 ₫", "Xe đạp fixed gear khung thép, vừa thay lốp", "Đã dùng", "0,8 km", "Q.1", "4,7", "35 phút", None),
    ("1526170375885-4d8ecf77b99f", "1.750.000 ₫", "Máy ảnh Polaroid OneStep 2, tặng 1 hộp film", "Như mới", "3,1 km", "Phú Nhuận", "5,0", "2 giờ", "Giá tham khảo"),
    ("1505740420928-5e560c06d30e", "3.200.000 ₫", "Tai nghe chống ồn Sony WH-1000XM4, fullbox", "Như mới", "4,0 km", "Thủ Đức", "4,6", "3 giờ", None),
    ("1555041469-a586c61ea9bc", "4.800.000 ₫", "Sofa nhung xanh 3 chỗ, chuyển nhà cần bán gấp", "Đã dùng", "5,6 km", "Q.7", "4,9", "5 giờ", None),
    ("1542291026-7eec264c27ff", "1.290.000 ₫", "Giày Nike Free RN size 42, mới nguyên hộp", "Mới", "1,9 km", "Q.10", "4,8", "20 phút", None),
    ("1592899677977-9c10ca588bbd", "15,9 tr ₫", "iPhone 15 128GB, bảo hành Apple đến 03/2027", "Như mới", "2,2 km", "Tân Bình", "4,9", "40 phút", "Cao hơn 6%"),
    ("1516035069371-29a1b244cc32", "26,5 tr ₫", "Sony A7 III kèm lens 28-70 và 50mm f/1.8", "Đã dùng", "1.140 km", "Hà Nội", "4,7", "1 ngày", None),
    ("1586023492125-27b2c045efd7", "1.600.000 ₫", "Ghế bành bọc vải vàng mù tạt, khung gỗ sồi", "Đã dùng", "3,8 km", "Q.2", "5,0", "6 giờ", None),
    ("1580480055273-228ff5388ef8", "950.000 ₫", "Ghế xoay vải be chân gỗ, ngồi êm", "Như mới", "1,4 km", "Bình Thạnh", "4,5", "50 phút", None),
    ("1585515320310-259814833e62", "450.000 ₫", "Máy xay sinh tố 2L, còn bảo hành 6 tháng", "Như mới", "0,6 km", "Q.1", "4,8", "15 phút", "Rẻ hơn 20%"),
]


NEAR_KM = 10


def where(km, area):
    """A card's place, as the app's whereText: the distance under 10 km, the seller's place beyond."""
    return area if float(km.split()[0].replace(".", "").replace(",", ".")) >= NEAR_KM else km


def img(photo_id, w=600, h=None):
    size = f"w={w}&h={h}" if h else f"w={w}"
    return f"https://images.unsplash.com/photo-{photo_id}?{size}&q=80&auto=format&fit=crop"


def crop(photo_id, size, fx=0.5, fy=0.5, zoom: float = 1):
    return (f"https://images.unsplash.com/photo-{photo_id}?w={size}&h={size}&fit=crop&crop=focalpoint"
            f"&fp-x={fx}&fp-y={fy}&fp-z={zoom}&q=80&auto=format")


def icon(name, size=24, cls=""):
    return f'<iconify-icon icon="material-symbols:{name}" width="{size}" height="{size}" class="block shrink-0 {cls}"></iconify-icon>'


def split_price(price):
    if price.endswith(" tr ₫"):
        return price[:-5], " tr ₫"
    return price[:-2], " ₫"


def head(title, extra_css=""):
    colors = ",".join(f"'{k}':'{v}'" for k, v in LIGHT.items())
    sizes = ",".join(
        f"'{k}':['{s}',{{lineHeight:'{lh}',fontWeight:'{fw}',letterSpacing:'{ls}'}}]" for k, (s, lh, fw, ls) in TYPE.items()
    )
    radii = ",".join(f"'{k}':'{v}'" for k, v in RADII.items())
    css_vars = " ".join(f"--md-{k}: {v};" for k, v in LIGHT.items())
    return f"""<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com"></script>
<script>
tailwind.config = {{ theme: {{ extend: {{
  colors: {{{colors}}},
  fontSize: {{{sizes}}},
  borderRadius: {{{radii}}},
  fontFamily: {{ sans: ['"Be Vietnam Pro"', 'system-ui', 'sans-serif'] }},
  boxShadow: {{ float: '0 1px 3px 0 rgba(0,0,0,.30), 0 4px 8px 3px rgba(0,0,0,.15)' }},
}} }} }};
</script>
<script src="https://code.iconify.design/iconify-icon/3.0.2/iconify-icon.min.js"></script>
<style>
  :root {{ {css_vars}
    --spatial: linear(0, 0.107, 0.321, 0.539, 0.719, 0.848, 0.931, 0.979, 1.004, 1.014, 1.015, 1.011, 1.006, 1.003, 1);
    --effects: linear(0, 0.286, 0.625, 0.826, 0.924, 0.968, 0.987, 0.995, 1); }}
  html, body {{ background: var(--md-surface); }}
  .state {{ position: relative; isolation: isolate; }}
  .state::after {{ content: ""; position: absolute; inset: 0; border-radius: inherit; background: currentColor; opacity: 0;
    pointer-events: none; transition: opacity 140ms var(--effects); }}
  .state:hover::after {{ opacity: .08; }}
  .state:active::after {{ opacity: .1; }}
  .no-scrollbar {{ scrollbar-width: none; }}
  .no-scrollbar::-webkit-scrollbar {{ display: none; }}
{extra_css}
</style>
</head>
"""
