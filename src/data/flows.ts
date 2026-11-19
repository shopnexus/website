// Content for the guides, the legal pages and Đăng nhập, from
// .superdesign/tools/build_j_flows.py and build_j_account.py (and the older
// builders they import). MONEY sentences come from common.ts, word for word.

import { MONEY } from './common';

export const NO_ARBITRATION = 'Hệ thống không phân xử giữa người mua và người bán.';

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
  ['Tôi có phải trả tiền trước không?', 'Không. Shipper tới, bạn xem hàng rồi trả tiền hàng và phí ship, bằng tiền mặt hoặc chuyển khoản.', true],
  ['Mở ra thấy không đúng mô tả thì sao?', 'Bạn từ chối nhận, hàng quay về người bán.', true],
  ['Hãng báo đã giao mà tôi chưa nhận?', 'Trong đơn, bấm “Báo chưa nhận hàng”. Yêu cầu tới Hỗ trợ và ShopNexus trả lời trong chat.', false],
  ['Tôi hủy đơn được không?', 'Được, khi người bán chưa tạo vận đơn. Bạn không mất tiền.', false],
  ['Phí ship ai trả, bao nhiêu?', 'Bạn thấy phí ship trong đơn khi người bán tạo vận đơn.', false],
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
  { icon: 'gavel-rounded', text: 'Không phân xử giữa người mua và người bán.' },
  { icon: 'payments-outline-rounded', text: 'Không thu phí ship: bạn trả cho shipper, hãng chuyển tiền hàng cho người bán.' },
  {
    icon: 'shield-outline-rounded',
    text: 'Người thật chỉ xử lý ba việc: hàng cấm và hàng giả bị báo cáo, lừa đảo có dấu hiệu tổ chức, yêu cầu hợp lệ từ cơ quan.',
  },
];

// ---------------------------------------------------------------- Trợ giúp --

export const HELP_SAFETY = 'Ai đòi chuyển cọc trước, bạn báo cáo trong menu của chat.';
const AFTER_PAY = 'Đã trả tiền cho shipper thì không đòi lại qua ứng dụng được. Nếu hàng có vấn đề, bạn mở ghi nhận trong chat với người bán.';

export const HELP_TOPICS: { title: string; icon: string; qs: [string, string][] }[] = [
  {
    title: 'Mua hàng',
    icon: 'shopping-bag-outline-rounded',
    qs: [
      ['Xem hàng trước khi trả tiền thế nào?', 'Shipper tới, bạn mở hàng xem rồi mới trả tiền. Không ưng thì từ chối nhận, hàng quay về người bán và bạn không mất tiền.'],
      ['Hủy đơn được không?', 'Được, khi người bán chưa tạo vận đơn. Bạn không mất tiền.'],
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
        `Bạn đừng chuyển tiền trước khi xem hàng, và báo cáo cuộc trò chuyện trong menu của chat.`,
      ],
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
      `Mỗi điều bạn ghi trong tin, như pin 86%, máy zin hay còn bảo hành, là một Tin ghi.`,
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
      'ShopNexus không giữ tiền hàng của bên nào. Cách giao trong app là COD có xem hàng:',
      ['Người mua xem hàng rồi trả tiền hàng và phí ship cho shipper.', 'Người mua hủy được đơn khi người bán chưa tạo vận đơn.', MONEY.cod_seller, MONEY.return_leg],
      'Đã trả tiền cho shipper thì không đòi lại qua ứng dụng được.',
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
      'Gói gia hạn mỗi tháng và hủy lúc nào cũng được. Phí đã trả không hoàn lại.',
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
