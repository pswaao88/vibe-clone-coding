# 프로젝트 파일 구조 설명

## 📁 전체 구조

```
clone-coding-ver1/
├── public/                    # 정적 파일
│   └── index.html            # HTML 템플릿
├── src/                      # 소스 코드
│   ├── features/            # 기능별 모듈
│   ├── shared/              # 공용 컴포넌트/유틸리티
│   ├── App.jsx              # 메인 앱 컴포넌트
│   ├── index.js             # 진입점
│   └── index.css            # 전역 스타일
├── scripts/                  # 유틸리티 스크립트
│   └── seedEmulator.js      # 에뮬레이터용 더미 데이터
├── firestore.rules          # Firestore 보안 규칙
├── firestore.indexes.json   # Firestore 인덱스 설정
├── firebase.json            # Firebase 설정
├── netlify.toml             # Netlify 배포 설정
├── package.json             # 프로젝트 의존성
└── .gitignore               # Git 제외 파일
```

## 📂 src/features/ - 기능별 모듈

### 1. auth/ - 인증 관련
```
auth/
├── hooks/
│   └── useAuth.js          # 인증 Hook (로그인, 회원가입, 사용자 정보)
└── pages/
    ├── LoginPage.jsx        # 로그인 페이지
    ├── SignUpPage.jsx       # 회원가입 페이지
    └── ProfilePage.jsx      # 프로필 페이지
```

**주요 기능:**
- 사용자 인증 (로그인/회원가입)
- 사용자 정보 관리
- 전역 인증 상태 제공 (Context API)

### 2. market/ - 상품 마켓플레이스
```
market/
├── components/
│   ├── ProductCard.jsx      # 상품 카드 컴포넌트
│   └── ProductList.jsx      # 상품 리스트 컴포넌트
├── hooks/
│   ├── useProducts.js      # 상품 목록 조회 Hook
│   └── useProductDetail.js # 상품 상세 조회 Hook
└── pages/
    ├── MarketPage.jsx       # 메인 마켓 페이지 (상품 목록)
    ├── ProductDetailPage.jsx # 상품 상세 페이지
    ├── ProductUploadPage.jsx # 상품 등록 페이지
    └── MyProductsPage.jsx   # 내 상품 관리 페이지
```

**주요 기능:**
- 상품 목록 조회 및 검색/필터링
- 상품 상세 정보 확인
- 상품 등록 및 관리
- 실시간 상품 업데이트

### 3. chat/ - 채팅 기능
```
chat/
└── pages/
    └── ChatPage.jsx         # 채팅 페이지 (채팅방 목록 + 메시지)
```

**주요 기능:**
- 채팅방 목록 조회
- 실시간 메시지 송수신
- 채팅방 생성 및 관리

**참고:** `useChat.js` Hook은 제거되었고, ChatPage에서 직접 구현

### 4. wallet/ - 포인트 및 거래
```
wallet/
├── api/
│   └── transactionApi.js   # 포인트 거래 API (클라이언트 사이드)
├── components/
│   ├── ChargeForm.jsx       # 포인트 충전 폼
│   ├── PointBalance.jsx     # 포인트 잔액 표시
│   └── PointLogList.jsx     # 거래 내역 리스트
├── hooks/
│   ├── useTransaction.js    # 거래 실행 Hook
│   └── usePointLogs.js      # 거래 내역 조회 Hook
└── pages/
    └── WalletPage.jsx       # 지갑 페이지
```

**주요 기능:**
- 포인트 충전
- 포인트 거래 (상품 구매)
- 거래 내역 조회

## 📂 src/shared/ - 공용 모듈

### components/ - 공용 컴포넌트
```
shared/components/
├── Button.jsx               # 버튼 컴포넌트
├── Header.jsx               # 헤더 네비게이션
├── Layout.jsx              # 레이아웃 래퍼
└── Loading.jsx             # 로딩 스피너
```

### utils/ - 유틸리티
```
shared/utils/
├── firebase.js              # Firebase 초기화 및 설정
└── constants.js             # 상수 정의 (상품 상태, 거래 타입 등)
```

## 📂 scripts/ - 유틸리티 스크립트

```
scripts/
└── seedEmulator.js          # Firestore 에뮬레이터용 더미 데이터 생성
```

**사용법:**
```bash
npm run seed:emulator
```

## 📄 루트 파일

### 설정 파일
- **`package.json`** - 프로젝트 의존성 및 스크립트
- **`firebase.json`** - Firebase 설정 (Firestore, 에뮬레이터)
- **`netlify.toml`** - Netlify 배포 설정
- **`.firebaserc`** - Firebase 프로젝트 ID 설정
- **`.gitignore`** - Git 제외 파일 목록

### 보안 및 데이터베이스
- **`firestore.rules`** - Firestore 보안 규칙
- **`firestore.indexes.json`** - Firestore 인덱스 설정

### 문서 파일
- **`README.md`** - 프로젝트 개요 및 사용법
- **`plan.md`** - 프로젝트 설계 문서
- 기타 배포/개발 가이드 문서들

## 🔄 데이터 흐름

### 1. 인증 흐름
```
LoginPage/SignUpPage 
  → useAuth Hook 
  → Firebase Auth 
  → Context Provider 
  → 전역 user 상태
```

### 2. 상품 조회 흐름
```
MarketPage 
  → useProducts Hook 
  → Firestore 쿼리 
  → 실시간 업데이트 (onSnapshot)
  → ProductList → ProductCard
```

### 3. 거래 흐름
```
ProductDetailPage 
  → handlePurchase 
  → useTransaction Hook 
  → transactionApi 
  → Firestore Transaction 
  → 포인트 이체 + 로그 기록
```

### 4. 채팅 흐름
```
ProductDetailPage (채팅하기)
  → 채팅방 생성/찾기 
  → ChatPage 
  → 실시간 메시지 (onSnapshot)
```

## 📊 주요 패턴

### 1. Feature-based 구조
- 기능별로 폴더 분리
- 각 기능은 독립적으로 관리
- 재사용 가능한 컴포넌트는 `shared/`에 배치

### 2. Custom Hooks 패턴
- 비즈니스 로직을 Hook으로 분리
- UI와 로직 분리
- 재사용성 향상

### 3. 클라이언트 사이드 아키텍처
- Cloud Functions 없이 클라이언트에서 직접 처리
- Firestore Transaction으로 원자성 보장
- Security Rules로 보안 관리

## 🗂️ 파일 명명 규칙

- **컴포넌트**: PascalCase (예: `ProductCard.jsx`)
- **Hook**: camelCase with "use" prefix (예: `useAuth.js`)
- **유틸리티**: camelCase (예: `firebase.js`)
- **페이지**: PascalCase with "Page" suffix (예: `MarketPage.jsx`)

## 📝 주요 특징

1. **모듈화**: 기능별로 명확히 분리
2. **재사용성**: 공용 컴포넌트와 Hook 활용
3. **실시간 업데이트**: Firestore onSnapshot 사용
4. **타입 안정성**: 일관된 네이밍 규칙
5. **보안**: Security Rules로 데이터 보호

## 🔍 파일 찾기 가이드

- **인증 관련**: `src/features/auth/`
- **상품 관련**: `src/features/market/`
- **채팅 관련**: `src/features/chat/`
- **포인트/거래**: `src/features/wallet/`
- **공용 컴포넌트**: `src/shared/components/`
- **유틸리티**: `src/shared/utils/`
- **라우팅**: `src/App.jsx`
- **스타일**: `src/index.css`

