import os
from .config import API_MODEL
from .prompts import SYSTEM

_client = None
_provider = None


def api_generate(prompt: str) -> str:
    global _client, _provider

    gemini_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
    anthropic_key = os.getenv("ANTHROPIC_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY") or os.getenv("GROQ_API_KEY")

    if gemini_key:
        if _client is None or _provider != "gemini":
            from google import genai
            _client = genai.Client(api_key=gemini_key)
            _provider = "gemini"
        from google.genai import types
        cfg = types.GenerateContentConfig(
            system_instruction=SYSTEM,
            temperature=0.8,
            automatic_function_calling=types.AutomaticFunctionCallingConfig(disable=True)
        )
        resp = _client.models.generate_content(
            model=API_MODEL,
            contents=prompt,
            config=cfg
        )
        return resp.text


    elif anthropic_key:
        if _client is None or _provider != "anthropic":
            import anthropic
            _client = anthropic.Anthropic(api_key=anthropic_key)
            _provider = "anthropic"
        msg = _client.messages.create(
            model=API_MODEL,
            max_tokens=2000,
            temperature=1.0,
            system=SYSTEM,
            messages=[{"role": "user", "content": prompt}],
        )
        return msg.content[0].text

    elif openai_key:
        if _client is None or _provider != "openai":
            from openai import OpenAI
            base_url = os.getenv("OPENAI_BASE_URL", "https://api.groq.com/openai/v1" if "gsk_" in (openai_key or "") else None)
            _client = OpenAI(api_key=openai_key, base_url=base_url)
            _provider = "openai"
        res = _client.chat.completions.create(
            model=API_MODEL,
            messages=[
                {"role": "system", "content": SYSTEM},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8,
            max_tokens=2000
        )
        return res.choices[0].message.content

    else:
        raise ValueError("No API key found. Please set GEMINI_API_KEY (or ANTHROPIC_API_KEY / OPENAI_API_KEY) in .env.")

