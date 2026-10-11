# ExecRL-MLE (MiniMLE-RL)

> **Execution-Grounded Reinforcement Learning for Autonomous Machine Learning Engineering**  
> *Train lightweight Code LLMs (0.5B) to autonomously Draft, Debug, and Iteratively Improve ML pipelines using real execution feedback and Group Relative Policy Optimization (GRPO).*

---

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python: 3.10+](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![Base Model](https://img.shields.io/badge/Base%20Model-Qwen2.5--Coder--0.5B--Instruct-brightgreen.svg)](https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct)
[![Docker](https://img.shields.io/badge/Docker-Sandboxed-2496ED.svg?logo=docker&logoColor=white)](#docker-sandbox-architecture)
[![RL: GRPO](https://img.shields.io/badge/RL-GRPO%20(TRL)-purple.svg)](#reinforcement-learning-grpo)

---

## 📌 Executive Summary

Modern Large Language Models (LLMs) can generate syntactically plausible machine learning code, but they typically operate in an **open loop**: without executing their code, they cannot verify syntax, handle runtime exceptions, diagnose data leakage, or validate metric gains.

**ExecRL-MLE** is a modular, execution-grounded Reinforcement Learning system inspired by recent frontiers like **Frontis-MA1** and **OpenMLE**. It bridges the gap between static code synthesis and closed-loop ML engineering by placing a compact, efficient Code LLM (**Qwen2.5-Coder-0.5B**) inside an iterative execution harness:

1. **Draft**: Synthesizes end-to-end data processing and model pipelines from scratch based on dataset metadata.
2. **Debug**: When execution fails (syntax errors, memory limits, NaN outputs, dimension mismatches), the agent receives raw runtime traces and fixes bugs autonomously.
3. **Improve**: When code runs successfully, the agent receives actual validation metric scores (ROC AUC) and iteratively tunes feature engineering, model families (LightGBM, XGBoost, Scikit-Learn), and hyperparameters.
4. **Learn via GRPO**: Policy updates are driven directly by sandbox execution signals (execution success + validation metric gains) using **Group Relative Policy Optimization (GRPO)**.

Designed to be lightweight and accessible, the entire pipeline is capable of running on a **single consumer GPU / laptop (4 GB VRAM)** with 4-bit QLoRA, or on free Google Colab / Kaggle environments.

---

## 🏗️ System Architecture & Workflow

```
                                      ┌────────────────────────────────┐
                                      │   Task Definition & Metadata   │
                                      │ (OpenML Datasets: Train/Hold)  │
                                      └──────────────┬─────────────────┘
                                                     │
                                                     ▼
                                      ┌────────────────────────────────┐
                                      │      Agent Policy (LLM)        │
                                      │   Qwen2.5-Coder-0.5B-Instruct  │
                                      └──────────────┬─────────────────┘
                                                     │
                                                     │ Generated Script (solution.py)
                                                     ▼
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       ISOLATED DOCKER SANDBOX                                          │
│                                                                                                        │
│   Host-Mount (Read-Only Features)        Sandboxed Execution               Generated Output            │
│   ├── train.csv (Features + Target)  ─►  python solution.py (≤60s)    ─►   submission.csv              │
│   └── eval_X.csv (Features Only)         [No Network, 3GB RAM, 2 CPUs]     (Predicted Probabilities)   │
└────────────────────────────────────────────────────┬───────────────────────────────────────────────────┘
                                                     │
                                                     ▼
                                      ┌────────────────────────────────┐
                                      │      Host Scoring Engine       │
                                      │  (val_y.csv / test_y.csv kept  │
                                      │   strictly secret on Host!)    │
                                      └──────────────┬─────────────────┘
                                                     │
                         ┌───────────────────────────┴───────────────────────────┐
                         ▼                                                       ▼
                 [Runtime Error]                                         [Execution Success]
               Feedback: Stderr Traces                                  Feedback: ROC AUC Score
                         │                                                       │
                         ▼                                                       ▼
                Next Op: DEBUG                                          Next Op: IMPROVE
                         │                                                       │
                         └───────────────────────────┬───────────────────────────┘
                                                     │
                                                     ▼
                                      ┌────────────────────────────────┐
                                      │    Execution-Grounded RL       │
                                      │    Group Relative Policy       │
                                      │      Optimization (GRPO)       │
                                      └────────────────────────────────┘
```

---

## ✨ Key Features

- **🛡️ Zero-Data-Leakage Sandboxing**: Ground-truth validation and test labels (`val_y.csv`, `test_y.csv`) are strictly retained on the host and never mounted into the execution container. Models cannot overfit or cheat by probing target files.
- **🔄 Closed-Loop Tri-State Agent**: State machine switches dynamically between `DRAFT` (initial program), `DEBUG` (analyzing stdout/stderr crashes), and `IMPROVE` (seeking higher ROC AUC).
- **⚡ Group Relative Policy Optimization (GRPO)**: Directly optimizes code policies against execution reward signals across batches of completions using Hugging Face `trl`. Eliminates the memory overhead of a separate critic model.
- **💻 Ultra-Low Resource Footprint**: Trains on a 0.5B model (`Qwen2.5-Coder-0.5B-Instruct`) with 4-bit NF4 Quantization + LoRA, fitting into **4 GB VRAM**.
- **📊 Real-World Benchmark Tasks**: Curates 15 binary classification datasets from OpenML with strict stratified splits into training and held-out evaluation tasks.

---

## 📂 Repository Structure

```
ExecRL-MLE/
├── README.md                           # Project root documentation
└── minimle-rl/
    ├── pyproject.toml                  # Package configuration (minimle)
    ├── requirements.txt                # Python dependencies
    ├── docker/
    │   └── Dockerfile                  # Lightweight Python 3.11 execution sandbox
    ├── data/
    │   └── tasks/                      # OpenML tabular datasets (generated)
    │       └── <task_name>/
    │           ├── train.csv           # Training data (features + target)
    │           ├── val_X.csv           # Validation features (mounted into sandbox)
    │           ├── val_y.csv           # Validation labels (host only!)
    │           ├── test_X.csv          # Held-out test features
    │           ├── test_y.csv          # Held-out test labels (host only!)
    │           └── meta.json           # Metadata (columns, n_train, metric, role)
    ├── outputs/                        # Trajectories, model checkpoints & evaluations
    │   ├── trajectories.jsonl          # Teacher-collected execution traces
    │   ├── sft_adapter/                # LoRA adapter from SFT
    │   ├── sft_merged/                 # Merged SFT base model weights
    │   ├── grpo_adapter/               # Final LoRA policy from GRPO
    │   └── eval_*.json                 # Benchmarking metrics
    └── src/
        └── minimle/
            ├── __init__.py
            ├── config.py               # Paths, model ids, timeouts, Docker configs
            ├── tasks.py                # OpenML benchmark downloader & train/heldout split
            ├── sandbox.py              # Docker container execution & host scoring
            ├── reward.py               # Execution-grounded reward shaping function
            ├── prompts.py              # System prompt, prompt builders & code parser
            ├── llm.py                  # API client for teacher model data collection
            ├── loop.py                 # Multi-step episode runner (Draft/Improve/Debug)
            ├── collect.py              # Step 1: Expert trajectory harvester (Teacher model)
            ├── sft.py                  # Step 2: QLoRA warm-start SFT training
            ├── grpo.py                 # Step 3: GRPO reinforcement learning loop
            └── eval.py                 # Step 4: Out-of-domain evaluation on held-out tasks
```

---

## 🧮 Reward Function & Optimization

The policy is trained on execution rewards derived from real environment validation:

$$\mathcal{R}(\text{Result}, \text{AUC}_{\text{best}}) = \begin{cases} -1.0 & \text{if execution fails, times out, or produces invalid output} \\ \text{clip}\left(0.2 + 5.0 \times (\text{AUC} - \text{AUC}_{\text{best}}), -0.5, 1.0\right) & \text{if execution succeeds and produces valid predictions} \end{cases}$$

- **Execution Failure Penalty ($-1.0$)**: Punishes non-zero exit codes, Python exceptions, timeouts (>60-90s), missing `submission.csv`, NaN/Inf predictions, and row count mismatches.
- **Survival Bonus ($+0.2$)**: Rewards the agent for generating syntactically and structurally sound code that conforms to the contract.
- **Metric Differential ($5.0 \times \Delta\text{AUC}$)**: Strongly incentivizes discovering architectures, features, and algorithms that outperform previous steps in the episode.

In **GRPO**, the model generates $G = 4$ candidate solutions per prompt in parallel. The advantage for candidate $i$ is normalized relative to the group:

$$\hat{A}_i = \frac{\mathcal{R}_i - \text{mean}(\{\mathcal{R}_1, \dots, \mathcal{R}_G\})}{\text{std}(\{\mathcal{R}_1, \dots, \mathcal{R}_G\}) + \epsilon}$$

This guides the model towards higher-scoring coding strategies without requiring a value network.

---

## 🚀 Getting Started

### 1. Prerequisites

- **OS**: Linux or Windows with **WSL2** (recommended for Docker sandboxing).
- **Docker**: Installed and running (`docker --version`).
- **Python**: `>= 3.10`.
- **GPU (Optional)**: NVIDIA GPU with CUDA support for SFT/GRPO training (minimum 4 GB VRAM). Training can also be offloaded to Colab or Kaggle.
- **API Key**: Anthropic API Key (if harvesting teacher trajectories via Claude).

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/GunaTeja777/ExecRL-MLE.git
cd ExecRL-MLE/minimle-rl

# Install dependencies and editable package
pip install -r requirements.txt
pip install -e .
```

### 3. Build the Docker Sandbox

Build the lightweight container containing the allowed execution environment:

```bash
docker build -t minimle-sandbox docker/
```

> **Note for Local Debugging**: If running on an environment without Docker, set `USE_DOCKER=0` in your environment to execute scripts in the host Python environment.

---

## 🔄 End-to-End Execution Pipeline

### Step 1: Benchmark Dataset Acquisition

Download 15 curated tabular datasets from OpenML, preprocess them into binary classification targets, and create stratified splits (train vs. heldout):

```bash
python -m minimle.tasks
```
*Datasets generated:* `credit-g`, `diabetes`, `spambase`, `wdbc`, `banknote-authentication`, `phoneme`, `kc1`, `madelon`, etc.

---

### Step 2: Harvest Teacher Trajectories

Use a high-capacity teacher LLM (e.g., Claude 3.5 Sonnet) to run multi-step episodes (`Draft` ➔ `Improve`/`Debug`) on training tasks. Every state transition, code sample, error, and score is logged:

```bash
export ANTHROPIC_API_KEY="your-api-key"
python -m minimle.collect --repeats 3 --steps 4
```
*Output:* `outputs/trajectories.jsonl`

---

### Step 3: Evaluate Baseline (Zero-Shot Base Model)

Benchmark the untouched base model (`Qwen/Qwen2.5-Coder-0.5B-Instruct`) on held-out tasks to establish the zero-shot baseline:

```bash
python -m minimle.eval --label base
```
*Output:* `outputs/eval_base.json`

---

### Step 4: Supervised Fine-Tuning (SFT Warm Start)

Filter expert trajectories for positive-reward transitions ($\mathcal{R} \ge 0.2$) and train the base model using 4-bit QLoRA. Merges weights into a standalone model:

```bash
python -m minimle.sft
```
*Output:* `outputs/sft_adapter`, `outputs/sft_merged`

Benchmark the SFT checkpoint:
```bash
python -m minimle.eval --model outputs/sft_merged --label sft
```
*Output:* `outputs/eval_sft.json`

---

### Step 5: Reinforcement Learning via GRPO

Train the SFT model using Group Relative Policy Optimization. Candidate programs are sampled in parallel and executed inside the Docker sandbox to compute execution rewards:

```bash
python -m minimle.grpo --model outputs/sft_merged --max_prompts 300
```
*Output:* `outputs/grpo_adapter`

---

### Step 6: Final Held-Out Evaluation

Evaluate the fully trained SFT + GRPO policy against unseen datasets:

```bash
python -m minimle.eval \
    --model outputs/sft_merged \
    --adapter outputs/grpo_adapter \
    --label sft_rl
```
*Output:* `outputs/eval_sft_rl.json`

---

## 📈 Evaluation Metrics

The evaluation framework reports three core metrics on **Held-Out Tasks**:

| Metric | Definition | Significance |
|---|---|---|
| **Draft Success Rate** | % of tasks where the first code generation (`draft`) executes without runtime errors and produces valid predictions. | Measures syntax compliance, contract obedience, and zero-shot code correctness. |
| **Any-Step Success Rate** | % of tasks where at least one valid submission was produced within the multi-step episode. | Measures self-repair and iterative debugging capabilities. |
| **Mean Hidden Test AUC** | Average ROC AUC score evaluated strictly against secret, unmounted test sets (`test_y.csv`). | Measures true out-of-domain ML modeling and generalization ability. |

---

## ⚙️ Configuration & Environment Variables

Key parameters can be configured via environment variables or in `minimle/config.py`:

| Variable | Default | Description |
|---|---|---|
| `BASE_MODEL` | `Qwen/Qwen2.5-Coder-0.5B-Instruct` | Base code language model |
| `API_MODEL` | `claude-sonnet-5-5` | Teacher LLM used for data harvesting in `collect.py` |
| `DOCKER_IMAGE` | `minimle-sandbox` | Tag of the container sandbox |
| `USE_DOCKER` | `1` | `1` for secure Docker sandbox; `0` for local subprocess execution |
| `RUN_TIMEOUT` | `90` | Maximum execution time (in seconds) per generated script |

---

## 📚 References & Acknowledgments

- **Frontis-MA1 / OpenMLE**: Inspiration for execution-grounded SFT and RL for machine learning engineers.
- **DeepSeekMath & DeepSeek-R1**: Pioneering Group Relative Policy Optimization (GRPO) for sample-efficient reasoning.
- **Qwen2.5-Coder**: High-quality small code language models by the Qwen Team.
- **TRL (Transformer Reinforcement Learning)**: Hugging Face's library providing `SFTTrainer` and `GRPOTrainer`.
- **OpenML**: Benchmark datasets for open machine learning research.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).