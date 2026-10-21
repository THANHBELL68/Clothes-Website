/**
 * Mock Data chuẩn xác 100% CSDL PostgreSQL (shop_db)
 * - Khởi tạo từ 02_seed_required.sql & 03_seed_demo.sql
 * - Sản phẩm CSDL: Áo thun basic (AT01-DEN-M, AT01-DEN-L, AT01-TRANG-M), Quần jean slim (QJ01-XANH-30)
 * - Bổ sung sản phẩm Streetwear/Techwear AETHER LABS (Mã 479073 & Mã 486116)
 * - Đơn vị tiền tệ: 100% Việt Nam Đồng (VNĐ - ₫)
 * - Tương thích ngược với các store hiện tại (CATEGORIES, PRODUCTS, COUPONS)
 */

import type {
  Category,
  Size,
  Color,
  Material,
  Product,
  ProductVariant,
  ProductImage,
  InventoryAvailableView,
  ProductRatingView,
  Voucher,
  OrderDetailView,
  OrderItem,
  ProductWithDetails,
  SystemSetting,
  User,
  CreateOrderPayload,
} from '../types/database';

// ============================================================================
// 1. THUỘC TÍNH SẢN PHẨM (SIZES, COLORS, MATERIALS - Theo 03_seed_demo.sql)
// ============================================================================

export const MOCK_SIZES: Size[] = [
  { id: 1, name: 'S', sort_order: 1 },
  { id: 2, name: 'M', sort_order: 2 },
  { id: 3, name: 'L', sort_order: 3 },
  { id: 4, name: 'XL', sort_order: 4 },
];

export const MOCK_COLORS: Color[] = [
  { id: 1, name: 'Trắng', hex_code: '#FFFFFF' },
  { id: 2, name: 'Beige', hex_code: '#E8D8C8' },
  { id: 3, name: 'Navy', hex_code: '#1E293B' },
  { id: 4, name: 'Be / Tự Nhiên', hex_code: '#E8DFC8' },
];

export const MOCK_MATERIALS: Material[] = [
  { id: 1, name: 'Vải Rayon' },
  { id: 2, name: 'Lông Cừu Cản Gió' },
];

// ============================================================================
// 2. DANH MỤC (CATEGORIES - 2 LOẠI: ÁO NỮ VÀ ÁO NAM)
// ============================================================================

export const MOCK_CATEGORIES: Category[] = [
  { id: 1, parent_id: null, name: 'ÁO NỮ', slug: 'ao-nu', is_active: true, sort_order: 1 },
  { id: 2, parent_id: null, name: 'ÁO NAM', slug: 'ao-nam', is_active: true, sort_order: 2 },
];

// ============================================================================
// 3. ĐƠN VỊ VẬN CHUYỂN & CẤU HÌNH HỆ THỐNG (Theo 02_seed_required.sql)
// ============================================================================

export const MOCK_SHIPPING_CARRIERS = [
  { id: 1, code: 'GHN', name: 'Giao Hàng Nhanh', is_active: true },
  { id: 2, code: 'GHTK', name: 'Giao Hàng Tiết Kiệm', is_active: true },
];

export const MOCK_SYSTEM_SETTINGS: SystemSetting[] = [
  { key: 'payment.cod_enabled', value: 'true', group_name: 'payment', updated_by: null, updated_at: '2026-10-01T00:00:00Z' },
  { key: 'payment.bank_qr_info', value: 'VCB - 9988776655 - AETHER LABS CORP', group_name: 'payment', updated_by: null, updated_at: '2026-10-01T00:00:00Z' },
  { key: 'shipping.default_fee', value: '30000', group_name: 'shipping', updated_by: null, updated_at: '2026-10-01T00:00:00Z' },
  { key: 'shipping.free_from', value: '500000', group_name: 'shipping', updated_by: null, updated_at: '2026-10-01T00:00:00Z' },
  { key: 'return.window_days', value: '7', group_name: 'general', updated_by: null, updated_at: '2026-10-01T00:00:00Z' },
  { key: 'cart.guest_ttl_days', value: '30', group_name: 'general', updated_by: null, updated_at: '2026-10-01T00:00:00Z' },
  { key: 'loyalty.earn_vnd_per_point', value: '10000', group_name: 'general', updated_by: null, updated_at: '2026-10-01T00:00:00Z' },
  { key: 'loyalty.point_value_vnd', value: '1000', group_name: 'general', updated_by: null, updated_at: '2026-10-01T00:00:00Z' },
];

export const MOCK_PRODUCT_VARIANTS: ProductVariant[] = [
  // Sản phẩm 1: Áo Nữ Rayon 479073 (product_id = 1) - Màu Trắng (color_id = 1)
  { id: 101, product_id: 1, sku: 'AKN-479073-00-S', size_id: 1, color_id: 1, material_id: 1, price: 599000, is_active: true, created_at: '2026-10-05T00:00:00Z' },
  { id: 102, product_id: 1, sku: 'AKN-479073-00-M', size_id: 2, color_id: 1, material_id: 1, price: 599000, is_active: true, created_at: '2026-10-05T00:00:00Z' },
  { id: 103, product_id: 1, sku: 'AKN-479073-00-L', size_id: 3, color_id: 1, material_id: 1, price: 599000, is_active: true, created_at: '2026-10-05T00:00:00Z' },
  { id: 104, product_id: 1, sku: 'AKN-479073-00-XL', size_id: 4, color_id: 1, material_id: 1, price: 599000, is_active: true, created_at: '2026-10-05T00:00:00Z' },
  // Sản phẩm 1: Áo Nữ Rayon 479073 (product_id = 1) - Màu Beige (color_id = 2)
  { id: 105, product_id: 1, sku: 'AKN-479073-10-S', size_id: 1, color_id: 2, material_id: 1, price: 599000, is_active: true, created_at: '2026-10-05T00:00:00Z' },
  { id: 106, product_id: 1, sku: 'AKN-479073-10-M', size_id: 2, color_id: 2, material_id: 1, price: 599000, is_active: true, created_at: '2026-10-05T00:00:00Z' },
  { id: 107, product_id: 1, sku: 'AKN-479073-10-L', size_id: 3, color_id: 2, material_id: 1, price: 599000, is_active: true, created_at: '2026-10-05T00:00:00Z' },
  { id: 108, product_id: 1, sku: 'AKN-479073-10-XL', size_id: 4, color_id: 2, material_id: 1, price: 599000, is_active: true, created_at: '2026-10-05T00:00:00Z' },

  // Sản phẩm 2: Áo Nam Lông Cừu 486116 (product_id = 2) - Màu Navy (color_id = 3)
  { id: 201, product_id: 2, sku: 'AKM-486116-69-S', size_id: 1, color_id: 3, material_id: 2, price: 899000, is_active: true, created_at: '2026-10-05T00:00:00Z' },
  { id: 202, product_id: 2, sku: 'AKM-486116-69-M', size_id: 2, color_id: 3, material_id: 2, price: 899000, is_active: true, created_at: '2026-10-05T00:00:00Z' },
  { id: 203, product_id: 2, sku: 'AKM-486116-69-L', size_id: 3, color_id: 3, material_id: 2, price: 899000, is_active: true, created_at: '2026-10-05T00:00:00Z' },
  { id: 204, product_id: 2, sku: 'AKM-486116-69-XL', size_id: 4, color_id: 3, material_id: 2, price: 899000, is_active: true, created_at: '2026-10-05T00:00:00Z' },
  // Sản phẩm 2: Áo Nam Lông Cừu 486116 (product_id = 2) - Màu Be / Tự Nhiên (color_id = 4)
  { id: 205, product_id: 2, sku: 'AKM-486116-30-S', size_id: 1, color_id: 4, material_id: 2, price: 899000, is_active: true, created_at: '2026-10-05T00:00:00Z' },
  { id: 206, product_id: 2, sku: 'AKM-486116-30-M', size_id: 2, color_id: 4, material_id: 2, price: 899000, is_active: true, created_at: '2026-10-05T00:00:00Z' },
  { id: 207, product_id: 2, sku: 'AKM-486116-30-L', size_id: 3, color_id: 4, material_id: 2, price: 899000, is_active: true, created_at: '2026-10-05T00:00:00Z' },
  { id: 208, product_id: 2, sku: 'AKM-486116-30-XL', size_id: 4, color_id: 4, material_id: 2, price: 899000, is_active: true, created_at: '2026-10-05T00:00:00Z' },
];

/**
 * View v_inventory_available (Dữ liệu tồn kho thực tế - Giữ chỗ = Tồn kho có thể bán)
 */
export const MOCK_INVENTORY_AVAILABLE: InventoryAvailableView[] = [
  { variant_id: 101, sku: 'AKN-479073-00-S', product_name: 'Nữ Áo Kiểu Vải Rayon', size: 'S', color: 'Trắng', material: 'Vải Rayon', quantity_on_hand: 24, quantity_reserved: 2, quantity_available: 22 },
  { variant_id: 102, sku: 'AKN-479073-00-M', product_name: 'Nữ Áo Kiểu Vải Rayon', size: 'M', color: 'Trắng', material: 'Vải Rayon', quantity_on_hand: 35, quantity_reserved: 0, quantity_available: 35 },
  { variant_id: 103, sku: 'AKN-479073-00-L', product_name: 'Nữ Áo Kiểu Vải Rayon', size: 'L', color: 'Trắng', material: 'Vải Rayon', quantity_on_hand: 18, quantity_reserved: 0, quantity_available: 18 },
  { variant_id: 104, sku: 'AKN-479073-00-XL', product_name: 'Nữ Áo Kiểu Vải Rayon', size: 'XL', color: 'Trắng', material: 'Vải Rayon', quantity_on_hand: 10, quantity_reserved: 0, quantity_available: 10 },
  { variant_id: 105, sku: 'AKN-479073-10-S', product_name: 'Nữ Áo Kiểu Vải Rayon', size: 'S', color: 'Beige', material: 'Vải Rayon', quantity_on_hand: 15, quantity_reserved: 0, quantity_available: 15 },
  { variant_id: 106, sku: 'AKN-479073-10-M', product_name: 'Nữ Áo Kiểu Vải Rayon', size: 'M', color: 'Beige', material: 'Vải Rayon', quantity_on_hand: 28, quantity_reserved: 1, quantity_available: 27 },
  { variant_id: 107, sku: 'AKN-479073-10-L', product_name: 'Nữ Áo Kiểu Vải Rayon', size: 'L', color: 'Beige', material: 'Vải Rayon', quantity_on_hand: 20, quantity_reserved: 0, quantity_available: 20 },
  { variant_id: 108, sku: 'AKN-479073-10-XL', product_name: 'Nữ Áo Kiểu Vải Rayon', size: 'XL', color: 'Beige', material: 'Vải Rayon', quantity_on_hand: 12, quantity_reserved: 0, quantity_available: 12 },

  { variant_id: 201, sku: 'AKM-486116-69-S', product_name: 'Nam Áo Khoác Lông Cừu', size: 'S', color: 'Navy', material: 'Lông Cừu Cản Gió', quantity_on_hand: 15, quantity_reserved: 0, quantity_available: 15 },
  { variant_id: 202, sku: 'AKM-486116-69-M', product_name: 'Nam Áo Khoác Lông Cừu', size: 'M', color: 'Navy', material: 'Lông Cừu Cản Gió', quantity_on_hand: 35, quantity_reserved: 3, quantity_available: 32 },
  { variant_id: 203, sku: 'AKM-486116-69-L', product_name: 'Nam Áo Khoác Lông Cừu', size: 'L', color: 'Navy', material: 'Lông Cừu Cản Gió', quantity_on_hand: 20, quantity_reserved: 0, quantity_available: 20 },
  { variant_id: 204, sku: 'AKM-486116-69-XL', product_name: 'Nam Áo Khoác Lông Cừu', size: 'XL', color: 'Navy', material: 'Lông Cừu Cản Gió', quantity_on_hand: 12, quantity_reserved: 0, quantity_available: 12 },
  { variant_id: 205, sku: 'AKM-486116-30-S', product_name: 'Nam Áo Khoác Lông Cừu', size: 'S', color: 'Be / Tự Nhiên', material: 'Lông Cừu Cản Gió', quantity_on_hand: 18, quantity_reserved: 0, quantity_available: 18 },
  { variant_id: 206, sku: 'AKM-486116-30-M', product_name: 'Nam Áo Khoác Lông Cừu', size: 'M', color: 'Be / Tự Nhiên', material: 'Lông Cừu Cản Gió', quantity_on_hand: 30, quantity_reserved: 0, quantity_available: 30 },
  { variant_id: 207, sku: 'AKM-486116-30-L', product_name: 'Nam Áo Khoác Lông Cừu', size: 'L', color: 'Be / Tự Nhiên', material: 'Lông Cừu Cản Gió', quantity_on_hand: 25, quantity_reserved: 1, quantity_available: 24 },
  { variant_id: 208, sku: 'AKM-486116-30-XL', product_name: 'Nam Áo Khoác Lông Cừu', size: 'XL', color: 'Be / Tự Nhiên', material: 'Lông Cừu Cản Gió', quantity_on_hand: 14, quantity_reserved: 0, quantity_available: 14 },
];

/**
 * View v_product_rating (Điểm đánh giá trung bình & lượt review đã duyệt)
 */
export const MOCK_PRODUCT_RATINGS: ProductRatingView[] = [
  { product_id: 1, review_count: 56, avg_rating: 4.9 },
  { product_id: 2, review_count: 84, avg_rating: 5.0 },
];

// ============================================================================
// 5. HÌNH ẢNH SẢN PHẨM (product_images)
// ============================================================================

export const MOCK_PRODUCT_IMAGES: ProductImage[] = [
  // Ảnh Áo kiểu Rayon Nữ (product_id = 1)
  { id: 10, product_id: 1, variant_id: 101, color_id: 1, url: '/images/products/nu_demo/san_pham1/vngoods_00_479073_3x4.avif', sort_order: 1, label: 'Người mẫu: 168cm / Size quần áo: S' },
  { id: 11, product_id: 1, variant_id: 105, color_id: 2, url: '/images/products/nu_demo/san_pham1/vngoods_10_479073_3x4.avif', sort_order: 2, label: 'Người mẫu: 168cm / Size quần áo: S' },
  { id: 12, product_id: 1, variant_id: null, color_id: null, url: '/images/products/nu_demo/san_pham1/vngoods_479073_sub3_3x4.avif', sort_order: 3, label: 'Chi tiết thiết kế cổ mở thanh lịch' },
  { id: 13, product_id: 1, variant_id: null, color_id: null, url: '/images/products/nu_demo/san_pham1/goods_479073_sub14_3x4.avif', sort_order: 4, label: 'Chất vải Rayon mềm mại rủ nhẹ' },

  // Ảnh Áo khoác lông cừu Nam (product_id = 2) - Bố cục 4 ảnh đúng như ảnh người dùng chụp!
  // Góc 1 (Trên - Trái): Người mẫu 176cm mặc màu Be / Tự nhiên
  { id: 20, product_id: 2, variant_id: 205, color_id: 4, url: '/images/products/nam_demo/san_pham1/vngoods_486116_sub4_3x4.avif', sort_order: 1, label: 'Người mẫu: 176cm / Size quần áo: L' },
  // Góc 2 (Trên - Phải): Người mẫu 176cm phối đồ màu Navy
  { id: 21, product_id: 2, variant_id: 201, color_id: 3, url: '/images/products/nam_demo/san_pham1/vngoods_486116_sub3_3x4.avif', sort_order: 2, label: 'Người mẫu: 176cm / Size quần áo: L' },
  // Góc 3 (Dưới - Trái): Ảnh chụp phẳng 4 màu áo
  { id: 22, product_id: 2, variant_id: null, color_id: null, url: '/images/products/nam_demo/san_pham1/goods_486116_sub11_3x4.avif', sort_order: 3, label: 'Bảng 4 phối màu áo khoác' },
  // Góc 4 (Dưới - Phải): Cận cảnh cổ áo lông cừu & cúc bấm hợp kim
  { id: 23, product_id: 2, variant_id: null, color_id: null, url: '/images/products/nam_demo/san_pham1/goods_486116_sub20_3x4.avif', sort_order: 4, label: 'Cổ đứng cản gió & cúc bấm hợp kim' },
  // Ảnh phom áo màu Navy
  { id: 24, product_id: 2, variant_id: 201, color_id: 3, url: '/images/products/nam_demo/san_pham1/vngoods_69_486116_3x4.avif', sort_order: 5, label: 'Phom áo khoác màu Navy' },
];

// ============================================================================
// 6. SẢN PHẨM HOÀN CHỈNH KÈM CHI TIẾT (ProductWithDetails)
// ============================================================================

export const MOCK_PRODUCTS_WITH_DETAILS: ProductWithDetails[] = [
  {
    id: 1,
    category_id: 1,
    name: 'Nữ Áo Kiểu Vải Rayon Cổ Mở - Tay Lửng 3/4',
    slug: 'nu-ao-kieu-vai-rayon-co-mo-tay-lung',
    description: 'Phong cách thanh lịch, phù hợp cho những bản phối công sở hiện đại. Chiều dài thân áo và tay áo được tinh chỉnh cân đối, mang đến vẻ ngoài chỉn chu, thời trang.',
    base_price: 599000,
    is_visible: true,
    created_by: 1,
    created_at: '2026-10-05T00:00:00Z',
    updated_at: '2026-10-05T00:00:00Z',
    deleted_at: null,
    category: MOCK_CATEGORIES[0],
    rating: MOCK_PRODUCT_RATINGS[0],
    video_url: '/images/products/nu_demo/san_pham1/video_intro.mp4',
    variants: [
      {
        ...MOCK_PRODUCT_VARIANTS[0],
        size: MOCK_SIZES[0],
        color: MOCK_COLORS[0],
        material: MOCK_MATERIALS[0],
        inventory: MOCK_INVENTORY_AVAILABLE[0],
      },
      {
        ...MOCK_PRODUCT_VARIANTS[1],
        size: MOCK_SIZES[1],
        color: MOCK_COLORS[0],
        material: MOCK_MATERIALS[0],
        inventory: MOCK_INVENTORY_AVAILABLE[1],
      },
      {
        ...MOCK_PRODUCT_VARIANTS[2],
        size: MOCK_SIZES[2],
        color: MOCK_COLORS[0],
        material: MOCK_MATERIALS[0],
        inventory: MOCK_INVENTORY_AVAILABLE[2],
      },
      {
        ...MOCK_PRODUCT_VARIANTS[3],
        size: MOCK_SIZES[3],
        color: MOCK_COLORS[0],
        material: MOCK_MATERIALS[0],
        inventory: MOCK_INVENTORY_AVAILABLE[3],
      },
      {
        ...MOCK_PRODUCT_VARIANTS[4],
        size: MOCK_SIZES[0],
        color: MOCK_COLORS[1],
        material: MOCK_MATERIALS[0],
        inventory: MOCK_INVENTORY_AVAILABLE[4],
      },
      {
        ...MOCK_PRODUCT_VARIANTS[5],
        size: MOCK_SIZES[1],
        color: MOCK_COLORS[1],
        material: MOCK_MATERIALS[0],
        inventory: MOCK_INVENTORY_AVAILABLE[5],
      },
      {
        ...MOCK_PRODUCT_VARIANTS[6],
        size: MOCK_SIZES[2],
        color: MOCK_COLORS[1],
        material: MOCK_MATERIALS[0],
        inventory: MOCK_INVENTORY_AVAILABLE[6],
      },
      {
        ...MOCK_PRODUCT_VARIANTS[7],
        size: MOCK_SIZES[3],
        color: MOCK_COLORS[1],
        material: MOCK_MATERIALS[0],
        inventory: MOCK_INVENTORY_AVAILABLE[7],
      },
    ],
    images: MOCK_PRODUCT_IMAGES.filter((img) => img.product_id === 1),
  },
  {
    id: 2,
    category_id: 2,
    name: 'Nam Áo Khoác Giả Lông Cừu Cản Gió (Kéo Khóa)',
    slug: 'nam-ao-khoac-gia-long-cuu-can-gio',
    description: 'Lớp ngoài lông cừu mềm mại, lớp lót cản gió chuyên dụng giúp giữ nhiệt tối ưu trong điều kiện thời tiết khắc nghiệt. Phom dáng mạnh mẽ, thời thượng.',
    base_price: 899000,
    is_visible: true,
    created_by: 1,
    created_at: '2026-10-05T00:00:00Z',
    updated_at: '2026-10-05T00:00:00Z',
    deleted_at: null,
    category: MOCK_CATEGORIES[1],
    rating: MOCK_PRODUCT_RATINGS[1],
    video_url: '/images/products/nam_demo/san_pham1/video_intro_nam.mp4',
    variants: [
      {
        ...MOCK_PRODUCT_VARIANTS[8],
        size: MOCK_SIZES[0],
        color: MOCK_COLORS[2],
        material: MOCK_MATERIALS[1],
        inventory: MOCK_INVENTORY_AVAILABLE[8],
      },
      {
        ...MOCK_PRODUCT_VARIANTS[9],
        size: MOCK_SIZES[1],
        color: MOCK_COLORS[2],
        material: MOCK_MATERIALS[1],
        inventory: MOCK_INVENTORY_AVAILABLE[9],
      },
      {
        ...MOCK_PRODUCT_VARIANTS[10],
        size: MOCK_SIZES[2],
        color: MOCK_COLORS[2],
        material: MOCK_MATERIALS[1],
        inventory: MOCK_INVENTORY_AVAILABLE[10],
      },
      {
        ...MOCK_PRODUCT_VARIANTS[11],
        size: MOCK_SIZES[3],
        color: MOCK_COLORS[2],
        material: MOCK_MATERIALS[1],
        inventory: MOCK_INVENTORY_AVAILABLE[11],
      },
      {
        ...MOCK_PRODUCT_VARIANTS[12],
        size: MOCK_SIZES[0],
        color: MOCK_COLORS[3],
        material: MOCK_MATERIALS[1],
        inventory: MOCK_INVENTORY_AVAILABLE[12],
      },
      {
        ...MOCK_PRODUCT_VARIANTS[13],
        size: MOCK_SIZES[1],
        color: MOCK_COLORS[3],
        material: MOCK_MATERIALS[1],
        inventory: MOCK_INVENTORY_AVAILABLE[13],
      },
      {
        ...MOCK_PRODUCT_VARIANTS[14],
        size: MOCK_SIZES[2],
        color: MOCK_COLORS[3],
        material: MOCK_MATERIALS[1],
        inventory: MOCK_INVENTORY_AVAILABLE[14],
      },
      {
        ...MOCK_PRODUCT_VARIANTS[15],
        size: MOCK_SIZES[3],
        color: MOCK_COLORS[3],
        material: MOCK_MATERIALS[1],
        inventory: MOCK_INVENTORY_AVAILABLE[15],
      },
    ],
    images: MOCK_PRODUCT_IMAGES.filter((img) => img.product_id === 2),
  },
];

// ============================================================================
// 7. VOUCHER & KHUYẾN MÃI (vouchers theo 01_schema)
// ============================================================================

export const MOCK_VOUCHERS: Voucher[] = [
  {
    id: 1,
    code: 'WELCOME10',
    discount_type: 'percent',
    discount_value: 10,
    max_discount_amount: 100000,
    min_order_value: 300000,
    usage_limit: 1000,
    per_user_limit: 1,
    used_count: 142,
    start_at: '2026-01-01T00:00:00Z',
    end_at: '2026-12-31T23:59:59Z',
    is_active: true,
    created_by: 1,
  },
  {
    id: 2,
    code: 'FREESHIP',
    discount_type: 'fixed_amount',
    discount_value: 30000,
    max_discount_amount: null,
    min_order_value: 500000,
    usage_limit: null,
    per_user_limit: 3,
    used_count: 389,
    start_at: '2026-01-01T00:00:00Z',
    end_at: '2026-12-31T23:59:59Z',
    is_active: true,
    created_by: 1,
  },
  {
    id: 3,
    code: 'AETHER50',
    discount_type: 'fixed_amount',
    discount_value: 50000,
    max_discount_amount: null,
    min_order_value: 700000,
    usage_limit: 500,
    per_user_limit: 1,
    used_count: 65,
    start_at: '2026-10-01T00:00:00Z',
    end_at: '2026-11-30T23:59:59Z',
    is_active: true,
    created_by: 1,
  },
];

// ============================================================================
// 8. ĐƠN HÀNG MẪU (View phẳng v_order_details theo 01_schema)
// ============================================================================

export const MOCK_ORDER_DETAILS: OrderDetailView[] = [
  {
    order_id: 1,
    order_code: 'ORD-20261016-001',
    user_id: 2,
    is_buy_now: false,
    status: 'new',
    payment_method: 'bank_qr',
    payment_status: 'paid',
    note: 'Giao hàng giờ hành chính',
    created_at: '2026-10-16T08:30:00Z',
    updated_at: '2026-10-16T08:35:00Z',
    customer_name: 'Nguyễn Văn Khách',
    customer_phone: '0912345678',
    customer_email: 'khachhang@gmail.com',
    recipient_name: 'Nguyễn Văn Khách',
    recipient_phone: '0912345678',
    province: 'Hà Nội',
    district: 'Cầu Giấy',
    ward: 'Dịch Vọng Hậu',
    street_address: 'Số 12 Duy Tân, Tòa nhà FPT',
    subtotal: 599000,
    voucher_id: 1,
    voucher_code: 'WELCOME10',
    voucher_discount: 59900,
    points_used: 10,
    points_discount: 10000,
    shipping_fee: 0, // Miễn phí vì subtotal > 500.000₫
    total_amount: 529100, // 599000 - 59900 - 10000
    shipping_carrier_id: null,
    shipping_carrier_name: null,
    tracking_code: null,
    shipped_at: null,
    delivered_at: null,
    cancel_reason: null,
    cancelled_by: null,
    cancelled_at: null,
    item_count: 1,
  },
  {
    order_id: 2,
    order_code: 'ORD-20261015-002',
    user_id: null, // Khách vãng lai
    is_buy_now: true,
    status: 'shipping',
    payment_method: 'cod',
    payment_status: 'unpaid',
    note: 'Gọi điện trước khi giao',
    created_at: '2026-10-15T14:20:00Z',
    updated_at: '2026-10-15T16:00:00Z',
    customer_name: 'Trần Thị Mai',
    customer_phone: '0988776655',
    customer_email: 'maitran@gmail.com',
    recipient_name: 'Trần Thị Mai',
    recipient_phone: '0988776655',
    province: 'Hồ Chí Minh',
    district: 'Quận 1',
    ward: 'Bến Nghé',
    street_address: 'Số 88 Đồng Khởi',
    subtotal: 450000,
    voucher_id: null,
    voucher_code: null,
    voucher_discount: 0,
    points_used: 0, // Khách vãng lai bắt buộc = 0
    points_discount: 0,
    shipping_fee: 30000, // < 500.000₫ tính phí 30.000₫
    total_amount: 480000,
    shipping_carrier_id: 1,
    shipping_carrier_name: 'Giao Hàng Nhanh',
    tracking_code: 'GHN992817362VN',
    shipped_at: '2026-10-15T16:00:00Z',
    delivered_at: null,
    cancel_reason: null,
    cancelled_by: null,
    cancelled_at: null,
    item_count: 1,
  },
  {
    order_id: 3,
    order_code: 'ORD-20261012-003',
    user_id: 2,
    is_buy_now: false,
    status: 'completed',
    payment_method: 'bank_qr',
    payment_status: 'paid',
    note: null,
    created_at: '2026-10-12T09:10:00Z',
    updated_at: '2026-10-14T11:00:00Z',
    customer_name: 'Nguyễn Văn Khách',
    customer_phone: '0912345678',
    customer_email: 'khachhang@gmail.com',
    recipient_name: 'Nguyễn Văn Khách',
    recipient_phone: '0912345678',
    province: 'Hà Nội',
    district: 'Đống Đa',
    ward: 'Láng Thượng',
    street_address: '91 Chùa Láng',
    subtotal: 1098000,
    voucher_id: 3,
    voucher_code: 'AETHER50',
    voucher_discount: 50000,
    points_used: 20,
    points_discount: 20000,
    shipping_fee: 0,
    total_amount: 1028000,
    shipping_carrier_id: 2,
    shipping_carrier_name: 'Giao Hàng Tiết Kiệm',
    tracking_code: 'GHTK1122334455',
    shipped_at: '2026-10-13T08:00:00Z',
    delivered_at: '2026-10-14T11:00:00Z',
    cancel_reason: null,
    cancelled_by: null,
    cancelled_at: null,
    item_count: 2,
  },
];

export const MOCK_ORDER_ITEMS: OrderItem[] = [
  {
    id: 1,
    order_id: 1,
    variant_id: 101,
    product_name: 'Nữ Áo Kiểu Vải Rayon Cổ Mở - Tay Lửng 3/4',
    variant_label: 'Size S / Trắng / Rayon (SKU: AKN-479073-00-S)',
    unit_price: 599000,
    quantity: 1,
    line_total: 599000,
  },
  {
    id: 2,
    order_id: 2,
    variant_id: 201,
    product_name: 'Nam Áo Khoác Giả Lông Cừu Cản Gió (Kéo Khóa)',
    variant_label: 'Size S / Navy / Lông cừu (SKU: AKM-486116-69-S)',
    unit_price: 899000,
    quantity: 1,
    line_total: 899000,
  },
  {
    id: 3,
    order_id: 3,
    variant_id: 102,
    product_name: 'Nữ Áo Kiểu Vải Rayon Cổ Mở - Tay Lửng 3/4',
    variant_label: 'Size M / Trắng / Rayon (SKU: AKN-479073-00-M)',
    unit_price: 599000,
    quantity: 1,
    line_total: 599000,
  },
  {
    id: 4,
    order_id: 3,
    variant_id: 202,
    product_name: 'Nam Áo Khoác Giả Lông Cừu Cản Gió (Kéo Khóa)',
    variant_label: 'Size M / Navy / Lông cừu (SKU: AKM-486116-69-M)',
    unit_price: 899000,
    quantity: 1,
    line_total: 899000,
  },
];

// ============================================================================
// 9. TÀI KHOẢN MẪU (USERS & ROLES theo 02_seed & 03_seed)
// ============================================================================

export const MOCK_USERS: User[] = [
  {
    id: 1,
    phone: '0900000000',
    email: 'admin@shop.local',
    full_name: 'Admin',
    avatar_url: null,
    user_type: 'staff',
    status: 'active',
    loyalty_points: 0,
    last_login_at: '2026-10-16T08:00:00Z',
    created_at: '2026-10-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 2,
    phone: '0912345678',
    email: 'khachhang@gmail.com',
    full_name: 'Khách Hàng',
    avatar_url: null,
    user_type: 'customer',
    status: 'active',
    loyalty_points: 150, // Tích lũy 150 điểm (= 150.000₫)
    last_login_at: '2026-10-16T08:30:00Z',
    created_at: '2026-10-05T00:00:00Z',
    updated_at: null,
  },
  {
    id: 3,
    phone: '0933333333',
    email: 'kho@shop.local',
    full_name: 'Warehouse',
    avatar_url: null,
    user_type: 'staff',
    status: 'active',
    loyalty_points: 0,
    last_login_at: '2026-10-16T07:45:00Z',
    created_at: '2026-10-01T00:00:00Z',
    updated_at: null,
  },
  {
    id: 4,
    phone: '0944444444',
    email: 'cskh@shop.local',
    full_name: 'CSKH',
    avatar_url: null,
    user_type: 'staff',
    status: 'active',
    loyalty_points: 0,
    last_login_at: '2026-10-16T08:15:00Z',
    created_at: '2026-10-01T00:00:00Z',
    updated_at: null,
  },
];

// ============================================================================
// 10. HÀM TIỆN ÍCH & TƯƠNG THÍCH NGƯỢC (Backwards Compatibility cho Store & Pages)
// ============================================================================

/** Định dạng tiền tệ VNĐ chuẩn (VD: 599.000₫) */
export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount).replace('₫', '').trim() + '₫';
}

/** Tương thích ngược với ProductListPage và dbStore */
export const CATEGORIES = [
  { id: 'all', name: 'TẤT CẢ', slug: 'all' },
  { id: 'nu', name: 'ÁO NỮ', slug: 'ao-nu' },
  { id: 'nam', name: 'ÁO NAM', slug: 'ao-nam' },
];

/** Tương thích ngược với COUPONS trong cartStore.js */
export const COUPONS = [
  {
    code: 'WELCOME10',
    name: 'Giảm 10% cho khách hàng mới',
    discount_type: 'percent',
    discount_value: 10,
    max_discount: 100000,
    min_order: 300000,
  },
  {
    code: 'FREESHIP',
    name: 'Miễn phí vận chuyển toàn quốc (đơn từ 500k)',
    discount_type: 'fixed',
    discount_value: 30000,
    max_discount: 30000,
    min_order: 500000,
  },
  {
    code: 'AETHER50',
    name: 'Ưu đãi Đơn hàng Streetwear 50K',
    discount_type: 'fixed',
    discount_value: 50000,
    max_discount: 50000,
    min_order: 700000,
  },
];

/**
 * Tương thích ngược với mảng PRODUCTS trong mockData.js cũ
 * Kết hợp đầy đủ dữ liệu CSDL PostgreSQL và thuộc tính UI
 */
export const PRODUCTS = [
  {
    id: 1,
    category_id: 'nu',
    category_name: 'Áo Nữ',
    code: '479073',
    name: 'Nữ Áo Kiểu Vải Rayon Cổ Mở - Tay Lửng 3/4',
    slug: 'nu-ao-kieu-vai-rayon-co-mo-tay-lung',
    price: 599000,
    cost_price: 320000,
    rating: 4.9,
    reviews_count: 56,
    is_active: true,
    is_featured: true,
    badge: 'MỚI VỀ',
    collection: 'BST Thu/Đông 2026',
    short_desc: 'Phong cách thanh lịch, phù hợp cho những bản phối công sở hiện đại. Chiều dài thân áo và tay áo được tinh chỉnh cân đối, mang đến vẻ ngoài chỉn chu, thời trang.',
    details: [
      'Phong cách thanh lịch, phù hợp cho những bản phối công sở hiện đại.',
      'Chiều dài thân áo và tay áo được tinh chỉnh cân đối, mang đến vẻ ngoài chỉn chu, thời trang.',
      'Độ xuyên thấu: Không xuyên thấu (Chỉ 00 WHITE xuyên thấu nhẹ tinh tế).',
      'Dáng áo: Dáng thoải mái, tôn dáng tự nhiên.',
      'Quần áo sử dụng vật liệu tái chế hỗ trợ giảm thiểu chất thải.',
      'Mã sản phẩm: 479073 (487527, 482824).',
      'Sản xuất: Vietnam, China.',
    ],
    material: '76% Visco, 24% Polyeste (24% Sử Dụng Sợi Polyeste Tái Chế).',
    care_instructions: 'Giặt máy nước lạnh, giặt nhẹ, Giặt khô, Không sấy khô.',
    shipping_info: 'Phí giao hàng: 30,000 VND cho đơn hàng dưới 500,000 VND và MIỄN PHÍ cho đơn hàng từ 500,000 VND trở lên.',
    return_policy: 'Đổi trả trực tuyến trong vòng 7 ngày kể từ ngày nhận hàng.',
    images: [
      '/images/products/nu_demo/san_pham1/vngoods_00_479073_3x4.avif',
      '/images/products/nu_demo/san_pham1/vngoods_10_479073_3x4.avif',
      '/images/products/nu_demo/san_pham1/vngoods_479073_sub3_3x4.avif',
      '/images/products/nu_demo/san_pham1/goods_479073_sub14_3x4.avif',
    ],
    video: '/images/products/nu_demo/san_pham1/video_intro.mp4',
    variants: [
      { id: 101, sku: 'AKN-479073-00-S', color: '00 WHITE', color_code: '#FFFFFF', border: true, size: 'S', stock: 22 },
      { id: 102, sku: 'AKN-479073-00-M', color: '00 WHITE', color_code: '#FFFFFF', border: true, size: 'M', stock: 35 },
      { id: 103, sku: 'AKN-479073-00-L', color: '00 WHITE', color_code: '#FFFFFF', border: true, size: 'L', stock: 18 },
      { id: 104, sku: 'AKN-479073-00-XL', color: '00 WHITE', color_code: '#FFFFFF', border: true, size: 'XL', stock: 10 },
      { id: 105, sku: 'AKN-479073-10-M', color: '10 BEIGE', color_code: '#E8D8C8', size: 'M', stock: 27 },
      { id: 106, sku: 'AKN-479073-10-L', color: '10 BEIGE', color_code: '#E8D8C8', size: 'L', stock: 20 },
    ],
  },
  {
    id: 2,
    category_id: 'nam',
    category_name: 'Áo Nam',
    code: '486116',
    name: 'Nam Áo Khoác Giả Lông Cừu Cản Gió (Kéo Khóa)',
    slug: 'nam-ao-khoac-gia-long-cuu-can-gio',
    price: 899000,
    cost_price: 490000,
    rating: 5.0,
    reviews_count: 84,
    is_active: true,
    is_featured: true,
    badge: 'BÁN CHẠY',
    collection: 'BST Thu/Đông 2026',
    short_desc: 'Chất liệu lông cừu mềm mại, lớp màng chắn gió chuyên dụng giữ ấm cơ thể trong mọi điều kiện thời tiết.',
    details: [
      'Chất liệu lông cừu mềm mại, lớp màng chắn gió chuyên dụng giữ ấm cơ thể.',
      'Thiết kế tay áo raglan giúp cử động thoải mái tối đa.',
      'Túi áo có khóa kéo tiện lợi, bảo vệ tư trang an toàn.',
      'Mã sản phẩm: 486116.',
      'Sản xuất: Vietnam.',
    ],
    material: 'Lớp ngoài: 100% Polyeste; Lớp lót: 100% Polyeste (Chống gió).',
    care_instructions: 'Giặt máy nước lạnh, không dùng chất tẩy mạnh, phơi trong bóng râm.',
    shipping_info: 'Phí giao hàng: 30,000 VND cho đơn hàng dưới 500,000 VND và MIỄN PHÍ cho đơn hàng từ 500,000 VND trở lên.',
    return_policy: 'Đổi trả trực tuyến trong vòng 7 ngày kể từ ngày nhận hàng.',
    images: [
      '/images/products/nam_demo/san_pham1/vngoods_69_486116_3x4.avif',
      '/images/products/nam_demo/san_pham1/vngoods_486116_sub3_3x4.avif',
      '/images/products/nam_demo/san_pham1/goods_486116_sub14_3x4.avif',
    ],
    video: null,
    variants: [
      { id: 201, sku: 'AKM-486116-69-S', color: '69 NAVY', color_code: '#1e293b', size: 'S', stock: 15 },
      { id: 202, sku: 'AKM-486116-69-M', color: '69 NAVY', color_code: '#1e293b', size: 'M', stock: 32 },
      { id: 203, sku: 'AKM-486116-69-L', color: '69 NAVY', color_code: '#1e293b', size: 'L', stock: 20 },
      { id: 204, sku: 'AKM-486116-69-XL', color: '69 NAVY', color_code: '#1e293b', size: 'XL', stock: 12 },
      { id: 205, sku: 'AKM-486116-09-M', color: '09 BLACK', color_code: '#000000', size: 'M', stock: 30 },
      { id: 206, sku: 'AKM-486116-09-L', color: '09 BLACK', color_code: '#000000', size: 'L', stock: 18 },
    ],
  },
];

export default {
  PRODUCTS,
  CATEGORIES,
  COUPONS,
  MOCK_PRODUCTS_WITH_DETAILS,
  MOCK_ORDER_DETAILS,
  MOCK_ORDER_ITEMS,
  MOCK_INVENTORY_AVAILABLE,
  MOCK_PRODUCT_RATINGS,
  MOCK_VOUCHERS,
  MOCK_SYSTEM_SETTINGS,
  MOCK_USERS,
  formatVND,
};
