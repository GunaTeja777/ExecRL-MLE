import anthropic
from .config import API_MODEL
from .prompts import SYSTEM

_client = None


def api_generate(prompt: str) -> str:
    global _client
    _client = _client or anthropic.Anthropic()  # needs ANTHROPIC_API_KEY
    msg = _client.messages.create(model=API_MODEL, max_tokens=2000, temperature=1.0,
                                  system=SYSTEM, messages=[{"role": "user", "content": prompt}])
    return msg.content[0].text
