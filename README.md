# QuesMe — Virtual Queue (MVP)

태국 식당용 가상 대기열 웹앱. 정적 호스팅(GitHub Pages 등) + 추후 Supabase 실시간 백엔드.

## 화면 (매장별 `?store=<slug>`)
- `customer.html` — 손님 웹앱 (QR 진입, 줄서기 / 시간 예약, 7개 언어)
- `console.html` — 매장 직원 콘솔 (호출·명단·언어별 매장이름, 한/영/태)
- `board.html` — 전광판 (고객 언어 + 랜덤 고객번호로 안내)
- `qr.html` — 매장 QR 포스터 (인쇄용)
- `index.html` — 매장 허브 / 실시간 테스트 런처

예) `customer.html?store=gangnam`

## 구조
- `queue-store.js` — 데이터 레이어. 현재 localStorage + BroadcastChannel(탭/창 간 실시간). 추후 내부만 Supabase로 교체.
- `i18n.js` — 다국어(손님 7개 / 콘솔 3개) + 언어별 매장이름 해석(없으면 영어→태국어 대체).
- `app.css` — 공통 스타일.
- `manifest.webmanifest`, `sw.js`, `icon-*.png` — PWA(홈 화면 추가 + 푸시 토대).

## 배포
정적 파일 그대로 호스팅. GitHub Pages는 이 폴더를 저장소 루트로 두고 Pages를 켜면 됩니다.
