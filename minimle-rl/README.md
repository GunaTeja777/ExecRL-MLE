# MiniMLE-RL

A lightweight, execution-grounded Reinforcement Learning system inspired by **Frontis-MA1** and **OpenMLE**: trains a compact Code LLM (`Qwen2.5-Coder-0.5B`) with execution-grounded SFT + GRPO to autonomously **Draft**, **Improve**, and **Debug** ML solutions.

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
   ```
   *(Also supports `ANTHROPIC_API_KEY` for Claude or `OPENAI_API_KEY` / `GROQ_API_KEY`)*

---

## 🚀 Execution Pipeline

```bash
# 1. Download OpenML benchmark datasets and create train/heldout splits
python -m minimle.tasks

# 2. Collect teacher trajectories using Gemini Flash -> outputs/trajectories.jsonl
python -m minimle.collect --repeats 2 --steps 4

# 3. Evaluate zero-shot baseline (Base 0.5B model) on held-out tasks
python -m minimle.eval --label base

# 4. Supervised Fine-Tuning warm start (4-bit QLoRA) -> outputs/sft_merged
python -m minimle.sft
python -m minimle.eval --model outputs/sft_merged --label sft

# 5. Reinforcement Learning via GRPO -> outputs/grpo_adapter
python -m minimle.grpo
python -m minimle.eval --model outputs/sft_merged --adapter outputs/grpo_adapter --label sft_rl
```

---

## 📊 Results & Hardware Notes
* Compare `outputs/eval_*.json` for **Draft Success Rate**, **Any-Step Success Rate**, and **Mean Test AUC**.
* **VRAM**: The 0.5B student model in 4-bit QLoRA comfortably fits on a **4 GB VRAM laptop GPU (e.g. RTX 3050)**. If training larger models (1.5B or 7B), run Steps 4–5 on free Google Colab / Kaggle.
