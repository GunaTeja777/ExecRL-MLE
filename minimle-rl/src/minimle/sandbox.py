"""Run generated code in a Docker container (no network, CPU/RAM limits, timeout), then score on the host."""
import os, shutil, subprocess, sys, tempfile, uuid
from dataclasses import dataclass
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.metrics import roc_auc_score
from .config import DATA, DOCKER_IMAGE, TIMEOUT, USE_DOCKER


@dataclass
class Result:
    ok: bool
    score: float | None
    info: str  # error text or short success note


def run_code(code: str, task: str, split: str = "val") -> Result:
    tdir = DATA / task
    with tempfile.TemporaryDirectory() as w:
        w = Path(w)
        shutil.copy(tdir / "train.csv", w / "train.csv")
        shutil.copy(tdir / f"{split}_X.csv", w / "eval_X.csv")
        (w / "solution.py").write_text(code)
        name = f"mle-{uuid.uuid4().hex[:8]}"
        if USE_DOCKER:
            cmd = ["docker", "run", "--rm", "--name", name, "--network", "none",
                   "--memory", "3g", "--cpus", "2", "-v", f"{w}:/work", "-w", "/work"]
            if hasattr(os, "getuid"):
                cmd += ["--user", f"{os.getuid()}:{os.getgid()}"]
            cmd += [DOCKER_IMAGE, "python", "solution.py"]
        else:
            cmd = [sys.executable, "solution.py"]
        try:
            p = subprocess.run(cmd, cwd=w, capture_output=True, text=True, timeout=TIMEOUT)
        except subprocess.TimeoutExpired:
            if USE_DOCKER:
                subprocess.run(["docker", "kill", name], capture_output=True)
            return Result(False, None, f"Timeout after {TIMEOUT}s")
        if p.returncode != 0:
            return Result(False, None, (p.stderr or "nonzero exit")[-800:])
        sub = w / "submission.csv"
        if not sub.exists():
            return Result(False, None, "submission.csv was not written")
        try:
            pred = pd.read_csv(sub)["pred"].to_numpy(dtype=float)
            y = pd.read_csv(tdir / f"{split}_y.csv")["target"].to_numpy()
            if len(pred) != len(y) or not np.isfinite(pred).all():
                return Result(False, None, f"bad submission: {len(pred)} rows (expected {len(y)}) or NaN/inf")
            return Result(True, float(roc_auc_score(y, pred)), "ok")
        except Exception as e:
            return Result(False, None, f"scoring failed: {e!r}"[:300])
