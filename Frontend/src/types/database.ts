/**
 * TypeScript Interfaces & Types cho CSDL PostgreSQL (shop_db)
 * Dự án Website Bán Quần Áo - AETHER LABS / CLOTHES STUDIO
 * Chuẩn xác 100% theo:
 * - 01_schema.sql (Bảng, View, Cột, Ràng buộc, 17 ENUMs)
 * - 02_seed_required.sql (Vai trò, Mã quyền, Cấu hình hệ thống)
 * - 03_seed_demo.sql (Dữ liệu mẫu demo)
 */

// ============================================================================
// 1. DATABASE ENUMS
// ============================================================================

export type UserType = 'customer' | 'staff';

export type AccountStatus = 'active' | 'locked' | 'deleted';

export type OtpChannel = 'email' | 'sms';

export type DiscountType = 'percent' | 'fixed_amount';

export type OrderStatus = 'new' | 'processing' | 'packing' | 'shipping' | 'completed' | 'cancelled';

export type PaymentMethod = 'cod' | 'bank_qr';

export type PaymentStatus = 'unpaid' | 'paid' | 'refunded' | 'partially_refunded';

export type ReturnType = 'exchange' | 'refund';

export type ReturnReason = 'wrong_size' | 'defective' | 'changed_mind' | 'other';

export type ReturnStatus = 'pending' | 'approved' | 'rejected' | 'received' | 'completed';

export type RefundStatus = 'pending' | 'processing' | 'completed' | 'failed';

export type ReviewStatus = 'pending' | 'approved' | 'hidden';

export type MediaType = 'image' | 'video';

export type StockDocumentType = 'import' | 'export' | 'return_import' | 'exchange_export';

export type LoyaltyTxType = 'earn' | 'redeem_order' | 'redeem_gift' | 'refund' | 'adjust';

export type ChatStatus = 'open' | 'closed';

export type SenderType = 'customer' | 'staff';

/** Mã các vai trò chính trong hệ thống */
export type RoleCode = 'CUSTOMER' | 'WAREHOUSE_MANAGER' | 'CS_STAFF' | 'SUPER_ADMIN';

/** Mã các quyền trong hệ thống */
export type PermissionCode =
  // Khách (vãng lai + thành viên)
  | 'PRODUCT_VIEW'
  | 'PRODUCT_SEARCH'
  | 'GUEST_CHECKOUT'
  | 'GUEST_RETURN_REQUEST'
  | 'LIVECHAT_USE'
  | 'ACCOUNT_REGISTER'
  // Khách hàng thành viên
  | 'PROFILE_MANAGE'
  | 'ADDRESS_MANAGE'
  | 'CART_ORDER'
  | 'BUY_NOW'
  | 'VOUCHER_LOYALTY_APPLY'
  | 'ORDER_HISTORY_OWN'
  | 'ORDER_CANCEL_OWN'
  | 'RETURN_REQUEST_CREATE'
  | 'LOYALTY_REDEEM'
  | 'WISHLIST_MANAGE'
  | 'REVIEW_CREATE'
  // Quản lý kho
  | 'PRODUCT_MANAGE'
  | 'STOCK_IO_MANAGE'
  | 'STOCKTAKE_MANAGE'
  | 'ORDER_STATUS_UPDATE'
  | 'RETURN_RECEIVE_CONFIRM'
  | 'WAREHOUSE_REPORT_VIEW'
  // CSKH / Xử lý đơn hàng
  | 'ORDER_HISTORY_ALL_VIEW'
  | 'ORDER_CONFIRM_CANCEL'
  | 'RETURN_REQUEST_REVIEW'
  | 'REFUND_TRACK'
  | 'REVIEW_MODERATE'
  | 'LIVECHAT_REPLY'
  // Admin tối cao
  | 'USER_VIEW'
  | 'ACCOUNT_ROLE_MANAGE'
  | 'SYSTEM_CONFIG'
  | 'LOG_VIEW'
  | 'REPORT_ALL_VIEW'
  | 'MARKETING_MANAGE';

// ============================================================================
// 2. TÀI KHOẢN & PHÂN QUYỀN
// ============================================================================

export interface User {
  id: number;
  phone: string;
  email: string | null;
  password_hash?: string;
  full_name: string | null;
  avatar_url: string | null;
  user_type: UserType;
  status: AccountStatus;
  loyalty_points: number;
  last_login_at: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface Role {
  id: number;
  code: RoleCode | string;
  name: string;
  description: string | null;
}

export interface Permission {
  id: number;
  code: PermissionCode | string;
  name: string;
  module: string | null;
  description: string | null;
}

export interface RolePermission {
  role_id: number;
  permission_id: number;
}

export interface UserRole {
  user_id: number;
  role_id: number;
  assigned_by: number | null;
  assigned_at: string;
}

export interface PasswordResetOtp {
  id: number;
  user_id: number;
  channel: OtpChannel;
  otp_hash: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

export interface CustomerAddress {
  id: number;
  user_id: number;
  label: string | null;
  recipient_name: string;
  recipient_phone: string;
  province: string;
  district: string;
  ward: string;
  street_address: string;
  is_default: boolean;
  created_at: string;
}

// ============================================================================
// 3. DANH MỤC & SẢN PHẨM
// ============================================================================

export interface Category {
  id: number;
  parent_id: number | null;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string | null;
  /** Giá hiển thị 'Từ ...' = MIN(giá các biến thể đang bán). Không dùng làm giá thanh toán */
  base_price: number;
  is_visible: boolean;
  created_by: number | null;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface Size {
  id: number;
  name: string;
  sort_order: number;
}

export interface Color {
  id: number;
  name: string;
  hex_code: string | null;
}

export interface Material {
  id: number;
  name: string;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  sku: string;
  size_id: number | null;
  color_id: number | null;
  material_id: number | null;
  /** Giá bán thực tế của biến thể này */
  price: number;
  is_active: boolean;
  created_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  /** Nếu có variant_id thì ưu tiên hiển thị ảnh cho biến thể/màu sắc tương ứng */
  variant_id: number | null;
  url: string;
  sort_order: number;
  label?: string | null;
  color_id?: number | null;
}

// ============================================================================
// 4. KHUYẾN MÃI & VOUCHER
// ============================================================================

export interface Promotion {
  id: number;
  name: string;
  description: string | null;
  discount_type: DiscountType;
  discount_value: number;
  start_at: string;
  end_at: string;
  is_active: boolean;
  created_by: number | null;
}

export interface PromotionProduct {
  promotion_id: number;
  product_id: number;
}

export interface Voucher {
  id: number;
  code: string;
  discount_type: DiscountType;
  discount_value: number;
  max_discount_amount: number | null;
  min_order_value: number;
  usage_limit: number | null;
  per_user_limit: number;
  used_count: number;
  start_at: string;
  end_at: string;
  is_active: boolean;
  created_by: number | null;
}

export interface VoucherUsage {
  id: number;
  voucher_id: number;
  user_id: number | null;
  order_id: number;
  discount_amount: number;
  used_at: string;
}

// ============================================================================
// 5. ĐƠN HÀNG (TÁCH 6 BẢNG 1-1 + 1-N)
// ============================================================================

export interface ShippingCarrier {
  id: number;
  code: string;
  name: string;
  is_active: boolean;
}

/** 1. Bảng orders chính: Thông tin chung & trạng thái */
export interface Order {
  id: number;
  order_code: string;
  user_id: number | null; // null = khách vãng lai
  is_buy_now: boolean;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  status: OrderStatus;
  note: string | null;
  created_at: string;
  updated_at: string | null;
}

/** 2. Bảng order_customers: Người đặt (bắt buộc với khách vãng lai, snapshot từ profile nếu thành viên) */
export interface OrderCustomer {
  order_id: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
}

/** 3. Bảng order_shipping_addresses: Địa chỉ nhận hàng tại thời điểm đặt */
export interface OrderShippingAddress {
  order_id: number;
  recipient_name: string;
  recipient_phone: string;
  province: string;
  district: string;
  ward: string;
  street_address: string;
}

/** 4. Bảng order_amounts: Tiền, voucher, điểm thưởng */
export interface OrderAmount {
  order_id: number;
  subtotal: number;
  voucher_id: number | null;
  voucher_discount: number;
  points_used: number; // Khách vãng lai = 0
  points_discount: number;
  shipping_fee: number; // Mặc định 30000, miễn phí từ 500000
  total_amount: number; // subtotal + shipping_fee - voucher_discount - points_discount
}

/** 5. Bảng order_shipments: Thông tin vận chuyển */
export interface OrderShipment {
  order_id: number;
  shipping_carrier_id: number | null;
  tracking_code: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
}

/** 6. Bảng order_cancellations: Hủy đơn */
export interface OrderCancellation {
  order_id: number;
  reason: string;
  cancelled_by: number | null; // null = khách vãng lai tự hủy
  cancelled_at: string;
}

/** Chi tiết từng mặt hàng trong đơn: order_items */
export interface OrderItem {
  id: number;
  order_id: number;
  variant_id: number;
  product_name: string;
  variant_label: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface OrderStatusHistory {
  id: number;
  order_id: number;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  changed_by: number | null;
  note: string | null;
  created_at: string;
}

export interface Payment {
  id: number;
  order_id: number;
  method: PaymentMethod;
  amount: number;
  status: PaymentStatus;
  transaction_ref: string | null;
  qr_content: string | null;
  paid_at: string | null;
  created_at: string;
}

// ============================================================================
// 6. ĐIỂM THƯỞNG (LOYALTY)
// ============================================================================

export interface LoyaltyReward {
  id: number;
  name: string;
  description: string | null;
  points_required: number;
  stock: number;
  is_active: boolean;
}

export interface RewardRedemption {
  id: number;
  user_id: number;
  reward_id: number;
  points_spent: number;
  created_at: string;
}

export interface LoyaltyTransaction {
  id: number;
  user_id: number;
  type: LoyaltyTxType;
  points: number;
  order_id: number | null;
  redemption_id: number | null;
  note: string | null;
  created_at: string;
}

// ============================================================================
// 7. GIỎ HÀNG & WISHLIST
// ============================================================================

export interface Cart {
  id: number;
  user_id: number | null;
  session_token: string | null;
  created_at: string;
  updated_at: string | null;
  expires_at: string | null;
}

export interface CartItem {
  id: number;
  cart_id: number;
  variant_id: number;
  quantity: number;
  added_at: string;
}

export interface Wishlist {
  user_id: number;
  variant_id: number;
  created_at: string;
}

// ============================================================================
// 8. ĐỔI TRẢ & HOÀN TIỀN
// ============================================================================

export interface ReturnRequest {
  id: number;
  request_code: string;
  order_id: number;
  user_id: number | null;
  type: ReturnType;
  reason: ReturnReason;
  description: string | null;
  status: ReturnStatus;
  reviewed_by: number | null;
  reviewed_at: string | null;
  reject_reason: string | null;
  received_by: number | null;
  received_at: string | null;
  created_at: string;
}

export interface ReturnRequestItem {
  id: number;
  return_request_id: number;
  order_item_id: number;
  quantity: number;
  exchange_variant_id: number | null;
  condition_note: string | null;
  is_restocked: boolean;
}

export interface ReturnRequestMedia {
  id: number;
  return_request_id: number;
  media_type: MediaType;
  url: string;
}

export interface Refund {
  id: number;
  return_request_id: number | null;
  order_id: number;
  amount: number;
  status: RefundStatus;
  bank_name: string | null;
  bank_account_no: string | null;
  bank_account_name: string | null;
  processed_by: number | null;
  completed_at: string | null;
  created_at: string;
}

// ============================================================================
// 9. ĐÁNH GIÁ (REVIEWS)
// ============================================================================

export interface Review {
  id: number;
  product_id: number;
  order_item_id: number;
  user_id: number;
  rating: number; // 1 -> 5
  content: string | null;
  status: ReviewStatus;
  moderated_by: number | null;
  moderated_at: string | null;
  created_at: string;
}

export interface ReviewMedia {
  id: number;
  review_id: number;
  media_type: MediaType;
  url: string;
}

// ============================================================================
// 10. KHO & KIỂM KÊ
// ============================================================================

export interface Inventory {
  variant_id: number;
  quantity_on_hand: number;
  quantity_reserved: number;
  updated_at: string | null;
}

export interface Supplier {
  id: number;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export interface StockDocument {
  id: number;
  code: string;
  type: StockDocumentType;
  supplier_id: number | null;
  order_id: number | null;
  shipping_carrier_id: number | null;
  return_request_id: number | null;
  created_by: number;
  note: string | null;
  created_at: string;
}

export interface StockDocumentItem {
  id: number;
  stock_document_id: number;
  variant_id: number;
  quantity: number;
  unit_cost: number | null;
}

export interface Stocktake {
  id: number;
  code: string;
  created_by: number;
  note: string | null;
  created_at: string;
}

export interface StocktakeItem {
  id: number;
  stocktake_id: number;
  variant_id: number;
  system_quantity: number;
  actual_quantity: number;
  difference: number;
}

// ============================================================================
// 11. LIVE CHAT & HỆ THỐNG
// ============================================================================

export interface ChatConversation {
  id: number;
  customer_id: number | null;
  guest_name: string | null;
  guest_contact: string | null;
  assigned_staff_id: number | null;
  status: ChatStatus;
  created_at: string;
  closed_at: string | null;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_type: SenderType;
  sender_id: number | null;
  content: string | null;
  attachment_url: string | null;
  read_at: string | null;
  created_at: string;
}

export interface SystemSetting {
  key: string;
  value: string | null;
  group_name: string | null;
  updated_by: number | null;
  updated_at: string | null;
}

export interface ActivityLog {
  id: number;
  user_id: number | null;
  action: string;
  entity_type: string | null;
  entity_id: number | null;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export interface MarketingCampaign {
  id: number;
  name: string;
  description: string | null;
  channel: string | null;
  voucher_id: number | null;
  start_at: string | null;
  end_at: string | null;
  is_active: boolean;
  created_by: number | null;
}

// ============================================================================
// 12. VIEWS (CHÍNH XÁC THEO 01_schema.sql)
// ============================================================================

/**
 * View v_inventory_available
 * Tồn kho có thể bán = quantity_on_hand - quantity_reserved
 */
export interface InventoryAvailableView {
  variant_id: number;
  sku: string;
  product_name: string;
  size: string | null;
  color: string | null;
  material: string | null;
  quantity_on_hand: number;
  quantity_reserved: number;
  /** Tuyệt đối không cho khách chọn mua quá quantity_available */
  quantity_available: number;
}

/**
 * View v_product_rating
 * Điểm đánh giá trung bình & tổng số lượt đánh giá đã duyệt
 */
export interface ProductRatingView {
  product_id: number;
  review_count: number;
  avg_rating: number;
}

/**
 * View v_user_permissions
 * Tra cứu phân quyền tài khoản
 */
export interface UserPermissionView {
  user_id: number;
  phone: string;
  email: string | null;
  role: RoleCode | string;
  permission: PermissionCode | string;
}

/**
 * View v_order_details
 * Cấu trúc phẳng gộp từ 6 bảng orders, dùng hiển thị danh sách / chi tiết đơn hàng
 */
export interface OrderDetailView {
  order_id: number;
  order_code: string;
  user_id: number | null;
  is_buy_now: boolean;
  status: OrderStatus;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  note: string | null;
  created_at: string;
  updated_at: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  recipient_name: string;
  recipient_phone: string;
  province: string;
  district: string;
  ward: string;
  street_address: string;
  subtotal: number;
  voucher_id: number | null;
  voucher_code: string | null;
  voucher_discount: number;
  points_used: number;
  points_discount: number;
  shipping_fee: number;
  total_amount: number;
  shipping_carrier_id: number | null;
  shipping_carrier_name: string | null;
  tracking_code: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  cancel_reason: string | null;
  cancelled_by: number | null;
  cancelled_at: string | null;
  item_count: number;
}

// ============================================================================
// 13. TRANSACTION PAYLOADS & ENRICHED FRONTEND MODELS
// ============================================================================

/** Từng món hàng trong payload tạo đơn hàng */
export interface CreateOrderItemPayload {
  variant_id: number;
  product_name: string;
  variant_label?: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
}

/**
 * Payload gửi lên API POST /api/orders
 * Gom đầy đủ dữ liệu cho transaction 6 bảng trong CSDL
 */
export interface CreateOrderPayload {
  // 1. orders: Thông tin chung
  is_buy_now?: boolean;
  payment_method: PaymentMethod;
  note?: string | null;

  // 2. order_customers: Người đặt
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;

  // 3. order_shipping_addresses: Địa chỉ nhận
  recipient_name: string;
  recipient_phone: string;
  province: string;
  district: string;
  ward: string;
  street_address: string;

  // 4. order_amounts: Tiền & Giảm giá
  subtotal: number;
  voucher_id?: number | null;
  voucher_discount?: number;
  /** Chỉ cho phép khi đã đăng nhập thành viên; Khách vãng lai bắt buộc = 0 */
  points_used?: number;
  points_discount?: number;
  /** Mặc định 30000; miễn phí (0) khi subtotal >= 500000 theo system_settings */
  shipping_fee: number;
  /** total_amount = subtotal + shipping_fee - voucher_discount - points_discount */
  total_amount: number;

  // 5. order_items: Danh sách mặt hàng
  items: CreateOrderItemPayload[];
}

/** Payload gộp giỏ hàng khách vãng lai khi đăng nhập */
export interface MergeGuestCartPayload {
  session_token: string;
  user_id: number;
}

/** Biến thể kèm theo thông tin hiển thị Size, Color, Material và Tồn kho */
export interface VariantWithDetails extends ProductVariant {
  size?: Size | null;
  color?: Color | null;
  material?: Material | null;
  inventory?: InventoryAvailableView | null;
}

/** Sản phẩm đầy đủ dữ liệu để hiển thị giao diện UI */
export interface ProductWithDetails extends Product {
  category?: Category | null;
  variants: VariantWithDetails[];
  images: ProductImage[];
  rating?: ProductRatingView | null;
  video_url?: string | null;
}

/** Chi tiết giỏ hàng đầy đủ cho UI */
export interface CartItemWithDetails extends CartItem {
  variant: VariantWithDetails;
  product: Product;
  image?: ProductImage | null;
}

/** Giỏ hàng đầy đủ */
export interface CartWithDetails extends Cart {
  items: CartItemWithDetails[];
  item_count: number;
  subtotal: number;
}

/** Đơn hàng đầy đủ bao gồm view phẳng và danh sách sản phẩm */
export interface OrderComplete extends OrderDetailView {
  items: OrderItem[];
  status_history?: OrderStatusHistory[];
  payment?: Payment | null;
}

