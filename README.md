# 중고거래 플랫폼 (당근마켓 클론)

Firebase와 React를 사용한 중고거래 플랫폼 프로젝트입니다.

**클라이언트 사이드 아키텍처**: Cloud Functions 없이 모든 로직을 클라이언트에서 실행합니다. Spark 플랜으로 무료 배포 가능합니다.

## 주요 기능

- 사용자 인증 (회원가입/로그인)
- 상품 목록 조회 및 검색
- 상품 상세 정보 확인
- 상품 등록 및 관리
- 포인트 기반 거래 시스템
- 포인트 충전 기능
- 거래 내역 조회
- 채팅 기능 (실시간 메시지 송수신)
- 프로필 수정

## 기술 스택

### Frontend
- React 18
- React Router DOM
- Firebase Client SDK (Authentication, Firestore)

### Backend
- Firestore Database (클라이언트 사이드)
- Firebase Authentication

### Deployment
- Frontend: Netlify
- Backend: Firebase

## 프로젝트 구조

```
clone-coding-ver1/
├── public/                     # Public assets
├── src/
│   ├── features/              # Feature modules
│   │   ├── auth/             # Authentication
│   │   ├── market/           # Product marketplace
│   │   ├── chat/             # Chat functionality
│   │   └── wallet/           # Point & transaction
│   ├── shared/               # Shared components
│   │   ├── components/       # Common UI components
│   │   └── utils/           # Utilities
│   ├── App.jsx
│   ├── index.js
│   └── index.css
├── scripts/                   # Utility scripts
│   └── seedEmulator.js      # 에뮬레이터용 더미 데이터
├── firestore.rules           # Firestore security rules
├── firestore.indexes.json    # Firestore indexes
├── firebase.json
└── package.json
```

## 설치 및 실행

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd clone-coding-ver1
```

### 2. 의존성 설치

```bash
npm install
```

### 3. Firebase 프로젝트 설정

1. [Firebase Console](https://console.firebase.google.com/)에서 새 프로젝트 생성
2. Firebase CLI 설치 및 로그인

```bash
npm install -g firebase-tools
firebase login
firebase use --add
```

3. Firestore 데이터베이스 생성 (테스트 모드로 시작)
4. Authentication 활성화 (이메일/비밀번호 인증 방법 활성화)

### 4. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일 생성:

```bash
cp .env.example .env
```

Firebase 설정 정보를 `.env` 파일에 입력:

```
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

### 5. Firestore Rules & Indexes 배포

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

### 6. 로컬 개발 환경 설정 (에뮬레이터 사용 - 무료)

Blaze 플랜 없이 로컬에서 테스트하려면:

```bash
# 1. Firestore 에뮬레이터 시작
npm run emulators:firestore

# 2. 새 터미널에서 더미 데이터 주입
npm run seed:emulator

# 3. 또 다른 터미널에서 React 앱 실행
npm start
```

### 7. 개발 서버 실행 (일반)

```bash
npm start
```

브라우저에서 `http://localhost:3000` 접속

## 배포

### Frontend (Netlify)

1. Netlify에 계정 생성 및 로그인
2. 새 사이트 생성
3. GitHub 저장소 연결
4. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `build`
5. 환경 변수 설정 (Netlify 대시보드에서)
6. 배포

### Backend (Firebase)

**Spark 플랜으로 무료 배포 가능!**

```bash
# Firestore Rules 배포
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

**참고:** Cloud Functions를 사용하지 않으므로 Blaze 플랜이 필요하지 않습니다. 모든 로직은 클라이언트 사이드에서 실행됩니다.

## 데이터베이스 스키마

### users
- uid: 사용자 ID
- email: 이메일
- displayName: 표시 이름
- point: 보유 포인트
- createdAt: 생성 시간

### products
- sellerId: 판매자 ID
- title: 상품 제목
- description: 상품 설명
- price: 가격
- status: 상태 (ON_SALE, RESERVED, SOLD_OUT)
- images: 이미지 URL 배열
- category: 카테고리

### point_logs
- userId: 사용자 ID
- type: 거래 유형 (CHARGE, TRANSFER)
- amount: 거래 금액
- balance: 거래 후 잔액
- description: 거래 설명

## 주요 기능 설명

### 포인트 거래
- 클라이언트 사이드에서 Firestore Transaction 사용
- 원자성 보장으로 안전한 거래 처리
- `src/features/wallet/api/transactionApi.js`에서 구현

### 포인트 충전
- 클라이언트 사이드에서 직접 처리
- Security Rules로 보안 관리
- `src/features/wallet/components/ChargeForm.jsx`에서 구현

## 보안 규칙

Firestore Security Rules는 다음과 같이 설정됩니다:

- 인증된 사용자만 데이터 읽기/쓰기 가능
- 사용자는 자신의 데이터만 수정 가능
- 포인트 수정은 제한적으로 허용 (충전/거래 한도 설정)
- 거래 내역은 본인만 조회 가능
- 채팅방은 참여자만 접근 가능

## 문제 해결

### Firebase 연결 오류
- `.env` 파일의 Firebase 설정 확인
- Firebase 프로젝트 콘솔에서 Authentication, Firestore 활성화 확인

### 빌드 오류
- 의존성 재설치: `rm -rf node_modules package-lock.json && npm install`

## 라이센스

ISC

## 작성자

clone-coding-ver1

