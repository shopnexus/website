/* ── Product ── */
export interface Product {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  images: string[];
  category: string;
  subcategory?: string;
  condition: string;
  brand?: string;
  warranty?: string;
  origin?: string;
  description: string;
  location: string;
  postedAt: string;
  seller: Seller;
  isLive?: boolean;
  isFeatured?: boolean;
  imageCount?: number;
  isNegotiable?: boolean;
}

/* ── Seller / Shop ── */
export interface Seller {
  id: string;
  name: string;
  avatar: string;
  isVerified: boolean;
  isMall?: boolean;
  rating: number;
  reviewCount: number;
  soldCount: number;
  followerCount?: number;
  joinDate?: string;
  location?: string;
  description?: string;
  lastActive?: string;
}

/* ── Cart ── */
export interface CartItem {
  id: string;
  product: Product;
  variant: string;
  quantity: number;
}

export interface CartGroup {
  seller: Seller;
  items: CartItem[];
  shopSubtotal: number;
  voucherCode?: string;
}

/* ── Order ── */
export type OrderStatus =
  | "pending_payment"
  | "pending_confirmation"
  | "paid"
  | "shipping"
  | "delivered"
  | "returned";

export interface OrderItem {
  product: Product;
  variant: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  status: OrderStatus;
  seller: Seller;
  items: OrderItem[];
  totalAmount: number;
  shippingFee: number;
  discount: number;
  createdAt: string;
  shippingMethod?: string;
  estimatedDelivery?: string;
  trackingHistory?: TrackingEvent[];
}

export interface TrackingEvent {
  title: string;
  description: string;
  timestamp: string;
  isActive: boolean;
}

/* ── Chat / Inbox ── */
export interface Conversation {
  id: string;
  contact: {
    name: string;
    avatar: string;
    isOnline?: boolean;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  product?: Pick<Product, "id" | "title" | "price" | "images">;
}

export interface ChatMessage {
  id: string;
  content: string;
  imageUrl?: string;
  productCard?: Pick<Product, "id" | "title" | "price" | "images">;
  timestamp: string;
  isSent: boolean;
  isRead?: boolean;
}

/* ── Category ── */
export interface Category {
  id: string;
  name: string;
  icon: string;
  slug: string;
}

/* ── Dashboard Stats ── */
export interface DashboardStat {
  label: string;
  value: string;
  change: number;
  icon: string;
}
