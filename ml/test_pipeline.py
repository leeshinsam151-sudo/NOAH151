"""End-to-end check of export_contributions.py + train.py with synthetic contributions.

The synthetic "Korean" records are Deep Armocromia rows wrapped in the app's contribution format
(with a shifted skin color to mimic a different population and some season-only / dyed / unsure
labels), so the pipeline is exercised without real data.

Usage: python3 ml/test_pipeline.py <features_30_per_region.csv>
"""
import csv, json, os, random, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from train import FEATURE_SETS  # noqa: E402

FEATURES = FEATURE_SETS["means+std"]


def synth(base_csv, path, n=600, seed=0):
    rnd = random.Random(seed)
    rows = [r for r in csv.DictReader(open(base_csv)) if r["L_mean_hair"]]
    rnd.shuffle(rows)
    with open(path, "w") as fh:
        for i, r in enumerate(rows[:n]):
            f = {k: (float(r[k]) if r[k] else None) for k in FEATURES}
            f["b_mean_skin"] += 2.0  # population shift
            season, tone = r["season_subtype"].split("_")[0], r["season_subtype"]
            rec = {
                "schema": 1, "id": f"{i:032x}", "createdAt": "2026-11-26T00:00:00Z",
                "source": "consultant" if i % 3 == 0 else "user",
                "label": {"season": season, "tone": None if i % 10 == 0 else tone, "rawName": None,
                          "confidence": "unsure" if i % 7 == 0 else "sure",
                          "consultantCode": f"shop-{i % 5}" if i % 3 == 0 else None, "diagnosedAt": None},
                "conditions": {"hairDyed": i % 4 == 0, "makeup": "base", "lighting": "daylight"},
                "features": f,
                "measurement": {"wbApplied": True, "wbGains": [1, 1, 1], "wbCast": 3.0,
                                "qualityScore": 0.3 if i % 25 == 0 else 0.9, "issues": [],
                                "pixels": {"skin": 9000, "hair": 3000, "eye": 100}},
                "ai": {"modelSource": "x", "tones": [{"id": tone, "p": 0.3}]},
                "consent": {"version": "2026-11-v1", "agreedAt": "2026-11-26T00:00:00Z"},
            }
            fh.write(json.dumps(rec) + "\n")
        fh.write(json.dumps({"schema": 1, "id": "bad"}) + "\n")  # must be skipped


def run(*args):
    p = subprocess.run([sys.executable, *args], capture_output=True, text=True, cwd=HERE)
    print(p.stdout + p.stderr)
    assert p.returncode == 0, f"failed: {args}"
    return p.stdout + p.stderr


def main(base_csv):
    with tempfile.TemporaryDirectory() as d:
        jl, out_csv, model = (os.path.join(d, x) for x in ("c.jsonl", "ko.csv", "model.json"))
        synth(base_csv, jl)
        log = run("export_contributions.py", out_csv, jl)
        assert "wrote 600 rows" in log and "'shape': 1" in log, log
        rows = list(csv.DictReader(open(out_csv)))
        groups = {}
        for r in rows:
            groups.setdefault(r["group"], set()).add(r["partition"])
        assert all(len(v) == 1 for v in groups.values()), "a group straddles train/test"
        run("train.py", base_csv, "--extra", out_csv, "--export", model)
        m = json.load(open(model))
        assert "korean_test" in m["evaluations"] and "korean_test_base_only_model" in m["evaluations"]
        assert m["researchOnlyData"] is True and "+ko" in m["version"]
        run("train.py", "--no-base", "--extra", out_csv, "--export", model)
        m = json.load(open(model))
        assert m["researchOnlyData"] is False and m["testMetrics"]["n"] > 0
    print("pipeline OK")


if __name__ == "__main__":
    main(sys.argv[1])
