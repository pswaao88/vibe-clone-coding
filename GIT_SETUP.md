# GitHub 저장소 설정 가이드

## ✅ 완료된 작업

1. **Git 저장소 초기화**
2. **GitHub 원격 저장소 연결**: https://github.com/pswaao88/vibe-clone-coding
3. **보안 설정**:
   - `.gitignore` 강화 (환경 변수, 키 파일 등 제외)
   - 실제 프로젝트 ID를 플레이스홀더로 변경
   - 코드에서 하드코딩된 키 제거

## 🔒 보안 조치

### 제외된 파일/폴더

다음 항목들은 Git에 추가되지 않습니다:

- `.env` 파일 및 모든 환경 변수 파일
- `node_modules/` 폴더
- Firebase 서비스 계정 키 파일 (`*.json`, `*.pem`, `*.key`)
- 빌드 결과물 (`build/`, `dist/`)
- 로그 파일 (`*.log`)
- IDE 설정 파일 (`.vscode/`, `.idea/`)

### 변경된 파일

실제 프로젝트 ID가 하드코딩된 파일들을 플레이스홀더로 변경:

- `src/shared/utils/firebase.js` - 환경 변수 사용
- `src/shared/utils/constants.js` - 환경 변수 사용
- `scripts/seedEmulator.js` - .firebaserc에서 읽기
- `scripts/seedData.js` - .firebaserc에서 읽기
- `.firebaserc` - 플레이스홀더로 변경

## 🚀 GitHub에 푸시하기

### 1. 파일 추가 및 커밋

```bash
# 모든 파일 추가 (.gitignore에 제외된 파일은 자동으로 제외됨)
git add .

# 커밋
git commit -m "Initial commit: 중고거래 플랫폼 프로젝트"
```

### 2. GitHub에 푸시

```bash
# 메인 브랜치로 푸시
git branch -M main
git push -u origin main
```

## ⚠️ 주의사항

### 커밋 전 확인사항

1. **환경 변수 파일 확인**
   ```bash
   # .env 파일이 있는지 확인 (있으면 제거하거나 .gitignore 확인)
   ls -la | grep .env
   ```

2. **키 파일 확인**
   ```bash
   # 서비스 계정 키 파일이 있는지 확인
   find . -name "*-service-account.json" -o -name "*.pem" -o -name "*.key"
   ```

3. **Git 상태 확인**
   ```bash
   git status
   # .env, 키 파일 등이 표시되지 않아야 함
   ```

### 환경 변수 설정

GitHub에 푸시한 후, 각 환경에서 `.env` 파일을 생성해야 합니다:

1. **로컬 개발**: `.env` 파일 생성
2. **Netlify 배포**: 대시보드에서 환경 변수 설정
3. **다른 개발자**: `.env.example` 참고하여 `.env` 생성

## 📝 .env.example 파일

프로젝트 루트에 `.env.example` 파일이 있습니다 (Git에 포함됨).
이 파일을 복사하여 `.env` 파일을 만들고 실제 값으로 채우세요.

```bash
cp .env.example .env
# .env 파일을 열어서 실제 Firebase 설정 값 입력
```

## 🔍 커밋 전 최종 체크리스트

- [ ] `.env` 파일이 Git에 포함되지 않음
- [ ] 키 파일이 Git에 포함되지 않음
- [ ] `node_modules/` 폴더가 Git에 포함되지 않음
- [ ] 실제 API 키나 비밀 키가 코드에 하드코딩되지 않음
- [ ] 프로젝트 ID가 플레이스홀더로 변경됨
- [ ] `.gitignore` 파일이 올바르게 설정됨

## 🎯 다음 단계

1. **로컬에서 테스트**
   ```bash
   npm start
   ```

2. **GitHub에 푸시**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push -u origin main
   ```

3. **Netlify 연결**
   - Netlify 대시보드에서 GitHub 저장소 연결
   - 환경 변수 설정
   - 자동 배포 활성화

