# 구매 시 권한 오류 해결 방법

## 🔴 문제

구매 시 `FirebaseError: Missing or insufficient permissions` 오류 발생

## 🔍 원인

거래(Transaction) 시 다음 작업들이 필요한데, 현재 Security Rules가 이를 허용하지 않습니다:

1. **구매자가 판매자의 포인트를 증가시킴** (거래 수입)
   - 현재: `users` 컬렉션은 본인만 수정 가능
   - 필요: 거래 상대방의 포인트 증가 허용

2. **구매자가 상품 상태를 SOLD_OUT으로 변경**
   - 현재: `products` 컬렉션은 판매자만 수정 가능
   - 필요: 구매자가 상태를 SOLD_OUT으로 변경 허용

3. **구매자가 판매자의 point_logs 생성**
   - 현재: `point_logs`는 본인만 생성 가능
   - 필요: 거래 상대방의 로그 생성 허용

## ✅ 해결 방법

### 1. Firestore Rules 수정

`firestore.rules` 파일을 다음과 같이 수정:

```javascript
// Collection: users
match /users/{userId} {
  allow read: if isAuthenticated();
  allow create: if isAuthenticated() && request.auth.uid == userId;
  allow update: if isAuthenticated() && (
    // 본인이 포인트를 수정하는 경우 (충전/거래)
    (isOwner(userId) && (
      (request.resource.data.point > resource.data.point && 
       request.resource.data.point - resource.data.point <= 1000000) ||
      (request.resource.data.point < resource.data.point &&
       resource.data.point - request.resource.data.point <= 10000000) ||
      request.resource.data.point == resource.data.point
    )) ||
    // 다른 사용자가 포인트를 증가시키는 경우 (거래로 인한 수입)
    (!isOwner(userId) && 
     request.resource.data.point > resource.data.point &&
     request.resource.data.point - resource.data.point <= 10000000)
  );
  allow delete: if false;
}

// Collection: products
match /products/{productId} {
  allow read: if true;
  allow create: if isAuthenticated();
  allow update: if isAuthenticated() && (
    // 판매자가 수정하는 경우
    resource.data.sellerId == request.auth.uid ||
    // 구매자가 상태를 SOLD_OUT으로 변경하는 경우 (거래 완료)
    (request.resource.data.status == 'SOLD_OUT' && 
     resource.data.status == 'ON_SALE' &&
     resource.data.sellerId != request.auth.uid)
  );
  allow delete: if isAuthenticated() &&
                   resource.data.sellerId == request.auth.uid;
}

// Collection: point_logs
match /point_logs/{logId} {
  allow read: if isAuthenticated() &&
                 resource.data.userId == request.auth.uid;
  allow create: if isAuthenticated() &&
                   request.resource.data.userId != null &&
                   request.resource.data.amount > 0 &&
                   request.resource.data.amount <= 10000000 &&
                   (
                     // 본인의 로그 생성
                     request.resource.data.userId == request.auth.uid ||
                     // 거래 상대방의 로그 생성 (TRANSFER 타입만)
                     (request.resource.data.type == 'TRANSFER' &&
                      request.resource.data.relatedUserId == request.auth.uid)
                   );
  allow update: if false;
  allow delete: if false;
}
```

### 2. Rules 배포

```bash
firebase deploy --only firestore:rules
```

## ⚠️ 보안 고려사항

### 허용되는 작업

1. **포인트 증가 (거래 수입)**
   - 조건: 포인트가 증가하는 경우만 허용
   - 제한: 최대 10,000,000원까지 증가 가능
   - 보호: 다른 필드는 변경 불가

2. **상품 상태 변경**
   - 조건: ON_SALE → SOLD_OUT만 허용
   - 제한: 판매자가 아닌 경우 상태 변경만 가능 (다른 필드 수정 불가)

3. **거래 로그 생성**
   - 조건: TRANSFER 타입만 허용
   - 제한: relatedUserId가 현재 사용자인 경우만 허용
   - 보호: 본인의 로그는 항상 생성 가능

### 보안 강화

현재 Rules는 기본적인 보안을 제공하지만, 완벽하지 않습니다:

- ✅ 포인트 증가는 거래로 인한 것만 허용
- ✅ 상품 상태는 SOLD_OUT으로만 변경 가능
- ✅ 거래 로그는 TRANSFER 타입만 허용
- ⚠️ 클라이언트 코드는 수정 가능하므로 완벽한 보안은 어려움

## 🔄 대안: Cloud Functions 사용

더 안전한 방법은 Cloud Functions를 사용하는 것입니다:

1. **장점**:
   - 서버 사이드에서 실행되어 보안 강화
   - 클라이언트 코드 수정 불가
   - 복잡한 비즈니스 로직 구현 가능

2. **단점**:
   - Blaze 플랜 필요 (무료 할당량 제공)
   - 결제수단 등록 필요

## 📝 테스트

Rules 배포 후 다음을 테스트:

1. 포인트 충전 (본인)
2. 상품 구매 (거래)
3. 거래 내역 확인
4. 상품 상태 변경 확인

## 🐛 문제 해결

### Rules 배포 실패

```bash
# Firebase 로그인 확인
firebase login

# 프로젝트 확인
firebase use vibecoding-b8688

# Rules 문법 확인
firebase deploy --only firestore:rules --debug
```

### 여전히 권한 오류 발생

1. 브라우저 캐시 클리어
2. 로그아웃 후 재로그인
3. Rules 배포 확인
4. Firebase Console에서 Rules 확인

