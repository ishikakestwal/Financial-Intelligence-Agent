import logging
import json
from typing import Dict, Any

from ai.groq_client import chat_completion

logger = logging.getLogger("finguard.ai.investigation")

SYSTEM_PROMPT = (
    "You are FinGuard's AML Investigation Agent. Given graph analysis output "
    "(risk score, cycles, suspicious accounts), produce a concise, factual "
    "investigation summary suitable for a financial-crime analyst. "
    "Be objective and avoid speculation beyond the provided data."
)


async def run(analysis: Dict[str, Any]) -> str:
    """Generate a plain-language investigation summary from graph analysis JSON."""
    user_prompt = (
        "Summarize this money-laundering investigation based on the data below.\n\n"
        f"{json.dumps(analysis, default=str)}"
    )
    return await chat_completion(
        [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]
    )
