# Chrome DevTools MCP 설치 가이드

## 설치 완료 ✅

`chrome-devtools-mcp` 패키지가 프로젝트에 설치되었습니다.

## Cursor에 MCP 서버 추가하기

### ⚡ 빠른 설정 (권장)

1. **Cursor 설정 열기**
   - `Ctrl + ,` (설정 열기)
   - 또는 `Ctrl + Shift + P` → "Preferences: Open Settings (UI)"

2. **MCP 설정 찾기**
   - 검색창에 "MCP" 입력
   - "MCP Servers" 또는 "Model Context Protocol" 설정 찾기

3. **설정 추가**
   
   다음 JSON을 MCP 설정에 추가:

   ```json
   {
     "mcpServers": {
       "chrome-devtools": {
         "command": "npx",
         "args": [
           "chrome-devtools-mcp@latest",
           "--channel=stable",
           "--headless=false"
         ]
       }
     }
   }
   ```

### 방법 1: Cursor 설정 파일에 직접 추가

1. **Cursor 설정 파일 열기**
   - `Ctrl + Shift + P`
   - "Preferences: Open User Settings (JSON)" 입력
   - 또는 직접 파일 열기: `%APPDATA%\Cursor\User\settings.json`

2. **MCP 설정 추가**
   
   설정 파일에 다음 내용을 추가:

   ```json
   {
     "mcpServers": {
       "chrome-devtools": {
         "command": "npx",
         "args": [
           "chrome-devtools-mcp@latest",
           "--channel=stable",
           "--headless=false"
         ]
       }
     }
   }
   ```

### 방법 2: 프로젝트별 설정

프로젝트 루트에 `.cursor/mcp.json` 파일을 수동으로 생성하고 다음 내용을 추가:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "chrome-devtools-mcp@latest",
        "--channel=stable",
        "--headless=false"
      ]
    }
  }
}
```

## 설정 옵션

### 기본 옵션

- `--channel=stable`: Chrome 안정 버전 사용 (기본값)
  - 옵션: `stable`, `beta`, `canary`
- `--headless=false`: 헤드리스 모드 비활성화 (브라우저 창 표시)

### 고급 옵션

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "chrome-devtools-mcp@latest",
        "--channel=stable",
        "--headless=false",
        "--isolated=true",
        "--categoryPerformance=true",
        "--categoryNetwork=true"
      ]
    }
  }
}
```

**옵션 설명:**
- `--isolated=true`: 임시 사용자 데이터 디렉토리 사용 (브라우저 종료 시 자동 삭제)
- `--categoryPerformance=true`: 성능 도구 포함
- `--categoryNetwork=true`: 네트워크 도구 포함

### 실행 중인 Chrome에 연결하기

기존 Chrome 인스턴스에 연결하려면:

```json
{
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": [
        "chrome-devtools-mcp@latest",
        "--autoConnect",
        "--channel=beta"
      ]
    }
  }
}
```

**주의**: Chrome M144 이상이 필요하며, `chrome://inspect/#remote-debugging`에서 원격 디버깅을 활성화해야 합니다.

## 사용 방법

설정 후 Cursor를 재시작하면 Chrome DevTools MCP가 활성화됩니다.

### 예시 명령어

```
https://developers.chrome.com의 성능을 확인해줘
```

```
https://example.com 페이지의 네트워크 요청을 분석해줘
```

## 문제 해결

### Chrome이 시작되지 않는 경우

1. Chrome이 설치되어 있는지 확인
2. `--headless=true` 옵션으로 시도
3. `--isolated=true` 옵션으로 시도

### 권한 오류

일부 MCP 클라이언트는 샌드박스를 사용합니다. 이 경우:
- 샌드박스 비활성화 또는
- `--browser-url` 옵션으로 수동으로 시작한 Chrome에 연결

### 수동 Chrome 연결

1. Chrome을 원격 디버깅 포트로 시작:
   ```bash
   # Windows
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="%TEMP%\chrome-profile-stable"
   ```

2. MCP 설정에 추가:
   ```json
   {
     "mcpServers": {
       "chrome-devtools": {
         "command": "npx",
         "args": [
           "chrome-devtools-mcp@latest",
           "--browser-url=http://127.0.0.1:9222"
         ]
       }
     }
   }
   ```

## 참고 자료

- [Chrome DevTools MCP GitHub](https://github.com/ChromeDevTools/chrome-devtools-mcp)
- [npm 패키지](https://www.npmjs.com/package/chrome-devtools-mcp)
- [Chrome DevTools 문서](https://developer.chrome.com/docs/devtools/)

