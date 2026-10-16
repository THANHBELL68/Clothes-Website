import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Danh sách quyền chuẩn theo View v_user_permissions và 02_seed_required.sql
export const ROLE_PERMISSIONS_MAP = {
  CUSTOMER: [
    'PRODUCT_VIEW',
    'PRODUCT_SEARCH',
    'GUEST_CHECKOUT',
    'GUEST_RETURN_REQUEST',
    'LIVECHAT_USE',
    'ACCOUNT_REGISTER',
    'PROFILE_MANAGE',
    'ADDRESS_MANAGE',
    'CART_ORDER',
    'BUY_NOW',
    'VOUCHER_LOYALTY_APPLY',
    'ORDER_HISTORY_OWN',
    'ORDER_CANCEL_OWN',
    'RETURN_REQUEST_CREATE',
    'LOYALTY_REDEEM',
    'WISHLIST_MANAGE',
    'REVIEW_CREATE',
  ],
  CS_STAFF: [
    'ORDER_HISTORY_ALL_VIEW',
    'ORDER_CONFIRM_CANCEL', // Xác nhận đơn new -> processing, hủy đơn
    'RETURN_REQUEST_REVIEW', // Duyệt yêu cầu đổi trả pending -> approved / rejected
    'REFUND_TRACK',          // Cập nhật hoàn tiền pending -> processing -> completed
    'REVIEW_MODERATE',       // Duyệt đánh giá pending -> approved / hidden
    'LIVECHAT_REPLY',        // Trả lời Live Chat trực tuyến cho khách hàng
  ],
  WAREHOUSE_MANAGER: [
    'PRODUCT_MANAGE',        // Quản lý sản phẩm & biến thể v_inventory_available
    'STOCK_IO_MANAGE',       // Tạo phiếu nhập / xuất kho stock_documents (xuất khi packing)
    'STOCKTAKE_MANAGE',      // Kiểm kê kho stocktakes & stocktake_items (difference = actual - system)
    'ORDER_STATUS_UPDATE',   // Chuyển trạng thái đơn: processing -> packing -> shipping -> completed
    'RETURN_RECEIVE_CONFIRM',// Xác nhận nhận hàng hoàn về kho
    'WAREHOUSE_REPORT_VIEW', // Báo cáo tồn kho
  ],
  SUPER_ADMIN: [
    // CS_STAFF Permissions
    'ORDER_HISTORY_ALL_VIEW',
    'ORDER_CONFIRM_CANCEL',
    'RETURN_REQUEST_REVIEW',
    'REFUND_TRACK',
    'REVIEW_MODERATE',
    'LIVECHAT_REPLY',
    // WAREHOUSE_MANAGER Permissions
    'PRODUCT_MANAGE',
    'STOCK_IO_MANAGE',
    'STOCKTAKE_MANAGE',
    'ORDER_STATUS_UPDATE',
    'RETURN_RECEIVE_CONFIRM',
    'WAREHOUSE_REPORT_VIEW',
    // SUPER_ADMIN Exclusive
    'USER_VIEW',
    'ACCOUNT_ROLE_MANAGE',  // Quản lý tài khoản & gán vai trò user_roles
    'SYSTEM_CONFIG',        // Cấu hình system_settings
    'LOG_VIEW',             // Xem nhật ký activity_logs / audit_logs
    'REPORT_ALL_VIEW',      // Báo cáo doanh thu & toàn sàn
    'MARKETING_MANAGE',     // Quản lý promotions / vouchers / loyalty_rewards
  ],
};

// Chuẩn hóa mã vai trò
export function normalizeRoleCode(role) {
  if (!role) return 'CUSTOMER';
  const upper = String(role).toUpperCase();
  if (upper === 'ADMIN' || upper === 'SUPER_ADMIN') return 'SUPER_ADMIN';
  if (upper === 'CSKH' || upper === 'CS_STAFF') return 'CS_STAFF';
  if (upper === 'WAREHOUSE' || upper === 'WAREHOUSE_MANAGER') return 'WAREHOUSE_MANAGER';
  return 'CUSTOMER';
}

// Lấy mảng permissions từ view v_user_permissions cho user đang xét
export function getUserPermissions(user) {
  if (!user) return ROLE_PERMISSIONS_MAP.CUSTOMER;
  const normalizedRole = normalizeRoleCode(user.role);
  return ROLE_PERMISSIONS_MAP[normalizedRole] || [];
}

// Kiểm tra user có quyền cụ thể không
export function hasPermission(user, permissionCode) {
  const permissions = getUserPermissions(user);
  return permissions.includes(permissionCode);
}

export const DEMO_ACCOUNTS = [
  {
    id: 1,
    email: 'admin@shop.local',
    full_name: 'Trần Quản Trị (Super Admin)',
    phone: '0911000111',
    role: 'SUPER_ADMIN',
    is_active: true,
    loyalty_points: 9999,
  },
  {
    id: 2,
    email: 'warehouse@shop.local',
    full_name: 'Lê Thủ Kho (Warehouse Manager)',
    phone: '0922000222',
    role: 'WAREHOUSE_MANAGER',
    is_active: true,
    loyalty_points: 0,
  },
  {
    id: 3,
    email: 'cskh@shop.local',
    full_name: 'Phạm Chăm Sóc (CS Staff)',
    phone: '0933000333',
    role: 'CS_STAFF',
    is_active: true,
    loyalty_points: 0,
  },
  {
    id: 5,
    email: 'customer@shop.local',
    full_name: 'Nguyễn Văn Khách (Thành Viên)',
    phone: '0987654321',
    role: 'CUSTOMER',
    is_active: true,
    loyalty_points: 150,
  },
  {
    id: 6,
    email: 'hoangyen@gmail.com',
    full_name: 'Hoàng Thị Yến (Khách VIP)',
    phone: '0977888999',
    role: 'CUSTOMER',
    is_active: true,
    loyalty_points: 420,
  },
];

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null, // null = Guest | Object = Logged in
      token: null,
      allUsers: DEMO_ACCOUNTS, // Danh sách tài khoản trong CSDL

      addresses: [
        {
          id: 1,
          label: 'Nhà riêng',
          receiver_name: 'Nguyễn Văn Khách',
          phone: '0987654321',
          province: 'Hà Nội',
          district: 'Quận Cầu Giấy',
          ward: 'Phường Dịch Vọng Hậu',
          street: 'Số 12 ngõ 45 phố Duy Tân',
          is_default: true,
        },
      ],

      // Đăng nhập
      login: (email, password) => {
        const found = get().allUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
        if (found) {
          if (!found.is_active) {
            return { success: false, message: 'Tài khoản của bạn đã bị khóa bởi Admin (is_active = FALSE)!' };
          }
          set({ user: found, token: 'jwt-token-' + found.role });
          return { success: true, user: found };
        }

        // Tạo tài khoản customer mới nếu email tự do
        const newUser = {
          id: Date.now(),
          email,
          full_name: email.split('@')[0],
          phone: '0900000000',
          role: 'CUSTOMER',
          is_active: true,
          loyalty_points: 50,
        };
        set((state) => ({
          user: newUser,
          token: 'jwt-token-customer',
          allUsers: [...state.allUsers, newUser],
        }));
        return { success: true, user: newUser };
      },

      logout: () => {
        set({ user: null, token: null });
      },

      // Chuyển đổi nhanh vai trò đang đăng nhập (dành cho việc kiểm thử UI & phân quyền)
      switchRolePersona: (roleCode) => {
        const normalized = normalizeRoleCode(roleCode);
        const match = get().allUsers.find((u) => normalizeRoleCode(u.role) === normalized);
        if (match) {
          set({ user: match, token: 'jwt-token-' + match.role });
          return match;
        }
        return null;
      },

      // Admin: Khóa / Mở khóa tài khoản (bảng users.is_active)
      toggleUserActive: (userId) => {
        set((state) => {
          const updatedUsers = state.allUsers.map((u) =>
            u.id === userId ? { ...u, is_active: !u.is_active } : u
          );
          const currentUser = state.user && state.user.id === userId
            ? { ...state.user, is_active: !state.user.is_active }
            : state.user;

          return { allUsers: updatedUsers, user: currentUser };
        });
      },

      // Admin: Gán vai trò (bảng users.role_id -> roles / user_roles)
      changeUserRole: (userId, newRole) => {
        const normalized = normalizeRoleCode(newRole);
        set((state) => {
          const updatedUsers = state.allUsers.map((u) =>
            u.id === userId ? { ...u, role: normalized } : u
          );
          const currentUser = state.user && state.user.id === userId
            ? { ...state.user, role: normalized }
            : state.user;

          return { allUsers: updatedUsers, user: currentUser };
        });
      },

      // Điểm loyalty
      addLoyaltyPoints: (points) => {
        set((state) => {
          if (!state.user) return state;
          return {
            user: {
              ...state.user,
              loyalty_points: Math.max(0, state.user.loyalty_points + points),
            },
          };
        });
      },

      // Quản lý địa chỉ
      addAddress: (addr) => {
        set((state) => ({
          addresses: [
            ...state.addresses.map((a) => (addr.is_default ? { ...a, is_default: false } : a)),
            { ...addr, id: Date.now() },
          ],
        }));
      },

      setDefaultAddress: (id) => {
        set((state) => ({
          addresses: state.addresses.map((a) => ({
            ...a,
            is_default: a.id === id,
          })),
        }));
      },
    }),
    {
      name: 'aether-auth-storage-v2',
    }
  )
);
