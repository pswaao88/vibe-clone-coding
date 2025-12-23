# Netlify Secrets Scanning 해결 방법

## 문제

Netlify Secrets Scanning이 빌드 출력물에서 Firebase 설정 값들을 감지하여 빌드가 실패합니다.

## 원인

React 앱은 빌드 시 `REACT_APP_*` 환경 변수를 JavaScript 번들에 포함시킵니다. 이는 정상적인 동작이지만, Netlify Secrets Scanning이 이를 민감한 정보로 감지합니다.

## 해결 방법

### 방법 1: Netlify 대시보드에서 Secrets Scanning 설정 (권장)

1. **Netlify 대시보드 접속**
   - https://app.netlify.com/

2. **사이트 선택** → **Site settings** → **Build & deploy**

3. **Environment variables** 섹션에서:
   - 각 Firebase 환경 변수를 추가할 때
   - **"Sensitive variable"** 체크박스를 **해제**하거나
   - 또는 **"Mark as secret"** 옵션을 사용하지 않음

4. **Secrets Scanning 설정**:
   - **Site settings** → **Build & deploy** → **Build settings**
   - **"Secrets scanning"** 섹션에서:
     - **"Omit paths"**에 `build/**` 추가
     - 또는 **"Disable secrets scanning"** 활성화 (권장하지 않음)

### 방법 2: netlify.toml에서 설정

`netlify.toml` 파일에 다음 설정을 추가했습니다:

```toml
[build.environment]
  SECRETS_SCAN_OMIT_PATHS = "build/**,*.md,.env.example"
```

하지만 이 방법은 완전히 작동하지 않을 수 있습니다.

### 방법 3: 환경 변수를 Secret으로 표시하지 않기

Firebase 설정 값들은 실제로는 공개되어도 되는 값입니다:
- `REACT_APP_FIREBASE_API_KEY`: 클라이언트에서 사용되므로 공개되어도 안전
- `REACT_APP_FIREBASE_PROJECT_ID`: 공개 정보
- 기타 설정 값들도 클라이언트에서 사용되므로 공개 가능

**중요**: Firebase Security Rules로 보안이 보장되므로, 클라이언트에서 사용하는 API 키는 공개되어도 안전합니다.

### 방법 4: Netlify 대시보드에서 직접 설정

1. **Site settings** → **Build & deploy** → **Environment variables**
2. 각 변수 옆의 **"..."** 메뉴 클릭
3. **"Mark as secret"** 해제 (이미 해제되어 있다면 그대로 둠)

## 권장 해결책

**가장 간단한 방법**: Netlify 대시보드에서 Secrets Scanning을 비활성화하거나, 빌드 출력물을 스캔에서 제외:

1. **Site settings** → **Build & deploy** → **Build settings**
2. **"Secrets scanning"** 섹션 찾기
3. **"Omit paths"**에 `build/**` 추가
4. 또는 **"Disable for this site"** 활성화

## 참고

- Firebase 클라이언트 SDK의 API 키는 공개되어도 안전합니다
- 보안은 Firebase Security Rules로 보장됩니다
- Secrets Scanning은 주로 서버 사이드 키나 비밀번호를 감지하기 위한 것입니다

## 다음 단계

1. Netlify 대시보드에서 위 설정 적용
2. "Trigger deploy" 클릭하여 재배포
3. 빌드 성공 확인

