import logging
from typing import Dict, Any, Optional

from ai import investigation_agent, compliance_agent, report_agent, risk_explanation_agent

logger = logging.getLogger("finguard.ai")


async def run_all_agents(analysis: Dict[str, Any]) -> Dict[str, Any]:
    """Run all four agents against the analysis payload and return combined output."""
    summary = await investigation_agent.run(analysis)
    compliance = await compliance_agent.run(analysis)
    risk_explanation = await risk_explanation_agent.run(analysis)
    report_text = await report_agent.run({
        **analysis,
        "summary": summary,
        "compliance_notes": compliance,
        "risk_explanation": risk_explanation,
    })
    return {
        "summary": summary,
        "compliance_notes": compliance,
        "risk_explanation": risk_explanation,
        "report_text": report_text,
    }
