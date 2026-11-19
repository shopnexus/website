// The signed-in buyer, the money sentences the FAQ quotes and the lists several pages share.

/** The signed-in buyer on every signed-in page. */
export const ME = {"name": "Khánh Linh", "photo": "1494790108377-be9c29b29330", "area": "Bình Thạnh, TP.HCM", "rating": "4,8", "sold": 14} as const;

/** Sellers the mock listings are spread over; a card names one by its id (sellerOf). */
export const SELLERS = [
  { name: 'Tuấn Kiệt', photo: '1544723795-3fb6469f5b39', rating: 4.9 },
  { name: 'Minh Anh', photo: '1438761681033-6461ffad8d80', rating: 4.8 },
  { name: 'Hoàng Nam', photo: '1500648767791-00dcc994a43e', rating: 4.7 },
  { name: 'Thu Hà', photo: '1544005313-94ddf0286df2', rating: 5.0 },
  { name: 'Quốc Bảo', photo: '1506794778202-cad84cf45f1d', rating: 4.6 },
] as const;

/** The mock seller of a listing, the same one for an id on every page. */
export function sellerOf(id: string) {
  let h = 0;
  for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return SELLERS[h % SELLERS.length];
}

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
    "icon": "pedal-bike-outline-rounded"
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
    "icon": "photo-camera-outline-rounded"
  },
  {
    "name": "Âm thanh",
    "icon": "headphones-outline-rounded"
  }
];

/** "Đang được tìm nhiều": search, listings, median price. */
export const TRENDING = [
  {
    "q": "iPhone 13 Pro",
    "median": "5,3 tr"
  },
  {
    "q": "MacBook Air M1",
    "median": "11,2 tr"
  },
  {
    "q": "Xe đạp trẻ em",
    "median": "850 k"
  },
  {
    "q": "Sofa 3 chỗ",
    "median": "3,9 tr"
  },
  {
    "q": "Máy ảnh film",
    "median": "1,6 tr"
  },
  {
    "q": "Tai nghe Sony",
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
    "label": "Đơn hàng"
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
