import logging
from typing import Dict, Any

from ai import (
    investigation_agent,
    compliance_agent,
    report_agent,
    risk_explanation_agent,
)
from ai.groq_client import chat_completion

logger = logging.getLogger("finguard.ai.router")

CHAT_SYSTEM_PROMPT = (
    "You are FinGuard's AML investigator assistant. Answer the investigator's "
    "questions about financial-crime patterns, transaction graphs, and compliance "
    "clearly and factually. If case context is provided, ground your answer in it."
)

# Map agent names to their coroutine entrypoints.
_AGENTS = {
    "investigation": investigation_agent.run,
    "compliance": compliance_agent.run,
    "report": report_agent.run,
    "risk_explanation": risk_explanation_agent.run,
}


async def route(agent: str, analysis: Dict[str, Any]) -> str:
    """Dispatch analysis data to a named agent and return its output."""
    handler = _AGENTS.get(agent)
    if handler is None:
        raise ValueError(f"Unknown agent '{agent}'. Valid: {list(_AGENTS)}")
    logger.info("Routing request to agent '%s'", agent)
    return await handler(analysis)


async def chat(question: str, context: Dict[str, Any] | None = None) -> str:
    """Free-form investigator chat, optionally grounded in case context."""
    messages = [{"role": "system", "content": CHAT_SYSTEM_PROMPT}]
    if context:
        messages.append(
            {"role": "system", "content": f"Case context: {context}"}
        )
    messages.append({"role": "user", "content": question})
    return await chat_completion(messages)
