import logging
from fastapi import APIRouter, Depends, HTTPException
from database.supabase import get_admin_client
from graph.graph_builder import build_graph, graph_to_json
from graph.cycle_detector import detect_cycles
from graph.layering_detector import detect_layering
from risk.risk_score import compute_risk_scores, aggregate_risk, risk_level
from api.auth import get_current_user

logger = logging.getLogger("finguard.graph")

router = APIRouter()


def _fetch_transactions():
    """Read all stored transactions from Supabase."""
    client = get_admin_client()
    res = client.table("transactions").select("*").execute()
    return res.data or []


@router.get("/graph")
async def get_graph(user=Depends(get_current_user)):
    """Return the directed transaction graph as JSON for frontend consumption."""
    transactions = _fetch_transactions()
    if not transactions:
        return {"nodes": [], "edges": []}
    graph = build_graph(transactions)
    return graph_to_json(graph)


@router.post("/graph/analyze")
async def analyze_graph(user=Depends(get_current_user)):
    """Run cycle + layering detection, score risk, and persist an investigation."""
    transactions = _fetch_transactions()
    if not transactions:
        raise HTTPException(status_code=404, detail="No transactions found")

    graph = build_graph(transactions)
    cycles = detect_cycles(graph)
    layering = detect_layering(graph)
    risk_scores = compute_risk_scores(graph, cycles, layering)
    overall = aggregate_risk(risk_scores)

    client = get_admin_client()

    # Persist per-transaction risk based on the riskier endpoint of each edge.
    try:
        for tx in transactions:
            edge_score = max(
                risk_scores.get(tx["sender_hash"], 0.0),
                risk_scores.get(tx["receiver_hash"], 0.0),
            )
            client.table("transactions").update(
                {"risk_score": edge_score, "risk_level": risk_level(edge_score)}
            ).eq("transaction_id", tx["transaction_id"]).execute()
    except Exception as exc:  # noqa: BLE001
        logger.error("Failed to update transaction risk scores: %s", exc)

    return {
        "investigation": None,
        "overall_risk_score": overall,
        "overall_risk_level": risk_level(overall),
        "graph": graph_to_json(graph),
        "cycles": cycles,
        "layering": layering,
        "risk_scores": risk_scores,
    }
