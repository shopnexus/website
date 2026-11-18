// Every page's path, so links are written once. The mockups' file names are
// in the comments.

export const R = {
  home: '/', // j-home, j-home-guest
  search: '/tim-kiem', // j-search, search-empty
  photoSearch: '/tim-bang-anh', // photo-search
  categories: '/danh-muc', // categories
  category: (slug: string) => `/danh-muc/${slug}`, // category
  listing: (id: string) => `/tin/${id}`, // detail-c, not-found
  seller: (id: string) => `/nguoi-ban/${id}`, // seller
  map: '/ban-do', // map
  how: '/cach-mua', // how
  sell: '/cach-dang-tin', // sell
  cod: '/giao-cod', // cod; redirects to the dialog in Tin nhắn
  help: '/tro-giup', // help
  plans: '/goi-nguoi-ban', // plans
  listingRules: '/quy-dinh-dang-tin', // listing-rules
  terms: '/dieu-khoan', // terms
  login: '/dang-nhap', // login
  logout: '/dang-xuat',
  me: '/toi', // account
  addresses: '/toi/dia-chi', // addresses
  security: '/toi/bao-mat', // security
  privacy: '/toi/quyen-rieng-tu', // privacy
  profileTasks: '/toi/hoan-thien-ho-so', // profile-tasks
  reputation: '/toi/diem-uy-tin', // reputation
  myListings: '/toi/tin-cua-ban', // my-listings
  codSetup: '/toi/giao-cod', // cod-setup
  orders: '/don-hang', // orders
  order: (id: string) => `/don-hang/${id}`, // order
  sales: '/don-ban', // ship
  saved: '/da-luu', // saved
  messages: '/tin-nhan', // messages
  notifications: '/thong-bao', // notifications
  support: '/ho-tro', // support
  post: '/dang-tin', // "Đăng tin" opens the app's flow; the web has no form yet
} as const;

/** Footer and other link lists, by label. */
export const LINK: Record<string, string> = {
  'Dành cho bạn': R.home,
  'Bản đồ': R.map,
  'Danh mục': R.categories,
  'Mới nhất': `${R.search}?sap-xep=moi`,
  'Cách mua bằng COD': R.how,
  'Cách đăng tin': R.sell,
  'Gói người bán': R.plans,
  'Điểm uy tín': R.reputation,
  'Trợ giúp và an toàn': R.help,
  'Yêu cầu hỗ trợ': R.support,
  'Quy định đăng tin': R.listingRules,
  'Điều khoản': R.terms,
  'Chính sách bảo mật': R.privacy,
  'Bảo mật và xác minh': R.security,
  'Địa chỉ': R.addresses,
  'Hoàn thiện hồ sơ': R.profileTasks,
};
