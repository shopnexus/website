import type {
  Product,
  Seller,
  Category,
  CartGroup,
  Order,
  Conversation,
  ChatMessage,
  DashboardStat,
} from "@/types";

/* ── Helper: placeholder image ── */
function img(w: number, h: number, id: number = 1): string {
  return `https://picsum.photos/seed/sn${id}/${w}/${h}`;
}

/* ── Categories ── */
export const CATEGORIES: Category[] = [
  { id: "1", name: "Bất động sản", icon: "apartment", slug: "bat-dong-san" },
  { id: "2", name: "Xe cộ", icon: "directions_car", slug: "xe-co" },
  { id: "3", name: "Việc làm", icon: "work", slug: "viec-lam" },
  { id: "4", name: "Điện tử", icon: "smartphone", slug: "dien-tu" },
  { id: "5", name: "Thú cưng", icon: "pets", slug: "thu-cung" },
  { id: "6", name: "Điện lạnh", icon: "ac_unit", slug: "dien-lanh" },
  {
    id: "7",
    name: "Nội thất, cây cảnh",
    icon: "deck",
    slug: "noi-that",
  },
  {
    id: "8",
    name: "Văn phòng, công nông..",
    icon: "print",
    slug: "van-phong",
  },
  { id: "9", name: "Sở thích", icon: "interests", slug: "so-thich" },
  { id: "10", name: "Thời trang", icon: "checkroom", slug: "thoi-trang" },
  { id: "11", name: "Mẹ và bé", icon: "child_care", slug: "me-va-be" },
  { id: "12", name: "Thực phẩm", icon: "restaurant", slug: "thuc-pham" },
];

export const NAV_CATEGORIES = [
  { name: "Tất cả danh mục", icon: "menu", slug: "" },
  { name: "Điện thoại", icon: "smartphone", slug: "dien-thoai" },
  { name: "Thời trang", icon: "checkroom", slug: "thoi-trang" },
  { name: "Nội thất", icon: "chair", slug: "noi-that" },
  { name: "Xe cộ", icon: "directions_car", slug: "xe-co" },
  { name: "Đồ gia dụng", icon: "blender", slug: "do-gia-dung" },
];

/* ── Sellers ── */
export const SELLERS: Seller[] = [
  {
    id: "s1",
    name: "TechStore VN",
    avatar: img(80, 80, 101),
    isVerified: true,
    rating: 4.9,
    reviewCount: 120,
    soldCount: 350,
    followerCount: 4500,
    joinDate: "2 năm",
    location: "Hà Nội",
    description: "Chuyên điện tử, phụ kiện chính hãng.",
    lastActive: "2 giờ trước",
  },
  {
    id: "s2",
    name: "Hoàng Phúc",
    avatar: img(80, 80, 102),
    isVerified: false,
    rating: 4.7,
    reviewCount: 56,
    soldCount: 120,
    location: "TP. Hồ Chí Minh",
  },
  {
    id: "s3",
    name: "Phụ Kiện Xịn",
    avatar: img(80, 80, 103),
    isVerified: true,
    rating: 4.8,
    reviewCount: 230,
    soldCount: 800,
    location: "Đà Nẵng",
  },
  {
    id: "s4",
    name: "Linh Đồ Cổ",
    avatar: img(80, 80, 104),
    isVerified: false,
    rating: 4.5,
    reviewCount: 18,
    soldCount: 45,
    location: "Hà Nội",
  },
  {
    id: "s5",
    name: "Minh Anh Boutique",
    avatar: img(80, 80, 105),
    isVerified: true,
    isMall: false,
    rating: 4.9,
    reviewCount: 1200,
    soldCount: 3000,
    followerCount: 4500,
    joinDate: "2 năm",
    location: "Hà Nội",
    description:
      "Chuyên thời trang nữ phong cách Minimalism & Vintage. Cập nhật mẫu mới mỗi tuần.",
  },
  {
    id: "s6",
    name: "Fashion Hub",
    avatar: img(80, 80, 106),
    isVerified: false,
    rating: 4.6,
    reviewCount: 89,
    soldCount: 250,
    location: "TP. Hồ Chí Minh",
  },
  {
    id: "s7",
    name: "Thanh Tùng Mobile",
    avatar: img(80, 80, 107),
    isVerified: true,
    rating: 4.9,
    reviewCount: 120,
    soldCount: 350,
    location: "TP. Hồ Chí Minh",
    lastActive: "2 giờ trước",
  },
  {
    id: "s8",
    name: "Minimalist Fashion",
    avatar: img(80, 80, 108),
    isVerified: true,
    isMall: true,
    rating: 4.8,
    reviewCount: 540,
    soldCount: 1200,
    location: "Hà Nội",
  },
];

/* ── Products ── */
export const PRODUCTS: Product[] = [
  {
    id: "p1",
    title: "iPhone 13 Pro Max 256GB Xanh Dương Mới 99%",
    price: 15500000,
    originalPrice: 18200000,
    discount: 15,
    images: [img(600, 750, 1), img(600, 750, 2), img(600, 750, 3), img(600, 750, 4)],
    category: "Điện thoại",
    subcategory: "Điện thoại thông minh",
    condition: "Đã qua sử dụng (99%)",
    brand: "Apple",
    warranty: "Còn bảo hành Apple Care 3 tháng",
    origin: "Chính hãng VN/A",
    description:
      "Máy mua đập hộp tại TopZone, dùng cực kỳ giữ gìn, dán ốp lưng cường lực từ lúc mới mua nên không một vết xước dăm.\nPin nguyên bản 95%, chưa từng tháo mở hay sửa chữa.\nPhụ kiện đi kèm: Hộp zin trùng IMEI, cáp sạc zin chưa dùng.\nBao test thoải mái, giao dịch trực tiếp tại nhà riêng hoặc cơ quan.",
    location: "Hà Nội",
    postedAt: "2 giờ trước",
    seller: SELLERS[0],
    imageCount: 5,
    isNegotiable: true,
  },
  {
    id: "p2",
    title: "Samsung Galaxy S22 Ultra Chính Hãng SSVN",
    price: 12800000,
    images: [img(600, 750, 5), img(600, 750, 6)],
    category: "Điện thoại",
    condition: "Đã qua sử dụng",
    description: "Samsung Galaxy S22 Ultra, fullbox, pin 90%.",
    location: "TP. Hồ Chí Minh",
    postedAt: "5 giờ trước",
    seller: SELLERS[1],
  },
  {
    id: "p3",
    title: "Lô Ốp Lưng iPhone Đa Dạng Mẫu Mã - Nhập Mỹ",
    price: 25,
    images: [img(600, 750, 7)],
    category: "Phụ kiện điện thoại",
    condition: "Mới",
    description: "Ốp lưng iPhone nhập khẩu từ Mỹ, đa dạng mẫu mã.",
    location: "Đà Nẵng",
    postedAt: "Vừa xong",
    seller: SELLERS[2],
    isLive: true,
  },
  {
    id: "p4",
    title: "Motorola Razr V3 Zin Nguyên Bản Sưu Tầm",
    price: 2500000,
    images: [img(600, 750, 8)],
    category: "Điện thoại",
    condition: "Đã qua sử dụng",
    description: "Motorola Razr V3 cổ điển, zin nguyên bản, sưu tầm.",
    location: "Hà Nội",
    postedAt: "1 ngày trước",
    seller: SELLERS[3],
  },
  {
    id: "p5",
    title: "Bao đàn guitar da simili",
    price: 590000,
    images: [img(600, 750, 9)],
    category: "Sở thích",
    subcategory: "Nhạc cụ khác",
    condition: "Mới",
    description: "Bao đàn guitar da simili chất lượng cao.",
    location: "TP Thủ Đức",
    postedAt: "29 giây trước",
    seller: SELLERS[1],
    imageCount: 5,
  },
  {
    id: "p6",
    title: "16 PRO MAX 256 99% Quốc Tế Zin góp 0đ",
    price: 23900000,
    images: [img(600, 750, 10)],
    category: "Điện thoại",
    subcategory: "iPhone 16 Pro Max - 256 GB",
    condition: "Đã qua sử dụng",
    description: "iPhone 16 Pro Max 256GB, quốc tế, zin, trả góp 0%.",
    location: "Q. Bình Thạnh",
    postedAt: "30 giây trước",
    seller: SELLERS[0],
    isFeatured: true,
    imageCount: 5,
  },
  {
    id: "p7",
    title: "Áo cầu lông Yonex Nữ Vàng nhạt M",
    price: 129000,
    images: [img(600, 750, 11)],
    category: "Thời trang",
    subcategory: "Đồ nữ",
    condition: "Mới",
    description: "Áo cầu lông Yonex nữ, size M, màu vàng nhạt.",
    location: "Q. Sơn Trà",
    postedAt: "30 giây trước",
    seller: SELLERS[2],
    imageCount: 2,
  },
  {
    id: "p8",
    title: "Máy ảnh Sony A6400 Đen Đã sử dụng",
    price: 14800000,
    images: [img(600, 750, 12)],
    category: "Điện tử",
    condition: "Đã qua sử dụng",
    description: "Sony A6400 body đen, chưa sửa chữa.",
    location: "Q. Bình Thạnh",
    postedAt: "31 giây trước",
    seller: SELLERS[3],
    imageCount: 3,
  },
  {
    id: "p9",
    title: "Tạ đa năng Nhựa PVC 20kg Đen, Đỏ",
    price: 150000,
    images: [img(600, 750, 13)],
    category: "Sở thích",
    condition: "Đã sử dụng",
    description: "Bộ tạ đa năng nhựa PVC 20kg.",
    location: "TP Thủ Đức",
    postedAt: "36 giây trước",
    seller: SELLERS[0],
    imageCount: 3,
  },
  {
    id: "p10",
    title: "Áo Sơ Mi Linen Trắng Basic Form Rộng Thoáng Mát",
    price: 255000,
    originalPrice: 300000,
    discount: 15,
    images: [img(600, 750, 14)],
    category: "Thời trang",
    condition: "Mới",
    description: "Áo sơ mi linen trắng form rộng, thoáng mát.",
    location: "Hà Nội",
    postedAt: "2 giờ trước",
    seller: SELLERS[4],
  },
  {
    id: "p11",
    title: "Váy Midi Hoa Nhí Vintage Dáng Xòe Điệu Đà",
    price: 450000,
    images: [img(600, 750, 15)],
    category: "Thời trang",
    condition: "Mới",
    description: "Váy midi hoa nhí vintage dáng xòe.",
    location: "Hà Nội",
    postedAt: "5 giờ trước",
    seller: SELLERS[4],
  },
  {
    id: "p12",
    title: "Túi Đeo Chéo Nữ Da PU Cao Cấp Phong Cách Hàn",
    price: 189000,
    images: [img(600, 750, 16)],
    category: "Thời trang",
    condition: "Mới",
    description: "Túi đeo chéo nữ da PU, phong cách Hàn Quốc.",
    location: "Hà Nội",
    postedAt: "1 ngày trước",
    seller: SELLERS[4],
  },
  {
    id: "p13",
    title: "Khuyên Tai Ngọc Trai Nhân Tạo Dáng Dài Thanh Lịch",
    price: 80000,
    originalPrice: 100000,
    discount: 20,
    images: [img(600, 750, 17)],
    category: "Thời trang",
    condition: "Mới",
    description: "Khuyên tai ngọc trai nhân tạo, thanh lịch.",
    location: "Hà Nội",
    postedAt: "3 ngày trước",
    seller: SELLERS[4],
  },
];

/* ── Trending Search ── */
export const TRENDING_SEARCHES = [
  { query: "ram 16gb ddr4 l...", count: 99 },
  { query: "mặt sau thinkpa...", count: 99 },
  { query: "google pixel 8a", count: 15 },
];

/* ── Cart Mock ── */
export const CART_GROUPS: CartGroup[] = [
  {
    seller: SELLERS[0],
    items: [
      {
        id: "ci1",
        product: {
          ...PRODUCTS[0],
          title: "Pro Wireless Mechanical Keyboard MX",
          price: 1290000,
          images: [img(200, 200, 20)],
        } as Product,
        variant: "Tactile Brown, Space Gray",
        quantity: 1,
      },
      {
        id: "ci2",
        product: {
          ...PRODUCTS[1],
          title: "Ergonomic Office Mouse V2",
          price: 899000,
          originalPrice: 1050000,
          images: [img(200, 200, 21)],
        } as Product,
        variant: "Matte Black",
        quantity: 2,
      },
    ],
    shopSubtotal: 3088000,
  },
  {
    seller: SELLERS[5],
    items: [
      {
        id: "ci3",
        product: {
          ...PRODUCTS[6],
          title: "Heavyweight Oversized T-Shirt",
          price: 245000,
          images: [img(200, 200, 22)],
        } as Product,
        variant: "L, Vintage Grey",
        quantity: 1,
      },
    ],
    shopSubtotal: 245000,
  },
];

/* ── Orders Mock ── */
export const ORDERS: Order[] = [
  {
    id: "ORD-0921",
    status: "shipping",
    seller: SELLERS[0],
    items: [
      {
        product: {
          ...PRODUCTS[0],
          title: "Bàn phím cơ không dây K8 Pro bản nhôm RGB - Phím cơ cao cấp",
          images: [img(200, 200, 30)],
        } as Product,
        variant: "Brown Switch, Nhôm nguyên khối",
        quantity: 1,
        price: 1850000,
      },
    ],
    totalAmount: 1880000,
    shippingFee: 30000,
    discount: 0,
    createdAt: "12 Tháng 10, 2024",
    shippingMethod: "Giao Hàng Nhanh",
    estimatedDelivery: "14 Th10",
    trackingHistory: [
      {
        title: "Đơn hàng đã đến trạm phân loại trung tâm (Hồ Chí Minh)",
        description: "Hôm nay, 14:30 - Shipper: Nguyễn Văn A (0901234567)",
        timestamp: "Hôm nay, 14:30",
        isActive: true,
      },
      {
        title: "Đơn hàng đã rời kho người bán",
        description: "",
        timestamp: "Hôm qua, 09:15",
        isActive: false,
      },
      {
        title: "Người bán đã đóng gói và giao cho bưu cục",
        description: "",
        timestamp: "12 Th10, 16:45",
        isActive: false,
      },
    ],
  },
  {
    id: "ORD-0920",
    status: "delivered",
    seller: SELLERS[7],
    items: [
      {
        product: {
          ...PRODUCTS[6],
          title: "Áo thun Cotton Oversize trơn cơ bản - Minimalist Collection",
          images: [img(200, 200, 31)],
        } as Product,
        variant: "Màu Trắng, Size L",
        quantity: 2,
        price: 250000,
      },
      {
        product: {
          ...PRODUCTS[6],
          title: "Quần Kaki ống rộng dáng suông cạp cao",
          images: [img(200, 200, 32)],
        } as Product,
        variant: "Màu Be, Size L",
        quantity: 1,
        price: 320000,
      },
    ],
    totalAmount: 820000,
    shippingFee: 20000,
    discount: 0,
    createdAt: "8 Tháng 10, 2024",
  },
];

/* ── Conversations Mock ── */
export const CONVERSATIONS: Conversation[] = [
  {
    id: "conv1",
    contact: {
      name: "Nguyễn Trần Trà My",
      avatar: img(80, 80, 40),
      isOnline: true,
    },
    lastMessage: "Dạ, anh có thể bớt chút được khôn...",
    lastMessageTime: "10:42 AM",
    unreadCount: 0,
    product: {
      id: "cp1",
      title: "Ghế gỗ Sồi phong cách Minimalist",
      price: 1200000,
      images: [img(200, 200, 41)],
    },
  },
  {
    id: "conv2",
    contact: {
      name: "Lê Văn Hùng",
      avatar: img(80, 80, 42),
    },
    lastMessage: "Bạn còn giữ hộp của sản phẩm ...",
    lastMessageTime: "Hôm qua",
    unreadCount: 2,
  },
  {
    id: "conv3",
    contact: {
      name: "Hoàng Nam",
      avatar: img(80, 80, 43),
    },
    lastMessage: "Ok, mai mình qua lấy nhé.",
    lastMessageTime: "T2",
    unreadCount: 0,
  },
];

export const CHAT_MESSAGES: ChatMessage[] = [
  {
    id: "m1",
    content: "",
    productCard: {
      id: "cp1",
      title: "Ghế gỗ Sồi phong cách Minimalist",
      price: 1200000,
      images: [img(200, 200, 41)],
    },
    timestamp: "Hôm nay",
    isSent: false,
  },
  {
    id: "m2",
    content: "Chào anh, chiếc ghế này còn không ạ?",
    timestamp: "10:30 AM",
    isSent: false,
  },
  {
    id: "m3",
    content:
      "Chào bạn, ghế vẫn còn nhé. Hàng mới 99% không xước gì ạ.",
    timestamp: "10:35 AM",
    isSent: true,
    isRead: true,
  },
  {
    id: "m4",
    content: "Trong ảnh thứ 3, chỗ chân ghế có vết này là sao vậy anh?",
    imageUrl: img(400, 300, 44),
    timestamp: "10:38 AM",
    isSent: false,
  },
  {
    id: "m5",
    content:
      "À đó là vân gỗ tự nhiên thôi bạn ơi, không phải xước đâu. Để mình gửi thêm ảnh cận cảnh nhé.",
    timestamp: "10:40 AM",
    isSent: true,
    isRead: true,
  },
  {
    id: "m6",
    content: "Dạ, anh có thể bớt chút được không ạ?",
    timestamp: "10:42 AM",
    isSent: false,
  },
];

/* ── Dashboard Stats ── */
export const DASHBOARD_STATS: DashboardStat[] = [
  { label: "Doanh thu", value: "4.5M đ", change: 15, icon: "payments" },
  { label: "Lượt xem sản phẩm", value: "1,204", change: 5, icon: "visibility" },
  { label: "Lượt lưu (Saves)", value: "89", change: -2, icon: "bookmark" },
];

/* ── Dashboard Products ── */
export const DASHBOARD_PRODUCTS = [
  {
    id: "dp1",
    name: "Cốc sứ thủ công",
    category: "Đồ gia dụng",
    price: "150.000 đ",
    status: "Đang bán" as const,
    views: 342,
    image: img(80, 80, 50),
  },
  {
    id: "dp2",
    name: "iPhone 12 cũ",
    category: "Điện thoại",
    price: "6.500.000 đ",
    status: "Tạm ẩn" as const,
    views: 890,
    image: img(80, 80, 51),
  },
];

/* ── Price Formatter ── */
export function formatPrice(amount: number, currency: "VND" | "USD" = "VND"): string {
  if (currency === "VND") {
    return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
  }
  return "$" + new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(amount);
}
