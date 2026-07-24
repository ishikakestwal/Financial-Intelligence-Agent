import logging
from typing import Dict, Any

from database.supabase import get_admin_client
from risk.risk_score import risk_level

logger = logging.getLogger("finguard.realtime.alerts")

HIGH_RISK_THRESHOLD = 70.0


def emit_alert(transaction: Dict[str, Any]) -> None:
    """
    Persist a high-risk alert to Supabase for frontend consumption.
    Called after risk scoring when a transaction exceeds the threshold.
    """
    score = transaction.get("risk_score", 0.0)
    if score < HIGH_RISK_THRESHOLD:
        return

    alert = {
        "investigation_id": None,
        "risk_score": score,
        "summary": (
            f"High-risk transaction detected: sender={transaction.get('sender_hash', 'unknown')}, "
            f"receiver={transaction.get('receiver_hash', 'unknown')}, "
            f"amount={transaction.get('amount', 0)}, level={risk_level(score)}"
        ),
    }

    try:
        client = get_admin_client()
        client.table("investigations").insert(alert).execute()
        logger.warning("Alert emitted for high-risk transaction (score=%.1f)", score)
    except Exception as exc:  # noqa: BLE001
        logger.error("Failed to emit alert: %s", exc)
