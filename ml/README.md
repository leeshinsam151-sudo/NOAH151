# 모델 학습

```bash
git clone --depth 1 https://github.com/nypoclary/armocromia-classical-ml
pip install scikit-learn numpy
python3 ml/train.py armocromia-classical-ml/data/features_30_per_region.csv --model logreg --export web/src/lib/analysis/model.json
```

학습 데이터 출처·이용 조건은 `docs/DESIGN.md` 13장 참고.
