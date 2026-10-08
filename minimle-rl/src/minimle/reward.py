from .sandbox import Result


def compute_reward(res: Result, best_before: float) -> float:
    """Failure: -1. Success: +0.2 bonus plus 5x AUC gain over the current best, clipped to [-0.5, 1]."""
    if not res.ok:
        return -1.0
    return float(min(1.0, max(-0.5, 0.2 + 5.0 * (res.score - best_before))))
