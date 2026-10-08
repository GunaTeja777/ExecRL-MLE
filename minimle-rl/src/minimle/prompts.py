import re

SYSTEM = (
    "You are an expert machine learning engineer. Reply with ONE complete Python script in a ```python block and nothing else.\n"
    "Contract: read 'train.csv' (has a 'target' column, 0/1) and 'eval_X.csv' (features only) from the current directory. "
    "Write 'submission.csv' with a single column 'pred' = predicted probability of class 1 for each row of eval_X.csv, same order. "
    "Allowed libraries: pandas, numpy, scikit-learn, xgboost, lightgbm. Handle missing values and categorical columns. "
    "Keep total runtime under 60 seconds."
)

OP_TEXT = {
    "draft": "Write a new solution from scratch.",
    "improve": "The current solution works. Write an improved full solution that should score higher.",
    "debug": "The current solution failed. Fix the error and write the full corrected solution.",
}


def build_prompt(op, meta, code=None, res=None):
    parts = [
        f"Task: {meta['description']}",
        f"Metric: {meta['metric']} (higher is better). Train rows: {meta['n_train']}.",
        f"Columns: {', '.join(meta['columns'])}",
    ]
    if code is not None:
        parts.append("Current code:\n```python\n" + code[:3000] + "\n```")
        if res is not None:
            parts.append(f"Last result: AUC {res.score:.4f}" if res.ok else "Last error:\n" + res.info[-800:])
    parts.append(f"Operation: {op.upper()}. {OP_TEXT[op]}")
    return "\n".join(parts)


def to_messages(prompt):
    return [{"role": "system", "content": SYSTEM}, {"role": "user", "content": prompt}]


def extract_code(text):
    m = re.findall(r"```(?:python)?\n(.*?)```", text, flags=re.S)
    return m[-1].strip() if m else None
