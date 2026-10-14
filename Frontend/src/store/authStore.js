import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const DEMO_ACCOUNTS = [
  {
    id: 1,
    email: 'admin@shop.local',
    full_name: 'Trần Quản Trị (Admin Tối Cao)',
    phone: '0911000111',
    role: 'admin',
    is_active: true,
    loyalty_points: 9999,
  },
  {
    id: 2,
    email: 'warehouse@shop.local',
    full_name: 'Lê Thủ Kho (Quản Lý Kho)',
    phone: '0922000222',
    role: 'warehouse',
    is_active: true,
    loyalty_points: 0,
  },
  {
    id: 3,
    email: 'cskh@shop.local',
    full_name: 'Phạm Chăm Sóc (Nhân Viên CSKH)',
    phone: '0933000333',
    role: 'cskh',
    is_active: true,
    loyalty_points: 0,
  },
  {
    id: 5,
    email: 'customer@shop.local',
    full_name: 'Nguyễn Văn Khách (Thành Viên)',
    phone: '0987654321',
    role: 'customer',
    is_active: true,
    loyalty_points: 150,
  },
  {
    id: 6,
    email: 'hoangyen@gmail.com',
    full_name: 'Hoàng Thị Yến (Khách VIP)',
    phone: '0977888999',
    role: 'customer',
    is_active: true,
    loyalty_points: 420,
  },
];

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null, // null = Guest | Object = Logged in
      token: null,
      allUsers: DEMO_ACCOUNTS, // Danh sách tài khoản trong CSDL để Admin quản lý

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

      // Đăng nhập hỗ trợ phân quyền
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
          role: 'customer',
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

      // Admin: Khóa / Mở khóa tài khoản (bảng users.is_active)
      toggleUserActive: (userId) => {
        set((state) => {
          const updatedUsers = state.allUsers.map((u) =>
            u.id === userId ? { ...u, is_active: !u.is_active } : u
          );
          // Nếu khóa chính mình thì đá logout
          const currentUser = state.user && state.user.id === userId
            ? { ...state.user, is_active: !state.user.is_active }
            : state.user;

          return { allUsers: updatedUsers, user: currentUser };
        });
      },

      // Admin: Gán vai trò (bảng users.role_id -> roles)
      changeUserRole: (userId, newRole) => {
        set((state) => {
          const updatedUsers = state.allUsers.map((u) =>
            u.id === userId ? { ...u, role: newRole } : u
          );
          const currentUser = state.user && state.user.id === userId
            ? { ...state.user, role: newRole }
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
      name: 'shop-auth-storage',
    }
  )
);
