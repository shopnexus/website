// The money sentences the FAQ quotes, the deal steps and the account nav, which several pages share.

/** The app's MONEY sentences, word for word. A page quotes them, never rewords them. */
export const MONEY = {
  "cod_seller": "Bên vận chuyển chuyển tiền hàng cho bạn 1–2 ngày sau khi người mua nhận.",
  "return_leg": "Người mua từ chối nhận thì bạn trả phí ship cả chiều đi và chiều về."
} as const;

/** The app's four deal steps. */
export const PHASES = [
  {
    "icon": "sell-outline-rounded",
    "label": "Chốt giá"
  },
  {
    "icon": "local-shipping-outline-rounded",
    "label": "Tạo đơn"
  },
  {
    "icon": "package-2-outline-rounded",
    "label": "Nhận hàng"
  },
  {
    "icon": "star-outline-rounded",
    "label": "Đánh giá"
  }
];

/** Every account page's side nav. */
export const ACCOUNT_NAV = [
  {
    "key": "me",
    "icon": "person-outline-rounded",
    "label": "Tôi"
  },
  {
    "key": "listings",
    "icon": "storefront-outline-rounded",
    "label": "Tin của bạn"
  },
  {
    "key": "orders",
    "icon": "receipt-long-outline-rounded",
    "label": "Đơn mua"
  },
  {
    "key": "sales",
    "icon": "inventory-2-outline-rounded",
    "label": "Đơn bán"
  },
  {
    "key": "saved",
    "icon": "favorite-outline-rounded",
    "label": "Đã lưu"
  },
  {
    "key": "messages",
    "icon": "chat-outline-rounded",
    "label": "Tin nhắn"
  },
  {
    "key": "notifications",
    "icon": "notifications-outline-rounded",
    "label": "Thông báo"
  },
  {
    "key": "cod",
    "icon": "local-shipping-outline-rounded",
    "label": "Thiết lập giao COD"
  },
  {
    "key": "support",
    "icon": "help-outline-rounded",
    "label": "Hỗ trợ"
  }
];
