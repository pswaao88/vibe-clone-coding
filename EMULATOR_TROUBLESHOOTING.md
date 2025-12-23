# 에뮬레이터 문제 해결 가이드

## ❌ "Failed to get document because the client is offline" 오류

이 오류는 Firestore 에뮬레이터에 연결되지 않았을 때 발생합니다.

### 해결 방법

#### 1. 에뮬레이터가 실행 중인지 확인

```bash
# 터미널에서 에뮬레이터 시작
npm run emulators:firestore
```

에뮬레이터가 정상적으로 시작되면 다음과 같은 메시지가 표시됩니다:
```
✔  firestore: Firestore Emulator running at http://localhost:8080
```

#### 2. 브라우저 콘솔 확인

브라우저 개발자 도구(F12)를 열고 콘솔 탭에서 다음 메시지를 확인:
- ✅ `Firestore 에뮬레이터에 연결되었습니다. (localhost:8080)`
- ❌ `Firestore 에뮬레이터 연결 실패` - 에뮬레이터가 실행되지 않음

#### 3. 포트 확인

에뮬레이터가 다른 포트에서 실행 중일 수 있습니다:
- 기본 Firestore 포트: `8080`
- 에뮬레이터 UI: `4000`

포트가 사용 중인 경우:
```bash
# Windows에서 포트 확인
netstat -ano | findstr :8080

# 포트를 사용하는 프로세스 종료 후 재시작
```

#### 4. 환경 변수 확인

`.env` 파일이 프로젝트 루트에 있는지 확인:
```bash
REACT_APP_USE_EMULATOR=true
```

또는 `src/shared/utils/firebase.js`에서 자동으로 개발 모드에서 에뮬레이터를 사용합니다.

#### 5. 완전한 재시작

1. **에뮬레이터 중지** (Ctrl+C)
2. **React 앱 중지** (Ctrl+C)
3. **에뮬레이터 재시작**
   ```bash
   npm run emulators:firestore
   ```
4. **React 앱 재시작**
   ```bash
   npm start
   ```
5. **브라우저 새로고침** (Ctrl+Shift+R 또는 F5)

## 🔍 체크리스트

- [ ] 에뮬레이터가 실행 중인가? (`npm run emulators:firestore`)
- [ ] 에뮬레이터가 `http://localhost:8080`에서 실행 중인가?
- [ ] 브라우저 콘솔에 "에뮬레이터에 연결되었습니다" 메시지가 있는가?
- [ ] `.env` 파일이 있는가? (선택사항)
- [ ] React 앱이 개발 모드로 실행 중인가? (`npm start`)

## 🚀 올바른 실행 순서

### 터미널 1: 에뮬레이터
```bash
npm run emulators:firestore
```
**기다림**: 에뮬레이터가 완전히 시작될 때까지 기다립니다.

### 터미널 2: 더미 데이터 (한 번만)
```bash
npm run seed:emulator
```

### 터미널 3: React 앱
```bash
npm start
```

## 💡 추가 팁

### 에뮬레이터 UI 확인
http://localhost:4000 에서 에뮬레이터 상태를 확인할 수 있습니다.

### 네트워크 탭 확인
브라우저 개발자 도구의 Network 탭에서:
- `localhost:8080`으로 요청이 가는지 확인
- 요청이 실패하는지 확인

### 캐시 클리어
브라우저 캐시를 지우고 하드 리프레시:
- Chrome/Edge: `Ctrl+Shift+Delete` → 캐시 삭제
- 또는 `Ctrl+Shift+R` (하드 리프레시)

## 🐛 여전히 문제가 있는 경우

1. **Firebase CLI 업데이트**
   ```bash
   npm install -g firebase-tools@latest
   ```

2. **의존성 재설치**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **에뮬레이터 데이터 초기화**
   - 에뮬레이터 중지
   - `firebase-debug.log` 파일 삭제 (있는 경우)
   - 에뮬레이터 재시작

4. **포트 변경**
   `firebase.json`에서 포트를 변경할 수 있습니다:
   ```json
   "emulators": {
     "firestore": {
       "port": 8081
     }
   }
   ```
   그런 다음 `firebase.js`에서도 포트를 변경해야 합니다.

