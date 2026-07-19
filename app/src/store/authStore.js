import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isLoggedIn: false,

      login: async (loginResponse) => {
        await SecureStore.setItemAsync('accessToken', loginResponse.accessToken);
        await SecureStore.setItemAsync('refreshToken', loginResponse.refreshToken);
        set({
          user: {
            id: loginResponse.userId,
            email: loginResponse.email,
            name: loginResponse.name,
            role: loginResponse.role,
          },
          isLoggedIn: true,
        });
      },

      logout: async () => {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        set({ user: null, isLoggedIn: false });
      },

      updateUser: (partial) => set((state) => ({ user: { ...state.user, ...partial } })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, isLoggedIn: state.isLoggedIn }),
    }
  )
);

export default useAuthStore;
