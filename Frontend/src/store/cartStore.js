import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { COUPONS } from '../data/mockData';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // [{ variant_id, product_id, name, size, color, price, image, quantity, stock }]
      coupon: null, // Mã giảm giá áp dụng
      pointsUsed: 0, // Số điểm loyalty quy đổi (1 điểm = 1.000đ)

      // Thêm sản phẩm vào giỏ
      addToCart: (item) => {
        if (!item) return;
        set((state) => {
          const currentItems = Array.isArray(state.items) ? state.items : [];
          const existingIndex = currentItems.findIndex(
            (i) => i.variant_id === item.variant_id
          );

          if (existingIndex > -1) {
            const updatedItems = [...currentItems];
            const currentItem = updatedItems[existingIndex];
            const newQty = Math.min(
              (currentItem.quantity || 1) + (item.quantity || 1),
              item.stock || 99
            );
            updatedItems[existingIndex] = {
              ...currentItem,
              quantity: newQty,
            };
            return { items: updatedItems };
          }

          return {
            items: [...currentItems, { ...item, quantity: item.quantity || 1 }],
          };
        });
      },

      updateQuantity: (variant_id, qty) => {
        if (qty <= 0) {
          get().removeFromCart(variant_id);
          return;
        }
        set((state) => {
          const currentItems = Array.isArray(state.items) ? state.items : [];
          return {
            items: currentItems.map((item) =>
              item.variant_id === variant_id
                ? { ...item, quantity: Math.min(qty, item.stock || 99) }
                : item
            ),
          };
        });
      },

      removeFromCart: (variant_id) => {
        set((state) => {
          const currentItems = Array.isArray(state.items) ? state.items : [];
          return {
            items: currentItems.filter((item) => item.variant_id !== variant_id),
          };
        });
      },

      clearCart: () => {
        set({ items: [], coupon: null, pointsUsed: 0 });
      },

      // Áp dụng mã coupon
      applyCoupon: (code) => {
        const found = COUPONS.find(
          (c) => c.code.toUpperCase() === (code || '').trim().toUpperCase()
        );
        if (!found) {
          return { success: false, message: 'Mã giảm giá không tồn tại!' };
        }

        const subtotal = get().getSubtotal();
        if (subtotal < found.min_order) {
          return {
            success: false,
            message: `Đơn hàng tối thiểu phải từ ${found.min_order.toLocaleString('vi-VN')}đ để dùng mã này!`,
          };
        }

        set({ coupon: found });
        return { success: true, message: `Áp dụng thành công mã: ${found.name}` };
      },

      removeCoupon: () => set({ coupon: null }),

      // Tiêu điểm thưởng loyalty (1 điểm = 1.000 VND theo system_settings)
      setPointsUsed: (points) => {
        set({ pointsUsed: Math.max(0, points) });
      },

      // Tính tổng tiền theo đúng công thức trong CSDL PostgreSQL
      getSubtotal: () => {
        const items = Array.isArray(get().items) ? get().items : [];
        return items.reduce(
          (sum, item) => sum + (Number(item?.price) || 0) * (Number(item?.quantity) || 1),
          0
        );
      },

      getShippingFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        // Miễn phí vận chuyển nếu đơn từ 500.000đ (system_settings)
        return subtotal >= 500000 ? 0 : 30000;
      },

      getCouponDiscount: () => {
        const subtotal = get().getSubtotal();
        const coupon = get().coupon;
        if (!coupon || subtotal === 0) return 0;

        let discount = 0;
        if (coupon.discount_type === 'percent') {
          discount = Math.round((subtotal * (coupon.discount_value || 0)) / 100);
          if (coupon.max_discount) {
            discount = Math.min(discount, coupon.max_discount);
          }
        } else {
          discount = coupon.discount_value || 0;
        }
        return Math.min(discount, subtotal);
      },

      getPointsDiscount: () => {
        const points = get().pointsUsed || 0;
        // 1 điểm = 1.000 VND
        return points * 1000;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        const shipping = get().getShippingFee();
        const couponDisc = get().getCouponDiscount();
        const pointsDisc = get().getPointsDiscount();
        return Math.max(0, subtotal + shipping - couponDisc - pointsDisc);
      },
    }),
    {
      name: 'shop-cart-storage-v2',
      migrate: (persistedState) => {
        if (!persistedState || !Array.isArray(persistedState.items)) {
          return {
            items: Array.isArray(persistedState?.cart) ? persistedState.cart : [],
            coupon: null,
            pointsUsed: 0,
          };
        }
        return persistedState;
      },
    }
  )
);
