import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function useTabBarStyle() {
  const insets = useSafeAreaInsets();
  return {
    height: 56 + insets.bottom,
    paddingBottom: insets.bottom + 6,
    paddingTop: 6,
  };
}
