# MiniMLE-RL

A lightweight, execution-grounded Reinforcement Learning system inspired by **Frontis-MA1** and **OpenMLE**: trains a compact Code LLM (`Qwen2.5-Coder-0.5B`) with execution-grounded SFT + GRPO to autonomously **Draft**, **Improve**, and **Debug** ML solutions using Docker sandbox execution signals.

> 📖 **Read the deep-dive Medium article:**  
> [**I Taught a 0.5B Model to Do Machine Learning Engineering on a 4GB Laptop GPU**](https://medium.com/@tejag078/i-taught-a-0-5b-model-to-do-machine-learning-engineering-on-a-4gb-laptop-gpu-075c6382fed5?sharedUserId=tejag078)

---

## 🛠️ Setup (Windows / WSL2 / Linux)

1. **Install dependencies and package in editable mode**:
   ```bash
   pip install -r requirements.txt && pip install -e .
   ```

2. **Build Docker Sandbox**:
   Make sure Docker Desktop (or the Docker daemon) is running, then build:
   ```bash
   docker build -t minimle-sandbox docker/
   ```
   *(Optional: If running without Docker, set `USE_DOCKER=0` in `.env`)*

3. **Configure API Key (`.env`)**:
   Create a `.env` file in the project root:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   API_MODEL=gemini-2.5-flash
   USE_DOCKER=1
   ```
   *(Also supports `ANTHROPIC_API_KEY` for Claude, `OPENAI_API_KEY`, or `GROQ_API_KEY`)*

---

## 🚀 Execution Pipeline

```bash
# 1. Download OpenML benchmark datasets and create train/heldout splits
python -m minimle.tasks

# 2. Collect teacher trajectories using Gemini Flash -> outputs/trajectories.jsonl
python -m minimle.collect --repeats 2 --steps 4

# 3. Evaluate zero-shot baseline (Base 0.5B model) on held-out tasks
python -m minimle.eval --label base

# 4. Supervised Fine-Tuning warm start (LoRA / QLoRA) -> outputs/sft_merged
python -m minimle.sft
python -m minimle.eval --model outputs/sft_merged --label sft

# 5. Reinforcement Learning via GRPO -> outputs/grpo_adapter
python -m minimle.grpo
python -m minimle.eval --model outputs/sft_merged --adapter outputs/grpo_adapter --label sft_rl
```

---

## 📦 Generated Artifacts & Local Verification

All phases of the pipeline have been executed and verified:

| Phase | Artifact Path | Size / Description | Training Metrics |
|---|---|---|---|
| **Data Suite** | `data/tasks/` | 15 OpenML tabular datasets | 10 training tasks, 5 held-out tasks with metadata |
| **Teacher Harvest** | `outputs/trajectories.jsonl` | 16 logged trajectory steps | Gemini 2.5 Flash solutions reaching up to **0.9999 ROC-AUC** |
| **SFT Warm Start** | `outputs/sft_merged/` | 1.97 GB safetensors + tokenizer | Loss reduced from **1.44 $\to$ 0.9237** across 2 epochs |
| **GRPO RL Policy** | `outputs/grpo_adapter/` | 35.2 MB LoRA adapter safetensors | 3-epoch closed-loop RL with Docker sandbox rewards |
| **Evaluations** | `outputs/eval_sft.json`<br>`outputs/eval_sft_rl.json` | Evaluation JSON reports | Benchmarks on 5 unseen datasets (`climate`, `ilpd`, `ozone`, `phoneme`, `wdbc`) |

---

## ⚡ Windows & CPU Engine Optimizations

The codebase includes built-in engine safeguards ensuring robust execution on Windows and CPU/GPU hardware:
- **TRL Triton LogProb Fallback**: Built-in `CPUChunkedLogProbFunction` and `SafeSFTTrainer` allow GRPO and SFT to execute without missing CUDA/Triton C-extensions.
- **Universal UTF-8 Encoding**: Explicit `utf-8` file handling prevents Windows `cp1252` encoding crashes on LLM unicode outputs.
- **Modern Tokenizer Compatibility**: Unpacks `BatchEncoding` dictionaries (`**enc`) for modern Hugging Face Transformers releases.
- **Hardware Footprint**: The student model (`Qwen2.5-Coder-0.5B`) runs in 4-bit QLoRA on a 4 GB VRAM GPU (e.g. RTX 3050) or in FP32 on standard CPUs.
