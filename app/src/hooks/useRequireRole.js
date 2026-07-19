import { useEffect } from 'react';
import { router } from 'expo-router';
import useAuthStore from '../store/authStore';

export default function useRequireRole(role) {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  useEffect(() => {
    if (!isLoggedIn || user?.role !== role) {
      router.replace('/');
    }
  }, [isLoggedIn, user, role]);
}
