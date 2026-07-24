import logging
import json
from typing import Dict, Any

from ai.groq_client import chat_completion

logger = logging.getLogger("finguard.ai.report")

SYSTEM_PROMPT = (
    "You are FinGuard's Report Agent. Produce a professional, well-structured "
    "written investigation report from the provided AML data and prior agent "
    "outputs. Use clear sections: Overview, Findings, Risk Assessment, "
    "Recommendations. Keep it formal and suitable for inclusion in a case file."
)


async def run(analysis: Dict[str, Any]) -> str:
    """Generate the narrative report body from analysis + prior agent outputs."""
    user_prompt = (
        "Write a formal investigation report from this data.\n\n"
        f"{json.dumps(analysis, default=str)}"
    )
    return await chat_completion(
        [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=2048,
    )
