# MiniMLE-RL
Small-scale, laptop version of the Frontis-MA1 / OpenMLE idea: train a small code LLM with execution-grounded SFT + GRPO
to Draft / Improve / Debug ML solutions. (Inspired by the paper; not a reproduction.)

## Setup (WSL2)
    pip install -r requirements.txt && pip install -e .
    docker build -t minimle-sandbox docker/
    export ANTHROPIC_API_KEY=...

## Pipeline
    python -m minimle.tasks                 # 1. download tasks, make train/heldout split
    python -m minimle.collect               # 2. teacher trajectories -> outputs/trajectories.jsonl
    python -m minimle.eval --label base     # 3a. baseline (base 0.5B)
    python -m minimle.sft                   # 4. SFT warm start -> outputs/sft_merged
    python -m minimle.eval --model outputs/sft_merged --label sft
    python -m minimle.grpo                  # 5. RL -> outputs/grpo_adapter
    python -m minimle.eval --model outputs/sft_merged --adapter outputs/grpo_adapter --label sft_rl

Compare outputs/eval_*.json. If GRPO runs out of 4 GB VRAM, run steps 4-5 on free Colab/Kaggle.
