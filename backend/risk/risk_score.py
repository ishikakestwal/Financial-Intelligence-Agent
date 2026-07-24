import networkx as nx
from typing import Dict, Any, List


def risk_level(score: float) -> str:
    """Map a numeric score (0-100) to a categorical risk level."""
    if score >= 70:
        return "HIGH"
    if score >= 40:
        return "MEDIUM"
    return "LOW"


def compute_risk_scores(
    G: nx.DiGraph, cycles: List[List[str]], layering: Dict[str, Any]
) -> Dict[str, float]:
    """Assign each node a 0-100 risk score based on cycles, layering and degree."""
    scores = {}
    layering_nodes = set(layering.get("layering_nodes", []))
    cycle_nodes = {n for cycle in cycles for n in cycle}

    for node in G.nodes():
        score = 0.0
        if node in cycle_nodes:
            score += 50.0
        if node in layering_nodes:
            score += 30.0
        if G.in_degree(node) > 5 or G.out_degree(node) > 5:
            score += 20.0
        scores[node] = min(round(score, 2), 100.0)

    return scores


def aggregate_risk(scores: Dict[str, float]) -> float:
    """Overall investigation risk = highest node score (worst offender)."""
    if not scores:
        return 0.0
    return max(scores.values())
