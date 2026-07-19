import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import useRequireRole from '../../src/hooks/useRequireRole';
import useTabBarStyle from '../../src/hooks/useTabBarStyle';

export default function CompanyLayout() {
  useRequireRole('COMPANY');
  const tabBarStyle = useTabBarStyle();

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#1E90FF', tabBarStyle }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: '대시보드',
          tabBarIcon: ({ color, size }) => <Feather name="grid" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: '내 정보',
          tabBarIcon: ({ color, size }) => <Feather name="user" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
