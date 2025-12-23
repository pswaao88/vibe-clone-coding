# 로컬 개발 가이드

## 🔴 Firebase Functions 배포 오류 해결

Firebase Cloud Functions를 배포하려면 **Blaze (pay-as-you-go) 플랜**이 필요합니다.

### 옵션 1: 로컬 에뮬레이터 사용 (권장 - 무료)

로컬 개발 환경에서는 Firebase 에뮬레이터를 사용하여 Functions를 테스트할 수 있습니다.

#### 1. 에뮬레이터 시작

```bash
# 모든 에뮬레이터 시작 (Functions + Firestore)
npm run emulators:all

# 또는 Functions만 시작
npm run emulators:functions

# 또는 Firebase CLI 직접 사용
firebase emulators:start
```

#### 2. 에뮬레이터 UI 접속

에뮬레이터가 시작되면 다음 URL에서 관리할 수 있습니다:
- **에뮬레이터 UI**: http://localhost:4000
- **Functions 엔드포인트**: http://localhost:5001

#### 3. 환경 변수 설정

로컬 개발 시 `.env` 파일에 에뮬레이터 URL을 설정:

```bash
# .env 파일
REACT_APP_FUNCTIONS_URL=http://localhost:5001/your-project-id/us-central1
```

또는 `src/shared/utils/constants.js`에서 자동으로 감지:

```javascript
export const FUNCTIONS_URL = process.env.NODE_ENV === 'development'
  ? `http://localhost:5001/${process.env.REACT_APP_FIREBASE_PROJECT_ID || 'your-project-id'}/us-central1`  // 로컬 에뮬레이터
  : process.env.REACT_APP_FUNCTIONS_URL || 
    `https://us-central1-${process.env.REACT_APP_FIREBASE_PROJECT_ID || 'your-project-id'}.cloudfunctions.net`;  // 프로덕션
```

#### 4. React 앱과 함께 실행

**터미널 1**: Firebase 에뮬레이터
```bash
npm run emulators:all
```

**터미널 2**: React 개발 서버
```bash
npm start
```

### 옵션 2: Blaze 플랜으로 업그레이드 (실제 배포 시 필요)

실제 프로덕션 환경에 배포하려면:

1. **Firebase Console에서 업그레이드**
   - Firebase Console → 프로젝트 설정 → 사용량 및 결제
   - Blaze 플랜으로 업그레이드
   - 신용카드 등록 필요 (무료 할당량 제공)

2. **업그레이드 후 배포**
   ```bash
   firebase deploy --only functions
   ```

## 📝 로컬 개발 워크플로우

### 1. 개발 환경 설정

```bash
# 1. 의존성 설치
npm install
cd functions && npm install && cd ..

# 2. Firebase 로그인
firebase login

# 3. 프로젝트 선택
firebase use --add
# 또는
firebase use your-project-id
```

### 2. 에뮬레이터 시작

```bash
# 모든 서비스 (Functions + Firestore)
npm run emulators:all
```

에뮬레이터가 시작되면:
- Functions: http://localhost:5001
- Firestore: http://localhost:8080
- UI: http://localhost:4000

### 3. React 앱 실행

새 터미널에서:
```bash
npm start
```

React 앱이 http://localhost:3000 에서 실행됩니다.

### 4. Functions 테스트

에뮬레이터에서 Functions를 테스트하려면:

```bash
# 예: transaction 함수 테스트
curl -X POST http://localhost:5001/your-project-id/us-central1/transaction \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "senderId": "user-id",
    "receiverId": "seller-id",
    "amount": 10000,
    "productId": "product-id"
  }'
```

## 🔧 문제 해결

### 에뮬레이터가 시작되지 않는 경우

1. **포트가 이미 사용 중인 경우**
   ```bash
   # Windows에서 포트 확인
   netstat -ano | findstr :5001
   
   # 프로세스 종료 후 재시작
   ```

2. **Java가 설치되지 않은 경우**
   - Firestore 에뮬레이터는 Java가 필요합니다
   - Java 11 이상 설치 필요

### Functions가 작동하지 않는 경우

1. **에뮬레이터가 실행 중인지 확인**
   - http://localhost:4000 접속하여 확인

2. **환경 변수 확인**
   - `.env` 파일에 올바른 URL 설정
   - 개발 모드에서는 로컬 URL 사용

3. **Functions 코드 확인**
   - `functions/src/index.js`에서 함수가 export되었는지 확인
   - `firebase.json`의 설정 확인

## 📚 참고 자료

- [Firebase 에뮬레이터 문서](https://firebase.google.com/docs/emulator-suite)
- [로컬 Functions 테스트](https://firebase.google.com/docs/functions/local-emulator)
- [Blaze 플랜 정보](https://firebase.google.com/pricing)

## 💡 팁

- 로컬 개발 시에는 항상 에뮬레이터 사용
- 프로덕션 배포 전에 로컬에서 충분히 테스트
- Blaze 플랜은 무료 할당량이 있어서 소규모 프로젝트는 비용이 거의 들지 않음

