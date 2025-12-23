# Netlify 배포 가이드

## 🚀 빠른 배포 (5분)

### 1단계: Netlify 대시보드 접속

1. https://app.netlify.com/ 접속
2. GitHub 계정으로 로그인

### 2단계: 새 사이트 생성

1. **"Add new site"** 클릭
2. **"Import an existing project"** 선택
3. **"GitHub"** 선택
4. 저장소 검색: `vibe-clone-coding` 또는 `pswaao88/vibe-clone-coding`
5. 저장소 선택

### 3단계: 빌드 설정

Netlify가 자동으로 `netlify.toml` 파일을 읽어옵니다:

- **Build command**: `npm run build`
- **Publish directory**: `build`

**"Deploy site"** 클릭

### 4단계: 환경 변수 설정

배포가 시작되면 (또는 배포 후):

1. **Site settings** → **Environment variables** 클릭
2. **"Add variable"** 클릭하여 다음 변수 추가:

```
REACT_APP_FIREBASE_API_KEY=실제_API_키
REACT_APP_FIREBASE_AUTH_DOMAIN=vibecoding-b8688.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=vibecoding-b8688
REACT_APP_FIREBASE_STORAGE_BUCKET=vibecoding-b8688.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=실제_Sender_ID
REACT_APP_FIREBASE_APP_ID=실제_App_ID
```

3. **"Save"** 클릭

### 5단계: Firebase 설정 정보 확인

Firebase Console에서 설정 정보 가져오기:

1. https://console.firebase.google.com/project/vibecoding-b8688/settings/general 접속
2. "Your apps" 섹션에서 웹 앱 선택 (없으면 생성)
3. 설정 정보 복사

**설정 정보 위치:**
- Firebase Console → 프로젝트 설정 (⚙️) → 일반 → 앱 → 웹 앱

### 6단계: 재배포

환경 변수를 추가한 후:

1. **Deploys** 탭으로 이동
2. **"Trigger deploy"** → **"Clear cache and deploy site"** 클릭
3. 배포 완료 대기

### 7단계: 배포 확인

1. Netlify에서 제공하는 URL로 접속 (예: `https://random-name-123.netlify.app`)
2. 사이트가 정상적으로 로드되는지 확인
3. 로그인/회원가입 테스트

## 📋 배포 체크리스트

### Firebase 준비
- [x] Firestore Rules 배포 완료
- [ ] Firestore Indexes 배포 완료
- [ ] Firebase 설정 정보 확인

### Netlify 설정
- [ ] GitHub 저장소 연결
- [ ] 빌드 설정 확인
- [ ] 환경 변수 설정
- [ ] 배포 성공 확인

### 기능 테스트
- [ ] 사이트 접속
- [ ] 회원가입
- [ ] 로그인
- [ ] 상품 목록 조회
- [ ] 상품 등록
- [ ] 포인트 충전
- [ ] 상품 구매

## 🔧 문제 해결

### 빌드 실패

**오류**: `REACT_APP_FIREBASE_API_KEY is not defined`

**해결**:
1. Netlify 대시보드 → Site settings → Environment variables
2. 모든 `REACT_APP_*` 변수가 설정되었는지 확인
3. 변수명에 오타가 없는지 확인
4. "Trigger deploy" 클릭하여 재배포

### Firebase 연결 오류

**오류**: `Firebase: Error (auth/configuration-not-found)`

**해결**:
1. Firebase Console에서 Authentication 활성화 확인
2. Firestore Database 생성 확인
3. 환경 변수 값이 정확한지 확인

### 빌드 시간 초과

**해결**:
1. Netlify 대시보드 → Site settings → Build & deploy
2. Build timeout 증가 (기본 15분)

## 🎯 배포 후 작업

### 1. 커스텀 도메인 설정 (선택사항)

1. Netlify 대시보드 → Domain settings
2. "Add custom domain" 클릭
3. 도메인 입력 및 DNS 설정

### 2. HTTPS 자동 설정

Netlify는 자동으로 HTTPS를 제공합니다. 별도 설정 불필요.

### 3. 환경 변수 관리

- **Production**: 프로덕션 환경 변수
- **Deploy previews**: PR 미리보기용 변수
- **Branch deploys**: 브랜치별 변수

## 📊 배포 상태 확인

Netlify 대시보드에서:
- **Deploys**: 배포 히스토리
- **Analytics**: 방문자 통계 (Pro 플랜)
- **Functions**: Netlify Functions (사용 안 함)

## ✅ 완료!

배포가 완료되면 Netlify URL로 접속할 수 있습니다!

**다음 단계:**
1. 사이트 테스트
2. 사용자 피드백 수집
3. 기능 개선

