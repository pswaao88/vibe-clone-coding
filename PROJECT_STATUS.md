# 프로젝트 현재 상태 및 작동 방식

## 📊 프로젝트 개요

**중고거래 플랫폼 (당근마켓 클론)** - Firebase와 React를 사용한 풀스택 웹 애플리케이션

## 🏗️ 아키텍처

### Frontend (클라이언트 사이드)
- **프레임워크**: React 18
- **라우팅**: React Router DOM v6
- **상태 관리**: React Hooks (Context API)
- **스타일링**: CSS (인라인 스타일 + CSS 파일)
- **배포**: Netlify

### Backend (클라이언트 사이드로 이동)
- **데이터베이스**: Firebase Firestore
- **인증**: Firebase Authentication
- **보안**: Firestore Security Rules
- **트랜잭션**: Firestore Transaction (클라이언트에서 직접 실행)
- **배포**: Firebase (Spark 플랜 - 무료)

### 주요 변경사항
- ✅ **Cloud Functions 제거**: 모든 로직을 클라이언트로 이동
- ✅ **무료 배포**: Spark 플랜으로 배포 가능
- ✅ **결제수단 불필요**: Blaze 플랜 업그레이드 불필요

## 🔄 작동 방식

### 1. 사용자 인증 흐름

```
사용자 → LoginPage/SignUpPage
  ↓
Firebase Authentication
  ↓
useAuth Hook (Context)
  ↓
전역 상태 관리 (user 객체)
  ↓
보호된 라우트 접근
```

**파일 위치:**
- `src/features/auth/hooks/useAuth.js` - 인증 로직
- `src/features/auth/pages/LoginPage.jsx` - 로그인 페이지
- `src/features/auth/pages/SignUpPage.jsx` - 회원가입 페이지

### 2. 상품 관리 흐름

```
MarketPage (상품 목록)
  ↓
useProducts Hook
  ↓
Firestore 쿼리 (products 컬렉션)
  ↓
실시간 업데이트 (onSnapshot)
  ↓
상품 카드 렌더링
```

**주요 기능:**
- 상품 목록 조회 (실시간)
- 상품 검색/필터링
- 상품 등록 (`ProductUploadPage`)
- 상품 상세 보기 (`ProductDetailPage`)
- 내 상품 관리 (`MyProductsPage`)

**파일 위치:**
- `src/features/market/hooks/useProducts.js` - 상품 조회 로직
- `src/features/market/pages/MarketPage.jsx` - 메인 마켓 페이지
- `src/features/market/pages/ProductUploadPage.jsx` - 상품 등록

### 3. 포인트 거래 흐름 (클라이언트 사이드)

```
사용자 → "구매하기" 버튼 클릭
  ↓
ProductDetailPage → handlePurchase()
  ↓
useTransaction Hook
  ↓
transactionApi.js
  ↓
Firestore Transaction 실행:
  1. Sender 잔액 확인
  2. Receiver 조회
  3. Product 상태 확인
  4. 포인트 이체 (원자적)
  5. point_logs 기록
  6. Product 상태 변경 (SOLD_OUT)
  ↓
채팅방 생성/이동
```

**보안:**
- Firestore Security Rules로 보호
- Firestore Transaction으로 원자성 보장
- 클라이언트에서 실행되지만 Rules로 제한

**파일 위치:**
- `src/features/wallet/api/transactionApi.js` - 거래 API
- `src/features/wallet/hooks/useTransaction.js` - 거래 Hook
- `firestore.rules` - 보안 규칙

### 4. 포인트 충전 흐름

```
사용자 → WalletPage → "충전하기"
  ↓
ChargeForm 컴포넌트
  ↓
Firestore Transaction:
  1. 사용자 조회
  2. 포인트 증가
  3. point_logs 기록
  ↓
사용자 정보 새로고침
```

**제한사항:**
- 최대 1,000,000원까지 충전 가능 (Security Rules)
- 본인만 충전 가능

**파일 위치:**
- `src/features/wallet/components/ChargeForm.jsx` - 충전 폼
- `src/features/wallet/pages/WalletPage.jsx` - 지갑 페이지

### 5. 채팅 흐름

```
상품 구매 완료
  ↓
채팅방 자동 생성 (chat_rooms)
  ↓
ChatPage 접속
  ↓
실시간 메시지 수신 (onSnapshot)
  ↓
메시지 전송 (addDoc)
  ↓
lastMessage 업데이트
```

**파일 위치:**
- `src/features/chat/pages/ChatPage.jsx` - 채팅 페이지
- `src/features/chat/hooks/useChat.js` - 채팅 로직

## 🗄️ 데이터베이스 구조

### Firestore 컬렉션

#### 1. `users` 컬렉션
```javascript
{
  uid: string,              // 사용자 ID (문서 ID)
  email: string,
  displayName: string,
  profileImageUrl: string,
  point: number,            // 보유 포인트
  createdAt: timestamp
}
```

#### 2. `products` 컬렉션
```javascript
{
  sellerId: string,
  title: string,
  description: string,
  price: number,
  category: string,
  status: 'ON_SALE' | 'RESERVED' | 'SOLD_OUT',
  images: string[],
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 3. `point_logs` 컬렉션
```javascript
{
  userId: string,
  type: 'CHARGE' | 'TRANSFER',
  amount: number,
  balance: number,          // 거래 후 잔액
  relatedUserId: string,    // 거래 상대방 (TRANSFER만)
  productId: string,        // 관련 상품 (TRANSFER만)
  description: string,
  createdAt: timestamp
}
```

#### 4. `chat_rooms` 컬렉션
```javascript
{
  productId: string,
  buyerId: string,
  sellerId: string,
  lastMessage: string,
  lastMessageAt: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 5. `messages` 서브컬렉션 (chat_rooms/{roomId}/messages)
```javascript
{
  senderId: string,
  content: string,
  read: boolean,
  createdAt: timestamp
}
```

## 🔒 보안 규칙

### Firestore Security Rules

**주요 규칙:**
1. **users**: 본인만 읽기/쓰기 가능, point 필드는 제한적 수정 가능
2. **products**: 인증된 사용자만 생성, 본인 글만 수정/삭제
3. **point_logs**: 본인만 읽기 가능, 본인만 생성 가능
4. **chat_rooms**: 참여자만 읽기/쓰기 가능
5. **messages**: 채팅방 참여자만 읽기/쓰기 가능

**포인트 거래 제한:**
- 충전 한도: 최대 1,000,000원
- 거래 한도: 최대 10,000,000원
- 본인만 포인트 수정 가능

## 🚀 배포 상태

### Firebase
- ✅ Firestore Rules 배포 완료
- ✅ Firestore Indexes 배포 완료
- ✅ 프로젝트 ID: `vibecoding-b8688`

### GitHub
- ✅ 저장소: https://github.com/pswaao88/vibe-clone-coding
- ✅ 최신 커밋: ESLint 오류 수정, Secrets Scanning 설정

### Netlify
- ⚠️ 배포 대기 중 (Secrets Scanning 설정 필요)
- 빌드 설정: `npm run build`
- 배포 디렉토리: `build/`

## 📁 프로젝트 구조

```
clone-coding-ver1/
├── src/
│   ├── features/
│   │   ├── auth/          # 인증 (로그인, 회원가입, 프로필)
│   │   ├── market/         # 상품 (목록, 상세, 등록, 관리)
│   │   ├── chat/          # 채팅 (채팅방, 메시지)
│   │   └── wallet/         # 지갑 (포인트, 거래, 충전)
│   ├── shared/
│   │   ├── components/    # 공용 컴포넌트 (Button, Header, Layout)
│   │   └── utils/         # 유틸리티 (firebase, constants)
│   └── App.jsx            # 메인 앱 컴포넌트
├── firestore.rules        # 보안 규칙
├── firestore.indexes.json # 인덱스 설정
├── netlify.toml           # Netlify 설정
└── package.json
```

## 🔧 개발 환경

### 로컬 개발
```bash
# 1. 에뮬레이터 시작
npm run emulators:firestore

# 2. 더미 데이터 주입
npm run seed:emulator

# 3. React 앱 실행
npm start
```

### 환경 변수
`.env` 파일에 다음 변수 설정:
```
REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...
```

## ⚡ 주요 특징

1. **완전 클라이언트 사이드**: Cloud Functions 없이 모든 로직 실행
2. **무료 배포**: Spark 플랜으로 배포 가능
3. **실시간 업데이트**: Firestore onSnapshot 사용
4. **원자적 거래**: Firestore Transaction으로 안전한 포인트 거래
5. **보안**: Security Rules로 데이터 보호

## 🐛 알려진 이슈

1. **Netlify Secrets Scanning**: 빌드 출력물에서 환경 변수 감지
   - 해결: Netlify 대시보드에서 Secrets Scanning 비활성화 필요
   - 참고: `NETLIFY_SECRETS_FIX.md`

## 📝 다음 단계

1. Netlify Secrets Scanning 설정 완료
2. Netlify 배포 성공 확인
3. 프로덕션 환경 테스트
4. 기능 개선 및 버그 수정

