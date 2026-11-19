// Every page's path, so links are written once. The mockups' file names are
// in the comments.

export const R = {
  home: '/', // j-home, j-home-guest
  search: '/search', // j-search, search-empty
  photoSearch: '/photo-search', // photo-search
  categories: '/categories', // categories
  category: (code: string) => `/categories/${code}`, // category
  listing: (id: string) => `/listings/${id}`, // detail-c, not-found
  seller: (id: string) => `/sellers/${id}`, // seller
  how: '/how-to-buy', // how
  sell: '/how-to-sell', // sell
  cod: '/cod', // cod; redirects to the dialog in Tin nhắn
  help: '/help', // help
  plans: '/plans', // plans
  listingRules: '/listing-rules', // listing-rules
  terms: '/terms', // terms
  login: '/sign-in', // login
  logout: '/sign-out',
  me: '/me', // account
  addresses: '/me/addresses', // addresses
  security: '/me/security', // security
  privacy: '/me/privacy', // privacy
  profileTasks: '/me/profile-tasks', // profile-tasks
  reputation: '/me/reputation', // reputation
  myListings: '/me/listings', // my-listings
  codSetup: '/me/cod-setup', // cod-setup
  orders: '/orders', // orders
  order: (id: string) => `/orders/${id}`, // order
  sales: '/sales', // ship
  saved: '/saved', // saved
  messages: '/messages', // messages
  notifications: '/notifications', // notifications
  support: '/support', // support
  post: '/sell', // "Đăng tin" opens the app's flow; the web has no form yet
  /** Home's feed as HTML cards, a page at a time: ?tab=&after= (feedPage in lib/feed.ts). */
  feed: '/feed',
} as const;

/** The endpoints the page scripts call. */
export const API = {
  saved: (id: string) => `/api/saved/${id}`,
  follows: (id: string) => `/api/follows/${id}`,
  area: '/api/area',
  communes: (province: string) => `/api/communes/${province}`,
  uploads: '/api/uploads',
  watches: '/api/watches',
  watchAlert: (id: string) => `/api/watches/${id}/alert`,
} as const;

/** `raw` when it is a path on this site, else `fallback`: no "//host", and no backslash, which browsers read as a slash. */
export const localPath = (raw: string, fallback: string) => (raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('\\') ? raw : fallback);

/** Đăng nhập, coming back to `back` (a path with its query); `ended` adds the "signed out elsewhere" notice. */
export const loginHref = (back: string, ended = false) => `${R.login}?next=${encodeURIComponent(back)}${ended ? '&ended' : ''}`;

/** Footer and other link lists, by label. */
export const LINK: Record<string, string> = {
  'Dành cho bạn': R.home,
  'Danh mục': R.categories,
  'Mới nhất': `${R.search}?sort=newest`,
  'Cách mua bằng COD': R.how,
  'Cách đăng tin': R.sell,
  'Gói người bán': R.plans,
  'Uy tín': R.reputation,
  'Trợ giúp và an toàn': R.help,
  'Yêu cầu hỗ trợ': R.support,
  'Quy định đăng tin': R.listingRules,
  'Điều khoản': R.terms,
  'Chính sách bảo mật': R.privacy,
  'Bảo mật và xác minh': R.security,
  'Địa chỉ': R.addresses,
  'Hoàn thiện hồ sơ': R.profileTasks,
};
