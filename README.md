# 작은 마법사의 하루 — 정리된 앱 파일

## 실행
Node.js가 설치된 환경에서 이 폴더를 기준으로 `node server.cjs`를 실행한 뒤 http://127.0.0.1:4300/ 을 엽니다. index.html과 server.cjs는 표준 진입점 이름을 유지했습니다.
기존 기록은 같은 브라우저의 같은 주소(127.0.0.1:4300)에 저장됩니다. 폴더·파일명 변경으로 저장 키를 바꾸지 않았습니다.

## 폴더
- scripts/: 역할별 실행 코드
- styles/: 화면별 스타일
- assets/characters/male, female/: 성별 캐릭터, 걷기·달리기·날기 시트, 낮·밤 장면
- assets/backgrounds/: 낮 배경과 이동용 파노라마
- assets/ui/: 화면 장식 원본 시트
- assets/icons/navigation/: icon-home.svg, icon-history.svg, icon-rewards.svg, icon-alarm.svg
- assets/icons/activities/: 활동·공통 아이콘 SVG
- delivery/frame-strips/male, female/: 전달용 4프레임 walk-1234, walk-5678, run-1234, run-5678. 날기는 원본이 6프레임이므로 fly-123, fly-456.
- delivery/ui-illustrations/: 개별로 분리한 화면 장식 PNG
- delivery/screens/: 테스트 데이터로 찍은 실제 앱 화면 PNG
- tools/tests/: 현재 앱 회귀 검사
- NOT USE/: 이전 버전·초안·참고 이미지·기존 내보내기·비사용 코드 보관. 삭제하지 않았으며 배포 ZIP에서는 제외합니다.

## 이미지 사용 주의
앱은 8프레임(4열×2행) run-12345678.png, walk-12345678.png를 그대로 사용합니다. 전달용 1234/5678 이미지는 현재 적용 중인 시트를 위·아래 행으로 무손실 분리한 것입니다. 캐릭터 디자인과 프레임 순서는 바꾸지 않았습니다.
SVG 아이콘은 실행 코드의 인라인 SVG와 같은 경로를 파일로 추출한 것입니다. CSS로 그리는 카드·그라데이션·모서리와 캔버스 효과는 별도 원본 PNG가 없으므로 코드 및 화면 캡처로 제공합니다.
FILE-MAP.json에서 이전 이름과 새 이름을 확인할 수 있습니다.

## 검증
`node tools/verify-app.cjs` 실행. CHECK-REPORT.md에 검사 범위와 확인 결과를 기록했습니다.
