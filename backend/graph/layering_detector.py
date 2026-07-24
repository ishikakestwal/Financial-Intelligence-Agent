import networkx as nx
from typing import Dict, Any

def detect_layering(G: nx.DiGraph) -> Dict[str, Any]:
    """
    Layering: funds move through multiple hops to obscure origin.
    Detect nodes with high betweenness centrality as likely layering intermediaries.
    """
    if len(G.nodes) == 0:
        return {"layering_nodes": [], "betweenness": {}}

    betweenness = nx.betweenness_centrality(G, normalized=True)
    threshold = 0.1
    layering_nodes = [n for n, v in betweenness.items() if v >= threshold]

    return {
        "layering_nodes": layering_nodes,
        "betweenness": {k: round(v, 4) for k, v in betweenness.items()}
    }
