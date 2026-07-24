import logging
import json
from typing import Dict, Any

from ai.groq_client import chat_completion

logger = logging.getLogger("finguard.ai.compliance")

SYSTEM_PROMPT = (
    "You are FinGuard's Compliance Agent. Given AML investigation data, produce "
    "compliance notes referencing relevant obligations (e.g. SAR/STR filing "
    "considerations, KYC gaps, regulatory red flags). Do not give legal advice; "
    "frame output as compliance guidance for review by a qualified officer."
)


async def run(analysis: Dict[str, Any]) -> str:
    """Generate compliance notes from the investigation data."""
    user_prompt = (
        "Provide compliance notes for the following investigation data.\n\n"
        f"{json.dumps(analysis, default=str)}"
    )
    return await chat_completion(
        [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ]
    )
