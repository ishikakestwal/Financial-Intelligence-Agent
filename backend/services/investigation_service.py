import logging
from typing import Dict, Any

from ai import run_all_agents
from database.supabase import get_admin_client
from risk.risk_score import risk_level

logger = logging.getLogger("finguard.services.investigation")


async def run_investigation(payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    Orchestrate all AI agents against the supplied graph-analysis payload,
    persist the investigation, and return the full structured result.
    """
    ai_outputs = await run_all_agents(payload)

    overall_score = payload.get("risk_score", 0.0)
    level = payload.get("risk_level") or risk_level(overall_score)

    investigation_record = {
        "risk_score": overall_score,
        "summary": ai_outputs["summary"],
    }

    saved = None
    try:
        client = get_admin_client()
        result = client.table("investigations").insert(investigation_record).execute()
        saved = result.data[0] if result.data else None
    except Exception as exc:  # noqa: BLE001
        logger.error("Failed to persist investigation: %s", exc)

    return {
        "investigation": saved,
        "risk_score": overall_score,
        "risk_level": level,
        "summary": ai_outputs["summary"],
        "ai_explanation": ai_outputs["risk_explanation"],
        "recommendations": ai_outputs["compliance_notes"],
        "compliance_notes": ai_outputs["compliance_notes"],
        "report_text": ai_outputs["report_text"],
        "confidence": _confidence(overall_score),
    }


def _confidence(score: float) -> str:
    if score >= 70:
        return "HIGH"
    if score >= 40:
        return "MEDIUM"
    return "LOW"
