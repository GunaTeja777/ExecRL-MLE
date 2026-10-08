"""One episode = Draft -> (Debug if failed else Improve) repeated. Works with any generate(prompt)->text function."""
from .prompts import build_prompt, extract_code
from .reward import compute_reward
from .sandbox import Result, run_code
from .tasks import load_meta


def run_episode(generate, task, steps=4, split="val"):
    meta = load_meta(task)
    best, code, res, records = 0.5, None, None, []
    for _ in range(steps):
        op = "draft" if code is None else ("debug" if not res.ok else "improve")
        prompt = build_prompt(op, meta, code, res)
        text = generate(prompt)
        new = extract_code(text)
        r = run_code(new, task, split) if new else Result(False, None, "No ```python block found")
        records.append(dict(task=task, op=op, prompt=prompt, completion=text,
                            ok=r.ok, score=r.score, best_before=best,
                            reward=compute_reward(r, best)))
        if r.ok and (res is None or not res.ok or r.score > res.score):
            code, res, best = new, r, max(best, r.score)
        elif res is None or not res.ok:
            code, res = (new or text), r
    final = code if (res is not None and res.ok) else None
    return records, final
