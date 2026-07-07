# CleanMatching 프로젝트 - Claude 컨텍스트

## 프로젝트 개요
청소 업체와 고객을 매칭하는 플랫폼. 고객이 청소 의뢰를 올리면 업체가 견적을 보내고, 고객이 수락하면 청소 진행 후 리뷰 작성.

## 기술 스택

### 프론트엔드 (C:\newcelan\frontend)
- React 18 + Tailwind CSS v3 + React Router v6
- Zustand (상태관리) + Axios (HTTP)
- 실행: `npm run dev` → http://localhost:5173

### 백엔드 (C:\newcelan\backend\backend)
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
│   └── WebSocketConfig.java
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
    │   ├── entity/ChatRoom.java
    │   └── entity/ChatMessage.java
    └── support/
        ├── service/ChatbotService.java   ← OpenAI GPT 연동
        └── controller/ChatbotController.java
```

### 프론트엔드 구조
```
src/
├── api/
│   ├── axios.js          ← baseURL: http://localhost:8080/api, JWT 인터셉터
│   ├── auth.js           ← login, signup, refresh, logout
│   ├── company.js        ← searchByRegion, searchNearby, getCompany
│   ├── admin.js          ← getStats, getCompanies, approveCompany, rejectCompany, getUsers
│   ├── request.js        ← create, getMyRequests, getCompanyRequests, sendQuotation, accept, cancel, reject, start, complete
│   └── review.js         ← create(requestId, data)
├── store/
│   └── authStore.js      ← Zustand: user, token, setAuth, logout
├── pages/
│   ├── Home.jsx
│   ├── SearchResult.jsx  ← 실제 API 연결 완료
│   ├── CompanyProfile.jsx ← 실제 API 연결 완료
│   ├── RequestForm.jsx   ← 실제 API 연결 완료
│   ├── ReviewForm.jsx    ← 실제 API 연결 완료
│   ├── ChatList.jsx      ← UI만 (WebSocket 미연결)
│   ├── ChatRoom.jsx      ← UI만 (WebSocket 미연결)
│   ├── auth/
│   │   ├── Login.jsx
│   │   ├── CustomerSignup.jsx
│   │   └── CompanySignup.jsx
│   ├── customer/
│   │   └── MyRequests.jsx  ← 실제 API 연결 완료
│   ├── company/
│   │   ├── Dashboard.jsx   ← 실제 API 연결 완료
│   │   └── QuotationForm.jsx ← 실제 API 연결 완료
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
POST /api/auth/signup/customer   ← 고객 회원가입
POST /api/auth/signup/company    ← 업체 회원가입
POST /api/auth/login             ← 로그인 → AccessToken + RefreshToken
POST /api/auth/refresh           ← 토큰 갱신
POST /api/auth/logout            ← 로그아웃
GET  /api/auth/me                ← 내 정보 조회
```

### 업체 (CompanyController)
```
GET  /api/companies/search?sido=서울&sigungu=강남구   ← 지역 검색
GET  /api/companies/nearby?lat=&lng=&radius=         ← 근처 검색
GET  /api/companies/{id}                             ← 업체 상세 (리뷰 포함)
PUT  /api/companies/profile                          ← 내 업체 프로필 수정
POST /api/companies/profile/images                   ← 이미지 업로드
```

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
                ↘ REJECTED (업체)
         ↘ CANCELLED (고객)
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

---

## 테스트 계정

| 역할 | 이메일 | 비밀번호 |
|------|--------|----------|
| 관리자 | admin@cleanmatching.com | admin1234! |
| 고객 | customer1@test.com | Test1234! |
| 업체(승인됨) | clean1@test.com | Clean1234! |
| 업체(승인됨) | clean2@test.com | Clean1234! |
| 업체(승인됨) | clean3@test.com | Clean1234! |
| 업체(대기중) | clean4@test.com | Clean1234! |
| 업체(대기중) | clean5@test.com | Clean1234! |

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

- [x] 백엔드 전체 API 구현 (인증, 업체, 의뢰, 리뷰, 관리자, 챗봇)
- [x] JWT 인증/인가 구현
- [x] WebSocket 설정 (채팅 엔티티 및 Config)
- [x] 프론트엔드 API 클라이언트 모듈 (`src/api/*.js`)
- [x] SearchResult.jsx → 실제 API 연결
- [x] CompanyProfile.jsx → 실제 API 연결 (리뷰 포함)
- [x] RequestForm.jsx → 실제 API 연결
- [x] MyRequests.jsx → 실제 API 연결 (견적수락/취소)
- [x] Dashboard.jsx (업체) → 실제 API 연결 (거절/시작/완료)
- [x] QuotationForm.jsx → 실제 API 연결
- [x] ReviewForm.jsx → 실제 API 연결
- [x] DataInitializer: 테스트 데이터 자동 생성
- [x] MySQL role 컬럼 ADMIN 추가 (`ALTER TABLE users MODIFY COLUMN role enum(...)`)

## 미완료 작업 (TODO)

- [ ] ChatList.jsx / ChatRoom.jsx: WebSocket 실시간 채팅 연결 (UI만 존재)
- [ ] OpenAI API 키 설정 (ChatbotWidget 동작을 위해)
- [ ] 업체 프로필 이미지 / 리뷰 사진 업로드 (현재 URL만 저장)
- [ ] 안전번호 실제 통신사 API 연동
- [ ] E2E 전체 플로우 테스트

---

## 자주 발생한 이슈

### Spring Boot 시작 오류
```
Data truncated for column 'role'
→ ALTER TABLE users MODIFY COLUMN role enum('CUSTOMER','COMPANY','ADMIN') NOT NULL;
```

### 백엔드 재시작 방법
```powershell
# C:\newcelan\backend\backend 에서
.\gradlew bootRun
```

### 프론트엔드 시작 방법
```powershell
# C:\newcelan\frontend 에서
npm run dev
```
