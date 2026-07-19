# CleanMatching 프로젝트 - Claude 컨텍스트

## 프로젝트 개요
청소 업체와 고객을 매칭하는 플랫폼. 고객이 청소 의뢰를 올리면 업체가 견적을 보내고, 고객이 수락하면 청소 진행 후 리뷰 작성.

## 기술 스택

### 웹 (C:\newcelan\web)
- React 18 + Tailwind CSS v3 + React Router v6
- Zustand (상태관리) + Axios (HTTP)
- 실행: `npm run dev` → http://localhost:5173

### 백엔드 (C:\newcelan\backend)
- Spring Boot 3.3.5 + Java 19 + Gradle
- JPA/Hibernate + MySQL 8.0
- JWT 인증 (AccessToken 30분 / RefreshToken 7일)
- WebSocket + STOMP (채팅)
- 실행: `.\gradlew bootRun` → http://localhost:8080

### DB
- MySQL 8.0 포트 **3307** (기본 포트 아님 주의)
- DB명: `cleanmatching`
- root 비밀번호 없음
- `ddl-auto=update` → 엔티티 필드 추가 시 자동으로 컬럼 생성

---

## 프로젝트 구조

### 백엔드 패키지 구조
```
com.cleanmatching.backend
├── config/
│   ├── DataInitializer.java     ← 테스트 데이터 자동 생성
│   ├── SecurityConfig.java
│   ├── WebSocketConfig.java
│   └── WebSocketAuthInterceptor.java  ← STOMP 연결 시 JWT 인증
├── security/
│   ├── JwtTokenProvider.java
│   └── JwtAuthenticationFilter.java
├── common/
│   └── GlobalExceptionHandler.java
└── domain/
    ├── user/
    │   ├── entity/User.java      ← Role: CUSTOMER / COMPANY / ADMIN
    │   ├── repository/UserRepository.java
    │   ├── dto/AuthDto.java
    │   ├── service/AuthService.java
    │   └── controller/AuthController.java
    ├── company/
    │   ├── entity/Company.java   ← ApprovalStatus: PENDING / APPROVED / REJECTED
    │   ├── repository/CompanyRepository.java
    │   ├── dto/CompanyDto.java
    │   ├── service/CompanyService.java
    │   └── controller/CompanyController.java
    ├── request/
    │   ├── entity/CleanRequest.java
    │   ├── repository/RequestRepository.java
    │   ├── dto/RequestDto.java
    │   ├── service/RequestService.java
    │   └── controller/RequestController.java
    ├── review/
    │   ├── entity/Review.java
    │   ├── repository/ReviewRepository.java
    │   ├── dto/ReviewDto.java
    │   ├── service/ReviewService.java
    │   └── controller/ReviewController.java
    ├── admin/
    │   ├── dto/AdminDto.java
    │   ├── service/AdminService.java
    │   └── controller/AdminController.java
    ├── chat/
    │   ├── entity/ChatRoom.java       ← (customer, company) 쌍당 1개, request와 무관하게 재사용
    │   ├── entity/ChatMessage.java
    │   ├── repository/ChatRoomRepository.java
    │   ├── repository/ChatMessageRepository.java
    │   ├── dto/ChatDto.java
    │   ├── service/ChatService.java
    │   ├── controller/ChatController.java          ← REST (방 목록/열기/메시지 이력)
    │   └── controller/ChatWebSocketController.java  ← STOMP 메시지 송수신
    └── support/
        ├── service/ChatbotService.java   ← OpenAI GPT 연동
        └── controller/ChatbotController.java
```

### 웹 구조 (web/)
```
src/
├── api/
│   ├── axios.js          ← baseURL: http://localhost:8080 (경로에 /api 직접 포함), JWT 인터셉터
│   ├── auth.js           ← signupCustomer/Company, login, getMe, checkEmail, updateMe(닉네임만), changePassword
│   ├── company.js        ← searchByRegion, searchNearby, getCompany, getMyProfile, updateProfile
│   ├── chat.js           ← getChatRooms, getMessages, openRoomWithCompany
│   ├── admin.js          ← getStats, getCompanies, approveCompany, rejectCompany, getUsers
│   ├── request.js        ← create, getMyRequests, getCompanyRequests, sendQuotation, accept, cancel, reject, start, complete
│   └── review.js         ← create(requestId, data)
├── store/
│   └── authStore.js      ← Zustand: user, accessToken, refreshToken, isLoggedIn, login, logout, updateUser
├── pages/
│   ├── Home.jsx
│   ├── SearchResult.jsx  ← 실제 API 연결 완료
│   ├── CompanyProfile.jsx ← 실제 API 연결 완료, 1:1 문의 버튼이 채팅방을 실제로 개설함
│   ├── RequestForm.jsx   ← 실제 API 연결 완료
│   ├── ReviewForm.jsx    ← 실제 API 연결 완료
│   ├── ChatList.jsx      ← 실제 API 연결 완료
│   ├── ChatRoom.jsx      ← 실제 API 연결 완료 (WebSocket STOMP)
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── CustomerSignup.jsx  ← 닉네임 필수 입력
│   │   └── CompanySignup.jsx
│   ├── customer/
│   │   ├── MyRequests.jsx    ← 실제 API 연결 완료 (QUOTED 상태에 "가격 협상하기" 채팅 버튼)
│   │   └── ProfileEdit.jsx   ← 닉네임/비밀번호만 수정 가능 (이름·전화번호는 표시만)
│   ├── company/
│   │   ├── Dashboard.jsx   ← 실제 API 연결 완료
│   │   ├── QuotationForm.jsx ← 실제 API 연결 완료
│   │   └── ProfileEdit.jsx   ← 소개/사진/활동지역/가격 등 수정, 업체명·사업자번호·대표자명·전화번호는 표시만
│   └── admin/
│       ├── AdminLayout.jsx
│       ├── AdminDashboard.jsx
│       ├── AdminCompanies.jsx
│       └── AdminUsers.jsx
└── components/
    ├── common/
    │   ├── Header.jsx
    │   ├── Footer.jsx
    │   ├── PrivateRoute.jsx
    │   ├── LoginPromptModal.jsx
    │   ├── StarRating.jsx
    │   └── ChatbotWidget.jsx  ← OpenAI API 연동 (키 필요)
    └── company/
        └── CompanyCard.jsx
```

---

## API 엔드포인트 정리

### 인증 (AuthController)
```
POST  /api/auth/signup/customer   ← 고객 회원가입 (닉네임 필수)
POST  /api/auth/signup/company    ← 업체 회원가입
POST  /api/auth/login             ← 로그인 → AccessToken + RefreshToken
GET   /api/auth/check-email       ← 이메일 중복 확인
GET   /api/auth/me                ← 내 정보 조회
PATCH /api/auth/me                ← 닉네임 수정 (이름/전화번호는 가입 후 고정, 여기서 못 바꿈)
PATCH /api/auth/me/password       ← 비밀번호 변경 (현재 비번 확인 필요)
```
> `/api/auth/refresh`, `/api/auth/logout`은 설계도상 계획됐지만 아직 구현 안 됨 (AuthController에 없음).

### 업체 (CompanyController)
```
GET  /api/companies/search?sido=서울&sigungu=강남구   ← 지역 검색 (평점순 정렬)
GET  /api/companies/nearby?lat=&lng=&radius=         ← GPS 근처 검색
GET  /api/companies/{id}                             ← 업체 상세 (리뷰 포함, 공개)
GET  /api/companies/me                               ← 내 업체 프로필 조회 (소유자 전용, 인증 필요)
PUT  /api/companies/me                                ← 내 업체 프로필 수정 (업체명/사업자번호는 응답엔 있지만 수정 불가)
```
> 프로필 이미지는 아직 URL 문자열만 저장 - 실제 업로드 API는 없음.

### 채팅 (ChatController + WebSocket)
```
GET  /api/chat/rooms                          ← 내 채팅방 목록
GET  /api/chat/rooms/{roomId}/messages        ← 메시지 이력 조회 + 읽음 처리
POST /api/chat/rooms/company/{companyId}      ← 업체와 채팅방 열기(없으면 생성) - 고객 전용, 견적 확정 전 가격 협상용

WS    /ws                       ← SockJS 접속 엔드포인트
STOMP /app/chat/{roomId}        ← 메시지 발송 (publish)
STOMP /topic/chat/{roomId}      ← 메시지 수신 (subscribe)
```
> ChatRoom은 (customer, company) 쌍당 1개만 존재하고 여러 의뢰(request)에서 재사용된다. request와는 무관.

### 의뢰 (RequestController)
```
POST   /api/requests                    ← 의뢰 생성
GET    /api/requests/my                 ← 내 의뢰 목록 (고객)
GET    /api/requests/company            ← 받은 의뢰 목록 (업체)
GET    /api/requests/company/stats      ← 업체 통계
POST   /api/requests/{id}/quote         ← 견적 발송 (업체)
PATCH  /api/requests/{id}/accept        ← 견적 수락 (고객) → 안전번호 발급
PATCH  /api/requests/{id}/cancel        ← 취소 (고객)
PATCH  /api/requests/{id}/reject        ← 거절 (업체)
PATCH  /api/requests/{id}/start         ← 청소 시작 (업체)
PATCH  /api/requests/{id}/complete      ← 완료 처리 (업체)
```

### 리뷰 (ReviewController)
```
POST /api/reviews/request/{requestId}  ← 리뷰 작성 (완료된 의뢰만 가능)
```

### 관리자 (AdminController)
```
GET   /api/admin/stats                  ← 통계 (회원수, 업체수 등)
GET   /api/admin/companies?status=      ← 업체 목록 (승인 대기 등)
PATCH /api/admin/companies/{id}/approve ← 업체 승인
PATCH /api/admin/companies/{id}/reject  ← 업체 거절
GET   /api/admin/users                  ← 전체 회원 목록
```

### 챗봇 (ChatbotController)
```
POST /api/chatbot/message  ← OpenAI GPT 응답 (OPENAI_API_KEY 환경변수 필요)
```

---

## 데이터 모델 핵심

### CleanRequest 상태 흐름
```
PENDING → QUOTED → ACCEPTED → IN_PROGRESS → COMPLETED
   ↘        ↘
  CANCELLED (고객 취소 또는 업체 거절 - 둘 다 이 상태 하나로 합쳐짐, 별도의 REJECTED 상태는 없음)
```

### Company 승인 흐름
```
PENDING → APPROVED (관리자 승인) → 검색 노출
        → REJECTED
```

### 안전번호 시스템
- 고객이 견적 수락(ACCEPTED) 시 `070-XXXX-XXXX` 형태 랜덤 생성
- `CleanRequest.safeNumber` 필드에 저장
- 실제 통신사 API 미연동 (현재 랜덤 번호)

### 베이지안 평점 (Bayesian Rating)
- 리뷰 등록 시 자동 업데이트
- `Company.bayesianRating` 필드
- 리뷰 수가 적어도 극단적 점수 방지

### 사용자 식별 정보 (User)
- `name`(실명), `phone`, `email`은 **가입 후 변경 불가** (본인확인/안전번호와 연결) - 수정 API 자체가 이 필드들을 받지 않음
- `nickname`: 리뷰·채팅에서 실명 대신 노출되는 이름. **고객은 필수**(가입 시 입력), 업체는 의미 없음(무시됨)
- `User.getDisplayName()`: 고객이면 닉네임(없으면 실명 마스킹 "홍*동"), 업체면 실명 그대로 반환 - 리뷰/채팅 응답은 전부 이 메서드를 거침

---

## 테스트 계정

| 역할 | 이메일 | 비밀번호 | 닉네임 |
|------|--------|----------|--------|
| 관리자 | admin@cleanmatching.com | admin1234! | - |
| 고객 | customer1@test.com | Test1234! | 청소요정 |
| 고객 | customer2@test.com | Test1234! | 철수 |
| 고객 | customer3@test.com | Test1234! | 영희 |
| 업체(승인됨) | clean1@test.com | Clean1234! | - |
| 업체(승인됨) | clean2@test.com | Clean1234! | - |
| 업체(승인됨) | clean3@test.com | Clean1234! | - |
| 업체(대기중) | clean4@test.com | Clean1234! | - |
| 업체(대기중) | clean5@test.com | Clean1234! | - |
| 업체(거절됨) | clean6@test.com | Clean1234! | - |

> ⚠️ `app/` 코드를 나중에 합칠 때 이 이메일들과 겹치는 시드 데이터가 있는지 먼저 확인할 것.
> `DataInitializer`는 `existsByEmail`로 중복 생성을 막지만, 같은 이메일에 다른 내용이 들어오면 에러 없이 조용히 무시되고 먼저 생성된 쪽이 남는다. (`backend/.../config/DataInitializer.java` 상단 주석 참고)

---

## 환경 설정

### application.properties 주요 설정
```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3307/cleanmatching?...
spring.jpa.hibernate.ddl-auto=update
jwt.secret=cleanmatching-super-secret-key-2024-must-be-at-least-256bits-long
jwt.access-token-expiration=1800000    # 30분
jwt.refresh-token-expiration=604800000  # 7일
openai.api-key=${OPENAI_API_KEY:your-api-key-here}
```

### MySQL 포트 주의사항
- 포트 3307 사용 (기본 3306 아님)
- MySQL CLI: `mysql -u root -P 3307 cleanmatching`

---

## 완료된 작업

- [x] 백엔드 전체 API 구현 (인증, 업체, 의뢰, 리뷰, 관리자, 챗봇, 채팅)
- [x] JWT 인증/인가 구현
- [x] WebSocket 실시간 채팅 (STOMP) - REST 방 목록/이력 조회 포함 완전히 연결됨
- [x] 견적 확정 전 1:1 채팅으로 가격 협상 가능 (업체 프로필 "1:1 문의", 내 의뢰 QUOTED 상태 "가격 협상하기")
- [x] 프론트엔드 API 클라이언트 모듈 (`src/api/*.js`)
- [x] SearchResult.jsx → 실제 API 연결
- [x] CompanyProfile.jsx → 실제 API 연결 (리뷰 포함)
- [x] RequestForm.jsx → 실제 API 연결
- [x] MyRequests.jsx → 실제 API 연결 (견적수락/취소)
- [x] Dashboard.jsx (업체) → 실제 API 연결 (거절/시작/완료)
- [x] QuotationForm.jsx → 실제 API 연결
- [x] ReviewForm.jsx → 실제 API 연결
- [x] 고객/업체 내 정보 수정 화면 (ProfileEdit.jsx) - 닉네임/비밀번호(고객), 소개/사진/지역/가격/비밀번호(업체). 이름·전화번호·업체명·사업자번호는 읽기 전용
- [x] 닉네임 시스템 - 리뷰/채팅에서 실명 대신 노출 (고객 필수)
- [x] DataInitializer: 테스트 데이터 자동 생성
- [x] MySQL role 컬럼 ADMIN 추가 (`ALTER TABLE users MODIFY COLUMN role enum(...)`)

## 미완료 작업 (TODO)

- [ ] OpenAI API 키 설정 (ChatbotWidget 동작을 위해)
- [ ] 업체 프로필 이미지 / 리뷰 사진 업로드 (현재 URL만 저장, 실제 업로드 API 없음)
- [ ] 안전번호 실제 통신사 API 연동
- [ ] `/api/auth/refresh`, `/api/auth/logout` 미구현 (AccessToken 만료 시 재로그인만 가능)
- [ ] E2E 전체 플로우 테스트

---

## 자주 발생한 이슈

### Spring Boot 시작 오류
```
Data truncated for column 'role'
→ ALTER TABLE users MODIFY COLUMN role enum('CUSTOMER','COMPANY','ADMIN') NOT NULL;
```

### curl로 한글 JSON 테스트 시 "서버 오류가 발생했습니다" / Invalid UTF-8 start byte
- Windows Git Bash에서 `curl -d '{"name":"홍길동"}'`처럼 따옴표 안에 한글을 직접 넣으면 쉘이 시스템 코드페이지(CP949 등)로 인코딩해서 보내버려 Jackson이 `JsonParseException: Invalid UTF-8 start byte`로 깨진다. 응답은 500(`서버 오류가 발생했습니다`)이라 백엔드 버그처럼 보이지만 실제로는 요청 인코딩 문제.
- 해결: Write 도구로 UTF-8 JSON 파일을 만들고 `curl --data-binary @파일경로` 로 보낼 것. (`-H "Content-Type: application/json; charset=utf-8"` 병행 권장)
- 이 문제로 실제로 테스트 계정 데이터가 깨진 적 있음(customer1의 name/phone이 오염됨) → DB에서 직접 복구했음. curl 테스트 후에는 값이 의도대로 저장됐는지 재확인할 것.

### 백엔드 재시작 방법
```powershell
# C:\newcelan\backend 에서
.\gradlew bootRun
```

### 웹 시작 방법
```powershell
# C:\newcelan\web 에서
npm run dev
```
