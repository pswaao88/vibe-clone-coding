# 실제 배포 가이드

## 🚀 배포 순서

### 1단계: Firebase 프로젝트 설정 확인

1. Firebase Console 접속: https://console.firebase.google.com/
2. 프로젝트 선택 또는 생성
3. 다음 서비스 활성화:
   - ✅ Authentication (이메일/비밀번호)
   - ✅ Firestore Database
   - ✅ Storage (이미지 업로드용, 선택사항)

### 2단계: Firestore Rules 배포

```bash
# Firestore Rules 배포 (Spark 플랜으로 가능 - 무료!)
firebase deploy --only firestore:rules

# Firestore Indexes 배포
firebase deploy --only firestore:indexes
```

**중요:** Spark 플랜으로도 배포 가능합니다!

### 3단계: Firebase 설정 정보 확인

Firebase Console → 프로젝트 설정 → 일반 → 앱에서 다음 정보 확인:

1. API Key
2. Auth Domain
3. Project ID
4. Storage Bucket
5. Messaging Sender ID
6. App ID

### 4단계: Netlify 배포

#### 방법 1: Netlify 대시보드에서 배포 (권장)

1. **Netlify 접속**: https://app.netlify.com/
2. **새 사이트 추가** → **GitHub에서 가져오기**
3. **저장소 선택**: `pswaao88/vibe-clone-coding`
4. **빌드 설정** (자동으로 `netlify.toml`에서 읽어옴):
   - Build command: `npm run build`
   - Publish directory: `build`
5. **환경 변수 설정**:
   - Site settings → Environment variables
   - 다음 변수 추가:

```
REACT_APP_FIREBASE_API_KEY=실제_API_키
REACT_APP_FIREBASE_AUTH_DOMAIN=프로젝트ID.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=프로젝트ID
REACT_APP_FIREBASE_STORAGE_BUCKET=프로젝트ID.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=실제_Sender_ID
REACT_APP_FIREBASE_APP_ID=실제_App_ID
```

6. **배포 시작**: "Deploy site" 클릭

#### 방법 2: Netlify CLI로 배포

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 로그인
netlify login

# 배포
npm run build
netlify deploy --prod
```

### 5단계: 배포 확인

1. Netlify에서 제공하는 URL로 접속
2. 로그인/회원가입 테스트
3. 상품 등록 테스트
4. 포인트 충전 테스트
5. 거래 테스트

## ✅ 배포 체크리스트

### Firebase
- [ ] Authentication 활성화
- [ ] Firestore Database 생성
- [ ] Firestore Rules 배포 완료
- [ ] Firestore Indexes 배포 완료
- [ ] Firebase 설정 정보 확인

### Netlify
- [ ] GitHub 저장소 연결
- [ ] 빌드 설정 확인
- [ ] 환경 변수 설정 완료
- [ ] 배포 성공 확인
- [ ] 사이트 접속 테스트

### 기능 테스트
- [ ] 회원가입/로그인
- [ ] 상품 목록 조회
- [ ] 상품 등록
- [ ] 상품 검색/필터
- [ ] 포인트 충전
- [ ] 상품 구매
- [ ] 채팅 기능

## 🔧 문제 해결

### Netlify 빌드 실패

1. **환경 변수 확인**
   - 모든 `REACT_APP_*` 변수가 설정되었는지 확인
   - 변수명 오타 확인

2. **빌드 로그 확인**
   - Netlify 대시보드 → Deploys → Build log 확인
   - 오류 메시지 확인

3. **로컬 빌드 테스트**
   ```bash
   npm run build
   ```
   - 로컬에서 빌드가 성공하는지 확인

### Firebase 연결 오류

1. **환경 변수 확인**
   - Netlify 대시보드에서 환경 변수 재확인
   - Firebase Console에서 설정 정보 재확인

2. **Firebase 프로젝트 확인**
   - Authentication 활성화 확인
   - Firestore 활성화 확인

### Firestore Rules 배포 실패

1. **프로젝트 ID 확인**
   ```bash
   firebase projects:list
   firebase use --add
   ```

2. **로그인 확인**
   ```bash
   firebase login
   ```

## 📝 배포 후 작업

1. **도메인 설정** (선택사항)
   - Netlify 대시보드 → Domain settings
   - 커스텀 도메인 연결

2. **모니터링 설정**
   - Netlify Analytics 활성화 (선택사항)
   - Firebase Console에서 사용량 모니터링

3. **백업 설정**
   - Firestore 데이터 정기 백업 (선택사항)

## 💰 비용

- **Firebase Spark 플랜**: 무료
- **Netlify 기본 플랜**: 무료
- **총 비용**: $0/월

## 🎉 완료!

배포가 완료되면 Netlify에서 제공하는 URL로 접속할 수 있습니다!

