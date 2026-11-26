# 톤픽 — AI 퍼스널 컬러 진단 (웹 MVP)

셀카 한 장으로 12톤 퍼스널 컬러를 진단하는 웹앱입니다. 사진은 서버로 보내지 않고 브라우저 안에서 분석합니다.

## 실행

```bash
npm install
npm run dev      # http://localhost:3000 (MediaPipe 모델을 public/mediapipe 로 자동 다운로드)
npm test         # 색 변환·분류기·특징 추출 단위 테스트
npm run build
```

## 분석 파이프라인 (`src/lib/analysis`)

| 파일 | 역할 |
|---|---|
| `vision.ts` | MediaPipe Face Landmarker(478점) + Selfie Multiclass 세그멘테이션 로드 (GPU→CPU 폴백) |
| `analyze.ts` | 사진 → 얼굴 선택·크롭 → 화이트밸런스 → 특징 추출 → 품질 검사 → 분류 |
| `features.ts` | 피부·머리카락·눈 영역 마스크, 눈 흰자 기반 화이트밸런스, CIELAB 통계 30개 |
| `quality.ts` | 얼굴 수·크기·각도·노출·역광·색 치우침 검사 → 재촬영 안내 / 신뢰도 감점 |
| `classifier.ts` | 표준화 + 로지스틱 회귀(12톤 softmax), 계절 확률 = 하위 톤 합 |
| `color.ts` | sRGB → CIELAB(D65, skimage 호환), ITA, Chroma |
| `model.json` | 학습된 가중치 (`ml/train.py`로 생성) |

## 모델

- 데이터: [Deep Armocromia](https://github.com/lorenzo-stacchio/Deep-Armocromia) (Stacchio et al., ECCV 2024 Workshops) — 전문가 라벨 얼굴 4,920장, 4계절 × 3 하위 톤.
- 특징: [armocromia-classical-ml](https://github.com/nypoclary/armocromia-classical-ml)(MIT)이 공개한 영역별 LAB 특징 CSV.
- 공식 테스트셋(912장) 성능: 계절 Top-1 56.3% / Top-2 83.3%, 12톤 Top-1 32.8% / Top-3 64.6%.
- 재학습: `pip install scikit-learn numpy && python3 ml/train.py <features_30_per_region.csv> --model logreg --export web/src/lib/analysis/model.json`

## 한국인 데이터 수집

- 진단 결과 화면의 "전문가에게 진단받은 적 있나요?" 카드, 컨설턴트 모드(`#consultant`)에서 동의를 받고 색 수치 30개 + 전문가 진단을 수집합니다. **사진은 보내지 않습니다.**
- 서버: `POST/DELETE /api/contributions`, `GET /api/contributions/export` (관리자 토큰).
  환경 변수 `DATABASE_URL`(Postgres, 없으면 `.data/*.jsonl`), `CONTRIBUTIONS_ADMIN_TOKEN`(16자 이상).
- 수집·재학습 절차와 컨설턴트 프로토콜: [`docs/DATA_COLLECTION.md`](../docs/DATA_COLLECTION.md)

## 미리보기 빌드

`node artifact/build.mjs` → `artifact/dist` (정적 호스팅용, 파일당 15MB 제한 대응. 기여 데이터는 claude.ai 아티팩트 DB에 저장, 소유자는 `#admin`에서 내보내기).

⚠️ Deep Armocromia는 "연구 목적 한정"으로 공개되었고 이미지 일부는 CelebA(비상업)입니다. 상용 출시 전에는 자체 라벨 데이터로 재학습하거나 저작자에게 상업적 이용 허락을 받아야 합니다.
