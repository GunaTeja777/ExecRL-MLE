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
├── frontend/                           # Interactive TypeScript / React Research Web Portal
│   ├── src/components/                 # Interactive Canvas, Simulator, & Benchmark components
│   └── package.json
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

- **OS**: Windows (with **Docker Desktop**) or Linux / WSL2.
- **Docker**: Installed and running (`docker --version`).
- **Python**: `>= 3.10`.
- **GPU (Optional)**: NVIDIA GPU with CUDA support (e.g. RTX 3050 with 4 GB VRAM fits the 0.5B student model in 4-bit QLoRA). Training can also be run on free Google Colab / Kaggle.
- **API Key**: Free Google Gemini API Key (`GEMINI_API_KEY`) from [Google AI Studio](https://aistudio.google.com/) (Anthropic, OpenAI, or Groq are also supported).

### 2. Installation & Configuration

1. Clone the repository:
   ```bash
   git clone https://github.com/GunaTeja777/ExecRL-MLE.git
   cd ExecRL-MLE/minimle-rl
   ```

2. Install dependencies and the package in editable mode:
   ```bash
   pip install -r requirements.txt
   pip install -e .
   ```

3. Create a `.env` file in the project root:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   API_MODEL=gemini-2.5-flash
   USE_DOCKER=1
   ```

### 3. Build the Docker Sandbox

Ensure Docker Desktop is running, then build the sandbox container:

```bash
docker build -t minimle-sandbox docker/
```

> **Note for Local Execution**: If you wish to run without Docker, set `USE_DOCKER=0` in `.env` to execute scripts directly in your local Python environment.

### 4. Launch the Interactive Research Web Portal

Explore the live evolutionary constellation simulation, interactive terminal simulator, and benchmark traces:

```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173/`** in your browser to view the interactive portal.

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

Use a high-capacity teacher LLM (e.g., **Gemini 2.5 Flash**) to run multi-step episodes (`Draft` ➔ `Improve`/`Debug`) on training tasks. Every state transition, code sample, error, and score is logged:

```bash
python -m minimle.collect --repeats 2 --steps 4
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

## 📊 Benchmark Results & Local Verification

The entire pipeline has been executed end-to-end and verified on real OpenML datasets:

| Benchmark Phase | Artifact Location | Size / Output | Status & Highlights |
|---|---|---|---|
| **Phase 1: Task Suite** | `data/tasks/` | 15 Tabular Datasets | 10 training tasks, 5 held-out tasks partitioned with zero label leakage |
| **Phase 2: Teacher Harvesting** | `outputs/trajectories.jsonl` | 16 Trajectory Steps | Harvested with Gemini 2.5 Flash; solutions reaching up to **0.9999 ROC-AUC** |
| **Phase 3: SFT Warm Start** | `outputs/sft_merged/` | 1.97 GB safetensors + tokenizer | Loss decreased from **1.44 $\to$ 0.9237**; weights merged into base model |
| **Phase 4: GRPO RL** | `outputs/grpo_adapter/` | 35.2 MB LoRA adapter | 3-epoch closed loop with Docker sandbox execution feedback |
| **Phase 5: Out-of-Domain Eval** | `outputs/eval_sft.json`<br>`outputs/eval_sft_rl.json` | JSON Metric Summaries | Evaluated on 5 unseen tasks (`climate`, `ilpd`, `ozone`, `phoneme`, `wdbc`) |

---

## 🛡️ Platform Compatibility & Engine Safeguards

To enable smooth execution across Windows, Linux, and CPU / consumer GPU hardware, several critical engine enhancements were built into the codebase:

1. **TRL Triton LogProb Fallback (`CPUChunkedLogProbFunction`)**:
   - In standard Hugging Face `trl` 1.15.0, `GRPOTrainer` and `SFTTrainer` call `_ChunkedLogProbFunction.apply()` with `fused_lm_head=True`.
   - On Windows and CPU environments lacking Triton kernels, this raises an `AttributeError: 'NoneType' object has no attribute 'apply'`.
   - We engineered a pure PyTorch autograd chunked log-probability and entropy fallback directly inside `grpo.py` and `SafeSFTTrainer` in `sft.py`.
2. **Universal UTF-8 Encoding**:
   - Standard Windows file I/O defaults to `cp1252`, causing `UnicodeEncodeError` when models output unicode characters (e.g., mathematical symbols, smart quotes, formatting).
   - Solution generation and container execution in `sandbox.py`, `eval.py`, `collect.py`, and `grpo.py` are strictly hardened with `encoding="utf-8", errors="replace"`.
3. **BatchEncoding Dict Unpacking**:
   - Modern `transformers` returns `BatchEncoding` dicts from `apply_chat_template()`. The evaluation harness in `eval.py` unpacks inputs as `model.generate(**enc)` with precise slice decoding.

---

## ⚙️ Configuration & Environment Variables

Key parameters can be configured via environment variables or in `minimle/config.py`:

| Variable | Default | Description |
|---|---|---|
| `BASE_MODEL` | `Qwen/Qwen2.5-Coder-0.5B-Instruct` | Base code language model (Student model) |
| `API_MODEL` | `gemini-2.5-flash` | Teacher LLM used for data harvesting in `collect.py` |
| `GEMINI_API_KEY` | *(Set in `.env`)* | Google Gemini API key for teacher data collection |
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