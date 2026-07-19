import { Tabs } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import useTabBarStyle from '../../src/hooks/useTabBarStyle';

export default function TabsLayout() {
  const tabBarStyle = useTabBarStyle();

  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: '#1E90FF', tabBarStyle }}>
      <Tabs.Screen
        name="home"
        options={{
          title: '홈',
          tabBarIcon: ({ color, size }) => <Feather name="home" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="my-requests"
        options={{
          title: '내 의뢰',
          tabBarIcon: ({ color, size }) => <Feather name="clipboard" color={color} size={size} />,
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
