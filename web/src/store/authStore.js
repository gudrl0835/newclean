import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoggedIn: false,

      // 로그인
      login: (loginResponse) => {
        localStorage.setItem('accessToken', loginResponse.accessToken);
        localStorage.setItem('refreshToken', loginResponse.refreshToken);
        set({
          user: {
            id: loginResponse.userId,
            email: loginResponse.email,
            name: loginResponse.name,
            role: loginResponse.role,
          },
          accessToken: loginResponse.accessToken,
          refreshToken: loginResponse.refreshToken,
          isLoggedIn: true,
        });
      },

      // 로그아웃
      logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        set({ user: null, accessToken: null, refreshToken: null, isLoggedIn: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    }
  )
);

export default useAuthStore;
