import logging
import json
from typing import Dict, Any

from ai.groq_client import chat_completion

logger = logging.getLogger("finguard.ai.risk_explanation")

SYSTEM_PROMPT = (
    "You are FinGuard's Risk Explanation Agent. Given a risk score, risk level, "
    "and supporting graph data, explain in plain language why the score was assigned "
    "and what specific patterns drove it. Be concise and actionable."
)


async def run(analysis: Dict[str, Any]) -> str:
    """Explain the risk score in plain language for an investigator."""
    user_prompt = (
        "Explain the risk score and the factors behind it for this case.\n\n"
        f"{json.dumps(analysis, default=str)}"
    )
    return await chat_completion(
        [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]
    )
