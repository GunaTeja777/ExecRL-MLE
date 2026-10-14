"""Step 4: evaluate on HELD-OUT tasks. Reports draft success, any-success, mean hidden-test AUC."""
import argparse, json, torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from .config import BASE_MODEL, OUT
from .loop import run_episode
from .prompts import to_messages
from .sandbox import run_code
from .tasks import list_tasks

if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default=BASE_MODEL)
    ap.add_argument("--adapter", default=None)
    ap.add_argument("--label", default="base")
    ap.add_argument("--steps", type=int, default=4)
    a = ap.parse_args()

    tok = AutoTokenizer.from_pretrained(a.model)
    device = "cuda" if torch.cuda.is_available() else "cpu"
    dtype = torch.bfloat16 if torch.cuda.is_available() else torch.float32
    print(f"Loading {a.model} on {device} ({dtype})...", flush=True)
    model = AutoModelForCausalLM.from_pretrained(a.model, torch_dtype=dtype).to(device)
    if a.adapter:
        from peft import PeftModel
        print(f"Loading adapter {a.adapter}...", flush=True)
        model = PeftModel.from_pretrained(model, a.adapter)
    model.eval()

    def generate(prompt):
        ids = tok.apply_chat_template(to_messages(prompt), add_generation_prompt=True, return_tensors="pt").to(device)
        with torch.no_grad():
            out = model.generate(ids, max_new_tokens=600, do_sample=False)
        return tok.decode(out[0][ids.shape[1]:], skip_special_tokens=True)

    rows = []
    for task in list_tasks("heldout"):
        print(f"Evaluating task: {task}...", flush=True)
        recs, final = run_episode(generate, task, steps=a.steps, split="val")
        test_auc = run_code(final, task, "test").score if final else None
        rows.append(dict(task=task, draft_ok=recs[0]["ok"], any_ok=final is not None, test_auc=test_auc or 0.5))
        print(rows[-1], flush=True)
    n = len(rows)
    summary = dict(label=a.label, draft_success=sum(r["draft_ok"] for r in rows) / n,
                   any_success=sum(r["any_ok"] for r in rows) / n,
                   mean_test_auc=sum(r["test_auc"] for r in rows) / n, per_task=rows)
    (OUT / f"eval_{a.label}.json").write_text(json.dumps(summary, indent=2))
    print({k: v for k, v in summary.items() if k != "per_task"}, flush=True)

