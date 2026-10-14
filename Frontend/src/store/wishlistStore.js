import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [], // danh sách product_id

      toggleWishlist: (productId) => {
        set((state) => {
          const exists = state.items.includes(productId);
          return {
            items: exists
              ? state.items.filter((id) => id !== productId)
              : [...state.items, productId],
          };
        });
      },

      isInWishlist: (productId) => {
        return get().items.includes(productId);
      },
    }),
    {
      name: 'shop-wishlist-storage',
    }
  )
);

