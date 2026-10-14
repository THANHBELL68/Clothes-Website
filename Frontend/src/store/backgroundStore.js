import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useBackgroundStore = create(
  persist(
    (set) => ({
      isVideoBgEnabled: true,
      isMuted: true,
      toggleVideoBg: () => set((state) => ({ isVideoBgEnabled: !state.isVideoBgEnabled })),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
    }),
    {
      name: 'shop-background-storage',
    }
  )
);

