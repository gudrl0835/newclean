import { Redirect } from 'expo-router';
import useAuthStore from '../src/store/authStore';

export default function Index() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);

  if (!isLoggedIn) return <Redirect href="/(auth)/login" />;
  if (user?.role === 'COMPANY') return <Redirect href="/(company)/dashboard" />;
  if (user?.role === 'ADMIN') return <Redirect href="/(admin)/dashboard" />;
  return <Redirect href="/(tabs)/home" />;
}
