"""Step 3: GRPO. Each sampled program is executed in the sandbox; reward comes from the execution result."""
import argparse, json, torch
from concurrent.futures import ThreadPoolExecutor
from datasets import Dataset
from peft import LoraConfig
from transformers import BitsAndBytesConfig
from trl import GRPOConfig, GRPOTrainer
from .config import OUT
from .prompts import extract_code, to_messages
from .reward import compute_reward
from .sandbox import Result, run_code


def reward_fn(completions, task, best_before, **kwargs):
    def one(c, t, b):
        text = c[0]["content"] if isinstance(c, list) else c
        code = extract_code(text)
        res = run_code(code, t, "val") if code else Result(False, None, "no code block")
        return compute_reward(res, b)
    with ThreadPoolExecutor(4) as ex:
        return list(ex.map(one, completions, task, best_before))


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default=str(OUT / "sft_merged"))
    ap.add_argument("--max_prompts", type=int, default=300)
    a = ap.parse_args()

    seen, rows = set(), []
    for l in open(OUT / "trajectories.jsonl"):
        r = json.loads(l)
        if r["prompt"] in seen:
            continue
        seen.add(r["prompt"])
        rows.append({"prompt": to_messages(r["prompt"]), "task": r["task"], "best_before": float(r["best_before"])})
    data = Dataset.from_list(rows[: a.max_prompts])

    use_cuda = torch.cuda.is_available()
    try:
        import bitsandbytes
        has_bnb = True
    except ImportError:
        has_bnb = False

    if use_cuda and has_bnb:
        print("Using 4-bit QLoRA on CUDA for GRPO...", flush=True)
        bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4", bnb_4bit_compute_dtype=torch.bfloat16)
        model_init_kwargs = {"quantization_config": bnb, "torch_dtype": torch.bfloat16}
        bf16 = True
        batch_size = 4
        num_gen = 4
        grad_accum = 4
    else:
        device_label = "CUDA (FP16)" if use_cuda else "CPU (FP32)"
        print(f"Running GRPO on {device_label}...", flush=True)
        model_init_kwargs = {"torch_dtype": torch.float32}
        bf16 = False
        batch_size = 1
        num_gen = 2
        grad_accum = 2

    cfg = GRPOConfig(output_dir=str(OUT / "grpo"), per_device_train_batch_size=batch_size, num_generations=num_gen,
                     gradient_accumulation_steps=grad_accum, learning_rate=1e-5,
                     max_completion_length=384, bf16=bf16, gradient_checkpointing=True, logging_steps=1,
                     save_steps=50, report_to="none", model_init_kwargs=model_init_kwargs)
    lora = LoraConfig(r=16, lora_alpha=32, target_modules="all-linear", task_type="CAUSAL_LM")
    trainer = GRPOTrainer(model=a.model, reward_funcs=reward_fn, args=cfg, train_dataset=data, peft_config=lora)
    trainer.train()
    trainer.save_model(str(OUT / "grpo_adapter"))
