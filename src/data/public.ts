// Mock content for the public pages (Tìm kiếm, Danh mục, Chi tiết tin, Người
// bán, Bản đồ, Tìm bằng ảnh, 404), from .superdesign/tools: build.py,
// build_c.py, build_pages.py, build_seller_map.py and build_j_public.py.

import type { Listing } from '../lib/format';
import { EXTRA_RESULTS, FOR_YOU, LISTINGS, RESULTS, SEARCH_RESULTS } from './listings';

/** Category Điện thoại's listings. PHONES[1] is the listing the detail page is drawn from. */
export const PHONES: Listing[] = [
  {
    "id": "p1",
    "photo": "1663499482523-1c0c1bae4ce1",
    "price": 12800000,
    "title": "iPhone 14 128GB, pin 91%, máy zin",
    "condition": "Như mới",
    "km": 4.4,
    "area": "Q.3",
    "rating": 4.8,
    "posted": "1 giờ"
  },
  {
    "id": "p2",
    "photo": "1632661674596-df8be070a5c5",
    "price": 5200000,
    "title": "iPhone 13 Pro 128GB Xanh Sierra, pin 88%",
    "condition": "Như mới",
    "km": 2.1,
    "area": "Bình Thạnh",
    "rating": 4.9,
    "posted": "2 giờ",
    "note": "Giá tham khảo"
  },
  {
    "id": "p3",
    "photo": "1678911820864-e2c567c655d7",
    "price": 14500000,
    "title": "Galaxy S23 Ultra 256GB, kèm bút",
    "condition": "Như mới",
    "km": 1140.0,
    "area": "Hà Nội",
    "rating": 4.9,
    "posted": "20 phút"
  },
  {
    "id": "p4",
    "photo": "1616348436168-de43ad0db179",
    "price": 6900000,
    "title": "iPhone 12 128GB, màn zin, pin 84%",
    "condition": "Đã dùng",
    "km": 0.8,
    "area": "Bình Thạnh",
    "rating": 4.6,
    "posted": "3 giờ",
    "note": "Rẻ hơn 8%"
  },
  {
    "id": "p5",
    "photo": "1598327105666-5b89351aff97",
    "price": 3400000,
    "title": "Galaxy A54 5G 128GB, còn bảo hành",
    "condition": "Như mới",
    "km": 1.7,
    "area": "Q.1",
    "rating": 4.7,
    "posted": "45 phút"
  },
  {
    "id": "p6",
    "photo": "1592899677977-9c10ca588bbd",
    "price": 15900000,
    "title": "iPhone 15 128GB, bảo hành Apple đến 03/2027",
    "condition": "Như mới",
    "km": 2.2,
    "area": "Tân Bình",
    "rating": 4.9,
    "posted": "40 phút",
    "note": "Cao hơn 6%"
  },
  {
    "id": "p7",
    "photo": "1580910051074-3eb694886505",
    "price": 5200000,
    "title": "iPhone 12 mini 64GB, pin 82%",
    "condition": "Đã dùng",
    "km": 610.0,
    "area": "Đà Nẵng",
    "rating": 4.7,
    "posted": "5 giờ"
  },
  {
    "id": "p8",
    "photo": "1510557880182-3d4d3cba35a5",
    "price": 3900000,
    "title": "iPhone X 64GB, pin 86%, máy zin chưa sửa",
    "condition": "Như mới",
    "km": 1.2,
    "area": "Bình Thạnh",
    "rating": 4.8,
    "posted": "12 phút",
    "note": "Rẻ hơn 13%"
  }
];

/** Chi tiết tin's "Tin tương tự". */
export const SIMILAR: Listing[] = [
  {
    "id": "t1",
    "photo": "1663499482523-1c0c1bae4ce1",
    "price": 12800000,
    "title": "iPhone 14 128GB, pin 91%",
    "condition": "Như mới",
    "km": 4.4,
    "area": "Q.3",
    "rating": 4.8,
    "posted": "1 giờ"
  },
  {
    "id": "t2",
    "photo": "1616348436168-de43ad0db179",
    "price": 6900000,
    "title": "iPhone 12 128GB, màn zin",
    "condition": "Đã dùng",
    "km": 0.8,
    "area": "Bình Thạnh",
    "rating": 4.6,
    "posted": "3 giờ"
  },
  {
    "id": "t3",
    "photo": "1678911820864-e2c567c655d7",
    "price": 14500000,
    "title": "Galaxy S23 Ultra 256GB",
    "condition": "Như mới",
    "km": 2.9,
    "area": "Phú Nhuận",
    "rating": 4.9,
    "posted": "20 phút"
  },
  {
    "id": "t4",
    "photo": "1580910051074-3eb694886505",
    "price": 5200000,
    "title": "iPhone 12 mini 64GB",
    "condition": "Đã dùng",
    "km": 1.9,
    "area": "Q.1",
    "rating": 4.7,
    "posted": "5 giờ",
    "note": "Giá tham khảo"
  },
  {
    "id": "t5",
    "photo": "1510557880182-3d4d3cba35a5",
    "price": 3900000,
    "title": "iPhone X 64GB, pin 86%",
    "condition": "Như mới",
    "km": 1.2,
    "area": "Bình Thạnh",
    "rating": 4.8,
    "posted": "12 phút"
  },
  {
    "id": "t6",
    "photo": "1592899677977-9c10ca588bbd",
    "price": 15900000,
    "title": "iPhone 15 128GB",
    "condition": "Như mới",
    "km": 2.2,
    "area": "Tân Bình",
    "rating": 4.9,
    "posted": "40 phút"
  }
];

/** What the seller has for sale. */
export const SELLING: Listing[] = [
  {
    "id": "k1",
    "photo": "1632661674596-df8be070a5c5",
    "price": 5200000,
    "title": "iPhone 13 Pro 128GB Xanh Sierra, pin 88%",
    "condition": "Như mới",
    "km": 2.1,
    "area": "Bình Thạnh",
    "rating": 4.9,
    "posted": "2 giờ",
    "note": "Giá tham khảo"
  },
  {
    "id": "k2",
    "photo": "1585515320310-259814833e62",
    "price": 450000,
    "title": "Máy xay sinh tố 2L, còn bảo hành 6 tháng",
    "condition": "Như mới",
    "km": 2.1,
    "area": "Bình Thạnh",
    "rating": 4.9,
    "posted": "3 ngày"
  },
  {
    "id": "k3",
    "photo": "1505740420928-5e560c06d30e",
    "price": 3200000,
    "title": "Tai nghe chống ồn Sony WH-1000XM4, fullbox",
    "condition": "Như mới",
    "km": 2.1,
    "area": "Bình Thạnh",
    "rating": 4.9,
    "posted": "1 tuần"
  },
  {
    "id": "k4",
    "photo": "1600294037681-c80b4cb5b434",
    "price": 1100000,
    "title": "AirPods 2, tai trái hơi rè",
    "condition": "Đã dùng",
    "km": 2.1,
    "area": "Bình Thạnh",
    "rating": 4.9,
    "posted": "2 tuần",
    "note": "Rẻ hơn 12%"
  },
  {
    "id": "k5",
    "photo": "1593764592116-bfb2a97c642a",
    "price": 1800000,
    "title": "Xe đạp fixie đen mờ size 50, ít đi",
    "condition": "Như mới",
    "km": 2.1,
    "area": "Bình Thạnh",
    "rating": 4.9,
    "posted": "3 tuần"
  },
  {
    "id": "k6",
    "photo": "1580480055273-228ff5388ef8",
    "price": 950000,
    "title": "Ghế xoay vải be chân gỗ, ngồi êm",
    "condition": "Như mới",
    "km": 2.1,
    "area": "Bình Thạnh",
    "rating": 4.9,
    "posted": "1 tháng"
  }
];

/** Bản đồ's list of listings in view. */
export const IN_VIEW: Listing[] = [
  {
    "id": "v1",
    "photo": "1632661674596-df8be070a5c5",
    "price": 5200000,
    "title": "iPhone 13 Pro 128GB, pin 88%",
    "condition": "Như mới",
    "km": 2.1,
    "area": "Bình Thạnh",
    "rating": 4.9,
    "note": "Rẻ hơn 9%"
  },
  {
    "id": "v2",
    "photo": "1507035895480-2b3156c31fc8",
    "price": 2300000,
    "title": "Xe đạp fixed gear khung thép, vừa thay lốp",
    "condition": "Đã dùng",
    "km": 0.8,
    "area": "Bình Thạnh",
    "rating": 4.7
  },
  {
    "id": "v3",
    "photo": "1555041469-a586c61ea9bc",
    "price": 4800000,
    "title": "Sofa nhung xanh 3 chỗ, chuyển nhà cần bán gấp",
    "condition": "Đã dùng",
    "km": 1.6,
    "area": "Bình Thạnh",
    "rating": 4.9
  },
  {
    "id": "v4",
    "photo": "1526170375885-4d8ecf77b99f",
    "price": 1750000,
    "title": "Máy ảnh Polaroid OneStep 2, tặng 1 hộp film",
    "condition": "Như mới",
    "km": 3.1,
    "area": "Phú Nhuận",
    "rating": 5.0,
    "note": "Giá tham khảo"
  },
  {
    "id": "v5",
    "photo": "1585515320310-259814833e62",
    "price": 450000,
    "title": "Máy xay sinh tố 2L, còn bảo hành 6 tháng",
    "condition": "Như mới",
    "km": 0.6,
    "area": "Bình Thạnh",
    "rating": 4.8
  },
  {
    "id": "v6",
    "photo": "1611186871348-b1ce696e52c9",
    "price": 11500000,
    "title": "MacBook Air M1 13 inch 8/256GB, sạc 92 lần",
    "condition": "Như mới",
    "km": 2.4,
    "area": "Phú Nhuận",
    "rating": 4.9
  }
];

/** Tìm bằng ảnh's other sellers stand in with crops of the same shot. */
const MATCH_CROPS: ([number, number, number] | null)[] = [null, [0.48, 0.42, 2.2], [0.52, 0.5, 1.5], [0.6, 0.56, 2.6], [0.45, 0.6, 1.8], [0.55, 0.4, 3.0], [0.5, 0.55, 1.25], [0.42, 0.48, 2.0]];

/** Tìm bằng ảnh's matches: the same model and colour as the photo. */
export const PHOTO_MATCHES: Listing[] = ([
  {
    "id": "m1",
    "photo": "1632661674596-df8be070a5c5",
    "price": 5200000,
    "title": "iPhone 13 Pro 128GB Xanh Sierra, pin 88%",
    "condition": "Như mới",
    "km": 2.1,
    "area": "Bình Thạnh",
    "rating": 4.9,
    "facts": [
      "128 GB",
      "Pin 88%"
    ],
    "note": "Ngang giá thị trường"
  },
  {
    "id": "m2",
    "photo": "1632661674596-df8be070a5c5",
    "price": 4950000,
    "title": "iPhone 13 Pro 128GB Xanh, máy zin, có hộp",
    "condition": "Đã dùng",
    "km": 3.4,
    "area": "Phú Nhuận",
    "rating": 4.7,
    "facts": [
      "128 GB",
      "Pin 85%"
    ],
    "note": "Rẻ hơn 7%"
  },
  {
    "id": "m3",
    "photo": "1632661674596-df8be070a5c5",
    "price": 5600000,
    "title": "iPhone 13 Pro 256GB Xanh Sierra, pin 90%",
    "condition": "Như mới",
    "km": 4.8,
    "area": "Q.3",
    "rating": 4.8,
    "facts": [
      "256 GB",
      "Pin 90%"
    ]
  },
  {
    "id": "m4",
    "photo": "1632661674596-df8be070a5c5",
    "price": 5050000,
    "title": "iPhone 13 Pro 128GB, mặt lưng xanh, trầy nhẹ viền",
    "condition": "Đã dùng",
    "km": 1.6,
    "area": "Bình Thạnh",
    "rating": 4.6,
    "facts": [
      "128 GB",
      "Pin 84%"
    ]
  },
  {
    "id": "m5",
    "photo": "1632661674596-df8be070a5c5",
    "price": 5350000,
    "title": "iPhone 13 Pro 128GB Xanh Sierra, đủ hộp sạc",
    "condition": "Như mới",
    "km": 5.2,
    "area": "Gò Vấp",
    "rating": 4.8,
    "facts": [
      "128 GB",
      "Pin 92%"
    ]
  },
  {
    "id": "m6",
    "photo": "1632661674596-df8be070a5c5",
    "price": 4800000,
    "title": "iPhone 13 Pro 128GB, thay pin chính hãng",
    "condition": "Đã dùng",
    "km": 6.0,
    "area": "Q.10",
    "rating": 4.5,
    "facts": [
      "128 GB",
      "Pin 100%"
    ],
    "note": "Rẻ hơn 9%"
  },
  {
    "id": "m7",
    "photo": "1632661674596-df8be070a5c5",
    "price": 5900000,
    "title": "iPhone 13 Pro 256GB Xanh, bảo hành 3 tháng",
    "condition": "Như mới",
    "km": 7.4,
    "area": "Thủ Đức",
    "rating": 4.9,
    "facts": [
      "256 GB",
      "Pin 89%"
    ]
  },
  {
    "id": "m8",
    "photo": "1632661674596-df8be070a5c5",
    "price": 5150000,
    "title": "iPhone 13 Pro 128GB, ốp lưng sẵn, máy đẹp",
    "condition": "Như mới",
    "km": 8.1,
    "area": "Tân Bình",
    "rating": 4.7,
    "facts": [
      "128 GB",
      "Pin 87%"
    ]
  }
] as Listing[]).map((it, i) => {
  const c = MATCH_CROPS[i];
  return c ? { ...it, crop: c } : it;
});

/** "Cùng hãng, đời khác". */
export const PHOTO_SIMILAR = PHONES.filter((p) => !p.title.includes('13 Pro')).slice(0, 4);

export const PHOTO_QUERY = 'iPhone 13 Pro, Xanh Sierra';
export const SIERRA = '1632661674596-df8be070a5c5';

/** Giá tham khảo per model, in đồng: band lo–hi, median, listings in 30 days. */
export const MODELS = [
  {
    "name": "iPhone 13 Pro 128GB",
    "lo": 4900000,
    "hi": 5600000,
    "med": 5300000,
    "n": 42
  },
  {
    "name": "iPhone 12 128GB",
    "lo": 6100000,
    "hi": 7400000,
    "med": 6800000,
    "n": 57
  },
  {
    "name": "Galaxy S23 Ultra 256GB",
    "lo": 13200000,
    "hi": 15800000,
    "med": 14600000,
    "n": 18
  },
  {
    "name": "iPhone 15 128GB",
    "lo": 14200000,
    "hi": 16500000,
    "med": 15200000,
    "n": 23
  }
];

/** Mẹo kiểm điện thoại. */
export const PHONE_TIPS = [
  {
    "title": "Tài khoản iCloud đã thoát",
    "how": "Cài đặt › tên tài khoản: máy không còn đăng nhập của người bán"
  },
  {
    "title": "Tình trạng pin",
    "how": "Cài đặt › Pin › Tình trạng pin, so với Tin ghi"
  },
  {
    "title": "IMEI khớp vỏ hộp",
    "how": "Bấm *#06# rồi so với số in trên hộp"
  },
  {
    "title": "Face ID, camera, loa",
    "how": "Mở khóa 3 lần, chụp một tấm, gọi thử một cuộc"
  }
];

/** The detail listing (PHONES[1]) as the seller wrote it. */
export const DETAIL = {
  id: 'p2',
  title: "iPhone 13 Pro 128GB, Xanh Sierra, pin 88%",
  /** Paragraphs. */
  description: [
  "Mình dùng từ 2022, máy zin chưa sửa chữa, Face ID nhạy. Viền có 2 vết xước nhỏ, mặt lưng đẹp vì luôn đeo ốp. Đổi máy nên bán lại.",
  "Xem máy trực tiếp quanh Bình Thạnh, buổi tối sau 18h."
],
  specs: [
  [
    "Dòng máy",
    "iPhone 13 Pro"
  ],
  [
    "Dung lượng",
    "128 GB"
  ],
  [
    "Màu",
    "Xanh Sierra"
  ],
  [
    "Pin",
    "88%"
  ],
  [
    "Phiên bản",
    "VN/A"
  ],
  [
    "Bảo hành",
    "Đã hết"
  ],
  [
    "Sửa chữa",
    "Chưa từng"
  ],
  [
    "Phụ kiện",
    "Cáp sạc, ốp lưng"
  ]
] as [string, string][],
  /** The four checks at the door: claim, where to check it. */
  claims: [
  [
    "Pin 88%",
    "Cài đặt › Pin › Tình trạng pin"
  ],
  [
    "Chưa từng sửa",
    "Cài đặt › Cài đặt chung › Giới thiệu › Lịch sử linh kiện"
  ],
  [
    "Bản VN/A",
    "Cài đặt › Cài đặt chung › Giới thiệu › Kiểu máy"
  ],
  [
    "Face ID nhạy",
    "Khóa máy rồi mở bằng mặt 3 lần"
  ]
] as [string, string][],
  /** The gallery: focal-point crops of the photo (fx, fy, zoom). */
  crops: [[0.5, 0.52, 1.25], [0.48, 0.42, 3.4], [0.53, 0.56, 2.1], [0.64, 0.56, 3.2], [0.45, 0.6, 1.8]] as [number, number, number][],
  /** Ngang giá thị trường: band, median and this listing, with the axis. */
  band: { lo: 4_900_000, hi: 5_600_000, med: 5_300_000, axis: [4_500_000, 6_000_000] as [number, number] },
};

export const SELLER = { id: 'tuan-kiet', ...{"name": "Tuấn Kiệt", "photo": "1544723795-3fb6469f5b39", "area": "Bình Thạnh", "joined": "2023"} };

export const REVIEWS = [
  {
    "name": "Minh Thư",
    "photo": "1494790108377-be9c29b29330",
    "stars": 5,
    "ago": "2 tuần trước",
    "text": "Máy đúng như mô tả, pin còn tốt. Anh bán hẹn giờ rất đúng, gói hàng kỹ.",
    "item": "1632661674596-df8be070a5c5",
    "itemName": "iPhone 12 Pro"
  },
  {
    "name": "Quốc Bảo",
    "photo": "1500648767791-00dcc994a43e",
    "stars": 5,
    "ago": "3 tuần trước",
    "text": "Giao COD nhanh, mở ra kiểm tra thoải mái rồi mới trả. Sẽ mua tiếp.",
    "item": "1505740420928-5e560c06d30e",
    "itemName": "Sony WH-1000XM3"
  },
  {
    "name": "Hải Yến",
    "photo": "1534528741775-53994a69daeb",
    "stars": 4,
    "ago": "1 tháng trước",
    "text": "Hàng ổn, trả lời tin nhắn nhanh. Hộp hơi móp nhưng máy không sao.",
    "item": "1585515320310-259814833e62",
    "itemName": "Máy xay Philips"
  }
];

/** Danh mục: every category, with subcategories whose counts add up to the count. */
export const CATEGORY_INDEX = [
  {
    "slug": "dien-thoai",
    "name": "Điện thoại",
    "icon": "mobile-outline-rounded",
    "photo": "1632661674596-df8be070a5c5",
    "count": "3.412",
    "today": "218",
    "subs": [
      {
        "name": "iPhone",
        "count": "1.986"
      },
      {
        "name": "Samsung",
        "count": "742"
      },
      {
        "name": "Xiaomi",
        "count": "268"
      },
      {
        "name": "OPPO",
        "count": "171"
      },
      {
        "name": "Khác",
        "count": "245"
      }
    ]
  },
  {
    "slug": "may-tinh",
    "name": "Máy tính",
    "icon": "laptop-chromebook-outline-rounded",
    "photo": "1611186871348-b1ce696e52c9",
    "count": "2.108",
    "today": "131",
    "subs": [
      {
        "name": "Văn phòng",
        "count": "518"
      },
      {
        "name": "MacBook",
        "count": "402"
      },
      {
        "name": "Máy tính bảng",
        "count": "312"
      },
      {
        "name": "Linh kiện",
        "count": "289"
      },
      {
        "name": "Laptop gaming",
        "count": "233"
      },
      {
        "name": "PC",
        "count": "178"
      },
      {
        "name": "Màn hình",
        "count": "176"
      }
    ]
  },
  {
    "slug": "thoi-trang",
    "name": "Thời trang",
    "icon": "apparel-outline-rounded",
    "photo": "1593030761757-71fae45fa0e7",
    "count": "5.870",
    "today": "402",
    "subs": [
      {
        "name": "Nữ",
        "count": "2.460"
      },
      {
        "name": "Nam",
        "count": "1.830"
      },
      {
        "name": "Giày",
        "count": "744"
      },
      {
        "name": "Túi xách",
        "count": "391"
      },
      {
        "name": "Phụ kiện",
        "count": "287"
      },
      {
        "name": "Đồng hồ",
        "count": "158"
      }
    ]
  },
  {
    "slug": "xe-may",
    "name": "Xe máy",
    "icon": "two-wheeler-outline-rounded",
    "photo": "1558981403-c5f9899a28bc",
    "count": "1.530",
    "today": "87",
    "subs": [
      {
        "name": "Tay ga",
        "count": "634"
      },
      {
        "name": "Xe số",
        "count": "512"
      },
      {
        "name": "Côn tay",
        "count": "214"
      },
      {
        "name": "Phụ tùng",
        "count": "170"
      }
    ]
  },
  {
    "slug": "xe-dap",
    "name": "Xe đạp",
    "icon": "pedal-bike-outline-rounded",
    "photo": "1507035895480-2b3156c31fc8",
    "count": "964",
    "today": "64",
    "subs": [
      {
        "name": "Thể thao",
        "count": "286"
      },
      {
        "name": "Fixed gear",
        "count": "204"
      },
      {
        "name": "Trẻ em",
        "count": "190"
      },
      {
        "name": "Xe đạp điện",
        "count": "168"
      },
      {
        "name": "Phụ tùng",
        "count": "116"
      }
    ]
  },
  {
    "slug": "noi-that",
    "name": "Nội thất",
    "icon": "chair-outline-rounded",
    "photo": "1555041469-a586c61ea9bc",
    "count": "1.247",
    "today": "73",
    "subs": [
      {
        "name": "Bàn",
        "count": "428"
      },
      {
        "name": "Sofa",
        "count": "312"
      },
      {
        "name": "Tủ, kệ",
        "count": "274"
      },
      {
        "name": "Giường",
        "count": "156"
      },
      {
        "name": "Đèn",
        "count": "77"
      }
    ]
  },
  {
    "slug": "do-gia-dung",
    "name": "Đồ gia dụng",
    "icon": "blender-outline-rounded",
    "photo": "1585515320310-259814833e62",
    "count": "2.301",
    "today": "156",
    "subs": [
      {
        "name": "Đồ dùng nhỏ",
        "count": "1.000"
      },
      {
        "name": "Nhà bếp",
        "count": "690"
      },
      {
        "name": "Quạt",
        "count": "210"
      },
      {
        "name": "Tủ lạnh",
        "count": "162"
      },
      {
        "name": "Máy giặt",
        "count": "141"
      },
      {
        "name": "Điều hòa",
        "count": "98"
      }
    ]
  },
  {
    "slug": "me-va-be",
    "name": "Mẹ và bé",
    "icon": "child-care-outline-rounded",
    "photo": "1515488042361-ee00e0ddd4e4",
    "count": "1.328",
    "today": "95",
    "subs": [
      {
        "name": "Quần áo bé",
        "count": "612"
      },
      {
        "name": "Đồ chơi",
        "count": "455"
      },
      {
        "name": "Xe đẩy",
        "count": "187"
      },
      {
        "name": "Ghế ăn",
        "count": "74"
      }
    ]
  },
  {
    "slug": "am-thanh",
    "name": "Âm thanh",
    "icon": "headphones-outline-rounded",
    "photo": "1505740420928-5e560c06d30e",
    "count": "912",
    "today": "48",
    "subs": [
      {
        "name": "Tai nghe",
        "count": "438"
      },
      {
        "name": "Loa",
        "count": "276"
      },
      {
        "name": "Ampli",
        "count": "110"
      },
      {
        "name": "Đĩa than, cassette",
        "count": "88"
      }
    ]
  },
  {
    "slug": "may-anh",
    "name": "Máy ảnh",
    "icon": "photo-camera-outline-rounded",
    "photo": "1516035069371-29a1b244cc32",
    "count": "688",
    "today": "39",
    "subs": [
      {
        "name": "Mirrorless",
        "count": "241"
      },
      {
        "name": "DSLR",
        "count": "156"
      },
      {
        "name": "Ống kính",
        "count": "133"
      },
      {
        "name": "Máy film",
        "count": "96"
      },
      {
        "name": "Phụ kiện",
        "count": "62"
      }
    ]
  },
  {
    "slug": "the-thao",
    "name": "Thể thao",
    "icon": "sports-tennis-outline-rounded",
    "photo": "1554068865-24cecd4e34b8",
    "count": "944",
    "today": "52",
    "subs": [
      {
        "name": "Gym",
        "count": "336"
      },
      {
        "name": "Cầu lông, tennis",
        "count": "289"
      },
      {
        "name": "Bóng đá",
        "count": "198"
      },
      {
        "name": "Cắm trại",
        "count": "121"
      }
    ]
  }
];

export type Category = (typeof CATEGORY_INDEX)[number];

/** The sold listing the 404 shows. */
export const SOLD: Record<string, Listing> = { 'sold-1': PHONES[1] };

/** Every mock listing by id, for Chi tiết tin. */
export const ALL_LISTINGS: Listing[] = [
  ...LISTINGS, ...FOR_YOU, ...RESULTS, ...SEARCH_RESULTS, ...EXTRA_RESULTS,
  ...PHONES, ...SIMILAR, ...SELLING, ...IN_VIEW, ...PHOTO_MATCHES,
];

/** Tìm kiếm with no match: the query of the no-results mockup. */
export const EMPTY_QUERY = 'iPhone 13 Pro Max 512GB dưới 8 triệu ở Q.7';
