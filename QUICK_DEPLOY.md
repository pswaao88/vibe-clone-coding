# 🚀 빠른 배포 가이드 (3단계)

## ✅ 1단계: Firebase Rules 배포 (완료!)

```bash
# 이미 완료됨!
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

## 📦 2단계: GitHub에 푸시

```bash
# 변경사항 커밋
git add .
git commit -m "배포 준비 완료"

# GitHub에 푸시
git push origin main
```

## 🌐 3단계: Netlify 배포

### 방법 A: Netlify 대시보드 (권장)

1. https://app.netlify.com/ 접속
2. "Add new site" → "Import an existing project"
3. GitHub 선택 → `vibe-clone-coding` 저장소 선택
4. "Deploy site" 클릭
5. 배포 후 **Site settings** → **Environment variables**에서 Firebase 설정 추가:

```
REACT_APP_FIREBASE_API_KEY=실제_API_키
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=실제_Sender_ID
REACT_APP_FIREBASE_APP_ID=실제_App_ID
```

6. "Trigger deploy" 클릭하여 재배포

### 방법 B: Netlify CLI

```bash
# Netlify CLI 설치
npm install -g netlify-cli

# 로그인
netlify login

# 배포
npm run build
netlify deploy --prod
```

## 🔑 Firebase 설정 정보 가져오기

1. Firebase Console → 프로젝트 설정 → 일반 접속
2. "Your apps" 섹션에서 웹 앱 선택 (없으면 "+" 버튼으로 생성)
3. 설정 정보 복사:

```javascript
const firebaseConfig = {
  apiKey: "AIza...",           // ← REACT_APP_FIREBASE_API_KEY
  authDomain: "...",            // ← REACT_APP_FIREBASE_AUTH_DOMAIN
  projectId: "your-project-id", // ← REACT_APP_FIREBASE_PROJECT_ID
  storageBucket: "...",         // ← REACT_APP_FIREBASE_STORAGE_BUCKET
  messagingSenderId: "...",     // ← REACT_APP_FIREBASE_MESSAGING_SENDER_ID
  appId: "1:..."                // ← REACT_APP_FIREBASE_APP_ID
};
```

## ✅ 완료!

배포가 완료되면 Netlify URL로 접속할 수 있습니다!

**참고:**
- Spark 플랜으로 무료 배포 가능
- 결제수단 등록 불필요
- 자세한 내용은 `NETLIFY_DEPLOY.md` 참고

