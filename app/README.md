# App

CleanMatching 모바일 앱 (React Native / Expo Router). 고객/업체/관리자 화면, 실시간 채팅(STOMP), 챗봇, 개인설정을 포함합니다.

공용 API 서버는 `../backend`를 사용합니다 (`http://localhost:8080`).

## 실행 방법

```
npm install
npx expo start
```

Expo Go 앱으로 QR을 스캔해서 접속합니다.

- SDK 54 고정 — Expo Go 앱스토어 배포 버전과 호환되는 버전. `expo` 패키지 버전을 임의로 올리지 마세요 (`AGENTS.md` 참고).
- `src/config/env.js`의 `TUNNEL_FALLBACK_HOST`는 개발 PC의 IP라 팀원별로 다를 수 있습니다 — 필요하면 각자 수정하세요.
- 실기기가 개발 PC와 다른 네트워크에 있다면 `npx expo start --tunnel`로 실행하세요.
