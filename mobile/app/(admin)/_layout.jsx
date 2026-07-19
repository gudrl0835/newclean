import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import useRequireRole from '../../src/hooks/useRequireRole';

export default function AdminLayout() {
  useRequireRole('ADMIN');

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#1E90FF' }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: '대시보드',
          tabBarIcon: ({ color, size }) => <Feather name="bar-chart-2" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="companies"
        options={{
          title: '업체승인',
          tabBarIcon: ({ color, size }) => <Feather name="check-square" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: '회원관리',
          tabBarIcon: ({ color, size }) => <Feather name="users" color={color} size={size} />,
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
