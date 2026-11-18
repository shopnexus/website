// The signed-in buyer, the money sentences the FAQ quotes and the lists several pages share.

/** The signed-in buyer on every signed-in page. */
export const ME = {"name": "Khánh Linh", "photo": "1494790108377-be9c29b29330", "area": "Bình Thạnh, TP.HCM", "rating": "4,8", "sold": 14} as const;

/** The app's MONEY sentences, word for word. A page quotes them, never rewords them. */
export const MONEY = {
  "cod_seller": "Bên vận chuyển chuyển tiền hàng cho bạn 1–2 ngày sau khi người mua nhận.",
  "return_leg": "Người mua từ chối nhận thì bạn trả phí ship cả chiều đi và chiều về."
} as const;

/** Home's category chips: name, icon, count. */
export const CATS = [
  {
    "name": "Điện thoại",
    "icon": "mobile-outline-rounded",
    "count": "3.412"
  },
  {
    "name": "Máy tính",
    "icon": "laptop-chromebook-outline-rounded",
    "count": "2.108"
  },
  {
    "name": "Xe đạp",
    "icon": "pedal-bike-outline-rounded",
    "count": "964"
  },
  {
    "name": "Xe máy",
    "icon": "two-wheeler-outline-rounded",
    "count": "1.530"
  },
  {
    "name": "Thời trang",
    "icon": "apparel-outline-rounded",
    "count": "5.870"
  },
  {
    "name": "Nội thất",
    "icon": "chair-outline-rounded",
    "count": "1.247"
  },
  {
    "name": "Máy ảnh",
    "icon": "photo-camera-outline-rounded",
    "count": "688"
  },
  {
    "name": "Âm thanh",
    "icon": "headphones-outline-rounded",
    "count": "912"
  }
];

/** "Đang được tìm nhiều": search, listings, median price. */
export const TRENDING = [
  {
    "q": "iPhone 13 Pro",
    "count": "412",
    "median": "5,3 tr"
  },
  {
    "q": "MacBook Air M1",
    "count": "268",
    "median": "11,2 tr"
  },
  {
    "q": "Xe đạp trẻ em",
    "count": "190",
    "median": "850 k"
  },
  {
    "q": "Sofa 3 chỗ",
    "count": "143",
    "median": "3,9 tr"
  },
  {
    "q": "Máy ảnh film",
    "count": "96",
    "median": "1,6 tr"
  },
  {
    "q": "Tai nghe Sony",
    "count": "121",
    "median": "2,9 tr"
  }
];

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

/** Every account page's side nav. Counts are what waits in each place and match the pages:
 * 5 tin đang bán, 2 đơn COD đang mở, 1 đơn bán chờ tạo đơn, 13 tin đã lưu,
 * 3 tin nhắn và 3 thông báo chưa đọc, 1 yêu cầu hỗ trợ có trả lời. */
export const ACCOUNT_NAV = [
  {
    "key": "me",
    "icon": "person-outline-rounded",
    "label": "Tôi",
    "count": null
  },
  {
    "key": "listings",
    "icon": "storefront-outline-rounded",
    "label": "Tin của bạn",
    "count": "5"
  },
  {
    "key": "orders",
    "icon": "receipt-long-outline-rounded",
    "label": "Đơn hàng",
    "count": "2"
  },
  {
    "key": "sales",
    "icon": "inventory-2-outline-rounded",
    "label": "Đơn bán",
    "count": "1"
  },
  {
    "key": "saved",
    "icon": "favorite-outline-rounded",
    "label": "Đã lưu",
    "count": "13"
  },
  {
    "key": "messages",
    "icon": "chat-outline-rounded",
    "label": "Tin nhắn",
    "count": "3"
  },
  {
    "key": "notifications",
    "icon": "notifications-outline-rounded",
    "label": "Thông báo",
    "count": "3"
  },
  {
    "key": "cod",
    "icon": "local-shipping-outline-rounded",
    "label": "Thiết lập giao COD",
    "count": null
  },
  {
    "key": "support",
    "icon": "help-outline-rounded",
    "label": "Hỗ trợ",
    "count": "1"
  }
];

/** One address book, so Tôi, Địa chỉ, Hoàn thiện hồ sơ and Thiết lập giao COD agree. */
export const ADDRESS_BOOK = [
  {
    "icon": "home-outline-rounded",
    "label": "Nhà",
    "street": "12 Nguyễn Gia Trí",
    "ward": "Phường Bình Thạnh, TP.HCM",
    "default": true,
    "delivered": "6 đơn đã giao"
  },
  {
    "icon": "work-outline-rounded",
    "label": "Công ty",
    "street": "Tầng 8, 2 Hải Triều",
    "ward": "Phường Sài Gòn, TP.HCM",
    "default": false,
    "delivered": "2 đơn đã giao"
  }
];

/** Hoàn thiện hồ sơ's steps. The address step is done once the book has an address. */
export const PROFILE_TASKS = [
  {
    "key": "phone",
    "icon": "phone-android-outline-rounded",
    "title": "Số điện thoại",
    "done": true
  },
  {
    "key": "avatar",
    "icon": "account-circle-outline-rounded",
    "title": "Ảnh đại diện",
    "done": true
  },
  {
    "key": "address",
    "icon": "home-outline-rounded",
    "title": "Địa chỉ nhận hàng",
    "done": ADDRESS_BOOK.length > 0
  },
  {
    "key": "kyc",
    "icon": "verified-user-outline-rounded",
    "title": "Xác minh danh tính",
    "done": false
  },
  {
    "key": "cod",
    "icon": "local-shipping-outline-rounded",
    "title": "Thiết lập giao COD",
    "done": false
  },
  {
    "key": "bio",
    "icon": "edit-note-rounded",
    "title": "Giới thiệu bản thân",
    "done": false
  }
];
export const TASKS_DONE = PROFILE_TASKS.filter((t) => t.done).length;
