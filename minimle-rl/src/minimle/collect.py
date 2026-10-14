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
    traj_file = OUT / "trajectories.jsonl"
    counts = {}
    if traj_file.exists():
        for line in open(traj_file, encoding="utf-8"):
            try:
                r = json.loads(line)
                counts[r["task"]] = counts.get(r["task"], 0) + 1
            except Exception:
                pass

    with open(traj_file, "a", encoding="utf-8") as f:
        for task in list_tasks("train"):
            done_episodes = counts.get(task, 0) // a.steps
            needed = a.repeats - done_episodes
            if needed <= 0:
                print(f"Skipping {task} (already has {done_episodes} completed episodes)", flush=True)
                continue
            for _ in range(needed):
                recs, _ = run_episode(api_generate, task, steps=a.steps)
                for r in recs:
                    f.write(json.dumps(r) + "\n")
                f.flush()
                print(task, [(r["op"], f"AUC: {r['score']}" if r['score'] is not None else "failed") for r in recs], flush=True)


