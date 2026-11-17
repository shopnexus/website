// Content for the guides, the legal pages and Đăng nhập, from
// .superdesign/tools/build_j_flows.py and build_j_account.py (and the older
// builders they import). MONEY sentences come from common.ts, word for word.

import { MONEY } from './common';
import { LISTINGS } from './listings';

export const NO_ARBITRATION = 'ShopNexus không phân xử giữa người mua và người bán.';

/** The deal the guides and Giao COD show. */
export const DEAL = {
  title: 'iPhone 13 Pro 128GB, Xanh Sierra, pin 88%',
  photo: '1632661674596-df8be070a5c5',
  meta: 'Như mới · Bình Thạnh · 2,1 km',
  listed: '5.200.000 ₫',
  agreed: 5_100_000,
};
export const SELLER = { name: 'Tuấn Kiệt', photo: '1544723795-3fb6469f5b39' };

// ---------------------------------------------------------------- Cách mua --

/** [question, answer, open]. */
export const FAQ: [string, string, boolean][] = [
  ['Tôi có phải trả tiền trước không?', `${MONEY.pay_shipper} ${MONEY.no_hold}`, true],
  ['Mở ra thấy không đúng mô tả thì sao?', `${MONEY.refuse} Hàng quay về người bán.`, true],
  ['Hãng báo đã giao mà tôi chưa nhận?', 'Trong đơn, bấm “Báo chưa nhận hàng”. Yêu cầu tới Hỗ trợ và ShopNexus trả lời trong chat.', false],
  ['Tôi hủy đơn được không?', MONEY.cancel, false],
  ['Phí ship ai trả, bao nhiêu?', `${MONEY.cod_buyer} Bạn thấy phí ship trong đơn khi người bán tạo vận đơn.`, false],
  ['Món đắt tiền thì nên làm gì?', `${MONEY.meet_hint} COD vẫn chọn được.`, false],
];

export const HOW_DO = [
  { icon: 'search-rounded', title: 'Kết nối bạn với người bán quanh nhà', text: 'Tìm bằng cả câu hoặc bằng ảnh, AI điền tin giúp người bán.' },
  { icon: 'query-stats-rounded', title: 'Đưa giá tham khảo', text: 'So giá một tin với các tin giống nó đã bán và đang bán.' },
  { icon: 'local-shipping-outline-rounded', title: 'Tạo vận đơn qua hãng của người bán', text: 'GHTK hoặc GHN báo đơn tới đâu, bạn xem ngay trong đơn.' },
  {
    icon: 'support-agent-outline-rounded',
    title: 'Nhận yêu cầu trong Hỗ trợ',
    text: 'Chưa nhận được hàng hay cần hỏi gì, bạn gửi yêu cầu và ShopNexus trả lời trong chat.',
  },
];

export const HOW_DONT = [
  { icon: 'account-balance-outline-rounded', text: MONEY.no_hold },
  { icon: 'gavel-rounded', text: 'Không phân xử giữa người mua và người bán.' },
  { icon: 'payments-outline-rounded', text: 'Không thu phí ship: bạn trả cho shipper, hãng chuyển tiền hàng cho người bán.' },
  {
    icon: 'shield-outline-rounded',
    text: 'Người thật chỉ xử lý ba việc: hàng cấm và hàng giả bị báo cáo, lừa đảo có dấu hiệu tổ chức, yêu cầu hợp lệ từ cơ quan.',
  },
];

// ---------------------------------------------------------------- Đăng tin --

export const SELL = {
  title: 'iPhone 11 64GB Trắng, máy zin',
  photo: '1603891128711-11b4b03bb138',
  /** [photo id, focal x, focal y, zoom, alt]. The first is the cover. */
  photos: [
    ['1603891128711-11b4b03bb138', 0.5, 0.5, 1, 'Mặt lưng'],
    ['1603891128711-11b4b03bb138', 0.25, 0.25, 3, 'Cụm camera'],
    ['1603891128711-11b4b03bb138', 0.5, 0.62, 1.8, 'Logo và mặt lưng'],
    ['1591337676887-a217a6970a8a', 0.5, 0.5, 1.2, 'Mặt trước'],
  ] as [string, number, number, number, string][],
  claims: ['Pin 81%', 'Bản VN/A', 'Chưa từng sửa', 'Kèm cáp sạc'],
  description: 'Máy dùng 3 năm, chưa sửa chữa hay thay linh kiện. Face ID và camera hoạt động tốt. Kèm cáp sạc.',
  price: 4_800_000,
  guide: { low: 4_400_000, high: 5_100_000, median: 4_800_000, axis: [4_000_000, 5_600_000], sold: 18, live: 12, waiting: 23 },
  soldBins: [1, 2, 3, 5, 4, 2, 1, 0],
  /** [photo id, focal x, focal y, zoom, price, condition, where]. */
  similar: [
    ['1591337676887-a217a6970a8a', 0.5, 0.5, 1, 4_900_000, 'Như mới', '1,2 km'],
    ['1510557880182-3d4d3cba35a5', 0.5, 0.45, 1.2, 4_400_000, 'Đã dùng', '2,5 km'],
    ['1591337676887-a217a6970a8a', 0.4, 0.35, 1.5, 5_300_000, 'Đã dùng', '3,1 km'],
  ] as [string, number, number, number, number, string, string][],
};

// ---------------------------------------------------------------- Trợ giúp --

export const HELP_SAFETY = 'ShopNexus không giữ tiền và không nhận cọc. Ai đòi chuyển cọc trước, bạn báo cáo trong menu của chat.';
const AFTER_PAY = 'Sau khi bạn trả tiền, ShopNexus không đòi lại tiền được. Nếu hàng có vấn đề, bạn mở ghi nhận trong chat.';

export const HELP_TOPICS: { title: string; icon: string; qs: [string, string][] }[] = [
  {
    title: 'Mua hàng',
    icon: 'shopping-bag-outline-rounded',
    qs: [
      ['Xem hàng trước khi trả tiền thế nào?', `${MONEY.cod_buyer} ${MONEY.refuse}`],
      ['Hủy đơn được không?', MONEY.cancel],
      ['Hàng có vấn đề sau khi đã nhận', AFTER_PAY],
      ['Hãng báo đã giao mà tôi chưa nhận?', 'Trong đơn, bấm “Báo chưa nhận hàng”. Yêu cầu tới Hỗ trợ và ShopNexus trả lời trong chat.'],
    ],
  },
  {
    title: 'Bán hàng',
    icon: 'storefront-outline-rounded',
    qs: [
      ['Khi nào tôi nhận được tiền?', MONEY.cod_seller],
      ['Người mua từ chối nhận hàng thì sao?', MONEY.return_leg],
      [
        'Bật giao COD cho tin của tôi',
        'Liên kết tài khoản GHTK hoặc GHN đứng tên bạn trong Thiết lập giao COD. Tiền hàng về tài khoản ngân hàng bạn khai với hãng.',
      ],
      ['Đẩy tin là gì?', 'Tin lên đầu mục Gần bạn trong 1 ngày (15.000 ₫) hoặc 3 ngày (35.000 ₫). Gói Plus có 4 lượt đẩy mỗi tháng.'],
    ],
  },
  {
    title: 'An toàn',
    icon: 'verified-user-outline-rounded',
    qs: [
      [
        'Người bán đòi chuyển cọc trước',
        `${MONEY.no_hold} Bạn đừng chuyển tiền trước khi xem hàng, và báo cáo cuộc trò chuyện trong menu của chat.`,
      ],
      ['Món đắt tiền', MONEY.meet_hint],
      [
        'Báo cáo một tin',
        'Trong menu của tin, chọn “Báo cáo tin”. Người của ShopNexus xem hàng cấm, hàng giả và lừa đảo; tình trạng và giá là chuyện giữa người mua và người bán.',
      ],
      ['Ai phân xử khi hai bên không đồng ý?', `${NO_ARBITRATION} Ghi nhận và đánh giá hiện trên trang của người bán.`],
    ],
  },
];

export const SCAM_SIGNS = [
  { icon: 'payments-outline-rounded', title: 'Đòi cọc hoặc chuyển khoản trước', text: 'Bạn chỉ trả cho shipper, sau khi xem hàng.' },
  { icon: 'link-off-rounded', title: 'Gửi link thanh toán lạ', text: 'ShopNexus không có trang thanh toán cho tiền hàng.' },
  { icon: 'password-rounded', title: 'Hỏi mã đăng nhập', text: 'ShopNexus không bao giờ hỏi mã gửi về điện thoại của bạn.' },
  { icon: 'trending-down-rounded', title: 'Giá rẻ bất thường', text: 'So với Giá tham khảo trong tin trước khi nhắn.' },
];

/** The help page's popular chips: label, and the words the search filters on. */
export const HELP_POPULAR = ['Hủy đơn', 'Từ chối nhận hàng', 'Khi nào nhận tiền', 'Bị đòi cọc'];

// ----------------------------------------------------------- Gói người bán --

export const FEE_NOTE = 'Phí dịch vụ của ShopNexus, không hoàn.';

export const PLANS = [
  { name: 'Cơ bản', amount: 'Miễn phí', unit: null, current: true, perks: ['Số tin theo bậc uy tín', 'Đẩy tin trả theo lượt, từ 15.000 ₫', 'Thống kê 7 ngày'] },
  {
    name: 'Plus',
    amount: '49.000',
    unit: '₫/tháng',
    current: false,
    perks: ['4 lượt đẩy mỗi tháng', 'Thống kê 30 ngày, người xem đến từ đâu', 'Trả lời mẫu cho câu hỏi hay gặp'],
  },
  {
    name: 'Cửa hàng',
    amount: '199.000',
    unit: '₫/tháng',
    current: false,
    perks: ['Trang cửa hàng có tên riêng', '20 lượt đẩy mỗi tháng', '2 người cùng quản lý tin'],
  },
];

export const TIERS = [
  { name: 'Mới', points: '0', rights: 'COD 2 đơn đang mở · 5 tin' },
  { name: 'Tin cậy', points: '200', rights: 'COD 5 đơn đang mở · 20 tin' },
  { name: 'Uy tín', points: '500', rights: 'COD 10 đơn đang mở · ưu tiên ở Gần bạn' },
  { name: 'Xuất sắc', points: '800', rights: 'COD 20 đơn đang mở · huy hiệu trên mọi tin · giảm 20% phí đẩy tin' },
];

export const PAY_WAYS = [
  { name: 'MoMo', sub: '•• 0912', on: true, action: null },
  { name: 'ZaloPay', sub: 'Chưa liên kết', on: false, action: 'Liên kết' },
  { name: 'Thẻ ngân hàng', sub: 'Visa, Mastercard, thẻ ATM', on: false, action: 'Liên kết' },
  { name: 'Chuyển khoản qua mã QR', sub: 'Quét mã mỗi lần trả', on: false, action: null },
];

// ------------------------------------------------------------ legal pages --

/** A paragraph, or a list. */
export type LegalPart = string | string[];
export type LegalSection = [string, LegalPart[]];

export const LISTING_RULES: LegalSection[] = [
  [
    'Một tin, một món',
    [
      'Mỗi tin bán một món, mới hoặc đã dùng, của chính bạn. Bán nhiều món thì đăng nhiều tin.',
      'Số tin đang đăng theo bậc uy tín: Mới 5 tin, Tin cậy 20 tin. Gói người bán không đổi được số này.',
    ],
  ],
  [
    'Hàng không được đăng',
    [
      'Người của ShopNexus gỡ tin và có thể khóa tài khoản khi tin bán:',
      [
        'Vũ khí, chất nổ, ma túy và chất cấm',
        'Thuốc kê đơn',
        'Hàng giả, hàng nhái, hàng gắn nhãn hiệu không phải của nó',
        'Động vật hoang dã và sản phẩm từ chúng',
        'Tài khoản, sim đã đăng ký, giấy tờ tùy thân',
        'Hàng ăn cắp hoặc không rõ chủ',
      ],
    ],
  ],
  [
    'Ảnh và video',
    [
      'Ảnh phải là món bạn đang bán. Người mua thấy ảnh nào chụp trong app, ví dụ “Cả 4 ảnh chụp trong app”.',
      'Ảnh lấy từ mạng hay ảnh của món khác làm tin bị hạ hiển thị khi có người báo cáo.',
      'AI đọc ảnh và video bạn chọn để điền tên, tình trạng và giá. Bạn sửa được mọi ô trước khi đăng.',
    ],
  ],
  [
    'Tình trạng và Tin ghi',
    [
      'Chọn một trong ba: Mới (chưa dùng), Như mới (không vết, hoặc vết rất nhỏ chỉ thấy khi soi gần), Đã dùng (có vết dùng, ghi rõ trong mô tả).',
      `Mỗi điều bạn ghi trong tin, như pin 86%, máy zin hay còn bảo hành, là một Tin ghi. Người mua kiểm từng Tin ghi khi shipper tới cửa. ${MONEY.refuse}`,
    ],
  ],
  [
    'Giá',
    [
      'Ghi giá bạn thật sự bán. Giá tối thiểu là 10.000 ₫.',
      'Không ghi giá ảo để kéo người xem rồi báo giá khác trong chat. Trả giá diễn ra trong chat của tin.',
      'Giá tham khảo trong tin do AI tính từ các tin cùng đời máy trong 30 ngày. Đó không phải lời hứa của người bán.',
    ],
  ],
  [
    'Báo cáo và xử lý',
    [
      'Người mua báo cáo một tin với một trong bốn lý do: Hàng cấm bán; Hàng giả, hàng nhái; Có dấu hiệu lừa đảo; Lý do khác.',
      'Người của ShopNexus chỉ xem hàng cấm, hàng giả và lừa đảo. Tình trạng và giá là chuyện giữa người mua và người bán.',
      'Vi phạm lặp lại làm mất quyền theo thứ tự: hạ hiển thị, giới hạn COD, mất COD, khóa tài khoản. Mỗi 30 ngày không vi phạm gỡ một bậc.',
    ],
  ],
  [
    'Bán xong',
    [
      'Bán qua COD thì tin chuyển sang Đã bán khi người mua nhận hàng.',
      'Bán ngoài app thì bấm “Đánh dấu đã bán”, để món vẫn tính vào điểm uy tín của bạn.',
    ],
  ],
];

export const TERMS: LegalSection[] = [
  [
    'ShopNexus là gì',
    [
      'ShopNexus là nơi người bán đăng món đồ, người mua tìm, nhắn và trả giá. ShopNexus không phải bên bán và không sở hữu món đồ nào.',
      NO_ARBITRATION,
    ],
  ],
  [
    'Tài khoản',
    [
      'Mỗi người một tài khoản, đăng nhập bằng số điện thoại hoặc Google. Bạn giữ mã đăng nhập cho riêng mình; ShopNexus không bao giờ hỏi mã đó.',
      'Người mua và người bán thấy tên, ảnh đại diện, khu vực, hạng uy tín, đánh giá và các tin bạn đăng. Họ không thấy số điện thoại, địa chỉ hay giấy tờ của bạn.',
    ],
  ],
  [
    'Tiền và giao hàng',
    [
      MONEY.no_hold,
      'Cách giao trong app là COD có xem hàng:',
      [MONEY.cod_buyer, MONEY.refuse, MONEY.cancel, MONEY.cod_seller, MONEY.return_leg],
      'Sau khi bạn trả tiền, ShopNexus không đòi lại tiền được.',
    ],
  ],
  [
    'Khi có vấn đề sau khi nhận',
    [
      'Bạn mở ghi nhận trong chat hoặc trong đơn, kèm ảnh. Người bán tự hoàn tiền cho bạn hoặc từ chối.',
      'Ghi nhận bị từ chối hiện trên trang của người bán. ShopNexus không quyết định ai đúng.',
    ],
  ],
  [
    'Điểm uy tín và quyền',
    [
      'Điểm uy tín từ 0 đến 1000, tính trên 12 tháng, chỉ từ những việc app thấy: giao dịch xong, đánh giá, trả lời nhanh, xác minh danh tính.',
      'Bậc uy tín quyết định số tin và số đơn COD đang mở. Tỷ lệ từ chối nhận và ghi nhận bị từ chối trong 90 ngày làm mất quyền, từng bậc.',
    ],
  ],
  [
    'Phí của ShopNexus',
    [
      'Đăng tin, nhắn tin và mua hàng miễn phí. ShopNexus thu phí đẩy tin (từ 15.000 ₫) và gói người bán (Plus 49.000 ₫/tháng, Cửa hàng 199.000 ₫/tháng).',
      `${FEE_NOTE} Gói gia hạn mỗi tháng và hủy lúc nào cũng được.`,
    ],
  ],
  [
    'Nội dung bạn đăng',
    [
      'Bạn chịu trách nhiệm về tin, ảnh và lời nhắn của mình. Tin phải theo Quy định đăng tin.',
      'ShopNexus hiển thị tin của bạn trên app, web và kết quả tìm kiếm để người mua tìm thấy.',
    ],
  ],
  [
    'Khóa và xóa tài khoản',
    [
      'ShopNexus khóa tài khoản khi bán hàng cấm, hàng giả, lừa đảo, hoặc khi mất hết quyền theo điểm uy tín.',
      'Bạn xóa tài khoản trong Tôi › Bảo mật. Tin đăng và trang của bạn được gỡ ngay.',
    ],
  ],
  ['Liên hệ', ['Gửi yêu cầu trong Hỗ trợ. ShopNexus trả lời trong chat của yêu cầu đó.']],
];

// --------------------------------------------------------------- Đăng nhập --

/** Listings on sale near Bình Thạnh, beside the sign-in panel. */
export const LOGIN_NEARBY = [2, 3, 11, 6, 0, 10].map((i) => LISTINGS[i]);
