# 클라이언트 사이드 배포 가이드 (Spark 플랜 - 무료)

## ✅ 완료된 변경사항

Cloud Functions를 제거하고 모든 로직을 클라이언트로 이동했습니다.

### 변경된 파일

1. **`src/features/wallet/api/transactionApi.js`**
   - Cloud Functions 호출 제거
   - Firestore Transaction 직접 사용

2. **`src/features/wallet/hooks/useTransaction.js`**
   - 토큰 인증 제거
   - 직접 Firestore 호출

3. **`src/features/wallet/components/ChargeForm.jsx`**
   - Cloud Functions 호출 제거
   - Firestore Transaction 직접 사용

4. **`firestore.rules`**
   - 클라이언트에서 포인트 수정 허용 (제한적)
   - point_logs 생성 허용 (본인만)

## 🚀 배포 방법

### 1. Firestore Rules 배포

```bash
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

**중요:** Spark 플랜으로도 가능합니다! (무료)

### 2. Netlify에 프론트엔드 배포

1. Netlify 대시보드에서 새 사이트 생성
2. GitHub 저장소 연결
3. 빌드 설정:
   - Build command: `npm run build`
   - Publish directory: `build`
4. 환경 변수 설정:
   ```
   REACT_APP_FIREBASE_API_KEY=your-api-key
   REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   REACT_APP_FIREBASE_PROJECT_ID=your-project-id
   REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   REACT_APP_FIREBASE_APP_ID=your-app-id
   ```

### 3. 완료!

이제 **Blaze 플랜 없이** 배포할 수 있습니다! 🎉

## ⚠️ 보안 주의사항

자세한 내용은 `CLIENT_SIDE_SECURITY.md` 참고

### 주요 보안 조치

1. **Security Rules로 보호**
   - 본인만 포인트 수정 가능
   - 충전 한도: 최대 1,000,000원
   - 거래 한도: 최대 10,000,000원

2. **Firestore Transaction 사용**
   - 원자성 보장
   - 동시 거래 안전

3. **제한사항**
   - 클라이언트 코드는 수정 가능
   - 완벽한 보안은 어려움

## 📋 배포 체크리스트

- [ ] Firestore Rules 배포 완료
- [ ] Firestore Indexes 배포 완료
- [ ] Netlify 환경 변수 설정 완료
- [ ] Netlify 빌드 성공 확인
- [ ] 배포된 사이트에서 로그인 테스트
- [ ] 포인트 충전 테스트
- [ ] 상품 거래 테스트

## 💰 비용

- **Firebase Spark 플랜**: 무료
- **Netlify**: 무료 (기본 플랜)
- **총 비용**: $0/월

## 🔄 Cloud Functions로 되돌리기

나중에 Cloud Functions를 사용하고 싶다면:

1. `functions/src/transaction.js`와 `functions/src/charge.js` 복원
2. `src/features/wallet/api/transactionApi.js`를 원래대로 복원
3. `firestore.rules`를 원래대로 복원
4. Blaze 플랜으로 업그레이드
5. Functions 배포

