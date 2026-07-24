import logging
from typing import List, Dict, Optional

from config import GROQ_API_KEY, GROQ_MODEL

logger = logging.getLogger("finguard.ai.groq")

_client = None


def _get_client():
    """Lazily construct the Groq SDK client. Returns None if unavailable."""
    global _client
    if _client is not None:
        return _client
    if not GROQ_API_KEY:
        logger.warning("GROQ_API_KEY is not set; AI responses will be disabled.")
        return None
    try:
        from groq import Groq

        _client = Groq(api_key=GROQ_API_KEY)
        return _client
    except Exception as exc:  # noqa: BLE001
        logger.error("Failed to initialize Groq client: %s", exc)
        return None


async def chat_completion(
    messages: List[Dict[str, str]],
    temperature: float = 0.3,
    max_tokens: int = 1024,
    model: Optional[str] = None,
) -> str:
    """
    Send a chat completion request to Groq and return the text content.

    Raises RuntimeError if the client is unavailable so callers can handle it.
    """
    client = _get_client()
    if client is None:
        raise RuntimeError("Groq client unavailable. Check GROQ_API_KEY.")

    try:
        response = client.chat.completions.create(
            model=model or GROQ_MODEL,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content.strip()
    except Exception as exc:  # noqa: BLE001
        logger.error("Groq completion failed: %s", exc)
        raise RuntimeError("AI request failed") from exc
