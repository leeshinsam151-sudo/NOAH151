"""Train the 12-tone personal color classifier on Deep Armocromia LAB features.

Data: features_30_per_region.csv from github.com/nypoclary/armocromia-classical-ml (MIT),
derived from the Deep Armocromia dataset (Stacchio et al., ECCV 2024 Workshops).

Usage: python3 ml/train.py <features_30_per_region.csv> [--export web/src/lib/analysis/model.json]
"""
import csv, json, sys, argparse
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.preprocessing import StandardScaler

REGIONS = ["skin", "hair", "eye"]
STATS = ["L", "a", "b", "ITA", "Chroma"]
FEATURE_SETS = {
    "means": [f"{s}_mean_{r}" for r in REGIONS for s in STATS],
    "means+std": [f"{s}_{m}_{r}" for r in REGIONS for s in STATS for m in ("mean", "std")],
}
TONES = ["Spring_Light", "Spring_Warm", "Spring_Bright",
         "Summer_Light", "Summer_Cool", "Summer_Soft",
         "Autumn_Soft", "Autumn_Warm", "Autumn_Deep",
         "Winter_Deep", "Winter_Cool", "Winter_Bright"]


def load(path, cols):
    rows = list(csv.DictReader(open(path)))
    X = np.array([[float(r[c]) if r[c] not in ("", "nan") else np.nan for c in cols] for r in rows])
    y = np.array([TONES.index(r["season_subtype"]) for r in rows])
    part = np.array([r["partition"] for r in rows])
    return X, y, part


def evaluate(proba, y):
    order = np.argsort(-proba, axis=1)
    season = lambda t: t // 3
    sp = proba.reshape(len(proba), 4, 3).sum(axis=2)
    sorder = np.argsort(-sp, axis=1)
    return {
        "tone_top1": float(np.mean(order[:, 0] == y)),
        "tone_top2": float(np.mean((order[:, :2] == y[:, None]).any(1))),
        "tone_top3": float(np.mean((order[:, :3] == y[:, None]).any(1))),
        "season_top1": float(np.mean(sorder[:, 0] == season(y))),
        "season_top2": float(np.mean((sorder[:, :2] == season(y)[:, None]).any(1))),
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("csv")
    ap.add_argument("--export")
    ap.add_argument("--features", default="means+std", choices=FEATURE_SETS)
    ap.add_argument("--model", default="mlp", choices=["logreg", "mlp"])
    args = ap.parse_args()

    results = {}
    for fs, cols in FEATURE_SETS.items():
        X, y, part = load(args.csv, cols)
        tr, te = part == "train", part == "test"
        fill = np.nanmean(X[tr], axis=0)
        X = np.where(np.isnan(X), fill, X)
        sc = StandardScaler().fit(X[tr])
        Xs = sc.transform(X)
        models = {
            "logreg": LogisticRegression(C=0.5, max_iter=3000),
            "mlp": MLPClassifier(hidden_layer_sizes=(32,), alpha=1e-2, max_iter=2000,
                                 early_stopping=True, random_state=0),
        }
        for name, m in models.items():
            m.fit(Xs[tr], y[tr])
            res = evaluate(m.predict_proba(Xs[te]), y[te])
            results[(fs, name)] = (res, m, sc, fill, cols)
            print(f"{fs:10s} {name:7s} " + " ".join(f"{k}={v:.3f}" for k, v in res.items()))

    if args.export:
        res, m, sc, fill, cols = results[(args.features, args.model)]
        if args.model == "logreg":
            layers = [{"W": m.coef_.T.tolist(), "b": m.intercept_.tolist(), "act": "softmax"}]
        else:
            layers = [{"W": W.tolist(), "b": b.tolist(), "act": a}
                      for W, b, a in zip(m.coefs_, m.intercepts_, ["relu", "softmax"])]
        out = {
            "source": "Deep Armocromia LAB features (Stacchio et al. 2024; features by nypoclary/armocromia-classical-ml, MIT)",
            "featureNames": cols, "fill": fill.tolist(),
            "mean": sc.mean_.tolist(), "scale": sc.scale_.tolist(),
            "tones": TONES, "layers": layers, "testMetrics": res,
        }
        json.dump(out, open(args.export, "w"))
        print("exported", args.export, res)


if __name__ == "__main__":
    main()
