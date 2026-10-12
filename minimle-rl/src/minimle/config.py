import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env from workspace or package directory
ROOT = Path(__file__).resolve().parents[2]
load_dotenv(ROOT / ".env")
load_dotenv(Path(__file__).resolve().parents[1] / ".env")

DATA = ROOT / "data" / "tasks"
OUT = ROOT / "outputs"
OUT.mkdir(exist_ok=True)

BASE_MODEL = os.getenv("BASE_MODEL", "Qwen/Qwen2.5-Coder-0.5B-Instruct")
API_MODEL = os.getenv("API_MODEL", "gemini-2.5-flash")  # teacher for data collection
DOCKER_IMAGE = "minimle-sandbox"
USE_DOCKER = os.getenv("USE_DOCKER", "1") == "1"       # set 0 for quick local debugging only
TIMEOUT = int(os.getenv("RUN_TIMEOUT", "90"))           # seconds per generated program

