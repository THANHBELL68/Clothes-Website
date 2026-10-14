import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null, // null = Khách vãng lai (Guest); object = Khách hàng thành viên (Customer)
      token: null,
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

      // Đăng nhập demo với role customer
      login: (email, password) => {
        // Mô phỏng xác thực tài khoản theo DB
        const customerUser = {
          id: 5,
          email: email || 'customer@shop.local',
          full_name: email === 'customer@shop.local' ? 'Nguyễn Văn Khách' : (email.split('@')[0] || 'Khách hàng'),
          phone: '0987654321',
          role: 'customer',
          loyalty_points: 150, // 150 điểm tích lũy
          email_verified_at: new Date().toISOString(),
        };

        set({
          user: customerUser,
          token: 'mock-jwt-token-customer-' + Date.now(),
        });
        return { success: true, user: customerUser };
      },

      logout: () => {
        set({ user: null, token: null });
      },

      // Quản lý điểm thưởng (bảng loyalty_transactions)
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

      // Quản lý sổ địa chỉ (bảng addresses)
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

