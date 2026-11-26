"""Train the 12-tone personal color classifier.

Base data: Deep Armocromia LAB features (features_30_per_region.csv from
github.com/nypoclary/armocromia-classical-ml, MIT; derived from Stacchio et al., ECCV 2024 Workshops,
released for research use only).
Extra data: Korean selfies collected in the app (CSV from ml/export_contributions.py).

Examples
  # base only (current model)
  python3 ml/train.py features_30_per_region.csv --export web/src/lib/analysis/model.json
  # base + Korean contributions, compared against the base-only model on the Korean test split
  python3 ml/train.py features_30_per_region.csv --extra korean.csv --export web/src/lib/analysis/model.json
  # Korean data only (no research-only data: required before commercial launch)
  python3 ml/train.py --no-base --extra korean.csv --export web/src/lib/analysis/model.json
"""
import argparse, csv, datetime, json, sys
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
SEASONS = ["Spring", "Summer", "Autumn", "Winter"]


def num(v):
    return float(v) if v not in ("", "nan", None) else np.nan


class Data:
    """Feature matrix plus labels. tone = -1 where only the season is known."""

    def __init__(self, X, tone, season, weight, part):
        self.X, self.tone, self.season, self.weight, self.part = X, tone, season, weight, part

    def take(self, mask):
        return Data(self.X[mask], self.tone[mask], self.season[mask], self.weight[mask], self.part[mask])

    @staticmethod
    def concat(ds):
        ds = [d for d in ds if d is not None and len(d.X)]
        return Data(*(np.concatenate([getattr(d, k) for d in ds]) for k in ("X", "tone", "season", "weight", "part")))


def load_base(path, cols):
    rows = list(csv.DictReader(open(path)))
    X = np.array([[num(r[c]) for c in cols] for r in rows])
    tone = np.array([TONES.index(r["season_subtype"]) for r in rows])
    return Data(X, tone, tone // 3, np.ones(len(rows)), np.array([r["partition"] for r in rows]))


def load_extra(path, cols, weight, unsure_weight, dyed, min_quality):
    rows = [r for r in csv.DictReader(open(path)) if float(r["quality_score"] or 0) >= min_quality]
    if dyed == "drop":
        rows = [r for r in rows if r["hair_dyed"] != "yes"]
    X = np.array([[num(r[c]) for c in cols] for r in rows]).reshape(len(rows), len(cols))
    if dyed == "impute":  # dyed hair says nothing about natural coloring: treat as unmeasured
        hair = [i for i, c in enumerate(cols) if c.endswith("_hair")]
        for k, r in enumerate(rows):
            if r["hair_dyed"] == "yes":
                X[k, hair] = np.nan
    tone = np.array([TONES.index(r["season_subtype"]) if r["season_subtype"] else -1 for r in rows], dtype=int)
    season = np.array([SEASONS.index(r["season"]) for r in rows], dtype=int)
    w = np.array([weight * (unsure_weight if r["label_confidence"] == "unsure" else 1.0) for r in rows])
    return Data(X, tone, season, w, np.array([r["partition"] for r in rows]))


def metrics(proba, d):
    out = {"n": int(len(d.X))}
    if not len(d.X):
        return out
    sp = proba.reshape(len(proba), 4, 3).sum(axis=2)
    so = np.argsort(-sp, axis=1)
    out["season_top1"] = float(np.mean(so[:, 0] == d.season))
    out["season_top2"] = float(np.mean((so[:, :2] == d.season[:, None]).any(1)))
    has = d.tone >= 0
    out["n_tone"] = int(has.sum())
    if has.any():
        o = np.argsort(-proba[has], axis=1)
        y = d.tone[has]
        out["tone_top1"] = float(np.mean(o[:, 0] == y))
        out["tone_top2"] = float(np.mean((o[:, :2] == y[:, None]).any(1)))
        out["tone_top3"] = float(np.mean((o[:, :3] == y[:, None]).any(1)))
    return out


class Trained:
    def __init__(self, train, model, feature_cols):
        fit = train.take(train.tone >= 0)
        if len(np.unique(fit.tone)) < len(TONES):
            missing = [TONES[i] for i in range(len(TONES)) if i not in set(fit.tone)]
            sys.exit(f"training data lacks tones {missing}; collect more or keep the base data")
        self.cols = feature_cols
        self.fill = np.nanmean(fit.X, axis=0)
        self.scaler = StandardScaler().fit(self._filled(fit.X))
        Xs = self.scaler.transform(self._filled(fit.X))
        if model == "logreg":
            self.m = LogisticRegression(C=0.5, max_iter=4000).fit(Xs, fit.tone, sample_weight=fit.weight)
        else:
            self.m = MLPClassifier(hidden_layer_sizes=(32,), alpha=1e-2, max_iter=2000, early_stopping=True,
                                   random_state=0).fit(Xs, fit.tone)
        self.kind = model
        self.n = {"rows": int(len(fit.X))}

    def _filled(self, X):
        return np.where(np.isnan(X), self.fill, X)

    def proba(self, X):
        return self.m.predict_proba(self.scaler.transform(self._filled(X)))

    def layers(self):
        if self.kind == "logreg":
            return [{"W": self.m.coef_.T.tolist(), "b": self.m.intercept_.tolist(), "act": "softmax"}]
        return [{"W": W.tolist(), "b": b.tolist(), "act": a}
                for W, b, a in zip(self.m.coefs_, self.m.intercepts_, ["relu", "softmax"])]


def fmt(name, m):
    keys = ["season_top1", "season_top2", "tone_top1", "tone_top3"]
    return f"  {name:34s} n={m['n']:5d} " + " ".join(f"{k}={m[k]:.3f}" for k in keys if k in m)


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("base", nargs="?", help="Deep Armocromia features_30_per_region.csv")
    ap.add_argument("--no-base", action="store_true", help="train on --extra only")
    ap.add_argument("--extra", help="CSV from ml/export_contributions.py")
    ap.add_argument("--extra-weight", type=float, default=3.0)
    ap.add_argument("--unsure-weight", type=float, default=0.5)
    ap.add_argument("--dyed-hair", choices=["impute", "keep", "drop"], default="impute")
    ap.add_argument("--min-quality", type=float, default=0.4)
    ap.add_argument("--features", default="means+std", choices=FEATURE_SETS)
    ap.add_argument("--model", default="logreg", choices=["logreg", "mlp"])
    ap.add_argument("--export")
    a = ap.parse_args()
    if a.no_base and not a.extra:
        ap.error("--no-base needs --extra")
    if not a.no_base and not a.base:
        ap.error("give the base CSV or --no-base")

    cols = FEATURE_SETS[a.features]
    base = None if a.no_base else load_base(a.base, cols)
    extra = load_extra(a.extra, cols, a.extra_weight, a.unsure_weight, a.dyed_hair, a.min_quality) if a.extra else None

    def split(d, p):
        return d.take(d.part == p) if d is not None else None

    train = Data.concat([split(base, "train"), split(extra, "train")])
    model = Trained(train, a.model, cols)
    evals = {}
    print(f"model: {a.model}, trained on {model.n['rows']} rows "
          f"(base {0 if base is None else int((base.part == 'train').sum())}, "
          f"korean {0 if extra is None else int(((extra.part == 'train') & (extra.tone >= 0)).sum())})")
    for name, d in [("base_test", split(base, "test")), ("korean_test", split(extra, "test"))]:
        if d is not None:
            evals[name] = metrics(model.proba(d.X), d)
            print(fmt(f"{name}", evals[name]))
    if base is not None and extra is not None:
        ref = Trained(split(base, "train"), a.model, cols)
        kt = split(extra, "test")
        evals["korean_test_base_only_model"] = metrics(ref.proba(kt.X), kt)
        print(fmt("korean_test (base-only model)", evals["korean_test_base_only_model"]))
        if evals["korean_test"]["n"] < 100:
            print("  ! Korean test split is small; differences under ~10 points are noise.")

    if a.export:
        primary = evals.get("korean_test") if a.no_base else evals.get("base_test")
        n_ko = 0 if extra is None else int((extra.tone >= 0).sum())
        parts = ([] if a.no_base else ["Deep Armocromia 4,920장"]) + ([f"한국인 셀카 {n_ko}건"] if n_ko else [])
        out = {
            "version": f"{datetime.date.today():%Y%m%d}-{'ko' if a.no_base else 'base'}{'+ko' + str(n_ko) if n_ko and not a.no_base else ''}",
            "source": " + ".join(["Deep Armocromia (research use only)"] * (not a.no_base) + ["Korean contributions"] * bool(n_ko)),
            "dataDescription": " + ".join(parts),
            "researchOnlyData": not a.no_base,
            "featureNames": cols, "fill": model.fill.tolist(),
            "mean": model.scaler.mean_.tolist(), "scale": model.scaler.scale_.tolist(),
            "tones": TONES, "layers": model.layers(),
            "testMetrics": primary, "evaluations": evals,
        }
        json.dump(out, open(a.export, "w"))
        print("exported", a.export, out["version"])


if __name__ == "__main__":
    main()
