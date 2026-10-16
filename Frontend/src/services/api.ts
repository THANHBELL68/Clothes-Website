/**
 * API Service Layer cho Frontend Website Bán Quần Áo
 * Tương thích 100% CSDL PostgreSQL (shop_db) & Transaction đa bảng
 */

import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import type {
  Product,
  ProductWithDetails,
  Category,
  CartWithDetails,
  CreateOrderPayload,
  OrderDetailView,
  OrderComplete,
  InventoryAvailableView,
  ProductRatingView,
  User,
  Voucher,
  Review,
  SystemSetting,
} from '../types/database';

// ============================================================================
// QUẢN LÝ SESSION TOKEN & AUTH TOKEN
// ============================================================================

const SESSION_TOKEN_KEY = 'shop_guest_session_token';
const AUTH_TOKEN_KEY = 'shop_auth_token';
const USER_KEY = 'shop_auth_user';

/** Lấy hoặc tự tạo session token duy nhất cho khách vãng lai */
export function getGuestSessionToken(): string {
  if (typeof window === 'undefined') return '';
  let token = localStorage.getItem(SESSION_TOKEN_KEY);
  if (!token) {
    token = 'guest_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10);
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  }
  return token;
}

export function setGuestSessionToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
  }
}

export function clearGuestSessionToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_TOKEN_KEY);
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

export function clearAuthToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

// ============================================================================
// AXIOS CLIENT SETUP
// ============================================================================

const BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:5000/api';

export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Interceptor: tự động gán Bearer Token & X-Session-Token cho từng request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Luôn gửi X-Session-Token để backend định danh giỏ hàng khách vãng lai
    const guestToken = getGuestSessionToken();
    if (guestToken) {
      config.headers['X-Session-Token'] = guestToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor: xử lý phản hồi & lỗi xác thực
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      clearAuthToken();
    }
    return Promise.reject(error.response?.data || error);
  }
);

// ============================================================================
// 1. PRODUCT & INVENTORY API (products, product_variants, v_inventory_available, v_product_rating)
// ============================================================================

export interface ProductQueryParams {
  category_id?: number | string;
  category_slug?: string;
  search?: string;
  sort?: 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  limit?: number;
}

export const productApi = {
  /** Lấy danh sách sản phẩm hiển thị (is_visible = true, deleted_at = null) */
  getProducts: (params?: ProductQueryParams): Promise<{ data: ProductWithDetails[]; total: number }> => {
    return apiClient.get('/products', { params });
  },

  /** Lấy chi tiết sản phẩm theo slug kèm các biến thể, hình ảnh và đánh giá */
  getProductBySlug: (slug: string): Promise<ProductWithDetails> => {
    return apiClient.get(`/products/slug/${slug}`);
  },

  /** Lấy chi tiết sản phẩm theo ID */
  getProductById: (id: number): Promise<ProductWithDetails> => {
    return apiClient.get(`/products/${id}`);
  },

  /**
   * Tra cứu số lượng tồn kho có thể bán từ view v_inventory_available
   * quantity_available = quantity_on_hand - quantity_reserved
   */
  getInventoryAvailable: (variantId?: number): Promise<InventoryAvailableView[] | InventoryAvailableView> => {
    if (variantId) {
      return apiClient.get(`/inventory/available/${variantId}`);
    }
    return apiClient.get('/inventory/available');
  },

  /** Lấy điểm đánh giá trung bình từ view v_product_rating */
  getProductRating: (productId: number): Promise<ProductRatingView> => {
    return apiClient.get(`/products/${productId}/rating`);
  },

  /** Lấy danh mục sản phẩm đang hoạt động */
  getCategories: (): Promise<Category[]> => {
    return apiClient.get('/categories');
  },
};

// ============================================================================
// 2. CART API (carts & cart_items: hỗ trợ cả user_id và session_token)
// ============================================================================

export const cartApi = {
  /**
   * Lấy thông tin giỏ hàng hiện tại:
   * Tự động nhận diện thành viên (user_id qua Bearer Token) hoặc khách vãng lai (X-Session-Token)
   */
  getCart: (): Promise<CartWithDetails> => {
    return apiClient.get('/cart');
  },

  /**
   * Thêm sản phẩm vào giỏ.
   * Backend kiểm tra tồn kho v_inventory_available.quantity_available trước khi thêm.
   */
  addToCart: (variantId: number, quantity: number = 1): Promise<CartWithDetails> => {
    return apiClient.post('/cart/items', { variant_id: variantId, quantity });
  },

  /**
   * Cập nhật số lượng sản phẩm trong giỏ.
   * Tuyệt đối không cho phép vượt quá quantity_available.
   */
  updateCartItem: (cartItemId: number, quantity: number): Promise<CartWithDetails> => {
    return apiClient.put(`/cart/items/${cartItemId}`, { quantity });
  },

  /** Xóa 1 mặt hàng khỏi giỏ */
  removeFromCart: (cartItemId: number): Promise<CartWithDetails> => {
    return apiClient.delete(`/cart/items/${cartItemId}`);
  },

  /** Xóa sạch giỏ hàng */
  clearCart: (): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete('/cart');
  },

  /**
   * Gộp giỏ hàng khách vãng lai vào tài khoản thành viên khi đăng nhập
   * Tương ứng hàm merge_guest_cart(session_token, user_id) trong DB
   */
  mergeGuestCart: (sessionToken: string, userId: number): Promise<{ success: boolean; merged_count: number }> => {
    return apiClient.post('/cart/merge', { session_token: sessionToken, user_id: userId });
  },
};

// ============================================================================
// 3. ORDER API (Transaction tách 6 bảng & View phẳng v_order_details)
// ============================================================================

export const orderApi = {
  /**
   * Tạo đơn hàng với transaction 6 bảng trong PostgreSQL:
   * - orders
   * - order_customers
   * - order_shipping_addresses
   * - order_amounts
   * - order_items
   * - trigger trg_order_insert_history -> order_status_histories
   */
  createOrder: (payload: CreateOrderPayload): Promise<{ order_id: number; order_code: string; total_amount: number }> => {
    return apiClient.post('/orders', payload);
  },

  /**
   * Lấy chi tiết đơn hàng (sử dụng cấu trúc phẳng của view v_order_details kèm danh sách items)
   */
  getOrderDetails: (orderId: number | string): Promise<OrderComplete> => {
    return apiClient.get(`/orders/${orderId}`);
  },

  /** Lấy danh sách đơn hàng của khách hàng đang đăng nhập */
  getMyOrders: (): Promise<OrderDetailView[]> => {
    return apiClient.get('/orders/my');
  },

  /**
   * Khách hàng tự hủy đơn khi đơn còn ở trạng thái 'new' hoặc 'processing'
   * (Insert vào order_cancellations, trigger tự đổi status sang 'cancelled')
   */
  cancelOrder: (orderId: number, reason: string): Promise<{ success: boolean; message: string }> => {
    return apiClient.post(`/orders/${orderId}/cancel`, { reason });
  },

  /**
   * Tra cứu đơn hàng cho khách vãng lai (không cần đăng nhập, dùng mã đơn + số điện thoại)
   */
  trackGuestOrder: (orderCode: string, phone: string): Promise<OrderComplete> => {
    return apiClient.get('/orders/track', { params: { order_code: orderCode, phone } });
  },
};

// ============================================================================
// 4. AUTH API (Tách riêng 2 đường dẫn Khách hàng và Nhân viên nội bộ)
// ============================================================================

export interface LoginResponse {
  token: string;
  user: User;
  permissions?: string[];
}

export const authApi = {
  /**
   * Đường dẫn dành riêng cho Khách hàng (/login)
   * Chỉ cho phép tài khoản có user_type = 'customer'
   */
  customerLogin: async (phone: string, password: string): Promise<LoginResponse> => {
    const res: any = await apiClient.post('/auth/customer/login', { phone, password });
    if (res.token) {
      setAuthToken(res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));

      // Tự động gộp giỏ hàng khách vãng lai nếu có
      const guestToken = localStorage.getItem(SESSION_TOKEN_KEY);
      if (guestToken && res.user?.id) {
        try {
          await cartApi.mergeGuestCart(guestToken, res.user.id);
          clearGuestSessionToken();
        } catch {
          // Bỏ qua lỗi gộp giỏ nếu giỏ rỗng
        }
      }
    }
    return res;
  },

  /** Đăng ký tài khoản khách hàng mới */
  customerRegister: (data: { phone: string; password: string; full_name?: string; email?: string }): Promise<LoginResponse> => {
    return apiClient.post('/auth/customer/register', data);
  },

  /**
   * Đường dẫn dành riêng cho Nhân viên / Nội bộ (/staff/login)
   * Kiểm tra nghiêm ngặt user_type = 'staff' và role thuộc:
   * WAREHOUSE_MANAGER, CS_STAFF, SUPER_ADMIN
   */
  staffLogin: async (phone: string, password: string): Promise<LoginResponse> => {
    const res: any = await apiClient.post('/auth/staff/login', { phone, password });
    if (res.token) {
      setAuthToken(res.token);
      localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }
    return res;
  },

  /** Lấy thông tin tài khoản hiện tại kèm quyền truy cập */
  getProfile: (): Promise<{ user: User; roles: string[]; permissions: string[] }> => {
    return apiClient.get('/auth/me');
  },

  /** Đăng xuất */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      clearAuthToken();
    }
  },
};

// ============================================================================
// 5. VOUCHER & DISCOUNT API (vouchers & voucher_usages)
// ============================================================================

export const voucherApi = {
  /**
   * Kiểm tra mã voucher và tính toán số tiền giảm theo subtotal
   */
  applyVoucher: (code: string, subtotal: number): Promise<{
    voucher_id: number;
    code: string;
    discount_amount: number;
    subtotal: number;
    final_amount: number;
  }> => {
    return apiClient.post('/vouchers/apply', { code, subtotal });
  },

  /** Danh sách voucher công khai đang hoạt động */
  getActiveVouchers: (): Promise<Voucher[]> => {
    return apiClient.get('/vouchers/active');
  },
};

// ============================================================================
// 6. REVIEW API (reviews & v_product_rating)
// ============================================================================

export const reviewApi = {
  /** Lấy danh sách đánh giá đã duyệt của sản phẩm */
  getProductReviews: (productId: number): Promise<Review[]> => {
    return apiClient.get(`/reviews/product/${productId}`);
  },

  /**
   * Gửi đánh giá cho sản phẩm đã mua (ràng buộc: chỉ chủ đơn, đơn đã hoàn thành)
   */
  createReview: (payload: {
    product_id: number;
    order_item_id: number;
    rating: number;
    content?: string;
  }): Promise<{ success: boolean; message: string }> => {
    return apiClient.post('/reviews', payload);
  },
};

// ============================================================================
// 7. SYSTEM SETTINGS & UTILITIES (system_settings)
// ============================================================================

export const settingsApi = {
  /** Lấy toàn bộ cấu hình hệ thống (phí ship, ngưỡng freeship, tích điểm) */
  getSettings: (): Promise<Record<string, string>> => {
    return apiClient.get('/settings');
  },

  /**
   * Tính toán phí giao hàng theo chuẩn system_settings trong CSDL:
   * - shipping.default_fee: 30.000₫
   * - shipping.free_from: 500.000₫ (Miễn phí vận chuyển từ 500.000₫ trở lên)
   */
  calculateShippingFee: (subtotal: number, defaultFee = 30000, freeThreshold = 500000): number => {
    if (subtotal >= freeThreshold) return 0;
    return defaultFee;
  },
};

