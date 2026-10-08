import os
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DATA = ROOT / "data" / "tasks"
OUT = ROOT / "outputs"
OUT.mkdir(exist_ok=True)

BASE_MODEL = "Qwen/Qwen2.5-Coder-0.5B-Instruct"
API_MODEL = os.getenv("API_MODEL", "claude-sonnet-5-5")  # teacher for data collection
DOCKER_IMAGE = "minimle-sandbox"
USE_DOCKER = os.getenv("USE_DOCKER", "1") == "1"       # set 0 for quick local debugging only
TIMEOUT = int(os.getenv("RUN_TIMEOUT", "90"))           # seconds per generated program
