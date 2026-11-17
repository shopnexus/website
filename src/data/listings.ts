// Mock content for the website, the same listings and people as the
// mockups (.superdesign/tools) and the app's mockups. Pages read it until the
// server's public endpoints are wired.

import type { Listing } from '../lib/format';

/** The feed's general pool. */
export const LISTINGS: Listing[] = [
  {
    "id": "l1",
    "photo": "1510557880182-3d4d3cba35a5",
    "price": 3900000,
    "title": "iPhone X 64GB, pin 86%, máy zin chưa sửa",
    "condition": "Như mới",
    "km": 1.2,
    "area": "Bình Thạnh",
    "rating": 4.8,
    "posted": "12 phút",
    "note": "Rẻ hơn 13%"
  },
  {
    "id": "l2",
    "photo": "1611186871348-b1ce696e52c9",
    "price": 11500000,
    "title": "MacBook Air M1 13 inch 8/256GB, sạc 92 lần",
    "condition": "Như mới",
    "km": 2.4,
    "area": "Q.3",
    "rating": 4.9,
    "posted": "1 giờ"
  },
  {
    "id": "l3",
    "photo": "1507035895480-2b3156c31fc8",
    "price": 2300000,
    "title": "Xe đạp fixed gear khung thép, vừa thay lốp",
    "condition": "Đã dùng",
    "km": 0.8,
    "area": "Q.1",
    "rating": 4.7,
    "posted": "35 phút"
  },
  {
    "id": "l4",
    "photo": "1526170375885-4d8ecf77b99f",
    "price": 1750000,
    "title": "Máy ảnh Polaroid OneStep 2, tặng 1 hộp film",
    "condition": "Như mới",
    "km": 3.1,
    "area": "Phú Nhuận",
    "rating": 5.0,
    "posted": "2 giờ",
    "note": "Giá tham khảo"
  },
  {
    "id": "l5",
    "photo": "1505740420928-5e560c06d30e",
    "price": 3200000,
    "title": "Tai nghe chống ồn Sony WH-1000XM4, fullbox",
    "condition": "Như mới",
    "km": 4.0,
    "area": "Thủ Đức",
    "rating": 4.6,
    "posted": "3 giờ"
  },
  {
    "id": "l6",
    "photo": "1555041469-a586c61ea9bc",
    "price": 4800000,
    "title": "Sofa nhung xanh 3 chỗ, chuyển nhà cần bán gấp",
    "condition": "Đã dùng",
    "km": 5.6,
    "area": "Q.7",
    "rating": 4.9,
    "posted": "5 giờ"
  },
  {
    "id": "l7",
    "photo": "1542291026-7eec264c27ff",
    "price": 1290000,
    "title": "Giày Nike Free RN size 42, mới nguyên hộp",
    "condition": "Mới",
    "km": 1.9,
    "area": "Q.10",
    "rating": 4.8,
    "posted": "20 phút"
  },
  {
    "id": "l8",
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
    "id": "l9",
    "photo": "1516035069371-29a1b244cc32",
    "price": 26500000,
    "title": "Sony A7 III kèm lens 28-70 và 50mm f/1.8",
    "condition": "Đã dùng",
    "km": 1140.0,
    "area": "Hà Nội",
    "rating": 4.7,
    "posted": "1 ngày"
  },
  {
    "id": "l10",
    "photo": "1586023492125-27b2c045efd7",
    "price": 1600000,
    "title": "Ghế bành bọc vải vàng mù tạt, khung gỗ sồi",
    "condition": "Đã dùng",
    "km": 3.8,
    "area": "Q.2",
    "rating": 5.0,
    "posted": "6 giờ"
  },
  {
    "id": "l11",
    "photo": "1580480055273-228ff5388ef8",
    "price": 950000,
    "title": "Ghế xoay vải be chân gỗ, ngồi êm",
    "condition": "Như mới",
    "km": 1.4,
    "area": "Bình Thạnh",
    "rating": 4.5,
    "posted": "50 phút"
  },
  {
    "id": "l12",
    "photo": "1585515320310-259814833e62",
    "price": 450000,
    "title": "Máy xay sinh tố 2L, còn bảo hành 6 tháng",
    "condition": "Như mới",
    "km": 0.6,
    "area": "Q.1",
    "rating": 4.8,
    "posted": "15 phút",
    "note": "Rẻ hơn 20%"
  }
];

/** Home's "Dành cho bạn": every province, near and far mixed. */
export const FOR_YOU: Listing[] = [
  {
    "id": "f1",
    "photo": "1592899677977-9c10ca588bbd",
    "price": 15900000,
    "title": "iPhone 15 128GB, bảo hành Apple đến 03/2027",
    "condition": "Như mới",
    "km": 1140.0,
    "area": "Hà Nội",
    "rating": 4.9,
    "posted": "40 phút",
    "note": "Rẻ hơn 12%"
  },
  {
    "id": "f2",
    "photo": "1510557880182-3d4d3cba35a5",
    "price": 3900000,
    "title": "iPhone X 64GB, pin 86%, máy zin chưa sửa",
    "condition": "Đã dùng",
    "km": 0.6,
    "area": "Thủ Đức",
    "rating": 4.8,
    "posted": "12 phút"
  },
  {
    "id": "f3",
    "photo": "1611186871348-b1ce696e52c9",
    "price": 11500000,
    "title": "MacBook Air M1 13 inch 8/256GB, sạc 92 lần",
    "condition": "Đã dùng",
    "km": 3.4,
    "area": "Q.2 cũ",
    "rating": 4.9,
    "posted": "1 giờ"
  },
  {
    "id": "f4",
    "photo": "1516035069371-29a1b244cc32",
    "price": 26500000,
    "title": "Sony A7 III kèm lens 28-70 và 50mm f/1.8",
    "condition": "Như mới",
    "km": 610.0,
    "area": "Đà Nẵng",
    "rating": 4.7,
    "posted": "1 ngày",
    "note": "Rẻ hơn 18%"
  },
  {
    "id": "f5",
    "photo": "1542291026-7eec264c27ff",
    "price": 1290000,
    "title": "Giày Nike Free RN size 42, mới nguyên hộp",
    "condition": "Mới",
    "km": 2.2,
    "area": "Thủ Đức",
    "rating": 4.8,
    "posted": "20 phút"
  },
  {
    "id": "f6",
    "photo": "1505740420928-5e560c06d30e",
    "price": 3200000,
    "title": "Tai nghe chống ồn Sony WH-1000XM4, fullbox",
    "condition": "Như mới",
    "km": 170.0,
    "area": "Cần Thơ",
    "rating": 4.6,
    "posted": "3 giờ"
  },
  {
    "id": "f7",
    "photo": "1555041469-a586c61ea9bc",
    "price": 4800000,
    "title": "Sofa nhung xanh 3 chỗ, chuyển nhà cần bán gấp",
    "condition": "Đã dùng",
    "km": 6.8,
    "area": "Bình Thạnh",
    "rating": 4.9,
    "posted": "5 giờ"
  },
  {
    "id": "f8",
    "photo": "1526170375885-4d8ecf77b99f",
    "price": 1750000,
    "title": "Máy ảnh Polaroid OneStep 2, tặng 1 hộp film",
    "condition": "Như mới",
    "km": 1.8,
    "area": "Thủ Đức",
    "rating": 5.0,
    "posted": "2 giờ"
  },
  {
    "id": "f9",
    "photo": "1586023492125-27b2c045efd7",
    "price": 1600000,
    "title": "Ghế bành bọc vải vàng mù tạt, khung gỗ sồi",
    "condition": "Đã dùng",
    "km": 700.0,
    "area": "Huế",
    "rating": 5.0,
    "posted": "6 giờ"
  },
  {
    "id": "f10",
    "photo": "1580480055273-228ff5388ef8",
    "price": 950000,
    "title": "Ghế xoay vải be chân gỗ, ngồi êm",
    "condition": "Như mới",
    "km": 3.9,
    "area": "Q.9 cũ",
    "rating": 4.5,
    "posted": "50 phút"
  }
];

/** Laptops for the Tìm kiếm query, with the facts the query asked about. */
export const RESULTS: Listing[] = [
  {
    "id": "r1",
    "photo": "1593642632823-8f785ba67e45",
    "price": 7400000,
    "title": "Dell XPS 13 9310 i7, 16 GB, màn 100% sRGB",
    "condition": "Như mới",
    "km": 1.8,
    "area": "Thủ Đức",
    "rating": 4.9,
    "facts": [
      "16 GB RAM",
      "Màn 100% sRGB",
      "Pin 89%"
    ],
    "note": "Thấp hơn mức giữa 6%"
  },
  {
    "id": "r2",
    "photo": "1611186871348-b1ce696e52c9",
    "price": 7900000,
    "title": "MacBook Air M1 8/256GB, màn P3, sạc 92 lần",
    "condition": "Như mới",
    "km": 3.2,
    "area": "Thủ Đức",
    "rating": 4.8,
    "facts": [
      "Màn P3",
      "Pin 92%",
      "8 GB RAM"
    ]
  },
  {
    "id": "r3",
    "photo": "1496181133206-80ce9b88a853",
    "price": 6800000,
    "title": "ThinkPad X1 Carbon Gen 8, i5, 16 GB",
    "condition": "Đã dùng",
    "km": 2.6,
    "area": "Q.9 cũ",
    "rating": 4.7,
    "facts": [
      "16 GB RAM",
      "Màn 100% sRGB",
      "Pin 81%"
    ],
    "note": "Thấp hơn mức giữa 14%"
  },
  {
    "id": "r4",
    "photo": "1517336714731-489689fd1ca8",
    "price": 7950000,
    "title": "MacBook Pro 13 2019 i5, 8 GB, Touch Bar",
    "condition": "Đã dùng",
    "km": 4.1,
    "area": "Bình Thạnh",
    "rating": 4.6,
    "facts": [
      "Màn P3",
      "Pin 84%",
      "8 GB RAM"
    ]
  },
  {
    "id": "r5",
    "photo": "1525547719571-a2d4ac8945e2",
    "price": 5900000,
    "title": "HP Envy 13, i5 thế hệ 10, màn cảm ứng",
    "condition": "Đã dùng",
    "km": 1.1,
    "area": "Thủ Đức",
    "rating": 4.5,
    "facts": [
      "8 GB RAM",
      "Màn 72% NTSC",
      "Pin 78%"
    ]
  },
  {
    "id": "r6",
    "photo": "1588872657578-7efd1f1555ed",
    "price": 7600000,
    "title": "ASUS ZenBook 14 OLED, Ryzen 5, 16 GB",
    "condition": "Như mới",
    "km": 5.4,
    "area": "Q.2 cũ",
    "rating": 4.9,
    "facts": [
      "16 GB RAM",
      "Màn OLED 100% DCI-P3",
      "Pin 95%"
    ]
  }
];
export const SEARCH_RESULTS: Listing[] = [
  {
    "id": "s1",
    "photo": "1593642632823-8f785ba67e45",
    "price": 7400000,
    "title": "Dell XPS 13 9310 i7, 16 GB, màn 100% sRGB",
    "condition": "Như mới",
    "km": 1.8,
    "area": "Thủ Đức",
    "rating": 4.9,
    "facts": [
      "16 GB RAM",
      "Màn 100% sRGB",
      "Pin 89%"
    ],
    "note": "Thấp hơn mức giữa 6%"
  },
  {
    "id": "s2",
    "photo": "1611186871348-b1ce696e52c9",
    "price": 7900000,
    "title": "MacBook Air M1 8/256GB, màn P3, sạc 92 lần",
    "condition": "Như mới",
    "km": 3.2,
    "area": "Thủ Đức",
    "rating": 4.8,
    "facts": [
      "Màn P3",
      "Pin 92%",
      "8 GB RAM"
    ]
  },
  {
    "id": "s3",
    "photo": "1496181133206-80ce9b88a853",
    "price": 6800000,
    "title": "ThinkPad X1 Carbon Gen 8, i5, 16 GB",
    "condition": "Đã dùng",
    "km": 2.6,
    "area": "Q.9 cũ",
    "rating": 4.7,
    "facts": [
      "16 GB RAM",
      "Màn 100% sRGB",
      "Pin 81%"
    ],
    "note": "Thấp hơn mức giữa 14%"
  },
  {
    "id": "s4",
    "photo": "1517336714731-489689fd1ca8",
    "price": 7950000,
    "title": "MacBook Pro 13 2019 i5, 8 GB, Touch Bar",
    "condition": "Đã dùng",
    "km": 1150.0,
    "area": "Hà Nội",
    "rating": 4.6,
    "facts": [
      "Màn P3",
      "Pin 84%",
      "8 GB RAM"
    ]
  },
  {
    "id": "s5",
    "photo": "1525547719571-a2d4ac8945e2",
    "price": 5900000,
    "title": "HP Envy 13, i5 thế hệ 10, màn cảm ứng",
    "condition": "Đã dùng",
    "km": 1.1,
    "area": "Thủ Đức",
    "rating": 4.5,
    "facts": [
      "8 GB RAM",
      "Màn 72% NTSC",
      "Pin 78%"
    ]
  },
  {
    "id": "s6",
    "photo": "1588872657578-7efd1f1555ed",
    "price": 7600000,
    "title": "ASUS ZenBook 14 OLED, Ryzen 5, 16 GB",
    "condition": "Như mới",
    "km": 610.0,
    "area": "Đà Nẵng",
    "rating": 4.9,
    "facts": [
      "16 GB RAM",
      "Màn OLED 100% DCI-P3",
      "Pin 95%"
    ]
  }
];
export const EXTRA_RESULTS: Listing[] = [
  {
    "id": "x1",
    "photo": "1496181133206-80ce9b88a853",
    "price": 7200000,
    "title": "Lenovo Yoga Slim 7, Ryzen 7, 16 GB, màn 100% sRGB",
    "condition": "Như mới",
    "km": 170.0,
    "area": "Cần Thơ",
    "rating": 4.8,
    "facts": [
      "16 GB RAM",
      "Màn 100% sRGB",
      "Pin 90%"
    ]
  },
  {
    "id": "x2",
    "photo": "1611186871348-b1ce696e52c9",
    "price": 7800000,
    "title": "MacBook Air M1 8/256GB, vỏ còn đẹp",
    "condition": "Đã dùng",
    "km": 4.6,
    "area": "Bình Thạnh",
    "rating": 4.7,
    "facts": [
      "Màn P3",
      "Pin 87%",
      "8 GB RAM"
    ]
  },
  {
    "id": "x3",
    "photo": "1593642632823-8f785ba67e45",
    "price": 6500000,
    "title": "Dell Inspiron 14 Plus, i5, 16 GB",
    "condition": "Đã dùng",
    "km": 2.9,
    "area": "Thủ Đức",
    "rating": 4.6,
    "facts": [
      "16 GB RAM",
      "Màn 100% sRGB",
      "Pin 83%"
    ],
    "note": "Thấp hơn mức giữa 11%"
  }
];

export const SEARCH_QUERY = "laptop cũ cho sinh viên thiết kế, dưới 8 triệu";
/** The search came from Tìm bằng ảnh, so the photo stays in the field. */
export const QUERY_PHOTO = "1593642632823-8f785ba67e45";
