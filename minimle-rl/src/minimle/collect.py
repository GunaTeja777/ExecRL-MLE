"""Step 1: teacher (API model) runs episodes on TRAIN tasks; every step is logged for SFT and RL prompts."""
import argparse, json
from .config import OUT
from .llm import api_generate
from .loop import run_episode
from .tasks import list_tasks

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--repeats", type=int, default=3)
    ap.add_argument("--steps", type=int, default=4)
    a = ap.parse_args()
    with open(OUT / "trajectories.jsonl", "a") as f:
        for task in list_tasks("train"):
            for _ in range(a.repeats):
                recs, _ = run_episode(api_generate, task, steps=a.steps)
                for r in recs:
                    f.write(json.dumps(r) + "\n")
                print(task, [(r["op"], r["score"]) for r in recs])
