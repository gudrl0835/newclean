import { Platform } from 'react-native';
import Constants from 'expo-constants';

const BACKEND_PORT = 8080;

// 터널 모드(ngrok/exp.direct)로 접속한 클라이언트는 이 호스트로 8080을 직접 못 열기 때문에
// 백엔드가 실제로 떠 있는 PC의 주소로 대체한다. PC의 공인/LAN IP가 바뀌면 이 값도 갱신해야 함.
const TUNNEL_FALLBACK_HOST = '222.120.60.210';

function resolveHost() {
  const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.hostUri;
  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host.includes('exp.direct') || host.includes('ngrok')) {
      return TUNNEL_FALLBACK_HOST;
    }
    return host;
  }
  // Android 에뮬레이터에서 개발 PC의 localhost는 10.0.2.2로 접근
  if (Platform.OS === 'android') return '10.0.2.2';
  return 'localhost';
}

export const API_BASE_URL = `http://${resolveHost()}:${BACKEND_PORT}`;
