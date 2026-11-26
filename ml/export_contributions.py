"""Convert collected contributions (JSONL) into a training CSV with the same feature columns as
the Deep Armocromia feature file.

Inputs are JSONL files from either source:
  - the web app:      curl -H "Authorization: Bearer $CONTRIBUTIONS_ADMIN_TOKEN" https://<host>/api/contributions/export
  - the preview page: the owner's "JSONL로 내보내기" button (#admin)

Usage: python3 ml/export_contributions.py out.csv in1.jsonl [in2.jsonl ...] [--test-share 0.2]

Each record gets a deterministic train/test partition from a hash of its group (consultant code
when present, so one consultant's customers never straddle the split; otherwise the record id).
"""
import argparse, csv, hashlib, json, sys

from train import FEATURE_SETS, TONES

FEATURES = FEATURE_SETS["means+std"]
SEASONS = ["Spring", "Summer", "Autumn", "Winter"]
META = ["id", "source", "season", "season_subtype", "label_confidence", "hair_dyed", "makeup", "lighting",
        "quality_score", "wb_cast", "group", "partition", "ai_top1"]


def check(r):
    """Light re-validation (the server already validated): returns a reason or None."""
    try:
        if r.get("schema") != 1:
            return "schema"
        lab = r["label"]
        if lab["season"] not in SEASONS:
            return "season"
        if lab["tone"] is not None and (lab["tone"] not in TONES or not lab["tone"].startswith(lab["season"])):
            return "tone"
        f = r["features"]
        if any(k not in f for k in FEATURES) or f["L_mean_skin"] is None:
            return "features"
        if any(v is not None and not isinstance(v, (int, float)) for v in f.values()):
            return "feature type"
    except (KeyError, TypeError):
        return "shape"
    return None


def bucket(key, test_share):
    h = int(hashlib.sha256(key.encode()).hexdigest()[:8], 16) / 0xFFFFFFFF
    return "test" if h < test_share else "train"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("inputs", nargs="+")
    ap.add_argument("--test-share", type=float, default=0.2)
    a = ap.parse_args()

    seen, rows, skipped = set(), [], {}
    for path in a.inputs:
        for line in open(path, encoding="utf-8"):
            line = line.strip()
            if not line:
                continue
            r = json.loads(line)
            why = check(r)
            if why or r["id"] in seen:
                why = why or "duplicate"
                skipped[why] = skipped.get(why, 0) + 1
                continue
            seen.add(r["id"])
            lab, cond, m = r["label"], r["conditions"], r["measurement"]
            group = f"consultant:{lab['consultantCode']}" if lab.get("consultantCode") else f"id:{r['id']}"
            row = {k: ("" if r["features"][k] is None else r["features"][k]) for k in FEATURES}
            row.update({
                "id": r["id"], "source": r["source"], "season": lab["season"],
                "season_subtype": lab["tone"] or "", "label_confidence": lab["confidence"],
                "hair_dyed": {True: "yes", False: "no", None: "unknown"}[cond["hairDyed"]],
                "makeup": cond["makeup"] or "", "lighting": cond["lighting"],
                "quality_score": m["qualityScore"], "wb_cast": m["wbCast"], "group": group,
                "partition": bucket(group, a.test_share),
                "ai_top1": r["ai"]["tones"][0]["id"] if r["ai"]["tones"] else "",
            })
            rows.append(row)

    with open(a.out, "w", newline="", encoding="utf-8") as fh:
        w = csv.DictWriter(fh, fieldnames=FEATURES + META)
        w.writeheader()
        w.writerows(rows)
    n_test = sum(r["partition"] == "test" for r in rows)
    print(f"wrote {len(rows)} rows ({len(rows) - n_test} train / {n_test} test) to {a.out}; skipped {skipped or 0}",
          file=sys.stderr)


if __name__ == "__main__":
    main()
