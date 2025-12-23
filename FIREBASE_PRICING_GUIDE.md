# Firebase 플랜 가이드

## 💰 Firebase 서비스별 플랜 요구사항

### ✅ Spark 플랜 (무료)으로 사용 가능한 서비스

1. **Firestore (데이터베이스)**
   - ✅ 무료 할당량: 1GB 저장, 50K 읽기/일, 20K 쓰기/일
   - ✅ 소규모 프로젝트에 충분
   - ✅ Netlify 배포 시에도 Spark 플랜으로 사용 가능

2. **Firebase Authentication**
   - ✅ 완전 무료
   - ✅ 제한 없음
   - ✅ Netlify 배포 시에도 Spark 플랜으로 사용 가능

3. **Firebase Hosting**
   - ✅ 무료 할당량: 10GB 저장, 360MB/일 전송
   - ✅ Netlify 사용 시 필요 없음

### ⚠️ Blaze 플랜 (Pay-as-you-go)이 필요한 서비스

1. **Firebase Cloud Functions**
   - ❌ Spark 플랜에서는 사용 불가
   - ✅ Blaze 플랜 필요
   - ⚠️ 하지만 무료 할당량 제공 (월 200만 호출, 400,000GB-초)

## 🎯 현재 프로젝트의 경우

### 시나리오 1: Cloud Functions 없이 배포 (Spark 플랜 가능)

**사용하는 서비스:**
- ✅ Firestore (데이터베이스)
- ✅ Firebase Authentication
- ✅ Netlify (프론트엔드 호스팅)

**결과:** Spark 플랜으로 충분! 💰 무료

**단점:**
- 포인트 거래 기능 (transaction, charge) 사용 불가
- 서버 사이드 로직을 클라이언트로 이동해야 함 (보안 위험)

### 시나리오 2: Cloud Functions 포함 배포 (Blaze 플랜 필요)

**사용하는 서비스:**
- ✅ Firestore
- ✅ Firebase Authentication
- ✅ Firebase Cloud Functions (transaction, charge)
- ✅ Netlify (프론트엔드)

**결과:** Blaze 플랜 필요 ⚠️

**하지만:**
- 무료 할당량이 충분함 (소규모 프로젝트)
- 실제 비용은 거의 0원에 가까움

## 💡 추천 방안

### 옵션 1: Blaze 플랜 사용 (권장)

**이유:**
1. **무료 할당량이 충분함**
   - 월 200만 함수 호출 무료
   - 소규모 프로젝트는 거의 비용 없음
   - 실제로 사용한 만큼만 과금

2. **보안**
   - 포인트 거래 로직을 서버에서 처리
   - 클라이언트에서 포인트 조작 불가능

3. **확장성**
   - 나중에 기능 추가 시 유연함

**예상 비용:**
- 소규모 프로젝트: **월 $0~$5** (무료 할당량 내)
- 중규모 프로젝트: **월 $5~$20**

### 옵션 2: Cloud Functions 제거 (Spark 플랜)

**변경 사항:**
- 포인트 거래 로직을 클라이언트로 이동
- Firestore Security Rules로 보안 강화

**단점:**
- 보안 취약점 (클라이언트에서 포인트 조작 가능)
- 복잡한 거래 로직 구현 어려움

## 📊 Firebase Blaze 플랜 무료 할당량

### Cloud Functions
- **호출**: 월 2,000,000회 무료
- **계산 시간**: 월 400,000GB-초 무료
- **네트워크**: 월 5GB 무료

### Firestore
- **저장**: 1GB 무료
- **읽기**: 일 50,000회 무료
- **쓰기**: 일 20,000회 무료
- **삭제**: 일 20,000회 무료

### 예상 사용량 (소규모 프로젝트)

**일일 사용량 예시:**
- 사용자 100명
- 상품 조회: 1,000회/일 (읽기)
- 상품 등록: 10회/일 (쓰기)
- 거래: 20회/일 (Functions 호출)

**월간 사용량:**
- Firestore 읽기: ~30,000회 (무료 할당량 내)
- Firestore 쓰기: ~300회 (무료 할당량 내)
- Functions 호출: ~600회 (무료 할당량 내)

**결론:** 무료 할당량으로 충분! 💰

## 🚀 배포 전략

### 단계별 접근

1. **로컬 개발** (현재)
   - ✅ 에뮬레이터 사용 (무료)
   - ✅ 모든 기능 테스트 가능

2. **프로토타입 배포** (Spark 플랜)
   - Firestore + Auth만 사용
   - Cloud Functions 없이 기본 기능만
   - 사용자 피드백 수집

3. **프로덕션 배포** (Blaze 플랜)
   - Cloud Functions 포함
   - 완전한 기능 제공
   - 무료 할당량 내에서 운영

## 💰 실제 비용 계산

### Blaze 플랜 과금 예시

**월 사용량이 무료 할당량을 초과한 경우:**

1. **Functions 호출**: 2,000,000회 초과 시
   - 초과분: $0.40 / 1,000,000회
   - 예: 2,100,000회 사용 = $0.04

2. **Firestore 읽기**: 50,000회/일 초과 시
   - 초과분: $0.06 / 100,000회
   - 예: 60,000회/일 = $0.06/일 = $1.80/월

**소규모 프로젝트 예상 비용:**
- 무료 할당량 내: **$0**
- 약간 초과: **$0~$5/월**

## ✅ 결론

### 질문: Netlify 배포해도 Blaze 플랜 필요?

**답변:**
- **Firestore + Auth만 사용**: Spark 플랜으로 가능 (무료)
- **Cloud Functions 포함**: Blaze 플랜 필요 (하지만 무료 할당량으로 충분)

### 추천

1. **로컬 개발**: 에뮬레이터 사용 (무료)
2. **프로토타입**: Spark 플랜으로 Firestore + Auth만 사용
3. **프로덕션**: Blaze 플랜으로 업그레이드 (무료 할당량 내에서 거의 무료)

**실제로는 소규모 프로젝트라면 Blaze 플랜도 거의 무료입니다!** 🎉

## 📝 참고 자료

- [Firebase 가격 정책](https://firebase.google.com/pricing)
- [Firebase 무료 할당량](https://firebase.google.com/pricing#blaze-calculator)
- [Cloud Functions 가격](https://firebase.google.com/pricing#functions)

