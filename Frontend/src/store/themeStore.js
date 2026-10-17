import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark', // 'dark' | 'light'
      toggleTheme: () => {
        const next = get().theme === 'dark' ? 'light' : 'dark';
        set({ theme: next });
        if (typeof document !== 'undefined') {
          if (next === 'light') {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
            document.body.style.backgroundColor = '#f8f9fa';
            document.body.style.color = '#09090b';
          } else {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
            document.body.style.backgroundColor = '#080808';
            document.body.style.color = '#fafafa';
          }
        }
      },
      setTheme: (newTheme) => {
        set({ theme: newTheme });
        if (typeof document !== 'undefined') {
          if (newTheme === 'light') {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
            document.body.style.backgroundColor = '#f8f9fa';
            document.body.style.color = '#09090b';
          } else {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
            document.body.style.backgroundColor = '#080808';
            document.body.style.color = '#fafafa';
          }
        }
      },
    }),
    {
      name: 'aether-theme-storage',
    }
  )
);

