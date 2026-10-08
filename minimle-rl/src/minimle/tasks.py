"""Download small binary-classification tasks from OpenML and write them to data/tasks/<name>/.
Labels for val/test are stored on the host and never mounted into the sandbox."""
import json
import pandas as pd
from sklearn.datasets import fetch_openml
from sklearn.model_selection import train_test_split
from .config import DATA

DATASETS = [
    "credit-g", "diabetes", "blood-transfusion-service-center", "banknote-authentication",
    "phoneme", "kc1", "ilpd", "spambase", "climate-model-simulation-crashes", "wdbc",
    "qsar-biodeg", "pc1", "pc3", "ozone-level-8hr", "madelon",
]


def prepare(seed=0):
    DATA.mkdir(parents=True, exist_ok=True)
    kept = []
    for name in DATASETS:
        try:
            ds = fetch_openml(name=name, version="active", as_frame=True, parser="auto")
            X, y = ds.data.copy(), ds.target
            classes = sorted(y.unique().tolist(), key=str)
            if len(classes) != 2:
                continue
            y = (y == classes[1]).astype(int)
            if len(X) > 5000:
                X, _, y, _ = train_test_split(X, y, train_size=5000, stratify=y, random_state=seed)
            Xtr, Xtmp, ytr, ytmp = train_test_split(X, y, test_size=0.4, stratify=y, random_state=seed)
            Xva, Xte, yva, yte = train_test_split(Xtmp, ytmp, test_size=0.5, stratify=ytmp, random_state=seed)
            d = DATA / name
            d.mkdir(exist_ok=True)
            tr = Xtr.copy(); tr["target"] = ytr.values
            tr.to_csv(d / "train.csv", index=False)
            Xva.to_csv(d / "val_X.csv", index=False)
            Xte.to_csv(d / "test_X.csv", index=False)
            pd.DataFrame({"target": yva.values}).to_csv(d / "val_y.csv", index=False)
            pd.DataFrame({"target": yte.values}).to_csv(d / "test_y.csv", index=False)
            kept.append((name, list(X.columns), len(Xtr)))
            print("ok", name)
        except Exception as e:
            print("skip", name, repr(e)[:100])
    for i, (name, cols, n) in enumerate(sorted(kept)):
        meta = {
            "name": name,
            "description": f"Binary classification on the '{name}' dataset. Predict `target` (1 = positive class).",
            "columns": cols[:40],
            "n_train": n,
            "metric": "ROC AUC",
            "role": "heldout" if i % 3 == 2 else "train",
        }
        (DATA / name / "meta.json").write_text(json.dumps(meta))


def list_tasks(role):
    out = []
    for d in sorted(DATA.iterdir()):
        m = d / "meta.json"
        if m.exists() and json.loads(m.read_text())["role"] == role:
            out.append(d.name)
    return out


def load_meta(task):
    return json.loads((DATA / task / "meta.json").read_text())


if __name__ == "__main__":
    prepare()
    print("train:", list_tasks("train"))
    print("heldout:", list_tasks("heldout"))
