// ─────────────────────────────────────────────────────────────────────────────
// catalog.mock.ts
// Mock data for listing, SKU, category, tag, review, favorites.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  Category,
  CategoryList,
  Tag,
  TagList,
  Sku,
  Stock,
  Listing,
  ListingPage,
  ListingDetail,
  Review,
  ReviewPage,
  ReviewReply,
  ReviewVoteTally,
  Favorite,
  FavoritePage,
} from '@/types/catalog.type';
import { mockResource, mockAvatarResource } from './common.mock';
import { mockSellerAccountSummary, mockAccountSummary } from './account.mock';

// ── Categories ────────────────────────────────────────────────────────────────

export const mockCategoryElectronics: Category = {
  id: 'cat_7v2p41ryaj811',
  name: 'Điện tử',
  description: 'Điện thoại, laptop, máy tính bảng và các thiết bị điện tử khác',
  parent_id: null,
};

export const mockCategoryPhone: Category = {
  id: 'cat_phonesubcat001',
  name: 'Điện thoại',
  description: 'Điện thoại thông minh đã qua sử dụng',
  parent_id: 'cat_7v2p41ryaj811',
};

export const mockCategoryFashion: Category = {
  id: 'cat_fashioncat001',
  name: 'Thời trang',
  description: 'Quần áo, giày dép, phụ kiện thời trang',
  parent_id: null,
};

export const mockCategoryList: CategoryList = {
  items: [mockCategoryElectronics, mockCategoryPhone, mockCategoryFashion],
};

// ── Tags ──────────────────────────────────────────────────────────────────────

export const mockTagHandmade: Tag = { slug: 'handmade', description: 'Sản phẩm thủ công' };
export const mockTagVintage: Tag = { slug: 'vintage', description: 'Đồ cổ điển vintage' };
export const mockTagElectronics: Tag = { slug: 'electronics', description: null };

export const mockTagList: TagList = {
  items: [mockTagHandmade, mockTagVintage, mockTagElectronics],
};

// ── SKU & Stock ───────────────────────────────────────────────────────────────

export const mockStock: Stock = {
  sku_id: 'sku_vq1wd6ptz3n8k',
  stock: 5,
  reserved: 1,
  available: 4,
};

export const mockSku: Sku = {
  id: 'sku_vq1wd6ptz3n8k',
  price: 3500000,
  attributes: { color: 'Space Gray', storage: '128GB' },
  package_details: { weight_kg: 0.18, length_cm: 15, width_cm: 8, height_cm: 1 },
  images: [mockResource],
  created_at: '2025-05-01T08:00:00Z',
  stock: mockStock,
};

export const mockSkuSecondVariant: Sku = {
  id: 'sku_variant2nd0001',
  price: 3200000,
  attributes: { color: 'Starlight', storage: '64GB' },
  package_details: { weight_kg: 0.18, length_cm: 15, width_cm: 8, height_cm: 1 },
  images: [],
  created_at: '2025-05-01T08:00:00Z',
  stock: { sku_id: 'sku_variant2nd0001', stock: 2, reserved: 0, available: 2 },
};

// ── Listing (card) ────────────────────────────────────────────────────────────

export const mockListing: Listing = {
  id: 'spu_1ryaj8117v2p4',
  slug: 'iphone-12-128gb-space-gray-99',
  name: 'iPhone 12 128GB Space Gray - 99% like new',
  status: 'active',
  condition: 'used',
  price_mode: 'fixed',
  currency: 'VND',
  price: 3500000,
  rating: 4.7,
  category_id: 'cat_phonesubcat001',
  seller: mockSellerAccountSummary,
  created_at: '2025-05-01T10:00:00Z',
  cover: mockResource,
};

export const mockListingNegotiable: Listing = {
  id: 'spu_laptop2nd00001',
  slug: 'macbook-air-m1-2020-cu',
  name: 'MacBook Air M1 2020 - Like new 95%',
  status: 'active',
  condition: 'used',
  price_mode: 'negotiable',
  currency: 'VND',
  price: 18500000,
  rating: 4.9,
  category_id: 'cat_7v2p41ryaj811',
  seller: mockSellerAccountSummary,
  created_at: '2025-04-15T09:00:00Z',
  cover: { ...mockResource, id: 'res_macbookcoverim1', url: 'https://picsum.photos/seed/macbook/500/500' },
};

export const mockListingPage: ListingPage = {
  items: [
    mockListing,
    mockListingNegotiable,
    { ...mockListing, id: 'spu_item3example001', slug: 'samsung-s23-128gb', name: 'Samsung Galaxy S23 128GB - Fullbox', price: 8900000 },
    { ...mockListing, id: 'spu_item4example001', slug: 'airpods-pro-2', name: 'AirPods Pro 2 - Mới 99%', price: 4200000 },
    { ...mockListing, id: 'spu_item5example001', slug: 'ipad-pro-11-2022', name: 'iPad Pro 11 inch 2022 256GB', price: 12000000 },
    { ...mockListing, id: 'spu_item6example001', slug: 'apple-watch-s8', name: 'Apple Watch Series 8 GPS', price: 6500000 },
    { ...mockListing, id: 'spu_item7example001', slug: 'dell-xps-15-2023', name: 'Dell XPS 15 2023 Core i7', price: 22000000 },
    { ...mockListing, id: 'spu_item8example001', slug: 'sony-wh1000xm5', name: 'Tai nghe Sony WH-1000XM5 - 99%', price: 5800000 },
    { ...mockListing, id: 'spu_item9example001', slug: 'gopro-hero11', name: 'GoPro Hero 11 Black - Fullbox', price: 7200000 },
    { ...mockListing, id: 'spu_item10example01', slug: 'xiaomi-14-pro', name: 'Xiaomi 14 Pro 256GB - Chính hãng', price: 13500000 },
  ],
  next_cursor: 'spu_item10example01',
};

// ── Listing Detail ────────────────────────────────────────────────────────────

export const mockListingDetail: ListingDetail = {
  id: 'spu_1ryaj8117v2p4',
  slug: 'iphone-12-128gb-space-gray-99',
  name: 'iPhone 12 128GB Space Gray - 99% like new',
  description: `Máy mình mua chính hãng, dùng được 6 tháng bảo hành còn 18 tháng.
Màn hình, body không trầy xước. Zin 100%, chưa sửa chữa.
Đầy đủ phụ kiện: hộp, sạc, tai nghe.

Thông số:
- Màn hình: 6.1 inch Super Retina XDR
- Chip: A14 Bionic
- RAM: 4GB / ROM: 128GB
- Pin: 2815 mAh, sức khỏe pin 94%
- 5G, Face ID, IP68`,
  status: 'active',
  condition: 'used',
  price_mode: 'fixed',
  shipping_paid_by: 'buyer',
  currency: 'VND',
  specifications: {
    brand: 'Apple',
    model: 'iPhone 12',
    storage: '128GB',
    color: 'Space Gray',
    battery_health: '94%',
    warranty_remaining: '18 tháng',
  },
  images: [
    mockResource,
    { ...mockResource, id: 'res_iphone12img002', url: 'https://picsum.photos/seed/iphone12_2/500/500' },
    { ...mockResource, id: 'res_iphone12img003', url: 'https://picsum.photos/seed/iphone12_3/500/500' },
  ],
  category: mockCategoryPhone,
  tags: ['electronics'],
  skus: [mockSku, mockSkuSecondVariant],
  rating: 4.7,
  seller: mockSellerAccountSummary,
  created_at: '2025-05-01T10:00:00Z',
  featured_sku_id: 'sku_vq1wd6ptz3n8k',
  pending_edit: null,
};

// ── Reviews ───────────────────────────────────────────────────────────────────

export const mockReviewVoteTally: ReviewVoteTally = {
  helpful: 12,
  not_helpful: 1,
  my_vote: 1,
};

export const mockReviewReply: ReviewReply = {
  id: 'rpl_mfx7bd32h9qk4',
  author: mockSellerAccountSummary,
  is_seller: true,
  body: 'Cảm ơn bạn đã tin tưởng mua hàng! Rất vui vì bạn hài lòng với sản phẩm 🎉',
  created_at: '2025-05-25T15:00:00Z',
};

export const mockReview: Review = {
  id: 'rvw_qk4mfx7bd32h9',
  spu_id: 'spu_1ryaj8117v2p4',
  author: mockAccountSummary,
  rating: 5,
  body: 'Máy đúng như mô tả, shop giao hàng nhanh, đóng gói cẩn thận. Rất hài lòng!',
  attachments: [mockResource],
  replies: [mockReviewReply],
  votes: mockReviewVoteTally,
  created_at: '2025-05-24T09:00:00Z',
};

export const mockReviewPage: ReviewPage = {
  items: [
    mockReview,
    {
      ...mockReview,
      id: 'rvw_review2example',
      author: { id: 'acc_user2example001', name: 'Trần Thị Bích', avatar: null },
      rating: 4,
      body: 'Máy ổn, pin hơi xuống nhưng đúng mô tả. Shop tư vấn nhiệt tình.',
      replies: [],
      votes: { helpful: 3, not_helpful: 0, my_vote: null },
      created_at: '2025-05-10T14:00:00Z',
    },
  ],
  next_cursor: null,
};

// ── Favorites ─────────────────────────────────────────────────────────────────

export const mockFavorite: Favorite = {
  spu_id: 'spu_1ryaj8117v2p4',
  created_at: '2025-06-01T10:00:00Z',
};

export const mockFavoritePage: FavoritePage = {
  items: [
    mockFavorite,
    { spu_id: 'spu_laptop2nd00001', created_at: '2025-05-28T08:00:00Z' },
    { spu_id: 'spu_item3example001', created_at: '2025-05-20T12:00:00Z' },
  ],
  next_cursor: null,
};
