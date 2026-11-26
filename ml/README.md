# 모델 학습

```bash
pip install scikit-learn numpy
git clone --depth 1 https://github.com/nypoclary/armocromia-classical-ml
B=armocromia-classical-ml/data/features_30_per_region.csv

python3 ml/train.py $B --export web/src/lib/analysis/model.json                       # 기본 데이터만
python3 ml/export_contributions.py korean.csv contributions.jsonl                     # 수집 데이터 → CSV
python3 ml/train.py $B --extra korean.csv --export web/src/lib/analysis/model.json    # 혼합 + 비교
python3 ml/train.py --no-base --extra korean.csv --export web/src/lib/analysis/model.json  # 한국인 데이터만
python3 ml/test_pipeline.py $B                                                        # 파이프라인 점검
```

데이터 출처·이용 조건·수집 목표는 `docs/DATA_COLLECTION.md` 참고.
