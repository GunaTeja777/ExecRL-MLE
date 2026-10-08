"""Step 2: SFT warm start (QLoRA) on successful teacher steps, then merge into outputs/sft_merged."""
import json, torch
from datasets import Dataset
from peft import LoraConfig, PeftModel
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from trl import SFTConfig, SFTTrainer
from .config import BASE_MODEL, OUT
from .prompts import to_messages

rows = [json.loads(l) for l in open(OUT / "trajectories.jsonl")]
good = [r for r in rows if r["ok"] and r["reward"] >= 0.2]
data = Dataset.from_list([{"messages": to_messages(r["prompt"]) + [{"role": "assistant", "content": r["completion"]}]} for r in good])
print(f"SFT on {len(data)} of {len(rows)} steps")

bnb = BitsAndBytesConfig(load_in_4bit=True, bnb_4bit_quant_type="nf4", bnb_4bit_compute_dtype=torch.bfloat16)
tok = AutoTokenizer.from_pretrained(BASE_MODEL)
model = AutoModelForCausalLM.from_pretrained(BASE_MODEL, quantization_config=bnb, torch_dtype=torch.bfloat16)
cfg = SFTConfig(output_dir=str(OUT / "sft"), per_device_train_batch_size=1, gradient_accumulation_steps=8,
                num_train_epochs=2, learning_rate=2e-4, bf16=True, gradient_checkpointing=True,
                max_length=1536, logging_steps=5, save_strategy="no", report_to="none")
lora = LoraConfig(r=16, lora_alpha=32, lora_dropout=0.05, target_modules="all-linear", task_type="CAUSAL_LM")
trainer = SFTTrainer(model=model, args=cfg, train_dataset=data, processing_class=tok, peft_config=lora)
trainer.train()
trainer.model.save_pretrained(OUT / "sft_adapter")

del trainer, model
torch.cuda.empty_cache()
base = AutoModelForCausalLM.from_pretrained(BASE_MODEL, torch_dtype=torch.bfloat16)
merged = PeftModel.from_pretrained(base, OUT / "sft_adapter").merge_and_unload()
merged.save_pretrained(OUT / "sft_merged"); tok.save_pretrained(OUT / "sft_merged")
