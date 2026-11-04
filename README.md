# 감투와 별방울

겁쟁이 고양이의 아주 커다란 모험 — 쯔꾸르(RPG Maker) 감성의 탑뷰 픽셀 RPG.
할머니의 기억을 빼앗긴 여름, 소녀 **재희**와 세상 모든 게 무서운 치즈 고양이 **감투**가 기억 조각을 찾아 나선다.

- 빌드 없이 HTML/CSS/JavaScript만 사용 → `index.html` 을 GitHub Pages에서 바로 실행
- 그림·음악·효과음 모두 코드로 생성 (외부 이미지·폰트·소리 파일 없음)
- 현재 수록: **타이틀 · 프롤로그 · 1장 ~ 5장** (약 3시간 15분). 전체 설계(7장, 약 5시간)는 [`docs/story.md`](docs/story.md)

## 실행
- GitHub Pages: 저장소 Settings → Pages → 브랜치 루트 지정 후 접속
- 로컬: 저장소 폴더에서 `python3 -m http.server` 실행 후 `http://localhost:8000` (파일을 직접 열어도 동작)

## 조작
| 동작 | 키보드 | 터치 |
| --- | --- | --- |
| 이동 | 방향키 / WASD | 방향 패드 |
| 확인·조사·대화 넘기기 | Z / Enter / Space | 확인 버튼, 대화창 터치 |
| 메뉴(저장·불러오기·설정)·취소 | X / Esc | 메뉴 버튼 |
| 감투 ↔ 재희 전환 | C / Shift | 감투 버튼 |

저장은 브라우저(localStorage)에 됩니다. 수동 저장 3칸 + 자동 저장.

## 폴더 구조
```
index.html          진입점
css/style.css       화면·대화창·메뉴·터치 버튼
js/                 엔진 (입력, 오디오 신디사이저, 픽셀 아트, 타일, 맵, 이벤트 해석기, 미니게임, UI)
data/game.js        캐릭터 모습·이름표·아이템·공용 스크립트
data/music.js       배경음악 (트래커 형식)
data/maps/          맵 레이아웃
data/chapters/      장별 대사·이벤트·컷신
docs/story.md       전체 줄거리·등장인물·장별 성장 포인트
docs/scripting.md   새 장/맵/이벤트 추가 방법
tools/playthrough.js  처음부터 1장 끝까지 자동 플레이 점검 (Playwright)
```
