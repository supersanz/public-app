# 나를 기록하다

Google 계정으로 하루의 활동을 기록하고 성장·여행 보상을 얻는 앱입니다.

## 실행

`node server.cjs`로 로컬 서버를 실행합니다.

## 배포

기존 GitHub `supersanz/public-app`의 main 브랜치를 Vercel `app-jfqt`에 연결합니다. `node build-production.cjs`가 `production-files.json`에 명시된 실행 파일만 `public/`에 복사합니다. 시연 기능은 포함하며 시연 변경은 실제 기록과 서버 저장에 반영하지 않습니다.

Firebase 프로젝트와 저장 키를 변경하거나 초기화하지 마세요. 기존 서버 기록을 우선 불러오며, 이전 Vercel 기기 기록은 사용자가 선택하여 가져올 수 있습니다. 새 실행 파일이나 자산을 추가하면 production-files.json도 갱신해야 합니다.
